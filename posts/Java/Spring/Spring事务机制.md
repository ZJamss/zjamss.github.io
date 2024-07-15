在MySQL中，事务的特性是ACID，即原子性，一致性，隔离性和持久性。可以通过调整事务的隔离级别来设置不同的场景

而在Spring中，事务选择声明式和编程式管理

## 声明式事务

通过将@Transaction注释到方法或者类上声明事务，底层通过SpringAOP实现，缺点是无法细粒度地控制事务，最小粒度是方法

`@Transactional`：在方法或类上标记该注解表示开启事务管理。可以用在类级别，表示该类所有方法都将被事务管理；也可以用在方法级别，表示单独的方法将被事务管理。通过该注解可以设置事务的传播行为、隔离级别、超时时间、只读属性等。

`@Rollback`：用于控制测试方法执行后是否回滚事务。默认为true

```Java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface Transactional {

    // 事务管理器的名称。如果未指定,将使用默认的事务管理器。
    @AliasFor("transactionManager")
    String value() default "";

    // 事务管理器的名称。与 value() 属性是别名关系。
    @AliasFor("value")
    String transactionManager() default "";

    // 事务的标签,可用于标识和跟踪事务。
    String[] label() default {};

    // 定义事务的传播行为。可选值有 REQUIRED、SUPPORTS、MANDATORY 等。
    Propagation propagation() default Propagation.REQUIRED;

    // 定义事务的隔离级别。可选值有 DEFAULT、READ_UNCOMMITTED 等。
    Isolation isolation() default Isolation.DEFAULT;

    // 定义事务超时时间,单位为秒。默认值为 -1,表示使用底层事务基础设施的默认超时设置。
    int timeout() default TransactionDefinition.TIMEOUT_DEFAULT;

    // 定义事务超时时间,以字符串形式表示。与 timeout() 属性是等价的。
    String timeoutString() default "";

    // 指定事务是否为只读事务。只读事务可以进行优化,提高性能。
    boolean readOnly() default false;

    // 指定哪些异常类型会导致事务回滚。
    Class<? extends Throwable>[] rollbackFor() default {};

    // 指定哪些异常类型名称会导致事务回滚。
    String[] rollbackForClassName() default {};

    // 指定哪些异常类型不会导致事务回滚。
    Class<? extends Throwable>[] noRollbackFor() default {};

    // 指定哪些异常类型名称不会导致事务回滚。
    String[] noRollbackForClassName() default {};

}
```

**事务传播行为：**

- PROPAGATION_REQUIRED：如果当前没有事务，就新建一个事务，如果已经存在一个事务，则加入到这个事务中。默认选择
- PROPAGATION_SUPPORTS：如果当前存在事务，就沿用当前事务，如果不存在，则继续采用无事务的方式运行内部方法。
- PROPAGATION_MANDATORY：使用当前的事务，如果当前没有事务，就抛出异常。
- PROPAGATION_REQUIRES_NEW：新建事务，如果当前存在事务，把当前事务挂起。
- PROPAGATION_NOT_SUPPORTED：以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。
- PROPAGATION_NEVER：以非事务方式执行，如果当前存在事务，则抛出异常。
- PROPAGATION_NESTED：如果当前存在事务，则在嵌套事务内执行。如果当前没有事务，则执行与 PROPAGATION_REQUIRED 类似的操作。

**事务隔离级别****：**

- READ_UNCOMMITTED：最低级别，允许读取未提交的数据。
- READ_COMMITTED：允许读取已提交的数据。

> Oracle默认事务隔离级别

- REPEATABLE_READ：对同一字段的多次读取结果是一致的。

> MySQL默认事务隔离级别

- SERIALIZABLE：最高级别，完全串行化，避免幻读

### 基本使用

```Java
@Service
public class StuService {

    @Resource
    StuMapper stuMapper;
    
    // 开启事务
    @Transactional(propagation = Propagation.REQUIRES_NEW,timeout = 450,rollbackFor = Exception.class)
    public void insertStu(Stu stu) {
        stuMapper.insertStu(stu);
        int a = 1 / 0;
    }
}
```

### 事务失效场景

AOP默认是通过CGLIB实现的，所以某些情况下事务可能不生效

- 事务方法必须是public，否则无法代理
- 事务方法不能使用final修饰
- 没有事务声明的方法调用有事务声明的方法
- 未被spring管理
- 表不支持事务
- 错误的事务传播设置
- 处理了异常没有抛出或抛出的异常不是RuntimeException或者Error的子类

## 编程式事务

### 基本使用

```Java
@Service
public class StuService {

    @Resource
    StuMapper stuMapper;

    @Resource
    TransactionTemplate transactionTemplate;

    @Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 450, rollbackFor = Exception.class)
    public void insertStu(Stu stu) {
        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                try {
                    stuMapper.insertStu(stu);
                    int a = 1 / 0;
                } catch (Exception e) {
                    // 回滚事务
                    status.setRollbackOnly();
                    e.printStackTrace();
                }
            }
        });
    }
}
```