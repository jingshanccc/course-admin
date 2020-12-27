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
