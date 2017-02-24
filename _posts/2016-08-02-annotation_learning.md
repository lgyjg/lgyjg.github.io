---
layout:     post
title: java 中的注解
subtitle:   针对java中注解的学习笔记
date: 2016-08-02 20:22:04
author:     "JianGuo Yang"
header-img:
tags: Java
---
> 一直对java中的注解不是很了解，但是随处可见，前些天，一位朋友[@徐文志程序猿](http://xuwenzhi.com)在博客中写了关于PHP的注释，学习了很多，所以，也尝试着学习下java中的注解，并记录在这里，供以后复习，也便于大家共同学习。

>在开始之前，我墙裂给大家安利一种学习方式。思维导图，又称脑图，是能够将思维中抽象的逻辑关系转化为直观的关系图标的一种方式，在我们的学习中，可以将知识点通过思维导图梳理出来，非常有条理，还方便记忆，我将在将来的文章中尝试着用思维导图知识结构。好了现在就开始干正事，切入正题吧。

注解（Annotation）是java 5.0引入的新特性。它提供了一种结构化的类型检查的新途径。我们通过加入注解，能够避免很多问题，例如编写累赘的部署描述文件。与代码注释相比，它更注重与描述类的相关信息。
# 基本的语法
注解的语法还是比较简单的，除了多了@符号外，其他的和java的固有语法一致。
在java SE5 中就提供了三种原生的注解：
  * @Override 表示当前的方法继承自父类，并且复写了父类的方法，如果被注解的方法在父类中不存在，编译器就会抛出异常。在java中，这个注解是可选的。
  * @Deprecated 表示当前的方法已经被废弃，在编译时会有警告提示。
  * @SuppressWarings 表示主动忽略不恰当的编译器警告。
  此外，java 还提供了可扩展的annotation API。
  下面的例子说明了注解的使用：  


  ```java
public class Testable {
    public void execute(){
      System.out.println("Executing...");
    }
    @Test
    void testExecute (){
      execute();
    }
}
  ```
  **@Test** 注解本身不做任何的操作，但是，编译器在编译的时候，就必须找到关于该注解的定义，否则就会报错。下面的一小节将会介绍如何进行定义。

# 注解的定义
下面，我们就给出前文提到的@Test注解的定义：
```java
import java.lang.annotation

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Test{}
```
这样，就定义了一个@Test的注解。我们可以看到，其实和接口的定义很像。不同的是，在定义注解时，我们需要一些[元注解](#什么是元注解)，如@Target，@Retention。其中：  
* **@Target** 注解用来定义该注解的作用域，如作用于一个方法还是一个域。
* **@Retention** 则定义了该注解在哪个级别可用，如源代码（SOURCE）中、类文件（CLASS）中、运行时（RUNTIME）。
这类注解由于没有元素，被称为 **标记注解（marker annotation）**， 通常情况下，注解还会加上一些元素用于表示某些值。这些值用于编译器在分析和处理该注解时的参考。可以为这些元素指定默认值。

## 注解元素
元素的的定义很简单：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface UseCase{
  public int id();
  public String description() default "no description";
}
```
这个@UserCase 注解就定义了两个元素，我们为description元素制定了默认值。如果使用该注解在注解某个方法时，没有给定描述字符，将会使用该默认值代替。
注解元素可用的数据类型如下所示：
* 所有的基本数据类型（int, float, boolean型等）及其数组
* String 及String[]
* Class 及 Class[]
* enum 及 enum[]
* Annotation 及 Annotation[]
如果使用了其他类型的对象，编译器就会抛出异常，对于这些元素的默认值，就更值得注意了，元素不能有不确定的默认值，也就是说，元素要么在定义的时候就赋给默认值，要么就必须在使用注解时提供该元素的值。
非常蛋疼的一点是，这些元素除了基本数据类型外，其他的类型的元素不能赋给其一个 null, 所以很难表现这个元素缺失的状态，如果有这样的需求，我们可以通过 *定义特殊的值，如空字符串，或者负数以表示该状态* 。


下面我们接着看看如何使用该注解。

# 注解的使用
注解元素的使用过程中，是以键-值对的形式给出的。
```java
public class PasswordUtils {
  @UseCase(id= 1,description="Password must contain at least one numeric")
  public boolean validataPassword(String password) {
    return(password.mathes("\\w*\\d\\w*"))
  }

  @UseCase(id=2)
  public String encryptPassword(String password) {
    return new StringBuffer(password).reverse().toString();
  }

  @UseCase(id=3,description="New password can't equal previously password")
  public boolean checkForNewPassword(List<String> prePassWords, String password){
    return !prePassWords.contains(password);
  }

}
```

# 什么是元注解
我们知道，万物是有源头的，就像我们的大千世界都是由原子构成的。元注解就是注解的源头，用于注解其他的注解。这句话有点绕，其实就是在我们定义注解的时候，使用元注解来定义该注解的作用域，使用级别，是否允许继承该注解等相关属性。如下表：

| 元注解          | 解释     |
| :------------- | :------------- |
| @Target        |   表示该注解可以用于什么地方     |
| @Retention     |   表示在什么级别保存该注解信息     |
| @Documented    |   将此注解包含在javaDoc中     |
| @Inherited     |   允许子类继承父类的注解     |

其中@Target的取值有七种：  

| 值     | 解释     |
| :------------- | :------------- |
| CONSTRUCTOR       | 构造器的声明       |
| FIELD       | 域声明（包括enum）       |
| LOCAL_VARIABLE       | 局部变量的声明       |
| METHOD       | 方法的声明       |
| PACKAGE       | 包的声明       |
| PARAMETER     | 参数的声明       |
| TYPE       | 类，接口，或enum的声明       |

@Retention的值：  

| 值  | 解释 |
| :------------- | :------------- |
| SOURCE | 注解将被编译器丢弃 |
| CLASS | 注解在class文件中可用，但是会在VM虚拟机执行时丢弃 |
| RUNTIME | VM虚拟机将在运行时也保留注释，因此可以通过反射机制类读取注解的信息 |

但是，仅仅有这些注解是没法满足我们的编程需求的，我们需要定制实现自己的注解，当然，光有注解也不能有任何的作用，我们需要编写自己的处理器来处理这些注解。
接下来将会学习编写注解解释器程序通过反射用于实现注解对应的功能。  
在 Java SE5 中扩展了反射机制的api接口，同时还提供了一个外部工具apt来帮助我们解析带有注解的源代码。
下面，我们就通过使用反射机制实现一个简单的注解解释器，来完成上面的例子中关于@UserCase注解的处理。
```java
public class UserCaseTracker {
  public static void trackUseCases(List<Integer> useCases, Class<?> cl) {
    /**
    * 此处用到了getDecleardMethods() 和 getAnnotation() 方法，他们都属于AnnotatedElement接口，
    * class、Method、Field类都实现了这个接口，因此，我们可以通过调用Class的getDecleardMethods方法
    * 获取该类中所有的方法的Method对象（包括 public、protected 和 private方法），再通过Method的
    * getAnnotation方法返回具体的注解类型，此例中返回UseCase，如果被注解的方法或者类中没有该注解，则返回空。
    */
    for (Method m : cl.getDecleardMethods()) {
      UserCase uc = m.getAnnotation(Usecase.class);
      if (uc != null) {
        System.out.println("Found use case:" + uc.id() + " " + uc.description());
        useCases.remove(new Integer(uc.id()));
      }
    }
    for (int i : useCases) {
       System.out.println("Warning: Missing use case-" + i);
    }
  }

  public static void main(String[] args){
    List<Integer> useCases = new ArrayList<Integer>();
    Collections.addAll(useCases, 1, 2, 3, 4);//case的编号
    trackUseCases(useCases, PasswordUtils.class);
  }
}
```
# 注解不支持继承
最后的最后，注解不支持继承这件事，不得不在这里提一提，我们不能使用关键字 *extends* 来继承某个@interface。
期待未来的版本中能给我们带来惊喜。  

最近在关注java 8中的新的语法，注解方面也发生了一些变化，参见：[Repeating Annotations](https://docs.oracle.com/javase/tutorial/java/annotations/repeating.html), 要知何时更新，时刻关注博客哦。

> 参考文献：
《java编程思想》（"Think in java"） "注解"一章
