### 依赖

```kotlin
        def lifecycle_version = "2.5.0-alpha02"
        def arch_version = "2.1.0"

        // ViewModel
        implementation "androidx.lifecycle:lifecycle-viewmodel:$lifecycle_version"
        // LiveData
        implementation "androidx.lifecycle:lifecycle-livedata:$lifecycle_version"
        // Lifecycles only (without ViewModel or LiveData)
        implementation "androidx.lifecycle:lifecycle-runtime:$lifecycle_version"

        // Saved state module for ViewModel
        implementation "androidx.lifecycle:lifecycle-viewmodel-savedstate:$lifecycle_version"

        // Annotation processor
        annotationProcessor "androidx.lifecycle:lifecycle-compiler:$lifecycle_version"
        // alternately - if using Java8, use the following instead of lifecycle-compiler
        implementation "androidx.lifecycle:lifecycle-common-java8:$lifecycle_version"

        // optional - helpers for implementing LifecycleOwner in a Service
        implementation "androidx.lifecycle:lifecycle-service:$lifecycle_version"

        // optional - ProcessLifecycleOwner provides a lifecycle for the whole application process
        implementation "androidx.lifecycle:lifecycle-process:$lifecycle_version"

        // optional - ReactiveStreams support for LiveData
        implementation "androidx.lifecycle:lifecycle-reactivestreams:$lifecycle_version"

        // optional - Test helpers for LiveData
        testImplementation "androidx.arch.core:core-testing:$arch_version"
```

