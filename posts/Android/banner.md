### 依赖

```kotlin
   implementation 'io.github.youth5201314:banner:2.2.2'
    implementation 'com.github.bumptech.glide:glide:3.7.0'
```

### 权限

```xml
  <uses-permission android:name="android.permission.INTERNET" />
```

### 布局

```xml
    <com.youth.banner.Banner
        android:id="@+id/banner"
        android:layout_width="match_parent"
        android:layout_height="250dp" />
```

### 编写适配器

```java
public class BannerAdapterImpl extends BannerAdapter<BannerDTO.RowsDTO,BannerAdapterImpl.BannerViewHolder> {
    Context context;

    public BannerAdapterImpl(List<BannerDTO.RowsDTO> datas) {
        super(datas);
    }

    @Override
    public BannerViewHolder onCreateHolder(ViewGroup parent, int viewType) {
        context = parent.getContext();
        ImageView imageView = new ImageView(parent.getContext());
        //注意，必须设置为match_parent，这个是viewpager2强制要求的
        imageView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        imageView.setScaleType(ImageView.ScaleType.CENTER_CROP);
        return new BannerViewHolder(imageView);
    }

    @Override
    public void onBindView(BannerViewHolder holder, BannerDTO.RowsDTO data, int position, int size) {
//        holder.imageView.setImageResource(data.getImg());
        Glide.with(context).load(Constants.BASE_URL +data.getAdvImg()).into(holder.imageView);
    }

    public class BannerViewHolder extends RecyclerView.ViewHolder {
        private final ImageView imageView;

        public BannerViewHolder(@NonNull ImageView itemView) {
            super(itemView);
            this.imageView = itemView;
        }
    }
}
```

### 使用

```java
binding.banner.addBannerLifecycleObserver(IndexFragment.this)
        .setAdapter(new BannerAdapterImpl(rows))
        .setIndicator(new CircleIndicator(IndexFragment.this.getContext()));
```