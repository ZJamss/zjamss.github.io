# 类加载的过程

一个类从被加载到JVM再到被卸载的生命周期如下：

![img](ClassLoader详解.assets/-17210458363984.assets)

类加载过程就是将.class文件字节码加载到JVM虚拟机中的过程，流程如下：

1. 通过类的全限定名获取定义类的二进制字节流

> 可以从各种来源读取，例如zip包，网络，运行时计算生成（动态代理）...

1. 将字节流所代表的的静态存储结构转化为方法区运行时数据结构
2. 在内存中生成一个代表这个类的java.lang.Class对象，作为方法区该类的各种数据访问入口

# 类加载器ClassLoader

> 对于任意一个类，都需要由他的类加载器和这个类本身一同确立其在Java虚拟机的唯一性，每一个类加载器，都拥有一个独立的类名称空间。Class文件在对应类加载器中是唯一的，但是多个类加载器可以存在多个相同的Class文件

![img](ClassLoader详解.assets/-17210458363861.assets)

- ClassLoader

抽象类，定义了类加载最核心的操作

- SecureClassLoader

继承自ClassLoader，添加了关联类源码、关联系统policy权限等支持。

- URLClassLoader

继承自SecureClassLoader，支持从jar文件和文件夹中获取class

以上三个类的子类**ExtentionClassLoader，AppClassLoader**和底层采用C++编写并嵌入到JVM内核的**BootstrapClassLoader**承担了类加载的功能

- **Bootstrap ClassLoader**  最顶层的加载类，主要加载核心类库，%JRE_HOME%\lib下的rt.jar、resources.jar、charsets.jar和class等。另外需要注意的是可以通过启动jvm时指定`-Xbootclasspath`和路径来改变Bootstrap ClassLoader的加载目录。比如`java -Xbootclasspath/a:path`被指定的文件追加到默认的bootstrap路径中。
- **Extention ClassLoader**   扩展的类加载器，加载目录%JRE_HOME%\lib\ext目录下的jar包和class文件。还可以加载`-D java.ext.dirs`选项指定的目录。
- **Application ClassLoader**  加载当前应用的classpath的所有类。  

# 双亲委派机制

根据上一节的内容我们可以了解到，Java中支持以下4种类加载器，且相互之间存在一种层次关系

![img](ClassLoader详解.assets/-17210458363862.assets)

当一个类加载器收到了类加载的请求的时候，他不会直接去加载指定的类，**而是把这个请求委托给自己的父加载器去加载。只有父加载器无法加载这个类的时候，才会由当前这个加载器来负责类的加载。**

类加载器的加载流程如下：

1. 如果已经加载，则返回该类
2. 调用父类loadClass()
3. 尝试加载类本身。

> 这里的父子加载器并不是继承关系，而是组合(聚合?)关系
>
> ```Java
> public abstract class ClassLoader {
> 
>     private static native void registerNatives();
>     static {
>         registerNatives();
>     }
> 
>     // The parent class loader for delegation
>     // Note: VM hardcoded the offset of this field, thus all new fields
>     // must be added *after* it.
>     private final ClassLoader parent;
>     ....
> }
> ```

## 为什么需要双亲委派

- **可以避免类的重复加载** 当父加载器加载过某一个类时，子加载器就不会再重新加载这个类而是直接返回。
- **保证了安全性** 加载器的层次结构决定了每种加载器可以加载的类的类型，确保了敏感的系统类不会被用户自定义类覆盖

## 双亲委派机制如何实现的

```Java
public abstract class ClassLoader {

    ...
    protected Class<?> loadClass(String name, boolean resolve)
    throws ClassNotFoundException
{
    //同步锁
    synchronized (getClassLoadingLock(name)) {
        // 检查class是否已经被加载
        Class<?> c = findLoadedClass(name);
        if (c == null) {
            long t0 = System.nanoTime();
            try {
                // 如果父类存在
                if (parent != null) {
                    // 委派给父加载器加载
                    c = parent.loadClass(name, false);
                } else {
                    // 父加载器不存在则交给启动类加载器加载
                    // 只有扩展类加载器的父加载器为null
                    c = findBootstrapClassOrNull(name);
                }
            } catch (ClassNotFoundException e) {
                // ClassNotFoundException thrown if class not found
                // from the non-null parent class loader
            }

            if (c == null) {
                // 如果父加载器都无法加载此类，则由自身加载
                long t1 = System.nanoTime();
                c = findClass(name);

                // this is the defining class loader; record the stats
                sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                sun.misc.PerfCounter.getFindClasses().increment();
            }
        }
        if (resolve) {
            resolveClass(c);
        }
        return c;
    }
}
    ...
}
```

