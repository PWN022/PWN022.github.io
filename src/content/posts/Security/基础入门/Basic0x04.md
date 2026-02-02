---
title: APP应用&微信小程序&原生态开发&H5+Vue技术&封装打包&反编译抓包点
published: 2026-01-20 12:00:00
description: 了解移动端（app/小程序）的开发架构，关键点是渗透测试过程的思路，比如原生开发或者Web开发的APP就可以进行一个逆向或者进行抓包使得从app转到Web测试，如果是H5+Vue的大多都是一些信息的泄露，或者转到js的安全问题。其实通用的就是：反编译-源码-提取资产（泄漏的配置信息）-安全测试，以及抓包-资产-安全测试。
tags: [基础入门,APP,小程序]
category: 网络安全
draft: false
---

# 知识点

1. [基础入门-APP应用-开发架构安全问题](#APP应用开发架构安全问题)
2. [基础入门-小程序应用-开发架构安全问题](#小程序应用开发架构安全问题)

## APP应用开发架构安全问题

### APP应用开发架构

1. 原生开发

   安卓一般使用java语言开发，当然现在也有kotlin语言进行开发。如何开发就涉及到具体编程了，这里就不详说了。简单描述就是使用安卓提供的一系列控件来实现页面，复杂点的页面可以通过自定义控件来实现。

2. 使用H5语言开发

   使用H5开发的好处有很多，可多端复用，比如浏览器端，ios端，当然H5开发的体验是没有原生好的。结合我做过的项目来说，一般是这个页面需要分享出去的话，就用H5开发。

3. 使用flutter开发

   flutter是近年来谷歌推出的一款UI框架，使用dart语言进行开发，支持跨平台，weight渲染直接操作硬件层，体验可媲美原生。但是flutter技术比较新，生态还不完善，开发起来效率相对偏低。

4. 常规web开发

   Web App软件开发简单地说，就是开发一个网站，然后加入app的壳。Web App一般非常小，内容都是app内的网页展示，受制于网页技术本身，可实现功能少，而且每次打开，几乎所有的内容都需要重新加载，所以反应速度慢，内容加载过多就容易卡死，用户体验差，而且app内的交互设计等非常有效。但开发周期长端，需要的技术人员少，成本低。

#### APP-开发架构-原生态-IDEA

[演示](##演示案例0-APP原生态)：remusic项目源码

安全影响：反编译&流量抓包&常规测试。

安全影响：逆向的角度去分析逻辑设计安全。

#### APP-开发架构--Web封装-封装平台

[演示](##演示案例1-APPWeb封装)：ShopXO源码程序+多豆云打包

安全影响：常Web安全测试。

#### APP-开发架构-H5&Vue-HBuilderX

[演示](##演示案例2-APPH5&Vue)：HBuilderX案例

安全影响：API&JS框架安全问题&JS前端测试。

### 演示案例0-APP原生态

演示：remusic项目源码

![image-20260120092154289](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120092154289.png)

NP管理器：http://normalplayer.top/

首先使用NP管理器进行apk提取：

![image-20260120092252291](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120092252291.png)

![image-20260120092304926](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120092304926.png)

![image-20260120092313810](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120092313810.png)

![image-20260120092357287](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120092357287.png)

![image-20260120092410826](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120092410826.png)

随意打开一个源码文件：

![image-20260120093016850](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120093016850.png)

![image-20260120093112511](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120093112511.png)

#### 抓包工具-HttpCannary

HttpCanary：https://github.com/mingww64/HttpCanary-SSL-Magisk

![image-20260120094150882](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120094150882.png)

因为这个指向是百度的，并不是个人网站，实战中如果遇到个人网站可以把测试思路从APP转到Web去进行。

### 演示案例1-APPWeb封装

演示：ShopXO源码程序+多豆云打包

源码程序：https://shopxo.net/

打包平台：https://www.ofcms.com/

![image-20260120095129598](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120095129598.png)

后续再进行抓包，内容就是网站的资产信息。

### 演示案例2-APPH5&Vue

演示：HBuilderX案例

HBuilder：https://www.dcloud.io/

核心源码都是用h5及框架写好的。

![image-20260120095842636](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120095842636.png)

## 小程序应用开发架构安全问题

### 小程序开发架构

大家所说的小程序指微信小程序，实际上除了微信小程序外，还有支付宝、百度、头条、飞书、QQ、快手、钉钉、淘宝等个各种平台的小程序。在微信小程序开发中，开发者可以根据自身情况和项目需要，选择不同的开发方式，包括：原生开发、WebView开发、框架开发和低代码开发等。

参考：https://mp.weixin.qq.com/s/dXTb0wk57-bLA3tUuvOFSw

#### WX小程序-开发架构-Web封装-平台

[演示](##演示案例3-小程序Web封装)：ShopXO源码程序+多豆云打包

安全影响：常规Web安全测试。

#### WX小程序-开发架构-H5&Vue-HBuilderX

[演示](##演示案例4-小程序H5&Vue)：HBuilderX案例

安全影响：API&JS框架安全问题&前端测试。

安全影响：反编译小程序-提取小程序源码泄漏的信息。

### 演示案例3-小程序Web封装

演示：ShopXO源码程序+多豆云打包

https://shopxo.net/

https://www.ofcms.com/

具体还是复现不了，因为没有小程序开发密钥，之前小程序做的ai回复也没上线的原因就是这个。。。

![image-20260120100558752](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120100558752.png)

### 演示案例4-小程序H5&Vue

演示：HBuilderX案例

https://www.dcloud.io/

https://mp.weixin.qq.com/s/SIWBZv_vZ6AGtHrl3hpR9A

![image-20260120101704266](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120101704266.png)

![image-20260120101722373](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120101722373.png)

### 通用

1. 反编译-源码-提取资产（泄漏的配置信息）-安全测试。
2. 抓包-资产-安全测试。
