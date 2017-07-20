---
layout: post
title: 使用Espresso编写自动化测试程序
subtitle: 使用Espresso入门文档
date: 2017-07-20 13:10:32
author: JianGuo
header-img: img/home-bg-o.jpg
tags:
  - Android
---

> Espresso 是意大利浓缩咖啡的意思，在原产国意大利，它的意思就是咖啡的意思，意大利咖啡是一种通过
迫使接近沸腾的高压水流通过磨成细粉的咖啡制作而成的饮料， 使用这样一个名字作为自动化测试的框架的名字，
我想作者的意思是让我们都能够摆脱测试的苦恼，坐在沙发上喝杯浓缩咖啡，让自动化脚本来完成繁重的测试工作吧。
官方是这么说的： “Espresso tests run optimally fast! It lets you leave your waits, syncs,
sleeps, and polls behind while it manipulates and asserts on the application UI when it is at rest.”，
这篇文章就来介绍一下Espresso的基本用法，可以作为一个简单的入门文章供大家参考。

使用Espresso可以写出很简洁的测试代码，例如下面这样：
```java
@Test
public void greeterSaysHello() {
  onView(withId(R.id.name_field)).perform(typeText("Steve"));
  onView(withId(R.id.greet_button)).perform(click());
  onView(withText("Hello Steve!")).check(matches(isDisplayed()));
}
```
可以看到，通过onView方法，指定需要控制的View的对象，并调用perform()来启动操作事件，最后使用check()来检测运行结果。
在Espresso中，核心的API非常的轻量，也很容易根据自己的需求进行定制。

Espresso 为我们提供了可选的组件以完成不同的测试工作
- espresso-core 包含了基本的核心的功能，例如View匹配器，actions, assertions等基本组件。
- espresso-web 添加了WebView的支持
- espresso-idling-resource 用于同步后台工作的机制
- espresso-contrib 包含了一些DatePicker, recyclerview 和 Drawer Actions， 辅助检查等的功能
- espresso-intents 用于验证调用意图的扩展，用于隔离（hermetic）测试。


# Espresso的配置
Espresso在google提供的support包中能够直接找到，因此我们可以通过使用SDK Manager直接下载相关的库。
在AnroidStudio中便可以轻松的使用。

1. 做进行自动化测试的时候，为了避免一些问题，我们通常需要在开发者选项中关闭系统的动画。
- Window animation scale
- Transition animation scale
- Animator duration scale

2. 使用SDK Manager 下载 Android Support Repository 仓库，并在项目 ```build.gradle``` 文件中添加相关的依赖。
```gradle
androidTestCompile 'com.android.support.test.espresso:espresso-core:2.2.2'
androidTestCompile 'com.android.support.test:runner:0.5'
```
这里我们只依赖了基础核心包，其他的包请根据需求依赖。

3. 配置instrumentation runner
```gradle
android {
  defaultConfig {
    ...
    testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
  }
}
```

4. 最后，就可以在测试case中使用espresso编写测试代码了
```java
@RunWith(AndroidJUnit4.class)
@LargeTest
public class HelloWorldEspressoTest {

    @Rule
    public ActivityTestRule<MainActivity> mActivityRule = new ActivityTestRule(MainActivity.class);

    @Test
    public void listGoesOverTheFold() {
        onView(withText("Hello world!")).check(matches(isDisplayed()));
    }
}
```

5. 运行测试
我们需要在AndroidStudio中创建一个测试配置项
 - 打开 Run -> Edit Configurations
 - 添加一个Android Test 配置
 - 选择一个module
 - 指定instrumentation runner 为 ```android.support.test.runner.AndroidJUnitRunner```
运行该 配置项

6. 我们还可以在Gradle 命令行中运行测试
```
./gradlew connectedAndroidTest
```

# 基本类库介绍
下面介绍一些espresso 的主要组件。
- Espresso – 所有View的入口，这些View是通过onView 或者onData 来捕获的。Espresso 本身没有捆绑任何的视图。
- ViewMatchers – 继承自Matcher接口的对象集合，可以将一个或者多个该对象传递给onView方法在view树中定位一个View。
- ViewActions – 一个ViewAction的集合，这个集合用于传递给ViewInteraction.perform()方法来完成相关的动作。
- ViewAssertions – ViewAssertion对象的集合，这个集合用于传递给ViewInteraction.check()方法用于验证匹配结果。

