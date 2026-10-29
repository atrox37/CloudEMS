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
import LoadingBg from '@/components/common/LoadingBg.vue'
import { useStationStore } from '@/stores/station'

const stationStore = useStationStore()

/** 正在单独同步的站点 id 列表 */
const syncingIds = ref<number[]>([])

// 直接消费 store 的站点列表：MainLayout 轮询或其他页面刷新 store 后这里自动更新，
// 即使本页的请求失败/被取消也能自愈，不再出现永远的 "No station data"
const localStations = computed(() =>
  stationStore.stations.map((station) => ({
    ...station,
    loading: syncingIds.value.includes(station.stationId),
  })),
)

onMounted(async () => {
  try {
    // store 已有数据时静默刷新，不触发整页 loading
    await stationStore.fetchStations(undefined, {
      skipStoreLoading: stationStore.stations.length > 0,
    })
  } catch {
    // 失败由 MainLayout 的轮询兜底，store 更新后页面自动恢复
  }
})

const handleSync = async (stationId: number) => {
  if (syncingIds.value.includes(stationId)) {
    return
  }
  syncingIds.value.push(stationId)
  try {
    // updateStation 会把单站点结果合并回 store 列表，computed 自动刷新卡片
    await stationStore.updateStation(stationId)
  } finally {
    syncingIds.value = syncingIds.value.filter((id) => id !== stationId)
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
