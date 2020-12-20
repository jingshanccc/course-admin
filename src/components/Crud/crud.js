import { initData, download } from '@/api/data'
import { parseTime, downloadFile } from '@/utils'
import Vue from 'vue'

function CRUD(options) {
  const defaultOptions = {
    tag: 'default',
    // id字段名
    idFiled: 'id',
    // 标题
    title: '',
    // 请求数据的url
    url: '',
    // 表格数据
    data: [],
    // 选择项
    selections: [],
    // 待查询的对象
    query: {},
    // 查询数据的参数
    params: {},
    // 表单
    form: {},
    // 重置表单
    defaultForm: () => {},
    // 排序规则，默认 id 降序， 支持多字段排序，以逗号分隔
    sort: ['id,desc'],
    // 等待时间
    time: 50,
    // CRUD 方法
    crudMethod: {
      add: (form) => {},
      del: (id) => {},
      edit: (form) => {},
      get: (id) => {}
    },
    // 主页操作栏显示哪些按钮
    optShow: {
      add: true,
      edit: true,
      del: true,
      download: true,
      reset: true
    },
    // 自定义扩展属性
    props: {},
    // 在主页准备
    queryOnPresenterCreated: true,
    // 调式开关
    debug: false
  }

  options = mergeOptions(defaultOptions, options)
  const data = {
    ...options,
    // 记录数据状态
    dataStatus: {},
    status: {
      add: CRUD.STATUS.NORMAL,
      edit: CRUD.STATUS.NORMAL,
      get cu() {
        if (this.add === CRUD.STATUS.NORMAL && this.edit === CRUD.STATUS.NORMAL) {
          return CRUD.STATUS.NORMAL
        } else if (this.add === CRUD.STATUS.PREPARED || this.edit === CRUD.STATUS.PREPARED) {
          return CRUD.STATUS.PREPARED
        } else if (this.add === CRUD.STATUS.PROCESSING || this.edit === CRUD.STATUS.PROCESSING) {
          return CRUD.STATUS.PROCESSING
        }
        throw new Error('worong crud\'s cu status')
      },
      // 标题
      get title() {
        return this.add > CRUD.STATUS.NORMAL ? `新增${crud.title}` : this.edit > CRUD.STATUS.NORMAL ? `编辑${crud.title}` : crud.title
      }
    },
    msg: {
      submit: '提交成功',
      add: '新增成功',
      edit: '编辑成功',
      del: '删除成功'
    },
    page: {
      // 页码
      page: 0,
      // 每页条数
      size: 10,
      total: 0
    },
    // 整体加载中
    loading: false,
    // 导出加载中
    downloadLoading: false,
    // 删除加载中
    delAllLoading: false
  }
  const methods = {
    submitSuccessNotify() {
      crud.notify(crud.msg.submit, CRUD.NOTIFICATION_TYPE.SUCCESS)
    },
    addSuccessNotify() {
      crud.notify(crud.msg.add, CRUD.NOTIFICATION_TYPE.SUCCESS)
    },
    editSuccessNotify() {
      crud.notify(crud.msg.edit, CRUD.NOTIFICATION_TYPE.SUCCESS)
    },
    delSuccessNotify() {
      crud.notify(crud.msg.del, CRUD.NOTIFICATION_TYPE.SUCCESS)
    },
    // 搜索
    toQuery() {
      crud.page.page = 1
      crud.refresh()
    },
    // 刷新
    refresh() {
      // 如果没有调用刷新前的钩子 直接返回
      if (!callVmHook(crud, CRUD.HOOK.beforeRefresh)) {
        return
      }
      return new Promise((resolve, reject) => {
        crud.loading = true
        // 请求数据
        initData(crud.url, crud.getQueryParams()).then(res => {
          if (res.success) {
            const table = crud.getTable()
            if (table && table.lazy) { // 懒加载子节点数据，清除已加载的数据
              table.store.states.treeData = {}
              table.store.states.lazyTreeNodeMap = {}
            }
            const data = res.content
            crud.page.total = data.total
            crud.data = data.rows
            crud.resetDataStatus()
            setTimeout(() => {
              crud.loading = false
              callVmHook(crud, CRUD.HOOK.afterRefresh)
            }, crud.time)
            resolve(res)
          } else {
            crud.loading = false
            reject(res)
          }
        }).catch(err => {
          crud.loading = false
          reject(err)
        })
      })
    },
    // 启动添加
    toAdd() {
      crud.resetForm()
      if (!(callVmHook(crud, CRUD.HOOK.beforeToAdd, crud.form) && callVmHook(crud, CRUD.HOOK.beforeToCU, crud.form))) {
        return
      }
      crud.status.add = CRUD.STATUS.PREPARED
      callVmHook(crud, CRUD.HOOK.afterToAdd, crud.form)
      callVmHook(crud, CRUD.HOOK.afterToCU, crud.form)
    },
    // 启动编辑
    toEdit(data) {
      crud.resetForm(JSON.parse(JSON.stringify(data)))
      if (!(callVmHook(crud, CRUD.HOOK.beforeToEdit, crud.form) && callVmHook(crud, CRUD.HOOK.beforeToCU, crud.form))) {
        return
      }
      crud.status.edit = CRUD.STATUS.PREPARED
      crud.getDataStatus(crud.getDataId(data)).edit = CRUD.STATUS.PREPARED
      callVmHook(crud, CRUD.HOOK.afterToEdit, crud.form)
      callVmHook(crud, CRUD.HOOK.afterToCU, crud.form)
    },
    // 启动删除
    toDelete(data) {
      crud.getDataStatus(crud.getDataId(data)).delete = CRUD.STATUS.PREPARED
    },
    // 取消删除
    cancelDelete(data) {
      if (!callVmHook(crud, CRUD.HOOK.beforeDeleteCancel, data)) {
        return
      }
      crud.getDataStatus(crud.getDataId(data)).delete = CRUD.HOOK.PREPARED
      callVmHook(crud, CRUD.HOOK.afterDeleteCancel, data)
    },
    // 取消新建/编辑
    cancelCU() {
      const addStatus = crud.status.add
      const editStatus = crud.status.edit
      if (addStatus === CRUD.STATUS.PREPARED) {
        if (!callVmHook(crud, CRUD.HOOK.beforeAddCancel, crud.form)) {
          return
        }
        crud.status.add = CRUD.STATUS.NORMAL
      }
      if (editStatus === CRUD.STATUS.PREPARED) {
        if (!callVmHook(crud, CRUD.HOOK.beforeEditCancel, crud.form)) {
          return
        }
        crud.status.edit = CRUD.STATUS.NORMAL
        crud.getDataStatus(crud.getDataId(crud.form)).edit = CRUD.STATUS.NORMAL
      }
      crud.resetForm()
      if (addStatus === CRUD.STATUS.PREPARED) {
        callVmHook(crud, CRUD.HOOK.afterAddCancel, crud.form)
      }
      if (editStatus === CRUD.STATUS.PREPARED) {
        callVmHook(crud, CRUD.HOOK.afterEditCancel, crud.form)
      }
      // 清除表单验证
      if (crud.findVM('form').$refs['form']) {
        crud.findVM('form').$refs['form'].clearValidate()
      }
    },
    // 提交新增/编辑
    submitCU() {
      if (!callVmHook(crud, CRUD.HOOK.beforeValidateCU)) {
        return
      }
      crud.findVM('form').$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        if (!callVmHook(crud, CRUD.HOOK.afterValidateCU)) {
          return
        }
        if (crud.status.add === CRUD.STATUS.PREPARED) {
          crud.doAdd()
        } else if (crud.status.edit === CRUD.STATUS.PREPARED) {
          crud.doEdit()
        }
      })
    },
    // 执行添加
    doAdd() {
      if (!callVmHook(crud, CRUD.HOOK.beforeSubmit)) {
        return
      }
      crud.status.add = CRUD.STATUS.PROCESSING
      crud.crudMethod.add(crud.form).then(() => {
        crud.status.add = CRUD.STATUS.NORMAL
        crud.resetForm()
        crud.addSuccessNotify()
        callVmHook(crud, CRUD.HOOK.afterSubmit)
        crud.toQuery()
      }).catch(() => {
        crud.status.add = CRUD.STATUS.PREPARED
        callVmHook(crud, CRUD.HOOK.afterAddError)
      })
    },
    // 执行添加
    doEdit() {
      if (!callVmHook(crud, CRUD.HOOK.beforeSubmit)) {
        return
      }
      crud.status.edit = CRUD.STATUS.PROCESSING
      crud.crudMethod.edit(crud.form).then(() => {
        crud.status.edit = CRUD.STATUS.NORMAL
        crud.getDataStatus(crud.getDataId(crud.form)).edit = CRUD.STATUS.NORMAL
        crud.resetForm()
        crud.editSuccessNotify()
        callVmHook(crud, CRUD.HOOK.afterSubmit)
        crud.refresh()
      }).catch(() => {
        crud.status.edit = CRUD.STATUS.PREPARED
        callVmHook(crud, CRUD.HOOK.afterEditError)
      })
    },
    // 执行删除
    doDelete(data) {
      let deleteAll = false
      let dataStatus
      const ids = []
      if (data instanceof Array) {
        deleteAll = true
        data.forEach(val => {
          ids.push(this.getDataId(val))
        })
      } else {
        ids.push(this.getDataId(data))
        dataStatus = crud.getDataStatus(this.getDataId(data))
      }
      if (!callVmHook(crud, CRUD.HOOK.beforeDelete, data)) {
        return
      }
      if (!deleteAll) {
        dataStatus.delete = CRUD.STATUS.PROCESSING
      }
      return crud.crudMethod.del(ids).then(() => {
        if (deleteAll) {
          crud.delAllLoading = false
        } else {
          dataStatus.delete = CRUD.STATUS.PREPARED
        }
        crud.delChangePage(1)
        crud.delSuccessNotify()
        callVmHook(crud, CRUD.HOOK.afterDeletem, data)
        crud.refresh()
      }).catch(() => {
        if (deleteAll) {
          crud.delAllLoading = false
        } else {
          dataStatus.delete = CRUD.STATUS.PREPARED
        }
      })
    },
    // 导出
    doExport() {
      crud.downloadLoading = true
      download(crud.url + '/download', crud.getQueryParams()).then(res => {
        if (res.success) {
          downloadFile(res, crud.title + '数据', 'xlsx')
          crud.downloadLoading = false
        } else {
          crud.downloadLoading = false
        }
      }).catch(() => {
        crud.downloadLoading = false
      })
    },
    // 获取查询参数
    getQueryParams: function() {
      // 清除参数无值的情况
      Object.keys(crud.query).length !== 0 && Object.keys(crud.query).forEach(item => {
        if (crud.query[item] === null || crud.query[item] === '') {
          crud.query[item] = undefined
        }
      })
      Object.keys(crud.params).length !== 0 && Object.keys(crud.params).forEach(item => {
        if (crud.params[item] === null || crud.params[item] === '') {
          crud.params[item] = undefined
        }
      })
      return {
        page: crud.page.page - 1,
        size: crud.page.size,
        sort: crud.sort,
        ...crud.query,
        ...crud.params
      }
    },
    // 重置表单
    resetForm(data) {
      const form = data || (typeof crud.defaultForm === 'object' ? JSON.parse(JSON.stringify(crud.defaultForm)) : crud.defaultForm.apply(crud.findVM('form')))
      const crudForm = crud.form
      for (const key in form) {
        if (Object.prototype.hasOwnProperty.call(crudForm, key)) {
          crudForm[key] = form[key]
        } else {
          Vue.set(crudForm, key, form[key])
        }
      }
      // 取消页面重复添加信息时下拉框的校验
      if (crud.findVM('form').$refs['form']) {
        crud.findVM('form').$refs['form'].clearValidate()
      }
    },
    // 获取数据状态
    getDataStatus(id) {
      return crud.dataStatus[id]
    },
    // 重置数据状态
    resetDataStatus() {
      const dataStaus = {}
      function resetStatus(datas) {
        datas.forEach(item => {
          dataStaus[crud.getDataId(item)] = {
            delete: CRUD.STATUS.NORMAL,
            edit: CRUD.STATUS.NORMAL
          }
          if (item.children) {
            resetStatus(item.children)
          }
        })
      }
      resetStatus(crud.data)
      crud.dataStatus = dataStaus
    },
    // 获取数据ID字段名
    getDataId(data) {
      return data[this.idFiled]
    },
    // 获取table
    getTable() {
      return this.findVM('presenter').$refs.table
    },
    attachTable() {
      const table = this.getTable()
      this.updateProp('table', table)
      const _this = this
      table.$on('expand-change', (row, expanded) => {
        if (!expanded) {
          return
        }
        const lazyTreeNodeMap = table.store.states.lazyTreeNodeMap
        row.children = lazyTreeNodeMap[crud.getDataId(row)]
        if (row.children) {
          row.children.forEach(item => {
            const id = crud.getDataId(item)
            if (_this.dataStatus[id] === undefined) {
              _this.dataStatus[id] = { delete: 0, edit: 0 }
            }
          })
        }
      })
    },
    findVM(type) {
      return crud.vms.find(vm => vm && vm.type === type).vm
    },
    // 预防删除第二页最后一条数据/多选删除第二页的数据时，页码错误导致请求无数据
    delChangePage(size) {
      if (crud.data.length === size && crud.page.page !== 1) {
        crud.page.page -= 1
      }
    },
    // 当前页改变
    pageChangeHandler(page) {
      crud.page.page = page
      crud.refresh()
    },
    // 每页条数改变
    sizeChangeHandler(size) {
      crud.page.size = size
      crud.page.page = 1
      crud.refresh()
    },
    // 选择项改变
    selectionChangeHandler(val) {
      crud.selections = val
    },
    // 重置查询参数
    resetQuery(doQuery = true) {
      const defaultQuery = JSON.parse(JSON.stringify(crud.defaultQuery))
      const query = crud.query
      Object.keys(query).forEach(key => {
        query[key] = defaultQuery[key]
      })
      // 重置参数
      this.params = {}
      if (doQuery) {
        crud.toQuery()
      }
    },
    // 树形表格单选
    selectChange(selection, row) {
      // 如果selection存在row就是选中，否则是取消选中
      if (selection.find(val => {
        return crud.getDataId(val) === crud.getDataId(row)
      })) {
        if (row.children) {
          row.children.forEach(val => {
            crud.getTable().toggleRowSelection(val, true)
            selection.push(val)
            if (val.children) {
              crud.selectChange(selection, val)
            }
          })
        }
      } else {
        crud.toggleRowSelection(selection, row)
      }
    },
    // 切换选中状态
    toggleRowSelection(selection, data) {
      if (data.children) {
        data.children.forEach(val => {
          crud.getTable().toggleRowSelection(val, false)
          if (val.children) {
            crud.toggleRowSelection(selection, val)
          }
        })
      }
    },
    // 树形表格全选
    selectAllChange(selection) {
      if (selection && selection.length === crud.data.length) {
        selection.forEach(val => {
          crud.selectChange(selection, val)
        })
      } else {
        crud.getTable().clearSelection()
      }
    },
    // 弹出提示
    notify(title, type = CRUD.NOTIFICATION_TYPE.INFO) {
      crud.vms[0].vm.$notify({
        title,
        type,
        duration: 2500
      })
    },
    // 更新/添加属性
    updateProp(name, value) {
      Vue.set(crud.props, name, value)
    }
  }
  const crud = Object.assign({}, data)
  Vue.observable(crud)
  Object.assign(crud, methods)
  Object.assign(crud, {
    defaultQuery: JSON.parse(JSON.stringify(data.query)),
    // 预留4位存储：主页、组件、头部、分页、表单
    vms: Array(4),
    // 注册组件实例
    registerVM(type, vm, index = -1) {
      const vmObj = {
        type,
        vm: vm
      }
      if (index < 0) {
        this.vms.push(vmObj)
        return
      }
      if (index < 4) {
        this.vms[index] = vmObj
        return
      }
      this.vms.length = Math.max(this.vms.length, index)
      this.vms.splice(index, 1, vmObj)
    },
    // 注销组件实例
    unregisterVM(type, vm) {
      for (let i = this.vms.length - 1; i >= 0; i--) {
        if (this.vms[i] === undefined) {
          continue
        }
        if (this.vms[i].type === type && this.vms[i].vm === vm) {
          if (i < 4) { // 预留的组件数组长度
            this.vms[i] = undefined
          } else {
            this.vms.splice(i, 1)
          }
          break
        }
      }
    }
  })
  // 冻结对象，避免直接修改对象，扩展数据需要通过 updateProp 方法
  Object.freeze(crud)
  return crud
}

