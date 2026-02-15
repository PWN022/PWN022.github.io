---
title: JS应用&原生代码&BOM浏览器对象&DOM文档树&XSS重定向&安全实例
published: 2026-02-15 12:00:00
description: js DOM/BOM 核心操作与 Web 安全实战，涵盖 URL 重定向、DOM 型 XSS 漏洞原理及利用，通过代码审计案例演示 location.hash、document.write() 等危险接收器的攻击向量与防御思路。
tags: [Web开发,JS]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-原生JS-DOM树&BOM对象
2. 安全开发-原生JS-DOM安全&安全案例

![image-20260215092850697](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215092850697.png)

JavaScript被广泛用于Web应用开发，常用来为网页添加各式各样的动态功能,为用户提供更流畅美观的浏览效果。嵌入动态文本于HTML页面；对浏览器事件做出响应，读写HTML元素，在数据被提交到服务器之前验证数据；检测访客的浏览器信息；控制用户凭据，包括创建和修改等。

# 安全结合

1. 发现更多的有利用价值的信息（URL、域名、路径等等）

   测试站、后台路径、未公开的路径、api地址等等

2. 发现敏感信息（硬编码的帐号、pass、API密钥、注释等等）

   硬编码帐号可登录、测试帐号可被登录、密钥泄露、注释中开发信息等等

3. 发现危险的代码（eval、dangerouslySetInnerHTML等等）

   URL跳转，XSS跨站、模版注入（SSTI）等

4. 了解网站的逻辑校验功能

   前端检测，加密逆向，数据走向等

# 学习文档

原生JS教程

https://www.w3school.com.cn/js/index.asp

# DOM (Document Object Model)文档对象模型

BOM包括DOM，DOM属于BOM。

1. 访问文档：可以动态获取和修改页面上的内容

   ```js
   <a id = "lianjie" href = "http://www.baidu.com">点我</a>
   
   <script>
       // 获取id为lianjie的值，并修改为bilibili.com
       document.getElementById("lianjie").href = "http://www.bilibili.com";
   </script>
   ```

2. 修改文档结构：可以添加、删除、移动或替换元素

   ```js
   <a id = "lianjie">点我</a>
   
   <script>
       var a = document.getElementById("lianjie");
   	a.setAttribute("href","http://www.baidu.com");
   </script>
   ```

3. 处理事件：为页面元素绑定和响应交互事件(如点击、悬停等)

   ```js
   // 用js写的弹窗事件
   <button onclick="func()">点我</button>
   <script>
       function func(){
       	alert("1");
   }
   </script>
   
   // 用DOM写的弹窗事件
   <button id="bn">点我</button>
   <script>
       var bn = document.getElementById("bn");
   	bn.onclick = function(){
           alert("xxx");
       }
   </script>
   ```

4. 核心

   说直白点就是操作`HTML`页面中的各种各样的标签内容，所有的操作都是在本地浏览器完成，没有什么流量请求。

   ![image-20260215104718850](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215104718850.png)

   | 基于DOM的漏洞                                    | 接收器示例               |
   | :----------------------------------------------- | :----------------------- |
   | DOM型跨站攻击(DOM XSS)                           | document.write()         |
   | 打开重定向(Open redirection)                     | window.location          |
   | 操纵cookie(Cookie manipulation)                  | document.cookie          |
   | JS注入(JavaScript injection)                     | eval()                   |
   | 文档域操作(Document-domain manipulation)         | document.domain          |
   | WebSocket-URL中毒(WebSocket-URL poisoning)       | WebSocket()              |
   | 操纵链接(Link manipulation)                      | element.src              |
   | 操纵网络消息(Web message manipulation)           | postMessage()            |
   | Ajax请求头操作(Ajax request header manipulation) | setRequestHeader()       |
   | 本地文件路径操作(Local file-path manipulation)   | FileReader.readAsText()  |
   | 客户端SQL注入(Client-side SQL injection)         | ExcuteSql()              |
   | HTML5存储操作(HTML5-storage manipulation)        | sessionStorage.setItem() |
   | 客户端XPath注入(Client-side XPath injection)     | document.evaluate()      |
   | 客户端JSON注入(Client-side JSON injection)       | JSON.parse()             |
   | DOM数据操作(DOM-data manipulation)               | element.setAttribute()   |
   | 拒绝服务(Denial of service)                      | RegExp()                 |

# BOM (Browser Object Model)浏览器对象模型

1. 使用Window对象对浏览器打开关闭返回新建进行操作。

   ```js
   // 在index.html中
   <script>
       console.log(window);
       window.open("http://www.baidu.com");
   </script>
   // 访问index的同时就会重新打开一个百度标签
   ```

   `Window`是最高的等级对象，下面可以链接其他对象：

   ```js
   window.document.getElementById() 等同于 document.getElementById()
   window.screen.width 等同于 screen.width
   ```

