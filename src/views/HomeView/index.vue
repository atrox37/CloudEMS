<template>
  <div class="voltage-class home-view">
    <div class="home-view-map">
      <USAMapChart />
    </div>
    <div class="home-view-dashboard">
      <div class="home-view-dashboard-item" v-for="item in dashboardData" :key="item.title">
        <EnergyCard :title="item.title" :value="item.value" :unit="item.unit" :iconUrl="item.iconUrl" bgColor="rgba(84, 98, 140, 0.2)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import USAMapChart from '@/components/charts/USAMapChart.vue'
import energyToday from '@/assets/icons/energy-today.svg'
import energyOnlineStations from '@/assets/icons/energy-onlineStation.svg'
import energyAlarms from '@/assets/icons/energy-alarms.svg'
import energySavingBilling from '@/assets/icons/energy-savingBilling.svg'

const dashboardData = reactive([
  {
    title: 'Energy Today',
    value: '3600',
    unit: 'kWh',
    iconUrl: energyToday,
  },

  {
    title: 'Online Stations',
    value: '8/13',
    iconUrl: energyOnlineStations,
  },
  {
    title: 'Alarms',
    value: '12',
    iconUrl: energyAlarms,
  },
  {
    title: 'Saving Billing',
    value:'$ 560',
    iconUrl: energySavingBilling,
  }
])
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
