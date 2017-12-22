---
layout: post
title: Android内存泄露指北
subtitle: Android内存泄露指北
date: 2017-12-23 00:17:32
author: JianGuo
header-img: img/home-bg-o.jpg
tags:
  - Android
---

> 懒癌晚期，好久都没有写博客了，上次写博客应该是在找工作那段时间，个人时间被打的很散，工作上效率又上不去，博客就被一直搁置着。今天抽空写写Android handler的内存泄露。如果你还没有完全理解什么时候会发生内存泄露，这篇短文值得你看一看。


在Android应用开发过程中有一类问题很常见，那就是OMM，在申请内存超出系统对单个应用的内存使用上限时就会抛出OOM异常，如下：
```shell 
E AndroidRuntime: FATAL EXCEPTION: main
E AndroidRuntime: Process: com.example.yjg.myapplication, PID: 25571
E AndroidRuntime: java.lang.OutOfMemoryError: Failed to allocate a 16777232 byte allocation with 14661992 free bytes and 13MB until OOM, max allowed footprint 268435456, growth limit 268435456
E AndroidRuntime:  at com.example.yjg.myapplication.MainActivity.<init>(MainActivity.java:14)
E AndroidRuntime:  at java.lang.Class.newInstance(Native Method)
E AndroidRuntime:  at android.app.Instrumentation.newActivity(Instrumentation.java:1174)
E AndroidRuntime:  at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:2722)
E AndroidRuntime:  at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:2906)
E AndroidRuntime:  at android.app.ActivityThread.-wrap11(Unknown Source:0)
E AndroidRuntime:  at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1605)
E AndroidRuntime:  at android.os.Handler.dispatchMessage(Handler.java:105)
E AndroidRuntime:  at android.os.Looper.loop(Looper.java:164)
E AndroidRuntime:  at android.app.ActivityThread.main(ActivityThread.java:6642)
E AndroidRuntime:  at java.lang.reflect.Method.invoke(Native Method)
E AndroidRuntime:  at com.android.internal.os.Zygote$MethodAndArgsCaller.run(Zygote.java:240)
E AndroidRuntime:  at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:778)
```

这类问题通常是由于一些静态变量，单例，多进程等长生命周期的实例导致持有的Activity引用在其生命周期结束时不能及时释放导致的。今天我们来看一个最常见的，也是最容易引起内存泄露的例子—— Handler。

通常，我们写的代码是这样的：

![图1](/img/in-post/Android_Handler_Memory_Leak/pic_1.jpg)

我们发现AndroidStudio已经智能的提示这块代码可能导致内存泄露了：

![图2](/img/in-post/Android_Handler_Memory_Leak/pic_2.jpg)

如果一个Handler被申明为内部类，它将有可能阻止其外部类的回收，如果Handler使用的是其他的非Main thread的Looper 或者MessageQueue，这时是没有问题的，但是如果Handler使用了主线程的Looper或者MessageQueue，则需要修改Handler的声明方式，申明为一个静态类，并使用WeakReference 来应用外部类的实例，并保证所有使用的外部类的实例都采用弱引用的方式实现。

说的一头雾水？于是乎网上找到了解决方案，把Handler实现成了这个样子：

![图3](/img/in-post/Android_Handler_Memory_Leak/pic_3.jpg)

于是乎，你给Handler发送了这样一条消息：

![图4](/img/in-post/Android_Handler_Memory_Leak/pic_4.jpg)

无论你怎么打开销毁Activity，OOM再也没有出现，终于，AndroidStudio不再报错了，长吸一口气，终于可以愉快的玩耍了！

……

就这样你以为你解决了问题。可是，有一天，你的猪队友发送了这样一条消息给Handler：

![图5](/img/in-post/Android_Handler_Memory_Leak/pic_5.jpg)


结果没多久，OOM又出现了！ 什么？WTF，之前写的不起作用？ 因为Runnable也持有外部类Activity的引用啊！
于是你有吐着血把Runable写成了静态内部类：

![图6](/img/in-post/Android_Handler_Memory_Leak/pic_6.jpg)

但现实中，并没有这么轻松，因为Runable或多或少要引用很多Activity的成员变量，都是用弱引用代码可读性骤然下降。

最终，你在徘徊与彷徨之中，有一位老人给你抛出这么一段代码：

![图7](/img/in-post/Android_Handler_Memory_Leak/pic_7.jpg)

于是，你的眼前一片光明，OOM再也没有出现过了！！！

结论：

在Activity生命周期结束时，清除Handler的消息和回调函数才是王道！Handler是静态的，但你也无法保证所有给Handler发送的callback也都是静态的！


最后祭出代码：

```java

public class MainActivity extends AppCompatActivity {
    private static final String TAG = MainActivity.class.getSimpleName();
    // 创建4M的数组增大泄露速度
    private long[] longArr = new long[1024*1024*2];

   /*private Handler mHandler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            Log.d(TAG, "handleMessage: ");
        }
    };*/

    private Handler mHandler = new MyHandler(this);
    private static class MyHandler extends Handler{
        private final WeakReference<MainActivity> mActivity;

        MyHandler(MainActivity activity) {
            mActivity = new WeakReference<MainActivity>(activity);
        }
        @Override
        public void handleMessage(Message msg) {
            super.handleMessage(msg);
            Log.d(TAG, "handleMessage: ");
        }
    }

//    private static final Runnable myRunnable = new Runnable() {
//        @Override
//        public void run() {
//            Log.d(TAG, "handleMessage: ");
//        }
//    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 1. 延迟5min发送message 1：
        mHandler.sendEmptyMessageDelayed(1,1000*60*5);

        // 2. 发送匿名内部类Runnable
//        mHandler.postDelayed(new Runnable() {
//            @Override
//            public void run() {
//                Log.d(TAG, "run: ");
//            }
//        }, 1000 * 60 * 5);

        // 3. 发送静态Runnable对象
//        mHandler.postDelayed(myRunnable, 1000*60*5);

    }

    @Override
    protected void onDestroy() {
        mHandler.removeCallbacksAndMessages(null);
        super.onDestroy();
    }
}
```