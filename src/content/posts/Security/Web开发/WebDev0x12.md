---
title: JS应用&WebPack构建&打包Mode&映射DevTool&源码泄漏&识别还原
published: 2026-02-28 12:00:00
description: Webpack打包技术（mode配置、devtool配置）、源码还原（shuji、reverse-sourcemap），以及使用webpack打包引起的源码泄露安全问题。
tags: [Web开发,JS]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-WebPack-构建打包器
2. 安全开发-WebPack-源码泄漏还原

Webpack 是一个强大的模块打包工具，它主要用于将 JavaScript 代码和其他资源（如 CSS、图片、字体等）打包成浏览器能够高效加载的文件。下面是使用 Webpack 的一些常见原因和优势：

```
1. 模块化支持
   Webpack支持模块化开发，可以将代码分割成多个文件（模块），然后将这些文件按需打包成一个或多个最终的输出文件。这对于管理复杂应用程序的代码非常重要，特别是现代JavaScript应用程序中，大多数代码和资源都已是模块化的。
   例如，你可以将前端代码分为多个模块（如组件、工具函数等），然后让 Webpack 负责打包这些模块，并管理它们之间的依赖关系。

2. 处理各种资源
   Webpack 不仅仅是处理 JavaScript 文件，还能处理多种类型的资源：
   CSS：你可以使用 Webpack 将 CSS 文件打包到最终的输出中。
   Sass / Less：Webpack 配合相应的加载器（如 sass-loader、less-loader）可以处理 Sass 或 Less 文件。
   图片和字体：通过 file-loader 或 url-loader，Webpack 可以处理图片、字体文件等静态资源。
   HTML 文件：可以使用 html-webpack-plugin 插件自动生成 HTML 文件并插入打包后的资源。

3. 代码分割（Code Splitting）
   Webpack 支持 代码分割，它可以将大型的 JavaScript 应用程序拆分成多个小的文件（chunks），并按需加载这些文件。这样，初次加载时，浏览器只会加载最小的必需代码，而不是所有的代码，从而提高页面加载速度。
   例如，你可以按页面或功能进行代码分割，只加载用户需要的部分，而不是一次性加载整个应用程序。

4. 性能优化
   Webpack 提供了多种方式来优化性能：
   压缩和优化：在生产模式下，Webpack会自动压缩JavaScript和CSS文件，减小文件大小，从而加速加载速度。
   Tree Shaking：Webpack 能够识别并删除未使用的代码，这样在最终打包时只会包含必要的代码，减少最终打包文件的体积。
   缓存优化：通过配置 hash 和 chunkhash，Webpack 可以为输出的文件生成唯一的哈希值，这有助于缓存优化。这样，浏览器可以缓存大部分静态资源，而只有在资源内容更改时才会重新下载。

5. 热模块替换（HMR）
   Webpack 提供了 热模块替换（HMR） 功能，允许开发者在不刷新浏览器页面的情况下更新应用程序的部分模块。这对于开发时快速预览修改、提高开发效率非常有用。

6. 兼容性和 Polyfill
   Webpack 可以与 Babel 配合使用，将现代 JavaScript 转译成兼容旧浏览器的代码。通过 Babel 和 Webpack 配合，你可以确保代码在不同浏览器中的兼容性。

7. 自动化任务
   Webpack 配置可以结合其他工具自动化一些常见的任务：
   自动生成 HTML 文件，并将打包的 JS 和 CSS 插入其中。
   自动处理样式表（Sass、Less）。
   自动优化图片文件。
   自动生成文件哈希和版本控制。

8. 插件系统
   Webpack 提供了强大的插件机制。你可以通过使用插件（如 HtmlWebpackPlugin、CleanWebpackPlugin、MiniCssExtractPlugin 等）来扩展 Webpack 的功能，定制化自己的构建流程。

9. 支持不同的开发环境
   Webpack 可以根据不同的环境（开发、生产）使用不同的配置。你可以使用 mode 配置来选择开发模式或生产模式，Webpack 会根据模式做出相应的优化。例如，在生产模式下，它会自动启用代码压缩和优化功能。

10. 生态系统和社区支持
    Webpack 拥有非常活跃的社区，很多流行的前端框架（如 React、Vue）和库都提供了针对 Webpack 的最佳实践和插件，使得集成变得更加简便。
```

