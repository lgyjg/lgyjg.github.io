---
layout: post
title: WebRTC 入门（二） —— 基础概念之MediaStream
subtitle: 相关概念
date: 2017-03-15 18:21:00
author: JianGuo
header-img: img/post-bg-2015.jpg
tags:
  - WebRTC
---

# WebRTC 入门（二） —— 基础概念之MediaStream

## WebRTC相关概念介绍

想要实现webRTC的功能，一个WebRTC应用首先需要完成如下操作:

1. 获取音视频或者其他格式的数据。
2. 获取诸如ip地址，端口等网络信息，并且在即使有NAT和防火墙的情况下和其他的WebRTC端交换这些数据用于建立连接。
3. 对等的信令用于发起或关闭回话，报告错误等。
4. 相互交换关于媒体和本地端的分辨率和解码类型等能力的信息。
5. 交换音视频流或者数据流信息。

为了获取和传送流数据，WebRTC应用需要实现以下API:

- MediaStream: 通过MediaStream的API能够通过设备的摄像头及话筒获得视频、音频的同步流
- RTCPeerConnection: RTCPeerConnection是WebRTC用于构建点对点之间稳定、高效的音视频流传输的组件
- RTCDataChannel: RTCDataChannel用于传输任意数据，它能够在浏览器之间（点对点）建立一个高吞吐量、低延时的信道

（以后的章节会讨论WebRTC的网络和信令方面的内容)

### MediaStream

