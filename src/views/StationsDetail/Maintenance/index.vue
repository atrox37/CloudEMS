<template>
  <div class="maintenance-container">
    <LoadingBg :loading="!stationLoading && loading">
      <div class="maintenance-container__station">
        <ModuleCard title="Station Information">
          <div class="station-info">
            <div v-for="item in dashboardList" :key="item.id" class="station-info__item">
              <DashboardCard :dashboardData="item.data" isDesc />
            </div>
          </div>
        </ModuleCard>
      </div>
      <div class="network-configuration">
        <ModuleCard title="Network Configuration">
          <div class="netword-content">
            <div class="netword-item">
              <DashboardCard
                :dashboardData="NetworkDashboardList[0].data"
                :bgColor="NetworkDashboardList[0].bgColor"
                isDesc
              >
                <!-- <template #right-action>
                <el-button type="default">configure</el-button>
              </template> -->
              </DashboardCard>
            </div>
            <div class="netword-item">
              <DashboardCard :dashboardData="NetworkDashboardList[1].data" isDesc>
                <!-- <template #right-action>
                <el-button type="warning">Setup</el-button>
              </template> -->
              </DashboardCard>
            </div>
            <div class="netword-item">
              <DashboardCard :dashboardData="NetworkDashboardList[2].data" isDesc>
                <!-- <template #right-action>
                <el-button type="warning">Enable</el-button>
              </template> -->
              </DashboardCard>
            </div>
          </div>
          <!-- <div class="network-description">
          <div class="network-description__left">
            <div class="network-description-title">Primary Connection: Ethernet</div>
            <div class="network-description-desc">Signal strength: Strong • Last sync: 2 minutes ago</div>
          </div>
          <div class="network-description__right">
            <div class="network-description-status">
              <img :src="stationDetail.status === 'online' ? onlineIcon : offlineIcon" alt="">
              <div class="status-text">{{ stationDetail.status }}</div>
            </div>

          </div>
        </div> -->
        </ModuleCard>
      </div>
      <!-- <div class="system-update">
      <ModuleCard title="System Updates (OTA)">
        <div class="system-update-content">
          <div class="system-update__left">

            <div class="left-item">
              <DashboardCard :dashboardData="systemDashboardList[0].data" :bgColor="systemDashboardList[0].bgColor" isDesc>
                <template #right-action>
                  <el-button type="primary">Update</el-button>
                </template>
              </DashboardCard>


            </div>
            <div class="left-item">
                <DashboardCard :dashboardData="systemDashboardList[1].data" :bgColor="systemDashboardList[1].bgColor"
                  :valueColor="systemDashboardList[1].valueColor" isDesc>
                  <template #right-action>
                    <el-button type="primary">Update</el-button>
                  </template>
                </DashboardCard>
              </div>
              <div class="left-item">
                <DashboardCard :dashboardData="systemDashboardList[2].data" isDesc>
                  <template #right-action>
                    <el-button type="primary">Update</el-button>
                  </template>
                </DashboardCard>
              </div>
          </div>
          <div class="system-update__right">
            <div class="right-item">
              <DashboardCard :dashboardData="systemDashboardList[3].data" :bgColor="systemDashboardList[3].bgColor" isDesc>
                <template #bottom-action>
                  <div class="bottom-action">
                    <el-button type="primary">install Now</el-button>
                    <el-button type="warning">Schedule</el-button>
                  </div>
                </template>
              </DashboardCard>
            </div>

          </div>
        </div>
      </ModuleCard>
    </div> -->
    </LoadingBg>
  </div>
</template>

<script setup lang="ts">
import DashboardCard from '@/components/card/DashboardCard.vue'

