### 生命周期

![](file://C:\Users\17419\Documents\IkMarkdown\.assets\Fragment.md459.5332114.png)

> `onCeateView()`**时需要注入布局**

### 动态切换Fragment

* 先获取 `FragmentManager`
* 开启事务 `FragmentManager.beginTransaction()`
* 置换fragment, `replace(resId,fragment)` **(resId是包含fragment容器布局的id)**
* `addToBackStack()`可以开启返回栈
* `commit()`提交

```java
     private fun replace(frag: Fragment) {
        FragmentManager manager = getSupportFragmentManager()
        Transaction transaction = manager.beginTransaction()
        transaction.addToBackStack()
        transaction.replace(R.id.frameLayout, frag)
        transaction.commit()
    }
```

### Fragment和Activity的通信接口

**通信接口定义发送和接收消息**

```kotlin
interface IFragmentCallback {
    fun sendMsgToActivity(msg:String)
    fun getMessageFromActivity(): String
}
```

**在对应的fragment内添加属性**

> ps:写一个基本类，包含此参数，fragment来继承

```kotlin
var callback: IFragmentCallback? = null
```

> 在启动fragment前，匿名类实现接口，然后赋值给fragment里的参数，fragment内就能使用参数了

```kotlin
val cb = object : IFragmentCallback {
                override fun sendMsgToActivity(msg: String) {
                    Toast.makeText(this@MainActivity, msg, Toast.LENGTH_SHORT).show()
                }

                override fun getMessageFromActivity(): String {
                    return "来自Activity的接口返回值"
                }
            }

            val frag = if (flag) {
                Frag2().apply {
                    callback = cb
                }
            } else {
                Frag1().apply {
                    callback = cb
                }
            }
```

> 使用实例

```kotlin
text?.let {
            textView?.text = "frag1 ($text) (${callback?.getMessageFromActivity()})"
        }
        callback?.sendMsgToActivity("frag1的接口回调参数")
```