结论：

Webpack 是现代前端开发中不可或缺的工具，特别是对于构建复杂的、模块化的应用程序。它的优势在于模块化处理、资源管理、性能优化、代码分割和插件扩展，使得构建和部署变得更加高效和灵活。如果你的应用程序规模较大，或者涉及到多个资源文件，使用Webpack打包将带来显著的性能和开发体验提升。

# WebPack技术

## 安装WebPack

```
npm i webpack
npm i webpack-cli
```

参考：
https://docschina.org/
https://www.webpackjs.com/
https://mp.weixin.qq.com/s/J3bpy-SsCnQ1lBov1L98WA

例子：打包JS，NodeJS，HTML等

简单来说，webpack具备以下功能：

1. 支持js模块化
2. 处理css兼容性
3. 将多个html/css/js文件压缩合并

## 打包模式/代码/文件差异

### 命令行打包

> 运行指令:
>
> - 打包指令（开发）：
>
>   ```
>   webpack ./src/js/app.js -o ./build/js/app.js --mode=development
>   ```
>
>   - 功能: webpack能够打包js和json文件，并且能将es6的模块化语法转换成浏览器能识别的语法
>
> - 打包指令（生产）：
>
>   ```
>   webpack ./src/js/app.js -o ./build/js/app.js --mode=production  能压缩代码
>   ```
>
>   - 功能: 在开发配置功能上加上一个压缩代码的功能

开发模式打包：会泄露更多的信息。

生产模式打包：生产模式其实也就是上线环境，所以信息会少很多。

### 配置型文件打包*(推荐)

在根目录新建**webpack.config.js**

示例代码：

```js
const path= require('path'); //node内置核心模块，用来设置路径。

module.exports = {
       mode: 'development',   //开发环境(二选一)
      //mode: 'production'   //生产环境(二选一)
    
       entry: './main.js', // 入口文件配置（精简写法）
    /*完整写法：
  entry:{
   main:'./src/js/app.js'
  }
  */
    
    output: { //输出配置
        filename: 'app.js',//输出文件名
        path: path.resolve(__dirname, 'build')
        //输出文件路径(绝对路径)
        //__dirname表示该文件当前文件夹
    },
};
```

## 打包JS（常用）

比如有当前几个代码：

### main.js

```js
import count from "./count";
import sum from "./sum";

console.log(count(2,1));
console.log(sum(2,1));
```

### sum.js

```js
export default function sum(x,y){
    return x-y;
}
```

### count.js

```js
export default function count(x,y){
    return x+y;
}
```

### web.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script src="./day13/main.js"></script>
</body>
</html>
```

html只引用主要js文件，这时打开web通过查看控制台发现以下报错：

```
Uncaught SyntaxError: Cannot use import statement outside a module
```

这是因为不能直接引用一个文件，需要引用全部文件才能达到效果，如果这时候利用webpack技术（打包器会将三个文件打包为一个），那么就可以只引用一个js文件达到想要的结果。

选择配置型文件打包：

```js
const path= require('path'); //node内置核心模块，用来设置路径。

module.exports = {
       mode: 'development',   //开发环境(二选一)
      //mode: 'production'   //生产环境(二选一)
    
       entry: './main.js', // 入口文件配置（精简写法）
    /*完整写法：
  entry:{
   main:'./src/js/app.js'
  }
  */
    
    output: { //输出配置
        filename: 'app.js',//输出文件名
        path: path.resolve(__dirname, 'build')
        //输出文件路径(绝对路径)
        //__dirname表示该文件当前文件夹
    },
};
```

之后在终端，进入当前目录执行：

```
npx webpack
```

成功后会生成一个build文件夹，其中会包含一个app.js文件。

此时将web.html中的路径指向这个app.js文件：

```html
<body>
    <script src="./day13/build/app.js"></script>
