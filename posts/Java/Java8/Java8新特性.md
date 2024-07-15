### 汇总
![image-1654166876401](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/online_blog/image-1654166876401.png)

### 简介
- 速度更快
- 代码更少（Lambda)
- 强大的Stream API
- 便于并行
   并行流就是把一个内容分成多个数据块，并用不同的线程分别处理每个数据块的流。相比较串行的流，并行的流可以很大程度上提高程序的执行效率。


  Java 8中将并行进行了优化，我们可以很容易的对数据进行并行操作。Stream API 可以声明性地通过 parallel() 与 sequential() 在并行流与顺序流之间进行切换
- 最大化减少空指针异常：Optional
- Nashorn引擎：允许在JVM上运行JS应用

### Lambda表达式

Lambda 是一个匿名函数，可以把 Lambda 表达式理解为是一段可以传递的代码（将代码像数据一样进行传递）。使用它可以写出更简洁、更灵活的代码。作为一种更紧凑的代码风格，使 Java 的语言表达能力得到了提升。

#### 语法格式
`(o1, o2) -> o1-o2;`
左边：Lambda形参列表，若为空则()->{};
->: Lambda操作符，箭头操作符
右边：Lambda表达式体

- 无参无返回值
  `()->{ System.out.println("Lambda") }`
- 只有一个参数但是无返回值
  `(String str)->{ System.out.println(str) }`
- 参数类型省略，自动推导
  `(str)->{ System.out.println(str) }`
- 只有一个参数，可省略括号
  `str->{ System.out.println(str) }`
- 需要两个以上参数，多条语句有返回值
```java
	(i, j) -> {
            System.out.println(i-j);
            return i-j;
        }
```
- 只有一条语句，return和大括号可省
  `(i,j) -> retrun i-j`
  
###   函数式接口
- 若一个接口中，**只声明了一个抽象方法**，则此接口就是**函数式接口**
- 可以通过**Lambda表达式**创建该接口的实例对象

#### 自定义函数式接口
`@FunctionalInterface` 用于检查该接口是否为函数式接口
```java
@FunctionalInterface
public interface MyInterface {
    void method();
}
```
使用
```java
 ((MyInterface) () -> System.out.println("123")).method();
```

#### Java内置函数式接口
位于`java.util.function`包下
##### 主要四大接口
![image-1654479774780](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/online_blog/image-1654479774780.png)

##### 其他接口
![image-1654481564092](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/online_blog/image-1654481564092.png) 

使用
```java
@Test
    public void t2() {
        t2t("1", str -> {
            System.out.println(str + "23");
        });
    }

    public void t2t(String str, Consumer<String> consumer) {
        consumer.accept(str);
    }

    @Test
    public void t3() {
        List<String> list = new ArrayList<>();
        list.add("好的");
        list.add("好哒");
        list.add("你的");
        list.add("你哒");
        list.add("我的");
        System.out.println(t3t(list, s -> s.contains("的")));
    }

    //过滤字符串
    public List<String> t3t(List<String> list, Predicate<String> predicate) {
        List<String> filterList = new ArrayList<>();
        for(String s : list){
            if(predicate.test(s)){
                filterList.add(s);
            }
        }
        return filterList;
    }
```

