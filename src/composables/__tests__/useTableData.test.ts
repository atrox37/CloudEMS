import { defineComponent } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTableData } from '../useTableData'
import Request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

vi.mock('@/utils/request', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
    download: vi.fn(),
  },
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    warning: vi.fn(),
    success: vi.fn(),
  },
  ElMessageBox: {
    confirm: vi.fn(),
  },
}))

const requestMock = vi.mocked(Request)
const warningMock = vi.mocked(ElMessage.warning)
const successMock = vi.mocked(ElMessage.success)
const confirmMock = vi.mocked(ElMessageBox.confirm)

function mountTableData(config = { listUrl: '/api/list', defaultPageSize: 20 }) {
  let exposed: ReturnType<typeof useTableData>

  const wrapper = mount(
    defineComponent({
      setup() {
        exposed = useTableData(config)
        return () => null
      },
    }),
  )

  return {
    wrapper,
    composable: exposed!,
  }
}

describe('composables/useTableData.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requestMock.post.mockResolvedValue({
      code: 200,
      data: {
        records: [{ id: 1, name: 'Alpha' }],
        total: 1,
      },
    })
    requestMock.delete.mockResolvedValue({ code: 200, data: {}, msg: 'ok' })
    requestMock.download.mockResolvedValue(undefined)
    confirmMock.mockResolvedValue('confirm')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fetches data on mount and filters empty query params', async () => {
    const { composable, wrapper } = mountTableData()

    await flushPromises()

    expect(requestMock.post).toHaveBeenCalledWith('/api/list', {
      current: 1,
      size: 20,
    })
    expect(composable.tableData.value).toEqual([{ id: 1, name: 'Alpha' }])
    expect(composable.pagination.total).toBe(1)
    expect(composable.nowFilters).toEqual({
      current: 1,
      size: 20,
    })

    wrapper.unmount()
  })

  it('resets to the first page when searching or updating filters', async () => {
    const { composable, wrapper } = mountTableData()
    await flushPromises()

    composable.pagination.page = 3
    composable.searchData('station')
    await flushPromises()

    expect(composable.pagination.page).toBe(1)
    expect(requestMock.post).toHaveBeenLastCalledWith('/api/list', {
      current: 1,
      size: 20,
      keyword: 'station',
    })

    composable.setFilter('status', 'online')
    await flushPromises()

    expect(requestMock.post).toHaveBeenLastCalledWith('/api/list', {
      current: 1,
      size: 20,
      keyword: 'station',
      status: 'online',
    })

    composable.clearFilters()
    await flushPromises()

    expect(requestMock.post).toHaveBeenLastCalledWith('/api/list', {
      current: 1,
      size: 20,
    })

    wrapper.unmount()
  })

  it('translates sort changes into API query params', async () => {
    const { composable, wrapper } = mountTableData()
    await flushPromises()

    composable.handleSortChange({ prop: 'createdAt', order: 'descending' })
    await flushPromises()

    expect(requestMock.post).toHaveBeenLastCalledWith('/api/list', {
      current: 1,
      size: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })

    composable.handleSortChange({ prop: '', order: null })
    await flushPromises()

    expect(requestMock.post).toHaveBeenLastCalledWith('/api/list', {
      current: 1,
      size: 20,
    })

    wrapper.unmount()
  })

  it('warns when delete or export is not enabled', async () => {
    const { composable, wrapper } = mountTableData()
    await flushPromises()

    await expect(composable.deleteRow(1)).resolves.toBe(false)
    await expect(composable.exportData()).resolves.toBe(false)

    expect(warningMock).toHaveBeenCalledWith('Delete function is not enabled')
    expect(warningMock).toHaveBeenCalledWith('export function is not enabled')

    wrapper.unmount()
  })

  it('deletes rows and exports with the latest applied filters when enabled', async () => {
    const { composable, wrapper } = mountTableData({
      listUrl: '/api/list',
      deleteUrl: '/api/list/{id}',
      exportUrl: '/api/export',
      enableDelete: true,
      enableExport: true,
      defaultPageSize: 20,
    })
    await flushPromises()

    composable.searchData('ems')
    await flushPromises()
    composable.setFilter('status', 'offline')
    await flushPromises()

    await expect(composable.deleteRow(42)).resolves.toBe(true)
    expect(requestMock.delete).toHaveBeenCalledWith('/api/list/42')
    expect(successMock).toHaveBeenCalledWith('Deleted successfully')

    await expect(composable.exportData('devices.xlsx', { stationId: 7 })).resolves.toBe(true)
    expect(requestMock.download).toHaveBeenCalledWith(
      '/api/export',
      {
        keyword: 'ems',
        current: 1,
        size: 20,
        status: 'offline',
        stationId: 7,
      },
      'devices.xlsx',
    )

    wrapper.unmount()
  })
})
