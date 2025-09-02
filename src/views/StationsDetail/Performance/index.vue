<template>
  <div class="performance-container">
    <div class="performance-container__enery">
      <ModuleCard title="24-Hour Energy Sources">
        <!-- <LineChart :xAxiosOption="xAxiosOption" :yAxiosOption="yAxiosOption" :series="series" /> -->
        <SimpleBarChar :xAxiosOption="xAxiosOption" :yAxiosOption="yAxiosOption" :series="series" />
      </ModuleCard>
    </div>
    <div class="performance-container__system">
      <ModuleCard title="System Efficiency">
        <div class="system-content">
          <div v-for="item in systemDashboardList" :key="item.id" class="system-content__item">
            <DashboardCard :dashboardData="item.data" :iconBgColor="item.iconBgColor" />
          </div>
        </div>
      </ModuleCard>
    </div>
    <div class="performance-container__device">
      <ModuleCard title="Device Efficiency">
        <div class="device-content">
          <div v-for="item in deviceDashboardList" :key="item.id" class="device-content__item">
            <DashboardCard :dashboardData="item.data" :iconBgColor="item.iconBgColor" />
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

import SimpleBarChar from '@/components/charts/SimpleBarChar.vue'

const systemDashboardList = ref([
  {
    id: 1,
    data: {
      title: 'Peak Efficiency',
      value: '176',
      unit: '%',
      icon: peakEfficiencyIcon,
    },
    iconBgColor: 'rgba(106, 193, 97, 0.1)'
  },
  {
    id: 2,
    data: {
      title: 'Average Efficiency',
      value: '92.1',
      unit: '%',
      icon: averageEfficiencyIcon,
    },
    iconBgColor: 'rgba(3, 93, 239, 0.1)'
  },
  {
    id: 3,
    data: {
      title: 'Minimum Efficiency',
      value: 176,
      unit: '%',
      icon: minimumEfficiencyIcon,
    },
    iconBgColor: 'rgba(255, 105, 0, 0.1)'
  },
])

const deviceDashboardList = ref([
  {
    id: 1,
    data: {
      title: 'Solar Panels',
      value: '176',
      unit: '%',
      icon: solarPanelsIcon,
    },
    iconBgColor: 'rgba(201, 178, 63, 0.1)'
  },
  {
    id: 2,
    data: {
      title: 'Battery System',
      value: '92.1',
      unit: '%',
      icon: batterySystemIcon,
    },
    iconBgColor: 'rgba(106, 193, 97, 0.1)'
  },
  {
    id: 3,
    data: {
      title: 'PV System',
      value: 76,
      unit: '%',
      icon: pvSystemIcon,
    },
    iconBgColor: 'rgba(3, 93, 239, 0.1)'
  },
  {
    id: 4,
    data: {
      title: 'Diesel Generator',
      value: 76,
      unit: '%',
      icon: dieselGeneratorIcon,
    },
    iconBgColor: 'rgba(255, 59, 59, 0.1)'
  }
])

const xAxiosOption = ref({
  xAxiosData: ['Solar', 'Wind', 'Hydro', 'Biomass', 'Geothermal'],
  xUnit: 'Source'
})

const yAxiosOption = ref({
  yAxiosData: [100, 200, 300, 400, 500],
  yUnit: 'kWh'
})

const series = ref([
  {
    name: 'Actual Production',
    data: [100, 200, 300, 400, 500],
    color: 'rgba(3, 93, 239, 1)'
  },
  {
    name: 'Target Production',
    data: [100, 200, 300, 400, 500],
    color: 'rgba(105, 203, 255, 1)'
  },
])
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
    height: 1.8rem;
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
        height: 100%;
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
