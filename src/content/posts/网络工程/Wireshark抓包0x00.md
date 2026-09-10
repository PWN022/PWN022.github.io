---
title: TCP 抓包：握手与挥手
published: 2026-09-10T19:50:00
description: 分析一次HTTPS连接的TCP三次握手、TLS数据及关闭阶段的FIN与RST异常，并整理显示过滤器、常用字段与易混点。
tags:
  - HTTP/HTTPS
  - TCP
category: 网络安全
draft: false
---

# TCP 三次握手、TLS 数据、四次挥手（含 RST 异常）

> 仅整理本次 `Stream index: 50` 的抓包内容。  
> IP / MAC 已脱敏，用 `<客户端IP>`、`<服务端IP>` 表示。

---

## 1. 本次抓包基本信息

|   项目    |                    内容                     |
| :-----: | :---------------------------------------: |
|   协议    |               TCP + TLSv1.2               |
|   目标    |               HTTPS，端口 443                |
|   客户端   |              `<客户端IP>:52594`              |
|   服务端   |               `<服务端IP>:443`               |
| TCP 流索引 |            `Stream index: 50`             |
|  会话完整度  |        `Complete, WITH_DATA (63)`         |
|   说明    | TCP 流被 Wireshark 认为抓完整，但关闭阶段出现 RST，不是优雅关闭 |

---

## 2. 整体时序图

```
客户端                                服务端
  |──── SYN, Seq=0 ─────────────────→|  Frame 592
  |←─── SYN,ACK, Seq=0, Ack=1 ───────|  Frame 596
  |──── ACK, Seq=1, Ack=1 ──────────→|  Frame 598
  |          ... TLS 握手 / 数据 ...   |
  |←─── FIN,ACK, Seq=181438, Ack=8336 ─| Frame 37251
  |──── ACK, Seq=8336, Ack=181439 ───→| Frame 37252
  |──── PSH,ACK, Seq=8336, Ack=181439, Len=31 ─→| Frame 37253  TLS 数据
  |──── FIN,ACK, Seq=8367, Ack=181439 ─→| Frame 37254
  |←─── RST,ACK ─────────────────────| 最后 RST（帧号未记录）
```

结论：

- **三次握手完整**：`SYN → SYN,ACK → ACK`。
    
- **TLS 数据包夹在挥手中**，正常。
    
- **四次挥手未完成**：最后一步不是 `ACK`，而是 `RST,ACK`，属于异常关闭。

---

## 3. 三次握手

| 帧号  | 流内序号 |    方向     |     标志     | Seq | Ack | Len |     Win      |     说明      |
| :-: | :--: | :-------: | :--------: | :-: | :-: | :-: | :----------: | :---------: |
| 592 |  1   | 客户端 → 服务端 |   `SYN`    |  0  |  无  |  0  |    65535     |   客户端请求建连   |
| 596 |  2   | 服务端 → 客户端 | `SYN, ACK` |  0  |  1  |  0  |     8192     | 服务端同意，并反向建连 |
| 598 |  3   | 客户端 → 服务端 |   `ACK`    |  1  |  1  |  0  | 255，实际 65280 |   确认，连接建立   |

关键点：

- 双方初始序列号相对为 `0`。
    
- `SYN` 占 1 个序列号，所以服务端回 `Ack=1`。
    
- 客户端最后回 `Ack=1`，确认服务端 SYN。
    
- 三次握手完成后进入 `ESTABLISHED`。

---

## 4. TLS 数据包

|  帧号   | 流内序号 |    方向     |     标志     | Seq  |  Ack   | Len |                说明                |
| :---: | :--: | :-------: | :--------: | :--: | :----: | :-: | :------------------------------: |
| 37253 | 178  | 客户端 → 服务端 | `PSH, ACK` | 8336 | 181439 | 31  | TLS 数据，可能是加密应用数据或 `close_notify` |

说明：

- 它出现在服务端 `FIN,ACK`、客户端 `ACK` 之后。
    
- TCP 全双工，服务端发 `FIN` 只表示“服务端 → 客户端”方向不再发数据。
    
- 客户端仍可继续发送数据，例如 TLS 关闭通知。
    
- `Len=31`，所以下一个序列号从 `8336` 变成 `8367`。
    
- 未导入 TLS 密钥时，Wireshark 只能看到 TLS 记录，看不到明文。

---

## 5. 关闭阶段（挥手未完成，被 RST 中断）

|  帧号   | 流内序号 |    方向     |     标志     |  Seq   |  Ack   | Len |      说明      |
| :---: | :--: | :-------: | :--------: | :----: | :----: | :-: | :----------: |
| 37251 | 176  | 服务端 → 客户端 | `FIN, ACK` | 181438 |  8336  |  0  |   服务端请求关闭    |
| 37252 | 177  | 客户端 → 服务端 |   `ACK`    |  8336  | 181439 |  0  | 客户端确认服务端 FIN |
| 37253 | 178  | 客户端 → 服务端 | `PSH, ACK` |  8336  | 181439 | 31  | TLS 数据，夹在挥手中 |
| 37254 | 179  | 客户端 → 服务端 | `FIN, ACK` |  8367  | 181439 |  0  |   客户端请求关闭    |
|  未记录  |  —   | 服务端 → 客户端 | `RST, ACK` |   —    |   —    |  0  | 强制重置，连接异常终止  |

