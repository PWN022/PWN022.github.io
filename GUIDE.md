# !W0ND3R 博客维护指南

## 文件结构速览

```
iw_blog/
├── src/
│   ├── consts.ts              ← 站点配置
│   ├── content/posts/          ← 文章放这里
│   ├── data/albums.ts          ← 专辑数据
│   ├── pages/                  ← 页面路由
│   ├── components/             ← 组件
│   ├── layouts/                ← 布局模板
│   └── styles/global.css       ← 全部样式
├── public/
│   ├── images/albums/          ← 专辑封面图
│   └── favicon.svg             ← 网站图标
└── astro.config.mjs            ← Astro 配置
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

### 写文章

1. 在 `src/content/posts/` 下创建 `.md` 文件
2. 文件头格式：

```md
---
title: 文章标题
date: 2026-07-30
description: 文章摘要
tags:
  - 标签1
  - 标签2
category: 分类名
---
文章正文...
```

3. 支持嵌套目录，如 `posts/Security/xxx.md`

### 添加专辑

1. 封面图放 `public/images/albums/`
2. 编辑 `src/data/albums.ts`：

```ts
{
  title: "专辑名",
  artist: "艺人",
  year: 2024,
  cover: "/images/albums/文件名.jpg",
  rating: 4,
  genre: "风格",
  comment: "短评",
  link: "https://music.douban.com/...",
}
```

### 修改导航

编辑 `src/consts.ts` 里的 `NAV_ITEMS` 数组。

### 改样式

所有样式在 `src/styles/global.css`，关键变量：

| 变量 | 作用 |
|------|------|
| `--width` | 页面最大宽度 |
| `--font-main` | 标题/UI 字体 |
| `--font-post` | 文章正文字体 |
| `--color-bg` | 背景色 |
| `--color-text` | 文字色 |
| `[data-theme="dark"]` 块 | 暗色模式配色 |

### 改首页内容

编辑 `src/pages/index.astro`。

### 改页脚文字

编辑 `src/components/Footer.astro`。

### 改 Favicon

替换 `public/favicon.svg`。

---

## 注意

- `.obsidian/` 和 `date/` 目录已加入 `.gitignore`，不会被上传
- 图片放 `public/` 下，代码引用用绝对路径，如 `/images/xxx.jpg`
- 本地预览：`npm run dev`
- 推送到 GitHub 后自动部署
