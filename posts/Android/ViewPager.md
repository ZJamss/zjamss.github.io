### ViewPager的使用

创建适配器类继承 `PagerAdapter` ,并**重写四个方法**

```kotlin
class MyAdapter(private val list:List<View>): PagerAdapter() {
    override fun getCount() = list.size

    override fun isViewFromObject(view: View, `object`: Any): Boolean {
        return view == `object`
    }

    override fun instantiateItem(container: ViewGroup, position: Int): Any {
        container.addView(list[position])
        return list[position]
    }

    override fun destroyItem(container: ViewGroup, position: Int, `object`: Any) {
        container.removeView(list[position])
    }
}
```

![](file://C:\Users\17419\Documents\IkMarkdown\.assets\ViewPager.md1672.0251309.png)

**配置适配器，并将其指定给ViewPage**r

```kotlin
val vp = findViewById<ViewPager>(R.id.vp)
        val l1 = layoutInflater.inflate(R.layout.layout1,null)
        val l2 = layoutInflater.inflate(R.layout.layout2,null)
        val l3 = layoutInflater.inflate(R.layout.layout3,null)
        val list = ArrayList<View>()
        list.add(l1)
        list.add(l2)
        list.add(l3)
        vp.adapter = MyAdapter(list)
```

### ViewPager2的使用

在`layout.xml`中添加

```xml
<androidx.viewpager2.widget.ViewPager2
        android:id="@+id/vp"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
```

再添加一个`item_layout`

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:id="@+id/container">

    <TextView
        android:id="@+id/tv"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:text="hello">
    </TextView>

</LinearLayout>
```

定义一个 `Page`对象

```kotlin
data class Page(val title:String,val color:Int) {
}
```

定义一个`Adapter`并继承`RecyclerView.Adapter<xxx.ViewHolder>`

```kotlin
class Vp2Adapter(private val pages: List<Page>) : RecyclerView.Adapter<Vp2Adapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tv: TextView = view.findViewById(R.id.tv)
        val container: LinearLayout = view.findViewById(R.id.container)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(parent.context).inflate(R.layout.item_vp, parent, false)
        )
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val page = pages[position]
        holder.tv.text = page.title
        holder.container.setBackgroundResource(page.color)
    }

    override fun getItemCount() = pages.size
}
```

**重写三个函数**，并写一个内部类来继承`RecyclerView.ViewHolder()`，和之前列表一样的写法

`getItemCount`**返回多少数，则有多少个页面**

在MainActivity中**获取viewpager2实例并给适配器赋值**

```kotlin
val vp = findViewById<ViewPager2>(R.id.vp)
        val list = listOf<Page>(Page("t1",R.color.teal_200),Page("t2",R.color.purple_200),Page("t3",R.color.material_on_primary_emphasis_medium))
        vp.adapter = Vp2Adapter(list)
```

### ViewPager2结合Fragment


**添加ViewPager2**

```xml
    <androidx.viewpager2.widget.ViewPager2
        android:id="@+id/vp"
        android:layout_weight="1"
        android:layout_width="match_parent"
        android:layout_height="0dp" />
```

> *height是0dp表示充满未使用的屏幕*

**编写Adapter**

```kotlin
class MyFragmentAdapter(private val list:List<Fragment>,private val fm : FragmentManager, private val lifecycle: Lifecycle) : FragmentStateAdapter(fm,lifecycle){
    override fun createFragment(position: Int): Fragment {
        return list[position]
    }

    override fun getItemCount() = list.size

}
```

`FragmentStateAdapter`**在fragment数量较少时使用，每次滑走不会销毁fragment**

**最后在`MainActivity`中编写代码**

```kotlin
vp = findViewById(R.id.vp)
        vp.adapter = MyFragmentAdapter(
            listOf(
                BlankFragment.newInstance("第一个"),
                BlankFragment.newInstance("第二个"),
                SecondFrag()
            ), supportFragmentManager, lifecycle
        )
```

**将想要滑动的fragment放入列表，和`supportFragmentManager,lifecycle`一起初始化adapter就能实现功能了**

<br/>

**使用BottomNavigationView**

添加控件

```xml
<com.google.android.material.bottomnavigation.BottomNavigationView
    android:id="@+id/bnv"
    android:layout_width="match_parent"
    android:layout_height="?attr/actionBarSize"
    app:itemIconTint="@color/teal_200"
    app:itemTextColor="@color/black"
    app:menu="@menu/menu_bottom_nav" />
```

`itemIconTint` **选中**item_icon后的颜色，默认颜色为**primary**

`itemTextColor` item_text的颜色

`menu`是**菜单选项**

<br/>

**menu_bottom_nav.xml**

```xml
<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item
        android:id="@+id/first"
        android:title="第一个"
        android:icon="@drawable/ic_launcher_foreground"/>
    <item
        android:id="@+id/second"
        android:title="第二个"
        android:icon="@drawable/ic_launcher_foreground"/>
    <item
        android:id="@+id/third"
        android:title="第三个"
        android:icon="@drawable/ic_launcher_foreground"/>
</menu>
```

<br/>

**在Activity内设置菜单选项的选择事件回调**

```kotlin
bnv = findViewById(R.id.bnv)
        bnv.setOnNavigationItemSelectedListener {
            when (it.itemId) {
                R.id.first -> {
                    vp.setCurrentItem(0, true)
                    return@setOnNavigationItemSelectedListener true
                }
                R.id.second -> {
                    vp.setCurrentItem(1, true)
                    return@setOnNavigationItemSelectedListener true
                }
                R.id.third -> {
                    vp.setCurrentItem(2, true)
                    return@setOnNavigationItemSelectedListener true
                }
                else -> throw RuntimeException("Lipu")
            }
        }
```

**和ViewPager2结合使用**

```kotlin
        vp.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {

            override fun onPageSelected(position: Int) {
                bnv.menu.getItem(position).isChecked = true
            }

        })
```

> 给viewpager注册页面改变回调，页面变换时，BottomNavigationView对应item的icon也变化
