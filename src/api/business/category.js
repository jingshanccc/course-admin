import request from '@/utils/request'

export function all() {
  return request({
    url: '/admin/category/all',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/admin/category',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/admin/category',
    method: 'put',
    data
  })
}

export function del(ids) {
  return request({
    url: '/admin/category',
    method: 'delete',
    data: {
      rows: ids
    }
  })
}

export default { add, edit, del, all }
