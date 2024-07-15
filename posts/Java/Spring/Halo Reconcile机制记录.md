## 概述

`Reconciler`是一个调谐器，定义了调谐某个Extension的目前状态到预期状态，`Controller`是调谐的控制器，负责整个调谐的流程

## 类定义

### Reconciler

```Java
package run.halo.app.extension.controller;

import java.time.Duration;

public interface Reconciler<R> {

    Result reconcile(R request);

    Controller setupWith(ControllerBuilder builder);

    record Request(String name) {
    }

    record Result(boolean reEnqueue, Duration retryAfter) {

        public static Result doNotRetry() {
            return new Result(false, null);
        }

        public static Result requeue(Duration retryAfter) {
            return new Result(true, retryAfter);
        }
    }
}
```

调谐器拥有两个主要方法`reconcile`，`setupWith`。

内含一个数据类`Request`，意为调谐请求，name参数为对应`Extension`的name

- `reconcile`: 
  -  接收调谐请求Request,实现调谐的逻辑
- `setupWith`: 

​     构造调谐器所属的Controller并返回

### Controller

Controller是一个接口，定义了控制器的规范

```Java
public interface Controller extends Disposable {

    String getName();

    void start();

}
```

DefaultController实现了这个接口

```Java
package run.halo.app.extension.controller;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Supplier;
import java.util.stream.IntStream;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.concurrent.BasicThreadFactory;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.lang.Nullable;
import org.springframework.util.Assert;
import org.springframework.util.StopWatch;
import run.halo.app.extension.controller.RequestQueue.DelayedEntry;

@Slf4j
public class DefaultController<R> implements Controller {

    private final String name;

    private final Reconciler<R> reconciler;

    private final Supplier<Instant> nowSupplier;

    private final RequestQueue<R> queue;

    private volatile boolean disposed = false;

    private volatile boolean started = false;

    private final ExecutorService executor;

    @Nullable
    private final Synchronizer<R> synchronizer;

    private final Duration minDelay;

    private final Duration maxDelay;

    private final int workerCount;

    private final AtomicLong workerCounter;

    public DefaultController(String name,
        Reconciler<R> reconciler,
        RequestQueue<R> queue,
        Synchronizer<R> synchronizer,
        Supplier<Instant> nowSupplier,
        Duration minDelay,
        Duration maxDelay,
        ExecutorService executor, int workerCount) {
        Assert.isTrue(workerCount > 0, "Worker count must not be less than 1");
        this.name = name;
        this.reconciler = reconciler;
        this.nowSupplier = nowSupplier;
        this.queue = queue;
        this.synchronizer = synchronizer;
        this.minDelay = minDelay;
        this.maxDelay = maxDelay;
        this.executor = executor;
        this.workerCount = workerCount;
        this.workerCounter = new AtomicLong();
    }

    public DefaultController(String name,
        Reconciler<R> reconciler,
        RequestQueue<R> queue,
        Synchronizer<R> synchronizer,
        Duration minDelay,
        Duration maxDelay) {
        this(name, reconciler, queue, synchronizer, Instant::now, minDelay, maxDelay, 1);
    }

    public DefaultController(String name,
        Reconciler<R> reconciler,
        RequestQueue<R> queue,
        Synchronizer<R> synchronizer,
        Duration minDelay,
        Duration maxDelay, int workerCount) {
        this(name, reconciler, queue, synchronizer, Instant::now, minDelay, maxDelay, workerCount);
    }

    public DefaultController(String name,
        Reconciler<R> reconciler,
        RequestQueue<R> queue,
        Synchronizer<R> synchronizer,
        Supplier<Instant> nowSupplier,
        Duration minDelay,
        Duration maxDelay, int workerCount) {
        this(name, reconciler, queue, synchronizer, nowSupplier, minDelay, maxDelay,
            Executors.newFixedThreadPool(workerCount, threadFactory(name)), workerCount);
    }

    private static ThreadFactory threadFactory(String name) {
        return new BasicThreadFactory.Builder()
            .namingPattern(name + "-t-%d")
            .daemon(false)
            .uncaughtExceptionHandler((t, e) ->
                log.error("Controller " + t.getName() + " encountered an error unexpectedly", e))
            .build();
    }

    @Override
    public String getName() {
        return name;
    }

    public int getWorkerCount() {
        return workerCount;
    }

    @Override
    public void start() {
        if (isStarted() || isDisposed()) {
            log.warn("Controller {} is already started or disposed.", getName());
            return;
        }
        this.started = true;
        log.info("Starting controller {}", name);
        IntStream.range(0, getWorkerCount())
            .mapToObj(i -> new Worker())
            .forEach(executor::submit);
    }

    /**
     * Worker for controller.
     *
     * @author johnniang
     */
    class Worker implements Runnable {

        private final String name;

        Worker() {
            this.name =
                DefaultController.this.getName() + "-worker-" + workerCounter.incrementAndGet();
        }

        public String getName() {
            return name;
        }

        @Override
        public void run() {
            log.info("Controller worker {} started", this.name);
            if (synchronizer != null) {
                synchronizer.start();
            }
            while (!isDisposed() && !Thread.currentThread().isInterrupted()) {
                try {
                    var entry = queue.take();
                    Reconciler.Result result;
                    try {
                        log.debug("{} >>> Reconciling request {} at {}", this.name,
                            entry.getEntry(),
                            nowSupplier.get());
                        var watch = new StopWatch(this.name + ":reconcile: " + entry.getEntry());
                        watch.start("reconciliation");
                        result = reconciler.reconcile(entry.getEntry());
                        watch.stop();
                        log.debug("{} >>> Reconciled request: {} with result: {}, usage: {}",
                            this.name, entry.getEntry(), result, watch.getTotalTimeMillis());
                    } catch (Throwable t) {
                        result = new Reconciler.Result(true, null);
                        if (t instanceof OptimisticLockingFailureException) {
                            log.warn("Optimistic locking failure when reconciling request: {}/{}",
                                this.name, entry.getEntry());
                        } else if (t instanceof RequeueException re) {
                            result = re.getResult();
                        } else {
                            log.error("Reconciler in " + this.name
                                    + " aborted with an error, re-enqueuing...",
                                t);
                        }
                    } finally {
                        queue.done(entry.getEntry());
                    }
                    if (result == null) {
                        result = new Reconciler.Result(false, null);
                    }
                    if (!result.reEnqueue()) {
                        continue;
                    }
                    var retryAfter = result.retryAfter();
                    if (retryAfter == null) {
                        retryAfter = entry.getRetryAfter();
                        if (retryAfter == null
                            || retryAfter.isNegative()
                            || retryAfter.isZero()
                            || retryAfter.compareTo(minDelay) < 0) {
                            // set min retry after
                            retryAfter = minDelay;
                        } else {
                            try {
                                // TODO Refactor the retryAfter with ratelimiter
                                retryAfter = retryAfter.multipliedBy(2);
                            } catch (ArithmeticException e) {
                                retryAfter = maxDelay;
                            }
                        }
                        if (retryAfter.compareTo(maxDelay) > 0) {
                            retryAfter = maxDelay;
                        }
                    }
                    queue.add(
                        new DelayedEntry<>(entry.getEntry(), retryAfter, nowSupplier));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.info("Controller worker {} interrupted", name);
                }
            }
            log.info("Controller worker {} is stopped", name);
        }
    }

    @Override
    public void dispose() {
        disposed = true;
        log.info("Disposing controller {}", name);

        if (synchronizer != null) {
            synchronizer.dispose();
        }

        executor.shutdownNow();
        try {
            if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
                log.warn("Wait timeout for controller {} shutdown", name);
            } else {
                log.info("Controller {} is disposed", name);
            }
        } catch (InterruptedException e) {
            log.warn("Interrupted while waiting for controller {} shutdown", name);
        } finally {
            queue.dispose();
        }
    }

    @Override
    public boolean isDisposed() {
        return disposed;
    }

    public boolean isStarted() {
        return started;
    }
}
```

