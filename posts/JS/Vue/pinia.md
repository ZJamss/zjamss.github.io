## 安装

```bash
npm i pinia
```

## 使用

**新建`/stores/index.ts`**

**创建`pinia`实例**

```typescript
import { createPinia } from 'pinia'

const store = createPinia()
export default store
```

**在`main..ts`中使用`pinia`**

```typescript
import store from '@/stores'

const app = createApp(App)
app.use(store)
app.mount('#app')
```

**新建`store`**

`/stores/counter.ts`

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCountStore = defineStore('count', () => {
  const count = ref(0)
  const increment = () => {
    count.value++
  }
  return { count, increment }
})

```

**使用`store`**

```vue
<script setup lang="ts">
import { useCountStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const store = useCountStore()
// 解构写法
const { count } = storeToRefs(store)
const { increment } = store
</script>

<template>
  <div class="div" @click="increment">
    home: {{count}}
  </div>
</template>

// 直接访问写法
<!--<template>-->
<!--  <div class="div" @click="store.increment">-->
<!--    home: {{store.count}}-->
<!--  </div>-->
<!--</template>-->

<style scoped>

</style>
```

