<template>
  <div class="overview-container">
    <!-- <div class="overview-container__dashborad">
      <div class="dashboard-title">Analytics Dashboard</div>
      <div class="dashboard-content">
        <div v-for="item in dashboardList" :key="item.id" class="dashboard-content-item">
          <DashboardCard :dashboardData="item.data" :iconBgColor="item.iconBgColor" />
        </div>
      </div>
    </div> -->
    <!-- <div class="overview-container__main"> -->
    <div
      ref="topologyPanel"
      class="overview-container__tuopu"
      :class="{ 'is-expanded': isExpanded }"
    >
      <strong v-if="isTopologyView" class="no-rem-overview-topology-title">
        Energy Topology
      </strong>
      <div class="overview-container__tools">
        <el-tooltip
          :content="isTopologyView ? 'Switch to Detailed Topology' : 'Switch to Overview'"
          placement="top"
        >
          <el-button
            class="overview-container__tool-button"
            circle
            :icon="Switch"
            :aria-label="isTopologyView ? 'Switch to Detailed Topology' : 'Switch to Overview'"
            @click="isTopologyView = !isTopologyView"
          />
        </el-tooltip>
        <el-tooltip
          :content="isExpanded ? 'Exit Expanded View' : 'Expand to Browser Area'"
          placement="top"
        >
          <el-button
            class="overview-container__tool-button"
            circle
            :icon="FullScreen"
            :aria-label="isExpanded ? 'Exit Expanded View' : 'Expand to Browser Area'"
            @click="toggleExpanded"
          />
        </el-tooltip>
      </div>
      <LoadingBg :loading="stationLoading">
        <Tuopu v-if="isTopologyView" :data="stationOverview" :updated-at="overviewUpdatedAt" />
        <DetailedTopology
          v-else
          :key="stationSn"
          :flow="detailedTopology"
          :telemetry="topologyTelemetry"
          :devices="topologyDevices"
          :connected="liveConnected"
        />
      </LoadingBg>
    </div>
  </div>
  <!-- </div> -->
</template>

<script setup lang="ts">
// import DashboardCard from '../../../components/card/DashboardCard.vue'

// import totalOutputIcon from '@/assets/icons/station-dashboard-output.svg'
// import batteryLevelIcon from '@/assets/icons/station-dashboard-battery.svg'
// import dieselPowerIcon from '@/assets/icons/station-dashboard-diesel.svg'
// import efficiencyIcon from '@/assets/icons/station-dashboard-efficiency.svg'
// import temperatureIcon from '@/assets/icons/station-dashboard-temperature.svg'
import Tuopu from './tuopu.vue'
import DetailedTopology from './DetailedTopology.vue'
import { useRoute } from 'vue-router'
import type { StationListItem, StationOverview } from '@/types/Stations'
import { getStationChildren } from '@/api/station'
import { useStationStore } from '@/stores/station'
import { userAppStompManager, mqttPropertyDestination } from '@/utils/stomp'
import { extractHomepageTopologyPatch, getMqttTimestamp } from './mqtt-topology'
import {
  extractDetailedTopology,
  isMeasurementProperty,
  mergeTopologyTelemetry,
  TOPOLOGY_MEASUREMENT_CATEGORY,
  type TopologyDeviceMap,
  type TopologyFlow,
  type TopologyTelemetry,
} from './detailed-topology'
import { FullScreen, Switch } from '@element-plus/icons-vue'
const stationStore = useStationStore()
const route = useRoute()
defineProps<{
  stationLoading: boolean
}>()

const topologyPanel = ref<HTMLElement | null>(null)
const isExpanded = ref(false)
const isTopologyView = ref(true)

