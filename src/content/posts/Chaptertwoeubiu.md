---
title: EU和BIU部件
published: 2023-09-03
description: 微机原理执行部件与总线接口部件。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第二章

## 8086概述与执行（EU）部件

<img src="https://github.com/PWN022/POFMC/raw/main/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-04%2012.09.11.png" style="zoom:33%;" />

8086是16位微处理器，有16位数据总线和20位地址总线。
数据总线指的是从外部读入或者送出XX位数据，地址总线指的是能寻址的单元数，所以可寻址的地址空间是2<sup>20</sup>=1MB。   
8088是准16位微处理器，它的内部寄存器、内部运算部件以及内部操作都是按16位设计的，但对外的数据总线只有8位。

## 8086的编程结构

8086cpu分为两部分

1. 执行部件（execution unit,EU）(执行)
2. 总线接口部件（bus interface unit,BIU）(交换数据)

<img src="https://github.com/PWN022/POFMC/raw/main/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-05%2011.36.24.png" style="zoom:50%;" />

## （EU）执行部件

<img src="https://github.com/PWN022/POFMC/raw/main/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-07%2011.02.03.png" style="zoom:33%;" />

### 组成

1.
四个通用寄存器，即AX、BX、CX、DX；(都有第二功能,一般是用来计算 )  
四个专用寄存器，即基址指针寄存器 BP(base pointer)、堆栈指针寄存器 SP(stack pointer)、源变址寄存器 SI(source index)、
目的变址寄存器 DI(destination index)（BP寄存器与SP寄存器指针不一样，BP可以用来寻址）
2.
标志寄存器 FR（用来检测有无溢出，标志位，（别名：PSW、程序状态字、状态寄存器））
3.
算术逻辑单元 ALU(arithmetic logic unit)（完成计算）
4.
内部控制逻辑



<img src="https://github.com/PWN022/POFMC/raw/main/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-07%2011.06.40.png" style="zoom:33%;" />

### 内部寄存器组

8个16位通用寄存器

 <img src="https://github.com/PWN022/POFMC/raw/main/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-07%2011.33.12.png" style="zoom:33%;" />

- 数据寄存器（AX，BX，CX，DX）（可以分开来用，两个8位是独立的）（只对AL操作时如果溢出则不会进位给AH）
  （地址一般指的是偏移地址都是16位 ）  
  AX=AH+AL，AX的高8位为AH寄存器，H=high  
  BX=BH+BL、CX=CH+CL、DX=DH+DL
- 指针和变址寄存器（SP，BP，SI，DI）（除了SP其他都可以作通用寄存器） 

### 数据寄存器的第二功能

<img src="https://github.com/PWN022/POFMC/raw/main/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-07%2011.48.35.png" style="zoom:33%;" />

AX：累加器。只有AX能和I/O设备传送信息。   
BX：基址寄存器。可以存放地址。  
CX：计数寄存器。  
DX：I/O间接寻址寄存器（数据寄存器）。DX可以存放高16位数，AX高位计算结果可以放到DX（AX的备胎）。

### 指针

<img src="https://github.com/PWN022/POFMC/raw/main/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-07%2011.55.58.png" style="zoom:33%;" />

SP：堆栈指针寄存器。不能寻址，充当路标的作用。  
BP：基址指针寄存器。可以用来寻址。（可以访问堆栈区内任意位置的数据单元，堆栈区域遵循先入后出）

BX和BP的区别：

<img src="https://github.com/PWN022/POFMC/raw/main/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-09%2010.42.12.png" style="zoom:33%;" />

BX：通用寄存器16位，都是基址寄存器，BX寻找的数据在数据段。  
BP：通用寄存器16位，都是基址寄存器，BP寻找的数据在堆栈段。 

### 变址寄存器

<img src="https://github.com/PWN022/POFMC/raw/main/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-09%2010.49.54.png" style="zoom:33%;" />

<img src="https://github.com/PWN022/POFMC/raw/main/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-09%2010.44.36.png" style="zoom:33%;" />

变址寄存器常用于指令的间接寻址和变址寻址。

SI：源变址寄存器，存放地址，在字符串操作中存放源操作数的偏移地址。  
DI：目的变址寄存器，存放地址，在字符串操作中存放目的操作数的偏移地址。

### 算术逻辑单元（ALU）及标志寄存器（FR）

<img src="https://github.com/PWN022/POFMC/raw/main/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-09%2012.24.51.png" style="zoom: 33%;" />

算术逻辑运算单元功能如图  
标志寄存器FLAGS别名（FR、PSW） 

**8086的标志（标志寄存器）可以分为两类**：

