import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteItem } from '@/types/menu'

const mockAddRoute = vi.fn()
const mockHasRoute = vi.fn<(name: string) => boolean>()
const mockRemoveRoute = vi.fn()
const rootRoute = { path: '/', redirect: '' }

const mockUserStore = {
  role: 'Admin',
  routesInjected: false,
  refreshUserToken: vi.fn(async () => ({ success: true })),
  logout: vi.fn(),
}

const mockDynamicRoutes: RouteItem[] = [
  {
    path: 'reports',
    name: 'reports',
    redirect: 'reports/list',
    meta: { activeNav: 'reports', roles: ['Admin'] },
    children: [
      {
        path: 'list',
        name: 'reports-list',
        meta: { activeNav: 'reports', roles: ['Admin'] },
      },
    ],
  },
  {
    path: 'dashboard',
    name: 'dashboard',
    meta: { activeNav: 'dashboard', roles: ['Admin', 'User'] },
    children: [
      {
        path: 'stats',
        name: 'dashboard-stats',
        meta: { activeNav: 'dashboard', roles: ['Admin'] },
      },
    ],
  },
]

vi.mock('@/router/index', () => ({
  router: {
    addRoute: mockAddRoute,
    getRoutes: vi.fn(() => [rootRoute]),
    hasRoute: mockHasRoute,
    removeRoute: mockRemoveRoute,
  },
}))

vi.mock('@/router/dynamic-routes', () => ({
  dynamicRoutes: mockDynamicRoutes,
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

const loadModule = async () => import('../injector')

describe('router/injector.ts', () => {
  beforeEach(() => {
    mockAddRoute.mockReset()
    mockHasRoute.mockReset()
    mockRemoveRoute.mockReset()
    mockUserStore.role = 'Admin'
    mockUserStore.routesInjected = false
    mockUserStore.refreshUserToken.mockReset()
    mockUserStore.refreshUserToken.mockResolvedValue({ success: true })
    mockUserStore.logout.mockReset()
    rootRoute.redirect = ''
  })

  it('filters sidebar routes by role; empty or unknown role yields no routes', async () => {
    const { getFilteredRoutesForSidebar } = await loadModule()

    mockUserStore.role = ''
    expect(getFilteredRoutesForSidebar().map((route) => route.name)).toEqual([])

    mockUserStore.role = 'User'
    expect(getFilteredRoutesForSidebar().map((route) => route.name)).toEqual([])

    mockUserStore.role = 'Admin'
    expect(getFilteredRoutesForSidebar().map((route) => route.name)).toEqual(['reports', 'dashboard'])
  })

  it('injects allowed routes and updates the root redirect', async () => {
    const { ensureRoutesInjected } = await loadModule()

    await ensureRoutesInjected()

    expect(mockAddRoute).toHaveBeenCalledTimes(4)
    expect(mockAddRoute).toHaveBeenNthCalledWith(
      1,
      'main',
      expect.objectContaining({ name: 'reports', path: 'reports', redirect: 'reports/list' }),
    )
    expect(mockAddRoute).toHaveBeenNthCalledWith(
      2,
      'reports',
      expect.objectContaining({ name: 'reports-list', path: 'list' }),
    )
    expect(mockAddRoute).toHaveBeenNthCalledWith(
      3,
      'main',
      expect.objectContaining({ name: 'dashboard', path: 'dashboard' }),
    )
    expect(mockAddRoute).toHaveBeenNthCalledWith(
      4,
      'dashboard',
      expect.objectContaining({ name: 'dashboard-stats', path: 'stats' }),
    )
    expect(rootRoute.redirect).toBe('/reports/list')
    expect(mockUserStore.routesInjected).toBe(true)
  })

  it('stops injection and logs out when token refresh fails', async () => {
    const { ensureRoutesInjected } = await loadModule()

    mockUserStore.refreshUserToken.mockResolvedValue({ success: false })

    await ensureRoutesInjected(true)

    expect(mockUserStore.logout).toHaveBeenCalledTimes(1)
    expect(mockAddRoute).not.toHaveBeenCalled()
    expect(mockUserStore.routesInjected).toBe(false)
  })

  it('removes registered dynamic routes and resets injection state', async () => {
    const { resetDynamicRoutes } = await loadModule()

    mockUserStore.routesInjected = true
    mockHasRoute.mockImplementation((name) => name !== 'dashboard-stats')

    resetDynamicRoutes()

    expect(mockRemoveRoute).toHaveBeenCalledWith('reports')
    expect(mockRemoveRoute).toHaveBeenCalledWith('reports-list')
    expect(mockRemoveRoute).toHaveBeenCalledWith('dashboard')
    expect(mockRemoveRoute).not.toHaveBeenCalledWith('dashboard-stats')
    expect(mockUserStore.routesInjected).toBe(false)
  })
})
