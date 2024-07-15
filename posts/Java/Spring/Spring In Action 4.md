## 依赖

暂时无法在飞书文档外展示此内容

## Spring Bean

### Spring中Bean的生命周期

在传统的Java应用中， bean的生命周期很简单。使用Java关键字new进行bean实例化，然后该bean就可以使用了。一旦该bean不再被使用，则由Java自动进行垃圾回收 

但SpringBean的生命周期从装载到销毁如下，若干阶段，每一步都可以进行个性化定制

![img](Spring In Action 4.assets/-17210462091971.assets)

1．Spring对bean进行实例化

2．Spring将值和bean的引用注入到bean对应的属性中

3．如果bean实现了BeanNameAware接口， Spring将bean的ID传递给setBean-Name()方法

4．如果bean实现了BeanFactoryAware接口， Spring将调用setBeanFactory()方法，将BeanFactory容器实例传入

5．如果bean实现了ApplicationContextAware接口， Spring将调用setApplicationContext()方法，将bean所在的应用上下文的引用传入进来

6．如果bean实现了BeanPostProcessor接口， Spring将调用它们的post-ProcessBeforeInitialization()方法

7．如果bean实现了InitializingBean接口， Spring将调用它们的after-PropertiesSet()方法。类似地，如果bean使用initmethod声明了初始化方法，该方法也会被调用

8．如果bean实现了BeanPostProcessor接口， Spring将调用它们的post-ProcessAfterInitialization()方法

9．此时， bean已经准备就绪，可以被应用程序使用了，它们将一直驻留在应用上下文中，直到该应用上下文被销毁

10．如果bean实现了DisposableBean接口， Spring将调用它的destroy()接口方法。同样，如果bean使用destroy-method声明了销毁方法，该方法也会被调用

### Spring装配机制

Spring具有非常大的灵活性，它提供了**三种**主要的装配机制：

- 在XML中进行显式配置。（少用）
- 在Java中进行显式配置。
- 隐式的bean发现机制和自动装配。  

#### 自动化装配

Spring容器自动发现应用上下文中所创建的Bean,且自动满足Bean之间的依赖

相关组件:

- `@Component`

应用在一个类上，该注解表明该类会作为组件类，告知Spring要为创建bean。默认beanName为类名，可以通过设置注解的`value`指定beanName

暂时无法在飞书文档外展示此内容

- `@ComponentScan`

写在任意配置类上，默认意味着扫描当前包作为基础包和其子包中所有的组件，可以通过对注解属性的设置来更改扫描位置

- 更改当前基础包

暂时无法在飞书文档外展示此内容

- 扫描多个基础包

暂时无法在飞书文档外展示此内容

- 扫描指定包中的类

暂时无法在飞书文档外展示此内容

- `@Autowired`

将容器内的bean自动装配到其他bean中

暂时无法在飞书文档外展示此内容

#### Java配置类装配

相关组件：

- `@Configuration`
- `@Bean`

可以通过设置`@Bean`的属性来设置BeanName

暂时无法在飞书文档外展示此内容

通过`@Configuration`声明一个配置类，再使用`@Bean`注册bean

**Example:**

Spring Bean可以通过构造器，set方法等自动注入

暂时无法在飞书文档外展示此内容

#### 混合配置

相关组件：

- `@Import`

通过此注解引入其他配置文件，从而达到使用其中bean的效果

暂时无法在飞书文档外展示此内容

#### 使用Profile

> 使用springboot大多都是约定了，应该不需要手动指定@profile了

通过`@Profile`注解可以在不同环境下激活不同的配置或者bean

`@Profile`可以应用在配置类或者`@Bean`声明的方法上

暂时无法在飞书文档外展示此内容

Spring在确定哪个profile处于激活状态时，需要依赖两个独立的属性： `spring.profiles.active`和`spring.profiles.default`。

