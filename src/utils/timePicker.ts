/**
 * 时间选择器限制工具
 * 用于限制开始时间和结束时间的选择范围，确保开始时间早于结束时间
 */

export interface TimePickerForm {
  startTime: string | Date | null
  endTime: string | Date | null
}

/**
 * 创建时间选择器限制函数
 * @param form 包含 startTime 和 endTime 的响应式表单对象
 * @returns 返回所有限制函数
 */
export function useTimePickerLimits(form: TimePickerForm) {
  /**
   * 开始时间变化处理
   * 如果开始时间晚于结束时间，清空结束时间
   */
  function onStartTimeChange() {
    if (form.startTime && form.endTime) {
      const startTime = new Date(form.startTime)
      const endTime = new Date(form.endTime)
      if (startTime >= endTime) {
        form.endTime = ''
      }
    }
  }

  /**
   * 结束时间变化处理
   * 如果结束时间早于开始时间，清空开始时间
   */
  function onEndTimeChange() {
    if (form.startTime && form.endTime) {
      const startTime = new Date(form.startTime)
      const endTime = new Date(form.endTime)
      if (endTime <= startTime) {
        form.startTime = ''
      }
    }
  }

  /**
   * 禁用开始时间的小时
   * 如果已选择结束时间，开始时间不能选择结束时间之后的小时
   */
  function disabledStartHours() {
    const hours: number[] = []
    if (form.endTime) {
      const endTime = new Date(form.endTime)
      const endHour = endTime.getHours()
      const endMinute = endTime.getMinutes()
      const endSecond = endTime.getSeconds()
      
      // 如果结束时间的分钟和秒都是0，则禁用当前小时
      if (endMinute === 0 && endSecond === 0) {
        for (let i = endHour; i < 24; i++) {
          hours.push(i)
        }
      } else {
        // 否则禁用结束时间之后的小时
        for (let i = endHour + 1; i < 24; i++) {
          hours.push(i)
        }
      }
    }
    return hours
  }

  /**
   * 禁用开始时间的分钟
   * 如果当前小时等于结束小时，禁用结束分钟之后的分钟
   */
  function disabledStartMinutes(hour: number) {
    const minutes: number[] = []
    if (form.endTime) {
      const endTime = new Date(form.endTime)
      const endHour = endTime.getHours()
      const endMinute = endTime.getMinutes()
      const endSecond = endTime.getSeconds()
      
      // 如果当前小时等于结束小时
      if (hour === endHour) {
        // 如果结束时间的秒是0，则禁用结束分钟之后的分钟
        if (endSecond === 0) {
          for (let i = endMinute; i < 60; i++) {
            minutes.push(i)
          }
        } else {
          // 否则禁用结束分钟之后的分钟
          for (let i = endMinute + 1; i < 60; i++) {
            minutes.push(i)
          }
        }
      }
    }
    return minutes
  }

  /**
   * 禁用开始时间的秒
   * 如果当前小时和分钟都等于结束时间，禁用结束秒之后的秒
   */
  function disabledStartSeconds(hour: number, minute: number) {
    const seconds: number[] = []
    if (form.endTime) {
      const endTime = new Date(form.endTime)
      const endHour = endTime.getHours()
      const endMinute = endTime.getMinutes()
      const endSecond = endTime.getSeconds()
      
      // 如果当前小时和分钟都等于结束时间
      if (hour === endHour && minute === endMinute) {
        // 禁用结束秒之后的秒
        for (let i = endSecond; i < 60; i++) {
          seconds.push(i)
        }
      }
    }
    return seconds
  }

  /**
   * 禁用结束时间的小时
   * 如果已选择开始时间，结束时间不能选择开始时间之前的小时
   */
  function disabledEndHours() {
    const hours: number[] = []
    if (form.startTime) {
      const startTime = new Date(form.startTime)
      const startHour = startTime.getHours()
      const startMinute = startTime.getMinutes()
      const startSecond = startTime.getSeconds()
      
      // 如果开始时间的分钟和秒都是59，则禁用当前小时
      if (startMinute === 59 && startSecond === 59) {
        for (let i = 0; i <= startHour; i++) {
          hours.push(i)
        }
      } else {
        // 否则禁用开始时间之前的小时
        for (let i = 0; i < startHour; i++) {
          hours.push(i)
        }
      }
    }
    return hours
  }

  /**
   * 禁用结束时间的分钟
   * 如果当前小时等于开始小时，禁用开始分钟之前的分钟
   */
  function disabledEndMinutes(hour: number) {
    const minutes: number[] = []
    if (form.startTime) {
      const startTime = new Date(form.startTime)
      const startHour = startTime.getHours()
      const startMinute = startTime.getMinutes()
      const startSecond = startTime.getSeconds()
      
      // 如果当前小时等于开始小时
      if (hour === startHour) {
        // 如果开始时间的秒是59，则禁用开始分钟之前的分钟
        if (startSecond === 59) {
          for (let i = 0; i <= startMinute; i++) {
            minutes.push(i)
          }
        } else {
          // 否则禁用开始分钟之前的分钟
          for (let i = 0; i < startMinute; i++) {
            minutes.push(i)
          }
        }
      }
    }
    return minutes
  }

  /**
   * 禁用结束时间的秒
   * 如果当前小时和分钟都等于开始时间，禁用开始秒之前的秒
   */
  function disabledEndSeconds(hour: number, minute: number) {
    const seconds: number[] = []
    if (form.startTime) {
      const startTime = new Date(form.startTime)
      const startHour = startTime.getHours()
      const startMinute = startTime.getMinutes()
      const startSecond = startTime.getSeconds()
      
      // 如果当前小时和分钟都等于开始时间
      if (hour === startHour && minute === startMinute) {
        // 禁用开始秒之前的秒
        for (let i = 0; i <= startSecond; i++) {
          seconds.push(i)
        }
      }
    }
    return seconds
  }

  return {
    onStartTimeChange,
    onEndTimeChange,
    disabledStartHours,
    disabledStartMinutes,
    disabledStartSeconds,
    disabledEndHours,
    disabledEndMinutes,
    disabledEndSeconds,
  }
}

/**
 * 验证时间范围是否有效
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 是否有效
 */
export function validateTimeRange(startTime: string | Date | null, endTime: string | Date | null): boolean {
  if (!startTime || !endTime) {
    return true // 如果任一时间为空，认为是有效的
  }
  
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  return start < end
}

/**
 * 格式化时间显示
 * @param time 时间对象或字符串
 * @returns 格式化的时间字符串
 */
export function formatTime(time: string | Date | null): string {
  if (!time) return ''
  
  const date = new Date(time)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  
  return `${hours}:${minutes}:${seconds}`
}
