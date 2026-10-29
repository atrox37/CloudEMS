export type TopologyHandle = 'top' | 'right' | 'bottom' | 'left'

export interface TopologyNodeData {
  label: string
  productName: string
  description: string
  instanceId: number | null
}

export interface TopologyFlow {
  nodes: Array<{
    id: string
    type: 'product'
    position: { x: number; y: number }
    data: TopologyNodeData
  }>
  edges: Array<{
    id: string
    type: 'smoothstep'
    source: string
    target: string
    sourceHandle: TopologyHandle
    targetHandle: TopologyHandle
  }>
  fixedBindings?: {
    stationInstanceId: number | null
    environmentInstanceId: number | null
  }
}

const READONLY_NODE_HEIGHT = 232
const READONLY_COLUMN_GAP = 308
const READONLY_ROW_GAP = 252

/** 根据连接关系生成稳定的横向只读布局，云端不沿用边端画布的绝对坐标。 */
export function createReadonlyTopologyLayout(flow: TopologyFlow | null): TopologyFlow | null {
  if (!flow?.nodes.length) return flow

  const nodeIds = new Set(flow.nodes.map((node) => node.id))
  const nodeOrder = new Map(flow.nodes.map((node, index) => [node.id, index]))
  const indegree = new Map(flow.nodes.map((node) => [node.id, 0]))
  const outgoing = new Map<string, string[]>()
  const sortIds = (ids: string[]) =>
    ids.sort((a, b) => (nodeOrder.get(a) ?? 0) - (nodeOrder.get(b) ?? 0) || a.localeCompare(b))

  for (const edge of flow.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
    const targets = outgoing.get(edge.source) ?? []
    targets.push(edge.target)
    outgoing.set(edge.source, targets)
  }

  const roots = sortIds(
    flow.nodes.filter((node) => (indegree.get(node.id) ?? 0) === 0).map((node) => node.id),
  )
  const queue = [...roots]
  const depth = new Map(queue.map((id) => [id, 0]))
  const visited = new Set<string>()

  while (queue.length) {
    const current = queue.shift()
    if (!current) continue
    visited.add(current)
    for (const target of sortIds([...(outgoing.get(current) ?? [])])) {
      depth.set(target, Math.max(depth.get(target) ?? 0, (depth.get(current) ?? 0) + 1))
      const nextIndegree = (indegree.get(target) ?? 1) - 1
      indegree.set(target, nextIndegree)
      if (nextIndegree === 0) queue.push(target)
    }
    sortIds(queue)
  }

  const maxDepth = Math.max(0, ...depth.values())
  for (const node of flow.nodes) {
    if (!visited.has(node.id)) depth.set(node.id, maxDepth + 1)
  }

  const desiredY = new Map<string, number>()
  const visiting = new Set<string>()
  let nextLeafRow = 0
  const assignBranchY = (nodeId: string): number | undefined => {
    const existing = desiredY.get(nodeId)
    if (existing != null) return existing
    if (visiting.has(nodeId)) return undefined
    visiting.add(nodeId)
    const childPositions = sortIds([...(outgoing.get(nodeId) ?? [])])
      .map(assignBranchY)
      .filter((value): value is number => value != null)
    const y = childPositions.length
      ? childPositions.reduce((sum, value) => sum + value, 0) / childPositions.length
      : nextLeafRow++ * READONLY_ROW_GAP
    visiting.delete(nodeId)
    desiredY.set(nodeId, y)
    return y
  }
  roots.forEach(assignBranchY)
  sortIds(flow.nodes.map((node) => node.id)).forEach(assignBranchY)

  const columns = new Map<number, TopologyFlow['nodes']>()
  for (const node of flow.nodes) {
    const column = depth.get(node.id) ?? 0
    const columnNodes = columns.get(column) ?? []
    columnNodes.push(node)
    columns.set(column, columnNodes)
  }

  const nodes = Array.from(columns.entries())
    .sort(([a], [b]) => a - b)
    .flatMap(([column, columnNodes]) => {
      const ordered = [...columnNodes].sort(
        (a, b) =>
          (desiredY.get(a.id) ?? 0) - (desiredY.get(b.id) ?? 0) ||
          (nodeOrder.get(a.id) ?? 0) - (nodeOrder.get(b.id) ?? 0),
      )
      let previousY = Number.NEGATIVE_INFINITY
      return ordered.map((node) => {
        const y = Math.max(desiredY.get(node.id) ?? 0, previousY + READONLY_ROW_GAP)
        previousY = y
        return { ...node, position: { x: column * READONLY_COLUMN_GAP, y } }
      })
    })

  const minY = Math.min(...nodes.map((node) => node.position.y))
  const maxY = Math.max(...nodes.map((node) => node.position.y + READONLY_NODE_HEIGHT))
  const yOffset = (minY + maxY) / 2
  const centeredNodes = nodes.map((node) => ({
    ...node,
    position: { ...node.position, y: node.position.y - yOffset },
  }))
  const positions = new Map(centeredNodes.map((node) => [node.id, node.position]))
  const edges = flow.edges.map((edge) => {
    const source = positions.get(edge.source)
    const target = positions.get(edge.target)
    if (!source || !target) return edge
    if (target.x > source.x)
      return { ...edge, sourceHandle: 'right' as const, targetHandle: 'left' as const }
    if (target.x < source.x)
      return { ...edge, sourceHandle: 'left' as const, targetHandle: 'right' as const }
    if (target.y >= source.y)
      return { ...edge, sourceHandle: 'bottom' as const, targetHandle: 'top' as const }
    return { ...edge, sourceHandle: 'top' as const, targetHandle: 'bottom' as const }
  })

  return { ...flow, nodes: centeredNodes, edges }
}

