---
title: 寻址方式以及转移类指令-上
published: 2023-10-11
description: 微机原理寻址方式以及转移类指令部分知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第三章

## 转移类指令

## 寻址方式

### 直接寻址方式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2019.24.35.png" alt="截屏2023-10-10 19.24.35" style="zoom:33%;" />

**段内直接寻址方式：**

在同一个段内时[直接修改IP]，只需要给出源地址和目标地址的差值，注意：这个差值的偏移量是一个以IP为基准的8位或16位的带符号补码数。  
具体参考：https://www.zhihu.com/question/293430959/answer/3141203618?utm_id=0

![截屏2023-10-10 19.33.28](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2019.33.28.png)

**段间直接寻址方式：**

在不同段时，直接给出转移目标地址的段地址（把段地址直接送CS段）和段内位移量（把段内位移量送IP），使程序从源代码段跳到目的代码段。

### 间接寻址方式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2019.38.47.png" alt="截屏2023-10-10 19.38.47" style="zoom:33%;" />

**段内间接寻址方式：**

在同一个段内时[直接修改IP]，只需要把存放在寄存器或存储单元里的有效地址直接送入IP。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2019.45.20.png" alt="截屏2023-10-10 19.45.20" style="zoom:33%;" />

**段间间接寻址方式：**

段间间接需要修改CS和IP，而寄存器只有16位，所以给出一个存储器地址，在地址里取目的程序的偏移地址和段地址。（图中为存储顺序）

## 转移指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2020.12.07.png" alt="截屏2023-10-10 20.12.07" style="zoom:33%;" />

转移指令：通过修改指令的**[段内—修改]偏移地址**和**[段间—修改]段地址和偏移地址**实现程序的转移。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2020.17.07.png" alt="截屏2023-10-10 20.17.07" style="zoom:33%;" />

无条件转移指令：无条件转移到目标地址，执行新的指令。（相当于go to）

有条件转移指令：在具备一定条件的情况下转移到目标地址。（相当于if...else）

### 无条件转移指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2008.57.56.png" alt="截屏2023-10-11 08.57.56" style="zoom:33%;" />

格式：JMP OP  
功能：无条件地将控制转移到目标地址(可以是段内转移，也可以是段间转移)去。

#### 段内转移

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2009.02.27.png" alt="截屏2023-10-11 09.02.27" style="zoom:33%;" />

段内直接寻址：指令中**直接给出目标地址**。

段内间接寻址：指令中的**寄存器或存储器操作数指出的目标地址**。

#### 段内转移指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2009.08.11.png" alt="截屏2023-10-11 09.08.11" style="zoom:33%;" />

段内直接短转移：JMP SHORT OP  
IP<—IP+8位偏移量（补码编码）-128—+127

段内直接近转移：JMP NEAR PTR OP  
IP<—IP+16位偏移量（补码编码）-32768—+32767

段内间接转移：JMP WORD PTR OP 或 JMP OP(寄存器)  
图例为JMP BX；此处是把BX的值送入IP；JMP WORD PTR [BX]；此处是以BX为地址去查对应单元的内容送入IP。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2009.19.40.png" alt="截屏2023-10-11 09.19.40" style="zoom:33%;" />

IP总是指向下一条指令，所以进行修正时是0102H+13H

#### 例题

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2009.47.29.png" alt="截屏2023-10-11 09.47.29" style="zoom:33%;" />

偏移量=目标地址-(当前指令地址+当前指令字节数)

#### 段间转移

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2019.19.08.png" alt="截屏2023-10-11 19.19.08" style="zoom:33%;" />

段间直接寻址：指令中**直接给出目标地址**。

段间间接寻址：指令中的**32位存储器操作数指出的目标地址**。

#### 段间转移指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2019.25.57.png" alt="截屏2023-10-11 19.25.57" style="zoom:33%;" />

段间直接转移：JMP FAR PTR OP  
IP<—OP的段内偏移地址。  
CS<—OP的段地址。

段间间接转移：JMP DWORD(双字属性运算符，也就是4字节) PTR OP  
前两个单元为偏移地址，后两个单元为段地址。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2019.28.42.png" alt="截屏2023-10-11 19.28.42" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2019.30.03.png" alt="截屏2023-10-11 19.30.03" style="zoom:33%;" />

JMP 2000H:1000H 段间直接寻址  
JMP FAR PTR NEXT （NEXT为标号）  
JMP DWORD PTR [DI]; 以[DI]为地址去寻找四字节单元，送入CS和IP，高高低低原则。

## 调用和返回指令

### 调用指令

**调用指令的执行过程**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2020.10.10.png" alt="截屏2023-10-11 20.10.10" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2019.35.43.png" alt="截屏2023-10-11 19.35.43" style="zoom:33%;" />

调用指令：

格式：CALL OP （主动调用；压栈）
将CALL指令的下一条指令的地址(断点地址IP或IP与CS)[分段内和段间]压栈，新的目标地址(子程序首地址)装入IP或IP与CS中，控制程序转移到由OP指明入口的子程序。其中OP为子程序(过程)的名字。

操作过程：

1. SP-2—>SP，当前CS压栈，OP所在段地址—>CS
2. SP-2—>SP，当前IP压栈，OP的偏移地址—>IP

对于段内调用只有(2)—IP压栈。

#### 段内调用

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2019.43.10.png" alt="截屏2023-10-11 19.43.10" style="zoom:33%;" />

段内调用：在同一代码段，在调用前只需保护断电的偏移地址。只压IP。

格式：CALL <u>NEAR PROC</u> 子过程名字  
例：CALL TIMRE —直接调用；CALL WORD PTR[SI]—间接调用（SI为地址）

#### 段间调用

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2019.50.31.png" alt="截屏2023-10-11 19.50.31" style="zoom:33%;" />

段间调用：在不同代码段，在调用前保护段基地址和偏移地址，先将断点的CS压入栈，再压入IP。

格式：CALL FAR <u>PROC</u> 子过程名字  
例：CALL FAR TIMRE —直接调用；CALL DWORD PTR[SI] —间接调用（因为CS16位、IP16位，所以需要4字节）

### 返回指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2019.57.20.png" alt="截屏2023-10-11 19.57.20" style="zoom:33%;" />

返回指令：在主程序是CALL指令，在子程序里返回是RET指令。是子程序的最后一条指令（实指令）用以返回到调用子程序的断点处。

格式：RET

操作过程：

1. 从栈顶弹出一个字给IP，SP+2—>SP
2. 从栈顶弹出一个字给CS，SP+2—>SP

对于段内调用只有(1)。

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2020.03.36.png" alt="截屏2023-10-11 20.03.36" style="zoom:33%;" />
>
> 此例题是先弹出6个单元，再执行RET操作。

## 调用指令与转移指令的比较

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-11%2020.08.33.png" alt="截屏2023-10-11 20.08.33" style="zoom:33%;" />

调用指令需要返回；转移指令不返回。