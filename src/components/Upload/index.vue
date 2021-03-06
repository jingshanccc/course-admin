<template>
  <div>
    <el-button type="success" round @click="selectFile()">
      <el-icon class="el-icon-upload" />
      {{ text }}
    </el-button>
    <input :id="inputId+'-input'" ref="file" type="file" style="display: none" @change="handleFileChange">
    <el-dialog
      title="上传进度"
      :visible.sync="progressShow"
      width="40%"
      :show-close="false"
      :close-on-click-modal="false"
      append-to-body
      style="text-align: center"
    >
      <el-card v-loading="status === Status.merge" element-loading-text="正在合并文件" element-loading-spinner="el-icon-loading">
        <div style="display: inline-block">
          <div>计算文件 hash</div>
          <el-progress type="dashboard" :percentage="hashPercentage" />
        </div>
        <div style="display: inline-block">
          <div>总进度</div>
          <el-progress type="dashboard" :percentage="fakeUploadPercentage" />
        </div>
        <div>
          <el-button
            v-if="status === Status.pause"
            @click="handleResume"
          >恢复</el-button>
          <el-button
            v-else
            :disabled="status !== Status.uploading || !container.hash"
            @click="handlePause"
          >暂停</el-button>
          <el-button
            @click="handleCancel"
          >取消</el-button>
        </div>
      </el-card>
    </el-dialog>
  </div>
</template>
<script>
import HashWorker from './hash.worker'
import fileUpload from '@/api/file/file'

