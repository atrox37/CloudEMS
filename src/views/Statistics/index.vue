<template>
  <div class="statistics">
    <div class="statistics__header">
      <div class="statistics__header-item" v-for="item in statisticsList" :key="item.id">
        <DashboardCard :dashboardData="item.data" :iconBgColor="item.iconBgColor" :isDesc="true" />
      </div>
    </div>
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="statistics__content-item">
          <ModuleCard title="Storage Performance">
            <LineChart :xAxiosOption="storagePerformanceData.xAxiosOption"
              :yAxiosOption="storagePerformanceData.yAxiosOption" :series="storagePerformanceData.series" />
          </ModuleCard>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="statistics__content-item">
          <ModuleCard title="Energy Consumption">
            <LineChart :xAxiosOption="energyConsumptionData.xAxiosOption"
              :yAxiosOption="energyConsumptionData.yAxiosOption" :series="energyConsumptionData.series" />
          </ModuleCard>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="statistics__content-item">
          <ModuleCard title="Station Status">
            <DoughnutChart :series="stationStatusSeries" />
          </ModuleCard>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistics__content-item">
          <ModuleCard title="Efficiency Trends">
            <LineChart :xAxiosOption="efficiencyTrendsData.xAxiosOption"
              :yAxiosOption="efficiencyTrendsData.yAxiosOption" :series="efficiencyTrendsData.series" />
          </ModuleCard>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistics__content-item">
          <ModuleCard title="Battery Health">
            <SimpleBarChart :xAxiosOption="batteryHealthData.xAxiosOption"
              :yAxiosOption="batteryHealthData.yAxiosOption" :series="batteryHealthData.series" />
          </ModuleCard>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="statistics__content-item">
          <ModuleCard title="Daily cost savings vs Pure Diesel">
            <SimpleBarChart :xAxiosOption="costSavingsData.xAxiosOption" :yAxiosOption="costSavingsData.yAxiosOption"
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
    </el-row>
    <div class="statistic__list">
      <div class="statistic__list-header">
        <div class="header__title">Analytics Dashboard</div>
        <div class="header__btn">
          <IconButton :icon="refreshIcon" type="warning" text="refresh" />
        </div>
      </div>
      <div class="statistic__list-content">
        <el-table :data="tableData" style="width: 100%" table-layout="fixed">
          <el-table-column prop="stationName" label="Station Name" />
          <el-table-column prop="region" label="Region">
            <template #default="scope">
              <img :src="addressIcon" alt="address-icon" style="margin-right: 0.03rem;" />
              <div>{{ scope.row.region }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="Status">
            <template #default="scope">
              <!-- <div class="statistic__list-content-item-status"> -->
              <img :src="scope.row.status === 1 ? onlineIcon : offlineIcon" style="margin-right: 0.03rem;" />
              <div>{{ scope.row.status === 1 ? 'Online' : 'Offline' }}</div>
              <!-- </div> -->
            </template>
          </el-table-column>
          <el-table-column prop="powerOutput" label="Power Output" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.powerOutput }}
            </template>
          </el-table-column>
          <el-table-column prop="batteryStatus" label="Battery Status" show-overflow-tooltip>

          </el-table-column>
          <el-table-column prop="efficiency" label="Efficiency">
            <template #default="scope">
              {{ scope.row.efficiency }}%
            </template>
          </el-table-column>
          <el-table-column prop="alerts" label="Alerts">
          </el-table-column>
          <el-table-column prop="lastUpdate" label="Last Update" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardCard from '@/components/card/DashboardCard.vue'
import ModuleCard from '@/components/card/ModuleCard.vue'
import SimpleBarChart from '@/components/charts/SimpleBarChar.vue'
import LineChart from '@/components/charts/lineChart.vue'
import StackedBarChart from '@/components/charts/StackedBarChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'

