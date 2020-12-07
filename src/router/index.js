import route from './router'
import Setting from '@/settings'
import {getToken} from "@/utils/auth";

// 不需要登录的路径
const whiteList = ['/login']
route.beforeEach((to, from, next) => {
    if (to.meta.title){
        document.title = to.meta.title + ' - ' + Setting.title
    }
    //判断是否登录
    if (getToken()){
        //已登录但访问链接为/login
        if(to.path === '/login') {
            next( { path: '/'} )
        }else {
            next()
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1){
            next()
        } else {
            next(`/login?redirect=${to.fullPath}'}`)
        }
    }
})