---
title: 伪指令-上
published: 2023-10-18
description: 微机原理常量变量和符号以及运算符部分知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第三章

## 常用伪指令

## 宏汇编语言的基本语法

### 常数变量和符号

#### 常数

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-17%2016.26.42.png" alt="截屏2023-10-17 16.26.42" style="zoom:33%;" />



<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-17%2016.32.34.png" alt="截屏2023-10-17 16.32.34" style="zoom:33%;" />

1. 二进制数：以字母B结尾，“0“和”1“组成的序列。
2. 八进制数：以字母o或Q结尾，由若干个0-7的数字组成的序列。
3. 十进制数：由若干个0到9的数字组成的序列。可以以字母D结尾，也可以忽略字母D。
4. 十六进制数：以字母H结尾，由若干个0-9的数字和字母A-F组成的序列。且必须以数字开头。
5. 字符串常数：用引号括起来的一个或多个字符。这些字符以ASCII码形式存在内存中。串常量与整数常量可以交替使用。

注意：为了区别是十六进制还是英文符号，凡以字母A～F为起始字符的十六进制数，必须在前面冠以数字‘’0‘’。

#### 变量

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-17%2016.38.45.png" alt="截屏2023-10-17 16.38.45" style="zoom:33%;" />

*变量实际上是一个偏移地址的取代符。*

*变量名代指一个偏移地址。*

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-17%2017.15.21.png" alt="截屏2023-10-17 17.15.21" style="zoom:33%;" />

变量是用数据定义伪指令DB、DW、DD等定义的。

DB—字节  
DW—字(2字节)  
DD—双字(4字节)
变量实际上就是代址。上图为直接寻址。

#### 标号

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2016.25.19.png" alt="截屏2023-10-18 16.25.19" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2016.29.18.png" alt="截屏2023-10-18 16.29.18" style="zoom:33%;" />

标号实际上是(代码段)某条指令的偏移地址。（段内）是偏移地址，（段间）是段地址和偏移地址。

通常由字母数字串组成，但第一个字符必须是字母。

标号：JMP NEXT; NEXT：...（此处的NEXT就为标号）

### 运算符与表达式



<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2016.36.24.png" alt="截屏2023-10-18 16.36.24" style="zoom:33%;" />

1. **算术运算符**  
   包括：+、-、*、/、MOD(求余)、SHL(左移)和右移(SHR)  
   例中的MOV AL，21H SHL 2；实际上出现的是21H左移2位后的结果。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2016.38.45.png" alt="截屏2023-10-18 16.38.45" style="zoom:33%;" />

2. **逻辑运算符**  
   包括：AND、OR、XOR和NOT，只适用于对常数进行逻辑运算。  
   例：AND DX，PORT AND 0FEH；

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2016.44.43.png" alt="截屏2023-10-18 16.44.43" style="zoom:33%;" />

3. **关系运算符**  
   包括：EQ（相等）、NE（不相等）、LT（小于）、GT（大于）、LE（小于或等于）、GE（大于或等于）  
   若关系为假（不成立），结果为0。  
   若关系为真（成立），结果为0FFH或0FFFFH。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2016.52.14.png" alt="截屏2023-10-18 16.52.14" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2016.57.27.png" alt="截屏2023-10-18 16.57.27" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2017.00.52.png" alt="截屏2023-10-18 17.00.52" style="zoom:33%;" />

4. **分析操作符（数值返回运算符）**  
   （1）取地址的偏移量  
   格式：OFFSET 变量名或标号  
   例：2000H:1000H有DATA1。MOV BX OFFSET DATA1；此时BX=1000H。  
   （2）取段基址  
   格式：SEG 变量名或标号  
   例：MOV BX，SEG DATA1，BX=2000H。  
   （3）求变量名或标号的类型值  
   格式：TYPE 变量名或标号  
   例：MOV AL，TYPE NEXT，假如NEXT为段间标号，那么AL=-2=0FEH（负数用补码）。  
   （4）求长度  
   格式：LENGTH 变量名  
   功能：如果是定义说明，则返回DUP前面的数值，其余返回1。  
   （5）求大小  
   格式：SIZE 变量名  
   功能：返回变量名所占存储单元的字节数。公式SIZE = LENGTH * TYPE。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2017.04.51.png" alt="截屏2023-10-18 17.04.51" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2017.10.32.png" alt="截屏2023-10-18 17.10.32" style="zoom:33%;" />

5. **综合运算符**  
   （1）PTR运算符  
   格式：类型 PTR 表达式  
   功能：用于指出变量、标号或地址表达式的类型属性。   
   例：MOV BYTE PTR [DI],4；指明目的操作数为字节类型。 JMP DWORD PTR [BP]；指明目的操作数为双字类型。  
   （2）THIS运算符（不咋重要）  
   格式：THIS 类型  
   功能：把它后面指定的类型或距离属性赋给当前的变量、标号或地址表达式。
   例：A EQU THIS BYTE；B DW 20 DUP；变量A为字节访问，变量B为字访问，段地址和偏移地址是相同的。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2017.17.01.png" alt="截屏2023-10-18 17.17.01" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-18%2017.19.58.png" alt="截屏2023-10-18 17.19.58" style="zoom:33%;" />

6. **其他运算符**  
   （1）HIGH和LOW运算符  
   格式：HIGH 表达式；格式：LOW 表达式；  
   功能：从运算对象中分离出高字节和低字节。  
   例：K1 EQU 1234H；MOV AL，LOW K1；AL—34H；MOV BL，HIGH K1；BL—12H  
   （2）SHORT运算符  
   格式：SHORT 标号  
   功能：字节距离在-128～127之间，可以用SHORT运算符进行说明。（段内直接短转移）