---
title: JS应用&原生代码&前端数据加密&CryptoJS库&代码混淆&Obfuscator库
published: 2026-02-25 12:00:00
description: 原生JS加密方案、CryptoJS库实现MD5/SHA1/HMAC/AES/DES等算法、jsencrypt库进行RSA非对称加密，案例演示了如何逆向分析加密逻辑。最后就是密码混淆。
tags: [Web开发,JS]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-原生JS-数据加密&代码混淆
2. 安全开发-原生JS-数据解密安全案例 

```
前端技术JS实现：
1、非加密数据大致流程
客户端发送->明文数据传输-服务端接受数据->处理数据

2、加密数据大致流程
明文加密->客户端发送->密文数据传输-服务端接受数据->解密数据->处理数据
```

疑问：

安全测试中对数据进行修改提交会在上述哪一步操作中？

# 前端加密 Crypto库

项目：https://github.com/brix/crypto-js

参考：https://juejin.cn/post/7382893339181613068

使用Crypto库进行MD5/SHA1/HMAC/AES/DES等加密

```
本地调用：
<script src="crypto-js.js"></script>

远程调用：
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js"></script> 
```

## base64编码-JS原生

```js
var str = "luciussec";

// base64编码(原生)
var base64_str = window.btoa(str);
console.log(base64_str);
```

## MD5

使用时需要转换类型，默认是一个对象，要转换为字符串。

```js
var str = "luciussec";

// base64编码(原生)
var base64_str = window.btoa(str);
console.log(base64_str);

// MD5加密
//发现打印出来是以对象的方式：var md5_str = CryptoJS.MD5(base64_str);
var md5_str = CryptoJS.MD5(base64_str).toString();
console.log(md5_str);
```

## SHA1

```js
var str = "luciussec";

//SHA1加密
var sha1_str = CryptoJS.SHA1(str).toString();
console.log(sha1_str)
```

## HMAC

```js
var str = "luciussec";

//HMAC加密
//此加密需要key
var key = '111';
var hash = CryptoJS.HmacSHA256(key,str);
var HMAC_str = CryptoJS.enc.Hex.stringify(hash);
console.log(HMAC_str);
```

## AES

```js
var str = "luciussec";
//AES加密
var aes_key = "aeskey"; //定制密钥，长度必须为：8/16/32位，长度不一致也没问题
//加密DES/AES切换只需要修改 CryptoJS.AES <=> CryptoJS.DES
var aes_str = CryptoJS.AES.encrypt(str,CryptoJS.enc.Utf8.parse(aes_key), // 参数1=密钥，参数2=加密内容
    {
        mode: CryptoJS.mode.ECB, // 为AES的加密方式
        padding: CryptoJS.pad.Pkcs7 // 当加密后密文长度达不到指定整数倍（8个字节、16个字节）则填充对应字符
    }
).toString(); // toString()转字符串类型

console.log(aes_str);
```

## DES

```js
var str = "luciussec";
//DES加密
var des_key = "deskey"; //定制密钥，长度必须为：8/16/32位，长度不一致也没问题
//加密DES/AES切换只需要修改 CryptoJS.AES <=> CryptoJS.DES
var des_str = CryptoJS.DES.encrypt(str,CryptoJS.enc.Utf8.parse(des_key), // 参数1=密钥，参数2=加密内容
    {
        mode: CryptoJS.mode.ECB, // 为AES的加密方式
        padding: CryptoJS.pad.Pkcs7 // 当加密后密文长度达不到指定整数倍（8个字节、16个字节）则填充对应字符
    }
).toString(); // toString()转字符串类型

console.log(des_str);
```

# 前端加密 jsencrypt库

项目：https://github.com/travist/jsencrypt

参考：https://www.cnblogs.com/Lrn14616/p/10154529.html

使用jsencrypt库进行RSA等加密

```
本地调用：
<script src="jsencrypt.js"></script>

远程调用：
<script src="https://cdn.bootcdn.net/ajax/libs/jsencrypt/3.3.2/jsencrypt.js"></script> 
```

