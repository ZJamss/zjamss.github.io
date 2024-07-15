### 依赖

在模块级的`build.gradle`中开启

```kotlin
android {
        ...
        buildFeatures {
            viewBinding true
        }
}
```

**如果您希望在生成绑定类时忽略某个布局文件**，请将 `tools:viewBindingIgnore="true"` 属性添加到相应布局文件的根视图中：

```xml
<LinearLayout
            ...
            tools:viewBindingIgnore="true" >
        ...
    </LinearLayout>
  
```

### 用法

**为某个模块启用视图绑定功能后，系统会为该模块中包含的每个 XML 布局文件生成一个绑定类。**每个绑定类均包含对**根视图**以及**具有 ID 的所有视图**的**引用**。系统会通过以下方式生成绑定类的名称：将 XML 文件的名称转换为**驼峰式大小写**，并在末尾添加“Binding”一词。

> 例如：activity.main.xml   =  ActivityMainBinding

#### 在 Activity 中使用视图绑定

在Activity中使用Binding类，最好在`onCreate()`方法中使用:

1. **调用生成的绑定类中包含的静态 `inflate()` 方法。此操作会创建该绑定类的实例以供 Activity 使用**
2. 通过调用 `getRoot()` 方法获取对根视图的引用
3. **将根视图传递到 [`setContentView()`](https://developer.android.com/reference/kotlin/android/app/Activity#setcontentview_1)，使其成为屏幕上的活动视图**

```java
  private ResultProfileBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ResultProfileBinding.inflate(getLayoutInflater());
        View view = binding.getRoot();
        setContentView(view);
    }
```

#### 在 Fragment 中使用视图绑定

在 Fragment 的 [`onCreateView()`](https://developer.android.com/reference/kotlin/androidx/fragment/app/Fragment#oncreateview) 方法中执行以下步骤：

1. 调用生成的绑定类中包含的静态 `inflate()` 方法。此操作会创建该绑定类的实例以供 Fragment 使用。
2. 通过调用 `getRoot()` 方法获取对根视图的引用。
3. 从 `onCreateView()` 方法返回根视图，使其成为屏幕上的活动视图。

> **注意** ：`inflate()` 方法会要求您传入布局膨胀器。如果布局已膨胀，您可以调用绑定类的静态 `bind()` 方法。如需了解详情，请查看[视图绑定 GitHub 示例中的例子](https://github.com/android/architecture-components-samples/blob/master/ViewBindingSample/app/src/main/java/com/android/example/viewbindingsample/BindFragment.kt#L36-L41)。
>
> ```java
>     override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
>         super.onViewCreated(view, savedInstanceState)
>         val binding = FragmentBlankBinding.bind(view)
>         fragmentBlankBinding = binding
>         binding.textViewFragment.text = getString(string.hello_from_vb_bindfragment)
>     }
> ```

```java
    private ResultProfileBinding binding;

    @Override
    public View onCreateView (LayoutInflater inflater,
                              ViewGroup container,
                              Bundle savedInstanceState) {
        binding = ResultProfileBinding.inflate(inflater, container, false);
        View view = binding.getRoot();
        return view;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
  
```

**注意 ：Fragment 的存在时间比其视图长。请务必在 Fragment 的 [`onDestroyView()`](https://developer.android.com/reference/kotlin/androidx/fragment/app/Fragment#ondestroyview) 方法中清除对绑定类实例的所有引用。**
