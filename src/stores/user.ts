import { defineStore } from 'pinia'
import type { UserInfo, LoginParams } from '@/types/user'
import { userLogin, userLogout, userGetUserInfo, refreshToken } from '@/api/user'
import stompManager from '@/utils/stomp'
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
    const token = ref<string>('') // 直接存储token
    // const refreshToken = ref<string>('')
    const userInfo = ref<UserInfo>({
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
    }) // 用户信息（内存存储，不持久化）
    // routesInjected 不参与持久化，仅用于本地内存
    const routesInjected = ref<boolean>(false) // 是否已注入动态路由

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
          // 直接存储token
          token.value = response.data

          // refreshToken.value = ''
          // ElMessage.success(response.msg || 'Login successful')
          return { success: true, message: response.msg || 'Login successful' }
        } else {
          return { success: false, message: response.msg || 'Login failed' }
        }
      } catch (error: any) {
        return { success: false}
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
        return { success: false}
      }
    }

    // 刷新用户Token
    // 注意：此方法会被 request.ts 中的 401 拦截器调用，也可能被外部主动调用
    const refreshUserToken = async () => {
      try {
        // 这里应该调用刷新Token的API
        const response = await refreshToken()
        if (response.code === 200) {
          token.value = response.data.token
          userInfo.value.sysUserPo.username = response.data.username
          userInfo.value.sysRolePo.roleName = response.data.role
          return { success: true, message: 'Token refreshed successfully' }
        } else {
          // 业务层面刷新失败，执行登出
          console.log('[user] 刷新 token 业务失败，执行登出')
          logout()
          return { success: false, message: response.msg || 'Token refresh failed' }
        }
      } catch (error: any) {
        // 刷新异常（可能是网络错误或 401），执行登出
        console.log('[user] 刷新 token 异常，执行登出')
        logout()
        return { success: false, message: error.msg || 'Token refresh failed' }
      }
    }

    // 清除用户数据（手动清除持久化数据）
    const clearUserData = async () => {
      token.value = ''
      userInfo.value = {
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
      }
      routesInjected.value = false // 清除时也重置
      // 清除动态路由
      try {
        if (router.hasRoute('main')) {
      router.removeRoute('main')
        }
        // 重新添加顶级主路由（不是作为子路由添加）
        if (!router.hasRoute('main')) {
          router.addRoute(staticRoutes[1])
        }
      } catch (e) {
        console.error('[user] 重置主路由失败：', e)
      }

      // refreshToken.value = ''
    }

    return {
      // 状态
      token,
      userInfo,
      routesInjected,

      // 计算属性
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
    // 持久化 token 到 localStorage
    persist: {
      key: 'user',
      storage: localStorage,
      // 仅持久化 token；不持久化用户信息
      pick: ['token'],
    },
  },
)
