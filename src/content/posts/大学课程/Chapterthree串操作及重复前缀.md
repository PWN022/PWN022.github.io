---
title: 串操作及重复前缀
published: 2023-10-10
description: 微机原理串操作及重复前缀知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第三章

## 串操作及重复前缀

## 字符串操作指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2016.51.50.png" alt="截屏2023-10-10 16.51.50" style="zoom:33%;" />

串操作共同点：

1. **源串一般存放在数据段(DS)**，偏移地址由**SI(源变址寄存器)**指定，**目的串在附加段(ES)**，偏移地址由**DI(目的变址寄存器)**指定。
2. 每执行一次串操作后自动修改指针**SI、DI**（类似于C语言的指针,指向了某个单元,SI、DI相当于P指针）。若方向标志DF=0(正向操作)，则每次操作后SI和DI自动加1(或加2)[由操作的是字节还是字来决定]，若DF=1(反向操作)，则每次操作后SI和DI自动减1(或减2)修改。
3. 串长(字或字节个数)存放在CX中。

注意：在执行指令前必须DS、ES、SI、DI、DF、CX置好需要的值，它们是串操作指令的隐含操作数。

### 字符串传送指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2017.05.46.png" alt="截屏2023-10-10 17.05.46" style="zoom:33%;" />

格式：MOVSB—字节传送；MOVSW—字传送  
功能：**数据段由SI指定**的内存单元的字节/字数据传送到**附加段由DI指定**的内存单元，指令不影响状态标志位。  
[DI]<—[SI]若DF=0，SI+1/2(字节或者字)—SI，DI+1/2—DI  若DF=1，SI-1/2—SI，DI-1/2—DI  
传送顺序由DF决定，且串传送指令常与**无条件重复前缀**连用。

### 字符串比较指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2017.12.36.png" alt="截屏2023-10-10 17.12.36" style="zoom:33%;" />

格式：CMPSB—字节比；CMPSW—字比较  
功能：结果不保存，但影响状态标志位，并由DF状态决定SI、DI的修改方向。  
[SI]-[DI]第一个操作数减去第二个操作数，不影响两个操作数的值  
串比较指令常与**条件重复前缀**连用。 

### 字符串搜索指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2017.19.07.png" alt="截屏2023-10-10 17.19.07" style="zoom:33%;" />

格式：SCASB；SCASW  
功能：把AL/AX中的内容与附加段由DI(ES:DI)指定的一个字节/字数据进行比较，结果不保存，但影响状态标志位，并由DF状态决定DI的修改方向。

### 取/存字符串指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2017.27.48.png" alt="截屏2023-10-10 17.27.48" style="zoom:33%;" />

## 重复前缀指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2017.34.49.png" alt="截屏2023-10-10 17.34.49" style="zoom:33%;" />

基本串操作指令每执行一次只能处理一个数据，与重复前缀指令结合可以处理一串数据。

1. 无条件重复 REP——若CX!=0，则CX-1回送给CX，继续重复操作，直到CX=0为止。  
   ————————————以下为重要部分—————————————
2. 相等/为0重复 REPE/REPZ——若CX!=0且ZF=1，则CX-1回送给CX，重复直到CX=0或ZF=0为止。
3. 不相等/不为0重复 REPNE/REPNZ——若CX!=0且ZF=0，则CX-1回送给CX，重复直到CX=0或ZF=1为止。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2017.42.35.png" alt="截屏2023-10-10 17.42.35" style="zoom:33%;" />

**重复前缀指令不能单独使用，其后必须紧跟基本串操作指令；重复执行次数由数据串长度决定，数据串长度应预置在寄存器CX中；重复前缀指令不影响标志位。**

### 例题

#### 例1

**一般传送指令：**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2017.47.08.png" alt="截屏2023-10-10 17.47.08" style="zoom:33%;" />

**串传送指令以及重复传送指令：**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2017.54.19.png" alt="截屏2023-10-10 17.54.19" style="zoom:33%;" />

CLD—DF清0

#### 例2

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2018.01.51.png" alt="截屏2023-10-10 18.01.51" style="zoom:33%;" />

#### 例3

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-10%2018.06.49.png" alt="截屏2023-10-10 18.06.49" style="zoom:33%;" />