<template>
  <div class="app-container">
    <div v-if="crud.props.searchToggle">
      <el-input
        v-model="query.blurry"
        clearable
        size="small"
        placeholder="请输入名称/简介搜索"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="crud.toQuery"
      />
      <search-reset />
    </div>
    <operation :permission="permission" />
    <!-- 表单 -->
    <!-- eslint-disable-next-line -->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="600px">
      <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="66px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="封面" prop="image">
          <upload
            :input-id="'image-upload'"
            :text="'上传封面'"
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
        <el-form-item label="级别" prop="level">
          <el-select
            v-model="form.level"
            style="width: 200px"
            placeholder="请选择级别"
          >
            <el-option
              v-for="item in levels"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="付费" prop="charge">
          <el-radio-group v-model="form.charge">
            <el-radio label="付费">付费</el-radio>
            <el-radio label="免费">免费</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model.number="form.price" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="发布">发布</el-radio>
            <el-radio label="草稿">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="讲师" prop="teacherId">
          <el-select
            v-model="form.teacherId"
            placeholder="请选择讲师"
          >
            <el-option
              v-for="item in teachers"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="概述" prop="summary">
          <el-input v-model="form.summary" style="width: 437px" type="textarea" autosize placeholder="请输入课程描述" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>

    <el-row>
      <el-col v-for="course in crud.data" :key="course.id" :span="8">
        <el-card :body-style="{ padding: '0px' }" shadow="always">
          <el-image :src="course.image ? course.image : Cover" fit="contain" alt="课程封面" style="border-radius: 4px; box-shadow: 0 4px 6px rgba(0, 0, 0, .12)" />
          <div style="padding: 10px 14px;">
            <el-link type="primary" style="font-size: 18px; ">{{ course.name }}</el-link>
            <div style="float: right">
              <el-tag size="mini" effect="dark">{{ course.status }}</el-tag>
              <el-tag type="success" size="mini" effect="dark">{{ course.level }}</el-tag>
              <el-tag type="danger" size="mini" effect="dark">{{ course.charge }}</el-tag>
            </div>
          </div>
          <div v-for="teacher in teachers.filter(t=>{return t.id===course.teacherId})" :key="teacher.id" style="padding-left: 10px">
            <div style="padding-right: 10px; float: right">
              <el-tag effect="light">{{ course.price }}￥</el-tag>
              <el-tag effect="light">{{ formatSecond(course.time) }}</el-tag>
            </div>
            <el-avatar :src="teacher.image ? teacher.image : Cover" />
            <el-badge :value="teacher.position" type="warning">
              <el-tag size="big" effect="plain" style="margin-left: 10px"> {{ teacher.name }} </el-tag>
            </el-badge>
          </div>
          <div id="summary" :title="course.summary">
            {{ course.summary }}
          </div>
          <div style="padding: 0 10px">
            <el-button type="warning" circle @click="contentOrChapter('CourseChapter', course)">章节</el-button>
            <el-button type="success" circle @click="contentOrChapter('CourseContent', course)">内容</el-button>
            <row-operation :data="course" :permission="permission" style="float: right" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import Cookies from 'js-cookie'

import { allTeacher } from '@/api/business/teacher'
import crudCourse from '@/api/business/course'

import Upload from '@/components/Upload'
import Cover from '@/assets/images/background.jpg'
import { formatSecond } from '@/utils'
import SearchReset from '@/components/Crud/SearchReset'
import Operation from '@/components/Crud/Operation'
import CRUD, { form, header, presenter } from '@/components/Crud/crud'
import RowOperation from '@/components/Crud/RowOperation'

const defaultForm = { id: null, name: null, summary: null, price: 0.0, level: null, status: '草稿', image: null, charge: '免费', teacherId: null }
export default {
  components: { RowOperation, SearchReset, Operation, Upload },
  mixins: [
    presenter(),
    header(),
    form(defaultForm)
  ],
  cruds() {
    return CRUD({
      url: '/admin/course/list',
      title: '课程',
      crudMethod: { ...crudCourse }
    })
  },
  data() {
    return {
      previewList: [],
      Cover: Cover,
      teachers: [],
      permission: {
        add: ['admin', 'course:add'],
        edit: ['admin', 'course:edit'],
        del: ['admin', 'course:del']
      },
      rules: {
        name: [
          { required: true, message: '请输入课程名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        summary: [
          { required: true, message: '请输入课程描述', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入课程价格', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择级别', trigger: 'blur' }
        ],
        charge: [
          { required: true, message: '请选择是否付费', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择课程状态', trigger: 'blur' }
        ],
        teacherId: [
          { required: true, message: '请选择讲师', trigger: 'blur' }
        ],
        image: [
          { required: true, message: '请上传课程封面', trigger: 'blur' }
        ]
      },
      levels: [
        { id: 1, name: '初级' },
        { id: 2, name: '中级' },
        { id: 3, name: '高级' }
      ]
    }
  },
  mounted() {
    const _this = this
    _this.allTeacher()
  },
  methods: {
    formatSecond,
    [CRUD.HOOK.beforeToEdit](crud, form) {
      const _this = this
      _this.previewList = []
      _this.previewList.push(form.image)
    },
    allTeacher() {
      allTeacher().then(res => {
        if (res.success) {
          this.teachers = res.content.rows
        }
      })
    },
    cropUploadSuccess(data) {
      this.crud.form.image = data.path
      this.previewList = []
      this.previewList.push(data.path)
    },
    contentOrChapter(name, course) {
      Cookies.remove('currentCourse')
      Cookies.set('currentCourse', course)
      this.$router.push({ name: name })
    }
  }
}
</script>
<style scoped>
#summary{
  margin: 5px 10px;
  height: 65px;
  overflow : hidden;
  text-overflow: ellipsis;
  text-indent:2em;
  display: -webkit-box;
  -webkit-line-clamp: 3;      /* 可以显示的行数，超出部分用...表示*/
  -webkit-box-orient: vertical;
}

</style>
