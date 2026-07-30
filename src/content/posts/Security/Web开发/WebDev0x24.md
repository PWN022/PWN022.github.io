---
title: JavaEE应用&SpringBoot栈&身份验证&JWT令牌&Security鉴权&安全绕过
published: 2026-03-18 12:00:00
description: JWT令牌的创建、解析与登录校验机制，Spring Security的权限配置与访问控制策略，antMatchers配置不当导致的安全绕过漏洞。
tags: [Web开发,JavaEE]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-JavaEE-身份验证-JWT&Security
2. 安全开发-JavaEE-安全问题-不安全写法&版本漏洞

# 开发框架-SpringBoot

参考：https://springdoc.cn/spring-boot/

# 身份验证的常见技术

1、JWT

2、Shiro

3、Spring Security

4、OAuth 2.0

5、SSO

6、JAAS等

# 身份验证-JWT技术

![image-20260318094508976](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318094508976.png)

JWT(JSON Web Token)是由服务端用加密算法对信息签名来保证其完整性和不可伪造；Token里可以包含所有必要信息，这样服务端就无需保存任何关于用户或会话的信息；

JWT用于身份认证、会话维持等。由三部分组成，header、payload与signature。

## 引入依赖

```xml
<dependency>
	<groupId>com.auth0</groupId>
	<artifactId>java-jwt</artifactId>
	<version>3.4.0</version>
</dependency>
```

## 创建JWT

```
JWT.create()
```

## 配置JWT

```java
package com.example.stjwtdemo.Controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

public class LoginController {
    public static void main(String[] args) {
        // jwt生成
        String JwtData = JWT.create()
                // header部分（可写可不写）
//                .withHeader()
                // payload部分
                .withClaim("username", "admin")
                .withClaim("password", "123456")
                // 签名部分
                .sign(Algorithm.HMAC256("miyao"));
        System.out.println(JwtData);
    }
}
```

**不写header时默认使用HS256算法，这里使用了HMAC256进行签名。**

运行之后生成

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNzd29yZCI6IjEyMzQ1NiIsInVzZXJuYW1lIjoiYWRtaW4ifQ.UAFrNOU639OSxmbbEi8qWklKSNZ_riVLYEpZmODs1Uw
```

![image-20260318102258477](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318102258477.png)

## 解析JWT

构建解密注册

```
JWTVerifier jwt = JWT.require(Algorithm.HMAC256("xiaodisec")).build();
```

解密注册数据

```
DecodedJWT verify = jwt.verify(jwtdata);
```

提取解密数据

```
Integer userid = verify.getClaim("userid").asInt();
```

```java
	// jwt解密
    public static void jwtcheck(String jwtdata){
        Verification verification = JWT.require(Algorithm.HMAC256("miyao"));
        DecodedJWT verify = verification.build().verify(jwtdata);
        String pass = verify.getClaim("password").asString();
        System.out.println(pass);
    }
```

## 登录校验

总结：在不知道服务端签名密钥的情况下，无法伪造合法的JWT令牌（就算已知账号密码也没有任何用处）。但如果服务端使用了存在漏洞的JWT库（如允许none算法），攻击者可能通过修改算法类型绕过签名验证。

### 代码部分

```java
package com.example.stjwtdemo.Controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.Verification;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {

    @RequestMapping("/login")
    public static String main(@RequestParam String username, @RequestParam String password) {
        // jwt生成
        String JwtData = JWT.create()
                // header部分（可写可不写）
//                .withHeader()
                // payload部分
                .withClaim("username", username)
                .withClaim("password", password)
                // 签名部分
                .sign(Algorithm.HMAC256("miyao"));
        System.out.println(JwtData);
        return JwtData;
    }

    // jwt解密
    @RequestMapping("/lc")
    public static String jwtcheck(@RequestParam String jwtdata){
        Verification verification = JWT.require(Algorithm.HMAC256("miyao"));
        // 空密钥加密放在代理里执行到这里就报错
        DecodedJWT verify = verification.build().verify(jwtdata);
        String name = verify.getClaim("username").asString();
        String pass = verify.getClaim("password").asString();
//        System.out.println(pass);
        if (name.equals("root") && pass.equals("111111")){
            return "admin page";
        }else {
            return "user page";
        }
    }
}
```

```html
<html>
<body>
<h1>hello word!!!</h1>
<p>this is a html page</p>
<form action="login" method="post">
    user: <input type="text" name="username"><br>
    pass: <input type="text" name="password"><br>
    <input type="submit" value="login">
</form>

<form action="lc" method="post">
    JWT: <input type="text" name="jwtdata"><br>
    <input type="submit" value="check">
