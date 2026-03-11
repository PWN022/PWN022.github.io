---
title: JavaEE应用&Servlet技术&路由配置&生命周期&过滤器Filter&监听器Listen
published: 2026-03-11 12:00:00
description: Servlet生命周期与路由、过滤器实现请求拦截与安全检测、监听器监控会话状态。
tags: [Web开发,JavaEE]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-JavaEE-Servlet技术
2. 安全开发-JavaEE-监听器&过滤器

参考：

https://mp.weixin.qq.com/s/c_4fOTBKDcByv8MZ9ayaRg

https://blog.csdn.net/qq_52173163/article/details/121110753

## 解释

Servlet是运行在Web服务器或应用服务器上的程序,它是作为来自Web浏览器或其他HTTP客户端的请求和HTTP服务器上的数据库或应用程序之间的中间层。使用Servlet可以收集来自网页表单的用户输入，呈现来自数据库或者其他源的记录，还可以动态创建网页。本章内容详细讲解了web开发的相关内容以及servlet相关内容的配置使用,是JAVAEE开发的重中之重。

# JavaEE-IDEA开发

安装IDEA，激活后安装开发插件

安装JDK,Tomcat,新建项目并配置

略过这部分。

```java
package com.example.servlet42;

import java.io.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;

// WebServelet注解：Servlet 的 URL 路由映射的注解
// name就是路由名，value后跟的是路径
@WebServlet(name = "helloServlet", value = "/hello-servlet")
public class HelloServlet extends HttpServlet {
    private String message;

    public void init() {
        message = "Hello World!";
    }

    // get请求
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");

        // Hello
        PrintWriter out = response.getWriter();
        out.println("<html><body>");
        
        // 上方代码中的message
        out.println("<h1>" + message + "</h1>");
        
        out.println("</body></html>");
    }

    public void destroy() {
    }
}
```

# 创建和使用Servlet

## 创建一个类继承HttpServlet

右键->新建Java类->命名为IndexServlet

会自动创建Java类，并且生成代码为：

```java
package com.example.servlet42;

public class IndexServlet{
    
}
```

继承HttpServelet：

```java
package com.example.servlet42;

public class IndexServlet extends HelloServlet{
    
}
```

之后可以右键->生成->重写方法，代码如下：

分别为初始化、get方法、post方法、销毁

```java
package com.example.servlet42.Servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

//WebServlet注解
@WebServlet(name = "index", value = "/index")
public class IndexServlet extends HelloServlet {
    @Override
    public void init() {
        System.out.println("init");
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String name = request.getParameter("name");
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println(name);
        System.out.println("get");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("post");
    }

    @Override
    public void destroy() {
        System.out.println("destory");
    }
}

```

进行访问会执行init、进行抓包使用get/post请求会执行get/post、最后重启服务器或者关闭会执行destroy。

## web.xml配置Servlet路由

自行搜索。

## WebServlet配置Servlet路由

如上代码所示。

# Servlet生命周期

快捷键：alt+insert

进行访问会执行init、使用get/post请求会执行get/post、最后重启服务器或者关闭会执行destroy。

![image-20260311104155674](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260311104155674.png)

![image-20260311104211753](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260311104211753.png)

# 处理接受和回显

- HttpServletRequest是ServletRequest的子接口

  getParameter(name) — String 通过name获得值

  getParameterValues — String[ ] 通过name获得多值

- HttpServletResponse是ServletResponse的子接口 

  setCharacterEncoding() 设置编码格式

  setContentType() 设置解析语言

  getWriter() 获得一个PrintWriter字符输出流输出数据

  PrintWriter 接受符合类型数据

# JavaEE-过滤器-Filter

Filter被称为过滤器，过滤器实际上就是对Web资源进行拦截，做一些处理后再交给下一个过滤器或Servlet处理，通常都是用来拦截request进行处理的，也可以对返回的 response进行拦截处理。开发人员利用filter技术，可以实现对所有Web资源的管理，例如实现权限访问控制、过滤敏感词汇、压缩响应信息等一些高级功能。

## 创建过滤器

新建软件包：Filter

新建类：XssFilter

## 过滤器内置方法

init  doFilter destroy

```java
package com.example.servlet42.Filter;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

@WebFilter(filterName = "xss", value = "/index")
public class XssFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("XssFilter init");
    }

    @Override
    public void destroy() {
        System.out.println("XssFilter destory");
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        System.out.println("XssFilter doFilter");

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        String name = request.getParameter("name");
        if(!name.contains("script")){
            //放行数据
            filterChain.doFilter(servletRequest,servletResponse);
        }else {
            System.out.println("Xss Attack");
        }

    }
}
```

## 过滤器触发流程

当Web应用启动时，过滤器初始化。用户每次发送请求，过滤器都会在请求到达Servlet前和响应返回客户端前进行拦截处理。应用关闭时，过滤器销毁。

```
// 过滤所有url
@WebFilter("/*")
// 或者使用web.xml配置
<filter>
    <filter-name>xssFilter</filter-name>
<filter-class>com.example.filter.xssFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>xssFilter</filter-name>
    <url-pattern>/xss</url-pattern>
</filter-mapping>
```

