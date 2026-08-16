---
title: 开发者工具&网络请求筛选&调用堆栈链&断点调试方法&数据作用域&控制台分析
published: 2026-08-07 09:58
description: Chrome开发者工具三大面板及作用域、调用堆栈等核心机制。重点演示普通断点、DOM断点、XHR断点三类调试方法，结合登录加密案例，讲解如何定位触发源、拦截请求、分析加密逻辑，形成可复用的实战套路。
tags:
  - JS
  - JS逆向
category: 网络安全
draft: true
---

# 知识点

1. JS逆向-F12开发者工具-使用面板指南
2. JS逆向-调用堆栈&断点方法-流程&调试

# 前置说明

## JS逆向与安全

事实上，前端的逆向通俗来说就是在浏览器的调试器中，对存在的前端代码（这里的前端代码包括html、js、css见上图差异对比）进行分析，通过分析其逻辑获取其中的路由、加密方式、敏感信息泄露等。

*应用场景：

例子1：某登录框加密传输时，枚举爆破攻击手法

例子2：某电商前端计算折扣，逆向JS篡改价格

例子3：某操作验证码认证时，生成验证码可预测

例子4：某平台的X-Sign签名，逆向后可构造任意请求

例子5：某应用参数加密时，逆向算法可改Payload测试

## JS文件与安全

*前期课程用项目提取JS信息

*前期课程用项目发现更多JS

# 开发者工具使用

## F12面板

网络,源代码/来源,控制台,元素等

## 作用域

简单来说就是运行后相关的数据值

## 调用堆栈

简单来说就是代码的执行逻辑顺序，从下往上

比如小迪安全知识库登录的加密算法调用堆栈：

```
send               @ jquery.min.js:2
ajax               @ jquery.min.js:2
（匿名）            @ mrdoc-encrypt.js:3
getEncryptionKey   @ mrdoc-encrypt.js:2
（匿名）            @ login/:162
submitLogin        @ login/:173
onsubmit           @ login/:95
```

## 断点调试

参考：https://mp.weixin.qq.com/s/E-eip5LXjGHFYmNlrNK-bg

小迪安全知识库断点调试结果

```
本地
    this: Window
    encryptedPassword: "G5ZlikgPlHRizmJaCtiVTQy/dTCrY+ZpOKGnvfVnCpA="
    encryptedPasswordField: input#password
    encryptionKey: "6624bfb9c521f30e5ca4d6d15eac0a5a98bc067cd7db48162f9e8ead7ef13ffe"
    password: "11111"
    passwordField: input#pwd.layui-input
```

**关键字段**

- **`password: "11111"`**：在登录框输入的**原始明文密码**。
    
- **`encryptionKey: "6624bfb9c521f30e5ca4d6d15eac0a5a98bc067cd7db48162f9e8ead7ef13ffe"`**：这是 **64位十六进制字符串（即32字节）**，专门用作**加密密钥（Key）** 或 **HMAC签名密钥**。
    
- **`encryptedPassword: "G5ZlikgPlHRizmJaCtiVTQy/dTCrY+ZpOKGnvfVnCpA="`**：这是最终生成的**密文/签名值**。
    
- **`passwordField`**：指向可见的 `<input id="pwd">`（输入明文的地方）。
    
- **`encryptedPasswordField`**：指向隐藏的 `<input id="password">`（注意它的 `defaultValue` 已经被赋值为那个密文）。

**逻辑推导**

1. **你点击登录按钮**，断点命中。
    
2. JS 读取你输入的明文 `"11111"`（来自 `#pwd`）。
    
3. JS 获取硬编码或服务端下发的前端密钥 `encryptionKey`。
    
4. **执行加密/签名函数**，将 `"11111"` 和 `Key` 作为输入，输出 `encryptedPassword`。
    
5. 将计算结果赋值给隐藏的 `<input id="password">`。
    
6. 最终表单提交时，**提交的是隐藏域 `#password` 的值（即密文）**，而可见的 `#pwd` 字段不会被提交（或提交空值）。

## 通过控制台调试加密逻辑

输入框填写密码为`111111`，转到控制台中

```js
控制台：
(async () => {
    const encryptionKey = await getEncryptionKey();
    
    // 这行会自动去读取你在网页输入框里填的内容
    const password = document.getElementById('pwd').value; 
    
    const encryptedPassword = await encryptData(password, encryptionKey);
    
    console.log("明文密码:", password);
    console.log("加密密钥:", encryptionKey);
    console.log("加密后密文:", encryptedPassword);
    return { password, encryptionKey, encryptedPassword };
})();
Promise {<pending>}
VM179:7 明文密码: 111111
VM179:8 加密密钥: c9801f641d9bff26f7157ddb9ccf578506c9f01053d511be498820c3604c5771
VM179:9 加密后密文: Yt+4ajJ//KCy2lAoFabM2dmvCERF2j0OlxdMQp3EOfg=
```

后续就可以通过全局搜索关键函数来查找加密源代码

## 断点案例0

