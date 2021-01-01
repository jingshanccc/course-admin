<template>
  <div>
    <div v-if="query.parent === ''">
      <div class="my-code">点击一级分类查看详情</div>
    </div>
    <div v-else>
      <div class="head-container">
        <div v-if="crud.props.searchToggle">
          <el-input v-model="query.blurry" clearable size="small" placeholder="输入名称查询分类详情" style="width: 200px" class="filter-item" @keyup.enter.native="toQuery" />
          <search-reset />
        </div>
      </div>
      <!-- 表单 -->
      <!-- eslint-disable-next-line -->
      <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="所属一级分类" prop="parent">
            <el-select v-model="form.parent" style="width: 178px" placeholder="请选择">
              <el-option
                v-for="item in categories"
                :key="item.name"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
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
      <!-- 表格 -->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" highlight-current-row style="width: 100%" @selection-change="crud.selectionChangeHandler">
        <el-table-column label="所属一级分类">
          {{ parentName }}
        </el-table-column>
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="sort" label="分类排序" />
        <el-table-column v-permission="['admin', 'category:edit', 'category:del']" label="操作" width="130px" align="center" fixed="right">
          <template slot-scope="scope">
            <row-operation :data="scope.row" :permission="permission" />
          </template>
        </el-table-column>
      </el-table>
      <pagination />
    </div>
  </div>
</template>
<script>
import crudCategory from '@/api/business/category'

import RowOperation from '@/components/Crud/RowOperation'
import SearchReset from '@/components/Crud/SearchReset'
import Pagination from '@/components/Crud/Pagination'
import CRUD, { presenter, header, form } from '@/components/Crud/crud'

const defaultForm = { id: null, name: null, parent: null, sort: 999 }
export default {
  components: { SearchReset, RowOperation, Pagination },
  mixins: [
    presenter(),
    header(),
    form(defaultForm)
  ],
  cruds() {
    return [
      CRUD({
        title: '分类详情',
        url: '/admin/category/list',
        query: { parent: '' },
        sort: ['sort,asc'],
        crudMethod: { ...crudCategory },
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
      categories: [],
      parentName: '',
      rules: {
        parent: [
          { required: true, message: '请选择所属分类', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入分类排序', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'category:add'],
        edit: ['admin', 'category:edit'],
        del: ['admin', 'category:del']
      }
    }
  },
  created() {
    crudCategory.all().then(res => {
      if (res.success) {
        this.categories = res.content.rows
      }
    })
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .el-input-number .el-input__inner {
  text-align: left;
}
</style>

