/** 系统允许的登录角色（与权限路由 meta.roles 一致） */
export const APP_ROLES = ['Admin', 'Engineer', 'Viewer'] as const

export type AppRole = (typeof APP_ROLES)[number]

export function isAppRole(value: string): value is AppRole {
  return (APP_ROLES as readonly string[]).includes(value)
}
