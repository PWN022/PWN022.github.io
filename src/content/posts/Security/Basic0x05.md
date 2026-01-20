---
title: 抓包技术&HTTPS协议&APP&小程序&PC应用&Web&证书信任&转发联动
published: 2026-01-20
description: 本文主要内容就是抓包软件的证书安装，以及利用这三款软件对Web、APP、小程序以及PC软件的一些步骤演示。
tags: [基础入门,Web应用,PC应用,移动端应用,Https,Http]
category: 网络安全
draft: false
---

# 知识点

1. 抓包技术-Web应用-http/s-Burp&Yakit
1. 抓包技术-APP应用-http/s-Burp&Yakit
1. 抓包技术-PC端应用-http/s-Burp&Yakit
1. 抓包技术-WX小程序-http/s-Burp&Yakit
1. 抓包技术-软件联动-http/s-Proxifier
1. 抓包技术-通用方案-http/s-ReqableApi
1. 抓包技术-其他工具-http/s-Fiddler&Charles

BurpSuite：
是用于攻击web 应用程序的集成平台，包含了许多工具。Burp Suite为这些工具设计了许多接口，以加快攻击应用程序的过程。所有工具都共享一个请求，并能处理对应的HTTP 消息、持久性、认证、代理、日志、警报。

Reqable：
https://reqable.com/
是一款跨平台的专业 HTTP 开发和调试工具，在全平台支持 HTTP1、HTTP2 和 HTTP3(QUIC)协议，简单易用、功能强大、性能高效，助力程序开发和测试人员提高生产力！说白了，他就是抓包工具 + Postman的合体，既可以抓包，又可以测试接口。

Yakit:
https://www.yaklang.com
Yakit 是一个基于 Yak 语言的安全领域垂直语言工具，它提供了一个图形化用户界面（GUI）来操控 Yak 引擎的能力。Yakit 旨在降低使用安全工具的门槛，使得安全从业者即使没有编程技能也能轻松地进行安全测试和分析。

Proxifier：
一款功能强大的网络代理工具，它可以让你将网络应用程序通过代理服务器进行连接。它提供了一个简单而灵活的方式，让你能够将任何应用程序的网络流量路由到指定的代理服务器上，从而实现匿名浏览、绕过网络封锁、访问受限网站等功能。

**注意：在进行抓包时，会遇到有代理检测或者证书校验的APP（一些Web也可能会有这种情况），这个在后期会讲到检测是哪种并且绕过，现在只做了解。**

**在多个软件联动抓包时，抓包工具基本都支持下游代理，也就是把数据包进行再次转发。**

# 准备工作

**提示：如果是本地装证书一定要装在受信任的根证书和中间两个选项里面。**

手机安装证书实际步骤与模拟器相同，本文仅展示本地以及模拟器安装过程。

## 本地/模拟器安装证书：解决本地抓HTTPS

### Burp

#### 电脑端

在burp导出证书之后，直接安装即可（受信任和中间都要安装）。

![image-20260120114440549](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120114440549.png)

![image-20260120114503295](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120114503295.png)

![image-20260120114602756](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120114602756.png)

#### 模拟器端

![image-20260120115706918](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120115706918.png)

![image-20260120115816186](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120115816186.png)

### yakit

#### 电脑端

![image-20260120115429402](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120115429402.png)

其他步骤与burp相同。

#### 模拟器端

只需要把证书的后缀改为cer，其他步骤与burp的安装相同。

## BurpSuite

### Web应用

Web应用：打开burpsuite，接着修改本地代理设置，就可以进行抓包（此处不做演示）。

### APP应用

手机端Web/APP：需要修改模拟器网络的代理设置。

### WX小程序

#### Proxifier

小程序抓包需要用到代理转发工具。

![image-20260120172719073](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120172719073.png)

![image-20260120172815091](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120172815091.png)

![image-20260120173154161](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120173154161.png)

![image-20260120175829862](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120175829862.png)

### PC软件

程序软件一般自带代理设置选项，没有代理设置的话跟抓包小程序是一样的，使用代理转发工具即可。

Proxifier代理转发设置跟在抓包小程序时是一样的。

## Yakit

**Yakit不仅仅是用来抓包，还有渗透测试的一些常规操作都能在软件当中实现。**

### Web应用

#### 免配置使用

如果是不想安装证书之类的，可以直接免配置启动一键运行就可以了。

![image-20260120181055476](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120181055476.png)

#### 安装证书设置代理使用

安装证书在文章上方演示过了，这里就演示一下正常使用软件进行抓包过程。

![image-20260120181321452](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120181321452.png)

![image-20260120181752432](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120181752432.png)

同样，该软件也和burp一样支持插件。

![image-20260120182013770](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120182013770.png)

![image-20260120182217802](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120182217802.png)

### WX小程序

小程序同样需要搭配代理转发工具，其他步骤与burp相同。

### APP应用

在模拟器使用Yakit抓包的步骤同burp。

**需要注意的是：在模拟器中设置网络一定是当前使用网络的IP，在Yakit中使用0.0.0.0可以监听主机所有网卡。**

### PC软件

同Burp。

## Reqable

更偏向数据包的API接口测试，跟其他联动起来就是完美了。

但是更简单，证书都是点击就安装，纯点鼠标的猴子。同时还支持脚本，利于后期JS逆向、API逆向等。

### Web应用

![image-20260120183526954](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120183526954.png)

![image-20260120183619537](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120183619537.png)

### APP应用

只需要修改模拟器的代理设置即可。

### WX小程序

打开就能抓取（太强了，都不需要代理转发）。

## 小结

PC端应用

1. 有代理设置走代理设置。
1. 没有代理设置走联动转发。

APP应用

1. 无防护-模拟器直接抓包。
2. 有防护-真机绕过&更改内核。
3. 有防护-证书绕过&代理绕过。

**注意：真机抓包要保证手机和电脑在同一网络。**

## 其他工具-http/s-Fiddler&Charles

这两款工具之前也用过，都是什么时候用到什么时候去查，使用频率也不高，因此就不做演示了。