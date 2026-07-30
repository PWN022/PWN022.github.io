---
title: 主机服务器&系统识别&IP资产&反查技术&端口扫描&协议探针&角色定性
published: 2026-01-26 12:00:00
description: 主要介绍了常见端口号以及攻击向量/测试方向、IP资产查询（归属地、云厂商、IP反查机构/域名、C段查询），最后就是信息收集，本篇主要是端口内容，比如端口资产以及扫描问题。
tags: [信息收集,端口扫描]
category: 网络安全
draft: false
---

# 知识点

1. 信息收集-服务器系统-操作系统&IP资产
2. 信息收集-服务器系统-端口扫描&服务定性

# 常见端口

**根据提供服务类型的不同，端口可分为以下两种：**

> TCP端口：TCP是一种面向连接的可靠的传输层通信协议
>
> UDP端口：UDP是一种无连接的不可靠的传输层协议

**TCP协议和UDP协议是独立的，因此各自的端口号也互相独立。**

> TCP：给目标主机发送信息之后，通过返回的应答确认信息是否到达
>
> UDP：给目标主机放信息之后，不会去确认信息是否到达

| 分类          | 端口号      | 服务                 | 协议    | 攻击向量 / 测试方向                             |
| ------------- | ----------- | -------------------- | ------- | ----------------------------------------------- |
| 基础协议      | 20/21       | FTP                  | TCP     | 明文嗅探；文件上传漏洞；默认账号                |
| 基础协议      | 22          | SSH                  | TCP     | 弱口令、私钥泄露；暴力破解；配置错误            |
| 基础协议      | 23          | Telnet               | TCP     | 明文传输；中间人攻击；默认/弱口令               |
| 基础协议      | 25          | SMTP                 | TCP     | 开放中继；垃圾邮件伪造；凭据嗅探                |
| 基础协议      | 53          | DNS                  | TCP/UDP | 缓存投毒；DNS 放大；未授权解析                  |
| 基础协议      | 80          | HTTP                 | TCP     | 明文流量；Web 漏洞（XSS/SQLi/CSRF）             |
| 基础协议      | 110         | POP3                 | TCP     | 明文认证；暴力破解；敏感邮件泄露                |
| 基础协议      | 143         | IMAP                 | TCP     | 明文传输；暴力破解；邮件内容泄露                |
| 基础协议      | 443         | HTTPS                | TCP     | SSL/TLS 弱算法；证书问题；中间人测试            |
| 基础协议      | 137/138/139 | NetBIOS              | TCP/UDP | 主机/共享信息泄露；暴力破解；嗅探               |
| 基础协议      | 445         | SMB                  | TCP     | 共享未授权；弱口令；远程代码执行（EternalBlue） |
| 基础协议      | 3389        | RDP                  | TCP     | 暴力破解；RCE（BlueKeep）；屏幕劫持             |
|               |             |                      |         |                                                 |
| 数据库        | 1433/1434   | MSSQL                | TCP/UDP | 默认/弱口令；SQL 注入；版本 RCE                 |
| 数据库        | 3306        | MySQL                | TCP     | 弱口令；配置泄露；SQL 注入                      |
| 数据库        | 5432        | PostgreSQL           | TCP     | 默认账号；SQL 注入；数据导出                    |
| 数据库        | 1521        | Oracle               | TCP     | 默认 SID；弱口令；TNS 攻击                      |
| 数据库        | 27017/27018 | MongoDB              | TCP     | 无密码默认；数据暴露；暴力破解                  |
| 数据库        | 6379        | Redis                | TCP     | 无认证；写 SSH 公钥；被劫持                     |
| 数据库        | 9200/9300   | Elasticsearch        | TCP     | 未授权访问；远程代码执行                        |
| 数据库        | 50000       | IBM Db2              | TCP     | 默认账号；SQL 注入；暴力破解                    |
|               |             |                      |         |                                                 |
| Web 中间件    | 7001/7002   | WebLogic             | TCP     | 反序列化；默认管理账号；信息泄露                |
| Web 中间件    | 8009        | AJP                  | TCP     | Ghostcat 路径遍历；文件包含                     |
| Web 中间件    | 8080        | Tomcat               | TCP     | 默认后台；弱口令；文件上传                      |
| Web 中间件    | 8161        | ActiveMQ             | TCP     | 默认账号；未授权；敏感信息                      |
| Web 中间件    | 8443        | HTTPS                | TCP     | 管理界面暴露；证书配置；Web 漏洞                |
| Web 中间件    | 15672       | RabbitMQ             | TCP     | 弱密码；未授权；管理功能滥用                    |
|               |             |                      |         |                                                 |
| 大数据/分布式 | 50070       | Hadoop NameNode      | TCP     | 未授权；目录遍历；数据泄露                      |
| 大数据/分布式 | 8088        | YARN ResourceManager | TCP     | 任务信息泄露；未授权访问                        |
| 大数据/分布式 | 9092        | Kafka                | TCP     | ACL 缺失；消息篡改；主题劫持                    |
| 大数据/分布式 | 2181        | ZooKeeper            | TCP     | 无认证；元数据泄露；节点操纵                    |
|               |             |                      |         |                                                 |
| 云/容器       | 2375/2376   | Docker API           | TCP     | 未加密；未授权；恶意容器注入                    |
| 云/容器       | 16509       | Libvirt              | TCP     | 未授权管理虚拟机；数据泄露                      |
| 云/容器       | 5900-5999   | VNC                  | TCP     | 默认/弱口令；未授权远程桌面                     |
|               |             |                      |         |                                                 |
| 工控/物联网   | 502         | Modbus               | TCP     | 未授权控制；数据篡改；完整性测试                |
| 工控/物联网   | 47808       | BACnet/UDP           | UDP     | 未授权访问；敏感数据泄露                        |
| 工控/物联网   | 1883        | MQTT                 | TCP     | 主题未授权；消息泄露；订阅/发布测试             |
|               |             |                      |         |                                                 |
| 邮件/版本控制 | 25          | SMTP                 | TCP     | 开放中继；伪造；未授权                          |
| 邮件/版本控制 | 110         | POP3                 | TCP     | 明文；暴力破解；未授权                          |
| 邮件/版本控制 | 143         | IMAP                 | TCP     | 明文；暴力破解；数据泄露                        |
| 邮件/版本控制 | 9418        | Git                  | TCP     | 裸仓库未授权；源码/密钥泄露                     |
|               |             |                      |         |                                                 |
| 其他          | 2049        | NFS                  | TCP/UDP | 未授权共享；敏感数据；目录遍历                  |
| 其他          | 111         | RPCBind              | TCP/UDP | RPC 漏洞；未授权；服务劫持                      |
| 其他          | 3389        | RDP                  | TCP     | 弱口令；RCE；屏幕监控                           |
| 其他          | 6667        | IRC                  | TCP     | 未授权；Botnet C&C；信息暴露                    |

