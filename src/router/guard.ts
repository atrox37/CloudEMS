import { router } from './index'
import { useUserStore } from '@/stores/user'
import { useGlobalStore } from '@/stores/global'
import { ensureRoutesInjected } from './injector'
import { cancelAllPendingRequests } from '@/utils/request'

const WHITE_LIST = ['/login']

router.beforeEach(async (to, from, next) => {
  // 取消所有pending的请求
  cancelAllPendingRequests()

  const user = useUserStore()
  const globalStore = useGlobalStore()

  // 未登录：只允许进入白名单
  if (!user.token) {
    if (WHITE_LIST.includes(to.path)) return next()
    return next({ path: '/login' })
  }

  // 已登录：确保已注入动态路由
  try {
    if (!user.routesInjected) {
      // 显示全局骨架屏
      globalStore.appInitializing = true
      try {
        if (from.path === '/login') {
          await ensureRoutesInjected()
        } else {
          await ensureRoutesInjected(true)
        }
        // 不在此处关闭骨架屏，由 MainLayout onMounted 时关闭，避免内容区空白闪烁
        return next({ ...to, replace: true })
      } catch (innerErr) {
        globalStore.appInitializing = false
        throw innerErr
      }
    } else {
      next()
    }
  } catch (e) {
    globalStore.appInitializing = false
    user.clearUserData()
    next('/login')
  }
})
