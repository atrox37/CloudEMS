import { defineStore } from 'pinia'

// 定义全局store，包含菜单数据和根据角色筛选菜单的方法
export const useGlobalStore = defineStore('global', () => {
  const isCollapse = ref(false)
  const alarmNum = ref(0)
  const loading = ref(false)
  return {
    isCollapse,
    alarmNum,
    loading,
  }
},{
  persist: {
    key: 'global',
    storage: localStorage,
    pick: ['isCollapse', 'alarmNum'],
  },
})
