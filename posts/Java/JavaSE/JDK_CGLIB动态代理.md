学习场景：类似于依赖注入，为IUserService提供不同的Bean

> 实现类必须满足里氏代换原则

## 定义需要的基础类

```Java
/**
 * <p>
 * 用户查询Mapper接口
 * </p>
 *
 * @author ZJamss
 * @version 1.0
 */
public interface IUserMapper {
    void queryIdByUsername(String username);

    void queryNameByiD(Integer id);
}
```

## JDK动态代理实现

实现JDKInvocationHandler

```Java
public class JDKInvocationHandler implements InvocationHandler {

    //需要注入的Mapper实例
    private final IUserMapper mapper;

    public JDKInvocationHandler(IUserMapper mapper) {
        this.mapper= mapper;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        //代理IUserService的方法，执行实现类Mapper中的对应方法
        return method.invoke(mapper, args);

//      return IUserService.class.getMethod(method.getName(), method.getParameterTypes())
//            .invoke(userServiceClass, args);
    }
}
```

实现工厂获取代理对象

```Java
public class JDKProxyFactory {
    public static <T> T getProxy(Class<T> mapperInterface,
                                 Class<? extends IUserMapper> mapperProxy)
        throws InstantiationException, IllegalAccessException {
        InvocationHandler invocationHandler = new JDKInvocationHandler(mapperProxy.newInstance());
        ClassLoader contextClassLoader = Thread.currentThread().getContextClassLoader();
        return (T) Proxy.newProxyInstance(contextClassLoader, new Class[] {mapperInterface},
            invocationHandler);
    }
}
```

测试

```Java
public class Main {
    public static void main(String[] args) throws InstantiationException, IllegalAccessException {
        IUserMapper redisJDKProxy =
            JDKProxyFactory.getProxy(IUserMapper.class, UserMapperByRedis.class);
        redisJDKProxy.queryIdByUsername("redis-jdk");
        IUserMapper mysqlJDKProxy =
            JDKProxyFactory.getProxy(IUserMapper.class, UserMapperByMysql.class);
        mysqlJDKProxy.queryIdByUsername("mysql-jdk");
    }
}
```

![img](JDK_CGLIB动态代理.assets/-17210459102152.assets)

## CGLIB动态代理实现

对应依赖

```XML
<dependency>
    <groupId>cglib</groupId>
    <artifactId>cglib</artifactId>
    <version>3.3.0</version>
</dependency>
```

实现代理对象

```Java
public class UserMapperProxy implements MethodInterceptor {

    // 需要注入的Mapper实例
    private final IUserMapper userMapper;
    
    public UserMapperProxy(IUserMapper userMapper) {
        this.userMapper = userMapper;
    }
    
    // 此方法可以遵循单一职责原则抽象为工厂方法
    public Object getProxy() {
        Enhancer enhancer = new Enhancer();
        // 设置代理类的父类/接口
        enhancer.setSuperclass(IUserMapper.class);
        enhancer.setCallback(this);
        return enhancer.create();
    }


    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy)
        throws Throwable {
        // 代理IUserMapper的方法，调用userMapper的对应方法
        return method.invoke(userService, objects);
    }
}
```

测试

```Java
public class Main {
    public static void main(String[] args) throws InstantiationException, IllegalAccessException {
        IUserMapper mysqlCGLIBProxy =
            (IUserMapper) new UserMapperProxy(UserMapperByRedis.class.newInstance()).getProxy();
        mysqlCGLIBProxy.queryIdByUsername("mysql-cglib");

        IUserMapper redisCGLIBProxy =
            (IUserMapper) new UserMapperProxy(UserMapperByRedis.class.newInstance()).getProxy();
        redisCGLIBProxy.queryIdByUsername("redis-cglib");

    }
}
```

![img](JDK_CGLIB动态代理.assets/-17210459102071.assets)

## JDK动态代理和CGLIB的区别

### JDK 动态代理

- 实现方式：基于接口的动态代理，要求被代理的类必须实现至少一个接口。
- 实现原理：在运行时通过反射和动态生成字节码来创建代理类，代理类实现了被代理接口中定义的方法，并在方法中调用 InvocationHandler 接口的实现类的 invoke() 方法。
- 优点：
  - JDK 自带，无需额外的依赖。
  - 纯 Java 实现，更加安全。
- 缺点：
  - 被代理类必须实现接口，因此对于没有实现接口的类无法进行代理。
  - 动态生成代理类的过程相对比较慢，性能略低。

### CGLIB 动态代理

- 实现方式：基于继承的动态代理，不要求被代理的类实现接口。
- 实现原理：通过动态生成被代理类的子类来实现代理，被代理类的方法会被子类覆盖，子类中的方法调用父类（被代理类）中的方法，并在调用前后加入相应的代理逻辑。
- 优点：
  - 可以代理没有实现接口的类。
  - 生成的代理类是被代理类的子类，因此调用被代理类的方法不需要通过反射，性能较好。
- 缺点：
  - 生成的代理类无法代理 final 类型和方法。
  - 无法代理 final 方法，因为无法覆盖 final 方法。
  - 不能代理私有方法，因为子类无法访问父类的私有方法。

## 为什么SpringBoot2默认使用CGLIB作为代理的实现方式？

- CGLIB的适用范围更广，适用于任何类型的目标类，无论是否实现了接口，而JDK动态代理只能代理实现了接口的类
- 运行速度更快，JDK动态代理通过反射生成代理对象更快，但是运行更慢，CGLIB恰恰相反，且在SpringBoot中，通常只会在容器启动时生成一次代理对象，并缓存起来；而在运行时会频繁地执行代理方法