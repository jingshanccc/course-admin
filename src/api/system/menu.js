import request from '@/utils/request'
/**
 * 加载侧边栏菜单
 */
export function buildMenus() {
  return request({
    url: '/admin/resource/load-menus',
    method: 'GET'
  })
}
