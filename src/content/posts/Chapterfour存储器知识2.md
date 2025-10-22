---
title: 存储器基本知识及存储器系统-下
published: 2023-10-31
description: 微机原理存储器基本知识及存储器系统部分。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第四章

## 随机读写存储器

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2019.52.38.png" alt="截屏2023-10-30 19.52.38" style="zoom:33%;" />

**静态RAM(SRAM)**

静态RAM的工作原理  
**MOS型静态RAM**的基本存储单元，可由六个MOS场效应晶体管构成，图中为1个静态RAM。  
多个静态ram单元组成的存储器叫做静态RAM存储器

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2019.57.03.png" alt="截屏2023-10-30 19.57.03" style="zoom:33%;" />

**动态RAM(DRAM)(*)**

特点：存储的信息有一定的时间性，在短时内数据是有效的，超过一定时间，数据就会消失，所以要周期性的对所在数据重写(刷新)，这种存储器为动态存储器。（SRAM无需刷新）

### 静态RAM和动态RAM的区别

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-30%2020.00.15.png" alt="截屏2023-10-30 20.00.15" style="zoom:33%;" />

## 半导体只读存储器

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2016.22.23.png" alt="截屏2023-10-31 16.22.23" style="zoom:33%;" />

掩膜式只读存储器**ROM**：只能读出而不能写入新内容，在出厂时已经制作好的。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2016.24.35.png" alt="截屏2023-10-31 16.24.35" style="zoom:33%;" />

可编程的只读存储器**PROM**：制作时不写入信息，使用时可写，写入是一次性的，又称现场可编程序只读存储器。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2016.27.08.png" alt="截屏2023-10-31 16.27.08" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2016.29.09.png" alt="截屏2023-10-31 16.29.09" style="zoom:33%;" />

可编程、可擦除的只读存储器EPROM

紫外线擦除的**EPROM**：可以抹去数据，并置为全‘’1‘’状态。  
电可擦除只读存储器**EEPROM或E^2^PROM**：使用时让电流只通过指定的内存单元，把一个字(或字节)擦去并改写，其余保持不变。

### EPROM芯片举例—Intel 2716

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2016.37.38.png" alt="截屏2023-10-31 16.37.38" style="zoom:33%;" />

2K = 2^11^，有11根地址线，8根数据线。

### SRAM—6264

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2016.46.17.png" alt="截屏2023-10-31 16.46.17" style="zoom:33%;" />

1. A0-A12共13位地址译码电路，所以2^13^=8K
2. I/O0-I/O7共8位数据传送线
3. 所以该芯片是8K*8位的。（或者8KB）

WE非为0时，表示允许向它写入；OE非为0时，表示允许从这里读取数据。  
CE1非为0，CE2为1时，芯片才被选中。

## DRAM—2164

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2017.00.04.png" alt="截屏2023-10-31 17.00.04" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2016.54.56.png" alt="截屏2023-10-31 16.54.56" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2016.58.47.png" alt="截屏2023-10-31 16.58.47" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2017.18.46.png" alt="截屏2023-10-31 17.18.46" style="zoom:33%;" />

**Intel 2164：**

**说明：2164的容量为64K，也就是2的^16^，片内寻址需要64k即16根地址线，为了减少引脚分别分成了行和列，对外地址线有8根。**

**刷新：送入7位行地址，同时选中4个存储矩阵的同一行，即对4x128=512个存储单元进行刷新。（具体看p2）**  
<u>*存储矩阵有4个每个都是128x128，选中它们的同一行，即128x1x4*</u>



<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2017.09.29.png" alt="截屏2023-10-31 17.09.29" style="zoom:33%;" />

**DRAM-2164利用多路开关，由行地址选通信号RAS将先送入的8位行地址送到片内行地址锁存器，再由列地址选通信号CAS将后送入的8位列地址送到片内列地址锁存器。**

## 存储器组成存储器系统

1. 位对齐

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2017.26.44.png" alt="截屏2023-10-31 17.26.44" style="zoom:33%;" />

2. 字对齐

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2017.28.26.png" alt="截屏2023-10-31 17.26.44" style="zoom:33%;" />

3. ​	位、字对齐<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2017.30.45.png" alt="截屏2023-10-31 17.30.45" style="zoom:33%;" />

4. 例

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2017.38.10.png" alt="截屏2023-10-31 17.38.10" style="zoom:33%;" />

### 例题

2的16次方是4位十六进制数。
<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-31%2017.47.29.png" alt="截屏2023-10-31 17.47.29" style="zoom:33%;" />