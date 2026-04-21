import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import {
  formatTime,
  useTimePickerLimits,
  validateTimeRange,
  type TimePickerForm,
} from '../timePicker'

function createForm(): TimePickerForm {
  return reactive({
    startTime: null,
    endTime: null,
  })
}

describe('utils/timePicker.ts', () => {
  describe('change handlers', () => {
    it('clears endTime when startTime is not earlier than endTime', () => {
      const form = createForm()
      const { onStartTimeChange } = useTimePickerLimits(form)

      form.startTime = new Date('2024-01-01T11:00:00')
      form.endTime = new Date('2024-01-01T10:00:00')

      onStartTimeChange()

      expect(form.endTime).toBe('')
    })

    it('clears startTime when endTime is not later than startTime', () => {
      const form = createForm()
      const { onEndTimeChange } = useTimePickerLimits(form)

      form.startTime = new Date('2024-01-01T10:00:00')
      form.endTime = new Date('2024-01-01T10:00:00')

      onEndTimeChange()

      expect(form.startTime).toBe('')
    })
  })

  describe('start-side limits', () => {
    it('disables hours after the selected end time', () => {
      const form = createForm()
      const { disabledStartHours } = useTimePickerLimits(form)

      form.endTime = new Date('2024-01-01T14:30:00')

      expect(disabledStartHours()).toEqual([15, 16, 17, 18, 19, 20, 21, 22, 23])
    })

    it('disables the current hour too when end minute and second are zero', () => {
      const form = createForm()
      const { disabledStartHours } = useTimePickerLimits(form)

      form.endTime = new Date('2024-01-01T14:00:00')

      expect(disabledStartHours()).toEqual([14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
    })

    it('disables minutes and seconds beyond the selected end time', () => {
      const form = createForm()
      const { disabledStartMinutes, disabledStartSeconds } = useTimePickerLimits(form)

      form.endTime = new Date('2024-01-01T14:30:45')

      expect(disabledStartMinutes(14)).toEqual([
        31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
        54, 55, 56, 57, 58, 59,
      ])
      expect(disabledStartSeconds(14, 30)).toEqual([
        45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
      ])
    })
  })

  describe('end-side limits', () => {
    it('disables hours before the selected start time', () => {
      const form = createForm()
      const { disabledEndHours } = useTimePickerLimits(form)

      form.startTime = new Date('2024-01-01T14:30:00')

      expect(disabledEndHours()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    })

    it('disables minutes and seconds before the selected start time', () => {
      const form = createForm()
      const { disabledEndMinutes, disabledEndSeconds } = useTimePickerLimits(form)

      form.startTime = new Date('2024-01-01T14:30:45')

      expect(disabledEndMinutes(14)).toEqual([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        25, 26, 27, 28, 29,
      ])
      expect(disabledEndSeconds(14, 30)).toEqual([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45,
      ])
    })
  })

  describe('date limits', () => {
    it('disables start dates after endTime and end dates before startTime', () => {
      const form = createForm()
      const { disabledStartDate, disabledEndDate } = useTimePickerLimits(form)

      form.startTime = new Date('2024-01-15T10:00:00')
      form.endTime = new Date('2024-01-20T10:00:00')

      expect(disabledStartDate(new Date('2024-01-21T00:00:00'))).toBe(true)
      expect(disabledStartDate(new Date('2024-01-20T00:00:00'))).toBe(false)
      expect(disabledEndDate(new Date('2024-01-14T00:00:00'))).toBe(true)
      expect(disabledEndDate(new Date('2024-01-15T00:00:00'))).toBe(false)
    })
  })

  describe('helpers', () => {
    it('validates time ranges correctly', () => {
      expect(
        validateTimeRange(new Date('2024-01-01T09:00:00'), new Date('2024-01-01T10:00:00')),
      ).toBe(true)
      expect(
        validateTimeRange(new Date('2024-01-01T10:00:00'), new Date('2024-01-01T09:00:00')),
      ).toBe(false)
      expect(validateTimeRange(null, new Date('2024-01-01T09:00:00'))).toBe(true)
    })

    it('formats time values as HH:mm:ss', () => {
      expect(formatTime(new Date('2024-01-01T09:05:03'))).toBe('09:05:03')
      expect(formatTime('2024-01-01T14:30:45')).toBe('14:30:45')
      expect(formatTime(null)).toBe('')
    })
  })
})
