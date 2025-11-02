<template>
  <div class="performance-container">
    <div class="performance-container__enery">
      <ModuleCard title="Weekly Energy Sources" :loading="!stationLoading && chartLoading">
        <!-- <LineChart :xAxiosOption="xAxiosOption" :yAxiosOption="yAxiosOption" :series="series" /> -->
        <MultiBarChar title="Weekly Energy Sources" :xAxiosOption="xAxiosOption" :yAxiosOption="yAxiosOption" :series="series" />
      </ModuleCard>
    </div>
    <div class="performance-container__system">
      <ModuleCard title="System Efficiency" :loading="!stationLoading && systemDashboardLoading">
        <div class="system-content">
          <div v-for="item in systemDashboardList" :key="item.id" class="system-content__item">
            <DashboardCard :dashboardData="item.dashboardData" :iconBgColor="item.iconBgColor" />
          </div>
        </div>
      </ModuleCard>
    </div>
    <div class="performance-container__device">
      <ModuleCard title="Device Efficiency" :loading="!stationLoading && systemDashboardLoading">
        <div class="device-content">
          <div v-for="item in deviceDashboardList" :key="item.id" class="device-content__item">
            <DashboardCard :dashboardData="item.dashboardData" :iconBgColor="item.iconBgColor" />
          </div>
        </div>
      </ModuleCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import peakEfficiencyIcon from '@/assets/icons/station-dashboard-peakEfficiency.svg'
import averageEfficiencyIcon from '@/assets/icons/station-dashboard-averageEfficiency.svg'
import minimumEfficiencyIcon from '@/assets/icons/station-dashboard-minimumEfficiency.svg'
import solarPanelsIcon from '@/assets/icons/station-dashboard-solarPanels.svg'
import batterySystemIcon from '@/assets/icons/station-dashboard-batterySystem.svg'
import pvSystemIcon from '@/assets/icons/station-dashboard-pvSystem.svg'
import dieselGeneratorIcon from '@/assets/icons/station-dashboard-dieselGenerator.svg'

import { getPerformanceView, getPerformancechart } from '@/api/station'
import { getLastWeekArray } from '@/utils/time'
import { useRoute } from 'vue-router'

import type { DashboardProps } from '@/components/card/DashboardCard.vue'
import type { SeriesData, XAxisOption, YAxisOption } from '@/components/charts/MultiBarChar.vue'


defineProps<{
  stationLoading: boolean
}>()
const route = useRoute()

const chartLoading = ref(true)
const systemDashboardLoading = ref(true)
const series = ref<SeriesData[]>([
  {
    name: 'PV',
    data: [],
    color: 'rgba(3, 93, 239, 1)'
  },
  {
    name: 'DG',
    data: [],
    color: 'rgba(105, 203, 255, 1)'
  },
])
const systemDashboardList = ref<DashboardProps[]>([
  {
    id: 1,
    dashboardData: {
      title: 'Peak Efficiency',
      value: '-',
      unit: '%',
      icon: peakEfficiencyIcon,
    },
    iconBgColor: 'rgba(106, 193, 97, 0.1)'
  },
  {
    id: 2,
    dashboardData: {
      title: 'Average Efficiency',
      value: '-',
      unit: '%',
      icon: averageEfficiencyIcon,
    },
    iconBgColor: 'rgba(3, 93, 239, 0.1)'
  },
  {
    id: 3,
    dashboardData: {
      title: 'Minimum Efficiency',
      value: '-',
      unit: '%',
      icon: minimumEfficiencyIcon,
    },
    iconBgColor: 'rgba(255, 105, 0, 0.1)'
  },
])

const deviceDashboardList = ref<DashboardProps[]>([
  {
    id: 1,
    dashboardData: {
      title: 'Solar Panels',
      value: '-',
      unit: '%',
      icon: solarPanelsIcon,
    },
    iconBgColor: 'rgba(201, 178, 63, 0.1)'
  },
  {
    id: 2,
    dashboardData: {
      title: 'Battery System',
      value: '-',
      unit: '%',
      icon: batterySystemIcon,
    },
    iconBgColor: 'rgba(106, 193, 97, 0.1)'
  },
  {
    id: 3,
    dashboardData: {
      title: 'PV System',
      value: '-',
      unit: '%',
      icon: pvSystemIcon,
    },
    iconBgColor: 'rgba(3, 93, 239, 0.1)'
  },
  {
    id: 4,
    dashboardData: {
      title: 'Diesel Generator',
      value: '-',
      unit: '%',
      icon: dieselGeneratorIcon,
    },
    iconBgColor: 'rgba(255, 59, 59, 0.1)'
  }
])




const xAxiosOption = ref<XAxisOption>({
  xAxiosData: [],
  xUnit: 'Source'
})

const yAxiosOption = ref<YAxisOption>({
  yUnit: 'kWh'
})

// 单独封装获取性能视图数据的方法
const fetchPerformanceViewData = async (stationId: string | number) => {
  try {
    systemDashboardLoading.value = true
    const res = await getPerformanceView(stationId)
    if (res.code === 200) {
      systemDashboardList.value[0].dashboardData.value = res.data.sysPe
      systemDashboardList.value[1].dashboardData.value = res.data.sysAe
      systemDashboardList.value[2].dashboardData.value = res.data.sysMe
      deviceDashboardList.value[0].dashboardData.value = res.data.deviceSp
      deviceDashboardList.value[1].dashboardData.value = res.data.deviceBs
      deviceDashboardList.value[2].dashboardData.value = res.data.devicePs
      deviceDashboardList.value[3].dashboardData.value = res.data.deviceDg
    }
  } catch (error) {
    // 可以根据需要添加错误处理
    console.error('获取性能视图数据失败', error)
  } finally {
    systemDashboardLoading.value = false
  }
}

// 单独封装获取性能图表数据的方法
const fetchPerformanceChartData = async (stationId: string | number) => {
  try {
    chartLoading.value = true
    const res2 = await getPerformancechart(stationId)
    if (res2.code === 200) {
      xAxiosOption.value.xAxiosData = res2.data.guangFu.map(item => item.ts)
      series.value[0].data = res2.data.guangFu.map(item => item.numberValue)
      series.value[1].data = res2.data.chaiFa.map(item => item.numberValue)
    }
  } catch (error) {
    // 可以根据需要添加错误处理
    console.error('获取性能图表数据失败', error)
  } finally {
    chartLoading.value = false
  }
}

// 在onMounted中调用上面两个方法
onMounted(() => {
  const stationId = route.query.stationId as string | number
    fetchPerformanceViewData(stationId)
    fetchPerformanceChartData(stationId)
})
// const series = ref()
</script>

<style scoped lang="scss">
.performance-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  .performance-container__enery {
    width: 100%;
    height: 5rem;
    margin-bottom: 0.2rem;
  }

  .performance-container__system {
    width: 100%;
    // height: 1.8rem;
    margin-bottom: 0.2rem;

    .system-content {
      width: 100%;
      height: 100%;
      display: flex;
      gap: 0.2rem;
      align-items: center;
      padding-top: 0.2rem;

      .system-content__item {

        width: calc((100% - 0.4rem) / 3);
        height: 1rem;
      }
    }
  }

  .performance-container__device {
    width: 100%;
    height: 1.8rem;

    .device-content {
      width: 100%;
      height: 100%;
      display: flex;
      gap: 0.2rem;
      align-items: center;
      padding-top: 0.2rem;
    }

    .device-content__item {
      width: calc((100% - 0.6rem) / 4);
      height: 100%;
    }
  }
}
</style>