DefaultController内定义了一系列属性，其中queue,executor,synchronizer较为重要

- queue：

以延迟队列的形式，负责存储调谐请求

- Executor:

通过ExecutorService 管理Worker线程，实现并发调谐

- synchronizer：

同步器，下面讲解

其中两个主要方法分别是`start`和`dispose`,分别代表开始调谐和结束调谐

## 调谐过程

### 注册ControllerManager Bean

```Java
@Configuration(proxyBeanMethods = false)
public class ExtensionConfiguration {

    @Bean
    RouterFunction<ServerResponse> extensionsRouterFunction(ReactiveExtensionClient client,
        SchemeWatcherManager watcherManager, SchemeManager schemeManager) {
        return new ExtensionCompositeRouterFunction(client, watcherManager, schemeManager);
    }

    @Configuration(proxyBeanMethods = false)
    @ConditionalOnProperty(name = "halo.extension.controller.disabled",
        havingValue = "false",
        matchIfMissing = true)
    static class ExtensionControllerConfiguration {

        @Bean
        DefaultControllerManager controllerManager(ExtensionClient client) {
            return new DefaultControllerManager(client);
        }

    }

}
```

在配置类中注册`ControllerManager`实例，为创建`Controller`以及`Reconciler`做准备

### 获取所有Reconciler

