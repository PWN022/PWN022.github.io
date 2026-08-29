---
title: 代码混淆&EVAL执行&OB算法&AA和JJ&特征识别&解密还原&美化输出&自动项目
published: 2026-08-22 19:06
description: 暂时没有准备好
tags:
  - JS逆向
  - 代码混淆
category: 网络安全
draft: true
---

# 知识点

1. JS逆向-代码混淆-加密意义&常见方法
2. JS逆向-代码混淆-特征识别&自动分析

# 混淆JavaScript代码主要意义

1、防止代码被逆向工程：混淆使得代码的逻辑变得晦涩难懂，使攻击者难以理解代码的运行原理。这可以防止恶意用户或竞争对手直接分析、修改或复制代码。

2、保护知识产权：混淆代码可以防止他人盗用和复制您的代码。通过混淆，您可以更好地保护您的知识产权，确保您的代码不会被滥用或未经授权使用。

3、减少代码大小：混淆技术可以压缩和优化代码，从而减小代码的大小，提高加载速度和性能。

4、提高安全性：通过混淆代码，可以隐藏敏感信息、算法和逻辑，从而增加代码的安全性。这对于处理敏感数据或执行关键任务的应用程序特别重要。

5、避免自动化攻击：混淆代码可以使自动化攻击工具难以识别和分析代码。这可以有效地阻止一些常见的攻击，如代码注入、XSS（跨站点脚本）和CSRF（跨站点请求伪造）等。

# 常见解密

1、人工分析：

看特征或代码注释找到关键加密字（加上后续的AST技术）

2、平台自动：

https://jsdec.js.org/

https://lelinhtinh.github.io/de4js/

涉及平台项目：

https://www.jshaman.com/

https://c.runoob.com/front-end/51/

https://tool.ip138.com/javascript/

https://www.sojson.com/jsjiemi.html

https://utf-8.jp/public/jjencode.html

https://tool.chinaz.com/tools/jscodeconfusion.aspx

https://github.com/mishoo/UglifyJS

github.com/javascript-obfuscator/javascript-obfuscator

# 认知常见混淆手法

https://scrape.center/

`eval,JJEncode,AAEncode,JSFuck,Obfuscator`等混淆还原

## eval

### 特征：出现关键字`eval`

数据包代码中出现了：

```js
<script>eval(function(p,a,c,k,e,r){e=function(c){return(c<62?'':e(parseInt(c/62)))+((c=c%62)>35?String.fromCharCode(c+29):c.toString(36))};if('0'.replace(0,e)==0){while(c--)r[e(c)]=k[c];k=[function(e){return r[e]||e}];e=function(){return'[0-9a-zA-D]'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('g h=[{0:\'凯文-杜兰特\',4:\'durant.5\',1:\'b-09-c\',2:\'i\',3:\'108.j\'},{0:\'勒布朗-詹姆斯\',4:\'james.5\',1:\'k-12-30\',2:\'206cm\',3:\'113.l\'},{0:\'斯蒂芬-库里\',4:\'curry.5\',1:\'b-7-14\',2:\'m\',3:\'83.j\'},{0:\'詹姆斯-哈登\',4:\'harden.5\',1:\'1989-n-26\',2:\'196cm\',3:\'99.8\'},{0:\'扬尼斯-安特托昆博\',4:\'antetokounmpo.5\',1:\'o-12-d\',2:\'p\',3:\'109.8\'},{0:\'拉塞尔-威斯布鲁克\',4:\'westbrook.5\',1:\'b-11-12\',2:\'m\',3:\'90.7KG\'},{0:\'凯里-欧文\',4:\'irving.5\',1:\'1992-7-23\',2:\'q\',3:\'r.9\'},{0:\'安东尼-戴维斯\',4:\'davis.5\',1:\'1993-7-11\',2:\'i\',3:\'114.8\'},{0:\'乔尔-恩比德\',4:\'embiid.5\',1:\'o-7-16\',2:\'s\',3:\'127.0KG\'},{0:\'克雷-汤普森\',4:\'thompson.5\',1:\'t-u-n\',2:\'198cm\',3:\'97.9\'},{0:\'考瓦伊-莱昂纳德\',4:\'leonard.5\',1:\'1991-d-c\',2:\'201cm\',3:\'102.1KG\'},{0:\'达米安-利拉德\',4:\'lillard.5\',1:\'t-07-15\',2:\'q\',3:\'r.9\'},{0:\'卡梅罗-安东尼\',4:\'anthony.5\',1:\'k-v-c\',2:\'203cm\',3:\'108KG\'},{0:\'尼科拉-约基奇\',4:\'jokic.5\',1:\'w-u-19\',2:\'s\',3:\'128.8\'},{0:\'卡尔-安东尼-唐斯\',4:\'towns.5\',1:\'w-11-15\',2:\'p\',3:\'112.9\'},{0:\'克里斯-保罗\',4:\'paul.5\',1:\'1985-v-d\',2:\'185cm\',3:\'79.l\'},];new Vue({el:\'#app\',data:function(){x{h,a:\'NAhwcEVLEnRoJA7acv6eZGvXWjtijppyHXh\'}},methods:{getToken(y){e a=6.f.z.A(this.a);g{0,1,2,3}=y;e B=6.f.Base64.stringify(6.f.z.A(0));e C=6.DES.encrypt(`${B}${1}${2}${3}`,a,{D:6.D.ECB,padding:6.pad.Pkcs7});x C.toString()}}})',[],40,'name|birthday|height|weight|image|png|CryptoJS|03|8KG|5KG|key|1988|29|06|let|enc|const|players|208cm|9KG|1984|4KG|191cm|08|1994|211cm|188cm|88|213cm|1990|02|05|1995|return|player|Utf8|parse|base64Name|encrypted|mode'.split('|'),0,{}))</script>
```

