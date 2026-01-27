---
title: Web应用&搭建架构&指纹识别&WAF判断&蜜罐排除&开发框架&组件应用
published: 2026-01-27 19:00:00
description: 认识Web架构（比如CMS、开发语言、框架等方面），了解如何利用在线平台、工具、网络空间进行指纹识别。如何进行Waf识别（利用工具、拦截界面），蜜罐的识别（通过一些指纹分析、端口号、工具）。以及先了解后续会在Java攻防的fastjon、shiro的流量特征还有更多识别方法及项目插件。
tags: [信息收集,Web应用,指纹识别]
category: 网络安全
draft: false
---

# 知识点

1. 信息收集-Web应用-架构分析&指纹识别
2. 信息收集-Web应用-架构分析&WAF&蜜罐
3. 信息收集-Web应用-架构分析&框架组件识别

| **标签** | **名称**         | **地址**                                  |
| -------- | ---------------- | ----------------------------------------- |
| 指纹识别 | EHole_magic      | https://github.com/lemonlove7/EHole_magic |
| 指纹识别 | Wappalyzer       | https://github.com/AliasIO/wappalyzer     |
| 指纹识别 | TideFinger潮汐   | http://finger.tidesec.net/                |
| 指纹识别 | 云悉指纹         | https://www.yunsee.cn/                    |
| 指纹识别 | hfinger          | https://github.com/HackAllSec/hfinger     |
| 指纹识别 | 数字观星Finger-P | https://fp.shuziguanxing.com/#/           |
| 指纹识别 | CMSeek           | https://github.com/Tuhinshubhra/CMSeeK    |

# 蜜罐

| 蜜罐                        | **Quake系统搜索语法**        |
| --------------------------- | ---------------------------- |
| **STRUTSHONEYPOT**          | app:"StrutsHoneypot"         |
| **CONPOT HTTP** 蜜罐        | app:"Conpot Http 蜜罐"       |
| **CONPOT MODBUS** 蜜罐      | app:"Conpot modbus 蜜罐"     |
| **CONPOT S7** 蜜罐          | app:"Conpot s7 蜜罐"         |
| **KIPPO** 蜜罐              | app:"kippo 蜜罐"             |
| **HONEYPY HTTP** 蜜罐       | app:"Honeypy Http 蜜罐"      |
| **HONEYPY ES**蜜罐          | app:"Honeypy ES蜜罐"         |
| **AMUN IMAP** 蜜罐          | app:"amun imap 蜜罐"         |
| **AMUN HTTP**蜜罐           | app:"amun http蜜罐"          |
| **NEPENTHES NETBIOS** 蜜罐  | app:"Nepenthes netbios蜜罐"  |
| **NEPENTHES FTP** 蜜罐      | app:"Nepenthes FTP 蜜罐"     |
| **SSHESAME SSH** 蜜罐       | app:"sshesame ssh 蜜罐"      |
| **OPENCANARY** 蜜罐管理后台 | app:"opencanary蜜罐管理后台" |
| **DIONAEA SIPD** 蜜罐       | app:"Dionaea sipd 蜜罐"      |
| **DIONAEA SMBD** 蜜罐       | app:"Dionaea smbd 蜜罐"      |
| **DIONAEA HTTP** 蜜罐       | app:"Dionaea Http 蜜罐"      |
| **DIONAEA MSSQL** 蜜罐      | app:"Dionaea MSSQL 蜜罐"     |
| **DIONAEA FTP** 蜜罐        | app:"Dionaea ftp 蜜罐"       |
| **DIONAEA MEMCACHED** 蜜罐  | app:"Dionaea Memcached 蜜罐" |
| **KOJONEY SSH** 蜜罐        | app:"Kojoney SSH 蜜罐"       |
| **WEBLOGIC** 蜜罐           | app:"weblogic蜜罐"           |
| **MYSQL **蜜罐              | app:"MySQL蜜罐"              |
| **HFISH **蜜罐              | app:"HFish蜜罐"              |
| **HFISH** 蜜罐管理后台      | app:"HFish蜜罐管理后台"      |
| **HONEYTHING** 物联网蜜罐   | app:"honeything物联网蜜罐"   |
| **ELASTICSEARCH** 蜜罐      | app:"elasticsearch蜜罐"      |
| **HOSTUS **蜜罐             | app:"HostUS蜜罐"             |
| **WHOISSCANME **蜜罐        | app:"whoisscanme蜜罐"        |

| **未知蜜罐**            | app:"未知蜜罐"           |
| ----------------------- | ------------------------ |
| **COWRIE TELNETD** 蜜罐 | app:"Cowrie telnetd蜜罐" |
| **GLASTOPF **蜜罐       | app:"glastopf蜜罐"       |

![](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image.jpg)

