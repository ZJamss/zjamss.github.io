### 安装(Linux)

#### 下载RabbitMQ

**下载地址** ：[https://www.rabbitmq.com/download.html](https://www.rabbitmq.com/download.html)

![RabbitMQ.md558.9741842](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/RabbitMQ.md558.9741842.png)

下载对应版本的rpm文件（我的服务器是centos7）

#### 下载ErLang

mq和erlang版本对照表

![RabbitMQ.md694.0847669](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/RabbitMQ.md694.0847669.png)

这里安装最新版本的RabbitMQ，对应的Erlang版本推荐23.x

**下载地址：https://packagecloud.io/rabbitmq/erlang/packages/el/7/erlang-23.2.7-2.el7.x86_64.rpm**

上传到服务器，我选择/usr/mq路径

#### 解压

##### erlang

获取root权限，cd至对应目录

`rpm -Uvh erlang-23.2.7-2.el7.x86_64.rpm` **解压**

`yum install -y erlang` **安装**

![RabbitMQ.md915.1801852](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/RabbitMQ.md915.1801852.png)

输入`erl -v`查看版本号

![RabbitMQ.md940.3586888](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/RabbitMQ.md940.3586888.png)

##### mq

安装mq需要socat插件

`yum install -y socat`

`rpm -Uvh rabbitmq-server-3.8.14-1.el7.noarch.rpm` 解压

`yum install -y rabbitmq-server` 安装

**启动rabbitmq**

`systemctl start rabbitmq-server`

**查看rabbitmq状态**

`systemctl status rabbitmq-server`

![RabbitMQ.md1064.2778449](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/RabbitMQ.md1064.2778449.png)

显示**activy**则是启动成功

> **设置rabbitmq服务开机自启动**
>
> systemctl enable rabbitmq-server
>
> **关闭rabbitmq服务**
>
> systemctl stop rabbitmq-server
>
> **重启rabbitmq服务**
>
> systemctl restart rabbitmq-server

### 管理RabbitMQ

`rabbitmq-plugins enable rabbitmq_management`安装web客户端

![RabbitMQ.md1185.7191562](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/RabbitMQ.md1185.7191562.png)

打开管理网页 `服务器公网ip:15672"` **(记得设置安全组开放端口)**

![RabbitMQ.md1250.0659798](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/RabbitMQ.md1250.0659798.png)

**这时只有一个guest+guest用户，但是仅限于localhost访问**

#### 添加远程用户

**添加用户**

`rabbitmqctl add_user 用户名 密码`

**设置用户角色,分配操作权限**

`rabbitmqctl set_user_tags 用户名 角色`

**为用户添加资源权限(授予访问虚拟机根节点的所有权限)**

`rabbitmqctl set_permissions -p / 用户名 ".*" ".*" ".*"`

**四种用户权限**

* `administrator`：可以登录控制台、查看所有信息、并对rabbitmq进行管理
* `monToring`：监控者；登录控制台，查看所有信息
* `policymaker`：策略制定者；登录控制台指定策略
* `managment`：普通管理员；登录控制

> **修改密码**
>
> **rabbitmqctl change_ password 用户名 新密码**
>
> **删除用户**
>
> **rabbitmqctl delete_user 用户名**
>
> **查看用户清单**
>
> **rabbitmqctl list_users**


### 发表订阅模式

首先创建一个交换机，选择`fanout`格式

![RabbitMQ.md7187.5261957](https://halo-blog-zjamss.oss-cn-hangzhou.aliyuncs.com/RabbitMQ.md7187.5261957.png)