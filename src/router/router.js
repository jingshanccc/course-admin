import Vue from 'vue'
import Router from 'vue-router'
import Layout from '../layout/index'

Vue.use(Router)

export const routerMap = [{
  path: '/login',
  meta: {
    title: '登录',
    noCache: true
  },
  component: (resolve) => require(['@/views/login'], resolve),
  hidden: true // 用来控制是否显示在sidebar
},
{
  path: '/',
  component: Layout,
  redirect: '/dashboard',
  children: [
    {
      name: 'Dashboard',
      path: '/dashboard',
      meta: {
        title: '主页',
        icon: 'index',
        noCache: true
      },
      component: (resolve) => require(['@/views/home'], resolve)
    }
  ]

}
]

export default new Router({
  mode: 'history',
  routes: routerMap
})
