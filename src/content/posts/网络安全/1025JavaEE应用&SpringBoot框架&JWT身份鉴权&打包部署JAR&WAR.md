---
title: JavaEE应用&SpringBoot框架&JWT身份鉴权&打包部署JAR&WAR
published: 2025-10-25
description: SpringBoot进行JWT的开发使用，JWT的安全问题，以及SpringBoot两种打包部署过程。
tags: [JavaEE,安全开发]
category: 网络安全
draft: false
---

# JavaEE应用&SpringBoot框架&JWT身份鉴权&打包部署JAR&WAR

## SpringBoot—身份鉴权—JWT 技术

> JWT(JSON Web Token) 是由服务端用加密算法对信息签名来保证其完整性和不可伪造；
>
> Token 里可以包含所有必要信息，这样服务端就无需保存任何关于用户或会话的信息；
>
> JWT 用于身份认证、会话维持等。由三部分组成， header 、 payload 与 signature。
>
> 参考： https://cloud.tencent.com/developer/article/2101634

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/bfb6348d3d464bf7ab6ee4d1c077cac0.png)

### jwt，cookie，session的详解

[Cookie、Session、JWT的详解_cookie session jwt-CSDN博客](https://blog.csdn.net/weixin_35695511/article/details/105040183)

#### Header、Payload 和 Signature 是 JSON Web Token（JWT）的三个主要组成部分。

> **Header（头部）**： JWT 的头部通常包含两部分信息：声明类型（typ）和使用的签名算法（alg）。这些信息以JSON 格式存在，然后进行 Base64 编码，形成 JWT 的第一个部分。头部用于描述关于该 JWT 的元数据信息。
>
> ```json
> 
> {
>   "alg": "HS256",
>   "typ": "JWT"
> }
> ```
>
> **Payload（负载）：** JWT 的负载包含有关 **JWT 主题（subject）及其它声明的信息**。与头部一样，负载也是以 JSON 格式存在，然后进行 Base64 编码，形成 JWT 的第二个部分。
>
> ```json
> {
>   "sub": "1234567890",
>   "name": "John Doe",
>   "iat": 1516239022
> }
> ```
>
> **Signature（签名）：** JWT 的签名是由**头部、负载以及一个密钥生成的**，用于验证 JWT 的真实性和完整性。签名是由指定的签名算法对经过 Base64 编码的头部和负载组合而成的字符串进行签名生成的。
>
> 例如，使用 HMAC SHaA-256 算法生成签名：
>
> ```
> 
> HMACSHA256(
>   base64UrlEncode(header) + "." +
>   base64UrlEncode(payload),
>   secret
> )
> ```
>
> 最终，JWT 是由这三个部分组成的字符串，形如 `header.payload.signature`。JWT 通常用于在网络上安全地传输信息，例如在身份验证过程中传递令牌。

### Jwt案例1

创建项目TestJwt，选用SpringWeb依赖项，之后再pom.xml中添加Jwt的依赖项。

```xml
<dependency>
            <groupId>com.auth0</groupId>
            <artifactId>java-jwt</artifactId>
            <version>3.18.0</version>
</dependency>
```

创建JwtController，代码如下：

```java
package com.test.testjwt.demos.web;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.web.bind.annotation.RequestMapping;

public class JwtController {
    // 模拟用户的jwt身份创建 数据的jwt加密
    public static void main(String[] args) {
        // 创建JWT
        String jwttoken = JWT.create()
                // 设置创建的header部分
//            .withHeader()

                // 设置创建的payload部分
                .withClaim("userid",1)
                .withClaim("username","root")
                .withClaim("password","abc111")

                // 设置时效（过期时间）
//            .withExpiresAt()

                .sign(Algorithm.HMAC256("attackor7"));
        System.out.println(jwttoken);
}

```

需要注意的是，可能会因为jdk版本和Jwt包版本不兼容而导致运行失败，所以可以自行选择解决方式。

运行结果如图所示，其中就和上面提到的一样，格式为：头部.负载.签名。

```java
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNzd29yZCI6ImFiYzExMSIsInVzZXJpZCI6MSwidXNlcm5hbWUiOiJyb290In0.98rDMFFTAh6rPXikntsnYVZlLpGD3IcgMPSSo9-2XLM
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4001.png)

可以使用jwt.io进行解密，虽然能解密出来。但是你不知道他加密的密钥，从而也无法登录。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4002.png)

#### 对jwt进行服务器验证

还是在JwtController中代码部分：

```java
    // 模拟jwt身份的检测 数据的jwt解密
    public static void jwtcheck(String jwtdata){
        // 构造解密注册
        JWTVerifier jwt = JWT.require(Algorithm.HMAC256("attackor7")).build();

        // 解密注册数据
        DecodedJWT verify = jwt.verify(jwtdata);

        // 提取注册解密数据 payload部分
        Integer userid = verify.getClaim("userid").asInt();
        String username = verify.getClaim("username").asString();
        String password = verify.getClaim("password").asString();
        System.out.println(userid);
        System.out.println(username);
        System.out.println(password);
        
        // 还有以下可提取部分
        // verify.getHeader();
        // verify.getSignature();
    }
```

在main主函数中调用`jwtcheck(jwttoken)`，执行之后的结果就是和上图一样，只不过不是json格式。

#### 配置前端提交数据访问客户端页面

控制器完整代码如下：

```java
package com.test.testjwt.demos.web;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class JwtController {
    // 模拟用户的jwt身份创建 数据的jwt加密
    @PostMapping("/jwtcreate")
    @ResponseBody
    public static String main(Integer id,String user,String pass) {
        // 创建JWT
        String jwttoken = JWT.create()
                // 设置创建的header部分
//            .withHeader()

                // 设置创建的payload部分
                .withClaim("userid",id)
                .withClaim("username",user)
                .withClaim("password",pass)

                // 设置时效（过期时间）
//            .withExpiresAt()

                .sign(Algorithm.HMAC256("attackor7"));
        return jwttoken;
//        System.out.println(jwttoken);
//        jwtcheck(jwttoken);
    }


    @PostMapping("/jwtcheck")
    @ResponseBody
    // 模拟jwt身份的检测 数据的jwt解密
    public static String jwtcheck(String jwtdata){
        // String jwtdata = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNzd29yZCI6ImFiYzExMSIsInVzZXJpZCI6MSwidXNlcm5hbWUiOiJyb290In0.98rDMFFTAh6rPXikntsnYVZlLpGD3IcgMPSSo9-2XLM";
        // 构造解密注册
        JWTVerifier jwt = JWT.require(Algorithm.HMAC256("attackor7")).build();

        // 解密注册数据
        DecodedJWT verify = jwt.verify(jwtdata);

        // 提取注册解密数据 payload部分
        Integer userid = verify.getClaim("userid").asInt();
        String username = verify.getClaim("username").asString();
        String password = verify.getClaim("password").asString();
        System.out.println(userid);
        System.out.println(username);
        System.out.println(password);

        // 还有以下可提取部分
        // verify.getHeader();
        // verify.getSignature();
        if (username.equals("admin")){
            return "你是admin";
        }else {
            return "你是gay";
        }
    }

}
```

static中的index代码如下：

```html

<html>
<body>
<h1>hello word!!!</h1>
<p>this is a html page</p>
</body>

<form action="../jwtcreate" method="post">
    id:<input type="text" name="id"><br>
    user:<input type="text" name="user"><br>
    pass:<input type="text" name="pass"><br>
        <input type="submit" value="create">
</form>

<form action="../jwtcheck" method="post">
    jwtdata:<input type="text" name="jwtdata"><br>
    <input type="submit" value="check">
</form>

</html>
```

完成之后，在本地运行就可以进行加密和检测。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4003.png)

```java
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNzd29yZCI6IjEzNDE0MTEyMzQyMTM0MSIsInVzZXJpZCI6MTE0LCJ1c2VybmFtZSI6ImFkbWluIn0.6dBwarQc3i5siNRYksEWWDQ3dNWB-BvVT6WZaPTdqsM
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4004.png)

