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

export function getMenus(params) {
  return request({
    url: '/admin/resource/list',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function getMenuParents(ids) {
  const data = ids.length || ids.length === 0 ? ids : Array.of(ids)
  return request({
    url: '/admin/resource/parents',
    method: 'post',
    data: {
      Ids: data
    }
  })
}

export function add(data) {
  return request({
    url: '/admin/resource',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/admin/resource',
    method: 'put',
    data
  })
}

export function del(ids) {
  return request({
    url: '/admin/resource',
    method: 'delete',
    data: {
      Ids: ids
    }
  })
}

export default { add, edit, del, getMenuTree, getMenuChild, buildMenus, getMenus, getMenuParents }
