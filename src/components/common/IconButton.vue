<template>
  <el-button
    :type="type"
    class="icon-button"
    :class="customClass"
    v-bind="attrs"
    v-on="listeners"
  >
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

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  customClass: '',
  iconClass: 'icon-button__icon',
})

// 获取所有透传的属性和事件
const attrs = useAttrs()

// 事件监听（只保留onXxx的事件）
const listeners = {}
Object.keys(attrs).forEach(key => {
  if (key.startsWith('on')) {
    // @ts-ignore
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