例如：
```java
onView(withId(R.id.my_view))      // withId(R.id.my_view) is a ViewMatcher
  .perform(click())               // click() is a ViewAction
  .check(matches(isDisplayed())); // matches(isDisplayed()) is a ViewAssertion
```
## 使用onView来捕获一个控件
大多数情况下，使用功能onView能够准确匹配到响应的控件，需要匹配的控件有一个id，通过withid()匹配器进行匹配，
将大大的缩小View的搜索范围，但是，很多时候，在运行时，我们无法确定需要匹配的控件的id， 这时，就需要通过
访问Activity或者Fragment私有成员。
如果使用withId匹配到多个view，就会抛出以下异常：
```java
java.lang.RuntimeException:
com.google.android.apps.common.testing.ui.espresso.AmbiguousViewMatcherException:
This matcher matches multiple views in the hierarchy: (withId: is <123456789>)
```
那我们就需要添加其他的匹配器来匹配这个资源了
```java
onView(allOf(withId(R.id.my_view), withText("Hello!")))
或者
onView(allOf(withId(R.id.my_view), not(withText("Unwanted"))))
```
当然，作为一个优秀的应用程序代码来说，我们需要尽量避免在程序中对不同的组件使用同样的id，并且添加上
对应的描述（我们可以使用withContentDescription()匹配到对应的组件）。如果你使遍浑身解数没能匹配
到相应的View的话，尽管将它作为bug抛出去好了。

那有人可能已经想到ListView，GridView中的item怎么匹配，确实，使用onView是无法做到的，我们需要使用
onData()来进行匹配。

具体的相关方法见：[ViewMatchers](https://android.googlesource.com/platform/frameworks/testing/+/android-support-test/espresso/core/src/main/java/android/support/test/espresso/matcher/ViewMatchers.java)


## 对控件执行相关的Action
如果你已经成功匹配到了目标View，那我们便可以调用perform，并将对应的ViewAction传进去执行相关的操作了。
```java
onView(...).perform(click()); // 点击该View
onView(...).perform(typeText("Hello"), click()); //
onView(...).perform(scrollTo(), click()); // 滚动并点击, 当该View可见时，scrollTo无效
```

具体的Actions见：
 [ViewActions](https://android.googlesource.com/platform/frameworks/testing/+/android-support-test/espresso/core/src/main/java/android/support/test/espresso/action/ViewActions.java)

## 检查结果
在执行完相应的Action之后，我们需要调用check()对执行结果做检查，并将判断条件做为参数传入，如
```java
onView(...).check(matches(withText("Hello!")));
```
最常使用的便是matches([ViewMatcher])这个方法了。

具体的相关方法见：
[ViewMatcher](https://android.googlesource.com/platform/frameworks/testing/+/android-support-test/espresso/core/src/main/java/android/support/test/espresso/matcher/ViewMatchers.java)

## onData的使用
对于ListView，GridView等列表项的控件来说，使用onView就不能够准确定位了，因为每个item的控件id是相同的。
Espresso提供了onData接口来帮我们完成这些控件的动作。下面来看一个简单的例子。

一个Activity包含一个Spinner，这个Spinner有一些子item，显示了咖啡的种类，当item被点击时，文字被转化为
"One %s a day!" , %s代表当前第几个item被点击。我们的测试目标是打开Spinner，选择一个item，并验证TextView
的字符是否符合预期。

1. 点击Spinner
 ```java
onView(withId(R.id.spinner_simple)).perform(click());
 ```
2. 点击其中一个item “Americano”
```java
onData(allOf(is(instanceOf(String.class)), is("Americano"))).perform(click());
```
3. 检查是否包含“Americano”
```java
onView(withId(R.id.spinnertext_simple))
  .check(matches(withText(containsString("Americano"))));
```


到这里，Espresso基本的使用就基本介绍完了，要想了解更多的使用方法，可以查看[官方文档](https://google.github.io/android-testing-support-library/docs/espresso/index.html)，或者[源码](https://android.googlesource.com/platform/frameworks/testing/+/android-support-test/espresso/core/src/main/java/android/support/test/espresso/)。