如果设置了`spring.profiles.active`属性的话，那么它的值就会用来确定哪个profile是激活的。但如果没有设置`spring.profiles.active`属性的话，那Spring将会查找`spring.profiles.default`的值。如果`spring.profiles.active`和`spring.profiles.default`均没有设置的话，**那就没有激活的profile，因此只会创建那些没有定义在profile中的bean** 

有以下几种方式来激活

- 作为DispatcherServlet的初始化参数；
- 作为Web应用的上下文参数；
- 作为JNDI条目；作为环境变量；
- 作为JVM的系统属性；
- 在集成测试类上，使用@ActiveProfiles注解设置。  

> 就写example了，springboot更加方便

#### 条件化装配Bean

相关组件：

- `@Conditional`

通过在`@Bean`声明的Bean上使用该接口来判断此Bean是否需要被装配。接收一个参数，**参数为Condition接口的继承类**

- `Condition`

暂时无法在飞书文档外展示此内容

定义了一个`matches`方法，用来判断是否加载Bean。两个参数分别可以返回Bean相关的信息和定义bean的方法上的注解信息，定义如下：

暂时无法在飞书文档外展示此内容

**Examples:**

- 基本使用

暂时无法在飞书文档外展示此内容

暂时无法在飞书文档外展示此内容

- `@Profile`注解的实现

`@Profile`注解定义：

暂时无法在飞书文档外展示此内容

使用了`@Conditional`注解连接到`ProfileCondition.class`来判断此Bean是否能被加载

暂时无法在飞书文档外展示此内容

通过`AnnotatedTypeMetadata `获取bean方法上的`Profile`注解，获得里面配置的环境value，然后判断环境value是否为当前环境

#### 自动装配的歧义性

如果存在一个接口`Test`，且有很多类实现了这个接口并被命名为`XxxTest`且被声明为bean （无论是使用`@Bean`还是`@Component`）

若此时有一个注入为

暂时无法在飞书文档外展示此内容

就会造成歧义，spring不知道该使用哪个bean注入，因为他们都实现了`Test`接口

两种方法解决：

- 使用`@Primary`注解

在`@Bean`方法或者`@Component`类上添加此注解，即声明此类是首选类，面对以上歧义时优先选择

> 但不能存在多个被@Primary注解的类，多个存在等于不存在

- 使用`@Qualifier`限定符

为`@Qualifier`注解所设置的参数就是想要注入的bean的id(就是name)，作用是指定注入的Bean到底是哪个

> 在Spring容器注册Bean的时候会默认将beanName作为默认的限定符

暂时无法在飞书文档外展示此内容

`@Qualifier`除了可以在装配Bean的时候限定bean类型，**还可以在注册的时候为Bean声明限定符，**如下

暂时无法在飞书文档外展示此内容

此后就可以通过如下方式来指定注入此Bean

暂时无法在飞书文档外展示此内容

**创建自定义的限定符**

有时候限定符的内容也重复了，造成错误，我们可以通过指定多个限定符来解决

暂时无法在飞书文档外展示此内容

但是Java不允许同一个条目重复出现相同的注解，所以我们需要采用自定义限定符来解决

暂时无法在飞书文档外展示此内容

通过在定义时添加`@Qualifier`注解，它们就具有了`@Qualifier`注解的特性。**它们本身实际上就成为了限定符注解**  

如此，之前的代码就可以改为

暂时无法在飞书文档外展示此内容

#### Bean的作用域

默认情况下，Spring创建bean都是基于单例模式，意味着无论被注入到其他bean多少次，都是同一个对象，但有时候却不是理想的方案，所以其提供了四种作用域：

- 单例（Singleton）：在整个应用中，只创建bean的一个实例。
- 原型（Prototype）：每次注入或者通过Spring应用上下文获取的时候，都会创建一个新的bean实例。
- 会话（Session）：在Web应用中，为每个会话创建一个bean实例。
- 请求（Rquest）：在Web应用中，为每个请求创建一个bean实例。  

