---
title: 移位指令
published: 2023-10-09
description: 微机原理移位指令知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第三章

## 逻辑运算指令与移位指令

## 移位指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2019.07.15.png" alt="截屏2023-10-09 19.07.15" style="zoom:33%;" />

移位操作分两大类：  
非循环移位：逻辑移位、算术移位。  
循环移位：不带进位位的移位、带进位位的移位。

**规定：移动一位时由指令中的计数值直接给出；移动两位及以上，则移位次数由CL指定，即必须将移位位数N事先装入CL中。**

### 非循环移位

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2019.18.00.png" alt="截屏2023-10-09 19.18.00" style="zoom:33%;" />

非循环移位指令有四条：逻辑左移、算术左移；逻辑右移、算术右移。（左移乘2、右移除以2）

算术左移（SAL）和逻辑左移（SHL）相同，**可用于无符号数乘2**操作；左移操作前的最高位送到CF、右边空位需补0。 

逻辑右移（SHR），**可用于无符号数除2**操作；右移操作前的最低位送到CF、左边需补0。

**算术右移（SAR）**，**可用于有符号数除2**操作；右移操作**前**的**最高位**会补充到右移**后**的**最高位**（补原来的本身），最低位送到CF。

**例：**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2019.38.46.png" alt="截屏2023-10-09 19.38.46" style="zoom:33%;" />

**乘大一些的数值运算时的简易方法：**  
例如10，拆开后是2的三次方+2的一次，就是左移1次再加3次；  
例如25，拆开后是2的四次方+2的三次+2的一次，左移1次再移3次再加4次。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2019.54.30.png" alt="截屏2023-10-09 19.54.30" style="zoom:33%;" />

### 循环移位指令

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2020.03.33.png" alt="截屏2023-10-09 20.03.33" style="zoom:33%;" />

循环移位指令有四条：循环左移、循环右移；带进位循环左移、带进位循环右移。

循环左移（ROL）：把最高位移到最低位，同时把没有移动前的最高位送到CF中。

循环右移（ROR）：把最低位移到最高位，同时把没有移动前的最低位送到CF中。

带进位循环左移（RCL）：已知CF的值，把OP目的最高位送入CF，CF的值送到OP目的最低位。  
例：CF=1，AL=0011 1100，RCL AL，1；CF=0 AL=0111 1001

带进位循环右移（RCR）：已知CF的值，把OP目的最低位送入CF，CF的值送到OP目的最高位。

### 提示

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2020.25.32.png" alt="截屏2023-10-09 20.25.32" style="zoom:33%;" />

### 例题

![截屏2023-10-09 20.22.52](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-09%2020.22.52.png)