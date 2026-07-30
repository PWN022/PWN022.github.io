---
title: APP应用&产权渠道&服务资产&通讯抓包&静态提取&动态调试&测试范围
published: 2026-01-31 12:00:00
description: APP的信息收集、资产提取：通讯抓包、静态提取（人工反编译、脚本反编译）、动态调试。
tags: [信息收集,APP]
category: 网络安全
draft: false
---

# 知识点

1. 信息收集-APP应用-公开信息-知识产权&开发者定位
2. 信息收集-APP应用-资产信息-抓包&静态提取&动态调试

APP渗透测试的范围应涵盖APP所有功能和组件，包括但不限于以下几个方面：

- 前端安全：包括界面交互、输入验证、会话管理等。
- 后端安全：包括API接口、数据库交互、业务逻辑等。
- 数据传输安全：包括数据传输过程中的加密、签名、完整性校验等。
- 用户认证与授权：包括登录、注册、权限分配、会话管理等。
- 第三方库与组件：包括使用的第三方库、SDK、插件等的安全性和稳定性。
- 配置与环境：包括APP的配置文件、环境变量、日志管理等。

## 移动安全

### 站在逆向角度

```
有无保护，源码修改打包HOOK(拦截,实现在线调试)
删除验证代码 证书 代理 抓包
删除验证代码 破解版（突破会员制度等）
翻到密钥 接口 密码等关键敏感
```

### 站在渗透角度

```
APP架构资产-表现，源码，调试逻辑
web 域名 cms api接口 web安全问题
ip 端口 服务 web服务（见上） 数据库 中间件 等服务测试
API 接口 测试
逻辑安全问题

通过获取App配置、数据包，去获取url、api、osskey、js等敏感信息。
1、资产信息-IP 域名 网站-转到对应Web测试 API接口测试 服务测试 
2、泄露信息-配置key 资源文件-key（osskey利用，密钥配置等）
3、代码信息-代码安全 HOOK绕过限制（证书，代理，脱壳等）-逆向相关
APP中收集资产：通讯抓包，静态提取，动态调试
```

## 演示案例0-APP应用-公开信息-知识产权&开发者定位

### 公开信息收集

通过搜索引擎、社交媒体、应用商店等渠道，收集目标APP信息，如APP名称、版本、开发者、下载量等。名称获取APP信息（爱企查/小蓝本/七麦/点点）

#### 查备案信息在搜

#### 网站上有APP下载

通过网站上的app store/安卓应用市场下载。

#### 市场直接搜单位名称

https://www.qimai.cn/

https://app.diandian.com/（使用较多）

https://aiqicha.baidu.com/

https://www.xiaolanben.com/ （使用较多）

## 演示案例1-APP应用-资产信息-抓包&静态提取&动态调试

### APP资产提取：

#### 动态抓包

Burpsuite+Reqable

参考前期部分抓包技术

技术优点：没有误报

技术缺点：无法做到完整

#### 静态提取-反编译

技术优点：数据较为完整。

技术缺点：有很多无用的资产。

##### 人工反编译

用`javaide`、`jadx`工具直接打开`APK`，前提是没有加壳的情况下。

![image-20260131102913793](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131102913793.png)

可以全局搜索关键字找资产。

##### APKDeepLens

APKDeepLens收集APP的权限、组件信息、IP、Secret。

https://github.com/d78ui98/APKDeepLens

##### APKLeaks

APKLeaks工具，用于检查APK文件中的硬编码URL、API密钥等敏感信息。

https://github.com/dwisiswant0/apkleaks

命令：

```cmd
python .\apkleaks.py -f .\yl.apk
```

##### AppInfoScanner

AppInfoScanner对Android、iOS、WEB多场景应用进行信息扫描，收集IP、URL、Server、CDN等信息。

https://github.com/kelvinBen/AppInfoScanner

 命令：

```cmd
python .\app.py android -i .\yl.apk
```

#### 动态调试-反调试

技术优点：HOOK可解决不能抓包不能代理等情况。

技术优点：搞逆向的人能看到实时的app调用链等。

技术缺点：部分APP有反调试等无法做到完整。

##### MobSF

MobSF是一种自动化的移动应用（Android/iOS/Windows）静态和动态分析的测试，恶意软件分析和安全评估框架。

https://github.com/MobSF/Mobile-Security-Framework-MobSF

##### 安装教程

在运行之前，需要安装python环境，以及OPENSSL和visual studio，如果出现没有安装的情况下，会在运行脚本时进行提示，提示处也有相关的安装地址，之后运行脚本即可。

如果安装路径不同则修改setup.bat，如果出现端口占用则修改run.bat。

具体这里就先不演示了，后期会装一台虚拟机操作，不会在本地进行。

![image-20260131114801294](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131114801294.png)

##### 动态调试(模拟器需开启root)

![image-20260131114835065](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131114835065.png)

![image-20260131114859950](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131114859950.png)

![image-20260131114909643](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131114909643.png)

![image-20260131114923612](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131114923612.png)

![image-20260131114931324](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131114931324.png)

之后模拟器就会自动打开app

###### 证书绕过

![image-20260131115024172](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131115024172.png)

![image-20260131115034132](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131115034132.png)

###### 脚本调试

**ssl pinning：防止中间人攻击，证书欺骗。也就是防止抓包，那么bypass也就是绕过，可以让我们正常抓包。**

![image-20260131115104170](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131115104170.png)

![image-20260131115118419](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131115118419.png)

###### 结果生成

![image-20260131115135793](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131115135793.png)

![image-20260131115150629](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260131115150629.png)
