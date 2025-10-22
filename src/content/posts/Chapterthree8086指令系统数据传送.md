---
title: 数据传送指令
published: 2023-09-21
description: 微机原理8086数据传送指令知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第三章

## 8086的指令系统

**指令系统按功能分为数据传送类、算术运算类、逻辑运算与移位类、串操作类、控制转移类、~~处理机控制~~、输入输出、中断等**

## 数据传送指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2018.05.58.png" alt="截屏2023-09-21 18.05.58" style="zoom:33%;" />

1. 通用数据传送指令
   包括MOV、进栈、出栈指令、交换指令和换码指令。  
   (1)一般数据传送指令MOV （8位/16位）  
   OP目可以是寄存器（除CS外）、存储器  
   OP源可以是寄存器、存储器和立即数

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2018.13.20.png" alt="截屏2023-09-21 18.13.20" style="zoom:25%;" />
>
> MOV [DI]，AX； AX值送给以DI为偏移地址的单元；把AX送给DSx16+DI 和 DSx16+DI+1  
> MOV SI，ES：[BP]；把ESx16+BP 和 ESx16+BP+1 的值送给SI单元  
> [SI]表示寄存器SI所指内存单位  
> WORD PTR声明字(16位)，BYTE PTR声明字节(8位)。  
> 若有寄存器(因为寄存器在CPU内部)参与寻址无需声明，若没有寄存器参与则需要声明类型。

#### 注意事项

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2018.35.09.png" alt="截屏2023-09-21 18.35.09" style="zoom: 25%;" />

1. **两个操作数的数据类型要相同，要同为8位、16位或32位；如：MOV  BL, AX等是不正确的；**
2. **两个操作数不能同时为段寄存器，如：MOV  ES, DS等；**
3. **代码段寄存器CS不能为目的操作数，但可作为源操作数，如：指令MOV  CS, AX等不正确，但指令MOV  AX, CS等是正确的；**
4. **立即数不能直接传给段寄存器，如：MOV  DS, 100H等；**
5. **立即数不能作为目的操作数，如：MOV  100H, AX等；**
6. **指令指针IP，不能作为MOV指令的操作数（IP不可读写）；**
7. **两个操作数不能同时为存储单元，如：MOV  VARA, VARB等，其中VARA和VARB是同数据类型的内存变量。**
8. **一般传送指令不影响标志位（FR/PSW）**

#### 例题

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2018.44.01.png" alt="截屏2023-09-21 18.44.01" style="zoom:33%;" />

### 堆栈操作指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2019.00.08.png" alt="截屏2023-09-21 19.00.08" style="zoom:33%;" />

堆栈：后进先出，有堆栈寄存器SS—段地址，堆栈指针SP—最新入栈数据所在的存储单元的地址。

**压栈操作：PUSH OP 不能是立即数，按字操作一次只能是16位，先减后压。**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2019.04.35.png" alt="截屏2023-09-21 19.04.35" style="zoom:33%;" />

SP指针：每次自减，逆向生成。 
高地址存高位，低地址存地位；SP-1先压AH然后再SP-1压AL，所以AH的数据还是大于AL的数据

**出栈操作：先弹出数据然后再加。**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2019.14.56.png" alt="截屏2023-09-21 19.14.56" style="zoom:33%;" />

POP相当于PUSH的逆过程，弹出AL，AL的数据存到DL，弹出AH，AH的数据存到DH，然后SP指回再给高位低位进行+1。

#### 例题

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2019.28.55.png" alt="截屏2023-09-21 19.28.55" style="zoom:33%;" />

后入先出。PUSH个数=POP个数；SP不变；PUSH比POP每多一个SP-2，POP比PUSH每多一个SP+2。

#### 注意

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2019.36.14.png" alt="截屏2023-09-21 19.36.14" style="zoom:33%;" />

1. 堆栈操作总是按字进行的。
2. 压入指令，SP-2，数据在栈顶，弹出指令正好相反。
3. 操作数可以是存储器、寄存器或段寄存器操作数（CS不能用于POP），不能是立即数。  
   因为CS和IP都只能间接的去写，不能直接从栈里去写。
4. PUSH和POP主要用来现场保护和修复，具体类似恢复系统，用来保证调试或中断程序的正常返回  
   比如要用到AX（只有一个）时，需要用到PUSH AX，调试完之后可以POP AX。

### 数据交换指令(8/16)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2019.47.19.png" alt="截屏2023-09-21 19.47.19" style="zoom:33%;" />

XCHG OP1，OP2功能是交换OP1和OP2的内容。
操作数为通用寄存器或存储器，但不能均为内存单元，且段寄存器和IP不能作为交换指令的操作数。

### 换码指令(查表指令、翻译指令)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2019.53.36.png" alt="截屏2023-09-21 19.53.36" style="zoom:33%;" />

功能内的[BX+AL]是XLAT实现的，实际上[]内不能出现AL。

> BX存基地址，AL存偏移量
>
> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2019.57.13.png" alt="截屏2023-09-21 19.57.13" style="zoom: 33%;" />
>
> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2019.58.24.png" alt="截屏2023-09-21 19.58.24" style="zoom:33%;" />

### 目标地址传送指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2020.04.21.png" alt="截屏2023-09-21 20.04.21" style="zoom:33%;" />

地址包括段地址(16位)和偏移地址(16位)

注意：

1. OP源必须是存储器操作数，OP目必须是16位的通用寄存器。
2. 地址传送指令不影响状态标志位

**取有效地址EA指令**：将源操作数的有效地址EA送到目的操作数，LEA BX，[BX] —>BX不变，因为还是它本身。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2020.13.47.png" alt="截屏2023-09-21 20.13.47" style="zoom: 33%;" />

**指针送寄存器和DS指令**：把OP源指定的4个字节内容取出，**低地址的两字节送到OP目，高地址的两字节送到DS。**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2020.17.26.png" alt="截屏2023-09-21 20.17.26" style="zoom: 33%;" />

**指针送寄存器和ES指令**：将OP源四个字节中，**低地址的两字节送到OP目**，**高地址的两字节送到ES。**

### 区分
1. 通用寄存器组 包含4 个16 位通用寄存器 AX、BX、CX、DX,用以存放普通数据或地址,也有其特殊用途。如AX(AL)用于输入输出指令、乘除法指令,BX 在间接寻址中作基址寄存器,CX 在串操作和循环指令中作计数器,DX 用于乘除法指令等。
2. 指针和变址寄存器 BP、SP、SI 和DI,在间接寻址中用于存放基址和偏移地址。
3. 段寄存器 CS、DS、SS、ES 存放代码段、数据段、堆栈段和附加段的段地址。
4. 指令指针寄存器IP 用来存放将要执行的下一条指令在现行代码段中的偏移地址。
5. 标志寄存器Flags 用来存放运算结果的特征。
<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-09-21%2020.11.26.png" alt="截屏2023-09-21 20.11.26" style="zoom: 33%;" />