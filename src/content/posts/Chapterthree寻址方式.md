---
title: 寻址方式
published: 2023-09-20
description: 微机原理8086指令格式、操作数以及寻址方式。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第三章

## 8086指令格式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-18%2015.47.40.png" alt="截屏2023-09-18 15.47.40" style="zoom: 33%;" />

指令：指令是指示计算机完成待定操作的命令。

指令系统：是计算机能够执行全部命令的集合，因机而异（可移植性）。

指令中应该包含的信息：执行的运算、运行结果的去向、运算数据的来源。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-18%2015.57.29.png" alt="截屏2023-09-18 15.57.29" style="zoom:33%;" />

目的操作数：指令加工之后形成的数据。

源操作数：指令加工之前的数据。

## 操作数类型

### 立即数操作

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-18%2016.15.51.png" alt="截屏2023-09-18 16.15.51" style="zoom:33%;" />

表示参加操作的数据本身，可以是8位或16位。

图中例子为MOV赋值，把源操作数1234H给AX

立即数无法作为目标操作数，且立即数可以是无符号或带符号数，其数值应在可取值范围内。

### 寄存器操作

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-18%2016.27.26.png" alt="截屏2023-09-18 16.27.26" style="zoom:33%;" />

表示参加运算的数存放在指令给出的寄存器中，可以是16位或8位。

寄存器操作数**对应长度**：16位对16位，或者8位对8位。

### 存储器操作

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-18%2016.32.18.png" alt="截屏2023-09-18 16.32.18" style="zoom:33%;" />

表示当前参加运算的数存放在存储器的某一个或某两个单元中。

例：MOV AX,[1200H]：把1200H为地址的单元数据送入AX。

##  指令的字长与指令的执行速度

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-18%2017.28.56.png" alt="截屏2023-09-18 17.28.56" style="zoom:33%;" />

指令的执行速度由慢到快分别是：存储器（外部）、立即数（外部）、寄存器（CPU内部）。

## 寻址方式

### 立即寻址

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-18%2017.41.54.png" style="zoom:33%;" />

操作码给CX送数是在代码段里；立即数寻址是在代码段里。

注意事项：

1. 立即寻址方式只能用于源操作数，主要用于给寄存器赋值。
2. 立即寻址方式不执行总线周期(是指令的一部分不需要再次取数)，所以执行速度快。

### 寄存器寻址

![截屏2023-09-18 17.49.44](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-18%2017.49.44.png)

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-18%2017.55.45.png" alt="截屏2023-09-18 17.55.45" style="zoom:33%;" />
>
> 寄存器寻址方式的指令操作在CPU内部执行，同样不需要执行总线周期，所以执行速度快。
>
> 既适用于指令的源操作数，也适用于目的操作数，并且可同时用于源操作数和目的操作数。

### 直接寻址

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-18%2018.10.36.png" alt="截屏2023-09-18 18.10.36" style="zoom:33%;" />

直接寻址：直接给出偏移地址。

操作数在存储器中，指令中直接给出操作数所在存储单元的有效地址EA， 即段内偏移地址，有效地址是一个无符号的16位二进制数。

例中，AH后没有声明，默认为DS段。

> **例：DS=3000H**
>
> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-18%2018.25.50.png" alt="截屏2023-09-18 18.25.50" style="zoom:33%;" />
>
> 源操作数物理地址=DS*16+EA
>
> 3000H*16+2000H=32000H
> AX=
> AH+AL
> 32001H 32000H

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2017.13.27.png" alt="截屏2023-09-20 17.13.27" style="zoom:33%;" />

如操作数在其他段，需要用到超越前缀指出相应的段寄存器名。
例：MOV AH，ES：[2000H]	此处的ES就是段寄存器名，默认为DS段。

### 寄存器间接寻址

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2017.23.44.png" alt="截屏2023-09-20 17.23.44" style="zoom:33%;" />

操作数在存储器中，指令中寄存器的内容作为操作数所在存储单元的有效地址EA(偏移地址)。
寄存器仅限于BX、BP，SI、DI。

偏移地址提前放到了寄存器（BX、BP，SI、DI)中，主要有两个区别：

1. 当使用BX、SI、DI，操作数所在存储单元的段地址存在数据段寄存器DS中。
2. 当使用BP时，操作数所在存储单元的段地址存在堆栈段寄存器SS中。

