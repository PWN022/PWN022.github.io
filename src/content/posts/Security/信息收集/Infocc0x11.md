---
title: 信息收集完结
published: 2026-02-02 21:00:00
description: 信息收集步骤（个人总结）。
tags: [信息收集]
category: 网络安全
draft: false
---

# 总结

举例要渗透一个厂商，我们需要知道的：

## 通过语法（常用于edu）

```
敏感信息
具备特殊URL关键字的目标地址
搜索已有的攻击结果
指定格式文件
其他与某一个站点相关的信息
特别提示：利用搜索引擎的网页快照功能，有时候可以发现更多的功能。

常用的GoogleHacking语法
intext（仅针对Google有效）：把网页中的正文内容中的某一个字符作为搜索的条件
intitle：把网页标题中的某一个字符作为搜索的条件
cache：搜索搜索引擎里关于某一些内容的缓存，可能会在过期内容中发现有价值的信息
filetype：指定一个格式类型的文件作为搜索文件
inurl：搜索包含指定字符发URL
site：在指定的站点搜索相关的内容
引号 “”：把关键字打上引号后把引号部分作为整体来搜索
or：同时搜索两个或者更多的关键字
link：搜索某一个网站的链接

GoogleHacking语法实践
找管理后台地址
site:xxx.com intext:管理|后台|登录|用户名|密码|系统|账号
site:xxx.com inurl:login|admin|manage|manager|admin_login|system
site:xxx.com intitle:管理|后台|登录
找上传类漏洞地址
site:xxx.com inurl:file
site:xxx.com inurl:upload
找注入页面
site:xxx.com inurl:php?id=
找编辑器页面
site:xxx.com inurl:ewebeditor
```

## 通过目标站点收集信息

1. 目标站点域名、公网IP，还需要判断是否cdn，如果是怎么绕过？

   - 判断cdn：使用工具如 `ping`、或者在线平台工具查看多地解析IP是否一致；

     使用在线平台（如 https://get-site-ip.com/）综合接口查询。

   - 绕过cdn：很多子域名（如 `mail.example.com`、`dev.example.com`、`direct.example.com`）可能未部署CDN；

     利用邮件服务器向公司邮箱发信，查看邮件头中的 `Received` 字段，可能暴露内部IP段；

     利用SSL证书通过 `crt.sh` 等网站查询证书关联的域名，可能发现其他IP。

2. 目标站点的whois信息，以及是否还有子域名，子域名的安全性往往不如主站，可以考虑从这方面进行测试。

   - 字典爆破子域名：ffuf。

3. 目标站点的地址、联系电话、邮箱等等信息，如果有邮件系统，是不是可以考虑从这方面入手？

   - 密码猜解：很多人使用“姓名+生日”等模式设置密码。
   - 寻找暴露的员工账号：在 GitHub、论坛等地方搜索公司邮箱。
   - 钓鱼

4. 端口扫描，对发现的真实IP和重要子域名进行全端口扫描。发现开放端口（如 22/SSH, 21/FTP, 3306/MySQL, 8080/管理后台），并识别运行的服务及其版本。

   - 利用nmap、TscanPlus等

5. 目录与发现，对Web应用（主站和子域名）进行目录和敏感文件扫描。寻找后台登录页 (`/admin`)、配置文件 (`/config.php.bak`)、备份文件 (`/backup.zip`)、版本控制文件 (`/.git/`)、API文档等。

   - 利用ffuf、TscanPlus等

6. 指纹识别与技术栈分析，识别Web应用使用的框架、CMS、中间件、前端库等。一旦知道版本，就可以搜索已知的公开漏洞（如 WordPress插件漏洞、ThinkPHP RCE）。

   - 浏览器插件Wappalyzer等等。

7. 关联资产与外部信息泄露

   - 搜索引擎语法：在Google中使用 `site:example.com`、`filetype:pdf` 等搜索。
   - 代码仓库：GitHub。
   - 网络空间测绘：fofa等搜索IP、服务、特定组件。

8. 绘制图

   将域名、子域名、IP、端口、服务、技术栈、人员、潜在漏洞点进行整理，之后对目标技术栈版本、服务进行搜索有没有暴露过漏洞等等。

9. 漏洞扫描与验证

   自动化扫描：Nuclei。

   手动测试：sql注入、弱口令，xss等。
