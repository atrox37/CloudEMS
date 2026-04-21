import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'

const serviceMock = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => serviceMock),
    CancelToken: { source: vi.fn(() => ({ token: 'token', cancel: vi.fn() })) },
    isCancel: vi.fn(() => false),
  },
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    token: 'mock-token',
    logout: vi.fn(),
    refreshUserToken: vi.fn(),
  }),
}))

vi.mock('@/stores/global', () => ({
  useGlobalStore: () => ({
    loading: false,
  }),
}))

describe('request.ts', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    serviceMock.get.mockReset()
    serviceMock.post.mockReset()
    serviceMock.put.mockReset()
    serviceMock.delete.mockReset()
    serviceMock.patch.mockReset()
    serviceMock.interceptors.request.use.mockReset()
    serviceMock.interceptors.response.use.mockReset()

    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn(() => 'blob:mock-url') as never
    }
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = vi.fn() as never
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates the axios service and registers interceptors on module load', async () => {
    const mockedAxios = vi.mocked(axios)
    await import('../request')

    expect(mockedAxios.create).toHaveBeenCalledTimes(1)
    expect(serviceMock.interceptors.request.use).toHaveBeenCalled()
    expect(serviceMock.interceptors.response.use).toHaveBeenCalled()
  })

  it('uses the shared service for static GET and POST helpers', async () => {
    serviceMock.get.mockResolvedValue({ data: { code: 200, msg: 'ok', data: { id: 1 } } })
    serviceMock.post.mockResolvedValue({ data: { code: 200, msg: 'ok', data: { id: 2 } } })

    const { default: Request } = await import('../request')

    await expect(Request.get('/test', { q: 1 })).resolves.toEqual({
      code: 200,
      msg: 'ok',
      data: { id: 1 },
    })
    await expect(Request.post('/test', { name: 'demo' })).resolves.toEqual({
      code: 200,
      msg: 'ok',
      data: { id: 2 },
    })

    expect(serviceMock.get).toHaveBeenCalledWith(
      '/test',
      expect.objectContaining({ params: { q: 1 } }),
    )
    expect(serviceMock.post).toHaveBeenCalledWith('/test', { name: 'demo' }, undefined)
  })

  it('uploads files with multipart form data', async () => {
    serviceMock.post.mockResolvedValue({ data: { code: 200, msg: 'ok', data: { id: 3 } } })
    const { default: Request } = await import('../request')

    const file = new File(['demo'], 'demo.txt', { type: 'text/plain' })
    await Request.upload('/upload', file, { category: 'text' })

    expect(serviceMock.post).toHaveBeenCalledWith(
      '/upload',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    )
  })

  it('downloads files through blob URLs', async () => {
    serviceMock.get.mockResolvedValue({ data: new Blob(['demo']) })
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as never)
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as never)
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue({ click: vi.fn() } as never)
    const createObjectURLSpy = vi
      .spyOn(window.URL, 'createObjectURL')
      .mockReturnValue('blob:mock-url')
    const revokeSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {})

    const { default: Request } = await import('../request')
    await Request.download('/download', { id: 1 }, 'test.txt')

    expect(serviceMock.get).toHaveBeenCalledWith(
      '/download',
      expect.objectContaining({ params: { id: 1 }, responseType: 'blob' }),
    )
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock-url')
    expect(appendSpy).toHaveBeenCalled()
    expect(removeSpy).toHaveBeenCalled()
  })
})
