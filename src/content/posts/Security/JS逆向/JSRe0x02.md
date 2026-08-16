---
title: HOOK钩子&脚本开发&注入逻辑&油管猴配置&绕过Debug&定时循环&构造函数
published: 2026-08-16T20:00:00
description: JS逆向中Hook技术的核心概念与实战复现。从Hook原理（保存原函数→覆盖函数→调用原函数）到油猴脚本开发前置，再到具体案例实践：修改窗口尺寸、通过劫持Function构造函数和setInterval绕过定时器debugger。
tags:
  - JS
  - JS逆向
  - HOOK
category: 网络安全
draft: false
---

# 知识点

1. JS逆向 -HOOK技术-注入&开发应用&反调试

JS Hook（钩子）是一种通过拦截和修改JavaScript函数或对象行为的技术，

主要用于：

- *动态分析网页行为
- *修改页面功能
- *调试和逆向工程
- *自动化测试
- *安全研究

# HOOK开发前置

@name 定义脚本的名称

@namespace 用于区分不同脚本的作用域

@version 定义脚本的版本号

@description 描述脚本的功能或用途

@author 定义脚本的作者

@match 定义脚本的运行匹配规则

@icon 定义脚本的图标

@grant 定义脚本所需的特殊权限

示例：

```
// ==UserScript==
// @name         任意名称
// @namespace    一般是写油猴的地址
// @version      1.0等等
// @description  任意描述
// @author       自己的id
// @match        http://*/*   ->   匹配所有的http://任意域名/目录或文件，也可以指定域名
// @icon         指定图标
// @grant        none或者其他
// ==UserScript==
```

# 案例：HOOK原理

`hook`技术就相当于在浏览器-控制台上执行一些想要的代码，用这个代码注入到当前页面执行流程里面，干扰他的逻辑

以下是一个完整例子：**保存原函数 → 覆盖函数 → 在覆盖函数中调用原函数**的Hook基本模型

test.html：

```html
<script>
	function test01(){
		console.log("test01");
		test02();
	}
	function test02(){
		console.log("test02");
		test03();
	}
	function test03(){
		console.log("test03");
		test04();
	}
	function test04(){
		console.log("test04");
	}
	
	test01()
	
</script>
```

以上代码就会在控制台依次打印出`test01`、`test02`、`test03`、`test04`

此时修改代码：

**修改源代码或者在控制台中输入效果是一样的**

```html
<script>
	function test01(){
		console.log("test01");
		test02();
	}
	function test02(){
		console.log("test02");
		test03();
	}
	function test03(){
		console.log("test03");
		test04();
	}
	function test04(){
		console.log("test04");
	}
	
	test01()
	
	var _test03 = test03;
	function test03(){
		debugger
		_test03;
	}
	
</script>
```

此时，新定义的 `test03` 覆盖（劫持）了原本的 `test03`，原函数被保存到 `_test03` 中。当执行流进入新 `test03` 时，触发一次 `debugger` 暂停，控制台仅打印 `test01` 和 `test02`。随后步进执行 `_test03;`，该语句仅读取变量引用而不执行原函数，执行流逐级退出函数作用域，继续执行脚本后续的 `var _test03 = test03;` 赋值语句，直至 `</script>` 结束。

# 案例：改掉显示长宽

在控制台中：

```
window.innerHeight 获取高度
window.innerWidth  获取宽度
```

在油猴脚本中：

```
// ==UserScript==
// @name         任意名称
// @namespace    一般是写油猴的地址
// @version      1.0等等
// @description  任意描述
// @author       自己的id
// @match        https://www.baidu.com/*
// @grant        none或者其他
// ==UserScript==

(function (){
	'use strict';
	let height = 660;
	let width = 1366;
	....
	// 自行编写或者问ai如何进行修改为固定的宽和高
});
```

此时开启油猴，打开百度就会自动运行该hook脚本，无论放大缩小，此时都是固定的宽度和高度

# 本地案例：Debug绕过

1、找到过滤代码机制

