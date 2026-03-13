<template>
  <div class="statistics">
    <div class="statistics__header">
      <LoadingBg :loading="statisticsTotalLoading">
        <div class="statisticsTotal">
          <div class="statisticsTotal__item" v-for="item in statisticsTotalList" :key="item.id">
            <DashboardCard
              :dashboardData="item.dashboardData"
              :iconBgColor="item.iconBgColor"
              :isDesc="true"
              title=""
            />
          </div>
        </div>
      </LoadingBg>
    </div>
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="statistics__content-item">
          <ModuleCard title="Storage state" :loading="storageStateLoading">
            <DoughnutChart :series="StorageStateSeries" title="Storage state" />
          </ModuleCard>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistics__content-item">
          <ModuleCard
            title="Energy Structure Analysis(Today)"
            :loading="energyStructureAnalysisLoading"
          >
            <DoughnutChart
              :series="EnergyStructureAnalysisSeries"
              title="Energy Structure Analysis(Today)"
            />
          </ModuleCard>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistics__content-item">
          <ModuleCard title="Diesel Generator Status" :loading="dieselGeneratorStatusLoading">
            <DoughnutChart :series="DieselGeneratorStatusSeries" title="Diesel Generator Status" />
          </ModuleCard>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="statistics__content-item">
          <ModuleCard title="Power Curve (Today)" :loading="powerCurveLoading">
            <LineChart
              :xAxiosOption="powerCurveData.xAxiosOption"
              :yAxiosOption="powerCurveData.yAxiosOption"
              :series="powerCurveData.series"
              title="Power Curve (Today)"
            />
          </ModuleCard>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="statistics__content-item">
          <ModuleCard
            title="Self-sufficiency rate curve (hourly)"
            :loading="energyConsumptionLoading"
          >
            <LineChart
              :xAxiosOption="energyConsumptionData.xAxiosOption"
              :yAxiosOption="energyConsumptionData.yAxiosOption"
              :series="energyConsumptionData.series"
              title="Self-sufficiency rate curve (hourly)"
            />
          </ModuleCard>
        </div>
      </el-col>
    </el-row>

    <!-- <el-row :gutter="20">
      <el-col :span="12">
        <div class="statistics__content-item">
          <ModuleCard title="Daily cost savings vs Pure Diesel">
            <MultiBarChart :xAxiosOption="costSavingsData.xAxiosOption" :yAxiosOption="costSavingsData.yAxiosOption"
              :series="costSavingsData.series" />
          </ModuleCard>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="statistics__content-item">
          <ModuleCard title="Power Output Trends">
            <LineChart :xAxiosOption="powerOutputData.xAxiosOption" :yAxiosOption="powerOutputData.yAxiosOption"
              :series="powerOutputData.series" />
          </ModuleCard>
        </div>
      </el-col>
    </el-row> -->
    <div class="statistic__list">
      <div class="statistic__list-header">
        <div class="header__title">Analytics Dashboard</div>
        <div class="header__btn">
          <IconButton
            :icon="refreshIcon"
            type="warning"
            text="refresh"
            :disabled="analyticsLineLoading"
            @click="getAnalyticsLine"
          />
        </div>
      </div>
      <div class="statistic__list-content">
        <LoadingBg :loading="analyticsLineLoading">
          <el-table :data="tableData" style="width: 100%" table-layout="fixed">
            <el-table-column prop="stationName" label="Station Name" />
            <el-table-column prop="address" label="Address">
              <template #default="scope">
                <img :src="addressIcon" alt="address-icon" style="margin-right: 0.03rem" />
                <div>{{ scope.row.address }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="Status">
              <template #default="scope">
                <!-- <div class="statistic__list-content-item-status"> -->
                <img
                  :src="scope.row.status === 'online' ? onlineIcon : offlineIcon"
                  style="margin-right: 0.03rem"
                />
                <div style="">{{ scope.row.status }}</div>
                <!-- </div> -->
              </template>
            </el-table-column>

            <el-table-column prop="battery(soc)" label="Battery(soc)">
              <template #default="scope">
                {{ scope.row['battery(soc)'] }}%
              </template>
            </el-table-column>
            <el-table-column prop="loadPower" label="Load Power">
              <template #default="scope"> {{ scope.row.loadPower }} kW</template>
            </el-table-column>
            <el-table-column prop="dieselPower" label="Diesel Power">
              <template #default="scope"> {{ scope.row.dieselPower }} kW</template>
            </el-table-column>
            <!-- <el-table-column prop="efficiency" label="Efficiency">
            <template #default="scope">
              {{ scope.row.efficiency }}%
            </template>
          </el-table-column> -->
            <el-table-column prop="Alarm" label="Alarm Count"> </el-table-column>
            <el-table-column prop="lastUpdate" label="Last Update" />
          </el-table>
        </LoadingBg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getStatisticsTotalData,
  getStorageStateData,
  getEnergyStructureAnalysisData,
  getDieselGeneratorStatusData,
  getPowerCurveData,
  getEnergyConsumptionData,
  getAnalyticsLineData,
} from '@/api/statistics'
import type { AnalyticsAllData, AnalyticsWgTag   } from '@/types/statistics'

