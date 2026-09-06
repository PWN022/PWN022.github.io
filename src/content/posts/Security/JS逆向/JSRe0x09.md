---
title: 安全辅助项目&接口联动&JSRpc进阶调用&BP插件autoDecode&JsEncrypter(下)
published: 2026-09-06T19:00:00
description: JS逆向中JSRPC的使用方法，通过注入JSEnv实现浏览器环境远程调用加密函数，免去补环境扣代码的繁琐过程。还有与autoDecoder、JsEncrypter等Burp插件联动的完整流程。
tags:
  - JS
  - JS逆向
  - JSRpc
category: 网络安全
draft: false
---

# 知识点

1. JS逆向-项目-项目联动&自动接口&Burp发包

文章参考：[https://forum.butian.net/share/2889](https://forum.butian.net/share/2889)

# JSRpc进阶

当我们遇到一些前端加密的时候，通常我们会去逆向JS，找到加密函数，然后使用burp插件或者python实现加密，这样我们还需要扣一些细节去补环境，下面介绍利用JSRPC的方法（只需要找到加密函数）实现加密JSRPC就是远程调用协议，简单来说就是我们可以本地编写代码去调用浏览器的JS加密函数，我们就不需要去考虑函数的具体逻辑了。

## 植入JSEnv并启动ws服务端

执行：resouces/JsEnv_Dev.js

执行：window_amd64.exe

## 本地替换加密函数JS文件

添加连接JSRPC和注册接口并调用加密

```
//连接JSRPC
var demo = new Hlclient("ws://127.0.0.1:12080/ws?group=自定义1&name=自定义2");
//注册接口并调用加密
demo.regAction("pass",function(resolve,param){
	resolve(encrypt.encrypt(param));
})
```

其中：`resolve(encrypt.encrypt(param));`，此处的两个encrypt是示例，实际按网站中的

比如网站中的加密函数是这样的：

```js
t.data = l(n);

// 此时需要将上述的代码改为
resolve(l(param));
```

具体流程如下：

找到包含实现加密的js文件，替换当前js文件，将以上两行代码添加到其中，加密前/后皆可，之后启动ws服务端，刷新页面就会发现直接上线

## 访问注册接口测试加密

```
http://127.0.0.1:12080/go?group=自定义1&name=自定义2&action=pass&param=需要进行加密的数据
```

# 真实案例

请求地址：

```
https://xxxx.xxx.com/account/unitivelogin?risk_partner=-1&risk_platform=1&risk_app=-1&joinkey=&uuid=8032b0be2aa4d5bddc57.1788662267.1.0.0&token_id=DNCmLoBpSbBD6leXFdqIxA&service=www&continue=https%3A%2F%2Fwww.xxx.com%2Faccount%2Fsettoken%3Fcontinue%3Dhttps%253A%252F%252Fwww.xxx.com
```

数据包：

```
email：13823028419
password：GcG5oC7RwQC4ejuSPss8Q1c7O/95MfTTlqiZkwFvlMJTUHg1vHsNOE5AlRzIqDqfQAkQvCNfQSX1NjUmveob+25EjuHc1rJvPJy47twQBDEU8+S5dr2d6Ix6wHRqBM6aJdTwBBAwZCod4mtBNj0YagU6m7fNOfbpB40DGVKzgNk=
```

从请求地址来看，如果从中找对应的函数不太可能，所以这时就需要看调用堆栈

调用堆栈中：`loginRequest @ index.d51a994.js:900`，从这个关键字就可以得知与登录密切相关，点进去查看代码部分

当打开跳转到900行时，发现代码只是处理的错误请求，那么这时就需要往上推，大概在800行左右是关于提交之后的处理部分

在函数`data`中的密码还是作为明文出现的，但到了`dataJson`这个函数发现经过了加密，再往下就是`dataJson`调用了什么加密方法等等相关代码，其中还有publickey等等，但是这次主要是使用JSRpc，所以只需验证是不是在此处加密的密码

```
// 关键代码：
dataJson.password =  encrypt.encrypt(dataJson.password);

// 控制台调用
encrypt.encrypt(222);
// 回显
'aWiTZFvZMuAFy6M4YSZq87yxmlzP85b40FRWIlx14orlW7tI17hy2ZzIRrivHUngtRa5Z63mit5lFtPJcROuymJrVm7sgoegtzTK071xS7sDI8WuaYhM39qdmQjAffuflTJoXHxx+Y0qpJhIezECycFKI36BfiXQ8LbXbn3S/uQ='
```

验证完毕后，连接JSRpc：右键文件替换内容，复制以下代码：

```js
var demo = new Hlclient("ws://127.0.0.1:12080/ws?group=jsre&name=pwn");
demo.regAction("pass",function(resolve,param){
	resolve(encrypt.encrypt(param));
})
```

控制台粘贴`JsEnv_De.js`的代码，因为该数据包是在点击登录时才会发出，所以需要模拟一次登录

点击时候就会触发，这时访问url：

```bash
http://127.0.0.1:12080/go?group=jsre&name=pwn&action=pass&param=任意密码
```

返回json数据：

```json
{
  "clientId": "xxxxx",
  "data": "LQTRJH+pxgjCkifEKxuwwq/GGmJuPpZjZKqS/kBdlyfUjjVdR4IoWsvZGcbl59xECgRm576ydn8mDNdHcJXC9jVR3KYr4KNzUgWdU6jhTke8S64WRL6rr7Qum8Fpytg0Dy3W4+CPDT8KrxTAqJgGGcfzvJ59sMGwMRZP+/JsGks=",
  "group": "jsre",
  "status": 200
}
```

至此完整流程就结束了，接下来步入正题

# JSRpc+autoDecoder

## 正常完成上述JSRpc操作

## autoDecoder配置接口

首先就是在选项页面，选择接口加解密，输入加解密域名

之后切换到接口加解密界面，输入解密接口为：`http://127.0.0.1:8888/decode`，加密接口为：`http://127.0.0.1:8888/encode`

## 编写项目模版py监听接受

此时需要autoDecoeder仓库中给出的主程序的脚本

分别为`flasktestheader.py`、以及自己的`rpc_auto.py`

在`rpc_auto.py`中进行修改：

```
url = '…………'：为自己的jsrpc地址
param = request.form.get('dataBody')：此处的databody就是接收传参值作用，也就是要加密的数据
data中的group、name、action与jsrpc一致

最后还有两个方法的路由与端口：
@app.route('/decode',…………)
@app.route('/encode',…………)
app.run(…………,port='8888')
```

burp插件autodecoder：加解密接口，就是按照两个方法的路由与端口进行填写

## 请求接口路由测试加解密

注意：data指向和jsrpc一致，debug模式确定开启

参考：https://forum.butian.net/share/2889

# JsEncrypter

## 下载phantomjs并设置环境变量

https://phantomjs.org/download.html

## BurpSuite加载jsEncrypter插件

https://github.com/c0ny1/jsEncrypter/releases

## 对逆向的加密算法提取JS文件及代码

```js
// JSEncrypt.js
// 用传统手法对目标站进行js逆向，拿到密钥等
var r = new JSEncrypt, o = "xxxxxxxxx";
r.setPublicKey(o);

var s = r.encrypt(password)
return s
```

## 将代码写入到模版中（引用JS和调用加密）

```js
// phantomjs_server.js
// 拿到目标站使用的加密js文件
var wasSuccessful = phantom.injectJs('JSEncrypt.js');
// 此处为自己重新定义的方法及函数
function encrypt(password){// 传入的参数名根据目标站的具体名称进行修改 --
	var r = new JSEncrypt,o = "xxxxxxxxx";// 根据目标站的加密算法的代码进行更改，这里是示例，o的值也是通过传统逆向拿到
	r.setPublicKey(o);
	var newpayload = r.encrypt(password)// 同上 --
	return newpayload
}

// 处理函数
function js_encrypt(payload){
/**********在这里编写调用加密函数进行加密的代码************/
	var newpayload=encrypt(payload)
/**********************************************************/
	return newpayload;
}

```

## 运行刚写入的模版文件后插件连接测试

```
phantomjs .\phantoms_server.js
```

## 正常设置发包后选择引用插件选项

同正常爆破一样，添加payload位置，之后根据需要选择字典，不同的是需要在**payload处理**添加->选择调用burp扩展->jsEncrypter，此时就是将明文字典以加密的方式发送

最后也可以尝试使用jsrpc+jsencrypter的联动