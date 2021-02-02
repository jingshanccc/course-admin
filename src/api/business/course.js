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

export function findContent(id) {
  return request({
    url: '/admin/course/find-content',
    method: 'get',
    params: {
      Str: id
    }
  })
}

export function saveContent(id, content) {
  return request({
    url: '/admin/course/save-content',
    method: 'post',
    data: {
      id: id,
      content: content
    }
  })
}

export default { add, edit, del }