import totalStationIcon from '@/assets/icons/dashboard-totalStation.svg'
import currentOutputIcon from '@/assets/icons/dashboard-output.svg'
import todayEnergyIcon from '@/assets/icons/dashboard-energy.svg'
import costSavingIcon from '@/assets/icons/dashboard-cost.svg'
import refreshIcon from '@/assets/icons/button-refresh.svg'
import onlineIcon from '@/assets/icons/station-status__online.svg'
import offlineIcon from '@/assets/icons/station-status__offline.svg'
import addressIcon from '@/assets/icons/address.svg'
import type { DashboardProps } from '@/components/card/DashboardCard.vue'
// import { getEnergyConsumptionData } from '@/api/statistics'
interface TableData {
  id: number
  stationName: string
  address: string
  status: string
  'battery(soc)': number
  loadPower: number
  dieselPower: number
  Alarm: number
  lastUpdate: string
}

const statisticsTotalLoading = ref(false)
const storageStateLoading = ref(false)
const energyStructureAnalysisLoading = ref(false)
const dieselGeneratorStatusLoading = ref(false)
const powerCurveLoading = ref(false)
const energyConsumptionLoading = ref(false)
const analyticsLineLoading = ref(false)

const statisticsTotalList = ref<DashboardProps[]>([
  {
    id: 1,
    dashboardData: {
      title: 'Total stations',
      value: '-',
      icon: totalStationIcon,
    },
    iconBgColor: 'rgba(29, 134, 255, 0.1)',
  },
  {
    id: 2,
    dashboardData: {
      title: 'Current PV power',
      value: '-',
      unit: 'kW',
      icon: currentOutputIcon,
    },
    iconBgColor: 'rgba(106, 193, 97, 0.1)',
  },
  {
    id: 3,
    dashboardData: {
      title: 'Current Load Power',
      value: '-',
      unit: 'kWh',
      icon: todayEnergyIcon,
    },
    iconBgColor: 'rgba(201, 178, 63, 0.1)',
  },
  {
    id: 4,
    dashboardData: {
      title: 'Cost saving Today',
      value: '$0',
      unit: 'vs pure diesel',
      icon: costSavingIcon,
    },
    iconBgColor: 'rgba(106, 193, 97, 0.1)',
  },
])

// 第一个el-row的图表数据
const powerCurveData = ref({
  xAxiosOption: {
    xAxiosData: [] as string[],
  },
  yAxiosOption: {
    yUnit: 'kW',
  },
  series: [
    {
      name: 'PV',
      data: [] as number[],
      color: '#ee6666',
    },
    {
      name: 'ESS',
      data: [] as number[],
      color: '#1d86ff',
    },
    {
      name: 'DG',
      data: [] as number[],
      color: '#ffe58f',
    },
    {
      name: 'Load',
      data: [] as number[],
      color: '#1d86ff',
    },
  ],
})

const energyConsumptionData = ref({
  xAxiosOption: {
    xAxiosData: [] as string[],
  },
  yAxiosOption: {
    yUnit: 'kW',
  },
  series: [
    {
      name: 'Self-sufficiency rate',
      data: [] as number[],
      color: '#6ac161',
    },
  ],
})

