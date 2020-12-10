const getters = {
    sidebar: state => state.app.sidebar,
    device: state => state.app.device,
    user: state => state.user.user,
    baseApi: state => state.api.baseApi,
    size: state => state.app.size,
    permission_routers: state => state.permission.routers
}

export default getters