```js
function enableDebugProtection() {
	var dbg = new Function("debugger");
	setInterval(dbg, 3000); // 每3秒触发一次debugger
}
```

2、配合AI和基础开发hook

拦截Function构造函数及替换

拦截setInterval及替换

```js
// ==UserScript==
// @name         拦截 Function 构造函数（绕过 debugger）
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  劫持 Function 构造函数，让 new Function("debugger") 返回空函数
// @author       You
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 保存原始的 Function 构造函数
    const OriginalFunction = window.Function;

    // 替换 Function 构造函数
    window.Function = function(...args) {
        // 检查参数中是否包含 "debugger"
        const body = args[args.length - 1] || '';
        if (body.includes('debugger')) {
            console.log('已拦截 new Function("debugger")，返回空函数');
            // 返回一个空函数，不包含 debugger
            return function() {};
        }
        // 正常情况，调用原始 Function
        return new OriginalFunction(...args);
    };

    // 保证原型链一致（避免某些检测）
    window.Function.prototype = OriginalFunction.prototype;

    console.log('Function 构造函数已劫持');
})();
```

```js
// ==UserScript==
// @name         拦截 setInterval（绕过 debugger）
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  劫持 setInterval，过滤掉包含 debugger 的回调
// @author       You
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const originalSetInterval = window.setInterval;

    window.setInterval = function(callback, interval, ...args) {
        // 判断 callback 是否包含 debugger
        let isDebugger = false;

        if (typeof callback === 'function') {
            // 函数转字符串检查
            if (callback.toString().includes('debugger')) {
                isDebugger = true;
            }
        } else if (typeof callback === 'string') {
            // 字符串形式的代码，如 setInterval("debugger", 1000)
            if (callback.includes('debugger')) {
                isDebugger = true;
            }
        }

        if (isDebugger) {
            console.log('已拦截 setInterval 中的 debugger 调用');
            // 不执行，直接返回一个假 ID（但为了兼容性，可以返回一个空定时器）
            // 返回 0 或任意数字，避免页面报错
            return 0;
        }

        // 正常调用
        return originalSetInterval.call(this, callback, interval, ...args);
    };

    console.log('setInterval 已劫持');
})();
```

二合一：

```js
// ==UserScript==
// @name         综合绕过 debugger 反调试
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  同时劫持 Function 构造函数和 setInterval
// @author       You
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ----- 拦截 Function -----
    const OriginalFunction = window.Function;
    window.Function = function(...args) {
        const body = args[args.length - 1] || '';
        if (body.includes('debugger')) {
            console.log('拦截 new Function("debugger")');
            return function() {};
        }
        return new OriginalFunction(...args);
    };
    window.Function.prototype = OriginalFunction.prototype;

    // ----- 拦截 setInterval -----
    const originalSetInterval = window.setInterval;
    window.setInterval = function(callback, interval, ...args) {
        let isDebugger = false;
        if (typeof callback === 'function' && callback.toString().includes('debugger')) {
            isDebugger = true;
        } else if (typeof callback === 'string' && callback.includes('debugger')) {
            isDebugger = true;
        }
        if (isDebugger) {
            console.log('拦截 setInterval 中的 debugger');
            return 0;
        }
        return originalSetInterval.call(this, callback, interval, ...args);
    };

    console.log('反调试绕过已生效');
})();
```

3、油管猴配合HOOK脚本测试

# 实战案例：真实Debug绕过

目标地址：https://www.jishulink.com/video/c246316

1、找到过滤代码机制

```
function() {}.constructor("debugger")()
```

2、配合AI和基础开发hook

拦截Function构造函数

找到debugger并实现替换

全局搜索`debugger`：找到代码段

让ai给出绕过此代码的hook，同时给出目标地址：`https://www.jishulink.com/video/c246316`

```
function() {}.constructor("debugger")()
```

3、油管猴配合HOOK脚本测试

现在代码更改了，而且我进行断点测试也没触发debugger，不知道什么情况，具体分析代码也分析不来，所以这个案例过时了