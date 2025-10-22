---
title: 总线&奇偶地址体&引脚功能
published: 2023-09-05
description: 微机原理总线、奇偶地址体、引脚功能知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第二章

## 8086总线周期及引脚功能

### 8086CPU的引脚功能

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-19%2011.21.26.png" alt="截屏2023-08-15 11.21.50" style="zoom: 33%;" />

8086CPU是16位的微处理器，向外的信号包含**16条数据线**，**20条地址线**。  
为了减少芯片引脚数量，采用了**分时复用**的方式，在同一根传输线上，在不同时间传送不同的信息（可能是数据信息，也可能是地址信息）。

### 8086总线周期

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-22%2011.17.13.png" alt="截屏2023-08-22 11.17.13" style="zoom:33%;" />

时钟周期：时钟周期的倒数就是主频，**主频分之一就是时钟周期**，**最小**时间单位。  
总线周期：CPU通过外部**总线**对存储器或I/O端口进行一次**读/写操作**的过程称为总线周期。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-22%2011.28.30.png" alt="截屏2023-08-22 11.28.30" style="zoom:33%;" />

基本的总线周期=主频分之一x4

总线周期一般是**4个时钟周期**。

#### 总线周期的四个状态

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-22%2011.31.42.png" alt="截屏2023-08-22 11.31.42" style="zoom:33%;" />

T1状态：CPU发送地址信息（A19-A0），并给锁存器发出控制信号（ALE），锁存器锁存地址。  
T2状态(准备阶段)：从总线上撤销地址（因为已经发送给了锁存器），（分时复用）总线高4位（A19-A16）输出总线周期的状态信息  
**总线低16位是 地址信息/数据信息；总线高4位是地址信息/状态信息。**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-25%2010.48.17.png" alt="截屏2023-08-25 10.48.17" style="zoom:33%;" />

T3状态：读写数据，如果与外设交换数据时，外设响应较慢，则通过CPU的READY信号，申请插入**等待状态Tw**，在**T3和T4之间**。  
**READY=1不插入等待状态，READY=0插入等待状态。**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-25%2010.57.14.png" alt="截屏2023-08-25 10.57.14" style="zoom:33%;" />

T4状态：总线周期结束，若为总线读周期则在T4前沿将数据读入CPU。  
TI状态：总线空闲周期。

### 8086/8088引脚图解

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E5%BC%95%E8%84%9A.jpeg" alt="引脚" style="zoom: 33%;" />

### 8086/8088工作模式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-08-26%2010.52.02.png" alt="截屏2023-08-26 10.52.02" style="zoom:33%;" />

8086/8088CPU有两种不同的工作模式（**最小模式**和最大模式）

传输有三种类型：输出、输入、双向（可输入和输出）  
三态：可以通过一个大的电阻阻断内外信号的传送。CPU内部的状态与外部相互隔离，“悬浮态”。

数字逻辑电路：https://www.bilibili.com/video/BV1H54y1k7kM/  
数字电子技术：https://www.bilibili.com/video/BV1Vx411s7CE/

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot 2023-08-28 at 10.43.24.png" alt="Screenshot 2023-08-28 at 10.43.24" style="zoom:33%;" />
>
> 数据线有入有出所以是双向的，如果只是地址线都是单向的。

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-08-28%20at%2010.48.29.png" alt="Screenshot 2023-08-28 at 10.48.29" style="zoom:33%;" />
>
> BHE非，高八位数据总线允许/状态复用引脚（输出，三态，低电平有效）  
> 8086CPU有16根数据线；分奇地址体和偶地址体。

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-08-28%20at%2010.58.57.png" alt="Screenshot 2023-08-28 at 10.58.57" style="zoom:33%;" />
>
> NMI**非屏蔽**中断引脚（输入），边沿触发，不受终端允许标志IF的影响且是唯一的。  
> INTR**可屏蔽**中断请求信号（输入），电平触发，高电平有效，受IF影响，不唯一。
>
> 可以理解为NMI>INTR 

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-08-28%20at%2011.07.44.png" alt="Screenshot 2023-08-28 at 11.07.44" style="zoom:33%;" />
>
> RD非，读信号，输出、三态、低电平有效；输出是控制信号，输入是状态信号。
>
> CLK时钟输入/主频输入引脚。

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot//Screenshot 2023-08-28 at 11.12.05.png" alt="Screenshot 2023-08-28 at 11.12.05" style="zoom:33%;" />
>
> RESET，8086要求复位信号至少维持4个时钟周期的高电平才有效。
>
> 复位或者重新上电以后，各寄存器的状态清0，指令队列清空，CS=0FFFFH
>
> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-01%20at%2010.39.41.png" alt="Screenshot 2023-09-01 at 10.39.41" style="zoom:33%;" />
>
> 复位或者重新上电的第一条物理地址是：CSx16+IP即0FFFFHx16+0000H=0FFFF0H 

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot//Screenshot 2023-08-28 at 11.19.56.png" alt="Screenshot 2023-08-28 at 11.19.56" style="zoom:33%;" />
>
> READY=0 不插入等待状态；READY=1 插入等待状态。

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot//Screenshot 2023-08-28 at 11.34.39.png" alt="Screenshot 2023-08-28 at 11.34.39" style="zoom:33%;" />
>
> 引脚只有两个状态，如果**接入1**是**最小**，如果**接入0**是**最大**。

