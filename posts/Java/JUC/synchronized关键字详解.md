有JavaSE基础的同学应该对`synchronized`并不陌生，只需要在一个方法上或者用它包裹住一块代码块，就能自动加锁实现**线程同步**了，如下

### **使用**

#### **应用在方法上**

```Java
static class _Test {
    public synchronized void print() {
        System.out.println(Thread.currentThread().getName() + "ing...");
    }
}

@Test
public void _synchronized() throws InterruptedException {
    _Test test = new _Test();
    Thread t1 = new Thread(test::print, "t1");
    Thread t2 = new Thread(test::print, "t2");
    Thread t3 = new Thread(test::print, "t3");
    Thread t4 = new Thread(test::print, "t4");

    t1.start();
    t2.start();
    t3.start();
    t4.start();
}
输出结果
t1ing...
t3ing...
t2ing...
t4ing...
```

若拿掉synchronized，输出结果如下

```Java
t2ing...
t1ing...
t3ing...
t4ing...
```

很显然，`synchronized`加的是一把同步锁，一次只能有一个线程获取同步资源，锁未释放时其他线程只能阻塞，当`synchronized`应用在对象方法上时，锁对象默认为`this`

#### **应用在静态方法上**

与上一例使用相同，不过此时锁对象为**类本身**，无论有多少线程访问，**锁只有一把**，不同于对象方法，有几个对象就有几把锁

#### **同步代码块**

将`print()`方法改为如下形式

```Java
public synchronized void print() {
    synchronized (this){
        System.out.println(Thread.currentThread().getName() + "ing...");
    }
}
```

这是**同步代码块**写法,不同于修饰方法，这里需要在括号内写上**锁的具体对象，且不能为null**，这里锁了`this`，所以效果与修饰对象方法相同

```Java
static class _Test {

    public void print(Object object) {

        synchronized (object) {
            if(Thread.currentThread().getName().equals("t1")){
                try {
                    sleep(1000);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
            System.out.println(Thread.currentThread().getName() + "ing...");
        }
    }
}

@Test
public void _synchronized() throws InterruptedException {
    _Test test = new _Test();
    Object o  = new Object();
    Object o2  = new Object();
    Thread t1 = new Thread(()->test.print(o), "t1");
    Thread t2 = new Thread(()->test.print(o2), "t2");

    t1.start();
    t2.start();

    sleep(3000);
}
```

这里将形参作为锁对象，传入了两个不同的对象，如果是线程1则先睡眠1s，所以输出结果如下

```Java
t2ing...
t1ing...
```

### **原理**

`synchronized`的执行流程大致如下

![img](synchronized关键字详解.assets/-17210459757353.assets)

#### **重量级锁**

在操作系统中，锁不叫锁，叫**管程(monitor)**亦或是**信号量(semaphere)**，而JDK是选择管程来实现锁机制的

`synchronized`在JDK1.6前就是默认就是重量级锁，**重量级锁也就是互斥锁**，**也就是管程（Monitor）**,也就是以上讲的概念：**一个线程获取锁后，CPU会阻塞其他线程尝试获取锁的线程**

`Monitor`上会持有一个计数器，当计数器为零时则表示锁是可以获取的，否则获取就会阻塞

在Java中，`synchronized`选择一个对象作为锁对象，会在对象头中存储一个指向`Monitor`对象的指针,当线程想获取锁时，则会寻找到对象关联的`Monitor`对象，查询其计数器是否为0，然后执行不同的操作,这也就解释了为什么`synchronized`选择的锁对象不能为空

所以执行流程可以更新为

![img](synchronized关键字详解.assets/-17210459757251.assets)

> 注意，在JVM虚拟机中一个完整的Java对象所占的内存里，不仅仅是存储了对象本身实例的信息，还存在着一个对象头用来存储其他的信息等等

#### **可重入锁**

那么现在有一个疑问，那当我执行一个同步对象方法时，里面调用了另一个同步对象方法时，会发生什么呢？

带着这个疑问我们来看看以以下代码

