---
title: JS应用&NodeJS&原型链污染&文件系统&Express模块&数据库通讯&审计
published: 2026-02-26 12:00:00
description: Node.js安全开发入门与漏洞分析，涵盖Express框架、文件操作、数据库通信及命令执行风险，原型链污染攻击原理，结合YApi案例演示代码审计方法。
tags: [Web开发,JS]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-NodeJS-开发环境&功能实现
2. 安全开发-NodeJS-安全漏洞&案例分析
3. 安全开发-NodeJS-特有漏洞&代码审计

Node.js是一个开源的，跨平台的JavaScript运行环境。

# 环境搭建-NodeJS-解析安装&库安装

1. 文档参考：https://www.runoob.com/nodejs/nodejs-tutorial.html

   原生js需要应用去解析运行（如apache等），且js代码是可以在浏览器中能够访问到。而node.js本身就包含了解析运行功能，所以node.js直接就可以运行js代码，并且浏览器无法看到。

2. Nodejs安装：https://nodejs.org/en

3. 三方库安装

   - express：Express是一个简洁而灵活的node.js Web应用框架
   - body-parser：node.js中间件，用于处理 JSON, Raw, Text和URL编码的数据。
   - cookie-parser：这就是一个解析Cookie的工具。通过req.cookies可以取到传过来的cookie，并把它们转成对象。
   - multer：node.js中间件，用于处理 enctype="multipart/form-data"（设置表单的MIME编码）的表单数据。
   - mysql：Node.js来连接MySQL专用库，并对数据库进行操作。

    安装命令：

   ```
   npm i express
   
   npm i body-parser
   
   npm i cookie-parser
   
   npm i multer
   
   npm i mysql
   ```

## 设置环境变量

```cmd
# 查看当前 NODE_PATH
echo %NODE_PATH%

环境变量新建：
变量名：NODE_PATH
变量值：C:\Users\用户名\node_modules
```

# 功能实现-NodeJS-数据库&文件&执行

## 文件操作

```js
var fs = require("fs");
var path = require("path");

// 使用 __dirname 获取当前脚本所在目录
var filepath = path.join(__dirname,'1.txt');

fs.readFile(filepath,'utf-8',function(err,data){
    if(err) throw err;
    console.log(data);
})
```

### Express开发

```js
var fs = require("fs");
var path = require("path");

var express = require('express');
var app = express();

var filepath = path.join(__dirname,'1.txt');

fs.readFile(filepath,'utf-8',function(err,data){
    if(err) throw err;
    console.log(data);
})

var server = app.listen(8099,function(){

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s",host,port)
})
```

运行之后就会启动8099端口，访问后发现，文件读取没有被执行，需要设置路由。

### 加入传参接收

```js
var fs = require("fs");
var path = require("path");

var express = require('express');
var app = express();

var filepath = path.join(__dirname,'1.txt');

// ‘/’ 表示当用户访问网站根路径（如 http://localhost:8099/）时执行这个回调函数
// req (request) 包含客户端发送的请求信息（如参数、headers、表单数据等）
// res (response) 用于向客户端发送响应数据
// res.send() 将数据发送给浏览器并显示在页面上（不仅限于打印，而是HTTP响应）
app.get('/',function(req,res){
    fs.readFile(filepath,'utf-8',function(err,data){
        if(err) throw err;
        console.log(data);
        res.send(data);
    })
})


var server = app.listen(8099,function(){

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s",host,port)
})
```

### 请求值

```js
var fs = require("fs");
var path = require("path");

var express = require('express');
var app = express();

var filepath = path.join(__dirname,'1.txt');

// ‘/file’ 表示当用户访问网站file路径（如 http://localhost:8099/）时执行这个回调函数
// req (request) 包含客户端发送的请求信息（如参数、headers、表单数据等）
// res (response) 用于向客户端发送响应数据
// res.send() 将数据发送给浏览器并显示在页面上（不仅限于打印，而是HTTP响应）
app.get('/file',function(req,res){
	// 请求值
	// url:http://192.168.0.12:8099/?r=123231312
	var name = req.query.r;
	res.send(name);
    fs.readFile(filepath,'utf-8',function(err,data){
        if(err) throw err;
        console.log(data);
    })
})


var server = app.listen(8099,function(){

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s",host,port)
})
```

## 实现文件读取/目录遍历

### 文件读取

```js
var fs = require("fs");
var path = require("path");
var express = require('express');
var app = express();

app.get('/', function(req, res) {
    // 获取文件名参数
    var fileName = req.query.r;
    
    // 使用 __dirname 拼接完整路径，确保在当前脚本所在目录查找
    var filePath = path.join(__dirname, fileName);
    console.log('尝试读取文件：', filePath);  // 调试用
    
    // filepath为接收变量值
    fs.readFile(filePath, 'utf-8', function(err, data) {
        if(err) {
            console.log('读取错误：', err);
            return res.send('文件读取失败：' + err.message);
        }
        console.log(data);
        res.send(data);
    });
});

var server = app.listen(8099, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("应用实例，访问地址为 http://localhost:%s", port);
});
```

### 目录遍历

