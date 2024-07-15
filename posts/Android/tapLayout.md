### 布局

```xml
<com.google.android.material.tabs.TabLayout
    android:id="@+id/tap_layout"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:tabTextColor="@color/black"  <!-- 文本颜色-->
    app:tabMode="scrollable" <!-- tab滑动模式-->
    app:tabSelectedTextColor="@color/white" <!-- 选中后颜色-->
    />
```

### 使用

```java
newsViewModel.getNewsTags().observe(getViewLifecycleOwner(),dto->{
    for(NewsTagDTO.DataDTO tag : dto.getData()){
        binding.newsFrag.tapLayout.addTab(binding.newsFrag.tapLayout.newTab().setText(tag.getName()));
    }
});
```

### 注册事件（与ViewPager2结合）

```java
binding.newsFrag.newsVp.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
    @Override
    public void onPageSelected(int position) {
        binding.newsFrag.tabLayout.getTabAt(position).select();
    }
});
binding.newsFrag.tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
    @Override
    public void onTabSelected(TabLayout.Tab tab) {
        binding.newsFrag.newsVp.setCurrentItem(tab.getPosition());
    }

    @Override
    public void onTabUnselected(TabLayout.Tab tab) {

    }

    @Override
    public void onTabReselected(TabLayout.Tab tab) {

    }
});
```

