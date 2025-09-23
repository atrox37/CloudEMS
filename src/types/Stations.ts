export interface Stations {
  stationId: number
  stationName: string
  stationStatus: string
  power: number
  battery: number
  efficiency: number
  energy: number
  temperature: number
  time: string
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
}
export interface StationAlarm {
  level1: StationAlarmItem[]
  level2: StationAlarmItem[]
  level3: StationAlarmItem[]
}
export interface StationAlarmItem {
  point_id: number
  service_type: string
  level: number
  data_type: string
  source: string
  alarm_id: string
  message: string
  device: string
  channel_id: number
  value: number
  status: number
}
export interface StationListItem {
  deviceInstancePo: StationDetail
  [key: string]: any
}

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
export interface AnalyticsParams {
  stationId: string | number
  startTime: string
  endTime: string
  chartType: 'CHART1' | 'CHART2' | 'CHART3' | 'CHART4' | 'CHART5' | 'CHART6'
  interval: string
  isInterval: boolean
}
