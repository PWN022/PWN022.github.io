---
title: PHP应用&TP框架&MVC模型&路由访问&模板渲染&安全写法&版本漏洞
published: 2026-02-11 12:00:00
description: ThinkPHP的使用（配置架构、路由访问、请求变量、数据库操作、前端页面渲染），以及根据tp版本漏洞来进行渗透操作。
tags: [Web开发,PHP]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-框架技术-ThinkPHP
2. 安全开发-框架安全-版本&写法
3. 安全开发-ThinkPHP-代码审计案例

## TP框架-开发技术

参考：https://www.kancloud.cn/manual/thinkphp5/118003

## 配置架构-导入使用

入口配置，数据库配置，调试开关等

入口配置：

![image-20260209111833291](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260209111833291.png)

数据库配置：

![image-20260209111929496](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260209111929496.png)

调试：

![image-20260209112024385](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260209112024385.png)

## 路由访问-URL访问

URL访问模式，文件目录对应关系等

没有启动路由的情况下URL访问规则：

```
http://servername/index.php(或者其他入口文件)/模块/控制器/方法（操作）/[参数名/参数值...]
```

兼容模式访问：

```
http://servername/index.php(或者其他入口文件)?s=模块/控制器/操作/[参数名/参数值...]
```

通过URL反推对应的文件，首先去public目录下的index.php发现入口文件是application目录，通过admin/index/login可以得到admin目录下的index.php文件里的login方法。

## 请求变量-数据接收

请求对象，提交方法，助手函数等

```php
public function RecData(){
        $request = Request::instance();
        echo 'domain：'.$request->domain().'<br>';
    }
```

```php
public function RecData1()
    {
        $num = Request::instance()->get('num');
        return $num;
    }

//另外一种
public function RecData1()
    {
        return input('get.id');
    }
```

![image-20260209204303390](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260209204303390.png)

## 数据库操作-应用对象

引用DB类，基本查询，助手函数等

```php
 'type'            => 'mysql',
    // 服务器地址
    'hostname'        => '127.0.0.1',
    // 数据库名
    'database'        => 'course',
    // 用户名
    'username'        => 'root',
    // 密码
    'password'        => '111111',
```

```php
<?php
namespace app\sql\controller;
use think\Db;


class Sql
{
    public function index()
    {
        echo "hello";
    }
    //application\sql\controller\Sql.php
    public function select(){
        $id = input("get.id");
        $result1 = Db::table('users')->where('id',$id)->find();
        $result2 = Db::table('users')->where('role','editor')->select();
        // 返回结果查看
        dump($result1);
        dump($result2);

//        return json(['result1' => $result1, 'result2' => $result2]);
    }
}

```

![image-20260211101205175](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211101205175.png)

## 前端页面渲染-MVC模型

引擎配置，渲染变量，模版输出等

![image-20260209210321773](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260209210321773.png)

![image-20260211102241619](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211102241619.png)

```php
public function show(){
        $this->assign('name','ThinkPHP');
        $this->assign('email','thinkphp@qq.com');

        return $this->fetch();
    }
```

### MVC流程

1. Controller截获用户发出的请求；
2. Controller调用Model完成状态的读写操作；
3. Controller把数据传递给View；
4. View渲染最终结果并呈献给用户。

### MVC各层职能

1. 控制器Controller层–负责响应用户请求、准备数据，及决定如何展示数据。
2. 模块Model层–管理业务逻辑和数据库逻辑。提供连接和操作数据库的抽象层（过滤一般都在这里）
3. 视图View层–负责前端模板渲染数据，通过HTML方式呈现给用户（一般都是html静态文件，也有少部分php）

## TP框架-写法安全

1. 自写代码逻辑

   例子1：自己不合规的代码写法

   ```php
   public function tests1(){
           $con = mysqli_connect("localhost","root","111111","phpdemo","3306");
           $id = $_GET['id'];
           $sql = "select * from users where id=$id";
           $data = mysqli_query($con,$sql);
           if(mysqli_num_rows($data) > 0){
               $row = mysqli_fetch_assoc($data);
               echo 'username：' .$row['username'].'<br>';
               echo 'password：' .$row['password'];
           }else{
               echo '<script>alert("error!")</script>';
           }
       }
   ```

   union联合注入，根据当前数据库字段列数。

   ![image-20260211103622311](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211103622311.png)

   例子2：一半框架一半自写代码

   ```php
   public function tests2(){
           $id = request()->param('id');
           $data = Db::query("select * from users where id=$id");
           var_dump($data);
       }
   ```

   ![image-20260211104054024](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211104054024.png)

   例子3：框架标准内置代码写法

   ```php
   public function tests3(){
           $id = request()->param('id');
           $data = Db::table('users')->where('id',$id)->find();
       	var_dump($data);
       }
   ```

2. 框架版本安全

   https://github.com/Mochazz/ThinkPHP-Vuln

### 写法内置安全绕过-TP5-SQL注入

前提：获取目标tp源码

查询版本代码漏洞，或者利用工具来检测。

```php
//官方写法
public function tests4(){
        $username = request()->param('username');
        db('users')->insert(['username' => $username]);
        return 'update success';
    }
```

![image-20260211111230283](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211111230283.png)

报错注入：

![image-20260211111251446](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211111251446.png)

### 内置版本安全漏洞-TP5-代码执行

查询版本代码执行漏洞，或者利用工具来检测。

## TP框架-代审案例

### WeMall-TP5框架开发

拿到源码直接看目标的tp版本，再根据版本看有没有代码执行漏洞。

安装项目时，可能会出现404的报错，这时候需要配置伪静态。

![image-20260211112533467](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211112533467.png)

![image-20260211112546419](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260211112546419.png)

直接工具检测漏洞。

目前只能当脚本小子。
