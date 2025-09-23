/**
 * timePicker.ts 测试文件
 * 测试时间选择器限制工具的核心功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive } from 'vue'
import { useTimePickerLimits, validateTimeRange, formatTime, type TimePickerForm } from '../timePicker'

describe('时间选择器限制工具', () => {
  describe('useTimePickerLimits', () => {
    let form: TimePickerForm

    beforeEach(() => {
      form = reactive({
        startTime: null,
        endTime: null,
      })
    })

    describe('时间变化处理', () => {
      it('开始时间变化时应该清空晚于结束时间的结束时间', () => {
        const { onStartTimeChange } = useTimePickerLimits(form)
        
        // 设置结束时间为10:00
        form.endTime = new Date('2024-01-01 10:00:00')
        // 设置开始时间为11:00（晚于结束时间）
        form.startTime = new Date('2024-01-01 11:00:00')
        
        onStartTimeChange()
        
        expect(form.endTime).toBe('')
      })

      it('结束时间变化时应该清空早于开始时间的开始时间', () => {
        const { onEndTimeChange } = useTimePickerLimits(form)
        
        // 设置开始时间为11:00
        form.startTime = new Date('2024-01-01 11:00:00')
        // 设置结束时间为10:00（早于开始时间）
        form.endTime = new Date('2024-01-01 10:00:00')
        
        onEndTimeChange()
        
        expect(form.startTime).toBe('')
      })

      it('时间有效时不应该清空', () => {
        const { onStartTimeChange, onEndTimeChange } = useTimePickerLimits(form)
        
        // 设置有效的时间范围
        form.startTime = new Date('2024-01-01 09:00:00')
        form.endTime = new Date('2024-01-01 10:00:00')
        
        onStartTimeChange()
        onEndTimeChange()
        
        expect(form.startTime).not.toBe('')
        expect(form.endTime).not.toBe('')
      })
    })

    describe('开始时间限制', () => {
      it('应该禁用结束时间之后的小时', () => {
        const { disabledStartHours } = useTimePickerLimits(form)
        
        // 设置结束时间为14:30:00
        form.endTime = new Date('2024-01-01 14:30:00')
        
        const disabledHours = disabledStartHours()
        
        // 应该禁用15-23小时
        expect(disabledHours).toEqual([15, 16, 17, 18, 19, 20, 21, 22, 23])
      })

      it('应该禁用结束时间当前小时（当分钟秒为0时）', () => {
        const { disabledStartHours } = useTimePickerLimits(form)
        
        // 设置结束时间为14:00:00
        form.endTime = new Date('2024-01-01 14:00:00')
        
        const disabledHours = disabledStartHours()
        
        // 应该禁用14-23小时
        expect(disabledHours).toEqual([14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
      })

      it('应该禁用结束时间当前小时的分钟', () => {
        const { disabledStartMinutes } = useTimePickerLimits(form)
        
        // 设置结束时间为14:30:00
        form.endTime = new Date('2024-01-01 14:30:00')
        
        const disabledMinutes = disabledStartMinutes(14)
        
        // 应该禁用30-59分钟
        expect(disabledMinutes).toEqual([30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59])
      })

      it('应该禁用结束时间当前小时分钟的秒', () => {
        const { disabledStartSeconds } = useTimePickerLimits(form)
        
        // 设置结束时间为14:30:45
        form.endTime = new Date('2024-01-01 14:30:45')
        
        const disabledSeconds = disabledStartSeconds(14, 30)
        
        // 应该禁用45-59秒
        expect(disabledSeconds).toEqual([45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59])
      })
    })

    describe('结束时间限制', () => {
      it('应该禁用开始时间之前的小时', () => {
        const { disabledEndHours } = useTimePickerLimits(form)
        
        // 设置开始时间为14:30:00
        form.startTime = new Date('2024-01-01 14:30:00')
        
        const disabledHours = disabledEndHours()
        
        // 应该禁用0-13小时
        expect(disabledHours).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
      })

      it('应该禁用开始时间当前小时（当分钟秒为59时）', () => {
        const { disabledEndHours } = useTimePickerLimits(form)
        
        // 设置开始时间为14:59:59
        form.startTime = new Date('2024-01-01 14:59:59')
        
        const disabledHours = disabledEndHours()
        
        // 应该禁用0-14小时
        expect(disabledHours).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
      })

      it('应该禁用开始时间当前小时的分钟', () => {
        const { disabledEndMinutes } = useTimePickerLimits(form)
        
        // 设置开始时间为14:30:00
        form.startTime = new Date('2024-01-01 14:30:00')
        
        const disabledMinutes = disabledEndMinutes(14)
        
        // 应该禁用0-29分钟
        expect(disabledMinutes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29])
      })

      it('应该禁用开始时间当前小时分钟的秒', () => {
        const { disabledEndSeconds } = useTimePickerLimits(form)
        
        // 设置开始时间为14:30:45
        form.startTime = new Date('2024-01-01 14:30:45')
        
        const disabledSeconds = disabledEndSeconds(14, 30)
        
        // 应该禁用0-45秒
        expect(disabledSeconds).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45])
      })
    })

    describe('日期限制', () => {
      it('应该禁用开始时间晚于结束时间的日期', () => {
        const { disabledStartDate } = useTimePickerLimits(form)
        
        // 设置结束时间为2024-01-15
        form.endTime = new Date('2024-01-15 10:00:00')
        
        // 测试晚于结束时间的日期
        const futureDate = new Date('2024-01-16')
        expect(disabledStartDate(futureDate)).toBe(true)
        
        // 测试早于结束时间的日期
        const pastDate = new Date('2024-01-14')
        expect(disabledStartDate(pastDate)).toBe(false)
      })

      it('应该禁用结束时间早于开始时间的日期', () => {
        const { disabledEndDate } = useTimePickerLimits(form)
        
        // 设置开始时间为2024-01-15
        form.startTime = new Date('2024-01-15 10:00:00')
        
        // 测试早于开始时间的日期
        const pastDate = new Date('2024-01-14')
        expect(disabledEndDate(pastDate)).toBe(true)
        
        // 测试晚于开始时间的日期
        const futureDate = new Date('2024-01-16')
        expect(disabledEndDate(futureDate)).toBe(false)
      })
    })
  })

  describe('validateTimeRange', () => {
    it('应该验证有效的时间范围', () => {
      const startTime = new Date('2024-01-01 09:00:00')
      const endTime = new Date('2024-01-01 10:00:00')
      
      expect(validateTimeRange(startTime, endTime)).toBe(true)
    })

    it('应该验证无效的时间范围', () => {
      const startTime = new Date('2024-01-01 10:00:00')
      const endTime = new Date('2024-01-01 09:00:00')
      
      expect(validateTimeRange(startTime, endTime)).toBe(false)
    })

    it('空时间应该被认为是有效的', () => {
      expect(validateTimeRange(null, null)).toBe(true)
      expect(validateTimeRange(new Date(), null)).toBe(true)
      expect(validateTimeRange(null, new Date())).toBe(true)
    })
  })

  describe('formatTime', () => {
    it('应该正确格式化时间', () => {
      const time = new Date('2024-01-01 14:30:45')
      
      expect(formatTime(time)).toBe('14:30:45')
    })

    it('应该处理字符串时间', () => {
      const time = '2024-01-01 14:30:45'
      
      expect(formatTime(time)).toBe('14:30:45')
    })

    it('应该处理空值', () => {
      expect(formatTime(null)).toBe('')
      expect(formatTime(undefined as any)).toBe('')
    })

    it('应该正确补零', () => {
      const time = new Date('2024-01-01 09:05:03')
      
      expect(formatTime(time)).toBe('09:05:03')
    })
  })

  describe('边界情况', () => {
    let form: TimePickerForm

    beforeEach(() => {
      form = reactive({
        startTime: null,
        endTime: null,
      })
    })

    it('应该处理相同时间的情况', () => {
      const { onStartTimeChange, onEndTimeChange } = useTimePickerLimits(form)
      
      const sameTime = new Date('2024-01-01 10:00:00')
      form.startTime = sameTime
      form.endTime = sameTime
      
      onStartTimeChange()
      expect(form.endTime).toBe('')
      
      form.startTime = sameTime
      form.endTime = sameTime
      onEndTimeChange()
      expect(form.startTime).toBe('')
    })

    it('应该处理跨日期的情况', () => {
      const { disabledStartDate, disabledEndDate } = useTimePickerLimits(form)
      
      // 跨日期的时间范围
      form.startTime = new Date('2024-01-01 23:30:00')
      form.endTime = new Date('2024-01-02 00:30:00')
      
      // 开始时间不能选择第二天（因为结束时间是第二天）
      const nextDay = new Date('2024-01-02')
      expect(disabledStartDate(nextDay)).toBe(true)
      
      // 结束时间不能选择第一天（因为开始时间是第一天）
      const sameDay = new Date('2024-01-01')
      expect(disabledEndDate(sameDay)).toBe(true)
      
      // 但是结束时间可以选择第二天
      expect(disabledEndDate(nextDay)).toBe(false)
      
      // 开始时间可以选择第一天
      expect(disabledStartDate(sameDay)).toBe(false)
    })
  })
})
