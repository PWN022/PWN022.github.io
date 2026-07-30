---
title: JS应用&VueJS框架&Vite构建&启动打包&渲染XSS&源码泄露&代码审计
published: 2026-02-28 21:00:00
description: vue的使用（搭建、创建、启动）、启动模式的区别、以及同上期，使用vite或者webpack打包会出现的安全问题。
tags: [Web开发,JS]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-VueJS-搭建启动&打包安全
2. 安全开发-VueJS-源码泄漏&代码审计

# Vue 搭建

参考：https://cn.vuejs.org/

已安装18.3或更高版本的Node.js

# Vue 创建

创建vue：

```
npm create vue@latest
```

```
Need to install the following packages:
create-vue@3.21.2
Ok to proceed? (y)


> npx
> create-vue

┌  Vue.js - The Progressive JavaScript Framework
│
◇  请输入项目名称：
│  vue-project
│
◇  请选择要包含的功能： (↑/↓ 切换，空格选择，a 全选，回车确认)
│  none
│
◇  选择要包含的试验特性： (↑/↓ 切换，空格选择，a 全选，回车确认)
│  none
│
◇  跳过所有示例代码，创建一个空白的 Vue 项目？
│  No

正在初始化项目 F:\StudySoftware\CODE\phpstudy\phpstudy_pro\WWW\phpdemo\vue-project...
│
└  项目初始化完成，可执行以下命令：

   cd vue-project
   npm install
   npm run dev

| 可选：使用以下命令在项目目录中初始化 Git：

   git init && git add -A && git commit -m "initial commit"
```

vite构建工具创建：

```
npm create vite@latest
```

创建完之后进行开发一般都是在**src目录**下。

# Vue 启动

```
cd <your-project-name>
```

安装依赖：

```
npm install
```

## 开发者模式启动

真实情况下，网站一般不会用这种模式启动。

```
npm run dev
```

启动后会在终端给出地址和端口。

## 打包构建启动

真实环境下，网站一般用这种方式运行。

```
npm run build
```

当使用打包构建时，完成后会多出一个**dist目录**，运行需要使用phpstudy中间件**指定目录到dist**。

### vite

在创建完vue项目时，项目中的**vite.config.js**文件来进行具体打包设置。

这里之演示了生成sourcemap，其他功能自行搜索。

```js
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  build:{
    sourcemap: true,// 如果需要生成 source map,与webpack打包器相同,会生成一个.map文件
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
```

而且**下载还原方式**与webpack打包器相同。

# 安全例子

搭建：

npm create vite@latest

cd vue-xss-demo

npm install

修改：

App.vue:

```vue
<template>

  <div>
    <h1>XSS 漏洞演示</h1>
    <input v-model="userInput" placeholder="输入你的内容" />
    <button @click="showContent">显示内容</button>
    <div v-html="displayContent"></div>
  </div>
  
</template>

<script>
export default {
  data() {
    return {
      userInput: '', // 用户输入
      displayContent: '' // 显示的内容
    };
  },

  methods: {
    showContent() {
      // 直接将用户输入的内容渲染到页面
      this.displayContent = this.userInput;
    }
  }
};

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
}
</style>
```

启动：npm run dev

测试：

```
<img src="x" onerror="alert('XSS')" />
```

修复：

```
使用文本插值（{{}}）代替 v-html
```

在上例中：

使用`<div>{{displayContent}}</div>`之后，payload中的`<>`尖括号会被实体化，导致无法进行xss攻击。

其他：https://cn.vuejs.org/guide/best-practices/security

# WebPack+VueJS源码泄露

并不是所有的vue都用vite打包器，有的vue也会用webpack打包器。

```js
// vue.config.js
export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true, // 如果需要生成 Source Map
  },
})
```

```
npm run build
```

## Vue真实源码项目

网上找的`Vue`开发的源码项目，了解如何启动，目录架构，代码逻辑等。

进入到vue目录：

```
pip install
```

### 开发者模式启动源码

```
npm run dev
```

### 打包构建启动源码

```
npm run build
```

之后使用中间件指定到dist目录下

### 源码目录架构

![image-20260228202422808](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260228202422808.png)

### 寻找安全问题

比如是否存在v-html可操控的部分，

或者就是寻找代码中的一些敏感信息，如：账号密码，key等等。

![image-20260228203227632](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260228203227632.png)

![image-20260228203240009](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260228203240009.png)

![image-20260228203250121](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260228203250121.png)

案例文章：

https://mp.weixin.qq.com/s/30XIDREyo0Ose4v8Aa9g2w

https://mp.weixin.qq.com/s/4KgOZcWUnvor_GfxsMlInA