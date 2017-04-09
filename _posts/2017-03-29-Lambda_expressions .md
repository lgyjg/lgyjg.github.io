---
layout: post
title: Java中的Lambda表达式
subtitle: Java中的Lambda表达式
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

这样的语法我们称其为Lambda表达式，可以发现，使用了Lambda表达式之后，省去了大量的逻辑无关的代码，通俗的说，在编程领域，lambda 表达式通常是在需要一个函数，但是又不想费神去命名一个函数的场合下使用，也就是指匿名函数。

在Java SE 8中，Lambda表达式是一种非常重要的新特性，给我们提供了清晰简洁的表达**仅拥有一个方法的接口**的方式。这里着重强调下“仅拥有一个方法的接口”，就是说在这个接口中，只有一个方法需要我们去实现，我们把这样的接口称为 “函数式接口（functional interface）”。只有这样的接口才适合使用Lambda表达式。事实上，在java中这样的接口有很多，例如Runnable、Comparator 等。这些类都能够使用Lambda表达式表示。

Lambda表达式在java中还有另一个重要的用途，能够改进Collection库，从而使开发者更加容易的遍历过滤集合，并提取数据，后文会为大家演示。

## 了解匿名内部类
这里有必要介绍下java中的另一个概念 —— 匿名内部类。在java中，匿名内部类提供了一种一次性创建并使用一个类或接口的方法，这个类天生就没有名字，所以只会被new它的对象所使用，外部对象无法再引用它，也不能显式地声明构造函数，更不能往构造函数里传参数。使用匿名内部类，有一个前提条件，那就是必须继承一个父类或者实现一个接口。上文提到的Runnable就是一个匿名内部类。只要一个类是抽象的或是一个接口，那么其子类中的方法都可以使用匿名内部类来实现。

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
        // do something
    }
    @Override
    public void test() {
        // do something
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
这个例子中，第一种方式通过继承的方式实现了一个内部类，这个内部类显然是有名字的（MyTestClass），我们可以在任何地方实例化它，并且引用它。第二种方式在test方法的参数中直接实现了InterfaceDemo接口，并通过new关键字实现了实例化，我们并没有为这个实例定义其名称，外部是无法再获得这个实例的。当然，在匿名内部类中，不能够实现其构造函数，只能够实现自定义的方法。

（关于匿名内部类详细的介绍可参考：[java提高篇(十)-----详解匿名内部类](http://www.cnblogs.com/chenssy/p/3390871.html)）

# Lambda表达式语法
在大多数情况下,我们并不需要创建一个成员内部类实现接口，而取而代之的通过匿名内部类简化了程序的代码和逻辑，但是在某些情况下，我们只需要实现一个方法来处理事务，如Runnable接口的run方法，这时，匿名内部类的代码也开始显得不够简洁和直观，对于这种情形，其实就是 java SE 8 中引入的“函数式接口”，这类接口只定义了唯一的抽象方法的接口（除了隐含的Object对象的公共方法）， 因此最开始也就做SAM类型的接口（Single Abstract Method）。 JDK 8中同时增加了java.util.function包， 提供了常用的函数式接口。而这种函数式接口类型便是Lambda表达式的原型和基石。

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
// 使用 Lambda 代替
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

在接下来的介绍中，我会给大家介绍如何使用Lambda表达式简化代码逻辑，优化代码。我们使用官方文档中给出的这个例子，英文好的同学可以直接跳转到[Lambda Quick Start](http://www.oracle.com/webfolder/technetwork/tutorials/obe/java/Lambda-QuickStart/index.html#overview)学习。

我们有这样的一个用户场景，我们要通过一个数据集查找出符合特殊身份的人， 在美国有这样的三类人群必须满足以下条件：司机（年龄大于16周岁）、义务兵（18-25周岁的男性）、飞行员（23-65周岁）

## 准备工作

以上这些特殊身份的人都属于Person，Person类有七个成员属性givenName、surName、age、gender、eMail、phone、adress。我们基于builder模式来构建Person类的实例，如果对Builder设计模式有疑问，可以看看我的另一篇博客：[Builder设计模式]()。在Personn类中提供了一个静态方法createShortList用于创建一个Person列表。

```java
public class Person {
  private String givenName;
  private String surName;
  private int age;
  private Gender gender;
  private String eMail;
  private String phone;
  private String address;

  public static class Builder{...}

  private Person(Person.Builder builder){
    givenName = builder.givenName;
    surName = builder.surName;
    age = builder.age;
    gender = builder.gender;
    eMail = builder.eMail;
    phone = builder.phone;
    address = builder.address;
  }
  //...
  public static List<Person> createShortList(){
    List<Person> people = new ArrayList<>();
    
    people.add(
      new Person.Builder()
            .givenName("Bob")
            .surName("Baker")
            .age(21)
            .gender(Gender.MALE)
            .email("bob.baker@example.com")
            .phoneNumber("201-121-4678")
            .address("44 4th St, Smallville, KS 12333")
            .build() 
      );
    
    people.add(
      new Person.Builder()
            .givenName("Jane")
            .surName("Doe")
            .age(25)
            .gender(Gender.FEMALE)
            .email("jane.doe@example.com")
            .phoneNumber("202-123-4678")
            .address("33 3rd St, Smallville, KS 12333")
            .build() 
      );
    
    // 这里省去其他添加Person的操作
    return people;
  }

```
这个基本的类就构建完毕了，那我们就开始写一个RoboContact类来实现用户需求——从列表中找出不同身份的人，并将他们打印出来这些人的部分信息。我们首先考虑传统的方式实现这个功能：
```java
public class RoboContactMethods {
  // 遍历列表，给所有司机打电话
  public void callDrivers(List<Person> pl){
    for(Person p:pl){
      if (p.getAge() >= 16){
        roboCall(p);
      }
    }
  }
  // 同理，给所有义务兵发邮件
  public void emailDraftees(List<Person> pl){
    for(Person p:pl){
      if (p.getAge() >= 18 && p.getAge() <= 25 && p.getGender() == Gender.MALE){
        roboEmail(p);
      }
    }
  }
  // 给所有邮递员发信
  public void mailPilots(List<Person> pl){
    for(Person p:pl){
      if (p.getAge() >= 23 && p.getAge() <= 65){
        roboMail(p);
      }
    }
  }
  
  // 打电话给某人
  public void roboCall(Person p){
    System.out.println("Calling " + p.getGivenName() + " " + p.getSurName() + " age " + p.getAge() + " at " + p.getPhone());
  }
  // 发邮件给某人
  public void roboEmail(Person p){
    System.out.println("EMailing " + p.getGivenName() + " " + p.getSurName() + " age " + p.getAge() + " at " + p.getEmail());
  }
  // 发信给某人
  public void roboMail(Person p){
    System.out.println("Mailing " + p.getGivenName() + " " + p.getSurName() + " age " + p.getAge() + " at " + p.getAddress());
  }

}
```
上面的这个类就实现了简单的人员筛选的功能，但是这样的代码却在某些方面显得很臃肿：

* 没有遵循DRY原则。
 - 每个方法都进行了重复的遍历操作，其时间复杂度为O(n).
 - 要为每个筛选方法重写选择标准
* 需要用大量的方法实现每个用例
* 代码不够灵活，如果搜索条件发生变化，则需要改动代码中的一些地方，这样使得代码变得不可维护

## 重构方法
那我们有没有办法更加合理的实现这个需求呢？办法是有的，那下面就来优化这个逻辑。我们想到，如果能将判断条件作为单独的方法，那么某些方法就可以抽象出来：
```java
public class RoboContactMethods2 {
  
  public void callDrivers(List<Person> pl){
    for(Person p:pl){
      if (isDriver(p)){
        roboCall(p);
      }
    }
  }
  
  public void emailDraftees(List<Person> pl){
    for(Person p:pl){
      if (isDraftee(p)){
        roboEmail(p);
      }
    }
  }
  
  public void mailPilots(List<Person> pl){
    for(Person p:pl){
      if (isPilot(p)){
        roboMail(p);
      }
    }
  }
  
  public boolean isDriver(Person p){
    return p.getAge() >= 16;
  }
  
  public boolean isDraftee(Person p){
    return p.getAge() >= 18 && p.getAge() <= 25 && p.getGender() == Gender.MALE;
  }
  
  public boolean isPilot(Person p){
    return p.getAge() >= 23 && p.getAge() <= 65;
  }
  // ...
}
```
这样改动之后我们能够发现，将搜索条件封装在一个方法中，提高了方法的重用性，但是每个查询用例仍然需要单独的方法，那有没有好的办法能够使用相同的语句将搜索条件传递给方法呢？

## 使用匿名内部类
我们想到了匿名内部类。我们定义一个接口，并定义了一个test方法，并返回boolean值。
```java
public interface MyTest<T> {
  public boolean test(T t);
}
```
这样，我们就可以将搜索条件从方法中抽离出来了：
```java
//...
  public void phoneContacts(List<Person> pl, MyTest<Person> aTest){
    for(Person p:pl){
      if (aTest.test(p)){
        roboCall(p);
      }
    }
  }

  public void emailContacts(List<Person> pl, MyTest<Person> aTest){
    for(Person p:pl){
      if (aTest.test(p)){
        roboEmail(p);
      }
    }
  }

  public void mailContacts(List<Person> pl, MyTest<Person> aTest){
    for(Person p:pl){
      if (aTest.test(p)){
        roboMail(p);
      }
    }
  }
//...
```

这样把查询的条件交给了调用者：

```java
List<Person> pl = Person.createShortList();
RoboContactAnon robo = new RoboContactAnon();

robo.phoneContacts(pl, 
    new MyTest<Person>(){
      @Override
      public boolean test(Person p){
        return p.getAge() >=16;
      }
    }
);

System.out.println("\n=== Emailing all Draftees ===");
robo.emailContacts(pl, 
    new MyTest<Person>(){
      @Override
      public boolean test(Person p){
        return p.getAge() >= 18 && p.getAge() <= 25 && p.getGender() == Gender.MALE;
      }
    }
);


System.out.println("\n=== Mail all Pilots ===");
robo.mailContacts(pl, 
    new MyTest<Person>(){
      @Override
      public boolean test(Person p){
        return p.getAge() >= 23 && p.getAge() <= 65;
      }
    }
);
```
其实，这样的代码相比之前的遍历的方式，变得更加难以阅读，并且将搜索条件的控制转交给了调用者，而无法控制其合法性，同时，我们必须要为每次调用编写查询条件。这是实践中“垂直”问题的一个很好的例子。那是不是Lambda表达式就能够弥补这样的缺陷呢？答案是是的。

## 正确使用Lambda表达式
Lambda表达式完美的解决了这个问题，而且允许轻易的重用任何表达式，那我们看看改进后的代码：
```java
List<Person> pl = Person.createShortList();
    RoboContactLambda robo = new RoboContactLambda();
    
    // Predicates
    MyTest<Person> allDrivers = p -> p.getAge() >= 16;
    MyTest<Person> allDraftees = p -> p.getAge() >= 18 && p.getAge() <= 25 && p.getGender() == Gender.MALE;
    MyTest<Person> allPilots = p -> p.getAge() >= 23 && p.getAge() <= 65;
    
    robo.phoneContacts(pl, allDrivers);
    robo.emailContacts(pl, allDraftees);
    robo.mailContacts(pl, allPilots);
    
    // 可以容易的混合使用查询条件
    robo.mailContacts(pl, allDraftees);  
    robo.phoneContacts(pl, allPilots);    
```
相比我们原始的实现，使用了Lambda表达式后，代码变得简洁，而且还增加了代码的弹性，从原先的一个方法只能实现打电话到最终能的自由组合。这样的改变使我们不必在后期需求变更的时候忙于到处修改代码。

我们还可以继续封装查询条件：
```java
public class SearchCriteria {
  private final Map<String, Predicate<Person>> searchMap = new HashMap<>();

  private SearchCriteria() {
    super();
    initSearchMap();
  }

  private void initSearchMap() {
    Predicate<Person> allDrivers = p -> p.getAge() >= 16;
    Predicate<Person> allDraftees = p -> p.getAge() >= 18 && p.getAge() <= 25 && p.getGender() == Gender.MALE;
    Predicate<Person> allPilots = p -> p.getAge() >= 23 && p.getAge() <= 65;

    searchMap.put("allDrivers", allDrivers);
    searchMap.put("allDraftees", allDraftees);
    searchMap.put("allPilots", allPilots);
  }

  public Predicate<Person> getCriteria(String PredicateName) {
    Predicate<Person> target;
    target = searchMap.get(PredicateName);
    if (target == null) {
      System.out.println("Search Criteria not found... ");
      System.exit(1);
    }
    return target;
  }

  public static SearchCriteria getInstance() {
    return new SearchCriteria();
  }
}
```

在本例中，我们使用了自定义的接口实现了Lambda表达式，其实，在java SE 8中，早都为我们准备好了一大波类基本的函数式接口，他们在 java.util.function 包下。大概有以下几种：

* Predicate: 该对象的属性作为参数传递，类似于上文中的MyTest接口
* Consumer: An action to be performed with the object passed as argument
* Function: 将对象T转化为U，也就是说通过apply(T t)传递的T对象，经过转化后，返回U对象的实例。
* Supplier: Provide an instance of a T (such as a factory)
* UnaryOperator: A unary operator from T -> T
* BinaryOperator: A binary operator from (T, T) -> T

# Lambda表达式与Collections
在此之前，其实集合类以及使用了很多，但是这次，我们要使用Lambda表达式改变Collection的用法。

使用一个单例为外部提供了不同的查询条件，外部可通过SearchCriteria.getInstance().getCriteria(PredicateName)来获取想要的查询条件。

## ForEach
Lambda表达式为我们带来了新的功能，使我们在循环遍历一些集合的时候变得异常的容易：
```java
List<Person> pl = Person.createShortList();
// 基本的lambda表达式
pl.forEach( p -> p.print() );
// 一种“方法参考”的实现方式，在已经存在相关方法的前提下，可以使用该方式代替lambda表达式
pl.forEach(Person::print);
// 
pl.forEach(p -> { System.out.println(p.printCustom(r -> "Name: " + r.getGivenName() + " EMail: " + r.getEmail())); });
// 注：此方法实现的前提是Person中存在如下的方法用于实现自定义的log打印；
public String printCustom(Function <Person, String> f){
  return f.apply(this);
}

```
可以通过这种方式遍历任何集合。基本结构类似于增强型for循环。 然而，包括类中的迭代机制提供了许多好处。

## 链接和过滤器
除此之外，在循环遍历集合的每个元素之前，我们可以通过filter对集合进行过滤，并且可以将方法链到一起。一种方式是将过滤器filter作为参数传递。

下面的这个例子就是将集合过滤后的结果集再进行循环遍历：

```java
List<Person> pl = Person.createShortList();
SearchCriteria search = SearchCriteria.getInstance();
// 过滤所有的飞行员，并且打印
pl.stream().filter(search.getCriteria("allPilots")).forEach(Person::printWesternName);
// 过滤所有的义务兵，并且打印
pl.stream().filter(search.getCriteria("allDraftees")).forEach(Person::printEasternName);
```
从上面的例子可以看出，通过将封装的Predicate<Person>对象通过参数传递给Collection，实现了对集合的过滤。

Getting Lazy
懒是人类进步的阶梯

这些小功能是非常有用的，但是在当前已经能够很好解决循环遍历问题来说，为什么会把他们加到集合类中，
将迭代功能移入库中，使得java开发者能够更好的优化代码结构，为了更好的解释这个优点，我们需要定义两个概念；

- **Laziness**: 在编程中，Laziness指的是只处理需要处理的对象，上面的例子中，只处理了被过滤之后的对象，使得代码的效率更加高效。

- **Eagerness**: 对列表中的所有对象进行处理的代码被认为是“eager”, 例如，一个增强的for循环遍历所有元素来处理两个对象，通常被认为是“eager”的途径。这个概念相对于Laziness。
通过循环遍历部分集合，代码可以更好的通过Lazy操作进行优化，这种方式比始终使用eager模式更加高效和灵活。但是在大多数殷勤的情境中，例如求和或者求平均数，这种eager操作还是非常有必要的。

- stream()方法

在上面的例子中，我们发现在调用filter之前调用了一个stream方法，这个方法使用了一个Collection对象作为输入，返回了一个java.util.stream.Stream接口对象作为输出。stream表示在各个可以连接的方法上的一个元素序列。默认情况下，一旦元素被消费掉，他们对于Stream来说不在可见，因此，一个链操作在一个指定的流上只会发生一次，另外，一个流是可以串行（默认）或者并行执行，这篇文章的结尾有一个并行的例子。

## 突变和结果
如上所述，Stream在使用之后被丢弃。 因此，集合中的元素不能用Stream更改或突变。 但是，如果要保留从链接操作返回的元素怎么办？ 您可以将它们保存到新的集合中。 代码如下：

```java
List<Person> pl = Person.createShortList();
SearchCriteria search = SearchCriteria.getInstance();
List<Person> pilotList = pl
        .stream()
        .filter(search.getCriteria("allPilots"))
        .collect(Collectors.toList());
pilotList.forEach(Person::printWesternName);
```
collect()方法中，Collectors.toList()的返回值被传递，Collectors使得stream的结果能够返回一个列表或者一个集合， 该示例显示如何将流的结果分配给迭代器的新列表。


## map
map()方法常用于过滤，该方法从类中获取一个属性并且使用该属性执行某些操作，下面的示例展示了基于年龄的map计算。

```java
List<Person> pl = Person.createShortList();
SearchCriteria search = SearchCriteria.getInstance();

int sum = 0;
int count = 0;
// 常规用法
for (Person p:pl){
  if (p.getAge() >= 23 && p.getAge() <= 65 ){
    sum = sum + p.getAge();
    count++;
  }
}
long average = sum / count;

// 使用map计算总年龄
long totalAge = pl
        .stream()
        .filter(search.getCriteria("allPilots"))
        .mapToInt(p -> p.getAge()) // 此方法返回一个IntStream对象，这个对象中包含一个返回long的sum方法
        .sum();
// 使用map进行平均年龄计算
OptionalDouble averageAge = pl
        .parallelStream()  // 此方法用于获取并行流，可以进行并发计算，返回值类型也有所不同。
        .filter(search.getCriteria("allPilots"))
        .mapToDouble(p -> p.getAge())
        .average();
```
上面的代码颠覆性的取代了常规的for循环遍历，而是用了stream把一个集合转化为流之后，调用map从Person对象中取出年龄，最终使用sum方法完成了求和操作。

# Lambda表达式有什么优势？
Lambda表达式是Java SE 8在提高开发人员生产效率上的一个重大改进。通过语法上的改进，可以减少开发人员需要编写和维护的代码数量。在实战中，往往结合一些现在比较火热的开源框架实现函数式编程，如RxJava。极大的简化了代码的复杂度，对于能读懂函数式编程的人来说，代码的逻辑变得更加清晰，但是对于没有接触过Lambda表达式的朋友来说，或许增加了代码的难度。但是，无论如何，我们没有理由拒绝新的东西，作为Java SE 8的新功能，在推出将近两年之后，我们还不去了解他就说不过去了。

这篇文章的初成也是在我一边学习lambda表达式，一边总结的产物，其中大量参考了官方教程中的示例和思想，如果在文章中有理解的不到位的或者错误的地方，欢迎朋友留言和我交流。

# 参考文献
1. http://www.oracle.com/webfolder/technetwork/tutorials/obe/java/Lambda-QuickStart/index.html#overview
2. http://colobu.com/2014/10/28/secrets-of-java-8-functional-interface/
