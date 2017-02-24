---
layout: post
title: Markdown使用总结
subtitle: Markdown 是一种轻量级标记语言，它允许人们“使用易读易写的纯文本格式编写文档，然后转换成有效的XHTML(或者HTML)文档”
author: JianGuo
header-img: markdown-guide-1.jpg
tags: Markdown
date: 2016-07-12 19:48:29
---


## 什么是Markdown
Markdown 是一种[轻量级标记语言](https://zh.wikipedia.org/wiki/%E8%BD%BB%E9%87%8F%E7%BA%A7%E6%A0%87%E8%AE%B0%E8%AF%AD%E8%A8%80)，创始人为[约翰·格鲁伯（John Gruber）](https://zh.wikipedia.org/wiki/%E7%B4%84%E7%BF%B0%C2%B7%E6%A0%BC%E9%AD%AF%E4%BC%AF)。它允许人们“使用易读易写的纯文本格式编写文档，然后转换成有效的XHTML(或者HTML)文档”。[3]这种语言吸收了很多在电子邮件中已有的纯文本标记的特性。  

Markdown同时还是一个由Gruber编写的Perl脚本：Markdown.pl。它把用markdown语法编写的内容转换成有效的、结构良好的XHTML或HTML内容，并将左尖括号('<')和&号替换成它们各自的字符实体引用。它可以用作单独的脚本，Blosxom和Movable Type的插件又或者BBEdit的文本过滤器。

### Markdown的优点
* 纯文本，所以兼容性极强，可以用所有文本编辑器打开。
* 让你专注于文字而不是排版。
* 格式转换方便，Markdown 的文本你可以轻松转换为 html、电子书等。
* Markdown 的标记语法有极好的可读性。

## linux下使用工具的推荐
### Atom
#### Atom的介绍
[Atom](https://atom.io/) 是 Github 专门为程序员推出的一款开源的免费的多平台跨平台文本编辑器。同时，还拥有活跃的 [中文社区](https://atom-china.org/)。

#### Atom的安装
可以到官方网站https://atom.io/ 进行下载deb包，并安装即可。

#### Atom的个性配置
##### 命令面板
当你按下 cmd-shift-P 并且当前焦点在一个窗格上的时候，命令面板就会弹出来。你可以使用命令面板完成
大多数的命令。

##### 偏好设置
在设置界面中，你可以修改主题、修改文本折行的行为（wrapping）、字体大小、缩进宽度、滚动速度等选项。你也可以用这个界面安装新的插件和主题。你可以通过菜单栏中 Atom 下的 Preferences 菜单项打开设置界面。你也可以在命令面板中搜索 settings-view:open 或使用快捷键 cmd-,打开。
###### 修改主题
你可以在设置界面中修改 Atom 的主题，Atom 内建了 4 个不同的 UI 主题，分别是亮色和暗色版本的名为 Atom 和 One 的主题。以及 8 个不同的语法着色主题。你可以通过点击左边栏的 Themes 选项卡来改变当前主题，或安装新的主题。

![](https://atom-china.org/uploads/default/_optimized/f67/38e/5fd8580ee2_690x479.png)  

UI 主题会修改标签栏、左侧目录树（tree view）等 UI 元素的颜色；而语法着色主题修改编辑器中文字的语法高亮方案。你只需要简单地在下拉框中选择另一项，即可修改主题。

在 Atom.io 上有很多种主题供你选择，下面会介绍如何安装主题。

##### 插件的安装  
###### 安装 markdown-scroll-sync
不幸的是，atom虽然支持markdown格式的预览，但是却不能跟随滚动预览，我们可以通过安装插件实现相应的功能。安装步骤如下：
  1. 主页面键入 Ctrl+Shift+P 后输入install packages and thmes
  2. 搜索：“markdown-scroll-sync”
  3. 点击安装  

或者使用命令：
```bash
$ apm install
```

效果如下：  
![](https://cloud.githubusercontent.com/assets/811455/11317259/c5b9b0c2-8fdc-11e5-8f85-b7deefb525c5.gif)


###### 安装Markdown转pdf插件
我们在使用Atom时，需要安装插件实现md文件转pdf的功能  
安装过程同上，搜索“markdown-scroll-sync”

安装命令：
``` bash
apm install markdown-pdf
```

![](https://raw.githubusercontent.com/travs/markdown-pdf/master/assets/testpdf.png)  

###### 安装目录自动生成插件：Markdown-toc
在生成目录结构的时候显得非常有用。安装过程同上，搜索“Markdown-toc”或者使用命令安装：
``` bash
apm install markdown-toc
```

###### 安装文件图标（可选）
在文件名前添加文件类型相关的图标，以便于识别。详情请移步[https://atom.io/packages/file-icons](https://atom.io/packages/file-icons)  
安装过程同上，搜索“apm install file-icons”  
或者使用安装命令：
```bash
apm install file-icons
```

###### 安装公式支持（可选）
Atom的markdown预览同样不支持公式的渲染，需要安装对应的插件。
安装：
``` bash
apm install markdown-preview-plus
```

### cmd Markdown
[cmd markdown](https://www.zybuluo.com/mdeditor)是作业部落出品的一款笔记编辑器，提供了网页，windows，linux，mac OS的软件。
 主要优点是样式好看，功能非常强大，支持流程图，公式等。带有大纲功能！可以调转到你的各个章节很方便啊！但需要注册才能使用高级功能。同步功能一年要 99RMB。 =。= 故不推荐使用。  
 客户端下载地址：[https://www.zybuluo.com/cmd/](https://www.zybuluo.com/cmd/)


### FarboxApp
[FarboxApp](https://www.farbox.com/service/app/desktop_editor)样式不错，功能强大。 下载本地客户端也可使用。

### google chrome插件
[马克飞象](www.maxiang.io)是针对印象笔记开发的markdown笔记插件，有网页版和chrome插件。
同样需要注册，付费才能使用高级功能。


## Markdown语法示例
具体语法可参考：[http://wowubuntu.com/markdown/](http://wowubuntu.com/markdown/)

### 标题
 在 Markdown 中，你只需要在文本前面加上 # 即可完成标题，同理、你还可以增加二级标题、三级标题、四级标题、五级标题和六级标题，总共六级。如下：

```html
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```  
效果预览：  

----
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
----
> 注：# 和「一级标题」之间建议保留一个字符的空格，这是最标准的 Markdown 写法。

### 列表
列表格式也很常用，在 Markdown 中，你只需要在文字前面加上 - 就可以了，例如：
```html
- 文本1
- 文本2
- 文本3
```
如果你希望有序列表，也可以在文字前面加上 1. 2. 3. 就可以了，例如：
```html
1. 文本1
2. 文本2
3. 文本3
```
> 注：-、1.和文本之间要保留一个字符的空格。

### 链接和图片
在 Markdown 中，插入链接不需要其他按钮，你只需要使用 \[显示文本\]\(链接地址\) 这样的语法即可，例如：
```html
[测试链接](http://www.test.com)
```
在 Markdown 中，插入图片不需要其他按钮，你只需要使用 \!\[\]\(图片链接地址\) 这样的语法即可，例如：
```html
![图片介绍](http://ww4.sinaimg.cn/bmiddle/aa397b7fjw1dzplsgpdw5j.jpg)
```
> 注：插入图片的语法和链接的语法很像，只是前面多了一个 ！。  

### 引用
在我们写作的时候经常需要引用他人的文字，这个时候引用这个格式就很有必要了，在 Markdown 中，你只需要在你希望引用的文字前面加上 > 就好了

### 强调
语法：
``` html
~~删除线~~ <s>删除线（开启识别HTML标签时）</s>  
*斜体字*      _斜体字_  
**粗体**  __粗体__  
***粗斜体*** ___粗斜体___  
上标：X<sub>2</sub>  
下标：O<sup>2</sup>
```  
效果：
~~删除线~~ <s>删除线（开启识别HTML标签时）</s>  
*斜体字*      _斜体字_  
**粗体**  __粗体__  
***粗斜体*** ___粗斜体___  
上标：X<sub>2</sub>  
下标：O<sup>2</sup>  


效果如下：  
 *一盏灯*， 一片昏黄；**一本书**， 一杯淡茶。 守着那一份淡定， 品读属于自己的寂寞。 **保持淡定， 才能欣赏到最美丽的风景！ 保持淡定， 人生从此不再寂寞。**

### 表格
相关代码：

```html
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
```
显示效果：

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |


### 引用代码
markdown支持多种编程语言的代码引用。例如java 、c++等。

格式：  
> \`\`\`+语言名称，如java  
引用的代码  
\`\`\`  

### 换行
在文本中输入的换行会从最终生成的结果中删除，浏览器会根据可用空间自动换行。如果想强迫换行，可以在行尾插入至少两个空格。

> Markdown的使用还是很简单的，总之一句话，孰能生巧，这些语法也没必要背，平时用的时候用模板写几次就记住了。
