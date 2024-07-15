### 依赖

```kotlin
def camerax_version = "1.0.0-beta07"
// CameraX core library using camera2 implementation
implementation "androidx.camera:camera-camera2:$camerax_version"
// CameraX Lifecycle Library
implementation "androidx.camera:camera-lifecycle:$camerax_version"
// CameraX View class
implementation "androidx.camera:camera-view:1.0.0-alpha14"
```

因为需要java8的一些方法，在app的 `build.gradle`的 `android`块内加上

```kotlin
compileOptions {
    sourceCompatibility JavaVersion.VERSION_1_8
    targetCompatibility JavaVersion.VERSION_1_8
}
```

### 申请相机权限

```xml
<uses-feature android:name="android.hardware.camera.any" />
<uses-permission android:name="android.permission.CAMERA" />
```

### 创建基础布局

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
   xmlns:android="http://schemas.android.com/apk/res/android"
   xmlns:tools="http://schemas.android.com/tools"
   xmlns:app="http://schemas.android.com/apk/res-auto"
   android:layout_width="match_parent"
   android:layout_height="match_parent"
   tools:context=".MainActivity">

   <Button
       android:id="@+id/camera_capture_button"
       android:layout_width="100dp"
       android:layout_height="100dp"
       android:layout_marginBottom="50dp"
       android:scaleType="fitCenter"
       android:text="Take Photo"
       app:layout_constraintLeft_toLeftOf="parent"
       app:layout_constraintRight_toRightOf="parent"
       app:layout_constraintBottom_toBottomOf="parent"
       android:elevation="2dp" />

   <androidx.camera.view.PreviewView
       android:id="@+id/viewFinder"
       android:layout_width="match_parent"
       android:layout_height="match_parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### 编写类

#### 完成权限检查和申请

```kotlin
class MainActivity : AppCompatActivity() {
   private var imageCapture: ImageCapture? = null

   private lateinit var outputDirectory: File
   private lateinit var cameraExecutor: ExecutorService

   override fun onCreate(savedInstanceState: Bundle?) {
       super.onCreate(savedInstanceState)
       setContentView(R.layout.activity_main)

       // Request camera permissions
       if (allPermissionsGranted()) {
           startCamera()
       } else {
           ActivityCompat.requestPermissions(
               this, REQUIRED_PERMISSIONS, REQUEST_CODE_PERMISSIONS)
       }

       // Set up the listener for take photo button
       camera_capture_button.setOnClickListener { takePhoto() }

       outputDirectory = getOutputDirectory()

       cameraExecutor = Executors.newSingleThreadExecutor()
   }

   private fun takePhoto() {}

   private fun startCamera() {}

   private fun allPermissionsGranted() = REQUIRED_PERMISSIONS.all {
       ContextCompat.checkSelfPermission(
           baseContext, it) == PackageManager.PERMISSION_GRANTED
   }

   private fun getOutputDirectory(): File {
       val mediaDir = externalMediaDirs.firstOrNull()?.let {
           File(it, resources.getString(R.string.app_name)).apply { mkdirs() } }
       return if (mediaDir != null && mediaDir.exists())
           mediaDir else filesDir
   }

   override fun onDestroy() {
       super.onDestroy()
       cameraExecutor.shutdown()
   }

   companion object {
       private const val TAG = "CameraXBasic"
       private const val FILENAME_FORMAT = "yyyy-MM-dd-HH-mm-ss-SSS"
       private const val REQUEST_CODE_PERMISSIONS = 10
       private val REQUIRED_PERMISSIONS = arrayOf(Manifest.permission.CAMERA)
   }
}
```

运行代码后显示如图

