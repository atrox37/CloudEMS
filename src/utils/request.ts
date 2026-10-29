import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type Canceler,
} from 'axios'
import { getActivePinia } from 'pinia'
import { ElMessage } from 'element-plus'
import { reactive } from 'vue'
import { useGlobalStore } from '@/stores/global'
import { useUserStore } from '@/stores/user'

export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

export interface RequestConfig extends AxiosRequestConfig {
  skipCancel?: boolean
  /** 路由跳转时不取消（跨页面共享的应用级数据请求，如站点列表） */
  skipRouteCancel?: boolean
  showSuccessMessage?: boolean
  _requestKey?: string
  _retry?: boolean
}

const pendingRequests = reactive(new Map<string, { cancel: Canceler; skipRouteCancel?: boolean }>())
const WHITE_LIST = ['/user-app/login', '/sys-app/common/captcha', '/sys-app/common/refresh']
const REFRESH_TOKEN_URL = '/sys-app/common/refresh'

const syncGlobalLoading = () => {
  if (!getActivePinia()) {
    return
  }
  const globalStore = useGlobalStore()
  globalStore.loading = pendingRequests.size > 0
}

const isRefreshTokenRequest = (url?: string): boolean => url?.includes(REFRESH_TOKEN_URL) ?? false

const createRequestKey = (config: AxiosRequestConfig): string => {
  const params = { ...(config.params as Record<string, unknown> | undefined) }
  delete params._t
  return [
    config.method ?? 'get',
    config.url ?? '',
    JSON.stringify(params),
    JSON.stringify(config.data ?? null),
  ].join('-')
}

const service = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  // 携带 HttpOnly refresh Cookie（同源代理 / 跨域均需要）
  withCredentials: true,
})

const removePendingRequest = (config?: RequestConfig) => {
  if (!config || config.skipCancel || !config._requestKey) {
    return
  }
  pendingRequests.delete(config._requestKey)
  syncGlobalLoading()
}

const requestInterceptor = (config: RequestConfig) => {
  const nextConfig = config

  if (!nextConfig.skipCancel) {
    const requestKey = createRequestKey(nextConfig)
    nextConfig._requestKey = requestKey

    const existing = pendingRequests.get(requestKey)
    if (existing) {
      existing.cancel('Request canceled due to duplicate request')
      pendingRequests.delete(requestKey)
      syncGlobalLoading()
    }

    const cancelSource = axios.CancelToken.source()
    nextConfig.cancelToken = cancelSource.token
    pendingRequests.set(requestKey, {
      cancel: cancelSource.cancel,
      skipRouteCancel: nextConfig.skipRouteCancel,
    })
    syncGlobalLoading()
  }

  const userStore = useUserStore()
  const token = userStore.token
  const requestUrl = nextConfig.url ?? ''

  if (token && nextConfig.headers && !WHITE_LIST.includes(requestUrl)) {
    nextConfig.headers.Authorization = `${token}`
  }

  // 无 token 时不在拦截器里强制 logout（冷启动依赖 Cookie 恢复会话）

  if (requestUrl.includes('/login') && nextConfig.headers) {
    nextConfig.headers.LOGINTYPE = 'PASS'
  }

  if (['post', 'put', 'patch'].includes(nextConfig.method?.toLowerCase() ?? '')) {
    nextConfig.headers = {
      ...nextConfig.headers,
      'Content-Type': nextConfig.headers?.['Content-Type'] || 'application/json',
    }
  }

  if (nextConfig.method?.toLowerCase() === 'get') {
    nextConfig.params = {
      ...(nextConfig.params as Record<string, unknown> | undefined),
      _t: Date.now(),
    }
  }

  return nextConfig
}

const requestErrorInterceptor = (error: AxiosError) => {
  ElMessage.error({ message: 'Request configuration error', grouping: true })
  return Promise.reject(error)
}

service.interceptors.request.use(requestInterceptor, requestErrorInterceptor)

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string | null) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

const handleBusinessError = (response: AxiosResponse<ApiResponse>, config: RequestConfig) => {
  const data = response.data
  const requestUrl = config.url ?? ''
  // 优先展示后端返回文案
  const errorMessage = data?.msg || 'Request failed'

  switch (Number(data?.code)) {
    case 401: {
      // refresh 失败由 refreshUserToken 自行处理，避免 interceptor logout 与路由守卫形成循环
      if (isRefreshTokenRequest(requestUrl)) {
        isRefreshing = false
        processQueue(new Error(errorMessage), null)
        return Promise.reject(new Error(errorMessage))
      }
      ElMessage.error({ message: errorMessage, grouping: true })
      const userStore = useUserStore()
      void userStore.logout()
      return Promise.reject(new Error(errorMessage))
    }
    case 403:
      // API 无权限：仅提示，不强制重新登录
      ElMessage.error({ message: errorMessage, grouping: true })
      return Promise.reject(new Error(errorMessage))
    default:
      ElMessage.error({ message: errorMessage, grouping: true })
      return Promise.reject(new Error(errorMessage))
  }
}

