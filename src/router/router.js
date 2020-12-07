import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const routerMap = [
    {
        path: '/login',
        meta: { title: '登录', noCache: true},
        component: (resolve) => require(['@/views/login.vue'], resolve),
        hidden: true //用来控制是否显示在sidebar
    },
    {
        path: '/',
        meta: { title: '主页', noCache: true},
        component: (resolve) => require(['@/views/index.vue'], resolve),
        hidden: true //用来控制是否显示在sidebar
    }
]

export default new Router({
    mode: 'history',
    routes: routerMap
})

