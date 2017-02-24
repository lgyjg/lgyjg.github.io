---
layout: post
title: 认识SurfaceView和SurfaceTexture
subtitle: 有听闻说在 Android 7.0 之后SurfaceView 将比 SurfaceTexture 更加低功耗，这也激起了很多应用的换脸热潮，所以今天准备一探究竟。
author: JianGuo
header-img:
tags: Android
keywords: surfaceTexture, surfaceView
date: 2016-08-04 00:28:29
---


>有听闻说在 Android 7.0 之后SurfaceView 将比 SurfaceTexture 更加低功耗，这也激起了很多应用的换脸热潮，所以今天准备一探究竟。  
BTW： 晚上闲来无事，于是乎又给自己挖了一坑，突然发现想把这个坑填满，遥遥无期啊。

## SurfaceView 
surfaceView继承自View，因此它本质上是一个View。但与普通View不同的是，它有自己的Surface。在google的API中，有两个子类分别是：GLSurfaceView 和 VideoView。SurfaceView 是专门用于嵌入在View hierachy的树形结构中进行图像绘制的图层（surface）。我们可以控制这个view的格式，例如大小。SurfaceView将会专注于放置在屏幕上恰当位置的那个图层。对于一个Surface而言，它在Z轴，也就是垂直于屏幕的方向上是有序排列的，所以，它在持有它的SurfaceView的窗口后面。这句话可能很多人不能理解，盗张图（摘自[http://blog.csdn.net/jinzhuojun/article/details/44062175](http://blog.csdn.net/jinzhuojun/article/details/44062175)） 来说明这个问题。

![](http://img.blog.csdn.net/20150304164219975?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvamluemh1b2p1bg==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

如上图所示：View hierachy的树形结构中，顶层的view为DecorView，也称为根节点视图，对于WMS是可见的，这个DecorView在WMS中有一个对应的WindowState，相应地，在SF中对应的Layer。而SurfaceView自带一个Surface，这个Surface在WMS中有自己对应的WindowState，在SF中也会有自己的Layer。也就是说，虽然在App端它仍在View hierachy中，但在Server端（WMS和SF）中，它与宿主窗口是分离的，这样的好处是对这个Surface的渲染可以放到单独线程去做，渲染时可以有自己的GL context。

View hierarchy 将会准确的混合位于下层的Surface以及SurfaceView的周边的View控件，使得他们能够正常的呈现在屏幕之上，这样，我们可以放置一些遮罩层，例如在Surface上放置一个按钮。但是，无论如何，这个遮罩层都会在alpha通道混合器的每一次surface刷新的时候对显示性能造成影响。而且，使得surface可见的上层透明区域是由在View层级中的位置决定的。如果post-layout 转化的属性被用于绘制SurfaceView上面的view，有可能导致这个View不能正确的和Surface进行合成。从而导致SurfaceView被遮挡。  
如果你想获取位于view下层的Surface对象，通过SurfaceHolder接口的getHolder()方法取得Holder对象。

不幸的是，这个Surface只有在窗口可见的情况下，才会被创建出来。需要实现surfaceCreated(SurfaceHolder) 和 surfaceDestroyed(SurfaceHolder) 方法来处理surface被创建和被销毁时的逻辑。

这个类的主要目的是为了提供一个辅助线程中的surface对象，这个对象可以在屏幕上渲染。 SurfaceView和View最本质的区别在于，surfaceView是在一个新起的单独线程中可以重新绘制画面而View必须在UI的主线程中更新画面。

如果你想要了解这种途径，需要了解一些线程的概念：

* 所有的SurfaceView和 SurfaceHolder.Callback 的方法都是在主线程中被调用。它们在任何情形下都需要被正确的同步。
* 你必须保证绘制线程在它可用的时候，也就是说在surfaceCreated(SurfaceHolder) 和 surfaceDestroyed(SurfaceHolder)  两个方法之间，仅仅能够触及到下面的surface。


## SurfaceTexture
相比SurfaceView，SurfaceTexture是从Android3.0（API 11）加入的一个新类，它是Object的子类，它的主要用途从一个图像流捕获帧数据作为OpenGL ES的纹理。
这些图像流可以来自于相机的预览数据，或者视频的解码数据，从一个SurfaceTexture 创建一个 surface 可以被用于 [android.hardware.camera2](https://developer.android.com/reference/android/hardware/camera2/package-summary.html), [MediaCodec](https://developer.android.com/reference/android/media/MediaCodec.html), [MediaPlayer](https://developer.android.com/reference/android/media/MediaPlayer.html),[Allocation](https://developer.android.com/reference/android/renderscript/Allocation.html)等的输出目标。
如果[updateTexImage()](https://developer.android.com/reference/android/graphics/SurfaceTexture.html#updateTexImage()) 被调用，根据内容流中最近的图像更新在创建SurfaceTexture 时指定的纹理对象的内容，接下来，就可以像操作普通GL纹理一样操作它了。但是这有可能导致一些帧被跳过。这个类跟SurfaceView很像，可以从camera preview或者video decode里面获取图像流（image stream）。

## SurfaceView 和 SurfaceTexture 的区别

和SurfaceView不同的是，SurfaceTexture在接收图像流之后，不需要显示出来,而是转为GL外部纹理。因此可用于图像流数据的二次处理（如Camera滤镜，桌面特效等）,例如我们可以用SurfaceTexture接收来自camera的图像流，然后从SurfaceTexture中取得图像帧的拷贝进行处理，处理完毕后再送给另一个SurfaceView用于显示即可。

## 优势
从目前个人经验来看，孰优孰劣还很难定夺，还需要根据实际的应用场景选择合适的对象来使用。

## SurfaceView真的会比SurfaceTexture 低功耗？
在最新的SDK文档中，我们看到在SurfaceView的解释中google添加了下面一段话：

> Note: Starting in platform version N, SurfaceView's window position is updated synchronously with other View rendering. This means that translating and scaling a SurfaceView on screen will not cause rendering artifacts. Such artifacts may occur on previous versions of the platform when its window is positioned asynchronously.

上面一段话的意思大概时候，在Android N版本之后，SurfaceView 的窗口位置同步的使用了其他的View渲染器更新了。这意味着SurfaceView的平移和缩放将不会引起渲染异常（rendering artifacts），这些“artifacts”在之前的版本上，当它的窗口被异步的放置的时候可能会碰到。

下面这张图介绍了什么是artifacts，其实就是图像局部出现错位，噪点，锯齿等问题。
![http://area.autodesk.com/userdata/forum/r/render_artifacts.jpg](http://area.autodesk.com/userdata/forum/r/render_artifacts.jpg)

从上面的提示中我们并没有找到想要的答案，看来是需要进一步深究了。写之前就知道这是一大坑。。。

## 结论
简单地说，SurfaceView是一个有自己Surface的View。它的渲染可以放在单独线程而不是主线程中。其缺点是不能做变形和动画。SurfaceTexture可以用作非直接输出的内容流，这样就提供二次处理的机会。与SurfaceView直接输出相比，这样会有若干帧的延迟。同时，由于它本身管理BufferQueue，因此内存消耗也会稍微大一些。

> 参考文献：
[1] http://blog.csdn.net/jinzhuojun/article/details/44062175
[2] http://www.wfuyu.com/technology/22762.html