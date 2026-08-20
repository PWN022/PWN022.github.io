---
title: 加密数据&算法解密&提交返回还原&扣代码调用&替换库模拟&堆栈定位&特征搜索
published: 2026-08-18 09:44
description: JS逆向中算法解密的完整流程，涵盖请求/返回数据加密定位、断点调试、全局搜索等分析方法，并结合AES-CBC、RSA、Webpack打包等实际案例，演示了如何通过扣代码、沙箱模拟或替代库实现本地解密。
tags:
  - JS
  - JS逆向
  - 算法
category: 网络安全
draft: false
---

# 知识点

1. JS逆向-算法解密-提交数据&返回数据
2. JS逆向-算法解密-扣代码调用&替代库模拟

# 分析方法

根据网络数据包调用堆栈找加密前后定位：当进行登录或者其他功能时，观察数据包的启动器（或者发起程序），根据调用堆栈部分（从下往上）进行定位

根据提交URL,参数名等搜索定位：根据数据包的标头部分的url或者函数进行全局搜索定位

# 请求数据解密1（客户端）：

测试地址：https://login.zhangin.com/

## 分析

登录后看提交参数，找到param:及和调用堆栈文件对应

步骤：输入账号密码登录，账号为`111`，密码为`222`。查看发送的数据包内容：其中给出了`r:0.8099155689910741`，`param:NDJ01Ck0cSvYGSdHstVc6Q==`，且在调用堆栈中也可以看到被调用的js文件

进行全局搜索关键字`param:`，搜索之后可以再和发送数据包中的调用堆栈部分再次进行确认是否为当前js文件，之后定位到具体代码段：

```js
const q = {
    param: O // 猜测`O`就是被加密的数据
};
g0.checkPhoneAndPwd(q).then(z => {
    const j = (z + "").split("888");
    h(j)
}
)
......      
```

为了验证，在`g0`处打断点（不在上面代码打断点的原因是，上面的代码如果未经加密还得逐步往下走，在g0处打断点就可以看出调用的是否为经过加密后的数据）

打完断点，输入账号密码再进行登录可以看到：

```
q:
  param: "NDJ01Ck0cSvYGSdHstVc6Q=="
  
O: "NDJ01Ck0cSvYGSdHstVc6Q=="
```

## 测试

下数据加密后断点，追踪za(c.value, S)，AES算法条件模式测试

```js
		c.value = !0;
        const A = r.phone.trim()
         , g = r.password.trim()
         , w = r.verificationCode.trim();
        let S;
        w && w != "" ? S = A + "<><>" + g + "<><>" + w : S = A + "<><>" + g;
        const O = Ia(f.value, S);
        try {
            const q = {
                 param: O
           };
```

关键代码：`const O = Ia(f.value,S)`，从这里看出O是如何进行加密的，断点后的数据如下：

```
A: "111"
    
O: "NDJ01Ck0cSvYGSdHstVc6Q=="
    
S: "111<><>222"
    
g: "222"
    
w: ""
```

以上可以分析出：A是手机号（账号）部分，S即为加密后的`账号<><>密码`，g也是密码块，因为没有验证码步骤所以w为空

由此可知：核心就是`Ia`函数，以及还存在未知的参数`f.value`

鼠标悬浮在`Ia`处就会显示此函数在代码块的行数，点击进去可以看到：

```js
  , Ia = (e, n) => {
    const r = S0.enc.Latin1.parse(e)
      , t = S0.enc.Latin1.parse(e);
    return S0.AES.encrypt(n, r, {
        iv: t,
        mode: S0.mode.CBC,
        padding: S0.pad.ZeroPadding
    }).toString()
}
```

从这里可以确定为AES加密

其中`n`为需要加密的数据、`r`为密钥、`t`为偏移量、`CBC`为模式、`ZeroPadding`为填充

偏移量：`t = S0.enc.Latin1.parse(e);`，而e来源于`Ia = (e, n)`，所以这里做一个表格得知这两个都是Ia的第一个参数

回到断点处，`const O = Ia(f.value, S);`，将鼠标悬浮到`f.value`，可以看到数据为：`54oQDepNSHj4zCuP`


| 参数  | 含义  |    来源    |        值         |
| :-: | :-: | :------: | :--------------: |
|  t  | 偏移量 | Ia的第一个参数 | 54oQDepNSHj4zCuP |
|  r  | 密钥  | Ia的第一个参数 | 54oQDepNSHj4zCuP |

现在知道了是如何进行加密的，进行测试（使用平台或软件皆可）

