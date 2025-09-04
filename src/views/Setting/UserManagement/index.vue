<template>
  <div class="voltage-class user-management">
    <div class="user-management__header">
      <div class="user-management__header-left">
        <div class="user-management__header-left-title">User Management</div>
        <div class="user-management__header-left-desc">Manage platform users and their permissions</div>
      </div>
      <div class="user-management__header-right">
        <IconButton type="primary" text="Add User" :icon="addUserIcon" @click="handleAddUser" />
      </div>
    </div>

    <!-- 用户操作表单 -->
    <UserOperationForm ref="userFormRef" @submit="handleUserSubmit" />
    <div class="user-management__table">
      <!-- <LoadingBg :loading="loading"> -->
      <el-table :data="tableData" class="user-management__table-content" align="left" table-layout="fixed">
        <el-table-column prop="username" label="User">
          <template #default="{ row }">
            <div class="user-info">
              <div class="user-avatar">
                <div class="user-avatar-text">{{ getAvatarName(row.username) }}</div>
              </div>
              <div class="user-name">{{ row.username }}</div>
            </div>
          </template>
        </el-table-column>
        <!-- 角色列改为纯文字类型 -->
        <el-table-column prop="role" label="Role" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="role-name" :class="row.role.name_en">{{ row.role.name_en }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status">
          <template #default="{ row }">
            <div class="user-status" :class="row.is_active ? 'active' : 'inactive'">{{ row.is_active ? 'Active' :
              'Inactive'}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="last_login" label="Last Login" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.last_login }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="Created At" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.created_at }}
          </template>
        </el-table-column>
        <el-table-column label="Operation" fixed="right">
          <template #default="{ row }">
            <div class="user-management__operation">
              <div class="user-management__operation-item" @click="handleEdit(row)">
                <img :src="editIcon" />
                <!-- <editIcon /> -->
                <span class="user-management__operation-text">Edit</span>
              </div>
              <div class="user-management__operation-item" @click="handleDelete(row)">
                <img :src="deleteIcon" />
                <!-- <img :src="tableDeleteIcon" /> -->
                <span class="user-management__operation-text">Delete</span>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="user-management__pagination">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next"
          @size-change="handlePageSizeChange" @current-change="handlePageChange" />
      </div>
      <!-- </LoadingBg> -->
    </div>
  </div>
</template>

<script setup lang="ts">
// 正确引入SVG图标，避免部署后图片加载不出来
// import userAddIcon from '@/assets/icons/user-add.svg'
// import tableEditIcon from '@/assets/icons/table-edit.svg'
// import tableDeleteIcon from '@/assets/icons/table-delect.svg'
import editIcon from '@/assets/icons/button-edit.svg'
import deleteIcon from '@/assets/icons/button-delete.svg'
import addUserIcon from '@/assets/icons/button-addUser.svg'
import type { UserManagementInfo } from '@/types/user'
// import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useTableData, type TableConfig } from '@/composables/useTableData'
import UserOperationForm from './UserOperationForm.vue'

// 表格配置
const tableConfig: TableConfig = {
  listUrl: 'auth/users',
  deleteUrl: 'auth/users/{id}',
  enableDelete: true,
  enableBatchDelete: true,
  defaultPageSize: 20,
  deleteConfirmMessage: 'Are you sure you want to delete this user?',
  batchDeleteConfirmMessage: 'Are you sure you want to delete selected users?',
}

// 使用表格数据管理 composable
const {
  loading,
  tableData,
  pagination: paginationData,
  handlePageChange,
  handlePageSizeChange,
  fetchTableData,
  deleteRow,
} = useTableData<UserManagementInfo>(tableConfig)

// 创建可写的分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

// 同步分页数据
watch(
  paginationData,
  (newPagination) => {
    pagination.page = newPagination.page
    pagination.pageSize = newPagination.pageSize
    pagination.total = newPagination.total
  },
  { immediate: true },
)

// 表单引用
const userFormRef = ref()

// 添加用户
const handleAddUser = () => {
  userFormRef.value?.open()
}