如果想要更改作用域，使用`@Scope`并结合`@Component`或`@Bean`一起使用即可

可以直接将字符串当作作用域作为参数传递给注解，也可以通过常量声明，如下:

暂时无法在飞书文档外展示此内容

- WebApplicationContext SCOPE_SESSION

会话作用域

- WebApplicationContext SCOPE_REQUEST

请求作用域

暂时无法在飞书文档外展示此内容

在此将购物车的作用域声明为会话，Spring会为每一个会话创建一个购物车，符合购物车的属性，在一个会话中就相当于单例模式。若直接设置为单例，购物车就会出现别人的商品。

还有一个`proxyMode`参数被设置为`ScopedProxyMode.INTERFACES`，意味着需要Spring代理实现这个`ShoppingCart`接口

> 通常购物车都是被组合在一些Controller或者Service中，而他们一般都是单例模式，如果直接将会话作用域的`ShoppingCard`注入进单例组件，那就会造成错误，**无法根据会话的变更而修改注入的组件。**所以需要Spring代理实现，实现一个方法与`ShoppingCart`完全相同的代理类注入进组件中，在需要使用`ShoppingCart`时，通过代理类调用真正的会话作用域的`ShoppingCart`。请求作用域同理

> 如果需要代理的不是接口而是具体类的话，使用`proxyMode=ScopedProxyMode.TARGET_CLASS`

#### SpringEL和读取配置文件

略

#### 通过应用上下文使用bean

将Bean注册到上下文中，然后从上下文获取bean

- AnnotationConfigApplicationContext：从一个或多个基于Java的配置类中加载Spring应用上下文。
- AnnotationConfigWebApplicationContext：从一个或多个基于Java的配置类中加载Spring Web应用上下文。
- ClassPathXmlApplicationContext：从类路径下的一个或多个XML配置文件中加载上下文定义，把应用上下文的定义文件作为类资源。
- FileSystemXmlapplicationcontext：从文件系统下的一个或多个XML配置文件中加载上下文定义。
- XmlWebApplicationContext：从Web应用下的一个或多个XML配置文件中加载上下文定义  

**使用AnnotationConfigApplicationContext装配bean**

创建Java配置类

暂时无法在飞书文档外展示此内容

`main.java`中使用上下文装配

暂时无法在飞书文档外展示此内容

## Spring Boot

```
@SpringBootApplication
```

暂时无法在飞书文档外展示此内容

`@SpringBootApplication`大概由

- `@SpringBootConfiguration` 声明此类是一个配置组件
- `@EnableAutoConfiguration`启动自动装配
- `@ComponentScan` 扫描当前包以及子包的组件

组成

## SpringSecurity

> outdated

### 依赖

暂时无法在飞书文档外展示此内容

只需要在项目构建中添加 security starter，就可以获得以下安全特性：

- 所有的 HTTP 请求路径都需要认证。
- 不需要特定的角色或权限。
- 只有一个用户；用户名是 *user*。

### 配置Spring Security

Spring Security 为配置用户存储提供了几个选项，包括：

- 一个内存用户存储
- 基于 JDBC 的用户存储
- 由 LDAP 支持的用户存储
- 定制用户详细信息服务

无论选择哪个用户存储，都可以通过重写 WebSecurityConfigurerAdapter 配置基类中定义的 configure() 方法来配置它。首先，你需要在 SecurityConfig 类中添加以下方法：

复制

暂时无法在飞书文档外展示此内容

## SpringBoot **Actuator**

使用 Actuator 公开的 endpoint，我们可以获取正在运行的 Spring Boot 应用程序的一些情况：

- 应用程序环境中有哪些配置属性可用？
- 应用程序中各种包的日志记录级别是什么？
- 应用程序现在消耗了多少内存？
- 给定的 HTTP endpoint 被请求了多少次？
- 应用程序及其协作的其他服务的健康状况如何？

**依赖**

暂时无法在飞书文档外展示此内容

暂时无法在飞书文档外展示此内容