---
title: Web应用&CDN绕过&加速部署&漏洞回链&全网扫描&反向邮件&解析记录
published: 2026-01-29 16:00:00
description: 还没准备好。
tags: [信息收集,Web应用]
category: 网络安全
draft: true
---

# 知识点

1. 信息收集-Web应用-CDN加速-如何识别
2. 信息收集-Web应用-CDN加速-绕过方法

# 前置知识

1. 传统访问：用户访问域名–>解析服务器IP–>访问目标主机

2. 普通CDN：用户访问域名–>CDN节点–>真实服务器IP–>访问目标主机

3. 带WAF的CDN：用户访问域名–>CDN节点（WAF）–>真实IP–>访问目标主机

   安全影响：主要对于信息收集时端口扫描和IP探针的相关真实信息存在有误等

国内服务商：

阿里云  百度云  七牛云 

又拍云 腾讯云  Ucloud

360  网宿科技 ChinaCache

国外服务商：

CloudFlare StackPath Fastly

Akamai CloudFront Edgecast

CDNetworks Google Cloud CDN

CacheFly Keycdn Udomain CDN77

## CDN配置

配置1：加速域名-需要启用加速的域名（子域名没配置）

配置2：加速区域-需要启用加速的地区（国外地区没加速）

配置3：加速类型-需要启用加速的资源

配置4：其他SSL证书，DNS解析记录等（历史记录查询）

## 参考知识

超级Ping：http://www.17ce.com/

超级Ping：https://ping.chinaz.com/

接口查询：https://get-site-ip.com/

接口查询：https://fofa.info/extensions/source

国外请求：https://tools.ipip.net/cdn.php

国外请求：https://boce.aliyun.com/detect/

IP社区库：https://www.cz88.net/geo-public

CDN厂商查询：https://cdn.chinaz.com/

CDN厂商查询：https://tools.ipip.net/cdn.php

全网扫描：https://github.com/Tai7sy/fuckcdn

全网扫描：https://github.com/boy-hack/w8fuckcdn

全网扫描：https://github.com/Pluto-123/Bypass_cdn

## 常见方法

参考

https://mp.weixin.qq.com/s/M_tdPxhtOm9XPoVq721FPg

https://mp.weixin.qq.com/s/zxEH-HMqKukmq7qXfrdnQQ

常见方法：

子域名，邮件系统，国外访问，证书查询，APP抓包，网络空间

通过漏洞或泄露获取，扫全网，以量打量，第三方接口查询等

1. 查询历史DNS记录：通过查询历史DNS记录，可以找到使用CDN前的IP地址。常用网站有DNSDB、微步在线、Netcraft、ViewDNS等。
2. 查询子域名：一些网站可能只对主站或流量大的子站点使用CDN。通过查询子域名对应的IP地址，可以辅助找到网站的真实IP。常用工具包括微步在线、Dnsdb查询法、Google搜索等。
3. 网络空间引擎搜索：利用网络空间搜索引擎（如Shodan、Fofa、ZoomEye）搜索特定关键词或特征，可以找到使用CDN的网站的真实IP地址。
4. SSL证书：扫描互联网获取SSL证书，进而找到服务器的真实IP。Censys是一个用于搜索联网设备信息并扫描整个互联网的强大工具。
5. HTTP标头：通过比较HTTP标头来查找原始服务器。例如，使用SecurityTrails平台搜索特定HTTP标头。
6. 网站源代码：浏览网站源代码，寻找独特的代码片段或隐藏的IP地址信息。
7. 国外主机解析域名：由于一些CDN服务在国外地区可能无法提供完整的保护，使用国外的主机直接访问目标网站可能会获取到真实IP地址。
8. 遗留文件：如phpinfo页面泄露，可能会显示服务器的外网IP地址。9. 漏洞探针：利用网站上的漏洞（如SSRF漏洞）让VPS获取对方反向连接的IP地址。
9. 网站邮件订阅：查看RSS邮件订阅的邮件源码，通常包含服务器的真实IP地址。
10. 全网扫描：使用Zmap、Masscan等工具对整个互联网进行扫描，针对扫描结果进行关键字查找，获取网站真实IP。
11. 解码F5 LTM负载均衡器：当服务器使用F5 LTM做负载均衡时，通过对set-cookie关键字的解码，可以获取到真实IP地址。
12. 利用MX记录：如果网站在与web相同的服务器和IP上托管自己的邮件服务器，那么原始服务器IP将在MX记录中。
13. 利用favicon.ico：查看网站的favicon.ico文件，通过其唯一的hash值进行识别，有时可以找到与网站相关的真实IP地址。
14. 配置错误：检查CDN的配置细节，有时小小的配置错误就可能导致CDN防护被绕过。例如，CDN只配置了www域名，而直接访问非www域名可能获取到真实IP。
15. 协议差异：如果站点同时支持http和https访问，而CDN只配置了https协议，那么访问http可能获取到真实IP。
16. 利用网站功能：通过网站提供的某些功能（如邮箱注册、找回密码等），让网站主动暴露真实IP地址。
17. 搜索引擎查询：利用搜索引擎的特定查询语法（如site:和inurl:），结合目标网站的信息，可能找到与网站相关的真实IP地址。
18. 子域名挖掘机：输入域名即可基于字典挖掘子域名，通过查找子域名的IP地址来辅助找到网站的真实IP。20. IP库查询：使用IP库（如纯真数据库）来查询IP段，结合网站特征进行爆破，可能找到真实IP地址。

## 前置后置-CDN服务-识别加速&绑定访问

超级Ping：http://17ce.com/

超级Ping：https://ping.chinaz.com/

拨测工具：https://boce.aliyun.com/detect/

各地ping（出现多个IP即启用CDN服务）

后置：绑定HOST访问解析（参考基础课CDN安全影响）

## 某应用-CDN绕过-主动漏洞&遗留文件&综合查询

1. 漏洞如：SSRF RCE等

   利用漏洞让对方真实服务器主动出网连接，判断来源IP即真实IP

2. 遗留文件：phpinfo类似功能

   通过访问类似PHPINFO类似代码函数获取本地IP造成的地址泄漏

3. 邮箱系统：

   判断条件：发信人是当前域名邮件用户名

   - 让他主动给你发：

     部署架设的邮件服务器如果向外部用户发送邮件的话，

     那么邮件头部的源码中会包含此邮件服务器的真实IP地址。

     常见的邮件触发点有：

     1. RSS订阅
     2. 邮箱注册、激活处
     3. 邮箱找回密码处
     4. 产品更新的邮件推送
     5. 某业务执行后发送的邮件通知
     6. 员工邮箱、邮件管理平台等入口处的忘记密码

   - 你给未知邮箱发：（需要自己的邮件服务器不能第三方）

     通过发送邮件给一个不存在的邮箱地址，因为该用户邮箱不存在，所以发送将失败，并且还会收到一个包含发送该电子邮件给你的服务器的真实IP通知。

## 某应用-CDN绕过-全网扫描

案例1：结合关键字固定IP段找真实IP

1、判断加速厂商

2、IP库筛地址段

3、配置范围扫描

厂商查询：

https://cdn.chinaz.com/

https://tools.ipip.net/cdn.php

工具项目：

https://www.cz88.net/geo-public

https://github.com/Tai7sy/fuckcdn

案例2：ico筛选资产+特征端口找真实IP

https://mp.weixin.qq.com/s/fAbKQsTE0jzUnMWqOkDjMA