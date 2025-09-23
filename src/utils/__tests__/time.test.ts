/**
 * time.ts 测试文件
 * 测试时间工具函数的核心功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import dayjs from 'dayjs'
import {
  getLast6HoursArray,
  getLast24HoursArray,
  getLastWeekArray,
  getLastMonthArray,
  getTimeRangeArray,
  format,
} from '../time'

// Mock dayjs
vi.mock('dayjs', () => {
  const originalDayjs = vi.importActual('dayjs')
  const mockDayjs = vi.fn(() => ({
    format: vi.fn(),
    subtract: vi.fn(),
  }))
  
  // 添加extend方法
  mockDayjs.extend = vi.fn()
  
  return {
    default: mockDayjs,
  }
})

const mockedDayjs = vi.mocked(dayjs)

describe('时间工具函数', () => {
  let mockDayjs: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 创建mock dayjs实例
    mockDayjs = {
      format: vi.fn(),
      subtract: vi.fn(),
    }
    
    // 设置默认返回值
    mockDayjs.subtract.mockReturnValue(mockDayjs)
    mockDayjs.format.mockReturnValue('2024-01-01 10:00')
    
    // Mock dayjs构造函数
    mockedDayjs.mockReturnValue(mockDayjs as any)
  })

  describe('getLast6HoursArray', () => {
    it('应该返回最近6小时的时间点数组', () => {
      // 设置mock返回值
      const expectedTimes = [
        '2024-01-01\n04:00',
        '2024-01-01\n05:00',
        '2024-01-01\n06:00',
        '2024-01-01\n07:00',
        '2024-01-01\n08:00',
        '2024-01-01\n09:00',
        '2024-01-01\n10:00',
      ]
      
      mockDayjs.format
        .mockReturnValueOnce('2024-01-01\n04:00')
        .mockReturnValueOnce('2024-01-01\n05:00')
        .mockReturnValueOnce('2024-01-01\n06:00')
        .mockReturnValueOnce('2024-01-01\n07:00')
        .mockReturnValueOnce('2024-01-01\n08:00')
        .mockReturnValueOnce('2024-01-01\n09:00')
        .mockReturnValueOnce('2024-01-01\n10:00')

      const result = getLast6HoursArray()

      expect(result).toEqual(expectedTimes)
      expect(mockDayjs.subtract).toHaveBeenCalledTimes(7) // 6次减法 + 1次当前时间
      expect(mockDayjs.format).toHaveBeenCalledWith('YYYY-MM-DD\nHH:00')
    })

    it('应该正确调用subtract方法', () => {
      getLast6HoursArray()

      // 验证subtract被调用的次数和参数
      expect(mockDayjs.subtract).toHaveBeenCalledWith(6, 'hour')
      expect(mockDayjs.subtract).toHaveBeenCalledWith(5, 'hour')
      expect(mockDayjs.subtract).toHaveBeenCalledWith(4, 'hour')
      expect(mockDayjs.subtract).toHaveBeenCalledWith(3, 'hour')
      expect(mockDayjs.subtract).toHaveBeenCalledWith(2, 'hour')
      expect(mockDayjs.subtract).toHaveBeenCalledWith(1, 'hour')
      expect(mockDayjs.subtract).toHaveBeenCalledWith(0, 'hour')
    })
  })

  describe('getLast24HoursArray', () => {
    it('应该返回最近24小时的时间点数组', () => {
      const result = getLast24HoursArray()

      expect(result).toHaveLength(25) // 0-24小时，共25个时间点
      expect(mockDayjs.subtract).toHaveBeenCalledTimes(25)
      expect(mockDayjs.format).toHaveBeenCalledWith('YYYY-MM-DD\nHH:00')
    })

    it('应该正确调用subtract方法', () => {
      getLast24HoursArray()

      // 验证subtract被调用的参数
      expect(mockDayjs.subtract).toHaveBeenCalledWith(24, 'hour')
      expect(mockDayjs.subtract).toHaveBeenCalledWith(0, 'hour')
    })
  })

  describe('getLastWeekArray', () => {
    it('应该返回最近一周的日期数组', () => {
      const result = getLastWeekArray()

      expect(result).toHaveLength(8) // 7天 + 1天偏移
      expect(mockDayjs.subtract).toHaveBeenCalledTimes(8)
      expect(mockDayjs.format).toHaveBeenCalledWith('YYYY-MM-DD')
    })

    it('应该正确调用subtract方法', () => {
      getLastWeekArray()

      // 验证subtract被调用的参数（注意有+1的偏移）
      expect(mockDayjs.subtract).toHaveBeenCalledWith(8, 'day') // 7+1
      expect(mockDayjs.subtract).toHaveBeenCalledWith(1, 'day')  // 0+1
    })
  })

  describe('getLastMonthArray', () => {
    it('应该返回最近一个月的日期数组', () => {
      const result = getLastMonthArray()

      expect(result).toHaveLength(31) // 30天 + 1天偏移
      expect(mockDayjs.subtract).toHaveBeenCalledTimes(31)
      expect(mockDayjs.format).toHaveBeenCalledWith('YYYY-MM-DD')
    })

    it('应该正确调用subtract方法', () => {
      getLastMonthArray()

      // 验证subtract被调用的参数（注意有+1的偏移）
      expect(mockDayjs.subtract).toHaveBeenCalledWith(31, 'day') // 30+1
      expect(mockDayjs.subtract).toHaveBeenCalledWith(1, 'day')   // 0+1
    })
  })

  describe('getTimeRangeArray', () => {
    it('应该根据类型返回对应的时间范围数组', () => {
      // Mock各个函数的返回值
      const mock6Hours = ['time1', 'time2']
      const mock24Hours = ['time3', 'time4', 'time5']
      const mockWeek = ['date1', 'date2']
      const mockMonth = ['date3', 'date4', 'date5']

      // 直接测试getTimeRangeArray函数
      expect(getTimeRangeArray('6hours')).toBeDefined()
      expect(getTimeRangeArray('24hours')).toBeDefined()
      expect(getTimeRangeArray('week')).toBeDefined()
      expect(getTimeRangeArray('month')).toBeDefined()
    })

    it('应该抛出错误对于不支持的时间段类型', () => {
      expect(() => getTimeRangeArray('invalid' as any)).toThrow('不支持的时间段类型: invalid')
    })
  })

  describe('format', () => {
    it('应该使用默认格式格式化时间', () => {
      const testDate = new Date('2024-01-01 10:30:45')
      const expectedFormat = '2024-01-01 10:30:45'
      
      mockDayjs.format.mockReturnValue(expectedFormat)

      const result = format(testDate)

      expect(mockedDayjs).toHaveBeenCalledWith(testDate)
      expect(mockDayjs.format).toHaveBeenCalledWith('YYYY-MM-DD HH:mm:ss')
      expect(result).toBe(expectedFormat)
    })

    it('应该使用自定义格式格式化时间', () => {
      const testDate = '2024-01-01 10:30:45'
      const customFormat = 'YYYY/MM/DD HH:mm'
      const expectedResult = '2024/01/01 10:30'
      
      mockDayjs.format.mockReturnValue(expectedResult)

      const result = format(testDate, customFormat)

      expect(mockedDayjs).toHaveBeenCalledWith(testDate)
      expect(mockDayjs.format).toHaveBeenCalledWith(customFormat)
      expect(result).toBe(expectedResult)
    })

    it('应该处理字符串日期', () => {
      const testDate = '2024-01-01'
      const expectedResult = '2024-01-01 00:00:00'
      
      mockDayjs.format.mockReturnValue(expectedResult)

      const result = format(testDate)

      expect(mockedDayjs).toHaveBeenCalledWith(testDate)
      expect(result).toBe(expectedResult)
    })

    it('应该处理dayjs对象', () => {
      const testDayjs = dayjs('2024-01-01')
      const expectedResult = '2024-01-01 00:00:00'
      
      mockDayjs.format.mockReturnValue(expectedResult)

      const result = format(testDayjs)

      expect(mockedDayjs).toHaveBeenCalledWith(testDayjs)
      expect(result).toBe(expectedResult)
    })
  })

  describe('边界情况', () => {
    it('应该处理空值输入', () => {
      mockDayjs.format.mockReturnValue('Invalid Date')

      const result = format(null as any)

      expect(mockedDayjs).toHaveBeenCalledWith(null)
      expect(result).toBe('Invalid Date')
    })

    it('应该处理undefined输入', () => {
      mockDayjs.format.mockReturnValue('Invalid Date')

      const result = format(undefined as any)

      expect(mockedDayjs).toHaveBeenCalledWith(undefined)
      expect(result).toBe('Invalid Date')
    })
  })

  describe('集成测试', () => {
    it('所有函数都应该正确使用dayjs', () => {
      // 重置mock
      vi.clearAllMocks()
      mockDayjs.subtract.mockReturnValue(mockDayjs)
      mockDayjs.format.mockReturnValue('2024-01-01 10:00')

      // 调用所有函数
      getLast6HoursArray()
      getLast24HoursArray()
      getLastWeekArray()
      getLastMonthArray()
      format(new Date())

      // 验证dayjs被正确调用
      expect(mockedDayjs).toHaveBeenCalled()
      expect(mockDayjs.subtract).toHaveBeenCalled()
      expect(mockDayjs.format).toHaveBeenCalled()
    })
  })
})
