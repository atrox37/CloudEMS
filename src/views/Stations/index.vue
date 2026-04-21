<template>
  <div class="voltage-class stations-container">
    <LoadingBg :loading="stationStore.loading">
      <div class="stations-list" v-if="localStations.length > 0">
        <div class="stations-list__item" v-for="station in localStations" :key="station.stationId">
          <StationCard :station="station" @sync="handleSync" :loading="station.loading || false" />
        </div>
      </div>
      <!-- 无数据提示 -->
      <div class="stations-empty" v-else>
        <span class="stations-empty-text">No station data</span>
      </div>
    </LoadingBg>
  </div>
</template>

<script setup lang="ts">
import StationCard from './components/StationCard.vue'
import type { Stations } from '@/types/Stations'
import LoadingBg from '@/components/common/LoadingBg.vue'
import { useStationStore } from '@/stores/station'

const stationStore = useStationStore()

// 本地站点列表（带loading状态）
const localStations = ref<(Stations & { loading?: boolean })[]>([])

onMounted(async () => {
  const res = await stationStore.fetchStations()
  if (res.code === 200) {
    localStations.value = res.data.map((station) => ({
      ...station,
      loading: false,
    }))
  }
})

const handleSync = async (stationId: number) => {
  const numIndex = localStations.value.findIndex((station) => station.stationId === stationId)
  if (numIndex === -1) {
    return
  }
  try {
    localStations.value[numIndex].loading = true
    const res = await stationStore.fetchStations(stationId, { skipStoreLoading: true })
    if (res.code === 200 && res.data.length > 0) {
      localStations.value[numIndex] = { ...res.data[0], loading: false }
    }
  } finally {
    if (numIndex !== -1) {
      localStations.value[numIndex].loading = false
    }
  }
}
</script>

<style scoped lang="scss">
.voltage-class.stations-container {
  width: 100%;
  height: 100%;

  .stations-list {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;

    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .stations-list__item {
    width: calc(50% - 0.1rem);
    height: 4.47rem;
  }

  .stations-empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .stations-empty-text {
      font-size: 0.24rem;
      line-height: 0.22rem;
      color: var(--vt-white-60);
    }
  }
}
</style>
