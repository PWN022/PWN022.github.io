---
title: JS应用&原生开发&JQuery库&Ajax技术&安全验证处理
published: 2025-10-17
description: JS原生开发文件上传、JS引用jQ和Ajax进行开发以及一些相关安全问题。
tags: [JS,安全开发]
category: 网络安全
draft: false
---

# JS应用&原生开发&JQuery库&Ajax技术&前端后端&安全验证处理

JS：

功能：登录验证，文件操作，商品购买，数据库操作，云应用接入，框架开发等。

技术：原生开发， DOM 树，常见库使用 (JQuery) ，框架开发（Vue，Nodejs）等。

JQuery：

JQuery 是一个JavaScript库。

## JS 原生开发—文件上传—变量&对象&函数&事件

### JS判断文件上传案例1

1. 布置前端页面

1. JS获取提交数据

1. JS对上传格式进行判断

1. 后端对上传数据处理

   在phpstrom中创建一个文件夹JS，新建一个demo项目。

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>文件上传页面</title>
       <style>
           body {
               font-family: Arial, sans-serif;
               background-color: #f2f2f2;
               padding: 20px;
           }
           h1 {
               text-align: center;
               margin-top: 50px;
           }
           form {
               background-color: #fff;
               border-radius: 10px;
               padding: 20px;
               margin-top: 30px;
               max-width: 600px;
               margin: 0 auto;
           }
           input[type="file"] {
               margin-top: 20px;
               margin-bottom: 20px;
           }
           button {
               background-color: #4CAF50;
               color: #fff;
               padding: 10px 20px;
               border: none;
               border-radius: 5px;
               cursor: pointer;
           }
           button:hover {
               background-color: #3e8e41;
           }
       </style>
   </head>
   <body>
   <h1>文件上传</h1>
   <form action="upload.php" method="POST" enctype="multipart/form-data">
       <label for="file">选择文件:</label>
       <br>
       <input type="file" id="file" name="f" onchange="CheckFileExt(this.value)">
       <br>                        
   <!--用户点击会跳出弹窗（触发js）-->
       <button type="submit">上传文件</button>
   </form>
   </body>
   </html>
   ```

   ```js
   function CheckFileExt(filename)
       {
           var flag = false;
           var ext = ['jpg', 'png', 'jpeg'];
   
           var index = filename.lastIndexOf(".");// 截取.加上之后的部分
           var vet = filename.substr(index + 1);// 只取.后面的部分，也就是后缀
   
           for (i = 0; i < ext.length; i++) {
               if (vet == ext[i]) {
                   var flag = true;
                   alert("文件后缀正确！");
                   break;
   
               }
               if (!flag)
               {
                   alert("文件后缀错误！");
                   window.location.reload();// 相当于F5
                   break;
               }
   
           }
       }
   ```
   
   再搭配之前课程upload的php部分，即可实现带判断后缀的文件上传。
   
   ```php
   <?php
   $name = $_FILES['f']['name'];
   $type = $_FILES['f']['type'];
   $size = $_FILES['f']['size'];
   $tmp_name = $_FILES['f']['tmp_name'];
   $error = $_FILES['f']['error'];
   
   move_uploaded_file($tmp_name, 'upload/' . $name);
   
   ?>
   ```

### 网页源码修改

需要进行修改的源码保存到本地，之后在文件上传的action处把upload.php改为完整路径，将onchange事件删除就可以实现跳过检测。

但是我更倾向于使用bp进行抓包修改，此处不是重点就不演示了。

```html
<body>
<h1>文件上传</h1>
<form action="upload.php" method="POST" enctype="multipart/form-data">
    <label for="file">选择文件:</label>
    <br>
    <input type="file" id="file" name="f">
    <br>                        
<!--用户点击会跳出弹窗（触发js）-->
    <button type="submit">上传文件</button>
