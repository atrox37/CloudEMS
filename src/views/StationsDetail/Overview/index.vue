<template>
  <div class="overview-container">
    <!-- <div class="overview-container__dashborad">
      <div class="dashboard-title">Analytics Dashboard</div>
      <div class="dashboard-content">
        <div v-for="item in dashboardList" :key="item.id" class="dashboard-content-item">
          <DashboardCard :dashboardData="item.data" :iconBgColor="item.iconBgColor" />
        </div>
      </div>
    </div> -->
    <!-- <div class="overview-container__main"> -->
    <div class="overview-container__tuopu">
      <LoadingBg :loading="!stationLoading && tuopuLoading">
        <Tuopu :data="stationOverview" />
      </LoadingBg>
    </div>
    <ModuleCard title="Weekly Energy Sources" :loading="!stationLoading && lineChartLoading">
      <LineChart title="Weekly Energy Sources" :xAxiosOption="xAxiosOption" :yAxiosOption="yAxiosOption" :series="overviewSeries" />
    </ModuleCard>
  </div>
  <!-- </div> -->

</template>

<script setup lang="ts">
// import DashboardCard from '../../../components/card/DashboardCard.vue'

// import totalOutputIcon from '@/assets/icons/station-dashboard-output.svg'
// import batteryLevelIcon from '@/assets/icons/station-dashboard-battery.svg'
// import dieselPowerIcon from '@/assets/icons/station-dashboard-diesel.svg'
// import efficiencyIcon from '@/assets/icons/station-dashboard-efficiency.svg'
// import temperatureIcon from '@/assets/icons/station-dashboard-temperature.svg'
import Tuopu from './tuopu.vue'
import { getStationOverview, getStationOverchart } from '@/api/station'
import type { StationOverview } from '@/types/Stations'
import type { SeriesData, XAxisOption, YAxisOption } from '@/components/charts/lineChart.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
defineProps<{
  stationLoading: boolean
}>()
const tuopuLoading = ref(false)
const lineChartLoading = ref(false)
const stationOverview = ref<StationOverview>({
  pvP: 0,
  loadP: 0,
  essP: 0,
  essSoc: 0,
  dieselP: 0,
  dieselOil: 0
})
const overviewSeries = ref<SeriesData[]>([
  {
    name: 'pv',
    data: [],
    color: '#4FADF7'
  },
  {
    name: 'diesel generator',
    data: [],
    color: '#F6C85F'
  },
  {
    name: 'ess',
    data: [],
    color: '#6DD400'
  }
])
const xAxiosOption = ref<XAxisOption>({
  xAxiosData: [],
})
const yAxiosOption = ref<YAxisOption>({
  yUnit: 'kWh'
})

const fetchStationOverviewData = async (stationId: string | number) => {
  try {
    tuopuLoading.value = true
    const res = await getStationOverview(stationId)
    if (res.code === 200) {
      stationOverview.value = res.data
    }
  } finally {
    tuopuLoading.value = false
  }
}

const fetchStationOverchartData = async (stationId: string | number) => {
  try {
    lineChartLoading.value = true
    const res2 = await getStationOverchart(stationId)
    if (res2.code === 200) {
      xAxiosOption.value.xAxiosData = res2.data.guangFu.map(item => item.ts)
      overviewSeries.value[0].data = res2.data.guangFu.map(item => item.numberValue)
      overviewSeries.value[1].data = res2.data.chaiFa.map(item => item.numberValue)
      overviewSeries.value[2].data = res2.data.chuNeng.map(item => item.numberValue)
    }
  } finally {
    lineChartLoading.value = false
  }
}
onMounted(() => {
  const stationId = route.query.stationId as string | number
  fetchStationOverviewData(stationId)
  fetchStationOverchartData(stationId)
})

</script>

<style scoped lang="scss">
.overview-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;



  .overview-container__dashborad {
    width: 100%;
    margin: 0.2rem 0;

    .dashboard-title {
      font-weight: 700;
      font-size: 0.2rem;
      line-height: 0.22rem;
      letter-spacing: 0%;
      color: #fff;
      margin-bottom: 0.2rem;
    }

    .dashboard-content {
      width: 100%;
      height: 1rem;
      display: flex;
      gap: 0.2rem;

      .dashboard-content-item {
        width: calc((100% - 0.8rem) / 4);
        height: 100%;
      }
    }
  }

  .overview-container__tuopu {
    position: relative;
    width: 100%;
    height: 6rem;
    background-color: rgba(84, 98, 140, 0.2);
    border: 1px solid;

    border-image: linear-gradient(117.64deg, rgba(148, 166, 197, 0.3) 2.73%, rgba(148, 166, 197, 0) 31.73%, rgba(148, 166, 197, 0.103266) 71.62%, rgba(148, 166, 197, 0.3) 97.67%) 1;


    // background-image: url('@/assets/images/tuopu-bg.png');
    // background-size: 100% 100%;
    // background-repeat: no-repeat;
    // background-position: center;
    margin-bottom: 0.2rem;
  }

  .overview-container__main {
    height: calc(100% - 1.82rem);
    width: 100%;
    overflow-y: auto;


  }
}
</style>
