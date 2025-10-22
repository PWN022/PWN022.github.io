---
title: HTTP(S)抓包前置
published: 2025-10-05
description: 抓包工具及证书安装。
tags: [抓包,基础入门]
category: 网络安全
draft: false
---

# 工具下载

本文所有操作皆是在Windows环境下。且所使用的抓包软件针对的是使用HTTP/S传输协议的网站。如果是其他协议可以使用wireshark、科来等软件。

## CharlesSSL代理工具安装

> 此工具用于计算Charles激活码，账号随意填写，之后网站生成密码。
>
> https://www.zzzmode.com/mytools/charles/

1. 进入Charles官网进行下载，官网地址：https://www.charlesproxy.com/download/
2. 下载对应版本后，安装Charles。
3. 安装完毕后，打开Charles，点击help中的register charles。
4. 输入在网站填写的账号以及生成的密码。
5. 打开即可食用。

## Fiddler代理工具

由于我下载的集成工具箱自带此工具，因此没有教程。工具箱可前往狐狸说安全进行相应下载。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/https1.png)

## BurpSuite

同样在工具箱内。

# 证书安装

## Charles

点击help->SSL proxying->save charles root certificate，直接修改名字保存即可。**使用Charles进行抓取时，不需要代理。**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/charles1.png)

## Fiddler

点击工具->选项->https，勾选解密https通信，之后点击右边的动作，将根证书导出到桌面。

**注意：抓取本地选择来自所有进程。抓取模拟器选择从远程客户端；当对模拟器进行抓包时，需要将模拟器连接的WiFi设置成本机的ip，以及和Fiddler软件对应的端口。**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/fiddler1.png)

## Burp Suite

点击proxy->proxy settings，在tools下找到proxy（点击proxy settings打开默认就是这里），之后点击`import / export CA...`，选择certificate in DER format，重命名为xxx.der保存到任意位置即可。

**注意：当要导入到安卓模拟器时，需要将burp生成的证书后缀修改为cer，其他不用作修改。**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/burp1.png)

## Chrome

chrome导入的位置我就不过多赘述（这个都找不到就不用学了...），将刚刚的三个证书导入这里就完成了整个前置过程。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/chrome1.png)

# 本文总结

虽然说安装了三个抓包软件，但是经常用的还是bp。

Fiddle可以对目标进行选取，所以它可以更精准的进行抓包。其他，茶杯虽然说平平无奇，但是有转发功能，可以搭配bp使用，比如抓一些小程序此类的就可以使用茶杯+bp。还有可联动的软件比如Proxifier，同样小程序之类的也可以使用Proxifier+bp。