加密密钥和IV：`54oQDepNSHj4zCuP`、模式选择CBC、填充选择ZeroPadding、编码为Base64

输入明文：`111<><>222`，得到密文：`NDJ01Ck0cSvYGSdHstVc6Q==`，与数据包的一致

# 请求数据解密2：（客户端，单个使用扣代码模拟）

测试地址：https://auth.xincheng.com/

## 分析

登录后看调用堆栈下断点，找到hidetxtPassword

输入账号为`1234`，密码为`1234`，验证码为`023123`。查看数据包中的内容：

`vcode`：`023123`

`hidetxtPassword`：`QQc4320eLkdnI74wvM+hLlIQU45eavnAh8g9uBw+cYCjfP1zfv/6QyEh+Y6yAwyWOVb5qtXKebBnKjxZ3hivGwthSYgTngrmIMKtRGXa4mE1FEJ/z3JhvInclAhEKZ20cskw7vkMFkt3R7HGQ9VODqex6eQgsgpD/0kr9iniNW+hfbXS9KhSvW46xAdzUq9RO9x8oHoiD3yEEVyp+n+++kozio3FXRjLeRjVWRF5mT4uIvxRLu350lAkY4yJiVKvsfEcfkp2xUMTeQwXV1ZYnv4Zmy7CsdR7CapPx38uEE0/FPqXi0Ng3RcbYVPxlAP9FvRmHiy0ek9UjvAPTl2uJg==`

`txtUserName`：`1234`

启动器调用堆栈中：

|    函数    |     |           位置            |
| :------: | :-: | :---------------------: |
|   send   |  @  | jquery-1.10.2.min.js:23 |
|   ajax   |  @  | jquery-1.10.2.min.js:23 |
|  login   |  @  |        （索引）:757         |
|   （匿名）   |  @  |        （索引）:653         |
| dispatch |  @  | jquery-1.10.2.min.js:22 |
| v.handle |  @  | jquery-1.10.2.min.js:22 |

查看login的代码段：

```js
 jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: "LoginService.ashx",
                data: { vcode: $("#vcode").val(), lang: 'en-us', systemCode: $("#systemCode").val(), rememberPassword: false, challengeNumber: $("#challengeNumber").val(), randomDate: randomDate, hidetxtPassword: hidetxtPassword, txtIsTrustAccessor: $("#txtIsTrustAccessor").val(), txtUserName: submitusername, txtVerificationCode: "" },
                cache: false,
                success: function (result) {
                    logining = false;
                    if (result.Success) {
                        passwordwrongNum = 0;
                        passwordwrongNum2 = 0;
                        DelDeadLineToCookie(cookie_loginmsgexp + submitusername);
                        $("#btnLogin").html('登录成功...');
                        GetLRTokenAndBpm();
                        setTimeout(function () { RedirectReturnUrl() }, 3000);
                    }
```

断电在`data`处，进行登录，右侧的调用堆栈显示在`login`，此时的密码是已经被加密的，`hidetxtPassword：Gi%2F1......`

```js
// 点击到c时，跳转代码段，部分内容如下
 if (l[a].apply(t[0], t[1]) === !1 && e.stopOnFalse)
```

断点在`success`处，再次进行登录，右侧调用堆栈显示在`success`，此时是已经业务逻辑执行完毕的状态，提示用户不存在等等信息，但不知道密码是否在登录前就被加密了，右侧调用堆栈再点击`c`，查看`t`，再往下点击到`0`的数据中出现了`data`，内容为：`vcode=023123&lang=en-us&systemCode=&rememberPassword=false&challengeNumber=&randomDate=2026-08-18+12%3A33%3A58&hidetxtPassword=Gi%2F1wJh92rMzQpvRSwT2wEBBJDm96vdEUyvV0XQEzfSZwWCNHwH5dlT4y%2FP43afz98CD1VmXfMtuQpDUpI4D1MIDpaYRKuEq2rDfDdn%2BTMuB4tgCSE6ftf5EiSU0YwlxWniURhnecKjGPdgwyZNXnF%2FOQfSDQ1uk5Dvx8yHIuPndBXYsu6GQAu8ul7GvSnFohhUH7N1PfbflhaZtJPDGbwmTprTetvMv5Jma73fdDcoym1xMZ%2Fmjld6GNHQKC35hyXgm4ongvda1lSFRBCOWIu5tPQqUmKsBQvNR8MBp7OvRgSJOFwoYJlgsvRmGXgAH0uOK1E0qDd0EWGryLuANCA%3D%3D&txtIsTrustAccessor=True&txtUserName=1234&txtVerificationCode=`，由此可以说明**在登录（发包）前就已经进行加密了，注意：不一定是在`c`处，也可能是在之前**

