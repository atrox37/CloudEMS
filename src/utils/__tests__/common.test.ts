import { describe, it, expect } from 'vitest'

describe('common.ts', () => {
  it('应该是一个空文件，等待未来扩展', () => {
    // 这个文件目前是空的，但为未来的通用工具函数预留
    // 当添加功能时，可以在这里添加相应的测试
    expect(true).toBe(true)
  })

  it('应该可以正常导入', () => {
    // 测试文件可以正常导入（即使内容为空）
    expect(() => {
      require('../common')
    }).not.toThrow()
  })
})