function callVmHook(crud, hook) {
  if (crud.debug) {
    console.log('callVmHook' + hook)
  }

  const tagHook = crud.tag ? hook + '$' + crud.tag : null
  let ret = true
  const nargs = [crud]
  for (let i = 2; i < arguments.length; ++i) {
    nargs.push(arguments[i])
  }
  // 有些组件扮演了多个角色，调用钩子时需要去重
  const vmSet = new Set()
  crud.vms.forEach(vm => vm && vmSet.add(vm.vm))
  vmSet.forEach(vm => {
    if (vm[hook]) {
      ret = vm[hook].apply(vm, nargs) !== false && ret
    }
    if (tagHook && vm[tagHook]) {
      ret = vm[tagHook].apply(vm, nargs) !== false && ret
    }
    return ret
  })
}

function mergeOptions(src, opts) {
  const optsRet = {
    ...src
  }
  for (const key in src) {
    if (Object.prototype.hasOwnProperty.call(opts, key)) {
      optsRet[key] = opts[key]
    }
  }
  return optsRet
}

// 查找crud
function lookupCrud(vm, tag) {
  tag = tag || vm.$attrs['crud-tag'] || 'default'
  if (vm.$crud) {
    const res = vm.$crud[tag]
    if (res) {
      return res
    }
  }
  return vm.$parent ? lookupCrud(vm.$parent, tag) : undefined
}

