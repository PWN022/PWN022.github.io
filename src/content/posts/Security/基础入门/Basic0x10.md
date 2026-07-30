---
title: 算法解密&散列对称非对称&字典碰撞&前后端逆向&MD5&AES&DES&RSA
published: 2026-01-23 12:00:00
description: 加密的特征：MD5(32/16 位 0-9a-f)、Base64(尾部==)、AES/DES(密文带/+)、RSA(长度，公/密钥)。解密：后端有源码看salt+hash，没有源码就字典撞库、前端看js，把密钥或者算法保存本地跑通，再写payload。最后还有在线解密工具，前提是如果得到了加密方式或者公/密钥。
tags: [基础入门]
category: 网络安全
draft: false
---

# 知识点

1. 算法类型-单向散列&对称性&非对称性
2. 算法识别加解密-MD5&AES&DES&RSA
3. 解密条件寻找-逻辑特征&源码中&JS分析

安全测试中：

密文-有源码直接看源码分析算法（后端必须要有源码才能彻底知道）。

密文-没有源码 1、猜识别 2、看前端JS（加密逻辑是不是在前端）。

## 算法加密-概念&分类&类型

1. 单向散列加密 -MD5 

   单向散列加密算法的优点有(以MD5为例)：

   方便存储，损耗低：加密/加密对于性能的损耗微乎其微。

   单向散列加密的缺点就是存在暴力破解的可能性，最好通过加盐值的方式提高安全性，此外可能存在散列冲突。我们都知道MD5加密也是可以破解的。

   常见的单向散列加密算法有：

   MD5 SHA MAC CRC

   **解密条件：密文即可，采用碰撞解密，几率看明文复杂程度**

2. 对称加密 -AES

   对称加密优点是算法公开、计算量小、加密速度快、加密效率高。

   缺点是发送方和接收方必须商定好密钥，然后使双方都能保存好密钥，密钥管理成为双方的负担。

   常见的对称加密算法有：

   DES AES RC4

   **解密条件：密文及密钥偏移量，采用逆向算法解密，条件成立即可解密成功**

3. 非对称加密 -RSA

   非对称加密的优点是与对称加密相比，安全性更好，加解密需要不同的密钥，公钥和私钥都可进行相互的加解密。

   缺点是加密和解密花费时间长、速度慢，只适合对少量数据进行加密。

   常见的非对称加密算法：

   RSA RSA2 PKCS

   **解密条件：密文和公钥或私钥，采用逆向算法解密，条件成立即可解密成功**

## 加密解密-识别特征&解密条件

### 识别特征

#### MD5

MD5密文特点：

- 由数字“0-9”和字母“a-f”所组成的字符串
- 固定的位数 16 和 32位

**解密需求：密文即可，但复杂明文可能解不出**

#### Base64

BASE64编码特点：

- 大小写区分，通过数字和字母的组合
- 一般情况下密文尾部都会有两个等号，明文很少的时候则没有
- 明文越长密文越长，一般不会出现"/""+"在密文中

#### AES和DES

AES、DES密文特点：

同BASE64基本类似，但一般会出现"/"和"+"在密文中

**解密需求：密文，模式，加密Key，偏移量，条件满足才可解出**

#### RSA

RSA密文特点：

特征同AES,DES相似，但是长度较长

**解密需求：密文，公钥或私钥即可解出**

#### 其他

其他密文特点见：

1. 30余种加密编码类型的密文特征分析（建议收藏）

   https://mp.weixin.qq.com/s?__biz=MzAwNDcxMjI2MA==&mid=2247484455&idx=1&sn=e1b4324ddcf7d6123be30d9a5613e17b&chksm=9b26f60cac517f1a920cf3b73b3212a645aeef78882c47957b9f3c2135cb7ce051c73fe77bb2&mpshare=1&scene=23&srcid=1111auAYWmr1N0NAs9Wp2hGz&sharer_sharetime=1605145141579&sharer_shareid=5051b3eddbbe2cb698aedf9452370026#rd

2. CTF中常见密码题解密网站总结（建议收藏）

   https://blog.csdn.net/qq_41638851/article/details/100526839

3. CTF密码学常见加密解密总结（建议收藏）

   https://blog.csdn.net/qq_40837276/article/details/83080460

### 解密条件

#### 密码存储（后端处理）

##### X3.2-md5&salt

![image-20260123111149464](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123111149464.png)

![image-20260123111224774](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123111224774.png)

```php
//DZ对应代码段-/uc_server/model/user.php
function add_user() {
		$password = md5(md5($password).$salt);
    }

//基础版
<?PHP
$h = 'd7192407bb4bfc83d28f374b6812fbcd';
$hash=md5(md5('123456').'3946d5');
if($h==$hash){
	echo 'ok';
}else{
	echo 'no';
}
?>

//可导入字典版
<?php
function reverse_md5_hash_with_salt($final_hash, $salt, $dictionary_file) {
    // 打开字典文件
    $file = fopen($dictionary_file, "r");
    if (!$file) {
        die("无法打开字典文件！");
    }

    // 遍历字典文件中的每一行（即每一个密码）
    while (($password = fgets($file)) !== false) {
        // 去除密码两侧的空白字符（包括换行符）
        $password = trim($password);

        // 第一次 MD5 加密密码
        $md5_hash = md5($password);

        // 拼接 md5($password) 和 salt
        $salted_hash = $md5_hash . $salt;

        // 第二次 MD5 加密
        $final_attempt = md5($salted_hash);

        // 检查是否匹配
        if ($final_attempt === $final_hash) {
            fclose($file);
            return $password;  // 找到匹配的密码
        }
    }

    // 如果没有找到匹配的密码
    fclose($file);
    return null;
}

// 给定的目标加密值和盐值
$final_hash = "125648dbf16531ab7e6b2f8ec8003ea7";  // 目标 MD5 值
$salt = "3e3790";  // 盐值

// 字典文件路径
$dictionary_file = "weaksauce.txt";  // 字典文件路径

// 调用函数进行密码破解
$password = reverse_md5_hash_with_salt($final_hash, $salt, $dictionary_file);

// 输出结果
if ($password) {
    echo "破解成功，密码是: $password";
} else {
    echo "密码破解失败";
}
?>
```

