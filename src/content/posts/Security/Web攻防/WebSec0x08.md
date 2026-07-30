---
title: XSS跨站&浏览器UXSS&突变MXSS&Vue&React框架&JQuery库&写法和版本
published: 2026-06-28T18:00:00
description: XSS在框架组件（Vue/React/Electron的v-html、dangerouslySetInnerHTML等危险写法）与浏览器底层（UXSS、MXSS）的利用
tags:
  - Web攻防
  - XSS
category: 网络安全
draft: false
---

# 知识点

1. Web攻防-XSS跨站-浏览器&转换-UXSS&MXSS
2. Web攻防-XSS跨站-框架和库-VUE&React&Electron&JQuery

# 分类

1. 框架或三方库的XSS
2. 浏览器或插件的XSS
3. 客户端预览内核的XSS

说明：

使用框架开发的或第三方库引用操作的，默认安全写法会自带过滤，所以测试此类的应用需存在漏洞版本或不安全写法导致XSS；同样UXSS也需要存在漏洞的浏览器版本或插件导致；MXSS也要不同环境下的转变解析导致，需多测试。

# Vue-XSS

## 搭建

```bash
npm create vite@latest
cd vue-xss-demo
npm install
```

## 修改

App.vue:

<template>

<div>

<h1>XSS 漏洞演示</h1>

<input v-model="userInput" placeholder="输入你的内容" />

<button @click="showContent">显示内容</button>

<div v-html="displayContent"></div>

</div>

</template>
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

## 启动

npm run dev

## 测试

`<img src="x" onerror="alert('XSS')" />`

## 修复

代码中使用文本插值`{{}}`代替`v-html`

# React-XSS

## 搭建

```bash
npx create-react-app react-xss-example
cd react-xss-example
```

## 修改

App.js:

```js
App.js
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
 
function App() {
    const [userInput, setUserInput] = useState('');
    const [displayedInput, setDisplayedInput] = useState('');
 
    const handleInputChange = (e) => {
        setUserInput(e.target.value);
    };
 
    const displayInput = () => {
        setDisplayedInput(userInput);
    };
 
    return (
        <div>
            <input type="text" value={userInput} onChange={handleInputChange} placeholder="输入内容" />
            <button onClick={displayInput}>显示输入</button>
            <div dangerouslySetInnerHTML={{__html: displayedInput}}/>
            {/*<div>{displayedInput}</div>*/}
        </div>
    );
}
export default App;
```

## 启动

npm start

## 测试

`<img src="x" onerror="alert('XSS')" />`

## 修复

代码中的`<div dangerouslySetInnerHTML={{__html: displayedInput}}/>`，直接使用`<div>{displayedInput}</div>`来显示

# Electron-XSS

## 搭建

```bash
mkdir electron-xss-example
cd electron-xss-example
npm init -y
```

## 安装修改

```bash
npm install electron --save-dev
```

main.js 和 index.html 文件复制到项目根目录下

```js
// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
 
function createWindow() {
  const win = new BrowserWindow({
width: 800,
height: 600,
webPreferences: {
nodeIntegration: true,
contextIsolation: false
    }
  });
 
win.loadFile('index.html');
}
 
app.whenReady().then(() => {
  createWindow();
 
app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
 
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
 
// index.html
<!DOCTYPE html>
<html>
 
<head>
  <meta charset="UTF-8">
  <title>Electron XSS Example</title>
</head>
 
<body>
  <input type="text" id="userInput" placeholder="输入内容">
  <button onclick="displayInput()">显示输入</button>
  <div id="displayArea"></div>
  <script>
    function displayInput() {
      const input = document.getElementById('userInput').value;
      const displayArea = document.getElementById('displayArea');
displayArea.innerHTML = input;
    }
  </script>
</body>
 
</html>

配置package.json
{
  "name": "electron-xss-example",
  "version": "1.0.0",
  "description": "",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "electron": "^23.2.1"
  }
}
```

## 启动

npm start

## 测试

`<img src="x" onerror="alert('XSS')" />`

## 修复

使用`textContent`代替`innerHTML`来显示文本

# JQuery XSS

## 参考

水洞：

https://mp.weixin.qq.com/s/FsFvQlVrb_J4wsyE8gpprA

介绍：

https://mp.weixin.qq.com/s/EMsK1c901-bDYapvHxs-VQ

## 漏扫

https://github.com/mahp/jQuery-with-XSS

https://github.com/honeyb33z/cve-2020-11023-scanner

# MXSS

`mXSS`中文是突变型`XSS`，指的是原先的`Payload`提交是无害不会产生`XSS`，而由于一些特殊原因，如反编码等，导致`Payload`发生变异，导致的`XSS`。

## 参考

https://mp.weixin.qq.com/s/31zaBzZ1e6rNobYCrn7Qhg

## 模拟：（见图）

靶场：

https://portswigger-labs.net/mxss/

```js
<math><mtext><table><mglyph><style><!--</style><img title="--&gt;&lt;img src=1 onerror=alert(1)&gt;">
```

复盘：

https://www.fooying.com/the-art-of-xss-1-introduction/

# UXSS

Universal Cross-Site Scripting(针对浏览器或浏览器插件漏洞)

UXSS利用浏览器或者浏览器扩展漏洞来制造产生XSS并执行代码的攻击类型。

|        |    漏洞对象     |    受害范围     |
| :----: | :---------: | :---------: |
|  UXSS  |   浏览器及插件    | 在浏览器访问的所有站点 |
| 普通型XSS | Web站点或者语言程序 |   单个站点或应用   |

复盘：

MICROSOFT EDGE uXSS CVE-2021-34506

Edge浏览器翻译功能导致JS语句被调用执行

https://www.bilibili.com/video/BV1fX4y1c7rX

https://mp.weixin.qq.com/s/rR2feGeuRt3hOFPkV3_6Ow