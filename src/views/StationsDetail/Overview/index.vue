<template>
  <div class="overview-container">
    <div class="overview-container__dashborad">
      <div class="dashboard-title">Analytics Dashboard</div>
      <div class="dashboard-content">
        <div v-for="item in dashboardList" :key="item.id" class="dashboard-content-item">
          <DashboardCard :dashboardData="item.data" :iconBgColor="item.iconBgColor" />
        </div>
      </div>
    </div>
    <div class="overview-container__main">
          <ModuleCard title="24-Hour Energy Sources">
            <LineChart :xAxiosOption="xAxiosOption" :yAxiosOption="yAxiosOption" :series="series" />
          </ModuleCard>
        </div>
  </div>

</template>

<script setup lang="ts">
import DashboardCard from '../../../components/card/DashboardCard.vue'

import totalOutputIcon from '@/assets/icons/station-dashboard-output.svg'
import batteryLevelIcon from '@/assets/icons/station-dashboard-battery.svg'
import dieselPowerIcon from '@/assets/icons/station-dashboard-diesel.svg'
import efficiencyIcon from '@/assets/icons/station-dashboard-efficiency.svg'
import temperatureIcon from '@/assets/icons/station-dashboard-temperature.svg'
import LineChart from '@/components/charts/lineChart.vue'


const dashboardList = ref([
  {
    id: 1,
    data:{
      title: 'Total Output',
    value: '176',
    unit: 'kWh',
    icon: totalOutputIcon,
    },
    iconBgColor: 'rgba(3, 93, 239, 0.1)'

  },
  {
    id: 2,
    data:{
      title: 'Battery Level',
      value: '23',
      unit: '%',
      icon: batteryLevelIcon,
    },
    iconBgColor: 'rgba(106, 193, 97, 0.1)'
  },
  {
    id: 3,
    data:{
      title: 'Diesel Power',
    value: 23,
    unit: 'kW',
    icon: dieselPowerIcon,
    },
    iconBgColor: 'rgba(255, 59, 59, 0.14)'
  },
  {
    id: 4,
    data:{
      title: 'Efficiency',
      value: 23,
      unit: '%',
      icon: efficiencyIcon,
    },
    iconBgColor: 'rgba(255, 105, 0, 0.1)'
  },
  {
    id: 5,
    data:{
      title: 'Temperature',
      value: 23,
      unit: '℉',
      icon: temperatureIcon,
    },
    iconBgColor: 'rgba(211, 52, 255, 0.1)'
  }
])

const exampleXAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const exampleSeries = [
  {
    name: '光伏发电',
    data: [120, 132, 101, 134, 90, 230, 210],
    color: '#4FADF7'
  },
  {
    name: '柴油发电',
    data: [220, 182, 191, 234, 290, 330, 310],
    color: '#F6C85F'
  },
  {
    name: '储能放电',
    data: [150, 232, 201, 154, 190, 330, 410],
    color: '#6DD400'
  }
]

// 传递给组件的props示例
const xAxiosOption = {
  xAxiosData: exampleXAxisData,
  xUnit: '天'
}
const yAxiosOption = {
  yUnit: 'kWh'
}
const series = exampleSeries
</script>

<style scoped lang="scss">
.overview-container {
  width: 100%;
  height: 100%;

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
  .overview-container__main{
    height: calc(100% - 1.82rem);
    width: 100%;
  }
}
</style>
