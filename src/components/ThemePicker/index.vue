<template>
  <el-color-picker v-model="theme"
                   :predefine="['#409EFF', '#1890FF', '#304156','#212121','#11A983', '#13C2C2', '#6959CD', '#F5222D']"
                   class="theme-picker"
                   popper-class="theme-picker-dropdown" />
</template>

<script>
import Cookies from 'js-cookie'

const version = require('element-ui/package.json').version
const ORIGINAL_THEME = '#409EFF'
export default {
  data() {
    return {
      chalk: '',
      theme: ''
    }
  },

  computed: {
    defaultTheme() {
      return this.$store.state.settings.theme
    }
  },
  watch: {
    defaultTheme: {
      handler: function (val, old) {
        this.theme = val
      },
      immediate: true
    },
    async theme(val) {
      Cookies.set('theme', val, { expires: 365 })
      const oldVal = this.chalk ? this.theme : Cookies.get('theme') ? Cookies.get('theme') : ORIGINAL_THEME
      if (typeof val !== 'string') {
        return
      }
      const themeCluster = this.getThemeCluster(val.replace('#',''))
      const originCluster = this.getThemeCluster(oldVal.replace('#',''))

      const getHandler = (variable, id) => {
        return () => {
          const originCluster = this.getThemeCluster(ORIGINAL_THEME.replace('#', ''))
          const newStyle = this.updateStyle(this[variable], originCluster, themeCluster)

          let styleTag = document.getElementById(id)
          if (!styleTag) {
            styleTag = document.createElement('style')
            styleTag.setAttribute('id', id)
            document.head.appendChild(styleTag)
          }
          styleTag.innerText = newStyle
        }
      }

      if (!this.chalk) {
        const url = `https://unpkg.com/element-ui@${version}/lib/theme-chalk/index.css`
        await this.getCssString(url, 'chalk')
      }

      const chalkHandler = getHandler('chalk', 'chalk-style')
      chalkHandler()

      const styles = [].slice.call(document.querySelectorAll('style'))
      .filter(style => {
        const text = style.innerText
        return new RegExp(oldVal, 'i').test(text) && !/Chalk Variables/.test(text)
      })
      styles.forEach(style => {
        const { innerText } = style
        if (typeof innerText === 'string') {
          style.innerText = this.updateStyle(innerText, originCluster, themeCluster)
        }
      })
      this.$emit('change', val)
    }
  },

  methods: {
    getThemeCluster(theme) {
      const tintColor = (color, tint) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        if (tint === 0) {
          return [red, green, blue].join(',')
        } else {
          red += Math.round(tint * (255-red))
          green += Math.round(tint * (255-green))
          blue += Math.round(tint * (255-blue))

          red = red.toString(16)
          green = green.toString(16)
          blue = blue.toString(16)

          return `#${red}${green}${blue}`
        }
      }

      const shadeColor = (color, shade) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        red = Math.round((1-shade) * red)
        green = Math.round((1-shade) * green)
        blue = Math.round((1-shade) * blue)

        red = red.toString(16)
        green = green.toString(16)
        blue = blue.toString(16)

        return `#${red}${green}${blue}`
      }

      const clusters = [theme]
      for (let i = 0; i <= 9; i++) {
        clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
      }
      clusters.push(shadeColor(theme, 0.1))

      return clusters
    },


    /**
     * 更新全局样式风格
     */
    updateStyle(style, oldCluster, newCluster) {
      let newStyle = style
      oldCluster.forEach((color, index) => {
        newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index])
      })
      return newStyle
    },
    /**
     * 获取远端的css文件 转化为字符串
     * @param url
     * @param variable
     * @returns {Promise<unknown>}
     */
    getCssString(url, variable) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            this[variable] = xhr.responseText.replace(/@font-face{[^}]+}/, '')
            resolve()
          }
        }
        xhr.open('GET', url)
        xhr.send()
      })
    }
  }
}
</script>

<style>
  .theme-message,
  .theme-picker-dropdown {
    z-index: 99999 !important;
  }
  .theme-picker .el-color-picker__trigger {
    height: 26px !important;
    width: 26px !important;
    padding: 2px;
  }
  .theme-picker-dropdown .el-color-dropdown__link-btn {
    display: none;
  }
</style>