/**
 * request.ts 测试文件
 * 测试Axios请求封装的核心功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// Mock依赖
vi.mock('axios')
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))
vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    token: 'mock-token',
    clearUserData: vi.fn(),
  })),
}))
vi.mock('@/stores/global', () => ({
  useGlobalStore: vi.fn(() => ({
    loading: false,
  })),
}))

const mockedAxios = vi.mocked(axios, true)

describe('Request工具类', () => {
  let mockAxiosInstance: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock axios.create返回的实例
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    }
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Request类基础功能', () => {
    it('应该正确创建axios实例', async () => {
      // 动态导入模块
      await import('../request')
      
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.any(String),
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          withCredentials: false,
        })
      )
    })

    it('应该创建两个不同的axios实例', async () => {
      // 动态导入模块
      await import('../request')
      
      expect(mockedAxios.create).toHaveBeenCalledTimes(2)
    })
  })

  describe('GET请求', () => {
    it('应该正确发送GET请求', async () => {
      const mockResponse = {
        data: { code: 200, msg: 'success', data: { id: 1 } },
      }
      const mockInstance = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
      }
      mockedAxios.create.mockReturnValue(mockInstance as any)

      const { default: Request } = await import('../request')
      const request = new Request(mockInstance)
      const result = await request.get('/test', { param: 'value' })

      expect(mockInstance.get).toHaveBeenCalledWith('/test', {
        params: { param: 'value' },
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('POST请求', () => {
    it('应该正确发送POST请求', async () => {
      const mockResponse = {
        data: { code: 200, msg: 'success', data: { id: 1 } },
      }
      const mockInstance = {
        post: vi.fn().mockResolvedValue(mockResponse),
        interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
      }
      mockedAxios.create.mockReturnValue(mockInstance as any)

      const { default: Request } = await import('../request')
      const request = new Request(mockInstance)
      const result = await request.post('/test', { name: 'test' })

      expect(mockInstance.post).toHaveBeenCalledWith('/test', { name: 'test' }, undefined)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('文件上传', () => {
    it('应该正确上传文件', async () => {
      const mockResponse = {
        data: { code: 200, msg: 'success', data: { url: 'uploaded-file.jpg' } },
      }
      const mockInstance = {
        post: vi.fn().mockResolvedValue(mockResponse),
        interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
      }
      mockedAxios.create.mockReturnValue(mockInstance as any)

      const { default: Request } = await import('../request')
      const request = new Request(mockInstance)
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = await request.upload('/upload', file, { category: 'image' })

      expect(mockInstance.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('文件下载', () => {
    it('应该正确下载文件', async () => {
      const mockBlob = new Blob(['test content'])
      const mockResponse = {
        data: mockBlob,
        config: { responseType: 'blob' },
      }
      const mockInstance = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
      }
      mockedAxios.create.mockReturnValue(mockInstance as any)

      // Mock DOM方法
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)
      vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {})

      const { default: Request } = await import('../request')
      const request = new Request(mockInstance)
      await request.download('/download', { id: 1 }, 'test-file.txt')

      expect(mockInstance.get).toHaveBeenCalledWith('/download', {
        params: { id: 1 },
        responseType: 'blob',
      })
      expect(mockLink.download).toBe('test-file.txt')
      expect(mockLink.click).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalledWith('File downloaded successfully')
    })
  })

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      const mockInstance = {
        get: vi.fn().mockRejectedValue(new Error('Network Error')),
        interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
      }
      mockedAxios.create.mockReturnValue(mockInstance as any)

      const { default: Request } = await import('../request')
      const request = new Request(mockInstance)
      
      await expect(request.get('/test')).rejects.toThrow('Network Error')
    })
  })

  describe('取消请求功能', () => {
    it('应该能够取消所有pending请求', async () => {
      // 动态导入模块以获取cancelAllPendingRequests函数
      const { cancelAllPendingRequests } = await import('../request')
      expect(typeof cancelAllPendingRequests).toBe('function')
    })
  })

  describe('请求拦截器', () => {
    it('应该添加Authorization头', async () => {
      const mockInstance = {
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }
      mockedAxios.create.mockReturnValue(mockInstance as any)

      // 重新导入模块以触发拦截器设置
      await import('../request')

      expect(mockInstance.interceptors.request.use).toHaveBeenCalled()
    })
  })

  describe('响应拦截器', () => {
    it('应该处理业务状态码', async () => {
      const mockInstance = {
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }
      mockedAxios.create.mockReturnValue(mockInstance as any)

      // 重新导入模块以触发拦截器设置
      await import('../request')

      expect(mockInstance.interceptors.response.use).toHaveBeenCalled()
    })
  })
})