> 例：
>
> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2017.31.53.png" alt="截屏2023-09-20 17.31.53" style="zoom:33%;" />
>
> 和直接寻址有区别的是，寄存器间接寻址可以做循环。
> 例如：有几组偏移地址分别为[2000H] [2200H] [2400H]
>
> 直接寻址：MOV BX，[2000H]、MOV BX，[2200H]、MOV BX，[2400H]
> 寄存器间接寻址：让SI每次+2	MOV BX，<u>[SI+2]</u>
> 注：[SI+2]是相对的寄存器间接寻址，又称直接变址寻址，它也可以写成2[SI]这样的样式。
>
> 使用直接寻址是一次一次的使用操作数来加，寄存器间接寻址可以修改寄存器的寻址方式。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2018.02.18.png" alt="截屏2023-09-20 18.02.18" style="zoom:33%;" />

注意事项：只有SI，DI，BX，BP可以作为间址寄存器。

且若操作数所在存储单元不再数据段DS中(不包括DP)，需用段超越前缀表明。（因为DP为间址时，默认的段地址寄存为SS）

例： MOV AX，ES：[SI] 或者 MOV BX，DS：[BP]

### 基址变址寻址方式

在学习基址寻址前，先了解一下：

寄存器间接寻址有BX、BP、SI、DI，其中BX、BP为基址寄存器，SI、DI为变址寄存器。

使用基址寄存器寻址就叫做基址寻址、使用变址寄存器寻址就叫做变址寻址；

使用基址寄存器和变址寄存器寻址就叫做基址变址寻址，如果有偏移量就叫做基址变址相对寻址。

### 基址寻址

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2018.14.52.png" alt="截屏2023-09-20 18.14.52" style="zoom:33%;" />

基址寄存器：BX、BP。

使用BX时，段地址为DS；使用BP时，段地址为SS。

> 例：
>
> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2018.16.28.png" alt="截屏2023-09-20 18.16.28" style="zoom:25%;" />
>
> MOV BL，2[BX]  或 MOV BL，[BX+2] ；其效果都是一样的，都是DS*16+BX+2。

### 变址寻址

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2018.21.00.png" alt="截屏2023-09-20 18.21.00" style="zoom:33%;" />

变址寄存器：SI、DI。段地址规定为DS的内容。

### 基址变址寻址

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2018.24.35.png" alt="截屏2023-09-20 18.24.35" style="zoom:33%;" />

基址加变址寻址需注意的是：

基址寄存器只能使用1个，变址寄存器也只能使用1个；段寄存器以基址寄存器为准。

> 使用方法为：MOV 寄存器名，[基址+变址+有效地址] 还有其他格式，如下图：
>
> ![截屏2023-09-20 18.35.25](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2018.35.25.png)
>
> 例如：MOV AX，[BP+SI]，此时使用的段寄存器为SS。

### 字符串寻址

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2018.40.54.png" alt="截屏2023-09-20 18.40.54" style="zoom:33%;" />

规定**变址寄存器SI**中的内容是**源数据串**的段内偏移地址，而**变址寄存器DI**中的内容是**目标数据串**的段内偏移地址。
**源数据串**的段地址规定是**数据段DS**，**目标数据串**的段地址规定是**附加段ES**。

指令执行后SI和DI的内容自动增量（或减量），增或减值为1或2。

### I/O端口寻址

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2018.48.44.png" alt="截屏2023-09-20 18.48.44" style="zoom:33%;" />

I/O端口寻址是独立编址，可分为直接端口寻址和间接端口寻址。

> 直接端口寻址 例：
> IN AL，20H；此处的20H为地址，将地址为20H的外设内容读入AL中。
>
> 间接端口寻址 例：
> OUT DX，AL；将**AL中的内容**输出给**以DX为地址**的外设端口。

### 隐含寻址

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2018.53.39.png" alt="截屏2023-09-20 18.53.39" style="zoom:33%;" />

隐含了一个或两个操作数的地址，即操作数在默认的地址中。

例：AAA 是BCD码调整指令，默认放在AH和AL中。

### 例题

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-20%2018.57.31.png" alt="截屏2023-09-20 18.57.31" style="zoom:33%;" />