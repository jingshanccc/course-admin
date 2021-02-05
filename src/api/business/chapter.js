import request from '@/utils/request'

export function all(id) {
  return request({
    url: '/admin/chapter/all',
    method: 'get',
    params: { Str: id }
  })
}

export function add(data) {
  return request({
    url: '/admin/chapter',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/admin/chapter',
    method: 'put',
    data
  })
}

export function del(ids) {
  return request({
    url: '/admin/chapter',
    method: 'delete',
    data: {
      rows: ids
    }
  })
}

export default { add, edit, del }
