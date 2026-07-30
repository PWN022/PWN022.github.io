---
title: PHP应用&Cookie脆弱&Session固定&Token唯一&身份验证&数据库通讯
published: 2026-02-05 12:00:00
description: PHP的三种验证方式以及安全隐患，两个（Cookie脆弱、Session固定）案例。
tags: [Web开发,PHP]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-原生PHP-数据库通讯
2. 安全开发-原生PHP-身份验证技术
3. 安全开发-Cookie&Session&Token
4. 安全开发-原生PHP-代码审计案例

## 具体安全知识点

```
Cookie和Session都是用来在Web应用程序中跟踪用户状态的机制
1、存储位置不同：
Cookie是存储在客户端（浏览器）上的，而Session是存储在服务器端的。
2、安全性不同：
Cookie存储在客户端上，可能会被黑客利用窃取信息，而Session存储在服务器上，更加安全。
3、存储容量不同：
Cookie的存储容量有限，一般为4KB，而Session的存储容量理论上没有限制，取决于服务器的硬件和配置。
4、生命周期不同：
Cookie可以设置过期时间，即便关闭浏览器或者重新打开电脑，Cookie仍然存在，直到过期或者被删除。而Session一般默认在浏览器关闭后就会过期。
5、访问方式不同：
Cookie可以通过JavaScript访问，而Session只能在服务器端进行访问。
6、使用场景不同：
Cookie一般用于存储小型的数据，如用户的用户名和密码等信息。而Session一般用于存储大型的数据，如购物车、登录状态等信息。
总之，Cookie和Session都有各自的优缺点，选择使用哪一种方式，取决于具体的应用场景和需求。一般来说，如果需要存储敏感信息或者数据较大，建议使用Session；如果只需要存储少量的数据，并且需要在客户端进行访问，可以选择使用Cookie。

在Web应用程序中，使用token和不使用的主要差异在于身份验证和安全性。
1.身份验证：采用token机制的Web应用程序，用户在登录成功后会收到一个token，这个token可以在每次请求时发送给服务器进行身份验证。而不采用token机制的Web应用程序，一般会使用session机制来保存用户登录状态，服务器会在用户登录成功后创建一个session，之后的每个请求都需要在HTTP头中附带这个session ID，以便服务器能够验证用户身份。
2、安全性：采用token机制的Web应用程序，在服务器上不会存储用户的登录状态，只需要存储token即可。因此，即使token被盗取，黑客也无法获得用户的密码或者其他敏感信息。而不采用token机制的Web应用程序，一般会在服务器上存储用户的登录状态，因此如果服务器被黑客攻击，黑客可能会获得用户的敏感信息。
3、跨域访问：采用token机制的Web应用程序，在跨域访问时，可以使用HTTP头中的Authorization字段来传递token信息，方便实现跨域访问。而不采用token机制的Web应用程序，在跨域访问时，需使用cookie或session来传递用户身份信息，比较麻烦。
总之，采用token机制可以提高Web应用程序的安全性，并且方便实现跨域访问。不过，使用token机制也需要开发者自己来实现身份验证和token的生成和验证，相对来说比较复杂。而不采用token机制，使用session机制则相对简单，但是安全性相对较低。因此，具体采用哪种机制，需要根据实际情况进行权衡和选择。
```

## 安全开发-原生PHP-数据库通讯

### 数据库操作-后台登录验证用户

```
login.php->index.php
```

config.php

![image-20260204203551362](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204203551362.png)



login.php

![image-20260204204017336](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260204204017336.png)

index.php

一个单纯的欢迎界面。

由这里引出下文，因为如果在没有进行任何验证的情况下，那我们通过某种方式，比如扫描到该站存在index.php或者其他文件，是不是直接在url修改地址即可进行访问，无需尝试去登录？亦或者在index中，把login的逻辑拿到这里再次使用是不是非常的不方便？

所以接下来就是安全开发中的一些验证方式。

## 安全开发-Cookie&Session&Token

### Cookie验证-后台登录

**特征：身份验证-Cookie使用，存储在本地浏览器，存活时间长**

#### 生成cookie的原理图过程

```
1、客户端向服务器发送HTTP请求。
2、服务器检查请求头中是否包含cookie信息。
3、如果请求头中包含cookie信息，则服务器使用该cookie来识别客户端，否则服务器将生成一个新的cookie。
4、服务器在响应头中设置cookie信息并将其发送回客户端。
5、客户端接收响应并将cookie保存在本地。
6、当客户端发送下一次HTTP请求时，它会将cookie信息附加到请求头中。
7、服务器收到请求并检查cookie的有效性。
8、如果cookie有效，则服务器响应请求。否则，服务器可能会要求客户端重新登录。
```

```
loginc.php->dashboardc.php->loginc_out.php
```

在loginc.php中主要代码为：

![image-20260205101944467](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205101944467.png)

在dashboardc.php中主要代码为：

![image-20260205102015168](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205102015168.png)

带cookie登录成功：

![image-20260205102916367](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205102916367.png)

loginc_out.php清除cookie之后重定向到loginc.php：

![image-20260205104333598](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205104333598.png)

### Session验证-后台登录

**特征：存储在服务端，存活时间短，比较安全(有时候登录系统一段时间没操作，在回来就发现需要重新登录)**

#### 身份验证-Session使用

```
1、客户端向服务器发送HTTP请求。
2、服务器为客户端生成一个唯一的session ID，并将其存储在服务器端的存储器中（如文件、数据库等）。
3、服务器将生成的session ID作为一个cookie发送给客户端。
4、客户端将session ID保存为一个cookie，通常是在本地浏览器中存储。
5、当客户端在发送下一次HTTP请求时，它会将该cookie信息附加到请求头中，以便服务器可以通过该session ID来识别客户端。
6、服务器使用session ID来检索存储在服务器端存储器中的与该客户端相关的
```

