---
layout:     post
title: envsetup-sh的常用命令
subtitle:   " Android开源项目编译中sh的常用命令"
date: 2016-03-10 09:22:04
author:     "JianGuo Yang"
header-img: "post-bg-unix-linux.jpg"
tags: Android
---

# envsetup-sh的常用命令

** 摘要：** 这篇文档主要对android下的编译脚本文件 envsetup.sh 进行了简单的分析，并且从中总结了一些在开发过程中常用的命令，以便于开发者们提高开发效率。

## 常用命令索引
` croot `  - -到达android根目录；
` cproj + 模块名 `  - -到达项目的根目录下；
` gettop `  - -得到顶级目录路径；
` findmakefile ` - -找到make文件。

` m ` - -当前目录下编译执行，相当于在android目录下执行make
` mm ` - -执行当前目录下最近的make文件
` mmm `  - -在android目录下，执行某个文件夹下的make文件
` mma ` - -编译当前目录下所有的模块和他们的依赖
` mmma ` - -编译提供的目录下的所有模块和他们的依赖
` make sdk ` - -编译SDK及其包含的一些工具 (adb, fastboot, 等等)。
` make snod `  - -从当前编译出的二进制数据编译system.img文件 ，这条命令将重新生成镜像，消耗的时间很少，如果你修改了一些数据文件（如音乐、视频）等文件时比较有用。
` make cts `  - -这条命令将编译CTS套机，编译出的结果放在out目录对应版的data/app目录下面。CTS测试时有用。
` make services ` - -
` make runtime ` - -
` make droid ` - -make droid is the normal build.
` make all ` - -make everything, whether it is included in the product definition or not
` make clean ` - -remove all built files (prepare for a new build). Same as rm -rf out _make modules - shows a list of submodules that can be built (List of all LOCAL_MODULE definitions)
` make installclean `  - -同上
` make *` - -make a specific module (note that this is not the same as directory name. It is the LOCAL_MODULE definition in the Android.mk file)
` make clean *`  - -clean a specific module
` make bootimage ` - -编译创建一个新的 boot image
` make bootimage `  - -TARGET_PREBUILT_KERNEL=/path/to/bzImage - create a new boot image with custom bzImage
` make systemimage ` - -编译创建一个新的 system image

## make命令

不用多解释，编译整个项目，可以加模块名参数等。

``` bash
function make()
{
    local start_time=$(date +"%s")
    $(get_make_command) "$@"
    local ret=$?
    local end_time=$(date +"%s")
    local tdiff=$(($end_time-$start_time))
    local hours=$(($tdiff / 3600 ))
    local mins=$((($tdiff % 3600) / 60))
    local secs=$(($tdiff % 60))
    echo
    if [ $ret -eq 0 ] ; then
        echo -n -e "#### make completed successfully "
    else
        echo -n -e "#### make failed to build some targets "
    fi
    if [ $hours -gt 0 ] ; then
        printf "(%02g:%02g:%02g (hh:mm:ss))" $hours $mins $secs
    elif [ $mins -gt 0 ] ; then
        printf "(%02g:%02g (mm:ss))" $mins $secs
    elif [ $secs -gt 0 ] ; then
        printf "(%s seconds)" $secs
    fi
    echo -e " ####"
    echo
    return $ret
}

```

> **提示：**具体功能还需要分析。

## 设置编译环境的java home
```bash
# Force JAVA_HOME to point to java 1.7 or java 1.6  if it isn't already set.
#
# Note that the MacOS path for java 1.7 includes a minor revision number (sigh).
# For some reason, installing the JDK doesn't make it show up in the
# JavaVM.framework/Versions/1.7/ folder.
function set_java_home() {
    # Clear the existing JAVA_HOME value if we set it ourselves, so that
    # we can reset it later, depending on the version of java the build
    # system needs.
    #
    # If we don't do this, the JAVA_HOME value set by the first call to
    # build/envsetup.sh will persist forever.
    if [ -n "$ANDROID_SET_JAVA_HOME" ]; then
      export JAVA_HOME=""
    fi

    if [ ! "$JAVA_HOME" ]; then
      if [ -n "$LEGACY_USE_JAVA6" ]; then
        case `uname -s` in
            Darwin)
                export JAVA_HOME=/System/Library/Frameworks/JavaVM.framework/Versions/1.6/Home
                ;;
            *)
                export JAVA_HOME=/usr/lib/jvm/java-6-sun
                ;;
        esac
      else
        case `uname -s` in
            Darwin)
                export JAVA_HOME=$(/usr/libexec/java_home -v 1.7)
                ;;
            *)
                export JAVA_HOME=/usr/lib/jvm/java-7-openjdk-amd64
                ;;
        esac
      fi

      # Keep track of the fact that we set JAVA_HOME ourselves, so that
      # we can change it on the next envsetup.sh, if required.
      export ANDROID_SET_JAVA_HOME=true
    fi
}

```

