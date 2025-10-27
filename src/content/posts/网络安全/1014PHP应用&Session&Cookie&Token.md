---
title: PHP应用&Cookie&Session&Token
published: 2025-10-14
description: PHP身份验证Cookie&Session&Token的使用，BurpSuite验证token的唯一性。
tags: [PHP,安全开发]
category: 网络安全
draft: false
---

## 身份验证-**cookie**使用

### 生成**cookie**的原理图过程

图片来源：https://blog.csdn.net/m0_74930529/article/details/143134020

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/23-01.png" style="zoom:67%;" />

1. 客户端向服务器发送**HTTP**请求。
2. 服务器检查请求头中是否包含**cookie**信息。
3. 如果请求头中包含**cookie**信息，则服务器使用该**cookie**来识别客户端，否则服务器将生成一个新的**cookie**。
4. 服务器在响应头中设置**cookie**信息并将其发送回客户端。
5. 客户端接收响应并将**cookie**保存在本地。
6. 当客户端发送下一次HTTP请求时，它会将**cookie**信息附加到请求头中。
7. 服务器收到请求并检查**cookie**的有效性。
8. 如果**cookie**有效，则服务器响应请求。否则，服务器可能会要求客户端重新登录。

### PHP中的使用方法

setcookie(): 设置一个 cookie 并发送到客户端浏览器。

unset(): 用于删除指定的 cookie。

### Cookie演示案例

详细见：https://blog.csdn.net/m0_74930529/article/details/143134020

主要就是**设置cookie**代码部分，需要用到$_SERVER函数来判断表单是否提交，防止没有提交登录但是仍然显示登录失败（需要加在$data下面）。

登录成功以后才开始设置cookie，因此代码如下：

```php
$sql="select * from admin where username='$user' and password='$pass';";
$data=mysqli_query($con,$sql);// 执行查询
if($_SERVER["REQUEST_METHOD"] == "POST"){
    // 判断用户登录成功
    if(mysqli_num_rows($data) > 0){
        $expire = time() + 60 * 60 * 24 * 30; // 一个月后过期，分别为秒、分、时、天
        setcookie('username', $user, $expire, '/');
        setcookie('password', $pass, $expire, '/');
        header('Location: index-c.php');
        exit();
    }else{
        // 判断用户登录失败
        echo '<script>alert("登录失败!")</script>';
    }
}
?>

```

**验证cookie**的代码部分：

```php
<?php
if($_COOKIE['username']!='admin' or $_COOKIE['password']!='123456'){
    header('Location: admin-c.php');
}
?>
```

**删除cookie**的代码部分：

```php
<?php
setcookie('username','',time() -3600 , '/');
setcookie('password','',time() -3600 , '/');
header('location:admin_c.php');
?>
```

## 身份验证-Session使用

### 生成session的原理图过程

图片来源：https://blog.csdn.net/m0_74930529/article/details/143134020

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/23-02.png" style="zoom:67%;" />

1. 客户端向服务器发送**HTTP**请求。
2. 服务器为客户端生成一个唯一的**sessionID**，并将其存储在服务器端的存储器中（如文件、数据库等）。
3. 服务器将生成的**session ID**作为一个**cookie**发送给客户端。
4. 客户端将**session ID**保存为一个**cookie**，通常是在本地浏览器中存储。
5. 当客户端在发送下一次**HTTP**请求时，它会将该**cookie**信息附加到请求头中，以便服务器可以通过该**session ID**来识别客户端。
6. 服务器使用**session ID**来检索存储在服务器端存储器中的与该客户端相关的**session**数据，从而在客户端和服务器之间共享数据。

### PHP中的使用方法

session_start(): 启动会话，用于开始或恢复一个已经存在的会话。

$_SESSION: 用于存储和访问当前会话中的所有变量。

session_destroy(): 销毁当前会话中的所有数据。

session_unset(): 释放当前会话中的所有变量。

Session 存储路径：PHP.INI中session.save_path设置路径（一般在phpstudy存储路径\phpstudy\phpstudy_pro\Extensions\php\php版本\PHP.INI）。

## cookie与session的不同点

1. **存储位置**
   cookie：存储在客户端（浏览器上）。

   session：存储在服务器端。

2. **安全性**
   cookie：由于存储在客户端上，容易被黑客利用窃取信息。

   session：存储在服务器上因此更加安全。

3. **存储容量**
   cookie：存储容量有限，一般为4KB。

   session：理论上没有限制，取决于服务器硬件及配置。

4. **生命周期**
   cookie：可以设置过期时间，过期才会被删除。

   session：默认浏览器关闭就过期。

5. **访问方式**
   cookie：可以通过JavaScript访问。

   session：只能在服务器端访问。