// 处理用户表单提交
const handleUserSubmit = async (formData: any) => {
  await fetchTableData(true)
}

// 编辑用户
const handleEdit = (row: UserManagementInfo) => {
  userFormRef.value?.open(row.id, 'edit')
}

// 删除用户
const handleDelete = async (row: UserManagementInfo) => {
  await ElMessageBox.confirm(
    'Are you sure you want to delete this record?',
    'Delete Confirmation',
    {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    },
  )

  await deleteRow(row.id)
}
/**
 * 获取用户名头像缩写：名和姓的首字母（如"张三"->"张三"，"John Smith"->"JS"，"王"->"王"）
 * @param name 用户名字符串
 * @returns string 头像缩写
 */
const getAvatarName = (name: string): string => {
  if (!name) return ''
  // 英文名处理
  if (/^[a-zA-Z\s]+$/.test(name)) {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) {
      return parts[0][0].toUpperCase()
    } else {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
  }
  // 中文名处理
  // 假设中文名一般为2-3字，姓在前
  if (name.length === 2) {
    return name
  } else if (name.length >= 3) {
    return name[0] + name[1]
  } else {
    return name[0]
  }
}
</script>

<style scoped lang="scss">
.voltage-class .user-management {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .user-management__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 1.02rem;
    padding: 0.2rem;
    margin-bottom: 0.2rem;
    background-color: rgba(84, 98, 140, 0.2);
    border: 0.01rem solid;

    border-image: linear-gradient(117.64deg, rgba(148, 166, 197, 0.3) 2.73%, rgba(148, 166, 197, 0) 31.73%, rgba(148, 166, 197, 0.103266) 71.62%, rgba(148, 166, 197, 0.3) 97.67%) 1;

    backdrop-filter: blur(0.1rem);

    .user-management__header-left {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      gap: 0.2rem;

      .user-management__header-left-title {
        font-size: 0.26rem;
        line-height: 0.26rem;
        letter-spacing: 0%;
        color: #fff;
      }

      .user-management__header-left-desc {
        font-size: 0.16rem;
        line-height: 100%;
        letter-spacing: 0%;
        vertical-align: middle;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .user-management__header-right {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-right: 0.1rem;
    }
  }

  .user-management__table {
    height: calc(100% - 1.22rem);

    .user-management__table-content {
      width: 100%;
      height: calc(100% - 0.92rem);
      overflow-y: auto;

      .user-info {
        display: flex;
        align-items: center;
        gap: 0.1rem;
        height: 0.4rem;

        .user-avatar {
          width: 0.4rem;
          height: 0.4rem;
          border-radius: 50%;
          background-color: rgba(29, 134, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.19rem;
          letter-spacing: 0%;
          color: rgba(29, 134, 255, 1);
        }

        .user-name {
          font-size: 0.16rem;
          letter-spacing: 0%;
          color: rgba(255, 255, 255, 1);
        }
      }

      .role-name {
        font-weight: 500;
        font-size: 0.16rem;

        &.Admin {
          color: rgba(242, 43, 47, 1);
        }

        &.Engineer {
          color: rgba(29, 134, 255, 1);
        }

        &.Viewer {
          color: rgba(148, 166, 197, 1);
        }


      }

      .user-status {
        font-weight: 500;
        font-size: 0.16rem;

        &.active {
          color: rgba(106, 193, 97, 1);
        }

        &.inactive {
          color: rgba(148, 166, 197, 1);
        }


      }

      .user-management__operation {
        display: flex;
        align-items: center;
        gap: 0.2rem;

        .user-management__operation-item {
          cursor: pointer;
          display: flex;
          align-items: center;

          img {
            width: 0.14rem;
            height: 0.14rem;
            margin-right: 0.04rem;
            object-fit: contain;
          }
        }
      }
    }

    .user-management__pagination {
      display: flex;
      justify-content: flex-end;
      margin: 0.2rem 0;
    }
  }
}


:deep(.el-table .el-table__inner-wrapper .el-table__body-wrapper td .cell) {
  height: 0.4rem !important;
}
</style>
