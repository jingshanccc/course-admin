import { routerMap } from '@/router/router'
import Layout from '@/layout'
const permission = {
  state: {
    routers: routerMap,
    asyncRoutes: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.asyncRoutes = routers
      state.routers = routerMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes({ commit }, asyncRouter) {
      commit('SET_ROUTERS', asyncRouter)
    }
  }
}

// 遍历后端传来的route 构造出路由菜单以及视图
export const getAsyncRouter = (routers) => {
  if (routers && routers.length > 0) {
    return routers.filter(v => {
      // grpc默认不返回字段默认值 false、0、''
      // v.path = !v.path || v.path === '' ? '' : v.path
      v.meta = {
        noCache: v.cache ? !v.cache : true,
        icon: v.icon,
        title: v.title
      }
      v.hidden = v.hidden ? v.hidden : false
      if (v.component) {
        if (v.component === 'Layout') {
          v.component = Layout
        } else {
          const component = v.component
          v.component = loadView(component)
        }
      }
      if (v.children && v.children.length) {
        v.children = getAsyncRouter(v.children)
      }
      return true
    })
  } else {
    return []
  }
}
// 加载对应的组件视图
export const loadView = (view) => {
  return (resolve) => require([`@/views/${view}`], resolve)
}

export default permission
