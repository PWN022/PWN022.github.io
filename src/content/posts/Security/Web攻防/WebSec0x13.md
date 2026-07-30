---
title: SSRF服务端伪造&功能逻辑&SRC实践复盘&参数盲测&自动化检测&流量插件
published: 2026-07-03T15:00:00
description: 插件部分，对上一文档的内容补充。
tags:
  - Web攻防
  - SSRF
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-SSRF插件结合-SRC复盘与实战

# 功能逻辑挖掘

视频解析，格式转换，代码执行，在线笔记，数据采集等

# 参数盲测挖掘

https://github.com/gh0stkey/HaE

借助HaE规则找到数据包配合测试

1. Burp安装插件HaE
2. HaE规则配置文件修改
3. 配置插件选项开启使用

# 检测插件

https://github.com/banchengkemeng/Auto-SSRF

配置使用：

参考：https://mp.weixin.qq.com/s/99pPa1jrLR1t7_x40eH8TQ

1. Burp安装插件Auto-SSRF
2. Collaborator配置和开启
3. 配置插件选项开启监听使用

# 其他案例

https://mp.weixin.qq.com/s/63fC5STI5WAKn7O6c02kyQ

https://mp.weixin.qq.com/s/zXH3nudCY1VEj8AFMgwwXQ