## 测试

追踪hidetxtPassword数据处理，找到引用加密JS下载测试

目标是查找到具体的加密代码段。经过上述步骤，于是再往上翻阅代码段，发现了加密的核心代码：

```js
var encrypt = new JSEncrypt();
encrypt.setPublicKey($("#Public_key").val());
hidetxtPassword = encrypt.encrypt($("#txtPassword").val());
```

将鼠标悬浮到`JSEncrypt`，发现来源于`jsencrypt.min.js:73`，通过解析以上代码，现在只需要得知`public_key`是什么数据，即可进行在本地对加密的复刻，因此来全局搜索一下`public_key`

```html
<textarea id="Public_key" rows="15" style="width: 100%; display: none;">MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAynjrCVuQRQscFBs+f9MBN6HA7ES9E/elS8wyJspi/N0dBXPmimgtdvDV/QI4BkE4irvM0vMJIEZzQJ22TEimD0oi4e9aMF5u+82/oIFEaCuAkdpxuF9XWfC5HNFivRzdMaX80UOajOkx+8cVjaiaXxR9KFFkJwyHv88v0B08vJHaSpP7igSJAAon0htj43JwZSNDQWQNkkw18zISGKASIz9ZNik00CAWXNEnkOq7bLClcp4yH4gGz/USf0PJimTWjfDLNRhvdwn9YlZpjepQTPux3BWzhBu1pMB0QtZd1SKxLMsrMV9yn9TUIVllg1B8eE+f1fbyZfS+SwQAE6u+xQIDAQAB</textarea>
```

现在就可以通过下载js文件：`jsencrypt.min.js`，之后创建一个html文件通过调用该js来实现对密码的加密（非对称加密）

```html
    <input type="text" id="txtPassword" value="1234">
    <button onclick="encryptPassword()">Encrypt Password</button>
    <div id="result"></div>
    <script src="jsencrypt.min.js"></script>
    <script>
        var public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAynjrCVuQRQscFBs+f9MBN6HA7ES9E/elS8wyJspi/N0dBXPmimgtdvDV/QI4BkE4irvM0vMJIEZzQJ22TEimD0oi4e9aMF5u+82/oIFEaCuAkdpxuF9XWfC5HNFivRzdMaX80UOajOkx+8cVjaiaXxR9KFFkJwyHv88v0B08vJHaSpP7igSJAAon0htj43JwZSNDQWQNkkw18zISGKASIz9ZNik00CAWXNEnkOq7bLClcp4yH4gGz/USf0PJimTWjfDLNRhvdwn9YlZpjepQTPux3BWzhBu1pMB0QtZd1SKxLMsrMV9yn9TUIVllg1B8eE+f1fbyZfS+SwQAE6u+xQIDAQAB";
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(public_key);
        
        function encryptPassword() {
            var txtPassword = document.getElementById('txtPassword');
            var password = txtPassword.value;
            var encrypted = encrypt.encrypt(password);
            document.getElementById('result').textContent = encrypted;
        }
    </script>
```

# 返回数据解密1：（服务端，单个使用扣代码模拟）

测试地址：在fofa中寻找类似带有榜单的网站

## 分析

URL定位后断点，算法的方法就是webInstace.shell

调用堆栈过多的情况下，优先查看数据包的URL或者参数对关键词进行全局搜索

该站的是：`GetData.ashx`，搜索结果显示为`Common.js`有相关内容，而且通过对比调用堆栈的文件，`Common.js`也在其中

```js
$.ajax({
            url: n + "/API/GetData.ashx",
            data: t + "&MethodName=" + e,
            type: "POST",
            dataType: "text",
            timeout: 3e4,
            success: function(e, t, n) {
                try {
                    1 == (e = "{" == e[0] ? JSON.parse(e) : JSON.parse(webInstace.shell(e))).Status || 200 == e.Code ? r(e.Data) : 200 == e.code ? r(e.data) : a(e.Msg)
             } catch (e) {
                    a(e)
                }
            },
```

一步步调试，发现数据在加载时，右侧的`e`出现了`Data`，具体情况如下（举例其中一个数组）：

```
e:
	Data:
		Table: Array(5)
			0:
			InteractCount: 3453162
			StarCount: 22
			brand_id: 56862
			brand_name: "天猫Tmall"
			cover_logo_url: "https://images.endata.com.cn/group2/M00/32/C6/wKgASmpoz9GAFGbFAAARgVL_5tI809.jpg"
			irank: 1
```