正常四次挥手应该是：

```
FIN,ACK -> ACK -> FIN,ACK -> ACK
```

本次实际为：

```
FIN,ACK -> ACK -> PSH,ACK(TLS) -> FIN,ACK -> RST,ACK
```

所以：

- 前四步看起来像挥手过程。
    
- 最后一步被 `RST,ACK` 替代，**不是标准四次挥手**。
    
- 连接被强制重置，属于异常关闭。

---

## 6. 为什么会出现 RST？

核心原因：**服务端 socket 已经关闭，却还收到客户端的数据或 FIN，内核只能回 RST。**

常见情况：

|        原因        |             说明              |
| :--------------: | :-------------------------: |
| 服务端应用层已关闭 socket | 服务端先发 FIN，之后收到客户端数据，内核回 RST |
|    收到已关闭连接的数据    | 服务端已 FIN，客户端还发 31 字节 TLS 数据 |
|    接收缓冲区有未读数据    |    应用层 close() 时还有数据没读完     |
|  SO_LINGER 设为 0  |    应用层强制 close()，直接发 RST    |
|    进程退出 / 崩溃     |       socket 被内核强制关闭        |
|   CDN / 负载均衡策略   |     CDN 节点主动 RST，不等完整挥手     |
|     TLS 层错误      |        加密层异常，直接 RST         |

本次很可能属于前两种：服务端先 FIN，客户端还有 TLS 数据要发，服务端无法处理，回 RST。

---

## 7. 关键字段解释

|              字段              |        含义         |
| :--------------------------: | :---------------: |
|            `Seq`             |  序列号，本报文第一个字节的编号  |
|            `Ack`             | 确认号，期望对方下次发送的序列号  |
|            `Len`             | TCP 载荷长度，0 表示纯控制包 |
|            `SYN`             |  请求建立连接，占 1 个序列号  |
|            `FIN`             | 我没有数据要发了，占 1 个序列号 |
|            `ACK`             |       确认号有效       |
|            `PSH`             |    尽快把数据交给应用层     |
|            `RST`             |    强制重置连接，异常关闭    |
|            `Win`             |      接收窗口原始值      |
| `Window size scaling factor` |      窗口缩放因子       |
|             实际窗口             |   `Win × 2^WS`    |
|            `MSS`             |   最大段大小，双方取较小值    |
|         `SACK_PERM`          |      支持选择性确认      |

本次窗口计算示例：

- `Win=255`，`WS=256`，实际窗口 = `255 × 256 = 65280`
    
- `Win=1552`，`WS=32`，实际窗口 = `1552 × 32 = 49664`
    
- `Win=1023`，`WS=256`，实际窗口 = `1023 × 256 = 261888`

---

## 8. 显示过滤器常用写法

### 8.1 按 TCP 流筛选

```
tcp.stream eq 50
```

含义：只显示第 50 条 TCP 流的所有包。  

`eq` 就是“等于”，也可以写 `==`。

### 8.2 找三次握手

```
tcp.stream eq 50 && tcp.flags.syn == 1
```

含义：第 50 条流里，所有 SYN 置位的包。

`&&` 表示“并且”，也可以写 `and`。

### 8.3 找四次挥手

```
tcp.stream eq 50 && tcp.flags.fin == 1
```

含义：第 50 条流里，所有 FIN 置位的包。

### 8.4 找异常重置

```
tcp.stream eq 50 && tcp.flags.reset == 1
```

含义：第 50 条流里，所有 RST 包。

### 8.5 按帧号范围筛选

```
tcp.stream eq 50 && frame.number >= 37251 && frame.number <= 37256
```

含义：第 50 条流里，帧号在 37251 到 37256 之间的包。

### 8.6 按 IP 筛选

IPv4：

```
ip.addr == <服务端IP>
```

IPv6：

```
ipv6.addr == <服务端IPv6>
```

同时匹配两个 IP：

```
ip.addr == <服务端IP1> || ip.addr == <服务端IP2>
```

`||` 表示“或者”，也可以写 `or`。

### 8.7 按端口筛选

```
tcp.port == 443
```

含义：源端口或目的端口是 443。

只匹配目的端口：

```
tcp.dstport == 443
```

只匹配源端口：

```
tcp.srcport == 52594
```

### 8.8 按 TLS SNI 筛选

```
tls.handshake.extensions_server_name contains "example.com"
```

含义：TLS Client Hello 里 SNI 包含 `example.com` 的包。  

常用于找某条 HTTPS 流。

