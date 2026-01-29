---
title: Web应用&JS架构&URL提取&数据匹配&Fuzz接口&WebPack分析&自动化
published: 2026-01-29 12:00:00
description: JS的信息收集（接口URL、敏感信息等）和安全问题（源码泄漏，代码审计，JS逆向分析）。以及如何获取价值信息：手工提取url、半自动（Burp中的一些插件，比如HAE、APIFinder等）、工具（JsFinder、ffuf等等）。
tags: [信息收集,Web应用]
category: 网络安全
draft: false
---

# 知识点

1. 信息收集-Web应用-JS提取分析-人工&插件&项目
2. 信息收集-Web应用-JS提取分析-URL&配置&逻辑

| **标签**    | **名称**               | **地址**                                                 |
| ----------- | ---------------------- | -------------------------------------------------------- |
| FUZZ测试    | ffuf                   | https://github.com/ffuf/ffuf                             |
| 匹配插件    | Hae                    | https://github.com/gh0stkey/HaE                          |
| JS提取      | JSFinder               | https://github.com/Threezh1/JSFinder                     |
| JS提取爬虫  | URLFinder              | https://github.com/pingc0y/URLFinder                     |
| WebPack分析 | Packer-Fuzzer          | https://github.com/rtcatc/Packer-Fuzzer                  |
| JS匹配插件  | BurpAPIFinder          | https://github.com/shuanx/BurpAPIFinder                  |
| JS提取      | LinkFinder             | https://github.com/GerbenJavado/LinkFinder               |
| WebPack分析 | jjjjjjjjjjjjjs         | https://github.com/ttstormxx/jjjjjjjjjjjjjs              |
| JS提取爬虫  | FindSomething          | https://github.com/momosecurity/FindSomething            |
| JS匹配插件  | Unexpected_information | https://github.com/ScriptKid-Beta/Unexpected_information |
| FUZZ字典    | 字典集合               | https://wordlists.assetnote.io                           |

```
在日常渗透测试中，从JavaScript(JS)文件中提取信息是一项关键的步骤，以往有些案例就是通过JS文件中发现的敏感信息从而拿下重要的系统。
在JS开发的WEB应用和PHP,JAVA,NET等区别在于即没有源代码，也可以通过浏览器的查看源代码获取部分源代码逻辑。
从而获取URL，获取JS敏感信息，获取代码传参等，所以相当于JS开发的WEB应用大部分属于白盒测试（默认有大量源码参考），一般会在JS中寻找更多的URL地址，在JS代码逻辑（加密算法，APIkey配置，验证逻辑等）进行后期安全测试。
```

## JS信息收集

接口URL提取

后端地址提取

敏感信息提取

配置信息提取

其他信息提取（环境，注释，用途等）

### JS安全问题

源码泄漏，代码审计，JS逆向分析

未授权访问=JS里面分析更多的URL访问确定接口路径

敏感Key泄漏=JS文件中配置接口信息（云应用，短信，邮件，数据库等）

API接口安全=（代码中加密提交参数传递，更多的URL路径）

### 流行的Js框架有那些？

Vue NodeJS jQuery Angular等

### 如何判定JS开发应用？

插件wappalyzer

源程序代码简短

引入多个js文件

一般有/static/js/app.js等顺序的js文件

一般cookie中有connect.sid

### 如何获取更多的JS文件？

手工-浏览器搜索

半自动-Burpsuite插件

工具化-各类提取&FUZZ项目

### 如何快速获取价值信息？

```
src=

path=

method:"get"

http.get("

method:"post"

http.post("

$.ajax

http://service.httppost

http://service.httpget
```

## 案例

### 人工JS中提取URL信息

![image-20260129094624681](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129094624681.png)

### 从JS中提取到URL信息

#### JsFinder

![image-20260129101717080](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129101717080.png)

### 从JS中提取到敏感信息/配置信息

#### HAE

只看数据包。

![image-20260129105654979](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129105654979.png)

#### Unexpected_information

从HAE搭配这个可以发现，里面存有敏感信息。

![image-20260129110007451](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129110007451.png)

#### BurpAPIFinder

