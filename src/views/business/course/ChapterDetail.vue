<template>
  <div>
    <div v-if="query.chapterId === ''">
      <div class="my-code">点击大章查看详情</div>
    </div>
    <div v-else>
      <div class="head-container">
        <div v-if="crud.props.searchToggle">
          <el-input v-model="query.blurry" clearable size="small" placeholder="输入名称查询小节详情" style="width: 200px" class="filter-item" @keyup.enter.native="toQuery" />
          <search-reset />
        </div>
      </div>
      <!-- 表单 -->
      <!-- eslint-disable-next-line -->
      <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="所属大章" prop="chapterId">
            <el-select v-model="form.chapterId" style="width: 178px" placeholder="请选择">
              <el-option
                v-for="item in chapters"
                :key="item.name"
                :label="'第'+item.sort+'章 '+item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="序号" prop="sort">
            <el-input-number v-model.number="form.sort" :min="1" :max="999" controls-position="right" style="width: 178px" />
          </el-form-item>
          <el-form-item label="小节标题" prop="title">
            <el-input v-model="form.title" style="width: 178px" placeholder="请输入小节标题" />
          </el-form-item>
          <el-form-item label="视频" prop="video">
            <upload
              :input-id="'video-upload'"
              :text="'上传视频'"
              :suffixes="['mp4', 'avi', 'mkv']"
              :after-upload="cropUploadSuccess"
              style="display: inline; margin-right: 10px"
            />
          </el-form-item>
          <div style="text-align: center;">
            <video v-if="form.video" id="video" :src="form.video" width="100%" controls="controls">您的浏览器不支持视频播放</video>
          </div>
          <el-form-item prop="time" label="时长/秒">
            <el-input v-model.number="form.time" disabled style="width: 178px" />
          </el-form-item>
          <el-form-item label="付费" prop="charge">
            <el-radio-group v-model="form.charge">
              <el-radio label="付费">付费</el-radio>
              <el-radio label="免费">免费</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!-- 表格 -->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" highlight-current-row style="width: 100%" @selection-change="crud.selectionChangeHandler">
        <el-table-column label="小节标题" min-width="190">
          <template slot-scope="scope">
            {{ chapter.sort }}-{{ scope.row.sort }} {{ scope.row.title }}
          </template>
        </el-table-column>
        <el-table-column label="视频">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-video-play" circle @click="showVideoDialog(scope.row.video)" />
          </template>
        </el-table-column>
        <el-table-column label="时长">
          <template slot-scope="scope">
            {{ formatSecond(scope.row.time) }}
          </template>
        </el-table-column>
        <el-table-column prop="charge" label="付费" />
        <el-table-column v-permission="['admin', 'section:edit', 'section:del']" label="操作" width="130px" align="center" fixed="right">
          <template slot-scope="scope">
            <row-operation :data="scope.row" :permission="permission" />
          </template>
        </el-table-column>
      </el-table>
      <pagination />
      <el-dialog
        title="视频"
        :visible.sync="videoDialogVisible"
        width="35%"
        center
        :before-close="handleDialogClose"
      >
        <video id="video-dialog" :src="video" width="100%" controls="controls">您的浏览器不支持视频播放</video>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { all } from '@/api/business/chapter'
import crudSection from '@/api/business/section'

import { formatSecond } from '@/utils'
import Upload from '@/components/Upload'
import RowOperation from '@/components/Crud/RowOperation'
import SearchReset from '@/components/Crud/SearchReset'
import Pagination from '@/components/Crud/Pagination'
import CRUD, { presenter, header, form } from '@/components/Crud/crud'

const defaultForm = { id: null, title: null, chapterId: null, courseId: null, video: null, time: 0, charge: '免费', sort: null }
export default {
  components: { Upload, SearchReset, RowOperation, Pagination },
  mixins: [
    presenter(),
    header(),
    form(defaultForm)
  ],
  cruds() {
    return [
      CRUD({
        title: '小节',
        url: '/admin/section/list',
        query: { chapterId: '', courseId: '' },
        crudMethod: { ...crudSection },
        sort: ['sort,asc'],
        optShow: {
          add: true,
          edit: true,
          del: true,
          reset: false
        },
        queryOnPresenterCreated: false
      })
    ]
  },
  data() {
    return {
      chapters: [],
      chapter: null,
      videoDialogVisible: false,
      video: '',
      rules: {
        chapterId: [
          { required: true, message: '请选择所属大章', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '请输入小节标题', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入序号', trigger: 'blur' }
        ],
        video: [
          { required: true, message: '请上传视频', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'section:add'],
        edit: ['admin', 'section:edit'],
        del: ['admin', 'section:del']
      }
    }
  },
  methods: {
    formatSecond,
    [CRUD.HOOK.beforeToAdd](crud, form) {
      form.courseId = this.chapter.courseId
      form.chapterId = this.chapter.id
    },
    [CRUD.HOOK.beforeToCU]() {
      if (this.chapters.length === 0) {
        all(this.query.courseId).then(res => {
          if (res.success) {
            this.chapters = res.content.rows
          }
        })
      }
    },
    cropUploadSuccess(res) {
      this.crud.form.video = res.content.path
      this.getTime()
    },
    /**
     * 获取时长
     */
    getTime() {
      const _this = this
      setTimeout(function() {
        const ele = document.getElementById('video')
        _this.crud.form.time = parseInt(ele.duration, 10)
      }, 1000)
    },
    showVideoDialog(path) {
      this.video = path
      this.videoDialogVisible = true
    },
    handleDialogClose() {
      this.videoDialogVisible = false
      this.video = ''
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .el-input-number .el-input__inner {
  text-align: left;
}
</style>

