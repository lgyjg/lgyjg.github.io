---
layout: post
title: 使用tushare分析金融数据
subtitle: tushare 使用笔记
date: 2018-07-15 02:42:32
author: JianGuo
header-img: img/home-bg-o.jpg
tags:
  - python
---

一直有个想法想利用python分析一些经济数据，以图表的形式动态展现在我个人的网站中，以便于随时检测这些数据，如M1, M2, GDP, 上证指数……等等，于是在github找到了一个免费的金融数据接口——tushare，这个开源项目使用“BSD 3-Clause "New" or "Revised" License”开源协议，可以商用，可以修改，可以分发，可以私有。算是比较开放，内容上也是非常丰富，能够获取到交易数据、投资参考数据、股票分类数据、基本面数据、宏观经济数据、新闻事件数据、龙虎榜数据、银行间同业拆放利率等等，可谓十分全面。作为初级个人金融数据分析接口肯定是够用了。但遗憾的是，这个项目目前已经停止维护了，对应的公众号也是半年没有发布过文章了，猜猜应该是作者全身心投入到赚钱的项目上去了吧。

那这里就简单说说这个库的是使用吧。

# tushare介绍
这里直接粘贴官方给出的介绍。大家有个了解即可。

Tushare是一个免费、开源的python财经数据接口包。主要实现对股票等金融数据从数据采集、清洗加工 到 数据存储的过程，能够为金融分析人员提供快速、整洁、和多样的便于分析的数据，为他们在数据获取方面极大地减轻工作量，使他们更加专注于策略和模型的研究与实现上。考虑到Python pandas包在金融量化分析中体现出的优势，Tushare返回的绝大部分的数据格式都是pandas DataFrame类型，非常便于用pandas/NumPy/Matplotlib进行数据分析和可视化。当然，如果您习惯了用Excel或者关系型数据库做分析，您也可以通过Tushare的数据存储功能，将数据全部保存到本地后进行分析。应一些用户的请求，从0.2.5版本开始，Tushare同时兼容Python 2.x和Python 3.x，对部分代码进行了重构，并优化了一些算法，确保数据获取的高效和稳定。

# tushare 的运行环境
tushare 本身是一个python库，当然也就少不了在python环境下运行，好在python的跨平台做的非常棒，大部分的最新的操作系统不论是windows还是ubuntu，都已经默认安装了python的开发环境。所以python的安装这里就不在阐述了。

需要说明的是，在命令行下编辑和调用这些接口对于非程序员的人来说，也是一种很煎熬的事情，所以这里推荐一个python的web运行开发环境，相对于命令行来说，也友好了很多。

## jupyter notebook 的安装
jupyter notebook 其实是一种交互式笔记本，不仅仅支持python，本质是一个 Web 应用程序，便于创建和共享文学化程序文档，支持实时代码，数学方程，可视化和 markdown。 用途包括：数据清理和转换，数值模拟，统计建模，机器学习等等。这里我们用它来编写python程序。

```shell
pip install --upgrade pip

pip install jupter
```
一切静待执行完毕。

## tushare 的安装
安装和前面一样很简单，不论是linux 还是window系统，在命令行里直接执行相关的pip命令即可。但这里需要注意的是，tushare依赖了一些python库，需要安装，否则就会出现运行时异常。

```shell
pip install --upgrade pip

pip install lxml
pip install requests
pip install pandas
pip install bs4
pip install tushare
```
这里遇到了一个坑，如果在jupyter notebook 中遇到'module' object has no attribute 'stock'的错误，需要重启下kernel。
如果需要安装特定版本的模块，可以在模块名后面加==，如lxml==3.4.2。

不出意外的话，你的环境已经准备好了。

```shell 
jupyter notebook

```
在浏览器打开的页面中选择“new” 创建一个新的python2文件，执行下面这行语句：

```python 
import tushare as ts

print(ts.__version__)

```

正常输出的话就可以使用了。

# tushare的简单使用

下面通过几个例子说明下获取原始数据的方法。

## 获取某个个股某个时间段的历史数据

```python
ts.get_hist_data('600848',start='2018-06-05',end='2018-06-09')
```
![输出结果](/img/in-post/tushare_use/get_data_1.PNG)

## 获取M2 货币供应量
```python
ts.get_money_supply()
```
![输出结果](/img/in-post/tushare_use/get_data_2.PNG)

其他的数据获取方式雷同，只需要查看相关的接口文档即可。这里不在赘述。
文档地址：[http://www.waditu.cn/trading.html#id2](http://www.waditu.cn/trading.html#id2)

# 后续的思考
调用这个库，我们只能通过接口看到冷冰冰的数据，所以，接下来数据的可视化才是重头戏，将这些数据之间的联系结合起来更是具有挑战的事情，等后期对这些接口都了解了，对所涉及到的金融概念及他们的意义领会的深刻了，就会实现我开始的想法，给自己一个干净的，实时的金融数据监控平台。