```Java
@Slf4j
public class DefaultControllerManager
    implements ApplicationListener<ExtensionInitializedEvent>,
    ApplicationContextAware, DisposableBean, ControllerManager {

    private final ExtensionClient client;

    private ApplicationContext applicationContext;
    
    /**
     * Map with key: reconciler class name, value: controller self.
    */
    private final ConcurrentHashMap<String, Controller> controllers;

    /**
     * Map with key: reconciler class name, value: controller self.
     */
    private final ConcurrentHashMap<String, Controller> controllers;

    public DefaultControllerManager(ExtensionClient client) {
        this.client = client;
        controllers = new ConcurrentHashMap<>();
    }

    ......

    @Override
    public void onApplicationEvent(ExtensionInitializedEvent event) {
        // register reconcilers in system after scheme initialized
        applicationContext.<Reconciler<Request>>getBeanProvider(
                forClassWithGenerics(Reconciler.class, Request.class))
            .orderedStream()
            .forEach(this::start);
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
}
```

通过实现`ApplicationListener`接口，设置需要监听的事件类型为`ExtensionInitializedEvent`,当事件发布后，就会获取所有使用了`@Component`或类似声明Bean的接口的`Reconciler`实例，通过`forEach`作为参数依次传递到`DefaultControllerManager.start(Reconciler)`方法中

> package run.halo.app.infra.ExtensionResourceInitializer会随着Application启动而注册Extension Resources，然后就会发布`ExtensionInitializedEvent`事件

### 创建对应的Controller并启动

上一步将所有Reconciler传递到DefaultController.start()中，以下是具体代码

```Java
@Override
public void start(Reconciler<Request> reconciler) {
    var builder = new ControllerBuilder(reconciler, client);
    var controller = reconciler.setupWith(builder);
    controllers.put(reconciler.getClass().getName(), controller);
    controller.start();
}
```

此方法为所有的`Reconciler`通过`ControllerBuilder`(可选用)创建了对应的`Controller`并保存到的map中，之后启动对应的`Controller`

### 启动Worker开始Reconcile

上一个方法启动了`Controller.start()`,方法如下：

```Java
@Override
public void start() {
    if (isStarted() || isDisposed()) {
        log.warn("Controller {} is already started or disposed.", getName());
        return;
    }
    this.started = true;
    log.info("Starting controller {}", name);
    IntStream.range(0, getWorkerCount())
        .mapToObj(i -> new Worker())
        .forEach(executor::submit);
}
```

