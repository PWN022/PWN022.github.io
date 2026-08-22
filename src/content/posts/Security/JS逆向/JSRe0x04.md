---
title: Sign签名&绕过技术&算法可逆&替换库模拟发包&堆栈定位&特征搜索&安全影响
published: 2026-08-21T09:30:00
description: 围绕JS逆向中的Sign签名绕过展开，分析签名机制对渗透测试的双面影响，并结合Yakit靶场HMAC-SHA256验签、考试宝请求头签名构造、爱词霸翻译接口逆向等案例，演示了从调用堆栈定位、断点调试到算法复现的完整流程。
tags:
  - JS
  - JS逆向
  - 签名
category: 网络安全
draft: false
---

# 知识点

1. JS逆向-Sign绕过-签名影响&加密解密

Sign（签名）机制广泛应用于API请求、数据传输、身份验证等场景，用于确保数据的完整性和来源可信性。

它对渗透测试（Penetration Testing）带来了显著的影响，既有安全增强作用，也增加了测试的挑战，测试人员需要结合逆向分析、动态Hook、服务器逻辑测试等方法，才能有效发现潜在的绕过漏洞。

**在进行实践前，这里先做一个提醒：**

**注意：** 在实战中需要注意的是某些值**并非固定**的，需要做记录并且再次刷新查看

# Sign机制对渗透测试的正面影响

1、提高安全性，减少低风险漏洞

防篡改：Sign通常基于HMAC、RSA、AES等算法，确保数据在传输过程中未被篡改，减少中间人攻击（MITM）风险。

防重放攻击（Replay Attack）：时间戳（Timestamp）和Nonce机制使得截获的请求无法直接重放。

防未授权访问：请求必须携带正确的签名，否则会被服务器拒绝，减少越权漏洞（如未授权API访问）。

2、推动更深入的测试方法

迫使更关注业务逻辑漏洞（如绕过签名校验），而非仅依赖自动化工具扫描。

# Sign机制对渗透测试的负面影响

1、增加渗透测试的复杂度

逆向分析难度大：如果Sign算法被混淆或加密，测试人员需花费大量时间逆向JavaScript/App代码。动态调试受限：Burp Suite、Fiddler等工具难以直接修改请求，因为签名错误会导致请求失效。自动化扫描失效：大多数Web漏洞扫描器（如AWVS、Nessus）无法自动处理签名，导致误报或漏报。

2、可能掩盖漏洞，导致误判

误以为“有Sign=安全”：开发人员可能过度依赖Sign，忽略其他安全措施（如输入过滤、权限控制）。签名绕过漏洞：如果签名校验逻辑存在缺陷（如客户端计算签名、弱密钥、算法可预测），仍可能被绕过。

3、影响测试效率

每次测试需重新生成签名，手动测试效率降低。

如果Sign机制频繁变更（如密钥轮换），测试脚本可能失效。

# 案例1-Yakit（主要了解安全影响）

如登录框口令爆破-数据包完整性校验才能进入正常逻辑

在进行带有**签名校验**的登录时，**账号密码的修改，也会导致签名的修改**，所以爆破时还需要注意这一点

这里就用到了Yakit的自带靶场：前端验证签名（验签）表单：HMAC-SHA256

当输入任意账号密码，进行登录，就会发现签名验证通过，账号密码不通过等等，如果在此抓包，进行对密码的爆破，则后续的每次爆破都会导致签名对应不上，也就是无效

此时在浏览器中进行登录，查看网络数据包，来进行对签名的逆向

```json
{
	"signature": "217363c59b6c21ec2748815b1ffd4aea86fe4d89a14026d36f968f17c45b2b58", 
	"key": "31323334313233343132333431323334",
	"username": "aaa",
	"password": "111"
}
```

查看验证时的启动器，存在调用堆栈`submitJSON`，具体代码如下：

```js
        const url = "/crypto/sign/hmac/sha256/verify";
        let jsonData = getData();
        let submitResult = JSON.stringify(outputObj(jsonData), null, 2)
        console.log("key", key)
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: submitResult,
        })
            .then(response => response.text())
            .then(data => {
                console.log("Success:", data);
                document.body.innerHTML = data;
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
```

在`.then(response => response.text())`处（登录后，验证之前）打断点，重新进行登录，发现经过调用`outputObj`函数生成的签名，鼠标移过去查看具体代码段：

```js
    function outputObj(jsonData) {
        const word = `username=${jsonData.username}&password=${jsonData.password}`;;
        return {
            "signature": Encrypt(word),
            "key": key.toString(),
            username: jsonData.username, password: jsonData.password,
        }
    }
```

返回的四个值为抓包时获取到的信息，`signature`是经过加密变量`word`生成，而`word`实际为json格式账号密码，鼠标移到`Encrypt`函数查看代码段：

```js
    function Encrypt(word) {
        console.info(word);
        return  CryptoJS.HmacSHA256(word, key.toString(CryptoJS.enc.Utf8)).toString(); 
    }
```

用到的加密库为`CryptoJS`、加密方法为`HmacSHA256`、加密值`word`、还有一个`key`值未知，在当前js文件搜索关键词`key`

```js
function generateKey() {
        return  CryptoJS.enc.Utf8.parse("1234123412341234")  // 把明文的数字字符串，先按 UTF-8 转成字节，再打包成密钥对象
    }
```

## 验证

