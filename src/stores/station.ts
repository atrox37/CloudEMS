import { defineStore } from 'pinia'
import type { StationDetail } from '@/types/Stations'

// 定义全局store，包含菜单数据和根据角色筛选菜单的方法
export const useStationStore = defineStore('station', () => {
  const stationDetail = ref<StationDetail>({
    id: 1,
    name: '-----',
    sn: '-',
    status: '-', //在线online离线 offline
    statusTime: '-', //在线或者离线的时间
    creatorId: 1,
    productId: 1,
    gatewayId: 1,
    orgId: 1,
    parentId: 1,
    treeNode: null,
    createTime: '-',
    updateTime: '-',
    description: {
      address: '-',
      installationate: '-',
      nextMaintenance: '-',
      assign: '-',
      system: '-',
      netEthernet: '-',
      netWifi: '-',
      netCellular: '-',
    },
  })
  return {
    stationDetail,
  }
})
