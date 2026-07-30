---
title: 伪指令-下
published: 2023-10-19
description: 微机原理伪指令部分知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第三章

## 常用伪指令

## 伪指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2017.39.45.png" alt="截屏2023-10-18 17.39.45" style="zoom:33%;" />

指令：可执行的机器指令代码。

伪指令：为CPU在编译时进行解释说明，分配存储器等操作。

格式：符号名 定义符 操作数；注释  
定义符处是真正的伪指令。分号间隔代码和注释。

### 符号定义伪指令（赋值语句）

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2017.50.47.png" alt="截屏2023-10-18 17.50.47" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2017.54.33.png" alt="截屏2023-10-18 17.54.33" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2017.55.45.png" alt="截屏2023-10-18 17.55.45" style="zoom:33%;" />

1. **等值伪指令**  
   格式：符号名 EQU 表达式  
   功能：将表达式的值赋给符号名  **（*）EQU定义不占用内存单元**  例：ALFA EQU 100；MOV AL，ALFA；AL=100=64H

   注意：符号名一旦被EQU定义，就不能再赋值，即不能用EQU再为符号名重新赋值。（如上例ALFA被定义后一直是100）

2. **等号伪指令**  
   格式：符号名 = 表达式  
   功能：将表达式的值赋给符号名。 和EQU不同的是等号伪指令可以**多次重新**为符号名赋值。  

3. 定义符号名伪指令（**极少用**）  
   格式：符号名 LABEL 类型  
   功能：定义一个标号或变量，并指定其类型。

### 数据定义伪指令(*)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2017.58.34.png" alt="截屏2023-10-18 17.58.34" style="zoom:33%;" />

全都是占据内存单元的。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2018.10.22.png" alt="截屏2023-10-18 18.10.22" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2019.17.50.png" alt="截屏2023-10-18 19.17.50" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2019.28.48.png" alt="截屏2023-10-18 19.28.48" style="zoom:33%;" />

1. **数据表达式**  
   DB：字节由低到高排序。  
   DW：双字节，高高低低原则。
   图中DAT DW 1235H，5678H；先按先后顺序，再高高低低排序。  
   **只要CPU自动操作，就会遵循这个原则。**
2. **ASCII字符串**   
   ASCII码转为十六进制再根据指令存入。  
   例如DB和DW分别指向‘AB’，DB为字节所以是由低到高，DW为字所以把AB作一个整体由低字节到高字节存入。
3. **？**  
   常用来预留单元，其值不定。
4. **重复定义子句DUP**  
   格式：n DUP （表达式）  
   说明：n：重复次数；表达式：重复的内容。  
   注意：DUP可以嵌套，同时也定义了类型属性。

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2019.24.28.png" alt="截屏2023-10-18 19.24.28" style="zoom:33%;" />
>
> 第一种是对的，第二种是错的。  
> 第一种可以按最小单元分，第二种不知道哪位放高位或者放低位所以是错误的。

#### 例题

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2019.39.51.png" alt="截屏2023-10-18 19.39.51" style="zoom:33%;" />

DA1 DB 3 DUP(5,?,6)；三个单元 重复3次 一个字节。共9个地址单元。  
DA2 DW 40 DUP(?)；一个单元 重复40次 两个字节。共80个地址单元。  
DA3 DB 10 DUP(1,2,3 DUP(30,4))；（两个单元 重复三次 加两个单元）重复10次 一个字节。共80个地址单元。  
DA4 DD **10H** DUP(2 DUP(1,2),3,4)；（两个单元 重复两次 加两个单元）重复16次 四个字节。共384个地址单元。

#### 例题2

将DATA1、2、3、4转为内存单元的形式。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2020.09.36.png" alt="截屏2023-10-18 20.09.36" style="zoom:33%;" />

DATA1 由低到高、DATA2 -2转为补码，12转为十六进制，再遵循高高低低原则、DATA3 EQU不占用内存单元、DATA4 高高低低原则。

#### 例题3

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2009.43.07.png" alt="截屏2023-10-19 09.43.07" style="zoom:33%;" />

### 段定义伪指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2009.45.51.png" alt="截屏2023-10-19 09.45.51" style="zoom:33%;" />

格式： 

段名 SEGMENT ～（可缺省）  
中间为内容  
段名 ENDS结尾 

### 段寄存器说明伪指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2009.49.45.png" alt="截屏2023-10-19 09.49.45" style="zoom:33%;" />

格式：ASSUME 段寄存器：段名[，段寄存器 ：段名...]

例：ASSUME CS:CODE，DS:DATA

功能：向程序指示当前各段所用的段寄存器，设定对应关系。

注意：只是指示各逻辑段使用寄存器的情况，并没有装载。段寄存器的实际值**（除CS外）**还要由MOV指令在程序中装填数据。

###  过程定义伪指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2015.07.41.png" alt="截屏2023-10-19 15.07.41" style="zoom:33%;" />

过程是程序的一部分，它可以被程序调用。（相当于子进程）。

格式：

过程名 PROC [NEAR/FAR] （near/far可省）  
中间为内容  
RET（可有多个RET，一般作最后一条指令，是实指令）  
过程名 ENDP

#### 例

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2015.14.31.png" alt="截屏2023-10-19 15.14.31" style="zoom:33%;" />

APRC PROC一段落为子进程，CALL APRC—调用APRC进程，APRC中的RET再返回到CALL APRC，可多次调用。

### 模块定义及通信伪指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2015.20.21.png" alt="截屏2023-10-19 15.20.21" style="zoom:33%;" />

模块结束伪指令

格式：END 启动标号或过程名  
功能：通知汇编程序**源程序**到此结束。只有一个，且是整个程序最后一条伪指令。  
END 后的标号或过程名可缺省。

### 宏指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2015.24.21.png" alt="截屏2023-10-19 15.24.21" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2015.25.01.png" alt="截屏2023-10-19 15.25.01" style="zoom:33%;" />

### 扩展

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2015.28.35.png" alt="截屏2023-10-19 15.28.35" style="zoom: 33%;" /><img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2016.54.22.png" alt="截屏2023-10-19 16.54.22" style="zoom:33%;" />

ORG 16位偏移地址：声明偏移地址。

$：取当前偏移地址。