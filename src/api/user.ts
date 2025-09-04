import { defaultRequest } from '@/utils/request'
import MD5 from 'crypto-js/md5'
import type {
  LoginParams,
  LoginResponse,
  UpdateUserParams,
  UserInfo,
  ApiResponse,
  UserAddParams,
} from '@/types/user'

// 用户相关API接口
export const userApi = {
  /**
   * 用户登录
   * @param params 登录参数
   * @returns 登录响应
   */
  login(params: LoginParams): Promise<ApiResponse<LoginResponse>> {
    return defaultRequest.post('auth/login', params)
  },
  /**
   * 用户登出
   * @returns 登出响应
   */
  logout(refreshToken: string): Promise<ApiResponse<null>> {
    return defaultRequest.post('auth/logout', { refresh_token: refreshToken })
  },

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  getUserInfo(): Promise<ApiResponse<UserInfo>> {
    return defaultRequest.get('auth/me')
  },

  /**
   * 刷新Token
   * @param refreshToken 刷新令牌
   * @returns 新的Token
   */
  refreshToken(
    refreshToken: string,
  ): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return defaultRequest.post('auth/refresh', { refresh_token: refreshToken })
  },
  /**
   * 获取用户详情
   * @param userId 用户ID
   * @returns 用户详情
   */
  getUserDetail(userId: number): Promise<ApiResponse<UserInfo>> {
    return defaultRequest.get(`auth/users/${userId}`)
  },
  /**
   * 添加用户
   * @param params 用户信息
   * @returns 添加响应
   */
  addUser(params: UserAddParams): Promise<ApiResponse<UserInfo>> {
    // 对密码进行MD5加密
    const encryptedParams = {
      ...params,
      password: params.password ? MD5(params.password).toString() : undefined,
    }
    return defaultRequest.post('auth/register', encryptedParams)
  },
  /**
   * 更新用户
   * @param userId 用户ID
   * @param params 用户信息
   * @returns 更新响应
   */
  updateUser(userId: number, params: UpdateUserParams): Promise<ApiResponse<UserInfo>> {
    return defaultRequest.put(`auth/users/${userId}`, params)
  },
  /**
   * 删除用户
   * @param userId 用户ID
   * @returns 删除响应
   */
  deleteUser(userId: number): Promise<ApiResponse<null>> {
    return defaultRequest.delete(`auth/users/${userId}`)
  },
}
