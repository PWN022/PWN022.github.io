---
title: 8253的工作方式及级连
published: 2023-11-28
description: 微机原理8253的工作方式及级连知识及习题。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第六章

## 8253的工作方式以及级连

## 工作方式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-25%2015.54.39.png" alt="截屏2023-11-25 15.54.39" style="zoom:33%;" />

### 方式0—计数结束中断(***)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-25%2015.59.26.png" alt="截屏2023-11-25 15.59.26" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-25%2016.02.56.png" alt="截屏2023-11-25 16.02.56" style="zoom:33%;" />

软件启动，不自动重复计数。适用于单次计时。

在计数过程中为低电平， 计数结束后变为高电平。

计数过程中，GATE端应保持高电平。

计数过程中可以随时修改初值并重新开始计数。

### 方式1—单稳态触发器(***)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-25%2016.07.53.png" alt="截屏2023-11-25 16.07.53" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-25%2016.14.22.png" alt="截屏2023-11-25 16.14.22" style="zoom:33%;" />

硬件启动，如果没有门控信号触发时不自动重复计数。

送初值后，OUT端变高电平。GATE门控有跳变就开始计数。

计数开始OUT端变为低电平，计数结束后又变高。

p2中，第二句话的意思可以理解是一个复位信号，被复位的是初值。

### 方式2—频率发生器(分频器)(***)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2014.13.22.png" alt="截屏2023-11-28 14.13.22" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2014.15.59.png" alt="截屏2023-11-28 14.15.59" style="zoom:33%;" />

软、硬件启动，自动重复计数。

装入控制字后OUT端变高电平，计数到最后一个CLK时OUT输出负脉冲，并持续重复此过程。

OUT端也就是在数有多少个CLK。

计数过程自动重复进行，计数过程中修改初值不影响本轮计数过程，但影响下一轮。

### 方式3—方波发生器(***)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2014.21.58.png" alt="截屏2023-11-28 14.21.58" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2014.26.51.png" alt="截屏2023-11-28 14.26.51" style="zoom:33%;" />

软、硬件启动，自动重复计数。

装入控制字后OUT端变高电平，然后OUT连续输出对称方波。

前N/2或(N+1)/2个CLK，OUT变高，后N/2或(N-1)/2个CLK，OUT为低。奇数的高电平的时间比低电平的时间多一个。

OUT输出方波，前半周期为高，后半周期为低。

计数过程中修改初值不影响本半周期计数过程。

#### 方式3和2的不同点

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2014.18.55.png" alt="截屏2023-11-28 14.18.55" style="zoom:33%;" />

方式3和方式2的不同点，就在于波形不同其余基本相同。

### 方式4—软件触发选通

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2014.33.06.png" alt="截屏2023-11-28 14.33.06" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2014.34.09.png" alt="截屏2023-11-28 14.34.09" style="zoom:33%;" />

与方式0相比就是对方式0的计数区间内取反。

软件启动，不自动重复计数。

OUT端计数结束时输出一个TCLK宽度的负脉冲。计数过程中修改初值不影响本轮计数过程，但影响下一轮。

### 方式5—硬件触发选通

与方式4基本一致，只是硬件触发。

#### 方式5和4的不同点

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2014.37.26.png" alt="截屏2023-11-28 14.37.26" style="zoom: 50%;" />

### 例题1

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2014.55.24.png" alt="截屏2023-11-28 14.55.24" style="zoom:33%;" />

阳极接‘1’，阴极接‘0’时才会亮，所以OUT端应是低电平触发，高电平恢复。

### 例题2

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2014.58.46.png" alt="截屏2023-11-28 14.58.46" style="zoom:33%;" />

高低各半，方式三。

### 六种工作方式的输出波形

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2015.03.13.png" alt="截屏2023-11-28 15.03.13" style="zoom:33%;" />

### 8253的两种计数模式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2015.15.38.png" alt="截屏2023-11-28 15.15.38" style="zoom:33%;" />

8253是一个减1计数器。值先减1，判断是否为0，若为0停止当圈。

二进制：

初值0-0FFFFH(0-65535)，计数范围是1-65536。

十进制：

初值0000H-9999H(0-9999)，计数范围是1-10000。

### 例题3



<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2015.39.14.png" alt="截屏2023-11-28 15.39.14" style="zoom:33%;" />

## 级连的运用

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2016.32.01.png" alt="截屏2023-11-28 16.32.01" style="zoom:33%;" />

从1MHZ降频到1KHZ，再用1KHZ产生1HZ，这样就避免了溢出的情况。

第一级只能用方式2或者方式3。（方式3居多）且它们的乘积必须为10的6次方。

#### 例题1

分析过程

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-28%2016.53.50.png" alt="截屏2023-11-28 16.53.50" style="zoom:33%;" />

代码过程

MOV AL,00 11 011 0B;计数器0的控制字  

OUT 43H,AL  

MOV AX,20000  

OUT 40H,AL;送低8位  

MOV AL,AH  

OUT 40H,AL;送高8位

MOV AL,01 11 001 1B;计数器1的控制字  

OUT 43H,AL  

MOV AX,0100H;BCD码  

OUT 41H,AL;低8  

MOV AL,AH  

OUT 41H,AL;高8