推荐项目：[https://github.com/gchq/CyberChef](https://github.com/gchq/CyberChef)

`1234123412341234`，将十六位数字字符串作为 UTF-8 字节解析为密钥，最终结果是每个字符的十六进制编码（即 ASCII 码的十六进制）

即为`31323334313233343132333431323334`

在cyberchef中，选择HMAC，key为：`31323334313233343132333431323334`、加密算法为：SHA256，传参输入：

```
username=aaa&password=111
```

结果显示：

```
4fccbace64ffd1c0f48b717ecdf4a66117df3738cac3b70a3a93013cca997fbb
```

同样，在yakit靶场给出的模拟结果：

```json
{
  "signature": "4fccbace64ffd1c0f48b717ecdf4a66117df3738cac3b70a3a93013cca997fbb",
  "key": "31323334313233343132333431323334",
  "username": "aaa",
  "password": "111"
}
```

# 案例2-算法逆向绕过

测试地址：https://www.kaoshibao.com/

`categoryListNew`的网络请求头部分带有`sign: "6affdb39be86bee1a9fe83c747c92005"`，因为`sign`存在于请求头中，所以通过关键词搜索出现的结果量太大，且需要筛选，而且在调用堆栈中出现的js文件也过多，所以通过在下断点的方式进行

请求路径为`api/indexRecommend/categoryListNew`，通过使用`XHR/提取断点`添加url的方式下断点，重新刷新网页

可以发现在`m = t.headers;`这里已经出现`sign`，调用堆栈中，先从最下面的调用开始查看，通过全局搜索关键词`m`，发现`m`在倒数第二个调用就已经出现

```js
var m = document.createElement("link"); // 不管是怎么调用的，此时已经出现sign值
```

所以在倒数第一个调用，搜索`sign`查看是否存在相关代码

```js
 r = Mr()(d + l + m + h + d),
 t.headers.Sign = r,
 
 // 现在需要知道的是
 d-> d = "12b6bb84e093532fb72b4d65fec3f00b"
 l-> l = e.$cookies.get("uu") // 获取cookie里面的uu参数值
 m-> m = t.url.replace("/api", "")  // "/api/indexRecommend/categoryListNew"
 h-> var l, h = (new Date).getTime() // 获取当前时间戳
```

现在未知的是`Mr()`的作用，所以在这里下一个断点，刷新之后，鼠标悬浮上去打开调用的js文件，发现：不知道有什么作用

```js
: function() {
    return e
}
```

转而在控制台进行调用查看：

```
>Mr();
<·ƒ (t){return new Md5(!0).update(t)[e]()}
```

点击之后跳转到：

```js
var createOutputMethod = function(e) {
    return function(t) {
        return new Md5(!0).update(t)[e]()
    }
}
```

由此可知，`Mr()`是将以上的几个值进行MD5加密

模拟生成sign的代码如下：

```js
const crypto = require('crypto');

// ----- 固定参数（根据实际情况替换）-----
// 常量 d（固定值）
const D = '12b6bb84e093532fb72b4d65fec3f00b';

// 从 cookie 获取的 uu 值（示例）
const UU = '9424b2d3-73ef-4d4c-b91e-f47752bf06b3';

// 接口路径（原始 URL 包含 /api，需要替换掉）
const ORIGINAL_URL = '/api/indexRecommend/categoryListNew';
const M = ORIGINAL_URL.replace('/api', ''); // 结果为 '/indexRecommend/categoryListNew'
  
// 当前时间戳（毫秒）
const H = (new Date).getTime(); // 使用当前时间戳
console.log('【当前时间戳】:', H);

// ----- 拼接原始字符串 -----
const rawString = D + UU + M + H + D;
console.log('【拼接字符串】:', rawString);

// ----- Mr() 函数（假设为 MD5）-----
function Mr(input) {
    return crypto.createHash('md5').update(input).digest('hex');
}

// ----- 生成签名 -----
const sign = Mr(rawString);
console.log('【签名结果】:', sign);
```

综合以上的所有代码逻辑，丢给ai，然后让ai构造**完整的请求数据包脚本**来请求网站的数据，后续就是被拦截了，所以没什么放代码的必要了

# 案例3-算法逆向绕过

进行任意翻译之后，注意到网络数据包：`web?client=6&key=1000006&timestamp=1787373781490&word=%25E4%25BD%25A0%25E5%25A5%25BD&transSensitiveCheck=true&signature=b231b356b3f6e4f41c90197143e4832a`，其中存在sign，通过调用堆栈发现，js包过多，于是进行关键词搜索`sign=`

发现某个js文件存在高度相关的代码，而且经过调用堆栈对比，发现就是该js文件，代码如下：

```js
r.ZP)("/index.php?c=trans&m=copyevent&client=6&auth_user=key_web_new_fanyi&sign=".concat(t), {
                    baseURL: "//ifanyi.iciba.com",
                    method: "post",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    data: e
                })
```

但是没有后续执行步骤，在此下断点没有用，而且经过尝试，翻译时没出现任何新的网络请求数据包，因此到此结束

旧版本的代码逻辑就是：通过y()对要加密的数据进行MD5转换后截取了16位，再由下一步的代码对这16位MD5的值进行AES加密成sign，所以需要两次转换

至于为什么是MD5还需要在控制台调试y()，再追加断点，找调用源

可参考文章(旧版)：https://superhero.blog.csdn.net/article/details/152009562