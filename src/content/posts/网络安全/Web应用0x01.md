---
title: Web应用&架构类别&源码类别&镜像容器&建站模版&编译封装&前后端分离
published: 2026-01-18 11:30
description: 搭建架构：使用模板型、前后端分离、集成软件包、自主环境搭建、镜像拉取等，主要对着这些类型进行识别然后寻找功能性代码存放在哪个目录。源码类别：主要了解源码差异，比如有没有使用MVC模型、是不是需要反编译、以及需不需要解密才能看到源代码，方便后期代码审计。
tags: [基础入门,Web应用]
category: 网络安全
draft: false
---

# 知识点

1. [基础入门-Web应用-搭建架构上的技术要点](#搭建架构技术要点)
2. [基础入门-Web应用-源码类别上的技术要点](#源码类别技术要点)

## 搭建架构技术要点

### Web架构展示

采用不同类型或者不同环境去搭建网站，就会受到本身应用的控制，比如宝塔是有做防护措施，但是phpstudy或者自主镜像搭建（部分）都没有做安全防护。

1. 套用模版型

   csdn / cnblog / github / 建站系统等。主要使用提供服务方的配置，比如源码、域名等进行搭建（中小型企业常用）。

   **安全测试思路上的不同：**

   一般以模版套用，基本模版无漏洞，大部分都采用测试用户管理权限为主。

2. 前后端分离

   以前的开发都是数据处理和可视化放到一起，**现在的开发基本都是前后端分离，一部分只做数据显示，一部分只做数据处理。**

   例子：https://www.rxthink.cn/

   **思路：**https://mp.weixin.qq.com/s/HtLU_EBXWcbq-lt10oPYwA

   **安全测试思路上的不同：**

   前端以JS（Vue,NodeJS等）安全问题，主要以API接口测试，前端漏洞（如XSS）为主，后端隐蔽难度加大。

3. 集成软件包

   宝塔（内置保护措施）、phpstudy、xamp等。

   **安全测试思路上的不同：**

   主要是防护体系，权限差异为主。

4. 自主环境镜像

   云镜像打包，自行一个个搭建。

   **安全测试思路上的不同：**

   主要是防护体系，权限差异为主。

5. 容器拉取镜像

   Docker。

   **安全测试思路上的不同：**

   虚拟化技术，在后期测试要进程逃逸提权。

6. 纯静态页面

   纯HTML+CSS+JS的设计。

   **安全测试思路上的不同：**无后期讲到的Web漏洞。

   **找线索：**找资产，域名，客户端等。

#### 演示案例0

在虚拟机搭建或者购买临时云服务器，分别用宝塔、云服务器提供的镜像、以及docker拉取的镜像进行演示。

分别进行**webshell后门上传**，之后对这三个类型搭建的网站进行权限检查会发现：

1. 宝塔搭建

   后门的权限：

   命令执行不行，文件管理除web目录能看，其他的都禁止访问。

   **继续(技术要点)：绕过宝塔限制。**

2. 自主环境镜像

   命令执行可以，文件管理除基本都能看，除去一些高权限目录（root目录等）。

   **继续(技术要点)：提权横向。**

3. 容器拉取镜像

   内置的虚拟化技术，单独搞了一个磁盘空间在给这个应用做支撑。

   **继续(技术要点)：逃逸提权技术。**

## 源码类别技术要点

### Web源码形式

旨在了解源码差异，后期代码审计和测试中对源码真实性的判断。

1. 单纯简易源码

2. MVC框架源码

3. 编译调用源码

   如：NET-DLL封装，Javba-Jar打包。

4. 前后端分离源码

#### 演示案例1

1. 单纯简易源码

   访问路径：xxx.com/admin/

   <img src="https://gitee.com/silaswin/typora_img/raw/master/img/image-20260118104009387.png" alt="image-20260118104009387" style="zoom:80%;" />

2. MVC框架源码

   了解url对应文件，文件对应url。

   知道漏洞该怎么触发测试。

   因为架构问题，举例tp5，一般控制器和视图都是在application下的某个模块中，比如application\admin\controller。

   访问路径：

   错误：xxx.com/application/admin/controller

   正确(一般路由设计)：xxx.com/index.php/admins

   <img src="https://gitee.com/silaswin/typora_img/raw/master/img/image-20260118104301559.png" alt="image-20260118104301559" style="zoom:80%;" />

3. 编译调用源码

   dll、Jar反编译。

   ##### .net反编译

   反编译工具为ILSpy。

   <img src="https://gitee.com/silaswin/typora_img/raw/master/img/image-20260118104829339.png" alt="image-20260118104829339" style="zoom:80%;" />

   ![image-20260118105505590](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260118105505590.png)

   <img src="https://gitee.com/silaswin/typora_img/raw/master/img/image-20260118105557601.png" alt="image-20260118105557601" style="zoom:80%;" />

   <img src="https://gitee.com/silaswin/typora_img/raw/master/img/image-20260118105632150.png" alt="image-20260118105632150" style="zoom:80%;" />

   ##### Jar反编译

   直接启动jar包就可以让网站运行起来。

   ```shell
   java -jar xxxx.jar
   ```

   使用jadx-gui，也就是反编译工具就能看到核心源代码。

   ![image-20260118110135255](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260118110135255.png)

4. 加密型源码

   各种厂商，比如通达OA、致远OA等等，图中使用的是Zend加密，可以在网上搜索一些解密的在线工具，也可以利用OA漏洞检测工具。

   ![image-20260118110719178](https://gitee.com/silaswin/typora_img/raw/master/img/image-20260118110719178.png)

5. 前后端分离源码

   比如我自己项目是SpringBoot+vue。

   前端：nodejs、vue等（js开发框架）。

   后端：php、java、python等。

   <img src="https://gitee.com/silaswin/typora_img/raw/master/img/image-20260118111211862.png" alt="image-20260118111211862" style="zoom:80%;" />