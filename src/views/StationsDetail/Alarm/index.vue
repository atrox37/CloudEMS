<template>
  <div class="Alarm-container">
    <div class="Alarm-summary">
      <ModuleCard title="Alarm Summary">
        <div class="Alarm-summary__content">
          <div v-for="item in dashboardList" :key="item.id" class="Alarm-item">
            <DashboardCard :dashboardData="item.data" :iconBgColor="item.iconBgColor" />
          </div>

        </div>
      </ModuleCard>
    </div>
    <div class="critical-Alarm">
      <ModuleCard title="Critical Alarm (2)">
        <div class="critical-Alarm__content">
          <div v-for="item in criticalList" class="critical-Alarm__item" :key="item.title">
            <AlarmCard :AlarmData="item" />
          </div>
        </div>
      </ModuleCard>
    </div>
    <div class="warning-Alarm">
      <ModuleCard title="Warning Alarm (9)">
        <div class="warning-Alarm__content">
          <div v-for="item in warningList" class="warning-Alarm__item" :key="item.title">
            <AlarmCard :AlarmData="item" />
          </div>
        </div>
      </ModuleCard>
    </div>
    <div class="info-Alarm">
      <ModuleCard title="Info Alarm (23)">
        <div class="info-Alarm__content">
          <div v-for="item in infoList" class="info-Alarm__item" :key="item.title">
            <AlarmCard :AlarmData="item" />
          </div>
        </div>
      </ModuleCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import ModuleCard from '@/components/card/ModuleCard.vue';
import criticalIcon from '@/assets/icons/station-dashboard-critical.svg'
import warningIcon from '@/assets/icons/station-dashboard-warning.svg'
import infoIcon from '@/assets/icons/station-dashboard-info.svg'
import AlarmCard from './components/AlarmCard.vue'


const criticalList = [
  {

    title: 'Battery System',
    level: 0,
    detail: 'Battery temperature exceeds safe operating range (65°C)',
    requirement: 'Immediate attention required',
    time: '2024-12-21 15:11:21',
  },
  {

    title: 'Generator',
    level: 0,
    detail: 'Diesel generator fuel level critically low (8%)',
    requirement: 'Immediate attention required',
    time: '2024-12-21 15:11:21',
  },

]
const warningList = [
  {
    title: 'Solar Array',
    level: 1,
    detail: 'Solar panel efficiency dropped below 85%',
    requirement: 'Schedule cleaning',
    time: '2024-07-24 13:32:45',
  },
  {
    title: 'Battery System',
    level: 1,
    detail: 'Battery discharge rate higher than normal',
    requirement: 'Schedule cleaning',
    time: '2024-07-24 13:32:45',
  },
  {
    title: 'Network',
    level: 1,
    detail: 'Network connection unstable - 3 disconnections in 1 hour',
    requirement: 'Schedule cleaning',
    time: '2024-07-24 13:32:45',
  }, {
    title: 'PV System',
    level: 1,
    detail: 'Inverter operating temperature elevated (78°C)',
    requirement: 'Schedule cleaning',
    time: '2024-07-24 13:32:45',
  },
  {
    title: 'Grid Connection',
    level: 1,
    detail: 'Grid voltage fluctuation detected (+8V)',
    requirement: 'Schedule cleaning',
    time: '2024-07-24 13:32:45',
  }, {
    title: 'Network',
    level: 1,
    detail: 'Backup communication channel activated',
    requirement: 'Schedule cleaning',
    time: '2024-07-24 13:32:45',
  }
]
const infoList = [
  {
    title: 'Maintenance',
    level: 2,
    detail: 'Scheduled maintenance reminder: Generator service due in 3 days',
    requirement: 'Schedule appointment',
    time: '2024-07-24 13:32:45',
  },
  {
    title: 'Maintenance',
    level: 2,
    detail: 'Scheduled maintenance reminder: Generator service due in 3 days',
    requirement: 'Schedule appointment',
    time: '2024-07-24 13:32:45',
  },
  {
    title: 'Maintenance',
    level: 2,
    detail: 'Scheduled maintenance reminder: Generator service due in 3 days',
    requirement: 'Schedule appointment',
    time: '2024-07-24 13:32:45',
  },
  {
    title: 'Maintenance',
    level: 2,
    detail: 'Scheduled maintenance reminder: Generator service due in 3 days',
    requirement: 'Schedule appointment',
    time: '2024-07-24 13:32:45',
  },
  {
    title: 'Maintenance',
    level: 2,
    detail: 'Scheduled maintenance reminder: Generator service due in 3 days',
    requirement: 'Schedule appointment',
    time: '2024-07-24 13:32:45',
  },
  {
    title: 'Maintenance',
    level: 2,
    detail: 'Scheduled maintenance reminder: Generator service due in 3 days',
    requirement: 'Schedule appointment',
    time: '2024-07-24 13:32:45',
  },
  {
    title: 'Maintenance',
    level: 2,
    detail: 'Scheduled maintenance reminder: Generator service due in 3 days',
    requirement: 'Schedule appointment',
    time: '2024-07-24 13:32:45',
  },
  {
    title: 'Maintenance',
    level: 2,
    detail: 'Scheduled maintenance reminder: Generator service due in 3 days',
    requirement: 'Schedule appointment',
    time: '2024-07-24 13:32:45',
  },
]
const dashboardList = ref([
  {
    id: 1,
    data: {
      title: 'Critical Alarm',
      value: '2',
      icon: criticalIcon,
    },
    iconBgColor: 'rgba(255, 59, 59, 0.1)'

  },
  {
    id: 2,
    data: {
      title: 'Warning Alarm',
      value: '9',
      icon: warningIcon,
    },
    iconBgColor: 'rgba(255, 105, 0, 0.1)'
  },
  {
    id: 3,
    data: {
      title: 'Info Alarm',
      value: 23,
      icon: infoIcon,
    },
    iconBgColor: 'rgba(29, 134, 255, 0.1)'
  },
])
</script>

<style scoped lang="scss">
.Alarm-container {
  width: 100%;
  height: 100%;
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
