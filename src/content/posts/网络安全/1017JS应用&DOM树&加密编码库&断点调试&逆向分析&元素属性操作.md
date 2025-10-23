---
title: JS应用&DOM树&加密编码库&断点调试&逆向分析&元素属性操作
published: 2025-10-17
description: JS原生开发DOM树、DOM XSS、JS导入库进行加密，以及逆向案例分析(已贴视频链接)。
tags: [JS,安全开发]
category: 网络安全
draft: false
---

# JS应用&DOM树&加密编码库&断点调试&逆向分析&元素属性操作

## JS 原生开发—DOM树—用户交互

DOM：文档操作对象

浏览器提供的一套专门用来操作网页代码内容的功能，实现自主或用户交互动作反馈。

安全问题：本身的前端代码通过 DOM 技术实现代码的更新修改，但是更新修改如果修改的数据可以由用户来指定，就会造成 DOM-XSS 攻击！

1. 获取对象

   ```js
   标签：直接写
   Class：加上符号.
   id：加上符号#
   <h1 id="myHeader" οnclick="getValue()">这是标题</h1>
   document.querySelector('h1')
   document.querySelector('.id')
   document.querySelector('#myHeader')
   ```

2. 获取对象属性

   ```js
   <h1 id="myHeader" οnclick="getValue()">这是标题</h1>
   const h1=document.querySelector('h1')
   const id=h1.id
   console.log(id)
   ```

3. 操作元素数据

   ```js
   innerHTML 解析后续代码
   innerText 不解析后续代码
   ```

4. 操作元素属性

   ```js
   className src id 等
   <img src="iphone.jpg" width="300" height="300"></img>
   const src=document.querySelector('img')
   src.src='huawei.png'
   ```

### 案例1

dom.html

其中点击刷新会得到src中的img图片，点击这是标题会转变为这是小迪。

```js
<h1 id="myHeader" onclick="update1()">这是标题</h1>
 
<img src="huawei.png" width="300" height="300"><br>
 
<button onclick="update()">刷新</button>
 
<script>
    function update(){
        const s=document.querySelector('img')
        console.log(s.src)
    }
    
    function update1(){
        const s=document.querySelector('h1')
        //s.innerText="这是小迪<br>"  // innerText 不解析后续代码
 
        s.innerHTML='这是小迪<hr>'   // innerHTML 解析后续代码
        // <hr>下划线
        console.log(str)
    }
 
 
</script>
```

### 案例2

dom.html

将s.src=huawei.png转为iphone.jpg。

```js
<script>
    function update(){
        const s=document.querySelector('img')
        s.src="iphone.jpg"
        console.log(s.src)
    }
    
    function update1(){
        const s=document.querySelector('h1')
        //s.innerText="这是小迪<br>"
        s.innerHTML='这是小迪<hr>'
        console.log(str)
    }
</script>
```

### DOM XSS漏洞

```js
const s=document.querySelector('img')
        s.src="iphone.jpg"
        console.log(s.src)
```

如果这里iphone.jpg为一个变量由用户传递决定，那么就会造成DOM XSS（改为用户传递）。

```js
s.src="JaVaScRiPt:alert('XSS')"
```