</form>
</body>
```

#### 安全问题

1. 过滤代码能看到分析绕过
2. 禁用 JS 或删除过滤代码绕过

## JS 导入库开发—登录验证—JQuery库&Ajax技术

1. 布置前端页面
2. 获取登录事件
3. 配置 Ajax 请求
4. 后端代码验证
5. 成功回调判断

后端 PHP 进行帐号判断，前端 JS 进行登录处理。

### JQ登录案例1

大部分都是可以通过文档查询可以了解到函数的作用，或者现在一般都让ai帮忙解析代码是什么意思。所以这里就不做过多说明。

前端部分：

使用$.button进行传参，使用$ajax时data的数据必须是接受class表单。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="js/jquery-3.7.1.js"></script> <!-- 调用jq -->
</head>
<body>
<div class="login">
    <h2>后台登录</h2>
    <label for="username">用户名:</label>
    <input type="text" name="username" id="username" class="User" >
    <label for="password">密码:</label>
    <input type="password" name="password" id="password" class="Pass" >
    <button>登录</button>
</div>
</body>
<script>
    $("button").click(function (){
        $.ajax({
            type: 'POST',
            url: 'logincheck.php',
            data: {  // data为一个列表
                myuser:$('.User').val(),    // user是上面的表单值，val（）是返回表单的值
                mypass:$('.Pass').val()
            },
            success: function (res){    // success请求成功时执行的回调函数
                // res是回调logincheck.php中的success
                console.log(res);           // console.log进行调试判断
                if(res['infoCode']==1){     // infoCode信息代码与logincheck.php进行比较
                    alert('登录成功');
                    //登录成功处理事件
                    location.href='upload.php';   // 跳转到后台界面
                }else{
                    alert('登录失败');
                    window.location.reload();
                }
            },
            dataType: 'json',   // 处理的数据类型使用json是因为处理的是列表
        });

    });
</script>
</html>
```

php部分：

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/28-01.png" style="zoom:67%;" />

```php
<?php
$user = $_POST['myuser'];
$pass = $_POST['mypass'];
// 真实情况需要在数据库获取
$success = array('msg' => 'ok');    // 数据提交成功的意思
if ($user == 'user1' && $pass == '123456') {
    $success['infoCode'] = 1;   // 信息代码
    // echo '<script>location.href="index.php";</script>';
} else {
    $success['infoCode'] = 0;
}
echo json_encode($success);


// msg和infoCode都使用console进行调试
```

#### 安全问题

js中的location.href='index.php'。

```php
 if(res['infoCode']==1){     // infoCode信息代码与logincheck.php进行比较
                    alert('登录成功');
                    //登录成功处理事件
                    location.href='upload.php';   // 跳转到后台界面
```

通过burp抓包，之后把抓到的数据选择Do intercept —>Response to this request(将返回包也发回来），之后再放行当前输入账号密码的界面，放行之后这时返回包的内容就出现了，可以看到：{“msg”:"ok","infoCode":0}，直接把里面的infoCode的值改为1就登录成功。

![image-20251017110055567](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/28-02.png)

![image-20251017110121315](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/28-03.png)

#### 解决方法

将处理逻辑location.href="upload.php"写到logincheck.php安全

`echo '<script>location.href="upload.php";</script>';`

```php
<?php
$user=$_POST['myuser'];
$pass=$_POST['mypass'];
//真实情况需要在数据库获取
$success=array('msg'=>'ok');
if($user=='xiaodi' && $pass=='123456'){
    $success['infoCode']=1;
    echo '<script>location.href="upload.php";</script>';
}else{
    $success['infoCode']=0;
}
echo json_encode($success);
```

## JS 导入库开发—逻辑购买—JQuery库&Ajax技术

这部分以及后面的真实案例部分就不具体展示了。因为内容都是差不多的，主要原因都是数据包的返回造成的安全影响。

详细见：https://blog.csdn.net/m0_74930529/article/details/143725460

## 老演员的真实案例1

详细见：https://blog.csdn.net/m0_74930529/article/details/143725460
