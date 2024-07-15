> Notes for https://zhuanlan.zhihu.com/p/268068353

## 图例

![img](DDD领域驱动设计.assets/-17210463565553.assets)

![img](DDD领域驱动设计.assets/-17210463565541.assets)

## 模块职责

### 测试套件（testsuite）：

测试模块，所有单测和集成测试写在该模块。它通过直接和间接依赖，可以访问到每个模块的代码，也即所有模块对测试层都是可见的。如果项目中有类似AliGenerator的代码自动生成工具，也应该放在该模块中。

### 主程序（main）：

应用的启动入口，包含启动相关的配置。

### 接口门面层（facade）：

该模块是对外发布的API包，对外暴露的SOA/RPC接口放在这里，外部应用使用我们的服务会依赖该包。一个应用可能会按照用途不同，设计多个facade模块。

### 接口门面实现层（facade-impl）：

实现了用户界面层（facade）中的接口，主要负责向用户显示信息和解释用户指令。处理输入的解析、验证、转换，还有输出的序列化。如果应用有多个facade模块，可以使用一个facade-impl来实现，也可以是多个。

### 控制器层（controller）：

可选。如果应用直接对外提供http服务，那么http的接口入口就在该层中，例如spring-boot中的Controller都放在这一层。

控制器层虽然依赖于facade-impl层，但是只能调用facade中声明的方法，这样可以防止业务逻辑从facade-impl层泄露到controller层中。

一般说来，http服务由专门的网关应用对外提供，微服务系统中这一层不需要。

### 应用层（application）：

定义要完成的业务功能，由该层负责协调和编排领域层的原子方法。因此应用层主要负责：

- 事务控制
- 查询仓储（注意：只能查询仓储，不能写仓储，写仓储是领域层的能力）
- 领域事件（domain event）的触发和监听
- 操作日志
- 安全认证

注意一点，应用层虚线依赖仓储层和基础设施层，应用层要调用仓储查询或者使用中间件都应该使用领域层声明的接口，不能够直接使用仓储层和基础设施层的实现，例如应用层中不能直接使用Mapper，而应该使用Repository接口。虚线依赖是因为仓储层和基础设施层必须挂到主程序这个根上，整个项目模块才能被组织起来。

### 领域层（domain）：

表达业务概念、业务状态、及业务规则。一个聚合（aggregate）一个package。领域层负责以下内容：

- 实体（entity）
- 值对象（value object）
- 领域服务（domain service）
- 领域事件（domain event）
- 仓储（repository）接口定义，读写仓储
- 依赖的外部服务（anti-corruption layer）的接口定义
- 工厂（factory）

结合团队以及兄弟团队的实践，建议实体采用贫血模式，实体和领域服务共同构成领域模型。

### 仓储层（repository）：

仓储层负责数据查询及持久化，仓储层本质上也属于一种基础设施，但是仓储层作为系统中重要的一环，因此从基础设施层中独立开来。DO对象只存在于仓储层，通过内部定义的Converter转为领域对象后供上层使用。

### 基础设施层（infrastructure）：

倒置依赖领域层，负责RPC服务以及中间件服务的调用和具体实现。经典DDD分层中依赖的外部服务的防腐层（anti-corruption layer）就在这里。

### 工具层（utility）：

和业务无关的工具方法都放在这里，比如Utils类，全局通用Exception定义等。utility会被整个项目其他模块直接或间接依赖，必须保证其无业务语义。

## 编码规范

这里给出的编码规范是我基于团队实践总结出来的，不同团队可以有自己的规范，这里供参考：

### POJO规范【强制】

POJO（Plain Ordinary Java Object）简单的Java对象，区别于Spring Bean。 POJO的对象后缀做如下约定。

### DO 数据库模型

XXDO代表的是数据库模型，其中的字段就是数据库表字段的平铺格式。

### Model 领域模型

XXModel代表某个领域模型，这是我们的逻辑核心。

### DTO 外部传输对象

XXDTO 是对外的数据传输对象，一般DTO是在facade层定义的，在facade-impl层完成转换。

### Info 内部传输对象

XXInfo是在application层和domain层之间的数据传输对象，和DTO的功能类似，区别在于DTO对外，Info对内。

### VO 值对象

XXVO 代表了值对象，VO是Value Object简写，通过值对象可以接收其他系统facade传递过来的DTO。注意VO不是View Object(视图对象)，在项目中没有视图对象，因为是前后端分离，没有类似于jsp这种视图，另外DTO已经完全承载了和前端或者其他服务交互的职能，不再需要视图对象。

### Query 查询对象

XXQuery 是仓储接口接收的查询参数封装的对象，一般仓储查询包含3个及以上的参数就应该封装。 XXQuery和仓储接口都是定义在领域层，在仓储层进行实现的。

### Request 请求对象

