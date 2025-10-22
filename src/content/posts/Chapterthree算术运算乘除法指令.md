---
title: 算术运算乘除法指令
published: 2023-10-07
description: 微机原理算术运算乘除法指令部分。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第三章

## 算术运算类指令

### 乘法指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2015.57.35.png" alt="截屏2023-10-07 15.57.35" style="zoom: 33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2016.06.36.png" alt="截屏2023-10-07 16.06.36" style="zoom:33%;" />

1. 无符号数乘法  
   格式为MUL OP，只有一个操作数，8位x8位就是16位，16位x16位是32位。  
   8x8是操作数xAL最后的数据存放在AL  
   16x16是操作数xAL最后的数据存放在DX和AX  
   例：  
   MUL BL；ALxBL的结果送AX  
   MUL WORD PTR [SI]；AX*[SI+1] [SI]的结果回送(DX,AX)  *“DX是高16位，AX是低16位”*
2. 带符号数乘法  
   操作同上，但是操作数为带符号数。  
   格式为IMUL OP；

#### 注意

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2016.19.54.png" alt="截屏2023-10-07 16.19.54" style="zoom:33%;" />

1. 对于MUL（例）  
   <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2016.50.13.png" alt="截屏2023-10-07 16.50.13" style="zoom:33%;" />

   （图为16位 ）  

   8位x8位时，若AH（高8位)为0，则CF=OF=0；  
   当AL=2,BL=3时，MUL BL；2x3=6—>AX，此时AH=0，AL=6，所以CF=OF=0；  
   16位x16位看高16位是否为0，若为0，CF=OF=0，否则CF=OF=1。

2. 对于IMUL  
   <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2017.02.55.png" alt="截屏2023-10-07 17.02.55" style="zoom:33%;" />

   有符号数的乘法必须转换成真值来做。  
   -1x3=-3转换为补码：0000-3=0FFFDH  
   符号扩展是指：  
   **做字节乘法时，乘积低8位的最高位为0，高8位也扩展为0，或者低8位的最高位为1，高8位也扩展为1的情况。**  
   **对两个字相乘，符号扩展是指乘积的低16位的最高位为0，高16位也扩展为0，或者低16位的最高位为1，高16位也扩展为1的情况。**

#### 例题

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2017.44.09.png" alt="截屏2023-10-07 17.44.09" style="zoom:33%;" />

1. 无符号，0FEH*0AH = 1111 1110B x 10 （2的3次方+2的1次方）  
   其中AH（高8位）不等于0所以CF=OF=1

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2017.46.55.png" alt="截屏2023-10-07 17.46.55" style="zoom:33%;" />

2. 有符号，-2*(+10) = -20(补)，-20转为16进制为14H，真值=0000H-14H = 0FFECH  
   其中AH为1111 1111 AL为1110 1100，高是低一半的符号扩展，所以CF=OF=0

### 除法指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2017.56.27.png" alt="截屏2023-10-07 17.56.27" style="zoom:33%;" />

1. 无符号数除法  
   格式为DIV OP；除数不能为0且指令要求被除数是除数的双倍字长。  
   OP为8位时，16/8；OP为16位时，32/16  
   字节除法：AX/OP，商存放在AL中，余数存放在AH中。  
   字除法：(DX、AX)/OP，商存放在AX中，余数存放在DX中。

![截屏2023-10-07 18.30.14](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2018.30.14.png)

2. 有符号数除法  
   格式为IDIV OP，操作同上，但操作数为带符号数。

#### 注意

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2018.17.14.png" alt="截屏2023-10-07 18.17.14" style="zoom:33%;" />

图中解释为0号中断。

#### 符号扩展指令格式

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2018.22.00.png" alt="截屏2023-10-07 18.22.00" style="zoom:33%;" />

符号扩展指令不需要操作数。  
图中为字节扩展指令。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2018.24.23.png" alt="截屏2023-10-07 18.24.23" style="zoom:33%;" />

图中为字扩展指令。

### 十进制运算调整指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2018.35.38.png" alt="截屏2023-10-07 18.35.38" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2018.34.51.png" alt="截屏2023-10-07 18.34.51" style="zoom:33%;" />

#### 非组合BCD码的加法调整指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2018.43.01.png" alt="截屏2023-10-07 18.43.01" style="zoom:33%;" />

格式：AAA；

#### 组合BCD码的加法调整指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2018.54.46.png" alt="截屏2023-10-07 18.54.46" style="zoom:33%;" />

#### 非组合/组合BCD的减\乘\除

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2018.55.56.png" alt="截屏2023-10-07 18.55.56" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2018.57.13.png" alt="截屏2023-10-07 18.57.13" style="zoom:33%;" />

> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2019.00.34.png" alt="截屏2023-10-07 19.00.34" style="zoom:33%;" />
>
> **特殊的指令：非组合BCD码的除法调整指令**  
> 格式：AAD；只能在DIV运算前使用。  
> 对BCD码进行调整，8086不支持BCD码直接运算的，实际上还是在用二进制计算。

#### 总结

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2019.03.57.png" alt="截屏2023-10-07 19.03.57" style="zoom:33%;" />

### 例题

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-07%2019.06.55.png" alt="截屏2023-10-07 19.06.55" style="zoom:33%;" />