---
title: 业务逻辑篇&Fuzz技术&数据并发&条件竞争&JS挖掘&参数盲猜&Turbo插件&复盘
published: 2026-07-22
description: Fuzz技术通过自动化暴力枚举与精心构造的字典，用于挖掘隐藏目录、文件、参数及敏感信息，配合并发测试可发现条件竞争类逻辑漏洞（如优惠券重复领取、验证码绕过等）。实战中结合Burp插件和字典库，能有效扩大攻击面并提升漏洞发现效率。
tags:
  - 业务逻辑
  - Web攻防
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-Fuzz技术-盲找&文件&参数&值&项目
2. WEB攻防-数据并发-条件竞争&应用场景&并发流程

# Fuzz

是一种基于黑盒的自动化软件模糊测试技术,简单的说一种懒惰且暴力的技术融合了常见的以及精心构建的数据文本进行网站、软件安全性测试。

在实战黑盒中，目标有很多没有显示或其他工具扫描不到的文件或目录等，我们就可以通过大量的字典Fuzz找到的隐藏的文件进行测试。

```
Fuzz的核心思想:
口令Fuzz(弱口令)
目录Fuzz(漏洞点)
参数Fuzz(利用参数)
PayloadFuzz(Bypass)

Fuzz应用场景：
-爆破用户口令
-爆破敏感目录
-爆破文件地址
-爆破未知参数名
-Payload测漏洞（绕过等也可以用）

Fuzz项目：
https://wordlists.assetnote.io/
https://github.com/fuzzdb-project/fuzzdb
https://github.com/TheKingOfDuck/fuzzDicts
https://github.com/danielmiessler/SecLists
```

## FUZZ JS 文件

一般的，在浏览器中访问网站，会自动加载一些js资源，但这不代表是该网站所有的js资源

所以这时候就可以在`源代码/来源`中，找到想要深挖与该js文件同路径的`未展示`出来的就需要用到fuzz爆破

抓包主要就是为了连带地址，之后将该js文件名设置为变量，然后跑字典，示例：

```
GET /xxxx/WebSite/Scripts/xx/counter.js HTTP/1.1

sniper模式->添加字典
GET /xxxx/WebSite/Scripts/xx/$counter.js$ HTTP/1.1
```

爆破`js`文件的意义是通过获取更多的`js`文件，分析其中的代码是否包含了一些敏感信息或者转向其他攻击手段，比如：

1、增加攻击面（泄露的URL、接口）

2、敏感信息（用户名/密码、ak/sk、token/session）

3、代码中的潜在危险函数（eval、dangerallySetInnerHTML）

4、流行的JS框架（从相关框架找历史漏洞）（Vue、NodeJs、jQuery、Angular、React等）

## FUZZ Rce 文件&参数&值

假如当前有个目标，如何通过FUZZ挖掘发现RCE

先通过网站的加载数据包，一般从`X-Powered-By`，可以看到该网站使用的什么语言以及版本号

根据网站类型，在网站的根目录（实际看情况，这里是拿在根目录的情况下举例），添加变量，跑php字典，查看是否有其他php文件等

```
GET /$test$ HTTP/1.1
```

根据返回长度发现存在`ping.php`文件，进行访问发现提示error，但是可以正常访问并无权限问题

此时可以继续通过fuzz测试参数名

```
GET /ping.php?$test$ HTTP/1.1
```

这次将字典设置为参数名字典，结果为`do`参数名可用，且返回报错是`system()`函数，根据返回测试漏洞，如果没有回显页面或者报错信息，那么就直接测试比如rce、xss等等都是有字典存在的

由于这里是`system`**命令执行函数**，那么可以直接跑一些系统命令的字典，比如`whoami`等等

```
GET /ping.php?do=$test$ HTTP/1.1
```

## 复盘SRC案例-Fuzz手机加验证码突破绕过

纯粹爆破手机号+验证码，仅限于验证码不会刷新，且只有四位；除此之外，还需要对方的服务器在处理时没有敏感检测，不会直接将大量请求丢弃 

## 复盘SRC案例-Fuzz访问URL挖未授权访问

某系统测试发现后台登录地址为`https://xxx/?m=index`

于是请求`https://xxx/?m=view`，获取一个未授权访问漏洞

## 复盘SRC案例-Fuzz密码组合规则信息泄漏

账号为学号、密码为xx#身份证后四位

那么就可以通过谷歌语法等等来搜寻可利用账号，密码格式也已经给出，直接将后四位设置为变量跑字典

# 并发

通常发生在多线程或多进程并发执行的环境中。这种漏洞主要源于在并发执行时，由于缺乏适当的同步机制或同步不当，导致多个线程或进程在访问和修改共享资源时出现冲突或不一致的状态。

并发应用场景：

包括但不限于点赞、投票、签到、代金券、领积分、获取验证码等。（见图）

靶场地址：portswigger.net/web-security/all-labs#race-conditions

## 减免卷并发绕过

使用turbo intruder插件并发

先抓包减免卷，放入插件，选择脚本后更改次数及逻辑，直接开启

其实就是使用python代码进行并发，自己写也可以

使用repeater创造并发

先抓包减免卷，放入repeater，使用ctrl+R复制报文，放入同一个group一起发包即可

## 绕过速度限制并发

这个靶场是比较符合实际的情况：大量请求或者请求过多/过快会被限制

使用turbo intruder插件

先抓包登录请求，放入插件，选择脚本后更改逻辑代码，直接开启

## 复盘SRC案例

[https://mp.weixin.qq.com/s/cdL8VkhXiZDIK42AoFDlrA](https://mp.weixin.qq.com/s/cdL8VkhXiZDIK42AoFDlrA)  
[https://mp.weixin.qq.com/s/OGwlHYxIZe_aHXMTBNxAzg](https://mp.weixin.qq.com/s/OGwlHYxIZe_aHXMTBNxAzg)
