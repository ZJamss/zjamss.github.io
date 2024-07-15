### 布局

```xml
  <ProgressBar
            android:visibility="gone"
            android:id="@+id/progressBar"
            style="?android:attr/progressBarStyleHorizontal"
            android:layout_width="match_parent"
            android:layout_height="3dp"
            android:maxHeight="3dp"
            android:minHeight="3dp"
            android:indeterminateTint="@color/orange"
            android:progressDrawable="@drawable/progressbar_preview"
            android:max="100"
            android:progress="50" />
```

### 配置文件

`progressbar_preview.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!--默认颜色-->
    <item android:id="@android:id/background">
        <shape>
            <solid android:color="@color/white" />
        </shape>
    </item>
    <!--进度颜色-->
    <item android:id="@android:id/progress">
        <clip>
            <shape>
                <solid android:color="@color/orange" />
            </shape>
        </clip>
    </item>
</layer-list>
```

### 使用

加载时`setVisbility(View.GONE)`，加载完成时`setVisbility(View.VISIBLE)`

中间使用`setProgress(int progress)`设置进度

#### 与WebView-WebChromeClient实现加载进度条

```java
 binding.webView.setWebChromeClient(new WebChromeClient(){
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
                if (newProgress == 100) {
                    binding.progressBar.setVisibility(View.GONE);
                } else {
                    binding.progressBar.setVisibility(View.VISIBLE);
                    binding.progressBar.setProgress(newProgress);
                }
            }

        });
````
