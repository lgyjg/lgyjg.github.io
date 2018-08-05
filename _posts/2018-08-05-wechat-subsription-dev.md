---
layout: post
title: 微信公众号开发——消息回复
subtitle: tushare 使用笔记
date: 2018-08-05 22:42:32
author: JianGuo
header-img: img/home-bg-o.jpg
tags:
  - wechat
---

> 周末刚好有一天休息的时间，一时兴起，就把自己停更半年的公众号（“开源技术”）拿出来折腾了，打开公众号后台，看了看仅有的18个粉丝，心头一丝凉意。不过为了扩展下公众号的功能，我决定给公众号做个聊天机器人，造福单身汉。 要开通公众号的开发功能，还是有一些门槛的，域名，备案，服务器这些是少不了了。如果你也想折腾大的话，提前把这些准备好。


# 配置服务器配置并开通开发者功能
在开启这个功能的时候，需要配置四个参数。

* URL —— 服务器响应地址，必须以http://或https://开头，分别支持80端口和443端口。 这里建议使用二级域名，不要使用路由。
* Token —— Token可由开发者可以任意填写，用作生成签名（该Token会和接口URL中包含的Token进行比对，从而验证安全性）。
* EncodingAESKey —— 由开发者手动填写或随机生成，将用作消息体加解密密钥。
* 消息加解密方式 —— 在开发初期可以选择明文，后期如果涉及到用户隐私信息或者敏感信息，可以考虑加密。

关于token的生成，你也可以选择一种偷懒的方式，直接写个字符串，但如果想要用于线上运营，建议还是使用特定的方式生成，这里提供一种我使用的token生成方式，

api_token = md5 ('模块名' + '控制器名' + '方法名' + '2018-08-05' + '加密密钥')
其中的 
1、 '2018-08-05' 为当天时间，
2、'加密密钥' 为私有的加密密钥，我使用了上面随机生成的EncodingAESKey。

为什么要使用这种方式呢，主要还是为了安全性，防止访问鉴权被破解。同时复杂的token可以避免和其他公众号的token重复，如果重复，则会开启功能失败。 

如果你填写完上面的信息，就可以保存设置并开启功能了，不过需要注意的是，填写的URL的域名需要实名认证并且备案，否则无法开通。

# 消息鉴权
微信提供了一种鉴权算法帮助你确认所有的请求都是来自于微信服务器，每次微信发送的GET请求，都会包含如下信息：
signature	微信加密签名，signature结合了开发者填写的token参数和请求中的timestamp参数、nonce参数。
timestamp	时间戳
nonce	随机数

对于首次校验的signature请求，还会多一个参数：```echostr	随机字符串```, 如果鉴权成功，我们需要将该字符串返回给微信，才能成功开启该功能。
根据微信文档，鉴权算法如下：
* 1)将token、timestamp、nonce三个参数进行字典序排序 
* 2）将三个参数字符串拼接成一个字符串进行sha1加密 
* 3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
```php
<?php
define("TOKEN","XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

function checkSignature()
{
    $signature = $_GET["signature"];
    $timestamp = $_GET["timestamp"];
    $nonce = $_GET["nonce"];
    $our_token = TOKEN;

    $tmpArr = array($our_token, $timestamp, $nonce);
    sort($tmpArr);
    $tmpStr = implode( $tmpArr );
    $tmpStr = sha1($tmpStr);

    //error_log("sha1 tempstr =".$tmpStr."; ", 3, "/var/tmp/my-errors.log");
    //error_log("signature = ".$signature."\n", 3, "/var/tmp/my-errors.log");
    return $tmpStr == $signature;
}

if (checkSignature()) {
    $echoStr = $_GET["echostr"];
    echo $echoStr;
    exit();
} else {
    echo "signature failed!";
}
exit();
```

如果你不想将上述鉴权代码放到index.php文件中，可以将其写入到一个新文件中，在合适的地方require；

```php
<?php

/**
 * 如果有"echostr"字段，说明是一个URL验证请求，
 * 否则是微信用户发过来的信息
 */
if (isset($_GET["echostr"])){
    require 'authentication.php';
} else {
    require_once("UserReponse.php");
    $wechatObj = new MessageReponse();
    $wechatObj->responseMsg();
}
?>
```	

# 消息接受与推送

微信公众平台提供了三种消息回复的格式，即文本回复、音乐回复和图文回复，这里介绍文字的回复，其他的可以按照同样的思路实现。

对于每一个POST请求，开发者在响应包中返回特定xml结构，对该消息进行响应（现支持回复文本、图文、语音、视频、音乐）。

