import { markRaw } from 'vue'
import type { RouteItem } from '@/types/menu'
import type { AppRole } from '@/constants/appRoles'
import { router } from './index'
import { dynamicRoutes } from './dynamic-routes'
import { useUserStore } from '@/stores/user'

/** 将后端/多语言角色名规范为 AppRole；无法识别则返回空字符串 */
export function normalizeRole(role?: string): AppRole | '' {
  const rawTrim = (role || '').trim()
  const value = rawTrim.toLowerCase()

  if (!value) return ''

  if (value === 'admin' || value === 'administrator' || value === '管理员') return 'Admin'
  if (value === 'engineer' || value === '工程师') return 'Engineer'
  if (
    value === 'viewer' ||
    value === '观看者' ||
    value === '只读' ||
    /** 历史角色名，映射为 Viewer */
    value === 'operator' ||
    value === '运维' ||
    value === '运维员' ||
    value === '操作员'
  ) {
    return 'Viewer'
  }

  if (rawTrim === 'Admin' || rawTrim === 'Engineer' || rawTrim === 'Viewer') {
    return rawTrim
  }

  return ''
}

function getFirstNavigablePath(routes: RouteItem[]): string {
  const [firstRoute] = routes

  if (!firstRoute) {
    return '/home'
  }

  if (firstRoute.redirect) {
    return firstRoute.redirect.startsWith('/') ? firstRoute.redirect : `/${firstRoute.redirect}`
  }

  return firstRoute.path.startsWith('/') ? firstRoute.path : `/${firstRoute.path}`
}

function filterByRoles(routes: RouteItem[], role: AppRole): RouteItem[] {
  const normalizedRole = role
  const result: RouteItem[] = []

  for (const routeRecord of routes) {
    const allow = routeRecord.meta?.roles?.includes(normalizedRole) ?? true
    if (!allow) {
      continue
    }

    const route: RouteItem = { ...routeRecord }
    if (route.children?.length) {
      route.children = filterByRoles(route.children, normalizedRole)
    }

    result.push(markRaw(route))
  }

  return result
}

export async function ensureRoutesInjected(refresh = false) {
  const user = useUserStore()
  if (user.routesInjected) return

  if (refresh) {
    const res = await user.refreshUserToken()
    if (!res.success) {
      user.logout()
      return
    }
  }

  const userRole = normalizeRole(user.role)
  if (!userRole) {
    user.logout()
    return
  }

  const allowed = filterByRoles(dynamicRoutes, userRole)
  if (allowed.length === 0) {
    console.error('[router] no accessible routes for role:', user.role)
    user.logout()
    return
  }

  function addRouteWithChildren(route: RouteItem, parentName?: string) {
    const { children, ...routeWithoutChildren } = route

    if (parentName) {
      router.addRoute(parentName, routeWithoutChildren as never)
    } else {
      router.addRoute('main', routeWithoutChildren as never)
    }

    if (children?.length) {
      children.forEach((child) => addRouteWithChildren(child, route.name))
    }
  }

  allowed.forEach((route) => addRouteWithChildren(route))

  const rootRoute = router.getRoutes().find((route) => route.path === '/')
  if (rootRoute) {
    rootRoute.redirect = getFirstNavigablePath(allowed)
  }

  user.routesInjected = true
}

export function resetDynamicRoutes() {
  const dynamicRouteNames = getAllRouteNames(dynamicRoutes)

  dynamicRouteNames.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
    }
  })

  const user = useUserStore()
  user.routesInjected = false
}

function getAllRouteNames(routes: RouteItem[]): string[] {
  const names: string[] = []

  routes.forEach((route) => {
    if (route.name) {
      names.push(route.name)
    }
    if (route.children?.length) {
      names.push(...getAllRouteNames(route.children))
    }
  })

  return names
}

export function getFilteredRoutesForSidebar() {
  const user = useUserStore()
  const userRole = normalizeRole(user.role)
  if (!userRole) return []
  return filterByRoles(dynamicRoutes, userRole)
}

export function getDefaultRoutePath() {
  const user = useUserStore()
  const userRole = normalizeRole(user.role)
  if (!userRole) return '/login'
  const allowed = filterByRoles(dynamicRoutes, userRole)
  if (allowed.length === 0) return '/login'
  return getFirstNavigablePath(allowed)
}
