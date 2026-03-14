---
title: JavaEE应用&动态接口代理&原生反序列化&危险Invoke&重写方法&利用链
published: 2026-03-13 12:00:00
description: 当程序对攻击者可控的数据进行反序列化时，会自动触发对象中预定义的readObject()、toString()等方法，如果这些方法中包含了危险操作（如命令执行），或者可以通过反射+类加载组合成利用链调用任意方法，就可能导致远程代码执行。
tags: [Web开发,JavaEE]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-JavaEE-动态代理&序列化&反序列化
2. 安全开发-JavaEE-readObject&toString方法

反序列化时自动执行对象中的特定方法 → 攻击者通过构造特殊数据 → 控制程序执行任意代码

# 抽象理解

| 技术         | 比喻                 | 角色         |
| :----------- | :------------------- | :----------- |
| **反序列化** | 打电话给餐厅         | **触发动作** |
| **反射**     | 万能钥匙，能开任何门 | **执行工具** |
| **类加载**   | 骑手从任何地方取餐   | **运送手段** |

## 第一步：反序列化

```
// 攻击者构造了一个"特殊"的外卖订单
// 这个订单看起来正常，但其实是精心设计的
```

就像你打电话给餐厅，但电话那头是**攻击者假扮的接线员**。

## 第二步：反射

```
// 攻击者不知道餐厅的厨房在哪里
// 但反射可以：打开任何门、拿任何东西、做任何事
```

就像攻击者混进餐厅，用万能钥匙：

- 打开储藏室（获取Runtime）
- 打开后门（绕过安全检查）
- 打开保险柜（访问私有数据）

## 第三步：类加载

```
// 攻击者不需要自己做饭
// 让骑手从任何地方取餐（甚至从攻击者服务器）
```

就像骑手可以从：

- 正常餐厅取餐（本地类）
- 黑客开的黑店取餐（远程恶意类）
- 任何地方取任何东西

# 动态代理

![image-20260313101345188](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260313101345188.png)

代理模式Java当中最常用的设计模式之一。其特征是代理类与委托类有同样的接口，代理类主要负责为委托类预处理消息、过滤消息、把消息转发给委托类，以及事后处理消息等。而Java的代理机制分为静态代理和动态代理，而这里我们主要重点学习java自带的jdk动态代理机制。

## 创建接口及定义方法

User.java接口

```java
public interface User {
    void YourName(String name,int score);
}
```

## 实现接口及定义方法操作

UserImpt.java

```java
public class UserImpt implements User{
    public void YourName(String name,int score){
        System.out.println("hi"+name+", and how was my exam result?");
    }
}
```

## 实现接口及重写invoke方法

UserImptHandler.java

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class UserImptHandler implements InvocationHandler {
    private Object target;

    public UserImptHandler(Object target){
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 前置
        System.out.println("Hello, i'm"+args[0]);

        // method = YourName 方法
        // target = UserImpt 对象
        // args = [" lucius"]
        // 相当于执行 userImpt.YourName(" lucius")
        // 调用真实对象的方法
        Object invoke = method.invoke(target,args);

        // 后置
        System.out.println("you're passed, the score is "+args[1]);
        return invoke;
    }
}
```

## 创建代理对象并调用方法

UserProxy.java

```java
import java.lang.reflect.Proxy;

public class UserProxy {
    public static void main(String[] args) {
        // 创建目标对象
        User user = new UserImpt();
        // 创建 UserImptHanlder
        UserImptHandler userImptHandler = new UserImptHandler(user);

        // 创建代理对象
        User proxy = (User) Proxy.newProxyInstance(
                UserImpt.class.getClassLoader(),
                new Class[]{User.class},
                userImptHandler
        );

        proxy.YourName(" lucius",90);
        proxy.YourName(" test",88);
    }
}
```

### 安全总结：利用条件分析&执行invoke

在上述代码中，关键部分为invoke方法。

**在使用proxy动态代理的时候，invoke方法会默认执行。**

### 安全案例：Ysoserial-CC1链-LazyMap

详细可以看着篇文章：https://www.cnblogs.com/leyilea/p/18426165

# 反序列化

## 序列化与反序列化（见图）

![image-20260313095220086](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260313095220086.png)

![image-20260313115136332](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260313115136332.png)

序列化：将内存中的对象压缩成字节流

反序列化：将字节流转化成内存中的对象

序列化与反序列化其实就是对象与数据格式的转换。

## 为什么有序列化技术

序列化与反序列化的设计就是用来传输数据的。

当两个进程进行通信的时候，可以通过序列化反序列化来进行传输。

能够实现数据的持久化，通过序列化可以把数据永久的保存在硬盘上，也可以理解为通过序列化将数据保存在文件中。

应用场景：

(1) 想把内存中的对象保存到一个文件中或者是数据库当中。

(2) 用套接字在网络上传输对象。

(3) 通过RMI传输对象的时候。

## 常见的创建的序列化和反序列化协议

```
JAVA内置的writeObject()/readObject()

JAVA内置的XMLDecoder()/XMLEncoder

XStream

SnakeYaml

FastJson

Jackson
```

## 为什么会出现反序列化安全问题

JAVA内置的writeObject()/readObject()内置原生写法分析：

writeObject():主要用于将 Java 对象序列化为字节流并写入输出流

readObject():主要用于从输入流中读取字节序列反序列化为 Java 对象

FileInputStream：其主要作用是从文件读取字节数据

FileOutputStream：其主要作用是将字节数据写入文件

ObjectInputStream：用于从输入流中读取对象，实现对象的反序列化操作

ObjectOutputStream：用于将对象并写入输出流的类，实现对象的序列化操作

## 序列化-wtriteObject

SerializableTest.java

```java
import java.io.*;