### 方法引用与构造器引用
#### 方法引用
方法引用可以看做是 Lambda 表达式深层次的表达。换句话说，**方法引用就是 Lambda 表达式，也就是函数式接口的一个实例，通过方法的名字来指向一个方法**。
- 当要传递给Lambda体的操作，**已经有实现方法了**，可以使用方法引用
- 要求接口中的抽象方法的**形参列表**和**返回值类型**与方法引用的方法的形参列表和返回值类型**相同 **  （针对前两种情况）  
- 当函数式接口方法的第一个参数是需要引用方法的调用者，并且第二个参数是需要引用方法的参数(或无参数)时：ClassName::methodName （针对最后一种情况）
##### 使用格式
使用操作符“∵”将类(或对象)与方法名分隔开来
-  `对象::实例方法名`
```java
        Consumer<String> c1 = str -> System.out.println(str);

        PrintStream out = System.out; 
        Consumer<String> c2 = out::println;
        
        String str = "123";
        Supplier<Integer> s1 = () -> str.length();

        Supplier<Integer> s2 = str::length;
```
- `类::静态方法名`
```java
        Comparator<Integer> c1 = (t1, t2) -> Integer.compare(t1, t2);
        Comparator<Integer> c2 = Integer::compare;

        Function<Double, Long> f1 = d -> Math.round(d);
        Function<Double, Long> f2 = Math::round;
```
- `类::实例方法名`
```java
        Comparator<Integer> c1 = (t1, t2) -> t1.compareTo(t2);
        Comparator<Integer> c2 = Integer::compareTo;

        BiPredicate<String, String> b1 = (s1, s2) -> s1.equals(s2);
        BiPredicate<String, String> b2 = String::equals;

        Function<String, Integer> f1 = str -> str.length();
        Function<String,Integer> f2 = String::length;
```
#### 构造器和数组引用
和方法引用类似，函数式接口的抽象方法的形参列表和构造器的形参列表一致。抽象方法的返回值类型即为构造器所属的类的类型
##### 使用格式
方法引用：`类名 ::new`
数组引用：`数组类型 [] :: new`
```java
        //构造器引用
        Supplier<String> s1 = () -> new String();
        Supplier<String> s2 = String::new;  //调用空参构造函数
        Function<char[], String> f1 = str -> new String(str);
        Function<char[], String> f2 = String::new;  //调用有参构造函数

        BiFunction<byte[], Charset,String> b1 = (bytes,charset) -> new String(bytes,charset);
        BiFunction<byte[], Charset,String> b2 = String::new;

        //数组引用
        Function<Integer,String[]> f3 = length -> new String[length];
        Function<Integer,String[]> f4 = String[]::new;
```
### Stream API
Stream 是**数据渠道**，用于操作数据源（集合、数组等）所生成的元素序列。**集合讲的是数据， Stream讲的是计算**
#### 特点
- Stream 自己**不会存储元素**。
- Stream **不会改变源对象**。相反，他们会返回一个持有结果的新 Stream。
- Stream 操作是**延迟执行**的。这意味着他们会等到需要结果的时候才执行。
#### 操作流程
- **创建Stream**
  一个数据源（如:集合、数组），获取一个流
- **中间操作**
  一个中间操作链，对数据源的数据进行处理
- **终止操作**
  一旦执行终止操作，就执行中间操作链，并产生结果。之后，不会再被使用
![image-1654500500775](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/online_blog/image-1654500500775.png)
#### 使用方式
##### 创建Stream
- **创建Stram方式一：通过集合**

  `default Stream<E> stream():` 返回一个顺序流
  `default Stream<E> parallelStream()` 返回一个并行流
  ```java
        Stream<String> stream = list.stream(); //返回一个顺序流
        Stream<String> parallelStream = list.parallelStream(); //返回一个并行流
  ```
- **创建Stream方式二：通过数组**

  `static <T> Stream<T> stream(T[] array)`: 返回一个流
  重载形式，能够处理对应基本类型的数组：
  `public static IntStream stream（int[] array）`
  `public static LongStream stream（long[] array)`
  `public static DoubleStream stream（double[] array)`
  ```java
    	IntStream stream1 = Arrays.stream(arr);
  ```
- **创建Stream方式三：通过Stream的of()**

  `public static <T> Stream<T> of(T... values)` 返回一个流
  ```java
    	Stream<Integer> stream2 = Stream.of(1, 2, 3, 4, 5, 6);
  ```
- **创建Stream方式四：创建无限流**

  迭代: `public static\<T> Stream\<T> iterate(final T seed, final UnaryOperator\<T> f)`
  ```java
          遍历前10位偶数
          Stream.iterate(0,t->t+2).limit(10).forEach(System.out::println);
  ```
  生成: `public static\<T> Stream\<T> generate(Supplier\<T> s)`
  ```java
          生成10个随机数
          Stream.generate(Math::random).limit(10).forEach(System.out::println);
  ```
