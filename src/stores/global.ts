import { defineStore } from 'pinia'

// 定义全局store，包含菜单数据和根据角色筛选菜单的方法
export const useGlobalStore = defineStore(
  'global',
  () => {
    const isCollapse = ref(false)
    const loading = ref(false)
    // 应用初始化中（token 刷新、路由注入），用于显示全局骨架屏
    const appInitializing = ref(false)
    return {
      isCollapse,
      loading,
      appInitializing,
    }
  },
  {
    persist: {
      key: 'global',
      storage: localStorage,
      pick: ['isCollapse'],
    },
  },
)
