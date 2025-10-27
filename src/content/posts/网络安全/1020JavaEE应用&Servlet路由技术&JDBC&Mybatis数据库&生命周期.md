---
title: JavaEE应用&Servlet路由技术&JDBC&生命周期
published: 2025-10-20
description: JavaEE开发中的Servlet路由技术以及JDBC的使用。
tags: [JavaEE,安全开发]
category: 网络安全
draft: false
---

# 简要

安装部署的过程中，如果是跟视频那就保持一样的版本，如果是自行下载的话需要注意一些，下面我把遇到的坑简单说一下。

idea和jdk版本一般没什么问题，如果遇到问题也很好解决，我遇到的是创建项目时，tomcat的问题，不太清楚是否版本问题，我部署的项目是Jakarta EE，在运行的时候就开始报错，具体内容因为我之前没学过Java不是很理解，我就把jdk的版本换为了我本地的jdk21，就没有报错，但是运行后我在尝试打开代码自带的hello-servlet时报了一个这样的问题（下面贴出代码部分和报错）：

```Java
// HelloServlet.java
package com.example.demo;

import java.io.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;

@WebServlet(name = "helloServlet", value = "/hello-servlet")
public class HelloServlet extends HttpServlet {
    private String message;

    public void init() {
        message = "Hello World!";
    }

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");

        // Hello
        PrintWriter out = response.getWriter();
        out.println("<html><body>");
        out.println("<h1>" + message + "</h1>");
        out.println("</body></html>");
    }

    public void destroy() {
    }
}
```

```html
HTTP状态 404 - 未找到
类型 状态报告
消息 请求的资源[/demo_war_exploded/hello-servlet]不可用
描述 源服务器未能找到目标资源的表示或者是不愿公开一个已经存在的资源表示。
Apache Tomcat/9.0.111
```

