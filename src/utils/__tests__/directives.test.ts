import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { permissionDirective } from '../directives'

const mockUserStore = {
  roles: ['Admin'],
}

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('directives.ts', () => {
  let mockElement
  let mockParentNode
  let mockBinding

  beforeEach(() => {
    mockElement = document.createElement('button')
    mockParentNode = document.createElement('div')
    mockParentNode.appendChild(mockElement)
    document.body.appendChild(mockParentNode)
    mockBinding = { value: ['Admin', 'Editor'] }
    mockUserStore.roles = ['Admin']
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps the element when the first user role is allowed', () => {
    permissionDirective.mounted(mockElement, mockBinding)
    expect(mockParentNode.contains(mockElement)).toBe(true)
  })

  it('removes the element when the first user role is not allowed', () => {
    mockUserStore.roles = ['User']
    permissionDirective.mounted(mockElement, mockBinding)
    expect(mockParentNode.contains(mockElement)).toBe(false)
  })

  it('matches only the first current role in the current implementation', () => {
    mockUserStore.roles = ['User', 'Admin']
    permissionDirective.mounted(mockElement, mockBinding)
    expect(mockParentNode.contains(mockElement)).toBe(false)
  })

  it('does not throw when the element has no parent node', () => {
    const orphanElement = document.createElement('div')
    mockUserStore.roles = ['User']
    expect(() => permissionDirective.mounted(orphanElement, mockBinding)).not.toThrow()
  })
})
