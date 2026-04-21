export interface StatisticsTotalData {
  statisticsBenefit: number
  statisticsCount: number
  statisticsLoad: number
  statisticsPv: number
}
export interface StorageStateData {
  totalCharging: number
  totalDischarging: number
  totalIdle: number
}
export interface EnergyStructureAnalysisData {
  totalGF: number
  totalCF: number
}
export interface DieselGeneratorStatusData {
  totalRunning: number
  totalError: number
  totalIdle: number
}
export interface PowerCurveData {
  cnResult: number[]
  fzResult: number[]
  cfResult: number[]
  gfResult: number[]
}

// AnalyticsAllData 类型说明

export interface AnalyticsPropertyValueType {
  extra: {
    point?: number
    length?: number | null
  }
  type: string
  unit: string
}

export interface AnalyticsProperty {
  id: string
  name: string
  tagId: string
  rw: string
  valueType: AnalyticsPropertyValueType
}

export interface AnalyticsPropertyTag {
  id: string
  name: string
}

export interface AnalyticsTreeNode {
  id: string
  name: string
  children: AnalyticsTreeNode[]
}

export interface AnalyticsMetadataTag {
  tagKey: string
  tagName: string
  tagValue: string
  optional: boolean
}

export interface AnalyticsMetadata {
  properties: AnalyticsProperty[]
  functions: any[]
  propertyTags: AnalyticsPropertyTag[]
  trees: AnalyticsTreeNode[]
  rules: any[]
  tags: AnalyticsMetadataTag[]
}

export interface AnalyticsDescription {
  address: string
  installationate: string
  nextMaintenance: string
  assign: string
  system: string
  netEthernet: string
  netWifi: string
  netCellular: string
  longitude: number | null
  latitude: number | null
}

export interface AnalyticsWgTag {
  id: number
  tagKey: string
  tagValue: string
  deviceId: number
}

export interface AnalyticsDeviceInstancePo {
  id: number
  name: string
  sn: string
  metadata: AnalyticsMetadata
  status: string
  statusTime: string
  creatorId: number
  productId: number
  gatewayId: number
  orgId: number
  parentId: number | null
  treeNode: any | null
  createTime: string
  updateTime: string
}

export interface AnalyticsAllData {
  deviceInstancePo: AnalyticsDeviceInstancePo
  loadPower: number
  dieselPower: number
  batteryRate: number
  alarmCount: number
  cnIds: number[]
  cfIds: number[]
  wgTag: AnalyticsWgTag[]
}
