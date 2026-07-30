---
title: JS应用&微信小程序&源码架构&编译预览&逆向调试&嵌套资产&代码审计
published: 2026-03-03 12:00:00
description: 小程序嵌套WEB资产、第三方云服务逆向反编译后的安全问题。
tags: [Web开发,JS]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-微信小程序-搭建&开发&架构&安全
2. 安全开发-微信小程序-编译调试&反编译&泄露

# 小程序创建

## 下载微信开发者工具

需要提前注册：https://developers.weixin.qq.com/

下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

## 创建小程序模版引用

![image-20260301110237171](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260301110237171.png)

# 小程序架构

## 主体结构

小程序包含一个描述整体程序的 app 和多个描述各自页面的 page。

一个小程序主体部分(即app)由三个文件组成，必须放在项目的根目录，如下：

```
    文件                 必需               作用    
​    app.js               是            小程序逻辑
​    app.json             是            小程序公共配置
​    app.wxss             否            小程序公共样式表
```

## 页面组成

一个小程序页面由四个文件组成，分别是:     

```
    xxx.js        页面逻辑（最关键的逻辑代码）
​    xxx.json      页面配置
​    xxx.wxml      页面结构
​    xxx.wxss      页面样式
```

## 项目整体目录结构

```
    pages                页面文件夹
​    index                首
​    logs                 日志
​    utils               
​    util                 工具类(mina框架自动生成,你也可建立：api)
​    app.js               入口js(类似于java类中的main方法)、全局js
​    app.json             全局配置文件
​    app.wxss             全局样式文件
​    project.config.json  跟你在详情中勾选的配置一样
​    sitemap.json         用来配置小程序及其页面是否允许被微信索引
```

# 小程序开发

## 可视化

![image-20260301110806491](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260301110806491.png)

## 真机调试

![image-20260301111057243](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260301111057243.png)

## 编译预览

在真机预览。

# 案例0-嵌套Web应用资产

```
<web-view src="http://www.xiaodi8.com"></web-view>
```

在模板的index.wxml中添加以上代码。

之后在详情中修改本地设置，勾选上不校验合法域名、web-view(业务域名）、TLS 版本以及 HTTPS 证书。

![image-20260301111453065](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260301111453065.png)

如果你目标的小程序就是这样的页面，那么通过反编译或者抓包都能找到这个地址，本质无非不就是对这个地址进行渗透罢了(有些大型网站会针对`PC`端、`AAP`端、小程序端进行页面适配，本质目标就是一个地址。)

# 案例1-嵌套第三方云服务

阿里云OSS存储-AK/SK

具体看：https://superhero.blog.csdn.net/article/details/146770277

通过抓包看到的是请求存储桶的地址，而通过反编译获取源码发现AK/SK，之后就可以使用AK/SK相关工具接管对方的存储桶。

# 小程序安全

1. 逆向反编译

   https://github.com/Ackites/KillWxapkg

   https://github.com/eeeeeeeeee-code/e0e1-wx

   https://github.com/biggerstar/wedecode

2. 敏感信息泄露（AK/SK,APIKEY等）

3. 资产信息提取（IP,Web应用等）

4. 代码逻辑安全（算法，提交接口等）

参考：第24天课程演示

# 实例文章

https://mp.weixin.qq.com/s/z28ppqhNJnLVWSScMEqiuw

https://mp.weixin.qq.com/s/ZfovaAyipqzUIYdL9objPA

https://mp.weixin.qq.com/s/PK1NhvdrDr3XWEliuyEiig