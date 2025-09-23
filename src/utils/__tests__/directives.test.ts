import { describe, it, expect, beforeEach, vi,afterEach } from 'vitest'
import { permissionDirective } from '../directives'

// Mock useUserStore
const mockUserStore = {
  roles: ['Admin']
}

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore
}))

describe('directives.ts', () => {
  let mockElement: HTMLElement
  let mockParentNode: HTMLElement
  let mockBinding: any

  beforeEach(() => {
    // 创建模拟DOM元素
    mockElement = document.createElement('button')
    mockParentNode = document.createElement('div')
    mockParentNode.appendChild(mockElement)
    document.body.appendChild(mockParentNode)

    // 创建模拟binding对象
    mockBinding = {
      value: ['Admin', 'Editor']
    }

    // 重置用户角色
    mockUserStore.roles = ['Admin']
  })

  afterEach(() => {
    // 清理DOM
    document.body.innerHTML = ''
  })

  describe('permissionDirective', () => {
    it('应该是一个对象，包含mounted方法', () => {
      expect(permissionDirective).toBeDefined()
      expect(typeof permissionDirective).toBe('object')
      expect(permissionDirective).toHaveProperty('mounted')
      expect(typeof permissionDirective.mounted).toBe('function')
    })

    it('应该保留有权限的元素', () => {
      // 用户角色是Admin，在允许的角色列表中
      mockUserStore.roles = ['Admin']
      mockBinding.value = ['Admin', 'Editor']

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该仍然存在
      expect(mockParentNode.contains(mockElement)).toBe(true)
    })

    it('应该移除没有权限的元素', () => {
      // 用户角色是User，不在允许的角色列表中
      mockUserStore.roles = ['User']
      mockBinding.value = ['Admin', 'Editor']

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该被移除
      expect(mockParentNode.contains(mockElement)).toBe(false)
    })

    it('应该处理空角色数组', () => {
      mockUserStore.roles = []
      mockBinding.value = ['Admin', 'Editor']

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该被移除
      expect(mockParentNode.contains(mockElement)).toBe(false)
    })

    it('应该处理null角色', () => {
      mockUserStore.roles = null as any
      mockBinding.value = ['Admin', 'Editor']

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该被移除
      expect(mockParentNode.contains(mockElement)).toBe(false)
    })

    it('应该处理undefined角色', () => {
      mockUserStore.roles = undefined as any
      mockBinding.value = ['Admin', 'Editor']

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该被移除
      expect(mockParentNode.contains(mockElement)).toBe(false)
    })

    it('应该处理空允许角色数组', () => {
      mockUserStore.roles = ['Admin']
      mockBinding.value = []

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该被移除
      expect(mockParentNode.contains(mockElement)).toBe(false)
    })

    it('应该处理单个角色', () => {
      mockUserStore.roles = ['Editor']
      mockBinding.value = ['Editor']

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该保留
      expect(mockParentNode.contains(mockElement)).toBe(true)
    })

    it('应该处理多个用户角色', () => {
      mockUserStore.roles = ['User', 'Admin']
      mockBinding.value = ['Admin', 'Editor']

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该保留（用户有Admin角色）
      expect(mockParentNode.contains(mockElement)).toBe(true)
    })

    it('应该处理多个用户角色但都不匹配', () => {
      mockUserStore.roles = ['User', 'Guest']
      mockBinding.value = ['Admin', 'Editor']

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该被移除
      expect(mockParentNode.contains(mockElement)).toBe(false)
    })

    it('应该处理角色大小写敏感', () => {
      mockUserStore.roles = ['admin'] // 小写
      mockBinding.value = ['Admin'] // 大写

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该被移除（大小写不匹配）
      expect(mockParentNode.contains(mockElement)).toBe(false)
    })

    it('应该处理没有parentNode的情况', () => {
      // 创建一个没有父节点的元素
      const orphanElement = document.createElement('div')
      mockUserStore.roles = ['User']
      mockBinding.value = ['Admin']

      // 不应该抛出错误
      expect(() => {
        permissionDirective.mounted(orphanElement, mockBinding)
      }).not.toThrow()
    })

    it('应该处理parentNode为null的情况', () => {
      // 模拟parentNode为null的情况
      Object.defineProperty(mockElement, 'parentNode', {
        value: null,
        writable: true
      })

      mockUserStore.roles = ['User']
      mockBinding.value = ['Admin']

      // 不应该抛出错误
      expect(() => {
        permissionDirective.mounted(mockElement, mockBinding)
      }).not.toThrow()
    })
  })

  describe('边界情况测试', () => {
    it('应该处理空字符串角色', () => {
      mockUserStore.roles = ['']
      mockBinding.value = ['Admin']

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该被移除
      expect(mockParentNode.contains(mockElement)).toBe(false)
    })

    it('应该处理包含空字符串的角色数组', () => {
      mockUserStore.roles = ['Admin', '']
      mockBinding.value = ['Admin']

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该保留（有Admin角色）
      expect(mockParentNode.contains(mockElement)).toBe(true)
    })

    it('应该处理包含特殊字符的角色', () => {
      mockUserStore.roles = ['Admin@123']
      mockBinding.value = ['Admin@123']

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该保留
      expect(mockParentNode.contains(mockElement)).toBe(true)
    })

    it('应该处理很长的角色名称', () => {
      const longRole = 'A'.repeat(1000)
      mockUserStore.roles = [longRole]
      mockBinding.value = [longRole]

      permissionDirective.mounted(mockElement, mockBinding)

      // 元素应该保留
      expect(mockParentNode.contains(mockElement)).toBe(true)
    })
  })

  describe('性能测试', () => {
    it('应该快速执行权限检查', () => {
      const start = performance.now()
      
      // 执行多次权限检查
      for (let i = 0; i < 1000; i++) {
        permissionDirective.mounted(mockElement, mockBinding)
      }
      
      const end = performance.now()
      const duration = end - start
      
      // 1000次检查应该在100ms内完成
      expect(duration).toBeLessThan(100)
    })
  })

  describe('集成测试', () => {
    it('应该与Vue指令系统兼容', () => {
      // 测试指令的基本结构
      expect(permissionDirective).toHaveProperty('mounted')
      
      // 测试mounted方法的参数
      const mountedMethod = permissionDirective.mounted
      expect(typeof mountedMethod).toBe('function')
      
      // 测试方法调用
      expect(() => {
        mountedMethod(mockElement, mockBinding)
      }).not.toThrow()
    })

    it('应该正确处理不同的binding值类型', () => {
      // 测试字符串数组
      mockBinding.value = ['Admin', 'Editor']
      expect(() => {
        permissionDirective.mounted(mockElement, mockBinding)
      }).not.toThrow()

      // 测试单个字符串
      mockBinding.value = 'Admin'
      expect(() => {
        permissionDirective.mounted(mockElement, mockBinding)
      }).not.toThrow()
    })
  })
})