import locationIcon from '@/assets/icons/dashboard-location.svg'
import installatonateIcon from '@/assets/icons/dashboard-installatonate.svg'
import maintenanceIcon from '@/assets/icons/dashboard-maintenance.svg'
import assignedIcon from '@/assets/icons/dashboard-assigned.svg'
import capacityIcon from '@/assets/icons/dashboard-capacity.svg'
import warrantyIcon from '@/assets/icons/dashboard-warranty.svg'
import ethernetIcon from '@/assets/icons/station-dashboard-ethernet.svg'
import wifiIcon from '@/assets/icons/station-dashboard-wifi.svg'
import cellularIcon from '@/assets/icons/station-dashboard-cellular.svg'
import onlineIcon from '@/assets/icons/station-status__online.svg'
import offlineIcon from '@/assets/icons/station-status__offline.svg'
import { useStationStore } from '@/stores/station'
import { storeToRefs } from 'pinia'
import { watch, ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
// import { useStationStore } from '@/stores/station'
// const { stationDetail } = storeToRefs(useStationStore())
defineProps<{
  stationLoading: boolean
}>()
const dashboardList = ref([
  {
    id: 1,
    data: {
      title: 'Location',
      value: '-',
      icon: locationIcon,
    },
  },
  {
    id: 2,
    data: { title: 'Warranty Status', value: 'Active', icon: warrantyIcon },
    valueColor: 'rgba(106, 193, 97, 1)'
  },
  {
    id: 3,
    data: {
      title: 'Installation Date',
      value: '-',
      icon: installatonateIcon,
    },
  },
  {
    id: 4,
    data: {
      title: 'Next Maintenance',
      value: '-',
      icon: maintenanceIcon,
    },
  },
  {
    id: 5,
    data: {
      title: 'Assigned Technician',
      value: '-',
      icon: assignedIcon,
    },
  },
  {
    id: 6,
    data: {
      title: 'System Capacity',
      value: '-',
      icon: capacityIcon,
    },
  },
])
const NetworkDashboardList = ref([
  {
    id: 1,
    data: { title: 'Ethernet', value: '-', icon: ethernetIcon },
    bgColor: 'rgba(3, 93, 239, 0.15)',
    valueColor: 'rgba(3, 93, 239, 1)',
  },
  {
    id: 2,
    data: { title: 'Wi-Fi', value: '-', icon: wifiIcon },
  },
  {
    id: 3,
    data: { title: 'Cellular', value: '-', icon: cellularIcon },
  },
])
const loading = ref(false)

// 获取 station store
const stationStore = useStationStore()
const { currentStationDetail } = storeToRefs(stationStore)

// 从 store 中读取站点详情并更新 dashboardList
const updateDashboardFromStore = () => {
  if (!currentStationDetail.value) {
    return
  }

  // 从 wgTags 中获取对应的 tagKey
  const wgTagsMap = new Map(currentStationDetail.value.wgTags.map((tag: any) => [tag.tagKey, tag.tagValue]))
  
  // Location (index 0)
  dashboardList.value[0].data.value = (wgTagsMap.get('Location') ?? '-') as string
  // Warranty Status (index 1) - tagKey: WarrantyStatus
  dashboardList.value[1].data.value = (wgTagsMap.get('WarrantyStatus') ?? '-') as string
  // Installation Date (index 2) - tagKey: Installatonate
  dashboardList.value[2].data.value = (wgTagsMap.get('Installatonate') ?? '-') as string
  // Next Maintenance (index 3) - tagKey: NextMaintenance
  dashboardList.value[3].data.value = (wgTagsMap.get('NextMaintenance') ?? '-') as string
  // Assigned Technician (index 4) - tagKey: AssignedTechnician
  dashboardList.value[4].data.value = (wgTagsMap.get('AssignedTechnician') ?? '-') as string
  // System Capacity (index 5) - tagKey: SystemCapacity
  dashboardList.value[5].data.value = (wgTagsMap.get('SystemCapacity') ?? '-') as string
}
// watchEffect(() => {
//   dashboardList.value[0].data.value = stationDetail.value.description.address
//   // dashboardList.value[1].data.value = stationDetail.value.description.system
//   dashboardList.value[1].data.value = stationDetail.value.description.installationate
//   // dashboardList.value[3].data.value = stationDetail.value.description.nextMaintenance
//   dashboardList.value[2].data.value = stationDetail.value.description.assign
//   dashboardList.value[3].data.value = stationDetail.value.description.system
//   NetworkDashboardList.value[0].data.value = stationDetail.value.description.netEthernet
//   NetworkDashboardList.value[1].data.value = stationDetail.value.description.netWifi
//   NetworkDashboardList.value[2].data.value = stationDetail.value.description.netCellular
// })

// 监听 store 中的站点详情变化，更新 dashboardList
watch(
  currentStationDetail,
  () => {
    updateDashboardFromStore()
  },
  { immediate: true, deep: true }
)

// const systemDashboardList = ref([
//   {
//     id: 1,
//     data: {
//       title: 'Current Firmware',
//       value: 'v2.4.1 (Latest)',
//       icon: firmwareIcon,
//     },
//     bgColor: 'rgba(106, 193, 97, 0.11)',
//   },
//   {
//     id: 2,
//     data: {
//       title: 'Auto Update',
//       value: 'Enabled - 2:00 AM Daily',
//       icon: updateIcon,
//     },
//     bgColor: 'rgba(3, 93, 239, 0.15)',
//     valueColor: 'rgba(29, 134, 255, 1)',
//   },
//   {
//     id: 3,
//     data: {
//       title: 'Last Update',
//       value: 'Nov 20. 2024',
//       icon: lastUpdateIcon,
//     }
//   },
//   {
//     id: 4,
//     data: {
//       title: 'Update Available',
//       value: 'Security patch v2.4.2 ready for installation',
//       icon: availableIcon,
//     },
//     bgColor: 'rgba(201, 178, 63, 0.1)',
//   }
// ])
</script>

<style scoped lang="scss">
.maintenance-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  position: relative;

  .maintenance-container__station {
    width: 100%;

    .station-info {
      display: flex;
      flex-wrap: wrap;
      gap: 0.2rem;
      margin-top: 0.2rem;

      .station-info__item {
        width: calc(50% - 0.1rem);
        height: 1rem;
      }
    }
  }

  .network-configuration {
    width: 100%;
    margin-top: 0.2rem;

    .netword-content {
      margin-top: 0.2rem;
      // padding-bottom: 0.2rem;
      // border-bottom: 0.01rem solid rgba(255, 255, 255, 0.1);
      display: flex;
      gap: 0.2rem;

      .netword-item {
        width: calc((100% - 0.4rem) / 3);
        height: 1rem;
      }
    }

    // .network-description {
    //   width: 100%;
    //   display: flex;
    //   justify-content: space-between;

    //   .network-description__left {
    //     display: flex;
    //     flex-direction: column;
    //     justify-content: space-between;
    //     gap: 0.1rem;

    //     .network-description-title {
    //       font-weight: 700;
    //       font-size: 0.16rem;
    //       line-height: 100%;
    //       letter-spacing: 0%;
    //       color: rgba(255, 255, 255, 1);
    //     }

    //     .network-description-desc {

    //       font-size: 0.14rem;
    //       line-height: 100%;
    //       letter-spacing: 0%;
    //       color: rgba(255, 255, 255, 0.6);
    //     }
    //   }

    //   .network-description__right {
    //     display: flex;
    //     align-items: center;

    //     .network-description-status {
    //       display: flex;
    //       align-items: center;
    //       gap: 0.06rem;

    //       img {
    //         width: 0.16rem;
    //         height: 0.16rem;
    //         object-fit: contain;
    //       }

    //       .status-text {
    //         font-size: 0.16rem;
    //         line-height: 100%;
    //         letter-spacing: 0%;

    //       }
    //     }
    //   }
    // }
  }

  .system-update {
    width: 100%;
    margin-top: 0.2rem;

    .system-update-content {
      margin-top: 0.2rem;
      display: flex;
      justify-content: space-between;
      gap: 0.2rem;

      .system-update__left,
      .system-update__right {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        width: calc(50% - 0.1rem);
      }

      .system-update__left {
        .left-item {
          width: 100%;
          height: 1rem;
        }
      }

      .system-update__right {
        .right-item {
          width: 100%;
          height: 1.62rem;
        }
      }

      .bottom-action {
        padding-top: 0.1rem;
        padding-right: 0.2rem;
        display: flex;
        justify-content: flex-end;
        gap: 0.1rem;
      }
    }
  }

  :deep(.el-button.el-button--default) {
    background-color: rgba(25, 127, 245, 0.3);
    color: rgba(74, 188, 255, 1);
    border: none;
  }
}
</style>