**普通断点**

Z-Blog 后台登录页 `login.php` 中，前端 JavaScript 会动态设置表单的提交目标，例如：

```
$("form").attr("action", "cmd.php?act=verify");
```

1. 在 Chrome 开发者工具中打开 **Sources**（来源）面板，找到包含上述代码的 JS 文件（通常在 `login.php` 内联脚本或引用的 `.js` 中）。
    
2. 定位到 `$("form").attr("action","cmd.php?act=verify");` 这一行，**点击行号**添加一个断点（行号处会出现蓝色标记）。
    
3. 在登录页面输入用户名、密码，然后点击登录按钮。
    
4. 断点会立即触发，页面暂停执行。此时在 **Scope**（作用域）或 **Local**（本地变量）面板中，可以查看当前表单字段的值，例如：
    
    - `strUserName`："adasd"
        
    - `strPassWord`："111"
        
    - `strSaveDate`："1"

- 如果 `strPassWord` 显示的是**明文**（如 `"111"`），说明前端未加密，密码将明文提交给后端，加密由后端完成。
    
- 如果 `strPassWord` 显示的是**密文**（如 `"e10adc..."`），则说明前端已进行了加密处理，加密算法在登录之前执行。

通过这种最基础的断点测试，可以快速定位加密逻辑的执行时机，为进一步分析或逆向提供线索。

## 断点案例1

**DOM断点**

在前端代码中选中比如

```
<button class="layui-btn layui-btn-fluid layui-btn-radius  layui-btn-normal" lay-submit="" lay-filter="formDemo" type="submit">登录</button>
```

右键该代码->发生中断的条件->子树修改或者属性修改

还可以在js代码中，右键行号修改断点（或停用断点）->可选断点/条件断点/日志点

该小节知识点如下：

|   断点类型   |                     触发时机                      |                                                            最佳实战场景（结合你的登录框）                                                            |
| :------: | :-------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------: |
| **子树修改** |           该节点内部的**子元素**被添加、删除或修改文本时           |                               登录失败时，按钮内部文字从“登录”变成“登录中...”或出现红色报错气泡。用这个断点，可以立马定位是哪个 JS 函数在操作 DOM 显示错误信息。                               |
| **属性修改** | 该节点的**属性**（如 class、style、disabled、value）发生变化时 | **最常用！** 登录成功后，按钮的 `class` 从 `layui-btn-normal` 变成 `layui-btn-disabled`（变灰）；或者隐藏域 `#password` 的 `value` 被赋值密文。抓这个断点，可以直接定位到赋值的那一行 JS。 |
| **节点移除** |              该节点被 JS 从 DOM 树中删除时              |                                                     比如点击后弹窗（Modal）消失，想抓是谁触发的关闭逻辑。                                                     |

1. 右键按钮 -> **属性修改**（因为你最想看谁改了按钮的状态或表单的值）。
    
2. 点击登录，断点立刻触发。
    
3. 看一眼右侧 **Call Stack（调用栈）**，你会发现堆栈里不再是抽象的 JS 库代码，而是**直接指向操作这个 DOM 元素的业务函数**（比如 `function disableButton()` 或 `function setEncryptedPwd()`）。
    
4. 点击堆栈中的业务函数，就找到了操控页面的核心逻辑所在。
    

**一句话总结：当你肉眼看到页面变了（按钮灰了、文字变了），但不知道是哪行代码干的，就用 DOM 断点。它是“可视化变化”与“底层代码”之间的桥梁。**


|                   菜单选项                   |           作用            |                                                      实战场景(结合加密案例)                                                       |
| :--------------------------------------: | :---------------------: | :---------------------------------------------------------------------------------------------------------------------: |
|     **条件断点（Conditional breakpoint）**     |     只有满足你写的表达式时才暂停。     | 你的加密函数 `encryptData` 会被调用成千上万次，但你只想看在**密码等于 "11111"** 时停下。输入 `password === "11111"`，只有输这个密码才断点，其他情况自动忽略，省去无数次“继续执行”的点击。 |
|            **日志点（Logpoint）**             | **永不暂停**，只在控制台打印你指定的日志。 |       线上环境或高频循环中，不想打断页面运行，但又想看变量值。比如在加密循环里加一个 `密码当前值: {password}`，页面照常跑，控制台默默输出日志，**比 `console.log` 干净，且不需要改源码**。       |
| **触发断点（Breakpoint on ... / 或叫“暂停在...”）** |  通常配合异常捕获，或针对特定调用栈停靠。   |                                      比较复杂，常规调试用得少，暂时可以忽略，等遇到“只在特定父函数调用时才断”的场景再回来看。                                      |

1. 如果你发现点击登录后断点**触发了太多次**（比如进入了轮询或计时器），就在行号上右键 -> **添加条件断点**，输入你关心的关键变量（如 `password.length > 0`）。
    