// 上传状态枚举
const Status = {
  wait: 'wait', // 默认-等待上传
  pause: 'pause',
  uploading: 'uploading',
  merge: 'merge'
}

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
      default: 3 * 1024 * 1024
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
  data: () => {
    return {
      Status,
      status: Status.wait,
      container: {
        worker: null,
        file: null,
        hash: ''
      },
      fileInfo: {
        name: '',
        key: '',
        suffix: '',
        size: 0,
        shardTotal: 0
      },
      uploadParams: [], // 上传分片方法的请求参数 [fileDto] 列表
      hashPercentage: 0,
      // 当暂停会取消请求导致进度条后退 所以需要一个假的进度
      fakeUploadPercentage: 0,
      progressShow: false,
      cancelTokens: [], // 存放取消请求的token
      canMerge: false
    }
  },
  computed: {
    uploadPercentage() {
      if (!this.container.file || !this.uploadParams.length) return 0
      const loaded = this.uploadParams
        .map(item => item.size * item.percentage)
        .reduce((acc, cur) => acc + cur)
      return parseInt((loaded / this.container.file.size).toFixed(2))
    }
  },
  watch: {
    uploadPercentage(now) {
      if (now > this.fakeUploadPercentage) {
        this.fakeUploadPercentage = now
      }
    },
    canMerge(cur) {
      if (cur) {
        console.log('进入 merge')
        this.merge()
      }
    }
  },
  methods: {
    // 暂停上传
    handlePause() {
      this.status = Status.pause
      this.resetData()
    },
    // 重置页面数据
    resetData() {
      // 利用 axios 请求的 cancelToken 来停止未完成的上传请求
      this.cancelTokens.forEach(source => source.cancel('cancel upload'))
      this.cancelTokens = []
      if (this.container.worker) {
        this.container.worker.onmessage = null
      }
    },
    // 恢复上传
    async handleResume() {
      this.status = Status.uploading
      const { uploadedList } = await this.verifyUpload(this.container.hash)
      await this.uploadChunks(uploadedList)
    },
    // 取消上传
    handleCancel() {
      // 如果正在计算 hash 则中止 hash 计算过程
      if (!this.container.hash) {
        this.container.worker.terminate()
      } else {
        // 如果正在上传 则先暂停
        if (this.status === Status.uploading) {
          this.status = Status.pause
        }
        fileUpload.cancel(this.container.hash)
      }
      this.resetData()
      this.$message({
        message: '文件上传已取消！',
        type: 'success'
      })
      this.clearFileInput()
    },
    // 构造上传分片请求
    uploadRequest(param, onProgress = e => e, source) {
      return new Promise((resolve, reject) => {
        fileUpload.uploadShard(param, onProgress, source).then((res) => {
          resolve(res)
        }).catch(() => { reject() })
      })
    },
    // 计算文件 hash (web worker)
    calculateHash(fileChunkList) {
      return new Promise(resolve => {
        this.container.worker = new HashWorker()
        this.container.worker.postMessage({ fileChunkList })
        this.container.worker.onmessage = e => {
          const { percentage, hash } = e.data
          this.hashPercentage = percentage
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    // 获取文件分片
    createFileChunkList(file) {
      const fileChunkList = []
      let cur = 0
      while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + this.shardSize) })
        cur += this.shardSize
      }
      return fileChunkList
    },
    // 文件输入框监听事件
    handleFileChange(e) {
      const [file] = e.target.files
      if (!file) return
      this.resetData()
      // 还原 vue 组件的data为原始状态
      Object.assign(this.$data, this.$options.data())
      this.container.file = file

      // 设置文件信息 后缀 文件名 文件大小 文件hash 分片总数
      const suffixes = this.suffixes
      const fileName = file.name
      this.fileInfo.name = fileName
      // 判断文件类型
      const suffix = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length).toLowerCase()
      let validateSuffix = false
      for (let i = 0; i < suffixes.length; i++) {
        if (suffixes[i].toLowerCase() === suffix) {
          validateSuffix = true
          break
        }
      }
      if (!validateSuffix) {
        this.$message({
          message: '文件格式不正确！只支持上传：' + suffixes.join(','),
          type: 'warning'
        })
        return
      }
      this.fileInfo.suffix = suffix
      this.fileInfo.size = file.size
      this.fileInfo.shardTotal = Math.ceil(file.size / this.shardSize)
      console.log('分片数：' + this.fileInfo.shardTotal)
      this.handleUpload()
    },
    // 上传
    async handleUpload() {
      if (!this.container.file) return
      this.status = Status.uploading
      this.progressShow = true
      const fileChunkList = this.createFileChunkList(this.container.file)
      this.container.hash = await this.calculateHash(fileChunkList)
      this.fileInfo.key = this.container.hash
      // 判断是否已上传
      // 若已全部上传成功 则显示文件秒传成功 否则获取服务端返回的已上传分片列表uploadedList
      const { shouldUpload, uploadedList, file } = await this.verifyUpload(this.container.hash)
      if (!shouldUpload) {
        // 已上传分片 = 分片总数，说明已全部上传完，不需要再上传
        this.$message({
          message: '文件极速秒传成功！',
          type: 'success'
        })
        this.clearFileInput()
        this.afterUpload(file)
        return
      }
      this.uploadParams = fileChunkList.map(({ file }, index) => ({
        key: this.container.hash,
        index,
        size: file.size,
        total: this.fileInfo.shardTotal,
        blob: file,
        percentage: 0
      }))
      await this.uploadChunks(uploadedList)
    },
    // 上传分片
    async uploadChunks(uploadedList = []) {
      const requestList = this.uploadParams
        .filter(({ index }) => !uploadedList.includes(index))
        .map(({ blob, key, size, total, index }) => {
          const formData = new FormData()
          formData.append('blob', blob)
          formData.append('key', key)
          formData.append('size', size)
          formData.append('total', total)
          formData.append('index', index)
          const source = this.axios.CancelToken.source()
          this.cancelTokens.push(source)
          return { formData, index, source }
        })
        .map(async({ formData, index, source }) => {
          this.uploadRequest(formData, this.createProgressHandler(this.uploadParams[index]), source).then(res => {
            const curIndex = this.cancelTokens.findIndex((cancelToken) => cancelToken === source)
            this.cancelTokens.splice(curIndex, 1)
            if (res.content.is) { // 可合并
              this.canMerge = true
            }
          }).catch(() => {})
        })
      await Promise.all(requestList)
    },
    // 检查文件状态，是否已上传过？传到第几个分片？
    async verifyUpload(fileHash) {
      return await fileUpload.verifyUpload(fileHash).then((res) => {
        return res.content
      })
    },
    // 合并分片
    async merge() {
      this.status = Status.merge
      await fileUpload.merge(this.fileInfo).then(res => {
        this.$message({
          message: '文件上传成功！',
          type: 'success'
        })
        this.clearFileInput()
        this.afterUpload(res.content)
      })
    },
    // 用闭包保存每个分片的进度
    createProgressHandler(item) {
      return e => {
        item.percentage = parseInt(String((e.loaded / e.total) * 100))
      }
    },

    selectFile() {
      this.$refs.file.click()
    },
    // 清除文件输入框内容
    clearFileInput() {
      this.status = Status.wait
      this.progressShow = false
      document.getElementById(this.inputId + '-input').value = null
    }
  }
}
</script>
