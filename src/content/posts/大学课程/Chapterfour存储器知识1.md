---
title: 存储器基本知识-上
published: 2023-10-30
description: 微机原理存储器基本知识点部分。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第四章

## 存储器基本知识

## 编址方式(*)

## 统一编址和独立编址

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2016.11.53.png" alt="截屏2023-10-30 16.11.53" style="zoom:33%;" />

统一编址：即把I/O端口当作内存单元来对待，内存空间划出一部分给I/O端口，只有地址不同。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2016.18.43.png" alt="截屏2023-10-30 16.18.43" style="zoom:33%;" />

独立编址(8086采用)：I/O端口和存储器相互独立，通过M/IO非来连接两个端口，指令不同，地址可相同，分开设置，互不影响。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2016.42.08.png" alt="截屏2023-10-30 16.42.08" style="zoom:33%;" />

8086**内存**空间为1M，**I/O**空间为64k。

### 统一编址的优缺点

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2016.48.35.png" alt="截屏2023-10-30 16.48.35" style="zoom:33%;" />

统一编址的优点：  

1. I/O端口因为和内存共用一个空间，所以数目几乎不受限制。
2. 访问时只看地址就能区分出是I/O或者内存，所以数据处理能力强。
3. CPU可以省略M/IO非。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2016.53.57.png" alt="截屏2023-10-30 16.53.57" style="zoom:33%;" />

统一编址的缺点：

1. I/O操作不清晰，因为内存和I/O共用一个空间。
2. I/O端口占用了一部分内存空间。
3. 内存的地址位数较多。

### 独立编址的优缺点

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2016.56.48.png" alt="截屏2023-10-30 16.56.48" style="zoom:33%;" />

独立编址的优点：

1. 不占用内存空间。
2. 使用I/O指令，程序清晰。
3. 译码电路比较简单。

独立编址的缺点：

只能用专门的I/O指令，也就是IN/OUT，访问端口的方法不如访问存储器的方法多。  
例如：MOV AL，[SI]或者[2000H]或者[BX]（实际上有专门的指令更好一点）

## 存储系统层次结构

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2017.14.33.png" alt="截屏2023-10-30 17.14.33" style="zoom:33%;" />

高速缓冲存储器：缓冲内存读来的数据。

主存储器：内存。

外存储器：硬盘。

（靠近CPU的读写快，距离CPU越远的读写慢。容量也是由小到大。）

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2017.16.14.png" alt="截屏2023-10-30 17.16.14" style="zoom:33%;" />

CPU可以通过主存直接读写，当主存比较慢时，需要用主存读到cache再读入CPU。主存可以和外存直接交换数据。

### 主存储器和外存储器

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2018.27.49.png" alt="截屏2023-10-30 18.27.49" style="zoom:33%;" />

主存即内存：一般把具有一定容量且速度较高的存储器作为内存，CPU可直接用指令对内存储器进行读写。存取速度快，容量有限。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2018.31.22.png" alt="截屏2023-10-30 18.31.22" style="zoom:33%;" />

外存（辅存或海存）：存储容量大、速度较低、位于主机之外的存储器，CPU不能直接用指令对外存进行读写，必须先将它调入内存。

**内存—外存存储层次的形成解决了存储器的大容量和低成本之间的矛盾。**

### 主存储器和高速缓冲存储器

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2018.38.59.png" alt="截屏2023-10-30 18.38.59" style="zoom:33%;" />

高速缓冲存储器：为使主存和CPU的速度相匹配，提高CPU访问存储器的速度，在CPU和内存中间设置高速缓冲器。

**高速缓存—内存层次的形成解决了速度与成本的矛盾。**

### 什么是高速缓冲存储器(cache)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2018.43.26.png" alt="截屏2023-10-30 18.43.26" style="zoom:33%;" />

高速缓冲存储器是存在于**内存和CPU**之间的一级存储器，由**静态存储芯片(SRAM)**组成，容量较小但速度比主存高，接近于CPU的速度。和内存一起构成一级的存储器。

某些机器甚至有**二级三级缓存**，每级缓存比**前一级缓存速度慢且容量大**。

## 存储器的分类

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2019.19.14.png" alt="截屏2023-10-30 19.19.14" style="zoom:33%;" />

按存取方式分类：

1. 随机存储器(RAM)  
   即可读又可写，又称读/写存储器。如主存。
2. 只读存储器(ROM)  
   只能读，不能写。存放固定不变的系统程序。如BIOS。
3. 顺序存储器(SAM)

## ~~存储器的基本组成~~

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2019.27.16.png" alt="截屏2023-10-30 19.27.16" style="zoom:33%;" />

通过译码电路—矩阵(找取地址)—数据输入和输出都有缓冲—读入写入有控制信号

## 存储器的技术指标

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2019.30.53.png" alt="截屏2023-10-30 19.30.53" style="zoom:33%;" />

1. 存储容量—以允许存放的字数x位数或字节数表示存储器的容量。  
   32Kx16的单位是b，或者32Kx8此处的8是位/b 结果就是32KB，B—字节  
   1KB = 2的十次方B = 1024B = 1024x8位(b)

**例题**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2019.40.52.png" alt="截屏2023-10-30 19.40.52" style="zoom: 33%;" />

2的地址线数次方x数据线数=总线数  
图中：存储器大小 256k位，数据线8位，求地址线。  
256k/8 = 2^15^，地址线有15条。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2019.48.29.png" alt="截屏2023-10-30 19.48.29" style="zoom:33%;" />

2. 存取周期**(数据)**（又称读写周期或访问周期）  
   通常指连续存入或取出两个数据所间隔的时间。
3. 取数时间**(代码)**—从CPU发出读命令开始，直到存储器获得有效读出信号的一段时间。
4. 可靠性—通常以平均无故障工作时间来衡量可靠性。
5. 经济性—常以“性能价格比”来衡量经济性能的好坏。