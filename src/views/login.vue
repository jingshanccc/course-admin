<template>
  <div class="login" :style="'background-image:url('+ Background + ');'">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      label-position="left"
      label-width="0px"
      class="login-form"
    >
      <h3 class="title">
        Micah在线视频课程系统
      </h3>
      <el-form-item prop="loginName">
        <el-input
          v-model="loginForm.loginName"
          type="text"
          auto-complete="off"
          placeholder="用户名"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <el-input
          v-model="loginForm.name"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" alt="code" width="100%" @click="getCode">
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0 0 25px 0;">
        记住我
      </el-checkbox>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="medium"
          type="primary"
          style="width:100%;"
          @click.native.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div v-if="$store.state.settings.showFooter" id="el-login-footer">
      <span v-html="$store.state.settings.footerTxt" />
      <span> ⋅ </span>
      <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">{{ $store.state.settings.caseNumber }}</a>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'

import Background from '@/assets/images/background.jpg'
import { getImgCode } from '@/api/login'
import { encrypt } from '@/utils/rsa'

export default {
  name: 'Login',
  data() {
    return {
      Background: Background,
      loginForm: {
        id: '', // 登录时id作为验证码token
        loginName: '',
        password: '',
        name: '', // 登录时name作为验证码
        rememberMe: false
      },
      loginRules: {
        loginName: [{ required: true, trigger: 'blur', message: '用户名不能为空' }],
        password: [{ required: true, trigger: 'blur', message: '密码不能为空' }],
        name: [{ required: true, trigger: 'blur', message: '请输入验证码' }]
      },
      loading: false,
      codeUrl: ''
    }
  },
  created() {
    // 获取验证码
    this.getCode()
    // token是否过期
    this.point()
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        const user = {
          id: this.loginForm.id,
          login_name: this.loginForm.loginName,
          code: this.loginForm.name,
          password: encrypt(this.loginForm.password)
        }
        if (valid) {
          this.loading = true
          this.$store.dispatch('Login', user).then(() => {
            this.loading = false
            this.$router.push({ path: '/' }).catch(() => { })
          }).catch(() => {
            this.loading = false
            this.getCode()
          })
        }
      })
    },
    getCode() {
      getImgCode().then(res => {
        this.loginForm.id = res.content.Id
        this.codeUrl = res.content.Base64String
      })
    },
    point() {
      const point = Cookies.get('point') !== undefined
      if (point) {
        this.$notify({
          title: '提示',
          message: '当前登录状态已过期，请重新登录！',
          type: 'warning',
          duration: 5000
        })
        Cookies.remove('point')
      }
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss">
  .login {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-size: cover;
  }

  .title {
    margin: 0 auto 30px auto;
    text-align: center;
    color: #707070;
  }

  .login-form {
    border-radius: 6px;
    background: #ffffff;
    width: 385px;
    padding: 25px 25px 5px 25px;
    .input-icon {
      height: 39px;
      width: 14px;
      margin-left: 2px;
    }

  }

  .login-code {
    width: 33%;
    display: inline-block;
    height: 38px;
    float: right;

    img {
      cursor: pointer;
      vertical-align: middle
    }

  }
</style>