将`Controller`的启动标志设置为true,然后通过`ExecutorService`启动`WorkerCount`个`Worker`线程开始调和，`Worker`代码如下：

```Java
class Worker implements Runnable {

    private final String name;

    Worker() {
        this.name =
            DefaultController.this.getName() + "-worker-" + workerCounter.incrementAndGet();
    }

    public String getName() {
        return name;
    }

    @Override
    public void run() {
        log.info("Controller worker {} started", this.name);
        if (synchronizer != null) {
            synchronizer.start();
        }
        while (!isDisposed() && !Thread.currentThread().isInterrupted()) {
            try {
                var entry = queue.take();
                Reconciler.Result result;
                try {
                    log.debug("{} >>> Reconciling request {} at {}", this.name,
                        entry.getEntry(),
                        nowSupplier.get());
                    var watch = new StopWatch(this.name + ":reconcile: " + entry.getEntry());
                    watch.start("reconciliation");
                    result = reconciler.reconcile(entry.getEntry());
                    watch.stop();
                    log.debug("{} >>> Reconciled request: {} with result: {}, usage: {}",
                        this.name, entry.getEntry(), result, watch.getTotalTimeMillis());
                } catch (Throwable t) {
                    result = new Reconciler.Result(true, null);
                    if (t instanceof OptimisticLockingFailureException) {
                        log.warn("Optimistic locking failure when reconciling request: {}/{}",
                            this.name, entry.getEntry());
                    } else if (t instanceof RequeueException re) {
                        result = re.getResult();
                    } else {
                        log.error("Reconciler in " + this.name
                                + " aborted with an error, re-enqueuing...",
                            t);
                    }
                } finally {
                    queue.done(entry.getEntry());
                }
                if (result == null) {
                    result = new Reconciler.Result(false, null);
                }
                if (!result.reEnqueue()) {
                    continue;
                }
                var retryAfter = result.retryAfter();
                if (retryAfter == null) {
                    retryAfter = entry.getRetryAfter();
                    if (retryAfter == null
                        || retryAfter.isNegative()
                        || retryAfter.isZero()
                        || retryAfter.compareTo(minDelay) < 0) {
                        // set min retry after
                        retryAfter = minDelay;
                    } else {
                        try {
                            // TODO Refactor the retryAfter with ratelimiter
                            retryAfter = retryAfter.multipliedBy(2);
                        } catch (ArithmeticException e) {
                            retryAfter = maxDelay;
                        }
                    }
                    if (retryAfter.compareTo(maxDelay) > 0) {
                        retryAfter = maxDelay;
                    }
                }
                queue.add(
                    new DelayedEntry<>(entry.getEntry(), retryAfter, nowSupplier));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.info("Controller worker {} interrupted", name);
            }
        }
        log.info("Controller worker {} is stopped", name);
    }
}
```

由此可见，`worker`循环向Controller中的RequestQueue获取请求，没有则阻塞，有就执行reconcile(Request)方法，根据调和结果决定是延迟继续调和（多用于调和失败）还是结束此次调和

## Watcher监视器

Watcher是监听事件来触发reconciler的必要组件

