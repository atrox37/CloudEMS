/**
 * Axios 请求封装
 * 提供统一的HTTP请求配置、拦截器和错误处理
 */

import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useGlobalStore } from '@/stores/global'

// 存储所有pending的请求
const pendingRequests = reactive(new Map())

// 延迟获取router实例，避免在模块顶层使用useRouter
let routerInstance: any = null
const getRouter = () => {
  if (!routerInstance) {
    routerInstance = useRouter()
  }
  return routerInstance
}

watch(pendingRequests, () => {
  const globalStore = useGlobalStore()
  globalStore.loading = pendingRequests.size > 0
})
// 定义响应数据的通用接口
export interface ApiResponse<T = any> {
  code: number // 响应状态码
  msg: string // 响应消息
  data: T // 响应数据
}
// 统一静态方法配置
export type RequestConfig = AxiosRequestConfig
const WHITE_LIST = ['/user-app/login', '/sys-app/common/captcha']
/**
 * 创建axios实例
 * 设置基础配置项
 */
const service = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || '/user-app'}`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  withCredentials: false,
})

// 已统一为单一请求通道

/**
 * 请求拦截器
 * 在发送请求之前做一些统一处理
 */
const requestInterceptor = (config: any) => {
  // 生成请求的唯一标识
  const params = { ...(config.params || {}) }
  const requestKey = `${config.method}-${config.url}-${JSON.stringify(params)}-${JSON.stringify(config?.data)}`
  console.log(requestKey, 'requestKey1')

  // 如果存在相同的pending请求，取消它
  if (pendingRequests.has(requestKey)) {
    const cancelToken = pendingRequests.get(requestKey)
    cancelToken.cancel('请求被取消')
    pendingRequests.delete(requestKey)
  }

  // 创建新的cancelToken
  const cancelToken = axios.CancelToken.source()
  config.cancelToken = cancelToken.token
  pendingRequests.set(requestKey, cancelToken)

  // 从localStorage获取token并添加到请求头
  const userStore = useUserStore()
  const token = userStore.token
  if (token && config.headers) {
    // config.headers.Authorization = `Bearer ${token}`
    config.headers.Authorization = `${token}`
  } else if (!WHITE_LIST.includes(config.url)) {
    
    userStore.logout()
    // const router = getRouter()
    // router.push({
    //   path: '/login',
    //   query: { redirect: router.currentRoute.value.path, ...router.currentRoute.value.query },
    // })
  }

  if (config.url?.includes('/login')) {
    config.headers['LOGINTYPE'] = 'PASS'
  }
  // 如果是POST/PUT/PATCH请求且没有设置Content-Type，设置为json
  if (['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
  }

  // 添加时间戳防止缓存 (GET请求)
  if (config.method?.toLowerCase() === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now(),
    }
  }

  console.log(`[请求] ${config.method?.toUpperCase()} ${config.url}`, config)
  return config
}

const requestErrorInterceptor = (error: any) => {
  console.error('[请求错误]', error)
  ElMessage.error('Request configuration error')
  return Promise.reject(error)
}

service.interceptors.request.use(requestInterceptor, requestErrorInterceptor)

// // 用于防止重复刷新token的标志
// let isRefreshing = false
// // 存储等待token刷新的请求队列
// let failedQueue: Array<{
//   resolve: (value: any) => void
//   reject: (error: any) => void
// }> = []

// // 处理队列中的请求
// const processQueue = (error: any, token: string | null = null) => {
//   failedQueue.forEach(({ resolve, reject }) => {
//     if (error) {
//       reject(error)
//     } else {
//       resolve(token)
//     }
//   })

//   failedQueue = []
// }

/**
 * 响应拦截器工厂函数
 * 创建统一的响应拦截器，避免代码重复
 */
const createResponseInterceptor = (serviceInstance: any, logPrefix: string = '') => {
  // 响应成功时的处理
  const responseSuccessHandler = (response: any) => {
    // 请求完成后，从pendingRequests中移除
    console.log(response, 'response1')

    const params = { ...(response.config?.params || {}) }
    if ('_t' in params) {
      delete params._t
    }
    const requestKey = `${response.config.method}-${response.config.url}-${JSON.stringify(params)}-${response.config?.data}`
    // console.log(response.config?.data,requestKey,requestKey==='post-sys-app/sys_user/_page-{}-{"current":1,"size":20,"terms":[{"column":"t.state","value":1}]}', 'requestKey2')
    pendingRequests.delete(requestKey)
    console.log(pendingRequests, 'pendingRequests')

    console.log(
      `${logPrefix}[响应] ${response.config.method?.toUpperCase()} ${response.config.url}`,
      response,
    )

    const { data } = response
    const customConfig = response.config as any

    // 检查业务状态码
    // 如果返回的是blob类型，直接认为请求成功，否则判断业务code或success
    if (
      response.request?.responseType === 'blob' ||
      (data && data.code === 200) ||
      response.status === 200
    ) {
      // 请求成功
      if (customConfig.showSuccessMessage && data.msg) {
        ElMessage.success(data.msg)
      }
      return response
    } else {
      // 业务逻辑错误
      let errorMessage = data.msg || 'Request failed'
      // 根据不同的业务状态码进行处理
      switch (data.code) {
        case 401:
          // 未授权，清除token并跳转到登录页
          const userStore = useUserStore()
          
          userStore.logout()
          errorMessage = 'Login expired, please log in again'
          ElMessage.error(errorMessage)
          break
        case 403:
          errorMessage = 'No permission to access this resource'
          break
        case 404:
          errorMessage = 'Requested resource not found'
          break
        case 500:
          errorMessage = 'Internal server error'
          break
        default:
          break
      }
      ElMessage.error(response.data.msg || errorMessage)
      return Promise.reject(new Error(errorMessage))
    }
  }

  // 响应失败时的处理
  const responseErrorHandler = async (error: any) => {
    console.log(error, 'error1')

    // 如果是取消请求的错误，不显示错误信息
    if (axios.isCancel(error)) {
      console.log(`${logPrefix}[请求已取消] ${error.message}`)
      return Promise.reject(error)
    }

    // 请求完成后，从pendingRequests中移除
    // 生成requestKey时，去除params中的_t参数
    const params = { ...(error.config?.params || {}) }
    if ('_t' in params) {
      delete params._t
    }
    const requestKey = `${error.config?.method}-${error.config?.url}-${JSON.stringify(params)}-${JSON.stringify(error.config?.data)}`
    console.log(requestKey, 'requestKey3')
    if (requestKey) {
      pendingRequests.delete(requestKey)
    }

    console.error(`${logPrefix}[响应错误]`, error)

    // const originalRequest = error.config

    // 处理401错误 - 自动刷新token
    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   if (isRefreshing) {
    //     // 如果正在刷新token，将请求加入队列
    //     return new Promise((resolve, reject) => {
    //       failedQueue.push({ resolve, reject })
    //     })
    //       .then((token) => {
    //         originalRequest.headers['Authorization'] = `Bearer ${token}`
    //         return serviceInstance(originalRequest)
    //       })
    //       .catch((err) => {
    //         return Promise.reject(err)
    //       })
    //   }

    //   originalRequest._retry = true
    //   isRefreshing = true
    //   try {
    //     const userStore = useUserStore()
    //     const refreshToken = userStore.refreshToken

    //     if (!refreshToken) {
    //       throw new Error('No refresh token available')
    //     }

    //     // 调用刷新token的API
    //     const response = await service.post('auth/refresh', {
    //       refresh_token: refreshToken,
    //     })
    //     // 注意：刷新token接口也可能返回401或失败
    //     if (response.data && response.data.success) {
    //       // 更新store中的token
    //       userStore.token = response.data.data.access_token
    //       userStore.refreshToken = response.data.data.refresh_token

    //       // 更新当前请求的Authorization头
    //       originalRequest.headers['Authorization'] = `Bearer ${response.data.data.access_token}`

    //       // 处理队列中的请求
    //       processQueue(null, response.data.data.access_token)

    //       // 重试原请求
    //       return serviceInstance(originalRequest)
    //     } else {
    //       // 刷新token接口返回失败
    //       throw new Error(response.data?.msg || 'Token refresh failed')
    //     }
    //   } catch (refreshError: any) {
    //     // 清除用户数据并跳转到登录页
    //     const userStore = useUserStore()
    //     userStore.clearUserData()

    //     // 处理队列中的请求
    //     processQueue(refreshError, null)
    //     window.location.href = '/login'
    //     return Promise.reject(refreshError)
    //   } finally {
    //     isRefreshing = false
    //   }
    // }

    // 处理其他错误
    let errorMessage = 'Network request failed'

    if (error.response) {
      // 服务器返回错误状态码
      const { status, statusText } = error.response

      switch (status) {
        case 400:
          errorMessage = 'Bad request'
          break
        case 401:
          errorMessage = 'Login expired, please log in again'
          const userStore = useUserStore()
          
          userStore.logout()
          ElMessage.error(errorMessage)
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
          errorMessage = `Connection error ${status}: ${statusText}`
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout'
      } else {
        errorMessage = 'Network connection error'
      }
    } else {
      // 请求配置出错
      errorMessage = error.message || 'Request configuration error'
    }
    ElMessage.error(error.response?.data?.msg || errorMessage)
    return Promise.reject(error)
  }

  return [responseSuccessHandler, responseErrorHandler]
}

// 为服务实例添加响应拦截器
service.interceptors.response.use(...createResponseInterceptor(service))

/**
 * 封装的请求方法类
 */
class Request {
  private axiosInstance: any

  constructor(axiosInstance: any) {
    this.axiosInstance = axiosInstance
  }

  // 静态：统一返回单一 axios 实例
  private static getAxiosInstance() {
    return service
  }

  /**
   * 静态 GET 请求
   */
  static async get<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const axiosIns = Request.getAxiosInstance()
    const response = await axiosIns.get(url, { params, ...config })
    return response.data
  }

  /**
   * 静态 POST 请求
   */
  static async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const axiosIns = Request.getAxiosInstance()
    const response = await axiosIns.post(url, data, config)
    return response.data
  }

  /**
   * 静态 PUT 请求
   */
  static async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const axiosIns = Request.getAxiosInstance()
    const response = await axiosIns.put(url, data, config)
    return response.data
  }

  /**
   * 静态 DELETE 请求
   */
  static async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const axiosIns = Request.getAxiosInstance()
    const response = await axiosIns.delete(url, config)
    return response.data
  }

  /**
   * 静态 PATCH 请求
   */
  static async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const axiosIns = Request.getAxiosInstance()
    const response = await axiosIns.patch(url, data, config)
    return response.data
  }

  /**
   * 静态 文件上传
   */
  static async upload<T = any>(
    url: string,
    file: File,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    if (data) {
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key])
      })
    }
    const axiosIns = Request.getAxiosInstance()
    const response = await axiosIns.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  /**
   * 静态 获取图片/文件 Blob
   */
  static async getUrl<T = any>(url: string, params?: any, config?: RequestConfig): Promise<Blob> {
    const axiosIns = Request.getAxiosInstance()
    const response = await axiosIns.get(url, { params, responseType: 'blob', ...config })
    return response.data
  }

  /**
   * 静态 下载文件
   */
  static async download(url: string, params?: any, filename?: string, config?: RequestConfig): Promise<void> {
    try {
      const axiosIns = Request.getAxiosInstance()
      const response = await axiosIns.get(url, {
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
      ElMessage.success('File downloaded successfully')
    } catch (error) {
      console.error('File download failed:', error)
      ElMessage.error('File download failed')
    }
  }

 
}

// 不再导出实例形式

// 取消所有pending请求的方法
export const cancelAllPendingRequests = () => {
  pendingRequests.forEach((cancelToken) => {
    cancelToken.cancel('路由切换，请求被取消')
  })
  pendingRequests.clear()
}

// 导出仅限默认类与工具方法
export default Request
