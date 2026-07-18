---
title: 访问控制篇&水平越权&垂直越权&未授权访问&级别架构&项目插件&SRC复盘
published: 2026-07-17
description: 越权与未授权访问漏洞分三类：水平越权（同级用户）、垂直越权（低到高级别）及未授权访问（免认证）。挖掘关注URL参数、用户ID、roleid等标识，通过参数篡改、路径枚举、JS敏感信息提取测试。可利用自动化工具辅助，重点排查API接口、后台路径及配置文件，发现访问控制缺陷。
tags:
  - 越权
  - Web攻防
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-业务逻辑-越权&访问控制&未授权
2. WEB攻防-业务逻辑-检测项目&挖掘思路报告

水平越权：同级别的用户之间权限的跨越

垂直越权：低级别用户到高级别用户权限的跨越

未授权访问：通过无级别用户能访问到需验证应用

实验：

https://portswigger.net/web-security/all-labs#access-control-vulnerabilities

# 未授权访问（访问控制不当）

## 实验室：不受保护的管理功能和不可预测的URL

从网站加载的url包的值、js文件中，可能含有一些敏感路径

通常是因为没有做登录或者权限认证，直接就能访问到的，可以进行一些危险操作行为

## 实验室：由请求参数控制的用户角色

登录抓包发现，数据包中有一个`Admin=false`，显而易见校验的脆弱性

直接修改为true即可提为admin权限

测试：删除凭据访问；未知提取或泄露的URL访问等

# 水平越权

## 实验室：由请求参数控制的用户ID

登录后台抓包

```
GET /my-account?id=xxx HTTP/2
```

修改id值为其他用户，就可以看到其他用户的信息，实现水平越权

## 实验室：用户ID由请求参数控制，用户ID不可预测

同上抓包发现

```
GET /my-account?id=78117e15-xxxx-xxxx-xxxx-xxxxxxxxxxxxxxx HTTP/2
```

id值没有规律，可以尝试从网站中有其他用户互动的地方抓包，例如文章的评论区等等，抓包尝试查看其他用户id

抓包发现：这时就实现了水平越权

```
<a href='/blogs?userid=xxxx-xxxxx-xxx...'>
```

测试：用户A凭据测试用户B的功能，参数值修改指向等

# 垂直越权

## 实验室：可以在用户配置文件中修改用户角色

登录，尝试修改一些信息，比如邮箱等，同时抓包

发现为json格式的数据

```
{
	"email":"xxx@qq.com"
}
```

发送该请求，响应的数据为：

```
{
	"username":"xxx",
	"email":"xxx@qq.com",
	"apikey":"xxxxxxxxxxx",
	"roleid":1
}
```

这种`roleid`或者单纯`role`字段命名肯定跟用户的身份有关，将发送的数据包中修改为：

```
{
	"email":"xxx@qq.com",
	"roleid":2
}
```

发包，此时再访问管理员界面`/admin`，就可以看到其他用户的信息，造成垂直越权

## 实验室：请求参数控制用户ID并泄露密码

登录后台，抓包发现修改密码的属性值存在密码泄露

```
<input ... value='密码'>
```

将数据包中的id修改为管理员的尝试获取

```
GET /my-account?id=administrator HTTP/2
```

测试：用户A凭据测试高级别用户的功能，参数值修改指向等

# 挖掘总结

关注到URL及参数数据，找到所有和用户相关的参数名和参数值提交测试

涉及到JS中提取URL或数据，在返回包中提取参数名和参数值，FUZZ技术等

# 检测项目

https://github.com/smxiazi/xia_Yue

https://github.com/Ed1s0nZ/PrivHunterAI

https://github.com/WuliRuler/AutorizePro

# 挖掘思路报告

详细看视频处，大多都是学校的一些src

题外话：大概是在25年下半年，我还尝试过水平修改室友的密码，发现服务器做了验证，修改之后没提示也没成功，感觉现在很少能遇到这样的洞了