---
title: PHP应用&模板引用&Smarty&RCE安全
published: 2025-10-16
description: 框架模板组件分类以及PHP自写和引用模板的RCE安全/漏洞问题。
tags: [PHP,安全开发]
category: 网络安全
draft: false
---



# 安全开发-PHP应用&模板引用&Smarty渲染&MVC模型&数据联动&RCE安全

## 知识点

RCE安全：远程代码执行（Remote Code Execution）。

是一种攻击者通过构造恶意输入远程调用目标系统，无需用户交互即可执行任意代码的技术。其成因多与程序未正确过滤外部输入有关，可导致系统权限被获取、敏感数据泄露等严重后果。常见攻击类型包括注入攻击、反序列化攻击及越界写入。防御措施需结合输入验证、权限控制、系统更新等技术手段，华为安全产品（如HiSec解决方案、FireHunter沙箱、USG系列AI防火墙）可通过威胁检测、权限管理、流量控制等功能实现针对性防护。

## 新闻列表&模板引用&代码RCE安全

### 新闻案例1

#### 新闻列表：

1. 数据库创建新闻存储
2. 代码连接数据库读取
3. 页面进行自定义显示

#### 创建数据表

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/26-01.png)

在数据表中随便写入一些信息，以下是代码部分的展示：

config.php中的内容前几期没写，这期顺带也补上，里面的内容实际上就是对数据库的连接：

```php
<?php
$dbip='localhost';
$dbuser='php';
$dbpass='123456';
$dbname='phptest';
$con=mysqli_connect($dbip,$dbuser,$dbpass,$dbname);
?>
```

新闻页面的代码：

```php
<?php
include 'config.php';
 
$id=$_GET['id'] ?? '1';
$sql="select * from news where id = $id";
$data=mysqli_query($con,$sql);
while ($row=mysqli_fetch_row($data)) {
    echo "<title>" . $row['1'] . "</title><br>";
    echo $row['2'] . "<br>";
    echo $row['3'] . "<br>";
    echo "<img src='$row[4]' width='500' height='300'></img><br>";
}
```

### 新闻案例2

数据库字段改为：

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/26-02.png)

新增前端页面：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{page_title}</title>
    <style>
        /* 一些样式 */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        header {
            background-color: #4CAF50;
            color: white;
            text-align: center;
            padding: 20px;
        }
        nav {
            background-color: #f2f2f2;
            display: flex;
            justify-content: space-between;
            padding: 10px;
        }
        nav a {
            color: black;
            text-decoration: none;
            padding: 10px;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }
        nav a:hover {
            background-color: #4CAF50;
            color: white;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        p {
            font-size: 18px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        ul {
            margin-left: 20px;
            margin-bottom: 20px;
        }
        li {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
<header>
    <h1>{heading}</h1>
</header>
<nav>
    <a href="#">首页</a>
    <a href="#">新闻</a>
    <a href="#">留言</a>
    <a href="#">关于</a>
</nav>
<div class="container">
    <h1>{subheading}</h1>
    <p>{content}</p>
 
    <img src="{$item}" width="1000" height="3000"></img>

</div>
</body>
</html>
```

之后通过给html中添加一些变量，达到把数据库中的数据渲染到美化版的html页面中（简易框架）。

```php
<?php
include 'config.php';
// file_get_contents()，读取一个文件的内容并将其作为字符串返回。
$template = file_get_contents('new.html');
 
$id=$_GET['id'] ?? '1';
$sql="select * from news where id = $id";
$data=mysqli_query($con,$sql);
while ($row=mysqli_fetch_row($data)) {
    $page_title =  $row['1'];
    $heading =  $row['2'];
    $subheading =  $row['3'];
    $content =  $row['4'];
    $item = $row['5'];
}


$template=str_replace('{page_title}',$page_title,$template);
$template=str_replace('{heading}',$heading,$template);
$template=str_replace('{subheading}',$subheading,$template);
$template=str_replace('{content}',$content,$template);
$template=str_replace('{$item}',$item,$template);//str_replace:替换(search,替换为，替换对象（位置））
eval('?>'.$template);   //尝试确保$template字符串以PHP结束标签结束

?>
```

### 新闻案例总结

使用模板可以减少每个页面都写html，且在php中改就可以影响html从而决定页面。

对于MVC模型：（v——>video视图）

使用模板保证了：

1. 效率
2. 美观度

### Z-Blog模板

这里就不拿Z-blog举例了，没有下载该模板。所以还是按照新闻案例来进行相关操作。

#### 安全漏洞

1. 在数据库后台加上`<?php phpinfo();?>`(数据库中）

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/26-04.png" style="zoom:80%;" />

2. 在new.html代码中加入<?php phpinfo();>后

   使用new.php，会让new.php渲染new.html，会执行new.html中的php代码(所以当得到模板后加以修改，可以在后台执行）。

具体内容详细看：https://blog.csdn.net/m0_74930529/article/details/143375921

## Smarty 模版引用

下载： https://github.com/smarty-php/smarty/releases

使用：

1. 在phpstorm用文件夹创建一个文件夹，命名为smarty-demo(注意级别）。
2. 拉入demo项目。
3. 创建一个index.php，将代码复制进去。
4. 将目录与代码中对应上：
   - 新建一个index.tpl
   - 在里面写入html代码与index.php里的对应
5. 在第三方模板index.tpl写上`<?php phpinfo();?>`不会显示

### index.php

（目录位置要和代码对应上），我下载的是Smarty 5.x的版本，因此跟萧瑟迪v23版本的代码是不一样的。Smarty 5的类名是带命名空间的。

```php
<?php
require __DIR__ . '/libs/Smarty.class.php';

$smarty = new Smarty\Smarty(); //注意此处

$smarty->setTemplateDir(__DIR__ . '/templates/');
$smarty->setCompileDir(__DIR__ . '/templates_c/');
$smarty->setCacheDir(__DIR__ . '/cache/');
$smarty->setConfigDir(__DIR__ . '/configs/');

$smarty->assign('{$title}', '欢迎使用 Smarty');
$smarty->display('index.tpl');
?>
```

在smarty中创建templates：

在templates下创建index.tpl

在index.tpl中放入html代码。

```html
<!DOCTYPE html>
<html>
<head>
<title>{$title}</title>
</head>
<body>
<h1>{$title}</h1>
<p>这是一个使用Smarty的例子。</p>
</body>
</html>
```

当我们用这个tpl文件去解析html代码的时候，此时在代码中加入：

```php
<?php phpinfo()?>
```

发现不会显示php的一些信息，也就是没有执行这行代码。

### 安全漏洞

CVE-2021-29454:

smarty<=3.1.32

详细见：https://blog.csdn.net/m0_74930529/article/details/143375921

## 思路核心总结：

1. 自己写的模板 rce安全问题

2. 第三方smarty模板 没有直接安全问题

   但是也有漏洞：

   - 本身代码漏洞
   - 第三方插件（ueditor）
   - 第三方模板（smarty）
   - 第三方组件（shiro fastjson等）

## 框架模板组件分类

### php

1. 框架：thinkphp yii laravel

   核心开发 代码逻辑核心（代码逻辑）

2. 模板：smarty
   负责主要显示页面美观的

3. 组件：ZendGuardLoader php-imagick

   第三方组件功能（图片处理，数据转换，数据库操作等）

### java

框架：struts2 springboot ssm

模板：thymeleaf 等

组件：shiro fastjson

### 白盒

有源码的情况下，可以根据源码加载的模板和版本有没有安全问题。

### 黑盒

端口扫描、数据库包特征、识别插件工具等。