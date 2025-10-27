---
title: JavaEE应用&SQL预编译&Filter过滤器&Listener监听器&访问控制
published: 2025-10-20
description: JavaEE开发过滤器和监听器实现步骤以及后门内存马植入案例。
tags: [JavaEE,安全开发]
category: 网络安全
draft: false
---

## 内存马介绍

文章参考：https://blog.csdn.net/weixin_39190897/article/details/137379027

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/85796e628664ba345788a2c26a9cc3e1.jpeg)

现在所流行的内存马也是有使用了filter和listener。

## SQL预编译

预编译SQL语句并执行，预防SQL注入问题。

```java
String safesql="select * from news where id=?";
PreparedStatement preparedStatement=connection.prepareStatement();
preparedStatement.setString(1,s);
ResultSet resultSet=preparedStatement.executeQuery();
```

### 危险写法

sql预编译使用代码：（运行时使用第二个执行符号），这里仅展示部分代码：

在Java中，`String s=sc.nextLine()；`这行代码的作用是从标准输入（通常是键盘）读取一行文本，并将这行文本作为一个字符串（string）赋值给变量。这里，scanner是一个Scanner类的实例，该类位于java.util包中，用于简化文本扫描。

```java
 //接受用户输入的 变量字符串s接受
Scanner sc = new Scanner(System.in);
System.out.print("Enter the id:");
String s = sc.nextLine();
//        System.out.println(s);

 // 不安全的写法
String query = "select * from user where id="+s;
Statement statement = connection.createStatement();
ResultSet resultSet = statement.executeQuery(query);
System.out.println(resultSet);
```

造成sql注入：

1. or

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/33-01.png)

2. union select

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/33-02.png)

union需要构造同列数payload，因为我数据库设计有5列，所以注入语句为`1 union select 1,2,version(),user(),database()`

### 安全写法

```java
        // 定义了一个安全的SQL查询字符串，其中包含一个参数占位符（?），用于后续绑定具体的值
        String safequery = "select * from user where id=?";

        // 使用connection对象（通常是一个已经建立好的数据库连接）来创建一个PreparedStatement对象
        // PreparedStatement对象允许你设置SQL语句中的参数，并且这些参数在发送到数据库之前会被自动地转义，从而防止SQL注入攻击
        PreparedStatement ps = connection.prepareStatement(safequery);

        // 通过setString方法设置SQL语句中第一个参数（?）的值为变量s的值
        // 这里假设s是一个已经定义好的String类型的变量，它包含了要查询的用户ID
        ps.setString(1,s);

        // 执行PreparedStatement对象中的SQL查询，并返回一个ResultSet对象
        // ResultSet对象包含了查询结果的所有行，你可以通过遍历ResultSet来访问每一行的数据
        ResultSet resultSet = ps.executeQuery();

        // 打印原始的SQL模板字符串，但请注意，这里打印的safesql并不包含已经绑定的参数值
        // 它仅仅是定义时的字符串："select * from news where id=?"
        System.out.println(resultSet);
```

注入语句为：1 union select 1,2,3,version(),user(),database()

1 a，1 and，1 and 11=11 都有数据正常回显。

22这种没有回显，sleep（）是延时回应，输入后没有影响。

### 预编译绕过

需要特定的条件，和waf一样。

## Fliter过滤器

### 原理

客户端先经过监听器、过滤器，之后到达代码层再选择性的到达数据库；如果没有监听和过滤就知道到达代码。

Filter被称为过滤器，过滤器实际上就是对Web资源进行拦截，做一些处理后再交给下一个过滤器或Servlet处理，通常都是用来拦截request进行处理的，也可以对返回的response进行拦截处理。开发人员利用filter技术，可以实现对所有Web资源的管理，例如实现权限访问控制、过滤敏感词汇、压缩响应信息等一些高级功能。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/33-03.png)



常规的Web后门一般都是在代码（Servlet层），而内存马存在于过滤器（Filter层）和监听器（Listener），所以内存马就是写在代码中，没有写在文件里。

### 实践步骤

1. 创建过滤器

   可以删掉.mvn,.gitgnore,mvnw,mvnw.cmd使代码更简洁。

   创建TestServlet，然后使用快捷键alt+insert选择重写方法。快捷键可参考文章：https://blog.csdn.net/weixin_43570367/article/details/103963249

   路由配置就不过多说明，比较方便的就是直接添加@WebServlet注解。

   现在就可以运行项目了。

   **代码如下：**

   ```java
   // TestServlet.java
   package com.example.filterdemo1;
   
   import jakarta.servlet.ServletException;
   import jakarta.servlet.annotation.WebServlet;
   import jakarta.servlet.http.HttpServlet;
   import jakarta.servlet.http.HttpServletRequest;
   import jakarta.servlet.http.HttpServletResponse;
   
   import java.io.IOException;
   import java.io.PrintWriter;
   
   @WebServlet("/test")
   public class TestServlet extends HttpServlet {
       @Override
       protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
           String code = req.getParameter("code");// 接收code参数值
           // 从HttpServletResponse对象获取一个PrintWriter输出流，向前台页面输出结果
           // 可接收的数据类型：字符串、对象、JSON数据、HTML/XML标签
           PrintWriter out = resp.getWriter();
           out.println(code);// 打印
           out.flush();
           out.close();
       }
   }
   ```

   ![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/33-04.png)

2. 过滤器内置方法

   **知识补充：**

   extends和implements的区别（extends是继承类，implements是继承接口，也就是上下级的关系）

   ```java
   public class Xssfilter implements Filter
   {
       
   }
   以及
   public class Xssfilter extends HttpServlet implements Filter 
   {
       
   }
   ```

   内置方法：init初始化、doFilter访问路由触发、destory关闭销毁。

