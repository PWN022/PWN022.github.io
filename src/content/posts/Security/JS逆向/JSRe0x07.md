---
title: WX小程序&反编译解包&HOOK注入点&在线调试&断点分析&算法还原&特定版本
published: 2026-09-02T12:00:00
description: 从反编译解包到Hook注入调试，再到小程序加密算法分析。
tags:
  - 小程序
  - JS
  - JS逆向
  - HOOK
category: 网络安全
draft: false
---

# 知识点

1. JS逆向-WX小程序-反编译解包
2. JS逆向-WX小程序-HOOK注入点
3. JS逆向-WX小程序-案例演示

# 环境准备

1、反编译项目和HOOK项目

-反编译：24天的内容

-HOOK项目：

https://github.com/eeeeeeeeee-code/e0e1-wx

https://github.com/JaveleyQAQ/WeChatOpenDevTools-Python

2、微信特定版本和小程序版本

https://github.com/tom-snow/wechat-windows-versions

https://github.com/JaveleyQAQ/WeChatOpenDevTools-Python

# 分析技术

1、反编译解包

2、HOOK注入调试

3、常规的JS调试

# 案例演示

某医疗小程序调试分析加密算法

# 个人总结

本节详细操作过程可参考文章：https://superhero.blog.csdn.net/article/details/152282578

本节主要内容就是对小程序的反编译以及逆向，但是由于版本问题，没能成功跟随本课程进行实践

**为什么需要用到hook：**

官方为了**安全和性能**考虑，默认**移除了**小程序运行环境里打开DevTools的入口（如右键菜单、F12快捷键）。因此，需要通过Hook这种“外部手段”，重新激活这些被**隐藏或禁用的功能**。

**为什么要反编译：**

小程序上线前会经过编译、混淆、压缩等处理，最终打包成一个 `.wxapkg` 文件，已经不是开发者编写的原始代码了。反编译就是为了从这个包中还原出相对可读的JavaScript、WXML等源码

**一个典型的实战场景是：**  

在抓包分析时，某个关键数据包的**请求参数或加密函数名**，在动态调试中能看到它被加载，但如果在所有反编译出的JS文件中搜索这个关键字，却完全找不到。这种情况往往意味着该逻辑被放在了**分包**中，或者经过了**字符串加密/动态加载**。此时，只有通过完整的反编译和静态分析，才能定位到这些隐藏的代码片段，进而分析加密算法、接口参数构造逻辑、密钥硬编码问题等