将鼠标悬浮到`JSON.parse(webInstace.shell(e))`时，`e`的数据为明文。为了确保`e`究竟是什么，可以在控制台中输入`e`即可打印出数据

以上，所以猜测是在`JSON.parse(webInstace.shell(e))`对返回数据进行了加密，鼠标悬浮到上面发现来自于：`webDES.min.js?2022.8.19.4:1`，通过关键字`DES`就可以发现该文件就是加密的地方

之后打开`webDES.min.js`文件，发现大概率是打包的代码，因为全都是`_0xa0c834`等等这种经过混淆的代码，如果不确定，可以将当前js文件下载，然后**投喂给ai，让ai识别**，但是**在没有明显特征的情况下，ai也可能分辨不出来，这时候需要自行全局搜索webpack等关键词来进行辨别**

## 测试

下载JS文件，Webpack打包利用Node运行调用（借助AI）

在控制台尝试调用`webInstace.shell`：

```js
// 1. 检查 webInstace 是否可用
console.log('webInstace 类型:', typeof webInstace);
if (typeof webInstace === 'undefined') {
    console.error('webInstace 未定义，请确保页面已加载并执行了 new webDES()');
} else {
    // 2. 定义密文（使用 let 避免重复声明错误）
    let raw = "数据包中的密文";

    // 3. 调用解密方法
    let decrypted = webInstace.shell(raw);
    console.log('解密后字符串 (长度 ' + decrypted.length + '):', decrypted);

    // 4. 尝试解析为 JSON
    try {
        let jsonResult = JSON.parse(decrypted.trim());
        console.log('JSON 解析成功:', jsonResult);
    } catch (parseErr) {
        console.error('JSON 解析失败，可能解密结果不是合法 JSON:', parseErr.message);
        console.log('原始解密内容:', decrypted);
    }
}
```

因为js文件是经过打包之后的，所以不能与平常调用js文件那样操作，询问ai给出方案

新建`run,js`，代码如下：

```js
const vm = require('vm');
const fs = require('fs');

// 1. 读取混淆脚本
const code = fs.readFileSync('./webDES.min.js', 'utf8');

// 2. 创建沙箱上下文（模拟浏览器全局对象）
const sandbox = {
    // 基础 Node 工具（供代码内部调试用，非必须）
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,

    // ----- 模拟浏览器核心对象（尽量接近真实）-----
    // window / self / global 互相引用
    window: null,
    self: null,
    global: null,
    
    // navigator（加一些常见属性，防止 undefined 报错）
    navigator: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        platform: 'Win32',
        language: 'zh-CN',
        appName: 'Netscape',
        appVersion: '5.0'
    },

    // location（部分脚本会读协议）
    location: {
        href: 'http://localhost:3000/',
        protocol: 'http:',
        host: 'localhost:3000',
        origin: 'http://localhost:3000'
    },

    // document（最小实现，但保留常见方法）
    document: {
        createElement: (tag) => ({
            style: {},
            appendChild: () => {},
            setAttribute: () => {}
        }),
        getElementById: () => null,
        addEventListener: () => {},
        body: { appendChild: () => {} },
        createEvent: () => ({ initEvent: () => {} })
    },

    // 如果 Webpack 用到
    webpackJsonp: [],

    // ----- 等待脚本挂载的出口变量 -----
    webInstace: undefined,
    _grsa_JS: undefined,
    webDES: undefined
};

// 3. 建立循环引用（让 window.self === window）
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.global = sandbox;

// 4. 创建独立的 V8 上下文
vm.createContext(sandbox);

// 5. 在沙箱中执行脚本
try {
    vm.runInContext(code, sandbox, {
        filename: 'webDES.min.js',
        displayErrors: true
    });
    console.log('脚本执行完毕');
    console.log('webInstace 类型:', typeof sandbox.webInstace);
    console.log('_grsa_JS 类型:', typeof sandbox._grsa_JS);
    console.log('webDES 类型:', typeof sandbox.webDES);

    // 6. 如果挂载成功，尝试解密
    if (typeof sandbox.webInstace !== 'undefined') {
        const encrypted = "数据包的密文";
        const result = sandbox.webInstace.shell(encrypted);
        console.log('解密结果:', result);
    } else {
        console.error('webInstace 未挂载，脚本可能因环境检测而跳过核心逻辑');
        // 辅助：看沙箱里有没有其他可疑对象
        const keys = Object.keys(sandbox).filter(k =>
            k.includes('web') || k.includes('grsa') || k.includes('DES')
        );
        console.log('沙箱内相关键:', keys);
    }
} catch (err) {
    console.error('沙箱执行报错:', err.message);
    console.error(err.stack);

}
```

