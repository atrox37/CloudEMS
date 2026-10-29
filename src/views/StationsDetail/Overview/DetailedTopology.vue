<template>
  <div class="no-rem-detailed-topology">
    <div class="no-rem-detailed-topology__heading">
      <strong>Device Topology</strong>
      <span v-if="!connected" class="no-rem-detailed-topology__connection"
        >Live connection unavailable</span
      >
    </div>

    <VueFlow
      v-if="displayFlow?.nodes.length"
      :id="canvasId"
      :nodes="nodes"
      :edges="displayFlow.edges"
      :node-types="nodeTypes"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :nodes-focusable="false"
      :edges-focusable="false"
      :elements-selectable="false"
      :delete-key-code="null"
      :selection-key-code="null"
      :zoom-on-double-click="false"
      :min-zoom="0.35"
      :max-zoom="2"
      fit-view-on-init
      @nodes-initialized="fitCanvas"
      @node-click="selectedId = $event.node.id"
      @pane-click="selectedId = null"
    />
    <div v-else class="no-rem-detailed-topology__empty">
      <el-icon :size="40"><Connection /></el-icon>
      <strong>No detailed topology available</strong>
      <span>The station has not provided a topology yet.</span>
    </div>

    <div v-if="showMiniMap && displayFlow?.nodes.length" class="no-rem-detailed-topology__minimap">
      <svg
        ref="minimapRef"
        :viewBox="minimapViewBox"
        role="img"
        aria-label="Topology minimap"
        @pointerdown="handleMiniMapPointerDown"
        @pointermove="handleMiniMapPointerMove"
        @pointerup="handleMiniMapPointerEnd"
        @pointercancel="handleMiniMapPointerEnd"
        @wheel.prevent.stop="handleMiniMapWheel"
      >
        <rect
          v-for="node in displayFlow.nodes"
          :key="node.id"
          class="no-rem-detailed-topology__minimap-node"
          :style="{ fill: getTopologyDeviceVisual(node.data.productName).color }"
          :x="node.position.x"
          :y="node.position.y"
          :width="CANVAS_NODE_WIDTH"
          :height="CANVAS_NODE_HEIGHT"
          rx="12"
        />
        <rect
          class="no-rem-detailed-topology__minimap-viewport"
          :x="minimapViewport.x"
          :y="minimapViewport.y"
          :width="minimapViewport.width"
          :height="minimapViewport.height"
        />
      </svg>
    </div>

    <div v-if="displayFlow?.nodes.length" class="no-rem-detailed-topology__controls">
      <button type="button" title="Fit View" aria-label="Fit View" @click="fitCanvas">
        <el-icon><Aim /></el-icon>
      </button>
      <i aria-hidden="true"></i>
      <button type="button" title="Zoom Out" aria-label="Zoom Out" @click="zoomOut()">
        <el-icon><Minus /></el-icon>
      </button>
      <span>{{ Math.round(viewport.zoom * 100) }}%</span>
      <button type="button" title="Zoom In" aria-label="Zoom In" @click="zoomIn()">
        <el-icon><Plus /></el-icon>
      </button>
      <i aria-hidden="true"></i>
      <button
        type="button"
        title="Toggle Minimap"
        aria-label="Toggle Minimap"
        :class="{ 'is-active': showMiniMap }"
        :aria-pressed="showMiniMap"
        @click="showMiniMap = !showMiniMap"
      >
        <el-icon><MapLocation /></el-icon>
      </button>
    </div>

    <FormDialog
      ref="detailsDialogRef"
      :title="selectedDeviceName"
      width="7.6rem"
      @closed="selectedId = null"
    >
      <template #dialog-body>
        <div class="no-rem-topology-points-dialog__content">
          <div class="no-rem-topology-points-dialog__toolbar">
            <div class="no-rem-topology-points-dialog__meta">
              <span>
                Last updated:
                {{ selectedTelemetry ? format(selectedTelemetry.updatedAt) : '—' }}
              </span>
            </div>
          </div>
          <el-table
            v-if="selectedPointRows.length"
            :data="selectedPointRows"
            max-height="4.2rem"
            stripe
            table-layout="fixed"
            class="no-rem-topology-points-dialog__table"
          >
            <el-table-column
              prop="point"
              label="Point Name"
              min-width="220"
              show-overflow-tooltip
            />
            <el-table-column prop="value" label="Value" width="120" align="right" />
            <el-table-column prop="unit" label="Unit" width="70" />
          </el-table>
          <el-empty v-else description="No properties available" />
        </div>
      </template>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, ref, useId, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Aim, Connection, MapLocation, Minus, Plus } from '@element-plus/icons-vue'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import TopologyNode from './TopologyNode.vue'