如果在生成时把username改成其他，那么就会出现：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4005.png)

#### 安全问题

参考文章：[JWT的安全问题 - tomyyyyy - 博客园](https://www.cnblogs.com/tomyyyyy/p/15134420.html)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4006.png)

##### 敏感信息泄露

当直接使用jwt.io直接修改后访问会成功吗？

答案是不能够正常访问。

**想要伪造登录，就需对签名密钥的获取。**

**因为在加密的过程中除了`header`和`payload`部分，还有密钥的存在，如果拿到了密钥(见上图)在解密时加上`signature`，再进行发送就会成功，如果只知道`header`和`payload`的情况下，是会报出签名错误的。**

如图：

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/adac36f183af427baa497fbd5e2f2ef9.png)

## SpringBoot—打包部署—JAR&WAR

SpringBoot 项目打包在 linux 服务器中运行：

注意：

在打包之前可以先看一下自己的pom.xml文件中，是否已经把skip改为false或者删除（示例）。

```xml
<plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
                <configuration>
                    <mainClass>com.test.testjwt.TestJwtApplication</mainClass>
                    <skip>false</skip>
                </configuration>
                <executions>
                    <execution>
                        <id>repackage</id>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
</plugin>
```



### jar类型项目

jar类型项目使用 **SpringBoot打包**插件打包时，会在打成的 **jar中内置tomcat的jar。**
所以使用 **jdk直接运行jar即可**，jar项目中功能将代码放到其内置的tomcat中运行。

