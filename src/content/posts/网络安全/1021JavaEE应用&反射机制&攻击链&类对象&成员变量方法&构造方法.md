---
title: JavaEE应用&反射机制&攻击链&类对象&成员变量方法&构造方法
published: 2025-10-21
description: JavaEE利用反射获取成员变量、构造方法、成员方法，及不安全命令执行与反序列化链。
tags: [JavaEE,安全开发]
category: 网络安全
draft: false
---

## 小插曲

因为昨天做监听的时候，发现服务器打印出来的中文乱码，于是今天解决了一下，首先排除了idea的问题，因为编码都是UTF-8，于是就对tomcat进行检查，首先就是让tomcat启动窗用UTF-8，

路径在`%CATALINA_HOME%\conf\logging.properties`把文件中的参数改为UTF-8，可以参考下方。

```
java.util.logging.ConsoleHandler.encoding = UTF-8
1catalina.org.apache.juli.AsyncFileHandler.encoding = UTF-8
2localhost.org.apache.juli.AsyncFileHandler.encoding = UTF-8
```

当修改完这个再次进行打印数据时，发现还是乱码，就去找万能的kimi进行了排查，kimi给出的提示是：给Tomcat的启动JVM再加一条参数，让控制台标准输出也固定成UTF-8。

路径在`%CATALINA_HOME%\bin\catalina.bat`（Linux 用 `.sh`），在`set JAVA_OPTS=`这一行（因为文件中有很多``set JAVA_OPTS=`，所以在任意一个下方再进行追加就可以），添加以下内容就不会再出现乱码了。至此，开始今天的项目。

```
set "JAVA_OPTS=%JAVA_OPTS% -Dfile.encoding=UTF-8 -Dsun.stdout.encoding=UTF-8 -Dsun.stderr.encoding=UTF-8"
```

## 反射相关类

|     类名      |                     用途                     |
| :-----------: | :------------------------------------------: |
|    Class类    | 代表类的实体，在运行的Java程序中表示类的接口 |
|    Field类    |          代表类的成员变量、类的属性          |
|   Method类    |                 代表类的方法                 |
| Constructor类 |               代表类的构造方法               |

### 利用反射获取成员变量

Class类中用于获取成员变量的方法

|             方法              |          用途          |
| :---------------------------: | :--------------------: |
|     getField(String name)     | 获得某个公有的属性对象 |
|          getFields()          | 获得所有公有的属性对象 |
| getDeclaredField(String name) |    获得某个属性对象    |
|      getDeclaredFields()      |    获得所有属性对象    |

Filed类中用于创建对象的方法

|               方法                |  用途  |
| :-------------------------------: | :----: |
| Void set(Object obj,Object value) |  赋值  |
|      Object get(Object obj)       | 获取值 |

### 利用反射获取构造方法

Class类中用于获取构造方法的方法

|                       方法                       |                  用途                  |
| :----------------------------------------------: | :------------------------------------: |
|                getConstructors()                 |       获得该类的所有公有构造方法       |
|            getDeclaredConstructors()             |          获得该类所有构造方法          |
|     getConstructor(Class…<?> parameterTypes)     | 获得该类中与参数类型匹配的公有构造方法 |
| getDeclaredConstructor(Class…<?> parameterTypes) |   获得该类中与参数类型匹配的构造方法   |

Constructor类中用于创建对象的方法

|               方法               |             用途             |
| :------------------------------: | :--------------------------: |
| T newlnstance(Object.. initargs) |  根据指定的构造方法创建对象  |
|   setAccessible(boolean flag)    | 设置为true，表示取消访问检查 |

### 利用反射获取成员方法

Class类中用于获取成员方法的方法

|                           方法                           |          用途          |
| :------------------------------------------------------: | :--------------------: |
|                       getMethods()                       | 获得该类所有公有的方法 |
|                   getDeclaredMethods()                   |    获得该类所有方法    |
|     getMethod(String name, Class…<?> parameterTypes)     | 获得该类某个公有的方法 |
| getDeclaredMethod(String name, Class…<?> parameterTypes) |    获得该类某个方法    |

Method类中用于创建对象的方法

```java
Object invoke(Object obj,Object... args)：运行方法
参数一：用obj对象调用该方法
参数二：调用方法的传递的参数（如果没有就不写）
返回值：方法的返回值（如果没有就不写）
```

## 反射

1. 什么是JAVA反射

   参考：https://xz.aliyun.com/t/9117

   Java提供了一套反射API，该API由Class类与java.lang.reflect类库组成。

   该类库包含了Field、Method、Constructor等类。

   对成员变量，成员方法和构造方法的信息进行的编程操作可以理解为反射机制。

2. 为什么要用到反射

   参考：https://xz.aliyun.com/t/9117

   其实从官方定义中就能找到其存在的价值，在运行时获得程序或程序集中每一个类型的成员和成员的信息，从而动态的创建、修改、调用、获取其属性，而不需要事先知道运行的对象是谁。划重点：**在运行时而不是编译时。**（不改变原有代码逻辑，自行运行的时候动态创建和编译即可）

3. 反射机制应用

   开发应用场景：
   Spring框架的IOC基于反射创建对象和设置依赖属性。
   SpringMVC的请求调用对应方法，也是通过反射。
   JDBC的Class#forName(String className)方法，也是使用反射。
   安全应用场景：
   构造利用链，触发命令执行。
   反序列化中的利用链构造。
   动态获取或执行任意类中的属性或方法。
   动态代理的底层原理是反射技术。
   rmi反序列化也涉及到反射操作。

### Java—反射—Class对象类获取

首先就是创建User类，之后创建成员变量，构造方法，成员方法代码如下：

```java
package com.example.reflectdemo;

