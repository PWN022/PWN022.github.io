---
title: 公众号服务&长期Github监控&供应链&证书图标邮箱资产
published: 2025-10-13
description: 公众号获取、Github监控、使用证书和ico进行目标搜索。
tags: [Web,信息打点]
category: 网络安全
draft: false
---

# 公众号服务&Github监控&供应链&网盘泄漏&证书图标邮箱资产

## 微信公众号-获取&三方服务

1. 获取微信公众号途径：

   - 通过爱企查等平台查询（知识产权）

   <img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/21-01.png" style="zoom: 80%;" />

   - 或者通过搜狗微信查询：https://weixin.sogou.com/，但是现在只能搜到文章，不能搜到公众号了。

   - 还有一种就是通过wx自带的功能去对公众号的一个搜索。

     <img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/21-02.jpg" style="zoom: 50%;" />

2. 微信公众号有无第三方服务。

   意思也就是微信公众号提供功能的服务用的是否是个人的网站，还是使用各种平台提供的接口。如果是个人的那么就可以搜集到一些相关信息。

## Github监控-开发&配置&源码

目的是：搜集目标中开发人员或者托管公司上传的项目存在源码泄漏或配置信息（密码密匙等），人员数据库等敏感信息，找到多个脆弱点。

1. 人员&域名&邮箱等筛选

   eg：xxx.cn password in:file

   [https://gitee.com/](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fgitee.com%2F&objectId=2437290&objectType=1&contentType=undefined)

   [https://github.com/](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fgithub.com%2F&objectId=2437290&objectType=1&contentType=undefined)

   [https://www.huzhan.com/](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fwww.huzhan.com%2F%05&objectId=2437290&objectType=1&contentType=undefined)

   GITHUB资源搜索：

   ```javascript
   in:name test               #仓库标题搜索含有关键字 
   in:descripton test         #仓库描述搜索含有关键字 
   in:readme test             #Readme文件搜素含有关键字 
   stars:>3000 test           #stars数量大于3000的搜索关键字 
   stars:1000..3000 test      #stars数量大于1000小于3000的搜索关键字 forks:>1000 test           #forks数量大于1000的搜索关键字 
   forks:1000..3000 test      #forks数量大于1000小于3000的搜索关键字 size:>=5000 test           #指定仓库大于5000k(5M)的搜索关键字 pushed:>2019-02-12 test    #发布时间大于2019-02-12的搜索关键字 created:>2019-02-12 test   #创建时间大于2019-02-12的搜索关键字 user:test                  #用户名搜素 
   license:apache-2.0 test    #明确仓库的 LICENSE 搜索关键字 language:java test         #在java语言的代码中搜索关键字 
   user:test in:name test     #组合搜索,用户名test的标题含有test的
   ```

   关键字配合google使用：

   ```
    site:Github.com smtp
    site:Github.com smtp @qq.com
    site:Github.com smtp @126.com
    site:Github.com smtp @163.com
    site:Github.com smtp @sina.com.cn
    site:Github.com smtp password
    site:Github.com String password smtp
   ```

2. 语法固定长期后续监控新泄露

   - 基于关键字监控

   - 基于项目规则监控

     https://github.com/madneal/gshark

     https://github.com/NHPT/FireEyeGoldCrystal

     https://github.com/Explorer1092/Github-Monitor

### GShark演示案例

暂无

## 网盘资源搜索-全局文件机密

主要就是查看网盘中是否存有目标的敏感文件。（一般搜不到什么有用的东西，只能是尝试进行搜索）

如：企业招标，人员信息，业务产品，应用源码等。

混合盘：https://hunhepan.com/

## 网络空间进阶-证书&图标&邮箱

- 证书资产

  fofa quake hunter

- ICO资产

  fofa quake hunter

- 邮箱资产

  IntelligenceX：https://intelx.io/

  dehashed：https://dehashed.com/

  网站地址：https://hunter.io/（很难注册，注册了之后没有免费选项）

  由于邮箱可以尝试弱口令爆破，可以从邮箱中获取敏感信息，因此邮箱也可以作为一个突破口

### 证书资产搜索案例1

点击URL旁边的锁—>连接安全—>证书。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/21-02.png)

之后在fofa、quake、hunter这三个中随便使用哪个都可以进行后续查询。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/21-03.png)

### ICO资产搜索案例1

打开网站按F12，点击network处之后再刷新，可以发现此站的ico文件（或者直接查看源码，找到url直接下载就可以了）。

之后跳转到该文件的位置保存即可。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/21-04.png)

在这里我还是使用fofa进行搜索，fofa的搜索框右侧有选项可以选择进行icon搜索。把下载好的ico上传到这里即可查看搜索到的结果。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/21-05.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/21-06.png)

### 实战案例四则-技术分享打击方位

案例1–招标平台二级跳

案例2–爱企查隐藏的惊喜

案例3–邮箱爆破到内网


案例4–不靠系统漏洞，从外网获取域控
