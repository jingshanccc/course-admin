import { encrypt } from '@/utils/rsa'
import request from '@/utils/request'

export function updatePass(user) {
  const data = {
    oldPass: encrypt(user.oldPass),
    newPass: encrypt(user.newPass)
  }
  return request({
    url: '/admin/user/save-password',
    method: 'post',
    data
  })
}

export function updateEmail(form) {
  const data = {
    pass: encrypt(form.pass),
    email: form.email,
    code: form.code
  }
  return request({
    url: '/admin/user/update-email',
    method: 'post',
    data
  })
}

export function sendEmailCode(email) {
  return request({
    url: '/admin/user/email-code?email=' + email,
    method: 'get'
  })
}

export function editUser(data) {
  return request({
    url: '/admin/user/save',
    method: 'post',
    data
  })
}
