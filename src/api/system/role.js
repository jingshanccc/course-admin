import request from '@/utils/request'

export function roleList() {
  return request({
    url: '/admin/role/all',
    method: 'get'
  })
}

export function roleLevel() {
  return request({
    url: '/admin/role/level',
    method: 'get'
  })
}

export function get(id) {
  return request({
    url: '/admin/role/find?Str=' + id,
    method: 'get'
  })
}

export function edit(data) {
  return add(data)
}

export function add(data) {
  return request({
    url: '/admin/role/save',
    method: 'post',
    data
  })
}
export function del(ids) {
  return request({
    url: '/admin/role/delete',
    method: 'delete',
    data: {
      rows: ids
    }
  })
}
export function editMenu(data) {
  return request({
    url: '/admin/role/save-resource',
    method: 'post',
    data
  })
}

export default { edit, del, add, get, editMenu, roleLevel }
