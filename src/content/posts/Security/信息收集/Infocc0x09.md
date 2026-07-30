---
title: 项目系统&一键打点&资产侦察&企查产权&空间引擎&风险监测&利器部署
published: 2026-02-02 12:00:00
description: 自动化监控（灯塔、Nemo、Testnet）以及集成网络空间测绘的工具：Yakit、TscanPlus，自动化企查信息：Enscan，武器库f8x。
tags: [信息收集]
category: 网络安全
draft: false
---

# 知识点

1. 信息收集-项目推荐-自动化环境部署
2. 信息收集-项目推荐-自动化资产收集管理

## 自动化-网络空间-Yakit&TscanPlus

项目地址：https://www.yaklang.com/

项目地址：https://github.com/TideSec/TscanPlus

集成Fofa、Hunter、Quake、Zoomeye、Shodan、censys、VT、0.zone、微步等接口查询。

这两款空间也能使用空间测绘，这里就不多做演示。

## 自动化-企查信息-ENScan

项目地址：https://github.com/wgpsec/ENScan_GO

主要还是看自身账号权限。

1. 介绍：剑指HW/SRC，解决在HW/SRC场景下遇到的各种针对国内企业信息收集难题
2. 配置：ENScanGo在第一次使用时需要使用-v命令生成配置文件信息后进行配置
3. 使用：见项目文档

 ![image-20260202094909419](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260202094909419.png)

![image-20260202095716241](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260202095716241.png)

![image-20260202095811869](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260202095811869.png)

## 自动化-综合架构-ARL&Nemo&TestNet

### ARL灯塔

项目地址1：https://github.com/adysec/ARL（升级版）

项目地址2：https://github.com/ki9mu/ARL-plus-docker

1. 介绍：

   旨在快速侦察与目标关联的互联网资产，构建基础资产信息库。 协助甲方安全团队或者渗透测试人员有效侦察和检索资产，发现存在的薄弱点和攻击面。

2. 配置：（docker搭建）

   安装环境：Aliyun HK服务器 Ubuntu20.04

   ```
   apt update
   apt install unzip wget docker.io docker-compose -y
   cd /opt/
   mkdir docker_arl
   wget -O docker_arl/docker.zip https://github.com/ki9mu/ARL-plus-docker/archive/refs/tags/v3.0.1.zip
   cd docker_arl
   unzip -o docker.zip
   docker volume create arl_db
   cd ARL-plus-docker-3.0.1
   docker-compose pull
   docker-compose up -d
   ```

3. 使用：见直播操作

### Nemo_Go

项目地址：https://github.com/hanc00l/nemo_go

1. 介绍：

   Nemo是用来进行自动化信息收集的一个简单平台，通过集成常用的信息收集工具和技术，实现对内网及互联网资产信息的自动收集，提高隐患排查和渗透测试的工作效率，用Golang完全重构了原Python版本。

2. 配置：（docker搭建）

   安装环境：Aliyun HK服务器 Ubuntu18.04

   https://github.com/hanc00l/nemo_go/blob/main/docs/docker.md

   下载release的nemo_linux_amd64.tar后执行：

   ```
   mkdir nemo;tar xvf nemo_linux_amd64.tar -C nemo;cd nemo
   docker-compose up -d
   ```

3. 使用：见直播操作

### Testnet(推荐)

项目地址：https://github.com/testnet0/testnet

1. 介绍：

   TestNet资产管理系统旨在提供全面、高效的互联网资产管理与监控服务，构建详细的资产信息库。 该系统能够帮助企业安全团队或渗透测试人员对目标资产进行深入侦察和分析，提供攻击者视角的持续风险监测，协助用户实时掌握资产动态，识别并修复安全漏洞，从而有效收敛攻击面，提升整体安全防护能力。

2. 配置：（docker搭建）

   安装环境：Aliyun HK服务器 Ubuntu22.04

   ```
   git clone https://github.com/testnet0/testnet.git
   cd testnet && bash build.sh
   ```

3. 使用：见直播操作

![image-20260202111124186](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260202111124186.png)

![image-20260202112153758](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260202112153758.png)

![image-20260202112411452](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260202112411452.png)

## 自动化-武器库部署-F8x

项目地址：https://github.com/ffffffff0x/f8x

1. 介绍：

   一款红/蓝队环境自动化部署工具,支持多种场景,渗透,开发,代理环境,服务可选项等.

2. 配置：

   通过 CF Workers 下载 [推荐]

   wget : wget -O f8x https://f8x.io/

   curl : curl -o f8x https://f8x.io/

3. 使用：见项目文档

![image-20260202192656251](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260202192656251.png)

安装命令如下：

```
bash f8x -要部署的环境
```

