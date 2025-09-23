import { defaultRequest } from '@/utils/request'
import type { LoginParams, UserInfo, RoleList, UserNotification } from '@/types/user'
import type { UserFormModel } from '@/views/Setting/UserManagement/UserOperationForm.vue'
import type { ApiResponse } from '@/utils/request'
// 用户相关API接口

/**
 * 获取验证码图片（返回Blob对象）
 * @returns Promise<Blob> 验证码图片的二进制数据
 */
export const getVerifyCode = (): Promise<Blob> => {
  return defaultRequest.getUrl('/sys-app/common/captcha')
}

/**
 * 用户登录
 * @param params 登录参数
 * @returns 登录响应
 */
export const userLogin = (params: LoginParams): Promise<ApiResponse<string>> => {
  return defaultRequest.post('/user-app/login', params)
}
/**
 * 用户登出
 * @returns 登出响应
 */
export const userLogout = (): Promise<ApiResponse<null>> => {
  return defaultRequest.post('/user-app/auth/logout')
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const userGetUserInfo = (): Promise<ApiResponse<UserInfo>> => {
  return defaultRequest.get('sys-app/sys_user/_current')
}

export const getRoleList = (params: { current: number }): Promise<ApiResponse<RoleList>> => {
  return defaultRequest.post('sys-app/role/_page', params)
}

export const operationUser = (
  params: UserFormModel | { id: number; state: number },
): Promise<ApiResponse<null>> => {
  return defaultRequest.post('/sys-app/sys_user/_save_or_update', params)
}

export const updateUserNotification = (params: {
  id: number
  email: string
  phone: string
  metadata: UserNotification
}): Promise<ApiResponse<null>> => {
  return defaultRequest.post('/sys-app/sys_user/_save_or_update', params)
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
