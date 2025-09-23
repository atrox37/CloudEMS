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
 * @returns {string[]} 形如 ['2024-06-01 10:00', '2024-06-01 11:00']
 */
export function getLast6HoursArray(): string[] {
  const now = dayjs()
  return [
    now.subtract(5, 'hour').format('YYYY-MM-DD HH:00:00'),
    now.subtract(-1, 'hour').format('YYYY-MM-DD HH:00:00'),
  ]
}

/**
 * 获取最近24小时的每小时时间点数组
 * @returns {string[]} 形如 ['2024-06-01 10:00', '2024-06-01 11:00']
 */
export function getLast24HoursArray(): string[] {
  const now = dayjs()
  return [
    now.subtract(23, 'hour').format('YYYY-MM-DD HH:00:00'),
    now.subtract(-1, 'hour').format('YYYY-MM-DD HH:00:00'),
  ]
}

/**
 * 获取最近一周的每天日期数组
 * @returns {string[]} 形如 ['2024-06-01', '2024-06-02']
 */
export function getLastWeekArray(): string[] {
  const now = dayjs()
  return [now.subtract(6, 'day').format('YYYY-MM-DD 00:00:00'), now.format('YYYY-MM-DD 23:59:59')]
}

/**
 * 获取一个月前的时间
 * @returns {string[]} 形如 ['2024-05-01 00:00:00', '2024-05-31 23:59:59']
 */
export function getLastMonthArray(): string[] {
  // 获取当前时间
  const now = dayjs()
  // 获取一个月前的时间
  return [
    now.subtract(1, 'month').subtract(-1, 'day').format('YYYY-MM-DD 00:00:00'),
    now.format('YYYY-MM-DD 23:59:59'),
  ]
}

/**
 * 获取指定时间范围的时间点数组
 * @param type 时间段类型
 * @returns 时间点字符串数组
 */
export function getTimeRangeArray(type: '6hours' | '1day' | '1week' | '1month'): string[] {
  switch (type) {
    case '6hours':
      return getLast6HoursArray()
    case '1day':
      return getLast24HoursArray()
    case '1week':
      return getLastWeekArray()
    case '1month':
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

// /**
//  * 根据两个时间的时差，智能返回合适的时间粒度，并返回以此间隔为步的时间点数组
//  * @param startTime 开始时间，格式为 'YYYY-MM-DD HH:mm:ss'
//  * @param endTime 结束时间，格式为 'YYYY-MM-DD HH:mm:ss'
//  * @returns { step: string }
//  */
// export function getSmartTimeStep(startTime: string, endTime: string): string {
//   const start = dayjs(startTime)
//   const end = dayjs(endTime)
//   const startTimestamp = start.unix()
//   const endTimestamp = end.unix()
//   const diffSeconds = Math.abs(endTimestamp - startTimestamp)

//   let step = ''
//   let stepSeconds = 1

//   // 计算合适的步长
//   if (diffSeconds > 15 * 365 * 24 * 60 * 60) {
//     step = '1y'
//     stepSeconds = 365 * 24 * 60 * 60
//   } else if (diffSeconds > 15 * 30 * 24 * 60 * 60) {
//     step = '1M'
//     stepSeconds = 30 * 24 * 60 * 60
//   } else if (diffSeconds > 15 * 7 * 24 * 60 * 60) {
//     step = '1w'
//     stepSeconds = 7 * 24 * 60 * 60
//   } else if (diffSeconds > 24 * 60 * 60) {
//     step = '1d'
//     stepSeconds = 24 * 60 * 60
//   } else {
//     let s = Math.floor(diffSeconds / 15)
//     if (s < 60) {
//       step = `${s}s`
//       stepSeconds = s
//     } else if (s < 3600) {
//       step = `${Math.floor(s / 60)}m`
//       stepSeconds = Math.floor(s / 60) * 60
//     } else if (s < 86400) {
//       step = `${Math.floor(s / 3600)}h`
//       stepSeconds = Math.floor(s / 3600) * 3600
//     } else if (s < 604800) {
//       step = `${Math.floor(s / 86400)}d`
//       stepSeconds = Math.floor(s / 86400) * 86400
//     } else if (s < 2592000) {
//       step = `${Math.floor(s / 604800)}w`
//       stepSeconds = Math.floor(s / 604800) * 604800
//     } else if (s < 31536000) {
//       step = '1M'
//       stepSeconds = 30 * 24 * 60 * 60
//     } else {
//       step = '1y'
//       stepSeconds = 365 * 24 * 60 * 60
//     }
//   }

//   return step
// }