关于状态标志和控制标志的详细介绍：[https://blog.csdn.net/weixin_46013401/article/details/111823010]()

![截屏2023-08-11 11.34.30](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-11%2011.34.30.png)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-11%2011.33.30.png" alt="截屏2023-08-11 11.33.30" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-12%2010.20.05.png" alt="截屏2023-08-12 10.20.05" style="zoom: 33%;" />

例题：若AL=38H，AH=7DH，指出相加和相减后，CF，AF，PF，SF，DF和ZF的状态

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-12%2011.18.37.png" alt="截屏2023-08-12 11.18.37" style="zoom:33%;" />

### 内部控制逻辑电路

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-12%2011.23.16.png" alt="截屏2023-08-12 11.23.16" style="zoom:33%;" />

## （BIU）总线接口部件

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-14%2011.56.40.png" alt="截屏2023-08-14 11.56.40" style="zoom:33%;" />
>
> **cpu与外界交换数据通过BIU部件**  **8086存储器的指针队列是并行完成的**

段寄存器：存储端地址  
指令指针寄存器： 总是指向下一条指令的偏移地址  
地址加法器：完成逻辑地址向物理地址的转换

### 段地址寄存器（CS,DS,SS,ES）

**关于逻辑段**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-14%2012.13.21.png" alt="截屏2023-08-14 12.13.21" style="zoom: 33%;" />

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-14%2012.30.14.png" alt="截屏2023-08-14 12.30.14" style="zoom:33%;" />
>
> **段首地址：段开始的物理地址**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-15%2011.13.14.png" alt="截屏2023-08-15 11.13.14" style="zoom:33%;" />

如果段与段之间连续不重叠，每个段相对独立的，可以分为16个段，每段小于等于64kb。  
如果重叠，每段小于64kb。

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-15%2011.16.41.png" alt="截屏2023-08-15 11.21.50" style="zoom: 50%;" />分段并不是直接生成，而是使用的时候按照功能分成的。
> 附加段是数据段的附属段。

存放代码段段首地址：CS。code segment 代码段寄存器。  
存放数据段段首地址：DS。data segment 数据段寄存器。  
存放附加段段首地址：ES。extra segment 附加段寄存器。  
存放堆栈段段首地址：SS。stack segment 堆栈段寄存器。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-15%2011.21.50.png" alt="截屏2023-08-15 11.21.50" style="zoom: 50%;" />

 代码段：存放程序代码，程序代码超过64KB，分成段存放时，CS中存放的是当前正在执行的程序段的段首地址。

![截屏2023-08-15 11.25.37](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-15%2011.25.37.png)

数据段：数据需要存放在某些存储单元时， 存放在某个存储单元，数据段的段首地址就放进去，第一个数据段放不开可以用附加段代替，如果段与段不重合，还可以使用其他数据段。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-18%2011.36.10.png" alt="截屏2023-08-18 11.36.10" style="zoom:33%;" />

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-18%2011.40.35.png" alt="截屏2023-08-18 11.40.35" style="zoom:33%;" />
>
> SS：堆栈段基址寄存器。
>
> SP：堆栈指针寄存器，总是指向栈顶地址。SP的值在执行对战操作指令时根据规则**自动地**进行修改。

**进入堆栈的两种方式**
1、基于顺序表的堆栈：初始化空间，通过栈顶指针表示当前可以接受新数据的位置。
2、基于链式表的堆栈：每个节点随压入随创建，随弹出随销毁，通过栈顶指针标识出最后压入的元素。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-18%2011.56.51.png" alt="截屏2023-08-18 11.56.51" style="zoom:33%;" />

段基址是要提前存放在对应的段寄存器(CS,DS,ES,SS)中。  
ES,SS不常用（堆栈会提供一段区域，如果不声明也会提）。  
CS自动装入，涉及到的实际只有DS。

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-18%2012.13.26.png" alt="截屏2023-08-18 12.13.26" style="zoom:33%;" />
>
> **段寄存器** 与 **对应的偏移地址寄存器/偏移地址** 或者 **指令指针寄存器** 是**固定搭配**的。
>
> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-01%20at%2010.41.01.png" alt="Screenshot 2023-09-01 at 10.41.01" style="zoom:25%;" />



控制寄存器：IP，PSW。  
IP：指向下一条指令的地址。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-18%2012.26.26.png" alt="截屏2023-08-15 11.21.50" style="zoom: 33%;" />

段基址表示一个段的起始地址的高16位。  
偏移地址表示段内的一个单元距离段开始位置的距离。

偏移地址=段内地址(范围内 )。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-18%2012.33.59.png" alt="截屏2023-08-18 12.33.59" style="zoom:33%;" />

段地址20位里面的高16位； 或者说是物理地址的高16位。  
段地址*16就得到了段首地址（原数据后加0）。  
段首地址一定是个物理地址。

### 地址加法器 

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-19%2010.27.39.png" alt="截屏2023-08-19 10.27.39" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-19%2010.30.18.png" alt="截屏2023-08-19 10.30.18" style="zoom: 33%;" />

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-19%2010.34.59.png" alt="截屏2023-08-15 11.21.50" style="zoom: 33%;" />
>
> **物理地址是唯一的**，但对应的逻辑地址不是唯一的。

### 指令指针寄存器 IP—16位

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-19%2010.40.30.png" alt="截屏2023-08-15 11.21.50" style="zoom: 33%;" />

指令指针寄存器IP：16位，用来存放将要执行的**下一条**指令在代码段中的**偏移地址**。

### 指令队列缓冲器

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-19%2010.45.43.png" alt="截屏2023-08-15 11.21.50" style="zoom: 33%;" />

8086:6字节  
8088:4字节。  
指令队列缓冲器：预取指令。 

### 总线控制逻辑

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-19%2010.48.56.png" alt="截屏2023-08-15 11.21.50" style="zoom: 33%;" />

总线控制逻辑：CPU内部和外部如何交换数据；一些控制逻辑/控制信息。

### EU和BIU的管理

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-19%2010.52.40.png" alt="截屏2023-08-15 11.21.50" style="zoom: 33%;" />

**总线接口部件**和**执行部件**是**协同工作**的（不是同步）。  
当**8086指令队列中有2字节空闲**（**8088中有一字节空闲**）时，总线接口部件就自动将指令**预取**到指令队列缓冲器中。