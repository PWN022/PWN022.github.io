---
title: HTTP数据包&红蓝队研判&自定义构造&请求方法&请求头修改&状态码判断
published: 2026-01-23 21:00:00
description: 了解HTTP的请求头、响应头、GET/POST请求、方法以及状态码。红队方面内容：通过修改请求头中的内容来进行Cookie身份绕过，或者POST来进行对账号或者密码的爆破等等。蓝队方面内容：流量分析、安全工具流量特征。
tags: [基础入门,HTTP/HTTPS,数据包分析]
category: 网络安全
draft: false
---

# 知识点

1. 请求头&返回包-方法&头修改&状态码等
2. 数据包分析-红队攻击工具&蓝队流量研判
3. 数据包构造-Reqable自定义添加修改请求

### 请求头

| Header               | 说明                                                         | 示例                                                    |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| Accept               | 指定客户端能够接收的内容类型                                 | Accept: text/plain, text/html                           |
| Accept-Charset       | 浏览器可以接受的字符编码集                                   | Accept-Charset: iso-8859-5                              |
| Accept-Encoding      | 指定浏览器支持的压缩编码类型                                 | Accept-Encoding: compress, gzip                         |
| Accept-Language      | 浏览器可接受的语言                                           | Accept-Language: en, zh                                 |
| Accept-Ranges        | 可以请求网页实体的一个或多个子范围字段                       | Accept-Ranges: bytes                                    |
| **Authorization(*)** | **HTTP 授权的授权证书**                                      | **Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==**   |
| Cache-Control        | 指定请求和响应遵循的缓存机制                                 | Cache-Control: no-cache                                 |
| Connection           | 表示是否需要持久连接（HTTP 1.1 默认持久连接）                | Connection: close                                       |
| **Cookie(*)**        | **把保存在该请求域名下的所有 cookie 值一起发送给服务器**     | **Cookie: \$Version=1; Skin=new;**                      |
| Content-Length       | 请求的内容长度                                               | Content-Length: 348                                     |
| Content-Type         | 请求的与实体对应的 MIME 信息                                 | Content-Type: application/x-www-form-urlencoded         |
| Date                 | 请求发送的日期和时间                                         | Date: Tue, 15 Nov 2010 08:12:31 GMT                     |
| Expect               | 请求的特定的服务器行为                                       | Expect: 100-continue                                    |
| From                 | 发出请求的用户的 Email                                       | From: <user@email.com>                                  |
| Host                 | 指定请求的服务器的域名和端口号                               | Host: [www.zcmhi.com](http://www.zcmhi.com)             |
| If-Match             | 只有请求内容与实体相匹配才有效                               | If-Match: "737060cd8c284d8af7ad3082f209582d"            |
| If-Modified-Since    | 如果请求的部分在指定时间之后被修改则请求成功，否则返回 304   | If-Modified-Since: Sat, 29 Oct 2010 19:43:31 GMT        |
| If-None-Match        | 如果内容未改变返回 304 代码，参数为服务器先前发送的 Etag     | If-None-Match: "737060cd8c284d8af7ad3082f209582d"       |
| If-Range             | 如果实体未改变，服务器发送客户端丢失的部分，否则发送整个实体 | If-Range: "737060cd8c284d8af7ad3082f209582d"            |
| If-Unmodified-Since  | 只在实体在指定时间之后未被修改才请求成功                     | If-Unmodified-Since: Sat, 29 Oct 2010 19:43:31 GMT      |
| Max-Forwards         | 限制信息通过代理和网关传送的时间                             | Max-Forwards: 10                                        |
| Pragma               | 用来包含实现特定的指令                                       | Pragma: no-cache                                        |
| Proxy-Authorization  | 连接到代理的授权证书                                         | Proxy-Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ== |
| Range                | 只请求实体的一部分，指定范围                                 | Range: bytes=500-999                                    |
| Referer              | 先前网页的地址，当前请求网页紧随其后，即来路                 | Referer: <http://www.zcmhi.com/archives/71.html>        |
| TE                   | 客户端愿意接受的传输编码，并通知服务器接受尾加头信息         | TE: trailers, deflate;q=0.5                             |
| Upgrade              | 向服务器指定某种传输协议以便服务器进行转换（如果支持）       | Upgrade: HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11          |
| User-Agent           | 包含发出请求的用户信息                                       | User-Agent: Mozilla/5.0 (Linux; X11)                    |
| Via                  | 通知中间网关或代理服务器地址、通信协议                       | Via: 1.0 fred, 1.1 nowhere.com (Apache/1.1)             |
| Warning              | 关于消息实体的警告信息                                       | Warning: 199 Miscellaneous warning                      |

### 响应头

| Header              | 说明                                                         | 示例                                                    |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| Accept-Ranges       | 表明服务器是否支持指定范围请求及哪种类型的分段请求           | Accept-Ranges: bytes                                    |
| Age                 | 从原始服务器到代理缓存形成的估算时间（秒，非负）             | Age: 12                                                 |
| Allow               | 对某网络资源有效的请求行为，不允许则返回 405                 | Allow: GET, HEAD                                        |
| Cache-Control       | 告诉所有缓存机制是否可以缓存及哪种类型                       | Cache-Control: no-cache                                 |
| Content-Encoding    | Web 服务器支持的返回内容压缩编码类型                         | Content-Encoding: gzip                                  |
| Content-Language    | 响应体的语言                                                 | Content-Language: en, zh                                |
| Content-Length      | 响应体的长度                                                 | Content-Length: 348                                     |
| Content-Location    | 请求资源可替代的备用地址                                     | Content-Location: /index.htm                            |
| Content-MD5         | 返回资源的 MD5 校验值                                        | Content-MD5: Q2h1Y2sgSW50ZWdyaXR5IQ==                   |
| Content-Range       | 在整个返回体中本部分的字节位置                               | Content-Range: bytes 21010-47021/47022                  |
| **Content-Type(*)** | **返回内容的 MIME 类型**                                     | **Content-Type: text/html; charset=utf-8**              |
| Date                | 原始服务器消息发出的时间                                     | Date: Tue, 15 Nov 2010 08:12:31 GMT                     |
| ETag                | 请求变量的实体标签当前值                                     | ETag: "737060cd8c284d8af7ad3082f209582d"                |
| Expires             | 响应过期的日期和时间                                         | Expires: Thu, 01 Dec 2010 16:00:00 GMT                  |
| Last-Modified       | 请求资源的最后修改时间                                       | Last-Modified: Tue, 15 Nov 2010 12:45:26 GMT            |
| Location            | 用来重定向接收方到非请求 URL 的位置                          | Location: <http://www.zcmhi.com/archives/94.html>       |
| Pragma              | 包括实现特定的指令，可应用到响应链上的任何接收方             | Pragma: no-cache                                        |
| Proxy-Authenticate  | 指出认证方案和可应用到代理的该 URL 上的参数                  | Proxy-Authenticate: Basic                               |
| Refresh             | 应用于重定向或新资源被创造，在指定秒之后重定向（Netscape 扩展） | Refresh: 5; url=<http://www.zcmhi.com/archives/94.html> |
| Retry-After         | 如果实体暂时不可取，通知客户端在指定时间后再次尝试           | Retry-After: 120                                        |
| Server              | Web 服务器软件名称                                           | Server: Apache/1.3.27 (Unix) (Red-Hat/Linux)            |
| Set-Cookie          | 设置 HTTP Cookie                                             | Set-Cookie: UserID=JohnDoe; Max-Age=3600; Version=1     |
| Trailer             | 指出头域在分块传输编码的尾部存在                             | Trailer: Max-Forwards                                   |
| Transfer-Encoding   | 文件传输编码                                                 | Transfer-Encoding: chunked                              |
| Vary                | 告诉下游代理是使用缓存响应还是从原始服务器请求               | Vary: \*                                                |
| Via                 | 告知代理客户端响应是通过哪里发送的                           | Via: 1.0 fred, 1.1 nowhere.com (Apache/1.1)             |
| Warning             | 警告实体可能存在的问题                                       | Warning: 199 Miscellaneous warning                      |
| WWW-Authenticate    | 表明客户端请求实体应该使用的授权方案                         | WWW-Authenticate: Basic                                 |

### HTTP请求之GET请求

![image-20260123194638966](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123194638966.png)

### HTTP请求之POST请求

![image-20260123194757582](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123194757582.png)

## 请求头&返回包-方法&头修改&状态码等

### 数据包

客户端：请求Request

​	请求方法

​	请求路径

​	请求头

服务端：返回Response

​	状态码

###  方法

1. 常规请求-Get
2. 用户登录-Post

```
get：向特定资源发出请求（请求指定页面信息，并返回实体主体）；

post：向指定资源提交数据进行处理请求（提交表单、上传文件），又可能导致新的资源的建立或原有资源的修改；

head：与服务器索与get请求一致的相应，响应体不会返回，获取包含在小消息头中的原信息（与get请求类似，返回的响应中没有具体内容，用于获取报头）；

put：向指定资源位置上上传其最新内容（从客户端向服务器传送的数据取代指定文档的内容），与post的区别是put为幂等，post为非幂等；

trace：回显服务器收到的请求，用于测试和诊断。trace是http8种请求方式之中最安全的

delete：请求服务器删除request-URL所标示的资源*（请求服务器删除页面）

option：返回服务器针对特定资源所支持的HTML请求方法 或web服务器发送*测试服务器功能（允许客户 端查看服务器性能）；

connect： HTTP/1.1协议中能够将连接改为管道方式的代理服务器
```

### Response状态码

1. 数据是否正常
2. 文件是否存在
3. 地址自动跳转
4. 服务提供错误

注：容错处理识别

```
1xx:指示信息—表示请求已接收，继续处理。

2xx:成功—表示请求已经被成功接收、理解、接受。

3xx:重定向—要完成请求必须进行更进一步的操作。

4xx:客户端错误—请求有语法错误或请求无法实现。

5xx:服务器端错误—服务器未能实现合法的请求。

200 OK：客户端请求成功

301 redirect：页面永久性移走，服务器进行重定向跳转；

302 redirect：页面暂时性移走，服务器进行重定向跳转，具有被劫持的安全风险；

400 BadRequest：由于客户端请求有语法错误，不能被服务器所理解；

401 Unauthonzed：请求未经授权。

403 Forbidden：服务器收到请求，但是拒绝提供服务。

404 NotFound：请求的资源不存在，例如，输入了错误的URL；

500 InternalServerError：服务器发生不可预期的错误，无法完成客户端的请求；

503 ServiceUnavailable：服务器当前不能够处理客户端的请求

3XX
1、网站做了容错处理 一旦访问了错误页面将跳转到某个固定地址 3XX
中间件规则配置
请求路径或文件 不存在

2、网站代码文件做了跳转 一旦触发就自动跳转到设置的固定地址 3XX
文件代码配置
请求路径或文件 存在

200和404误报问题
网站做了容错处理 一旦访问了错误页面将固定显示某个内容 显示正常
访问错误 返回的状态码200
```

## 数据包分析-红队攻击工具&蓝队流量研判

### 红队案例

1. UA头—系统平台

   常见举例影响：

   - 比如网站有UA收集整理功能，如果将UA信息记录到数据库的话，这个过程有接受UA信息及写入数据库的操作，这个地方可能存在SQL注入
   - 渗透测试习惯

   部分网站做了限制设备访问的需求，手机或电脑只能访问一个，如果我们自己要电脑测试需要更改成手机访问才可以继续

2. Cookie—用户身份绕过

3. Post数据—登录爆破

4. 返回状态码—文件探针

### 蓝队案例

1. 攻击漏洞

   sql注入：

   ![image-20260123204531551](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123204531551.png)

   文件上传：

   ![image-20260123205122565](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123205122565.png)

   ![image-20260123205204296](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123205204296.png)

   密码爆破（一般的，密码爆破成功后返回的状态码不是200，而是30x，因为登录成功会跳转）：

   ![image-20260123205448375](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123205448375.png)

2. 安全工具

   安全工具流量特征：

   https://blog.csdn.net/qq_50573282/article/details/140199240

   https://blog.csdn.net/weixin_52371314/article/details/155141108

## 数据包构造-Reqable自定义添加修改请求

以前都是使用POSTMAN，现在这个更好用一些。

![image-20260123210342040](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123210342040.png)

![image-20260123210356535](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123210356535.png)

![image-20260123210422421](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123210422421.png)