// 初始为 null（无数据），拓扑卡片展示 '-'；数据完全来自 user-app STOMP 实时推送
const emptyOverview = (): StationOverview => ({
  pvP: null,
  loadP: null,
  essP: null,
  essSoc: null,
  dieselP: null,
  dieselOil: null,
})
const stationOverview = ref<StationOverview>(emptyOverview())
const overviewUpdatedAt = ref<number | null>(null)
const pushedTopology = shallowRef<TopologyFlow | null>(null)
const topologyTelemetry = shallowRef<TopologyTelemetry>({})
const topologyDevices = shallowRef<TopologyDeviceMap>({})
const liveConnected = computed(() => userAppStompManager.isConnected.value)
// 切站时详情接口可能尚未返回，不能使用上一站缓存的拓扑和设备 SN。
const stationDevice = computed(() => {
  const device = stationStore.currentStationDetail?.deviceInstancePo
  return device && String(device.id) === String(route.params.stationId) ? device : null
})
const storedTopology = computed(() => extractDetailedTopology(stationDevice.value))
const detailedTopology = computed(() => pushedTopology.value ?? storedTopology.value)

const routeStationId = computed(() => {
  const raw = Array.isArray(route.params.stationId)
    ? route.params.stationId[0]
    : route.params.stationId
  const id = Number(raw)
  return Number.isSafeInteger(id) && id > 0 ? id : null
})

const isDefaultDisplayProperty = (property: {
  attribute?: Array<{ id?: string; value?: unknown }> | null
}) =>
  property.attribute?.some(
    (attribute) =>
      attribute.id?.toLowerCase() === 'isdisplay' &&
      String(attribute.value).toLowerCase() === 'true',
  ) ?? false

const toTopologyPoint = (property: DevicePropertyMeta) => ({
  id: property.id,
  name: property.name || property.id,
  unit: property.valueType?.unit ?? '',
  category: TOPOLOGY_MEASUREMENT_CATEGORY,
})

const applyTopologyDevices = (items: StationListItem[]) => {
  const devices: TopologyDeviceMap = {}

  for (const item of items ?? []) {
    const instance = item.deviceInstancePo
    if (!instance?.id) continue
    const product = item.productPo
    const properties = product?.metadata?.properties ?? instance.metadata?.properties ?? []
    const measurementProperties = properties.filter(isMeasurementProperty)
    const deviceTags = (instance.metadata?.tags ?? [])
      .filter((tag) => !['edgeinstance', 'edgestation'].includes(tag.tagKey.trim().toLowerCase()))
      .map((tag) => ({
        id: `tag:${tag.tagKey}`,
        name: tag.tagName || tag.tagKey,
        unit: tag.unit ?? '',
        category: 'Device Tag',
        staticValue: tag.tagValue || null,
      }))
    const device = {
      instanceId: instance.id,
      deviceName: instance.name,
      status: instance.status,
      productName: product?.name ?? '',
      displayPoints: measurementProperties.filter(isDefaultDisplayProperty).map(toTopologyPoint),
      points: [...deviceTags, ...measurementProperties.map(toTopologyPoint)],
    }
    devices[String(instance.id)] = device
    if (instance.treeNode) devices[instance.treeNode] = device
  }

  topologyDevices.value = devices
}

let topologyRequestVersion = 0
let mqttSubscriptionId: string | null = null

const unsubscribeMqtt = () => {
  if (mqttSubscriptionId) {
    userAppStompManager.unsubscribe(mqttSubscriptionId)
    mqttSubscriptionId = null
  }
}

const resetTopologySession = () => {
  unsubscribeMqtt()
  topologyDevices.value = {}
  topologyTelemetry.value = {}
  stationOverview.value = emptyOverview()
  overviewUpdatedAt.value = null
  pushedTopology.value = null
}

watch(
  routeStationId,
  async (stationId) => {
    const requestVersion = ++topologyRequestVersion
    resetTopologySession()
    if (stationId === null) return
    try {
      const response = await getStationChildren(stationId)
      if (requestVersion !== topologyRequestVersion || response.code !== 200) return
      applyTopologyDevices(response.data)
    } catch (error) {
      if (requestVersion === topologyRequestVersion) {
        console.error('[Overview] station topology request failed:', error)
      }
    }
  },
  { immediate: true },
)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const handleExpandedKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') isExpanded.value = false
}

