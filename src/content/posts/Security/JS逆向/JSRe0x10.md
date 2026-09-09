---
title: 安全辅助项目&Yakit热加载&魔术方法&模版插件语法&JSRpc进阶调用&接口联动
published: 2026-09-09 10:50
description: Yakit热加载实现不中断服务动态更新代码，结合JS逆向与JsRpc，灵活处理前端签名、AES加密等场景，通过魔术方法在请求前后自动加解密，提升接口测试效率。
tags:
  - JS
  - JS逆向
  - JSRpc
  - 热加载
category: 网络安全
draft: false
---

# 知识点

1. JS逆向-项目-项目联动&自动接口&Yakit热加载

# Yakit的热加载

参考：https://yaklang.com/products/Web%20Fuzzer/fuzz-hotpatch

核心比喻：给汽车换发动机，但不用停车
想象一下，你正在高速公路上开着车（这辆车就是 Yakit），你的任务是不断测试路边的各种设施（这相当于执行安全测试 任务）。

突然，你觉得车的发动机（这相当于一个插件 或者一段检测逻辑）不够给力，或者发现它有个小毛病，你想换一个新的。

如果没有热加载：
你得先把车完全停下来（关闭Yakit），然后熄火，打开引擎盖，把旧发动机拆下来，换上新发动机，再点火启动，重新挂挡、踩油门回到高速上。整个过程非常耗时，你的测试工作被中断了。

有了热加载：
你发现发动机需要更换。这时，你只需要在车里按一个按钮，一个新的发动机就“嗖”的一下在空中替换了旧的发动机。你的车从头到尾都没有停，一直在高速行驶，测试工作一秒都没有中断。 这个“空中换发动机”的神奇操作，就是 热加载。

总结一下，热加载是干嘛的？
热加载就是：让你在不停下Yakit主程序的情况下，立刻、马上让修改过的或新写的代码生效。

## 热加载的模版内容

```
格式：{{yak(函数名|参数名)}}
如密码：{{yak(upper|{{x(pass_top25)}})}}
```

## 热加载的代码

```
函数名 = func(参数名) {
    return 参数名
}

例子：
upper = func(s) {
    // 传入的参数，类型为字符串，返回值可以是字符串或数组
    return s.Upper()
}
```

## 热加载中的魔术方法

```
// beforeRequest 允许发送数据包前再做一次处理，定义为 func(origin []byte) []byte
beforeRequest = func(req) { 
    return []byte(req)
}
 
// afterRequest 允许对每一个请求的响应做处理，定义为 func(origin []byte) []byte
afterRequest = func(rsp) {
    return []byte(rsp)
}
```

## 案例0-前端验证签名（HMAC-SHA256）

```
热加载的模版内容：
{{yak(signRequest|admin|{{x(pass_top25)}})}}
```

```
热加载的代码：
func sign(user, pass) {
    return codec.EncodeToHex(codec.HmacSha256("1234123412341234", f`username=${user}&password=${pass}`)~)
}

signRequest = result => {
pairs := result.SplitN("|", 2)
    dump(pairs)
    return sign(pairs[0], pairs[1])
}
```

首先在规则->设置变量->选择fuzztag

```
变量名：password
变量值：{{x(pass_top25)}}
```

```
数据包：
错误示例：
password：{{x(pass_top25)}} //这样设置会出问题,如果两处都这样的话,会进行25*25次
{
  "signature": "{{yak(signRequest|admin|{{x(pass_top25)}})}}",
  "key": "31323334313233343132333431323334",
  "username": "admin",
  "password": "{{x(pass_top25)}}"
}

正确示例：
{
  "signature": "{{yak(signRequest|admin|{{param(password)}})}}",
  "key": "31323334313233343132333431323334",
  "username": "admin",
  "password": "{{param(password)}}"
}
```

## 案例1：前端加密登陆（AES-CBC）

在`Yak Runner`中：

```
data = {
  "data": "8MpsnCnixFWo67G+vrZ1Ge712JIpiDjPQvLeqNMoHdTyeMpbAdk7hnna6589oTdH",
  "key": "31323334313233343132333431323334",
  "iv": "bfeb9fdf041beaa31a1f136700f5e25c"
}
 
keyBytes = codec.DecodeHex(data.key)~
ivBytes = codec.DecodeHex(data.iv)~
 
a = codec.AESCBCDecryptWithPKCS7Padding(
keyBytes,
codec.DecodeBase64(data.data)~,
ivBytes
)~
println(string(a))
```

```
热加载的模版内容
{{base64({{yak(aescbc|{"username":"admin","password":"{{x(pass_top25)}}"})}})}}
```

```
热加载的代码
aescbc = result => {
result = codec.AESCBCEncryptWithPKCS7Padding(
codec.DecodeHex(`31323334313233343132333431323334`)~,
result,
codec.DecodeHex(`bfeb9fdf041beaa31a1f136700f5e25c`)~,
    )~
    return string(result)
}
```