```js
var fs = require("fs");
var path = require("path");
var express = require('express');
var app = express();

// post
app.post('/', function(req, res) {
    // 获取文件名参数
    var fileName = req.query.r;
    
    if (!fileName) {
        return res.send('请指定目录，例如：/?r=/');
    }
    
    // 使用 __dirname 拼接完整路径，确保在当前脚本所在目录查找
    var filePath = path.join(__dirname, fileName);
    console.log('尝试读取：', filePath);  // 调试用
    
    // readdir
    fs.readdir(filePath, 'utf-8', function(err, data) {
        if(err) {
            console.log('读取错误：', err);
            return res.send('读取失败：' + err.message);
        }
        console.log(data);
        res.send(data);
    });
});

var server = app.listen(8099, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("应用实例，访问地址为 http://localhost:%s", port);
});
```

![image-20260226103100195](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260226103100195.png)

## 数据库操作

```js
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '111111',
  database : 'phpdemo'
});
 
connection.connect();
 
var sql = 'select * from users where id=2';
connection.query(sql,function (err, result) {
    if(err) throw err;
    console.log(result[0]);
});
```

### Express开发

```js
var mysql      = require('mysql');
var express = require('express');
var app = express();

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '111111',
  database : 'phpdemo'
});
 
connection.connect();
 
var sql = 'select * from users where id=2';
connection.query(sql,function (err, result) {
    if(err) throw err;
    console.log(result[0]);
});

var server = app.listen(8099, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("应用实例，访问地址为 http://localhost:%s", port);
});
```

### SQL注入

```
http://192.168.0.12:8099/sql?id=2%20union%20select%201,2,3,version(),database(),6,7,8,9
```

```js
var mysql = require('mysql');
var express = require('express');
var app = express();

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '111111',
  database : 'phpdemo'
});
 
connection.connect();
 
// var sql = 'select * from users where id=2';
// connection.query(sql,function (err, result) {
//     if(err) throw err;
//     console.log(result[0]);
// });

app.get('/sql',function(req,res){
    const id = req.query.id;
    const sql = 'select * from users where id='+id;
    connection.query(sql,function(err,result){
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        console.log('--------------------------SELECT----------------------------');
        console.log(result);
        res.send(result);
    })
})


var server = app.listen(8099, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("应用实例，访问地址为 http://localhost:%s", port);
});
```

## 命令执行（RCE）

### eval

```js
const child_process = require('child_process');

// 命令执行
child_process.exec('calc');

// 代码执行
// 使用反斜杠转义
eval('child_process.exec(\'calc\');');
// 内外引号错开
eval("child_process.exec('calc');")

```

### exec & spawnSync

```js
const child_process = require('child_process');

// 命令执行
child_process.exec('calc');

// 代码执行
// 使用反斜杠转义
eval('child_process.exec(\'calc\');');
// 内外引号错开
eval("child_process.exec('calc');")
```

```js
const child_process = require('child_process');
var express = require('express');
var app = express();

app.get('/rce',function(req,res){
    const cmd = req.query.c;
    child_process.exec(cmd);
})

var server = app.listen(8099, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("应用实例，访问地址为 http://localhost:%s", port);
});
```

# NodeJS安全

1. SQL注入&文件操作

   见上文。

2. RCE执行&原型链污染

   见上文。

3. NodeJS黑盒无代码分析

```
实战测试NodeJS安全：
判断：参考前期的信息收集
黑盒：通过对各种功能和参数进行payload测试
白盒：通过对代码中写法安全进行审计分析
```

## 原型链污染

图片转载自：https://f1veseven.github.io/2022/04/03/ctf-nodejs-zhi-yi-xie-xiao-zhi-shi/

![img](https://f1ve-picgogogo.oss-cn-hangzhou.aliyuncs.com/img/image-20220307155913395.png)

```
如果攻击者控制并修改了一个对象的原型，(__proto__)
那么将可以影响所有和这个对象来自同一个类、父祖类的对象。

## CTF方向
参考：https://f1veseven.github.io/2022/04/03/ctf-nodejs-zhi-yi-xie-xiao-zhi-shi/
```

```js
// foo是一个简单的JavaScript对象
let foo = {bar: 1}

// foo.bar 此时为1
console.log(foo.bar)

// 修改foo的原型（即Object）
foo.__proto__.bar = 2

// 由于查找顺序的原因，foo.bar仍然是1
console.log(foo.bar)

// 此时再用Object创建一个空的zoo对象
let zoo = {}

// 查看zoo.bar，此时bar为2
console.log(zoo.bar)
```

```js
// foo是一个简单的JavaScript对象
let foo = {bar: 1}

// foo.bar 此时为1
console.log(foo.bar)

// 修改foo的原型（即Object）
foo.__proto__.bar = 'require(\'child_process\').exec(\'calc\');'

// 由于查找顺序的原因，foo.bar仍然是1
console.log(foo.bar)

// 此时再用Object创建一个空的zoo对象
let zoo = {}

// 查看zoo.bar，此时bar为2
console.log(eval(zoo.bar))
```

# 案例应用

## 代码审计yapi

审计参考:https://mp.weixin.qq.com/s/mKOlTQclji-oEB5x_bMEMg

部署：https://hellosean1025.github.io/yapi/devops/index.html

手工bug：

https://github.com/YMFE/yapi/issues/2180

Docker：https://github.com/MyHerux/code-note/blob/master/Program/%E5%B7%A5%E5%85%B7%E7%AF%87/Yapi/%E4%BD%BF%E7%94%A8DockerCompose%E6%9E%84%E5%BB%BA%E9%83%A8%E7%BD%B2Yapi.md

## 代码审计

https://mp.weixin.qq.com/s/fe_Kp7fOUiMXLWTY1KxSqg

此账号已自主注销，内容无法查看