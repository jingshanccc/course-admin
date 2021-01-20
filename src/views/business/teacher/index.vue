<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :xs="15" :sm="18" :md="19" :lg="24" :xl="24">
        <!-- 工具栏 -->
        <div class="head-container">
          <div v-if="crud.props.searchToggle">
            <!-- 搜索 -->
            <el-input v-model="query.blurry" clearable size="small" placeholder="输入名称或者昵称搜索" style="width: 200px" class="filter-item" @keyup.enter.native="crud.toQuery" />
            <search-reset />
          </div>
          <operation show="" :permission="permission" />
        </div>
        <!-- 表单 -->
        <!-- eslint-disable-next-line -->
        <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="600px">
          <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="66px">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" />
            </el-form-item>
            <el-form-item label="职位" prop="position">
              <el-input v-model="form.position" />
            </el-form-item>
            <el-form-item label="头像" prop="image">
              <upload
                :input-id="'image-upload'"
                :text="'上传头像'"
                :suffixes="['jpg', 'jpeg','png']"
                :after-upload="cropUploadSuccess"
                style="display: inline; margin-right: 10px"
              />
              <div style="float: right">
                <el-image
                  v-if="form.image"
                  :src="form.image"
                  class="el-avatar"
                  :preview-src-list="previewList"
                />
              </div>
            </el-form-item>
            <el-form-item label="座右铭" prop="motto">
              <el-input v-model="form.motto" />
            </el-form-item>
            <br>
            <el-form-item label="简介" prop="intro">
              <el-input v-model="form.intro" style="width: 437px" type="textarea" autosize placeholder="请输入简介" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="text" @click="crud.cancelCU">取消</el-button>
            <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
          </div>
        </el-dialog>
        <!-- 表格 -->
        <el-row>
          <el-col v-for="(teacher, index) in crud.data" :key="teacher.id" :span="5" :offset="index > 0 ? 1 : 0" style="text-align: center">
            <el-card :body-style="{ padding: '0px' }" shadow="always">
              <el-image :src="teacher.image ? teacher.image : Avatar" fit="fill" alt="教师" style="height: 300px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0, 0, 0, .12)" :title="teacher.intro" />
              <div style="padding: 10px 14px;">
                <el-link type="primary" style="font-size: 18px; " :title="teacher.motto">{{ teacher.name }}【{{ teacher.nickname }}】</el-link>
              </div>
              <row-operation :data="teacher" :permission="permission" />
            </el-card>
          </el-col>
        </el-row>
        <!--分页组件-->
        <pagination />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import Avatar from '@/assets/images/avatar.jpg'

import crudTeacher from '@/api/business/teacher'

import CRUD, { presenter, header, form, crud } from '@/components/Crud/crud'

import { mapGetters } from 'vuex'
import Upload from '@/components/Upload'
import Operation from '@/components/Crud/Operation'
import RowOperation from '@/components/Crud/RowOperation'
import Pagination from '@/components/Crud/Pagination'
import SearchReset from '@/components/Crud/SearchReset'
const defaultForm = { id: null, nickname: null, name: null, position: null, image: null, intro: null, motto: null }

export default {
  name: 'Teacher',
  components: {
    RowOperation,
    Operation,
    SearchReset,
    Pagination,
    Upload
  },
  cruds() {
    return CRUD({
      title: '讲师',
      url: '/admin/teacher/list',
      crudMethod: { ...crudTeacher }
    })
  },
  mixins: [
    presenter(),
    header(),
    form(defaultForm),
    crud()
  ],
  data() {
    return {
      Avatar: Avatar,
      previewList: [],
      permission: {
        add: ['admin', 'teacher:add'],
        edit: ['admin', 'teacher:edit'],
        del: ['admin', 'teacher:del']
      },
      rules: {
        name: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        position: [
          { required: true, message: '请输入职位', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        motto: [
          { required: true, message: '请输入座右铭', trigger: 'blur' },
          { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        image: [
          { required: true, message: '请上传头像', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'updateAvatarApi',
      'baseApi'
    ])
  },
  methods: {
    cropUploadSuccess(res) {
      this.crud.form.image = res.content.path
      this.previewList.push(res.content.path)
    }
  }
}
</script>

