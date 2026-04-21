import { router } from './index'
import { useUserStore } from '@/stores/user'
import { useGlobalStore } from '@/stores/global'
import { ensureRoutesInjected, getDefaultRoutePath } from './injector'
import { cancelAllPendingRequests } from '@/utils/request'

const WHITE_LIST = ['/login']

router.beforeEach(async (to, from, next) => {
  cancelAllPendingRequests()

  const user = useUserStore()
  const globalStore = useGlobalStore()

  if (!user.token) {
    if (WHITE_LIST.includes(to.path)) {
      return next()
    }
    return next({ path: '/login' })
  }

  try {
    if (!user.routesInjected) {
      // 从登录页首次进入：只做路由注入，不盖骨架屏（避免「已登录却先闪骨架」）
      // 骨架屏仅用于非登录入口：刷新 token、带 token 直开业务页等冷启动
      if (from.path === '/login') {
        globalStore.appInitializing = false
      } else {
        globalStore.appInitializing = true
      }

      try {
        if (from.path === '/login') {
          await ensureRoutesInjected()
        } else {
          await ensureRoutesInjected(true)
        }

        // token 刷新失败或角色无效时 ensureRoutesInjected 内会 logout，不会注入路由；
        // 登录页无 MainLayout，不会执行 onMounted 里关闭骨架屏，需在此显式关闭
        if (!user.token || !user.routesInjected) {
          globalStore.appInitializing = false
          return next({ path: '/login', replace: true })
        }

        if (to.path === '/') {
          return next({ path: getDefaultRoutePath(), replace: true })
        }

        return next({ ...to, replace: true })
      } catch (innerErr) {
        globalStore.appInitializing = false
        throw innerErr
      }
    }

    if (to.path === '/') {
      return next({ path: getDefaultRoutePath(), replace: true })
    }

    next()
  } catch {
    globalStore.appInitializing = false
    user.clearUserData()
    next('/login')
  }
})
