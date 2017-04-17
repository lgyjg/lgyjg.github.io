---
layout: post
title: WebRTC 入门（四） —— 基础概念之Signaling
subtitle: 相关概念
date: 2017-03-17 13:11:45
author: JianGuo
header-img: img/post-bg-2015.jpg
tags:
  - WebRTC
---

# WebRTC 入门（四） —— 基本概念之Signaling

### Signaling: 会话控制，网络及媒体信息的载体

WebRTC 使用 RTCPeerConnection 来在浏览器之间传递流数据，这个流数据通道是点对点的，不需要通过服务器对数据进行中转。但是这并不意味着我们就能够完全抛弃服务器，而且需要建立一种信令机制来整合和发送控制信息。
WebRTC 没有指定信令的方法和协议，RTCPeerConnection API 也不包含信令相关的内容。你可以选择任何一种信令机制或者自定义信令，例如 SIP 或者 XMPP, 以及任何适当的双工(two-way)通道。在apprtc.appspot.com 的例子中，使用了XHR 和 Channel API 作为信令机制。而codelab使用了Socket.io。

信令被用于交换三种类型的信息：
- 会议控制消息（Session control messages）: 用于初始化或者关闭会话，以及报告错误。
- 网络配置（Network configuration）: 想要连接到外网。我电脑的Ip地址是多少，端口是什么？
- 多媒体适配、处理能力（Media capabilities）: 使用哪种类型的编解码，何种分辨率可以在我的浏览器上处理？ 以及浏览器自身想交流的等信息。

这些信息的交换应该在点对点的流传输之前就全部完成。一个大致的架构图如下：
![xinling](http://img.blog.csdn.net/20160125142625278)

下面是一个摘自 WebRTC W3C 的简单的例子，展示了信令的处理过程，我们假设代码中createSignalingChannel()方法创建了一个信令机制，同样需要注意，在Chrome和Opera浏览器上，前缀假定都是RTCPeerConnection（实质上是不同的类）。

```javascript
// 创建信令
var signalingChannel = createSignalingChannel();
var pc;
var configuration = ...;

// 调用start(true)来初始化一个呼叫
function start(isCaller) {
	// 创建 PeerConnection
    pc = new RTCPeerConnection(configuration);

    // 发送任意的ice candidates给被呼叫者
    pc.onicecandidate = function (evt) {
        signalingChannel.send(JSON.stringify({ "candidate": evt.candidate }));
    };

    // 一旦远程的流达到，将流显示在本地需要显示远程图像的元素上。
    pc.onaddstream = function (evt) {
        remoteView.src = URL.createObjectURL(evt.stream);
    };

    // 获取本地流，并显示在本地显示本地图像的元素上。
    navigator.getUserMedia({ "audio": true, "video": true }, function (stream) {
        selfView.src = URL.createObjectURL(stream);
        pc.addStream(stream);

        if (isCaller)
            pc.createOffer(gotDescription);
        else
            pc.createAnswer(pc.remoteDescription, gotDescription);

        function gotDescription(desc) {
            pc.setLocalDescription(desc);
            signalingChannel.send(JSON.stringify({ "sdp": desc }));
        }
    });
}

signalingChannel.onmessage = function (evt) {
    if (!pc)
        start(false);

    var signal = JSON.parse(evt.data);
    if (signal.sdp)
        pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
    else
        pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
};
```

首先，A和B交换了各自的网络信息。 ('finding candidates' 是指使用ICE框架查找网络接口和端口的过程。)

1. A创建一个 RTCPeerConnection对象，这个对象拥有onicecandidate handler来接收ice的candidate。
2. 这个Handler将会在网络candidates可用时执行。
3. A通过他们使用的任何信令通道（WebSocket或其他一些机制）发送一系列的candidate数据给B。
4. 当B收到一条candidate消息，他会调用addIceCandidate来添加到远程 peer description。

WebRTC客户端（称为Peer，就是上文的A和B）还需要确定和交换本地和远程音视频媒体信息，如分辨率和编解码功能。 通过使用会话描述协议（SDP），信令通过交换呼叫或者应答来进行交换媒体配置信息。

1. A 执行 RTCPeerConnection 的 createOffer() 方法.
2. 在gotDescription() 中，A使用setLocalDescription()方法设置本地的description， 接下来通过他们的信令通道发送这个会话描述给B。需要注意的是： RTCPeerConnection 不会收集相关的candidates，直到调用了setLocalDescription()方法。
3. B通过setRemoteDescription()方法设置了A发送给B的远程描述。
4. B调用 RTCPeerConnection createAnswer() 方法, 传递了A的远程描述，因此，一个本地会话将被创建，createAnswer方法回调一个 RTCSessionDescription：B将其设置为本地描述并将其发送给A。
5.当A得到B的会话描述，A通过setRemoteDescription()将其设置为远程描述。
6. 接通...

RTCSessionDescription对象是符合会话描述协议SDP的blob。 串行化，SDP对象如下所示：
```javascript
v=0
o=- 3883943731 1 IN IP4 127.0.0.1
s=
t=0 0
a=group:BUNDLE audio video
m=audio 1 RTP/SAVPF 103 104 0 8 106 105 13 126
// ...
a=ssrc:2223794119 label:H4fjnMzxy3dPIgQ7HxuCTLb4wLLLeRHnFxh810
```

网络和媒体信息的获取和交换可以同时进行，但是这两个动作必须在Peer之间的音频和视频流交换前已经完成。
上述的呼叫/应答架构称为JSEP，JavaScript会话建立协议。
(有一个很好的动画解释了爱立信演示视频中第一个WebRTC实现的信令和流媒体过程)

![JSEP architecture](https://www.html5rocks.com/en/tutorials/webrtc/basics/jsep.png)

一旦信令过程成功完成，数据可以直接在呼叫者和被叫方之间之间进行传输，或者如果失败，则通过中继服务器传输。
