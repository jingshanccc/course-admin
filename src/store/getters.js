const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  userInfo: state => state.user.userInfo,
  baseApi: state => state.api.baseApi,
  size: state => state.app.size,
  permission_routers: state => state.permission.routers,
  loadMenus: state => state.user.loadMenus,
  updateAvatarApi: state => state.api.updateAvatarApi
}

export default getters
