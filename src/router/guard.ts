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

  // 登录页：Cookie 仍有效时静默恢复；主动退出后不再尝试 refresh
  if (WHITE_LIST.includes(to.path)) {
    if (user.token) {
      return next({ path: '/', replace: true })
    }
    if (!user.skipSilentRefresh) {
      const restored = await user.refreshUserToken({ logoutOnFail: false })
      if (restored.success) {
        return next({ path: '/', replace: true })
      }
    }
    return next()
  }

  try {
    // 内存无 token：用 HttpOnly Cookie 尝试恢复（冷启动 / 刷新页面）
    if (!user.token) {
      globalStore.appInitializing = true
      try {
        await ensureRoutesInjected(true)
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

    if (!user.routesInjected) {
      // 从登录页首次进入：只做路由注入，不盖骨架屏
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
    await user.clearUserData()
    next('/login')
  }
})
