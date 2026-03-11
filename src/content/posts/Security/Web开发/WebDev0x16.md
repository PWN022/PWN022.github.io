---
title: JavaEE应用&ORM框架&SQL预编译&JDBC&MyBatis&Hibernate&Maven
published: 2026-03-11 21:00:00
description: ORM框架的SQL注入漏洞主要取决于是否使用预编译机制：JDBC的PreparedStatement、Hibernate的参数绑定(:占位符)、MyBatis的#{}都是安全的预编译写法，而拼接字符串(Statement、HQL字符串拼接、MyBatis的${})则存在高危注入风险。
tags: [Web开发,JavaEE]
category: 网络安全
draft: false
---

# 知识点

1. 安全开发-JavaEE-构建工具-Maven
2. 安全开发-JavaEE-ORM框架-JDBC
3. 安全开发-JavaEE-ORM框架-Mybatis
4. 安全开发-JavaEE-ORM框架-Hibernate
5. 安全开发-JavaEE-ORM框架-SQL注入&预编译

## ORM框架

**ORM（Object Relational Mapping，对象关系映射）框架** 是一种让开发者用**操作对象的方式**来**操作数据库**的工具。

不使用ORM框架：

```java
// 手动写SQL，处理结果集
String sql = "SELECT id, username, password FROM users WHERE id = 1";
ResultSet rs = statement.executeQuery(sql);
User user = new User();
if (rs.next()) {
    user.setId(rs.getInt("id"));
    user.setUsername(rs.getString("username"));
    user.setPassword(rs.getString("password"));
}
```

使用ORM框架：

```java
// 直接操作Java对象，ORM自动转成SQL
User user = session.get(User.class, 1);  // 就这么简单！
// ORM自动执行：SELECT * FROM users WHERE id = 1
// 自动把查询结果封装成User对象
```

# Maven配置

参考：https://blog.csdn.net/cxy2002cxy/article/details/144809310

idea配置maven：https://cloud.tencent.com/developer/article/2157068

# JDBC

参考：https://www.jianshu.com/p/ed1a59750127

## 引用依赖（pom.xml）

https://mvnrepository.com/

## 注册数据库驱动

```
Class.forName("com.mysql.jdbc.Driver");
```

## 建立数据库连接

```
String url ="jdbc:mysql://localhost:3306/数据库名称";

Connection connection=DriverManager.getConnection(url,"账号","密码");
```

## 创建Statement执行SQL

```
Statement statement= connection.createStatement();

ResultSet resultSet = statement.executeQuery(sql);
```

## 结果ResultSet进行提取

```
while (resultSet.next()){
    int id = resultSet.getInt("id");
    String page_title = resultSet.getString("page_title");
    .......
}
```

## 完整代码

```java
package com.example.jdbcdemo.Servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;

@WebServlet(name = "sql",value = "/sql")
public class JdbcServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String id = req.getParameter("id");
        // sql查询非安全写法
//        String sql = "select * from users where id ="+id;

        // sql查询预编译安全写法
        // 固定执行语句，无论在这个执行语句加什么内容都不会改变执行语句本身
        String sql = "select * from users where id=?";

        // 建立数据库连接
        String url = "jdbc:mysql://localhost:3306/javademo?useSSL=false";
        try{
            Class.forName("com.mysql.jdbc.Driver");
            Connection connection = DriverManager.getConnection(url,"root","111111");
            // 打印检查是否连接成功
//            System.out.println(connection);

            // 执行sql(非安全写法)
//            Statement statement = connection.createStatement();
//            ResultSet resultSet = statement.executeQuery(sql);

            // 预编译安全写法
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            // 设置sql参数
            preparedStatement.setString(1,id);
            ResultSet resultSet = preparedStatement.executeQuery();

            // 结果提取
            while (resultSet.next()){
                resp.getWriter().println(resultSet.getString("id"));
                resp.getWriter().println(resultSet.getString("username"));
                resp.getWriter().println(resultSet.getString("password"));
                resp.getWriter().println(resultSet.getString("role"));
                resp.getWriter().println(resultSet.getString("created_at"));
            }

        }catch (ClassNotFoundException e){
            throw new RuntimeException(e);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}

```

安全注入例子：

经典注入语句：

```
http://localhost:8080/JDBC_demo_war_exploded/sql?id=1%20union%20select%20version(),2,database(),4,5,6,7,8,9
```

预编译：PreparedStatement

