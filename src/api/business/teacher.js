import request from '@/utils/request'

export function allTeacher() {
  return request({
    url: '/admin/teacher/all',
    method: 'get'
  })
}

export function searchTeacher(name) {
  return request({
    url: '/admin/teacher/search',
    method: 'get',
    params: { Str: name }
  })
}

export function add(data) {
  return request({
    url: '/admin/teacher',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/admin/teacher',
    method: 'put',
    data
  })
}

export function del(ids) {
  return request({
    url: '/admin/teacher',
    method: 'delete',
    data: {
      rows: ids
    }
  })
}

export default { add, edit, del, allTeacher, searchTeacher }