6. **使用场景**
   cookie：用于存储小型数据（用户名、密码等）。

   session：用于存储大型数据（购物车、登陆状态等）。

### Session演示案例

详细见：https://blog.csdn.net/m0_74930529/article/details/143134020

与cookie一样，在admin文件夹基础上新建admin-s.php（登录文件）、index-s.php（登录成功首页文件）、logout-s.php（登出文件）。

**启用session**的代码部分：

```php
$user=@$_POST['username'];
$pass=@$_POST['password'];
$sql="select * from admin where username='$user' and password='$pass';";
$data=mysqli_query($con,$sql);
if($_SERVER["REQUEST_METHOD"] == "POST"){
    if(mysqli_num_rows($data) > 0){
        session_start();
        $_SESSION['username']=$user;
        $_SESSION['password']=$pass;
        header('Location: index-s.php');
        exit();
    }else {
        //判断用户登录失败
        echo '<script>alert("登录失败!")</script>';
    }
```

**验证session**的代码部分：

```php
<?php
session_start();// 一定要记得先start，否则会报错
if($_SESSION['username']!='admin' or $_SESSION['password']!='123456'){
    header('Location: admin-s.php');
}
?>
```

**删除session**的代码部分：

```php
<?php
// 开始会话
session_start();
 
// 清除session变量，并销毁会话
session_unset();
session_destroy();
 
// 重定向到登录页面
header('Location: admin-s.php');
exit;
?>
```

### 如何判断是cookie还是session？

1. 看文件大小：规模大的肯定不会使用cookie。
2. 打开页面，等待10min或者30min以上，如果需要重新登录的，则为session。
3. 关闭浏览器，如果仍然可以登录则为cookie（但是也不一定，session规则可能不一定）。
4. F12查看cookie是否有ID。

## 唯一性判断-Token使用

1. 生成**Token**并将其存储在**Session**。
2. 生成**Token**并将其绑定在**Cookie**触发。
3. 尝试登录表单中带入**Token**验证逻辑。
4. 思考**Token**安全特性
   由于每次尝试登录时，都只会修改账号或者密码的值，但是却无法预知**token**的值，所以采用**token**可以限制爆破。
   和上面步骤一样，在admin文件夹下创建两个文件，token.php和token_check.php。

### Token演示案例

详细见：https://blog.csdn.net/m0_74930529/article/details/143134020

**生成token**代码部分：

```php+HTML
<?php
// 生成Token并将其存储在Session中
session_start();
// 1.因为是用的session维持会话，token已经绑定到下面的表单了
// 2.token生成之后直接存到session里，主要是方便重置token,
// 每次token随表单提交后都需要重置以保持token的唯一性。
$_SESSION['token'] = bin2hex(random_bytes(16));//此处的token是电脑随机生成的
setcookie('token',$_SESSION['token'],time() + 3600,'/');
// 如果加上setcookie这一句，那么在token_check.php中应该写成$token = $_COOKIE['token'] ?? '';如果没有则写成$token = $_POST['token'] ?? '';
?>

<!--此处为html部分代码-->
<!--    发送给token_check.php-->
 <form action="token_check.php" method="post">
<!--        隐藏token，不显示-->
        <input type="hidden" name="token" value="<?php echo $_SESSION['token'] ; ?>">
```

**验证token**代码部分：

```php
<?php
session_start();
$token = $_COOKIE['token'] ?? '';// 此处的token是用户输入的，如果没有设置则为空

if ($token!== $_SESSION['token']) {// session后的是电脑自动生成的
    // token不匹配，禁止访问
    header('HTTP/1.1 403 Forbidden');
    $_SESSION['token'] = bin2hex(random_bytes(16));
    echo 'Access denied';
    exit;
}else{
    // 重新刷新，防止和之前的对应上，如果对应上的话就可以一直爆破
    $_SESSION['token'] = bin2hex(random_bytes(16));
    if($_POST['username']=='admin' && $_POST['password']=='123456'){
        echo '登录成功!';
        echo '你是管理员可以访问文件管理页面！';
    }else{
        echo '登录失败！';
    }
}
?>
```

注意：在尝试登录的时候，应该将浏览器的插件全部关闭，否则**有的插件会重新访问一次网站（插件会调用访问网页的资源，相当于重新访问）**，导致电脑随机生成的token也被刷新，而用户输入产生的token不变，造成access denied的现象。

### 用bp来验证token的唯一性

详细见：https://blog.csdn.net/m0_74930529/article/details/143134020

其实这个案例想体现出来的就是因为登录是需要经过token验证，而token是一个不断变换的随机值，所以使用bp进行密码的爆破，就算最后爆破出来的密码是正确的但因为token的验证失败，所以结果也还会登陆失败。