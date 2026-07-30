---
title: Web应用&各语言框架&安全组件&联动系统&数据特征&人工分析&识别项目
published: 2026-01-30 21:00:00
description: 本文主要内容是各语言框架的数据特征（数据包中的一些特征不是固定的，可以设置删掉此类的特征），后面还会讲到nuclei这款工具的详细使用。
tags: [信息收集,Web应用]
category: 网络安全
draft: false
---

# 知识点

1. 信息收集-Web应用-开发框架-识别安全
2. 信息收集-Web应用-安全组件-特征分析

![image-20260130211912648](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130211912648.png)

ICO图标：

1. 某个应用系统的标识
2. 某个公司/机构/个人团队的标识

## Python-开发框架-Django&Flask

### Django

1. 识别插件

   ![image-20260130213004231](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130213004231.png)

2. 固定的数据包格式：Set-Cookie:expires=

   不一定所有的都显示。

   ![image-20260130213127503](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130213127503.png)

### Flask

1. 识别插件

2. 固定的数据包格式：Etag: "flask 以及 X-Powered-By: Flask

   ![image-20260130213333374](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130213333374.png)

### Tornado

1. 识别插件

   ![image-20260130214108432](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130214108432.png)

2. 固定的数据包格式：Server: TornadoServer

   ![image-20260130214149839](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130214149839.png)

## JavaScript-开发框架-Vue&Node.js

### Vue

1. 识别插件

   ![image-20260130214327171](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130214327171.png)

2. JS语法和加载文件

   ![image-20260130214419657](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130214419657.png)

### Node.js

1. 识别插件

   ![image-20260130214537754](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130214537754.png)

2. 固定的数据包格式：ETag: W/"

   ![image-20260130214551179](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130214551179.png)

## PHP-开发框架-ThinkPHP&Laravel&Yii

### ThinkPHP

1. 识别插件

   ![image-20260130215039262](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130215039262.png)

2. X-Powered-By: ThinkPHP

   ![image-20260130215205157](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130215205157.png)

3. CMS识别到源码体系TP开发


### Laravel

1. 识别插件

   ![image-20260130215303733](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130215303733.png)

2. Set-Cookie中特征的格式 XSRF-TOKEN= 以及 laravel_session= 

   ![image-20260130215417368](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130215417368.png)

### Yii

1. 识别插件

   ![image-20260130215521593](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130215521593.png)

2. Set-Cookie中特征的格式 YII_CSRF_TOKEN= 

   **找了部分网站，数据包中没有明显特征，但是发现了每次会加载yii.js文件。**

   ![image-20260130215924063](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130215924063.png)

## Java-框架组件-Fastjson&Shiro&Solr&Spring

52类110个主流Java组件和框架介绍：

https://blog.csdn.net/agonie201218/article/details/125300729

### 框架

#### Struts2

一般使用struts2框架后缀带do或action，可以尝试进行利用。

![image-20260130224932377](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130224932377.png)

#### SpringBoot

1. 默认web应用标签小绿叶图标，很经典，就不展示了。

2. 通过springboot框架默认页面

   ![image-20260130223812136](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130223812136.png)

3. ICO源码体系采用SpringBoot开发

### 组件

#### FastJson/Jackson

```
在提交JSON数据包中修改测试：

-FastJson组件会把01解析成1

-Jackson组件在解析01时会抛出异常

https://forum.butian.net/share/1679
```

#### Shiro

```
请求包的cookie中存在rememberMe字段。

返回包中存在set-Cookie：remeberMe=deleteMe。

请求包中存在rememberMe=x时，响应包中存在rememberMe=deleteMe。

有时候服务器不会主动返回remeberMe=deleteMe，直接发包即可，将Cookie内容改为remember Me=1，若相应包有rememberMe=deleteMe，则基本可以确定网站apache shiro搭建的。
```

![image-20260130222653851](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260130222653851.png)

#### Solr识别

一般开放8983端口,访问页面也可以探针到。

# 工具使用

https://github.com/projectdiscovery/nuclei

POC也可以在GitHub中进行搜索。

既能指纹识别也能漏洞扫描。