在看到此问题后排除代码和jdk的问题，就去tomcat官网进行了版本的查看，在Tomcat 9及更早版本上运行的应用程序必须经过修改才能在Tomcat 10上运行。为Tomcat 9及更早版本设计的Java EE应用程序可以放置在此`$CATALINA_BASE/webapps-javaee`目录中，Tomcat会自动将其转换为Jakarta EE并复制到 webapps 目录。此转换是使用适用 [于 Jakarta EE 的 Apache Tomcat 迁移工具](https://github.com/apache/tomcat-jakartaee-migration)执行的，该工具也可单独 [下载](https://tomcat.apache.org/download-migration.cgi)以供离线使用。

所以我的解决办法就是直接下载了tomcat的新版本，更换到11.0.13之后就没出现任何问题了。

## JavaEE—HTTP—Servlet&路由&周期

Java:

功能:数据库操作，文件操作，序列化数据，身份验证，框架开发，第三方库使用等。

框架库:MyBatis,SpringMVC,SpringBoot,Shiro , Log4j ,FastJson等技术:Servlet,Listen,Filter,Interceptor,JWT，AOP，待补充。

```java
//接受用户输入的 变量字符串s接受
Scanner sc = new Scanner(System.in);
System.out.print("Enter the id:");
String s = sc.nextLine();
System.out.println(s);
// 不安全的写法
String query = "select * from user where id="+s;
Statement statement = connection.createStatement();
ResultSet resultSet = statement.executeQuery(query);
System.out.println(resultSet);
```

JavaEE-HTTP-Servlet&路由&周期:

Servlet以及tomcat相关知识可以参考文章：https://blog.csdn.net/qq_52173163/article/details/121110753

### Servlet创建和使用

1. 创建一个类继承HttpServlet
2. web.xml配置servlet路由
3. WebServlet配置servlet路由
4. 写入内置方法（init service destroy doget dopost）

Servlet的操作使用步骤如下：先创建一个IndexServlet在com.example.demo下，之后继承HelloServlet，代码如下：

```java
// IndexServlet.java
package com.example.demo;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

public class IndexServlet extends HttpServlet {
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // super.doGet(request, response);
        String name = request.getParameter("name");
        // String name = "lixiang";
        PrintWriter out = response.getWriter();
        out.println("<h1>Hello "+name+"</h1>");
        System.out.println("doGet");

    }
}
```

解释：

- HttpServletResponse是ServletResponse的子接口
- setCharacterEncoding()设置编码格式
- setContentType()设置解析语言
- getWriter()获得一个PrintWriter字符输出流输出数据
- PrintWriter接收符合类型数据

对以上代码进行解释：

```java
String name = request.getParameter("name")；// 理解为写一个字符串理解为name请求一个值name
PrintWriter out=response.getWriter()；// 理解为返回回显输出数据
out.printIn("name:"+name);// 理解为打印数据
```

### 两种路由访问方式

第一种是在webapp目录中的WEB-INF下的web.xml中进行代码的添加：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
         version="6.0">
    
    <servlet>
        <!--        要加载的名字是index，引用的class文件路径在com.example.demo.IndexServlet-->
        <servlet-name>index</servlet-name>
        <servlet-class>com.example.demo.IndexServlet</servlet-class>
    </servlet>

    <servlet-mapping>
        <!--    路由访问，对应的名字是index，请求/index-->
        <servlet-name>index</servlet-name>
        <url-pattern>/index</url-pattern>
    </servlet-mapping>
</web-app>
```

另外一种是在Java代码中添加@WebServlet注解，可以指定Servlet的访问路径、初始化参数、加载顺序等配置信息。

可参考文章：https://blog.csdn.net/weixin_73869209/article/details/134111948

除了doget，dopost还有init，service两个，destroy。

**执行流程：**

init只会被执行一次之后不会再执行

destroy会在最后结束服务器的时候执行

service会执行多次

**注意：**

service执行在doget，dopost之上

先执行Servlet service后执行http service再执行doGet

他们会自动调用，其他要访问才会调用。

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251020154934933.png" alt="image-20251020154934933"  />

完整代码如下：

```java
// IndexServlet.java
package com.example.demo;

import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

@WebServlet(name = "indexServlet", value = "/index")
public class IndexServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // super.doGet(req, resp);
        System.out.println("NewServlet->doGet");
        String name = req.getParameter("name");// 理解为定义字符串name，给予给定值name。
        resp.setContentType("text/html");// 回显方式
        resp.setCharacterEncoding("UTF-8");// 编码方式
        PrintWriter out = resp.getWriter();//  数据输出
        out.println("Yourname:"+name);// 显示 post提交的数据
        System.out.println(req.getParameter("name"));// 打印输入的数据
        out.flush();// 页面刷新
        out.close();// 关闭
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        System.out.println("NewServlet->doPost");
        String name = req.getParameter("name");
        resp.setContentType("text/html");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("Yourname:"+name);
        out.flush();
        out.close();
    }

    @Override
    public void init(){
//        super.init();
        System.out.println("NewServlet->init");
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        super.service(req, resp);
        System.out.println("NewServlet->HttpServletRequest Service");
    }

    @Override
    public void service(ServletRequest req, ServletResponse res) throws IOException, ServletException {
        super.service(req, res);
        System.out.println("NewServlet->ServletRequest Service");
    }

    @Override
    public void destroy() {
//        super.destroy();
        System.out.println("NewServlet->destory");
    }
}
```

## JavaEE—数据库—JDBC—Mybatis-库（Hibernate):

三种数据库的对比，使用，分析：http://t.csdnimg.cn/Cs6zH

JDBC的使用：https://www.jianshu.com/p/ed1a59750127，JDBC由于是java官方自带，所以不需要api接口，但需要数据库驱动jar文件；

jar文件下载：https://mvnrepository.com/

下载后maven会出现文件:(许多使用拉数据库的操作都会使用)。

下载所需版本的jar包。之后在demo下创建lib放入此文件。之后右键此文件然后选择为添加为库。才算正常启用。

之后就是代码方面（主要是对表中信息的查询），包括连接还有一些基础语句，具体其他操作都可参考上方JDBC的使用那篇文章。

```java
// SelectServlet.java
package com.example.demo;

import java.sql.*;

public class SelectServlet {
    public static void main(String[] args) throws ClassNotFoundException, SQLException {
        Class.forName("com.mysql.jdbc.Driver");
        String url = "jdbc:mysql://localhost:8088/javademo";
        String user = "admin";
        String password = "123456";
        Connection connection = DriverManager.getConnection(url,user,password);
        System.out.println(connection);
        String query = "select * from user";
        // 创建Statement执行SQL
        Statement statement = connection.createStatement();
        ResultSet resultSet = statement.executeQuery(query);
        // System.out.println(resultSet);
        
        while (resultSet.next()) {
            int id = resultSet.getInt("id");
            String name = resultSet.getString("username");
            String pass = resultSet.getString("password");
            String nickname = resultSet.getString("nickname");
            String personalSign = resultSet.getString("personalSign");
            System.out.println(id + " " + name + " " + pass + " " + nickname + " " + personalSign);
        }

    }
}
```

不当的sql语句可造成sql注入（使用union select会造成注入），以及预编译语句代码如下：

```java
// 危险写法        
String query = "select * from user where id="+id;
sql注入比如：
    ?id=1
    ?id=1 and 1=1
    ?id=1 union select
    因为sql注入会分成两条语句，但是经过预编译之后的语句实际上只执行了前面的语句，后边的语句直接被无视掉了。
