---
title: 计数芯片8253
published: 2023-11-25
description: 微机原理计数芯片8253知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第六章

## 可编程定时/计数器8253

**如何实现定时**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-22%2017.47.49.png" alt="截屏2023-11-22 17.47.49" style="zoom:33%;" />

软件延时例如：（可能会在单片机用，但是微机原理基本不会使用）

MOV cx,1000  
LOP1:LOOP LOP1

脉冲计数：方波信号如上图

### 外部引线及内部结构

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-22%2017.51.43.png" alt="截屏2023-11-22 17.51.43" style="zoom:33%;" />

有**3个独立**的16位二进制的定时/计数器（通道），即0-65535。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-24%2016.43.20.png" alt="截屏2023-11-24 16.43.20" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-24%2017.38.48.png" alt="截屏2023-11-24 17.38.48" style="zoom:33%;" />

三个独立通道CLK0/1/2、GATE0/1/2、OUT0/1/2。

CLK：输入信号/基准输入，基准的输入源就是CLK端口。

GATE：门控位，控制计数器的启停。

OUT：计数器输出信号，不同工作方式下产生不同波形。

例：基准频率T=1s，需计数60，那么OUT端应该输出1min。

![截屏2023-11-24 17.27.40](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-24%2017.27.40.png)

8253的A0和A1(片内寻址,四种组合也就是四个地址)端口与8086的不同，不能直接连接8086的A0和A1端口。 
原因：若8253的A0为1、A1暂且不管，那么此时是一个奇地址应该出现在D8-D15，而8086的D8-D15实际没有连接8253芯片，且D0-D7是偶地址。  
解决方法：8086的A2接8253的A1、8086的A1接8253的A0，同时让8086的A0=0，这样就变成了偶地址。

注：解决办法是自己接的时候使用，如果题中给出的是接A0A1，那么按照题中的“错”着来就可以。且还有接其他线的可能。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-24%2017.31.59.png" alt="截屏2023-11-24 17.31.59" style="zoom:33%;" />

连接系统端的主要引线：

D7-D0,A1,A0。作用为选择。  

CS非,A1为0,A0为0。作用为选择计数通道0。  
RD非,A1为0,A0为1。作用为选择计数通道1。  
WR非,A1为1,A0为0。作用为选择计数通道2。  
A1,A0,A1为1,A0为1。作用为控制寄存器。

前三种是给计数器送初值，A1和A0是规定计数器0，1，2的工作方式。

### 计数启动方式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-24%2017.45.02.png" alt="截屏2023-11-24 17.45.02" style="zoom:33%;" />

不同方式的启动方式不同。

程序指令启动—软件启动。  
外部电路信号启动—硬件启动。

软件启动过程：GATE端保持为高电平‘1’，给计数器使用指令送入初值后启动。

硬件启动过程：GATE端有一个上升沿，也就是由‘0’变为‘1’(类似开/关)之后启动。

#### 编程结构(仅了解)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-24%2017.50.13.png" alt="截屏2023-11-24 17.50.13" style="zoom:33%;" />

#### 控制字

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-24%2017.53.21.png" alt="截屏2023-11-24 17.53.21" style="zoom:33%;" />

### 8253的控制字格式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-24%2018.03.11.png" alt="截屏2023-11-24 18.03.11" style="zoom:33%;" />

D7,D6：计数器选择。  
D5,D4：读/写指示。(一般不用00)  
D3,D2,D1：工作方式。  
D0：数制选择。(二/BCD)(写进制以及代码时要规范)

#### 关于控制字的说明

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-24%2018.15.50.png" alt="截屏2023-11-24 18.15.50" style="zoom:33%;" />

设置工作方式后，必须给计数器设置初值。

#### 频率

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-24%2018.20.48.png" alt="截屏2023-11-24 18.20.48" style="zoom:33%;" />

频率：例如刷新率60hz，那就代表屏幕一秒钟刷新60次。

1MHZ=10的3次方KHZ=10的6次方HZ。  
1M=10的6次方；1K=10的3次方。

#### 周期

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-24%2018.28.08.png" alt="截屏2023-11-24 18.28.08" style="zoom:33%;" />

周期和频率互为倒数。

1s=1000ms=1000000μs。  
1毫秒=10的-3次方秒；1微秒=10的-6次方秒。

#### 频率/周期



<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-25%2012.41.46.png" alt="截屏2023-11-25 12.41.46" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-25%2012.44.12.png" alt="截屏2023-11-25 12.44.12" style="zoom:33%;" />

周期：初值N=TOUT/TCLK，N单位(个)，也可以说是没有单位。

T=1/F，初值N=1/FCLK比1/FOUT。

频率：初值N=FCLK/FOUT

1 Hz = 1/s 或 1 s = 1/Hz

#### 例题

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-25%2013.12.23.png" alt="截屏2023-11-25 13.12.23" style="zoom:33%;" />

#### 初始化程序流程

**8位**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-25%2013.26.50.png" alt="截屏2023-11-25 13.26.50" style="zoom:33%;" />

地址为40H-43H，给计数通道1设置初值，所以送到41H。

**16位**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-25%2013.29.09.png" alt="截屏2023-11-25 13.29.09" style="zoom:33%;" />