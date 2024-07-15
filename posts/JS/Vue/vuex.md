## 配置

`npm i vuex@3`



**定义vuex**

`store/index.js`

```js
import Vue from "vue";
import vuex from 'vuex'

Vue.use(vuex)

export default new vuex.Store({
    state: {
        list: [
            {
                id: 1,
                name: "手机"
            },
            {
                id: 2,
                name: "手表"
            },
            {
                id: 3,
                name: "衣服"
            },
        ],
        shop_car: []
    },
    mutations: {
        add(state, good) {
            state.shop_car.push(good)
            alert("添加成功")
        },
        remove(state,id){
            state.shop_car = state.shop_car.filter(g => g.id!==id)
            alert("移除成功")
        }
    }

})
```

> state的数据必须通过计算属性获取



**使用数据**

```js
  computed: {
    goods() {
      return this.$store.state.list
    }
  }
```

**触发mutation**

```js
  methods: {
    buy(good) {
      this.$store.commit('add', good)
    }
  },
```

