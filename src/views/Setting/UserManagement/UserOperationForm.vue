<template>
  <FormDialog width="9.24rem" ref="dialogRef" :title="dialogTitle">
    <template #dialog-body>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="1.24rem"
        class="user-form"
        label-position="right"
        inline
      >
        <el-form-item label="username" prop="username">
          <el-input
            v-model="form.username"
            placeholder="Enter username"
            :disabled="mode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Enter email" :disabled="mode === 'edit'" />
        </el-form-item>

        <el-form-item label="Role" prop="roleId">
          <div class="role-group" ref="roleGroupRef">
            <el-select v-model="form.roleId" placeholder="Select role" :append-to="roleGroupRef">
              <el-option
                v-for="item in roleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </el-form-item>

        <!-- Status 独占一行，去除 inline 并设置宽度100% -->
        <el-form-item
          v-if="mode === 'edit'"
          label="status"
          prop="state"
          class="user-form__status-row"
        >
          <el-switch v-model="form.state" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Enter password"
            show-password
          />
        </el-form-item>

        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm password"
            show-password
          />
        </el-form-item>
      </el-form>
    </template>

    <template #dialog-footer>
      <el-button type="warning" @click="onCancel">Cancel</el-button>
      <el-button type="primary" @click="onSubmit" :loading="loading">Submit</el-button>
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import type { UserInfo, UserNotification } from '@/types/user'
import { removeEmpty } from '@/utils/common'
import { getRoleList, operationUser } from '@/api/user'
import MD5 from 'crypto-js/md5'
export interface UserFormModel {
  id?: number
  username?: string
  roleId?: number | undefined
  state?: number
  password?: string
  confirmPassword?: string
  orgId?: number
  email?: string
  phone?: string
  metadata?: UserNotification
}
interface DialogExpose {
  dialogVisible: boolean
}

const formRef = ref<FormInstance>()
const dialogRef = ref<DialogExpose>()

const getDefaultForm = (): UserFormModel => ({
  username: '',
  roleId: undefined,
  state: 1,
  password: '',
  confirmPassword: '',
  orgId: 1,
  email: '',
})

const form = ref<UserFormModel>(getDefaultForm())
const roleGroupRef = ref<HTMLElement>()
const roleOptions = ref<{ label: string; value: number }[]>([])
// 密码确认验证函数
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (mode.value === 'create' && value === '') {
    callback(new Error('Please confirm your password'))
  } else if (value !== form.value.password) {
    callback(new Error('Passwords do not match'))
  } else {
    callback()
  }
}

// 密码校验：6-12位，必须包含字母和数字
const validatePassword = (rule: any, value: string, callback: any) => {
  if (mode.value === 'create' && !value) {
    callback(new Error('Please input password'))
  } else if (value && (value.length < 6 || value.length > 12)) {
    callback(new Error('Password length must be 6-12 characters'))
  } else if (value && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(value)) {
    callback(new Error('Password must contain both letters and numbers'))
  } else {
    callback()
  }
}

const validateEmail = (rule: any, value: string, callback: any) => {
  if (value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    callback(new Error('Please enter a valid email address'))
  } else {
    callback()
  }
}

const rules = computed(() => {
  const baseRules = {
    username: [
      { required: true, message: 'Please input username', trigger: 'blur' },
      { min: 2, max: 20, message: 'Length should be 3 to 20 characters', trigger: 'blur' },
    ],
    roleId: [{ required: true, message: 'Please select role', trigger: 'change' }],
    state: [{ required: true, message: 'Please select status', trigger: 'change' }],
    password: [{ validator: validatePassword, trigger: 'blur' }],
    confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
    email: [
      { required: true, message: 'Please input email', trigger: 'blur' },
      { validator: validateEmail, trigger: 'blur' },
    ],
  }

  // 只在创建模式下添加密码必填验证
  if (mode.value === 'create') {
    return {
      ...baseRules,
      password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
      confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
    }
  }

  return baseRules
})
const loading = ref(false)
const mode = ref<'create' | 'edit'>('create')
const dialogTitle = computed(() => (mode.value === 'edit' ? 'Edit User' : 'Add User'))

async function open(userItem: UserInfo, openMode: 'create' | 'edit' = 'create') {
  mode.value = openMode
  form.value = getDefaultForm()
  if (userItem) {
    form.value.id = userItem.sysUserPo?.id
    form.value.username = userItem.sysUserPo?.username
    form.value.roleId = userItem.sysRolePo?.id
    form.value.state = userItem.sysUserPo?.state
    form.value.email = userItem.sysUserPo?.email
    form.value.password = ''
    form.value.confirmPassword = ''
  }
  nextTick(() => {
    setTimeout(() => {
      formRef.value?.clearValidate()
    }, 100)
  })
  dialogRef.value && (dialogRef.value.dialogVisible = true)
}

function close() {
  dialogRef.value && (dialogRef.value.dialogVisible = false)
}

const emit = defineEmits<{
  (e: 'submit', value: UserFormModel): void
  (e: 'cancel'): void
}>()

function onCancel() {
  close()
  emit('cancel')
}

async function onSubmit() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    try {
      loading.value = true
      const { confirmPassword, ...submitData } = form.value
      if (mode.value === 'create') {
        // 只提交form中除confirmPassword以外的字段

        const res = await operationUser({
          ...submitData,
          password: MD5(submitData.password as string).toString(),
          metadata: {
            systemNotify: { sms: true, email: true },
            reminders: { sms: true, email: true },
            dayReport: { sms: true, email: true },
            weekReport: { sms: true, email: true },
          },
        })
        if (res.code === 200) {
          ElMessage.success('User added successfully')
          emit('submit', submitData)
        }
        close()
      } else if (mode.value === 'edit') {
        if (submitData.password) {
          submitData.password = MD5(submitData.password).toString()
        }
        const res = await operationUser({
          ...removeEmpty(submitData),
        })
        if (res.code === 200) {
          ElMessage.success('User updated successfully')
          emit('submit', submitData)
          close()
        }
      }
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  // console.log(form.value, 'form')
  getRoleList({ current: -1 }).then((res) => {
    if (res.code === 200) {
      roleOptions.value = res.data.records.map((item) => ({
        label: item.sysRolePo?.roleName,
        value: item.sysRolePo?.id,
      }))
    }
  })
})
defineExpose({ open, close })
</script>

<style scoped lang="scss">
.voltage-class {
  .monitor-data-group,
  .role-group,
  .condition-group {
    display: flex;
    gap: 0.16rem;
  }

  .status-group {
    width: 100%;
    display: flex;
  }

  :deep(.el-input__inner) {
    width: 2.4rem;
  }

  // 让Status输入框占据整行
  // .user-form__status-row {
  //   width: 100%;
  //   display: block;

  :deep(.el-form-item__content) {
    width: 6.6rem;
  }

  // }

  :deep(.el-select__popper.el-popper) {
    top: 0.44rem !important;
  }
}
</style>