文本回复xml 结构：
```xml
 <xml>
 <ToUserName><![CDATA[toUser]]></ToUserName>
 <FromUserName><![CDATA[fromUser]]></FromUserName>
 <CreateTime>12345678</CreateTime>
 <MsgType><![CDATA[text]]></MsgType>
 <Content><![CDATA[content]]></Content>
 </xml>
```
其中：
* ToUserName —— 接受者OPENID
* FromUserName —— 开发者微信号，也就是微信公共号提供的原始id，每个公众号唯一。
* CreateTime —— 消息的发送/创建时间
* MsgType —— 消息类型
* Content —— 消息内容

我们可以针对消息的包装封装出一个函数：
```php
function getResonseMessage($object, $content){
    $textTpl = "<xml>
                <ToUserName><![CDATA[%s]]></ToUserName>
                <FromUserName><![CDATA[%s]]></FromUserName>
                <CreateTime>%s</CreateTime>
                <MsgType><![CDATA[text]]></MsgType>
                <Content><![CDATA[%s]]></Content>
                <FuncFlag>%d</FuncFlag>
                </xml>";
    $resultStr = sprintf($textTpl, $object->FromUserName, $object->ToUserName, time(), $content, $flag);
    return $resultStr;
}
```

接下来的主要工作就是实现消息响应了。

```php
	/**
 * 响应用户发来的消息
 */
public function responseMsg(){
    //获取post过来的数据，它一个XML格式的数据
    $postStr = file_get_contents('php://input');
    if (!empty($postStr)){
        // 解析该xml字符串，利用simpleXML
        libxml_disable_entity_loader(true);
        // 禁止xml实体解析，防止xml注入, 将XML数据解析为一个对象
        $postObj = simplexml_load_string($postStr, 'SimpleXMLElement', LIBXML_NOCDATA);
        $RX_TYPE = trim($postObj->MsgType);
        Utils::logger("type is :".$RX_TYPE, "用户1");
        //消息类型分类
        switch($RX_TYPE){
            case "event": // 事件类型
                $result = $this->receiveEvent($postObj);
                break;
            case "text"://文本消息
                $result = $this->receiveText($postObj);
                break;
            case 'image'://图片消息
                $result = $this->receiveImage($postObj);
                break;
            case 'voice'://语音消息
                $result = $this->receiveVoice($postObj);
                break;
            case 'video'://视频消息
                $result = $this->receiveVideo($postObj);
                break;
            case 'shortvideo'://短视频消息
                $result = $this->receiveShortvideo($postObj);
                break;
            case 'location'://位置消息
                $result = $this->receiveLocation($postObj);
                break;
            case 'link'://链接消息
                $result = $this->receiveLink($postObj);
                break;
            case 'file': // 文件
                $result = $this->receiveFile($postObj);
                break;
            default:
                $result = $this->getResonseMessage($object, "你发的是什么啊？^_^");
                break;
        }
        echo $result;
    }else{
        echo "";
        exit;
    }
}

private function receiveText($object) {
   return $this->getResonseMessage($object, "你说的什么我听不懂^_^");
}

private function receiveEvent($object){
    switch ($object->Event){
        //关注公众号事件
        case "subscribe": // 关注事件
            $content = "欢迎关注开源技术微信公众号，在这里等你很久了";
            break;
        case "CLICK": //菜单点击事件
            $content = "大王终于翻我牌了…";
            break;
        case "VIEW"://连接跳转事件
            $content = "你想去哪儿啊";
            break;
        default:
            $content = "";
            break;
    }
    $result = $this->getResonseMessage($object, $content);
    return $result;
}

private function receiveImage($object) {
    return $this->getResonseMessage($object, "收到你的图片啦^_^");
}

private function receiveVoice($object) {
    return $this->getResonseMessage($object, "收到你的语音啦^_^");
}

private function receiveVideo($object) {
    return $this->getResonseMessage($object, "收到你的视频啦^_^");
}

private function receiveShortvideo($object) {
    return $this->getResonseMessage($object, "收到你的短视频啦^_^");
}

private function receiveLocation($object) {
    return $this->getResonseMessage($object, "收到你的地址啦^_^");
}

private function receiveLink($object) {
    return $this->getResonseMessage($object, "收到你的链接啦^_^");
}

private function receiveFile($object) {
    return $this->getResonseMessage($object, "收到你的文件啦^_^");
}

```

上面的代码需要注意的一点，使用了simplexml_load_string函数，这个函数是php 的一个xml组建，需要单独安装，否则不能正常运行：
```shell
sudo apt-get install php-xml
sudo apt-get install php-xmlrpc
sudo apt-get install php-xmlrpclibs
```

如果你顺利调试通了，接下来就可以实现具体的业务代码了。是不是很简单？反正我是调试了大半天，哭~~~