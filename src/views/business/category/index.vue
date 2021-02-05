<template>
  <div class="app-container">
    <!-- 表单 -->
    <!-- eslint-disable-next-line -->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="580px">
      <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" style="width: 178px" placeholder="请输入分类名字" />
        </el-form-item>
        <el-form-item label="分类排序" prop="sort">
          <el-input-number v-model.number="form.sort" :min="0" :max="999" controls-position="right" style="width: 178px" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <!-- 工具栏 -->
          <div class="head-container">
            <div v-if="crud.props.searchToggle">
              <!-- 搜索 -->
              <el-input v-model="query.blurry" clearable size="small" placeholder="按名称搜索" style="width: 200px" class="filter-item" @keyup.enter.native="crud.toQuery" />
              <search-reset />
            </div>
            <operation :permission="permission" />
          </div>
          <!-- 表格 -->
          <el-table
            ref="table"
            v-loading="crud.loading"
            :data="crud.data"
            highlight-current-row
            style="width: 100%"
            @selection-change="crud.selectionChangeHandler"
            @current-change="currentChangeHandler"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column :show-overflow-tooltip="true" prop="name" label="名称" />
            <el-table-column prop="sort" label="排序" />
            <el-table-column v-permission="['admin', 'category:edit','category:del']" label="操作" width="130px" align="center" fixed="right">
              <template slot-scope="scope">
                <row-operation :data="scope.row" :permission="permission" />
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页组件 -->
          <pagination />
        </el-card>
      </el-col>
      <!-- 分类详情表格 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>分类详情</span>
            <el-button
              v-if="checkPermission(['admin', 'category:add']) && this.$refs.categoryDetail && this.$refs.categoryDetail.parentName"
              class="filter-item"
              size="mini"
              style="float: right;padding: 4px 10px"
              type="primary"
              icon="el-icon-plus"
              @click="$refs.categoryDetail && $refs.categoryDetail.crud.toAdd()"
            >
              新增
            </el-button>
          </div>
          <category-detail ref="categoryDetail" :permission="permission" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import crudCategory from '@/api/business/category'
import checkPermission from '@/utils/permission'
import SearchReset from '@/components/Crud/SearchReset'
import Operation from '@/components/Crud/Operation'
import RowOperation from '@/components/Crud/RowOperation'
import Pagination from '@/components/Crud/Pagination'
import CategoryDetail from './CategoryDetail'
import CRUD, { presenter, header, form, crud } from '@/components/Crud/crud'

const defaultForm = { id: null, name: null, sort: 999, parent: '00000000' }
export default {
  name: 'Category',
  components: { CategoryDetail, Pagination, RowOperation, Operation, SearchReset },
  cruds() {
    return CRUD({
      title: '分类',
      url: '/admin/category/list',
      sort: ['sort, asc'],
      crudMethod: { ...crudCategory }
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
      permission: {
        add: ['admin', 'category:add'],
        edit: ['admin', 'category:edit'],
        del: ['admin', 'category:del']
      },
      rules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入分类排序', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    checkPermission,
    currentChangeHandler(val) {
      if (val) {
        this.$refs.categoryDetail.query.parent = val.id
        this.$refs.categoryDetail.parentName = val.name
        this.$refs.categoryDetail.crud.toQuery()
      }
    }
  }
}
</script>
