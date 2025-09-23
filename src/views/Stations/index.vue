<template>
  <div class="voltage-class stations-container">
    <LoadingBg :loading="globalStore.loading">
    <div class="stations-list">
      <div class="stations-list__item" v-for="station in stations" :key="station.stationId">
        <StationCard :station="station" />
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
import { useGlobalStore } from '@/stores/global'
const globalStore = useGlobalStore()
// interface Station {
//   id: string
//   name: string
//   status: string
//   currentPower: number
//   totalCapacity: number
//   powerPercentage: number
//   batteryLevel: number
//   efficiency: number
//   todayEnergy: number
//   temperature: number
//   lastUpdate: string
// }
// const stations = ref([
//   {
//     id: '1',
//     name: 'North Valley Solar',
//     status: 'offline',
//     currentPower: 120,
//     totalCapacity: 150,
//     powerPercentage: 80,
//     batteryLevel: 85,
//     efficiency: 92,
//     todayEnergy: 1240,
//     temperature: 96,
//     lastUpdate: '2025-08-27 12:00:00',
//   },
//   {
//     id: '2',
//     name: 'Red Maple Solar Site',
//     status: 'online',
//     currentPower: 120,
//     totalCapacity: 150,
//     powerPercentage: 80,
//     batteryLevel: 85,
//     efficiency: 92,
//     todayEnergy: 1240,
//     temperature: 96,
//     lastUpdate: '2025-08-27 12:00:00',
//   },
//   {
//     id: '3',
//     name: 'Glacier Plains',
//     status: 'online',
//     currentPower: 120,
//     totalCapacity: 150,
//     powerPercentage: 80,
//     batteryLevel: 85,
//     efficiency: 92,
//     todayEnergy: 1240,
//     temperature: 96,
//     lastUpdate: '2025-08-27 12:00:00',
//   },
//   {
//     id: '4',
//     name: 'Glacier Plains',
//     status: 'online',
//     currentPower: 120,
//     totalCapacity: 150,
//     powerPercentage: 80,
//     batteryLevel: 85,
//     efficiency: 92,
//     todayEnergy: 1240,
//     temperature: 96,
//     lastUpdate: '2025-08-27 12:00:00',
//   },
//   {
//     id: '5',
//     name: 'Forest Creek Station',
//     status: 'online',
//     currentPower: 120,
//     totalCapacity: 150,
//     powerPercentage: 80,
//     batteryLevel: 85,
//     efficiency: 92,
//     todayEnergy: 1240,
//     temperature: 96,
//     lastUpdate: '2025-08-27 12:00:00',
//   },
//   {
//     id: '6',
//     name: 'Meadow Knoll South',
//     status: 'online',
//     currentPower: 120,
//     totalCapacity: 150,
//     powerPercentage: 80,
//     batteryLevel: 85,
//     efficiency: 92,
//     todayEnergy: 1240,
//     temperature: 96,
//     lastUpdate: '2025-08-27 12:00:00',
//   }
// ])
const stations = ref<Stations[]>([])
onMounted(async () => {
  const res = await getStations()
  if (res.code === 200) {
    stations.value = res.data
  }
})
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
