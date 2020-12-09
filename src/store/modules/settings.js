/**
 * 主页面设置的store 包括主题颜色、底部文字等
 */

import Config from '@/settings'
import variables from '@/assets/styles/element-variables.scss'
const { tagsView, fixedHeader, sidebarLogo, uniqueOpened, showFooter, footerText, caseNumber } = Config

const state = {
    theme: variables.theme,
    showSettings: false, //是否显示弹出的设置布局/tagsView的框
    tagsView: tagsView,
    fixedHeader: fixedHeader,
    sidebarLogo: sidebarLogo,
    uniqueOpened: uniqueOpened,
    showFooter: showFooter,
    footerText: footerText,
    caseNumber: caseNumber
}

const mutations = {
    CHANGE_SETTING: (state, { key, value }) => {
        if (Object.prototype.hasOwnProperty.call(state,key)) {
            state[key] = value
        }
    }
}

const actions = {
    changeSetting({commit}, data) {
        commit('CHANGE_SETTING',data)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}