import { defineStore } from 'pinia'
import { computed, watch, type Ref } from 'vue'
import type { Stations, StationInformation } from '@/types/Stations'
import type { ApiResponse } from '@/utils/request'
import { getStations, getStationsSkipCancel } from '@/api/station'
import stompManager from '@/utils/stomp'

/**
 * 站点状态管理
 * 存储站点列表信息及告警数量
 * 自动管理 STOMP 订阅（新增站点自动订阅，消失站点自动取消订阅）
 */
export const useStationStore = defineStore('station', () => {
  // 站点列表
  const stations = ref<Stations[]>([])
  
  // 当前站点详情信息
  const currentStationDetail = ref<StationInformation | null>(null)
  
  // 加载状态
  const loading = ref(false)

  // STOMP 订阅ID映射：站点ID -> 订阅ID
  const stompSubscriptionMap = new Map<number, string>()

  // 告警回调函数（需要在外部设置）
  let alarmCallback: ((alarm: any) => void) | null = null

  /**
   * 设置告警回调函数
   * @param callback 告警回调函数
   */
  const setAlarmCallback = (callback: (alarm: any) => void) => {
    alarmCallback = callback
  }

  // 计算总告警数量
  const totalAlarmCount = computed(() => {
    return stations.value.reduce((acc, station) => acc + (station.alarmCount || 0), 0)
  })

  // 计算站点ID数组（用于diff算法）
  const stationIds = computed(() => {
    return stations.value.map((station) => station.stationId).sort((a, b) => a - b)
  })

  /**
   * 订阅单个站点的 STOMP 主题
   * @param stationId 站点ID
   */
  const subscribeStation = (stationId: number) => {
    // 如果已经订阅过，跳过
    if (stompSubscriptionMap.has(stationId)) {
      console.log(`[StationStore] 站点 ${stationId} 已订阅，跳过`)
      return
    }

    if (!alarmCallback) {
      console.warn(`[StationStore] 告警回调函数未设置，无法订阅站点 ${stationId}`)
      return
    }

    const destination = `/topic/report_property_${stationId}`
    const subscriptionId = stompManager.subscribe({ destination }, alarmCallback)
    stompSubscriptionMap.set(stationId, subscriptionId)
    console.log(`[StationStore] 订阅站点 ${stationId}，订阅ID: ${subscriptionId}`)
  }

  /**
   * 取消订阅单个站点的 STOMP 主题
   * @param stationId 站点ID
   */
  const unsubscribeStation = (stationId: number) => {
    const subscriptionId = stompSubscriptionMap.get(stationId)
    if (subscriptionId) {
      stompManager.unsubscribe(subscriptionId)
      stompSubscriptionMap.delete(stationId)
      console.log(`[StationStore] 取消订阅站点 ${stationId}，订阅ID: ${subscriptionId}`)
    } else {
      console.warn(`[StationStore] 站点 ${stationId} 未找到订阅记录`)
    }
  }

  /**
   * 使用 diff 算法检测站点变化并更新订阅
   * @param oldIds 旧的站点ID数组
   * @param newIds 新的站点ID数组
   */
  const updateSubscriptionsByDiff = (oldIds: number[], newIds: number[]) => {
    // 找出新增的站点（在新数组中但不在旧数组中）
    const addedIds = newIds.filter((id) => !oldIds.includes(id))
    
    // 找出消失的站点（在旧数组中但不在新数组中）
    const removedIds = oldIds.filter((id) => !newIds.includes(id))

    // 订阅新增的站点
    addedIds.forEach((stationId) => {
      subscribeStation(stationId)
    })

    // 取消订阅消失的站点
    removedIds.forEach((stationId) => {
      unsubscribeStation(stationId)
    })

    if (addedIds.length > 0 || removedIds.length > 0) {
      console.log(`[StationStore] 订阅更新完成 - 新增: ${addedIds.length} 个，移除: ${removedIds.length} 个`)
    }
  }

  // 监听站点ID变化，自动更新订阅
  let previousStationIds: number[] = []
  let isFirstLoad = true
  
  watch(
    stationIds,
    (newIds, oldIds) => {
      // 首次加载时，直接订阅所有站点
      if (isFirstLoad && newIds.length > 0) {
        console.log('[StationStore] 首次加载，订阅所有站点:', newIds)
        newIds.forEach((stationId) => {
          subscribeStation(stationId)
        })
        previousStationIds = [...newIds]
        isFirstLoad = false
        return
      }
      
      // 后续变化时，使用 diff 算法
      const oldIdsToCompare = oldIds && oldIds.length > 0 ? oldIds : previousStationIds
      
      if (oldIdsToCompare.length > 0 || newIds.length > 0) {
        updateSubscriptionsByDiff(oldIdsToCompare, newIds)
      }
      
      // 更新 previousStationIds
      previousStationIds = [...newIds]
    },
    { immediate: false } // 不立即执行，等待首次数据加载完成
  )

  /**
   * 设置站点列表（会自动触发订阅更新）
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
   * 清空站点数据（同时清除所有订阅）
   */
  const clearStations = () => {
    // 取消所有订阅
    stompSubscriptionMap.forEach((subscriptionId, stationId) => {
      unsubscribeStation(stationId)
    })
    stompSubscriptionMap.clear()
    
    stations.value = []
    previousStationIds = []
    isFirstLoad = true // 重置首次加载标志
  }

  /**
   * 获取站点列表（普通请求）
   * 使用 src/api/station.ts 中的 getStations
   * @param stationId 可选站点ID，不传则获取全部
   */
  const fetchStations = async (stationId?: number): Promise<ApiResponse<Stations[]>> => {
    loading.value = true
    try {
      const res = await getStations(stationId)
      if (res.code === 200 && res.data) {
        // 如果是获取全部站点，更新 stations（会自动触发订阅更新）
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
   * 使用 src/api/station.ts 中的 getStationsSkipCancel
   * @param stationId 可选站点ID
   */
  const fetchStationsSkipCancel = async (stationId?: number): Promise<ApiResponse<Stations[]>> => {
    loading.value = true
    try {
      const res = await getStationsSkipCancel(stationId)
      if (res.code === 200 && res.data) {
        // 如果是获取全部站点，更新 stations（会自动触发订阅更新）
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

  /**
   * 设置当前站点详情信息
   * @param detail 站点详情信息
   */
  const setCurrentStationDetail = (detail: StationInformation | null) => {
    currentStationDetail.value = detail
  }

  /**
   * 清空当前站点详情信息
   */
  const clearCurrentStationDetail = () => {
    currentStationDetail.value = null
  }

  return {
    // 状态
    stations,
    currentStationDetail,
    loading,
    
    // 计算属性
    totalAlarmCount,
    stationIds,
    
    // 方法
    setStations,
    updateStationAlarmCount,
    getStationById,
    clearStations,
    fetchStations,
    fetchStationsSkipCancel,
    updateStation,
    setCurrentStationDetail,
    clearCurrentStationDetail,
    setAlarmCallback,
    subscribeStation,
    unsubscribeStation,
  }
})
