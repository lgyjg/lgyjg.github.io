---
layout: post
title: WebRTC 入门（四） —— 服务器的搭建
subtitle: 相关概念
date: 2017-03-22 23:22:00
author: JianGuo
header-img: img/post-bg-2015.jpg
tags:
  - WebRTC
---

# WebRTC 入门（四） —— 服务器的搭建


## 前言
WebRTC是Web Real-Time Communication(网页实时通信)。WebRTC 包含有三个组件：

- 访问用户摄像头及麦克风的 getUserMedia
- 穿越 NAT 及防火墙建立视频会话的 PeerConnection
- 在浏览器之间建立点对点数据通讯的 DataChannels

分别对应三个API接口：

- Network Stream API 代表媒体数据流
- RTCPeerConnection 一个RTCPeerConnection对象允许用户在两个浏览器之间直接通讯；
- Peer-to-peer Data API 一个在两个节点之间的双向的数据通道

## WebRTC的服务器架构

## 部署环境

系统：ubuntu14.04 64位
内存：12G
处理器：intel core i5-4570 CPU@3.2GHz×4
硬盘：1T
（以上信息只做参考，不是必要条件）

## 1. 信令服务器的搭建
信令服务器是用来管理和协助通话终端建立去中心的点对点通话的一个角色.这个角色要负责一下任务:

1. 用来控制通信发起或者结束的连接控制消息
2. 发生错误时用来相互通告的消息
3. 各自一方媒体流元数据，比如像解码器、解码器的配置、带宽、媒体类型等等
4. 两两之间用来建立安全连接的关键数据
5. 外界所能看到的网络上的数据，比如广域网IP地址、端口等

信令服务器的具体协议实现没有严格规定,只要实现功能就OK.
我们这里依然沿用Google提供的基于GO语言和WebSocket的信令服务器Collider。

具体的代码和房间服务器[apprtc](https://github.com/webrtc/apprtc)一并在Github上可以获取。
获取到我们自己的Linux服务器上用GO语言的运行环境来运行该信令服务器.

## 2. 房间服务器的搭建
房间服务器是用来创建和管理通话会话的状态维护,是双方通话还是多方通话,加入与离开房间等等,我们暂时沿用Google部署在GAE平台上的AppRTC这个房间服务器实现,该GAE App的源码可以在github.com上获取.该实现是一个基于Python的GAE应用,我们需要下载Google GAE的离线开发包到我们自己的Linux服务器上来运行该项目,搭建大陆互联网环境下的房间服务器.

我们选择了[apprtc](https://github.com/webrtc/apprtc)作为房间服务器，同时，它也是webRTC官方提供的一个用于p2p的demo。
apprtc应用需要满足以下要求： Ubuntu 14.04 using Python 2.7.6 and Go 1.6.3.

下面我们就一步步安装房间服务器：

1. 下载代码

2.


## 3. 穿透服务器的搭建(STUN/TURN/ICE Server)
我们目前大部分人连接互联网时都处于防火墙后面或者配置私有子网的家庭(NAT)路由器后面,这就导致我们的计算机的IP地址不是广域网IP地址,故而不能相互之间直接通讯. 正因为这样的一个场景,我们得想办法去穿越这些防火墙或者家庭(NAT)路由器,让两个同处于私有网络里的计算机能够通讯起来.
![STUN(Simple Traversal of UDP over NATs,NAT 的UDP简单穿越)](http://io.diveinedu.com/images/nat-network.png)

### coturn 服务器的搭建
coturn服务器介绍：
1.This project evolved from rfc5766-turn-server project (https://code.google.com/p/rfc5766-turn-server/). There are many new advanced TURN specs which are going far beyond the original RFC 5766 document. This project takes the code of rfc5766-turn-server as the starter, and adds new advanced features to it.

2.Free open source implementation of TURN and STUN Server
The TURN Server is a VoIP media traffic NAT traversal server and gateway. It can be used as a general-purpose network traffic TURN server and gateway, too.

On-line management interface (over telnet or over HTTPS) for the TURN server is available.

The implementation also includes some extra experimental features.

coturn服务器下载：
https://github.com/coturn/coturn
coturn服务器安装：
https://github.com/coturn/coturn/wiki/CoturnConfig


## 常见问题

## 注意事项


> 版权声明


## 参考文档
[^1]: https://github.com/ccforward/cc/issues/20
[^2]: https://www.sdk.cn/news/2971
[^3]: http://l0gs.xf0rk.space/webrtc-plus/
[^4]: https://aotu.io/notes/2016/10/09/HTML5-SopCast/?o2src=juejin&o2layout=compat
[^5]: https://blog.coding.net/blog/getting-started-with-webrtc
[^6]: http://blog.chengliujin.cc/2016/10/14/WebRTC/
[^7]: http://www.jianshu.com/p/a7f6ec0c9273
[^8]: https://segmentfault.com/a/1190000005864228
[^9]: http://blog.chengliujin.cc/2016/10/17/webRTCSharp/