### 8.9 按 TCP 标志组合筛选

只有 SYN，没有 ACK：

```
tcp.flags.syn == 1 && tcp.flags.ack == 0
```

FIN 或 RST：

```
tcp.flags.fin == 1 || tcp.flags.reset == 1
```

---

## 9. 常用运算符

|   显示过滤器写法    |  含义   |
| :----------: | :---: |
| `eq` 或 `==`  |  等于   |
| `ne` 或 `!=`  |  不等于  |
|  `gt` 或 `>`  |  大于   |
|  `lt` 或 `<`  |  小于   |
| `ge` 或 `>=`  | 大于等于  |
| `le` 或 `<=`  | 小于等于  |
| `and` 或 `&&` |  并且   |
| `or` 或 `\|`  |  或者   |
| `not` 或 `!`  |   非   |
|  `contains`  | 包含字符串 |
|  `matches`   | 正则匹配  |

示例：

```
tcp.stream eq 50
tcp.stream == 50
```

```
tcp.stream eq 50 && tcp.flags.syn == 1
tcp.stream eq 50 and tcp.flags.syn == 1
```

```
tcp.flags.fin == 1 || tcp.flags.reset == 1
```

```
tls.handshake.extensions_server_name contains "example.com"
```

---

## 10. 常用字段

|                   字段                   |    含义    |
| :------------------------------------: | :------: |
|              `tcp.stream`              | TCP 流编号  |
|             `frame.number`             |    帧号    |
|              `frame.time`              |    时间    |
|               `ip.addr`                | IPv4 地址  |
|              `ipv6.addr`               | IPv6 地址  |
|               `tcp.port`               |  TCP 端口  |
|             `tcp.srcport`              | TCP 源端口  |
|             `tcp.dstport`              | TCP 目的端口 |
|            `tcp.flags.syn`             |  SYN 标志  |
|            `tcp.flags.ack`             |  ACK 标志  |
|            `tcp.flags.fin`             |  FIN 标志  |
|           `tcp.flags.reset`            |  RST 标志  |
|               `tcp.len`                | TCP 载荷长度 |
|               `tcp.seq`                |   序列号    |
|               `tcp.ack`                |   确认号    |
| `tls.handshake.extensions_server_name` | TLS SNI  |

示例：

```
tcp.stream eq 50
frame.number >= 37251 && frame.number <= 37256
ip.addr == <服务端IP>
ipv6.addr == <服务端IPv6>
tcp.port == 443
tcp.dstport == 443
tcp.srcport == 52594
tcp.flags.syn == 1 && tcp.flags.ack == 0
tcp.flags.fin == 1 || tcp.flags.reset == 1
tls.handshake.extensions_server_name contains "example.com"
```

---

## 11. 易混点

1. **Stream index 不是帧号**  
    `Stream index: 50` 表示第 50 条 TCP 流，帧号是 `592`、`37251` 这种。
    
2. **三次握手 ≠ TLS 握手**
    
    - TCP 三次握手：`SYN → SYN,ACK → ACK`
        
    - TLS 握手：`Client Hello → Server Hello → Certificate ...`  
        `Client Hello` 出现在 TCP 三次握手之后。
        
3. **PSH, ACK 不是挥手**  
    它通常是数据包，只是带了 `PSH` 和 `ACK`。
    
4. **FIN 和 RST 不同**
    
    - `FIN`：正常关闭的一部分。
        
    - `RST`：强制重置，异常关闭。
        
5. **相对序列号**  
    Wireshark 默认把每个方向第一个 SYN 显示为 `0`。  
    关闭相对序列号后，才能看到真实随机初始序列号。
    
6. **窗口要乘缩放因子**  
    不能只看 `Win` 原始值，要看 `Calculated window size`。

---

## 12. 本次抓包结论

- 三次握手完整：`SYN → SYN,ACK → ACK`。
    
- 中间有 TLS 数据，属于正常 HTTPS 通信。
    
- 关闭阶段前半段像四次挥手：`FIN,ACK → ACK → PSH,ACK(TLS) → FIN,ACK`。
    
- 最后一步被 `RST,ACK` 替代，**不是标准四次挥手**，属于异常关闭。
    
- 出现 RST 的原因很可能是服务端 socket 已关闭，却还收到客户端数据或 FIN。
    
- 想抓标准四次挥手，建议用 `curl`，并多等几秒再停止抓包。
    
- 公开贴图前记得把真实 IP、MAC、Cookie、Token 打码。

---

## 13. 附：标准四次挥手参考

```
① 主动关闭方 → 对方：FIN, ACK
② 对方 → 主动关闭方：ACK
③ 对方 → 主动关闭方：FIN, ACK
④ 主动关闭方 → 对方：ACK
```

Wireshark 过滤器：

```
tcp.stream eq N && tcp.flags.fin == 1
```

正常应看到两个 `FIN`，中间是 `ACK`，没有 `RST`。