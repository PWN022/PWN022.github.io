---
title: JavaEE应用&SpringBoot栈&Actuator&Swagger&HeapDump&提取自动化
published: 2026-03-17 21:00:00
description: Spring Boot Actuator 与 Swagger 的配置、使用及安全风险，重点演示了 heapdump 敏感信息提取与接口自动化测试方法。
tags: [Web开发,JavaEE]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-JavaEE-常见依赖-Actuator&Swagger
2. 安全开发-JavaEE-安全问题-配置安全&接口测试

# 开发框架-SpringBoot

参考：https://springdoc.cn/spring-boot/ 

# SpringBoot-监控依赖-Actuator

SpringBoot Actuator模块提供了生产级别的功能，比如健康检查，审计，指标收集，HTTP跟踪等，帮助我们监控和管理Spring Boot应用。

| 请求方法 | 端点                        | 描述                                                         |
| :------- | :-------------------------- | :----------------------------------------------------------- |
| GET      | /actuator                   | 查看有哪些 Actuator 端点是开放的。                           |
| GET      | /actuator/auditevent        | auditevents 端点提供有关应用程序审计事件的信息。             |
| GET      | /actuator/beans             | beans 端点提供有关应用程序 bean 的信息。                     |
| GET      | /actuator/conditions        | conditions 端点提供有关配置和自动配置类条件评估的信息。      |
| GET      | /actuator/configprops       | configprops 端点提供有关应用程序 @ConfigurationPropertiesbean 的信息。 |
| GET      | **/actuator/env** (*)       | 查看全部环境属性，可以看到 SpringBoot 载入哪些 properties，以及 properties 的值（会自动用 * 替换 key、password、secret 等关键字的 properties 的值）。 |
| GET      | /actuator/flyway            | flyway 端点提供有关 Flyway 执行的数据库迁移的信息。          |
| GET      | /actuator/health            | 端点提供有关应用程序运行状况的 health 详细信息。             |
| GET      | **/actuator/heapdump** (*)  | heapdump 端点提供来自应用程序 JVM 的堆转储。（通过分析查看/env 端点被*号替换到数据的具体值。） |
| GET      | **/actuator/httptrace** (*) | httptrace 端点提供有关 HTTP 请求-响应交换的信息。（包括用户 HTTP 请求的 Cookie 数据，会造成 Cookie 泄露等）。 |
| GET      | **/actuator/info** (*)      | info 端点提供有关应用程序的一般信息。                        |
| GET      | /actuator/integrationgraph  | integrationgraph 端点公开了一个包含所有 Spring Integration 组件的图。 |
| GET      | /actuator/liquibase         | liquibase 端点提供有关 Liquibase 应用的数据库更改集的信息。  |
| GET      | /actuator/logfile           | logfile 端点提供对应用程序日志文件内容的访问。               |
| GET      | /actuator/loggers           | loggers 端点提供对应用程序记录器及其级别配置的访问。         |
| GET      | **/actuator/mappings** (*)  | mappings 端点提供有关应用程序请求映射的信息。                |
| GET      | /actuator/metrics           | metrics 端点提供对应用程序指标的访问。                       |
| GET      | /actuator/prometheus        | 端点以 prometheusPrometheus 服务器抓取所需的格式提供 Spring Boot 应用程序的指标。 |
| GET      | /actuator/quartz            | quartz 端点提供有关 Quartz 调度程序管理的作业和触发器的信息。 |
| GET      | /actuator/scheduledtasks    | scheduledtasks 端点提供有关应用程序计划任务的信息。          |
| GET      | /actuator/sessions          | sessions 端点提供有关由 Spring Session 管理的应用程序 HTTP 会话的信息。 |
| GET      | /actuator/startup           | startup 端点提供有关应用程序启动顺序的信息。                 |
| POST     | /actuator/shutdown          | shutdown 端点用于关闭应用程序。                              |

