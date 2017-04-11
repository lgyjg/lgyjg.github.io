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

WebRTC使用RTCPeerConnection来在浏览器之间传递流数据，这个流数据通道是点对点的，不需要经过服务器进行中转。但是这并不意味着我们能抛弃服务器，而且需要一种机制来整合交换，发送控制信息，我们仍然需要它来为我们传递信令（signaling）来建立这个信道。
WebRTC没有指定信令的方法和协议，RTCPeerConnection API 也不包含信令相关的内容。因此，WebRTC 开发者可以选择任何一种他们喜欢的消息协议，例如 SIP 或者 XMPP, 以及任何适当的双工(two-way)通道。  在apprtc.appspot.com的例子中，使用了XHR 和 Channel API 作为信令机制。我们构建的codelab使用了Socket.io 运行在一台节点服务器上。

信令被用于交换三种类型的信息：
- 会议控制消息（Session control messages）: 用于初始化或者关闭会话，以及报告错误。
- 网络配置（Network configuration）: 想要连接到外网。我电脑的Ip地址是多少，端口是什么？
- 多媒体处理能力适配（Media capabilities）: 使用哪种类型的编解码，何种分辨率可以在我的浏览器上处理？ 以及浏览器自身想交流的等信息。

这些信息的交换应该在点对点的流传输之前就全部完成。一个大致的架构图如下：
![xinling](http://img.blog.csdn.net/20160125142625278)

例如,Alice想和他老板交流，这里有一个来自WebRTC W3C的简单的例子，展示了信令的处理，我们假定该代码中createSignalingChannel()方法创建了一个信令机制，同样需要注意，在Chrome和Opera浏览器上，前缀假定都是RTCPeerConnection。

```javascript
// 创建信令
var signalingChannel = createSignalingChannel();
var pc;
var configuration = ...;

// 调用start(true)来初始化一个呼叫
function start(isCaller) {
	// 创建PeerConnection
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

First up, Alice and Bob exchange network information. (The expression 'finding candidates' refers to the process of finding network interfaces and ports using the ICE framework.)

1. Alice creates an RTCPeerConnection object with an onicecandidate handler.
2. The handler is run when network candidates become available.
3. Alice sends serialized candidate data to Bob, via whatever signaling channel they are using: WebSocket or some other mechanism.
4. When Bob gets a candidate message from Alice, he calls addIceCandidate, to add the candidate to the remote peer description.

WebRTC clients (known as peers, aka Alice and Bob) also need to ascertain and exchange local and remote audio and video media information, such as resolution and codec capabilities. Signaling to exchange media configuration information proceeds by exchanging an offer and an answer using the Session Description Protocol (SDP):

1. Alice runs the RTCPeerConnection createOffer() method. The callback argument of this is passed an RTCSessionDescription: Alice's local session description.
2. In the callback, Alice sets the local description using setLocalDescription() and then sends this session description to Bob via their signaling channel. Note that RTCPeerConnection won't start gathering candidates until setLocalDescription() is called: this is codified in JSEP IETF draft.
3. Bob sets the description Alice sent him as the remote description using setRemoteDescription().
4. Bob runs the RTCPeerConnection createAnswer() method, passing it the remote description he got from Alice, so a local session can be generated that is compatible with hers. The createAnswer() callback is passed an RTCSessionDescription: Bob sets that as the local description and sends it to Alice.
5. When Alice gets Bob's session description, she sets that as the remote description with setRemoteDescription.
6. Ping!

RTCSessionDescription objects are blobs that conform to the Session Description Protocol, SDP. Serialized, an SDP object looks like this:

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

The acquisition and exchange of network and media information can be done simultaneously, but both processes must have completed before audio and video streaming between peers can begin.

The offer/answer architecture described above is called JSEP, JavaScript Session Establishment Protocol. (There's an excellent animation explaining the process of signaling and streaming in Ericsson's demo video for its first WebRTC implementation.)

![JSEP architecture](https://www.html5rocks.com/en/tutorials/webrtc/basics/jsep.png)

Once the signaling process has completed successfully, data can be streamed directly peer to peer, between the caller and callee—or if that fails, via an intermediary relay server (more about that below). Streaming is the job of RTCPeerConnection.