watch(isExpanded, (expanded) => {
  if (expanded) window.addEventListener('keydown', handleExpandedKeydown)
  else window.removeEventListener('keydown', handleExpandedKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', handleExpandedKeydown))

// user-app STOMP：订阅站点实时属性（边端 homepage 配置点位 14–19），驱动拓扑图刷新
const stationSn = computed(() => stationDevice.value?.sn?.trim() ?? '')

watch(
  stationSn,
  (sn) => {
    unsubscribeMqtt()
    if (!sn) return
    // 未连接时订阅会进入待处理队列，连接成功后自动生效
    mqttSubscriptionId = userAppStompManager.subscribe(
      { destination: mqttPropertyDestination(sn) },
      (msg) => {
        if (sn !== stationSn.value) return
        const flow = extractDetailedTopology(msg)
        if (flow) pushedTopology.value = flow
        topologyTelemetry.value = mergeTopologyTelemetry(topologyTelemetry.value, msg)
        const patch = extractHomepageTopologyPatch(msg)
        if (patch) {
          stationOverview.value = { ...stationOverview.value, ...patch }
          overviewUpdatedAt.value = getMqttTimestamp(msg)
        }
      },
    )
    void userAppStompManager.connect().catch((error) => {
      console.error('[Overview] user-app STOMP connect failed:', error)
    })
  },
  { immediate: true },
)

onUnmounted(unsubscribeMqtt)
</script>

<style scoped lang="scss">
.overview-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .overview-container__dashborad {
    width: 100%;
    margin: 0.2rem 0;

    .dashboard-title {
      font-weight: 700;
      font-size: 0.2rem;
      line-height: 0.22rem;
      letter-spacing: 0%;
      color: var(--vt-text-primary);
      margin-bottom: 0.2rem;
    }

    .dashboard-content {
      width: 100%;
      height: 1rem;
      display: flex;
      gap: 0.2rem;

      .dashboard-content-item {
        width: calc((100% - 0.8rem) / 4);
        height: 100%;
      }
    }
  }

  .overview-container__tuopu {
    position: relative;
    width: 100%;
    flex: 1;
    min-height: 0;
    background-color: var(--vt-bg-input);
    border: 1px solid;

    border-image: linear-gradient(
        117.64deg,
        var(--vt-border-color) 2.73%,
        transparent 31.73%,
        var(--vt-border-medium) 71.62%,
        var(--vt-border-color) 97.67%
      )
      1;

    &.is-expanded {
      position: fixed;
      inset: 0;
      z-index: 3000;
      width: 100%;
      height: 100%;
      background-color: var(--vt-bg-page);
      border: 0;
    }

    .overview-container__tools {
      position: absolute;
      top: 0.16rem;
      right: 0.18rem;
      z-index: 10;
      display: flex;
      gap: 0.08rem;
    }

    .no-rem-overview-topology-title {
      position: absolute;
      top: 18px;
      left: 20px;
      z-index: 9;
      color: var(--vt-text-primary);
      font-size: 16px;
      font-weight: 600;
      line-height: normal;
      pointer-events: none;
    }

    .overview-container__tool-button {
      width: 0.36rem;
      height: 0.36rem;
      color: var(--vt-text-primary);
      background: rgba(17, 31, 60, 0.76);
      border: 1px solid var(--vt-border-color);

      &:hover {
        color: var(--vt-primary-color);
        border-color: var(--vt-primary-color);
      }
    }

    // background-image: url('@/assets/images/tuopu-bg.png');
    // background-size: 100% 100%;
    // background-repeat: no-repeat;
    // background-position: center;
  }

  .overview-container__main {
    height: calc(100% - 1.82rem);
    width: 100%;
    overflow-y: auto;
  }
}
</style>
