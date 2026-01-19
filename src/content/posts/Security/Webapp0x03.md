---
title: Web应用&蜜罐系统&堡垒机运维&API内外接口&第三方拓展架构&部署影响
published: 2026-01-19
description: 蜜罐系统对测试人员的有害影响：比如钓鱼或者浪费测试人员的时间。堡垒机被打穿后，测试人员能拿到的信息：比如内网拓扑结构（资产列表、网络分段、开放端口），又或者说一些资产的账号、密码、密钥等等。内外API接口：内部api的一些命名规律，比如v1(版本号)/api/具体功能，请求该api能获取的信息等等，外部api更多的是对开发者信息或者权限的渗透。最后就是第三方拓展件（消息队列、缓存等），这些开放的越多，测试人员根据一些版本漏洞等等，所能挖到漏洞的机会也越多。
tags: [基础入门,Web应用]
category: 网络安全
draft: false
---

# 知识点

1. [基础入门-Web应用-蜜罐系统](#蜜罐系统)
2. [基础入门-Web应用-堡垒机运维](#堡垒机运维)
3. [基础入门-Web应用-内外API接口](#内外API接口)
4. [基础入门-Web应用-第三方拓展架构](#第三方拓展架构)

## 蜜罐系统

蜜罐(红蓝对抗)：https://hfish.net/，HFish之前也进行搭建过，根据官方文档操作即可。

测试系统：Ubuntu 20.04。

一键安装：bash <(curl -sS -L https://hfish.net/webinstall.sh)。

**有害影响：用来钓鱼或诱惑测试人员的防护系统。**

### 演示案例0

![image-20260119164841885](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260119164841885.png)

![image-20260119164924767](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260119164924767.png)

## 堡垒机运维

堡垒机(等保)：https://www.jumpserver.org/

测试系统：Ubuntu 20.04

一键安装：curl -sSL https://resource.fit2cloud.com/jumpserver/jumpserver/releases/latest/download/quick_start.sh | bash

**有利影响：Web应用或其他应用提供给测试人员一个能获取到价值信息的系统**

### 演示案例1

部署之后会有默认的账号密码，此时就可以放入一些资产信息等。

![image-20260119171302024](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260119171302024.png)

## 内外API接口

API接口：是一个允许不同软件应用程序之间进行通信和数据交换的接口。API定义了一组规则和协议，软件开发者可以使用这些规则和协议来访问操作系统、库、服务或其他应用程序的功能。

1. Web API：

   通过HTTP协议进行通信的API，常用于Web服务和应用程序。

   例如，RESTful API、GraphQL API。

2. 库和框架API：

   提供特定编程语言或框架功能的API，供开发者在应用程序中使用。

   例如，Java API、Python标准库。

3. 操作系统API：

   提供操作系统功能访问的API。

   例如，Windows API、POSIX API。

4. 远程API：

   允许在网络上远程访问服务的API。

   例如，SOAP API、XML-RPC API。

有利影响：

内部API：Web应用提供给测试人员一个能获取到价值信息的接口。

外部API：可以借助提供的API获取到当前网站不想让你获取的信息。

**分析API的目录结构、接口命名规则、参数命名规则、功能和业务逻辑等，根据这些信息可以进行接口枚举和参数枚举，进而可以进行相关的漏洞测试。**

### 解释 

- 内部API：比如我自己开发了一个收银系统，使用API接口可以查询到顾客数据、收入支付、销售提成等。

  登录接口=爆破密码

  用户信息=枚举其他用户信息

  文件上传=上传后门

  票据交易=泄露敏感信息等

- 外部API：比如我自己搭建了一个网站应用，功能需求有要借助到外部的资源，如地图、归属地、短信收发、支付等。

### 演示案例2

#### 内部API

![image-20260119172844348](C:\Users\C311S\AppData\Roaming\Typora\typora-user-images\image-20260119172844348.png)

![](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260119173021451.png)

#### 外部API

外部API其实就是调用其他厂商的一些功能接口。这里就不多做展示，因为基本都有API文档。

## 第三方拓展架构

拓展应用：防火墙 消息队列 分布式等。

ActiveMQ Redis Memcache Jenkins等漏洞

https://mp.weixin.qq.com/s/SEjxrUgiIIK2bveSBz6mTg

https://www.yuque.com/u25571586/dyaqbugs?# 密码：xnzx

**有利影响：搭建越多应用即方便了运维也提供给测试人员更多机会。**