只看接口中的敏感信息。

![image-20260129105800124](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129105800124.png)

#### FindSomething

![image-20260129105902811](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129105902811.png)

### 从JS中Fuzz提取到更多

#### ffuf

命令：

```
ffuf.exe -w 字典 -u url/js文件存放处/FUZZ
```

![image-20260129111656539](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129111656539.png)

### WebPack打包器信息获取

#### Packer-Fuzzer

![image-20260129112752777](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129112752777.png)

![image-20260129112916389](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129112916389.png)

首先安装依赖：

```
pip install requirements.txt
```

安装依赖之后，还可能出现以下问题：

Packer-Fuzzer 使用了 `python-docx` 库来生成Word报告，但您安装的版本可能：

1. 版本太新（不兼容旧代码）
2. 版本太旧（缺少某些函数）
3. 安装的包名错误

我之前使用过这款工具感觉还不错，但是现在也不是很推荐了。所以之后的演示就放小迪的过程吧。

命令：

```
python PackerFuzzer.py -u 目标
```

![image-20260129113219811](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129113219811.png)

![image-20260129113239982](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129113239982.png)

![image-20260129113259131](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129113259131.png)

不得不提一嘴，经典佩恩头像。

#### jjjjjjjjjjjjjs

![image-20260129113423859](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129113423859.png)

![image-20260129113531453](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129113531453.png)

另外，检测出来的map文件，可以直接进行访问下载（源代码）。

后续可进行逆向。

![image-20260129113918187](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260129113918187.png)

## 项目插件工具

```
https://github.com/ffuf/ffuf
用Go编写的快速 Web 模糊测试程序。
 
https://github.com/gh0stkey/HaE
HaE是一款网络安全（数据安全）领域下的框架式项目，采用了乐高积木式模块化设计理念，巧妙地融入了人工智能大模型辅助技术，实现对HTTP消息（包含WebSocket）精细化的标记和提取。
 
https://github.com/Threezh1/JSFinder（一般）
一款用作快速在网站的js文件中提取URL，子域名的工具

https://github.com/pingc0y/URLFinder（还可以）
URLFinder是一款快速、全面、易用的页面信息提取工具
用于分析页面中的js与url,查找隐藏在其中的敏感信息或未授权api接口

https://github.com/rtcatc/Packer-Fuzzer
针对Webpack等前端打包工具所构造的网站进行快速、高效安全检测的扫描工具

https://github.com/shuanx/BurpAPIFinder
攻防演练过程中，我们通常会用浏览器访问一些资产，但很多未授权/敏感信息/越权隐匿在已访问接口过html、JS文件等，通过该BurpAPIFinder插件我们可以：
1. 发现通过某接口可以进行未授权/越权获取到所有的账号密码、私钥、凭证
2. 发现通过某接口可以枚举用户信息、密码修改、用户创建接口
3. 发现登陆后台网址
4. 发现在html、JS中泄漏账号密码或者云主机的Access Key和SecretKey
5. 自动提取js、html中路径进行访问，也支持自定义父路径访问 ...

https://github.com/GerbenJavado/LinkFinder
功能类似于JSFinder，但JSFinder好久没更新了。

https://github.com/ttstormxx/jjjjjjjjjjjjjs
针对webpack站点，爬取网站JS文件，分析获取接口列表，自动结合指纹识别和fuzz获取正确api根，可指定api根地址（针对前后端分离项目，可指定后端接口地址），根据有效api根组合爬取到的接口进行自动化请求，发现未授权/敏感信息泄露，回显api响应，定位敏感信息、敏感文件、敏感接口。支持批量模式。支持需认证接口自动尝试bypass。

https://github.com/momosecurity/FindSomething
该工具是用于快速在网页的html源码或js代码中提取一些有趣的信息的浏览器插件，包括请求的资源、接口的url，请求的ip和域名，泄漏的证件号、手机号、邮箱等信息。

https://github.com/ScriptKid-Beta/Unexpected_information
BurpSuite插件用来标记请求包中的一些敏感信息、JS接口和一些特殊字段，
防止我们疏忽了一些数据包，使用它可能会有意外的收获信息。
```

