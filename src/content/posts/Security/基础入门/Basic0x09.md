---
title: 传输加密&数据格式&编码算法&密文存储&代码混淆&逆向保护&安全影响
published: 2026-01-22 21:00:00
description: 本文主要内容：对传输数据的格式类型、加密算法、密码存储的算法做一个了解。以及在实战中也可能会遇到源代码被加密的情况，这时候就需要借助一些工具或者在线平台进行解密。
tags: [基础入门]
category: 网络安全
draft: false
---

# 知识点

1. [传输格式&数据-类型&编码&算法](#传输格式&数据-类型&编码&算法)
2. [密码存储&混淆-不可逆&非对称性](#密码存储&混淆-不可逆&非对称性)

## 传输格式&数据-类型&编码&算法

### 传输格式

JSON XML WebSockets HTML 二进制 自定义

WebSockets：聊天交互较常见（豆包等应用）

https://zhuanlan.zhihu.com/p/712032652

https://cloud.tencent.com/developer/article/1917215

二进制通常是以文件的形式出现的。

#### JSON格式

![image-20260122104521858](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122104521858.png)

#### XML格式

![image-20260122104548742](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122104548742.png)

#### HTML格式

![image-20260122104607710](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122104607710.png)

#### Websocket格式

一般都是交互式出现。

可以看到这个的url前面是wss，不是http或者https。

![image-20260122104830671](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122104830671.png)

文件上传：

https://www.cnblogs.com/wanglei1900/p/17177303.html

**影响：安全后渗透测试必须要统一格式发送**

### 传输数据

例：

MD5

Base64

自定义算法

加密或编码的情况：

1. 可逆向的：接受到id=5带入到数据处理逻辑之前一般会有解密或解码过程。服务器数据对比是明文（也有可能是密文）。

   aes、des、自定义、aes+base64等。

   一般：js逆向。

2. 不可逆向算法的：传输的数据采用的对比碰撞校验。服务器数据对比是密文。

**影响：安全后渗透测试必须要统一加密发送**

#### MD5

抓取小迪的zblog后台：http://xiaodi8.com/zb_system/login.php

![image-20260122112052349](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122112052349.png)

#### Base64

![image-20260122201502995](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122201502995.png)

#### 自定义算法

现在申通的返回结果不是自定义算法了，而是json格式。

只需要知道，对这种加密的进行测试时，首先识别是什么算法，之后可以进行逆向。

![image-20260122202724466](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122202724466.png)

## 密码存储&混淆-不可逆&非对称性

### 密码存储

例：

-ZBlog&Dz

-Win&Linux

-MSSQL&MYSQL

**影响：安全后渗透测试必须要做到算法解密**

#### ZBlog&Dz

##### MD5

![image-20260122204823144](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122204823144.png)

##### MD5+Salt

![image-20260122204955253](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122204955253.png)

![image-20260122205055231](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122205055231.png)

##### 自定义算法

方法就是搜索这些CMS平台的加密算法是什么样的，包括上面演示的MD5+Salt是discuz使用的加密方式。

![image-20260122205427081](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122205427081.png)

#### Win&Linux

Linux使用带 salt 的 SHA-512加密方式。

Windows：使用 NTLM（即 NT hash，密码 UTF-16LE 后做 MD4），同时也列出了 SHA-1。

![image-20260122210342328](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122210342328.png)

![image-20260122210631492](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122210631492.png)

#### MSSQL&MYSQL

### 代码混淆

例：

-PHP&JS混淆加密

-DLL&JAR代码保护

**影响：代码审计，逆向破解**

#### PHP&JS混淆加密

##### PHP

![image-20260122211214595](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122211214595.png)

源码可以利用PHP加密平台在线工具进行加密（在线搜索即可），如果出现这种情况就需要解密。

![image-20260122211548223](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122211548223.png)

##### JS

jsfuck.com

![image-20260122211924023](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122211924023.png)

## 总结

由上述内容发现还需那些内容学习：

1、加密算法的识别与解密

2、自定义算法的识别解密