// crud 主页
function presenter(crud) {
  if (crud) {
    console.warn('[CRUD warn]: please use $options.cruds() { return CRUD(...) or [CRUD(...), ...] }')
  }
  return {
    data() {
      // 在data中返回crud 是为了将crud和当前实例关联 组件观测crud的变化
      return {
        crud: this.crud
      }
    },
    beforeCreate() {
      this.$crud = this.$crud || {}
      let cruds = this.$options.cruds instanceof Function ? this.$options.cruds() : crud
      if (!(cruds instanceof Array)) {
        cruds = [cruds]
      }
      cruds.forEach(item => {
        if (this.$crud[item.tag]) {
          console.error('[CRUD error]: crud with tag[' + item.tag + ' is already exist')
        }
        this.$crud[item.tag] = item
        item.registerVM('presenter', this, 0)
      })
      this.crud = this.$crud['default'] || cruds[0]
    },
    methods: {
      parseTime
    },
    created() {
      for (const k in this.$crud) {
        if (this.$crud[k].queryOnPresenterCreated) {
          this.$crud[k].toQuery()
        }
      }
    },
    destroyed() {
      for (const k in this.$crud) {
        this.$crud[k].unregisterVM('presenter', this)
      }
    },
    mounted() {
      // 如果table未实例化 在适当时机调用crud.attachTable刷新table信息
      if (this.$refs.table !== undefined) {
        this.crud.attachTable()
      }
    }
  }
}