3. 过滤器触发流程

   ```java
   package com.example.filterdemo1.filter;
   
   import jakarta.servlet.*;
   import jakarta.servlet.annotation.WebFilter;
   import jakarta.servlet.http.HttpServletRequest;
   import jakarta.servlet.http.HttpServletResponse;
   
   import java.io.IOException;
   
   @WebFilter("/test")// 请求test时就触发过滤器
   public class XssFilter implements Filter {
       @Override
       // 初始化运行
       public void init(FilterConfig filterConfig) throws ServletException {
           System.out.println("XssFilter init");
       }
       
       @Override
       // 访问路由触发的方法
       public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
           System.out.println("XssFilter doFilter");
   
           // 过滤代码就应该在放行前
           // 如果符合就放行，不符合就过滤（拦截）
           // XSS过滤 接受参数值 如果有攻击payload 就进行拦截
           // 接受参数值 如果没有攻击payload 就进行放行
           HttpServletRequest request= (HttpServletRequest) servletRequest;
           HttpServletResponse response = (HttpServletResponse) servletResponse;
           String code = request.getParameter("code");
           // 没有攻击payload
           if(!code.contains("<script>")){
               //放行
               filterChain.doFilter(servletRequest,servletResponse);
           }else{
               System.out.println("Cross Site Script Attack!");
               // 拦截，返回404
               response.sendError(HttpServletResponse.SC_NOT_FOUND);
               //继续拦截
           }
       }
   
       @Override
       // 关闭后自动运行
       public void destroy() {
           System.out.println("XssFilter destroy");
       }
   }
   ```

### AdminFIilter和AdminServlet

AdminServlet代码：

```java
package com.example.filterdemo1.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/admin")
public class AdminServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html");

        try(PrintWriter out = resp.getWriter()) {
            out.println("<html>");
            out.println("<head>");
            out.println("<title>Servlet AdminServlet</title>");
            out.println("</head>");
            out.println("<body>");
            out.println("<h1>Welcome,Admin</h1>");
            out.println("</body>");
            out.println("</html>");
            // 或者
//            String welcome = "欢迎进入管理员界面";
//            out.println("<h1>" + welcome + "</h1>");
        }

    }
}
```

AdminFilter代码：

```java
package com.example.filterdemo1.filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebFilter("/admin")
public class AdminFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("AdminFilter init");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        System.out.println("AdminFilter doFilter");
        // 检测Cookie过滤
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        Cookie[] cookies = req.getCookies();
        boolean isAdmin = false;
        // 对Cookie进行遍历获取
        if(cookies != null) {
            for (Cookie c:cookies) {
                // 获取cookie名
                String Cname = c.getName();
                // 获取cookie值
                String Cvalue = c.getValue();
                System.out.println("Cname: " + Cname + " Cvalue: " + Cvalue);

                // 通过在浏览器的应用程序中添加Cookie名和值
                if (Cname.contains("admin") && Cvalue.contains("111")) {
                    isAdmin = true;
                    break;
                }
            }
        }

        if (isAdmin) {
            chain.doFilter(request, response);
        }else{
            System.out.println("Not AdminLogin");
            res.sendError(HttpServletResponse.SC_NOT_FOUND);
        }

    }

    @Override
    public void destroy() {
        System.out.println("AdminFilter destroy");
    }
}
```

当Cookie中没有名为admin，值为111的数据时，会直接返回404，新增之后就会显示欢迎界面。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/33-06.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/33-05.png)

### 后门内存码植入

使用哥斯拉生成demo1.jsp

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/33-07.png)

然后把demo1.jsp放入webapp目录下，使用哥斯拉进行连接测试：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/33-08.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/33-09.png)
![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/33-10.png)
![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/33-11.png)

#### 总结

内存马是写在Filter中。

后门没有写到Servlet中，常规方法扫描只会扫Servlet，而忘记扫描Filter。

## Listener监听器

详细参考：https://blog.csdn.net/qq_52797170/article/details/124023760

> -监听 ServletContext、HttpSession、ServletRequest 等域对象创建和销毁事件
>
> -监听域对象的属性发生修改的事件
>
> -监听在事件发生前、发生后做一些必要的处理
>
> 1、创建监听器
>
> 2、监听器内置方法
>
> 3、监听器触发流程
>
> @WebListener
>
> <listener>
>
> ......
>
> </listener>
>
> 4.监听器安全场景：代码审计中分析执行逻辑触发操作，后门内存马植入等

新建项目，之后创建Servlet包和Listener包。

#### Servlet

Csession：

```java
// CSession.java
package com.example.listenerdemo1.Servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/cs")
public class CSession extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("Servlet里面创建Session");
        // 创建session
        req.getSession();
    }
}
```

Dsession：

```java
// DSession.java
package com.example.listenerdemo1.Servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/ds")
public class DSession extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("Servlet里面销毁Session");
        // 销毁session
        req.getSession().invalidate();
    }
}
```

#### Listener

ListenerSession：

```java
// ListenerSession.java
package com.example.listenerdemo1.Listener;

import jakarta.servlet.annotation.WebListener;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;

@WebListener
public class ListenerSession implements HttpSessionListener {
    @Override
    public void sessionCreated(HttpSessionEvent se) {
        // 监听检测有Session创建就会执行这里
        System.out.println("Session created");
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        //监听检测有Session销毁就会执行这里
        System.out.println("Session destroyed");
    }
}
```