[MediaStream API](http://dev.w3.org/2011/webrtc/editor/getusermedia.html) 代表着同步的媒体流。例如，从camera和麦克风获取一个流，并输入到同步的video tracks 和 audio tracks。(不要与<track>元素代表的Media track相混淆， 这是 [完全不同](http://www.html5rocks.com/en/tutorials/track/basics/)的两种概念。)

大概理解MediaStream最简单的方式是在实践中观察。
1. 在Chrome或者Opera浏览器中打开[示例](https://webrtc.github.io/samples/src/content/getusermedia/gum).
2. 打开控制台
3. 观察全局的流变量。

每个MediaStream有一个输入端和一个输出端，这个输入端可能是通过navigator.getUserMedia()方式创建的，而输出端被输送到video标签或者RTCPeerConnection对象中。

getUserMedia()方法需要三个参数:
- 一个constraints对象.
- 一个success callback回调函数，该函数如果被调用，则返回一个MediaStream对象。
- 一个failure callback回调函数，该函数如果被调用，则返回一个error对象。

每个MediaStream有一个标签，例如'Xk7EuLhsuHKbnjLWkW4yYGNJJ8ONsgwHBvLQ'。getAudioTracks() 和 getVideoTracks() 方法返回一个MediaStreamTracks数组。

在https://webrtc.github.io/samples/src/content/getusermedia/gum的例子中，stream.getAudioTracks() 返回一个空的数组(因为没有audio), 假设一个正常工作的webcam已经连接， stream.getVideoTracks() 返回一个MediaStreamTrack数组，代表着来自webcam的视频流，每个MediaStreamTrack有一个类型 ('video' 或者 'audio'), 和一个标签(例如： 'FaceTime HD Camera (Built-in)'), 代表着视频或者音频的一个或者多个通道。在这个例子中，只有一个视频轨道而没有音频轨道，但是我们可以容易的想到下面这种使用案例，一个聊天应用从前置摄像头、后置摄像头，麦克风，甚至屏幕分享中获取流数据。

在Chrome或者Opera浏览器，URL.createObjectURL()方法将一个MediaStream对象转化为Blob URL，这个URL可以作为一个video元素的src设置给他。(在Firefox和Opera浏览器中,一个video的src可以从流本身获取。)。从version M25开始， 基于Chromium内核的浏览器(Chrome and Opera)允许通过getUserMedia获取的audio数据传输到audio 或 video元素中 (但是注意，默认情况下，media元素将被设置为静音)。

getUserMedia也可以作为[WebAudioAPI的一个输入节点来使用](http://updates.html5rocks.com/2012/09/Live-Web-Audio-Input-Enabled)。

```javascript
function gotStream(stream) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();

    // Create an AudioNode from the stream
    var mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Connect it to destination to hear yourself
    // or any other node for processing!
    mediaStreamSource.connect(audioContext.destination);
}

navigator.getUserMedia({audio:true}, gotStream);
```
基于Chromium内核的app和扩展程序也可以包含getUserMedia. 添加audioCapture 和/或 videoCapture 权限到manifest文件，在用户安装的时候请求并获取相关的权限。

同样的，在使用HTTPS的页面: [permission](https://developer.chrome.com/extensions/manifest.html#permissions) 权限只需要为getUserMedia（）授予一次 (在chrome最新版本)。 首次在浏览器的[信息栏](http://dev.chromium.org/user-experience/infobars)中显示一个“允许”按钮。

而且，Chrome将会在2015末为getUserMedia()废弃HTTP访问方式，由于它被归类为[隐私性功能 Powerful feature](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins). 在Chrome M44的HTTP网页上调用时，您可以看到警告。

目的是最终为任何流数据源启用MediaStream，不仅仅事camera或者麦克风。这将使得能够从磁盘或者从诸如传感器或其他输入端获取任意数据流。

注意 getUserMedia() 必须在服务器上使用，而不是本地的文件系统，否则一个权限错误（ PERMISSION_DENIED: 1 error）将会被抛出：

getUserMedia() 真正的进入生命周期是在与其他JavaScript APIs和其他库结合使用时：
- Webcam Toy是一个photobooth app，使用WebGL添加奇怪的、精彩的效果的照片，可以共享或保存在本地。
- FaceKat是一个使用headtrackr.js创建的'人脸跟踪'游戏。
- ASCII Camera 使用 Canvas API来生成一个ASCII图像。

### Constraints
[Constraints](http://tools.ietf.org/html/draft-alvestrand-constraints-resolution-00#page-4) 自Chrome，Firefox和Opera以来已经实现。这些约束条件用来在调用 getUserMedia()和RTCPeerConnection addStream()时为视频分辨率设置一些值。目的是为了实现[对其他约束条件的支持](http://dev.w3.org/2011/webrtc/editor/getusermedia.html#the-model-sources-sinks-constraints-and-states)。例如横纵比，摄像机朝向(前置或者后置),帧率, 视频宽高, 通过调用[applyConstraints()方法](http://dev.w3.org/2011/webrtc/editor/getusermedia.html#methods-1)设置。

这里有一个例子： [https://webrtc.github.io/samples/src/content/getusermedia/resolution/](https://webrtc.github.io/samples/src/content/getusermedia/resolution/l).
其主要有以下类型：
- video: 是否接受视频流
- audio：是否接受音频流
- MinWidth: 视频流的最小宽度
- MaxWidth：视频流的最大宽度
- MinHeight：视频流的最小高度
- MaxHiehgt：视频流的最大高度
- MinAspectRatio：视频流的最小宽高比
- MaxAspectRatio：视频流的最大宽高比
- MinFramerate：视频流的最小帧速率
- MaxFramerate：视频流的最大帧速率

注意一点：getUserMedia constraints 在一个浏览器的tab中进行设置，则会对所有之后打开的tabs都起作用。设置一个不允许的值给constraints，则会抛出一个相当神秘的错误消息：

```javascript
navigator.getUserMedia error:
NavigatorUserMediaError {code: 1, PERMISSION_DENIED: 1}
```

### 屏幕录像和浏览器tab抓取
Chrome内核使得其应用通过 [chrome.tabCapture](http://developer.chrome.com/dev/extensions/tabCapture) 和 [chrome.desktopCapture](https://developer.chrome.com/extensions/desktopCapture) API分享单个浏览器tab或者整个桌面成为了可能。一个桌面捕捉的例子扩展见网站：[WebRTC samples GitHub repository](https://github.com/webrtc/samples/tree/master/src/content/getusermedia/desktopcapture). 关于截屏 ，代码及更多的相关信息，见 HTML5 Rocks update: [Screensharing with WebRTC](http://updates.html5rocks.com/2012/12/Screensharing-with-WebRTC).

同样的，在Chrome浏览器中，使用进行实验性的chromeMediaSource constraint 进行屏幕捕捉，并将其作为一个 MediaStream 的资源成为了可能。如下的[demo所示](https://html5-demos.appspot.com/static/getusermedia/screenshare.html). 注意，这种屏幕捕捉技术是需要HTTPS的，并且应该仅仅用于开发目的，可以通过命令行标记进行打开，具体方式见[discuss-webrtc post](https://groups.google.com/forum/#!msg/discuss-webrtc/TPQVKZnsF5g/Hlpy8kqaLnEJ).
