---
title: HTTP抓包
published: 2025-10-05
description: 了解HTTP包的构造。
tags: [抓包,基础入门]
category: 网络安全
draft: false
---

# HTTP包&Postman

# 简要

先来贴几张图认识一下HTTP包的是怎么构成的：

**Request：**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/10-1.png)

------

**Response：**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/10-2.png)

------

**http请求-post请求：**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/10-03.png)

------

**http请求-get请求：**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/10-04.png)

&请求方法&请求头修改&状态码判断

# 数据-方法&头部&状态码

## 方法

1. 常规请求-Get
2. 用户登录-Post

- get：向特定资源发出请求（请求指定页面信息， 并返回实体主体）。
- post：向指定资源提交数据进行处理请求（提交表单、上传文件），又可能导致新的资源的建立或原有资源的修改。
- head：与服务器索与 get 请求一致的相应， 响应体不会返回，获取包含在小消息头中的原信息（与 get 请求类似，返回的响应中没有具体内容，用于获取报头）。
- put：向指定资源位置上上传其最新内容（从客户端向服务器传送的数据取代指定文档的内容），与 post 的区别是 put 为幂等，post 为非幂等。
- trace：回显服务器收到的请求，用于测试和诊断。trace 是 http8 种请求方式之中最安全的。
- delete：请求服务器删除 request-URL 所标示的资源（请求服务器删除页面）。
- option：返回服务器针对特定资源所支持的 HTML请求方法或web服务器发送测试服务器功能（允许客户端查看服务器性能）。
- connect ： HTTP/1.1 协议中能够将连接改为管道方式的代理服务器。

 

## 参数

演示：（无图，很基本的东西）

1. UA 头-设备平台：利用burp在模拟器抓取任意站的包，在PC端也同样，之后把抓到的内容替换为在模拟器抓到的数据包。
2. Cookie-身份替换：利用已登录/有权限账户的cookie数据包覆盖到一个未注册/无相关权限的数据包。

 

## Response 状态码

1. 数据是否正常
2. 文件是否存在
3. 地址自动跳转
4. 服务提供错误

### 容错处理识别

- 1xx:指示信息—表示请求已接收， 继续处理。
- 2xx:成功—表示请求已经被成功接收、理解、接受。
- 3xx:重定向—要完成请求必须进行更进一步的操作。
- 4xx:客户端错误—请求有语法错误或请求无法实现。
- 5xx:服务器端错误—服务器未能实现合法的请求。
- 200 OK：客户端请求成功。
- 301 redirect：页面永久性移走，服务器进行重定向跳转。
- 302 redirect：页面暂时性移走，服务器进行重定向跳转，具有被劫持的安全风险。
- 400 BadRequest：由于客户端请求有语法错误，不能被服务器所理解。
- 401 Unauthonzed：请求未经授权。
- 403 Forbidden：服务器收到请求，但是拒绝提供服务。
- 404 NotFound：请求的资源不存在，例如，输入了错误的URL。
- 500InternalServerError：服务器发生不可预期的错误，无法完成客户端的请求。
- 503 ServiceUnavailable：服务器当前不能够处理客户端的请求。

### 以文件判断

- 200 文件存在

- 404 文件不存在

- 403 文件夹存在

- 500 可能存在或不存在

- 3xx 可能存在或不存在

  3xx存在两种状况：

  1. 程序员的容错处理，网站访问错误就自动跳转某个页面，这种情况是文件不存在。
  2. 访问某个文件，触发自动跳转，这种情况是文件存在。

# POSTMAN

发包工具，不多作介绍，详细操作可以直接搜相关内容，这里不做演示。

