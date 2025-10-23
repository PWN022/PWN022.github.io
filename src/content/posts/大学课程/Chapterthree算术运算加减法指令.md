---
title: 算术运算与加减法指令
published: 2023-09-18
description: 微机原理算术运算与加减法指令部分。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第三章

## 算术运算类指令

### 加法指令

1. **不带进位的加法指令：**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2011.55.50.png" alt="截屏2023-09-23 11.55.50" style="zoom:33%;" />

ADD OP目，OP源；OP目<—OP源+OP目根据结果设置标志位
例如：ADD AL，50H；AL+50H—>AL		ADD AX，[DI]；AX+[DI+1]+[DI]—>AX

注：两操作数的类型相同（长度相同），类型明确，不能同为存储器操作数。

需要区别的是：  
AL可以**单独**拿出做低8位使用，而**16位+16位**时是这样的：  
ADD AX，BX—>AX  
->AL+BL->AL  
->AH+BH+进位->AH  

2. **进位的加法指令：**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2012.11.27.png" alt="截屏2023-09-23 12.11.27" style="zoom:33%;" />

ADC OP目，OP源；OP目<—OP源+OP目+CF (CF为前面指令产生的)，置标志位。
主要用于多字节运算，多字节运算时，低位字节产生的进位应加到高位。

**加法指令例题：**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2012.22.22.png" alt="截屏2023-09-23 12.22.22" style="zoom:33%;" />

3. **加1指令**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2012.34.07.png" alt="截屏2023-09-23 12.34.07" style="zoom:33%;" />

INC OP；OP<—OP+1；常用于修改偏移地址和计数次数。
操作数可以时8/16位通用寄存器或存储器操作数(需要声明)，不能是立即数。

例子中 INC [DI]；没有寄存器参与须声明类型。

**加1指令需要注意的是：**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2012.39.47.png" alt="截屏2023-09-23 12.39.47" style="zoom:33%;" />

1. INC指令不影响CF位，影响标志位AF、OF、PF、SF和ZF。（CF位之前是什么，之后还是什么）
2. 操作数视为无符号数。（普通的二进制数）
3. 加法是不区分有符号数还是无符号数的

例题：

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2012.44.18.png" alt="截屏2023-09-23 12.44.18" style="zoom:33%;" />

视为带符号数的话，CF标志位没有任何意义，根据OF标志位(最高位/次高位)看有无溢出，如果溢出结果无意义。
视为无符号数的话，OF标志位没有任何意义，根据CF标志位(进位/借位)，判断无符号数加减运算是否溢出。

### 减法指令

1. **不带借位的减法指令**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2013.26.46.png" alt="截屏2023-09-23 13.26.46" style="zoom:33%;" />

SUB OP目，OP源；OP目<—OP目-OP源，并根据结果设置标志。

2. **带借位的减法指令**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2013.30.47.png" alt="截屏2023-09-23 13.30.47" style="zoom:33%;" />

SBB OP目，OP源；OP目<—OP目-OP源-CF，根据结果设置标志，主要用于多字节或多精度数据相减的运算。

例中SBB WORD PTR[DI+2]，1000H；说明也须声明类型。

3. **减1指令**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2013.34.17.png" alt="截屏2023-09-23 13.34.17" style="zoom:33%;" />

DEC OP；OP<—OP-1；根据结果设置标志位，同样不影响CF（加1指令的镜像）。同样也须声明类型。

4. **取补指令**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2013.39.22.png" alt="截屏2023-09-23 13.39.22" style="zoom: 25%;" /><img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2013.43.55.png" alt="截屏2023-09-23 13.43.55" style="zoom:25%;" />

NEG OP；0-OP—>OP，相当于有符号数前加负号。
将操作数取补后送回源操作数，OP可以是8/16位通用寄存器和存储器操作数，不能为立即数。

注意：  
(1)对80H或8000H取补时，操作数没有变化（-128还是-128，但是发生了借位），但OF=1。  
(2)对CF影响较特殊，只要操作数不是0（没有借位），总是使CF=1。

5. **比较指令**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2013.53.40.png" alt="截屏2023-09-23 13.53.40" style="zoom:33%;" />

CMP OP目，OP源；OP目-OP源

不回送结果，只根据结果址标志位（**一般**用ZF查看两个数是否相同）。其执行的结果不影响目标操作数。
用途：用于比较两个数的大小，可作为条件转移指令转移的条件。比如说判断出AX>BX那么可以去执行xx指令，如果判断出AX<BX就可以去执行xx指令，AX=BX执行xx指令。

### 例题

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-23%2014.20.35.png" alt="截屏2023-09-23 14.20.35" style="zoom:33%;" />

CX—计数器  
CMP AL，[DI]—比较，标志位ZF=1跳转到NEXT，ZF=0顺序执行  
JZ NEXT—条件转移，ZF=1跳转到NEXT  
ZF=0顺序执行后，给AL传送0FFH，之后JMP STOP跳转到STOP：HLT（暂停）  
JNZ P—条件转移，ZF=0跳转到P  
INC—自增，指向下一个单元  
DEC CX—计数器自减，CX=0顺序进行，CX!=0跳转到P继续循环