const StorageStateSeries = ref([
  { value: 0, name: 'Charging ', color: '#fc8452',unit:'min' },
  { value: 0, name: 'Discharging ', color: '#597ef7',unit:'min' },
  { value: 0, name: 'Idle ', color: '#ffa726',unit:'min' },
])
const EnergyStructureAnalysisSeries = ref([
  { value: 0, name: 'PV', color: '#ee6666',unit:'kWh' },
  { value: 0, name: 'DG', color: '#ffe58f',unit:'kWh' },
])
const DieselGeneratorStatusSeries = ref([
  { value: 0, name: 'Running', color: '#6ac161',unit:'min' },
  { value: 0, name: 'Standby', color: '#ff6b6b',unit:'min' },
  { value: 0, name: 'Maintenance', color: '#ffa726',unit:'min' },
])
const tableData = ref<TableData[]>([])
const getStatisticsTotal = async () => {
  try {
    statisticsTotalLoading.value = true
    const res = await getStatisticsTotalData()
    if (res.code === 200) {
      statisticsTotalList.value[0].dashboardData.value = res.data.statisticsCount
      statisticsTotalList.value[1].dashboardData.value = res.data.statisticsPv
      statisticsTotalList.value[2].dashboardData.value = res.data.statisticsLoad
      statisticsTotalList.value[3].dashboardData.value = res.data.statisticsBenefit
    }
  } finally {
    statisticsTotalLoading.value = false
  }
}
const getStorageState = async () => {
  try {
    storageStateLoading.value = true
    const res = await getStorageStateData()
    if (res.code === 200) {
      // 
      StorageStateSeries.value[0].value = res.data.totalCharging
      StorageStateSeries.value[1].value = res.data.totalDischarging
      StorageStateSeries.value[2].value = res.data.totalIdle
    }
  } finally {
    storageStateLoading.value = false
  }
}
const getEnergyStructureAnalysis = async () => {
  try {
    energyStructureAnalysisLoading.value = true
    const res = await getEnergyStructureAnalysisData()
    if (res.code === 200) {
      EnergyStructureAnalysisSeries.value[0].value = res.data.totalGF
      EnergyStructureAnalysisSeries.value[1].value = res.data.totalCF
    }
  } finally {
    energyStructureAnalysisLoading.value = false
  }
}
const getDieselGeneratorStatus = async () => {
  try {
    dieselGeneratorStatusLoading.value = true
    const res = await getDieselGeneratorStatusData()
    if (res.code === 200) {
      DieselGeneratorStatusSeries.value[0].value = res.data.totalRunning
      DieselGeneratorStatusSeries.value[1].value = res.data.totalIdle
      DieselGeneratorStatusSeries.value[2].value = res.data.totalError
    }
  } finally {
    dieselGeneratorStatusLoading.value = false
  }
}
const getPowerCurve = async () => {
  try {
    powerCurveLoading.value = true
    const res = await getPowerCurveData()
    if (res.code === 200) {
      powerCurveData.value.xAxiosOption.xAxiosData = res.data.gfResult.map((item: any) =>
        item.ts.replace(' ', '\n'),
      )
      powerCurveData.value.series[0].data = res.data.gfResult.map((item: any) => item.numberValue)
      powerCurveData.value.series[1].data = res.data.cnResult.map((item: any) => item.numberValue)
      powerCurveData.value.series[2].data = res.data.cfResult.map((item: any) => item.numberValue)
      powerCurveData.value.series[3].data = res.data.fzResult.map((item: any) => item.numberValue)
    }
  } finally {
    powerCurveLoading.value = false
  }
}
const getEnergyConsumption = async () => {
  try {
    energyConsumptionLoading.value = true
    const res = await getEnergyConsumptionData()
    if (res.code === 200) {
      
      energyConsumptionData.value.xAxiosOption.xAxiosData = res.data.map((item: any) =>
        item.ts.replace(' ', '\n'),
      )
      energyConsumptionData.value.series[0].data = res.data.map((item: any) => item.numberValue)
    }
  } finally {
    energyConsumptionLoading.value = false
  }
}
// const getAnalyticsLine
const getAnalyticsLine = async () => {
  try {
    analyticsLineLoading.value = true
    const res = await getAnalyticsLineData()
    if (res.code === 200) {
      tableData.value = res.data.map((item: AnalyticsAllData) => ({
        id: item.deviceInstancePo.id,
        stationName: item.deviceInstancePo.name,
        address: item.wgTag.find((tag: AnalyticsWgTag) => tag.tagKey === 'Location')?.tagValue ?? '',
        status: item.deviceInstancePo.status,
        'battery(soc)': item.batteryRate,
        Alarm: item.alarmCount,
        lastUpdate: item.deviceInstancePo.statusTime,
        loadPower: item.loadPower,
        dieselPower: item.dieselPower,
      }))
    }
  } finally {
    analyticsLineLoading.value = false
  }
}

onMounted(() => {
  getStatisticsTotal()
  getStorageState()
  getEnergyStructureAnalysis()
  getDieselGeneratorStatus()
  getPowerCurve()
  getEnergyConsumption()
  getAnalyticsLine()
})
</script>

<style scoped lang="scss">
.statistics {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;

  .statistics__header {
    height: 1rem;
    width: 100%;

    .statisticsTotal {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.2rem;

      .statisticsTotal__item {
        width: calc((100% - 0.6rem) / 4);
        height: 100%;
      }
    }
  }

  .statistics__content {
  }

  .statistics__content-item {
    height: 2.98rem;
    width: 100%;
    margin-top: 0.2rem;
  }

  .statistic__list {
    width: 100%;
    margin-top: 0.2rem;

    .statistic__list-header {
      margin-bottom: 0.2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header__title {
        font-weight: 700;
        font-size: 0.2rem;
        line-height: 0.22rem;
        letter-spacing: 0%;
      }
    }

    .statistic__list-content {
      img {
        width: 0.12rem;
        height: 0.12rem;
        object-fit: contain;
      }
    }
  }
}
</style>
