---
title: Linux搭建pikachu靶场
published: 2025-10-03
description: CentOS7中搭建pikachu靶场。
tags: [靶场,基础入门]
category: 网络安全
draft: false
---

# Linux搭建pikachu靶场（CentOS7）

---

pikachu是一个带有漏洞的Web应用系统，里面包含了几种常见的web安全漏洞可供小白实践操作。

## 环境准备

我们需要在CentOS7中准备搭建pikachu靶场所需的环境，这里使用LAMP web服务套件（Linux、Apache、Mysql、PHP）来搭建。

#### 安装apache

在CentOS7中需要切换到root用户来进行后续的下载安装

```shell
su root #切换为root，密码是自己创建虚拟机时设置的。
```

需要注意的是：**官方 CentOS 7 仓库已被移除**（2024-06-30 起停止维护），yum 找不到可用地址。所以在下载安装之前需要进行更换镜像源，具体操作如下：

```shell
# 备份旧配置
sudo mkdir -p /etc/yum.repos.d/backup
sudo mv /etc/yum.repos.d/CentOS-* /etc/yum.repos.d/backup/

# 写入阿里 CentOS 7 完整源
sudo tee /etc/yum.repos.d/CentOS-Base.repo <<'EOF'
[base]
name=CentOS-7 - Base - mirrors.aliyun.com
baseurl=http://mirrors.aliyun.com/centos/7/os/$basearch/
gpgcheck=1
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7

[updates]
name=CentOS-7 - Updates - mirrors.aliyun.com
baseurl=http://mirrors.aliyun.com/centos/7/updates/$basearch/
gpgcheck=1
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7

[extras]
name=CentOS-7 - Extras - mirrors.aliyun.com
baseurl=http://mirrors.aliyun.com/centos/7/extras/$basearch/
gpgcheck=1
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7
EOF
```

进行完上述步骤后，还需要清除缓存和重建，命令如下：

```shell
sudo yum clean all
sudo yum makecache
```

至此，可以正式进行对apache的安装。使用yum指令安装apache，服务名为“httpd”。

```shell
yum -y install httpd #安装Apache

#安装完毕后，启动apache服务并将其设置为自启动
systemctl start httpd.service #启动apache服务 
systemctl enable httpd.service #自启动

#查看运行状态
systemctl status httpd.service
```

#### 安装MariaDB数据库

```shell
yum -y install mariadb-server mariadb #安装数据库

#安装完毕后，启动MariaDB并将其设置为自启动
systemctl start mariadb #启动mariadb数据库 
systemctl enable mariadb.service #设置自启动
```

随后进入MariaDB中，创建搭建pikachu所需的数据库，MariaDB数据库的root密码默认为空，直接回车即可。

```shell
mysql -u root -p #进入MariaDB
creare database pikachu; #创建pikachu数据库
exit; #退出数据库
```

#### 安装PHP

pikachu靶场是基于PHP环境搭建的，所以我们需要安装它所需的php环境，安装完成后，重启Apache服务。

```shell
yum -y install php php-mysql #安装php
systemctl restart httpd.service #重启httpd
```

至此，lamp环境安装完毕，随后即可进行pikachu靶场的搭建。

## pikachu靶场搭建

首先进入到/var/www/html目录下，此目录用于存放网站文件，使用git命令下载pikachu源码。

```shell
cd /var/www/html #进入html目录
yum -y install git #下载git
git clone https://github.com/zhuifengshaonianhanlu/pikachu.git #下载pikachu源码
```

#### 配置pikachu靶场

使用vi或vim修改pikachu的配置文件/var/www/html/pikachu/inc/config.inc.php，将数据库信息修改成之前配置的MariaDB的信息

```shell
vim /var/www/html/pikachu/inc/config.inc.php #编辑pikachu配置文件
```

修改完成后，重启apache服务，关闭虚拟防火墙并设置不自启，使用ifconfig命令查看虚拟机的ip。

```shell
systemctl restart httpd.service #重启Apache

#查看当前防火墙名
systemctl list-units --type=service | grep -i fire
sudo systemctl stop firewalld #关闭防火墙
sudo systemctl disable firewalld#关闭防火墙自启动
ifconfig #查看IP
```


之后在浏览器输入：**虚拟机的ip/pikachu**就可以访问到搭建的pikachu靶场。