js代码种出现了关键字`eval`，而且通过对传统开发的了解，像以上这种就是经过加密的代码

### 还原：控制台输出（去除eval()后）给函数名，新建JS文件优化

将`eval`括号中的内容复制出来，在控制台中任意给一个函数名：

```
>aaa=function(…………)',
<·"const players=[{name:'凯文-杜兰特',image:'durant.png',birthday:'1988-09-29',height:'208cm',weight:'108.9KG'}…………
```

目前的代码看起来才正常，还可以复制结果到一个新建的js文件中，这样看起来更明显

在chrome中->复制返回的`const`（从const开始复制）数据->源代码/来源栏->代码段标签页，新建文件->粘贴->代码框左下角格式化当前文件

最后得到：

```js
const players = [{
    name: '凯文-杜兰特',
    image: 'durant.png',
    birthday: '1988-09-29',
    height: '208cm',
    weight: '108.9KG'
}, {
    name: '勒布朗-詹姆斯',
    image: 'james.png',
    birthday: '1984-12-30',
    height: '206cm',
    weight: '113.4KG'
}, 
// ………………………………………………
];
new Vue({
    el: '#app',
    data: function() {
        return {
            players,
            key: 'NAhwcEVLEnRoJA7acv6eZGvXWjtijppyHXh'
        }
    },
    methods: {
        getToken(player) {
            let key = CryptoJS.enc.Utf8.parse(this.key);
            const {name, birthday, height, weight} = player;
            let base64Name = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(name));
            let encrypted = CryptoJS.DES.encrypt(`${base64Name}${birthday}${height}${weight}`, key, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return encrypted.toString()
        }
    }
})
```

## JJEncode

特征：包含很多`[ ]、()、+、!`

js中的代码如下：

```
$=~[];$={___:++$,$$$$:(![]+"")[$],………………+"\\"+$.__$+$.$_$+$.__$+"\\"+$.__$+$.$_$+$.$$_+"\\"+$.__$+$.$__+$.$$$+"()}}})\\"+$.__$+$._$_+"\"")())();
```

还原：控制台输出（一般去除()调用后）点击查看或直接运行

复制完整的，只去除掉末尾的`();`，控制台输出：

```
<·ƒ anonymous(
) {
const players=[{name:'凯文-杜兰特',image:'durant.png',birthday:'1988-09-29',height:'208cm',weight:'108.9KG'},{name:'勒布朗-詹姆斯',image:'james.png',birthday:'1984-12-30',height:'206cm',weight:'1…
```

返回的代码同上

## AAEncode

特征:包含很多颜文字

```
ﾟωﾟﾉ= /｀ｍ´）ﾉ ~┻━┻   //*´∇｀*/ ['_']; o=(ﾟｰﾟ)  =_=3; c=(ﾟΘﾟ) =(ﾟｰﾟ)-(ﾟｰﾟ); ………………('_');
```

还原：控制台输出（一般去除()调用后）点击查看或直接运行

去除掉末尾的`('_');`即可，返回的代码同上

## JSFuck

特征：包含很多`[ ]、()、+、!`

```
[][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]………………[+!+[]]]()[+!+[]+[!+[]+!+[]]])())
```

