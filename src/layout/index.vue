<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar class="sidebar-container" />
    <div :class="{hasTagsView:needTagsView}" class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <right-panel v-if="showSettings">
        <settings />
      </right-panel>
    </div>
    <!--  防止刷新后主题丢失  -->
    <Theme v-show="false" ref="theme" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Cookies from 'js-cookie'

import { AppMain, Navbar, Settings, Sidebar, TagsView } from './components'
import RightPanel from '@/components/RightPanel'
import Theme from '@/components/ThemePicker'
import ResizeMixin from './mixin/ResizeHandler'
export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    RightPanel,
    Settings,
    Sidebar,
    TagsView,
    Theme
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
      showSettings: state => state.settings.showSettings,
      needTagsView: state => state.settings.tagsView,
      fixedHeader: state => state.settings.fixedHeader
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  mounted() {
    if (Cookies.get('theme')) {
      this.$refs.theme.theme = Cookies.get('theme')
      this.$store.dispatch('settings/changeSetting', {
        key: 'theme',
        value: Cookies.get('theme')
      })
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/styles/mixin.scss";
@import "~@/assets/styles/variables.scss";
.app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    &.mobile.openSidebar {
        position: fixed;
        top: 0;
    }
}

.drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
}

.fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
    padding: 0;
}

.hideSidebar .fixed-header {
    width: calc(100% - 54px)
}

.mobile .fixed-header {
    width: 100%;
}
</style>
