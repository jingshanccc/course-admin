import request from '@/utils/request'

export function add(data) {
  return request({
    url: '/admin/section',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/admin/section',
    method: 'put',
    data
  })
}

export function del(ids) {
  return request({
    url: '/admin/section',
    method: 'delete',
    data: {
      rows: ids
    }
  })
}

export default { add, edit, del }
