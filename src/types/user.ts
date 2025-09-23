// 用户信息接口（根据后端实际返回结构调整）
export interface UserRole {
  id: number
  name_en: string
  name_zh: string
  description: string
}
export interface UserNotification {
  sms?: string //电话
  email?: string //email
  systemNotify: { sms: boolean; email: boolean } //通知设置1
  reminders: { sms: boolean; email: boolean } //通知设置2
  dayReport: { sms: boolean; email: boolean } //通知设置3
  weekReport: { sms: boolean; email: boolean } //通知设置4
}
export interface UserInfo {
  sysUserPo: {
    id: number
    username: string //用户名
    state: number
    roleId: number
    orgId: number
    email: string
    phone: string
    metadata: UserNotification
    updateTime: string
  }
  dimensionPo: {
    id: number
    name: string //所属机构
    parentId: number
  }
  sysRolePo: {
    id: number
    roleName: string //角色
    orgId: number
    updateTime: string
  }
}

// 登录请求参数
export interface LoginParams {
  account: string
  password: string
  captcha: string
  remember?: boolean
}

// 登录响应
// export interface LoginResponse {
// }
export interface RoleListItem {
  sysRolePo: {
    id: number //角色id
    roleName: string //角色名称
    orgId: number
    updateTime: string
  }
  sysDimensionPo: {
    id: number
    name: string
    parentId: number
  }
}
export interface RoleList {
  records: RoleListItem[]
  total: number
  size: number
  current: number
  pages: number
}
