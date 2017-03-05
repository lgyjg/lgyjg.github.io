---
layout: post
title: Camera api2 Characteristics 详解（一）
subtitle: Camera Characteristics 详解
date: 2017-03-05 20:49:32
author: JianGuo
header-img: img/post-bg-2015.jpg
tags:
  - Android
---


> 在Camera应用的开发中，我们难免会使用到CameraCharacteristics类的属性。这些属性代表着相机能够支持的功能。这篇文章将官方文档中的相关属性进行解析。


CameraCharacteristics类是[android.hardware.camera2.CameraMetadata<android.hardware.camera2.CameraCharacteristics.Key<?>>](https://developer.android.google.cn/reference/android/hardware/camera2/CameraMetadata.html)的子类。是对Camera硬件设备的属性描述。这些属性对于给定的设备而言是确定的。可以通过CameraManager的接口getCameraCharacteristics（String）来获取。

接下来就对这些属性进行简单的分类整理

### COLOR_CORRECTION_AVAILABLE_ABERRATION_MODES：相差矫正模式列表
在构建CaptureRequest时，key：COLOR_CORRECTION_ABERRATION_MODE 对应的value。此参数就是通过该值获取设备支持的列表中设备支持的相差矫正模式列表，并从中选取一个作为value。
主要有以下三种：
 - OFF 表示关闭相差矫正。
 - FAST 表示在进行像差校正时，速度优先，相机设备不会降低捕获速率
 - HIGH_QUALITY 表示相机设备将使用最高质量的像差校正算法，即使它降低了捕获速率

 这些值描述的时色差矫正算法的操作模式。所谓色差，指的是不同波长的光经过镜头透镜的折射后，无法在传感器的同一位置汇聚的现象。该元数据定义了色差校正算法的高级控制，其旨在最小化可能沿着图像中拍摄对象的边缘产生的色彩伪影。更多的关于色差的知识详见[维基百科](https://zh.wikipedia.org/wiki/%E8%89%B2%E5%B7%AE)。
 下面的图中马的额毛、鬃毛和耳朵的边缘上有明显的紫边，这就是色差。
 ![](https://upload.wikimedia.org/wikipedia/commons/c/c1/Purple_fringing.jpg)

注意：LEGACY属性的设备将始终处于FAST模式。

### CONTROL_AE_AVAILABLE_ANTIBANDING_MODES：自动曝光模式列表 
在构建CaptureRequest时，key：CONTROL_AE_ANTIBANDING_MODE 对应的value值的列表。这个key在所有设备上都可用，是相机设备自动曝光算法的防眩补偿的所需设置。其值有以下几种：
- OFF
- 50HZ
- 60HZ
- AUTO

产生这种现象的主要原因是在一些国家用电的频率不同，一般是50Hz或者60Hz，会导致荧光灯等光源发出的光是闪烁的，当然这种闪烁对于人眼来说基本是不可见的，但是对于Camera传感器来说，由于其扫描方式的差异，会导致在成像时，产生命案相间的条纹。因此，相机的自动曝光程序需要确保所选择的曝光参数不会导致这种现象。当设置为auto时，设备会自动检测合适的曝光频率，或者直接有用户控制该值来确定选择期望的值。

设备不一定支持所有的属性，Auto模式是默认的模式，当Auto模式不可用时，50HZ和60HZ应该都可用。
如果选择开启手动曝光控制（可以通过设置CONTROL_AE_MODE或者CONTROL_MODE为OFF），此时，这些值将不会起作用，就需要应用自己确保设置的曝光参数的正确性，不会导致出现色带的问题。可以通过STATISTICS_SCENE_FLICKER来为相机设备设置合适的闪烁频率。

### CONTROL_AE_AVAILABLE_MODES：自动曝光模式列表
在构建CaptureRequest时，使用该key来获取CONTROL_AE_MODE所需的设备支持的value。这个值只有在CONTROL_MODE值设置为AUTO时起作用。主要有以下几种：
- OFF
- ON
- ON_AUTO_FLASH 自动闪光灯，仅在设备具有闪光灯时可用
- ON_ALWAYS_FLASH 开启闪光灯，仅在设备具有闪光灯时可用
- ON_AUTO_FLASH_REDEYE 自动消除红眼闪光灯模式，在该模式下，闪光灯先长亮，人眼瞳孔适应后，再进行曝光。

在使用了除OFF以外的任何一种ON模式时，用户设置的曝光时间（SENSOR_EXPOSURE_TIME），ISO（SENSOR_SENSITIVITY），帧持续时间（SENSOR_FRAME_DURATION），闪光灯模式等参数都会被覆盖。
如果想使用闪光灯的 TORCH mode，那么该字段就必须设置为 ON or OFF,并将 FLASH_MODE 设置为 TORCH.


### CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES：自动曝光帧速率范围 
在构建CaptureRequest时，为CONTROL_AE_TARGET_FPS_RANGE提供所需要的值。表示该设备所有支持的帧率范围列表。

对于LEGACY级别或更高级别的设备：
对于恒定帧率记录，对于每个正常的CamcorderProfile，即质量在范围[QUALITY_LOW，QUALITY_2160P]内的CamcorderProfile，如果设备支持该配置文件并且具有videoFrameRate x，则该列表将总是包括（x，x ）。此外，摄像机设备必须要么不支持任何摄像机配置文件要么支持至少一个具有videoFrameRate x> = 24的正常摄像机配置文件。

对于LIMITED 级别或更高级别的设备：
对于YUV_420_888的burst捕获情形，此列表将始终包括（min，max）和（max，max），其中min <= 15，max = 最大YUV_420_888输出大小的最大输出帧速率。

### CONTROL_AE_COMPENSATION_RANGE：曝光补偿值范围 
在构建CaptureRequest时，为CONTROL_AE_EXPOSURE_COMPENSATION设置合适的曝光补偿值。该值由CONTROL_AE_COMPENSATION_RANGE提供的最大值和最小值和CONTROL_AE_COMPENSATION_STEP的最小步进决定。

### CONTROL_AE_COMPENSATION_STEP：曝光补偿值最小步进

未完，待续~