// 头部
function header() {
  return {
    data() {
      return {
        crud: this.crud,
        query: this.crud.query
      }
    },
    beforeCreate() {
      this.crud = lookupCrud(this)
      this.crud.registerVM('header', this, 1)
    },
    destroyed() {
      this.crud.unregisterVM('header', this)
    }
  }
}

// 分页
function pagination() {
  return {
    data() {
      return {
        crud: this.crud,
        page: this.crud.page
      }
    },
    beforeCreate() {
      this.crud = lookupCrud(this)
      this.crud.registerVM('pagination', this, 2)
    },
    destroyed() {
      this.crud.unregisterVM('pagination', this)
    }
  }
}

// 表单
function form(defaultForm) {
  return {
    data() {
      return {
        crud: this.crud,
        form: this.crud.form
      }
    },
    beforeCreate() {
      this.crud = lookupCrud(this)
      this.crud.registerVM('form', this, 3)
    },
    created() {
      this.crud.defaultForm = defaultForm
      this.crud.resetForm()
    },
    destroyed() {
      this.crud.unregisterVM('form', this)
    }
  }
}

// crud
function crud(options = {}) {
  const defaultOptions = {
    type: undefined
  }
  options = mergeOptions(defaultOptions, options)
  return {
    data() {
      return {
        crud: this.crud
      }
    },
    beforeCreate() {
      this.crud = lookupCrud(this)
      this.crud.registerVM(options.type, this)
    },
    destroyed() {
      this.crud.unregisterVM(options.type, this)
    }
  }
}

