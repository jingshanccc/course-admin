<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span v-if="item.redirect === 'noredirect' || index === levelList.length-1" class="no-redirect">{{ item.meta.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
// import pathToRegexp from 'path-to-regexp'
const { pathToRegexp } = require('path-to-regexp')
export default {
  data() {
    return {
      levelList: null
    }
  },
  watch: {
    $route(route) {
      // 如果当前路由需要重定向 则不更新面包屑
      if (route.path.startsWith('/redirect')) {
        return
      }
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    getBreadcrumb() {
      // 拥有标题的才能展示
      let matched = this.$route.matched.filter(v => v.meta && v.meta.title)
      const first = matched[0]
      if (!this.isDashboard(first)) {
        matched = [{ path: '/dashboard', meta: { title: '首页' }}].concat(matched)
      }
      this.levelList = matched.filter(v => v.meta && v.meta.title && v.meta.breadcrumb !== false)
    },
    isDashboard(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase()
    },
    handleLink(item) {
      const { redirect, path } = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      this.$router.push(this.pathCompile(path))
    },
    pathCompile(path) {
      const { params } = this.$route
      const toPath = pathToRegexp.compile(path)
      return toPath(params)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
    display: inline-block;
    font-size: 14px;
    line-height: 50px;
    margin-left: 8px;
    .no-redirect {
        color: #97a8be;
        cursor: text;
    }
}
</style>