public class User {
    // 成员变量
    public String name = "attackor7";
    public int age = 24;
    private String gender = "male";
    protected String job = "sec";

    // 构造方法
    public User() {
        System.out.println("User created");
    }

    public User(String name) {
        System.out.println("my name"+name);
    }

    private User(String name,int age){
        System.out.println(name);
        System.out.println(age);
    }

    //成员方法
    public void userinfo(String name,int age,String gender,String job){
        this.name = name;
        this.age=age;
        this.gender=gender;
        this.job=job;
    }

    protected void users(String name,String gender){
        this.name = name;
        this.gender=gender;
        System.out.println("users成员方法："+name);
        System.out.println("users成员方法："+gender);
    }

}
```

#### 获取类的4种方法

1. 根据类名：类名 .class
   Class userClass = User.class;
2. 根据对象：对象 .getClass()
   User user = new User();
   Class aClass = user.getClass();
3. 根据全限定类名： Class.forName(" 全路径类名 ")
   Class aClass1 = Class.forName("com.example.reflectdemo.User");
4. 通过类加载器获得 Class 对象：
   ClassLoader.getSystemClassLoader().loadClass(" 全路径类名 ");
   ClassLoader clsload=ClassLoader.getSystemClassLoader();
   Class aClass2 =clsload.loadClass("com.example.reflectdemo.User");

**注意：获取全部路径是复制路径——复制引用**

```java
package com.example.reflectdemo;

public class GetClass {
    public static void main(String[] args) throws ClassNotFoundException {
        //1、根据全限定类名：Class.forName("全路径类名")
        Class aClass = Class.forName("com.example.reflectdemo.User");
        System.out.println(aClass);

        //2、根据类名：类名.class
        Class userClass = User.class;
        System.out.println(userClass);

        //3、根据对象：对象.getClass()
        User user = new User();
        Class aClass1 = user.getClass();
        System.out.println(aClass1);

        //4、通过类加载器获得Class对象：//ClassLoader.getSystemClassLoader().loadClass("全路径类名");
        ClassLoader clsload = ClassLoader.getSystemClassLoader();
        Class aClass2 = clsload.loadClass("com.example.reflectdemo.User");
        System.out.println(aClass2);
    }

}
```

### Java—反射—Field 成员变量类获取

[跳转到获取成员变量](#利用反射获取成员变量)

```java
package com.example.reflectdemo;

import java.lang.reflect.Field;

public class GetField {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchFieldException, IllegalAccessException {
        Class aClass = Class.forName("com.example.reflectdemo.User");

        // 获取公共的成员变量
//        Field[] fields = aClass.getFields();
//        for (Field field : fields) {
//            System.out.println(field);
//        }

        // 获取所有的成员变量
//        Field[] fields1 = aClass.getDeclaredFields();
//        for (Field field : fields1) {
//            System.out.println(field);
//        }

        // 获取单个的公共成员变量
//        Field name = aClass.getField("age");
//        System.out.println(name);

        // 获取单个的成员变量
//        Field gender = aClass.getDeclaredField("gender");
//        System.out.println(gender);

        // 获取公共的成员变量age的值
        User u = new User();
        Field f = aClass.getField("age");
        // 取值
        Object o = f.get(u);
        System.out.println(o);
        // 赋值
        f.set(u, 114);
        Object o1 = f.get(u);
        System.out.println(o1);