</form>
</body>
</html>
```

### 两种结果

![image-20260318105835236](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318105835236.png)

![image-20260318105648982](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318105648982.png)

![image-20260318110246058](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318110246058.png)

![image-20260318110257882](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318110257882.png)

服务器通过在有密钥的情况下解密还原，遇到空密钥加密的数据直接报错处理。

## 安全问题

参考：https://mp.weixin.qq.com/s/xH_v825bNqDszwmMOe8CBw

# 身份验证-Spring Security

Spring Security安全框架，是Spring Boot底层安全模块默认的技术选型，可以实现强大的Web安全控制。

```
WebSecurityConfigurerAdapter：自定义Security策略

AuthenticationManagerBuilder：自定义认证策略

@EnableWebSecurity：开启WebSecurity模式

"认证"和"授权"(访问控制) 

"认证"(Authentication)

"授权"(Authorization)
```

这个概念是通用的，而不是只在 Spring Security 中存在。

参考官网：https://spring.io/projects/spring-security

## 新建项目

新建Spring Security+web+thymeleaf项目

## 配置解析

配置application.properties模版解析

```
spring.thymeleaf.cache=false

spring.thymeleaf.prefix=classpath:/templates/
```

## 前端部分

添加前端页面文件到templates目录

![image-20260318113537130](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318113537130.png)

## 创建路由控制器

创建路由控制器并指向前端页面文件

```java
@Controller
public class RouterController {
    @RequestMapping({"/","/index"})
    public String index() {
        return "index";
    }

    @RequestMapping("/toLogin")
    public String toLogin() {
        return "views/login";
    }

    @RequestMapping("/level1/{id}")
    public String level1(@PathVariable("id") int id) {
        return "views/level1/"+id;
    }

    @RequestMapping("/level2/{id}")
    public String level2(@PathVariable("id") int id) {
        return "views/level2/"+id;
    }

    @RequestMapping("/level3/{id}")
    public String level3(@PathVariable("id") int id) {
        return "views/level3/"+id;
    }

}
```

先不使用Spring Security进行访问（如果启动需要先登录）：

在配置项添加：

```
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration
```

页面效果：

![image-20260318115235079](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318115235079.png)

![image-20260318115251988](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318115251988.png)

![image-20260318115308989](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318115308989.png)

## 访问策略

创建Security授权文件并开启访问策略

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http.authorizeHttpRequests()
                // 访问根目录给予所有人权限
                .antMatchers("/").permitAll()
                // 每个路径页面的 权限不同
                .antMatchers("/level1/**").hasRole("vip1")
                .antMatchers("/level2/**").hasRole("vip2")
                .antMatchers("/level3/**").hasRole("vip3");
        // 返回登录页面
        http.formLogin();
    }
```

## 测试部分

添加认证用户密码并进行密码加密操作

```java
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication().passwordEncoder(new BCryptPasswordEncoder())
                .withUser("admin").password(new BCryptPasswordEncoder().encode("123456"))
                .roles("vip1","vip2","vip3")
                .and()
                .withUser("user1").password(new BCryptPasswordEncoder().encode("suiyi"))
                .roles("vip1")
                .and()
                .withUser("user2").password(new BCryptPasswordEncoder().encode("renyi"))
                .roles("vip2")
                .and()
                .withUser("user3").password(new BCryptPasswordEncoder().encode("suibian"))
                .roles("vip3");
    }
```

之后就是每个角色，只能访问相应带有权限的可访问路径

比如admin就可以访问level1、level2、level3

## 安全问题

参考：

https://mp.weixin.qq.com/s/5tj6O4TA04QWyWnsd-EmEA

https://mp.weixin.qq.com/s/M1FiPKJRAWgwaKCtyNW8eQ

除去本身的代码不安全写法外，还有版本漏洞导致的安全问题

### 版本漏洞导致安全问题

![image-20260318120854730](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318120854730.png)

**版本漏洞造成未授权访问**

![image-20260318121032972](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318121032972.png)

绕过过滤器并获得对静态资源的访问权

参考文章：https://www.deep-kondah.com/spring-webflux-static-resource-access-vulnerability-cve-2024-38821-explained/

### 自写代码导致安全问题

演示：antMatchers 配置认证绕过

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests()
                // 访问根目录给予所有人权限
                .antMatchers("/").permitAll()
                // 每个路径页面的 权限不同
                .antMatchers("/level1/**").hasRole("vip1")
                .antMatchers("/level2/**").hasRole("vip2")
                .antMatchers("/level3/**").hasRole("vip3");
        // 返回登录页面
        http.formLogin();
    }
```

#### 举例

这里用账号user3举例

代码解释：

一个`*`号代表/level3/目录下的文件，如果/level3/目录下还有目录，就必须使用两个`**`
如果不加`*`就代表只控制/level3/这一个目录，那么其目录下的1.html、2.html、3.html就不会被安全组件控制

![image-20260318121847867](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318121847867.png)

![image-20260318121922886](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318121922886.png)