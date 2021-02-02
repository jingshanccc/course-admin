<template>
  <div class="app-container">
    <p class="course-name">
      <el-button icon="el-icon-back" circle @click="$router.push({ name: 'Course' })" />
      {{ course.name }}
    </p>
    <p class="save-content-label">
      {{ saveContentLabel }}
    </p>
    <mavon-editor ref="md" v-model="content" :style="'height:' + height" @imgAdd="imgAdd" @save="saveContent" />
  </div>
</template>
<script>
import Cookies from 'js-cookie'
import { upload } from '@/api/file/file'
import { findContent, saveContent } from '@/api/business/course'
import { hex_md5 } from '@/utils/md5'
import { tenTo62 } from '@/utils'

export default {
  data() {
    return {
      course: {},
      content: '',
      height: document.documentElement.clientHeight - 200 + 'px',
      saveContentLabel: '',
      saveContentInterval: {}
    }
  },
  mounted() {
    const _this = this
    window.onresize = () => {
      _this.height = document.documentElement.clientHeight - 200 + 'px'
    }

    const course = JSON.parse(Cookies.get('currentCourse')) || {}
    if (course === {}) {
      _this.$router.push('/')
    }
    _this.course = course
    // 获取课程内容
    findContent(this.course.id).then(res => {
      if (res.success) {
        _this.content = res.content.Content
      } else {
        _this.$message.error(res.message)
      }
    })
    // 定时自动保存
    // _this.saveContentInterval = setInterval(function() {
    //   _this.saveContent()
    // }, 10000)
  },
  destroyed: function() {
    const _this = this
    clearInterval(_this.saveContentInterval)
  },
  methods: {
    imgAdd(pos, $file) {
      let url = $file.name
      // 生成文件标识，标识多次上传的是不是同一个文件
      const key = hex_md5($file.name + $file.size + $file.type + 'course')
      const key10 = parseInt(key, 16)
      const key62 = tenTo62(key10)
      const reader = new FileReader()
      reader.readAsDataURL($file)
      reader.onload = function(e) {
        const param = {
          'shardIndex': 1,
          'shardSize': $file.size,
          'shardTotal': 1,
          'name': $file.name,
          'suffix': $file.name.substring($file.name.lastIndexOf('.') + 1, $file.name.length).toLowerCase(),
          'size': $file.size,
          'key': key62,
          'shard': e.target.result
        }
        upload(param).then(res => {
          if (res.success) {
            url = res.content.path
            console.log(url)
          } else {
            this.$message({
              message: '文件上传失败，请重试',
              type: 'warning'
            })
          }
        })
      }
      console.log(url)
      this.$refs.md.$img2Url(pos, url)
    },
    saveContent() {
      saveContent(this.course.id, this.content).then(res => {
        if (res.success) {
          this.saveContentLabel = '最后保存于 ' + (new Date()).strftime('%H:%M:%S', 'zh')
        } else {
          this.$message.error(res.message)
        }
      })
    }
  }
}
</script>
<style scoped>
.course-name{
  display: inline-block;
}
.save-content-label{
  display: inline;
  margin-left: 20px;
  font-size: 12px;
  color: #97a8be;
}
</style>
