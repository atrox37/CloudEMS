import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '../user'

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
  hasRoute: vi.fn<(name: string) => boolean>(),
  removeRoute: vi.fn(),
  addRoute: vi.fn(),
}))

const apiMocks = vi.hoisted(() => ({
  userLogin: vi.fn(),
  userLogout: vi.fn(),
  userGetUserInfo: vi.fn(),
  refreshToken: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerMocks.push,
    hasRoute: routerMocks.hasRoute,
    removeRoute: routerMocks.removeRoute,
    addRoute: routerMocks.addRoute,
    // store.logout 会读取 currentRoute.value.path 判断是否已在登录页
    currentRoute: { value: { path: '/' } },
  }),
}))

vi.mock('@/api/user', () => ({
  userLogin: apiMocks.userLogin,
  userLogout: apiMocks.userLogout,
  userGetUserInfo: apiMocks.userGetUserInfo,
  refreshToken: apiMocks.refreshToken,
}))

vi.mock('@/utils/stomp', () => ({
  default: {},
}))

vi.mock('@/router/static-routes', () => ({
  staticRoutes: [
    { name: 'login', path: '/login' },
    { name: 'main', path: '/' },
  ],
}))

describe('stores/user.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
    routerMocks.hasRoute.mockReturnValue(true)
    apiMocks.userLogout.mockResolvedValue({ code: 200, msg: '退出成功', data: null })
  })

  it('logs in successfully, hashes the password, and stores the token', async () => {
    const store = useUserStore()

    apiMocks.userLogin.mockResolvedValue({
      code: 200,
      data: {
        user: {
          userId: 1,
          username: 'alice',
          roleId: 1,
          dimensionId: 1,
          childDimension: [1],
          authorities: [{ authority: 'device:read' }],
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
        token: 'token-123',
      },
      msg: 'ok',
    })

    const result = await store.login({
      account: 'alice',
      password: 'secret',
      captcha: '1234',
    })

    expect(result).toEqual({ success: true, message: 'ok' })
    expect(apiMocks.userLogin).toHaveBeenCalledWith({
      account: 'alice',
      password: '5ebe2294ecd0e0f08eab7690d2a6ee69',
      captcha: '1234',
    })
    expect(store.token).toBe('token-123')
    expect(store.isLoggedIn).toBe(true)
  })

  it('returns a failure result when login fails', async () => {
    const store = useUserStore()

    apiMocks.userLogin.mockResolvedValue({
      code: 401,
      data: { user: null, token: '' },
      msg: 'invalid credentials',
    })

    const result = await store.login({
      account: 'alice',
      password: 'secret',
      captcha: '1234',
    })

    expect(result).toEqual({ success: false, message: 'invalid credentials' })
    expect(store.token).toBe('')
    expect(store.isLoggedIn).toBe(false)
  })

  it('loads user info into memory when the API succeeds', async () => {
    const store = useUserStore()

    apiMocks.userGetUserInfo.mockResolvedValue({
      code: 200,
      msg: 'loaded',
      data: {
        sysUserPo: {
          id: 1,
          username: 'alice',
          state: 1,
          roleId: 2,
          orgId: 3,
          email: 'alice@example.com',
          phone: '123',
          metadata: {
            systemNotify: { sms: true, email: true },
            reminders: { sms: false, email: true },
            dayReport: { sms: true, email: false },
            weekReport: { sms: false, email: false },
          },
          updateTime: '2024-01-01',
        },
        dimensionPo: {
          id: 10,
          name: 'HQ',
          parentId: 0,
        },
        sysRolePo: {
          id: 20,
          roleName: 'Admin',
          orgId: 3,
          updateTime: '2024-01-01',
        },
      },
    })

    const result = await store.getUserInfo()

    expect(result).toEqual({ success: true, message: 'loaded' })
    expect(store.userInfo.sysUserPo.username).toBe('alice')
    expect(store.userInfo.dimensionPo.name).toBe('HQ')
  })

  it('refreshes token data when refresh succeeds', async () => {
    const store = useUserStore()

    apiMocks.refreshToken.mockResolvedValue({
      code: 200,
      data: {
        token: 'token-456',
        username: 'bob',
        role: 'Engineer',
      },
    })

    const result = await store.refreshUserToken()

    expect(result).toEqual({ success: true, message: 'Token refreshed successfully' })
    expect(store.token).toBe('token-456')
    expect(store.userInfo.sysUserPo.username).toBe('bob')
    expect(store.userInfo.sysRolePo.roleName).toBe('Engineer')
  })

  it('logs out and resets route state when refresh fails', async () => {
    const store = useUserStore()

    store.token = 'token-123'
    store.routesInjected = true
    apiMocks.refreshToken.mockResolvedValue({
      code: 500,
      msg: 'expired',
      data: {},
    })
    routerMocks.hasRoute.mockReturnValue(true).mockReturnValueOnce(true).mockReturnValueOnce(false)

    const result = await store.refreshUserToken()

    expect(result).toEqual({ success: false, message: 'expired' })
    expect(store.token).toBe('')
    expect(store.routesInjected).toBe(false)
    expect(routerMocks.removeRoute).toHaveBeenCalledWith('main')
    expect(routerMocks.addRoute).toHaveBeenCalledWith({ name: 'main', path: '/' })
    expect(routerMocks.push).toHaveBeenCalledWith('/login')
  })

  it('clears user data and restores the main route', async () => {
    const store = useUserStore()

    store.token = 'token-123'
    store.routesInjected = true
    store.userInfo.sysUserPo.username = 'alice'
    routerMocks.hasRoute.mockReturnValueOnce(true).mockReturnValueOnce(false)

    await store.clearUserData()

    expect(store.token).toBe('')
    expect(store.userInfo.sysUserPo.username).toBe('')
    expect(store.routesInjected).toBe(false)
    expect(routerMocks.removeRoute).toHaveBeenCalledWith('main')
    expect(routerMocks.addRoute).toHaveBeenCalledWith({ name: 'main', path: '/' })
  })
})
