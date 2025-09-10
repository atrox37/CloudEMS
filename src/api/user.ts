import { defaultRequest } from '@/utils/request'
import type {
  LoginParams,
  UserInfo,
} from '@/types/user'
import type { ApiResponse } from '@/utils/request'
// 用户相关API接口
  /**
   * 用户登录
   * @param params 登录参数
   * @returns 登录响应
   */
  export const userLogin = (params: LoginParams): Promise<ApiResponse<string>> => {
    return defaultRequest.post('/login', params)
  }
  /**
   * 用户登出
   * @returns 登出响应
   */
  export const userLogout = (): Promise<ApiResponse<null>> => {
    return defaultRequest.post('/auth/logout')
  }

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  export const userGetUserInfo = (): Promise<ApiResponse<UserInfo>> => {
    return defaultRequest.get('/auth/me')
  }

  // /**
  //  * 刷新Token
  //  * @param refreshToken 刷新令牌
  //  * @returns 新的Token
  //  */
  // export const userRefreshToken = (
  //     refreshToken: string,
  // ): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
  //   return defaultRequest.post('auth/refresh', { refresh_token: refreshToken })
  // }