## 8086的存储器及I/O组织

### 8086存储器的结构

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-08-29%20at%2010.58.06.png" alt="Screenshot 2023-08-29 at 10.58.06" style="zoom: 33%;" />
>
> ​																									（读取16位）
>
> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-08-29%20at%2010.59.32.png" alt="Screenshot 2023-08-29 at 10.59.32" style="zoom: 25%;" />

8086分奇偶地址体，支持16位以及8位的读写；存储体有512k单元地址，每个为8位。



<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-08-29%20at%2011.11.36.png" alt="Screenshot 2023-08-29 at 11.11.36" style="zoom:33%;" />

**奇**地址数据永远出现在数据总线的**高8位**(D8-D15)，而**偶**地址数据永远出现在数据总线的**低8位**(D0-D7)。



<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-08-29%20at%2011.26.23.png" alt="Screenshot 2023-08-29 at 11.26.23" style="zoom:33%;" />

从偶地址读写字节时，只要低8位，高8位被忽略，BHE非=1。
A~0~：地址总线的最低位：**A~0~=1为奇**，**A~0~=0为偶**。

（1）从偶地址读写一个字节 A~0~=0，偶地址不要高8位所以BHE非=1，BHE非 A~0~=10

（2）从奇地址读写一个字节 A~0~=1，奇地址需要高8位所以BHE非=0，BHE非 A~0~=01 

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-08-31%20at%2011.29.55.png" alt="Screenshot 2023-08-31 at 11.29.55" style="zoom:33%;" />

8086**总是从偶地址开始**读/写数据。

（3）从偶地址读写一个字 16位所以需要高8位所以BHE非=0，A~0~=0；BHE非 A~0~=00

（4）从奇地址读写一个字 占用两个总线周期，先拿奇地址又拿偶地址拼成  
		1.第一个总线周期 BHE非=0，A~0~=1 （从偶地址开始只能读到奇地址的低8位）  
		2.第二个总线周期 BHE非=1，A~0~=0 （从偶地址读）

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-08-31%20at%2011.55.37.png" alt="Screenshot 2023-08-31 at 11.55.37" style="zoom: 50%;" />
>
> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-08-31%20at%2011.48.44.png" alt="Screenshot 2023-08-31 at 11.48.44" style="zoom:33%;" />
>
> 做题妙招：BHE非 高8位，A~0~ 低8位；谁为0谁有效

#### 8086系统内存地址-专用区域

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-01%20at%2010.53.53.png" alt="Screenshot 2023-09-01 at 10.53.53" style="zoom:33%;" />

RESET后，总是让cs=0FFFFH，其余都是0，所以物理地址=cs*16+IP=0FFFF0H， 就是启动地址(上电开始后的起始地址)。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-01%20at%2010.59.45.png" alt="Screenshot 2023-09-01 at 10.59.45" style="zoom:33%;" />

中断向量表00000～003FFH一共有1KB，每个中断需要占用4个字节，所以可存储**1KB/4字节**，**256**个中断服务程序的入口地址。