[`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 类旨在**以注重生命周期的方式存储和管理界面相关的数据**。[`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 类**让数据可在发生屏幕旋转等配置更改后继续留存。**

### 实现ViewModel

```java
public class MyViewModel extends ViewModel {
    private MutableLiveData<List<User>> users;
    public LiveData<List<User>> getUsers() {
        if (users == null) {
            users = new MutableLiveData<List<User>>();
            loadUsers();
        }
        return users;
    }

    private void loadUsers() {
        // Do an asynchronous operation to fetch users.
    }
}
```

然后，您可以从 Activity 访问该列表，如下所示

```java
public class MyActivity extends AppCompatActivity {
    public void onCreate(Bundle savedInstanceState) {
        // Create a ViewModel the first time the system calls an activity's onCreate() method.
        // Re-created activities receive the same MyViewModel instance created by the first activity.

        MyViewModel model = new ViewModelProvider(this).get(MyViewModel.class);
        model.getUsers().observe(this, users -> {
            // update UI
        });
    }
}
```

如果重新创建了该 Activity，它接收的 `MyViewModel` 实例与第一个 Activity 创建的实例相同。**当所有者 Activity 销毁时，框架会调用 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 对象的 [`onCleared()`](https://developer.android.com/reference/androidx/lifecycle/ViewModel#onCleared()) 方法，以便它可以清理资源。**

> **注意** ：[`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 绝不能引用视图、[`Lifecycle`](https://developer.android.com/reference/androidx/lifecycle/Lifecycle) 或可能存储对 Activity 上下文的引用的任何类。

> [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 对象存在的时间比视图或 [`LifecycleOwners`](https://developer.android.com/reference/androidx/lifecycle/LifecycleOwner) 的特定实例存在的时间更长。这还意味着，您可以更轻松地编写涵盖 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 的测试，因为它不了解视图和 [`Lifecycle`](https://developer.android.com/reference/androidx/lifecycle/Lifecycle) 对象。[`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 对象可以包含 [`LifecycleObservers`](https://developer.android.com/reference/androidx/lifecycle/LifecycleObserver)，如 [`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 对象。但是，[`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 对象绝不能观察对生命周期感知型可观察对象（如 [`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 对象）的更改。**如果 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 需要 `Application` 上下文（例如，为了查找系统服务），它可以扩展 [`AndroidViewModel`](https://developer.android.com/reference/androidx/lifecycle/AndroidViewModel) 类并设置用于接收 `Application` 的构造函数，因为 `Application` 类会扩展 `Context`。**

### ViewModel的生命周期

[`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 对象存在的时间范围是创建 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 时传递给 [`ViewModelProvider`](https://developer.android.com/reference/androidx/lifecycle/ViewModelProvider) 的 [`Lifecycle`](https://developer.android.com/reference/androidx/lifecycle/Lifecycle)。

[`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 将一直留在内存中，直到限定其存在时间范围的 [`Lifecycle`](https://developer.android.com/reference/androidx/lifecycle/Lifecycle) 永久消失：**对于 activity，是在 activity销毁时；而对于 fragment，是在 fragment 分离时。**

![说明 ViewModel 随着 Activity 状态的改变而经历的生命周期。](https://developer.android.com/images/topic/libraries/architecture/viewmodel-lifecycle.png)

您通常在系统首次调用 Activity 对象的 `onCreate()` 方法时请求 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel)。系统可能会在 activity 的整个生命周期内多次调用 `onCreate()`，如在旋转设备屏幕时。[`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 存在的时间范围是从您首次请求 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 直到 activity 完成并销毁。

### 在 Fragment 之间共享数据

假设您有一个 Fragment，在该 Fragment 中，用户从列表中选择一项，还有另一个 Fragment，用于显示选定项的内容。

这种情况不太容易处理，**因为这两个 Fragment 都需要定义某种接口描述，并且所有者 Activity 必须将两者绑定在一起**。此外，这两个 Fragment 都必须处理另一个 Fragment 尚未创建或不可见的情况。

可以使用 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 对象解决这一常见的难点。**这两个 fragment 可以使用其 activity 范围共享 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 来处理此类通信**，如以下示例代码所示：

public class SharedViewModel extends ViewModel {
    private final MutableLiveData<Item> selected = new MutableLiveData<Item>();

    public void select(Item item) {
        selected.setValue(item);
    }

    public LiveData<Item> getSelected() {
        return selected;
    }
}

public class ListFragment extends Fragment {
    private SharedViewModel model;

    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        model = new ViewModelProvider(requireActivity()).get(SharedViewModel.class);
        itemSelector.setOnClickListener(item -> {
            model.select(item);
        });
    }
}

public class DetailFragment extends Fragment {

    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        SharedViewModel model = new ViewModelProvider(requireActivity()).get(SharedViewModel.class);
        model.getSelected().observe(getViewLifecycleOwner(), item -> {
           // Update the UI.
        });
    }
}
请注意，这两个 Fragment 都会检索包含它们的 Activity。这样，当这两个 Fragment 各自获取 [`ViewModelProvider`](https://developer.android.com/reference/androidx/lifecycle/ViewModelProvider) 时，它们会收到相同的 `SharedViewModel` 实例（**其范围限定为该 Activity**）。

此方法具有以下**优势**：

* Activity 不需要执行任何操作，也不需要对此通信有任何了解。
* 除了 `SharedViewModel` 约定之外，Fragment 不需要相互了解。如果其中一个 Fragment 消失，另一个 Fragment 将继续照常工作。
* 每个 Fragment 都有自己的生命周期，而不受另一个 Fragment 的生命周期的影响。如果一个 Fragment 替换另一个 Fragment，界面将继续工作而没有任何问题。

### 将加载器替换为 ViewModel

`CursorLoader` 等加载器类经常用于使应用界面中的数据与数据库保持同步。您可以将 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 与一些其他类一起使用来替换加载器。使用 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 可将界面控制器与数据加载操作分离，这意味着类之间的强引用更少。

在使用加载器的一种常见方法中，应用可能会使用 `CursorLoader` 观察数据库的内容。当数据库中的值发生更改时，加载器会自动触发数据的重新加载并更新界面：

![](https://developer.android.com/images/topic/libraries/architecture/viewmodel-loader.png)

图 2. 使用加载器加载数据

[`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 与 [Room](https://developer.android.com/topic/libraries/architecture/room) 和 [LiveData](https://developer.android.com/topic/libraries/architecture/livedata) 一起使用可替换加载器。[`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 确保数据在设备配置更改后仍然存在。[Room](https://developer.android.com/topic/libraries/architecture/room) 在数据库发生更改时通知 [`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData)，[LiveData](https://developer.android.com/topic/libraries/architecture/livedata) 进而使用修订后的数据更新界面。

![](https://developer.android.com/images/topic/libraries/architecture/viewmodel-replace-loader.png)

图 3. 使用 ViewModel 加载数据

### 和LIveData结合使用实例

案例：界面输入用户id，并凭此更新用户信息

先定义`ViewModel`，将获取的用户id作为`LiveData`保存，创建一个公开的`set`函数

使用的用户数据通过`switchMap()`观察`inputUserIdLiveData`的变化，通过`Repostory`获取

```java
public class UserViewModel extends ViewModel {
    private MutableLiveData<String> inputUserIdLiveData = new MutableLiveData<>();

    public LiveData<UserUIState> userLiveData = Transformations.switchMap(inputUserIdLiveData, input -> Repository.getUsers(input));

    public void searchUser(String userId) {
        inputUserIdLiveData.setValue(userId);
    }
}


```
`user Pojo`

```java
public class UserUIState {
    private String id;
    private String name;

    public UserUIState() {
    }
    public UserUIState(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```
`Repository` 模拟网络请求

```java
public class Repository {
    public static LiveData<UserUIState> getUsers(String userId) {
        Toast.makeText(App.context,"请求了一次 "+new Date().toString(),Toast.LENGTH_SHORT).show();
        MutableLiveData<UserUIState> userLiveData = new MutableLiveData<>();
        UserUIState user = new UserUIState();
        switch (userId) {
            case "1":
                user.setId(userId);
                user.setName("ZJamss");
                userLiveData.setValue(user);
                break;
            case "2":
                user.setId(userId);
                user.setName("POJO");
                userLiveData.setValue(user);
                break;
            default:
                userLiveData.setValue(null);
        }

        return userLiveData;
    }

}
```
`MainActivity`

```java
public class MainActivity extends AppCompatActivity {

    private UserViewModel userUIState;
    private TextView userId;
    private TextView userName;
    private EditText inputUserId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        userId = findViewById(R.id.userId);
        userName = findViewById(R.id.userName);
        inputUserId = findViewById(R.id.inputUserId);

        userUIState = new ViewModelProvider(this).get(UserViewModel.class);
        userUIState.userLiveData.observe(this, user -> {
            if(user != null){
                userId.setText(user.getId());
                userName.setText(user.getName());
            }else {
                userId.setText("");
                userName.setText("");
                Toast.makeText(this,"未能查询到用户信息",Toast.LENGTH_SHORT).show();
            }
        });

        inputUserId.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void afterTextChanged(Editable editable) {
                userUIState.searchUser(editable.toString());
            }
        });

    }
```
获取ModelView，绑定生命周期，然后观察userUIState变化
