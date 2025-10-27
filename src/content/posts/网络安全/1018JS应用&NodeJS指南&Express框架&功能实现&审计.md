---
title: JS应用&NodeJS指南&Express框架&功能实现&审计
published: 2025-10-18
description: NodeJS登录、文件上传开发、RCE，以及相关CTF题目和注入漏洞源码审计。
tags: [JS,安全开发]
category: 网络安全
draft: false
---

## 环境搭建-NodeJS-解析安装&库安装

文档参考以及下载：[Node.js 教程_w3cschool](https://www.w3cschool.cn/nodejs/)

### 三方库安装

express：Express 是一个简洁而灵活的 node.js Web 应用框架

body-parser：node.js 中间件，用于处理 JSON, Raw, Text 和 URL 编码的数据。

cookie-parser：这就是一个解析 Cookie 的工具。通过 req.cookies 可以取到传过来的 cookie ，并把它们转成对象。

multer：node.js 中间件，用于处理 enctype="multipart/form-data" （设置表单的 MIME编码）的表单数据。

mysql：Node.js 来连接 MySQL 专用库，并对数据库进行操作。
**安装命令：**
npm i express
npm i body-parser
npm i cookie-parser
npm i multer
npm i mysql

### 案例导入1

在js文件中创建一个sql.js，端口号随机，只要不占用的情况下随意。

```js
var express = require('express');
var app = express();
 
app.get('/', function (req, res) {
   res.send('Hello World');
})
 
var server = app.listen(3000, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})
```

使用node .\sql.js进行运行：

注意：无法运行时需要安装express库。命令：`npm i express` (会得到node modules)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/30-01.png)

## 功能实现—NodeJS—数据库&文件&执行

### 登陆操作

1. Express 开发
2. 实现用户登录
3. 加入数据库操作

先创建一个sql.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>后台登录</title>
  <style>
    body {
      background-color: #f1f1f1;
    }
    .login {
      width: 400px;
      margin: 100px auto;
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      padding: 30apx;
    }
    .login h2 {
      text-align: center;
      font-size: 2em;
      margin-bottom: 30px;
    }
    .login label {
      display: block;
      margin-bottom: 20px;
      font-size: 1.2em;
    }
    .login input[type="text"], .login input[type="password"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 1.2em;
      margin-bottom: 20px;
    }
    .login input[type="submit"] {
      background-color: #2ecc71;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 1.2em;
      cursor: pointer;
    }
    .login input[type="submit"]:hover {
      background-color: #27ae60;
    }
  </style>
</head>
<body>
<div class="login" >
  <h2>后台登录</h2>
  <form action="http://127.0.0.1:3000/login" method="POST">
    <label for="username">用户名:</label>
    <input type="text" name="username" id="username" class="user" >
    <label for="password">密码:</label>
    <input type="password" name="password" id="password" class="pass" >
  <button>登录</button>
  </form>
</div>
```

创建一个sql.js

```js
const express = require("express");
const app = express();

app.get('/',function (req,res) {
    res.sendFile(__dirname+'/'+'sql.html');
})

const server = app.listen(3000,function () {
    console.log("3000端口已启动");
})
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/30-02.png)

### 以get路由来传参

```html
 <form action="http://127.0.0.1:3000/login" method="GET">
```

对sql.js进行修改

```js
app.get('/login',function (req,res) {
    // res.send('登陆页面');
    const user = res.query.username;
    const pasw = res.query.password;

    console.log(user)
    console.log(pasw)


    if(user == 'admin' && pasw == '123456'){
        res.send("欢迎进入后台管理页面");
    }else {
        res.send("error");
    }
    
})
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/30-03.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/30-04.png)

### 以post路由来传参

在sql.js中继续写入，现版本的node.js好像不用再去进行body-parser库的安装了。

```js
const bodyParser = require('body-parser');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//以post路由来传参
app.post('/login',urlencodedParser,function (req,res) {
    const user = req.body.username;
    const pasw = req.body.password;

    if(user == 'admin' && pasw == '123456'){
        res.send("欢迎进入后台管理页面");
    }else {
        res.send("error");
    }
})
```

效果是一样的，所以这里不展示效果图了。

### 数据库管理

mysql连接代码：

```js
const mysql = require("mysql");

const connection = mysql.createConnection({
    database : 'test',
    host     : 'localhost',
    user     : 'root',
    password : '111111',
    port     : '8088'	// 注意端口号

});