## 到某个文件所在的目录下
```bash
function godir () {
    if [[ -z "$1" ]]; then
        echo "Usage: godir <regex>"
        return
    fi
    T=$(gettop)
    if [[ ! -f $T/filelist ]]; then
        echo -n "Creating index..."
        (\cd $T; find . -wholename ./out -prune -o -wholename ./.repo -prune -o -type f > filelist)
        echo " Done"
        echo ""
    fi
    local lines
    lines=($(\grep "$1" $T/filelist | sed -e 's/\/[^/]*$//' | sort | uniq))
    if [[ ${#lines[@]} = 0 ]]; then
        echo "Not found"
        return
    fi
    local pathname
    local choice
    if [[ ${#lines[@]} > 1 ]]; then
        while [[ -z "$pathname" ]]; do
            local index=1
            local line
            for line in ${lines[@]}; do
                printf "%6s %s\n" "[$index]" $line
                index=$(($index + 1))
            done
            echo
            echo -n "Select one: "
            unset choice
            read choice
            if [[ $choice -gt ${#lines[@]} || $choice -lt 1 ]]; then
                echo "Invalid choice"
                continue
            fi
            pathname=${lines[$(($choice-1))]}
        done
    else
        pathname=${lines[0]}
    fi
    \cd $T/$pathname
}

```


## 具体参数查看runtest -h
```bash
# simple shortcut to the runtest command
function runtest()
{
    T=$(gettop)
    if [ ! "$T" ]; then
        echo "Couldn't locate the top of the tree.  Try setting TOP." >&2
        return
    fi
    ("$T"/development/testrunner/runtest.py $@)
}
```

## smoketest
```bash
function smoketest()
{
    if [ ! "$ANDROID_PRODUCT_OUT" ]; then
        echo "Couldn't locate output files.  Try running 'lunch' first." >&2
        return
    fi
    T=$(gettop)
    if [ ! "$T" ]; then
        echo "Couldn't locate the top of the tree.  Try setting TOP." >&2
        return
    fi

    (\cd "$T" && mmm tests/SmokeTest) &&
      adb uninstall com.android.smoketest > /dev/null &&
      adb uninstall com.android.smoketest.tests > /dev/null &&
      adb install $ANDROID_PRODUCT_OUT/data/app/SmokeTestApp.apk &&
      adb install $ANDROID_PRODUCT_OUT/data/app/SmokeTest.apk &&
      adb shell am instrument -w com.android.smoketest.tests/android.test.InstrumentationTestRunner
}

```

## 常用的安卓物理键模拟及viewserver
```bash
# 开启viewServer
function startviewserver()
{
    local port=4939
    if [ $# -gt 0 ]; then
            port=$1
    fi
    adb shell service call window 1 i32 $port
}
# 停止viewServer
function stopviewserver()
{
    adb shell service call window 2
}
# 查看viewServer状态
function isviewserverstarted()
{
    adb shell service call window 3
}
# 相当于按下设备home键、back键、menu键
function key_home()
function key_back()
function key_menu()
```

##获取手机中的bug日志
```bash
function getbugreports()
{
    local reports=(`adb shell ls /sdcard/bugreports | tr -d '\r'`)

    if [ ! "$reports" ]; then
        echo "Could not locate any bugreports."
        return
    fi

    local report
    for report in ${reports[@]}
    do
        echo "/sdcard/bugreports/${report}"
        adb pull /sdcard/bugreports/${report} ${report}
        gunzip ${report}
    done
}
```