2. 如果你只想看加密后的结果，但又不想让页面停下来影响后续提交逻辑（怕触发反调试），就在 `encryptedPasswordField.value = encryptedPassword;` 这一行右键 -> **添加日志点**，输入 `encryptedPassword`。点登录后，页面正常跳转，但控制台已经悄悄打印出了密文。

## 断点案例2

**XHR/提取断点**

- **源代码（Sources 面板）**：断点停住后，如果你想看**外层逻辑**（谁调用了这个函数），需要**看上面代码**，找外层函数或上级判断条件。
    
- **调用堆栈（Call Stack 面板）**：断点停住后，最上面（Top）是当前断点处的函数，**最下面（Bottom）是最早的触发入口**（如 `onclick`）。因此，你的视线需要**从上往下移动**，点击底部的栈帧，才能跳转到触发源的源代码位置。

在 Sources 面板中，针对特定 URL 关键词（如 `/login`、`/as/user/login`）手动添加拦截规则。当页面发起包含该关键词的 AJAX 请求（XMLHttpRequest 或 Fetch）时，JS 执行流会**在请求发出前暂停**。

遇到用 `fetch()` 或 `$.ajax` 发的请求，XHR 断点才有效。对于 `<form action="..." method="POST">` 这种传统表单，要么用 JS 断点拦 `submit()`，要么去 Network 面板抓包。

**作用**：

1. **捕获请求载荷**：在请求被发送到服务端之前，精准查看提交的 JSON、Form Data 或加密后的密文（如密码）。
    
2. **定位调用堆栈**：通过查看 Call Stack，快速确定是哪个事件函数（如点击登录）触发了该请求，便于剥离核心加密算法。

使用 `XHR/Fetch` 断点时，如果 URL 里带**问号（?）** 或**动态参数**，断点规则是**包含匹配**（Contains），不是精确匹配。  
比如你设了 `/login`，那么 `/as/user/login?t=123` 会被拦下来；但你设了 `/login?act=verify`，由于实际请求可能是 `/cmd.php?act=verify`，那就拦不住。所以建议**只截取最核心的路径关键词**（如 `verify` 或 `login`）。

# 实战案例0

以 Z-Blog 系统为例，该系统通常采用 MD5 对用户密码进行前端加密。本次实战旨在通过调试手段，还原其加密逻辑并验证加密结果。

目标站点可通过 FOFA、鹰图等网络空间测绘平台自行搜索搭建的 Z-Blog 系统进行测试。

首先进行登录操作，抓取提交的请求包，确认登录验证接口为：

```
https://xxx.cn/zb_system/cmd.php?act=verify
```

在全局搜索（`Ctrl+Shift+F`）中检索该接口`cmd.php?act=verify`，发现其来源为 `login.php`，表明该接口由后端页面动态生成并绑定。

在 `login.php` 中定位到如下核心 JavaScript 逻辑：

```js
$("#btnPost").click(function(){

    var strUserName=$("#edtUserName").val();
    var strPassWord=$("#edtPassWord").val();
    var strSaveDate=$("#savedate").val()

    if (strUserName=== "" || strPassWord === ""){
        alert("用户名，密码或验证码不能为空");
        return false;
    }

        $("form").attr("action","cmd.php?act=verify");
    $("#edtUserName").val("");
    $("#edtPassWord").val("");
    $("#username").val(strUserName);
    $("#password").val(MD5(strPassWord));
    $("#savedate").val(strSaveDate);
})
```

**代码逻辑梳理：**

1. 获取用户名、密码、保存登录状态的值；
    
2. 校验非空，若为空则弹窗提示并中止执行；
    
3. 动态修改表单提交的目标地址（`action`）为验证接口；
    
4. 清空原始密码框；
    
5. 将原始用户名赋值给隐藏的 `#username` 字段；
    
6. **对密码执行 MD5 加密，将结果赋值给隐藏的 `#password` 字段**；
    
7. 表单提交时传输的是加密后的密码，原始明文密码已清空。

**断点调试验证：**

由于 Z-Blog 采用传统同步表单提交（非 Ajax 异步请求），无法通过 XHR 断点拦截，因此使用普通 JS 断点进行调试。

在 `$("form").attr("action","cmd.php?act=verify");` 行添加断点。点击登录触发断点后，重点关注关键加密语句 `$("#password").val(MD5(strPassWord));`。

此时可观察右侧的 **Call Stack（调用堆栈）** 面板，逐层回溯调用上下文，对比不同栈帧中 `strPassWord` 的取值变化，以确认加密发生的时机：加密前的值为明文，加密后的值为 MD5 哈希串。

在上述代码中找到 MD5 加密函数的来源文件，通常为独立的 `.js` 加密库文件。将该文件下载到本地，编写简单调用进行验证：

```js
var p = md5('123456');
console.log(p);
```

输出结果若与服务端接收到的密文一致（即 `md5('123456')` 的标准值 `e10adc3949ba59abbe56e057f20f883e`），则说明加密逻辑提取成功，后续可通过模拟加密构造任意密码的密文，用于进一步的渗透测试（如密码爆破、重放攻击等）。