## 信息收集-服务器系统-操作系统&IP资产

### 操作系统

1. Web大小写

   Windows

   ![image-20260126100458290](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126100458290.png)

   Linux

   ![image-20260126100652676](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126100652676.png)

2. 端口服务特征

   Windows：3389端口

   Linux：22端口

3. TTL值判断返回

   不同的操作系统，它的TTL值是不相同的。

   默认情况下：

   Linux系统的TTL值为64或255，

   Windows NT/2000/XP系统的TTL值为128，

   Windows 98系统的TTL值为32，

   UNIX主机的TTL值为255。

   但是TTL值是可以进行修改的，并不是非常准确。

   ![image-20260126101137137](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126101137137.png)

###  IP资产

#### 归属地查询

![image-20260126103422385](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126103422385.png)

#### 归属云厂商（阿里云、腾讯云、华为云等)

![image-20260126103552456](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126103552456.png)

#### IP反查机构

![image-20260126104852330](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126104852330.png)

#### IP反查域名

![image-20260126105048948](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126105048948.png)

![image-20260126105150151](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126105150151.png)

#### IP-C段查询

这里举例：

```
112.77.123.4 web服务器
112.77.123.5 数据库服务器
112.77.123.6 邮件系统服务器

112.77.123.1/24
112.77.123.1-254
目标较大经常买一整段的IP作为自己的服务器
```

