---
title: PHP应用&弱类型脆弱&Hash加密&Bool类型&Array数组&函数转换比较
published: 2026-02-05 21:00:00
description: PHP中的==和===的缺陷问题、函数strcmp类型、bool类型、switch类型、in_array数组的比较缺陷问题，两个CTF案例和一个代码审计CMS案例。
tags: [Web开发,PHP]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-原生PHP-弱类型脆弱
2. 安全开发-原生PHP-函数&数据类型
3. 安全开发-原生PHP-代码审计案例

## == 和 ===

两个等号==是弱比较，使用==进行对比的时候，php解析器就会做隐式类型转换，如果两个值的类型不相等就会把两个值的类型转为同一类型进行对比。

```php
<?php
// 示例1：数字0 vs 字符串'pay'
// 松散比较时，字符串'pay'转换为数字得到0
// 详细说明：比较 0 == 'pay' 时，PHP会将字符串'pay'尝试转换为数字
//          转换规则：检查字符串开头是否有数字
//          'pay'开头没有数字，所以转换结果为0
//          最终比较：0 == 0，返回true
if (0 == 'pay') {
    echo '1. 0 == "pay" 返回 true ✓'; // 会执行
    echo "\n   原因：'pay'开头无数字，转数字为0\n";
}

// 示例2：字符串'0' vs 字符串'pay'  
// 都是字符串时直接比较内容
// 详细说明：比较 '0' == 'pay' 时，两边都是字符串类型
//          PHP不会进行类型转换，直接比较字符串内容
//          '0'和'pay'内容不同，所以返回false
if ('0' == 'pay') {
    echo '2. 不会执行';
} else {
    echo '2. "0" == "pay" 返回 false ✓';
    echo "\n   原因：字符串内容不同\n";
}

// 示例3：数字0 vs 科学计数法'0e123'
// 科学计数法 0e123 = 0 × 10^123 = 0
// 详细说明：比较 0 == '0e123' 时，字符串'0e123'转换为数字
//          '0e123'是科学计数法：0 × 10^123 = 0
//          最终比较：0 == 0，返回true
// 注意：这也是安全漏洞常见点，如md5('240610708')='0e462097431906509019562988736854'
if (0 == '0e123') {
    echo "\n3. 0 == \"0e123\" 返回 true ✓";
    echo "\n   原因：科学计数法计算后也是0\n";
}
?>
```

## MD5对比缺陷

进行hash加密出来的字符串如存在0e开头进行弱比较的话会直接判定为true

```
QNKCDZO
0e830400451993494058024219903391

240610708
0e462097431906509019562988736854

s878926199a
0e545993274517709034328855841020

s155964671a
0e342768416822451524974117254469

s214587387a
0e848240448830537924465865611904 

s214587387a
0e848240448830537924465865611904

s878926199a
0e545993274517709034328855841020

s1091221200a
0e940624217856561557816327384675

s1885207154a
0e509367213418206700842008763514
```

 ![image-20260205193659189](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205193659189.png)

![image-20260205193713620](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205193713620.png)

## 函数strcmp类型比较缺陷 

低版本的strcmp比较的是字符串类型，如果强行传入其他类型参数，会出错，出错后返回值0，正是利用这点进行绕过

 要求对方是低版本，实战很少见。

![image-20260205194135034](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205194135034.png)

## 函数Bool类型比较缺陷

在使用 json_decode() 函数或 unserialize() 函数时，部分结构被解释成 bool 类型，也会造成缺陷，运行结果超出研发人员的预期

### json_decode()

#### 正常传参情况

![image-20260205194654633](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205194654633.png)

#### 绕过

修改为真即可绕过。

![image-20260205194729566](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205194729566.png)

### unserialize()

#### 正常传参情况

a代表的是参数，意为包含2个参数。s代表的是string，4就是位数，user。后面同理。

![image-20260205195333093](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205195333093.png)

#### 绕过

这里其实同上，b的意思就是bool，1代表的就是真。

![image-20260205195428890](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205195428890.png)

## 函数switch 类型比较缺陷

当在switch中使用case判断数字时，switch会将参数转换为int类型计算

强制转换后，如果前面的参数对了的话，其后的内容无论是什么都无所谓。

![image-20260205195848467](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205195848467.png)

## 函数in_array数组比较缺陷

当使用in_array()或array_search()函数时，如果第三个参数没有设置为true，则in_array()或array_search()将使用松散比较来判断

### in_array()

 ![image-20260205200217978](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205200217978.png)

![image-20260205200230850](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205200230850.png)

![image-20260205200241949](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205200241949.png)

### array_search()

![image-20260205200323477](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205200323477.png)

## ===数组比较缺陷

注意此时遇到的是 “===” ，不过也不是代表无从下手。在md5()函数传入数组时会报错返回NULL，当变量都导致报错返回NULL时就能使使得条件成立。

![image-20260205200412998](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205200412998.png)

### md5案例

32字符十六进制数字形式返回散列值。

在url中拼接为数组形式即可绕过，必须是md5。

![image-20260205201256980](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205201256980.png)

![image-20260205201528213](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205201528213.png)

![image-20260205201556923](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205201556923.png)

## 案例

### 代码审CMS

https://mp.weixin.qq.com/s/k1hRg7cmRwwJJyyX04Ipmg

条件很苛刻，必须要对方采用加密后的密码为0e开头。

![image-20260205202108245](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205202108245.png)

![image-20260205202115670](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205202115670.png)

![image-20260205202146225](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205202146225.png)

![image-20260205202206392](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205202206392.png)

![image-20260205202216835](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205202216835.png)

### CTF题目0

https://ctf.bugku.com/challenges/detail/id/72.html

![image-20260205202558994](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205202558994.png)

### CTF题目1

https://ctf.bugku.com/challenges/detail/id/94.html

参考md5对比缺陷，直接传一个加密后为0e开头的密码就可以。

![image-20260205202655198](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260205202655198.png)