XSS payload参考文章：[XSS攻击绕过过滤方法大全（转）_xss绕过-CSDN博客](https://blog.csdn.net/qq_50854790/article/details/124297046)

有时候不弹窗的原因：

1. 不支持（高版）

2. 浏览器安排策略问题

   使用`<img src='#' onerror = "alert(1)"><br>`在上面可以绕过弹窗alert（1）。

```
<SCRIPT SRC=http://127.0.0.1/xss.js></SCRIPT>
```

### xss注入案例1

有道翻译（已修复）。

详细见：https://blog.csdn.net/m0_74930529/article/details/143867620

### JS 导入库开发-编码加密-逆向调试

赋值变量的三个方式：

let var const

```js
//MD5
<script src="js/md5.js"></script>
<script>
    var str1 = 'xiaodisec'
    var str_encode = md5(str1);
    console.log(str_encode)
</script>
 
//SHA1
<script src="js/crypto-js.js"></script>
<script>
    var str1 = 'xiaodisec';
    var str_encode = CryptoJS.SHA1(str1).toString(); // 注意：1是数字1
    console.log(str_encode)  
</script>
 
//HMAC
<script src="js/crypto-js.js"></script>
<script>
    var key = 'key';
    var str1 = 'xiaodisec';
    var hash = CryptoJS.HmacSHA256(key, str1);
    var str_encode = CryptoJS.enc.Hex.stringify(hash);
    console.log(str_encode)  // '11a7960cd583ee2c3f1ed910dbc3b6c3991207cbc527d122f69e84d13cc5ce5c'
</script>
 
 
//AES
<script src="js/crypto-js.js"></script>
    <script type="text/javascript">
          var aseKey = "12345678"     // 定制秘钥，长度必须为：8/16/32位, 长度不一致也没问题
          var message = "xiaodisec";  // 需要加密的内容
          // 加密 DES/AES切换只需要修改 CryptoJS.AES <=> CryptoJS.DES
          var encrypt = CryptoJS.AES.encrypt(message, CryptoJS.enc.Utf8.parse(aseKey),  // 参数1=密钥, 参数2=加密内容
              {
                mode: CryptoJS.mode.ECB, // 为DES的工作方式
                padding: CryptoJS.pad.Pkcs7  // 当加密后密文长度达不到指定整数倍(8个字节、16个字节)则填充对应字符
             }
          ).toString(); // toString=转字符串类型
 
          console.log(encrypt);//在弹窗中打印字符串2vcsEDJv9vAZZLgFLjkZ9A==
 
 
//解密
          var decrypt = CryptoJS.AES.decrypt(encrypt, CryptoJS.enc.Utf8.parse(aseKey), // 参数1=密钥, 参数2=解密内容
              {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
              }
          ).toString(CryptoJS.enc.Utf8); // toString=转字符串类型,并指定编码
          console.log(decrypt); // "xiaodisec"
    </script>
 
 
//DES
<script src="js/crypto-js.js"></script>
    <script type="text/javascript">
          var aseKey = "12345678"     // 定制秘钥，长度必须为：8/16/32位, 长度不一致也没问题
 var message = "xiaodisec";  // 需要加密的内容
          // 加密 DES/AES切换只需要修改 CryptoJS.AES <=> CryptoJS.DES
          var encrypt = CryptoJS.AES.encrypt(message, CryptoJS.enc.Utf8.parse(aseKey),  // 参数1=密钥, 参数2=加密内容
              {
                mode: CryptoJS.mode.ECB, // 为DES的工作方式
                padding: CryptoJS.pad.Pkcs7  // 当加密后密文长度达不到指定整数倍(8个字节、16个字节)则填充对应字符
             }
          ).toString(); // toString=转字符串类型
 
          console.log(encrypt);//  控制台打印 CDVNwmEwDRM
 
//解密
          var decrypt = CryptoJS.AES.decrypt(encrypt, CryptoJS.enc.Utf8.parse(aseKey), // 参数1=密钥, 参数2=解密内容
              {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
              }
          ).toString(CryptoJS.enc.Utf8); // toString=转字符串类型,并指定编码
          console.log(decrypt); // 控制台打印"i am xiaochou  ?"
</script>
 
//RSA
<script src="js/crypto-js.js"></script>
    <script type="text/javascript">
      // 公钥 私钥是通过公钥计算生产的，不能盲目设置
        var PUBLIC KEY='-----BEGIN PUBLICKEY-----MFWWDQYJKOZIhVCNAQEBBQADSWAWSAJBALyBJ6KZ/VFJYTV3vOC07jqWIqgyvHulv6us/8wz1sBqQ2+e0TX7s5zKfXY40yZWDoCaIGk+tP/sc0D6dQzjaxECAWEAAQ==-----END PUBLIC KEY-----';
//私钥
        var PRIVATE KEY='-----BEGIN PRIVATEKEY-----MIIBVQIBADANBgkqhkiG9WOBAQEFAASCAT8WggE7AgEAAkEAvIEnqRn9UU1hNXe84LTuOpYiqDK8e6W/q6z/zDOVIGpDb545NfuznMp9djjTJlYOgJogaT60/+x2QPP1DONrEQIDAQABAKEAu7DFSqQEDDnKJpiWYfUE9ySiIWNTNLJWZDN/Bu2dYIV4DO2A5aHZfMe48rga5BkoWq2LAL1Y3tqsOFTe3M6yoQIhAOSfSAU3H6jI0nlEiZaburVGqiFLCb5Ut3Jz9NN+5p59AiEA0xQDMrxWBBJ9BYq6RRY4pXwa/MthX/8Hy+3GnvNw/yUCIG/3Ee578KVYakq5pih8KsVeVj037c2gj60d30k3XPqBAiEAGGPVxTsAuBDz0kcBIPqASGzArumljkrLsoHHkakofU0cIDuhxKQwH1XFD079ppYAPcV03bph672qGD84YUaHF+pQ-----END PRIVATE KEY-----';
```

#### 使用js进行加密

将三个js放入js文件夹中：

crypto-js

jsencrypt

md5

创建encry.html:

```html
//md5
<script src="js/md5.js"></script>
<script>
    var str1 = 'xiaodi jichu No1'
    var str_encode = md5(str1);
    console.log(str_encode) 
</script>
 
//SHA1
<script src="js/crypto-js.js"></script>
<script>
    var str1 = 'xiaodisec';
    var str_encode = CryptoJS.SHA1(str1).toString(); // 注意：1是数字1
    console.log(str_encode)  
</script>
 
//HMAC
<script src="js/crypto-js.js"></script>
<script>
    var key = 'key';
    var str1 = 'xiaodisec';
    var hash = CryptoJS.HmacSHA256(key, str1);
    var str_encode = CryptoJS.enc.Hex.stringify(hash);
    console.log(str_encode)  // '11a7960cd583ee2c3f1ed910dbc3b6c3991207cbc527d122f69e84d13cc5ce5c'
</script>
 
 
//AES
<script src="js/crypto-js.js"></script>
    <script type="text/javascript">
          var aseKey = "12345678"     // 定制秘钥，长度必须为：8/16/32位, 长度不一致也没问题
          var message = "xiaodisec";  // 需要加密的内容
          // 加密 DES/AES切换只需要修改 CryptoJS.AES <=> CryptoJS.DES
          var encrypt = CryptoJS.AES.encrypt(message, CryptoJS.enc.Utf8.parse(aseKey),  // 参数1=密钥, 参数2=加密内容
              {
                mode: CryptoJS.mode.ECB, // 为DES的工作方式
                padding: CryptoJS.pad.Pkcs7  // 当加密后密文长度达不到指定整数倍(8个字节、16个字节)则填充对应字符
             }
          ).toString(); // toString=转字符串类型
 
          console.log(encrypt);
          var decrypt = CryptoJS.AES.decrypt(encrypt, CryptoJS.enc.Utf8.parse(aseKey), // 参数1=密钥, 参数2=解密内容
              {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
              }
          ).toString(CryptoJS.enc.Utf8); // toString=转字符串类型,并指定编码
          console.log(decrypt); // "xiaodisec"
    </script>
```

效果如图：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/29-01.png)

## 两则案例分析—解析安全&登录调试

### xiaodi8

查看源代码，如图：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/29-02.png)

这里发现传参的id分别是edtUsername和edtPassWord，之后使用全局搜索关键代码，发现代码中使用的是ajax，在表单值中也是btnpost：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/29-03.png)

进行md5传参后action提交给cmd.php?act=verify：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/29-04.png)

若不知道是md5加密可以用上面的方法进行溯源，之后在console中进行调试：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/29-05.png)

在表单提交之后和在console调试的结果图如下，溯源发现就是使用了MD5。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/29-07.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/29-06.png)

### 申通快递实战

这个只能看视频领悟了。。。

url:https://www.bilibili.com/video/BV12om2YTEgW

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/29-08.png)

大概就是从中找到js的关键代码部分，之后通过对密码的断点调试，可以构造出加密后的攻击语句。

#### 总结

如果我们现在要测试注入一样

注入payload ：admin ’ 1=1

明文：admin ‘1=1

密文：xxxxxxxxxx

如果不知道加密算法 你发送明文？有效吗？没有效—>因为对方可能会解密、有效—>以同样的加密方式去发送payload。

为什么进行断点操作：因为有些encrypt没有定义，浏览器没有显示断点。

