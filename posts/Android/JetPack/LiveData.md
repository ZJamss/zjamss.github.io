### 依赖

```kotlin
implementation("androidx.lifecycle:lifecycle-viewmodel:$lifecycle_version")
```

### 概览

[`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 是一种可观察的**数据存储器类**。与常规的可观察类不同，LiveData **具有生命周期感知能力**，意指它**遵循**其他应用组件（如 Activity、Fragment 或 Service）的**生命周期**。这种感知能力可确保 LiveData **仅更新处于活跃生命周期状态的应用组件观察者**。


### 使用 LiveData 的优势

* **确保界面符合数据状态**LiveData 遵循观察者模式。当底层数据发生变化时，LiveData 会通知 [`Observer`](https://developer.android.com/reference/androidx/lifecycle/Observer) 对象。您可以整合代码以在这些 `Observer` 对象中更新界面。这样一来，您无需在每次应用数据发生变化时更新界面，因为观察者会替您完成更新。
* **不会发生内存泄漏**观察者会绑定到 [`Lifecycle`](https://developer.android.com/reference/androidx/lifecycle/Lifecycle) 对象，并在其关联的生命周期遭到销毁后进行自我清理。

* **不会因 Activity 停止而导致崩溃**如果观察者的生命周期处于非活跃状态（如返回栈中的 Activity），则它不会接收任何 LiveData 事件。
* **不再需要手动处理生命周期**界面组件只是观察相关数据，不会停止或恢复观察。LiveData 将自动管理所有这些操作，因为它在观察时可以感知相关的生命周期状态变化。

* **数据始终保持最新状态**如果生命周期变为非活跃状态，它会在再次变为活跃状态时接收最新的数据。例如，曾经在后台的 Activity 会在返回前台后立即接收最新的数据。
* **适当的配置更改**如果由于配置更改（如设备旋转）而重新创建了 Activity 或 Fragment，它会立即接收最新的可用数据。
* **共享资源**您可以使用单例模式扩展 [`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 对象以封装系统服务，以便在应用中共享它们。`LiveData` 对象连接到系统服务一次，然后需要相应资源的任何观察者只需观察 `LiveData` 对象。如需了解详情，请参阅[扩展 LiveData](https://developer.android.com/topic/libraries/architecture/livedata#extend_livedata)。

### 使用LiveData对象

1. **创建 `LiveData` 的实例以存储某种类型的数据**。**这通常在 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 类中完成。**
2. **创建可定义 [`onChanged()`](https://developer.android.com/reference/androidx/lifecycle/Observer#onChanged(T)) 方法的 [`Observer`](https://developer.android.com/reference/androidx/lifecycle/Observer) 对象**，该方法可以控制当 `LiveData` 对象存储的数据更改时会发生什么。通常情况下，您可以在界面控制器（如 Activity 或 Fragment）中创建 `Observer` 对象。
3. **使用 [`observe()`](https://developer.android.com/reference/androidx/lifecycle/LiveData#observe(android.arch.lifecycle.LifecycleOwner,%0Aandroid.arch.lifecycle.Observer%3CT%3E)) 方法将 `Observer` 对象附加到 `LiveData` 对象**。`observe()` 方法会采用 [`LifecycleOwner`](https://developer.android.com/reference/androidx/lifecycle/LifecycleOwner) 对象。这样会使 `Observer` 对象订阅 `LiveData` 对象，以使其收到有关更改的通知。通常情况下，您可以在界面控制器（如 Activity 或 Fragment）中附加 `Observer` 对象。

> **注意** ：您可以使用 [`observeForever(Observer)`](https://developer.android.com/reference/androidx/lifecycle/LiveData#observeForever(android.arch.lifecycle.Observer%3CT%3E)) 方法在没有关联的 [`LifecycleOwner`](https://developer.android.com/reference/androidx/lifecycle/LifecycleOwner) 对象的情况下注册一个观察者。在这种情况下，观察者会被视为始终处于活跃状态，因此它始终会收到关于修改的通知。您可以通过调用 [`removeObserver(Observer)`](https://developer.android.com/reference/androidx/lifecycle/LiveData#removeObserver(android.arch.lifecycle.Observer%3CT%3E)) 方法来移除这些观察者。

* 当您更新存储在 `LiveData` 对象中的值时，它会触发所有已注册的观察者（只要附加的 `LifecycleOwner` 处于活跃状态）。
* LiveData 允许界面控制器观察者订阅更新。当 `LiveData` 对象存储的数据发生更改时，界面会自动更新以做出响应。

#### 创建LiveData对象

LiveData 是一种可用于任何数据的封装容器，其中包括可实现 `Collections` 的对象，如 `List`。**[`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 对象通常存储在 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 对象中**，并可通过 **getter** 方法进行访问，如以下示例中所示：

```java
public class NameViewModel extends ViewModel {

// 创建一个 List<User> 类型的 LiveData
private MutableLiveData<List<User>> currentUsers;

    public MutableLiveData<List<User>> getCurrentcurrentUsers() {
        if (currentUsers == null) {
            currentUsers = new MutableLiveData<Live<User>>();
        }
        return currentUsers;
    }

// ViewModel的其余部分...
}
```

> **注意** ：请确保用于更新界面的 `LiveData` 对象存储在 `ViewModel` 对象中，而不是将其存储在 Activity 或 Fragment 中，原因如下：*
>
> * **避免 Activity 和 Fragment 过于庞大**。现在，这些界面控制器负责显示数据，但不负责存储数据状态。
> * **将 `LiveData` 实例与特定的 Activity 或 Fragment 实例分离开，并使 `LiveData` 对象在配置更改后继续存在。**


#### 观察LiveData对象


**在大多数情况下，应用组件的 `onCreate()` 方法是开始观察 [`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 对象的正确着手点**，原因如下：

* 确保系统不会从 Activity 或 Fragment 的 `onResume()` 方法进行冗余调用。
* 确保 Activity 或 Fragment 变为活跃状态后具有可以立即显示的数据。**一旦应用组件处于 [`STARTED`](https://developer.android.com/reference/androidx/lifecycle/Lifecycle.State#STARTED) 状态，就会从它正在观察的 `LiveData` 对象接收最新值**。只有在设置了要观察的 `LiveData` 对象时，才会发生这种情况。

> 通常，LiveData 仅**在数据发生更改时才发送更新**，并且仅**发送给活跃观察者**。此行为的一种例外情况是，**观察者从非活跃状态更改为活跃状态时也会收到更新**。此外，**如果观察者第二次从非活跃状态更改为活跃状态，则只有在自上次变为活跃状态以来值发生了更改时，它才会收到更新。**

```java
public class NameActivity extends AppCompatActivity {

    private NameViewModel model;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Other code to setup the activity...

        // Get the ViewModel.
        model = new ViewModelProvider(this).get(NameViewModel.class);

        // Create the observer which updates the UI.
        final Observer<String> nameObserver = new Observer<String>() {
            @Override
            public void onChanged(@Nullable final String newName) {
                // Update the UI, in this case, a TextView.
                nameTextView.setText(newName);
            }
        };

        // Observe the LiveData, passing in this activity as the LifecycleOwner and the observer.
        model.getCurrentName().observe(this, nameObserver);
    }
}
```

在传递 `nameObserver` 参数的情况下调用 [`observe()`](https://developer.android.com/reference/androidx/lifecycle/LiveData#observe(android.arch.lifecycle.LifecycleOwner,%0Aandroid.arch.lifecycle.Observer%3CT%3E)) 后，**系统会立即调用 [`onChanged()`](https://developer.android.com/reference/androidx/lifecycle/Observer#onChanged(T))**，从而提供 `mCurrentName` 中存储的最新值。如果 `LiveData` 对象尚未在 `mCurrentName` 中设置值，则不会调用 `onChanged()`。


#### 更新LiveData对象

LiveData 没有公开可用的方法来更新存储的数据。**[`MutableLiveData`](https://developer.android.com/reference/androidx/lifecycle/MutableLiveData) 类将公开 [`setValue(T)`](https://developer.android.com/reference/androidx/lifecycle/MutableLiveData#setValue(T)) 和 [`postValue(T)`](https://developer.android.com/reference/androidx/lifecycle/MutableLiveData#postValue(T)) 方法**，如果您需要修改存储在 [`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 对象中的值，则必须使用这些方法。**通常情况下会在 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 中使用 `MutableLiveData`，然后 `ViewModel` 只会向观察者公开不可变的 `LiveData` 对象。**

设置观察者关系后，您可以更新 `LiveData` 对象的值（如以下示例中所示），这样当用户点按某个按钮时会触发所有观察者：

```java
button.setOnClickListener(new OnClickListener() {
    @Override
    public void onClick(View v) {
        String anotherName = "John Doe";
        model.getCurrentName().setValue(anotherName);
    }
});
```


#### 将 LiveData 与 Room 一起使用

[Room](https://developer.android.com/training/data-storage/room) 持久性库**支持返回 [`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 对象的可观察查询**。可观察查询属于数据库访问对象 (DAO) 的一部分。

**当数据库更新时，Room 会生成更新 `LiveData` 对象所需的所有代码。在需要时，生成的代码会在后台线程上异步运行查询**。此模式有助于使界面中显示的数据与存储在数据库中的数据保持同步。您可以在 [Room 持久性库指南](https://developer.android.com/topic/libraries/architecture/room)中详细了解 Room 和 DAO。


### 应用架构中的 LiveData

`LiveData` 具有生命周期感知能力，遵循 activity 和 fragment 等实体的生命周期。您可以使用 `LiveData` 在这些生命周期所有者和生命周期不同的其他对象（例如 `ViewModel` 对象）之间传递数据。`ViewModel` 的主要责任是加载和管理与界面相关的数据，因此非常适合作为用于保留 `LiveData` 对象的备选方法。您可以在 `ViewModel` 中创建 `LiveData` 对象，然后使用这些对象向界面层公开状态。

activity 和 fragment 不应保留 `LiveData` 实例，因为它们的用途是显示数据，而不是保持状态。此外，通过让 activity 和 fragment 持续不保留数据，可以使编写单元测试变得更轻松。


### 扩展LiveData(?)

如果观察者的生命周期处于 [`STARTED`](https://developer.android.com/reference/androidx/lifecycle/Lifecycle.State#STARTED) 或 [`RESUMED`](https://developer.android.com/reference/androidx/lifecycle/Lifecycle.State#RESUMED) 状态，则 LiveData 会认为该观察者处于活跃状态。以下示例代码说明了如何扩展 [`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 类：

```java
publicclassStockLiveDataextendsLiveData<BigDecimal>{
    privateStockManager stockManager;

    privateSimplePriceListener listener =newSimplePriceListener(){
        @Override
        publicvoid onPriceChanged(BigDecimal price){
            setValue(price);
        }
    };

    publicStockLiveData(String symbol){
        stockManager =newStockManager(symbol);
    }

    @Override
    protectedvoid onActive(){
        stockManager.requestPriceUpdates(listener);
    }

    @Override
    protectedvoid onInactive(){
        stockManager.removeUpdates(listener);
    }
}
```

本示例中的价格监听器实现包括以下重要方法：

* 当 `LiveData` 对象具有活跃观察者时，会调用 [`onActive()`](https://developer.android.com/reference/androidx/lifecycle/LiveData#onActive()) 方法。这意味着，您需要从此方法开始观察股价更新。
* 当 `LiveData` 对象没有任何活跃观察者时，会调用 [`onInactive()`](https://developer.android.com/reference/androidx/lifecycle/LiveData#onInactive()) 方法。由于没有观察者在监听，因此没有理由与 `StockManager` 服务保持连接。
* [`setValue(T)`](https://developer.android.com/reference/androidx/lifecycle/MutableLiveData#setValue(T)) 方法将更新 `LiveData` 实例的值，并将更改告知活跃观察者。

您可以使用 `StockLiveData` 类，如下所示：

[Kotlin](https://developer.android.com/topic/libraries/architecture/livedata#kotlin)[Java](https://developer.android.com/topic/libraries/architecture/livedata#java)

```
publicclassMyFragmentextendsFragment{
    @Override
    publicvoid onViewCreated(@NonNullView view,@NullableBundle savedInstanceState){
        super.onViewCreated(view, savedInstanceState);
        LiveData<BigDecimal> myPriceListener =...;
        myPriceListener.observe(getViewLifecycleOwner(), price ->{
            // Update the UI.
        });
    }
}
```

[`observe()`](https://developer.android.com/reference/androidx/lifecycle/LiveData#observe(androidx.lifecycle.LifecycleOwner,%20androidx.lifecycle.Observer%3C?%20super%20T%3E)) 方法将与 Fragment 视图关联的 [`LifecycleOwner`](https://developer.android.com/reference/androidx/lifecycle/LifecycleOwner) 作为第一个参数传递。这样做表示此观察者已绑定到与所有者关联的 [`Lifecycle`](https://developer.android.com/reference/androidx/lifecycle/Lifecycle) 对象，这意味着：

* 如果 `Lifecycle` 对象未处于活跃状态，那么即使值发生更改，也不会调用观察者。
* 销毁 `Lifecycle` 对象后，会自动移除观察者。

`LiveData` 对象具有生命周期感知能力，这一事实意味着您可以在多个 Activity、Fragment 和 Service 之间共享这些对象。为使示例保持简单，您可以将 `LiveData` 类实现为一个单例，如下所示：

```java
publicclassStockLiveDataextendsLiveData<BigDecimal>{
    privatestaticStockLiveData sInstance;
    privateStockManager stockManager;

    privateSimplePriceListener listener =newSimplePriceListener(){
        @Override
        publicvoid onPriceChanged(BigDecimal price){
            setValue(price);
        }
    };

    @MainThread
    publicstaticStockLiveData get(String symbol){
        if(sInstance ==null){
            sInstance =newStockLiveData(symbol);
        }
        return sInstance;
    }

    privateStockLiveData(String symbol){
        stockManager =newStockManager(symbol);
    }

    @Override
    protectedvoid onActive(){
        stockManager.requestPriceUpdates(listener);
    }

    @Override
    protectedvoid onInactive(){
        stockManager.removeUpdates(listener);
    }
}
```

并且您可以在 Fragment 中使用它，如下所示：

```java
publicclassMyFragmentextendsFragment{
    @Override
    publicvoid onViewCreated(@NonNullView view,@NullableBundle savedInstanceState){
        super.onViewCreated(view, savedInstanceState);
        StockLiveData.get(symbol).observe(getViewLifecycleOwner(), price ->{
            // Update the UI.
        });
    }
}
```

多个 Fragment 和 Activity 可以观察 `MyPriceListener` 实例。仅当一个或多项系统服务可见且处于活跃状态时，LiveData 才会连接到该服务。

### 转换LiveData

您可能希望在将 [`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 对象分派给观察者之前对存储在其中的值进行更改，或者您可能需要根据另一个实例的值返回不同的 `LiveData` 实例。[`Lifecycle`](https://developer.android.com/reference/android/arch/lifecycle/package-summary) 软件包会提供 [`Transformations`](https://developer.android.com/reference/androidx/lifecycle/Transformations) 类，该类包括可应对这些情况的辅助程序方法。

**[`Transformations.map()`](https://developer.android.com/reference/androidx/lifecycle/Transformations#map(android.arch.lifecycle.LiveData%3CX%3E,%20android.arch.core.util.Function%3CX,%20Y%3E))对存储在 `LiveData` 对象中的值应用函数，并将结果传播到下游。**

```java
LiveData<User> userLiveData = ...;
LiveData<String> userName = Transformations.map(userLiveData, user -> {
    user.name + " " + user.lastName
});
```

**[`Transformations.switchMap()`](https://developer.android.com/reference/androidx/lifecycle/Transformations#switchMap(android.arch.lifecycle.LiveData%3CX%3E,%20android.arch.core.util.Function%3CX,%20android.arch.lifecycle.LiveData%3CY%3E%3E))与 `map()` 类似，对存储在 `LiveData` 对象中的值应用函数，并将结果解封和分派到下游。传递给 `switchMap()` 的函数必须返回 `LiveData` 对象，如以下示例中所示**：

```java
private LiveData<User> getUser(String id) {
  ...;
}

LiveData<String> userId = ...;
LiveData<User> user = Transformations.switchMap(userId, id -> getUser(id) );
```


您可以使用转换方法在观察者的生命周期内传送信息。除非观察者正在观察返回的 `LiveData` 对象，否则不会计算转换。因为转换是以延迟的方式计算，所以与生命周期相关的行为会隐式传递下去，而不需要额外的显式调用或依赖项。

如果您认为 [`ViewModel`](https://developer.android.com/reference/androidx/lifecycle/ViewModel) 对象中需要有 `Lifecycle` 对象，那么进行转换或许是更好的解决方案。例如，假设您有一个界面组件，该组件接受地址并返回该地址的邮政编码。您可以为此组件实现简单的 `ViewModel`，如以下示例代码所示：

```java
class MyViewModel extendsViewModel{
    private final PostalCodeRepository repository;
    public MyViewModel(PostalCodeRepository repository){
       this.repository = repository;
    }

    private LiveData<String> getPostalCode(String address){
       // DON'T DO THIS
       return repository.getPostCode(address);
    }
}
```

然后，该界面组件需要取消注册先前的 `LiveData` 对象，并在每次调用 `getPostalCode()` 时注册到新的实例。此外，如果重新创建了该界面组件，它会再触发一次对 `repository.getPostCode()` 方法的调用，而不是使用先前调用所得的结果。

您也可以将邮政编码查询实现为地址输入的转换，如以下示例中所示：

```java
class MyViewModelextendsViewModel{
    private final PostalCodeRepository repository;
    private final MutableLiveData<String> addressInput =new MutableLiveData();
    public final LiveData<String> postalCode =
            Transformations.switchMap(addressInput,(address)->{
                return repository.getPostCode(address);
             });

  public MyViewModel(PostalCodeRepository repository){
      this.repository = repository
  }

  private void setInput(String address){
      addressInput.setValue(address);
  }
}
```

在这种情况下，`postalCode` 字段定义为 `addressInput` 的转换。只要您的应用具有与 `postalCode` 字段关联的活跃观察者，就会在 `addressInput` 发生更改时重新计算并检索该字段的值。

此机制允许较低级别的应用创建以延迟的方式按需计算的 `LiveData` 对象。`ViewModel` 对象可以轻松获取对 `LiveData` 对象的引用，然后在其基础之上定义转换规则。

#### 创建新的转换

有十几种不同的特定转换在您的应用中可能很有用，但默认情况下不提供它们。如需实现您自己的转换，您可以使用 [`MediatorLiveData`](https://developer.android.com/reference/androidx/lifecycle/MediatorLiveData) 类，该类可以监听其他 [`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 对象并处理它们发出的事件。`MediatorLiveData` 正确地将其状态传播到源 `LiveData` 对象。如需详细了解此模式，请参阅 [`Transformations`](https://developer.android.com/reference/androidx/lifecycle/Transformations) 类的参考文档。


### 合并多个 LiveData 源

[`MediatorLiveData`](https://developer.android.com/reference/androidx/lifecycle/MediatorLiveData) 是 [`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 的子类，允许您合并多个 LiveData 源。只要任何原始的 LiveData 源对象发生更改，就会触发 `MediatorLiveData` 对象的观察者。

例如，如果界面中有可以从本地数据库或网络更新的 `LiveData` 对象，则可以向 `MediatorLiveData` 对象添加以下源：

* 与存储在数据库中的数据关联的 `LiveData` 对象。
* 与从网络访问的数据关联的 `LiveData` 对象。

您的 Activity 只需观察 `MediatorLiveData` 对象即可从这两个源接收更新。有关详细示例，请参阅[应用架构指南](https://developer.android.com/topic/libraries/architecture/guide)的[附录：公开网络状态](https://developer.android.com/topic/libraries/architecture/guide#addendum)部分。

## 其他资源

如需详细了解 [`LiveData`](https://developer.android.com/reference/androidx/lifecycle/LiveData) 类，请参阅以下资源。