const responseSuccessHandler = (response: AxiosResponse<ApiResponse>) => {
  const config = response.config as RequestConfig
  removePendingRequest(config)

  if (response.request?.responseType === 'blob') {
    return response
  }

  const data = response.data
  // 以业务 code 为准：HTTP 200 但 code≠200 仍走业务错误（401 重新登录 / 403 无权限）
  if (data && Number(data.code) === 200) {
    if (config.showSuccessMessage && data?.msg) {
      ElMessage.success({ message: data.msg, grouping: true })
    }
    return response
  }

  if (data && data.code != null) {
    return handleBusinessError(response, config)
  }

  // 无统一业务包装时，兼容纯 HTTP 200
  if (response.status === 200) {
    return response
  }

  return handleBusinessError(response, config)
}

const retryOriginalRequest = (serviceInstance: AxiosInstance, originalRequest: RequestConfig) => {
  const userStore = useUserStore()
  originalRequest.headers = {
    ...originalRequest.headers,
    Authorization: `${userStore.token}`,
  }
  return serviceInstance(originalRequest)
}

const responseErrorHandler = async (error: AxiosError) => {
  const originalRequest = (error.config || {}) as RequestConfig
  removePendingRequest(originalRequest)

  if (axios.isCancel(error)) {
    return Promise.reject(error)
  }

  const requestUrl = originalRequest.url ?? ''

  if (error.response?.status === 401 && isRefreshTokenRequest(requestUrl)) {
    isRefreshing = false
    processQueue(error, null)
    return Promise.reject(error)
  }

  if (
    error.response?.status === 401 &&
    !originalRequest._retry &&
    !isRefreshTokenRequest(requestUrl)
  ) {
    if (isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => retryOriginalRequest(service, originalRequest))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const userStore = useUserStore()
      const refreshResult = await userStore.refreshUserToken()
      if (refreshResult.success) {
        processQueue(null, userStore.token)
        return retryOriginalRequest(service, originalRequest)
      }

      const refreshError = new Error(refreshResult.message || 'Token refresh failed')
      processQueue(refreshError, null)
      return Promise.reject(refreshError)
    } catch (refreshError) {
      processQueue(refreshError, null)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }

  let errorMessage = 'Network request failed'
  if (error.response) {
    switch (error.response.status) {
      case 400:
        errorMessage = 'Bad request'
        break
      case 401:
        errorMessage = 'Login expired, please log in again'
        useUserStore().logout()
        break
      case 403:
        errorMessage = 'Access denied'
        break
      case 404:
        errorMessage = 'Request URL not found'
        break
      case 408:
        errorMessage = 'Request timeout'
        break
      case 500:
        errorMessage = 'Internal server error'
        break
      case 502:
        errorMessage = 'Bad gateway'
        break
      case 503:
        errorMessage = 'Service unavailable'
        break
      case 504:
        errorMessage = 'Gateway timeout'
        break
      default:
        errorMessage = `Connection error ${error.response.status}`
    }
  } else if (error.code === 'ECONNABORTED') {
    errorMessage = 'Request timeout'
  } else if (error.request) {
    errorMessage = 'Network connection error'
  } else if (error.message) {
    errorMessage = error.message
  }

  ElMessage.error({
    message: (error.response?.data as { msg?: string } | undefined)?.msg || errorMessage,
    grouping: true,
  })
  return Promise.reject(error)
}

service.interceptors.response.use(responseSuccessHandler, responseErrorHandler)

class Request {
  private static getAxiosInstance(): AxiosInstance {
    return service
  }

  static async get<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await Request.getAxiosInstance().get<ApiResponse<T>>(url, {
      params,
      ...config,
    })
    return response.data
  }

  static async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await Request.getAxiosInstance().post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  static async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await Request.getAxiosInstance().put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  static async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await Request.getAxiosInstance().delete<ApiResponse<T>>(url, config)
    return response.data
  }

  static async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await Request.getAxiosInstance().patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  static async upload<T = any>(
    url: string,
    file: File,
    data?: Record<string, unknown>,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(data || {}).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    const response = await Request.getAxiosInstance().post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  static async getUrl(url: string, params?: any, config?: RequestConfig): Promise<Blob> {
    const response = await Request.getAxiosInstance().get<Blob>(url, {
      params,
      responseType: 'blob',
      ...config,
    })
    return response.data
  }

  static async download(
    url: string,
    params?: any,
    filename?: string,
    config?: RequestConfig,
  ): Promise<void> {
    try {
      const response = await Request.getAxiosInstance().get<Blob>(url, {
        params,
        responseType: 'blob',
        ...config,
      })
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || `download_${Date.now()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      ElMessage.success({ message: 'File downloaded successfully', grouping: true })
    } catch (error) {
      console.error('File download failed:', error)
      ElMessage.error({ message: 'File download failed', grouping: true })
    }
  }
}

export const cancelAllPendingRequests = () => {
  pendingRequests.forEach(({ cancel, skipRouteCancel }, key) => {
    // 应用级共享数据（站点列表等）跨路由存活，不随导航取消
    if (skipRouteCancel) {
      return
    }
    cancel('Request canceled due to route change')
    pendingRequests.delete(key)
  })
  syncGlobalLoading()
}

export default Request
