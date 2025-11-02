<template>
  <div class="Alarm-container">
    <LoadingBg :loading="!stationLoading && dashboardListLoading">
    <div class="Alarm-summary">
      <ModuleCard title="Alarm Summary">
        <div class="Alarm-summary__content">
          <div v-for="item in dashboardList" :key="item.id" class="Alarm-item">
            <DashboardCard :dashboardData="item.dashboardData" :iconBgColor="item.iconBgColor" />
          </div>

        </div>
      </ModuleCard>
    </div>
    <div class="critical-Alarm">
      <ModuleCard :title="`Critical Alarm (${stationAlarm.level1.length || 0})`">
        <div class="critical-Alarm__content">
          <div v-for="item in stationAlarm.level1" class="critical-Alarm__item" :key="item.deviceId">
            <AlarmCard :AlarmData="item" :level="1" />
          </div>
        </div>
      </ModuleCard>
    </div>
    <div class="warning-Alarm">
      <ModuleCard :title="`Warning Alarm (${stationAlarm.level2.length || 0})`">
        <div class="warning-Alarm__content">
          <div v-for="item in stationAlarm.level2" class="warning-Alarm__item" :key="item.deviceId">
            <AlarmCard :AlarmData="item" :level="2" />
          </div>
        </div>
      </ModuleCard>
    </div>
    <div class="info-Alarm">
      <ModuleCard :title="`Info Alarm (${stationAlarm.level3.length || 0})`">
        <div class="info-Alarm__content">
          <div v-for="item in stationAlarm.level3" class="info-Alarm__item" :key="item.deviceId">
            <AlarmCard :AlarmData="item" :level="3" />
          </div>
        </div>
      </ModuleCard>
    </div>
  </LoadingBg>
  </div>

</template>

<script setup lang="ts">
import ModuleCard from '@/components/card/ModuleCard.vue';
import criticalIcon from '@/assets/icons/station-dashboard-critical.svg'
import warningIcon from '@/assets/icons/station-dashboard-warning.svg'
import infoIcon from '@/assets/icons/station-dashboard-info.svg'
import AlarmCard from './components/AlarmCard.vue'
import { getStationAlarm, getStationAlarmStatistics } from '@/api/station'
import type { DashboardProps } from '@/components/card/DashboardCard.vue'
import type { StationAlarm, StationAlarmStatistics } from '@/types/Stations'
import { useRoute } from 'vue-router'
import { getAlarmDeviceList } from '@/api/alarm'

defineProps<{
  stationLoading: boolean
}>()
const route = useRoute()
const dashboardListLoading = ref(false)
const stationAlarm = ref<StationAlarm>({
  level1: [],
  level2: [],
  level3: [],
})

const dashboardList = ref<DashboardProps[]>([
  {
    id: 1,
    dashboardData: {
      title: 'Critical Alarm',
      value: '-',
      icon: criticalIcon,
    },
    iconBgColor: 'rgba(255, 59, 59, 0.1)'

  },
  {
    id: 2,
    dashboardData: {
      title: 'Warning Alarm',
      value: '-',
      icon: warningIcon,
    },
    iconBgColor: 'rgba(255, 105, 0, 0.1)'
  },
  {
    id: 3,
    dashboardData: {
      title: 'Info Alarm',
      value: '-',
      icon: infoIcon,
    },
    iconBgColor: 'rgba(29, 134, 255, 0.1)'
  },
])

const fetchStationAlarmStatisticsData = async (stationId: string | number) => {
  try {
    dashboardListLoading.value = true
    const res2 = await getStationAlarmStatistics(stationId)
    if (res2.code === 200) {
      // const alarmDeviceList:number[] = []
      // res2.data.level1Data.forEach(item => {
      //   alarmDeviceList.push(item.deviceId)
      // })
      // res2.data.level2Data.forEach(item => {
      //   alarmDeviceList.push(item.deviceId)
      // })
      // res2.data.level3Data.forEach(item => {
      //   alarmDeviceList.push(item.deviceId)
      // })
      // const quchongDeviceList = [...new Set(alarmDeviceList)]
      // const res3 = await getAlarmDeviceList(quchongDeviceList)
      // 
      dashboardList.value[0].dashboardData.value = res2.data.level1
      dashboardList.value[1].dashboardData.value = res2.data.level2
      dashboardList.value[2].dashboardData.value = res2.data.level3
      stationAlarm.value.level1 = res2.data.level1Data
      stationAlarm.value.level2 = res2.data.level2Data
      stationAlarm.value.level3 = res2.data.level3Data
    }
  } finally {
    dashboardListLoading.value = false
  }
}


onMounted(() => {
  const stationId = route.query.stationId as string | number
  fetchStationAlarmStatisticsData(stationId)
})
</script>

<style scoped lang="scss">
.Alarm-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;

  .Alarm-summary {
    width: 100%;

    .Alarm-summary__content {
      margin-top: 0.2rem;
      display: flex;
      gap: 0.2rem;
      width: 100%;

      .Alarm-item {
        height: 1rem;
        width: calc((100% - 0.4rem) / 3);
      }
    }
  }

  .critical-Alarm,
  .warning-Alarm,
  .info-Alarm {
    width: 100%;
    margin-top: 0.2rem;

    .critical-Alarm__content,
    .warning-Alarm__content,
    .info-Alarm__content {
      margin-top: 0.2rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
  }
}
</style>
