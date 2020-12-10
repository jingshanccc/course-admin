import request from '@/utils/request'

/**
 * 登录
 */
export function login(loginUser) {
  return request({
    url: '/user/login',
    method: 'post',
    data: loginUser
  })
}

/**
 * 获取图形验证码
 */
export function getImgCode() {
  return request({
    url: '/captcha/image-code',
    method: 'get'
  })
}

/**
 * 退出
 */
export function logout(token) {
  return request({
    url: '/user/logout',
    method: 'get',
    data: {
      Str: token
    }
  })
}