## 得到sdcard的路径，屏幕截图路径和最后一张截图
```bash
function getsdcardpath()
function getscreenshotpath()
function getlastscreenshot()
```


## dump某一时刻的trace数据
```bash
function tracedmdump()
{
    T=$(gettop)
    if [ ! "$T" ]; then
        echo "Couldn't locate the top of the tree.  Try setting TOP."
        return
    fi
    local prebuiltdir=$(getprebuilt)
    local arch=$(gettargetarch)
    local KERNEL=$T/prebuilts/qemu-kernel/$arch/vmlinux-qemu

    local TRACE=$1
    if [ ! "$TRACE" ] ; then
        echo "usage:  tracedmdump  tracename"
        return
    fi

    if [ ! -r "$KERNEL" ] ; then
        echo "Error: cannot find kernel: '$KERNEL'"
        return
    fi

    local BASETRACE=$(basename $TRACE)
    if [ "$BASETRACE" = "$TRACE" ] ; then
        TRACE=$ANDROID_PRODUCT_OUT/traces/$TRACE
    fi

    echo "post-processing traces..."
    rm -f $TRACE/qtrace.dexlist
    post_trace $TRACE
    if [ $? -ne 0 ]; then
        echo "***"
        echo "*** Error: malformed trace.  Did you remember to exit the emulator?"
        echo "***"
        return
    fi
    echo "generating dexlist output..."
    /bin/ls $ANDROID_PRODUCT_OUT/system/framework/*.jar $ANDROID_PRODUCT_OUT/system/app/*.apk $ANDROID_PRODUCT_OUT/data/app/*.apk 2>/dev/null | xargs dexlist > $TRACE/qtrace.dexlist
    echo "generating dmtrace data..."
    q2dm -r $ANDROID_PRODUCT_OUT/symbols $TRACE $KERNEL $TRACE/dmtrace || return
    echo "generating html file..."
    dmtracedump -h $TRACE/dmtrace >| $TRACE/dmtrace.html || return
    echo "done, see $TRACE/dmtrace.html for details"
    echo "or run:"
    echo "    traceview $TRACE/dmtrace"
}
```


## 查询.gradle、.java 等文件中某个字符串在文件中的位置
```bash
function ggrep()
{
    find . -name .repo -prune -o -name .git -prune -o -name out -prune -o -type f -name "*\.gradle" -print0 | xargs -0 grep --color -n "$@"
}
function jgrep()
{
    find . -name .repo -prune -o -name .git -prune -o -name out -prune -o -type f -name "*\.java" -print0 | xargs -0 grep --color -n "$@"
}
function cgrep()
{
    find . -name .repo -prune -o -name .git -prune -o -name out -prune -o -type f \( -name '*.c' -o -name '*.cc' -o -name '*.cpp' -o -name '*.h' \) -print0 | xargs -0 grep --color -n "$@"
}
function resgrep()
{
    for dir in `find . -name .repo -prune -o -name .git -prune -o -name out -prune -o -name res -type d`; do find $dir -type f -name '*\.xml' -print0 | xargs -0 grep --color -n "$@"; done;
}
function mangrep()
{
    find . -name .repo -prune -o -name .git -prune -o -path ./out -prune -o -type f -name 'AndroidManifest.xml' -print0 | xargs -0 grep --color -n "$@"
}
function sepgrep()
{
    find . -name .repo -prune -o -name .git -prune -o -path ./out -prune -o -name sepolicy -type d -print0 | xargs -0 grep --color -n -r --exclude-dir=\.git "$@"
}
```


## 其他
```bash
# 得到顶级目录路径
function gettop
# 找到make文件
function findmakefile()
# 当前目录下编译执行，相当于在android目录下执行make
function m()
# 执行当前目录下最近的make文件
function mm()
# 在android目录下，执行某个文件夹下的make文件
function mmm()
# Builds all of the modules in the current directory, and their dependencies.
function mma()
# Builds all of the modules in the supplied directories, and their dependencies.
function mmma()
```
