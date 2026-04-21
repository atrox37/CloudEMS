/**
 * 将路由参数等转为整数型站点 ID；非法则返回 null（不抛错，便于路由守卫与表单场景）。
 */
export function tryNumericStationId(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null
  }
  const s = String(Array.isArray(value) ? value[0] : value).trim()
  if (s === '') return null
  const n = Number.parseInt(s, 10)
  if (!Number.isFinite(n)) {
    return null
  }
  return n
}

/**
 * 请求后端前使用：保证请求体中的 stationId 为 number。
 */
export function toNumericStationId(value: unknown): number {
  const n = tryNumericStationId(value)
  if (n === null) {
    throw new TypeError(`Invalid stationId: ${String(value)}`)
  }
  return n
}