import totalStationIcon from '@/assets/icons/dashboard-totalStation.svg'
import currentOutputIcon from '@/assets/icons/dashboard-output.svg'
import todayEnergyIcon from '@/assets/icons/dashboard-energy.svg'
import costSavingIcon from '@/assets/icons/dashboard-cost.svg'
import refreshIcon from '@/assets/icons/button-refresh.svg'
import onlineIcon from '@/assets/icons/station-status__online.svg'
import offlineIcon from '@/assets/icons/station-status__offline.svg'
import addressIcon from '@/assets/icons/address.svg'
const statisticsList = ref([
  {
    id: 1,
    data: {
      title: 'Total stations',
      value: 24,
      icon: totalStationIcon
    },
    iconBgColor: 'rgba(29, 134, 255, 0.1)'
  },
  {
    id: 2,
    data: {
      title: 'Current Output',
      value: 24,
      unit: 'kW',
      icon: currentOutputIcon
    },
    iconBgColor: 'rgba(106, 193, 97, 0.1)'
  },
  {
    id: 3,
    data: {
      title: 'Today\'s Energy',
      value: 424,
      unit: 'kWh',
      icon: todayEnergyIcon
    },
    iconBgColor: 'rgba(201, 178, 63, 0.1)'
  },
  {
    id: 4,
    data: {
      title: 'Cost Saving»',
      value: '$24',
      unit: 'vs pure diesel',
      icon: costSavingIcon
    },
    iconBgColor: 'rgba(106, 193, 97, 0.1)'
  }
])

// 第一个el-row的图表数据
const storagePerformanceData = ref({
  xAxiosOption: {
    xAxiosData: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
  },
  yAxiosOption: {
    yUnit: 'kWh'
  },
  series: [
    {
      name: 'Storage Level',
      data: [65, 72, 85, 92, 88, 95, 78],
      color: '#1d86ff'
    },
    {
      name: 'Battery Capacity',
      data: [45, 58, 72, 89, 76, 82, 65],
      color: '#6ac161'
    },
    {
      name: 'Reserve Power',
      data: [25, 32, 45, 52, 48, 55, 38],
      color: '#c9b23f'
    }
  ]
})

const energyConsumptionData = ref({
  xAxiosOption: {
    xAxiosData: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
  },
  yAxiosOption: {
    yUnit: 'kW'
  },
  series: [
    {
      name: 'Total Consumption',
      data: [120, 180, 220, 280, 240, 200, 150],
      color: '#6ac161'
    },
    {
      name: 'Peak Demand',
      data: [180, 240, 280, 320, 290, 250, 200],
      color: '#ff6b6b'
    },
    {
      name: 'Base Load',
      data: [80, 120, 160, 200, 180, 150, 100],
      color: '#ffa726'
    }
  ]
})

// 第二个el-row的图表数据
const stationStatusData = ref([
  { value: 18, name: 'Online', color: '#6ac161' },
  { value: 4, name: 'Offline', color: '#ff6b6b' },
  { value: 2, name: 'Maintenance', color: '#ffa726' }
])

// 修复DoughnutChart的props格式
const stationStatusSeries = ref([
  { value: 18, name: 'Online', color: '#6ac161' },
  { value: 4, name: 'Offline', color: '#ff6b6b' },
  { value: 2, name: 'Maintenance', color: '#ffa726' }
])

