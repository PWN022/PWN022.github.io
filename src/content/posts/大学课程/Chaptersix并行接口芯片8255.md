---
title: 并行接口芯片8255
published: 2023-12-02
description: 微机原理并行接口芯片8255知识点及应用举例部分。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第六章

## 并行接口芯片8255

接口和外设交换的三种信息：**数据、状态、控制**

### 并行通信

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2013.49.36.png" alt="截屏2023-11-30 13.49.36" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2014.08.31.png" alt="截屏2023-11-30 14.08.31" style="zoom:33%;" />

输出设备工作过程：

查询是否忙碌—送入数据—启动信号

输入设备工作过程：

启动信号—查询是否准备好—接收数据

### 可编程并行通信接口芯片8255A

### 8255A的内部结构(***)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2014.17.01.png" alt="截屏2023-11-30 14.17.01" style="zoom:33%;" />

有3个8位的数据端口A、B、C

A、B、C均为8位，但端口C分上半部分(4位)和下半部分(4位)。

A组控制是端口A以及C的上半部分(高4位)。B组控制是端口B以及端口C的下半部分(低4位)。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2014.21.09.png" alt="截屏2023-11-30 14.21.09" style="zoom:33%;" />

端口A比较特殊，可应用于方式2，其他端口不可以。

端口A、B作为独立的输入或者输出端口，八位同时操作。

端口C配合端口A、B。可以按位操作，分为2个4位端口，传送控制和状态信息。

### 8255A的引脚及功能

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2014.23.43.png" alt="截屏2023-11-30 14.23.43" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2014.27.33.png" alt="截屏2023-11-30 14.27.33" style="zoom:33%;" />

8255A的引脚为40针(pin)。

与外设相连的引脚有24个：  
PA7-PA0—端口A数据线  
PB7-PB0—端口B数据线  
PC7-PC0—端口C数据线

片选信号：  
A1和A0同时为0选中端口A  
A1为0、A0为1选中端口B  
A1为1、A0为0选中端口C  
A1和A0同时为1控制端口

#### 注意

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2014.32.05.png" alt="截屏2023-11-30 14.32.05" style="zoom:33%;" />

### 8255A的控制字

控制信号和状态信号只能使用不同组。

例如：控制信号使用了端口C的上半部分(PC0-PC3)中的某位，那么状态信号只能使用端口C的下半部分(PC4-PC7)中的某位。反之同理。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2014.36.18.png" alt="截屏2023-11-30 14.36.18" style="zoom:33%;" />

8255A的控制字有两种功能：

1. 各端口的方式选择控制字。（设置A、B、C端口的工作方式，输入/输出等）
2. C端口按位置1/置0控制字。（端口C按位置位/复位功能，写入的是控制口，**不是C口**）

### 方式选择控制字

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2016.01.38.png" alt="截屏2023-11-30 16.01.38" style="zoom:33%;" />

A端口有三种工作方式(方式0、1、2)，B端口有两种工作方式(方式0、1)，C端口只有一种(方式0)。

#### 例题以及初始化过程

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2016.05.00.png" alt="截屏2023-11-30 16.05.00" style="zoom:33%;" />

初始化过程：

MOV AL，控制字  
OUT 端口地址，AL

### 端口C置位/复位控制字(***)

**D7=0**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2016.12.38.png" alt="截屏2023-11-30 16.12.38" style="zoom:33%;" />

#### 例题以及控制口代码

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2016.17.42.png" alt="截屏2023-11-30 16.17.42" style="zoom:33%;" />

### 8255A的工作方式

**方式1、2必须要有端口C的配合，且端口C是固定的，但是有端口C的不一定是方式1、2，也有可能是方式0。**

#### 方式0—基本输入/输出方式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2016.56.43.png" alt="截屏2023-11-30 16.56.43" style="zoom:33%;" />

特点：

1. 四个端口皆可作输入输出口，且为独立的。
2. 四个端口的输入或输出，有16种不同的组合。

适用场合：同步传送(无条件传送方式)、查询式传送。

#### 方式1—选通的输入/输出方式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2017.03.15.png" alt="截屏2023-11-30 17.03.15" style="zoom:33%;" />

特点：端口A和B要在端口C的配合下工作。

端口C有三位用于A的I/O控制，另有三位用于B的I/O控制，并提供中断逻辑。

若只有一个数据端口工作在方式1，则另一个数据端口及端口C余下的五位可工作方式0；若两个数据端口工作在方式1，那么端口C余下的两位可作I/O位，也可进行置位/复位操作。

总结：

1. 用来配合的C口固定。
2. 可提供中断。

