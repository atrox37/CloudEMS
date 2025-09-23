import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  setRem, 
  initResponsive, 
  pxToResponsive, 
  pxToRem, 
  getCurrentScale, 
  getCurrentFontSize 
} from '../responsive'

// Mock DOM methods
const mockGetComputedStyle = vi.fn()
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()

// Mock document and window
Object.defineProperty(document, 'documentElement', {
  value: {
    style: {
      fontSize: '100px'
    }
  },
  writable: true
})

Object.defineProperty(window, 'innerWidth', {
  value: 1920,
  writable: true
})

Object.defineProperty(window, 'innerHeight', {
  value: 1080,
  writable: true
})

Object.defineProperty(window, 'getComputedStyle', {
  value: mockGetComputedStyle,
  writable: true
})

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true
})

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true
})

describe('responsive.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window size to default
    Object.defineProperty(window, 'innerWidth', {
      value: 1920,
      writable: true
    })
    
    // Mock getComputedStyle to return a font size
    mockGetComputedStyle.mockReturnValue({
      fontSize: '100px'
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('setRem', () => {
    it('应该根据屏幕宽度设置根字体大小', () => {
      // 设置屏幕宽度为1920px
      Object.defineProperty(window, 'innerWidth', {
        value: 1920,
        writable: true
      })

      setRem()

      expect(document.documentElement.style.fontSize).toBe('100px')
    })

    it('应该根据屏幕宽度缩放字体大小', () => {
      // 设置屏幕宽度为960px (1920的一半)
      Object.defineProperty(window, 'innerWidth', {
        value: 960,
        writable: true
      })

      setRem()

      expect(document.documentElement.style.fontSize).toBe('50px')
    })

    it('应该处理小屏幕设备', () => {
      // 设置屏幕宽度为480px
      Object.defineProperty(window, 'innerWidth', {
        value: 480,
        writable: true
      })

      setRem()

      expect(document.documentElement.style.fontSize).toBe('25px')
    })

    it('应该处理大屏幕设备', () => {
      // 设置屏幕宽度为3840px (1920的两倍)
      Object.defineProperty(window, 'innerWidth', {
        value: 3840,
        writable: true
      })

      setRem()

      expect(document.documentElement.style.fontSize).toBe('200px')
    })
  })

  describe('initResponsive', () => {
    it('应该初始化响应式配置并添加resize监听器', () => {
      const setRemSpy = vi.spyOn({ setRem }, 'setRem')
      
      initResponsive()

      expect(setRemSpy).toHaveBeenCalled()
      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('应该设置防抖处理', () => {
      initResponsive()

      // 获取resize事件监听器
      const resizeHandler = mockAddEventListener.mock.calls[0][1]
      
      // 模拟多次快速调用
      resizeHandler()
      resizeHandler()
      resizeHandler()

      // 验证setRem被调用（通过防抖处理）
      expect(setRem).toHaveBeenCalled()
    })
  })

  describe('pxToResponsive', () => {
    it('应该将设计稿px值转换为响应式px值', () => {
      // 1920px屏幕，100px设计稿值应该转换为100px
      Object.defineProperty(window, 'innerWidth', {
        value: 1920,
        writable: true
      })

      const result = pxToResponsive(100)
      expect(result).toBe(100)
    })

    it('应该根据屏幕宽度缩放px值', () => {
      // 960px屏幕，100px设计稿值应该转换为50px
      Object.defineProperty(window, 'innerWidth', {
        value: 960,
        writable: true
      })

      const result = pxToResponsive(100)
      expect(result).toBe(50)
    })

    it('应该处理小屏幕设备', () => {
      // 480px屏幕，100px设计稿值应该转换为25px
      Object.defineProperty(window, 'innerWidth', {
        value: 480,
        writable: true
      })

      const result = pxToResponsive(100)
      expect(result).toBe(25)
    })

    it('应该处理大屏幕设备', () => {
      // 3840px屏幕，100px设计稿值应该转换为200px
      Object.defineProperty(window, 'innerWidth', {
        value: 3840,
        writable: true
      })

      const result = pxToResponsive(100)
      expect(result).toBe(200)
    })

    it('应该处理零值', () => {
      const result = pxToResponsive(0)
      expect(result).toBe(0)
    })

    it('应该处理负值', () => {
      const result = pxToResponsive(-100)
      expect(result).toBe(-100)
    })
  })

  describe('pxToRem', () => {
    it('应该将设计稿px值转换为rem值', () => {
      // 1920px屏幕，100px设计稿值应该转换为1rem
      Object.defineProperty(window, 'innerWidth', {
        value: 1920,
        writable: true
      })

      const result = pxToRem(100)
      expect(result).toBe('1rem')
    })

    it('应该根据屏幕宽度缩放rem值', () => {
      // 960px屏幕，100px设计稿值应该转换为1rem（因为基准字体大小也缩小了）
      Object.defineProperty(window, 'innerWidth', {
        value: 960,
        writable: true
      })

      const result = pxToRem(100)
      expect(result).toBe('1rem')
    })

    it('应该处理小数rem值', () => {
      // 1920px屏幕，50px设计稿值应该转换为0.5rem
      Object.defineProperty(window, 'innerWidth', {
        value: 1920,
        writable: true
      })

      const result = pxToRem(50)
      expect(result).toBe('0.5rem')
    })

    it('应该处理零值', () => {
      const result = pxToRem(0)
      expect(result).toBe('0rem')
    })
  })

  describe('getCurrentScale', () => {
    it('应该返回当前屏幕的缩放比例', () => {
      // 1920px屏幕，缩放比例应该是1
      Object.defineProperty(window, 'innerWidth', {
        value: 1920,
        writable: true
      })

      const result = getCurrentScale()
      expect(result).toBe(1)
    })

    it('应该返回正确的缩放比例', () => {
      // 960px屏幕，缩放比例应该是0.5
      Object.defineProperty(window, 'innerWidth', {
        value: 960,
        writable: true
      })

      const result = getCurrentScale()
      expect(result).toBe(0.5)
    })

    it('应该处理小屏幕设备', () => {
      // 480px屏幕，缩放比例应该是0.25
      Object.defineProperty(window, 'innerWidth', {
        value: 480,
        writable: true
      })

      const result = getCurrentScale()
      expect(result).toBe(0.25)
    })
  })

  describe('getCurrentFontSize', () => {
    it('应该返回当前根字体大小', () => {
      mockGetComputedStyle.mockReturnValue({
        fontSize: '100px'
      })

      const result = getCurrentFontSize()
      expect(result).toBe(100)
    })

    it('应该处理无效字体大小', () => {
      mockGetComputedStyle.mockReturnValue({
        fontSize: 'invalid'
      })

      const result = getCurrentFontSize()
      expect(result).toBe(100) // 应该返回默认值
    })

    it('应该处理空字体大小', () => {
      mockGetComputedStyle.mockReturnValue({
        fontSize: ''
      })

      const result = getCurrentFontSize()
      expect(result).toBe(100) // 应该返回默认值
    })
  })

  describe('边界情况测试', () => {
    it('应该处理极小的屏幕宽度', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 1,
        writable: true
      })

      const result = pxToResponsive(100)
      expect(result).toBeCloseTo(0.052, 3) // 100 * (1/1920)
    })

    it('应该处理极大的屏幕宽度', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 10000,
        writable: true
      })

      const result = pxToResponsive(100)
      expect(result).toBeCloseTo(520.833, 3) // 100 * (10000/1920)
    })

    it('应该处理零屏幕宽度', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 0,
        writable: true
      })

      const result = pxToResponsive(100)
      expect(result).toBe(0)
    })
  })

  describe('性能测试', () => {
    it('应该快速执行pxToResponsive计算', () => {
      const start = performance.now()
      
      // 执行多次计算
      for (let i = 0; i < 1000; i++) {
        pxToResponsive(i)
      }
      
      const end = performance.now()
      const duration = end - start
      
      // 1000次计算应该在10ms内完成
      expect(duration).toBeLessThan(10)
    })

    it('应该快速执行pxToRem计算', () => {
      const start = performance.now()
      
      // 执行多次计算
      for (let i = 0; i < 1000; i++) {
        pxToRem(i)
      }
      
      const end = performance.now()
      const duration = end - start
      
      // 1000次计算应该在10ms内完成
      expect(duration).toBeLessThan(10)
    })
  })
})
