import {getToken} from "@/utils/auth";
import {login} from "@/api/login";
import {removeToken, setToken} from "@/utils/auth";
import {logout} from "@/api/login";
import { Notification } from "element-ui";

const user = {
    state: {
        token: getToken(),
        user: {}
    },
    mutations: {
        SET_TOKEN: (state, token) => {
            state.token = token
        },
        SET_USER: (state, user) => {
            state.user = user
        },
    },
    actions: {
        Login({ commit }, loginUser) {
            return new Promise((resolve, reject) => {
                login(loginUser).then(res => {
                    if (res.success){
                        setToken(res.content.token)
                        commit('SET_TOKEN', res.content.token)
                        resolve()
                    }else {
                        Notification.error({
                            title: '登陆失败',
                            message: res.message,
                            duration: 5000
                        })
                        reject()
                    }
                }).catch(err => {
                    reject(err)
                })
            })
        },

        Logout({ commit }) {
            return new Promise((resolve, reject) => {
                logout(getToken()).then(res => {
                    console.log('退出成功：'+res)
                    DoLogout(commit)
                    resolve()
                }).catch(err => {
                    DoLogout(commit)
                    reject(err)
                })
            })
        }
    }
}

export const DoLogout = (commit) => {
    commit('SET_TOKEN', '')
    removeToken()
}

export default user