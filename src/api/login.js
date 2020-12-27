import request from '@/utils/request'

/**
 * oauth获取授权码
 */
export function authorize(loginUser) {
  return request({
    url: '/oauth/authorize',
    method: 'get',
    params: {
      'response_type': 'code',
      'client_id': process.env.VUE_APP_CLIENT_ID,
      'scope': 'admin',
      'redirect_uri': process.env.VUE_APP_BASE_API + 'oauth/redirect',
      // 'state': '' 自定义值 可防伪造攻击
      'state': process.env.VUE_APP_CLIENT_ID,
      'id': loginUser.id,
      'name': loginUser.name,
      'password': loginUser.password,
      'login_name': loginUser.login_name
    }
  })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request({
    url: '/admin/user/info',
    method: 'POST'
  })
}

/**
 * 登录
 */
export function login(loginUser) {
  return request({
    url: '/admin/user/login',
    method: 'post',
    data: loginUser
  })
}

/**
 * 获取图形验证码
 */
export function getImgCode() {
  return request({
    url: '/oauth/captcha/image-code',
    method: 'get'
  })
}

/**
 * 退出
 */
export function logout(token, refreshToken) {
  return request({
    url: '/oauth/logout',
    method: 'get',
    params: {
      Str: token + '$' + refreshToken
    }
  })
}
