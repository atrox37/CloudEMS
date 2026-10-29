import type { StationOverview } from '@/types/Stations'

/**
 * 边端 homepage 计算点位 ID → Overview 拓扑槽位。
 * 与边端首页配置（PCManagement HomeConfiguration，calculated_points 固定 ID 14–19）一一对应：
 * PV.P=14、Load.P=15、Diesel.p=16、Diesel.oil=17、ESS.p=18、ESS.soc=19
 */
export const HOMEPAGE_TOPOLOGY_POINT_IDS: Record<keyof StationOverview, number> = {
  pvP: 14,
  loadP: 15,
  dieselP: 16,
  dieselOil: 17,
  essP: 18,
  essSoc: 19,
}

/** user-app 转发的站点 MQTT 实时属性报文（property/MonarchHub/{station_sn}） */
export interface MqttPropertyGroup {
  source?: string
  device?: string
  data_type?: string
  /** 点位 ID（字符串键）→ 实时值；值允许为 null */
  value?: Record<string, unknown>
}

export interface MqttPropertyPayload {
  timestamp?: number
  property?: MqttPropertyGroup[]
}

export function isMqttPropertyPayload(value: unknown): value is MqttPropertyPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as MqttPropertyPayload).property)
  )
}

export function getMqttTimestamp(value: unknown, receivedAt = Date.now()): number {
  if (!isMqttPropertyPayload(value)) return receivedAt
  const timestamp = Number(value.timestamp)
  if (!Number.isFinite(timestamp) || timestamp <= 0) return receivedAt
  return timestamp < 1e12 ? timestamp * 1000 : timestamp
}

const toNumber = (raw: unknown): number | null => {
  if (raw === null || raw === undefined) return null
  const num = typeof raw === 'number' ? raw : Number.parseFloat(String(raw))
  return Number.isFinite(num) ? num : null
}

/**
 * 从 MQTT 报文中提取 homepage 拓扑点位，映射为 StationOverview 增量。
 * 只处理 source === 'homepage' 的分组；无命中时返回 null。
 * 点位值为 null/非数字时映射为 null，拓扑卡片展示 '-'。
 */
export function extractHomepageTopologyPatch(message: unknown): Partial<StationOverview> | null {
  if (!isMqttPropertyPayload(message)) return null
  let patch: Partial<StationOverview> | null = null
  for (const group of message.property ?? []) {
    if (group.source !== 'homepage') continue
    const valueMap = group.value ?? {}
    for (const [field, pointId] of Object.entries(HOMEPAGE_TOPOLOGY_POINT_IDS) as Array<
      [keyof StationOverview, number]
    >) {
      if (!(String(pointId) in valueMap)) continue
      patch ??= {}
      patch[field] = toNumber(valueMap[String(pointId)])
    }
  }
  return patch
}