XXRequest是facade层中定义的查询对象，一般一个facade接口包含3个或者以上的参数就应该使用Request进行封装。

### Converter 转换器

各种类型的对象涉及到大量的转换，Converter结尾的类就是转换器，XXAA2BBConverter就代表了XX这个实体的AA对象类型转成BB对象类型。转换器放在对应的分层中，例如 Model2DOConverter和DO2ModelConverter就放在仓储层，Model2DTOConverter就放在 facade-impl层中。

注意：Converter建议逐个字段手写转换，不建议使用BeanUtils.copyProperties 或者 MapStruct对象转换工具，理由是使用了这类工具后，字段发生变化没法在编译阶段感知到，容易导致生产事故，所以推荐转换就使用笨方法，逐个字段转换。

### Bean规范【强制】

应用采用了多层的结构，如果没有统一的命名规约，势必容易造成名字冲突的情况，这里对于Spring Bean做如下命名约定：

### Controller 控制器

对外提供http服务的控制器，只存在于控制器层。

### Facade 门面服务

通过门面的方式对外提供的服务接口一般直接以Facade结尾，可以细化为 XXWriteFacade: 操作服务 和 XXReadFacade: 查询服务。Facade对应的实现命名为 XXFacadeImpl。

### FacadeImpl 门面服务实现

Facade门面服务对应的实现，XXFacadeImpl位于接口门面实现层(facade-impl)。 一般会将 FacadeImpl 发布成RPC服务。

### AppService 应用层服务

应用层的服务以AppService结尾，可继续细化为 XXWriteAppService: 操作服务 和 XXReadAppService: 查询服务。

### DomainService 领域服务

领域服务均以DomainService结尾。

### Repository 仓储接口

仓储接口定义在领域层，其实现在仓储层，实现文件命名为 XXRepositoryImpl。

### RepositoryImpl 仓储接口实现

仓储接口实现在仓储层，这是倒置依赖的体现。

### Mapper 数据库查询接口

这是MyBatis的查询接口，是应用最底层的数据库操作文件，只允许在仓储层调用。每个XXMapper都会继承其基类XXBaseMapper，在基类中定义了基本的增删改查方法。

### Client 中间件服务依赖接口

通过定义Client接口来消费中间件服务，Client定义在领域层，其对应的实现为 ClientImpl。这是防腐的设计思想。

### ClientImpl 中间件服务依赖实现

这是对领域层中声明的依赖的实现，ClientImpl都是在基础设施层。

### FacadeClient 外部RPC服务依赖接口

通过定义FacadeClient接口来消费RPC服务，FacadeClient定义在领域层，其对应的实现为 FacadeClientImpl。这是防腐层的设计思想。

### FacadeClientImpl 外部RPC服务依赖实现

这是对领域层中声明的依赖的实现，FacadeClientImpl都是在基础设施层。

### Configuration 配置

XXConfiguration是应用中的配置类，各层负责自己层的配置，例如DataSourceConfiguration关于数据源的配置，放到仓储层；WebConfiguration负责http的json配置，就放到控制器层。

各种类型的对象及Bean所处位置如下图所示：

### 方法命名【建议】

- Service/Repository/Client/DAO方法命名规约
  - 获取单个对象的方法用query作前缀。
  - 获取多个对象列表的方法用list作前缀，复数结尾，如：listObjects。
  - 获取多个对象分页的方法用page作前缀，复数结尾，如：pageObjects。
  - 获取统计值的方法用count作前缀。
  - 插入的方法用insert作前缀。
  - 删除的方法用delete作前缀。
  - 修改的方法用update作前缀。

## 代码

### scm-controller

