import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Stations, StationInformation } from '@/types/Stations'
import type { ApiResponse } from '@/utils/request'
import { getStations, getStationsSkipCancel } from '@/api/station'
import stompManager from '@/utils/stomp'

export const useStationStore = defineStore('station', () => {
  const stations = ref<Stations[]>([])
  const currentStationDetail = ref<StationInformation | null>(null)
  const loading = ref(false)
  const stompSubscriptionMap = new Map<number, string>()
  let alarmCallback: ((alarm: any) => void) | null = null
  let previousStationIds: number[] = []
  let isFirstLoad = true

  const totalAlarmCount = computed(() =>
    stations.value.reduce((acc, station) => acc + (station.alarmCount || 0), 0),
  )
  const stationIds = computed(() =>
    stations.value.map((station) => station.stationId).sort((a, b) => a - b),
  )

  const setAlarmCallback = (callback: (alarm: any) => void) => {
    alarmCallback = callback
  }

  const subscribeStation = (stationId: number) => {
    if (stompSubscriptionMap.has(stationId) || !alarmCallback) {
      return
    }
    const subscriptionId = stompManager.subscribe(
      { destination: `/topic/report_property_${stationId}` },
      alarmCallback,
    )
    stompSubscriptionMap.set(stationId, subscriptionId)
  }

  const unsubscribeStation = (stationId: number) => {
    const subscriptionId = stompSubscriptionMap.get(stationId)
    if (!subscriptionId) {
      return
    }
    stompManager.unsubscribe(subscriptionId)
    stompSubscriptionMap.delete(stationId)
  }

  const updateSubscriptionsByDiff = (oldIds: number[], newIds: number[]) => {
    const addedIds = newIds.filter((id) => !oldIds.includes(id))
    const removedIds = oldIds.filter((id) => !newIds.includes(id))

    addedIds.forEach(subscribeStation)
    removedIds.forEach(unsubscribeStation)
  }

  watch(
    stationIds,
    (newIds, oldIds) => {
      if (isFirstLoad && newIds.length > 0) {
        newIds.forEach(subscribeStation)
        previousStationIds = [...newIds]
        isFirstLoad = false
        return
      }

      const compareSource = oldIds && oldIds.length > 0 ? oldIds : previousStationIds
      if (compareSource.length > 0 || newIds.length > 0) {
        updateSubscriptionsByDiff(compareSource, newIds)
      }
      previousStationIds = [...newIds]
    },
    { immediate: false },
  )

  const setStations = (data: Stations[]) => {
    stations.value = data
  }

  const updateStationAlarmCount = (stationId: number, count: number) => {
    const station = stations.value.find((item) => item.stationId === stationId)
    if (station) {
      station.alarmCount = count
    }
  }

  const getStationById = (stationId: number) =>
    stations.value.find((station) => station.stationId === stationId)

  const clearStations = () => {
    Array.from(stompSubscriptionMap.keys()).forEach(unsubscribeStation)
    stompSubscriptionMap.clear()
    stations.value = []
    previousStationIds = []
    isFirstLoad = true
  }

  const fetchStations = async (
    stationId?: number,
    options?: { skipStoreLoading?: boolean },
  ): Promise<ApiResponse<Stations[]>> => {
    const skipGlobalLoading = options?.skipStoreLoading === true
    if (!skipGlobalLoading) {
      loading.value = true
    }
    try {
      const response = await getStations(stationId)
      if (response.code === 200 && response.data && !stationId) {
        setStations(response.data)
      }
      return response
    } finally {
      if (!skipGlobalLoading) {
        loading.value = false
      }
    }
  }

  const fetchStationsSkipCancel = async (stationId?: number): Promise<ApiResponse<Stations[]>> => {
    loading.value = true
    try {
      const response = await getStationsSkipCancel(stationId)
      if (response.code === 200 && response.data && !stationId) {
        setStations(response.data)
      }
      return response
    } finally {
      loading.value = false
    }
  }

  const updateStation = async (stationId: number): Promise<boolean> => {
    const response = await fetchStations(stationId)
    if (response.code === 200 && response.data && response.data.length > 0) {
      const index = stations.value.findIndex((station) => station.stationId === stationId)
      if (index >= 0) {
        stations.value[index] = response.data[0]
      }
      return true
    }
    return false
  }

  const setCurrentStationDetail = (detail: StationInformation | null) => {
    currentStationDetail.value = detail
  }

  const clearCurrentStationDetail = () => {
    currentStationDetail.value = null
  }

  return {
    stations,
    currentStationDetail,
    loading,
    totalAlarmCount,
    stationIds,
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