import FormDialog from '@/components/dialog/FormDialog.vue'
import { getTopologyDeviceVisual } from './topology-device-visual'
import {
  createReadonlyTopologyLayout,
  isMeasurementTelemetryKey,
  TOPOLOGY_MEASUREMENT_CATEGORY,
  type PointValue,
  type TopologyDeviceMap,
  type TopologyFlow,
  type TopologyTelemetry,
} from './detailed-topology'
import { format } from '@/utils/time'

const props = defineProps<{
  flow: TopologyFlow | null
  telemetry: TopologyTelemetry
  devices: TopologyDeviceMap
  connected: boolean
}>()
const canvasId = `station-topology-${useId()}`
const { fitView, setViewport, zoomIn, zoomOut, viewport, dimensions } = useVueFlow(canvasId)
const nodeTypes = { product: markRaw(TopologyNode) }
const selectedId = ref<string | null>(null)
const showMiniMap = ref(true)
const minimapRef = ref<SVGSVGElement | null>(null)
const detailsDialogRef = ref<{ dialogVisible: boolean } | null>(null)
const CANVAS_NODE_WIDTH = 220
const CANVAS_NODE_HEIGHT = 232
const MIN_ZOOM = 0.35
const MAX_ZOOM = 2
const displayFlow = computed(() => createReadonlyTopologyLayout(props.flow))
const isOnline = (status?: string) => status?.toLowerCase() === 'online'
const nodes = computed(() =>
  (displayFlow.value?.nodes ?? []).map((node) => {
    const deviceId = node.data.instanceId === null ? '' : String(node.data.instanceId)
    const runtime = deviceId ? props.telemetry[deviceId] : undefined
    const device = props.devices[node.id] ?? (deviceId ? props.devices[deviceId] : undefined)
    const definedPoints = (device?.displayPoints ?? []).map((point) => ({
      ...point,
      value: runtime?.values[point.id] ?? null,
    }))
    return {
      ...node,
      data: {
        ...node.data,
        label: device?.deviceName || node.data.label,
        productName: node.data.productName || device?.productName || '',
        active: selectedId.value === node.id,
        online: isOnline(device?.status),
        points: definedPoints,
      },
    }
  }),
)
const selectedNode = computed(() =>
  displayFlow.value?.nodes.find((node) => node.id === selectedId.value),
)
const selectedTelemetry = computed(() => {
  const id = selectedNode.value?.data.instanceId
  return id == null ? undefined : props.telemetry[String(id)]
})
const selectedDevice = computed(() => {
  const nodeId = selectedNode.value?.id
  const id = selectedNode.value?.data.instanceId
  return (
    (nodeId ? props.devices[nodeId] : undefined) ??
    (id == null ? undefined : props.devices[String(id)])
  )
})
const selectedDeviceName = computed(
  () => selectedDevice.value?.deviceName || selectedNode.value?.data.label || 'Device properties',
)
const selectedPointRows = computed(() => {
  const values = selectedTelemetry.value?.values ?? {}
  const definitions = (selectedDevice.value?.points ?? []).filter(
    (point) => point.category === TOPOLOGY_MEASUREMENT_CATEGORY,
  )
  if (definitions.length) {
    return definitions.map((point) => ({
      point: point.name,
      value: formatPointValue(values[point.id] ?? null),
      unit: point.unit || '—',
    }))
  }
  return Object.entries(values)
    .filter(([key]) => isMeasurementTelemetryKey(key))
    .sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
    .map(([point, value]) => ({
      point,
      value: formatPointValue(value),
      unit: '—',
    }))
})