const efficiencyTrendsData = ref({
  xAxiosOption: {
    xAxiosData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxiosOption: {
    yUnit: '%'
  },
  series: [
    {
      name: 'Overall Efficiency',
      data: [85, 88, 92, 89, 91, 87, 90],
      color: '#c9b23f'
    },
    {
      name: 'Solar Efficiency',
      data: [78, 82, 86, 84, 88, 85, 87],
      color: '#6ac161'
    },
    {
      name: 'Battery Efficiency',
      data: [92, 94, 96, 93, 95, 91, 94],
      color: '#1d86ff'
    }
  ]
})

const batteryHealthData = ref({
  xAxiosOption: {
    xAxiosData: ['Station 1', 'Station 2', 'Station 3', 'Station 4', 'Station 5', 'Station 6', 'Station 7', 'Station 8']
  },
  yAxiosOption: {
    yUnit: '%'
  },
  series: [
    {
      name: 'Battery Health',
      data: [95, 87, 92, 78, 89, 94, 91, 85],
      color: '#ff6b6b'
    },
    {
      name: 'Cycle Count',
      data: [1200, 1800, 950, 2200, 1100, 800, 1350, 1600],
      color: '#1d86ff'
    }
  ]
})

// 第三个el-row的图表数据
const costSavingsData = ref({
  xAxiosOption: {
    xAxiosData: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
  },
  yAxiosOption: {
    yUnit: '$'
  },
  series: [
    {
      name: 'Cost Savings',
      data: [1200, 1350, 1100, 1600, 1400, 1800, 1550, 1700],
      color: '#6ac161'
    },
    {
      name: 'Fuel Cost',
      data: [800, 750, 900, 650, 800, 600, 750, 650],
      color: '#ff6b6b'
    },
    {
      name: 'Maintenance Cost',
      data: [300, 250, 200, 350, 300, 250, 300, 350],
      color: '#ffa726'
    }
  ]
})

const powerOutputData = ref({
  xAxiosOption: {
    xAxiosData: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
  },
  yAxiosOption: {
    yUnit: 'kW'
  },
  series: [
    {
      name: 'Total Output',
      data: [180, 220, 280, 320, 290, 250, 200],
      color: '#1d86ff'
    },
    {
      name: 'Solar Output',
      data: [120, 160, 200, 240, 220, 180, 140],
      color: '#6ac161'
    },
    {
      name: 'Battery Output',
      data: [60, 60, 80, 80, 70, 70, 60],
      color: '#c9b23f'
    }
  ]
})

// 表格数据
const tableData = ref([
  {
    id:1,
    stationName: 'North Valley Solar',
    region: 'North Region',
    status: 1,
    powerOutput: '120 / 150 kW 80.0% capacity',
    batteryStatus: '85% Charging',
    efficiency: 88,
    alerts: 2,
    lastUpdate: '2024-01-15 14:30:25'
  },
  {
    id:2,
    stationName: 'North Valley Solar',
    region: 'South Region',
    status: 1,
    powerOutput: '120 / 150 kW 80.0% capacity',
    batteryStatus: '85% Charging',
    efficiency: 85,
    alerts: 0,
    lastUpdate: '2024-01-15 14:28:10'
  },
  {
    id:3,
    stationName: 'North Valley Solar',
    region: 'East Region',
    status: 0,
    powerOutput: '120 / 150 kW 80.0% capacity',
    batteryStatus: '85% Charging',
    efficiency: 0,
    alerts: 5,
    lastUpdate: '2024-01-15 14:25:45'
  },
  {
    id:4,
    stationName: 'North Valley Solar',
    region: 'West Region',
    status: 1,
    powerOutput: '120 / 150 kW 80.0% capacity',
    batteryStatus: '85% Charging',
    efficiency: 91,
    alerts: 1,
    lastUpdate: '2024-01-15 14:32:15'
  },
  {
    id:5,
    stationName: 'North Valley Solar',
    region: 'Central Region',
    status: 1,
    powerOutput: '120 / 150 kW 80.0% capacity',
    batteryStatus: '85% Charging',
    efficiency: 82,
    alerts: 3,
    lastUpdate: '2024-01-15 14:29:30'
  },
  {
    id:6,
    stationName: 'North Valley Solar',
    region: 'North Region',
    status: 1,
    powerOutput: '120 / 150 kW 80.0% capacity',
    batteryStatus: '85% Charging',
    efficiency: 87,
    alerts: 0,
    lastUpdate: '2024-01-15 14:31:20'
  },
  {
    id: 7,
    stationName: 'North Valley Solar',
    region: 'South Region',
    status: 0,
    powerOutput: '120 / 150 kW 80.0% capacity',
    batteryStatus: '85% Charging',
    efficiency: 0,
    alerts: 8,
    lastUpdate: '2024-01-15 14:24:55'
  },
  {
    id: 8,
    stationName: 'North Valley Solar',
    region: 'East Region',
    status: 1,
    powerOutput: '120 / 150 kW 80.0% capacity',
    batteryStatus: '85% Charging',
    efficiency: 84,
    alerts: 1,
    lastUpdate: '2024-01-15 14:30:40'
  }
])

// 获取电池状态标签类型
function getBatteryStatusType(batteryStatus: number) {
  if (batteryStatus >= 80) return 'success'
  if (batteryStatus >= 60) return 'warning'
  return 'danger'
}
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
    display: flex;
    align-items: center;
    gap: 0.2rem;

    .statistics__header-item {
      width: calc((100% - 0.6rem) / 4);
      height: 100%
    }
  }

  .statistics__content {}

  .statistics__content-item {
    height: 2.98rem;
    width: 100%;
    margin-top: 0.2rem;

  }

  .statistic__list {
    width: 100%;
    margin-top: 0.45rem;


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
    .statistic__list-content{
      img{
        width: 0.12rem;
        height: 0.12rem;
        object-fit: contain;
      }
    }
  }
}
</style>
