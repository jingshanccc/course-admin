import request from '@/utils/request'

export function roleList() {
  return request({
    url: '/admin/role/list',
    method: 'get'
  })
}

export function roleLevel() {
  return request({
    url: '/admin/role/level',
    method: 'get'
  })
}
