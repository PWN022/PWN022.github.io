---
title: " Cloudflare域名接入"
published: 2026-09-16T20:30:00
description: 记录将域名接入 Cloudflare 的完整实操流程，包括添加域名、AI 爬虫策略设置、选择 Free 套餐、修改 NS、补齐 DNS 记录、开启 HTTPS 以及配置主域名重定向规则，适合个人笔记站参考。
tags:
  - 日常
category: 随笔
draft: false
---
# Cloudflare 域名接入笔记

> 目标：让域名走 Cloudflare 的 CDN、防护和 SSL。个人笔记站用免费版就够。  
> 核心流程：**添加域名 → AI 爬虫设置 → 选 Free → 修改 NS → 补 DNS → 开启 HTTPS → 设置重定向规则**。

## 准备

- Cloudflare 账号
    
- 已购买域名
    
- 能登录域名注册商后台

## 添加域名

1. 登录 `https://dash.cloudflare.com`
    
2. 点 **Add a domain**
    
3. 输入根域名，例如 `example.com`，**不要带 www**
    
4. **AI 爬虫设置**（在选 Free 套餐之前）

在 Cloudflare 的 AI 爬虫设置中：

|      选项      |           推荐设置           |         理由          |
| :----------: | :----------------------: | :-----------------: |
|  **Search**  |        **Allow**         |   让搜索引擎收录，带来自然流量    |
|  **Agent**   |      按需，无广告可 Allow       | AI 助手实时抓取，有机会引用你的内容 |
| **Training** | **Disallow AI Training** | 禁止原创内容被无偿用于训练 AI 模型 |

**Bot Preference Sync：建议开启**

它会把 Cloudflare 设置同步到 `robots.txt` 顶部，减少手动维护。

开启后访问 `你的域名/robots.txt`，确认规则块在顶部，自定义规则仍保留在下方。

5. 选 **Free** 套餐
    
6. 等它自动扫描现有 DNS 记录，先继续
    
7. 记下 Cloudflare 分配的两条 NS，例如：
    
    - `xxx.ns.cloudflare.com`
        
    - `xxxx.ns.cloudflare.com`

## 到注册商修改 NS

- 进域名注册商后台
    
- 找到 **Name Server / DNS 服务器**
    
- 删除原来的 NS
    
- 填入 Cloudflare 给的两条 NS
    
- 保存提交
    
- 回 Cloudflare 点 **Done, check nameservers**

等待生效：通常几分钟到 24 小时，个别可能 48 小时。

## 在 Cloudflare 补 DNS 记录（重点）

### 记录类型（Type）：这条记录是干什么的？

|    类型     |      作用       |        常见用途         |
| :-------: | :-----------: | :-----------------: |
|   **A**   | 指向一个 IPv4 地址  |      网站主域名、子域名      |
| **AAAA**  | 指向一个 IPv6 地址  |   服务器支持 IPv6 时使用    |
| **CNAME** | 指向另一个域名，相当于别名 | `www` 指向主域名，或平台托管域名 |
|  **MX**   |    邮件交换记录     |       域名邮箱收信        |
|  **TXT**  |    存放文本信息     | 域名验证、SPF、DKIM、DMARC |
|  **NS**   |    指定域名服务器    |  一般不用自己加，除非做子域名委派   |
|  **CAA**  | 限制哪些 CA 可签发证书 |       可选，安全加固       |

个人笔记站最常用：**A、CNAME、MX、TXT**。

### 名称（Name）：这条记录作用于哪个域名？

|   名称    |         代表          |           说明           |
| :-----: | :-----------------: | :--------------------: |
|   `@`   |        根域名本身        | 即 `example.com`，不带任何前缀 |
|  `www`  |  `www.example.com`  |     独立子域名，需要单独加记录      |
| `blog`  | `blog.example.com`  |         自定义子域名         |
|  `api`  |  `api.example.com`  |         自定义子域名         |
| `notes` | `notes.example.com` |         自定义子域名         |

