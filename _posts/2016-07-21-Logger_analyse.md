---
layout: post
title: Logger开源库刨析
subtitle: Logger是github上关于Andorid Log打印优化和封装的软件，是一款简洁、优雅、强大的log跟踪器，截止目前已经有4003个star。
author: JianGuo
header-img:
tags: 开源项目
date: 2016-07-21 20:58:29
---

> 最近突发奇想，想自己重新封装android的log机制，以便于在以后的开发中简单的使用log进行调试。我们知道，在大多数的情况下我们需要对log的状态进行配置，在user版本中为了安全，某些关键log不能打印出来，同时，可能在调试的时候，我们只需要打印某个级别的log。通常情况下，我们是在每个类中进行log打印的控制（使用DEBUG的全局变量），每次打印log时都需要进行判断，这样的代码显然有点繁琐。所以，就需要通过封装Log完成上面的需求。为了避免重复造轮子，我在Github上检索了一下，果然发现了宝藏。一个名为Logger的开源项目，完美的诠释了什么是轮子。所以直接搬来用了。接下来的内容介绍这个项目如何使用。

<img align="right" src='https://raw.githubusercontent.com/orhanobut/logger/master/images/logger-logo.png' width='128' height='128'/>

# Loger简介
Logger是github上关于Andorid Log打印优化和封装的开源项目，是一款简洁、优雅、强大的log跟踪器（官方如是说），截止目前已经有4003个star，700多个fork。项目地址为：[https://github.com/orhanobut/logger](https://github.com/orhanobut/logger)。  

它主要提供了以下功能：
  * 输出线程信息
  * 输出类信息
  * 输出方法信息
  * 格式化输出json数据
  * 对于log中的“\n” 换行输出
  * 清理输出
  * 直接跳转到代码行

下面来看看打印出的log效果吧：  
![Log](https://raw.githubusercontent.com/orhanobut/logger/master/images/description.png)

> 同时，从所有的fork列表中，发现了另一个比较好的版本演变，如果感兴趣的话可以异步：[tianzhijiexian/logger](https://github.com/tianzhijiexian/logger)。

# 如何使用
## 如何添加依赖
了解到这么强大的功能后，肯定想知道如何使用了。如果你的项目在使用gradle构建的话，最简单，最直接的方式就是添加依赖了。
```groovy
compile 'com.orhanobut:logger:1.15'
```
当然，如果不能直接引用的话，就乖乖下载源码，放入到系统，或者编译出jar包，做依赖吧。

## 在代码中使用
Logger的使用上和Log的区别并不是很大。如下的代码展示了Logger的使用：
```java
Logger.d("hello");
Logger.d("hello %s %d", "world", 5);   // String.format
Logger.e("hello");
Logger.e(exception,"message");
Logger.w("hello");
Logger.v("hello");
Logger.wtf("hello");
Logger.json(JSON_CONTENT);
Logger.xml(XML_CONTENT);
Logger.log(DEBUG, "tag", "message", throwable);
```
同时，Logger还能直接打印Array, Map, Set and List等对象，不需要进行遍历输出。
```java
Logger.d(list);
Logger.d(map);
Logger.d(set);
Logger.d(new String[]);
```
## 配置Logger
如果你相对Logger进行更深的定制的话，也可以在Logger的init方法中进行详细的配置：
```java
Logger
  .init(YOUR_TAG)                 // 默认为 PRETTYLOGGER 或者仅使用 init()
  .methodCount(3)                 // 默认为 2
  .hideThreadInfo()               // 默认为显示线程信息
  .logLevel(LogLevel.NONE)        // 默认打印所有级别的log，即参数为：LogLevel.FULL
  .methodOffset(2)                // 默认为 0
  .logAdapter(new AndroidLogAdapter()); //默认为 AndroidLogAdapter
}
```
需要注意的是，这个方法只能被调用一次，最好能够在Application类中进行全局设置。所有的设置都是可选的，不设置也无不影响使用。**建议在发布的版本中将logLevel设置为:LogLevel.NONE**

### 添加TAG
```java
// 添加全局的TAG
Logger.init(YOUR_TAG);
// 添加当前Logger的TAG
Logger.t("mytag").d("hello");
```
效果如下：
![Logger打印效果](https://github.com/orhanobut/logger/raw/master/images/custom-tag.png)
其实，在我看来，添加类的tag已经没有什么大的必要了，因为Logger在打印log的时候，会输出类名和方法名，直接检索就可以了。

### 设置打印方法数
```java
// 修改全局打印的方法数
Logger.init().methodCount(1);
// 修改当前Logger想打印的方法数
Logger.t(1).d("hello");
```
### 设置方法方法堆栈偏移量
为了避免其他库对logger的使用影响到程序的使用，可以设置类避免其他库的方法：
```java
Logger.init().methodOffset(5);
```
### 隐藏线程信息
```java
Logger.init().methodCount(1).hideThreadInfo();
```
### 仅打印消息
```java
Logger.init().methodCount(0).hideThreadInfo();
```
![只打印信息时的效果](https://github.com/orhanobut/logger/raw/master/images/just-content.png)

### 使用其他Log工具代替android.util.log
  1. 实现 LogAdapter
  2. 在init中配置它

具体配置代码可参考下面的例子：
```java
.logAdapter(new CustomLogAdapter());
```

### Timber Integration
不明觉厉，所以只能把github上的介绍粘贴过来了。
```java
Timber.plant(new Timber.DebugTree() {
  @Override protected void log(int priority, String tag, String message, Throwable t) {
    Logger.log(priority, tag, message, t);
  }
});
```

# 代码实现原理解析
整个代码也只有八个类，非常简洁。代码虽少，但是很规范，融入着基本的设计模式和思想，很值得学习。
  * AndroidLogAdapter.java 其实就是对android.util.Log方法的封装。适配器类的简单应用实例。如果想对这个类进行重新封装，则可以实现自己的adapter，然后通过 ***Logger.logAdapter(new CustomLogAdapter());*** 方法进行设置。
  * Helper.java helper类提供了一些静态方法用来处理字符串的相关操作，例如判空，判断两个字符串是否相同，取得堆栈字符串，避免空指针。
  * LogAdapter.java 适配器的接口
  * LogLevel.java 定义了log的级别，当前只有两种状态： FULL,NONE
  * Logger.java 主类，
  * LoggerPrinter.java 负责log的输出格式化，输出json，xml，set等数据。继承字Printer.java
  * Printer.java Printer接口
  * Settings.java logger配置的数据结构

下面就针对Logger类和LoggerPrinter的实现进行进一步的分析。
在Logger.java中，也基本上是完成了Settings和LoggerPrinter的实例化，并且封装了Printer的接口，给外部调用。主要可操作的接口有以下这些：
 * public static Settings init()
 * public static Settings init(String tag)
 * public static void resetSettings()
 * public static Printer t(String tag)
 * public static Printer t(int methodCount)
 * public static Printer t(String tag, int methodCount)
 * public static void log(int priority, String tag, String message, Throwable throwable)
 * public static void d(Object object) //其实可以看出的d方法中，可以直接将对象传入，如果是Array，则可以解析出数据进行打印，其他的则打印object.toString()信息，但是其他级别的log中并不能实现这一点。
 * public static void d(String message, Object... args)
 * public static void e(String message, Object... args)
 * public static void e(Throwable throwable, String message, Object... args)
 * public static void i(String message, Object... args)
 * public static void v(String message, Object... args)
 * public static void w(String message, Object... args)
 * public static void wtf(String message, Object... args)
 * public static void json(String json) //打印json数据
 * public static void xml(String xml) //打印xml信息

在LoggerPrinter.java中，主要的逻辑集中在以下几个方法中：
json（）方法：
```java
/**
   * Formats the json content and print it
   *
   * @param json the json content
   */
  @Override public void json(String json) {
    if (Helper.isEmpty(json)) {
      d("Empty/Null json content");
      return;
    }
    try {
      json = json.trim();
      if (json.startsWith("{")) {
        JSONObject jsonObject = new JSONObject(json);
        String message = jsonObject.toString(JSON_INDENT);
        d(message);
        return;
      }
      if (json.startsWith("[")) {
        JSONArray jsonArray = new JSONArray(json);
        String message = jsonArray.toString(JSON_INDENT);
        d(message);
        return;
      }
      e("Invalid Json");
    } catch (JSONException e) {
      e("Invalid Json");
    }
  }

```
xml方法，用来将xml字符串进行简化。
```java
/**
 * Formats the json content and print it
 *
 * @param xml the xml content
 */
@Override public void xml(String xml) {
  if (Helper.isEmpty(xml)) {
    d("Empty/Null xml content");
    return;
  }
  try {
    Source xmlInput = new StreamSource(new StringReader(xml));
    StreamResult xmlOutput = new StreamResult(new StringWriter());
    Transformer transformer = TransformerFactory.newInstance().newTransformer();
    transformer.setOutputProperty(OutputKeys.INDENT, "yes");
    transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
    transformer.transform(xmlInput, xmlOutput);
    d(xmlOutput.getWriter().toString().replaceFirst(">", ">\n"));
  } catch (TransformerException e) {
    e("Invalid xml");
  }
}
```
log（）方法：
```java
@Override public synchronized void log(int priority, String tag, String message, Throwable throwable) {
    if (settings.getLogLevel() == LogLevel.NONE) {
      return;
    }
    if (throwable != null && message != null) {
      message += " : " + Helper.getStackTraceString(throwable);
    }
    if (throwable != null && message == null) {
      message = Helper.getStackTraceString(throwable);
    }
    if (message == null) {
      message = "No message/exception is set";
    }
    int methodCount = getMethodCount();
    if (Helper.isEmpty(message)) {
      message = "Empty/NULL log message";
    }

    logTopBorder(priority, tag);
    logHeaderContent(priority, tag, methodCount);

    //get bytes of message with system's default charset (which is UTF-8 for Android)
    byte[] bytes = message.getBytes();
    int length = bytes.length;
    if (length <= CHUNK_SIZE) {
      if (methodCount > 0) {
        logDivider(priority, tag);
      }
      logContent(priority, tag, message);
      logBottomBorder(priority, tag);
      return;
    }
    if (methodCount > 0) {
      logDivider(priority, tag);
    }
    for (int i = 0; i < length; i += CHUNK_SIZE) {
      int count = Math.min(length - i, CHUNK_SIZE);
      //create a new String with system's default charset (which is UTF-8 for Android)
      logContent(priority, tag, new String(bytes, i, count));
    }
    logBottomBorder(priority, tag);
  }
```

# 功能优化
这个以后有空再谈，毕竟还没有使用的需求。更谈不上优化了。
