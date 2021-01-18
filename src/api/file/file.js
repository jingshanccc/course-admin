import request from '@/utils/request'

export function upload(data) {
  return request({
    url: '/file/upload',
    method: 'POST',
    data
  })
}

export function check(key) {
  return request({
    url: '/file/check',
    method: 'GET',
    params: {
      Str: key
    }
  })
}

export default { upload, check }
