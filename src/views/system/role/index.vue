<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.blurry" clearable size="small" placeholder="输入名称或者描述搜索" style="width: 200px" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <date-range-picker v-model="query.createTime" class="date-item" />
        <search-reset />
      </div>
      <operation show="" :permission="permission" />
    </div>
    <!-- 表单 -->
    <!-- eslint-disable-next-line -->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="520px">
      <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" style="width: 380px" />
        </el-form-item>
        <el-form-item label="角色级别" prop="level">
          <el-input-number v-model.number="form.level" :min="1" controls-position="right" style="width: 145px" />
        </el-form-item>
        <el-form-item label="描述信息" prop="desc">
          <el-input v-model="form.desc" style="width: 380px" rows="5" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <el-row :gutter="15">
      <!-- 角色管理 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" style="margin-bottom: 10px">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">角色列表</span>
          </div>
          <el-table ref="table" v-loading="crud.loading" highlight-current-row style="width: 100%" :data="crud.data" @selection-change="crud.selectionChangeHandler" @current-change="currentChangeHandler">
            <el-table-column :selectable="checkBoxT" type="selection" width="55" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="level" label="角色级别" />
            <el-table-column prop="desc" label="角色描述" :show-overflow-tooltip="true" />
            <el-table-column prop="create_time" label="创建日期" :show-overflow-tooltip="true">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.create_time) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-permission="['admin','roles:edit','roles:del']"
              label="操作"
              width="130"
              align="center"
              fixed="right"
            >
              <template slot-scope="scope">
                <row-operation
                  v-if="scope.row.level >= level"
                  :data="scope.row"
                  :permission="permission"
                />
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination />
        </el-card>
      </el-col>
      <!-- 角色-资源关联 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <el-tooltip class="item" effect="dark" content="选择指定角色分配权限" placement="top">
              <span class="role-span">权限分配</span>
            </el-tooltip>
            <el-button
              v-permission="['admin', 'roles:edit']"
              :disabled="!showButton"
              :loading="menuLoading"
              icon="el-icon-check"
              size="mini"
              style="float: right; padding: 6px 9px"
              type="primary"
              @click="saveMenu"
            >保存</el-button>
          </div>
          <el-tree
            ref="menu"
            lazy
            :data="menus"
            :default-checked-keys="menuIds"
            :load="getMenuData"
            :props="defaultProps"
            check-strictly
            accordion
            show-checkbox
            node-key="id"
            @check="menuChange"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import crudRoles from '@/api/system/role'
import { getMenuTree, getMenuChild } from '@/api/system/menu'

import DateRangePicker from '@/components/DateRangePicker'
import Operation from '@/components/Crud/Operation'
import RowOperation from '@/components/Crud/RowOperation'
import Pagination from '@/components/Crud/Pagination'
import SearchReset from '@/components/Crud/SearchReset'
import CRUD, { presenter, header, form, crud } from '@/components/Crud/crud'

const defaultForm = { id: null, name: null, desc: null, level: 3 }

export default {
  name: 'Role',
  components: {
    DateRangePicker,
    RowOperation,
    Operation,
    SearchReset,
    Pagination
  },
  cruds() {
    return CRUD({
      title: '角色',
      url: '/admin/role/list',
      sort: ['level,asc'],
      crudMethod: { ...crudRoles }
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
      defaultProps: {
        children: 'children',
        label: 'title',
        isLeaf: function(data, node) {
          return data.type === 2
        }
      },
      level: 3,
      currentId: 0,
      menuLoading: false,
      showButton: false,
      menus: [],
      menuIds: [],
      permission: {
        add: ['admin', 'roles:add'],
        edit: ['admin', 'roles:edit'],
        del: ['admin', 'roles:del']
      },
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        permission: [
          { required: true, message: '请输入权限', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    crudRoles.roleLevel().then(res => {
      if (res.success) {
        this.level = res.content
      }
    }).catch(() => {})
  },
  methods: {
    getMenuData(node, resolve) {
      setTimeout(() => {
        getMenuTree(node.data.id ? node.data.id : 0).then(res => {
          resolve(res.content.rows ? res.content.rows : [])
        })
      }, 100)
    },
    [CRUD.HOOK.afterRefresh]() {
      this.$refs.menu.setCheckedKeys([])
    },
    currentChangeHandler(val) {
      if (val) {
        const _this = this
        this.$refs.menu.setCheckedKeys([])
        this.currentId = val.id
        this.menuIds = []
        if (val.resourceIds) {
          val.resourceIds.forEach(id => {
            _this.menuIds.push(id)
          })
        }
        this.showButton = true
      }
    },
    menuChange(menu) {
      // 获取该节点的子节点 id
      getMenuChild(menu.id).then(res => {
        if (res.success) {
          const childIds = res.content.ids
          // 判断是否在 menuIds 中，如果存在则删除，否则添加
          if (this.menuIds.indexOf(menu.id) !== -1) {
            for (let i = 0; i < childIds.length; i++) {
              const index = this.menuIds.indexOf(childIds[i])
              if (index !== -1) {
                this.menuIds.splice(index, 1)
              }
            }
          } else {
            for (let i = 0; i < childIds.length; i++) {
              const index = this.menuIds.indexOf(childIds[i])
              if (index === -1) {
                this.menuIds.push(childIds[i])
              }
            }
          }
          this.$refs.menu.setCheckedKeys(this.menuIds)
        }
      })
    },
    saveMenu() {
      this.menuLoading = true
      const role = { id: this.currentId, resourceIds: [] }
      // 已选中的 menu_id
      this.menuIds.forEach(id => {
        role.resourceIds.push(id)
      })
      crudRoles.editMenu(role).then(res => {
        if (res.success) {
          this.crud.notify('保存成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        } else {
          this.crud.errorNotify(res.message)
        }
        this.menuLoading = false
        this.update()
      }).catch(err => {
        this.menuLoading = false
        console.log(err)
      })
    },
    update() {
      // 替换表格数据行
      crudRoles.get(this.currentId).then(res => {
        if (res.success) {
          const row = res.content
          for (let i = 0; i < this.crud.data.length; i++) {
            if (row.id === this.crud.data[i].id) {
              this.crud.data[i] = row
              break
            }
          }
        }
      })
    },
    checkBoxT(row) {
      return row.level >= this.level
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.role-span {
  font-weight: bold;
  color: #303133;
  font-size: 15px;
}
::v-deep .el-input-number .el-input__inner {
  text-align: left;
}
</style>