之后在终端运行：`node run.js`

# 返回数据解密2：（服务端，多个使用替代库模拟）

测试地址：https://www.weibotop.cn/

## 分析

npm init -y

npm install crypto-js

key来源：定义一个常量s，SHA1加密后获取一个值，并取前32位

AES解密：o是需要解密的字符串，r是key，mode是ECB，iv不需要

可以参考文章：


与之前的不同，现在发现`client-encrypt.ts`的具体代码为：

```js
/**
 * 前端加解密工具
 * 使用 AES-256-CBC 加密
 */

import CryptoJS from 'crypto-js';

// 密钥和 IV（前端使用 NEXT_PUBLIC_ 前缀）
const ENCRYPT_KEY = process.env.NEXT_PUBLIC_ENCRYPT_KEY || '';
const ENCRYPT_IV = process.env.NEXT_PUBLIC_ENCRYPT_IV || '';

/**
 * 加密数据
 */
export function encrypt(data: unknown): string {
  if (!ENCRYPT_KEY || !ENCRYPT_IV) {
    console.warn('Encryption key not configured, returning plain data');
    return JSON.stringify(data);
  }

  const key = CryptoJS.enc.Hex.parse(ENCRYPT_KEY);
  const iv = CryptoJS.enc.Hex.parse(ENCRYPT_IV);

  const jsonStr = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonStr, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
}

/**
 * 解密数据
 */
export function decrypt<T = unknown>(encryptedData: string): T {
  if (!ENCRYPT_KEY || !ENCRYPT_IV) {
    console.warn('Encryption key not configured, parsing as JSON');
    return JSON.parse(encryptedData) as T;
  }

  try {
    const key = CryptoJS.enc.Hex.parse(ENCRYPT_KEY);
    const iv = CryptoJS.enc.Hex.parse(ENCRYPT_IV);

    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const jsonStr = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    // 如果解密失败，尝试直接解析（兼容模式）
    console.warn('Decrypt failed, trying to parse as JSON');
    return JSON.parse(encryptedData) as T;
  }
}

/**
 * 检查是否启用加密
 */
export function isEncryptionEnabled(): boolean {
  return !!(ENCRYPT_KEY && ENCRYPT_IV && ENCRYPT_KEY.length === 64 && ENCRYPT_IV.length === 32);
}
```

直接在`try`部分的返回json格式数据处打断点，`key`和`iv`其实在某个js文件中就已经给出了：

```
let a = () => c.env.SECURITY_ENCRYPT_KEY || "aa6218e56ddc05e908ec0842ae36fb8746b38cd6b7dc140b8df6826ca00b81d8"
, u = () => c.env.SECURITY_IV || "fc3c868a2ffa7d1d45bccc0a4b4f4cca";
```

## 测试

安装`crypto-js`依赖，然后使用ai分析给出代码，成功解密数据：

```js
const CryptoJS = require('crypto-js');

// ----- 替换为你的密钥和 IV -----
const keyHex = 'aa6218e56ddc05e908ec0842ae36fb8746b38cd6b7dc140b8df6826ca00b81d8';
const ivHex  = 'fc3c868a2ffa7d1d45bccc0a4b4f4cca';

// ----- 将你抓包得到的密文（Base64 字符串）粘贴到这里 -----
const ciphertextBase64 = `这里粘贴你的密文（去掉换行）`;

// 解析密钥和 IV
const key = CryptoJS.enc.Hex.parse(keyHex);
const iv = CryptoJS.enc.Hex.parse(ivHex);

try {
    // 解密
    const decrypted = CryptoJS.AES.decrypt(ciphertextBase64, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    // 转为 UTF-8 字符串
    const jsonStr = decrypted.toString(CryptoJS.enc.Utf8);

    if (!jsonStr) {
        console.error('解密结果为空，可能密钥/IV/密文不匹配');
        process.exit(1);
    }

    // 尝试解析为 JSON
    const parsed = JSON.parse(jsonStr);
    console.log('解密成功，结果如下：');
    console.log(JSON.stringify(parsed, null, 2));
} catch (err) {
    console.error('解密失败:', err.message);
    console.error('请检查：');
    console.error('  - 密钥和 IV 是否正确（Hex 格式）');
    console.error('  - 密文是否为 Base64 编码（URL 解码后的原始值）');
    console.error('  - 填充模式是否为 Pkcs7（代码中已指定）');
}
```

