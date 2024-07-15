## SPI介绍

SPI全称Service Provider Interfacce，是JDK内置的一种服务发现机制，主要思想是服务调用方提供服务接口，交予第三方实现，通过SPI机制可以动态地为此接口寻找对应的实现，从而实现解耦动态装配，流程如下图：

![img](Java SPI机制.assets/-17210460095002.assets)

当服务提供方实现了服务接口后，**需要在classpath的****`META-INF/services`****中创建一个以服务接口全类名命名的文件，其中的内容是接口实现类的全类名**，最后调用方可以通过`ServiceLoader`查找服务并加载

## SPI简单示例

定义标准服务接口

```Java
package com.spi;

/**
 * @author ZJamss
 * @date 2024/4/17
 */
public interface Search {
    void search(String payload);
}
```

定义实现类

```Java
package com.spi.impl;

import com.spi.Search;

/**
 * @author ZJamss
 * @date 2024/4/17
 */
public class FileSearch implements Search {

    @Override
    public void search(String payload) {
        System.out.println("File Search " + payload);
    }
}

public class DBSearch implements Search {
    @Override
    public void search(String payload) {
        System.out.println("DB Search " + payload);
    }
}
```

在`/resources/META-INF/services`中创建`com.spi.Search`文件

内容如下：

```Plain
com.spi.impl.DBSearch
com.spi.impl.FileSearch
```

测试

```Java
import com.spi.Search;
import java.util.ServiceLoader;
/**
 * @author ZJamss
 * @date 2024/4/17
 */
public class Main {
    public static void main(String[] args) {
        ServiceLoader<Search> serviceLoader = ServiceLoader.load(Search.class);
        serviceLoader.forEach(search -> {
            search.search("Test");
        });
    }
}
```

输出

![img](Java SPI机制.assets/-17210460094991.assets)

## SPI原理

```Java
public final class ServiceLoader<S>
    implements Iterable<S>
{

    // 服务发现的路径
    private static final String PREFIX = "META-INF/services/";
    
    // 通过获取线程上下文加载器来执行加载需要发现的service的实现类
    public static <S> ServiceLoader<S> load(Class<S> service) {
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        return ServiceLoader.load(service, cl);
    }
    
    public static <S> ServiceLoader<S> load(Class<S> service,
                                            ClassLoader loader)
    {
        return new ServiceLoader<>(service, loader);
    }
    
    private ServiceLoader(Class<S> svc, ClassLoader cl) {
        service = Objects.requireNonNull(svc, "Service interface cannot be null");
        // 线程上下文加载器为空则默认设置为AppClassLoader
        loader = (cl == null) ? ClassLoader.getSystemClassLoader() : cl;
        acc = (System.getSecurityManager() != null) ? AccessController.getContext() : null;
        reload();
    }
}
```

当我们执行foreach操作时，其实是通过ServerLoader的迭代器进行迭代

```Java
public Iterator<S> iterator() {
    return new Iterator<S>() {

        Iterator<Map.Entry<String,S>> knownProviders
            = providers.entrySet().iterator();

        public boolean hasNext() {
            if (knownProviders.hasNext())
                return true;
            return lookupIterator.hasNext();
        }

        public S next() {
            if (knownProviders.hasNext())
                // 在缓存中获取已经加载且实例化好的对象
                return knownProviders.next().getValue();
            return lookupIterator.next();
        }

        public void remove() {
            throw new UnsupportedOperationException();
        }

    };
}
```

那对象从哪里来？

```Java
public S next() {
    if (acc == null) {
        return nextService();
    } else {
        PrivilegedAction<S> action = new PrivilegedAction<S>() {
            public S run() { return nextService(); }
        };
        return AccessController.doPrivileged(action, acc);
    }
}

private S nextService() {
    if (!hasNextService())
        throw new NoSuchElementException();
    String cn = nextName;
    nextName = null;
    // 将要加载的class
    Class<?> c = null;
    try {
        // 通过线程上下文加载器使用全类名加载class
        c = Class.forName(cn, false, loader);
    } catch (ClassNotFoundException x) {
        fail(service,
             "Provider " + cn + " not found");
    }
    if (!service.isAssignableFrom(c)) {
        fail(service,
             "Provider " + cn  + " not a subtype");
    }
    try {
        // 实例化
        S p = service.cast(c.newInstance());
        // 放入缓存
        providers.put(cn, p);
        return p;
    } catch (Throwable x) {
        fail(service,
             "Provider " + cn + " could not be instantiated",
             x);
    }
    throw new Error();          // This cannot happen
}
```