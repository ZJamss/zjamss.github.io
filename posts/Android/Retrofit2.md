### 依赖

```kotlin
implementation 'com.squareup.retrofit2:retrofit:2.9.0+'
   implementation 'com.google.code.gson:gson:2.8.6+'
   implementation 'com.squareup.retrofit2:converter-gson:2.9.0+'
```

### Retrofit2结合RxJava2

**先导入依赖**

```kotlin
implementation 'io.reactivex.rxjava2:rxjava:2.2.21'
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.google.code.gson:gson:2.8.6'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'io.reactivex.rxjava2:rxandroid:2.1.1'
    implementation 'com.squareup.retrofit2:adapter-rxjava2:2.9.0'
```

**创建Retrofit2请求接口，将接口返回值由`Call<T>`改为`Observable<T>` （被观察者）**

```java
public interface ImageService {
    @GET("bfs/feed-admin/6cec22ab4c52bdac76c3317cdebbcb1bcd8b3b50.png")
    Observable<ResponseBody> getImage();
}
```

创建代理服务，添加**gson转换器**和**rxjava2适配器**

```java
private ImageService imageService = new Retrofit.Builder()
            .baseUrl(PATH)
            .addCallAdapterFtory(RxJava2CallAdapterFactory.create())
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ImageService.class);
```

**发起请求**

```java
imageService.getImage()
               .map(new Function<ResponseBody, Bitmap>() {
                   @Override
                   public Bitmap apply(@NonNull ResponseBody responseBody) throws Exception {
                       Paint paint = new Paint();
                       paint.setColor(Color.parseColor("#b9b4ab"));
                       paint.setTextSize(18);
                       paint.setTypeface(Typeface.SERIF);
                       paint.setFakeBoldText(true);
                       paint.setTextSkewX(-0.5f);  //添加水印
                       return drawTextToBitmap(BitmapFactory.decodeStream(responseBody.byteStream()),"ZJmass",paint,5,25);
                   }
               })
               .subscribeOn(Schedulers.io())
               .observeOn(AndroidSchedulers.mainThread())
               .subscribe(new Observer<Bitmap>() {
                   @Override
                   public void onSubscribe(@NonNull Disposable d) {
                       Log.d(TAG, "onSubscribe: ");
                    bar.setVisibility(View.VISIBLE);
                   }

                   @Override
                   public void onNext(@NonNull Bitmap bitmap) {
                       Log.d(TAG, "onNext: ");
                       ig.setImageBitmap(bitmap);
                   }

                   @Override
                   public void onError(@NonNull Throwable e) {
                       Log.d(TAG, "onError: "+e.getMessage());
                       Toast.makeText(MainActivity.this,"下载失败",Toast.LENGTH_SHORT).show();
                       bar.setVisibility(View.GONE);
                   }

                   @Override
                   public void onComplete() {
                       Log.d(TAG, "onComplete: ");
                       bar.setVisibility(View.GONE);
                   }
               });
    }
```

> 执行流程为链式结构

- `map()` **穿插逻辑，顺序执行**
- `subscribeOn()`  **选择起点至终点阶段的执行线程  **  选择`Schedulers.io()`意为 **异步线程执行**
- `observeOn()` **终点的执行线程**，在这使用`AndroidSchedulers.mainThread()`，在**安卓主线程**中修改控件属性
- `subscribe()`**订阅**，**创建一个观察者**，**泛型为前一步传递下来的类**，**重写四个函数**
- `onSubscribe()` **订阅成功**
- `onNext()` **获得响应**
- `onError()` **发生错误**
- `onComplete()` **执行完毕**

