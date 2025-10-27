---
title: JS应用&WebPack打包器&第三方库JQuery&安全检测
published: 2025-10-18
description: WebPack打包器的使用及案例，jQuery库的引用和安全漏洞。
tags: [JS,安全开发]
category: 网络安全
draft: false
---

## 打包器—WebPack—使用&安全

参考：https://mp.weixin.qq.com/s/J3bpy-SsCnQ1lBov1L98WA

Webpack 是一个模块打包器。在 Webpack 中会将前端的所有资源文件都作为模块处理。 它将根据模块的依赖关系进行分析，生成对应的资源。

五个核心概念:

1. 【入口(entry)】：指示 webpack 应该使用哪个模块，来作为构建内部依赖图开始。

2. 【输出(output)】：在哪里输出文件，以及如何命名这些文件。

3. 【Loader】：处理那些非 JavaScript 文件（webpack 自身只能解析 JavaScript 和 json）。webpack 本身只能处理 JS、JSON 模块，如果要加载其他类 型的文件(模块)，就需要使用对应的 loader。

4. 【插件(plugins)】：执行范围更广的任务，从打包到优化都可以实现。

5. 【模式(mode)】：有生产模式 production 和开发模式 development。

   development开发模式源码会泄露，production不会泄露源码。

使用：

1. 创建需打包文件
2. 安装 webpack 库
3. 创建 webpack 配置文件
4. 运行 webpack 打包命令

### Webpack使用

webpack就是减少了文件的调用，使用一个文件就可以包含其他文件的内容。

下面这两个放入js文件中：

sum.js：

```js
export default function sum(x,y){
    return x+y;
}
```

count.js：

```js
export default function count(x,y){
    return x-y;
}
```

main.js和js放在同一目录。

main.js：

```js
import count from "./js/count"; //调用js中的count函数
import sum from "./js/sum";     //调用js中的sum函数
 
console.log(count(2,1));
console.log(sum(2,1));
```

index.html：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <!-- <script src="src/js/sum.js"></script>
    <script src="src/js/count.js"></script> 
    <script src="src/main.js"></script> -->  //使用此函数将不用在一步步调用以上函数及文件
    <script src="dist/bundle.js"></script>   //使用打包得到的bundle.js
</body>
</html>
```

### 全局安装webpack

在当前目录下的终端输入：npm i webpack-cli -g

之后创建webpack.config.js

```js
const path = require('path'); // 引入path模块
// entry：输入是src下的mian文件
// output: 输出在dist文件夹下额bundle.js
module.exports = {
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),   //将文件打包在dist目录下
        filename: 'bundle.js',
        clean: true,
    },
    mode:"development",    //源码会泄露
    //mode:"production",
    
};
```

之后在终端运行npx webpack，结果如下图，可以在dist目录下找到bundle.js

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/31-01.png)

再次运行index，就可以查看到打印出的结果了，在未打包之前是看不到的。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/31-02.png)

### 使用打包器和不使用打包器的区别

使用打包器：

```html
<body>
    <script src="dist/bundle.js"></script>   //使用打包得到的bundle.js
</body>
```

不使用打包器

```html
F<body>
    <script src="src/js/sum.js"></script>
    <script src="src/js/count.js"></script> 
    <script src="src/main.js"></script>
</body>
```

### development模式和production模式的区别

使用development模式时：会发现全部的文件以及源码是可以被看到的。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/31-03.png)

使用production模式时：只显示`(()=>{"use strict";console.log(400),console.log(272)})();`也就是打印的结果。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/31-04.png)

#### 安全

1. WebPack 源码泄漏-模式选择

   development和production模式选择。

   developmen会泄露源码，production不会泄露源码。

2. 模糊提取安全检查-PacketFuzzer

   https://github.com/rtcatc/Packer-Fuzzer

   **PacketFuzzer**：用来提取Web关键信息的。

   原生态 JS：前端语言直接浏览器显示源代码

   NodeJS：服务段语言浏览器不显示源代码

   WebPack：打包模式选择开发者模式后会造成源码泄漏（nodejs vue）

   原本node.js是不会泄露源码的，但使用了development模式后可能会泄露源码。

## 案例

### 顺丰快递

已被修复，当时可以通过f12检查可以看到经过webpack打包的源代码。

详细见：https://blog.csdn.net/m0_74930529/article/details/144199667

### 第三方库—JQuery—使用&安全

jQuery 是一个快速、简洁的 JavaScript 框架,是一个丰富的 JavaScript 代码库。 设计目的是为了写更少的代码，做更多的事情。它封装 JavaScript 常用功能代码，提供一种简便的 JavaScript 设计模式，优化 HTML 文档操作、事件处理、动画设计和 Ajax 交互。

1. 使用：

   引用路径：https://www.jq22.com/jquery-info122

2. 安全：

   检测：http://research.insecurelabs.org/jquery/test/

   测试：CVE-2020-11022/CVE-2020-11023

   参考：https://blog.csdn.net/weixin_44309905/article/details/120902867

   jquery漏洞总结：https://cloud.tencent.com/developer/article/1516331

   如何搜索到第三方库：通过网络空间，比如fofa等等。

   搜索方式：在网络空间输入语法："jquery-版本号.js" && country="xx"。

### 案例演示Jquery不同版本漏洞

详细见：https://blog.csdn.net/m0_74930529/article/details/144199667

jQuery漏洞总结：https://blog.csdn.net/lihaiming_2008/article/details/147921983

视频中的案例是因为代码中出现了可控的值造成的，由于jQuery版本的问题，每个版本的正则表达过滤是不同的，所以在3.5.0版本之前会有这种xss漏洞，当替换为3.5.1版本后，就不会再出现这种情况。

代码如下：

```js
// jQuery 3.0.0 中执行以下代码会触发 XSS  
$("<img src=x onerror='alert(\"XSS\")'>").appendTo("body");  
// 结果：弹出警示框，恶意脚本执行
```

#### 总结

Jquery内置的过滤：

本身dom：
```js
<style><style /><img src=yy οnerrοr=alert(1)> 
```

3.5.1：

```js
<style><style /><img src=yy οnerrοr=alert(1)> </style>
```

3.4.1：

```js
<style><style ></style><img src="yy" οnerrοr="alert(1)"> 
```

利用漏洞：
版本符合，`<style><style ></style><img src="yy" οnerrοr="alert(1)"> `值可控 就可以造成xss

能够造成漏洞的原因：内置过滤

内置过滤可参考文章：https://blog.csdn.net/axxxwo/article/details/120586585