---
layout: post
title: Java中的Lambda表达式
subtitle: java中的volatile关键字
date: 2017-03-29 23:44:32
author: JianGuo
header-img: img/post-bg-2015.jpg
tags:
  - Java
---

> 也许学过c++, python的同学都知道[Lambda表达式](https://link.zhihu.com/?target=http%3A//zh.wikipedia.org/wiki/%25CE%259B%25E6%25BC%2594%25E7%25AE%2597)，但学java的同学可能被Java SE 8中突如起来的“()->{}”下一跳呢？这是什么语言？是不是眼睛花了？其实就是Java中的Lambda表达式了，那究竟Lambda表达式式什么呢？这篇文章来普及一下。

# 什么是Lambda表达式？
你有没有过这样的烦恼，当我们每次要去创建一个Thread执行我们的操作的时候，总是要传入一个Runnable方法，有没有经历过callback接口的烦恼？我们来看看传统的代码：

```java
new Thread(new Runnable() {
    @Override
    public void run() {
        // do something
    }
}).start();
```

相信你看到这样的代码一定很不爽了。那Lambda的福音来了，因为它可以将上面的代码简化成一行：

```java
new Thread(() -> {do something}).start();
```

可以发现，使用了Lambda表达式之后，省去了大量的逻辑无关的代码，通俗的说，在编程领域，lambda 表达式通常是在需要一个函数，但是又不想费神去命名一个函数的场合下使用，也就是指匿名函数。

在Java SE 8中，Lambda表达式是一种非常重要的新特性，给我们提供了清晰简洁的表达**仅拥有一个方法的接口**的方式。这里着重强调下“仅拥有一个方法的接口”，就是说在这个接口中，只有一个方法需要我们去实现，在java SE 8中，我们把这样的接口称为 “functional interface”。只有这样的接口才适合使用Lambda表达式。事实上，在java中这样的接口有很多，例如Runnable、Comparator 等。这些类都能够使用Lambda表达式表示。

Lambda表达式在java中还有另一个重要的用途，能够改进Collection库，从而使开发者更加容易的遍历过滤集合，并提取数据，这个后面会给大家展示。

## 了解匿名内部类
这里有必要介绍下java中的另一个概念 —— 匿名内部类。在java中，匿名内部类提供了一种一次性创建并使用一个类或接口的方法，这个类天生就没有名字，所以只会被new它的对象所使用，外部对象无法再引用它，也不能显式地声明构造函数，更不能往构造函数里传参数。使用匿名内部类，有一个前提条件，那就是必须继承一个父类或者实现一个接口。上文提到的OnClickListenner就是一个匿名内部类。只要一个类是抽象的或是一个接口，那么其子类中的方法都可以使用匿名内部类来实现。

下面给出一个简单的例子：
```java
// 我们假设给出这样的一个接口
interface InterfaceDemo {
	void test();
}
// 一个抽象类或者接口的正常实现方式
class MyTestClass implements InterfaceDemo {
    // 可以实现构造函数
    public MyTestClass(){
        i = 0;
    }
    @Override
    public void test() {
        // do somthing
    }
}

// 匿名内部类的实现方式
Test test = new Test();
test.test(new InterfaceDemo() {
    // 自己实现的方法
    public void methodA(){
    	// do something
    }
    // 实现接口的方法
    @Override
    public void test() {
        // do something
    }
});

```

（关于匿名内部类详细的介绍可参考：[java提高篇(十)-----详解匿名内部类](http://www.cnblogs.com/chenssy/p/3390871.html)）

# Lambda表达式语法
上面介绍了匿名内部类，在大多数情况下,我们并不需要创建一个成员内部类实现接口，这样通过匿名内部类简化了程序的代码和逻辑，但是在某些情况下，我们只需要实现一个方法来处理事务，如Runnable接口的run方法，这时，匿名内部类的代码也开始显得不够简洁和直观，对于这种情形，其实就是 java SE 8 中引入的“函数式接口”，这类接口只定义了唯一的抽象方法的接口（除了隐含的Object对象的公共方法）， 因此最开始也就做SAM类型的接口（Single Abstract Method）。 JDK 8中又增加了java.util.function包， 提供了常用的函数式接口。而这种函数式接口类型便是Lambda表达式的原型和基石。

Lambda表达式主要由三部分组成，参数列表，表达式标记以及方法体，下面给出了几种表达式的例子。

```java
// 1. 无参数的方法, 需要使用()
() -> 4;                                 // 返回了4, 该接口必须返回int型返回值。
// 对应的接口为：
interface TestInterface {
	int test();
}

() -> System.out.println("hello world"); //该方法体无返回值
// 对应的接口形式为：
interface TestInterface {
	void test();
}

// 2. 多个参数、多行方法实现的表达式,可使用{}括起来，该方法无返回值
(int a, int b) -> {
	int i = a + b;
    int j = a - b;
}
// 对应的接口为：
interface TestInterface {
	void test(int a, int b);
}

// 3. 简写参数类型的表达式，可省去参数类型，该方法返回了a+b的值。
(a, b) -> a + b;
// 对应的接口为：
interface TestInterface {
	int test(int a, int b);
}

// 4. 需要返回返回值的，需要在实现中返回
(a, b) -> {
	System.out.println("hello world");
	return a + b；
};
// 对应的接口为：
interface TestInterface {
	int test(int a, int b);
}
```

上面的代码应该很清楚的阐述了在各种情况下的Lambda表达式的语法。那接下来我们看几个实际的例子。

# 啥也别说了，上代码

在Java中，Comparator类用于对集合进行排序, 下面这个例子中，我们分别使用匿名内部类和lambda表达式对Person对象的列表依据SurName进行排序

```java
class Person {
    private String givenName;
    private String surName;
    private int age;
    private String eMail;
    private String phone;
    private String address;
    // 省略构造方法和其他方法
}

List<Person> personList = Person.createShortList();
// Sort with Inner Class
Collections.sort(personList, new Comparator<Person>() {
    public int compare(Person p1, Person p2) {
        return p1.getSurName().compareTo(p2.getSurName());
    }
});
// Use Lambda instead
Collections.sort(personList, (Person p1, Person p2) -> p1.getSurName().compareTo(p2.getSurName()));
// 或者省略参数类型
Collections.sort(personList, (p1,  p2) -> p2.getSurName().compareTo(p1.getSurName()));
```
细心的你已经发现了Lambda表达式是可以省略参数类型的，它很智能的从上下文推断出参数的目标类型（"target typing"）。因为我们已经在compare方法定义时，声明了参数的类型。

我们再来看一个使用Lambda表达式实现监听器的例子。在Android应用开发中，我们经常要对控件的点击事件进行监听。使用Lambda表达式极大的简化了我们的代码。

```java
Button mButton = (Button)findViewById(R.id.submmit_button);
mButton.setOnclickListenner(new View.OnClickListenner() {
    @Override
    public void onClick(View v) {
        // do something?
    }
});

// 使用Lambda表达式实现事件监听

Button mButton = (Button)findViewById(R.id.submmit_button);
mButton.setOnclickListenner(v -> {
	// do something
}));
```

# 使用Lambda表达式优化你的代码
在接下来的介绍中，我会给大家介绍如何使用Lambda表达式简化代码逻辑，优化代码。我们从下面这个例子看起：

## 第一次尝试
我们还是以上文中的Person类为基础介绍。

## 重构方法

## 使用匿名内部类

## 正确使用Lambda表达式

# Lambda表达式与Collections

# Java SE 8 中的接口

# Lambda表达式有什么优势？


# 参考文献
1. http://www.oracle.com/webfolder/technetwork/tutorials/obe/java/Lambda-QuickStart/index.html#overview
2. http://colobu.com/2014/10/28/secrets-of-java-8-functional-interface/
