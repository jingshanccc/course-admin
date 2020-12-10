<template>
  <div :class="{'show': show}" class="header-search">
    <svg-icon class-name="search-icon" icon-class="search" @click.stop="click" />
    <el-select ref="headerSearchSelect" v-model="search" :remote-method="querySearch" filterable default-first-option remote placeholder="Search" class="header-search-select" @change="change">
      <el-option v-for="item in options" :key="item.path" :value="item" :label="item.title.join(' / ')" />
    </el-select>
  </div>
</template>

<script>
import Fuse from 'fuse.js'
import path from 'path'

export default {
  name: 'HeaderSearch',
  data() {
    return {
      search: '',
      options: [],
      searchPool: [],
      show: false,
      fuse: undefined
    }
  },
  computed: {
    routes() {
      return this.$store.state.permissions.routers
    }
  },
  watch: {
    routes() {
      this.searchPool = this.generateRoutes(this.routes)
    },
    searchPool(list) {
      this.initFuse(list)
    },
    show(value) {
      if (value) {
        document.body.addEventListener('click', this.close)
      } else {
        document.body.removeEventListener('click', this.close)
      }
    }
  },
  methods: {
    // 从所有路由中过滤出能够被展示在侧边栏的菜单
    generateRoutes(routes, basePath = '/', prefixTitle = []) {
      let res = []
      for (const route of routes) {
        const data = {
          path: path.resolve(basePath, route.path),
          title: [...prefixTitle]
        }
        // 拥有标题并且不是重定向路由
        if (route.meta && route.meta.title) {
          data.title = [...data.title, route.meta.title]
          if (route.redirect !== 'noRedirect') {
            res.push(data)
          }
        }
        // 递归添加子路由
        if (route.children) {
          const childRoutes = this.generateRoutes(route.children, data.path, data.title)
          if (childRoutes.length > 0) {
            res = [...res, ...childRoutes]
          }
        }
      }
      return res
    },

    // 初始化模糊搜索工具
    initFuse(list) {
      this.fuse = new Fuse(list, {
        shouldSort: true, // 是否将搜索结果排序
        threshold: 0.4, // 模糊搜索匹配阈值， 0.0为精确匹配，1.0将匹配所有
        location: 0, // 确定输入的关键词在文本的大概位置
        distance: 100, // 设定和location的距离，和threshold相乘获得搜索的长度范围
        minMatchCharLength: 1, // 最小应匹配多少个字符
        keys: [{ // 将搜索的关键词列表
          name: 'title',
          weight: 0.7
        }, {
          name: 'path',
          weight: 0.3
        }]
      })
    },
    // 点击搜索栏
    click() {
      this.show = !this.show
      if (this.show) {
        this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.focus()
      }
    },
    // 搜索栏收起
    close() {
      this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.blur()
      this.options = []
      this.show = false
    },

    /**
         * 选择某个搜索结果
         * @param val
         */
    change(val) {
      this.$router.push(val.path)
      this.search = ''
      this.options = []
      this.$nextTick(() => {
        this.show = false
      })
    },
    /**
         * 搜索
         * @param query 输入的关键词
         */
    querySearch(query) {
      if (query !== '') {
        this.options = this.fuse.search(query)
      } else {
        this.options = []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.header-search {
    font-size: 0 !important;
    .search-icon {
        cursor: pointer;
        font-size: 18px;
        vertical-align: middle;
    }
    .header-search-select {
        font-size: 18px;
        transition: width 0.2s;
        width: 0;
        overflow: hidden;
        background: transparent;
        border-radius: 0;
        display: inline-block;
        vertical-align: middle;
    }
    ::v-deep .el-input__inner {
        border-radius: 0;
        border: 0;
        padding-left: 0;
        padding-right: 0;
        box-shadow: none !important;
        border-bottom: 1px solid #d9d9d9;
        vertical-align: middle;
    }
    &.show {
        .header-search-select {
            width: 210px;
            margin-left: 10px;
        }
    }
}
</style>