connection.connect();
const sql = 'select * from admin';
console.log(sql);
connection.query(sql,function(error,data){
    if(error){
        console.log('数据库连接失败！');
    }
    console.log(data);
})
```

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/30-05.png" style="zoom:80%;" />

### 数据库与登录逻辑结合

代码如下：

注意：提交时的方式也需要改成POST

```js
//以post路由来传参
app.post('/login',urlencodedParser,function (req,res) {
    const user = req.body.username;
    const pasw = req.body.password;

    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '111111',
        database : 'test',
        port     : '8088'
    });

    connection.connect();
    const sql = 'select * from admin where username="'+user+'" and password="'+pasw+'"';
    console.log(sql);
    connection.query(sql,function(error,data){
        if(error){
            console.log('数据库连接失败！');
        }
        try{  // 报错测试
            if(user==(data[0]['username']) && pasw==data[0]['password']){
            // data[0]的意思是取第一行数据['username']是取里面的username值
                res.send('欢迎进入后台管理页面');
            }
        }catch{
            res.send('错误');
        };
    })
})

const server = app.listen(3000,function () {
    console.log("3000端口已启动");
})
```

使用永“真”语句注入的话，无论前面是什么都会全部回显。（or）

```sql
select * from admin where username='admin' or 1=1 # password='123456'
```

证明前面的代码`if(u==(data[0]['username']) && p==data[0]['password'])`对其进行了过滤：

`u==(data[0]['username']`是用来判断键值是否相同，正常应该是数据库取出的行数进行判断，而不是data中取的值。但还是产生了sql注入。

#### 安全写法

SQL语句采用预编译并绑定变量，这些都可以直接搜到（Node.js、JAVA居多）。

### 文件管理功能

```js
const fs=require('fs');
const express = require('express');
const app = express();
 
app.get('/file', function (req, res) {
    const dir=req.query.dir;   //接受dir
    console.log(dir);          //调试dir
    filemanage(dir);           //执行dir
})
 
var server = app.listen(3000, function () {
    console.log('web应用3000端口已启动!')
})
 
function filemanage(dir){
    fs.readdir(dir,function(error,files){
        console.log(files);
})};
```

在url中分别输入./和../在终端进行查看，如图所示。

```js
http://127.0.0.1:3000/file?dir=./
http://127.0.0.1:3000/file?dir=../
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/30-06.png)

### 命令执行功能

**文件操作**

1. Express开发
2. 实现自录读取
3. 加入传参接受

**一命令执行(RCE)**

1. eval
2. exec & spawnSyn

创建一个rce.js

```js
const rce=require('child_process');

//nodejs 调用系统命令执行(脚本)
rce.exec('notepad');
rce.spawnSync('calc');

//nodejs 调用代码命令执行 把字符串当做代码解析(把字符串当作代码执行)
// eval('require("child_process").exec("calc");');
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/30-07.png)

### node.js判断

浏览器插件判断或请求头中找到X-Powereby-By:Express，等等其他方法。

待上传...

## 安全问题—NodeJs—注入&RCE&原型链

1. SQL注入&文件操作
2. RCE执行&原型链污染
3. NodeJS黑盒无代码分析

实战测试NodeJs安全

判断：参考前期的信息收集

黑盒：通过对各种功能和参数进行payload测试

白盒：通过对代码中写法安全进行审计分析

### 原型链污染

如果攻击者控制并修改了一个对象的原型，`(_proto_)`那么将可以影响所有和这个对象来自同一个类、父祖类的对象。

代码示例：

```js
// // foo是一个简单的JavaScript对象
// let foo = {bar: 1} //解释：1=1 0 __proto__= x
// // 原型链污染
// // foo.bar 此时为1
// console.log(foo.bar)
 
// // 修改foo的原型（即Object）
// foo.__proto__.bar = 'x'
 
// // // 由于查找顺序的原因，foo.bar仍然是1
// console.log(foo.bar)
 
// // // 此时再用Object创建一个空的zoo对象
// let zoo = {}
 
// // 查看zoo.bar，此时bar为2
// console.log(zoo.bar)
 
 
let foo = {bar: 1};
 
console.log(foo.bar);
 
foo.__proto__.bar = 'require(\'child_process\').execSync(\'calc\');'
 
console.log(foo.bar);
 
let zoo = {};
 
console.log(eval(zoo.bar));
```

详细见：https://blog.csdn.net/m0_74930529/article/details/144095283

## 案例分析—NodeJS—CTF题目&源码审计

### CTF—Web334

#### Web334

详细见：https://blog.csdn.net/m0_74930529/article/details/144095283

### YApi管理平台漏洞

#### yapi token注入漏洞

详细见：https://blog.csdn.net/weixin_42353842/article/details/127960229