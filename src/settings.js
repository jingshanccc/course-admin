//通过module.exports导出一个对象，使用时通过require获取
module.exports = {
    /**
     * 网站标题
     */
    title: 'Micah在线视频管理系统',
    /**
     * token键
     */
    TokenKey: 'micah-admin-token',
    /**
     * 记住密码状态下的token在Cookie过期时间，单位天
     */
    tokenCookieExpires: 1,
    /**
     * 请求超时时间，单位毫秒，两分钟
     */
    timeout: 1200000,
    /**
     * 网站底部文字
     */
    footerText: '© 2020 Micah <a href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank">Apache License 2.0</a>',
    /**
     * 备案号
     */
    caseNumber: '粤ICP备 - 20042597号'
}