---
title: 8259A可编程中断控制器
published: 2023-11-21
description: 微机原理8259A可编程中断控制器知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第五章

## 8259A可编程中断控制器

控制INTR

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2015.32.03.png" alt="截屏2023-11-21 15.32.03" style="zoom:33%;" />

### 8259A的功能

1. 具有8级优先权控制，级连可扩展至64级。（主片-从片）
2. 每一级中断都可以屏蔽或允许。
3. 在中断响应周期，8259A可提供相应的中断向量号(**中断类型号**)。(***)
4. 8259A的工作方式，可通过编程来进行选择。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2015.37.28.png" alt="截屏2023-11-21 15.37.28" style="zoom:33%;" />

### 8259A的引脚

D7-D0:数据总线（双向）、RD非:读输入、WR非:写输入、A0:命令选择地址、CS非:选片,为0时选中8259A芯片。  
CAS2-CAS0:级连时有效、INTA非:给8086发出信号,提供中断类型码、IR0-IR7(***):连接中断。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2015.57.27.png" alt="截屏2023-11-21 15.57.27" style="zoom:33%;" />

### 8259A的内部结构

中断屏蔽寄存器IMR：8位寄存器，高电平屏蔽请求，低电平允许请求。

中断请求寄存器IRR：中断来了，相应置位。例如：IR4和IR5请求中断，IRR=00110000

优先级电路：判断优先级。

中断服务寄存器ISR：正在服务某个中断。例如：正在服务IR7，ISR=10000000；且可以嵌套，例如ISR=10100000，说明低优先级被高优先级打断。

### 8259A的工作原理

**仅个人理解**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2016.08.52.png" alt="截屏2023-11-21 16.08.52" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2016.12.50.png" alt="截屏2023-11-21 16.12.50" style="zoom:33%;" />

8259A对外部中断请求处理过程：

1. 当有IR0-IR7变高，则IRR的相应位 置1。例如：IR4和IR5请求中断，IRR=00110000
2. 若中断请求线中至少有一条是中断允许的，则由INT引脚向CPU发出中断请求。
3. 开中断指令(STI)，然后响应中断请求。
4. CPU收到INTR信号后，使最高优先权的ISR位 置1，IRR位复位。8259A不向系统数据总线送任何内容。
5. 8259A向数据总线送一个8位中断类型码，CPU读取并计算后得到地址，从中断向量表取出中断服务程序入口地址。
6. 若8259A工作在自动结束中断AEOI方式，在第二个INTA结束时，使中断源在ISR的相应位复位，否则直至中断服务程序执行到EOI命令，才使ISR的相应位复位。(EOI：清除当前中断程序)

### 8259A的编程(***)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2016.24.05.png" alt="截屏2023-11-21 16.24.05" style="zoom:33%;" />

ICW1-ICW4初始化命令字,OCW1-OCW3工作命令字。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2016.26.33.png" alt="截屏2023-11-21 16.26.33" style="zoom:33%;" />

ICW1-4必须要按顺序写。

ICW1必须要写且写在偶地址，ICW2写在奇地址，如果没有级连的情况下ICW3(奇地址)不用写，ICW1可决定ICW4(奇地址)写或不写。  
如果只写ICW1、ICW2且在没有级连和不写ICW4的情况中，可直接跳到初始化完。

<u>**需要记的地方：ICW1-4、OCW1-OCW3，具体是做什么用。**</u>

#### 写初始化命令字ICW1—芯片控制字

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2016.36.09.png" alt="截屏2023-11-21 16.36.09" style="zoom:33%;" />

了解电平触发和边沿出发：

电平触发：从0变为1之后才会发生中断。

边沿触发：从0到1发生跳变的过程中发生中断。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2016.41.43.png" alt="截屏2023-11-21 16.41.43" style="zoom:33%;" />

A0与8086的不同，图中为8259A的A0，A0=0偶地址，A0=1奇地址。

ICW1的作用：

1. LTIM：触发方式的选择。
2. 0/1：服务程序间隔。
3. SNGL：需要级连与否。
4. IC4：ICW4的选择。

#### 写初始化命令字ICW2—中断类型控制字(中断类型码)(***)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2016.56.23.png" alt="截屏2023-11-21 16.56.23" style="zoom:33%;" />

中断类型码的高5位是用户决定的，只写高5位。例如：72H，01110；或者88H，10001

后三位是由中断源引脚序号决定，自动填写。例如：引脚序号为IR5/IR7，那IR5的中断就是72H；IR7：8FH  
IR0-000、IR1-001、IR2-010、IR3-011、IR4-100、IR5-101、IR6-110、IR7-111。

类型码：ICW2+IRn中的n

#### 了解级连

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2017.21.26.png" alt="截屏2023-11-21 17.21.26" style="zoom:33%;" />

级连：

当8259A的8个中断不够用时，可以从IR0-IR7中任意的某个去再接8259A。

但是8259A只支持一级级连，及从片不可再接8259A，只能接中断。

8259A的级连可扩展至64级，因为可以接8个从片，每个从片可管理8个接口，8x8。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2017.27.38.png" alt="截屏2023-11-21 17.27.38" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2017.29.43.png" alt="截屏2023-11-21 17.29.43" style="zoom:33%;" />

#### 写初始化指令字ICW3—主/从片初始化(级连控制字)

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2017.32.29.png" alt="截屏2023-11-21 17.32.29" style="zoom:33%;" />

主片的ICW3中，哪个接口有从片，哪个接口就为'1'。

从片的ICW3中，高5位为0，低三位是接了主片的哪一个IRn，三位加权就等于n。

#### 写初始化命令字ICW4—方式控制字

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2017.40.17.png" alt="截屏2023-11-21 17.40.17" style="zoom:33%;" />

ICW4的作用：

1. 嵌套方式选择
2. 缓冲方式选择
3. 主从片的判断
4. 结束方式选择

#### 操作命令字OCW1—屏蔽操作命令字

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2017.41.38.png" alt="截屏2023-11-21 17.41.38" style="zoom:33%;" />

用来设置或消除对中断的屏蔽(设置IMR的值)。

'1'为屏蔽，'0'为消除屏蔽。

#### 操作命令字OCW2—中断方式命令字

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2017.43.28.png" alt="截屏2023-11-21 17.43.28" style="zoom:33%;" />

设置优先级循环和中断结束方式(EOI)。

#### 操作命令字OCW3—状态操作命令字

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2017.45.24.png" alt="截屏2023-11-21 17.45.24" style="zoom:33%;" />

设置和撤销特殊屏蔽方式、设置中断查询方式、设置对8259A内部寄存器的读出命令。

#### --

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-21%2017.51.15.png" alt="截屏2023-11-21 17.51.15" style="zoom:33%;" />

真有出这种考题的人是什么心理？这种需要靠给出图才能去推出答案，如果真考了这分可以不要，无语:(