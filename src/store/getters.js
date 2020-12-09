const getters = {
    sidebar: state => state.app.sidebar,
    device: state => state.app.device,
    user: state => state.user.user,
    baseApi: state => state.api.baseApi,
    size: state => state.app.size
}

export default getters