import { defineStore } from 'pinia'
import type { Stations } from '@/types/Stations'
import Request, { type ApiResponse } from '@/utils/request'

/**
 * 站点状态管理
 * 存储站点列表信息及告警数量
 */
export const useStationStore = defineStore('station', () => {
  // 站点列表
  const stations = ref<Stations[]>([])
  
  // 加载状态
  const loading = ref(false)

  // 计算总告警数量
  const totalAlarmCount = computed(() => {
    return stations.value.reduce((acc, station) => acc + (station.alarmCount || 0), 0)
  })

  /**
   * 设置站点列表
   * @param data 站点数据数组
   */
  const setStations = (data: Stations[]) => {
    stations.value = data
  }

  /**
   * 更新单个站点的告警数量
   * @param stationId 站点ID
   * @param count 告警数量
   */
  const updateStationAlarmCount = (stationId: number, count: number) => {
    const station = stations.value.find((s) => s.stationId === stationId)
    if (station) {
      station.alarmCount = count
    }
  }

  /**
   * 根据站点ID获取站点信息
   * @param stationId 站点ID
   */
  const getStationById = (stationId: number) => {
    return stations.value.find((s) => s.stationId === stationId)
  }

  /**
   * 清空站点数据
   */
  const clearStations = () => {
    stations.value = []
  }

  /**
   * 获取站点列表（普通请求）
   * @param stationId 可选站点ID，不传则获取全部
   */
  const fetchStations = async (stationId?: number): Promise<ApiResponse<Stations[]>> => {
    loading.value = true
    try {
      const res = await Request.post<Stations[]>('/user-app/station/_page_station', { stationId })
      if (res.code === 200 && res.data) {
        // 如果是获取全部站点，更新 stations
        if (!stationId) {
          setStations(res.data)
        }
      }
      return res
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取站点列表（跳过取消，用于App.vue初始化）
   * @param stationId 可选站点ID
   */
  const fetchStationsSkipCancel = async (stationId?: number): Promise<ApiResponse<Stations[]>> => {
    loading.value = true
    try {
      const res = await Request.post<Stations[]>('/user-app/station/_page_station', { stationId }, { skipCancel: true })
      if (res.code === 200 && res.data) {
        // 如果是获取全部站点，更新 stations
        if (!stationId) {
          setStations(res.data)
        }
      }
      return res
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新单个站点数据
   * @param stationId 站点ID
   */
  const updateStation = async (stationId: number): Promise<boolean> => {
    const res = await fetchStations(stationId)
    if (res.code === 200 && res.data && res.data.length > 0) {
      const index = stations.value.findIndex((s) => s.stationId === stationId)
      if (index !== -1) {
        stations.value[index] = res.data[0]
      }
      return true
    }
    return false
  }

  return {
    // 状态
    stations,
    loading,
    
    // 计算属性
    totalAlarmCount,
    
    // 方法
    setStations,
    updateStationAlarmCount,
    getStationById,
    clearStations,
    fetchStations,
    fetchStationsSkipCancel,
    updateStation,
  }
})
