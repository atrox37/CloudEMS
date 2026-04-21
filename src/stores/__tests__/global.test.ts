import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGlobalStore } from '../global'

describe('stores/global.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with the expected default state', () => {
    const store = useGlobalStore()

    expect(store.isCollapse).toBe(false)
    expect(store.loading).toBe(false)
    expect(store.appInitializing).toBe(false)
  })

  it('allows toggling UI state independently', () => {
    const store = useGlobalStore()

    store.isCollapse = true
    store.loading = true
    store.appInitializing = true

    expect(store.isCollapse).toBe(true)
    expect(store.loading).toBe(true)
    expect(store.appInitializing).toBe(true)
  })

  it('uses a stable store id for persisted state', () => {
    const store = useGlobalStore()

    expect(store.$id).toBe('global')
  })
})