#####  中间操作
多个中间操作可以连接起来形成一个流水线，除非流水线上触发终止操作，否则中间操作不会执行任何的处理！而在终止操作时一次性全部处理，称为**惰性求值**。
###### 筛选与切片
![image-1654504025488](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/online_blog/image-1654504025488.png)
```java
//filter(Predicate p) 查询包含`j`的字符串
        list.stream().filter(s->s.contains("j")).forEach(System.out::println);
        System.out.println();
        
        //limit(n) 只需要前n个全速
        list.stream().limit(3).forEach(System.out::println);
        System.out.println();
        
        //skip(n) 跳过前n个元素 
        list.stream().skip(3).forEach(System.out::println);
        System.out.println();
        
        //distinct 通过hashcode()和equals()去除重复元素
        list.stream().distinct().forEach(System.out::println);
```
###### 映射
![image-1654503996829](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/online_blog/image-1654503996829.png)
```java
    public void t3() {
        //map(Function f) 转为大写字符串
        list.stream().map(s -> s.toUpperCase(Locale.ROOT)).forEach(System.out::println);

        //flatMap() 将流中的每个值都换成另一个流，然后把所有流连接成一个流。
        list.stream().flatMap(this::StringToStream).forEach(System.out::println);
    }

    public Stream<Character> StringToStream(String s) {
        List<Character> characters = new ArrayList<>();
        for (Character c : s.toCharArray()) {
            characters.add(c);
        }
        return characters.stream();
    }
```
###### 排序
![image-1654505319533](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/online_blog/image-1654505319533.png)
```java
        //sorted 自然排序(升序)
        Stream.of(1, 6, 4, 76, 8, 4, 2, 53, 8).sorted().forEach(System.out::println);
        
        //sorted(Comparator com) 定制排序(适用于没有继承Comparable的对象等等)
        Stream.of('a', 'c', 't', 'p').sorted(Character::compare).forEach(System.out::println);
```

##### 终止操作
- 终端操作会从流的流水线生成结果。其结果可以是任何不是流的值，例如：List、 Integer，甚至是 void

- 流进行了终止操作后，不能再次使用。
###### 匹配与查找
![image-1654506826277](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/online_blog/image-1654506826277.png)
![image-1654506963938](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/online_blog/image-1654506963938.png) 
```Java
        int[] arr = new int[]{5, 7, 43, 7, 213, 3523};
        //allMatch 元素是否全大于18
        boolean b = Arrays.stream(arr).allMatch(n -> n > 18);
        //anyMatch 是否有元素大于18
        boolean b2 = Arrays.stream(arr).anyMatch(n -> n > 18);
        //noneMatch 元素是否全小于18
        boolean b3 =Arrays.stream(arr).noneMatch(n -> n > 18);
        //findFirst() 返回第一个元素
        int first = Arrays.stream(arr).findFirst().getAsInt();
        //findAny() 返回任意一个元素与
        int any = Arrays.stream(arr).findAny().getAsInt();
        //count() 返回元素个数
        long count = Arrays.stream(arr).count();
        //max(Comparator com) 返回流中最大值
        int max = Arrays.stream(arr).max().getAsInt();
        //min(Comparator com) 返回流中最小值
        int min = Arrays.stream(arr).min().getAsInt();
        //reduce(T identity, BinaryOperator)——可以将流中元素反复结合起来，得到一个值。返回 T
        int sum = Arrays.stream(arr).reduce(0, Integer::sum);
        System.out.println(sum);
```
###### 规约
备注：map 和 reduce 的连接通常称为 map-reduce 模式，因 Google 用它来进行网络搜索而出名
![image-1654507653891](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/online_blog/image-1654507653891.png)
###### 收集
Collector 接口中方法的实现决定了如何对流执行收集的操作（如收集到 List、Set、Map）

![image-1654508113755](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/online_blog/image-1654508113755.png)

Collectors 实用类提供了很多静态方法，可以方便地创建常见收集器实例具体方法与实例如下表：

![image-1654508153989](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/online_blog/image-1654508153989.png)

```Java
        Stream.of(1,2,3,4,5,6).collect(Collectors.toList());
```

### Optional类
Optional提供很多方法，使我们不用进行显式的空置检测
#### 创建Optional类对象的方法：
`Optional.of(T t)` : 创建一个 Optional 实例，t 必须非空；

`Optional.empty()` : 创建一个空的 Optional 实例

`Optional.ofNullable(T t)`：t 可以为 null
#### 判断Optional容器是否包含对象
`boolean isPresent()`：判断是否包含对象

`void ifPresent(Consumer<? super T> consumer)`：如果有值，就执行 Consumer 接口的实现代码，并且该值会作为参数传给它

#### 获取 Optional 容器的对象
`T get()`：如果调用对象包含值，返回该值，否则抛异常


`T orElse(T other)`：如果有值则将其返回，否则返回指定的 other 对象


`T orElseGet(Supplier<? extends t> other)`：如果有值则将其返回，否则返回由 Supplier 接口实现提供的对象。


`T orElseThrow(Supplier<? extends X> exceptionSupplier)`：如果有值则将其返回，否则抛出由 Supplier 接口实现提供的异常

#### 使用场景
获取到一些数据对象后直接通过`orElseThrow`判空，丢出异常进行捕获进行对应操作