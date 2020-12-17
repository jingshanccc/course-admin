const baseUrl = process.env.VUE_APP_BASE_API
const api = {
  state: {
    baseApi: baseUrl,
    updateAvatarApi: baseUrl + '/admin/user/updateAvatar'
  }
}
export default api
