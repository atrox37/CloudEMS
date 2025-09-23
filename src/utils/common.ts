/**
 * 移除对象中值为 null、''、undefined 的键值对
 * @param obj 需要处理的对象
 * @returns 新对象，已去除无效值
 */
export function removeEmpty(obj: Record<string, any>): Record<string, any> {
  if (typeof obj !== 'object' || obj === null) return {}
  const result: Record<string, any> = {}
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    if (value !== null && value !== '' && value !== undefined) {
      result[key] = value
    }
  })
  return result
}