```Java
package com.smart.classroom.misc.controller.biz.subscription;


import com.smart.classroom.misc.controller.auth.Feature;
import com.smart.classroom.misc.controller.auth.FeatureType;
import com.smart.classroom.misc.controller.base.BaseController;
import com.smart.classroom.misc.controller.base.result.WebResult;
import com.smart.classroom.misc.controller.biz.subscription.response.RichSubscriptionDTO;
import com.smart.classroom.misc.facade.biz.column.ColumnReadFacade;
import com.smart.classroom.misc.facade.biz.column.response.ColumnDTO;
import com.smart.classroom.misc.facade.biz.reader.response.ReaderDTO;
import com.smart.classroom.subscription.facade.biz.order.OrderReadFacade;
import com.smart.classroom.subscription.facade.biz.order.response.OrderDTO;
import com.smart.classroom.subscription.facade.biz.subscription.SubscriptionReadFacade;
import com.smart.classroom.subscription.facade.biz.subscription.SubscriptionWriteFacade;
import com.smart.classroom.subscription.facade.biz.subscription.request.PrepareSubscribeRequest;
import com.smart.classroom.subscription.facade.biz.subscription.request.SubscriptionPageRequest;
import com.smart.classroom.subscription.facade.biz.subscription.response.PrepareSubscribeDTO;
import com.smart.classroom.subscription.facade.biz.subscription.response.SubscriptionDTO;
import com.smart.classroom.subscription.facade.common.resposne.PagerResponse;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * controller.
 *
 * @author lishuang
 * @date 2023-05-17
 */
@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController extends BaseController {

    @DubboReference
    SubscriptionReadFacade subscriptionReadFacade;

    @DubboReference
    SubscriptionWriteFacade subscriptionWriteFacade;

    @DubboReference
    ColumnReadFacade columnReadFacade;

    @DubboReference
    OrderReadFacade orderReadFacade;

    /**
     * 准备订阅
     */
    @Feature({FeatureType.READER_LOGIN})
    @RequestMapping("/prepare")
    public WebResult<?> prepare(
            @RequestParam long columnId,
            @RequestParam String payMethod
    ) {

        ReaderDTO readerDTO = this.checkLoginReader();

        PrepareSubscribeRequest request = new PrepareSubscribeRequest(
                readerDTO.getId(),
                columnId,
                payMethod
        );

        PrepareSubscribeDTO prepareSubscribeDTO = subscriptionWriteFacade.prepareSubscribe(request);

        return success(prepareSubscribeDTO);
    }


    /**
     * 订阅列表
     */
    @Feature({FeatureType.READER_LOGIN})
    @RequestMapping("/page")
    public WebResult<?> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String orderCreateTime,
            @RequestParam(required = false) String orderUpdateTime,
            @RequestParam(required = false) Long columnId,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String status
    ) {


        ReaderDTO readerDTO = findLoginReader();

        PagerResponse<SubscriptionDTO> page = subscriptionReadFacade.page(new SubscriptionPageRequest(
                pageNum,
                pageSize,
                orderCreateTime,
                orderUpdateTime,
                readerDTO.getId(),
                columnId,
                orderId,
                status
        ));

        List<RichSubscriptionDTO> list = new ArrayList<>();
        for (SubscriptionDTO subscriptionDTO : page.getData()) {

            ColumnDTO columnDTO = columnReadFacade.queryById(subscriptionDTO.getColumnId());

            OrderDTO orderDTO = orderReadFacade.queryById(subscriptionDTO.getOrderId());


            RichSubscriptionDTO richSubscriptionDTO = new RichSubscriptionDTO(
                    subscriptionDTO,
                    columnDTO,
                    readerDTO,
                    orderDTO
            );

            list.add(richSubscriptionDTO);
        }

        PagerResponse<RichSubscriptionDTO> richSubscriptionDTOPagerResponse = new PagerResponse<>(
                page.getPageNum(),
                page.getPageSize(),
                page.getTotalItems(),
                list
        );


        return success(richSubscriptionDTOPagerResponse);
    }


    /**
     * 支付成功的消息补偿。
     */
    @Feature({FeatureType.EDITOR_LOGIN})
    @RequestMapping("/compensate")
    public WebResult<?> compensate(
            @RequestParam long paymentId
    ) {

        SubscriptionDTO subscriptionDTO = subscriptionWriteFacade.compensatePaymentPaid(paymentId);
        return success(subscriptionDTO);
    }


}
```

### Scs-main

#### **Pom**

```XML
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>smart-classroom-subscription</artifactId>
        <groupId>com.smart.classroom</groupId>
        <version>1.0.0</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>scs-main</artifactId>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>

    <dependencies>

        <!-- *********************依赖应用模块 start********************* -->

        <dependency>
            <groupId>com.smart.classroom</groupId>
            <artifactId>scs-facade-impl</artifactId>
        </dependency>

        <!-- *********************依赖应用模块 end********************* -->


        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>


    </dependencies>


    <build>

        <plugins>

            <!-- Package as an executable jar -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <mainClass>com.smart.classroom.subscription.SubscriptionApplication</mainClass>
                    <!--打包成可执行文件-->
                    <executable>true</executable>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>

        </plugins>
    </build>

</project>
```

### Scs-facade

#### Pom

```Java
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>smart-classroom-subscription</artifactId>
        <groupId>com.smart.classroom</groupId>
        <version>1.0.0</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>scs-facade</artifactId>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>

    <!-- !!!!对外发布的包，不允许有任何依赖(provided类型除外)!!!! -->
    <dependencies>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <scope>provided</scope>
        </dependency>
    </dependencies>


    <build>
        <plugins>

            <!-- 编译插件 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.5.1</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>

            <!--配置该插件，打包时将自动添加源码-->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-source-plugin</artifactId>
                <version>3.0.1</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>jar-no-fork</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>


</project>
```

#### 目录

![img](DDD领域驱动设计.assets/-17210463565552.assets)