**可以生成密钥对：http://web.chacuo.net/netrsakeypair**

## RSA公钥加密，私钥解密

```js
//RSA

var PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\n'+
'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz5B88EvcIBQhETGLWldY\n'+
'bjgXlg1nmaY9wAzLiaD5uYXNVVhsQgWXV1IpZVEVESUx+igX1j+6+SrbOQuKo1C6\n'+
'+Ou8etdvNk/X2JqeYCMlYZa0GsRjjipKiE+UM2mV083IANRViRraQIIap7aj54BF\n'+
'k9axIzpRyYAAKCV9DfQ0lF3c6MRZcbZpKkw4wmDsTYsOwioRH7G5TFoEhuHblCSf\n'+
'1I38I2xcK7RFzQ8IDHHo8Mp6tjxSdBscWs3i/496cm190DoVytj5b7upLHYJ4MsY\n'+
'MSSXYTxiC0Z/PZTdd3uuClUQ4b0qyTgMZBqMxwTReDiPkTVWwZ0a2i3haCDqZQwI\n'+
'zwIDAQAB\n'+
'-----END PUBLIC KEY-----\n'

var PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\n'+
'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDPkHzwS9wgFCER\n'+
'MYtaV1huOBeWDWeZpj3ADMuJoPm5hc1VWGxCBZdXUillURURJTH6KBfWP7r5Kts5\n'+
'C4qjULr467x61282T9fYmp5gIyVhlrQaxGOOKkqIT5QzaZXTzcgA1FWJGtpAghqn\n'+
'tqPngEWT1rEjOlHJgAAoJX0N9DSUXdzoxFlxtmkqTDjCYOxNiw7CKhEfsblMWgSG\n'+
'4duUJJ/UjfwjbFwrtEXNDwgMcejwynq2PFJ0GxxazeL/j3pybX3QOhXK2Plvu6ks\n'+
'dgngyxgxJJdhPGILRn89lN13e64KVRDhvSrJOAxkGozHBNF4OI+RNVbBnRraLeFo\n'+
'IOplDAjPAgMBAAECggEBAJKc6OODchVmooTWjixeDiSsklx3U3qAppWFdC/e+QZG\n'+
'sOdb8fwgnuobKwpZ35ugvlCJCW1YzuU5lGgS8vaxC6DQQu4yRmgCteBWNxCJQtpP\n'+
'7SALIJdG4Cawr2oxZpeZf3C2i0SxJwDx5YoZxGS9gmgO+kh75VGDjJjPAipdGNbC\n'+
'vuNRXIQYy6fULT+YS2NJYyiDAUhTNPpcXwhN4r6IJwxq582wTd6Arylmakcrlo8y\n'+
'2NbN2G97Dev2HemiXeZGO4meiIvlXDsp7tGqvWebCJBwQAikWsP9p3BrZGUYblds\n'+
'5uvbQ501UOP+S1TLOF7AnGrw0AEbunoA+j9TdX6nkwECgYEA/7zNSqQO/VpXDWMK\n'+
'Ouj1PyK+zXm8Mq7e/wshLzFbOR6MJj+1yhkrlx/S8tZcX+WYWY3+YB6WEQmIxqMz\n'+
'tH3AyoJAeHh5e9TsYh/UYCwSuF+R7u8z+3qTSrEMCT/Kys+lS10JIfx68pS4AHIN\n'+
'pYWt9EcbXlnuTEwtv/10OjDeCiECgYEAz8cHLz74RdP8Cv1FKDRFFHkjft5RvSIm\n'+
'zRg6RleIlF1LGOOaGqDovgRKxcpCOy+7JLWe/kWS3JrA/0BrN0Z5rj1lN/PR1J+q\n'+
'CbB9vpMd5/69BBuP00kMr4b3cugvfG+w/1Cen+yQmuAty2yqHqRiaxdqq+yKLXxw\n'+
'nJTqSgo2FO8CgYBj4V1clY61LJ9rPw8zyuBd9DgJEE6MjPfTLImdYO179Y5PMfrS\n'+
'H9qCf49oAIi7e3RxJZ//8nIx3UNqMTt0dtjhPtXnN0ZbMuHPwRa1KQF2uPzKEOqA\n'+
'gXMdbOCCjEOrykWIlaGHgJCURblHk0P5LaivC0aJJx6G9gm4PkkyoPtXgQKBgFdn\n'+
'gTU1xxkQyNkSm/ICswCeyPjIqxfl8u6Z/4Gxtum6qSmqLRyAjgfJJG8520yskowp\n'+
'vt12BQa6Lu/xeGjDQ9KxTxAPiDhqhgwXa34swwrh1T+SHJmkBCsemp+C3t742Ts9\n'+
'/cyGpnoQThNh/dpwClrEegIiuinSTEkCN+C3lPKPAoGAQUgwY2TayCrkp5suon4q\n'+
'BkRUHW/7Q+dgMYQ6K7Ao8YKRH4m/c9Yyzv/Vqi9DdSgfnYx7UDp726DmCJE+fGb/\n'+
'9WwbpeChULlJprkfi2nfSF6FIm9nm6iXV6WTq8Ny15TGI2GzUoBf3YxvuakgPAcW\n'+
'3espldcJ7IG/P9TUiBt8WSg=\n'+
'-----END PRIVATE KEY-----\n'

//公钥加密
var encrypt = new JSEncrypt(); // 实例化加密对象
encrypt.setPublicKey(PUBLIC_KEY); // 设置公钥
var encrypted = encrypt.encrypt(str); // 对指定数据进行加密
console.log(encrypted);

// 私钥解密
var decrypt = new JSEncrypt(); // 创建解密对象
decrypt.setPrivateKey(PRIVATE_KEY); // 设置私钥
var uncrypted = decrypt.decrypt(encrypted); // 解密
console.log(uncrypted);
```

