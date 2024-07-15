使用Dubbo进行RPC调用时，主要分为两种角色:服务提供方，服务消费方

新建一个工程，并创建三个模块

> 不会说明pom.xml配置细节，仅讲述大概使用

![img](Dubbo基本使用.assets/-17210461046532.assets)

- dubbo-spring-boot-demo-interface 定义服务接口
- dubbo-spring-boot-demo-provider 实现服务接口，提供服务
- dubbo-spring-boot-demo-consumer 调用服务接口，消费服务

## 定义服务接口

```Java
package org.apache.dubbo.springboot.demo;

/**
 * @author ZJamss
 * @date 2024/4/17
 */
public interface DemoService {
    String sayHello(String name);
}
```

## 配置服务提供方

```Java
package org.apache.dubbo.springboot.demo.provider;

import org.apache.dubbo.config.annotation.DubboService;
import org.apache.dubbo.springboot.demo.DemoService;

/**
 * @author ZJamss
 * @date 2024/4/17
 */
@DubboService  // 声明Dubbo服务
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        return "hello " + name;
    }
}
dubbo:
  application:
    name: dubbo-springboot-demo-provider
  protocol:
    name: dubbo
    port: 20880 # 指定dubbo协议的端口号
  registry:
    address: N/A # 不使用注册中心,设置为N/A
  # address: zookeeper://${zookeeper.address:127.0.0.1}:2181        
```

## 配置服务消费方

```Java
package org.apache.dubbo.springboot.demo.consumer;

import java.util.Date;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.springboot.demo.DemoService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * @author ZJamss
 * @date 2024/4/17
 */
@Component
// 继承CommandLineRunner，应用启动时执行run方法    
public class Task implements CommandLineRunner {
    
    // 未使用注册中心，需要指定服务url
    @DubboReference(interfaceClass = org.apache.dubbo.springboot.demo.DemoService.class,url = "127.0.0.1:20880")
    DemoService demoService;

    @Override
    public void run(String... args) throws Exception {
        String result = demoService.sayHello("world");
        System.out.println("Receive result ======> " + result);

        new Thread(()-> {
            while (true) {
                try {
                    Thread.sleep(1000);
                    System.out.println(new Date() + " Receive result ======> " + demoService.sayHello("world"));
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    Thread.currentThread().interrupt();
                }
            }
        }).start();
    }
}
```

## 运行结果

> 运行之前需要在对应的Application上加上`@EnableDubbo`注解开启Dubbo服务

先运行提供方，再运行消费方

![img](Dubbo基本使用.assets/-17210461046521.assets)