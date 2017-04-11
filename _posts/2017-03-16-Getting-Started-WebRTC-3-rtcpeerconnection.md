---
layout: post
title: WebRTC 入门（三） —— 基础概念之RTCPeerConnection
subtitle: 相关概念
date: 2017-03-16 20:32:32
author: JianGuo
header-img: img/post-bg-2015.jpg
tags:
  - WebRTC
---

# WebRTC 入门（三） —— 基础概念之RTCPeerConnection


### RTCPeerConnection

RTCPeerConnection 是WebRTC的一个组件，用来在浏览器之间处理固定的，高效的流数据的通信。这个流数据通道是点对点的，无需服务器的中转，但为了建立起这个数据通道，我们仍然需要借助于服务器实现信令的传输。关于如何实现信令交互，请阅读 关于信令的内容。

下面是一个 WebRTC的架构图，显示出RTCPeerConnection的角色。如你注意到的一样，绿色部分是相当复杂的!

![WebRTC architecture (from webrtc.org)](https://www.html5rocks.com/en/tutorials/webrtc/basics/webrtcArchitecture.png)

从JavaScript的角度来看，从这个图中理解的主要事情是，RTCPeerConnection屏蔽了web开发人员隐藏在之下无数复杂的操作。WebRTC使用的编解码器和协议做了大量的工作，使实时通信成为可能，甚至在不可靠的网络上：

- 丢包隐藏 packet loss concealment
- 回声抵消 echo cancellation
- 带宽适应 bandwidth adaptivity
- 动态抖动缓冲 dynamic jitter buffering
- 自动增益控制 automatic gain control
- 降噪和抑制 noise reduction and suppression
- 图像“清洁” image 'cleaning'

上文中的W3C代码展示了一种简单的使用信令透视的WebRTC的例子。下面是两个工作WebRTC应用程序的演练：第一个是一个简单的例子来演示RTCPeerConnection; 第二个是完全可操作的视频聊天客户端。

#### 实现没有服务器的本地RTCPeerConnection

下面的代码取自“单页”WebRTC演示：[https://webrtc.github.io/samples/src/content/peerconnection/pc1](https://webrtc.github.io/samples/src/content/peerconnection/pc1/), 这个例子中，在同一个页面上，分别有有一个本地和远程的RTCPeerConnection和一个本地和远程的video。这种组合不是非常有用的——呼叫者和被呼叫者在同一页上。 但它确实使得RTCPeerConnection API的工作更加清晰，因为页面上的RTCPeerConnection对象可以直接交换数据和消息，而不必使用中间信令机制。

有一点需要注意：RTCPeerConnection()第二个可选的参数'constraints'不同于getUserMedia()方法中使用到的constraints类型，详见 [w3.org/TR/webrtc/#constraints](http://www.w3.org/TR/webrtc/#constraints)。

在此示例中，pc1表示本地peer（呼叫者），pc2表示远程peer（被叫者）。

#### 呼叫者 Caller
1. 创建一个新的RTCPeerConnection对象，从getUserMedia()获取流，并添加流:
```javascript
// servers is an optional config file (see TURN and STUN discussion below)
pc1 = new webkitRTCPeerConnection(servers);
// ...
pc1.addStream(localStream);
```

2. 创建一个offer，并且将它作为本地描述设置给pc1，作为pc2的远程描述设置为pc2。 这里可以直接在代码中使用而不使用信令，是因为呼叫者和被叫者在同一页上：
```javascript
pc1.createOffer(gotDescription1);
//...
function gotDescription1(desc){
  pc1.setLocalDescription(desc);
  trace("Offer from pc1 \n" + desc.sdp);
  pc2.setRemoteDescription(desc);
  pc2.createAnswer(gotDescription2);
}
```

#### 被叫者 Callee
1. 创建pc2，在流从pc1添加时，显示到video元素中：
```javascript
pc2 = new webkitRTCPeerConnection(servers);
pc2.onaddstream = gotRemoteStream;
//...
function gotRemoteStream(e){
  vid2.src = URL.createObjectURL(e.stream);
}
```

#### RTCPeerConnection + servers 实现数据通道
在真实的情况下，WebRTC 需要服务器。但是简单，所以可能发生以下情况：

- Users discover each other and exchange 'real world' details such as names.
- WebRTC client applications (peers) exchange network information.
- Peers exchange data about media such as video format and resolution.
- WebRTC client applications traverse NAT gateways and firewalls.

换句话说， WebRTC需要四种类型的服务器端功能:

1. 用户发现以及通信
2. 信令传输
3. NAT/防火墙穿透
4. 如果点对点通信建立失败，可以作为中转服务器

NAT穿透指的是在处于使用了NAT设备的私有TCP/IP网络中的主机之间需要建立连接时需要使用NAT穿越技术。以往在VoIP领域经常会遇到这个问题。目前已经有很多NAT穿越技术，但没有一项是完美的，因为NAT的行为是非标准化的。这些技术中大多使用了一个公共服务器，这个服务使用了一个从全球任何地方都能访问得到的IP地址。
peer-to-peer网络, 以及创建一个用于用户发现和发送信令的服务器所需要满足的需求，超出了本文的范围。 这里只需要说明， 在RTCPeeConnection中，[STUN](http://en.wikipedia.org/wiki/STUN)协议及其扩展[TURN](http://en.wikipedia.org/wiki/Traversal_Using_Relay_NAT) 用于 [ICE](http://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment)框架，使得RTCPeerConnection能够处理NAT穿透和其他网络变化。

ICE全名叫交互式连接建立（Interactive Connectivity Establishment），是一种比较成熟的NAT穿透技术，常用于需要进行P2P连接的框架，例如两个视频聊天客户端。ICE整合了诸如STUN、TRUN（Traversal Using Relay NAT 中继NAT实现的穿透）等服务。在实现上，ICE首先尝试通过UDP直接连接到两个客户端（这里描述为客户端应该不是很准确，就是连个对应的peer端，这里暂且叫它客户端吧），以尽可能降低延迟。在此过程中，STUN服务器具有单个任务：使NAT后面的客户端能够找到其公共地址和端口。（Google有几个STUN服务器，如：stun:stun.l.google.com:19302。其中一个用于apprtc.appspot.com示例。）

![Finding connection candidates](https://www.html5rocks.com/en/tutorials/webrtc/basics/stun.png)

如果UDP连接失败，ICE服务器尝试使用TCP: 首先是HTTP, 然后尝试使用HTTPS。如果直接连接失败，特别是因为企业NAT穿越和防火墙的影响，ICE则切换使用中间（relay）TURN服务器。 换句话说，ICE将首先使用STUN与UDP直接连接两个客户端，如果失败，将回退到TURN中继服务器。 “finding candidates”是指找到网络接口和端口的过程。

![WebRTC data pathways](https://www.html5rocks.com/en/tutorials/webrtc/basics/dataPathways.png)

WebRTC工程师Justin Uberti在2013年的Google I / O WebRTC演示中提供了有关ICE，STUN和TURN的更多信息。 （演示幻灯片给出了TURN和STUN服务器实现的示例。）
