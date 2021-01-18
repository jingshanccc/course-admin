<template>
  <div>
    <el-button type="success" round @click="selectFile()">
      <el-icon class="el-icon-upload" />
      {{ text }}
    </el-button>
    <input :id="inputId+'-input'" ref="file" type="file" style="display: none" @change="uploadFile()">
    <el-progress v-if="progressShow" :text-inside="true" :stroke-width="24" :percentage="percentage" status="success" />
  </div>
</template>
<script>
import { hex_md5 } from '@/utils/md5'
import { tenTo62 } from '@/utils'
import fileUpload from '@/api/file/file'
export default {
  name: 'Upload',
  props: {
    text: {
      type: String,
      default: '上传文件'
    },
    inputId: {
      type: String,
      default: 'file-upload'
    },
    suffixes: {
      type: Array,
      default: () => { return [] }
    },
    shardSize: {
      type: Number,
      default: 5 * 1024 * 1024
    },
    url: {
      type: String,
      default: 'upload'
    },
    afterUpload: {
      type: Function,
      default: null
    }
  },
  data: function() {
    return {
      progressShow: false,
      percentage: 0
    }
  },
  methods: {
    uploadFile() {
      const _this = this
      console.log(_this.$refs.file.files)
      const file = _this.$refs.file.files[0]
      console.log(file)
      /*
        name: "test.mp4"
        lastModified: 1901173357457
        lastModifiedDate: Tue May 27 2099 14:49:17 GMT+0800 (中国标准时间) {}
        webkitRelativePath: ""
        size: 37415970
        type: "video/mp4"
      */

      // 生成文件标识，标识多次上传的是不是同一个文件
      const key = hex_md5(file.name + file.size + file.type)
      const key10 = parseInt(key, 16)
      const key62 = tenTo62(key10)
      /*
        d41d8cd98f00b204e9800998ecf8427e
        2.8194976848941264e+38
        6sfSqfOwzmik4A4icMYuUe
       */

      // 判断文件格式
      const suffixes = _this.suffixes
      const fileName = file.name
      const suffix = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length).toLowerCase()
      let validateSuffix = false
      for (let i = 0; i < suffixes.length; i++) {
        if (suffixes[i].toLowerCase() === suffix) {
          validateSuffix = true
          break
        }
      }
      if (!validateSuffix) {
        _this.$message({
          message: '文件格式不正确！只支持上传：' + suffixes.join(','),
          type: 'warning'
        })
        return
      }

      // 文件分片
      // let shardSize = 10 * 1024 * 1024;    //以10MB为一个分片
      // let shardSize = 50 * 1024;    //以50KB为一个分片
      const shardSize = _this.shardSize
      const shardIndex = 1		// 分片索引，1表示第1个分片
      const size = file.size
      const shardTotal = Math.ceil(size / shardSize) // 总片数

      const param = {
        'shardIndex': shardIndex,
        'shardSize': shardSize,
        'shardTotal': shardTotal,
        'use': _this.use,
        'name': file.name,
        'suffix': suffix,
        'size': file.size,
        'key': key62
      }

      _this.check(param)
    },

    /**
     * 检查文件状态，是否已上传过？传到第几个分片？
     */
    check(param) {
      const _this = this
      fileUpload.check(param.key).then((resp) => {
        if (resp.success) {
          const obj = resp.content
          if (!obj || !obj.id) {
            param.shardIndex = 1
            console.log('没有找到文件记录，从分片1开始上传')
            _this.upload(param)
          } else if (obj.shardIndex === obj.shardTotal) {
            // 已上传分片 = 分片总数，说明已全部上传完，不需要再上传
            _this.$message({
              message: '文件极速秒传成功！',
              type: 'success'
            })
            _this.afterUpload(resp)
          } else {
            param.shardIndex = obj.shardIndex + 1
            console.log('找到文件记录，从分片' + param.shardIndex + '开始上传')
            _this.upload(param)
          }
        } else {
          _this.$message({
            message: '文件上传失败',
            type: 'warning'
          })
        }
      })
    },

    /**
     * 将分片数据转成base64进行上传
     */
    upload(param) {
      const _this = this
      const shardIndex = param.shardIndex
      const shardTotal = param.shardTotal
      const shardSize = param.shardSize
      const fileShard = _this.getFileShard(shardIndex, shardSize)
      // 将图片转为base64进行传输
      const fileReader = new FileReader()

      _this.progressShow = true
      _this.percentage = parseInt((shardIndex - 1) * 100 / shardTotal)
      fileReader.onload = function(e) {
        const base64 = e.target.result

        param.shard = base64

        fileUpload.upload(param).then((resp) => {
          if (resp.success) {
            console.log('上传文件成功：', resp)
            _this.percentage = parseInt(shardIndex * 100 / shardTotal)
            if (shardIndex < shardTotal) {
              // 上传下一个分片
              param.shardIndex = param.shardIndex + 1
              _this.upload(param)
            } else {
              _this.progressShow = false
              _this.afterUpload(resp)
            }
          } else {
            _this.$message({
              message: '文件上传失败',
              type: 'warning'
            })
            _this.progressShow = false
          }
        })
      }
      fileReader.readAsDataURL(fileShard)
    },

    getFileShard(shardIndex, shardSize) {
      const _this = this
      const file = _this.$refs.file.files[0]
      const start = (shardIndex - 1) * shardSize	// 当前分片起始位置
      const end = Math.min(file.size, start + shardSize) // 当前分片结束位置
      const fileShard = file.slice(start, end) // 从文件中截取当前的分片数据
      return fileShard
    },

    selectFile() {
      this.$refs.file.click()
    }
  }
}
</script>
