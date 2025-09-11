import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/en'

// 扩展dayjs插件
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

/**
 * 获取最近6小时的每小时时间点数组
 * @returns {string[]} 形如 ['2024-06-01 10:00', '2024-06-01 11:00', ...]
 */
export function getLast6HoursArray(): string[] {
  const now = dayjs()
  const arr: string[] = []
  for (let i = 6; i >= 0; i--) {
    arr.push(now.subtract(i, 'hour').format('YYYY-MM-DD\nHH:00'))
  }
  return arr
}

/**
 * 获取最近24小时的每小时时间点数组
 * @returns {string[]} 形如 ['2024-06-01 10:00', ...]
 */
export function getLast24HoursArray(): string[] {
  const now = dayjs()
  const arr: string[] = []
  for (let i = 24; i >= 0; i--) {
    arr.push(now.subtract(i, 'hour').format('YYYY-MM-DD\nHH:00'))
  }
  return arr
}

/**
 * 获取最近一周的每天日期数组
 * @returns {string[]} 形如 ['2024-06-01', '2024-06-02', ...]
 */
export function getLastWeekArray(): string[] {
  const now = dayjs()
  const arr: string[] = []
  for (let i = 7; i >= 0; i--) {
    arr.push(now.subtract(i, 'day').format('YYYY-MM-DD'))
  }
  return arr
}

/**
 * 获取最近一个月的每天日期数组
 * @returns {string[]} 形如 ['2024-05-01', ...]
 */
export function getLastMonthArray(): string[] {
  const now = dayjs()
  const arr: string[] = []
  for (let i = 30; i >= 0; i--) {
    arr.push(now.subtract(i, 'day').format('YYYY-MM-DD'))
  }
  return arr
}

/**
 * 获取指定时间范围的时间点数组
 * @param type 时间段类型
 * @returns 时间点字符串数组
 */
export function getTimeRangeArray(type: '6hours' | '24hours' | 'week' | 'month'): string[] {
  switch (type) {
    case '6hours':
      return getLast6HoursArray()
    case '24hours':
      return getLast24HoursArray()
    case 'week':
      return getLastWeekArray()
    case 'month':
      return getLastMonthArray()
    default:
      throw new Error(`不支持的时间段类型: ${type}`)
  }
}

/**
 * 格式化时间为指定格式
 * @param date 日期对象或字符串
 * @param format 格式字符串，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function format(date: string | Date | dayjs.Dayjs, format: string = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(date).format(format)
}