```Java
public interface Watcher extends Disposable {

    default void onAdd(Reconciler.Request request) {
        // Do nothing here, just for sync all on start.
    }

    default void onAdd(Extension extension) {
        // Do nothing here
    }

    default void onUpdate(Extension oldExtension, Extension newExtension) {
        // Do nothing here
    }

    default void onDelete(Extension extension) {
        // Do nothing here
    }

    default void registerDisposeHook(Runnable dispose) {
    }

    class WatcherComposite implements Watcher {

        private final List<Watcher> watchers;

        private volatile boolean disposed = false;

        private Runnable disposeHook;

        public WatcherComposite() {
            watchers = new CopyOnWriteArrayList<>();
        }

        @Override
        public void onAdd(Extension extension) {
            // TODO Deep copy extension and execute onAdd asynchronously
            watchers.forEach(watcher -> watcher.onAdd(extension));
        }

        @Override
        public void onUpdate(Extension oldExtension, Extension newExtension) {
            // TODO Deep copy extension and execute onUpdate asynchronously
            watchers.forEach(watcher -> watcher.onUpdate(oldExtension, newExtension));
        }

        @Override
        public void onDelete(Extension extension) {
            // TODO Deep copy extension and execute onDelete asynchronously
            watchers.forEach(watcher -> watcher.onDelete(extension));
        }

        public void addWatcher(Watcher watcher) {
            if (!watcher.isDisposed() && !watchers.contains(watcher)) {
                watchers.add(watcher);
                watcher.registerDisposeHook(() -> removeWatcher(watcher));
            }
        }

        public void removeWatcher(Watcher watcher) {
            watchers.remove(watcher);
        }

        @Override
        public void registerDisposeHook(Runnable dispose) {
            this.disposeHook = dispose;
        }

        @Override
        public void dispose() {
            this.disposed = true;
            this.watchers.clear();
            if (this.disposeHook != null) {
                this.disposeHook.run();
            }
        }

        @Override
        public boolean isDisposed() {
            return this.disposed;
        }
    }
}
```

默认有onC/U/D三种方法，当被触发时则执行其中逻辑 。

`WatcherComposite `是存储所有Watcher的容器，被聚合在数据库操作客户端中

```Java
public class ReactiveExtensionClientImpl implements ReactiveExtensionClient {

    private final Watcher.WatcherComposite watchers = new Watcher.WatcherComposite();

}
```

当客户端执行CUD操作时，将会触发`WatcherComposite `的对应方法，以create操作为例

```Java
@Override
public <E extends Extension> Mono<E> create(E extension) {
    checkClientWritable(extension);
    return Mono.just(extension)
        .doOnNext(ext -> {
            ....
        })
        .map(converter::convertTo)
        .flatMap(extStore -> doCreate(extension, extStore.getName(), extStore.getData())
            .doOnNext(watchers::onAdd)
        )
        .retryWhen(Retry.backoff(3, Duration.ofMillis(100))
            // retry when generateName is set
            .filter(t -> t instanceof DataIntegrityViolationException
                && hasText(extension.getMetadata().getGenerateName()))
        );
}
```

在执行doCreate方法之后，将会执行`WatcherComposite `的onAdd方法，内容是遍历所注册的watcher，调用其onAdd方法，以实现监听触发的效果

```Java
package run.halo.app.extension.controller;

import run.halo.app.extension.Extension;
import run.halo.app.extension.Watcher;
import run.halo.app.extension.WatcherExtensionMatchers;
import run.halo.app.extension.controller.Reconciler.Request;

public class ExtensionWatcher implements Watcher {

    private final RequestQueue<Request> queue;

    private volatile boolean disposed = false;

    private Runnable disposeHook;

    private final WatcherExtensionMatchers matchers;

    public ExtensionWatcher(RequestQueue<Request> queue, WatcherExtensionMatchers matchers) {
        this.queue = queue;
        this.matchers = matchers;
    }

    @Override
    public void onAdd(Request request) {
        if (isDisposed()) {
            return;
        }
        queue.addImmediately(request);
    }

    @Override
    public void onAdd(Extension extension) {
        if (isDisposed() || !matchers.onAddMatcher().match(extension)) {
            return;
        }
        // TODO filter the event
        queue.addImmediately(new Request(extension.getMetadata().getName()));
    }

    @Override
    public void onUpdate(Extension oldExtension, Extension newExtension) {
        if (isDisposed() || !matchers.onUpdateMatcher().match(newExtension)) {
            return;
        }
        // TODO filter the event
        queue.addImmediately(new Request(newExtension.getMetadata().getName()));
    }

    @Override
    public void onDelete(Extension extension) {
        if (isDisposed() || !matchers.onDeleteMatcher().match(extension)) {
            return;
        }
        // TODO filter the event
        queue.addImmediately(new Request(extension.getMetadata().getName()));
    }

    @Override
    public void registerDisposeHook(Runnable dispose) {
        this.disposeHook = dispose;
    }

    @Override
    public void dispose() {
        disposed = true;
        if (this.disposeHook != null) {
            this.disposeHook.run();
        }
    }

    @Override
    public boolean isDisposed() {
        return this.disposed;
    }

}
```

