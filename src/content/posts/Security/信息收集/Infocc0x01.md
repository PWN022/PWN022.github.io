---
title: Web应用&备案产权&Whois反查&域名枚举&DNS记录&证书特征&相似查询
published: 2026-01-26 16:00:00
description: 本文主要是Web资产方面：不访问目标服务器的情况下，利用在线平台查备案信息、企业产权、域名相关性，找到主要的信息，比如：企业的其他域名、邮箱、公众号或APP等等。以及利用DNS、证书、网络空间集合工具、还有微步平台的威胁情报、爆破解析、Js来提取子域名。思考题*2。
tags: [信息收集,Web应用]
category: 网络安全
draft: false
---

# 知识点

1. 信息收集-Web应用-机构产权&域名相关性
2. 信息收集-Web应用-DNS&证书&枚举子域名

# 在线平台工具

| **标签** | **名称**     | **地址**                             |
| -------- | ------------ | ------------------------------------ |
| 企业信息 | 天眼查       | https://www.tianyancha.com/          |
| 企业信息 | 小蓝本       | https://www.xiaolanben.com/          |
| 企业信息 | 爱企查       | https://aiqicha.baidu.com/           |
| 企业信息 | 企查查       | https://www.qcc.com/                 |
| 企业信息 | 国外企查     | https://opencorporates.com/          |
| 企业信息 | 启信宝       | https://www.qixin.com/               |
| 备案信息 | 备案信息查询 | http://www.beianx.cn/                |
| 备案信息 | 备案管理系统 | https://beian.miit.gov.cn/           |
| 注册域名 | 域名注册查询 | https://buy.cloud.tencent.com/domain |
| IP反查   | IP反查域名   | https://x.threatbook.cn/             |