还原：控制台输出（去除末尾`)`前的最后一个`()`调用后）点击查看或直接运行

但是这次返回的结果不同：

```js
(function anonymous() {
    return "\143\157ns\………………
}
)
```

在浏览器控制台上查看不了，将原代码放到代码编辑器中（原封不动），我这里使用的是vscode，node运行一下

```js
PS F:\jsre> node .\jsfuck.js
<anonymous_script>:1
const players = [{   name: '凯文-杜兰特',   image: 'durant.png',   birthday: '1988-09-29',   height: '208cm',   weight: '108.9KG' }, {name: '勒布朗-詹姆斯', image: 'james.png', birthday: '1984-12-30', height: '206cm', weight: '113.4KG'}, {   name: '斯蒂芬-库里',   image: 'curry.png',   birthday: '1988-03-14',   height: '191cm',   weight: '83.9KG' }, {name: '詹姆斯-哈登', image: 'harden.png', birthday: '1989-08-26', height: '196cm', weight: '99.8KG'}, {   name: '扬尼斯-安特托昆博',   image: 'antetokounmpo.png',   birthday: '1994-12-06',   height: '211cm',   weight: '109.8KG' }, {   name: '拉塞尔-威斯布鲁克',   image: 'westbrook.png',   birthday: '1988-11-12',   height: '191cm',   weight: '90.7KG' }, {name: '凯里-欧文', image: 'irving.png', birthday: '1992-03-23', height: '188cm', weight: '88.5KG'}, {   name: '安东尼-戴维斯',   image: 'davis.png',   birthday: '1993-03-11',   height: '208cm', weight: '114.8KG' }, {name: '乔尔-恩比德', image: 'embiid.png', birthday: '1994-03-16', height: '213cm', weight: '127.0KG'}, {   name: '克雷-汤普森',  image: 'thompson.png',   birthday: '1990-02-08',   height: '198cm',   weight: '97.5KG' }, {   name: '考瓦伊-莱昂纳德',   image: 'leonard.png',   birthday: '1991-06-29',   height: '201cm',   weight: '102.1KG' }, {name: '达米安-利拉德', image: 'lillard.png', birthday: '1990-07-15', height: '188cm', weight: '88.5KG'}, {   name: '卡梅罗-安东尼',   image: 'anthony.png',   birthday: '1984-05-29',   height: '203cm',   weight: '108KG' }, {   name: '尼科拉-约基奇',   image: 'jokic.png',   birthday: '1995-02-19',   height: '213cm',   weight: '128.8KG' }, {name: '卡尔-安东尼-唐斯', image: 'towns.png', birthday: '1995-11-15', height: '211cm', weight: '112.5KG'}, {   name: '克里斯-保罗',   image: 'paul.png',   birthday: '1985-05-06',   height: '185cm',   weight: '79.4KG' },]; new Vue({   el: '#app', data: function () {     return {players, key: 'wUeziGfVEsfgHMpA8mVZcwwM8oNgsGHQFNu'}   }, methods: {     getToken(player) {       let key = CryptoJS.enc.Utf8.parse(this.key);       const {name, birthday, height, weight} = player;       let base64Name = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(name));       let encrypted = CryptoJS.DES.encrypt(`${base64Name}${birthday}${height}${weight}`, key, {         mode: CryptoJS.mode.ECB,         padding: CryptoJS.pad.Pkcs7       });       return encrypted.toString()     }   } })
```

## Obfuscator

特征：包含很多——0x字母无意义的字符串，阅读难度增加

```js
const _0x4afa = ['\x31\x39\x39\x33\x2d\x30\x33\x2d\x31\x31', ………………'];
(function(_0x35db0b, _0x4afab2) {
    ………………
}(_0x4afa, 0xed));
const _0x3431 = function(_0x35db0b, _0x4afab2) {
    ………………
new Vue({
    ………………
```

还原：控制台输出美化代码断点调试输出分析，利用AST技术解密还原

目前`Obfuscator`混淆还没有平台和工具能够百分百还原代码，如果想百分百还原出代码需要用到`AST`技术

平台自动解密

国内： [https://jsdec.js.org/](https://jsdec.js.org/)

国内这个平台解密的话会直接提示失败，只能选择美化，看出大概的数据

国外：[https://lelinhtinh.github.io/de4js/](https://lelinhtinh.github.io/de4js/)

国外这个平台也是无法完全解密，但是能还原部分代码，以及一些数据

# 案例解析

## Eval案例


## JSFuck案例


## JSJaiMi案例


## Obfuscator案例


