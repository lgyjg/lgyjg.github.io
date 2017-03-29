---
layout: post
title: java中的volatile关键字
subtitle: java中的volatile关键字
date: 2017-03-12 16:44:32
author: JianGuo
header-img: img/post-bg-2015.jpg
tags:
  - Java
---

## 前言 

java语言对于同步的支持提供了两种内在的同步机制：同步块（或同步方法）、volatile变量。同步块的用法相对来说对于volatile更加完善，但同时又比较重，运行时的开销也比较大，而volatile相比而言虽然不能完全完成synchronized的功能，但是在某些场景下由于其简单、轻量、开销低的特点而被作为一种更优的方式使用，它不会引起线程上下文的切换和调度。同时volatile 变量不会像锁那样造成线程阻塞，因此也很少造成可伸缩性问题。在某些情况下，如果读操作远远大于写操作，volatile 变量同步机制的性能要优于锁。这就是我们使用volatile变量的原因。

> 这里需要说明的是在java8中引入了StampedLock，StampedLock是对象层面的锁，有兴趣的朋友可以自行研究下，这里不再展开阐述。

同步机制（锁）的两个主要特性就是：互斥（mutual exclusion）和可见（visibility）。
- **互斥**： 即一次只允许一个线程持有某个特定的锁，因此可使用该特性实现对共享数据的协调访问协议，这样，一次就只有一个线程能够使用该共享数据。
- **可见性（可视性）**： 主要是为了确保释放锁之前对共享数据做出的更改对于随后获得该锁的另一个线程是可见的。在多处理器的系统中，相比单处理器而言，可视性问题显得尤为突出。

## volatile关键字
Java语言规范第三版中对volatile的定义如下： java编程语言允许线程访问共享变量，为了确保共享变量能被准确和一致的更新，线程应该确保通过排他锁单独获得这个变量。Java语言提供了volatile，在某些情况下比锁更加方便。如果一个字段被声明成volatile，java线程内存模型确保所有线程看到这个变量的值是一致的。

volatile变量可用于提供有限的线程安全，所谓有限的线程安全指的是使用场景的有限性：多个变量之间或者某个变量的当前值和修改后的值之间没有约束，这个会在下面讲到。由于volatile 操作不会像锁一样造成阻塞，因此，在能够安全使用 volatile 的情况下，volatile 可以提供一些优于锁的可伸缩特性。如果读操作的次数要远远超过写操作，与锁相比，volatile 变量通常能够减少同步的性能开销。

volatile关键字确保了变量在应用中的可视性。将一个变量使用了volatile关键字修饰后，在任何一个线程中对其进行写操作，都会立即更新到主存中，即便是使用了缓存，从而使得所有的读操作的任务都能够获取到正确的值。

## volatile变量的局限
由于volatile的有限的使用场景，使得单独使用 volatile 无法实现计数器、互斥锁或任何具有与多个变量相关的不变式（Invariants）的类（例如 “start <=end”）。

## 正确使用volatile
要使 volatile 变量提供理想的线程安全，必须同时满足下面两个条件：
- **对变量的写操作不依赖于之前的值**: 例如一个递增计数器，虽然增量操作（x++）看上去类似一个单独操作，实际上它是一个由读取－修改－写入操作序列组成的组合操作，必须以原子方式执行，而在java中，这样的操作是不具有原子性的。实现正确的操作需要使 x 的值在操作期间保持不变，而 volatile 变量无法实现这点。这就限制了volatile变量不能用作线程安全计数器。
- **该变量没有包含在具有其他变量的不变式中**。也就是说这个域的值受到了其他域的值的限制。如Range的lower和upper边界就必须遵循lower<=upper的限制。

大多数编程情形都会与这两个条件的其中之一冲突，使得 volatile 变量不能像 synchronized 那样普遍适用于实现线程安全。

如果一个域完全由synchronized方法或者语句来防护，就不必使用volatile关键字进行限制，因为同步也会导致向主寸中更新;
如果一个变量对于一个任务而言只需要内部可视，则无需对其设置volatile关键字。


