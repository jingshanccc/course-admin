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

// 获取权限树 以一个节点获取分支
export function getMenuTree(pid) {
  return request({
    url: '/admin/resource/load-tree',
    method: 'get',
    params: {
      Id: pid
    }
  })
}

// 获取子权限 ID
export function getMenuChild(id) {
  return request({
    url: '/admin/resource/child',
    method: 'get',
    params: {
      Id: id
    }
  })
}
