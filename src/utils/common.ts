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
/**
 * 根据指定 key，将对象数组转换为以该 key 为属性的对象
 * @param arr 需要转换的对象数组
 * @param key 以此 key 的值作为对象的属性名
 * @returns 以传入 key 属性为索引的新对象
 *
 * @example
 * const arr = [{a: 'x', b: 1}, {a: 'y', b: 2}]
 * arrayToObjectByKey(arr, 'a')
 * // 返回结果: { x: {a: 'x', b: 1}, y: {a: 'y', b: 2} }
 */
export function arrayToObjectByKey<T extends Record<string, any>>(
  arr: T[],
  key: keyof T,
): Record<string, T> {
  const result: Record<string, T> = {}
  if (!Array.isArray(arr)) return result
  arr.forEach((item) => {
    const itemKey = item[key]
    if (itemKey !== undefined && itemKey !== null) {
      result[String(itemKey)] = item
    }
  })
  return result
}