## 案例2：Yakit+JsRpc+热加载（魔术方法）

1、上线jsrpc

命令终端执行：`window_amd64.exe`

浏览器控制台执行：`resouces/JsEnv_Dev.js`

```
var demo = new Hlclient("ws://127.0.0.1:12080/ws?group=zzz");
```

2、浏览器控制台执行加密代码并定义加密方法

```
function _0x2fe90c(_0x1d8ccd, _0x579d33) {
    return _0x4f79d5(_0x1d8ccd - -0x6d, _0x579d33);
}
 
function _0x4f79d5(_0x8e93b8, _0x5e1416) {
    return _0x30d2(_0x8e93b8 - 0x26, _0x5e1416);
}
 
function _0x30d2(_0xb85c4e, _0xd19a71) {
    const _0x30d2f4 = _0xd19a();
    return _0x30d2 = function(_0x37ab03, _0x251c3f) {
_0x37ab03 = _0x37ab03 - 0x156;
        let _0x362566 = _0x30d2f4[_0x37ab03];
        return _0x362566;
    }, _0x30d2(_0xb85c4e, _0xd19a71);
}
 
function encrypts_aes(data) {
    const _0x67b862 = CryptoJS.enc.Utf8.parse('1234567890123456');
    const _0x2d9cd5 = CryptoJS.enc.Utf8.parse('1234567890123456');
    const _0x1375d7 = CryptoJS.AES.encrypt(data, _0x67b862, {
        'iv': _0x2d9cd5,
        'mode': CryptoJS.mode.CBC,
        'padding': CryptoJS.pad.Pkcs7
    }).toString();
    return _0x1375d7;
}
```

3、注册jsrpc调用方法

```
demo.regAction("decrypt", function (resolve,param) {
    //这样添加了一个param参数，http接口带上它，这里就能获得
    var base666 = encrypts_aes(param)
    resolve(base666);
})
```

4、yakit添加jsrpc接受处理

在yakit的插件仓库下载jsrpc

```
handle=func getEnc(data){
parsedData = json.dumps(data);
rsp,rep,err = poc.Post("http://127.0.0.1:12080/go",poc.replaceBody("group=zzz&action=decrypt&param="+parsedData, false),poc.appendHeader("content-type", "application/x-www-form-urlencoded"))
    if(err){return(err)
    }
 
    return json.loads(rsp.GetBody())["data"]
}
```

5、添加热加载逻辑

```
模版内容：{{yak(jsrpcReq|{{payload(pass_top25)}})}}
```

```
热加载代码：
jsrpcReq = func(origin /*string*/) {
    // JSrpc的group
group = "zzz";
    // jsrpc的action
action = "decrypt";
 
    if (origin[0] == "{") {
rsp, rep = poc.Post(
            "http://127.0.0.1:12080/go",
poc.replaceBody("group=" + group + "&action=" + action + "&param=" + json.dumps(origin), false),
poc.appendHeader("content-type", "application/x-www-form-urlencoded")
        )~
        return json.loads(rsp.GetBody())["data"];
    } else {
rsp, rep = poc.Post(
            "http://127.0.0.1:12080/go",
poc.replaceBody("group=" + group + "&action=" + action + "&param=" + codec.EncodeUrl(origin), false),
poc.appendHeader("content-type", "application/x-www-form-urlencoded")
        )~
        return json.loads(rsp.GetBody())["data"];
    }
}
 
// beforeRequest 允许在每次发送数据包前对请求做最后的处理，定义为 func(https bool, originReq []byte, req []byte) []byte
// https 请求是否为https请求
// originReq 原始请求
// req 请求
beforeRequest = func(https, originReq, req) {
    // 我们可以将请求进行一定的修改
postParams = poc.GetAllHTTPPacketPostParams(req /*type: []byte*/)
    
encryptedParam = jsrpcReq(postParams["encryptedData"])
req = poc.ReplaceHTTPPacketPostParam(req, "encryptedData", encryptedParam)
    // 将修改后的请求返回
    return []byte(req)
}
```

- poc.GetAllHTTPPacketPostParams 从传入的req数据包中获取所有Post参数
- jsrpcReq 将 encryptedData 的值发送到jsRpc的API中，返回值是加密后的参数值
- poc.ReplaceHTTPPacketPostParam 替换req中Post参数名为encryptedData的参数值，然后将修改后的数据包返回

补充异步：

https://mp.weixin.qq.com/s/amnuUWLBRg3Cqb70PLgYMQ

https://mp.weixin.qq.com/s/udTWXcmXhr3w34Xp-LEaTg

https://mp.weixin.qq.com/s/HlVc0DGjSSSdbw7z6Ae09g