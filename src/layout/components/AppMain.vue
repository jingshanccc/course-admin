<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
    <!--  底部文字和备案号  -->
    <div v-if="$store.state.settings.showFooter" id="course-main-footer">
      <span v-html="$store.state.settings.footerText" />
      <span> ⋅ </span>
      <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">{{ $store.state.settings.caseNumber }}</a>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
    min-height: calc(100vh - 50px); // 50是顶栏navbar的高度
    width: 100%;
    position: relative;
    overflow: hidden;
} //E+F 相邻选择符(Adjacent sibling combinator) 选择紧贴在E元素之后F元素。
.fixed-header+.app-main {
    padding-top: 50px;
}

.hasTagsView {
    .app-main {
        min-height: calc(100vh - 84px); //34是面包屑的高度
    }
    .fixed-header+.app-main {
        padding-top: 84px;
    }
} //fix css style bug in open el-dialog
.el-popup-parent--hidden {
    .fixed-header {
        padding-right: 15px;
    }
}
</style>