watch(selectedId, async (id) => {
  await nextTick()
  if (detailsDialogRef.value) detailsDialogRef.value.dialogVisible = Boolean(id)
})
const formatPointValue = (value: PointValue): string => {
  if (value == null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  return String(value)
}

const minimapBounds = computed(() => {
  const flowNodes = displayFlow.value?.nodes ?? []
  if (!flowNodes.length) return { x: 0, y: 0, width: 1, height: 1 }
  const padding = 160
  const minX = Math.min(...flowNodes.map((node) => node.position.x)) - padding
  const minY = Math.min(...flowNodes.map((node) => node.position.y)) - padding
  const maxX = Math.max(...flowNodes.map((node) => node.position.x + CANVAS_NODE_WIDTH)) + padding
  const maxY = Math.max(...flowNodes.map((node) => node.position.y + CANVAS_NODE_HEIGHT)) + padding
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
})
const minimapViewBox = computed(() => {
  const bounds = minimapBounds.value
  return `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`
})
const minimapViewport = computed(() => ({
  x: -viewport.value.x / viewport.value.zoom,
  y: -viewport.value.y / viewport.value.zoom,
  width: dimensions.value.width / viewport.value.zoom,
  height: dimensions.value.height / viewport.value.zoom,
}))

const centerMiniMapAtPointer = (event: PointerEvent) => {
  const svg = minimapRef.value
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const bounds = minimapBounds.value
  const scale = Math.min(rect.width / bounds.width, rect.height / bounds.height)
  const offsetX = (rect.width - bounds.width * scale) / 2
  const offsetY = (rect.height - bounds.height * scale) / 2
  const x = bounds.x + (event.clientX - rect.left - offsetX) / scale
  const y = bounds.y + (event.clientY - rect.top - offsetY) / scale
  void setViewport({
    x: dimensions.value.width / 2 - x * viewport.value.zoom,
    y: dimensions.value.height / 2 - y * viewport.value.zoom,
    zoom: viewport.value.zoom,
  })
}
const handleMiniMapPointerDown = (event: PointerEvent) => {
  event.stopPropagation()
  minimapRef.value?.setPointerCapture(event.pointerId)
  centerMiniMapAtPointer(event)
}
const handleMiniMapPointerMove = (event: PointerEvent) => {
  if (!minimapRef.value?.hasPointerCapture(event.pointerId)) return
  event.stopPropagation()
  centerMiniMapAtPointer(event)
}
const handleMiniMapPointerEnd = (event: PointerEvent) => {
  if (minimapRef.value?.hasPointerCapture(event.pointerId)) {
    minimapRef.value.releasePointerCapture(event.pointerId)
  }
}
const handleMiniMapWheel = (event: WheelEvent) => {
  const nextZoom = Math.min(
    MAX_ZOOM,
    Math.max(MIN_ZOOM, viewport.value.zoom * (event.deltaY > 0 ? 0.9 : 1.1)),
  )
  const centerX = (dimensions.value.width / 2 - viewport.value.x) / viewport.value.zoom
  const centerY = (dimensions.value.height / 2 - viewport.value.y) / viewport.value.zoom
  void setViewport({
    x: dimensions.value.width / 2 - centerX * nextZoom,
    y: dimensions.value.height / 2 - centerY * nextZoom,
    zoom: nextZoom,
  })
}

async function fitCanvas() {
  await nextTick()
  if (!displayFlow.value?.nodes.length) return
  await fitView({ padding: 0.2, maxZoom: 1 })
}

// 使用 Vue Flow 已测量的尺寸，避免展开/收起时按上一帧的容器大小适配。
watch(
  () => [dimensions.value.width, dimensions.value.height],
  () => {
    void fitCanvas()
  },
  { flush: 'post' },
)

// 只在拓扑或容器改变时适配画布；实时值更新不重置用户的缩放和平移。
watch(
  () => JSON.stringify(props.flow),
  () => {
    if (!displayFlow.value?.nodes.some((node) => node.id === selectedId.value)) {
      selectedId.value = null
    }
    void fitCanvas()
  },
)
</script>

<style scoped lang="scss">
.no-rem-detailed-topology {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-image: radial-gradient(#7892b226 1px, transparent 1px);
  background-size: 20px 20px;
  color: var(--vt-text-primary);

  :deep(.vue-flow__edge-path) {
    stroke: #7cacdd;
    stroke-width: 2px;
  }
  :deep(.vue-flow__node) {
    cursor: pointer;
  }
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 6px;
    padding: 8px;
    color: inherit;
    background: transparent;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
    &:hover {
      background: #7892b233;
    }
    &:focus-visible {
      outline: 2px solid #85c2ff;
    }
  }
}
.no-rem-detailed-topology__heading {
  position: absolute;
  left: 20px;
  top: 18px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 5px;
  pointer-events: none;
  max-width: calc(100% - 160px);
  strong {
    font-size: 16px;
    font-weight: 600;
  }
  span {
    font-size: 12px;
    color: #acbdd7;
  }
}
.no-rem-detailed-topology__bindings {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.no-rem-detailed-topology__heading .no-rem-detailed-topology__connection {
  color: #e5b56c;
}
.no-rem-detailed-topology__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 100%;
  color: #acbdd7;
  font-size: 14px;
  strong {
    color: var(--vt-text-primary);
    font-size: 18px;
  }
}
.no-rem-detailed-topology__controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 2;
  display: flex;
  align-items: center;
  width: 200px;
  height: 44px;
  box-sizing: border-box;
  padding: 5px 0;
  border: 1px solid #536789;
  border-radius: 10px;
  background: #212f4cf5;
  box-shadow: 0 8px 24px #0000003d;
  backdrop-filter: blur(10px);
  font-size: 12px;
  button {
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    padding: 0;
    border-radius: 8px;
    color: #acbdd7;
    &:hover,
    &.is-active {
      color: var(--vt-primary-color);
      background: #17233d;
    }
  }
  span {
    min-width: 48px;
    color: var(--vt-text-primary);
    font-size: 14px;
    text-align: center;
  }
  > i {
    width: 1px;
    height: 24px;
    flex: 0 0 1px;
    margin: 0 4px;
    background: #536789;
  }
}
.no-rem-detailed-topology__minimap {
  position: absolute;
  top: 64px;
  right: 20px;
  z-index: 2;
  width: 200px;
  height: 200px;
  overflow: hidden;
  border: 1px solid #536789;
  border-radius: 8px;
  background: #212f4cf5;
  box-shadow: 0 8px 24px #00000047;
  transition: right 180ms ease;
  svg {
    display: block;
    width: 100%;
    height: 100%;
    cursor: grab;
    touch-action: none;
    &:active {
      cursor: grabbing;
    }
  }
}
.no-rem-detailed-topology__minimap-node {
  stroke: #dbeafe;
  stroke-width: 1.5px;
  opacity: 0.9;
  vector-effect: non-scaling-stroke;
}
.no-rem-detailed-topology__minimap-viewport {
  fill: transparent;
  stroke: #ff6900;
  stroke-width: 2.5px;
  vector-effect: non-scaling-stroke;
  pointer-events: none;
}
.no-rem-topology-points-dialog__content {
  display: flex;
  flex-direction: column;
  min-height: 240px;
}
.no-rem-topology-points-dialog__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 12px;
  min-height: 28px;
}
.no-rem-topology-points-dialog__meta {
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
  color: #acbdd7;
  font-size: 12px;
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 280px;
    font-variant-numeric: tabular-nums;
  }
}
:deep(.no-rem-topology-points-dialog__table .el-table__cell) {
  padding: 9px 0;
}
:deep(.no-rem-topology-points-dialog__table .cell) {
  overflow-wrap: anywhere;
}
</style>
