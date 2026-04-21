<template>
  <el-button :type="type" class="icon-button" :class="customClass" v-bind="attrs" v-on="listeners">
    <img :src="icon" class="icon-button__icon" :class="iconClass" />
    {{ text }}
  </el-button>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

interface Props {
  icon: string
  text: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  customClass?: string
  iconClass?: string
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
  customClass: '',
  iconClass: 'icon-button__icon',
})

// 鑾峰彇鎵€鏈夐€忎紶鐨勫睘鎬у拰浜嬩欢
const attrs = useAttrs()

// 浜嬩欢鐩戝惉锛堝彧淇濈暀onXxx鐨勪簨浠讹級
const listeners: Record<string, unknown> = {}
Object.keys(attrs).forEach((key) => {
  if (key.startsWith('on')) {
    // @ts-expect-error attrs is indexed dynamically for forwarded listeners
    listeners[key] = attrs[key]
  }
})
</script>

<style scoped lang="scss">
.voltage-class {
  display: flex;
  align-items: center;
  gap: 0.08rem;

  .icon-button__icon {
    width: 0.14rem;
    height: 0.14rem;
    margin-right: 0.08rem;
  }
}
</style>