> 这里一直提到一个概念就是原子操作、原子性，我觉得有必要解释下什么是原子操作。原子操作指的是不可中断的一个或一系列操作，是不可被线程调度机制中断的。原子性可以作用于除long和double变量以外的所有基本类型。对于读写这些基本类型变量，可以保证他们会被当作不可分的操作来执行，就是原子操作内存。而long和double类型的变量，在进行读取和写入的会被当作两个分离的32位操作来执行，因此在进行读写的过程中如果发生了上下文切换，就会导致不同的任务看到不同的结果的可能性（称之为字撕裂）。在java SE5之后，使用volatile关键字就可以使得log和double类型的变量获得原子性（java SE5之前volatile未能正确的工作）。


## 使用示例
volatile在实际的使用中往往不尽人意，比使用锁更加容易出错，加之一般的开发者对其的了解不够深入，使得很多开发者都敬而远之。究其原因，主要还是在使用的过程中没有严格的遵循其使用原则所致。要始终牢记使用 volatile 的限制 —— 只有在状态真正独立于程序内其他内容时才能使用 volatile —— 这条规则能够避免将这些模式扩展到不安全的用例。

#### 场景1：状态标志
很多应用程序包含了一种控制结构，形式为 “在还没有准备好停止程序时再执行一些工作”，如下所示：
```java
volatile boolean shutdownRequested;
...
public void shutdown() { shutdownRequested = true; }

public void doWork() { 
    while (!shutdownRequested) { 
        // do stuff
    }
}
```

#### 场景2：一次性安全发布（one-time safe publication）
缺乏同步会导致无法实现可见性，这使得确定何时写入对象引用而不是原语值变得更加困难。在缺乏同步的情况下，可能会遇到某个对象引用的更新值（由另一个线程写入）和该对象状态的旧值同时存在。（这就是造成著名的双重检查锁定（double-checked-locking）问题的根源，其中对象引用在没有同步的情况下进行读操作，产生的问题是您可能会看到一个更新的引用，但是仍然会通过该引用看到不完全构造的对象）。
实现安全发布对象的一种技术就是将对象引用定义为 volatile 类型。

```java
public class BackgroundFloobleLoader {
    public volatile Flooble theFlooble;

    public void initInBackground() {
        // do lots of stuff
        theFlooble = new Flooble();  // this is the only write to theFlooble
    }
}

public class SomeOtherClass {
    public void doWork() {
        while (true) { 
            // do some stuff...
            // use the Flooble, but only if it is ready
            if (floobleLoader.theFlooble != null) 
                doSomething(floobleLoader.theFlooble);
        }
    }
}
```
#### 使用场景3：独立观察（independent observation）
使用volatile的另一个场景是定期 “发布” 观察结果供程序内部使用。例如，假设有一种环境传感器能够感觉环境温度。一个后台线程可能会每隔几秒读取一次该传感器，并更新包含当前文档的 volatile 变量。然后，其他线程可以读取这个变量，从而随时能够看到最新的温度值。
```java
public class UserManager {
    public volatile String lastUser;

    public boolean authenticate(String user, String password) {
        boolean valid = passwordIsValid(user, password);
        if (valid) {
            User u = new User();
            activeUsers.add(u);
            lastUser = user;
        }
        return valid;
    }
}
```

#### 使用场景4：“volatile bean” 模式
下面的例子就是一个典型的 volatile bean 模式。volatile bean 模式的基本原理是：很多框架为易变数据的持有者（例如 HttpSession）提供了容器，但是放入这些容器中的对象必须是线程安全的，除了获取或设置相应的属性外，不能包含任何逻辑。
```java
@ThreadSafe
public class Person {
    private volatile String firstName;
    private volatile String lastName;
    private volatile int age;

    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public int getAge() { return age; }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

## 总结
使用volatile的唯一安全情况就是类中只有一个可变的域（摘自《Think in java》），虽然volatile在某些方面的性能是优于synchronized的，但是并不是我们第一要考虑的使用方式，我们的第一选择仍然是synchronized关键字，这是实现并发最安全的方式。如果要使用volalite关键字，记住两个条件是关键：对变量的写操作不依赖于之前的值且该变量没有包含在具有其他变量的不变式中。


> 参考文献:
>1.  [Java 理论与实践: 正确使用 Volatile 变量](http://www.ibm.com/developerworks/cn/java/j-jtp06197.html)
