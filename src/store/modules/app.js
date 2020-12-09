/**
 * 主界面的store，存储侧边栏和图标大小风格
 */

import Cookies from 'js-cookie'

const state = {
    sidebar: {
        //“!!”是逻辑与的取反运算 做类型判断
        opened: Cookies.get('sidebarStatus')? !!+Cookies.get('sidebarStatus') : true,
        withoutAnimation: false
    },
    device: 'desktop',
    size: Cookies.get('size') || 'small'
}

const mutations = {
    //收起/展开侧边栏
    TOGGLE_SIDEBAR: state => {
        state.sidebar.opened = !state.sidebar.opened
        state.sidebar.withoutAnimation = false
        if (state.sidebar.opened) {
            Cookies.set('sidebarStatus', 1)
        } else {
            Cookies.set('sidebarStatus', 0)
        }
    },
    TOGGLE_DEVICE: (state, device) => {
        state.device = device
    },
    SET_SIZE: (state, size) => {
        state.size = size
        Cookies.set('size', size)
    }
}

const actions = {
    toggleSidebar( {commit} ) {
        commit('TOGGLE_SIDEBAR')
    },
    toggleDevice( {commit, device} ) {
        commit('TOGGLE_DEVICE', device)
    },
    setSize( {commit, size} ) {
        commit('SET_SIZE', size)
    },

}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}