import Cookies from 'js-cookie'
import Setting from '@/settings'

const TokenKey = Setting.TokenKey
const RefreshTokenKey = Setting.RefreshTokenKey

export function getToken() {
  return Cookies.get(TokenKey)
}

export function getRefreshToken() {
  return Cookies.get(RefreshTokenKey)
}

export function setToken(token, refreshToken, rememberMe) {
  if (rememberMe) {
    Cookies.set(TokenKey, token, { expire: Setting.tokenCookieExpires })
    Cookies.set(RefreshTokenKey, refreshToken, { expire: Setting.tokenCookieExpires })
  } else {
    Cookies.set(TokenKey, token)
    Cookies.set(RefreshTokenKey, refreshToken)
  }
}

export function removeToken() {
  Cookies.remove(TokenKey)
  Cookies.remove(RefreshTokenKey)
}