在初始化ClassLoader的时候，parent参数有两种赋值方法：

> ```Java
> // sun.misc.Launcher
> public Launcher() {
>     ExtClassLoader var1;
>     try {
>         // 构造ExtClassLoader，parent为null
>         var1 = Launcher.ExtClassLoader.getExtClassLoader();
>     } catch (IOException var10) {
>         throw new InternalError("Could not create extension class loader", var10);
>     }
> 
>     try {
>         // 将ExtClassLoader作为parent构造AppClassLoader
>         this.loader = Launcher.AppClassLoader.getAppClassLoader(var1);
>     } catch (IOException var9) {
>         throw new InternalError("Could not create application class loader", var9);
>     }
> 
>     // 将AppClassLoader设置为线程上下文类加载器
>     Thread.currentThread().setContextClassLoader(this.loader);
>     ...    
> }
> ```

- 外部创建时通过构造函数传入 而拓展类加载器指定的parent为null，应用类加载器指定的parent是拓展类加载器
- 无参构造函数通过getSystemClassLoader()生成 **也就是说没有指定parent的ClassLoader的默认parent就是AppClassLoader**

## 如何破坏双亲委派机制

- loadClass()

进行类加载的主要方法，双亲委派机制存在其中

- findClass()

在指定位置查找文件并加载类的字节码

- defineClass()

将字节码（字节数组）转换为Class对象

**自定义加载器，重写loadClass()方法**

重写其中逻辑，取消双亲委派机制即可

**SPI机制+线程上下文加载器**

比如JDBC服务，我们可以通过以下方式创建数据库连接

```Java
Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mysql", "root", "1234");
```

DriverManager类存在于rt.jar下，所以会被启动类加载器加载，之后会尝试加载Driver的实现类

```Java
ServiceLoader<Driver> loadedDrivers = ServiceLoader.load(Driver.class);
```

但是因为实现类是第三方厂商提供的，所以无法使用启动类加载器加载。但是可以通过线程上下文加载器加载，上文有提到，线程上下文加载器在Launch的时候,会被设置为AppClassLoader，所以load()定义如下：

```Java
public static <S> ServiceLoader<S> load(Class<S> service) {
    ClassLoader cl = Thread.currentThread().getContextClassLoader();
    return ServiceLoader.load(service, cl);
}
```

> 上文有提到，Thread有一个相关联的ClassLoader，默认是AppClassLoader。并且子线程默认使用父线程的ClassLoader除非子线程特别设置

**Tomcat等例子，自行查阅资料**

## Java9

Java9之后双亲委派机制不再是绝对，自行查阅资料

# **自定义ClassLoader**

定义一个Speaker类，编译为Speaker.class文件后放入C盘根目录(C:\)

```Java
public class Speaker {
    public void speak() {
        System.out.println("全体目光向我看齐，我宣布个事");
    }
}
```

自定义LocalClassLoader

```Java
/**
 * <p>
 * Description here.
 * </p>
 *
 * @author ZJamss
 * @version 1.0
 */
public class LocalClassLoader extends ClassLoader {

    private final String PATH;

    public LocalClassLoader(String path) {
        PATH = path;
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        String[] pkgName = name.split("\\.");

        File file = new File(PATH, pkgName[pkgName.length - 1] + ".class");
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            FileInputStream is = new FileInputStream(file);
            int _byte = 0;
            while ((_byte = is.read()) != -1) {
                bos.write(_byte);
            }
            byte[] data = bos.toByteArray();
            is.close();
            bos.close();

            return defineClass(name, data, 0, data.length);
        } catch (IOException e) {
            throw new ClassNotFoundException(name,e);
        }
    }
}
```

测试

```Java
public static void main(String[] args) throws Exception {
    LocalClassLoader classLoader = new LocalClassLoader("C:\\");
    Class<?> clazz = classLoader.loadClass("com.test.Speaker");
    Object object = clazz.newInstance();
    clazz.getMethod("speak").invoke(object);
}
```

输出

![img](ClassLoader详解.assets/-17210458363863-17210458395349.assets)