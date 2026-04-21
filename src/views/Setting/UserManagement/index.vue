<template>
  <div class="voltage-class user-management">
    <div class="user-management__header">
      <div class="user-management__header-left">
        <div class="user-management__header-left-title">User Management</div>
        <div class="user-management__header-left-desc">
          Manage platform users and their permissions
        </div>
      </div>
      <div class="user-management__header-right">
        <IconButton type="primary" text="Add User" :icon="addUserIcon" @click="handleAddUser" />
      </div>
    </div>

    <!-- 鐢ㄦ埛鎿嶄綔琛ㄥ崟 -->
    <UserOperationForm ref="userFormRef" @submit="handleUserSubmit" />
    <div class="user-management__table">
      <LoadingBg :loading="loading">
        <el-table
          :data="tableData"
          class="user-management__table-content"
          align="left"
          table-layout="fixed"
        >
          <el-table-column prop="sysUserPo.username" label="User" min-width="120">
            <template #default="{ row }">
              <div class="user-info">
                <div class="user-avatar">
                  <div class="user-avatar-text">{{ getAvatarName(row.sysUserPo?.username) }}</div>
                </div>
                <div class="user-text">
                  <div class="user-name">{{ row.sysUserPo?.username }}</div>
                  <div class="user-email">{{ row.sysUserPo?.email }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 瑙掕壊鍒楁敼涓虹函鏂囧瓧绫诲瀷 -->
          <el-table-column prop="sysRolePo.roleName" label="Role" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="role-name" :class="row.sysRolePo?.roleName">
                {{ row.sysRolePo?.roleName }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="sysUserPo.state" label="Status">
            <template #default="{ row }">
              <div class="user-status" :class="row.sysUserPo?.state ? 'active' : 'inactive'">
                {{ row.sysUserPo?.state == 1 ? 'Active' : 'Inactive' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="sysUserPo.updateTime" label="Updated At" show-overflow-tooltip>
            <!-- <template #default="{ row }">
              {{ row.sysUserPo?.updateTime }}
            </template> -->
          </el-table-column>
          <el-table-column prop="sysUserPo.createTime" label="Created At" show-overflow-tooltip>
            <!-- <template #default="{ row }">
            {{ row.sysRolePo?.updateTime }}
          </template> -->
          </el-table-column>
          <el-table-column label="Operation" fixed="right" min-width="50">
            <template #default="{ row }">
              <div class="user-management__operation">
                <div class="user-management__operation-item" @click="handleEdit(row)">
                  <img :src="editIcon" />
                  <!-- <editIcon /> -->
                  <span class="user-management__operation-text">Edit</span>
                </div>
                <!-- <div class="user-management__operation-item" @click="handleDelete(row)">
                <img :src="deleteIcon" />
                <span class="user-management__operation-text">Delete</span>
              </div> -->
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="user-management__pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </LoadingBg>
    </div>
  </div>
</template>

<script setup lang="ts">
// 姝ｇ‘寮曞叆SVG鍥炬爣锛岄伩鍏嶉儴缃插悗鍥剧墖鍔犺浇涓嶅嚭鏉?// import userAddIcon from '@/assets/icons/user-add.svg'
// import tableEditIcon from '@/assets/icons/table-edit.svg'
// import tableDeleteIcon from '@/assets/icons/table-delect.svg'
import editIcon from '@/assets/icons/button-edit.svg'
// import deleteIcon from '@/assets/icons/button-delete.svg'
import addUserIcon from '@/assets/icons/button-addUser.svg'
import type { UserInfo } from '@/types/user'
// import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useTableData, type TableConfig } from '@/composables/useTableData'
import UserOperationForm from './UserOperationForm.vue'

// 琛ㄦ牸閰嶇疆
const tableConfig: TableConfig = {
  listUrl: 'sys-app/sys_user/_page',
  defaultPageSize: 20,
}

// 浣跨敤琛ㄦ牸鏁版嵁绠＄悊 composable
const {
  loading,
  tableData,
  pagination: paginationData,
  handlePageChange,
  handlePageSizeChange,
  fetchTableData,
} = useTableData<UserInfo>(tableConfig)
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})
// 鍚屾鍒嗛〉鏁版嵁
watch(
  paginationData,
  (newPagination) => {
    pagination.page = newPagination.page
    pagination.pageSize = newPagination.pageSize
    pagination.total = newPagination.total
  },
  { immediate: true },
)

// 琛ㄥ崟寮曠敤
const userFormRef = ref()

// 娣诲姞鐢ㄦ埛
const handleAddUser = () => {
  userFormRef.value?.open()
}

// 澶勭悊鐢ㄦ埛琛ㄥ崟鎻愪氦
const handleUserSubmit = async () => {
  await fetchTableData(true)
}

// 缂栬緫鐢ㄦ埛
const handleEdit = (row: UserInfo) => {
  userFormRef.value?.open(toRaw(row), 'edit')
}

// 鍒犻櫎鐢ㄦ埛
// const handleDelete = async (row: UserListItem) => {
//   await ElMessageBox.confirm(
//     'Are you sure you want to delete this record?',
//     'Delete Confirmation',
//     {
//       confirmButtonText: 'Confirm',
//       cancelButtonText: 'Cancel',
//       type: 'warning',
//     },
//   )

//   await deleteRow(row.sysUserPo?.id)
// }
/**
 * 鑾峰彇鐢ㄦ埛鍚嶅ご鍍忕缉鍐欙細鍚嶅拰濮撶殑棣栧瓧姣嶏紙濡?寮犱笁"->"寮犱笁"锛?John Smith"->"JS"锛?鐜?->"鐜?锛? * @param name 鐢ㄦ埛鍚嶅瓧绗︿覆
 * @returns string 澶村儚缂╁啓
 */
const getAvatarName = (name: string): string => {
  const nameStr = name.split(' ')
  if (nameStr.length === 1) {
    return name.charAt(0).toUpperCase()
  } else {
    return nameStr[0].charAt(0).toUpperCase() + nameStr[1].charAt(0).toUpperCase()
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
    background-color: var(--vt-bg-input);
    border: 0.01rem solid;

    border-image: linear-gradient(
        117.64deg,
        var(--vt-border-color) 2.73%,
        rgba(148, 166, 197, 0) 31.73%,
        rgba(148, 166, 197, 0.103266) 71.62%,
        var(--vt-border-color) 97.67%
      )
      1;

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
        color: var(--vt-text-primary);
      }

      .user-management__header-left-desc {
        font-size: 0.16rem;
        line-height: 100%;
        letter-spacing: 0%;
        vertical-align: middle;
        color: var(--vt-white-60);
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

        .user-text {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 0.4rem;
          padding: 0.03rem 0;
          // gap: 0.04rem;

          .user-name {
            font-size: 0.16rem;
            font-weight: 500;
            color: var(--vt-text-primary);
            line-height: 1;
            letter-spacing: 0%;
            text-align: left;
          }

          .user-email {
            font-size: 0.14rem;
            letter-spacing: 0%;
            text-align: left;
            line-height: 1;
            color: var(--vt-white-60);
          }
        }

        .role-name {
          font-weight: 500;
          font-size: 0.16rem;
          text-align: left !important;

          &.Admin {
            color: rgba(242, 43, 47, 1);
          }

          &.Engineer {
            color: rgba(29, 134, 255, 1);
          }

          &.Viewer,
          &.Operator {
            color: rgba(148, 166, 197, 1);
          }
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
