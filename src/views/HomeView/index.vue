<template>
  <div class="voltage-class home-view">
    <LoadingBg :loading="globalStore.loading">
    <div class="home-view-map">
      <USAMapChart :powerStations="powerStations" />
    </div>
    <div class="home-view-dashboard">
      <div class="home-view-dashboard-item" v-for="item in dashboardData" :key="item.title">
        <EnergyCard :title="item.title" :value="item.value" :unit="item.unit" :iconUrl="item.iconUrl" bgColor="rgba(84, 98, 140, 0.2)" />
      </div>
    </div>
    </LoadingBg>
  </div>
</template>

<script setup lang="ts">
import USAMapChart, { type PowerStation } from '@/components/charts/USAMapChart.vue'
import energyToday from '@/assets/icons/energy-today.svg'
import energyOnlineStations from '@/assets/icons/energy-onlineStation.svg'
import energyAlarms from '@/assets/icons/energy-alarms.svg'
import energySavingBilling from '@/assets/icons/energy-savingBilling.svg'
import LoadingBg from '@/components/common/LoadingBg.vue'
import {getHomeTotalData} from '@/api/home'
import { useGlobalStore } from '@/stores/global'
const globalStore = useGlobalStore()
// 发电站数据
const powerStations = reactive<PowerStation[]>([
  {
    id: '1',
    name: 'NORTON CREEK SOLAR ENERGY CENTER',
    type: 'solar',
    capacity: 550,
    status: 'online',
    coordinates: [-119.4179, 36.7783],
    state: 'California',
    powerValue: 120,
    powerUnit: 'KWh',
    sqcValue: 24,
    sqcUnit: '%',
    Alarm: 'NO',
  },
  {
    id: '2',
    name: 'NORTON CREEK SOLAR ENERGY CENTER',
    type: 'solar',
    capacity: 300,
    status: 'online',
    coordinates: [-99.9018, 31.9686],
    state: 'Texas',
    powerValue: 120,
    powerUnit: 'KWh',
    sqcValue: 24,
    sqcUnit: '%',
    Alarm: 'NO',
  },
  {
    id: '5',
    name: 'NORTON CREEK SOLAR ENERGY CENTER',
    type: 'solar',
    capacity: 800,
    status: 'maintenance',
    coordinates: [-81.6869, 27.6648],
    state: 'Florida',
    powerValue: 120,
    powerUnit: 'KWh',
    sqcValue: 24,
    sqcUnit: '%',
    Alarm: 'NO',
  },
  {
    id: '7',
    name: 'NORTON CREEK SOLAR ENERGY CENTER',
    type: 'solar',
    capacity: 400,
    status: 'online',
    coordinates: [-111.0937, 34.0489],
    state: 'Arizona',
    powerValue: 120,
    powerUnit: 'KWh',
    sqcValue: 24,
    sqcUnit: '%',
    Alarm: 'NO',
  },
])

const dashboardData = reactive([
  {
    title: 'Energy Today',
    value: 0,
    unit: 'kWh',
    iconUrl: energyToday,
  },
  {
    title: 'Online Stations',
    value: 0,
    iconUrl: energyOnlineStations,
  },
  {
    title: 'Alarms',
    value: 0,
    iconUrl: energyAlarms,
  },
  {
    title: 'Saving Billing',
    value: 0,
    iconUrl: energySavingBilling,
  }
])

onMounted(async () => {
  const res = await getHomeTotalData()
  if (res.code === 200) {
    dashboardData[0].value = res.data.todayEnergy
    dashboardData[1].value = res.data.stationOnline
    dashboardData[2].value = res.data.stationAlarmSum
    dashboardData[3].value = res.data.todayPrice
  }
})
</script>

<style scoped lang="scss">
.voltage-class.home-view {
  position: relative;
  width: 100%;
  height: 100%;

  &::before {
    content: '';
    width: calc(100% + 0.4rem);
    height: calc(100% + 0.4rem);
    position: absolute;
    top: -0.2rem;
    left: -0.2rem;
    background-image: url('@/assets/images/home-bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 1;
  }

  .home-view-map {
    position: relative;
    z-index: 3;
    height: calc(100% - 1.02rem);
    width: 100%;
  }

  .home-view-dashboard {
    position: relative;
    z-index: 3;
    height: 1.02rem;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.2rem;

    .home-view-dashboard-item {
      height: 100%;
      width: calc((100% - 0.6rem) / 4);
      cursor: pointer;
    }
  }
}
</style>
