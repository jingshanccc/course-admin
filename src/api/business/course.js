import request from '@/utils/request'

export function add(data) {
  return request({
    url: '/admin/course',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/admin/course',
    method: 'put',
    data
  })
}

export function del(ids) {
  return request({
    url: '/admin/course',
    method: 'delete',
    data: {
      rows: ids
    }
  })
}

export default { add, edit, del }
