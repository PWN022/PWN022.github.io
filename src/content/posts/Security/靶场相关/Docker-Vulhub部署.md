---
title: Docker-Vulhub部署
published: 2026-07-05T23:00:00
description: docker的安装以及靶场vulhub的部署过程
tags:
  - 靶场
category: 网络安全
draft: false
---

# Docker + Vulhub

## 项目地址

官网：[https://vulhub.org](https://vulhub.org/)

GitHub：[https://github.com/vulhub/vulhub](https://github.com/vulhub/vulhub)

操作系统：Ubuntu 16.04

参考文章：https://shining.blog.csdn.net/article/details/162406511?spm=1001.2014.3001.5502

## 部署过程

更新软件包列表与依赖安装

- **`apt-get`**: Ubuntu系统的**软件包管理工具**，用来安装、更新、卸载软件。
    
- **`update`**: **更新软件包列表**。这条命令会从Ubuntu软件源服务器拉取最新的软件信息（比如有哪些版本、依赖关系），**但并不实际安装或升级任何软件**。这是一个必须的习惯，确保后续安装的软件是最新的可用版本。

```bash
sudo apt update
```

### 安装docker以及docker-compose

阿里云镜像加速器：https://cr.console.aliyun.com/cn-shanghai/instances/mirrors

```bash
# `-y` 表示自动确认，不用手动输入 yes
sudo apt install -y docker.io
# 立即启动 Docker 服务，让它在后台运行
sudo systemctl start docker
# 设置 Docker 开机自启，这样每次重启服务器后 Docker 会自动运行
sudo systemctl enable docker

# 配置docker镜像加速器
sudo mkdir -p /etc/docker

sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://您的id.mirror.aliyuncs.com"]
}
EOF
# 重启
sudo systemctl restart docker
# 安装docker-compose
sudo apt install -y docker-compose
# 验证
sudo docker run hello-world
```

将当前用户加入docker组

```bash
sudo usermod -aG docker $(whoami)
```

安装git

```bash
sudo apt install -y git
```

克隆vulhub，如果提示协议问题，请参考以下解决方式：

```bash
# 克隆仓库
# `--depth 1` = 只下载最新版本，不下载历史提交记录。
git clone --depth 1 https://github.com/vulhub/vulhub.git

# 进入目录
cd vulhub
```

### 协议问题看这里

```bash
# 更新 Git 和网络证书
sudo apt update
sudo apt install --only-upgrade git ca-certificates openssl

# 设置 Git 使用 TLS 1.2（GitHub 要求）
git config --global http.sslVersion tlsv1.2

# 重新克隆
git clone --depth 1 https://github.com/vulhub/vulhub.git ~/桌面/Vulhub
```

### 启动容器

部署完成，演示一下从启动经典漏洞环境`Tomcat CVE-2017-12615`到关闭的全过程

```bash
cd tomcat/CVE-2017-12615/
ls -la

total 44
drwxr-xr-x 2 root docker  4096 Jul  5 22:57 .
drwxr-xr-x 7 root docker  4096 Jul  5 22:57 ..
-rw-r--r-- 1 root docker 17268 Jul  5 22:57 01.png
-rw-r--r-- 1 root docker    71 Jul  5 22:57 docker-compose.yml
-rw-r--r-- 1 root docker   335 Jul  5 22:57 Dockerfile
-rw-r--r-- 1 root docker  1917 Jul  5 22:57 README.md
-rw-r--r-- 1 root docker  1725 Jul  5 22:57 README.zh-cn.md

```

```bash
cat docker-compose.yml 

version: '2'
services:
 tomcat:
   build: .
   ports:
    - "8080:8080"
```

> - version: '2' = Compose 文件格式版本
> - services: = 定义服务列表
> - tomcat: = 服务名称
> - build: . = 从当前目录的 Dockerfile 构建镜像（而不是从仓库拉取）
> - ports: "8080:8080" = 端口映射，把容器的 8080 端口映射到系统的 8080 端口。左边是你的系统端口，右边是容器端口

```bash
# 启动
sudo docker-compose up -d

# 验证
sudo docker ps
CONTAINER ID   IMAGE                 COMMAND             CREATED          STATUS          PORTS                                       NAMES
b27dc11fc521   cve201712615_tomcat   "catalina.sh run"   54 seconds ago   Up 53 seconds   0.0.0.0:8080->8080/tcp, :::8080->8080/tcp   cve201712615_tomcat_1
```

各列解释：

> - CONTAINER ID = 容器唯一 ID（缩写）
> - IMAGE = 使用的镜像名
> - COMMAND = 容器启动时执行的命令
> - CREATED = 容器创建时间
> - STATUS = 运行状态，Up 表示正在运行
> - PORTS = 端口映射，0.0.0.0:8080->8080/tcp 表示 Kali 的 8080 端口（所有网卡）转发到容器的 8080 端口
> - NAMES = 容器名称

验证服务可访问

```bash
curl -I http://localhost:8080/

HTTP/1.1 200 
Content-Type: text/html;charset=UTF-8
Transfer-Encoding: chunked
Date: Sun, 05 Jul 2026 15:12:02 GMT
```

> - `curl` = 命令行 HTTP 客户端
> - `-I` = 只获取 HTTP 响应头（不下载页面内容）
> - `http://localhost:8080/` = Kali 本机的 8080 端口

查看容器日志

```bash
sudo docker logs cve201712615_tomcat_1
```

公网ip:8080端口进行访问，出现tomcat界面即完成

### 关闭容器

停止并删除容器

```bash
sudo docker-compose down
```

> - `docker compose down` = 停止容器 + 删除容器 + 删除创建的网络。比 `docker stop` 清理得更彻底

验证容器已删除

```bash
sudo docker ps
```

查看所有容器（包括已停止的）

```bash
sudo docker ps -a
```

彻底清理磁盘空间（可选）

```bash
sudo docker system prune -a
```

> - `docker system prune` = 清理未使用的 Docker 资源
> - `-a` = 包括未使用的镜像（不仅仅是悬空镜像）

总的来说进入靶场就是：

```bash
cd cve-xxx-xxxxx

sudo docker-compose up -d
```

而且，不同漏洞环境用不同端口，可以同时启动：

```bash
# 启动 Tomcat（8080）
cd ~/桌面/vulhub/tomcat/CVE-2017-12615 && sudo docker compose up -d

# 启动 Weblogic（7001）
cd ~/桌面/vulhub/weblogic/CVE-2017-10271 && sudo docker compose up -d

# 启动 Spring（8080 端口冲突！需要先改 docker-compose.yml）
cd ~/桌面/vulhub/spring/CVE-2022-22947
# 编辑 docker-compose.yml，把 8080:8080 改成 8081:8080
sudo docker compose up -d
```