**私钥加密就是公钥解密。**

# 案例0-AES-logindemo

一个登录页面，密码被加密对安全测试的影响。

![image-20260225105651339](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225105651339.png)

```js
<script src="jquery.js"></script>
<script>


  $("button").click(function (){
    $.ajax({
      type: 'POST',
      url: 'login.php',
      data: {
        username:$('.user').val(),
        password:$('.pass').val()
      },
      dataType: 'json',
      success: function (data) {
        console.log(data);
        if (data['infoCode']==1){
          alert('登录成功!');
        }else{
          alert('登录失败!');
        }
      }
    });
  });
```

## 加密

```js
<script src="jquery.js"></script>
<script src="crypto-js.js"></script>

<script>
  $("button").click(function (){
    var passstr=$('.pass').val();
    var aseKey = "aeskey"
    var aespassstr = CryptoJS.AES.encrypt(passstr, CryptoJS.enc.Utf8.parse(aseKey),  // 参数1=密钥, 参数2=加密内容
            {
              mode: CryptoJS.mode.ECB, // 为DES的工作方式
              padding: CryptoJS.pad.Pkcs7  // 当加密后密文长度达不到指定整数倍(8个字节、16个字节)则填充对应字符
            }
    ).toString();

    $.ajax({
      type: 'POST',
      url: 'login.php',
      data: {
        username:$('.user').val(),
        // 每次登录aes加密的值
        password:aespassstr
        // password:$('.pass').val()
      },
      dataType: 'json',
      success: function (data) {
        console.log(data);
        if (data['infoCode']==1){
          alert('登录成功!');
        }else{
          alert('登录失败!');
        }
      }

    });

  });
</script>
```

如果用户传输的密码是加密的，那么在进行爆破的时候也要对应加密传输，如果直接传明文过去，对方一接收解密就会出错，从而造成干扰。

## 从加密数据逆向代码分析加密逻辑

![image-20260225111140940](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225111140940.png)

![image-20260225111326517](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225111326517.png)

把关键代码带出调试：