### 8086 I/O组织

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-01%20at%2011.33.54.png" alt="Screenshot 2023-09-01 at 11.33.54" style="zoom:33%;" />

因为有M/IO非，所以I/O端口与内存分别独立编址，I/O端口使用16位地址，可寻址空间为64KB。  
内存有20根线，可寻址空间为1MB。https://blog.csdn.net/u012076669/article/details/79764921

### 8086系统配置

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-01%20at%2011.44.04.png" alt="Screenshot 2023-09-01 at 11.44.04" style="zoom:33%;" />

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-01%20at%2011.49.00.png" alt="Screenshot 2023-09-01 at 11.49.00" style="zoom: 25%;" /><img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-01%20at%2011.54.53.png" alt="Screenshot 2023-09-01 at 11.54.53" style="zoom:25%;" />
>
> 3片地址锁存器8282：8入8出，因为有20根地址线，所以需要3片地址锁存器。

最小模式：系统中**只有一个8086/8088处理器**，只有一个主控处理器，**最小模式也称单处理器模式**。 

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-01%20at%2011.46.04.png" alt="Screenshot 2023-09-01 at 11.46.04" style="zoom:33%;" />

最大模式：可以**有一个以上的处理器**，除了8086/8088还有**8087数值协处理器**和**8089I/O协处理器**等。（仅作了解）

#### 最小系统模式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-02%20at%2011.00.04.png" alt="Screenshot 2023-09-02 at 11.00.04" style="zoom:33%;" />

通过8282（锁存器）变成A~19~～A~0~地址线；通过8286变成D~7~～D~0~或D~15~～D~8~数据线。

#### 最小模式下的系统控制信号

#### **读写控制信号引脚**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-02%20at%2011.05.25.png" alt="Screenshot 2023-09-02 at 11.05.25" style="zoom:33%;" />

M/IO非：三态输出。M为1表示当前CPU正在访问存储器，IO非为0表示CPU当前正在访问I/O端口。 

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-02%20at%2011.11.18.png" alt="Screenshot 2023-09-02 at 11.11.18" style="zoom: 33%;" />

M/IO非和WR非、RD非决定系统中数据传输的方向，M/IO非区分是向存储器读/写或者向I/O端口读/写。  
RD非：读信号，三态输出。  
WR非：写信号，三态输出。  
READY：准备就绪信号。  
BHE/S~7~：总线高字节有效信号，三态输出。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-02%20at%2011.14.35.png" alt="Screenshot 2023-09-02 at 11.14.35" style="zoom:33%;" />

ALE：地址锁存允许信号，高电平有效。  
DEN非：数据允许信号，三态输出，传送地址时候DEN非为1，传送数据时DEN非为0(有效)。  
DT/R非：区分数据传送的方向，三态输出，为高电平时(DT)表示为数据发送，为低电平(R非)表示为数据接收。 （也是读写信号）

#### 中断控制信号引脚

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-02%20at%2011.25.12.png" alt="Screenshot 2023-09-02 at 11.25.12" style="zoom:33%;" />

INTR：可屏蔽中断请求信号。  
INTA非：中断响应信号，三态，向外输出信息。1.通知外设。2.要求申请中断的设备向CPU发送中断类型。  
NMI：不可屏蔽中断请求信号。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-02%20at%2011.29.26.png" alt="Screenshot 2023-09-02 at 11.29.26" style="zoom:33%;" />

DMA：传输不经过CPU，在**内存**和**I/O设备**之间**直接**传输数据，进行DMA传输之前要向CPU申请使用总线并取得认可。  
HOLD：总线请求信号。输入，表示有其他设备向CPU请求使用总线。  
HLDA：总线请求响应信号。输出。

#### 总结

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-02%20at%2011.37.22.png" alt="Screenshot 2023-09-02 at 11.37.22" style="zoom:33%;" />

## 8086CPU的工作时序

### 最小模式下的总线读周期

![Screenshot 2023-09-02 at 11.47.05](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-02%20at%2011.47.05.png)

![Screenshot 2023-09-02 at 11.49.33](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/Screenshot%202023-09-02%20at%2011.49.33.png)

**8086的总线操作顺序**：https://blog.csdn.net/xiong_xin/article/details/100586833