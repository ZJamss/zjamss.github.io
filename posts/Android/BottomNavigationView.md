### 布局

```java
<com.google.android.material.bottomnavigation.BottomNavigationView
android:id="@+id/bnv"
android:layout_width="match_parent"
android:layout_height="?attr/actionBarSize"
android:layout_alignParentBottom="true"
android:background="#eeeeee"
android:theme="@style/footButton"
app:menu="@menu/menu_bottom_nav" />
```

### 配置

`themes.xml`

```xml
<style name="footButton" parent="Theme.AppCompat.Light">
    <item name="colorPrimary">@color/white</item>
    <item name="android:textColorSecondary">@android:color/black</item>
</style>
```

`menu_bottom_nav.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item
        android:id="@+id/Index"
        android:icon="@drawable/ic_baseline_home"
        android:title="主页" />
    <item
        android:id="@+id/allService"
        android:icon="@drawable/ic_baseline_service"
        android:title="全部服务" />
    <item
        android:id="@+id/SmartCommunity"
        android:icon="@drawable/ic_baseline_party"
        android:title="智慧社区" />
    <item
        android:id="@+id/News"
        android:icon="@drawable/ic_baseline_news"
        android:title="新闻" />
    <item
        android:id="@+id/PersonalCenter"
        android:icon="@drawable/ic_baseline_user"
        android:title="个人中心" />
</menu>
```

### 使用（与ViewPager2结合）

```java
binding.bnv.setLabelVisibilityMode(NavigationBarView.LABEL_VISIBILITY_LABELED);
binding.bnv.setOnItemSelectedListener(item -> {
    switch (item.getItemId()) {
        case R.id.Index:
            binding.mainVp.setCurrentItem(0);
            break;
        case R.id.allService:
            binding.mainVp.setCurrentItem(1);
            break;
        case R.id.SmartCommunity:
            binding.mainVp.setCurrentItem(2);
            break;
        case R.id.News:
            binding.mainVp.setCurrentItem(3);
            break;
        case R.id.PersonalCenter:
            binding.mainVp.setCurrentItem(4);
            break;
    }
    return true;
});
binding.mainVp.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
    @Override
    public void onPageSelected(int position) {
        binding.bnv.setSelectedItemId(binding.bnv.getMenu().getItem(position).getItemId());
    }
});
```