##### X3.5-hash

![image-20260123111253244](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123111253244.png)

```php
//DZ对应代码段-/uc_server/model/user.php
function add_user() {
		$salt = '';
		$password = $this->generate_password($password);
    }

	function generate_password($password) {
		$algo = $this->get_passwordalgo();
		$options = $this->get_passwordoptions();
		$hash = password_hash($password, $algo, $options);
	}

//基础版本
<?PHP
$hash = '$2y$10$KA.7VYVheqod8F3X65tWjO3ZXfozNA2fC4oIZoDSu/TbfgKmiw7xO';
if (password_verify('123456', $hash)) {
    echo 'ok';
} else {
    echo 'error';
}
?>


//可导入字典版本
<?PHP
$hash = '$2y$10$PDACNCRyZzcsknF8zvL4yu7YHIPQTN8F635PxQeXSB8QxxDZSXrd.';


$dictionary_file = "weaksauce.txt";
$file = fopen($dictionary_file, "r");
    if (!$file) {
        die("无法打开字典文件！");
    }

    // 遍历字典文件中的每一行（即每一个密码）
    while (($password = fgets($file)) !== false) {
        // 去除密码两侧的空白字符（包括换行符）
        $password = trim($password);
        echo $password."<br>";
        
        if (password_verify($password, $hash)) {
            echo 'ok';
        } else {
            echo 'error';
        } 
    }
?>
```

#### 数据通讯（前端处理）

##### 博客登录-zblog

![image-20260123111423500](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123111423500.png)

![image-20260123111524796](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123111524796.png)

![image-20260123111628874](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123111628874.png)

```js
<script src="script/md5.js" type="text/javascript"></script>
$("#btnPost").click(function(){
    var strPassWord=$("#edtPassWord").val();
    $("form").attr("action","cmd.php?act=verify");
    $("#password").val(MD5(strPassWord));
```

```
//可以在控制台进行调试检验
console.log(MD5("123456"));
```

**在实战环境中，一般都是将js文件保存到本地进行调试。**

![image-20260123111832673](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123111832673.png)

##### 某快递登录-混合加密

老演员了，但是现在好像已经更换新的登录方式以及接口了，以前的那个登录界面已经访问不到了。

![image-20260123113016879](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123113016879.png)

![image-20260123113202106](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123113202106.png)

![image-20260123113229748](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123113229748.png)

![image-20260123113251226](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123113251226.png)

```js
<script src="/Scripts/Vip/Login.js?v=20241202154949"></script>
function Login() {
	logindata.UserName = encodeURI(encrypt.encrypt(numMobile));
	logindata.Mobile = encodeURI(encrypt.encrypt(numMobile));;
	logindata.Password = encodeURI(encrypt.encrypt(numPassword));
}
var encrypt = new JSEncrypt();
encodeURI(encrypt.encrypt('13554365566'));
```

![image-20260123113522348](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123113522348.png)

![image-20260123113534723](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123113534723.png)

![image-20260123113544018](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123113544018.png)

```
var encrypt = new JSEncrypt();
encodeURI(encrypt.encrypt('13554365566'));
```

![image-20260123113602029](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123113602029.png)

#### 密文

明确以下三种加密算法加解密条件

对称AES/DES加解密，非对称RSA加解密

##### 对称AES加解密

![image-20260123114141028](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114141028.png)

![image-20260123114151015](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114151015.png)

![image-20260123114206471](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114206471.png)

![image-20260123114218365](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114218365.png)

![image-20260123114247219](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114247219.png)

##### 对称DES加解密

![image-20260123114405695](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114405695.png)

![image-20260123114416708](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114416708.png)

![image-20260123114426207](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114426207.png)

![image-20260123114456175](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114456175.png)

![image-20260123114618737](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114618737.png)

##### 非对称RSA加解密

**数据如果用公钥加密，就需要用私钥解密。如果用私钥加密，就用公钥解密。**

![image-20260123114635716](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114635716.png)

![image-20260123114721964](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114721964.png)

![image-20260123114742599](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260123114742599.png)

解密：http://tool.chacuo.net/cryptdes

### 应用场景

1. 发送数据的时候自动将数据加密发送（只需加密即可）

   安全测试思路：我们需要将我们的Payload也要加密发送过去，这样才符合正常的业务逻辑，所以我们就只需要调用应用的JS加密逻辑进行提交发送测试即可！

2. 比如要得到数据的明文（必须要拿到解密算法）

   由于各种算法的解密条件不一，密钥，偏移量，私钥等不一定能拿到。

对于后续安全测试影响较大的：

1. 目标：API接口、前后端分离应用居多。
2. 漏洞发现：未授权、各类漏洞测试、爆破等。
3. 其他（后期补充）。
