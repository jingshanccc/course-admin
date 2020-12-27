import Vue from 'vue'
import App from './App.vue'

import Cookies from 'js-cookie'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import store from './store'
import router from './router/router'
import './router/index'

// 权限 v-permission
import permission from './components/Permission'

import './assets/icons'

// global css
import './assets/styles/index.scss'

// element组件全局size
Vue.use(Element, {
  size: Cookies.get('size') || 'small'
})
Vue.use(permission)
Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