RequestWatcher是负责为Controller监听操作的实现类，实现了对应的onXXX方法，由ControllerBuilder构建，为其传入了Controller的请求队列queue

其中聚合了WatcherExtensionMatchers用于判断数据库客户端执行操作的Extention是否为当前监视器所监视的Extension。

当数据库客户端执行CUD操作并执行时对应监听方法时，RequestWatcher会新增请求并放入Controller的请求队列中，待Worker线程拉取并执行reconcile

## Synchronizer同步器

同步器的作用是同步初始状态以及注册watcher

```Java
public interface Synchronizer<R> extends Disposable {

    void start();

}
package run.halo.app.extension.controller;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import run.halo.app.extension.Extension;
import run.halo.app.extension.ExtensionClient;
import run.halo.app.extension.ExtensionMatcher;
import run.halo.app.extension.GroupVersionKind;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Watcher;
import run.halo.app.extension.controller.Reconciler.Request;
import run.halo.app.extension.index.IndexedQueryEngine;

@Slf4j
public class RequestSynchronizer implements Synchronizer<Request> {

    private final ExtensionClient client;

    private final GroupVersionKind type;

    private final boolean syncAllOnStart;

    private volatile boolean disposed = false;

    private final IndexedQueryEngine indexedQueryEngine;

    private final Watcher watcher;

    private final ExtensionMatcher listMatcher;

    @Getter
    private volatile boolean started = false;

    public RequestSynchronizer(boolean syncAllOnStart,
        ExtensionClient client,
        Extension extension,
        Watcher watcher,
        ExtensionMatcher listMatcher) {
        this.syncAllOnStart = syncAllOnStart;
        this.client = client;
        this.type = extension.groupVersionKind();
        this.watcher = watcher;
        this.indexedQueryEngine = client.indexedQueryEngine();
        this.listMatcher = listMatcher;
    }

    @Override
    public void start() {
        if (isDisposed() || started) {
            return;
        }
        log.info("Starting request({}) synchronizer...", type);
        started = true;

        if (syncAllOnStart) {
            var listOptions = new ListOptions();
            if (listMatcher != null) {
                listOptions.setFieldSelector(listMatcher.getFieldSelector());
                listOptions.setLabelSelector(listMatcher.getLabelSelector());
            }
            indexedQueryEngine.retrieveAll(type, listOptions)
                .forEach(name -> watcher.onAdd(new Request(name)));
        }
        client.watch(this.watcher);
        log.info("Started request({}) synchronizer.", type);
    }

    @Override
    public void dispose() {
        disposed = true;
        watcher.dispose();
    }

    @Override
    public boolean isDisposed() {
        return this.disposed;
    }
}
```

若使用了ControllerBuilder创建Contoller，则会默认添加一个同步器。在Worker线程启动时，如果Controller拥有同步器，则会启动同步器

RequestSynchronizer的作用阅读源码可知，在启动时查询出所有的Extension信息（可选），并包装成Request触发监视器的onAdd方法，使得reconciler可以获取到启动时Extension状态。然后`client.watch(this.watcher);`将Controller所拥有的Watcher注册进查询引擎

> 当数据库操作客户端执行crud方法时，会触发所有watchers的onXXX方法，通过extensionMatcher来判断当前crud的type是否为对应watcher所监听的type,是就触发其onXXX事件