---
title: 公众号资产&供应链回溯&Github泄漏&多渠道泄漏&资产监控&引擎语法
published: 2026-02-02 20:00:00
description: 公众号资产收集（目标公众号服务、第三方资产）、目标旁路获取和拓展（edusrc挖洞思路）、敏感配置监控。
tags: [信息收集]
category: 网络安全
draft: false
---

# 知识点

1. 信息收集-泄漏安全-信息监控&搜索语法
2. 信息收集-供应链安全-收集&ICO&目标溯
3. 信息收集-公众号资产-官方服务&第三方引用

## 公众号-渠道资产-第三方引入

### 目标公众号服务获取

![image-20260202181655743](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260202181655743.png)

### 官方服务&第三方资产

意思就是一些公众号提供的选项，点击之后有的链接并非微信本身的，会跳转到小程序或者外部链接。从这方面寻找第三方资产。

## 供应链-目标旁路-获取和拓展

这是一种典型的迂回攻击方式。攻击者将目光聚集在目标企业的上下游供应商，比如IT供应商、安全供应商等，从这些上下游企业中找到软件或系统、管理上的漏洞，进而攻进目标企业内部。

```
-商业购买系统

-软件开发商

-外包业务

-代理商

-招投标文件

目标供应链获取：可以企业产权或应用提示等
供应链信息收集：ico拓展 演示站点 成功案例等 
```

案例文章：

https://mp.weixin.qq.com/s/YSD6yGGlBchY61hAZdKLoA

https://mp.weixin.qq.com/s/a8wyCeY7j29j6ITXfisOtQ

https://mp.weixin.qq.com/s/LQ5yeVJK4yCysxArwxSYbg

### 演示案例0

#### 供应链例子edusrc挖洞思路

1. 找供应链公司，通过演示站点或提供的ico或特征文件找到大量高校使用系统的目标，一旦测出这个应用产品系统的漏洞，形成了通杀

   ![image-20260202183958700](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260202183958700.png)

2. 找高校目标，通过高校系统的信息或者ico等找到供应链，再从供应链继续找使用同样的系统的高校目标，一旦测出这个应用产品系统的漏洞，形成了通杀

   ![image-20260202184608603](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260202184608603.png)

   这个厂商应该修复了一些出现漏洞点的功能界面，这些能搜索到的网站都已经undefined了。
   
    核心：如何找到系统的漏洞
   
   1. **尽量找到源码（源码获取途径）**
   
   2. **旁入方法（找相似目标的存在脆弱点为突破）**
   
      这里就简单解释一下：
   
      比如a和b使用的同样一套厂家的系统，但是b的系统上面还有其他资产，可以通过拿到b的其他资产的服务器，进行权限跨越或者其他等拿到和a相同的系统源码。在这种情况如果测出源代码中存在漏洞，那么就可以利用这点对a站进行测试。
   
      或者社工找厂商拿到该系统的源码。

## 信息泄漏-源码文档-敏感配置监控

1. Github监控

   GITHUB资源搜索：

   ```
   in:name test               #仓库标题搜索含有关键字 
   
   in:descripton test         #仓库描述搜索含有关键字 
   
   in:readme test             #Readme文件搜素含有关键字 
   
   stars:>3000 test           #stars数量大于3000的搜索关键字 
   
   stars:1000..3000 test      #stars数量大于1000小于3000的搜索关键字 forks:>1000 test           #forks数量大于1000的搜索关键字 
   
   forks:1000..3000 test      #forks数量大于1000小于3000的搜索关键字 size:>=5000 test           #指定仓库大于5000k(5M)的搜索关键字 
   
   pushed:>2019-02-12 test    #发布时间大于2019-02-12的搜索关键字 created:>2019-02-12 test   #创建时间大于2019-02-12的搜索关键字
   
   user:test                  #用户名搜素 
   
   license:apache-2.0 test    #明确仓库的 LICENSE 搜索关键字 language:java test         #在java语言的代码中搜索关键字 
   
   user:test in:name test     #组合搜索,用户名test的标题含有test的
   
   关键字配合谷歌搜索：
   
   site:Github.com smtp   
   
   site:Github.com smtp @qq.com   
   
   site:Github.com smtp @126.com   
   
   site:Github.com smtp @163.com   
   
   site:Github.com smtp @sina.com.cn 
   
   site:Github.com smtp password 
   
   site:Github.com String password smtp
   ```

   系统源码：特征，文件等

   敏感信息：密码，文档，人员等

   监控项目：

   https://github.yhuisec.com/

   https://github.com/madneal/gshark

   https://github.com/NHPT/FireEyeGoldCrystal

   https://github.com/Explorer1092/Github-Monitor

2. 其他渠道（搜索引擎）

   个人信息 网盘泄漏 文档泄漏

   ```
   inurl:xxx.com filetype:xls
   
   inurl:xxx.com password admin
   
   site:xxx.com filetype:xls|doc|pdf
   ```
   
   

