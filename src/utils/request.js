import axios from 'axios'
import Setting from '@/settings'
import { getToken } from './auth'
import { Notification } from 'element-ui'

import store from '@/store'
import Cookies from 'js-cookie'
import router from '@/router/router'

const service = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? process.env.VUE_APP_BASE_API : '/',
  timeout: Setting.timeout
})

service.interceptors.request.use(
  config => {
    if (getToken()) {
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    config.headers['Content-Type'] = 'application/json'
    return config
  },
  error => {
    Promise.reject(error)
  }
)

service.interceptors.response.use(
  res => {
    return res.data
  },
  err => {
    let code = 0
    try {
      code = err.response.status
    } catch (e) {
      if (err.toString().indexOf('Error: time out') !== -1) {
        Notification.error({
          title: '网络请求超时',
          duration: 5000
        })
      }
      return Promise.reject(err)
    }
    if (code) {
      if (code === 401) {
        store.dispatch('Logout').then(() => {
          // 用户登录界面提示
          Cookies.set('point', 401)
          location.reload()
        })
      } else if (code === 403) {
        router.push({ path: '/401' })
      } else {
        const errorMsg = err.response.data.message
        if (errorMsg !== undefined) {
          Notification.error({
            title: errorMsg,
            duration: 5000
          })
        }
      }
    } else {
      Notification.error({
        title: '接口请求失败',
        duration: 5000
      })
    }
    return Promise.reject(err)
  }
)

export default service