| **标签** | **名称**               | **地址**                                                     |
| -------- | ---------------------- | ------------------------------------------------------------ |
| DNS数据  | dnsdumpster            | https://dnsdumpster.com/                                     |
| 证书查询 | CertificateSearch      | https://crt.sh/                                              |
| 网络空间 | FOFA                   | https://fofa.info/                                           |
| 网络空间 | 全球鹰                 | http://hunter.qianxin.com/                                   |
| 网络空间 | 360                    | [https://quake.360.cn/quake/](https://quake.360.cn/quake/#/index) |
| 威胁情报 | 微步在线 情报社区      | https://x.threatbook.cn/                                     |
| 威胁情报 | 奇安信 威胁情报中心    | https://ti.qianxin.com/                                      |
| 威胁情报 | 360 威胁情报中心       | https://ti.360.cn/#/homepage                                 |
| 枚举解析 | 在线子域名查询         | http://tools.bugscaner.com/subdomain/                        |
| 枚举解析 | DNSGrep子域名查询      | https://www.dnsgrep.cn/subdomain                             |
| 枚举解析 | 工具强大的子域名收集器 | https://github.com/shmilylty/OneForAll                       |

| **标签** | **名称**               | **地址**                                                     |
| -------- | ---------------------- | ------------------------------------------------------------ |
| 网络空间 | 钟馗之眼               | [https://www.zoomeye.org/](https://www.zoomeye.org/?R1nG)    |
| 网络空间 | 零零信安               | https://0.zone/                                              |
| 网络空间 | Shodan                 | https://www.shodan.io/                                       |
| 网络空间 | Censys                 | https://censys.io/                                           |
| 网络空间 | ONYPHE                 | https://www.onyphe.io/                                       |
| 网络空间 | FullHunt               | https://fullhunt.io/                                         |
| 网络空间 | Soall Search Engine    | https://soall.org/                                           |
| 网络空间 | Netlas                 | https://app.netlas.io/responses/                             |
| 网络空间 | Leakix                 | https://leakix.net/                                          |
| 网络空间 | DorkSearch             | https://dorksearch.com/                                      |
| 威胁情报 | VirusTotal在线查杀平台 | https://www.virustotal.com/gui/                              |
| 威胁情报 | VenusEye 威胁情报中心  | https://www.venuseye.com.cn/                                 |
| 威胁情报 | 绿盟科技 威胁情报云    | https://ti.nsfocus.com/                                      |
| 威胁情报 | IBM 情报中心           | https://exchange.xforce.ibmcloud.com/                        |
| 威胁情报 | 天际友盟安全智能平台   | [https://redqueen.tj-un.com](https://redqueen.tj-un.com/IntelHome.html) |
| 威胁情报 | 华为安全中心平台       | [https://isecurity.huawei.com/sec](https://isecurity.huawei.com/sec/web/intelligencePortal.do) |
| 威胁情报 | 安恒威胁情报中心       | https://ti.dbappsecurity.com.cn/                             |
| 威胁情报 | AlienVault             | https://otx.alienvault.com/                                  |
| 威胁情报 | 深信服                 | [https://sec.sangfor.com.cn/](https://sec.sangfor.com.cn/analysis-platform) |
| 威胁情报 | 丁爸情报分析师的工具箱 | http://dingba.top/                                           |
| 威胁情报 | 听风者情报源 start.me  | https://start.me/p/X20Apn                                    |
| 威胁情报 | GreyNoise Visualizer   | https://viz.greynoise.io/                                    |
| 威胁情报 | URLhaus 数据库         | https://urlhaus.abuse.ch/browse/                             |
| 威胁情报 | Pithus                 | https://beta.pithus.org/                                     |

## 信息收集-Web应用-机构产权&域名相关性

**主动信息收集：**

**通过直接经过目标服务器网络流量的信息收集方式。**

**被动信息收集：**

**不与目标系统直接交互的情况下获取信息收集方式。**

### 域名

#### 备案信息

通过域名查备案信息，备案信息获取更多域名。

![image-20260126171701856](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126171701856.png)

![image-20260126171739895](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126171739895.png)

#### 企业产权

通过企业产权查询Web,APP,小程序等版权资产。

![image-20260126172118465](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126172118465.png)

![image-20260126172251734](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126172251734.png)

![image-20260126172529070](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126172529070.png)

#### 域名相关性

- Whois信息：例如域名所有人、域名注册商、邮箱等。

  ![image-20260126173736600](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126173736600.png)

  ![image-20260126173911845](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126173911845.png)

- 通过域名注册接口获取后缀

  ![image-20260126174107614](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126174107614.png)

- 查询域名注册邮箱（上图出现过）

- 通过域名查询备案号（上图出现过）

- 通过备案号查询域名

  ![image-20260126174329345](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126174329345.png)

- 反查注册邮箱

  https://whois.chinaz.com/reverse/email

- 反查注册人

  https://whois.chinaz.com/reverse/email

- 通过注册人查询到的域名再查询邮箱

- 通过上一步邮箱去查询域名

- 查询以上获取出的域名的子域名

## 信息收集-Web应用-DNS&证书&枚举子域名

### 子域名

在后续测试中，还要注意对子域名进行筛选整理，太多的垃圾子域名和没用的子域名，主要看你的收集的子域名方法决定。

#### DNS数据

以DNS解析历史记录查询域名资产

![image-20260126175621260](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126175621260.png)

![image-20260126175658196](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126175658196.png)

#### 证书查询

以SSL证书解析查询域名资产

![image-20260126180038033](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126180038033.png)

![image-20260126180419040](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126180419040.png)

下图为另外一个网站，使用域名(domain name)的方式。

前面为域名，后面为证书信息。

![image-20260126180519362](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126180519362.png)

#### 网络空间

多网络空间综合型获取的记录

暂时没有开网络空间的会员，所以就先不做演示。

![image-20260126180744913](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126180744913.png)

#### 威胁情报

各类接口的集成的记录

![image-20260126181118881](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126181118881.png)

#### 枚举解析

结果主要以字典决定

https://github.com/knownsec/ksubdomain

https://github.com/shmilylty/OneForAll

##### oneforall

安装库：

因为我电脑有两个python版本，另外一个版本太新了，oneforall只能用低版本的。

```
py -3.9 -m pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

![image-20260126191749493](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126191749493.png)

使用oneforall收集子域名：

```
python oneforall.py --target example.com run
//或者
python3 oneforall.py --target example.com run
//拿迪总的xiaodi8举例：
py -3.9 oneforall.py --target xiaodi8.com run
```

![image-20260126192919401](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126192919401.png)

结果保存地点：

![image-20260126192954379](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126192954379.png)

#### JS提取子域名

![image-20260126193155672](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126193155672.png)

后续会讲到一些自动化工具。

## 思考

1. 这节课结束之后，子域名提取中哪些是主动信息收集，哪些是被动信息收集？

   子域名收集中的1、2、3、4、5都是被动信息收集。JS提取子域名不用工具算被动，使用工具就是主动。

2. 这节课结束之后，有了这些信息，下一步该搜集哪些其他信息？

   没有固定的体系。

   | 维度     | 小型企业                           | 中大型企业                                                   |
   | -------- | ---------------------------------- | ------------------------------------------------------------ |
   | 资产规模 | 域名+IP 一共几十条，业务线单一     | 多业务、多子公司、多云混合，资产指数级膨胀                   |
   | 网络架构 | 一台云服务器“all in one”           | 内外网隔离、CDN+WAF+云防线、SD-WAN、办公/生产/测试网分离     |
   | 暴露面   | 80/443/22/3306 全开，默认后台遍地  | 边缘资产藏在 CDN、负载、API 网关后面；测试/灰度域名多，正式站收敛 |
   | 防护水平 | 没有专职安全，默认口令、老漏洞一堆 | 有 SOC/EDR/WAF/堡垒机，漏洞窗口期短，需要“绕过”而不是“硬刚”  |
   | 管理流程 | 老板一句话就能改配置               | 变更要走工单，测试线可能宽松，成为突破口                     |

   小型企业：

   子域名扫完之后，直接全端口+弱口令+老漏洞进行检测，优先拿shell再内网横移。

   中大型企业：

   先“拆业务”：按备案、Whois邮箱等等把资产切成多条线。

   再找边缘：

   子域、证书备用名、旧版本接口、移动 APP 后端、内部 DNS 泄露、GitHub/码云源码。

   接着躲waf：

   利用云原生组件（K8s api、Docker 2375、etcd 2379）、内部 SSO、邮件 VPN 入口、分支 IP。

   最后进行测试。