fofa中提供了相关的语法，以及也可以利用查询ip的在线平台都会自带C段查询。

![image-20260126105452196](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126105452196.png)

这里可以转换成Web上，机构上，从而获取更多信息

## 信息收集-服务器系统-端口扫描&服务定性

### 端口资产

1. 网络资产引擎：直接使用网络测绘引擎（Fofa、Hunter、Quake、00信安等）搜索IP；此类网络资产测绘引擎都是每隔一段时间会对全网的网络资产去做一个轮询，那可能每个引擎的轮询周期、扫描精准度都不同，故建议可使用不同的搜索引擎以获取更多资产。

   地址导航：https://dh.aabyss.cn/

   参考：https://mp.weixin.qq.com/s/FRgPQKJDj2xRCduwPfZrTw

2. 在线端口扫描：百度或google直接搜索在线端口扫描就会有一些网站，同理很多功能都可以直接搜索在线xxx；例如在线正则提取解析、在线编码转换等。

3. 本地离线工具：推荐使用Nmap、Masscan、Fscan、KScan，其中Nmap最为准确，但最慢；Masscan最快，误报相对更高。

   端口扫描：https://xz.aliyun.com/t/15753

   演示：Yakit Nmap TscanPlus FScan Tanggo等

   考虑：1、防火墙 2、内网环境

   可能出现案例：数据库端口开放，但进行端口扫描，发现数据库端口没有开放（排除防火墙）*注意：扫描中选择扫描协议是绕过安全组防火墙设置的一种手法，具体成功需看出网入网配置

### 端口扫描问题

1. 扫描不到：防火墙、白名单或者入站策略导致通讯不上，扫描不到。

   **解决方法：换扫描协议，几率性绕过。（TCP、UDP、ICMP、SMB协议探针）**

   所以在实战中使用Nmap比较多，1、体积小 2、支持探测协议较多

   NMAP手册：https://blog.csdn.net/l1447320229/article/details/135850484

   ![image-20260126113034235](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260126113034235.png)

   ```cmd
   扫描技术：
   -sS/sT/sA/sW/sM:TCP SYN/Connect()/ACK/Window/Maimon扫描
   -sU:UDP扫描
   -sN/sF/sX: TCP Null,FIN 和 Xmas扫描
   -scanflags：自定义TCP扫描标志
   -sl <zombie host[:probeport]>：闲置扫描
   -sY/sZ:SCTP INIT/COOKIE-ECHO扫描
   -sO：IP 协议扫描
   -b：FTP 弹跳扫描
   端口规范和扫描顺序：
   p：只扫描指定的端口
   例如:-p22;-p1-65535;-p U:53,111,137,T:21-25,80,139,8080,S:9
   -exclude-ports：从扫描中排除指定的端口
   -F：快速模式-扫描比默认扫描更少的端口
   -r：按顺序扫描端口-不随机化
   -top-ports：扫描最常见的个端口
   -port-ratio：扫描比更常见的端口
   ```

2. 扫描错误：目标在内网环境，你看到的只是一个转发工具，扫到的实际是转发机器，和目标上面的端口不一致的。

   **解决方法：借助漏洞进行反链，比如ssrf，让对方自己探测自己的端口然后返回数据**

### 应用服务

[见上表中端口协议对应服务应用](#常见端口)

###  角色定性判定

1. 网站服务器
2. 数据库服务器
3. 邮件系统服务器
4. 文件存储服务器
5. 网络通信服务器
6. 安全系统服务器