---
title: 寻址方式以及转移类指令-下
published: 2023-10-16
description: 微机原理寻址方式以及转移类指令部分知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第三章

## 转移类指令

### (有)条件转移指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.04.05.png" alt="截屏2023-10-16 17.04.05" style="zoom:33%;" />

#### 对于无符号数

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.07.03.png" alt="截屏2023-10-16 17.07.03" style="zoom:33%;" />

A—大于、B—小于、E—等于、N—NOT

一般紧跟于指令之后，例如：  
CMP AX,BX  
JA NEXT  
意思就是如果AX大于BX那就跳转到NEXT，否则顺序执行。(只适用于无符号数比较)

#### 对于有符号数

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.11.51.png" alt="截屏2023-10-16 17.11.51" style="zoom:33%;" />

G—大于、L—小于，同上例，JG NEXT，但只适用于有符号数比较。

#### 对于标志位

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.14.46.png" alt="截屏2023-10-16 17.14.46" style="zoom:33%;" />

JNS—SF=0、JS—SF=1

### 例题（*）

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.21.16.png" alt="截屏2023-10-16 17.21.16" style="zoom:33%;" />

这道题可以灵活改动，如改成200个8位或者寻找最小值等。

如果是200位：只需更改CX的值；如果改为最小值，只需改为JB NEXT，MOV MIN；
如果是有符号：只需改动JGE NEXT；如果改为有符号数最小值，只需改为JL NEXT，MOV MIN；

## 循环控制指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.28.20.png" alt="截屏2023-10-16 17.28.20" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.31.28.png" alt="截屏2023-10-16 17.31.28" style="zoom:33%;" />

1. 计数循环  
   格式：LOOP 目标标号  
   功能：CX-1回送给CX，若CX!=0，循环转移到目标标号，直到CX=0退出循环。

2. 结果为0/相等循环  
   格式：LOOPZ/LOOPE 目标标号  
   功能：CX-1回送给CX，若CX!=0**且**ZF=1时，循环转移到～，直到CX=0或ZF=0退出循环。
3. 结果不为0/不相等循环  
   格式：LOOPNZ/LOOPNE 目标标号  
   功能：CX-1回送给CX，若CX!=0**且**ZF=0时，循环转移到～，直到CX=0或ZF=1退出循环。
4. 计数为0转移(极少用)  
   格式：JCXZ 目标标号  
   功能：若CX=0（ZF=1）时，则转向目标标号，否则顺序执行。

## 处理器控制指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.36.42.png" alt="截屏2023-10-16 17.36.42" style="zoom:33%;" />

1. 标志操作指令  
   CMC—CF置反  
   这些指令只影响与其相关的标志位。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.38.55.png" alt="截屏2023-10-16 17.38.55" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.41.07.png" alt="截屏2023-10-16 17.41.07" style="zoom:33%;" />

2. CPU控制指令  
   （1）处理器暂停指令 HLT  
   （2）处理器等待指令 WAIT  
   （3）处理器交权指令 ESC EXTOPCD，OP源  
   （4）空操作指令 NOP（延时用，什么都不会操作）

## 输入输出指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.45.33.png" alt="截屏2023-10-16 17.45.33" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.51.48.png" alt="截屏2023-10-16 17.51.48" style="zoom:33%;" />

8086独立编址，所以有两种寻址方式，即直接寻址和间接寻址。

直接寻址范围00H—0FFH；因为间接寻址范围为0000H—0FFFFH共64k个端口，所以间接寻址时，只能用DX作间址寄存器。

1. 输入指令  
   格式：IN 累加器，端口  
   功能：把一个字节/字 由输入端口传送到AL/AX中。  
   例如：IN AL，21H；此处的端口范围是00H—0FFH或者只能是DX，且累加器只能是AL或者AX；MOV DX，201H是因为超出了0FFH。  
   IN AX，DX；AX为数据，DX为地址。
2. 输出指令  
   格式：OUT 端口，累加器（与输入相反）  
   功能：把AX中的16位数或AL中的8位数输出到指定端口。  
   例：OUT 22H，AL；MOV DX，511H；IN DX，AX；

## 中断指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.54.55.png" alt="截屏2023-10-16 17.54.55" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-16%2017.58.52.png" alt="截屏2023-10-16 17.58.52" style="zoom:33%;" />

1. 溢出中断指令（影响标志位IF、TF）  
   格式：INTO  
   功能：检测OF标志位，当OF=1，产生一个中断类型4的中断；当OF=0，无用。
2. 软中断指令（影响标志位IF、TF）  
   格式：INT n（n为中断类型号）（中断类型号是8086给出的）  
   功能：产生一个软件中断，把控制转向一个类型号为n的软中断。
3. (*)中断返回指令（影响所有标志位）  
   格式：IRET  
   功能：让CPU执行完中断服务程序后，正确返回原程序的断点处。  
   IRET必返回IP、CS、FR。RET只返回IP或IP和CS。