##### 方式1输入端口对应控制信号

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2017.23.27.png" alt="截屏2023-11-30 17.23.27" style="zoom:33%;" />

与门。

禁止中断：使STB非清0。A组为PC4，B组为PC2。

##### 方式1输出

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2017.25.39.png" alt="截屏2023-11-30 17.25.39" style="zoom:33%;" />

与门。

禁止中断：使ACK非清0。A组为PC6，B组为PC2。

#### 方式2—双向传输方式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2017.33.48.png" alt="截屏2023-11-30 17.33.48" style="zoom:33%;" />

或门。

禁止中断：使ACK非清0。使PC6清0。

##### 注意

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2017.36.04.png" alt="截屏2023-11-30 17.36.04" style="zoom:33%;" />

当端口A工作于方式2时，使用的是PC3、4、5、6、7；端口B仍然可以工作于方式0或方式1，PC0、1、2。

#### 8255A的应用举例

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-30%2017.47.14.png" alt="截屏2023-11-30 17.47.14" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-12-02%2013.37.11.png" alt="截屏2023-12-02 13.37.11" style="zoom:33%;" />

初始化程序段：

MOV AL,83H  
OUT 0E6H,AL;方式控制字写入8255A控制口

MOV AL,09H;PC4置1  
OUT 0E6H,AL;使PC4=1，关闭打印机  
MOV AL,0BH;PC5置1  
OUT 0E6H,AL;使PC5=1，断开读入机

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-12-02%2013.48.00.png" alt="截屏2023-12-02 13.48.00" style="zoom:33%;" />

假设需打印的字符存放于CL中。

打印机驱动程序段：

**第一步：查**

LPST:IN AL,0E4H;将端口C各位状态读入AL  
AND AL,04H;通过PC2测试状态  
JNZ LPST;若PC2=0得出ZF=1顺序执行，ZF=0说明在忙继续循环

**第二步：送数据**

MOV AL,CL  
OUT 0E0H,AL;把CL中的字符通过端口A输出

**第三步：控制(开)**

MOV AL,08H  
OUT 0E6H,AL;使PC4=0，即低电平，打开打印机  
INC AL;INC为加1指令，这里的目的是关闭打印机也可以使用MOV AL,0000 1001B来完成  
OUT 0E6H,AL;再使PC4=1，形成一个负脉冲

为什么不是先开启再送数据？因为8255有锁存功能，锁存数据，输出锁存。如果先开启再送数据，送入的数据是上一次在8255中已经存放的数据，所以要更新锁存器的数据，更新的方法就是送入新的数据。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-12-02%2014.54.34.png" alt="截屏2023-12-02 14.54.34" style="zoom:33%;" />

纸袋读入机驱动程序段：

**第一步：控制**

RDST:MOV AL,0AH;使PC5=0，启动读入机  
OUT 0E6H,AL

**第二步：查**

因为图中为READY说明只有PC3=‘1’时才是准备好

RDLP:IN AL,0E4H;读入端口C的内容  
AND AL,08H;通过PC3测试状态，当PC3=0那么AL=0，ZF=1说明未准备好  
JZ RDLP;当PC3=1，AL=1，ZF=0时顺序执行，否则循环跳转

**第三步：读数据**

IN AL,0E2H;从端口B输入数据  
MOV CL,AL;将输入数据保存到CL中  
MOV AL,0BH  
OUT 0E6H,AL;使PC5=1，断开读入机

#### 中断向量表例题

**设置中断矢量**

![截屏2023-12-02 15.36.04](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-12-02%2015.36.04.png)

取中断程序的段地址和偏移地址:  
MOV BX,OFFSET SSS1;OFFSET偏移地址  
MOV CX,SEG       SSS1;SEG段地址

修正DS的值为0:  
PUSH DS;入栈，保护DS的数据  
MOV AX,0  
MOV DS,AX  
MOV SI,01C0H;修正好以后，存取偏移地址就变成了0000H:01C0H，对应向量表位置

存取偏移地址的原因可能是：DS寄存器，通常用来存放要访问数据的段地址。

放入入口地址:  
MOV [SI],BX  
MOV [SI+2],CX

DS不变，弹出(恢复)DS:  
POP DS

**中断服务子程序**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-12-02%2015.31.27.png" alt="截屏2023-12-02 15.31.27" style="zoom:33%;" />

# 执行一条指令

# 其实有很多引脚都在工作

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-12-02%2015.58.13.png" alt="截屏2023-12-02 15.58.13" style="zoom:33%;" />

这就是微机原理。

硬件软件相结合。

2023.12.02