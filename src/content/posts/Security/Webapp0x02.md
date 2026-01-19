---
title: Web应用&OSS存储&负载均衡&CDN加速&反向代理&WAF防护&部署影响
published: 2026-01-19
description: 了解WAF、CDN服务、OSS存储、反向代理和负载均衡，以及如何判断对方使用了CDN或者负载均衡。
tags: [基础入门,Web应用]
category: 网络安全
draft: false
---

# 知识点

1. [基础入门-Web应用-防护产品-WAF保护](#防护产品-WAF保护)
2. [基础入门-Web应用-加速服务-CDN节点](#加速服务-CDN节点)
3. [基础入门-Web应用-文件托管-OSS存储](#文件托管-OSS存储)
4. [基础入门-Web应用-通讯服务-反向代理](#通讯服务-反向代理)
5. [基础入门-Web应用-运维安全-负载均衡](#运维安全-负载均衡)

## 防护产品-WAF保护

### WEB+WAF

#### 了解WAF

<img src="https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119090435294.png" alt="image-20260119090435294" style="zoom:80%;" />

原理：Web应用防火墙，旨在提供防护。

影响：常规Web安全测试手段会被拦截。

演示：雷池社区版 https://waf-ce.chaitin.cn/

### 演示案例0

更详细的安装（包括靶场）：https://zhuanlan.zhihu.com/p/705196831

雷池帮助文档中有提供自动安装，仅需要一条命令，安装完毕之后会有一个初始的账号密码，之后在控制台操作即可。：

> ```bash
> bash -c "$(curl -fsSLk https://waf-ce.chaitin.cn/release/latest/manager.sh)"
> ```

访问雷池控制台（注意要打开9443端口）：

https://<safeline-ip>:9443/

配置雷池：

添加站点-设置域名-上游地址-没有真实域名就修改本地host解析。

## 加速服务-CDN节点

### WEB+CDN

#### 了解CDN

![image-20260119092937160](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119092937160.png)

原理：内容分发服务，旨在提高访问速度。

影响：隐藏真实源IP，导致对目标IP测试错误。

演示：阿里云备案域名全局CDN加速服务，Windows2016 + BT宝塔面板 + CDN服务。

### 演示案例1

1. 首先是在内容分发服务中的域名管理：

   <img src="https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119093722590.png" alt="image-20260119093722590" style="zoom:80%;" />

   <img src="https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119093734461.png" alt="image-20260119093734461" style="zoom:80%;" />

   <img src="https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119093757740.png" alt="image-20260119093757740"  />

   ![image-20260119093823130](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119093823130.png)

   ![image-20260119094059941](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119094059941.png)

2. 之后在云解析DNS中的公网DNS解析：

   <img src="https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119094113022.png" alt="image-20260119094113022" style="zoom:80%;" />

## 文件托管-OSS存储

### WEB+OSS

原理：云存储服务，旨在提高访问速度。

演示：https://cloudreve.org/

Windows2016 + cloudreve + 阿里云OSS

https://github.com/cloudreve/Cloudreve/releases/tag/3.7.1

### 演示案例2

1. 启动应用

   ![image-20260119094939529](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119094939529.png)

2. 登录管理

   ![image-20260119094958005](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119094958005.png)

   ![image-20260119095013719](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119095013719.png)

   ![image-20260119095022133](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119095022133.png)

3. 配置存储信息

   ![image-20260119095619017](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119095619017.png)

   ![image-20260119095632011](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119095632011.png)

   ![image-20260119095644690](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119095644690.png)

   ![image-20260119095656264](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119095656264.png)

   ![image-20260119100113632](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119100113632.png)

4. 更改用户组存储属性

   ![image-20260119095736968](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119095736968.png)

   ![image-20260119095751577](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119095751577.png)

   ![image-20260119095808806](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119095808806.png)

   ![image-20260119095820587](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119095820587.png)

   ![image-20260119095830345](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119095830345.png)

阿里云OSS:

1. 开OSS
2. 新建Bucket
3. 配置Bucket属性
4. 配置Access访问

原理：

为什么要使用第三方存储？

1. 静态文件会占用大量带宽

2. 加载速度
3. 存储空间

**影响：**

上传的文件或解析的文件均来自于OSS资源，无法解析，单独存储。

1. 修复上传安全：上传后的文件只能访问，并没有提供解析功能。
2. 文件解析不一样：比如在对上传的一句话进行访问时，并不会正常访问，而是会下载该文件。
3. 但存在AK/SK隐患：凭证泄露（云安全）。

## 通讯服务-反向代理

### WEB+反向代理

#### 了解正/反向代理

![image-20260119101446951](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119101446951.png)

![image-20260119101502120](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119101502120.png)

正代理为客户端服务,客户端主动建立代理访问目标（不代理不可达）。

反向代理为服务端服务,服务端主动转发数据给可访问地址（不主动不可达）。

**原理：通过网络反向代理转发真实服务达到访问目的。**

**影响：访问目标只是一个代理，非真实应用服务器。**

注意：正向代理和反向代理都是解决访问不可达的问题，但由于反向代理中多出一个可以重定向解析的功能操作，导致反代理出的站点指向和真实应用毫无关系！

演示：Nginx反向代理配置

Windows2016 + BT宝塔面板 + Nginx

### 演示案例3

![image-20260119101117807](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119101117807.png)

![image-20260119101126657](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119101126657.png)

## 运维安全-负载均衡

### WEB+负载均衡

原理：分摊到多个操作单元上进行执行，共同完成工作任务。

影响：有多个服务器加载服务，测试过程中存在多个目标情况。

演示：Nginx负载均衡配置

Windows2016 + BT宝塔面板 + Nginx

### 演示案例4

1. 定义访问路径 访问策略

   ```
   location / {
   ​    proxy_pass http://fzjh/;
   }
   ```

   <img src="https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119102103254.png" alt="image-20260119102103254" style="zoom:80%;" />

2. 定义负载设置

```
upstream fzjh{
​	server 120.26.70.72:80 weight=1;
​	server 47.75.212.155:80 weight=2;
}
```

![image-20260119102136525](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119102136525.png)

![image-20260119102147295](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260119102147295.png)

## 如何判断对方使用了CDN或者负载均衡

1. 地区差异(cdn就是哪里访问就访问就近节点)。
2. IP节点数量(几十个不同IP一般都是CDN，就几个不同IP一般是负载均衡)。
