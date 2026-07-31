# !W0ND3R 博客维护指南

## 文件结构速览

```
iw_blog/
├── astro.config.mjs            ← Astro 配置 + rehype 插件
├── src/
│   ├── consts.ts               ← 站点配置（标题/域名/导航/社交链接）
│   ├── content/
│   │   ├── config.ts           ← 文章 frontmatter schema
│   │   └── posts/              ← 文章 .md 放这里，支持嵌套目录
│   ├── data/
│   │   └── albums.ts           ← 专辑数据（手动维护）
│   ├── pages/
│   │   ├── index.astro         ← 首页（最新文章）
│   │   ├── about.astro         ← 关于页
│   │   ├── albums.astro        ← 专辑网格页
│   │   ├── rss.xml.js          ← RSS 订阅
│   │   └── posts/
│   │       ├── index.astro     ← 文章列表
│   │       └── [...slug].astro ← 文章详情（支持嵌套路径）
│   ├── layouts/
│   │   ├── BaseLayout.astro    ← HTML 骨架 + 全局脚本
│   │   └── PostLayout.astro    ← 文章布局（进度条 + 标签）
│   ├── components/
│   │   ├── Header.astro        ← 顶部导航
│   │   ├── Footer.astro        ← 页脚（链接/计时/统计/主题切换）
│   │   ├── SiteTimer.astro     ← 运行时长
│   │   ├── ThemeToggle.astro   ← 明暗主题切换
│   │   ├── BackToTop.astro     ← 返回顶部按钮
│   │   ├── PostList.astro      ← 文章列表容器
│   │   ├── PostListItem.astro  ← 单行文章（日期 + 标题）
│   │   ├── AlbumGrid.astro     ← 专辑网格
│   │   ├── AlbumCard.astro     ← 单张专辑卡片
│   │   └── Spoiler.astro       ← 防剧透组件
│   ├── plugins/
│   │   └── code-block.mjs      ← Mac 风格代码块插件
│   ├── utils/
│   │   └── formatting.ts       ← 日期格式化
│   └── styles/
│       └── global.css          ← 全部样式
├── public/
│   ├── CNAME                   ← 自定义域名
│   ├── favicon.svg             ← 网站图标
│   └── images/albums/          ← 专辑封面图
└── .github/workflows/
    └── deploy.yml              ← 自动部署
```

---

## 常见操作

### 修改站点信息

| 改什么 | 文件 | 字段 |
|--------|------|------|
| 博客名 | `src/consts.ts` | `SITE_TITLE` |
| 简介 | `src/consts.ts` | `SITE_DESCRIPTION` |
| 作者名 | `src/consts.ts` | `AUTHOR` |
| 域名 | `src/consts.ts` | `SITE_URL` |
| 域名 | `astro.config.mjs` | `site` |
| 域名 | `public/CNAME` | 直接写域名 |
| 建站日期 | `src/consts.ts` | `SITE_START_DATE` |

### 修改导航栏

编辑 `src/consts.ts` 里的 `NAV_ITEMS` 数组。

### 添加社交链接（页脚）

编辑 `src/consts.ts` 里的 `SOCIAL_LINKS` 数组：
```ts
{ label: "GitHub", href: "https://github.com/你的用户名" },
```

---

### 写文章

1. 在 `src/content/posts/` 下创建 `.md` 文件
2. 支持嵌套目录，如 `posts/Security/websec0x28.md`
3. 文件头格式：

```md
---
title: 文章标题
date: 2026-07-30
description: 文章摘要（用于 SEO 和列表展示）
tags:
  - 标签1
  - 标签2
category: 分类名（可选）
---
文章正文...
```

4. Markdown 特性支持：
   - 代码块：用 ` ```js ` 指定语言，标题栏显示语言名
   - 表格：标准 markdown table
   - 行内代码：用反引号包裹
   - 引用：`>` 开头
   - Spoiler：用 `<span class="spoiler">隐藏文字</span>`

---

### 添加专辑

1. 封面图放到 `public/images/albums/`（1:1 正方形，建议 300×300 以上）
2. 编辑 `src/data/albums.ts`：

```ts
{
  title: "专辑名",
  artist: "艺人",
  year: 2024,
  cover: "/images/albums/文件名.jpg",  // 或外部 URL
  rating: 4,                           // 1-5 星
  genre: "风格标签",
  comment: "个人短评，\n 可以换行",
  link: "https://open.spotify.com/...",
}
```

---

### 改样式

全部样式在 `src/styles/global.css`：

| 变量 | 作用 |
|------|------|
| `--width` | 页面最大宽度 |
| `--font-main` | 标题/UI 字体（Bree Serif） |
| `--font-post` | 文章正文字体（Lora + 思源宋体） |
| `--font-display` | 博客标题字体（Bungee Shade） |
| `--font-mono` | 代码字体（JetBrains Mono） |
| `--color-bg` | 页面背景色 |
| `--color-text` | 正文文字色 |
| `[data-theme="dark"]` 块 | 夜间模式配色覆盖 |

### 改首页

编辑 `src/pages/index.astro`。

### 改页脚

编辑 `src/components/Footer.astro`。

### 改代码块样式

编辑 `src/styles/global.css` 中 `/* Code blocks */` 部分。

### 改进度条（文章页）

编辑 `src/layouts/PostLayout.astro` 中的 `.progress-bar` 样式。

### 改返回顶部按钮

编辑 `src/styles/global.css` 中 `.back-to-top` 样式。

### 改 Favicon

替换 `public/favicon.svg`。

---

## 设计规范

- **日间配色**：白底 + 近黑色文字 + 乌鸦羽色进度条
- **夜间配色**：`#131517` 深底 + 白字 + 银色闪光进度条
- **链接 hover**：黑底白字（日间）/ 白底黑字（夜间）
- **行内代码**：浅粉底 + 深红字（日间）/ 暗红底 + 浅粉字（夜间）
- **代码块**：Mac 窗口风格，JetBrains Mono 字体
- **字体**：文章 Lora/思源宋体，UI Bree Serif，标题 Bungee Shade，代码 JetBrains Mono
- **进度条**：日间乌鸦羽色（五彩斑斓的黑），夜间银色闪光

---

## 部署

- 本地：`npm run dev` → `http://localhost:4321`
- 上线：`git push` → GitHub Actions 自动构建部署
- 状态检查：GitHub 仓库 → Actions tab

---

## 注意事项

- `.obsidian/`、`date/`、`security-scripts/` 已加入 `.gitignore`
- 图片放 `public/` 下，代码引用用绝对路径：`/images/albums/xxx.jpg`
- `\n` 在专辑 comment 中会自动换行
- 不蒜子统计 PV/UV 基于 IP+Cookie，同一网络算同一 UV
- GUID.md 不上传 Github，仅本地参考