要点：

- **`@` 代表裸域**，不是邮箱里的 `@`。
    
- **`@` 和 `www` 是两条独立记录**，不能只写一条。
    
- 在 Cloudflare DNS 页面，名称一般填**前缀**，不要填完整域名；填 `@` 就代表根域名。

### 个人笔记站推荐配置

#### 必填记录

|    类型     |  名称   |       内容 / 目标       |      代理状态       |            说明            |
| :-------: | :---: | :-----------------: | :-------------: | :----------------------: |
|   **A**   |  `@`  |      你的服务器 IP       | **Proxied**（橙云） |   让 `example.com` 能访问    |
| **CNAME** | `www` | `@` 或 `example.com` | **Proxied**（橙云） | 让 `www.example.com` 也能访问 |

#### 按需记录

|      类型       |        名称        |    内容 / 目标    |       代理状态       |          说明          |
| :-----------: | :--------------: | :-----------: | :--------------: | :------------------: |
|    **MX**     |       `@`        | 邮件服务商给的 MX 地址 | **DNS only**（灰云） |        域名邮箱收信        |
|    **TXT**    |  `@` 或 `_dmarc`  |   服务商给的验证值    |      无代理概念       | Google、GitHub、邮件安全验证 |
| **A / CNAME** | `notes`、`blog` 等 | 服务器 IP 或目标域名  | **Proxied**（橙云）  |       子域名按需添加        |

### 代理状态怎么选？

|      状态      | 图标  |           适用场景            |
| :----------: | :-: | :-----------------------: |
| **Proxied**  | 橙云  | 网站业务域名，如 `@`、`www`、`blog` |
| **DNS only** | 灰云  |    邮件相关、非 HTTP 服务、验证记录    |

**邮件相关一定要注意：**

- MX 记录、`mail`、`smtp`、`imap` 等子域名，应该用 **DNS only**。
    
- 如果错误开了橙云，邮件可能收发异常。

### 小提醒

- 改 NS 前，尽量先确认 Cloudflare 里 DNS 记录已补齐，避免解析中断。
    
- 如果源站 IP 可能变动，可以看托管平台是否支持用 CNAME 指向固定域名。
    
- 如果使用 Vercel、Netlify、Cloudflare Pages 等平台，按平台文档填 A / CNAME 记录即可。

## 开启 HTTPS 和安全项

在 **SSL/TLS** 中配置：

- **Overview → Full (strict)**  
    前提是源站有有效证书。源站暂时没证书可先用 **Full** 过渡，但不建议长期用 **Flexible**。
    
- **Edge Certificates**：
    
    - 开启 **Always Use HTTPS**
        
    - 开启 **Automatic HTTPS Rewrites**

## 设置重定向规则（统一主域名）

在 **Rules → Redirect Rules** 新建规则，把裸域统一跳到 `www`，避免 SEO 分散。

### 我的规则

|   字段   |               填写               |
| :----: | :----------------------------: |
|  匹配方式  |             通配符模式              |
| 请求 URL |    `https://example.com/*`     |
|   操作   |            301 重定向             |
| 目标 URL | `https://www.example.com/${1}` |

### 作用

- `*` 捕获路径部分，例如 `/notes/cloudflare`
    
- `${1}` 把捕获到的路径原样拼到新域名后面
    
- 最终跳转：  
    `https://example.com/notes/cloudflare` → `https://www.example.com/notes/cloudflare`

### 注意

- 目标 URL 必须带 `https://`，否则 Cloudflare 会报错。
    
- 目标里必须写 `www.`，否则会跳回裸域，造成无限重定向。
    
- 这条规则只匹配 `https://`。如果想让 `http://` 也直接跳到 `www`，可以再加一条：  
    `http://example.com/*` → `https://www.example.com/${1}`
    
- 更简单的做法：开启 **Always Use HTTPS**，先把 HTTP 升级到 HTTPS，再触发上面这条规则。