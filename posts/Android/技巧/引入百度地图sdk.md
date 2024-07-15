**官方文档：https://lbsyun.baidu.com/index.php?title=android-locsdk/quick-start/start**

### **引入依赖**

(这里只使用了基础地图和基础定位)

```kotlin
    implementation 'com.baidu.lbsyun:BaiduMapSDK_Location:9.1.8'
    implementation 'com.baidu.lbsyun:BaiduMapSDK_Map:7.4.0'
```

### **声明权限**

```xml

    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.INTERNET" /> <!-- 允许程序获取网络状态 -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" /> <!-- 允许程序访问WiFi网络信息 -->
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" /> <!-- 允许程序读写手机状态和身份 -->
    <uses-permission android:name="android.permission.READ_PHONE_STATE" /> <!-- 允许程序访问CellID或WiFi热点来获取粗略的位置 -->
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" /> <!-- 用于访问GPS定位 -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" /> <!-- 用于获取wifi的获取权限，wifi信息会用来进行网络定位 -->
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" /> <!-- 用于申请调用A-GPS模块 -->
    <uses-permission android:name="android.permission.ACCESS_LOCATION_EXTRA_COMMANDS" /> <!-- 用于申请获取蓝牙信息进行室内定位 -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="com.android.launcher.permission.READ_SETTINGS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
```

### 配置信息

在`AndroidManifest.xml`的`application`标签中添加`meta-data`

`value`值是自己的开发者key

```xml
     <meta-data
            android:name="com.baidu.lbsapi.API_KEY"
            android:value="c7wfmqq8y5Is6un0s7PVjiLgTNIRD4hF" />
```

在layout布局中添加

```xml
  <com.baidu.mapapi.map.MapView
        android:id="@+id/bmapView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"/>
```

创建`LocationApplication`类并继承Application,在`onCreate()`中初始化sdk

```java
  SDKInitializer.initialize(getApplicationContext());
  SDKInitializer.setCoordType(CoordType.BD09LL);
```

### 显示定位
