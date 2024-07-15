### 布局

```xml
<WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />
```

### 基本使用

`loadUrl()`加载网页
`reload()`重新加载

#### 配置

`getSettings()`获取WebSettings对象

##### 开启https和http混合加载模式

`settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);`

##### 开启JS和本地存储

`settings.setJavaScriptEnabled(true);`
`settings.setDomStorageEnabled(true);`

##### 配合回调显示进度条

```java
       binding.webView.setWebChromeClient(new WebChromeClient() {
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
```

##### 自定义错误页面(布局)

```java
binding.webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return super.shouldOverrideUrlLoading(view, url);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (isLoadError) {
                    binding.webView.setVisibility(View.GONE);
                    binding.notice.setVisibility(View.VISIBLE);
                } else {
                    binding.webView.setVisibility(View.VISIBLE);
                    binding.notice.setVisibility(View.GONE);
                }
                isLoadError = false;
                binding.progressBar.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                isLoadError = true;
            }
        });
```

##### 返回响应回退网页

```java
binding.webView.setOnKeyListener((view, i, event) -> {
            if (event.getAction() == KeyEvent.ACTION_DOWN) {
                //按返回键操作并且能回退网页
                if (event.getKeyCode() == KeyEvent.KEYCODE_BACK && binding.webView.canGoBack()) {
                    //后退
                    binding.webView.goBack();
                    return true;
                }
            }
            return false;
        });
```
