import { defineStore } from 'pinia'
import type { UserInfo, LoginParams } from '@/types/user'
import { userLogin, userLogout, userGetUserInfo } from '@/api/user'
import wsManager from '@/utils/websocket'
import { encryptData, decryptData, generateHash, verifyHash } from '@/utils/crypto'
import MD5 from 'crypto-js/md5'
import { useRouter } from 'vue-router'
import { staticRoutes } from '@/router/static-routes'
// 用户状态管理
export const useUserStore = defineStore(
  'user',
  () => {
    const router = useRouter()
    const roleMapping = {
      管理员: 'Admin',
      普通: 'Operator',
      测试: 'Engineer',
    }
    // 状态
    const encryptedToken = ref<string>('') // 加密后的token
    const tokenHash = ref<string>('') // token哈希值，用于验证完整性
    // const refreshToken = ref<string>('')
    const userInfo = ref<UserInfo | null>(null) // 用户信息（内存存储，不加密、不持久化）
    // routesInjected 不参与持久化，仅用于本地内存
    const routesInjected = ref<boolean>(false) // 是否已注入动态路由

    // 计算属性 - 解密后的token
    const token = computed<string>(() => {
      try {
        if (!encryptedToken.value) {
          return ''
        }

        // 解密token
        const decryptedToken = decryptData<string>(encryptedToken.value)

        // 验证数据完整性
        if (decryptedToken && tokenHash.value) {
          const isValid = verifyHash(decryptedToken, tokenHash.value)
          if (!isValid) {
            console.warn('Token可能已被篡改，清除数据')
            // clearUserData()
            return ''
          }
        }

        return decryptedToken || ''
      } catch (error) {
        console.error('解密Token失败:', error)
        return ''
      }
    })

    // 用户信息：直接使用内存中的 ref

    const isLoggedIn = computed(() => !!token.value)

    const role = computed(() => {
      if (userInfo.value?.sysRolePo.roleName) {
        return roleMapping[userInfo.value?.sysRolePo.roleName as keyof typeof roleMapping]
      } else {
        return ''
      }
    })

    // 用户登录
    const login = async (params: LoginParams) => {
      try {
        // 对密码进行MD5加密
        const encryptedParams = {
          ...params,
          password: MD5(params.password).toString(),
        }
        const response = await userLogin(encryptedParams)

        if (response.code === 200) {
          // 加密存储token
          const tokenData = response.data
          encryptedToken.value = encryptData(tokenData)
          tokenHash.value = generateHash(tokenData)

          // refreshToken.value = ''
          // ElMessage.success(response.msg || 'Login successful')
          return { success: true, message: response.msg || 'Login successful' }
        } else {
          return { success: false, message: response.msg || 'Login failed' }
        }
      } catch (error: any) {
        return { success: false, message: error.msg || 'Login failed' }
      }
    }

    // 用户登出
    const logout = () => {
      clearUserData()
      // router.push({
      //   path: '/login',
      //   query: { redirect: router.currentRoute.value.path, ...router.currentRoute.value.query },
      // })
      router.push('/login')
    }

    // 获取用户信息
    const getUserInfo = async () => {
      try {
        const response = await userGetUserInfo()

        if (response.code === 200) {
          // 直接存入内存，不加密、不持久化
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
      encryptedToken.value = ''
      tokenHash.value = ''
      userInfo.value = null
      routesInjected.value = false // 清除时也重置
      // 清除动态路由
      router.removeRoute('main')
      router.addRoute('main', staticRoutes[1])
      
      // refreshToken.value = ''
    }

    return {
      // 状态
      encryptedToken,
      tokenHash,
      userInfo,
      routesInjected,

      // 计算属性
      token, // 解密后的token
      isLoggedIn,

      role,

      // 方法
      login,
      logout,
      getUserInfo,
      clearUserData,
      refreshUserToken,
    }
  },
  {
    // 只持久化加密的token、加密的userInfo和哈希值，routesInjected 不持久化
    persist: {
      key: 'user',
      storage: localStorage,
      // 仅持久化 token 相关字段；不持久化用户信息
      pick: ['encryptedToken', 'tokenHash'],
    },
  },
)
