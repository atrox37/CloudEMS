import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import dayjs from 'dayjs'
import {
  format,
  getLast24HoursArray,
  getLast6HoursArray,
  getLastMonthArray,
  getLastWeekArray,
  getTimeRangeArray,
} from '../time'

describe('time.ts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the start and end timestamps for the last 6 hours', () => {
    expect(getLast6HoursArray()).toEqual([
      dayjs().subtract(6, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ])
  })

  it('returns the start and end timestamps for the last 24 hours, week, and month', () => {
    expect(getLast24HoursArray()).toEqual([
      dayjs().subtract(24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ])

    expect(getLastWeekArray()).toEqual([
      dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ])

    expect(getLastMonthArray()).toEqual([
      dayjs().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss'),
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ])
  })

  it('maps supported range types to the expected helpers', () => {
    expect(getTimeRangeArray('6hours')).toEqual(getLast6HoursArray())
    expect(getTimeRangeArray('1day')).toEqual(getLast24HoursArray())
    expect(getTimeRangeArray('1week')).toEqual(getLastWeekArray())
    expect(getTimeRangeArray('1month')).toEqual(getLastMonthArray())
  })

  it('throws for unsupported range types', () => {
    expect(() => getTimeRangeArray('24hours' as never)).toThrow()
  })

  it('formats values with the default and custom formats', () => {
    const input = '2024-01-01T10:30:45Z'
    expect(format(input)).toBe(dayjs(input).format('YYYY-MM-DD HH:mm:ss'))
    expect(format(input, 'YYYY/MM/DD HH:mm')).toBe(dayjs(input).format('YYYY/MM/DD HH:mm'))
  })
})