2. 使用Screen对象窗口的screen属性包含有关客户端显示屏的信息。

   ```js
   <script>
   	// 获取显示屏宽高
       console.log(screen.height);
       console.log(screen.width);
   	console.log(screen);
   </script>
   ```

3. 使用Navigator对象指浏览器对象，包含浏览器的信息。

   ```js
   <script>
   	console.log(navigator);
   	console.log(navigator.appName);
   	console.log(navigator.appVersion);
   	console.log(navigator.userAgent);
   </script>
   ```

4. 使用Location对象Location对象包含有关当前URL的信息。

   ```js
   <script>
   	console.log(location);
   	console.log(location.host);
   	console.log(location.hostname);
   	console.log(location.protocol);
   	console.log(location.port);
   </script>
   ```

5. 使用History对象包含用户访问过的URL，经常使用于页面跳转。

   ```js
   <script>
   	history.back();
   	history.forward();
   </script>
   ```

6. 使用Document对象指文档对象，既属于BOM对象，也属于DOM对象。

   `DOM`是`BOM`的其中一个分类。

   ```
   window.document.getElementById() 等同于 document.getElementById()
   ```

# 案例

## URL重定向

```
# 后面的内容称为片段标识符（fragment identifier）
浏览器不会把 # 后面的内容发送到服务器
但JavaScript可以通过 window.location.hash 获取到这部分内容
```

代码如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <a id="lianjie">点我</a>
</body>
<script>
    // 实现：获取用户访问的url里面的域名，将其作为点我的触发链接
    // 不知道获取location什么值可以先用控制台打印出来
    console.log(window.location);

    var url = window.location.hash;
    // 只获取#号之后的内容
    var urls = url.substring(1);

    //把点我中的a标签里面新增一个href设置为用户输入的参数值
    document.getElementById("lianjie").href = urls;
</script>
</html>
```

![image-20260215111025319](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215111025319.png)

之后在#号后输入url：

```
http://www.baidu.com
```

点击点我之后直接跳转到百度。

代码存在严重的安全隐患：

```
document.getElementById("lianjie").href = urls;  // 用户可以输入任意URL
```

攻击者可能构造恶意链接：

```
http://your-site.com/#javascript:alert('XSS攻击')
http://your-site.com/#data:text/html,<恶意脚本>
http://your-site.com/#http://恶意网站.com
```

### 访问链接直接跳转

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <a id="lianjie">点我</a>
</body>
<script>
    var hash = location.hash;
    console.log(hash);
    if(hash){
        var url = hash.substring(1);
        console.log(url);
        location.href = url;
    }
</script>
</html>
```

## DOM-XSS

参考：https://mp.weixin.qq.com/s/iUlMYdBiOrI8L6Gg2ueqLg

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <a id="lianjie">点我</a>
</body>
<script>
    var hash = location.hash;
    console.log(hash);
    if(hash){
        var url = hash.substring(1);
        console.log(url);
        location.href = url;
    }
</script>
</html>
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <a id="lianjie">点我</a>
</body>
<script>
    var hash = location.hash;
    console.log(hash);
    if(hash){
        var url = hash.substring(1);
        console.log(url);
        document.write(decodeURI(url));
    }
</script>
</html>
```

在url拼接xss测试语句即可，比如：

```
javascript:alert(1)
<script>alert('XSS')</script>
<ScRiPt>alert('XSS')</ScRiPt> (大小写绕过)
<img src=x onerror=alert(1)>
等等，自行搜索。

// 在第二个例子中使用javascript:alert(1)，不会执行，
// 作为普通文本写入
document.write("javascript:alert(1)");  // 只是显示文本
// 还有其他不会触发的场景：
// 作为字符串变量
var str = "javascript:alert(1)";  // 只是字符串
// 在控制台直接输入（不加void）
"javascript:alert(1)"  // 返回字符串，不执行
```

## 某目标安全问题

![image-20260215114041356](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215114041356.png)

![image-20260215114050252](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215114050252.png)

![image-20260215114057403](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215114057403.png)

![image-20260215114106296](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215114106296.png)

![image-20260215114114040](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215114114040.png)

![image-20260215114124418](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215114124418.png)

![image-20260215114132478](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215114132478.png)

## 代码审计：DOM-XSS

参考https://xz.aliyun.com/t/12499

![image-20260215113048417](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215113048417.png)

对评论之后的内容点击回复：

![image-20260215113103247](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215113103247.png)

![image-20260215113131163](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215113131163.png)

![image-20260215113145651](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215113145651.png)

### 审计

![image-20260215113157956](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215113157956.png)

![image-20260215113210413](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215113210413.png)

## 某目标安全问题实战

![image-20260215115150548](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215115150548.png)

![image-20260215115203618](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260215115203618.png)