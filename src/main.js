import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN'

// 导入测试数据加载工具
import { loadTestDataIfEmpty } from './utils/testDataLoader'

Vue.use(ElementUI, { locale })

Vue.config.productionTip = false

// 创建Vue实例之前加载测试数据
if (process.env.NODE_ENV === 'development') {
  // 仅在开发环境下加载测试数据
  loadTestDataIfEmpty(store)
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