#### 第一种打包方式

1. idea中，点击右侧的maven中的clean（将运行产生的一些配置进行清空）。

2. 点击maven中的package进行打包。

   或者使用指令：`maven-clean-package`

最后jar包会保存在项目中target目录下。

配置好环境变量就可以在本地尝试运行：`java -jar xxxx.jar`，成功运行后，可访问`localhost:8080`进行查看。

对于常遇报错问题，解决方法可参考以下文章：

[java -jar XXX.jar 没有主清单属性以及找不到或无法加载主类的问题-CSDN博客](https://blog.csdn.net/Mrzhuangr/article/details/124731024)

#### 第二种打包方式

在打包时需要**将内置的tomcat插件排除**，配置servlet的依赖和修改pom.xml，然后将war文件放到**tomcat安装目录webapps下**,启动运行tomcat自动解析即可。

修改pom.xml：

```xml
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.test</groupId>
    <artifactId>TestJwt</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>TestJwt</name>
    <description>TestJwt</description>
    <!--添加war-->    
    <packaging>war</packaging>
```

启动类里面加入配置：

```java
package com.test.testjwt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class TestJwtApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(TestJwtApplication.class, args);
    }

    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(TestJwtApplication.class);
    }

}
```

和第一种打包一样，使用clean，package进行打包。打包完成后把war包放入到中间件tomcat的webapps中。

双击使用tomcat中的bin/start up.bat启动，会发现在webapps中多了一个TestJwt-0.0.1-SNAPSHOT文件夹，此时保持bat不要关闭，输入url：`http://localhost:8080/TestJwt-0.0.1-SNAPSHOT`即可访问成功。

##### 源码泄露问题

访问jar文件，会发现全部都是class格式，且都被加密了和原来我们看到的不一样。

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/82acec27860f4333a02a6a1e0126ed08.png)

**从而推出了反编译技术将class转换为java。**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4007.png)

**访问文件发现不能像以前一样下载源文件。**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4008.png)

##### 进行反编译

 把jar包解压直接拖入idea，会自动进行反编译，只不过就是注释和换行之类的就不存在了。