安全写法(预编译)：

```java
 "select * from admin where id=?"
 
PreparedStatement preparedStatement = connection.prepareStatement(sql);
// 设置sql参数
preparedStatement.setString(1,id);
ResultSet resultSet = preparedStatement.executeQuery();
```

不安全写法(拼接)：

```java
 "select * from admin where id="+id
 
Statement statement = connection.createStatement();
ResultSet resultSet = statement.executeQuery(sql);
```

# Hibernate

## 引用依赖（pom.xml）

https://mvnrepository.com/

hibernate-core，mysql-connector-java

## Hibernate配置文件

src/main/resources/hibernate.cfg.xml

```xml
<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
    <session-factory>
        <!-- 数据库连接配置 -->
        <property name="hibernate.connection.driver_class">com.mysql.cj.jdbc.Driver</property>
        <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/phpstudy?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC</property>
        <property name="hibernate.connection.username">root</property>
        <property name="hibernate.connection.password">123456</property>

        <!-- 数据库方言 -->
        <property name="hibernate.dialect">org.hibernate.dialect.MySQL8Dialect</property>

        <!-- 显示 SQL 语句 -->
        <property name="hibernate.show_sql">true</property>

        <!-- 自动更新数据库表结构 -->
        <property name="hibernate.hbm2ddl.auto">update</property>

        <!-- 映射实体类 -->
        <mapping class="com.example.entity.User"/>
    </session-factory>
</hibernate-configuration>
```

## 映射实体类开发

用来存储获取数据：

src/main/java/com/example/entityUser.java

## Hibernate工具类

用来Hibernate使用：

src/main/java/com/example/util/HibernateUtil.java

## Servlet开发接受

src/main/java/com/example/servlet/UserQueryServlet.java

安全注入例子：

安全写法：

```
Hibernate 会先将 HQL 编译成 SQL 模板
:username 是占位符，不直接拼接用户输入
用户输入的值通过 setParameter() 单独传递
```

```
String hql = "FROM User WHERE username=:username";
```

不安全写法：

```
将用户输入直接拼接到 HQL 语句中
Hibernate 无法区分代码和数据
用户可以改变 HQL 语句的结构
```

```
String hql = "FROM User WHERE username='"+username+"'";
```

![image-20260311210156604](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260311210156604.png)

# MyBatis

## 引用依赖（pom.xml）

mybatis，mysql-connector-java

## MyBatis配置文件

src/main/resources/mybatis-config.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/数据库名?serverTimezone=UTC"/>
                <property name="username" value="root"/>
                <property name="password" value="123456"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        // 需要根据自己的路径
        <mapper resource="AdminMapper.xml"/>
    </mappers>
</configuration>
```

## AdminMapper.xml创建

src/main/resources/mybatis-config.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
// 自行修改
<mapper namespace="com.example.jdbcdemo43.mapper.AdminMapper">
    <select id="selectAdminById" resultType="com.example.jdbcdemo43.model.Admin">
        SELECT * FROM admin WHERE id = #{id}
    </select>
</mapper>
```

## 创建数据实体类

com/example/mybatisdemo43/model/User.java

## 创建mapper实体类

com/example/mybatisdemo43/mapper/AdminMapper.java

## 创建servlet接受类

com/example/mybatisdemo43/servlet/SelectServlet.java

```java
// 加载 MyBatis 配置文件
String resource = "mybatis-config.xml";
InputStream inputStream = Resources.getResourceAsStream(resource);
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
// 获取 SqlSession
try (SqlSession session = sqlSessionFactory.openSession()) {
    // 获取 Mapper 接口
    AdminMapper mapper = session.getMapper(AdminMapper.class);
    // 执行查询
    Admin admin = mapper.selectAdminById(Integer.parseInt(id));
    // 输出结果
```

安全注入例子：

安全写法：

```
MyBatis 会将 #{id} 替换为 ?
使用 JDBC 的 PreparedStatement 设置参数
会根据参数类型自动处理
```

```
select * from admin where id = #{id}
```

不安全写法：

```
MyBatis 直接将 ${id} 替换为参数值
相当于直接拼接 SQL 语句
不经过预编译处理
```

```
select * from admin where id = ${id}
```

![image-20260311205636316](https://cdn.jsdelivr.net/gh/pwn022/0x00/NetSecurity/img/image-20260311205636316.png)

# Spring JPA

由于涉及到开发框架，后续讲到，安全基本和Hibernate相似