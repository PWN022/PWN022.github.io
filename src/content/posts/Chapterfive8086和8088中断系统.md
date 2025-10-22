---
title: 8086与8088中断系统
published: 2023-11-18
description: 微机原理8086与8088中断系统知识点。
tags: [微机原理]
category: 大学课程
draft: false
---

# 微机原理

# 第五章

## 中断系统8086与8088

中断向量表：00000H-003FFH；每个类型码占用4B。

1K=2的10次方/2的平方=2的8次方=256个中断源。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2014.21.50.png" alt="截屏2023-11-18 14.21.50" style="zoom:33%;" />

中断分类有两类：

1. 硬件中断（外部中断）：CPU外部引入。  
   分为：非屏蔽中断(NMI)和可屏蔽中断(INTR)
2. 软件中断（内部中断）：CPU自申请，软件产生。  
   分为：除法出错中断、溢出中断、断点中断、单步中断(设置了TF之后)、INT n指令中断（了解几个即可）

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2014.26.18.png" alt="截屏2023-11-18 14.26.18" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2015.07.28.png" alt="截屏2023-11-18 15.07.28" style="zoom:33%;" />

非屏蔽中断：CPU的NMI引入，不受IF的影响，一般一个系统只允许有一个非屏蔽中断。（类型码为固定的）

可屏蔽中断：CPU的INTR引入，受IF影响，IF=1 响应，IF=0 被屏蔽。

软件中断—受指令或软件影响，与外部中断电路完全无关。

### 中断向量表

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2014.46.25.png" alt="截屏2023-11-18 14.46.25" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2014.44.27.png" alt="截屏2023-11-18 14.44.27" style="zoom:33%;" />

256个中断，每个中断源都有一个服务程序，服务程序的入口是由CS:IP构成的，CS和IP都是16位那么也就是32位共4个字节，246x4B=00000H-003FFH。

由这些组成一个空间，对应的，把中断服务程序的入口地址（每个占用4字节）放入空间。（存入时也要遵循高高低低原则，先存偏移地址的低8位，再存偏移地址的高8位，再存段地址的低8，再存段地址的高8）

假如当中断A执行之后，根据(排号)中断类型码，去空间(向量表)取到对应排号的地址之后就可以找到中断程序的位置，执行中断服务程序，返回。 

### 例题

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2015.09.20.png" alt="截屏2023-11-18 15.09.20" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2015.05.19.png" alt="截屏2023-11-18 15.05.19" style="zoom:33%;" />

![截屏2023-11-18 15.43.05](https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2015.43.05.png)

**中断类型码*4 = 中断向量表对应位置**（因为每个占4个字节)

**类型码=中断向量表地址/4**

## 内部中断—软中断

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2015.51.45.png" alt="截屏2023-11-18 15.51.45" style="zoom:33%;" />

除单步中断外，内部中断无法用软件禁止，不收IF的影响。（只有INTR受IF的影响）

图中为专用中断，假如除法出错那么系统就默认产生一个类型码为0的中断。

但是第五条的n是自己给出的，n为中断类型码。

**得到了类型码后的处理过程**

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2016.24.25.png" alt="截屏2023-11-18 16.24.25" style="zoom:33%;" />

中断入栈顺序(***)

栈是从高到低生成，其他的都是从低到高生成。

1. 类型码*4得到向量表指针。
2. FR入栈，保护现场。
3. IF=TF=0。
4. 保存断点。（断点处IP和CS压栈，先压CS后压IP）
5. 从中断向量表取出中断服务程序入口地址分别送入IP和CS中。
6. 按新的地址执行中断服务程序。

## 外部中断—硬中断

当一个可屏蔽中断被响应时，CPU实际执行了7个总线周期。

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2016.36.16.png" alt="截屏2023-11-18 16.36.16" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2016.42.47.png" alt="截屏2023-11-18 16.42.47" style="zoom:33%;" />

第一步：执行第一个INTA周期。（INTA是一个引脚）

第二步：执行第二个INTA周期。被响应的外设通过低8位提供中断类型码。（得到类型码、算出地址、暂存）

前两条为INTR特有的从外部获取中断类型码，从第三条开始以后是所有中断共有的。

栈实际上就是内存的单元。

第三步：把FR写入内存(保存)，把FR压栈之后把IF和TF清0。  

第四步：CS压栈。保护断点  

第五步：IP压栈。保护断点  

第六步：从中断向量表读中断服务程序的偏移地址送IP。  

第七步：从中断向量表读中断服务程序的段地址送CS。

## 各类中断的优先级及中断响应

<img src="https://cdn.jsdelivr.net/gh/PWN022/POFMC/my_screenshot/%E6%88%AA%E5%B1%8F2023-11-18%2016.50.30.png" alt="截屏2023-11-18 16.50.30" style="zoom:33%;" />

软中断(除单步)>硬中断>单步中断