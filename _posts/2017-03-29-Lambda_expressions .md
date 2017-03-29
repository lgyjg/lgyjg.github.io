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

```java
Button mButton = (Button)findViewById(R.id.submmit_button);
mButton.setOnclickListenner(new View.OnClickListenner() {
	@Override
	public void onClick(View v) {
		// do something?
	}
});
```
如果你和我一样是个强迫症的话，看着一定很不爽了。那Lambda的福音来了，因为它可以将上面的话简化成一行：

```java
new Thread(() -> {// do something}).start();

Button mButton = (Button)findViewById(R.id.submmit_button);
mButton.setOnclickListenner(() -> {// do something}));
```

我们可以发现，使用了Lambda表达式之后，我们省去了大量的逻辑无关的代码，简单的说，在编程领域，lambda 表达式通常是在需要一个函数，但是又不想费神去命名一个函数的场合下使用，也就是指匿名函数。

在Java SE 8中，Lambda表达式是一种非常重要的新特性，给我们提供了清晰简洁的表达**仅拥有一个方法的接口**的方式。这里着重强调下仅拥有一个方法的接口，就是说在这个接口中，只有一个方法需要我们去实现，在java SE 8中，我们把这样的接口称为 “functional interface”。只有这样的接口才适合使用Lambda表达式。事实上，在java中这样的接口有很多，例如Runnable、Comparator 等。这些类都能够使用Lambda表达式表示。

Lambda表达式在java中还有另一个重要的用途，能够改进Collection库，从而使开发者更加容易的遍历过滤集合，并提取数据，这个后面会给大家展示。

## 了解匿名内部类
这里有必要介绍下java中的一个概念——匿名内部类。在java中，匿名内部类提供了一种一次性实现一个类的实例的方法，这个类天生就没有名字，所以外部对象无法再引用它，它只会被new它的对象所使用，上文提到的OnClickListenner就是一个匿名内部类。

# Lambda表达式语法
Lambda表达式主要由三部分组成，参数列表，表达式标记以及方法体，下面给出了几种表达式的例子。
```java
// 1. 无参数的方法, 需要使用()
() -> 4;                                 // 返回了4, 该接口必须返回int型返回值。
对应的接口为：
interface TestInterface {
	int test();
}

() -> System.out.println("hello world"); //该方法体无返回值
对应的接口形式为：
interface TestInterface {
	void test();
}

// 2. 多个参数、多行方法实现的表达式,可使用{}括起来，该方法无返回值
(int a, int b) -> {
	int i = a + b;
    int j = a - b;
}
对应的接口为：
interface TestInterface {
	void test(int a, int b);
}

// 3. 简写参数类型的表达式，可省去参数类型，该方法返回了a+b的值。
(a, b) -> a + b;
对应的接口为：
interface TestInterface {
	int test(int a, int b);
}

// 4. 需要返回返回值的，需要在实现中返回
(a, b) -> {
	System.out.println("hello world");
	return a + b；
};
对应的接口为：
interface TestInterface {
	int test(int a, int b);
}
```
上面的代码应该很清楚的阐述了在各种情况下的Lambda表达式的语法。那接下来我们看几个实际的例子。

# 啥也别说了，上代码

# 使用Lambda表达式优化你的代码

# Lambda表达式与Collections

# Java SE 8 中的接口

# Lambda表达式有什么优势？

