import request from '@/utils/request'
import qs from 'qs'

export function initData(url, data) {
  return request({
    url: url,
    method: 'post',
    data
  })
}

export function download(url, data) {
  return request({
    url: url + '?' + qs.stringify(data, { indices: false }),
    method: 'get',
    responseType: 'blob'
  })
}