// 预编译（提前预判编译了逻辑）
String query = "select * from user where id=?";
```

#### mybatis注入以及预编译写法

https://blog.csdn.net/weixin_54902210/article/details/127117638

```java
// 获取连接对象
conn = DBUtil.newInstance();
// 定义SQL
String sql = "select * from emp where ename=? and dno=?";
// 预编译SQL
ps = conn.prepareStatement(sql);
```

### 问题总结

main函数使用和python的main一样，和前文提到的init一样。就是使用前会被自动调用。

req的使用（需要调用service等），req的使用需要httpservlet的调用

但单独继承调用httpservlet会造成错误。

### 问题解决

**其实解决办法就是创建Model模型类来写获取的方法、Dao层负责数据库访问，之后就在java代码中调用Dao就可以实现。**

1. 创建User.java模型类

   代码如下：

   ```java
   // User.java
   package Model;
   
   public class User {
       int id;
       String username;
       String password;
       String nickname;
       String personalsign;
   
   
       public int getId(){
           return id;
       }
       public void setId(int id){this.id = id;}
       public String getUsername(){return username;}
       public void setUsername(String username){this.username = username;}
       public String getPassword(){return password;}
       public void setPassword(String password){this.password = password;}
       public String getNickname(){return nickname;}
       public void setNickname(String nickname){this.nickname = nickname;}
       public String getPersonalsign(){return personalsign;}
       public void setPersonalsign(String personalsign){this.personalsign = personalsign;}
   
   }
   ```

2. 创建UserDAO.java（负责数据库访问）

   代码如下：

   ```java
   // UserDao.java
   package Dao;
   
   import Model.User;
   import java.sql.*;
   import java.util.ArrayList;
   import java.util.List;
   
   public class UserDao {
       public List<User> getAllusers() throws ClassNotFoundException, SQLException {
           Class.forName("com.mysql.jdbc.Driver");
           String url = "jdbc:mysql://localhost:8088/javademo";
           String user = "admin";
           String password = "123456";
           Connection connection = DriverManager.getConnection(url,user,password);
   //        System.out.println(connection);
   
           String query = "select * from user";
           Statement statement = connection.createStatement();
           ResultSet resultSet = statement.executeQuery(query);
   //        System.out.println(resultSet);
   
           List<User> users = new ArrayList<User>();
           while (resultSet.next()) {
               User u = new User();
               u.setId(resultSet.getInt("id"));
               u.setUsername(resultSet.getString("username"));
               u.setPassword(resultSet.getString("password"));
               u.setNickname(resultSet.getString("nickname"));
               u.setPersonalsign(resultSet.getString("personalsign"));
               users.add(u);
           }
           resultSet.close();
           statement.close();
           connection.close();
           return users;
       }
   }
   ```

3. 修改NewServlet.java（调用DAO）

   代码如下：

   ```java
   // NewServlet.java
   package com.example.demo;
   
   //import jakarta.servlet.ServletException;
   
   import Dao.UserDao;
   import Model.User;
   import jakarta.servlet.annotation.WebServlet;
   import jakarta.servlet.http.HttpServlet;
   import jakarta.servlet.http.HttpServletRequest;
   import jakarta.servlet.http.HttpServletResponse;
   
   import java.io.IOException;
   import java.io.PrintWriter;
   import java.util.List;
   
   public class NewServlet extends HttpServlet {
       protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
           resp.setContentType("text/html;charset=UTF-8");
           PrintWriter out = resp.getWriter();
   
           try {
               UserDao dao = new UserDao();
               List<User> users = dao.getAllusers();
   
               out.println("<h1>用户列表</h1><ul>");
               for (User u : users) {
                   out.println("<li>" + u.getId() + " - " + u.getUsername() + " - " + u.getNickname() + "</li>");
               }
               out.println("</ul>");
           } catch (Exception e) {
               e.printStackTrace(out);
           }
       }
   }
   ```

   效果图展示：

   ![image-20251020174925491](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251020174925491.png)

