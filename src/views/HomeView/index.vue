<template>
  <div class="voltage-class home-view">
    <LoadingBg :loading="globalStore.loading">
      <div class="home-view-map">
        <USAMapChart :powerStations="powerStations" />
      </div>
      <div class="home-view-dashboard">
        <div class="home-view-dashboard-item" v-for="item in dashboardData" :key="item.title">
          <EnergyCard
            :title="item.title"
            :value="item.value"
            :unit="item.unit"
            :iconUrl="item.iconUrl"
            bgColor="var(--vt-bg-input)"
          />
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
import { getHomeTotalData } from '@/api/home'
import { useGlobalStore } from '@/stores/global'
import { useStationStore } from '@/stores/station'
import type { EnergyCardProps } from '@/components/card/EnergyCard.vue'

const globalStore = useGlobalStore()
const stationStore = useStationStore()

// 发电站数据：直接由 store 站点列表派生，store 更新（含 MainLayout 轮询兜底）后自动刷新
const powerStations = computed<PowerStation[]>(() =>
  stationStore.stations.flatMap((station) => {
    const longitude = station.wgTag.find((tag) => tag.tagKey === 'longitude')?.tagValue || ''
    const latitude = station.wgTag.find((tag) => tag.tagKey === 'latitude')?.tagValue || ''
    const state = station.wgTag.find((tag) => tag.tagKey === 'State')?.tagValue || ''
    if (!longitude || !latitude || !state) {
      return []
    }
    return [
      {
        id: station.stationId,
        name: station.stationName,
        status: station.stationStatus as 'online' | 'offline',
        coordinates: [parseFloat(longitude), parseFloat(latitude)] as [number, number],
        state: state,
        powerValue: station.pv_power,
        powerUnit: 'KWh',
        socValue: station.soc,
        socUnit: '%',
        Alarm: station.alarmCount,
      },
    ]
  }),
)

const dashboardData = reactive<EnergyCardProps[]>([
  {
    title: 'Energy Today',
    value: '-',
    unit: 'kWh',
    iconUrl: energyToday,
  },
  {
    title: 'Online Stations',
    value: '-',
    iconUrl: energyOnlineStations,
  },
  {
    title: 'Alarms',
    value: '-',
    iconUrl: energyAlarms,
  },
  {
    title: 'Saving Billing',
    value: '-',
    iconUrl: energySavingBilling,
    unit: '$',
  },
])

onMounted(() => {
  // 获取首页总数据
  const fetchHomeTotalData = async () => {
    try {
      const res = await getHomeTotalData()
      if (res.code === 200) {
        dashboardData[0].value = res.data.todayEnergy
        dashboardData[1].value = res.data.stationOnline
        dashboardData[2].value = res.data.stationAlarmSum
        dashboardData[3].value = res.data.todayPrice
      }
    } catch {
      // 失败保持 '-' 占位，不产生未处理的 Promise 拒绝
    }
  }

  fetchHomeTotalData()
  // 站点数据由 computed 从 store 派生；这里只负责触发刷新，失败由 MainLayout 轮询兜底
  stationStore
    .fetchStations(undefined, { skipStoreLoading: stationStore.stations.length > 0 })
    .catch(() => {})
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
