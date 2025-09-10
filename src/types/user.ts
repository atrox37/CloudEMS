// 用户信息接口（根据后端实际返回结构调整）
export interface UserRole {
  id: number
  name_en: string
  name_zh: string
  description: string
}

export interface UserInfo {
  id: number
  username: string
  is_active: boolean
  last_login?: string
  created_at?: string
  updated_at?: string
}


// 登录请求参数
export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

// 登录响应
// export interface LoginResponse {
// }