![](file://C:\Users\17419\Documents\IkMarkdown\.assets\CameraX.md500.1940241.png)

#### 检查结果回调

```kotlin
override fun onRequestPermissionsResult(
   requestCode: Int, permissions: Array<String>, grantResults:
   IntArray) {
   if (requestCode == REQUEST_CODE_PERMISSIONS) {
       if (allPermissionsGranted()) {
           startCamera()
       } else {
           Toast.makeText(this,
               "Permissions not granted by the user.",
               Toast.LENGTH_SHORT).show()
           finish()
       }
   }
}
```

运行代码即可请求权限

![](file://C:\Users\17419\Documents\IkMarkdown\.assets\CameraX.md648.0384667.png)

#### 实现预览用例

在相机应用中，用户可借助取景器预览他们要拍摄的照片。您可以使用 CameraX `Preview` 类实现取景器功能。

如要使用 `Preview`，您首先需要定义配置，然后使用该配置创建用例的实例。所生成的实例是您要绑定到 CameraX 生命周期的内容。

```kotlin
private fun startCamera() {
   val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

   cameraProviderFuture.addListener(Runnable {
       // Used to bind the lifecycle of cameras to the lifecycle owner
       val cameraProvider: ProcessCameraProvider = cameraProviderFuture.get()

       // Preview
       val preview = Preview.Builder()
          .build()
          .also {
              it.setSurfaceProvider(viewFinder.createSurfaceProvider())
          }

       // Select back camera as a default
       val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

       try {
           // Unbind use cases before rebinding
           cameraProvider.unbindAll()

           // Bind use cases to camera
           cameraProvider.bindToLifecycle(
               this, cameraSelector, preview)

       } catch(exc: Exception) {
           Log.e(TAG, "Use case binding failed", exc)
       }

   }, ContextCompat.getMainExecutor(this))
}
```

* 创建 [`ProcessCameraProvider`](https://developer.android.google.cn/reference/androidx/camera/lifecycle/ProcessCameraProvider?hl=zh-cn) 的实例。此**实例用于将相机的生命周期绑定到生命周期所有者**。由于 CameraX 具有**生命周期感知**能力，所以这样可以省去打开和关闭相机的任务。

```kotlin
val cameraProviderFuture =ProcessCameraProvider.getInstance(this)
```

* 向 `cameraProviderFuture` 中添加监听器。添加 `Runnable` 作为参数。我们将稍后为其填入数值。添加 [`ContextCompat`](https://developer.android.google.cn/reference/kotlin/androidx/core/content/ContextCompat?hl=zh-cn)`.getMainExecutor()` 作为第二个参数。这将返回在主线程上运行的 [`Executor`](https://developer.android.google.cn/reference/java/util/concurrent/Executor?hl=zh-cn)。

```kotlin
cameraProviderFuture.addListener(Runnable{},ContextCompat.getMainExecutor(this))
```

* 在 `Runnable` 中，添加 [`ProcessCameraProvider`](https://developer.android.google.cn/reference/androidx/camera/lifecycle/ProcessCameraProvider?hl=zh-cn)。此类用于将相机的生命周期绑定到应用进程内的 `LifecycleOwner`。

```kotlin
val cameraProvider:ProcessCameraProvider= cameraProviderFuture.get()
```

* 初始化您的 [`Preview`](https://developer.android.google.cn/reference/kotlin/androidx/camera/core/Preview?hl=zh-cn) 对象，在该对象上调用 build，从取景器中获取表面提供程序，然后在预览中进行设置。

```kotlin
val preview =Preview.Builder()
   .build()
   .also {
       it.setSurfaceProvider(viewFinder.createSurfaceProvider())
   }
```

* 创建 [`CameraSelector`](https://developer.android.google.cn/reference/androidx/camera/core/CameraSelector?hl=zh-cn) 对象并选择 `DEFAULT_BACK_CAMERA`。

```kotlin
val cameraSelector =CameraSelector.DEFAULT_BACK_CAMERA
```

* 创建 `try` 块。在该块中，确保任何内容都未绑定到您的 `cameraProvider`，然后将您的 `cameraSelector` 和预览对象绑定到 `cameraProvider`。

```kotlin
try{
   cameraProvider.unbindAll()
   cameraProvider.bindToLifecycle(
       this, cameraSelector, preview)
}
```

* 在少数情况下，此代码会失败，例如应用不再处于焦点中。将此代码放入 `catch` 块中，以记录是否存在失败情况。

```kotlin
catch(exc:Exception){
      Log.e(TAG,"Use case binding failed", exc)
}
```

![](file://C:\Users\17419\Documents\IkMarkdown\.assets\CameraX.md861.0873581.png)

#### 实现照片拍摄

```kotlin
private fun takePhoto() {
   // Get a stable reference of the modifiable image capture use case
   val imageCapture = imageCapture ?: return

   // Create time-stamped output file to hold the image
   val photoFile = File(
       outputDirectory,
       SimpleDateFormat(FILENAME_FORMAT, Locale.US
       ).format(System.currentTimeMillis()) + ".jpg")

   // Create output options object which contains file + metadata
   val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

   // Set up image capture listener, which is triggered after photo has
   // been taken
   imageCapture.takePicture(
       outputOptions, ContextCompat.getMainExecutor(this), object : ImageCapture.OnImageSavedCallback {
           override fun onError(exc: ImageCaptureException) {
               Log.e(TAG, "Photo capture failed: ${exc.message}", exc)
           }

           override fun onImageSaved(output: ImageCapture.OutputFileResults) {
               val savedUri = Uri.fromFile(photoFile)
               val msg = "Photo capture succeeded: $savedUri"
               Toast.makeText(baseContext, msg, Toast.LENGTH_SHORT).show()
               Log.d(TAG, msg)
           }
       })
}
```


* 首先，获取对 [`ImageCapture`](https://developer.android.google.cn/reference/kotlin/androidx/camera/core/ImageCapture?hl=zh-cn) 用例的引用。如果用例为 null，则退出函数。如果您在设置拍摄图像之前点按拍照按钮，则这将为 null。如果没有 `return` 语句，则在用例为 `null` 的情况下，应用会崩溃。

```kotlin
val imageCapture = imageCapture ?:return
```

* 接下来，创建一个容纳图像的文件。添加时间戳，以避免文件名重复。

```kotlin
val photoFile =File(
   outputDirectory,
   SimpleDateFormat(FILENAME_FORMAT,Locale.US
   ).format(System.currentTimeMillis())+".jpg")
```

* 创建 [`OutputFileOptions`](https://developer.android.google.cn/reference/kotlin/androidx/camera/core/ImageCapture.OutputFileOptions?hl=zh-cn) 对象。您可以在此对象中指定有关输出方式的设置。如果您希望将输出内容保存在刚创建的文件中，则添加您的 `photoFile`。

```kotlin
val outputOptions =ImageCapture.OutputFileOptions.Builder(photoFile).build()
```

* 对 `imageCapture` 对象调用 `takePicture()`。传入执行程序 `outputOptions` 以及在保存图像时使用的回调。接下来，您将填写回调。

```kotlin
imageCapture.takePicture(
   outputOptions,ContextCompat.getMainExecutor(this),object:ImageCapture.OnImageSavedCallback{}
)
```

* 在图像拍摄失败或图像拍摄结果保存失败的情况下，添加一个错误示例，以记录失败情况。

```kotlin
override fun onError(exc:ImageCaptureException){
   Log.e(TAG,"Photo capture failed: ${exc.message}", exc)
}
```

* 如果拍摄未失败，则表示拍照成功！将照片保存到您先前创建的文件中，显示一个消息框以告知用户操作成功，然后输出日志语句。

```kotlin
override fun onImageSaved(output:ImageCapture.OutputFileResults){
   val savedUri =Uri.fromFile(photoFile)
   val msg ="Photo capture succeeded: $savedUri"
   Toast.makeText(baseContext, msg,Toast.LENGTH_SHORT).show()
   Log.d(TAG, msg)
}
```

3. 使用 `startCamera()` 方法并将此代码复制到用于预览的代码之下。

```kotlin
imageCapture =ImageCapture.Builder()
   .build()
```

4. 最后，更新对 `try` 块中对 `bindToLifecycle()` 的调用以加入新的用例：

```kotlin
cameraProvider.bindToLifecycle(
   this, cameraSelector, preview, imageCapture)
```

此时，该方法将如下所示：

```kotlin
private fun startCamera(){
   val cameraProviderFuture =ProcessCameraProvider.getInstance(this)

   cameraProviderFuture.addListener(Runnable{
       // Used to bind the lifecycle of cameras to the lifecycle owner
       val cameraProvider:ProcessCameraProvider= cameraProviderFuture.get()

       // Preview
       val preview =Preview.Builder()
           .build()
           .also {
                 it.setSurfaceProvider(viewFinder.createSurfaceProvider())
           }

       imageCapture =ImageCapture.Builder()
           .build()

       // Select back camera as a default
       val cameraSelector =CameraSelector.DEFAULT_BACK_CAMERA

       try{
           // Unbind use cases before rebinding
           cameraProvider.unbindAll()

           // Bind use cases to camera
           cameraProvider.bindToLifecycle(
               this, cameraSelector, preview, imageCapture)

       }catch(exc:Exception){
           Log.e(TAG,"Use case binding failed", exc)
       }

   },ContextCompat.getMainExecutor(this))
}
```
