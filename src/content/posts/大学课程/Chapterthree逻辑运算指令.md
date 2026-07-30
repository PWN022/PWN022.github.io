---
title: 逻辑运算
published: 2023-10-09
description: 微机原理逻辑运算指令知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第三章

## 逻辑运算指令与移位指令

## 逻辑运算指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2016.30.25.png" alt="截屏2023-10-09 16.30.25" style="zoom:33%;" />

OP源：8/16位通用寄存器、存储器操作数或立即数。  
OP目：通用寄存器和存储器操作数。  
除“非”运算外，其余指令都会使OF=CF=0

### 逻辑与运算AND

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2016.32.52.png" alt="截屏2023-10-09 16.32.52" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2016.38.18.png" alt="截屏2023-10-09 16.38.18" style="zoom:33%;" />

1. 屏蔽  
   与运算有0出0，全1出1，和0与运算，得到的仍然是0；和1与运算，得到的需要看原数据的位置是0还是1。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2016.46.16.png" alt="截屏2023-10-09 16.46.16" style="zoom:33%;" />

2. 测试  
   测试XX的最高位是否为X，通过判断标志位得出。

### 逻辑或运算OR

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2016.50.31.png" alt="截屏2023-10-09 16.50.31" style="zoom:33%;" />

1. 将某位置1  
   或运算有1出1，全0出0。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2016.55.39.png" alt="截屏2023-10-09 16.55.39" style="zoom:33%;" />

2. 拼接  
   比如将非组合BCD码转换成ASCII码，需要将00H-09H中的某一个转换为30H-39H中的某一个。  
   图中例子AL为05H，只需给前四位进行变动即可得到ASCII码对应的数值。

### 逻辑异或运算XOR

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2017.03.02.png" alt="截屏2023-10-09 17.03.02" style="zoom:33%;" />

1. 按位取反  
   异或运算相同为0，不同为1，1和1得到的是0，0和1得到的是1，按位取反。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2017.11.27.png" alt="截屏2023-10-09 17.11.27" style="zoom:33%;" />

2. 异或  
   和1异或相当于取反，和0异或不变。

### 注意

寄存器清0（有4条指令可以达到AX清0目的）: 
XOR AL，AL；   
MOV AX，0；  ***MOV不会清零CF***
SUB AX，AX；  
AND AX，0；

此外，AND、OR、XOR、TEST都会使CF=OF=0。

### 逻辑非运算NOT

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2017.21.39.png" alt="截屏2023-10-09 17.21.39" style="zoom:33%;" />

> 理解C语言中的取反和反码
> 首先，反码是针对于负数而言的，因为正数的反码补码都是原码；
> 反码：负数的反码是除了符号位其他取反；
> 取反：比如对2取反，（假设它以一个字节存储）
>
> 2的原码是：0000 0010
> 对它取反：1111 1101；注意这个得到的是一个补码；
> 然后对这个补码求它的原码：
> 求反码：1000 0010；
> +1得原码：1000 0011；
> 得到结果为-3.

逻辑非运算指令只是执行求反操作，不是求反码；且不影响标志位。

### 测试指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2017.46.11.png" alt="截屏2023-10-09 17.46.11" style="zoom:33%;" />

格式：TEST OP目，OP源  
功能与AND基本相同，但是不回送结果，只**根据结果置标志位**。  
主要用来检测目的操作数的某些位是1或0。

### 总结

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2017.52.31.png" alt="截屏2023-10-09 17.52.31" style="zoom:33%;" />

AND OR XOR TEST均影响标志，CF=0，OF=0，而PF、SF、ZF由结果而定，AF无意义。

当执行与、或、或者测试运算时，结果不变，但是会回送给自己且标志位会变。  
例1:当执行上述运算时AL本身为0，结果回送自然也是0，那么ZF就等于1。  
例2:当执行上述运算时最高位会回送给SF从而来判断正负。

### 例题

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2018.21.26.png" alt="截屏2023-10-09 18.21.26" style="zoom:33%;" />

AX获取中间8位并取反  
AX=AAAAH  1010 1010 1010 1010  
取出中间8位 AND AX，0FF0H  
0000 1010 1010 0000 = 0AA0H  
取反 XOR AX，0FF0H  
0000 0110 0110 0000 = 0550H

BX取高四位  
BX=BBBBH  1011 1011 1011 1011  
取出高4位 AND BH，0F0H  
1011 0000 0000 0000 = B0H

CX取低四位  
CX=CCCCH  1100 1100 1100 1100  
取出低四位 AND CL，0FH  
1100 0000 0000 0000 = 0CH

拼字
OR AH，BH  
OR AL，CL  
结果AX=B55CH