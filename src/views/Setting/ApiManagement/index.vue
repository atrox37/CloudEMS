<template>
  <div class="api-management">
    <HeaderCard title="API Management" desc="Manage API keys and access tokens">
      <template #control>
        <IconButton :icon="addIcon" text="Generate API Key" />
      </template>
    </HeaderCard>
    <div class="api-management__body">
      <el-table :data="tableData" class="api-management__table" align="left" table-layout="fixed">
        <el-table-column prop="apiname" label="Name">
        </el-table-column>
        <!-- 角色列改为纯文字类型 -->
        <el-table-column prop="key" label="Key" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="permissions" label="Permissions">
          <template #default="{ row }">
            <div :style="{ color: permissionsColor[row.permissions] }">{{ row.permissions }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="last_used" label="Last Used" show-overflow-tooltip>
        </el-table-column>
        <el-table-column label="Operation" fixed="right">
          <template #default="{ row }">
            <div class="api-management__operation">
              <div class="api-management__operation-item" @click="handleEdit(row)">
                <img :src="editIcon" />
                <!-- <editIcon /> -->
                <span class="api-management__operation-text">Edit</span>
              </div>
              <div class="api-management__operation-item" @click="handleDelete(row)">
                <img :src="deleteIcon" />
                <!-- <img :src="tableDeleteIcon" /> -->
                <span class="api-management__operation-text">Delete</span>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="api-management__pagination">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next"
          @size-change="handlePageSizeChange" @current-change="handlePageSizeChange" />
      </div>
      <!-- </LoadingBg> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import HeaderCard from '@/components/card/headerCard.vue';
import addIcon from '@/assets/icons/button-add.svg';
import editIcon from '@/assets/icons/button-edit.svg'
import deleteIcon from '@/assets/icons/button-delete.svg'



const tableData = ref([
  {
    apiname: 'API Key 1',
    key: 'Sk-****... ****',
    permissions: 'Read, Write',
    last_used: '2025-08-29 12:00:00'
  },
  {
    apiname: 'API Key 2',
    key: 'Sk-****... ****',
    permissions: 'Read, Write',
    last_used: '2025-08-29 12:00:00'
  },
  {
    apiname: 'API Key 3',
    key: 'Sk-****... ****',
    permissions: 'Read, Write',
    last_used: '2025-08-29 12:00:00'
  }
])

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const handlePageSizeChange = (page: number, pageSize: number) => {
  pagination.value.page = page
  pagination.value.pageSize = pageSize
}

const permissionsColor: Record<string, string> = {
  'Read': 'rgba(106, 193, 97, 1)',
  'Write': 'rgba(242, 43, 47, 1)',
  'Read, Write': 'rgba(29, 134, 255, 1)'
}
// 编辑用户
const handleEdit = (row: any) => {
  console.log(row)
}

// 删除用户
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(
    'Are you sure you want to delete this record?',
    'Delete Confirmation',
    {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    },
  )

  console.log(row)
}
</script>

<style scoped lang="scss">
.api-management {
  height: 100%;
  width: 100%;

  .api-management__body {
    height: calc(100% - 1.22rem);
    width: 100%;
    overflow-y: auto;
  }

  .api-management__table {
    width: 100%;
    height: calc(100% - 0.92rem);
    overflow-y: auto;

    .api-management__operation {
      display: flex;
      align-items: center;
      gap: 0.2rem;

      .api-management__operation-item {
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

  .api-management__pagination {
    display: flex;
    justify-content: flex-end;
    margin: 0.2rem 0;
  }

}
</style>
