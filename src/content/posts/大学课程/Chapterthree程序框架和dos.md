---
title: 程序框架与DOS
published: 2023-10-24
description: 微机原理程序框架与DOS知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第三章

## 程序框架与DOS功能

## 汇编语言程序的结构(看!记!写!)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2017.21.18.png" alt="截屏2023-10-19 17.21.18" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2017.25.08.png" alt="截屏2023-10-19 17.25.08" style="zoom:33%;" />

END代表的是源程序写完。

源程序结束：MOV AH，4CH；INT 21H；（返回DOS）

上图为一个标准框架，但是汇编遵循用到什么定义什么的规则。

## 返回DOS两种方法

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2017.43.36.png" alt="截屏2023-10-19 17.43.36" style="zoom:33%;" />

## DOS系统功能的调用

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2017.53.59.png" alt="截屏2023-10-19 17.53.59" style="zoom:33%;" />

如图，这样就可以调用到21H软中断的某个功能。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-19%2018.01.54.png" alt="截屏2023-10-19 18.01.54" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-23%2009.30.59.png" alt="截屏2023-10-23 09.30.59" style="zoom:33%;" />

> 单字符显示
>
> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-24%2009.34.52.png" alt="截屏2023-10-24 09.34.52" style="zoom: 50%;" />
>
> 9号功能显示
>
> <img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-10-24%2009.44.09.png" alt="截屏2023-10-24 09.44.09" style="zoom: 50%;" />



1. 键盘输入单字符—1号系统功能调用  
   格式：  
   MOV AH，1	//1号功能  
   INT 21H  
   功能：无入口参数，等待键盘输入。检测是否是ctrl到break键，若是则退出，否则将键入值置入AL中，并显示该字符。（置入的是ASCII码的十六进制，如图所示）
2. 输出单字符—2号系统功能调用  
   格式：  
   MOV DL，'A'  
   MOV AH，2  
   INT 21H  
   功能：将DL中的字符送屏幕显示。

3. 输出字符串—9号系统功能调用  
   格式：  
   BUF DB 'GOOD BYE$'. 
   ...  
   MOV DX,OFFSET BUF  
   MOV AH,9  
   INT 21H  
   用法：以'$'符号结尾，并且把字符串的首偏移地址送给DX。  
   功能：将指定的内存缓冲区中的字符串在屏幕上显示出来。