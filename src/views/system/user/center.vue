<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="5" style="margin-bottom: 10px">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <div style="text-align: center">
              <img
                :src="userInfo.avatar_path ? userInfo.avatar_path : Avatar"
                title="点击上传头像"
                class="avatar"
                alt="avatar"
              >
              <upload
                :input-id="'image-upload'"
                :text="'上传头像'"
                :suffixes="['jpg', 'jpeg','png', 'gif']"
                :after-upload="cropUploadSuccess"
              />
            </div>
            <ul class="user-info">
              <li><div style="height: 100%"><svg-icon icon-class="login" /> 登录账号<div class="user-right">{{ userInfo.login_name }}</div> </div> </li>
              <li><svg-icon icon-class="nickname" /> 用户昵称 <div class="user-right">{{ userInfo.name }}</div></li>
              <li><svg-icon icon-class="phone" /> 手机号码 <div class="user-right">{{ userInfo.phone }}</div></li>
              <li><svg-icon icon-class="email" /> 用户邮箱 <div class="user-right">{{ userInfo.email }}</div></li>
              <li>
                <svg-icon icon-class="anq" /> 安全设置
                <div class="user-right">
                  <a @click="$refs.pass.dialog = true">修改密码 </a>
                  <a @click="$refs.email.dialog = true">修改邮箱</a>
                </div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="19">
        <el-card class="box-card">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="用户资料" name="first">
              <el-form ref="form" :model="form" :rules="rules" style="margin-top: 10px" size="small" label-width="64px">
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="form.name" style="width: 35%" />
                  <span style="color: #C0C0C0; margin-left: 10px;">用户昵称不作为登录使用</span>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="form.phone" style="width: 35%" />
                  <span style="color: #C0C0C0; margin-left: 10px;">手机号码不能重复</span>
                </el-form-item>
                <el-form-item label="性别">
                  <el-radio-group v-model="form.gender" style="width: 178px">
                    <el-radio label="男">男</el-radio>
                    <el-radio label="女">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="">
                  <el-button :loading="saveLoading" size="mini" type="primary" @click="doSubmit">保存配置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
    <update-email ref="email" :email="userInfo.email" />
    <update-pass ref="pass" />
  </div>
</template>
<script>
import Avatar from '@/assets/images/avatar.gif'

import Upload from '@/components/Upload'
import UpdatePass from '@/views/system/user/center/UpdatePass'
import UpdateEmail from '@/views/system/user/center/UpdateEmail'

import { mapGetters } from 'vuex'
import store from '@/store'

import { isValidPhone } from '@/utils/validate'
import { parseTime } from '@/utils'

import { editUser } from '@/api/system/user'
export default {
  name: 'Center',
  components: {
    Upload,
    UpdateEmail,
    UpdatePass
  },
  data() {
    const validPhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入电话号码'))
      } else if (!isValidPhone(value)) {
        callback(new Error('请输入正确的11位手机号码'))
      } else {
        callback()
      }
    }
    return {
      Avatar: Avatar,
      activeName: 'first',
      saveLoading: false,
      form: {},
      rules: {
        name: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, trigger: 'blur', validator: validPhone }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'baseApi'
    ])
  },
  created() {
    this.form = { id: this.userInfo.id, name: this.userInfo.name, phone: this.userInfo.phone, gender: this.userInfo.gender }
    store.dispatch('UserInfo').then(() => {})
  },
  methods: {
    parseTime,
    handleClick(tab, event) {
      if (tab.name === 'second') {
        this.init()
      }
    },
    cropUploadSuccess(res) {
      this.userInfo.avatar_path = res.content.path
      this.userInfo.avatar_name = res.content.name
      editUser(this.userInfo).then(() => {
        // 需要更新 缓存中的userinfo
        store.dispatch('UserInfo').then(() => {})
      })
    },
    doSubmit() {
      if (this.$refs['form']) {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.saveLoading = true
            editUser(this.form).then(res => {
              if (res.success) {
                this.$notify({
                  title: '保存成功',
                  type: 'success',
                  duration: 2500
                })
                store.dispatch('UserInfo').then(() => {})
              } else {
                this.$notify({
                  title: '保存失败',
                  type: 'error',
                  message: res.message,
                  duration: 5000
                })
              }
              this.saveLoading = false
            }).catch(() => {
              this.saveLoading = false
            })
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}
.user-info {
  padding-left: 0;
  list-style: none;
  li {
    border-bottom: 1px solid #F0F3F4;
    padding: 11px 0;
    font-size: 13px;
  }
  .user-right {
    float: right;
    a{
      color: #317EF3;
    }
  }
}
</style>

