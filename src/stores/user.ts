import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import type { UserInfo, LoginParams } from '@/types/user'
import { userLogin, userLogout, userGetUserInfo, refreshToken } from '@/api/user'
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

/** 清理历史 pinia persist 落盘的 access token */
function clearLegacyPersistedToken() {
  try {
    localStorage.removeItem('user')
  } catch {
    // ignore
  }
}

clearLegacyPersistedToken()

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  /** access token 仅存内存；refresh token 在 HttpOnly Cookie */
  const token = ref<string>('')
  const userInfo = ref<UserInfo>(getDefaultUserInfo())
  const routesInjected = ref(false)
  /** 主动退出后跳过登录页静默 refresh，避免 Cookie 失效时反复请求 */
  const skipSilentRefresh = ref(false)
  let refreshInFlight: Promise<{ success: boolean; message?: string }> | null = null
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
        token.value = response.data.token
        skipSilentRefresh.value = false
        return { success: true, message: response.msg || 'Login successful' }
      }

      return { success: false, message: response.msg || 'Login failed' }
    } catch {
      return { success: false }
    }
  }

  const logout = async () => {
    skipSilentRefresh.value = true
    try {
      const response = await userLogout()
      ElMessage.success(response.msg || '退出成功')
    } catch {
      // 忽略登出接口错误，继续执行本地清理
    }
    await clearUserData()
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login')
    }
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

  /**
   * 用 HttpOnly Cookie 刷新 access token
   * @param logoutOnFail 失败时是否退出登录（冷启动恢复传 false）
   */
  const refreshUserToken = async (options?: { logoutOnFail?: boolean }) => {
    if (refreshInFlight) {
      return refreshInFlight
    }

    const logoutOnFail = options?.logoutOnFail !== false
    refreshInFlight = (async () => {
      try {
        const response = await refreshToken()
        if (response.code === 200) {
          token.value = response.data.token
          skipSilentRefresh.value = false
          userInfo.value.sysUserPo.username = response.data.username
          userInfo.value.sysRolePo.roleName = response.data.role
          return { success: true, message: 'Token refreshed successfully' }
        }

        console.log('[user] token refresh failed', response.msg)
        if (logoutOnFail) {
          await logout()
        }
        return { success: false, message: response.msg || 'Token refresh failed' }
      } catch (error) {
        console.log('[user] token refresh threw')
        if (logoutOnFail) {
          await logout()
        }
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Token refresh failed',
        }
      } finally {
        refreshInFlight = null
      }
    })()

    return refreshInFlight
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
    skipSilentRefresh,
    isLoggedIn,
    role,
    login,
    logout,
    getUserInfo,
    clearUserData,
    refreshUserToken,
  }
})
