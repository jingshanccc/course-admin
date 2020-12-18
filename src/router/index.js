import route from './router'
import store from '@/store'
import Setting from '@/settings'
import { getAsyncRouter } from '@/store/modules/permission'
import { getToken } from '@/utils/auth'
import { buildMenus } from '@/api/system/menu'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style

NProgress.configure({ showSpinner: false })// NProgress Configuration

// 不需要登录的路径
const whiteList = ['/login']
route.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + ' - ' + Setting.title
  }
  NProgress.start()
  // 判断是否登录
  if (getToken()) {
    // 已登录但访问链接为/login
    if (to.path === '/login') {
      next({
        path: '/'
      })
      NProgress.done()
    } else {
      if (!store.getters.userInfo.id) { // 证明vuex数据丢失 可能是页面刷新等原因 因此需要重新加载菜单
        store.dispatch('UserInfo')
        loadMenus(next, to)
      } else if (store.getters.loadMenus) { // 首次登录
        store.dispatch('updateLoadMenus')
        loadMenus(next, to)
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`)
      NProgress.done()
    }
  }
})

export const loadMenus = (next, to) => {
  buildMenus().then(res => {
    const asyncRouter = getAsyncRouter(res.content.rows)
    asyncRouter.push({
      path: '*',
      redirect: '/404',
      hidden: true
    })
    store.dispatch('GenerateRoutes', asyncRouter).then(() => {
      route.addRoutes(asyncRouter)
      next({ ...to, replace: true })
    })
  })
}

route.afterEach(() => {
  NProgress.done() // finish progress bar
})
