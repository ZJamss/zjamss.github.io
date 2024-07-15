## 背景

现有三个数据库，分别为`lottery`，`lottery_01`，`lottery_02`

第一个数据库用于存储一些低频基本信息，不需要分库分表

01_02两个数据库采用水平分表，将多个高频表分散在其中，如下

![img](Sharding-JDBC入门.assets/-17210461335962.assets)

## 依赖

```XML
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>sharding-jdbc-spring-boot-starter</artifactId>
    <version>4.1.1</version>
</dependency>
```

## 分库

先就`user_take_activity`表进行分库操作，目的是根据u_id选择对应的库进行存储

![img](Sharding-JDBC入门.assets/-17210461335911.assets)

> 省略基本的数据库DML操作类，Sharding-JDBC可以做到无感知

### 配置文件

```YAML
spring:
  shardingsphere:
    datasource:
      // 配置所有数据源
      names: ds0, ds1, ds2
      ds0:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/lottery?useUnicode=true
        username: root
        password: 123456
      ds1:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/lottery_01?useUnicode=true
        username: root
        password: 123456
      ds2:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/lottery_02?useUnicode=true
        username: root
        password: 123456
    sharding:
      tables:
        // 配置需要分库分表的表
        user_take_activity:
          // 配置数据节点
          actual-data-nodes: ds$->{1..2}.user_take_activity
          // 分库策略
          database-strategy:
            inline:
              // 依据字段
              sharding-column: u_id
              // 分库算法（Java表达式）
              algorithm-expression: ds$->{(7&(u_id.hashCode() ^ (u_id.hashCode()>>>16)))%2+1}
```

## 分表

TODO

### 自定义分库分表算法

TODO