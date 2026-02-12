---
title: PHP应用&代码执行&命令注入&RCE安全&数据解析&引发函数&CVE审计
published: 2026-02-12 12:00:00
description: 主要内容为RCE（远程代码/命令执行），列举了一些常见的代码执行和命令执行，三个案例（一个代码执行、两个命令执行）。
tags: [Web开发,PHP]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-原生PHP-RCE安全
2. 安全开发-原生PHP-代码执行&命令注入
3. 安全开发-原生PHP-代码审计案例

# RCE(远程代码/命令执行)

根据网站的业务方向来判断挖掘什么类型漏洞，

如果提供的是系统监控类的，比如监控应用程序、服务器、数据库等等，就优先查看是否包含RCE漏洞，

如果是文件管理类的，就优先考虑文件操作安全相关的漏洞（上传、下载、读取、删除、修改、便利、包含）。

## 代码执行

PHP 提供代码执行 (Code Execution) 类函数主要是为了方便研发人员处理各类数据，然而当研发人员不能合理使用这类函数时或使用时未考虑安全风险，则很容易被攻击者利用执行远程恶意的PHP代码，威胁到系统的安全。

eval，assert，preg_replace，create_function等

https://www.yisu.com/ask/52559195.html

https://www.jb51.net/article/264470.htm

### eval

```php
//代码为：
<?php
eval($_GET['c']);

//url访问：
http://ip:port/day7/codeexe.php?c=phpinfo();
```

### assert

```php
<?php
assert($_GET['c']);
//同上
```

### preg_replace

```php
<?php
//有版本限制，php版本要5.6以下，必须有/e才能执行。
preg_replace("/pregStr/e",$_GET['c'],"cmd_pregStr");
```

### create_function

```php
//'create_function' 已在 PHP 8.0 版本中被移除
create_function('$a,$b','return $a + $b;');
//这两个是相同的
function add($a,$b)
{
    return $a + $b;
}
```

```php
create_function('$a,$b',";}phpinfo();/*");
create_function('$a,$b',$_GET['c']);
```

容易导致代码执行的 PHP 函数：

```php
assert()
pcntl_exec()
array_fi lter()
preg_replace
array_map()
require()
array_reduce()
require_once()
array_diff_uassoc()
register_shutdown_function()
array_diff_ukey()
register_tick_function()
array_udiff()
set_error_handler()
array_udiff_assoc()
shell_exec()
array_udiff_uassoc()
stream_fi lter_register()
array_intersect_assoc()
system()
array_intersect_uassoc()
usort()
array_uintersect()
uasort()
array_uintersect_assoc()
uksort()
array_uintersect_uassoc()
xml_set_character_data_handler()
array_walk()
xml_set_default_handler()
array_walk_recursive()
xml_set_element_handler()
create_function()
xml_set_end_namespace_decl_handler()
escapeshellcmd()
xml_set_external_entity_ref_handler()
exec()
xml_set_notation_decl_handler()
include
xml_set_processing_instruction_handler()
include_once()
xml_set_start_namespace_decl_handler()
ob_start()
xml_set_unparsed_entity_decl_handler()
```

## 命令执行

为了方便处理相关应用场景的功能，PHP系统中提供命令执行类函数，如 exec()、system() 等。当研发人员不合理地使用这类函数，同时调用的变量未考虑安全因素时，容易被攻击者利用执行不安全的命令调用。

exec，system，passthru，popen，shell_exec，pcntl_exec，`等

### exec

```php
<?php
//只显示最后一行
echo exec('ver');
```

### system

```php
<?php
system('ipconfig');
```

### passthru

```php
<?php
echo passthru('whoami');
```

### popen

```php
<?php
$handle = popen($_GET['cmd'],'r');
$read = fread($handle,2096);
echo $read;
pclose($handle);
```

### shell_exec

```php
<?php
$output = shell_exec($_GET['cmd']);
echo $output;
```

### pcntl_exec

`括号

```php
<?php
$res = $_GET['cmd'];
echo `$res`;
```

### 文件包含引发命令执行

```php
//command.php中
<?php
require('1.txt');

//1.txt中
<?php
system('calc');
?>
```

### 代码执行引发命令执行

```php
//command.php中
<?php
eval($_GET['c'])
    
//url中
http://ip:port/day7/command.php?c=system(%27calc%27);
```

## 代码审计案例

### Yccms 代码执行

https://mp.weixin.qq.com/s/4i4MLsNAlMuLjySBc_rySw

![image-20260212105644006](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212105644006.png)

![image-20260212105706161](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212105706161.png)

![image-20260212105724666](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212105724666.png)

![image-20260212105740426](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212105740426.png)

![image-20260212105750325](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212105750325.png)

![image-20260212105800291](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212105800291.png)

### BJCMS 命令执行

https://blog.csdn.net/qq_44029310/article/details/125860865

![image-20260212111059712](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212111059712.png)

![image-20260212111123605](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212111123605.png)

![image-20260212111133365](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212111133365.png)

创建一个名为`&命令&.txt`，比如`&calc&.txt`，文件中随便写入内容这个不重要，主要是文件名，

之后提交文件即可。

![image-20260212111408032](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212111408032.png)

![image-20260212111421990](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212111421990.png)

![image-20260212111432263](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212111432263.png)

![image-20260212111459536](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212111459536.png)

![image-20260212111514439](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212111514439.png)

![image-20260212111532341](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212111532341.png)

![image-20260212111543359](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212111543359.png)

### WBCE 命令执行

https://developer.aliyun.com/article/1566395

![image-20260212112515519](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212112515519.png)

![image-20260212112522969](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212112522969.png)

![image-20260212112535776](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212112535776.png)

![image-20260212112603749](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212112603749.png)

![image-20260212112645779](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212112645779.png)

![image-20260212112659025](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260212112659025.png)

### CmsEasy 代码执行

https://xz.aliyun.com/t/2577

### D-Link 命令执行

https://xz.aliyun.com/t/2941

### 安恒明御安全网关

https://blog.csdn.net/smli_ng/article/details/128301954