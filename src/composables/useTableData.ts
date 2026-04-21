import { computed, onMounted, reactive, readonly, ref, toRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Request, { type ApiResponse } from '@/utils/request'

export interface PaginationParams {
  page: number
  pageSize: number
  total: number
}

export interface SortParams {
  prop: string
  order: 'ascending' | 'descending' | null
}

export interface QueryParams extends Partial<PaginationParams> {
  keyword?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: any
}

export interface TableConfig {
  listUrl: string
  deleteUrl?: string
  batchDeleteUrl?: string
  exportUrl?: string
  enableDelete?: boolean
  enableBatchDelete?: boolean
  enableExport?: boolean
  defaultPageSize?: number
  deleteConfirmMessage?: string
  batchDeleteConfirmMessage?: string
  serverType?: '' | 'alarm'
}

export interface TableDataResponse<T = any> {
  records?: T[]
  total?: number
}

export function useTableData<T = any>(config: TableConfig) {
  const loading = ref(false)
  const tableData = ref<T[]>([])
  const pagination = reactive<PaginationParams>({
    page: 1,
    pageSize: config.defaultPageSize || 20,
    total: 0,
  })
  const queryParams = reactive<QueryParams>({ keyword: '' })
  const filters = reactive<Record<string, any>>({})
  const nowFilters = reactive<Record<string, any>>({})

  const buildFilteredParams = (): Record<string, any> => {
    const rawParams: QueryParams = {
      current: pagination.page,
      size: pagination.pageSize,
      ...queryParams,
      ...filters,
    }

    return Object.entries(rawParams).reduce<Record<string, any>>((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value
      }
      return acc
    }, {})
  }

  const fetchTableData = async (resetPage = false) => {
    try {
      loading.value = true
      if (resetPage) {
        pagination.page = 1
      }

      const filteredParams = buildFilteredParams()
      const response: ApiResponse<TableDataResponse<T>> = await Request.post(
        config.listUrl,
        filteredParams,
      )

      if (response.code === 200) {
        tableData.value = response.data.records || []
        pagination.total = response.data.total || 0
        Object.keys(nowFilters).forEach((key) => delete nowFilters[key])
        Object.assign(nowFilters, filteredParams)
      }
    } catch (error) {
      console.error('Failed to fetch table data:', error)
      tableData.value = []
      pagination.total = 0
      return false
    } finally {
      loading.value = false
    }
  }

  const searchData = (keyword: string) => {
    queryParams.keyword = keyword
    void fetchTableData(true)
  }

  const setFilter = (filterKey: string, filterValue: any) => {
    if (filterValue === null || filterValue === undefined || filterValue === '') {
      delete filters[filterKey]
    } else {
      filters[filterKey] = filterValue
    }
    void fetchTableData(true)
  }

  const setFilters = (newFilters: Record<string, any>) => {
    Object.keys(filters).forEach((key) => delete filters[key])
    Object.assign(filters, newFilters)
    void fetchTableData(true)
  }

  const clearFilters = () => {
    Object.keys(filters).forEach((key) => delete filters[key])
    queryParams.keyword = ''
    void fetchTableData(true)
  }

  const handleSortChange = (sortInfo: SortParams) => {
    if (sortInfo.prop && sortInfo.order) {
      queryParams.sortBy = sortInfo.prop
      queryParams.sortOrder = sortInfo.order === 'ascending' ? 'asc' : 'desc'
    } else {
      delete queryParams.sortBy
      delete queryParams.sortOrder
    }
    void fetchTableData()
  }

  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    void fetchTableData()
  }

  const handlePageChange = (page: number) => {
    pagination.page = page
    void fetchTableData()
  }

  const deleteRow = async (id: string | number, _confirmMessage?: string) => {
    if (!config.enableDelete || !config.deleteUrl) {
      ElMessage.warning('Delete function is not enabled')
      return false
    }

    try {
      loading.value = true
      const response = await Request.delete(config.deleteUrl.replace('{id}', String(id)))
      if (response.code === 200) {
        ElMessage.success('Deleted successfully')
        await fetchTableData()
        return true
      }
      return false
    } catch {
      return false
    } finally {
      loading.value = false
    }
  }

  const batchDeleteRows = async (ids: (string | number)[], confirmMessage?: string) => {
    if (!config.enableBatchDelete || !config.batchDeleteUrl) {
      ElMessage.warning('Batch delete function is not enabled')
      return false
    }
    if (ids.length === 0) {
      ElMessage.warning('Please select the records to delete')
      return false
    }

    try {
      await ElMessageBox.confirm(
        confirmMessage ||
          config.batchDeleteConfirmMessage ||
          `Are you sure you want to delete the selected ${ids.length} records?`,
        'Batch delete confirmation',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning',
        },
      )

      loading.value = true
      const response = await Request.post(config.batchDeleteUrl, { ids })
      if (response.code === 200) {
        ElMessage.success({ message: `Successfully deleted ${ids.length} records`, grouping: true })
        await fetchTableData()
        return true
      }
      return false
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Batch delete failed:', error)
      }
      return false
    } finally {
      loading.value = false
    }
  }

  const refreshData = () => {
    void fetchTableData()
  }

  const resetTable = () => {
    pagination.page = 1
    pagination.pageSize = config.defaultPageSize || 20
    queryParams.keyword = ''
    delete queryParams.sortBy
    delete queryParams.sortOrder
    Object.keys(filters).forEach((key) => delete filters[key])
    void fetchTableData()
  }

  const exportData = async (filename?: string, params?: Record<string, any>) => {
    if (!config.enableExport || !config.exportUrl) {
      ElMessage.warning('export function is not enabled')
      return false
    }

    try {
      loading.value = true
      await Request.download(
        config.exportUrl,
        {
          ...queryParams,
          ...nowFilters,
          ...params,
        },
        filename || `export_${Date.now()}.xlsx`,
      )
      return true
    } catch {
      return false
    } finally {
      loading.value = false
    }
  }

  const getCurrentParams = () => ({
    pagination: toRaw(pagination),
    query: toRaw(queryParams),
    filters: toRaw(filters),
  })

  const isEmpty = computed(() => tableData.value.length === 0)
  const hasData = computed(() => tableData.value.length > 0)

  onMounted(() => {
    void fetchTableData()
  })

  return {
    loading: readonly(loading),
    tableData,
    pagination,
    queryParams: readonly(queryParams),
    filters,
    nowFilters,
    isEmpty,
    hasData,
    fetchTableData,
    refreshData,
    resetTable,
    searchData,
    setFilter,
    setFilters,
    clearFilters,
    handleSortChange,
    handlePageSizeChange,
    handlePageChange,
    deleteRow,
    batchDeleteRows,
    exportData,
    getCurrentParams,
  }
}
