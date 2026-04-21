import { defineStore } from 'pinia'
import type { UserInfo, LoginParams } from '@/types/user'
import { userLogin, userGetUserInfo, refreshToken } from '@/api/user'
import MD5 from 'crypto-js/md5'
import { useRouter } from 'vue-router'
import { staticRoutes } from '@/router/static-routes'

const getDefaultUserInfo = (): UserInfo => ({
  sysUserPo: {
    id: 0,
    username: '',
    state: 0,
    roleId: 0,
    orgId: 0,
    email: '',
    phone: '',
    metadata: {
      systemNotify: { sms: true, email: true },
      reminders: { sms: true, email: true },
      dayReport: { sms: true, email: true },
      weekReport: { sms: true, email: true },
    },
    updateTime: '',
  },
  dimensionPo: {
    id: 0,
    name: '',
    parentId: 0,
  },
  sysRolePo: {
    id: 0,
    roleName: '',
    orgId: 0,
    updateTime: '',
  },
})

export const useUserStore = defineStore(
  'user',
  () => {
    const router = useRouter()
    const token = ref<string>('')
    const userInfo = ref<UserInfo>(getDefaultUserInfo())
    const routesInjected = ref(false)
    const isLoggedIn = computed(() => !!token.value)
    const role = computed(() => userInfo.value?.sysRolePo.roleName || '')

    const login = async (params: LoginParams) => {
      try {
        const encryptedParams = {
          ...params,
          password: MD5(params.password).toString(),
        }
        const response = await userLogin(encryptedParams)

        if (response.code === 200) {
          token.value = response.data
          return { success: true, message: response.msg || 'Login successful' }
        }

        return { success: false, message: response.msg || 'Login failed' }
      } catch {
        return { success: false }
      }
    }

    const logout = () => {
      clearUserData()
      router.push('/login')
    }

    const getUserInfo = async () => {
      try {
        const response = await userGetUserInfo()

        if (response.code === 200) {
          userInfo.value = response.data
          return { success: true, message: response.msg || 'Get user info successful' }
        }

        return { success: false, message: response.msg || 'Get user info failed' }
      } catch {
        return { success: false }
      }
    }

    const refreshUserToken = async () => {
      try {
        const response = await refreshToken()
        if (response.code === 200) {
          token.value = response.data.token
          userInfo.value.sysUserPo.username = response.data.username
          userInfo.value.sysRolePo.roleName = response.data.role
          return { success: true, message: 'Token refreshed successfully' }
        }

        console.log('[user] token refresh failed, logging out')
        logout()
        return { success: false, message: response.msg || 'Token refresh failed' }
      } catch (error) {
        console.log('[user] token refresh threw, logging out')
        logout()
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Token refresh failed',
        }
      }
    }

    const clearUserData = async () => {
      token.value = ''
      userInfo.value = getDefaultUserInfo()
      routesInjected.value = false

      try {
        if (router.hasRoute('main')) {
          router.removeRoute('main')
        }
        if (!router.hasRoute('main')) {
          router.addRoute(staticRoutes[1])
        }
      } catch (error) {
        console.error('[user] reset main route failed:', error)
      }
    }

    return {
      token,
      userInfo,
      routesInjected,
      isLoggedIn,
      role,
      login,
      logout,
      getUserInfo,
      clearUserData,
      refreshUserToken,
    }
  },
  {
    persist: {
      key: 'user',
      storage: localStorage,
      pick: ['token'],
    },
  },
)
