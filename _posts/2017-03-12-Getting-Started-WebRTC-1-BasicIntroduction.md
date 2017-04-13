---
layout: post
title: WebRTC 入门（一） —— 基本介绍
subtitle: 基础介绍
date: 2017-03-12 16:44:32
author: "JianGuo Yang"
header-img: img/post-bg-2015.jpg
tags:
  - WebRTC
---

# WebRTC 入门（一） —— 基本介绍

## 1. WebRTC介绍
众所周知，浏览器本身不支持相互之间直接建立信道进行通信，都是通过服务器进行中转。两个浏览器之间的通信需要分别和服务器建立信道，然而两个浏览器之间的通信需要通过两段信道，并且受到了信道带宽的影响，这样的信道并不适合数据流的传输如何建立浏览器之间的点对点传输，一直困扰着开发者, 所以WebRTC应运而生。

WebRTC是一个google的开源项目，实现了浏览器之间的实时通信（RTC），并且提供了相应的js接口，与websocket不同的是，WebRTC使用了一个信令服务器，建立了两个端之间端对端的数据通道，这个信道可以发送图像，文字，数据等任何信息，而不需要经过服务器转发这些数据。

对于媒体的支持方面，WebRTC还提供了一些访问设备摄像头，话筒等硬件的接口（MediaStream），使得应用可以使用这些接口访问设备。

目前，市面上的主流浏览器都已经支持了WebRTC，如Chrome， firefox，Oprea等，同时，Android端的手机浏览器也支持了WebRTC协议。

## 2. 源码下载
Webrtc的源码使用了chromium内核的代码管理工具：depot_tools, 整个webrtc的代码量是非常大的，大概有11G，在下载代码之前，请确保能够访问国外的网站。

### 2.1 下载安装 Depot Tools
Depot Tools 是一套在Chromium 和 Chromium OS上使用的打包脚本，用于管理检出和代码审核。这套脚本集中包含了gclient, gcl, git-cl, repo 等。
安装过程如下：

- linux下安装Depot Tools

```shell
# 1. 安装git和python，git需要2.2.1+，python需要2.7+
// 此步骤略，如有问题，请搜索相关安装方法
# 2. 克隆depot_tools代码仓库
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git

# 3. 添加环境变量 （最好是直接修改.bashrc文件，以便于无需每次都添加环境变量）
export PATH=`pwd`/depot_tools:"$PATH"
```

- windows下安装Depot Tools
这里我们不建议使用windows进行WebRTC的开发。如果你想在windows上开发，请参考下面的地址：
	* 参考地址：http://dev.chromium.org/developers/how-tos/install-depot-tools
	* 官方网站：https://webrtc.org/native-code/development/prerequisite-sw/

### 2.2 下载代码
在安装完成Depot Tools后， 我们就可以使用gclient工具同步WebRTC的代码仓库了。
硬件要求：
- Linux: 6.4 GB.
- Linux (with Android): 16 GB (of which ~8 GB is Android SDK+NDK images).
- Mac (with iOS support): 5.6GB

1. 创建一个工作目录，进入并且下载同步代码
```shell
mkdir webrtc-checkout
cd webrtc-checkout
fetch --nohooks webrtc
gclient sync
```
这样我们就能够检出完整的WebRTC代码，这些代码里包含了大约8G的Android支持相关的代码，主要包括sdk和ndk，你可以通过不同的构建配置将这套代码用于linux下或者Android下的WebRTC开发。

2. 你可以指定你跟踪哪种新分支（可选）
```shell
git config branch.autosetupmerge always
git config branch.autosetuprebase always
```

3. 创建本地分支
```shell
cd src
git checkout master
git new-branch your-branch-name
```

### 2.3 代码更新
有两种代码的更新方式```git pull```和```gclient sync```，你可以通过```git pull```快速的更新你当前分支的代码，也可以定期的更新所有webrtc的依赖和工具链，这时必须要使用```gclient sync```来更新。

### 2.4 构建
WebRTC的构建使用了ninja的构建工具，ninja是所有平台默认的构建工具。
这里主要阐述Android的平台构建方式，你可以通过查看：[iOS针对平台的特殊构建指令](https://webrtc.org/native-code/ios/)。

针对ubuntu/debian操作系统提供了一个脚本ng，需要我们再同步代码后手动安装：
```shell
./build/install-build-deps.sh
```
执行以下命令构建编译环境：
```shell
gn gen out/Default
```
可以使用不同的tag指定不同的构建编译环境。
``` shell
# release 版本的构建
gn gen out/Release --args='is_debug=false'
# 构建Android平台
gn gen out/Debug --args='target_os="android" target_cpu="arm"'
```
针对不同架构的cpu，target_cpu的可选项主要有以下几个，可以编译出平台相关的so文件：
- To build for ARM64: use target_cpu="arm64"
- To build for 32-bit x86: use target_cpu="x86"
- To build for 64-bit x64: use target_cpu="x64"

可以使用以下命令清除编译产生的文件：
```shell
gn clean out/Default
```

### 2.5 编译
使用以下命令进行编译：
``` shell
ninja -C out/Default
```
### 2.6 编译运行AppRTCMobile apk
WebRTC提供了一个Android demo应用AppRTCMobile， 这个应用通过jni调用使用了WebRTC提供的native接口，从而实现了在Android应用程序中实现WebRTC功能。所以，如果想要实现这样的应用程序，我们有必要了解这套机制。首先我们来编译出对应的app。
这套应用的代码在WebRTC源码目录下的`webrtc/examples/androidapp/`， 在项目的README文件中也详细阐述了如何编译运行。
``` shell
cd <path/to/webrtc>/src
ninja -C out/Default AppRTCMobile
adb install -r out/Default/apks/AppRTCMobile.apk
```
安装好apk到你的手机后，就可以在chrome浏览器中输入：https://appr.tc 并输入房间号点击JOIN创建一个房间。打开你的AppRTC，并输入相同的房间号，就可以进行WebRTC通话了。

也可以在命令行启动应用程序:
``` shell
adb shell am start -n org.appspot.apprtc/.ConnectActivity -a android.intent.action.VIEW
```
运行以下的命令可以进行网络回环测试：
``` shell
adb shell am start -n org.appspot.apprtc/.ConnectActivity -a android.intent.action.VIEW --ez "org.appspot.apprtc.LOOPBACK" true
```

### 2.7 使用Android Studio开发

WebRTC可以通过脚本生成对应的gradle脚本，我们就可以Android Studio上进行相应的开发。
首先使用ninja构建一个普通项目
```shell
ninja -C out/Debug AppRTCMobile
```
生成项目文件
``` shell
build/android/gradle/generate_gradle.py --output-directory $PWD/out/Debug \
--target "//webrtc/examples:AppRTCMobile" --use-gradle-process-resources
```
将生成的项目导入到Android Studio，在导入项目时会弹出当前AndroidStudio的sdk路径和项目不符，此时选择使用Androd Studio的sdk就好。询问是否使用Gradle Wrapper，选择"ok".

> 注: 如果任何的C++代码被改动，请重新编译代码。
