import Cookies from 'js-cookie'
import Setting from '@/settings'

const TokenKey = Setting.TokenKey

export function getToken(){
    return Cookies.get(TokenKey)
}

export function setToken(token, remeberMe) {
    if (remeberMe) {
        Cookies.set(TokenKey, token, { expire: Setting.tokenCookieExpires})
    } else {
        Cookies.set(TokenKey, token)
    }
}

export function removeToken() {
    Cookies.remove(TokenKey)
}