```js
 CryptoJS.AES.encrypt(passstr, CryptoJS.enc.Utf8.parse(aseKey),  // 参数1=密钥, 参数2=加密内容
            {
              mode: CryptoJS.mode.ECB, // 为DES的工作方式
              padding: CryptoJS.pad.Pkcs7  // 当加密后密文长度达不到指定整数倍(8个字节、16个字节)则填充对应字符
            }
    ).toString();
```

asekey是因为代码中设置的密钥就是'asekey'，所以具体还需要看代码有没有泄露密钥。

![image-20260225111605237](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225111605237.png)

或者从代码中知道了网站使用的什么库文件，直接在本地进行调用，把源代码复制到本地进行测试。

```js
 <script src="crypto-js.js"></script>
 //本地测试
  var passstr = 'luciusses';
  var asekey = "asekey";
  var aespassstr = CryptoJS.AES.encrypt(passstr, CryptoJS.enc.Utf8.parse(aseKey),  // 参数1=密钥, 参数2=加密内容
            {
              mode: CryptoJS.mode.ECB, // 为DES的工作方式
              padding: CryptoJS.pad.Pkcs7  // 当加密后密文长度达不到指定整数倍(8个字节、16个字节)则填充对应字符
            }
    ).toString();
    console.log(aespassstr);
```

之后在控制台可以看到打印出来的数据。

# 案例1-MD5-某真实博客

![image-20260225112033286](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225112033286.png)

![image-20260225112106149](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225112106149.png)

![image-20260225112424743](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225112424743.png)

![image-20260225112455686](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225112455686.png)

## 方法1

在控制台中调试：

MD5('123456')

## 方法2

把md5.js文件下载到本地调用调试：

```js
<script src="md5.js"></script>
<script>
var password = '123456',
console.log(MD5(password)); 
</script>
```

# 案例2-AES-某真实系统

![image-20260225114926326](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225114926326.png)

搜索不到此方法调用，所以试试其他方式。

![image-20260225114952596](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225114952596.png)

经过txtPassword关键词搜索发现：

![image-20260225115043777](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225115043777.png)

查看getEncodeString函数：

```js
var getEncodeString = function (srcString) {
    var salt = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var key = CryptoJS.enc.Utf8.parse(salt);
    var srcs = CryptoJS.enc.Utf8.parse(srcString);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
}
```

![image-20260225115129610](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225115129610.png)

## 解密

```js
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
<script>
// 加密函数
var getEncodeString = function (srcString) {
    var salt = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var key = CryptoJS.enc.Utf8.parse(salt);
    var srcs = CryptoJS.enc.Utf8.parse(srcString);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, { 
        mode: CryptoJS.mode.ECB, 
        padding: CryptoJS.pad.Pkcs7 
    });
    return encrypted.toString();
}

// 解密函数
var getDecodeString = function (encryptedString) {
    var salt = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var key = CryptoJS.enc.Utf8.parse(salt);
    var decrypted = CryptoJS.AES.decrypt(encryptedString, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

// 测试
var original = "123";
var encrypted = getEncodeString(original);
var decrypted = getDecodeString(encrypted);

console.log("原文:", original);
console.log("密文:", encrypted);
console.log("解密:", decrypted);
</script>
```

![image-20260225115252640](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225115252640.png)

![image-20260225115321625](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225115321625.png)

# 代码混淆

混淆代码的主要目的是保护源代码，防止未经授权的复制、篡改或逆向工程。通过对变量名、字符串和控制流的修改，混淆代码看似毫无逻辑，但本质功能未变。混淆技术常用于商业应用和恶意软件中。

## 压缩

去除js代码中的不必要的空格、换行等内容。使源码压缩为几行内容，降低代码可读性，提高网站的加载速度。

## 混淆

使用变量替换、僵尸函数、字符串阵列化、控制流平坦化、调试保护等手段，使代码变得难以阅读和分析，达到最终保护的目的，不影响代码原有功能，是理想、实用的javascript保护方案。

### 在线混淆

![image-20260225115843223](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260225115843223.png)

https://obfuscator.io/ //国外的js混淆网站