import { defineStore } from 'pinia'
import type { UserInfo, LoginParams } from '@/types/user'
import { userLogin, userLogout, userGetUserInfo } from '@/api/user'
import wsManager from '@/utils/websocket'
import MD5 from 'crypto-js/md5'
// 用户状态管理
export const useUserStore = defineStore(
  'user',
  () => {
    // 状态
    const token = ref<string>('')
    // const refreshToken = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)
    // routesInjected 不参与持久化，仅用于本地内存
    const routesInjected = ref<boolean>(false) // 是否已注入动态路由

    // 计算属性
    const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
    const displayName = computed(() => userInfo.value?.username || '')

    const roles = computed(() =>
      ['Admin'],
    )

    // 用户登录
    const login = async (params: LoginParams) => {
      try {
        // 对密码进行MD5加密
        const encryptedParams = {
          ...params,
          // password: MD5(params.password).toString(),
          
        }

        const response = await userLogin(encryptedParams)

        if (response.code === 200) {
          // 更新状态（会自动持久化）
          token.value = response.data
          // refreshToken.value = ''
          ElMessage.success(response.msg || 'Login successful')
          return { success: true, message: response.msg || 'Login successful' }
        } else {
          return { success: false, message: response.msg || 'Login failed' }
        }
      } catch (error: any) {
        return { success: false, message: error.msg || 'Login failed' }
      }
    }

    // 用户登出
    const logout = async () => {
      try {
        // 调用登出API
        if (token.value) {
          const res = await userLogout()
            if (res.code === 200) {
            ElMessage.success('Logout successful')
            clearUserData()
          } else {
            ElMessage.error(res.msg || 'Logout failed')
          }
        }
      } catch (error) {
        console.error('Logout API call failed:', error)
      }
    }

    // 获取用户信息
    const getUserInfo = async () => {
      try {
        const response = await userGetUserInfo()

        if (response.code === 200) {
          userInfo.value = response.data

          return { success: true, message: response.msg || 'Get user info successful' }
        } else {
          return { success: false, message: response.msg || 'Get user info failed' }
        }
      } catch (error: any) {
        return { success: false, message: error.msg || 'Get user info failed' }
      }
    }

    // 刷新用户Token
    const refreshUserToken = async () => {
      try {
        // 这里应该调用刷新Token的API
        // const response = await userRefreshToken(refreshToken.value)
        // if (response.code === 200) {
        //   token.value = response.data
        //   refreshToken.value = response.data.refresh_token
        //   return { success: true, message: 'Token refreshed successfully' }
        // } else {
        //   return { success: false, message: response.msg || 'Token refresh failed' }
        // }
        // // 暂时返回成功，实际项目中需要实现真实的刷新逻辑
        // return { success: true, message: 'Token refreshed successfully' }
      } catch (error: any) {
        return { success: false, message: error.msg || 'Token refresh failed' }
      }
    }

    // 清除用户数据（手动清除持久化数据）
    const clearUserData = () => {
      // 断开WebSocket连接
      wsManager.disconnect()
      token.value = ''
      userInfo.value = null
      routesInjected.value = false // 清除时也重置
      // refreshToken.value = ''
    }

    return {
      // 状态
      token,
      userInfo,
      routesInjected,

      // 计算属性
      isLoggedIn,
      displayName,
      roles,

      // 方法
      login,
      logout,
      getUserInfo,
      clearUserData,
      refreshUserToken,
    }
  },
  {
    // 只持久化 token、refreshToken 和 userInfo，routesInjected 不持久化
    persist: {
      key: 'user',
      storage: localStorage,
      pick: ['token', 'userInfo'],
    },
  },
)