## 开发使用

### 引入依赖

```xml
<dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 配置监控暴露

基于application.properties

```properties
// 默认情况下
management.endpoints.jmx.exposure.include=*
management.endpoints.web.exposure.include=*
```

系统（这里为本机）上的环境变量：

![image-20260317164532952](C:\Users\C311S\AppData\Roaming\Typora\typora-user-images\image-20260317164532952.png)

修改为：

```properties
management.endpoints.jmx.exposure.include=health
management.endpoints.web.exposure.include=health
```

一些关键的消失了

![image-20260317164756048](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317164756048.png)

基于application.yml

```yml
management:
  endpoints:
    jmx:
      exposure:
        include: "*"
    web:
      exposure:
        include: "*"
```

 修改为：

```yml
management:
  endpoints:
    jmx:
      exposure:
        include: health
    web:
      exposure:
        include: health
```

#### 安全配置

对以上端点信息的显示单独修改

application.properties

```properties
management.endpoint.env.enabled=false
management.endpoint.heapdump.enabled=false
```

application.yml

```yml
management:
    endpoint:
        heapdump:
            enabled: false #启用接口关闭
    env:
        enabled: false #启用接口关闭
```

#### 图像化Server&Client端界面

Server：引入Server依赖-开启（@EnableAdminServer）

```java
package com.example.actuatorserver;

import de.codecentric.boot.admin.server.config.EnableAdminServer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// 开启
@EnableAdminServer
@SpringBootApplication
public class ActuatorServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ActuatorServerApplication.class, args);
    }

}
```

另外需要在properties或者yml中设置端口号为8088

Client：引入Client依赖-配置（连接目标，显示配置等）

```properties
# 应用服务 WEB 访问端口
server.port=8080

Spring.boot.admin.client.url = http://localhost:8088

