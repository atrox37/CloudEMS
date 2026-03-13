<script setup lang="ts">
import en from 'element-plus/es/locale/lang/en'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/stores/global'
import AppSkeleton from '@/components/common/AppSkeleton.vue'

const locale = en
const globalStore = useGlobalStore()
const { appInitializing } = storeToRefs(globalStore)
</script>

<template>
  <el-config-provider :locale="locale">
    <router-view />
    <!-- 骨架屏以覆盖层形式显示，保证 router-view 始终渲染，MainLayout 能正常挂载并关闭骨架屏 -->
    <AppSkeleton v-if="appInitializing" class="app-skeleton-overlay" />
  </el-config-provider>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
}

#app {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: relative;
}

.app-skeleton-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
}
</style>
