---
title: 存储器与CPU的连接
published: 2023-11-02
description: 微机原理存储器与CPU的连接以及外部译码电路知识。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第四章

## 存储器与CPU的连接

**画圈部分为重点内容。**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-01%2009.20.55.png" alt="截屏2023-11-01 09.20.55" style="zoom:33%;" />

**存储器地址分配及译码介绍**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-01%2009.31.00.png" alt="截屏2023-11-01 09.31.00" style="zoom: 25%;" />

**存储器与CPU的连接介绍**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-01%2009.36.12.png" alt="截屏2023-11-01 09.36.12" style="zoom:33%;" />

其中重点为**地址线（片外连接）**、**数据线**、**控制线**的连接。(地址线为重中之重)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-01%2009.45.48.png" alt="截屏2023-11-01 09.45.48" style="zoom:33%;" />

CPU发出的地址信号必须实现两种选择：

1. 片选(*)：也叫片外寻址(选中的是芯片)。
2. 字选：片内寻址(选中的是单元，且是自动的)。

片选信号和字选信号均由CPU发出的地址信号经译码电路产生其中片选信号比较重要，字选信号不需用户设计。

## 外部译码电路的两种译码方式

### 线性选择法(一般不考虑)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2008.57.41.png" alt="截屏2023-11-02 08.57.41" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2008.58.54.png" alt="截屏2023-11-02 08.58.54" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2009.01.53.png" alt="截屏2023-11-02 09.01.53" style="zoom: 25%;" />

优点：连接简单，片选信号的产生不需要复杂的逻辑电路。

缺点：

1. （高位线是片外，低内线是片内）高位地址未完全用完，没有控制时，会出现地址的不连接性和多义性。（多义性：两个芯片同样的信号，此时不明确要控制哪个芯片）
1. 寻址的存储空间十分有限。（例如：三根线有8种方法，但只能使用三种）

### 全译码法

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2009.07.11.png" alt="截屏2023-11-02 09.07.11" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2009.18.47.png" alt="截屏2023-11-02 09.18.47" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2009.15.30.png" alt="截屏2023-11-02 09.15.30" style="zoom:33%;" />

常见的3:8译码器74LS138:

只有G2A非、G2B非、G1是0、0、1时，译码器才会工作。

CBA是三位二进制数，C是高位，A是低位，CBA组合成的十进制数是**x**那么Y**x**非就输出0，其他都是1。

此外还有一种2:4译码器：  
2个输入，4个输出，B和A两位二进制数。

### 例题

![截屏2023-11-02 09.30.02](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2009.30.02.png)

两个原则：

1. 连续性：芯片的首地址是前一个芯片的末地址+1。
2. 唯一性：一个单元有且仅有一个地址，一个地址仅对应一个单元。

### 例题2

![截屏2023-11-02 14.36.01](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2014.36.01.png)

![截屏2023-11-02 15.14.47](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2015.14.47.png)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2015.16.06.png" alt="截屏2023-11-02 15.16.06" style="zoom: 25%;" />

![截屏2023-11-02 15.23.08](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2015.23.08.png)

（算出地址）

片内译码为1k=2的十次方，需要用到10根线，也就是A0—A9，需要设计的是除了片内译码以外的剩下的线A10—A15。

因为CBA是全0，所以用Y0非去接芯片的CS非(都有CS非且是短接的)。

G1是高电平有效，所以用A14和A15做与运算(因为A14和A15都是高电平)，A13是低电平所以接到G2B非，G2A非也可以连接A13，也可以直接接地(图中为接地)

三和四芯片的CS非也需要连接所以直接顺序连接Y1非。

从四个芯片的地址得出是连续的，为正常。

（读写逻辑）

现在访问的是内存，也就是M为1所以M/IO非连接到A14和A15与运算的地方。

同样的每个RAM芯片都有读和写，所以在图中画出（1、2芯片和3、4芯片的RD非和WR非不是一根线连接的）

因为芯片为4位，所以每个芯片只能装得下4根数据线且图标为双向。D0—D3，D4—D7

### 例题3

![截屏2023-11-02 15.38.56](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2015.38.56.png)

![截屏2023-11-02 15.49.55](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2015.49.55.png)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2015.52.30.png" alt="截屏2023-11-02 15.52.30" style="zoom:33%;" />

这个例题的重点为ROM芯片和RAM芯片需要对齐，所以选用容量大的ROM芯片。

全译码，难点在两个1KB的RAM芯片中的A10也需要参与译码，因为Y0非输出是2KB，所以下面的线也都是2KB，但由于RAM是由两个1KB的芯片组成的(A0—A9)，所以A10要保证唯一性（即A10在一个芯片为1在另外一个芯片为0）。 

从p2的计算可以得出地址正常。

注意在画逻辑信号时，RAM是随机存储器有读写功能，ROM作为只读存储器没有写入功能信号。

### 总结步骤

![截屏2023-11-02 15.59.21](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-02%2015.59.21.png)

内存扩展步骤：

1. 在给定的各芯片中选用片内寻址（片内译码）线较多的为基准，提前将这些片内译码线预留出来，直接接入芯片即可。  
   若出现未对齐的问题（如一个为1K一个为2K），则将差出的地址线参与容量较小芯片的选择译码。
2. 除片内译码线外，将剩余地址线的最低三位接入38译码器的输入端（A、B、C），需注意的是A为最低位，C为最高位。
3. 将除接入ABC以外的地址线进行38译码器的选通，为0的地址线过**或门**接入G2A非 G2B非引脚，为1的地址线过**与门**接入G1引脚。  
   若地址线不够用，则使G2A非 G2B非接地，G1接+5V即可。
4. 若出现1所说的芯片对齐问题，则需考虑将未参与译码的地址线参与片选。