```Java
static class _Test {

    public synchronized void print() {
        System.out.println(Thread.currentThread().getName()+"ing...");
        print2();
    }

    public synchronized void print2() {
        System.out.println(Thread.currentThread().getName()+"ing again...");
        print3();
    }

    public synchronized void print3() {
        System.out.println(Thread.currentThread().getName()+"ing again again");
    }
}

    @Test
    public void _synchronized() throws InterruptedException {
        _Test test = new _Test();
        Thread t1 = new Thread(test::print, "t1");
        Thread t2 = new Thread(test::print, "t2");
    
        t1.start();
        t2.start();
    
        sleep(3000);
}
```

输出结果

```Java
t1ing...
t1ing again...
t1ing again again
t2ing...
t2ing again...
t2ing again again
```

为什么顺利执行完毕了呢，按照我们的理解，当t1进入`print()`的时候，自动为`test`对象加上了锁，此时`Monitor`计数器为1,执行完输出后，跳转到`print2()`的时候，由于并未释放锁,所以计数器依旧为1,所以也无法获取到`print2()`的锁，**应该造成线程的死锁自身阻塞在那**了

这就要引入可重入锁的概念，什么是**可重入锁**？

> 可重入锁，也叫做递归锁，是指在一个线程中可以多次获取同一把锁，比如：一个线程在执行一个带锁的方法，该方法中又调用了另一个需要相同锁的方法，则该线程可以直接执行调用的方法【即可重入】，而无需重新获得锁

所以当t1进入`print()`时，获取了`test对象`这把锁，所以`Monitor计数器`++,在`print()`内部调用`print2()`时，由于锁与`print()`是同一把，所以无需再次获取也无需阻塞，此时`Monitor计数器`再次++，进入`print3()`也是如此，**此时计数器为3**，然后当`print3()`执行完毕，计数器--，回到`print()`执行完毕时，**计数器刚好减为0**，所以释放了锁，CPU便唤醒了在同步队列中阻塞的`t2`线程,流程大概如下

![img](synchronized关键字详解.assets/-17210459757262.assets)

#### **公平锁和非公平锁**

再来看一段代码

```Java
static class _Test {

    public synchronized void print() {
        synchronized (this) {
            try {
                sleep(100);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            System.out.println(Thread.currentThread().getName() + "ing...");
        }
    }
}

@Test
public void _synchronized() throws InterruptedException {
    _Test test = new _Test();
    Thread t1 = new Thread(test::print, "t1");
    Thread t2 = new Thread(test::print, "t2");
    Thread t3 = new Thread(test::print, "t3");
    Thread t4 = new Thread(test::print, "t4");

    t1.start();
    t2.start();
    t3.start();
    t4.start();

    sleep(3000);
}
```

输出结果：

```Java
t1ing...
t3ing...
t4ing...
t2ing...
```

也许有同学迷惑了，为什么在线程内睡眠了100ms，执行结果就不是顺序的了呢？这就是**公平锁和非公平锁**的概念了

> 公平锁：多个线程按照执行顺序去访问锁，直接进入同步队列，等待锁释放依次出队
>
> - 优点：所有入队的线程最终都能获取到锁 缺点：CPU需要依次唤醒所有阻塞的线程，这涉及到用户态和内核态的切换
>
> 非公平锁：多个线程访问锁时，会直接尝试插队获取，而不是直接入队，若锁被占用才会入队
>
> - 优点：可以减少CPU唤醒线程的次数，减少开销 缺点：如上所示，执行顺序被打乱了，而且如果当前并发越高，则越有可能一些线程始终无法获取到锁，造成所谓的饥饿问题
>
> 冷知识：sleep()方法不会释放锁，而wait(),await()方法会

而`synchronized`就是**非公平锁**

所以如上代码，当`t1`获取到锁后，进入睡眠，并占有锁，所以`t2`直接入队了\ 而当`t3`执行时`t1`刚好睡眠完,直接再次获取锁,`t2`依旧在排队\ `t3`执行完后`t4`也来了,`t2`又被插队了，最后当`t4`也执行完毕了，才轮到可怜的`t2`

### **Synchronized的新生**

在JDK1.6之前，`synchronized`一直是重量级方法，因为它本身是**重量级锁**，线程的阻塞和唤醒都会对CPU造成不低负载，而在JDK1.6之后，对锁进行了优化，如**轻量级锁，自旋锁，适应性自旋锁**等等,所以同学们使用`synchronized`时不要有心理负担

### **参考书籍+推荐阅读**

```
《深入理解JVM虚拟机》
```