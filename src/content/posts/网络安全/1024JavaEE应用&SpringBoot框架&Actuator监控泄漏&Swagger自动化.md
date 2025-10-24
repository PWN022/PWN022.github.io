---
title: JavaEE应用&SpringBoot框架&Actuator监控泄漏&Swagger自动化
published: 2025-10-24
description: Actutor的开发使用、监控泄露以及Swagger自动化测试接口。
tags: [JavaEE,安全开发]
category: 网络安全
draft: false
---

# JavaEE应用&SpringBoot框架&Actuator监控泄漏&Swagger自动化

## Actutor端点图

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3901.png)

## SpringBoot-监控系统-Actuator

SpringBoot Actuator 模块提供了生产级别的功能，比如健康检查，审计，指标收集， HTTP 跟踪等，帮助我们监控和管理 Spring Boot 应用。

### 开发使用

创建项目TestActuatorDemo，勾选依赖项Spring Web和SpringBoot Actuator，修改application中的内容，只留下方配置，之后对项目进行访问：`localhost:8080/actuator`，就可以看到打印出来的这些端点。

```java
management.endpoints.web.exposure.include=*
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3902.png)

通过Actutor端点图有时候可以访问到想要看的内容：

[Spring Boot Actuator 漏洞复现合集_springboot actuator 漏洞-CSDN博客](https://blog.csdn.net/drnrrwfs/article/details/125242990)

### 安全问题

通常/actuator中的有些网址会泄露本机电脑数据。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3903.png)

## 图像化 Server&Client 端界面

### 首要

创建一个新项目TestActuatorServer，勾选项目Spring Web以及codecentric's Spring Boot Admin(server)

之后在这个项目中新建模块TestActuatorClient，这次勾选的是Web以及codecentric's Spring Boot Admin(client)。

### Actuator服务端

在启动程序上写入注解@EnableAdminServer：

```java
package com.test.estactuatorserver;

import de.codecentric.boot.admin.server.config.EnableAdminServer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableAdminServer
@SpringBootApplication
public class EstActuatorServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EstActuatorServerApplication.class, args);
    }

}
```

修改application：

```properties
server.port=8888
```

### Actuator客户端

修改application：

```properties
server.port=8889

spring.boot.admin.client.url=http://localhost:8888
management.endpoints.web.exposure.include=*
management.endpoint.health.show-details=always
```

启动，然后访问`http://127.0.0.1:8888/`

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3904.png)

点击地址下面的ID，此处是57d2c0c92c8e，此时的界面其实就是图形化展示刚才的env等。若报错可以尝试换源。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3905.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3906.png)

### 安全问题heapdown

**感觉相关项目可以去网络空间找一下试试**

创建项目TestActuatorDemo1，这次选择的依赖项有：SpringWeb、Mysql Driver、Mybatis Framework，还有这次的SpringBoot Actuator。

根据自己的配置修改：

```properties
server.port=7777

spring.datasource.url=jdbc:mysql://localhost:8088/javademo
spring.datasource.name=admin
spring.datasource.password=123456
spring.datasource.driver-class-name=com.mysql.jdbc.Driver

management.endpoint.health.show-details=always
management.endpoints.web.exposure.include=*
```

可以输入：`http://localhost:7777/actuator`，查看是否存在heapdown

之后启动访问：`http://127.0.0.1:7777/actuator/heapdump`，发现会自动下载 heapdump

#### 方法一

使用JDumpSpider-1.1-SNAPSHOT-full.jar 对heapdump文件进行分析：

使用指令`java -jar  JDumpSpider-1.1-SNAPSHOT-full.jar heapdown`

可以查看到本机泄露的文件： 

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3907.png)

#### 方法二

可以在java VisualVM分析器中分析，在机房没有软件，所以详细参考：https://blog.csdn.net/m0_74930529/article/details/145911000

**尝试访问/mappings**，从中可以发现源代码

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3908.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3909.png)

其他利用见下文：

[Spring Boot Actuator 漏洞复现合集_springboot actuator 漏洞-CSDN博客](https://blog.csdn.net/drnrrwfs/article/details/125242990)

分析得到有一些组件（不安全的组件，如log4j）

#### 防止方式

可以在application中追加内容：

```properties
management.endpoint.heapdump.enabled=false
management.endpoint.env.enabled=false
#把端点关闭就可以预防这种泄露问题，这样请求时就会变成404页面
```

##  SpringBoot—接口系统—Swagger

Swagger是当下比较流行的实时接口文文档生成工具。接口文档是当前前后端分离项目中必不可少的工具，在前后端开发之前，后端要先出接口文档，前端根据接口文档来进行项目的开发，双方开发结束后在进行联调测试。

参考文章：[SpringBoot教程(十六) | SpringBoot集成swagger（全网最全）_springboot swagger-CSDN博客](https://blog.csdn.net/lsqingfeng/article/details/123678701)

创建TestSwaggerDemo，勾选SpringWeb，自行引入依赖项

```xml
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
```

之后在启动类添加注解：

```java
package com.test.testswaggerdemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@EnableSwagger2
@SpringBootApplication
public class TestSwaggerDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(TestSwaggerDemoApplication.class, args);
    }

}
```

这里会有一个报错，需要在application中添加：

```properties
spring.mvc.pathmatch.matching-strategy=ant_path_matcher
```

完成后就可以启动然后访问项目了：`http://localhost:8080/swagger-ui.html`

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3910.png)

可以点开basic-controller发现就是项目中demo.web下面的basic-controller中的代码，可以进行验证。

创建Testcontroller，代码如下：

```java
package com.test.testswaggerdemo.demos.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class TestController {

    @RequestMapping("/getdata")
    @ResponseBody
    public String getdata(@RequestParam String name){
        return "get data "+name;
    }

    @RequestMapping("/postdata")
    @ResponseBody
    public String postdata(@RequestParam String name){
        return "post data "+name;
    }
}
```

重新启动项目，打开`http://localhost:8080/swagger-ui.html`，可以发现：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3911.png)

尝试改一下可以看到回显值：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3912.png)

### 版本三

修改依赖项为3.0版本：

```xml
<--3.0.0版本-->
<dependency>
<groupId>io.springfox</groupId>
<artifactId>springfox-boot-starter</artifactId>
<version>3.0.0</version>
</dependency>
```

可以在启动项进行`@EnableOpenAp`，也可以不用

版本三的访问路径为：`http://localhost:8080/swagger-ui/index.html`，可以发现页面有Api测试路径：`http://localhost:8080/v3/api-docs`

#### 使用postman进行自动化操作

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3913.png)

之后点击右侧的Run

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3914.png)

勾选需要的接口进行测试即可，还可以与burpsuite联动，要到后期才能接触到。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3915.png)

#### 总结

可能有应用接口泄露：用户登录，信息显示，上传文件等。

可用于对未授权访问，信息泄露，文件上传等安全漏洞的测试。

**可通过网络空间对swagger进行搜索，搜索语句`app="Swagger"`**

可以参考文章：[Swagger UI渗透实战 | CN-SEC 中文网](https://cn-sec.com/archives/1037677.html)