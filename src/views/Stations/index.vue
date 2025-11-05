<template>
  <div class="voltage-class stations-container">
    <LoadingBg :loading="loading">
      <div class="stations-list">
        <div class="stations-list__item" v-for="station in stations" :key="station.stationId">
          <StationCard :station="station" @sync="handleSync" :loading="station.loading || false"/>
        </div>
      </div>
    </LoadingBg>
  </div>
</template>

<script setup lang="ts">
import StationCard from './components/StationCard.vue'
import { getStations } from '@/api/station'
import type { Stations } from '@/types/Stations'
import LoadingBg from '@/components/common/LoadingBg.vue'
// import { useGlobalStore } from '@/stores/global'
// const globalStore = useGlobalStore()
const loading = ref(false)
const stations = ref<Stations[]>([])
onMounted(async () => {
  loading.value = true
  try{
  const res = await getStations()
  if (res.code === 200) {
    stations.value = res.data.map((station) => ({
      ...station,
      loading: false,
    }))
  }
} finally {
  loading.value = false
}
})
const handleSync = async (stationId: number) => {
  // console.log(stationId)
  const numIndex = stations.value.findIndex((station) => station.stationId === stationId)
  if (numIndex === -1) {
    return
  }
  try{
    stations.value[numIndex].loading = true
    const res = await getStations(stationId)
    if (res.code === 200) {
      stations.value[numIndex] = res.data[0]
    }
  } finally {
    if (numIndex !== -1) {
      stations.value[numIndex].loading = false
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
}
</style>