export type PointValue = string | number | boolean | null
export interface InstanceTelemetry {
  values: Record<string, PointValue>
  updatedAt: number
  timestampSource: 'message' | 'received'
}
export type TopologyTelemetry = Record<string, InstanceTelemetry>

export interface TopologyPointDefinition {
  id: string
  name: string
  unit: string
  category: string
  staticValue?: PointValue
}

export interface TopologyDeviceInfo {
  instanceId: number
  deviceName: string
  status: string
  productName: string
  displayPoints: TopologyPointDefinition[]
  points: TopologyPointDefinition[]
}

export type TopologyDeviceMap = Record<string, TopologyDeviceInfo>

export const TOPOLOGY_MEASUREMENT_CATEGORY = 'Measurement'

/** 与边端物模型一致：tagId=M 或点位 id 为 M1、M2… */
export function isMeasurementProperty(property: { id: string; tagId?: string | null }): boolean {
  return property.tagId?.toUpperCase() === 'M' || /^M\d+$/i.test(property.id)
}

/** inst 遥测合并后的键名（如 M1）是否为测量值。 */
export function isMeasurementTelemetryKey(key: string): boolean {
  return /^M\d+$/i.test(key)
}

function record(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return null
    }
  }
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function instanceId(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

const text = (value: unknown): string => (typeof value === 'string' ? value : '')
const handle = (value: unknown, fallback: TopologyHandle): TopologyHandle =>
  value === 'top' || value === 'right' || value === 'bottom' || value === 'left' ? value : fallback

/** 同时读取实例同步的 flow_json 和 iotcloud 保存的 metadata.struct.node。 */
export function extractDetailedTopology(value: unknown): TopologyFlow | null {
  const root = record(value)
  if (!root) return null
  const metadata = record(root.metadata)
  const struct = record(metadata?.struct ?? root.struct)
  const graph = record(
    root.flow_json ?? root.flowJson ?? (struct?.type === 'node' ? struct.node : undefined) ?? root,
  )
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) return null

  const nodes: TopologyFlow['nodes'] = []
  const nodeIds = new Set<string>()
  for (const raw of graph.nodes) {
    const node = record(raw)
    const position = record(node?.position)
    const data = record(node?.data)
    if (
      !node ||
      typeof node.id !== 'string' ||
      !node.id ||
      nodeIds.has(node.id) ||
      typeof position?.x !== 'number' ||
      !Number.isFinite(position.x) ||
      typeof position.y !== 'number' ||
      !Number.isFinite(position.y)
    )
      return null
    nodeIds.add(node.id)
    nodes.push({
      id: node.id,
      type: 'product',
      position: { x: position.x, y: position.y },
      data: {
        label: text(data?.label) || text(data?.productName) || node.id,
        productName: text(data?.productName),
        description: text(data?.description),
        instanceId: instanceId(data?.instanceId),
      },
    })
  }

  const edges: TopologyFlow['edges'] = []
  const edgeIds = new Set<string>()
  for (const raw of graph.edges) {
    const edge = record(raw)
    if (
      !edge ||
      typeof edge.id !== 'string' ||
      !edge.id ||
      edgeIds.has(edge.id) ||
      typeof edge.source !== 'string' ||
      typeof edge.target !== 'string' ||
      !nodeIds.has(edge.source) ||
      !nodeIds.has(edge.target)
    )
      return null
    edgeIds.add(edge.id)
    // PCManagement 的 deletable-smoothstep 在只读画布中使用普通折线，不添加功率方向箭头。
    edges.push({
      id: edge.id,
      type: 'smoothstep',
      source: edge.source,
      target: edge.target,
      sourceHandle: handle(edge.sourceHandle, 'bottom'),
      targetHandle: handle(edge.targetHandle, 'top'),
    })
  }

  const fixed = record(graph.fixedBindings)
  return {
    nodes,
    edges,
    ...(fixed
      ? {
          fixedBindings: {
            stationInstanceId: instanceId(fixed.stationInstanceId),
            environmentInstanceId: instanceId(fixed.environmentInstanceId),
          },
        }
      : {}),
  }
}

/** inst 的 device 是边端 instanceId；不能用同号的 comsrv 通道数据填充设备节点。 */
export function mergeTopologyTelemetry(
  current: TopologyTelemetry,
  message: unknown,
  receivedAt = Date.now(),
): TopologyTelemetry {
  const root = record(message)
  if (!root || !Array.isArray(root.property)) return current
  const timestamp = Number(root.timestamp)
  const hasMessageTimestamp = Number.isFinite(timestamp) && timestamp > 0
  const updatedAt = hasMessageTimestamp
    ? timestamp < 1e12
      ? timestamp * 1000
      : timestamp
    : receivedAt
  let next = current
  for (const item of root.property) {
    const group = record(item)
    if (group?.source !== 'inst') continue
    const id = instanceId(group.device)
    const values = record(group.value)
    const dataType = text(group.data_type)
    if (id === null || !values || !/^[A-Za-z][A-Za-z0-9_]*$/.test(dataType)) continue
    const previous = next[String(id)]
    if (previous && updatedAt < previous.updatedAt) continue
    const points = Object.entries(values)
      .filter(
        ([, value]) =>
          value === null ||
          typeof value === 'string' ||
          typeof value === 'boolean' ||
          (typeof value === 'number' && Number.isFinite(value)),
      )
      .map(([key, value]) => [`${dataType}${key}`, value as PointValue])
    if (!points.length) continue
    if (next === current) next = { ...current }
    next[String(id)] = {
      values: { ...previous?.values, ...Object.fromEntries(points) },
      updatedAt,
      timestampSource: hasMessageTimestamp ? 'message' : 'received',
    }
  }
  return next
}
