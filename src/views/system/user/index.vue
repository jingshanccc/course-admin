<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :xs="15" :sm="18" :md="19" :lg="24" :xl="24">
        <!-- 工具栏 -->
        <div class="head-container">
          <div v-if="crud.props.searchToggle">
            <!-- 搜索 -->
            <el-input v-model="query.blurry" clearable size="small" placeholder="输入名称或者邮箱搜索" style="width: 200px" class="filter-item" @keyup.enter.native="crud.toQuery" />
            <date-range-picker v-model="query.createTime" class="date-item" />
            <search-reset />
          </div>
          <operation show="" :permission="permission" />
        </div>
        <!-- 表单 -->
        <!-- eslint-disable-next-line -->
        <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="570px">
          <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="66px">
            <el-form-item label="用户名" prop="login_name">
              <el-input v-model="form.login_name" />
            </el-form-item>
            <el-form-item label="电话" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item label="昵称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender" style="width: 178px">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item style="margin-bottom: 0" label="角色" prop="roles">
              <el-select
                v-model="roleData"
                style="width: 437px"
                multiple
                placeholder="请选择"
                @remove-tag="deleteRoleTag"
                @change="changeRole"
              >
                <el-option
                  v-for="item in roles"
                  :key="item.name"
                  :disabled="level !== 1 && item.level <= level"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="text" @click="crud.cancelCU">取消</el-button>
            <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
          </div>
        </el-dialog>
        <!-- 表格 -->
        <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%" @selection-change="crud.selectionChangeHandler">
          <el-table-column :selectable="checkBoxT" type="selection" width="55" />
          <el-table-column :show-overflow-tooltip="true" prop="login_name" label="用户名" />
          <el-table-column :show-overflow-tooltip="true" prop="name" label="昵称" />
          <el-table-column prop="gender" label="性别" />
          <el-table-column :show-overflow-tooltip="true" prop="phone" width="100" label="电话" />
          <el-table-column :show-overflow-tooltip="true" prop="email" width="135" label="邮箱" />
          <el-table-column :show-overflow-tooltip="true" prop="create_time" width="135" label="创建日期">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.create_time) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-permission="['admin','user:edit','user:del']"
            label="操作"
            width="115"
            align="center"
            fixed="right"
          >
            <template slot-scope="scope">
              <row-operation
                :data="scope.row"
                :permission="permission"
                :disabled-dle="scope.row.id === userInfo.id"
              />
            </template>
          </el-table-column>
        </el-table>
        <!--分页组件-->
        <pagination />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import crudUser from '@/api/system/user'
import { roleList, roleLevel } from '@/api/system/role'

import CRUD, { presenter, header, form, crud } from '@/components/Crud/crud'

import { isValidPhone } from '@/utils/validate'
import { mapGetters } from 'vuex'

import DateRangePicker from '@/components/DateRangePicker'
import Operation from '@/components/Crud/Operation'
import RowOperation from '@/components/Crud/RowOperation'
import pagination from '@/components/Crud/Pagination'
import SearchReset from '@/components/Crud/SearchReset'
const defaultForm = { id: null, login_name: null, name: null, gender: '男', email: null, roles: [], phone: null }
let userRoles = [] // 用户角色
export default {
  name: 'User',
  components: {
    DateRangePicker,
    RowOperation,
    Operation,
    SearchReset,
    pagination
  },
  cruds() {
    return CRUD({
      title: '用户',
      url: '/admin/user/list',
      crudMethod: { ...crudUser }
    })
  },
  mixins: [
    presenter(),
    header(),
    form(defaultForm),
    crud()
  ],
  data() {
    const validPhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入电话号码'))
      } else if (!isValidPhone(value)) {
        callback(new Error('请输入正确的11位电话号码'))
      } else {
        callback()
      }
    }
    return {
      height: document.documentElement.clientHeight,
      roles: [], // 系统中可选的角色
      roleData: [], // 用户自身的角色
      level: 3,
      defaultProps: {
        children: 'children',
        label: 'name',
        isLeaf: 'leaf'
      },
      permission: {
        add: ['admin', 'user:add'],
        edit: ['admin', 'user:edit'],
        del: ['admin', 'user:del']
      },
      rules: {
        login_name: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, trigger: 'blur', validator: validPhone }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  mounted() {
    const _this = this
    window.onresize = function re() {
      _this.height = document.documentElement.clientHeight
    }
  },
  created() {
    this.crud.msg.add = '新增成功，默认密码：123456'
  },
  methods: {
    changeRole(value) {
      userRoles = []
      value.forEach(item => {
        const role = { id: item }
        userRoles.push(role)
      })
    },
    deleteRoleTag(value) {
      userRoles.forEach((data, index) => {
        if (data.id === value) {
          userRoles.splice(index, value)
        }
      })
    },
    // 新增/编辑前的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.getRoles()
      this.getRoleLevel()
    },
    // 新增前将多选的值置空
    [CRUD.HOOK.beforeToAdd]() {
      this.roleData = []
    },
    // 初始化编辑的角色
    [CRUD.HOOK.beforeToEdit](crud, form) {
      form.roles = form.roles ? JSON.parse(form.roles) : []
      this.roleData = []
      userRoles = []
      const _this = this
      form.roles.forEach((role, index) => {
        _this.roleData.push(role.id)
        const r = { id: role.id }
        userRoles.push(r)
      })
    },
    // 提交之前的设置
    [CRUD.HOOK.afterValidateCU](crud) {
      if (this.roleData.length === 0) {
        this.$message({
          message: '角色不能为空',
          type: 'warning'
        })
        return false
      }
      crud.form.roles = this.roleData
      return true
    },
    // 获取弹窗内的角色数据
    getRoles() {
      roleList().then(res => {
        if (res.success) {
          this.roles = res.content.rows
        }
      }).catch(() => {})
    },
    // 获取角色权限级别
    getRoleLevel() {
      roleLevel().then(res => {
        if (res.success) {
          this.level = res.content
        }
      }).catch(() => {})
    },
    // 检查是否可选
    checkBoxT(row, index) {
      return row.id !== this.userInfo.id
    }
  }
}
</script>