```
logins.php->dashboards.php->logins_out.php
```

logins.php改为：

```php
 if (mysqli_num_rows($data) > 0) {
        session_start();
        $_SESSION['username'] = $user;
        $_SESSION['password'] = $pass;
        header('Location: dashboards.php');
        exit();
    } else {
        // 设置一个变量，用于前端JavaScript显示错误消息
        $login_error = true;
    }
```

dashboards.php中添加一个：

```php
session_start();
```

logins_out.php销毁session：

```php
<?php
session_start();

session_unset();
session_destroy();

header("location:logins.php");
exit();
```

![image-20260205105934851](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205105934851.png)

已登录的情况下session中存储的数据：

![image-20260205110302306](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205110302306.png)

当用户退出后，`session`文件会删除或者里面清空数据(这个`session`就相当于用户的`ID`值，只有登录成功后才会往里面写凭证。登录失败，里面是没有任何凭证数据，就只是一个`ID`值)

### Session+Token防爆破登录

#### 唯一性判断-Token使用

```
1、生成Token并将其存储在Session
2、生成Token并将其绑定在Cookie触发
3、尝试登录表单中带入Token验证逻辑
4、思考Token安全特性
```

```
loginst.php->logincheck.php->indexst.php->loginst_out.php
```

loginst.php：

```php
<?php
// login.php
include 'config.php';

//1.因为是用的session维持会话，token已经绑定到下面的表单了
//2.token，生成之后直接存到session中，主要是方便重置token
//3.每次token随表单提交之后都需要重置保持token的唯一性

$_SESSION['token'] = bin2hex(random_bytes(32));
?>
```

configs.php：

```php
<?php

session_start();
if (empty($_SESSION['token'])) {
    //生成一个32位token
    $_SESSION['token'] = bin2hex(random_bytes(32));
}


define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '111111');
define('DB_NAME', 'phpdemo');

?>
```

logincheck.php：

```php
<?php
include 'configs.php';
$conn=mysqli_connect(DB_HOST,DB_USER,DB_PASS,DB_NAME);
$user=@$_POST['username'];
$pass=@$_POST['password'];
$token = @$_POST['token'];

$sql="select * from users where username='$user' and password='$pass';";
$data=mysqli_query($conn,$sql);

if($_SERVER["REQUEST_METHOD"] == "POST"){
    if (empty($token) || $token!== $_SESSION['token']) {
        echo '<script>alert("Token 无效！")</script>';
        header('location: loginst.php');
        exit();
    }
    //判断用户登录成功
    if(mysqli_num_rows($data) > 0){
        session_start();
        $_SESSION['username']=$user;
        $_SESSION['password']=$pass;
        $_SESSION['token'] = bin2hex(random_bytes(32));
        header('Location: loginst.php');
        exit();
    }else{
        //判断用户登录失败
        echo '<script>alert("登录失败!")</script>';
        header("refresh:0;url=loginst.php");
        exit();
    }
}


?>
```

token的意义：每次表单刷新都会生成一个新的token，token也会直接写入到服务器的session中。

逻辑：服务器先校验token是否正确，正确后再进行账号密码的判断，因此这里可以有效的防止爆破行为。

![image-20260205112442340](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205112442340.png)

## 安全开发-原生PHP-代码审计案例

### XHCMS Cookie脆弱

![image-20260205115304412](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205115304412.png)

![image-20260205115321050](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205115321050.png)

![image-20260205115331912](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205115331912.png)

![image-20260205115348728](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205115348728.png)

主要代码：

```php
//checklogin.php
$user=$_COOKIE['user'];
if($user==""){
    //user为空就跳回登录
    header("location: ?r=login");
    exit();
}


//检验cookie中是否包含user的值
//默认登陆的时候抓包可以看到cookie中的数据为：
Cookie: username=xiaodigaygay
//修改cookie值即可绕过（参考下图）：
Cookie: user=任意值即可
```

![image-20260205115409505](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205115409505.png)

![image-20260205115503322](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205115503322.png)

### YXCMS Session固定

参考文章：https://xz.aliyun.com/t/2025

攻击者：

![image-20260205115633749](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205115633749.png)

正常管理员：

![image-20260205115643632](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205115643632.png)

![image-20260205115706310](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205115706310.png)

攻击者诱使正常管理员访问该地址（附带的是攻击者的session）：

![image-20260205115717846](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205115717846.png)

![image-20260205120907135](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205120907135.png)

之后攻击者就可以进入到后台。

漏洞位置：`protected\include\lib\common.function.php`

![image-20260205121324957](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205121324957.png)

如果session_id存在，则使用session_id方法将其设置为当前会话的id。 并且session_id可以通过requests方法得到。

再举例：管理员为a，攻击者为b。

此时b只是普通账户，a进行访问恶意链接之后，代码中接收到了session值，此时b的账户就变成了管理员，而a就是普通账户。

```php
function session($name='',$value = '') {
     if(empty($name)){
         return $_SESSION;
     }
    // 接收request传参过来的sessionid
     $sessionId = request('request.sessionid');
     if(!empty($sessionId)){
         session_id($sessionId);
     }
     if(!isset($_SESSION)){
         session_starts();
     }
     if($value === ''){
         $session = $_SESSION[$name];
     }else if($value==null){
         unset($_SESSION[$name]);
     }else{
         $session = $_SESSION[$name] = $value;
     }
     return $session;
}
```

request：封装从不同来源（POST、GET、SESSION、COOKIE、REQUEST）获取参数的逻辑，提供统一的接口。

![image-20260205122319540](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205122319540.png)
