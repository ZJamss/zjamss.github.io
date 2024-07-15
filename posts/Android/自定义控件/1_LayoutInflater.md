**来自：[https://blog.csdn.net/guolin_blog/article/details/12921889]**

### 获取方式

* 在Activity中执行`getLayoutInflater()`
* `LayoutInflater layoutInflater = LayoutInflater.from(context);`
* `LayoutInflater layoutInflater = (LayoutInflater) context .getSystemService(Context.LAYOUT_INFLATER_SERVICE);`

以上三种方法其实都是最后一个方法的封装

### 加载布局的写法

```java
layoutInflater.inflate(resourceId, root,attachToRoot);
```

* `resId` 需要加载的资源id
* `root` 需要填充的父布局（不需要则null）
* `attachToRoot` 是否填充进父布局，在不设置`attachToRoot`参数的情况下，如果`root`不为null，`attachToRoot`参数默认为true。

### 示例

`activity_main.xml` 里面不含任何控件

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/root"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity"
    android:orientation="horizontal">

</LinearLayout>
```

`btn_xml` 使用线性布局包含一个btn，这样就可以给btn设置`layout_weight`和`layout_height`

**否则没有布局文件包裹设置以上两个属性是无法生效的**

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <Button
        android:id="@+id/btn"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Btn" />

</LinearLayout>
```

在`Activity`的`onCreate()`中添加如下代码

```java
        LinearLayout root = findViewById(R.id.root);
        getLayoutInflater().inflate(R.layout.btn,root,true);

        findViewById(R.id.btn).setOnClickListener(v->{
            Toast.makeText(this,"213",Toast.LENGTH_SHORT).show();
        });
```

再启动应用，btn就能显示出来了

#### 为什么根布局文件能设置layout_weight等属性，不是没有布局文件包裹吗

其实安卓在生成它们时会自动为它们套上一个FrameLayout作为父布局

### Activity结构

任何一个Activity中显示的界面其实主要都由两部分组成，**标题栏和内容布局**。标题栏就是在很多界面顶部显示的那部分内容，比如刚刚我们的那个例子当中就有标题栏，可以在代码中控制让它是否显示。而内容布局就是一个FrameLayout，这个布局的id叫作content，我**们调用setContentView()方法时所传入的布局其实就是放到这个FrameLayout中的，这也是为什么这个方法名叫作setContentView()，而不是叫setView()。**

![](https://img-blog.csdn.net/20131218231254906?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvZ3VvbGluX2Jsb2c=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
