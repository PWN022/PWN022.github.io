---
title: deepseek-harness：秒了我的毕设
published: 2026-08-30T22:24:00
description: 好消息：AI 成功挖到洞了；坏消息：洞是我自己的毕设。
tags:
  - 日常
category: 随笔
draft: false
---

突发奇想体验一下AI挖洞，前段时间deepseek推出了`deepseek-harness`，装好skill就拿自己的毕设登录接口试水。结果刚进入打点阶段，就发现了一堆问题，具体如下：

## **【严重】未授权泄露任意用户密码哈希与敏感信息**

`GET /api/user/1` → 200，无需任何token

响应直接返回完整用户对象，**包含bcrypt密码哈希**（已脱敏）：

```text
{"code":"200","data":{"id":1,"username":"admin",
 "password":"$2a$10$[REDACTED]",
 "email":"admin@school.edu.cn",...}}
```

用户ID自增可遍历，1..N 全量拉取。可离线跑hashcat，也可配合JWT伪造链。

## **【中危】登录接口用户名枚举**

空body → `{"code":"-1","msg":"用户不存在"}`  
admin+任意密码 → `{"code":"500","msg":"系统异常"}`

存在的账号统一抛500，说明线上密码校验路径有未处理异常，与源码推断存在偏差。

## **【低危】Vite dev server 源码暴露**

`/src/**` 全量前端源码可读，含Token明文存localStorage、sourcemap泄露本机绝对路径。

---

_以上，是AI在几分钟内给我的答卷。而以下，是我面对这份答卷时的心情。_

AI真是太好用了你们知道吗...

但是，唉....