        // 修改私有的成员变量的值
        Field f2 = aClass.getDeclaredField("job");
        // 先展示原值
        Object o2 = f2.get(u);
        System.out.println(o2);
        // 修改
        f2.set(u, "Network Security");
        Object o3 = f2.get(u);
        System.out.println(o3);


    }
}
```

### Java—反射—Constructor 构造方法类获取

[跳转到获取构造方法](#利用反射获取构造方法)

```java
package com.example.reflectdemo;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;

public class GetConstructor {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException, NoSuchFieldException {
        Class aClass = Class.forName("com.example.reflectdemo.User");

        // 获取公共的构造方法
//        Constructor[] constructors = aClass.getConstructors();
//        for (Constructor constructor : constructors) {
//            System.out.println(constructor);
//        }

        // 获取所有的构造方法
//        Constructor[] constructors2 = aClass.getDeclaredConstructors();
//        for (Constructor constructor : constructors2) {
//            System.out.println(constructor);
//        }

        // 获取单个的公共的构造方法
//        Constructor constructors3 = aClass.getConstructor(String.class);
//        System.out.println(constructors3);

        // 获取单个的构造方法
//        Constructor constructors4 = aClass.getDeclaredConstructor(String.class, int.class);
//        System.out.println(constructors4);

        // 对构造方法进行操作(两个参数string，int)
        Constructor constructors5 = aClass.getDeclaredConstructor(String.class, int.class);
        // 临时开启对私有的访问
        constructors5.setAccessible(true);
        // 获取构造方法中变量的值
        Field nameField  = aClass.getDeclaredField("name");
        Field ageField =  aClass.getDeclaredField("age");
        nameField.setAccessible(true);
        ageField.setAccessible(true);
        // 修改并返回
        User u1 = (User) constructors5.newInstance("你好，世界！",1024);
        // 返回
        System.out.println("原值:" + u1.name);
        System.out.println("原值:" + u1.age);

        // 对构造方法进行执行（1个参数String)
        Constructor constructors6 = aClass.getDeclaredConstructor(String.class);
        constructors6.newInstance("你好，世界！2");
    }
}
```

### Java—反射——Method 成员方法类获取

[跳转到获取构造方法](#利用反射获取成员方法)

```java
package com.example.reflectdemo;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class GetMethod {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        Class aClass = Class.forName("com.example.reflectdemo.User");
        // 获取包括继承的公共成员方法
//        Method[] methods = aClass.getMethods();
//        for (Method method : methods) {
//            System.out.println(method);
//        }

        // 获取不包括继承的所有成员方法
//        Method[] methods2 = aClass.getDeclaredMethods();
//        for (Method method : methods2) {
//            System.out.println(method);
//        }

        // 获取单个的成员方法
        Method method3 = aClass.getDeclaredMethod("users", String.class, String.class);
        System.out.println(method3);

        // 对成员方法进行调用
        User u = new User();
        Method users = aClass.getDeclaredMethod("users", String.class, String.class);
        users.invoke(u,"小迪","gay");

    }

}
```

### Java—反射—不安全命令执行&反序列化链

对于反序列化基础就是反射（jdbc（连接数据库），rmi）

```java
package com.example.reflectdemo;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class GerRunExec {
    public static void main(String[] args) throws IOException, ClassNotFoundException, NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        // 原生调用JDK自带的rt.jar
//        Runtime.getRuntime().exec("notepad");

        // 第三方jar包调用
        Class aClass = Class.forName("java.lang.Runtime");

        // 查看到成员方法中包含getRuntime()
//        Method[] methods = aClass.getMethods();
//        for (Method method : methods) {
//            System.out.println(method);
//        }

        // 获取exec成员方法，用于后面执行系统命令
        Method method = aClass.getMethod("exec", String.class);
        // 获取getRuntime成员方法
        Method getRuntime = aClass.getMethod("getRuntime");
        // 检验确实是刚才成员方法中的getRuntime()
        // System.out.println(getRuntime);
        // 调用
        Object runtime = getRuntime.invoke(aClass);
        method.invoke(runtime, "calc.exe");
    }
}
```

### JAVA反序列化

https://xz.aliyun.com/news/6627

https://xz.aliyun.com/news/6625

java反序列化验证工具在One—Fox工具箱中gui_scan目录中的ysoserial。

反序列化大概就是利用jar包里面的某些类来实现一些命令执行，因为还没学到只能说暂时理解成这样吧。