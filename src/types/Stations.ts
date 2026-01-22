export interface StationKVTag {
  id: number
  tagKey: string
  tagValue: string
  deviceId: number
}

export interface Stations {
  stationId: number
  stationName: string
  stationStatus: string
  pv_power: number
  rate_power: number | null
  rate_capacity: number | null
  soc: number
  out_power: number
  in_power: number
  today_out_battery: number
  today_in_battery: number
  alarmCount: number
  gfTag: StationKVTag[]
  wgTag: StationKVTag[]
  cnTag: StationKVTag[]
  time: string
  loading?: boolean
}
export interface StationOverview {
  pvP: number
  loadP: number
  essP: number
  essSoc: number
  dieselP: number
  dieselOil: number
}

export interface Devicechart {
  deviceId: number
  productId: number
  property: string
  rawValue: string
  numberValue: number
  ts: string
}

export interface Overviewchart {
  guangFu: Devicechart[]
  chaiFa: Devicechart[]
  chuNeng: Devicechart[]
}

export interface Performancechart {
  guangFu: Devicechart[]
  chaiFa: Devicechart[]
}
export interface PerformanceView {
  sysPe: number
  sysAe: number
  sysMe: number
  deviceSp: number
  deviceBs: number
  devicePs: number
  deviceDg: number
}
export interface StationDesc {
  address: string //station location
  installationate: string //station installationate
  nextMaintenance: string //station nextMaintenance
  assign: string //station assign
  system: string //station system
  netEthernet: string //net Ethernet
  netWifi: string //net Wifi
  netCellular: string
  longitude?: string | number | null
  latitude?: string | number | null
}
export interface StationDetail {
  id: number
  name: string
  sn: string
  status: string //在线online离线 offline
  statusTime: string //在线或者离线的时间
  creatorId: number
  productId: number
  gatewayId: number
  orgId: number
  parentId: number
  treeNode: null
  createTime: string
  updateTime: string
  description: StationDesc
}
export interface StationAlarmStatistics {
  level1: number //等级一二三的数量
  level2: number
  level3: number
  level1Data: StationAlarmItem[]
  level2Data: StationAlarmItem[]
  level3Data: StationAlarmItem[]
}
export interface StationAlarm {
  level1: StationAlarmItem[]
  level2: StationAlarmItem[]
  level3: StationAlarmItem[]
}
export interface StationAlarmItem {
  point_id: number,
  level: number,
  source: string,
  message: string,
  service_type: string,
  data_type: string,
  alarm_id: string,
  device: string,
  channel_id: number,
  value: number,
  status: number,
  timestamp: string
}
// StationInformation 将在下方以更完整的结构重新声明

export interface AnalyticsNoIntervalData {
  [key: string]: number
}
export interface AnalyticsIntervalDataItem {
  deviceId: number
  productId: number
  property: string
  rawValue: string
  numberValue: number
  ts: string
}
export interface AnalyticsIntervalData {
  [key: string]: AnalyticsIntervalDataItem[]
}
export interface AnalyticsIntervalModel {
  interval: 'MIN' | 'HOUR' | 'DAY'
  time: number
}

export interface AnalyticsParams {
  chartType: 'CHART1' | 'CHART2' | 'CHART3' | 'CHART4' | 'CHART5' | 'CHART6'
  stationId: number
  startTime: string
  endTime: string
  intervalModel: AnalyticsIntervalModel
}
export interface MainteranceData {
  id: number
  tagKey: string
  tagValue: string
  deviceId: number
}

// 复用维修标签结构作为设备标签结构
export type DeviceTagPo = MainteranceData

export interface DeviceTagItem {
  deviceInstancePo: DeviceInstancePo
  deviceTagPo: DeviceTagPo
}

// 以下为 StationInformation 新结构所需类型
export interface DeviceValueType {
  extra: Record<string, number | string | null>
  type: string
  unit: string
}

export interface DevicePropertyMeta {
  id: string
  name: string
  tagId: string
  rw: 'none' | 'r' | 'w' | 'rw' | string
  valueType: DeviceValueType
}

export interface PropertyTagMeta {
  id: string
  name: string
}

export interface TreeNodeMeta {
  id: string
  name: string
  children: TreeNodeMeta[]
}

export interface MetadataTagMeta {
  tagKey: string
  tagName: string
  tagValue: string
  optional: boolean
}

export interface DeviceMetadata {
  properties: DevicePropertyMeta[]
  functions: any[]
  propertyTags: PropertyTagMeta[]
  trees: TreeNodeMeta[]
  rules: any[]
  tags: MetadataTagMeta[]
}

export interface DeviceInstancePo {
  id: number
  name: string
  sn: string
  metadata: DeviceMetadata
  description: StationDesc
  status: string
  statusTime: string
  creatorId: number
  productId: number
  gatewayId: number
  orgId: number
  parentId: number | null
  treeNode: any
  createTime: string
  updateTime: string
}

export interface GatewayPo {
  id: number
  name: string
  state: number
  networkId: number
  protocolId: number
  orgId: number
  creatorId: number
  updateTime: string
}

export interface ProductPo {
  id: number
  name: string
  metadata: DeviceMetadata
  updateTime: string
  orgId: number
  creatorId: number
  type: string
  sn: string
}

export interface SysDimensionPo {
  id: number
  name: string
  parentId: number
}

export interface SysUserNotifyFlags {
  sms: boolean
  email: boolean
}

export interface SysUserMetadata {
  sms: boolean | null
  email: boolean | null
  systemNotify: SysUserNotifyFlags
  reminders: SysUserNotifyFlags
  dayReport: SysUserNotifyFlags
  weekReport: SysUserNotifyFlags
}

export interface SysUserPo {
  id: number
  username: string
  state: number
  roleId: number
  orgId: number
  email: string
  phone: string
  metadata: SysUserMetadata
  updateTime: string
}

export interface StationInformation {
  wgTags: StationKVTag[]
  gfTags: StationKVTag[]
  cnTags: StationKVTag[]
  deviceInstancePo: DeviceInstancePo
}
export interface StationListItem {
  deviceInstancePo: DeviceInstancePo
  gatewayPo: GatewayPo
  productPo: ProductPo
  sysDimensionPo: SysDimensionPo
  sysUserPo: SysUserPo
}