public class SerializableTest {
    public static void main(String[] args) throws IOException {
        // 实例化User对象
        User user = new User("admin",18,"localhost");

        // 调用序列化方法并指向对象User并赋值
        SerializableTest(user);
    }

    public static void SerializableTest(User user) throws IOException {
        // FileOutputStream() 输出文件
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.txt"));

        // 将对象obj写入输出到文件ser.txt
        // 序列化操作
        oos.writeObject(user);
    }
}
```

执行之后会在当前项目根目录多出一个名为ser.txt的文件。

## 反序列化-readObject

UnSerializableTest.java

```java
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.ObjectInputStream;

public class UnSerializableTest {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        Object o = UnSerializableTest("ser.txt");
        System.out.println(o);

    }

    public static Object UnSerializableTest(String Filename) throws IOException, ClassNotFoundException {
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(Filename));
        Object o = ois.readObject();
        return o;
    }
}
```

## 利用看下面

### 看序列化的对象有没有重写readObject方法（危险代码）

User类：

在User类中添加一个readObject方法：

```java
    private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
        // 指向正确的readObject
        // defaultReadObject() 负责正常反序列化对象字段
        // 如果注释掉它，对象字段（name、age、address）不会被正确读取
//        ois.defaultReadObject();
        System.out.println("user->readObject");
        Runtime.getRuntime().exec("calc");
    }
```

调用User类中的恶意readObject（弹出计算器）

### 看序列化的对象有没有被输出,就会调用toString方法（危险代码）

Java类：

在toString方法中添加输出内容

```java
//原
@Override
    public String toString() {
        System.out.println("user toString");
        return  "username=" + name + ", age=" + age + ", address=" + address;
    }

// 修改代码1
// 加上弹出计算器
@Override
    public String toString() {
        System.out.println("user toString");
        try {
            Runtime.getRuntime().exec("calc");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return  "username=" + name + ", age=" + age + ", address=" + address;
    }

// 修改代码2
// 这种就是跟链
@Override
    public String toString() {
        System.out.println("user toString");
        try {
            // 看起来不知道是什么函数，CTRL+鼠标左键跟一下
            hanshu("calc");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return  "username=" + name + ", age=" + age + ", address=" + address;
    }

private void hanshu(String cmd) throws IOException {
    // 发现该危险代码
        Runtime.getRuntime().exec(cmd);
    }
```

反序列化代码中：

```java
public static void main(String[] args) throws IOException, ClassNotFoundException {
        Object o = UnSerializableTest("ser.txt");
    // 在反序列化时如果对这个反序列化对象进行输出的时候就会触发toString方法
        System.out.println(o);
    }
```

### 其他类的readObject或toString方法（反序列化类可控）

新建一个Calc类：

```java
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.Serializable;

public class Calc implements Serializable {
    private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
        System.out.println("calc->readObject");
        Runtime.getRuntime().exec("calc");
    }

    @Override
    public String toString() {
        return "我是一个恶意Calc对象，专门用来弹计算器！";
    }
}
```

序列化代码：序列化calc类

```java
import java.io.*;

public class SerializableTest {
    public static void main(String[] args) throws IOException {
        // 实例化User对象
        User user = new User("admin",18,"localhost");
        // 这里实例化能利用到readObject的类
        Calc calc = new Calc();

        // 调用序列化方法并指向对象calc并赋值
        SerializableTest(calc);
    }

    public static void SerializableTest(Calc calc) throws IOException {
        // FileOutputStream() 输出文件
        // 修改这部分的文件名
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("sercalc.txt"));

        // 将对象obj写入输出到文件sercalc.txt
        // 序列化操作
        oos.writeObject(calc);
    }
}
```

反序列化：

```java
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.ObjectInputStream;

public class UnSerializableTest {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        // 在反序列化的时候如果这个序列化的对象文件可控
        Object o = UnSerializableTest("sercalc.txt");
        System.out.println(o);
    }

    public static Object UnSerializableTest(String Filename) throws IOException, ClassNotFoundException {
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(Filename));
        Object o = ois.readObject();
        return o;
    }
}

```

#### 安全问题

```java
// SerializableTest.java
public class SerializableTest {
    public static void main(String[] args) throws IOException {
        // 两个安全问题
        // 1.在序列化的时候，序列化的对象是否可控
        User user = new User("admin",18,"localhost");
        Calc calc = new Calc();

        SerializableTest(user);
    }
    
// UnSerializableTest.java
public static void main(String[] args) throws IOException, ClassNotFoundException {
    // 2.在反序列化的时候，反序列化的对象文件是否可控
        Object o = UnSerializableTest("sercalc.txt");
        System.out.println(o);
    }
```

## 反序列化利用链

1. 入口类的readObject直接调用危险方法
2. 入口参数中包含可控类，该类有危险方法，readObject时调用
3. 入口类参数包含可控类，该类又调用其他有危险方法类，readObject调用
4. 构造函数/静态代码块等类加载时隐式执行

## 反序列化利用条件

1. 可控的输入变量进行了反序列化操作
2. 实现了Serializable或者Externalizable接口的类的对象
3. 能找到调用方法的危险代码或间接的利用链引发（依赖链）