| 名称                  | 常用端口       | 指纹条件                                                     |
| --------------------- | -------------- | ------------------------------------------------------------ |
| Glastopf              | 80             | Response:"<h2>Blog Comments</h2>" and Response:"Please post your comments for the blog" |
| elastichoney          | 9200           | Response:"89d3241d670db65f994242c8e838b169779e2d4"           |
| Amun                  | 80             | Response:"tim.bohn@gmx.net" AND Response:"johan83@freenet.de" |
| honeypy               | 80             | server:"Apache/2.4.10 (Debian)" AND html_md5_has:"fe423597bba0ea7b89db3fdc6afa471f" |
| Hfish                 | 80/9000        | Response:"w-logo-blue.png?ver=20131202" AND Response:"ver=5.2.2" AND Response:"static/x.js" AND NOT Response:"bcd" |
| opencanary            | 8080/8000/8001 | title:"后台管理系统" AND (Response:"792d56046d26e08153b89a4207657387" OR Response:"e8d9300c4cfa5fe34b73") |
| Weblogic_honeypot     | 7001           | status:404 AND header:"content-length:1165" AND header:"WebLogic Server 10.3.6.0.171017 PSU Patch for BUG26519424 TUE SEP 12 18:34:42 IST 2017 WebLogic Server 10.3.6.0 Tue Nov 15 08:52:36 PST 2011 1441050 Oracle WebLogic Server Module Dependencies 10.3 Thu Sep 29 17:47:37 EDT 2011 Oracle WebLogic Server on JRockit Virtual Edition Module Dependencies 10.3 Wed Jun 15 17:54:24 EDT 2011" |
| Honeypy_es            | 9200           | Response:"61ccbdf1fab017166ec4b96a88e82e8ab88f43fc"          |
| StrutsHoneypot        | 80/8080        | html_md5_has:"416797d5db09bdfa185f9e66efd18160"              |
| Hfish 后台            | 9001           | html_md5_has:"f9dbaf9282d400fe42529b38313b0cc8"              |
| Honeything 物联网蜜罐 | -              | Response:"body.style.left = (bodywidth - 760)/2;"            |
| Conpot Http 蜜罐      | 8080/8082      | Response:"Last-Modified: Tue, 19 May 1993 09:00:00 GMT"      |

## 信息收集-Web应用-架构分析&指纹识别

### Web架构

```
开源CMS：
Discuz、WordPress、PageAdmin、蝉知等。

前端技术：
HTML5、Jquery、Bootstrap、Vue、NodeJS等。

开发语言：
PHP、JAVA、Ruby、Python、C#、JS、Go等。

框架组件：
SpringMVC、Thinkphp、Yii、Tornado、Vue等。

Web服务器：
Apache、Nginx、IIS、Lighttpd等。

应用服务器：
Tomcat、Jboss、Weblogic、Websphere等。

数据库类型：
端口扫描，组合判断，应用功能
Mysql、SqlServer、Oracle、Redis、MongoDB等。

操作系统信息：
Linux、Windows、Mac等。

应用服务信息：
FTP、SSH、RDP、SMB、SMTP、LDAP、Rsync等。

CDN信息：
帝联、Cloudflare、网宿、七牛云、阿里云等。

WAF信息：
创宇盾、宝塔、ModSecurity、玄武盾、OpenRASP等。

蜜罐信息：
HFish、TeaPot、T-Pot、Glastopf等。

其他组件信息：
FastJson、Shiro、Log4j、Solr、XStream等。
```

### 指纹识别

针对小中型。

1. 平台：

   https://www.yunsee.cn/

   http://finger.tidesec.net/

   https://fp.shuziguanxing.com/

   其中，云悉更好用一些，识别的更全面还可以查询历史版本漏洞，唯一就是需要邀请码。

2. 项目：

   https://github.com/AliasIO/wappalyzer（浏览器插件，但是准确度欠佳，好在方便，针对国外比较好用）

   https://github.com/HackAllSec/hfinger（比较好用）

   ![image-20260127171317021](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260127171317021.png)

   https://github.com/Tuhinshubhra/CMSeeK

   https://github.com/lemonlove7/EHole_magic（比较好用，但是24年至今未更新）

   https://github.com/emo-crab/observer_ward

3. 使用网络空间的ico识别:

   借助目标的ico图标进行识别。

   这类案例在SRC平台较为常见：同一个用户刷屏提交漏洞的情况。先识别出某通用OA系统（如高校广泛使用的某厂商系统），挖掘其通用型漏洞后，再利用ico图标或特定特征在资产搜索引擎（如FOFA）中批量发现同类站点。

   方法就是看网站加载时候的ico图片，保存下来在fofa中使用ico进行搜索。

## 信息收集-Web应用-架构分析&WAF&蜜罐

### WAF识别

拦截页面，identywaf项目内置

https://github.com/stamparm/identYwaf

https://github.com/EnableSecurity/wafw00f（至今仍在更新）

wafw00f使用之前先进行安装，python版本要在3.10或者以上。

命令：

```cmd
自己的python目录\python.exe -m pip install .
```

![image-20260127174826058](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260127174826058.png)

fofa语法：

```
# 搜索Cloudflare保护的网站
header="server: cloudflare"
header="cf-ray"

# 搜索使用WAF的网站
header="x-waf"  # 通用WAF标识
header="x-protected-by"

# 特定WAF
header="x-sucuri-id"  # Sucuri
header="x-deny-reason"  # 阿里云WAF
```

![image-20260127180833515](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260127180833515.png)

###  蜜罐识别

1. 项目识别：

   https://github.com/graynjo/Heimdallr

   https://github.com/360quake/quake_rs

   ```cmd
   quake.exe init quake的apikey
   ```

   ```cmd
   quake.exe honeypot 目标IP地址
   ```

2. 人工识别：

   - [端口多而有规律性](#蜜罐)（针对多服务蜜罐）
   
     比如HFish可以设置打开9001、9002还有10030、10035等等端口。当然还要区分是什么样的蜜罐，有的蜜罐只开一个端口，比如FTP或者Mysql。
   
   - [Web访问协议就下载](#蜜罐)（针对多服务蜜罐）
   
   - [设备指纹分析](#蜜罐)（见上图，针对蜜罐特征）
   
     HFish蜜罐：
   
     ![image-20260127191416297](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260127191416297.png)
   
     且js代码中可以看到是用来接收账号和密码的。
   
     HONEYTHING 物联网蜜罐：
   
     ![image-20260127192030837](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260127192030837.png)

## 信息收集-Web应用-架构分析&框架组件识别

后续会讲到更多识别方法及项目插件。

例子：

FastJson：https://forum.butian.net/share/1679

Shiro：https://mp.weixin.qq.com/s/j1nDnb0Ub5bk2-Tq5tt2pg
