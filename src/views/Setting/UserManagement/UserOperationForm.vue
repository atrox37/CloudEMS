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
        <el-form-item label="Username:" prop="username">
          <el-input
            v-model="form.username"
            placeholder="Enter username"
            :disabled="mode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="Email:" prop="email">
          <el-input v-model="form.email" placeholder="Enter email" :disabled="mode === 'edit'" />
        </el-form-item>

        <el-form-item label="Role:" prop="roleId">
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

        <el-form-item
          v-if="mode === 'edit'"
          label="Status:"
          prop="state"
          class="user-form__status-row"
        >
          <el-switch v-model="form.state" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item label="Password:" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Enter password"
            show-password
          />
        </el-form-item>

        <el-form-item label="Confirm Password:" prop="confirmPassword">
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
      <el-button type="primary" :loading="loading" @click="onSubmit">Submit</el-button>
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules, FormItemRule } from 'element-plus'
import { ElMessage } from 'element-plus'
import MD5 from 'crypto-js/md5'
import { getRoleList, operationUser } from '@/api/user'
import { removeEmpty } from '@/utils/common'
import type { UserInfo, UserNotification } from '@/types/user'

export interface UserFormModel {
  id?: number
  username?: string
  roleId?: number
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

const defaultMetadata: UserNotification = {
  systemNotify: { sms: true, email: true },
  reminders: { sms: true, email: true },
  dayReport: { sms: true, email: true },
  weekReport: { sms: true, email: true },
}

const getDefaultForm = (): UserFormModel => ({
  username: '',
  roleId: undefined,
  state: 1,
  password: '',
  confirmPassword: '',
  orgId: 1,
  email: '',
})

const formRef = ref<FormInstance>()
const dialogRef = ref<DialogExpose>()
const roleGroupRef = ref<HTMLElement>()
const form = ref<UserFormModel>(getDefaultForm())
const roleOptions = ref<{ label: string; value: number }[]>([])
const loading = ref(false)
const mode = ref<'create' | 'edit'>('create')
const dialogTitle = computed(() => (mode.value === 'edit' ? 'Edit User' : 'Add User'))

const validateConfirmPassword: FormItemRule['validator'] = (_, value, callback) => {
  if (mode.value === 'create' && !value) {
    callback(new Error('Please confirm your password'))
    return
  }
  if (value && value !== form.value.password) {
    callback(new Error('Passwords do not match'))
    return
  }
  callback()
}

const validatePassword: FormItemRule['validator'] = (_, value, callback) => {
  if (mode.value === 'create' && !value) {
    callback(new Error('Please input password'))
    return
  }
  if (value && (value.length < 6 || value.length > 12)) {
    callback(new Error('Password length must be 6-12 characters'))
    return
  }
  if (value && !/^(?=.*[A-Za-z])(?=.*\d).{6,12}$/.test(value)) {
    callback(new Error('Password must contain both letters and numbers'))
    return
  }
  if (value && /[^A-Za-z0-9@_]/.test(value)) {
    callback(new Error('Only @ or _ symbols are allowed'))
    return
  }
  callback()
}

const validateEmail: FormItemRule['validator'] = (_, value, callback) => {
  if (value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    callback(new Error('Please enter a valid email address'))
    return
  }
  callback()
}

const rules = computed<FormRules<UserFormModel>>(() => {
  const baseRules: FormRules<UserFormModel> = {
    username: [
      { required: true, message: 'Please input username', trigger: 'blur' },
      { min: 2, max: 20, message: 'Length should be 2 to 20 characters', trigger: 'blur' },
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

  if (mode.value === 'create') {
    return {
      ...baseRules,
      password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
      confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
    }
  }

  return baseRules
})

const emit = defineEmits<{
  (e: 'submit', value: UserFormModel): void
  (e: 'cancel'): void
}>()

async function open(userItem?: UserInfo, openMode: 'create' | 'edit' = 'create') {
  mode.value = openMode
  form.value = getDefaultForm()

  if (userItem) {
    form.value = {
      ...form.value,
      id: userItem.sysUserPo?.id,
      username: userItem.sysUserPo?.username,
      roleId: userItem.sysRolePo?.id,
      state: userItem.sysUserPo?.state,
      email: userItem.sysUserPo?.email,
      phone: userItem.sysUserPo?.phone,
      password: '',
      confirmPassword: '',
    }
  }

  await nextTick()
  formRef.value?.clearValidate()
  if (dialogRef.value) {
    dialogRef.value.dialogVisible = true
  }
}

function close() {
  if (dialogRef.value) {
    dialogRef.value.dialogVisible = false
  }
}

function onCancel() {
  close()
  emit('cancel')
}

async function onSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  try {
    loading.value = true
    const { confirmPassword: _confirmPassword, ...submitData } = form.value

    if (mode.value === 'create') {
      const res = await operationUser({
        ...submitData,
        password: MD5(submitData.password as string).toString(),
        metadata: defaultMetadata,
      })
      if (res.code === 200) {
        ElMessage.success('User added successfully')
        emit('submit', submitData)
        close()
      }
      return
    }

    const updatePayload: UserFormModel = { ...submitData }
    if (updatePayload.password) {
      updatePayload.password = MD5(updatePayload.password).toString()
    }

    const res = await operationUser(removeEmpty(updatePayload))
    if (res.code === 200) {
      ElMessage.success('User updated successfully')
      emit('submit', submitData)
      close()
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const res = await getRoleList({ current: -1 })
  if (res.code === 200) {
    roleOptions.value = res.data.records.map((item) => ({
      label: item.sysRolePo?.roleName,
      value: item.sysRolePo?.id,
    }))
  }
})

defineExpose({ open, close })
</script>

<style scoped lang="scss">
.voltage-class {
  .monitor-data-group,
  .role-group,
  .condition-group {
    // display: flex;
    // gap: 0.16rem;
    width: 100%;
  }

  .status-group {
    width: 100%;
    display: flex;
  }

  :deep(.el-input__inner) {
    width: 2.4rem;
  }

  :deep(.el-form-item__content) {
    width: 6.6rem;
  }

  :deep(.el-select__popper.el-popper) {
    top: 0.44rem !important;
  }
}
</style>