## 过滤器安全场景

Payload检测，权限访问控制，红队内存马植入，蓝队清理内存马等

内存马参考：https://mp.weixin.qq.com/s/hev4G1FivLtqKjt0VhHKmw

## 案例演示

xss攻击的检测（通过以上代码即可实现简单的检测）。

### 管理页面的cookie检测

#### Filter

```java
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebFilter({"/user/*", "/order/*", "/cart/*"})  // 需要登录才能访问的页面
public class SimpleLoginFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, 
                        ServletResponse response, 
                        FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        
        // 1. 先检查session中是否有用户（已登录）
        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("user") != null) {
            // 已登录，放行
            chain.doFilter(request, response);
            return;
        }
        
        // 2. 如果session中没有，检查是否有"记住我"的Cookie
        Cookie[] cookies = req.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("rememberMe".equals(cookie.getName())) {
                    String username = cookie.getValue();
                    
                    // 3. 如果有记住我Cookie，自动登录
                    // 这里简单演示，实际应用中应该验证Cookie的有效性
                    session = req.getSession(true);
                    session.setAttribute("user", username);
                    
                    // 自动登录成功，放行
                    chain.doFilter(request, response);
                    return;
                }
            }
        }
        
        // 4. 既没有登录，也没有记住我Cookie，跳转到登录页
        resp.sendRedirect(req.getContextPath() + "/login.jsp");
    }
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("登录过滤器初始化");
    }
    
    @Override
    public void destroy() {
        System.out.println("登录过滤器销毁");
    }
}
```

#### 登录Servlet

```java
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        
        String username = req.getParameter("username");
        String password = req.getParameter("password");
        String remember = req.getParameter("remember"); // 是否记住我
        
        // 简单验证（实际应用中应该验证数据库）
        if ("admin".equals(username) && "123".equals(password)) {
            
            // 1. 保存到session
            HttpSession session = req.getSession();
            session.setAttribute("user", username);
            
            // 2. 如果勾选了"记住我"，设置Cookie
            if ("on".equals(remember)) {
                Cookie rememberCookie = new Cookie("rememberMe", username);
                rememberCookie.setMaxAge(7 * 24 * 60 * 60); // 保存7天
                rememberCookie.setPath("/");
                resp.addCookie(rememberCookie);
            }
            
            // 3. 跳转到用户中心
            resp.sendRedirect(req.getContextPath() + "/user/index.jsp");
            
        } else {
            // 登录失败
            resp.sendRedirect(req.getContextPath() + "/login.jsp?error=1");
        }
    }
}
```

#### 登出Servlet

```java
@WebServlet("/logout")
public class LogoutServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        
        // 1. 清除session
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        
        // 2. 清除记住我Cookie
        Cookie[] cookies = req.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("rememberMe".equals(cookie.getName())) {
                    cookie.setMaxAge(0); // 立即过期
                    cookie.setPath("/");
                    resp.addCookie(cookie);
                    break;
                }
            }
        }
        
        // 3. 跳转到首页
        resp.sendRedirect(req.getContextPath() + "/index.jsp");
    }
}
```

#### jsp

```jsp
//login.jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>登录</title>
</head>
<body>
    <h2>用户登录</h2>
    
    <% if (request.getParameter("error") != null) { %>
        <p style="color:red">用户名或密码错误！</p>
    <% } %>
    
    <form action="login" method="post">
        用户名：<input type="text" name="username"><br>
        密码：<input type="password" name="password"><br>
        <input type="checkbox" name="remember"> 记住我<br>
        <input type="submit" value="登录">
    </form>
</body>
</html>

//user/index.jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>用户中心</title>
</head>
<body>
    <h2>欢迎, <%= session.getAttribute("user") %>！</h2>
    <p>这是需要登录才能访问的页面</p>
    <a href="<%= request.getContextPath() %>/logout">退出登录</a>
</body>
</html>
```

# JavaEE-监听器-Listen

参考：https://blog.csdn.net/qq_52797170/article/details/124023760

- 监听ServletContext、HttpSession、ServletRequest等域对象创建和销毁事件
- 监听域对象的属性发生修改的事件
- 监听在事件发生前、发生后做一些必要的处理

## 创建监听器

新建软件包：Listen

新建类：SessionListen

## 监听器内置方法

sessionCreated、sessionDestroyed

```java
package com.example.servlet42.Listen;

import javax.servlet.annotation.WebListener;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

@WebListener("/admin")
public class SessionListen implements HttpSessionListener {
    @Override
    public void sessionCreated(HttpSessionEvent se) {
        System.out.println("listen session created");
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        System.out.println("listen session destoryed");
    }
}

```

## 监听器触发流程

同样，当Web应用启动时，就会触发监听器。用户访问、发送请求时也会触发created。请求结束、会话销毁就会触发destroyed

```
@WebListener()
// web.xml
<listener>
	<listener-class></listener class>
</listener>
```

## 监听器安全场景

代码审计中分析执行逻辑触发操作，红队内存马植入，蓝队清理内存马等

## 案例演示

session存在的监听（以上）