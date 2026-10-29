<template>
  <article
    class="no-rem-topology-node"
    :class="{ 'is-active': data.active, 'is-offline': !data.online }"
    :style="nodeStyle"
  >
    <template v-for="side in sides" :key="side.id">
      <Handle :id="side.id" type="source" :position="side.position" :connectable="false" />
      <Handle :id="side.id" type="target" :position="side.position" :connectable="false" />
    </template>
    <div class="no-rem-topology-node__header">
      <div class="no-rem-topology-node__heading">
        <span class="no-rem-topology-node__icon">
          <el-icon><component :is="deviceIcon" /></el-icon>
        </span>
        <div>
          <strong :title="data.label">{{ data.label }}</strong>
          <span :title="data.productName">{{ data.productName || 'Device' }}</span>
        </div>
      </div>
      <span
        class="no-rem-topology-node__status"
        :title="data.online ? 'Online' : 'Offline'"
        :aria-label="data.online ? 'Online' : 'Offline'"
      ></span>
    </div>
    <div class="no-rem-topology-node__metrics">
      <div v-if="metrics.length === 0" class="no-rem-topology-node__metric-empty">
        No realtime data
      </div>
      <div v-for="metric in metrics" :key="metric.id" class="no-rem-topology-node__metric">
        <span :title="metric.name">{{ metric.name }}</span>
        <strong :title="formatMetricValue(metric.value, metric.unit)">{{
          formatMetricValue(metric.value, metric.unit)
        }}</strong>
      </div>
    </div>
    <div class="no-rem-topology-node__details">
      <span>Details →</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, type Component, type CSSProperties } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import {
  Box,
  Connection,
  Cpu,
  Lightning,
  Monitor,
  Odometer,
  Sunny,
  SwitchFilled,
} from '@element-plus/icons-vue'
import type { PointValue, TopologyNodeData } from './detailed-topology'
import { getTopologyDeviceVisual } from './topology-device-visual'

type RuntimeNodeData = TopologyNodeData & {
  active: boolean
  online: boolean
  points: Array<{ id: string; name: string; unit: string; value: PointValue }>
}

const props = defineProps<NodeProps<RuntimeNodeData>>()

const metrics = computed(() => props.data.points ?? [])
const deviceVisual = computed(() => getTopologyDeviceVisual(props.data.productName))
const deviceIcons: Record<ReturnType<typeof getTopologyDeviceVisual>['kind'], Component> = {
  meter: Odometer,
  diesel: Lightning,
  pv: Sunny,
  inverter: SwitchFilled,
  pcs: Cpu,
  battery: Box,
  load: Monitor,
  device: Connection,
}
const deviceIcon = computed(() => deviceIcons[deviceVisual.value.kind])
const nodeStyle = computed(
  () =>
    ({
      '--device-accent': deviceVisual.value.color,
      '--device-accent-soft': deviceVisual.value.softColor,
    }) as CSSProperties,
)

const formatPointValue = (value: PointValue): string => {
  if (value == null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  return String(value)
}
const formatMetricValue = (value: PointValue, unit: string): string => {
  const formatted = formatPointValue(value)
  return formatted === '—' || !unit ? formatted : `${formatted} ${unit}`
}

const sides = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
]
</script>

<style scoped lang="scss">
/* Vue Flow 的节点坐标以 px 计，no-rem 前缀避免画布尺寸被全局 px-to-rem 转换。 */
.no-rem-topology-node {
  position: relative;
  width: 220px;
  box-sizing: border-box;
  padding: 10px;
  overflow: hidden;
  border: 1px solid #536789;
  border-radius: 12px;
  background: #212f4c;
  color: #edf4ff;
  box-shadow: 0 6px 20px #0b142433;

  &::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background: var(--device-accent);
    content: '';
  }

  &.is-active {
    border-color: var(--device-accent);
    box-shadow: 0 0 0 1px var(--device-accent), 0 8px 24px #0b142452;
  }

  :deep(.vue-flow__handle) {
    width: 7px;
    height: 7px;
    background: transparent;
    border: 0;
    opacity: 0;
    pointer-events: none;
  }
}
.no-rem-topology-node__heading {
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  gap: 12px;
  .no-rem-topology-node__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
    border-radius: 7px;
    background: var(--device-accent-soft);
    color: var(--device-accent);
    .el-icon {
      font-size: 16px;
    }
  }
  div {
    flex: 1;
    min-width: 0;
  }
  strong,
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  strong {
    display: -webkit-box;
    min-height: 34px;
    line-height: 17px;
    white-space: normal;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    font-size: 14px;
    font-weight: 600;
  }
  span {
    font-size: 12px;
    color: var(--device-accent);
    margin-top: 5px;
  }
}
.no-rem-topology-node__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}
.no-rem-topology-node__status {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border: 2px solid #2d4564;
  border-radius: 50%;
  background: #54d89f;
  box-shadow: 0 0 0 3px #44d19a16;
}
.no-rem-topology-node.is-offline .no-rem-topology-node__status {
  background: #8fa4c3;
  box-shadow: 0 0 0 3px #94a6c51a;
}
.no-rem-topology-node__metrics {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  border-top: 1px solid #53678966;
}
.no-rem-topology-node__metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  min-height: 26px;
  padding: 4px 1px;
  border-bottom: 1px solid #53678944;
  span,
  strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  span {
    color: #8fa4c3;
    font-size: 10px;
  }
  strong {
    max-width: 52%;
    color: #edf4ff;
    font-size: 11px;
    font-weight: 500;
    text-align: right;
  }
}
.no-rem-topology-node__metric-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  border-bottom: 1px solid #53678944;
  color: #8fa4c3;
  font-size: 11px;
}
.no-rem-topology-node__details {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  padding: 6px 0 0;
  border: 0;
  border-top: 1px solid #53678966;
  background: transparent;
  color: #acbdd7;
  font: inherit;
  font-size: 11px;
  color: #acbdd7;
  cursor: inherit;
  span:last-child {
    color: var(--device-accent);
  }
}
</style>