// 状态
CRUD.STATUS = {
  NORMAL: 0,
  PREPARED: 1,
  PROCESSING: 2
}

// 通知类型
CRUD.NOTIFICATION_TYPE = {
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
  ERROR: 'error'
}

// CRUD钩子
CRUD.HOOK = {
  /** 刷新 - 之前 */
  beforeRefresh: 'beforeCrudRefresh',
  /** 刷新 - 之后 */
  afterRefresh: 'afterCrudRefresh',
  /** 删除 - 之前 */
  beforeDelete: 'beforeCrudDelete',
  /** 删除 - 之后 */
  afterDelete: 'afterCrudDelete',
  /** 删除取消 - 之前 */
  beforeDeleteCancel: 'beforeCrudDeleteCancel',
  /** 删除取消 - 之后 */
  afterDeleteCancel: 'afterCrudDeleteCancel',
  /** 新建 - 之前 */
  beforeToAdd: 'beforeCrudToAdd',
  /** 新建 - 之后 */
  afterToAdd: 'afterCrudToAdd',
  /** 编辑 - 之前 */
  beforeToEdit: 'beforeCrudToEdit',
  /** 编辑 - 之后 */
  afterToEdit: 'afterCrudToEdit',
  /** 开始 "新建/编辑" - 之前 */
  beforeToCU: 'beforeCrudToCU',
  /** 开始 "新建/编辑" - 之后 */
  afterToCU: 'afterCrudToCU',
  /** "新建/编辑" 验证 - 之前 */
  beforeValidateCU: 'beforeCrudValidateCU',
  /** "新建/编辑" 验证 - 之后 */
  afterValidateCU: 'afterCrudValidateCU',
  /** 添加取消 - 之前 */
  beforeAddCancel: 'beforeCrudAddCancel',
  /** 添加取消 - 之后 */
  afterAddCancel: 'afterCrudAddCancel',
  /** 编辑取消 - 之前 */
  beforeEditCancel: 'beforeCrudEditCancel',
  /** 编辑取消 - 之后 */
  afterEditCancel: 'afterCrudEditCancel',
  /** 提交 - 之前 */
  beforeSubmit: 'beforeCrudSubmitCU',
  /** 提交 - 之后 */
  afterSubmit: 'afterCrudSubmitCU',
  afterAddError: 'afterCrudAddError',
  afterEditError: 'afterCrudEditError'
}

export default CRUD
export {
  presenter,
  header,
  form,
  pagination,
  crud
}