</body>
```

打开htm会发现控制台成功输出了想要的内容。

**而且如果是在生产环境打包的情况下，通过查看app.js文件是不会看到源代码部分的**

## 打包nodejs

选择使用昨天的file.js代码，这里就不贴代码部分了。

打包配置文件：

```js
const path = require('path');
const nodeExternals = require('webpack-node-externals');  // 还是需要引入

module.exports = {
    entry: './file.js',
    output: {
        filename: 'boundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    target: 'node', // 指定环境为node
    resolve: {
        modules: [
            'node_modules',
            path.resolve('我的express目录')  // 添加用户目录
        ]
    },
    externals: [nodeExternals()],  // 排除 node_modules 中的模块
    mode: 'development'
};
```

# 源码泄漏

# mode配置

浏览器的：webpack://

```
production（生产），development（开发），开发模式下会存在泄漏
mode: 'production'
mode: 'development'
```

## production

生产模式是比较安全的。

![image-20260227112522267](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260227112522267.png)

## development

开发模式下会存在泄漏。

![image-20260227112409990](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260227112409990.png)

# devtool配置

参考：https://mp.weixin.qq.com/s/tLjSb5cinXawMEC7RfJEJQ

在使用webpack打包部署代码时，如果参数devtool配置不当，将会在部署代码文件中生成对应匹配的soucemap文件（源码映射），如果将参数devtool配置为“source-map”、“cheap-source-map”、“hidden-source-map”、“nosources-source-map”、“cheap-module-source-map”等值时，打包后将生成单独的map文件。

打包配置文件：

```js
const path= require('path'); //node内置核心模块，用来设置路径。

module.exports = {
      // mode: 'development',   //开发环境(二选一)
      mode: 'production',   //生产环境(二选一)
    
      entry: './main.js', // 入口文件配置（精简写法）
    /*完整写法：
  entry:{
   main:'./src/js/app.js'
  }
  */
    
    output: { //输出配置
        filename: 'app_map.js',//输出文件名
        path: path.resolve(__dirname, 'build')
        //输出文件路径(绝对路径)
        //__dirname表示该文件当前文件夹
    },

    // 直接配置devtool，避免使用configureWebpack
    devtool: 'source-map',
};
```

在web.html中修改引用文件，打开后会发现：

```js
(()=>{"use strict";console.log(3),console.log(1)})();
//# sourceMappingURL=app_map.js.map
```

之后在url中输入：

```
文件名/build/app_map.js.map
```

```js
{"version":3,"file":"app_map.js","mappings":"mBAGAA,QAAQC,ICFGC,GDGXF,QAAQC,IEHGC,E","sources":["webpack:///./main.js","webpack:///./count.js","webpack:///./sum.js"],"sourcesContent":["import count from \"./count\";\r\nimport sum from \"./sum\";\r\n\r\nconsole.log(count(2,1));\r\nconsole.log(sum(2,1));\r\n","export default function count(x,y){\r\n    return x+y;\r\n}","export default function sum(x,y){\r\n    return x-y;\r\n}"],"names":["console","log","x"],"sourceRoot":""}
```

识别项目：https://github.com/SunHuawei/SourceDetector

![image-20260228113222135](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260228113222135.png)

# 源码还原

## 还原项目-shuji

前提：把泄露的`map`文件下载到本地

```
npm install shuji
```

```
shuji xxx.js.map -o 目录
```

还原代码至test目录(自动创建)

```
shuji app.js.map -o test
```

## 还原项目-reverse-sourcemap(常用)

前提：把泄露的`map`文件下载到本地

```
npm install reverse-sourcemap
```

```
reverse-sourcemap --output-dir 目录 xxx.js.map
```

还原代码至test1目录(自动创建)

```
reverse-sourcemap --output-dir test1 app_map.js.map
```

# 案例应用

源码泄漏真实应用

直接路径中拼接：

```
/js/app.431f6628.js.map
```

![image-20260228114112582](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260228114112582.png)

之后使用reverse-sourcemap还原项目。

还原项目之后就是对源代码的审计或者看有无泄露敏感信息等等。