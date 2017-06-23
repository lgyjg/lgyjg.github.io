---
layout: post
title: 使用Kotlin编写测试代码
subtitle: 使用Kotlin编写测试代码
date: 2017-06-23 18:44:32
author: JianGuo
header-img: img/post-bg-2015.jpg
tags:
  - Kotlin
---

> 回顾上一篇博客，发现自己已经3个月没有写过博客了，感觉自己赖癌又犯了，最近一直在刷一些算法题，
同时参与了一个滤镜的开源项目cv4j, 还开源了自己的Camera应用，虽然这些还在前期准备的阶段，但着实
花费了很多时间和精力，加上上班工作忙，整个人都力不从心了。。。好了，不说这么多，今天在这里说说
最近被google认领的亲儿子语言：Kotlin，相信Android开发者早都有所耳闻，国外的一些开发者早在去年
就开始有尝试在项目用使用Kotlin开发了。这篇博客主要介绍国外的一位开发者总结的[Kotlin在Android
测试中的使用](https://fernandocejas.com/2017/02/03/android-testing-with-kotlin/)。
同时也会加上一些自己在kotlin使用中的技巧和经验。如有纰漏，请大家留言指正。

# Kotlin
简单说说吧，在google 17 I/O大会上，google宣布Kotlin作为Android开发的官方语言，从此Kotlin
在Android开发领域一炮大红，国内也掀起了学习kotlin的热潮，但目前来看，据我所知，除了Flipboard中国
在今年4月份宣布其Android项目正式将Kotlin作为项目开发语言外，没有商业化的应用迈出这一步，但这
一定是大势所趋。
Kotlin是一门很年轻的语言现代高级语言，由JetBrains在10年推出，并在11年开源，由于其基于 JVM，
能够与java语言无缝对接，因此虽然很年轻，却拥有大量的库。相比Java语言，它简单又安全，避免了Java
程序猿最头疼的空指针问题。作为高级语言，它一样都不少：
- 简洁： 简洁的代码增强了逻辑的可读性，同时也减少了犯错的概率。
- 强表现力： 很短的语句却能表现出更多的语义。
- 对Android友好： 正如上文所示，google将其作为Android开发的官方语言，其兼容性是毋庸置疑的。
- 类型安全的： Kotlin避免了类型转化异常，会检查类型是否匹配，如果匹配才回去自动转化。
- 功能强大： Kotlin具有里良好的互操作性，无论是java，还是javaScript，它都能顺利转化和调用。

# 使用Kotlin编写测试代码
大家都知道，一个完整的项目是少不了单元测试和本地化测试代码的，但是，使用Kotlin
开发的语言能否用java编写的测试case呢？当然是能的，但好吗？我们用了才知道。那就开始吧...

首先我们看看，如何使用Kotlin测试我们的Android应用程序。

第一、在build.gradle中添加Kotlin test相关依赖
```groovy
// in root build.gradle
buildscript {
  repositories {
    mavenCentral()
    jcenter()
  }
  dependencies {
    classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.1.2-5'
  }
}
// in app build.gradle
apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'

...

dependencies {
  ...
  compile "org.jetbrains.kotlin:kotlin-stdlib:1.1.2-5"

  ...
  testCompile 'org.jetbrains.kotlin:kotlin-stdlib:1.0.6'
  testCompile 'org.jetbrains.kotlin:kotlin-test-junit:1.0.6'
  testCompile "com.nhaarman:mockito-kotlin:1.1.0"
  testCompile 'org.amshove.kluent:kluent:1.14'
}
```

如果项目test文件夹下的源文件不在java文件下下，而是在自定义的kotlin下，还需要声明路径：
```groovy
android {
  ...
  sourceSets {
    test.java.srcDirs += 'src/test/kotlin'
    androidTest.java.srcDirs += 'src/androidTest/kotlin'
  }
  ...
}
```
为了确保项目不在发布的Realse版本上出现意外，一般在kotlin代码中加入以下代码，以避免将测试代码打包：
```groovy
afterEvaluate {
  android.sourceSets.all { sourceSet ->
    if (!sourceSet.name.startsWith('test') || !sourceSet.name.startsWith('androidTest')) {
      sourceSet.kotlin.setSrcDirs([])
    }
  }
}
```
接下来就可以像java项目一样开始编写测试代码了。

## JUit Test

这里我们仅使用[JUnit](http://junit.org/junit4/), [Mockito-kotlin](https://github.com/nhaarman/mockito-kotlin) 和 [Kluent](https://github.com/MarkusAmshove/Kluent) 库进行单元测试的编写。
下面是一个简单的GetUserDetails.java类的测试case的例子，来自[Android-KotlinInTests](https://github.com/android10/Android-KotlinInTests):
```kotlin
class GetUserDetailsTest {

  private val USER_ID = 123

  private lateinit var getUserDetails: GetUserDetails

  private val userRepository: UserRepository = mock()
  private val threadExecutor: ThreadExecutor = mock()
  private val postExecutionThread: PostExecutionThread = mock()

  @Before
  fun setUp() {
    getUserDetails = GetUserDetails(userRepository, threadExecutor, postExecutionThread)
  }

  @Test
  fun shouldGetUserDetails() {
    getUserDetails.buildUseCaseObservable(GetUserDetails.Params.forUser(USER_ID));

    verify(userRepository).user(USER_ID)
    verifyNoMoreInteractions(userRepository)
    verifyZeroInteractions(postExecutionThread)
    verifyZeroInteractions(threadExecutor)
  }
}
```
需要注意的是，在kotlin中，当我们需要在Setup方法中延迟初始化getUserDetails对象时，需要声明为“lateinit”，否则编译器会报错，因为属性必须被初始化或者被抽象。下面的这个例子则是在定义变量的时候进行的初始化，此时则不需要声明：
```kotlin
class SerializerTest {

  private val JSON_RESPONSE = "{\n \"id\": 1,\n " +
                              "\"cover_url\": \"http://www.android10.org/myapi/cover_1.jpg\",\n " +
                              "\"full_name\": \"Simon Hill\",\n " +
                              "\"description\": \"Curabitur gravida nisi at nibh. In hac habitasse " +
                              "platea dictumst. Aliquam augue quam, sollicitudin vitae, consectetuer " +
                              "eget, rutrum at, lorem.\\n\\nInteger tincidunt ante vel ipsum. " +
                              "Praesent blandit lacinia erat. Vestibulum sed magna at nunc commodo " +
                              "placerat.\\n\\nPraesent blandit. Nam nulla. Integer pede justo, " +
                              "lacinia eget, tincidunt eget, tempus vel, pede.\",\n " +
                              "\"followers\": 7484,\n " +
                              "\"email\": \"jcooper@babbleset.edu\"\n}"

  private var serializer = Serializer()

  @Test
  fun shouldSerialize() {
    val userEntityOne = serializer.deserialize(JSON_RESPONSE, UserEntity::class.java)
    val jsonString = serializer.serialize(userEntityOne, UserEntity::class.java)
    val userEntityTwo = serializer.deserialize(jsonString, UserEntity::class.java)

    userEntityOne.userId shouldEqual userEntityTwo.userId
    userEntityOne.fullname shouldEqual userEntityTwo.fullname
    userEntityOne.followers shouldEqual userEntityTwo.followers
  }

  @Test
  fun shouldDesearialize() {
    val userEntity = serializer.deserialize(JSON_RESPONSE, UserEntity::class.java)

    userEntity.userId shouldEqual 1
    userEntity.fullname shouldEqual "Simon Hill"
    userEntity.followers shouldEqual 7484
  }
}
```

## 自动化测试 (集成测试)
下面的例子创建了一个测试类的抽象父类，封装了所有Robolectic相关的内容，因此，测试就可以不依赖于此框架，这种方式可以避免Robolectic架构污染到我们的测试案例，在后期需要迁移框架或者向后兼容新版本的过程中能够轻而易举的换掉。
```kotlin
/**
 * Base class for Robolectric data layer tests.
 * Inherit from this class to create a test.
 */
@RunWith(RobolectricTestRunner::class)
@Config(constants = BuildConfig::class,
        application = AndroidTest.ApplicationStub::class,
        sdk = intArrayOf(21))
abstract class AndroidTest {

  fun context(): Context {
    return RuntimeEnvironment.application
  }

  fun cacheDir(): File {
    return context().cacheDir
  }

  internal class ApplicationStub : Application()
}
```

下面是具体的集成测试的例子：
```kotlin
class FileManagerTest : AndroidTest() {

  private var fileManager = FileManager()

  @After
  fun tearDown() {
    fileManager.clearDirectory(cacheDir())
  }

  @Test
  fun shouldWriteToFile() {
    val fileToWrite = createDummyFile()
    val fileContent = "content"

    fileManager.writeToFile(fileToWrite, fileContent)

    fileToWrite.exists() shouldEqualTo true
  }

  @Test
  fun shouldHaveCorrectFileContent() {
    val fileToWrite = createDummyFile()
    val fileContent = "content\n"

    fileManager.writeToFile(fileToWrite, fileContent)
    val expectedContent = fileManager.readFileContent(fileToWrite)

    expectedContent shouldEqualTo fileContent
  }

  private fun createDummyFile(): File {
    val dummyFilePath = cacheDir().path + File.separator + "dummyFile"
    return File(dummyFilePath)
  }
}
```
## Espresso Acceptance (UI测试)
继承测试的框架也很多，目前来看，Espresso是最稳定的继承测试框架了，同时得到了google的支持，所以这里选择使用Espresso进行集成测试的开发，在这个框架上，我们同样实现了一次封装AcceptanceTest.kt：
```kotlin
@LargeTest
@RunWith(AndroidJUnit4::class)
abstract class AcceptanceTest<T : Activity>(clazz: Class<T>) {

  @Rule @JvmField
  val testRule: ActivityTestRule<T> = IntentsTestRule(clazz)

  val checkThat: Matchers = Matchers()
  val events: Events = Events()
}
```
需要注意的是：
- 从文档中可以看出，Esprosso需要一个测试规则。 这个规则提供了单个Activity的功能测试，在使用“@Test”注解的每个测试方法之前，和使用“@Before”注解的方法之前，将启动被测Activity，在测试完成之后，并且“@After”注解的方法执行完后，就会终止该Activity，在测试期间，可以直接操作Activity。
- 我们必须使用“@JvmField”对我们的testRule进行注解。将Kotlin属性转化为JVM能够解释的字段是必要的。
- Matchers类。 围绕Esprosso继续检查的一个封装。
- Events类。 对Espresso events.dan的一个封装。

```kotlin
class Matchers {
  fun <T : Activity> nextOpenActivityIs(clazz: Class<T>) {
    intended(IntentMatchers.hasComponent(clazz.name))
  }

  fun viewIsVisibleAndContainsText(@StringRes stringResource: Int) {
    onView(withText(stringResource)).check(matches(withEffectiveVisibility(Visibility.VISIBLE)))
  }

  fun viewContainsText(@IdRes viewId: Int, @StringRes stringResource: Int) {
    onView(withId(viewId)).check(matches(withText(stringResource)))
  }
}
```
```kotlin
class Events {
  fun clickOnView(@IdRes viewId: Int) {
    onView(withId(viewId)).perform(click())
  }
}
```
最后，我们实现Activity的测试类就可以了。
```kotlin
class MainActivityTest : AcceptanceTest<MainActivity>(MainActivity::class.java) {

  @Test
  fun shouldOpenHelloWorldScreen() {
    events.clickOnView(R.id.btn_hello_world)
    checkThat.nextOpenActivityIs(HelloWorldActivity::class.java)
  }

  @Test
  fun shouldDisplayAction() {
    events.clickOnView(R.id.fab)
    checkThat.viewIsVisibleAndContainsText(R.string.action)
  }
}
```
## 运行我们的测试 battery
从Android Studio / Intellij 运行时，我们无需配置多余的代码，但是在命令行运行时，我们可以添加以下几个任务：
```groovy
task runUnitTests(dependsOn: [':app:testDebugUnitTest']) {
  description 'Run all unit tests'
}

task runAcceptanceTests(dependsOn: [':app:connectedAndroidTest']) {
  description 'Run all acceptance tests.'
}
```
只需执行以下命令：
```shell
./gradlew runUnitTests
./gradlew runAcceptanceTests
```
完美运行。。。

# 总结
如果你还没有开始使用kotlin开发Android应用，并使用它作为你的测试语言，你现在可以做个尝试了。

# 参考文献
>
- https://fernandocejas.com/2017/02/03/android-testing-with-kotlin/
- https://github.com/android10/Android-KotlinInTests