management.endpoints.web.exposure.include=*
management.endpoints.jmx.exposure.include=*
management.endpoint.health.show-details=always
```

![image-20260317170719753](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317170719753.png)

### 安全问题

#### heapdump泄漏

需要添加依赖项：Spring Web、Spring Boot Actuator、Mybatis Framework、JDBC API、Mysql Driver

application.properties中

```properties
# Actuator Web 访问端口
management.server.port=8081
management.endpoints.jmx.exposure.include=*
management.endpoints.web.exposure.include=*
management.endpoint.health.show-details=always
#下面这些内容是为了让MyBatis映射
#指定Mybatis的Mapper文件
mybatis.mapper-locations=classpath:mappers/*xml
#指定Mybatis的实体目录
mybatis.type-aliases-package=com.example.headdump.mybatis.entity
# 应用服务 WEB 访问端口
server.port=8080

# 演示部分
spring.datasource.url=jdbc://localhost:3306?javademo?characterEncoding=utf8&useSSL=false
spring.datasource.name=javademo
spring.datasource.username=root
spring.datasource.password=111111
spring.datasource.driver-class-name=com.mysql.jdbc.Driver

spring.data.mongodb.username=admin
spring.data.mongodb.password=000000
```

url

```
http://localhost:8081/actuator/
```

发现存在heapdump，进行下载

```
http://localhost:8081/actuator/heapdump
```

jvisualvm分析器（自带）

##### 自动化提取

JDumpSpider提取器：https://github.com/whwlsfb/JDumpSpider

```
java -jar JDumpSpider-1.1-SNAPSHOT-full.jar 文件名
```

![image-20260317172557726](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317172557726.png)

##### 半手工提取

半手工-heapdump_tool提取器：https://github.com/wyzxxz/heapdump_tool

贴个文档，防止消失

```
usage:> java -jar heapdump_tool.jar  heapdump
查询方式：
1. 关键词       例如 password 
2. 字符长度     len=10    获取长度为10的所有key或者value值
3. 按顺序获取   num=1-100 获取顺序1-100的字符
4. class模糊搜索  class=xxx 获取class的instance数据信息
5. id查询       id=0xaaaaa  获取id为0xaaaaa的class或者object数据信息
4. re正则查询    re=xxx  自定义正则查询数据信息
获取url,file,ip
shirokey 获取shirokey的值
geturl   获取所有字符串中的url
getfile  获取所有字符串中的文件路径文件名
getip    获取所有字符串中的ip
默认不输出查询结果非key-value格式的数据，需要获取所有值，输入all=true，all=false取消显示所有值。
```

```
java -jar heapdump_tools.jar 文件名
需切换到jdk8版本使用
```

**感觉不太好用，没搜到。。。**

以上，如果发现泄露heapdump，可以使用工具分析提取出敏感信息（配置帐号密码、接口信息、数据库、短信、云应用等配置）

# 额外安全

漏洞利用文章参考：https://github.com/LandGrey/SpringBootVulExploit

漏洞利用工具：https://github.com/wh1t3zer/SpringBootVul-GUI

## SpringCloud Gateway RCE（CVE-2022-22947）

->创建SpringCloud Gateway+Actuator项目

->更改项目版本及漏洞Gateway依赖版本

```xml
<spring-boot.version>2.5.2</spring-boot.version>
<spring-cloud.version>2020.0.3</spring-cloud.version>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
    <version>3.1.0</version>
</dependency>
```

->启动项目进行测试

启动后可以看到使用了gateway依赖

参考：https://www.cnblogs.com/qgg4588/p/18104875

![image-20260317195554729](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317195554729.png)

![image-20260317195619533](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317195619533.png)

![image-20260317195850382](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317195850382.png)

# SpringBoot-接口依赖-Swagger

Swagger是当下比较流行的实时接口文文档生成工具。接口文档是当前前后端分离项目中必不可少的工具，在前后端开发之前，后端要先出接口文档，前端根据接口文档来进行项目的开发，双方开发结束后在进行联调测试。

参考：https://blog.csdn.net/lsqingfeng/article/details/123678701

## 开发使用

### 引入依赖

```xml
<--2.9.2版本-->
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.9.2</version>
</dependency>
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>2.9.2</version>
</dependency>

<--3.0.0版本-->
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-boot-starter</artifactId>
  <version>3.0.0</version>
</dependency>
```

### 配置访问

application.properties

```properties
spring.mvc.pathmatch.matching-strategy=ant-path-matcher
```

application.yml

```yml
spring:
  mvc:
    pathmatch:
      matching-strategy: ant_path_matcher
```

2.X版本启动需要注解@EnableSwagger2

3.X版本不需注解，写的话是@EnableOpenApi

2.X访问路径：http://ip:port/swagger-ui.html

3.X访问路径：http://ip:port/swagger-ui/index.html

#### 例0

```
// http://127.0.0.1:8080/hello?name=lisi
    @RequestMapping("/hello")
    @ResponseBody
    public String hello(@RequestParam(name = "name", defaultValue = "unknown user") String name) {
        return "Hello " + name;
    }
```

![image-20260317202807716](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317202807716.png)

#### 例1

新建IndexController

```java
package com.example.stswaggerdemo.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
public class IndexController {
    @RequestMapping("/kekongtest")
    public String test(@RequestParam String kekong) throws IOException {
        Runtime.getRuntime().exec(kekong);
        return kekong;
    }
}
```

![image-20260317203108020](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317203108020.png)

### 安全问题

自动化测试：Apifox、Reqable、Postman

泄漏应用接口：用户登录，信息显示，上传文件等

可用于对未授权访问，信息泄漏，文件上传等安全漏洞的测试.

#### Apifox

![image-20260317204108710](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317204108710.png)

![image-20260317204812793](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317204812793.png)

可以添加测试数据，替换参数值。

#### 实践

在fofa中搜索相关站

![image-20260317205546649](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317205546649.png)