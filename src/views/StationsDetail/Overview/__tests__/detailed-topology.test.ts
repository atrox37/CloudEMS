import { describe, expect, it } from 'vitest'
import { extractDetailedTopology, mergeTopologyTelemetry } from '../detailed-topology'

const flow = {
  nodes: [
    {
      id: 'battery',
      type: 'product',
      position: { x: 150, y: 420 },
      data: { label: 'Battery', productName: 'Battery', instanceId: 203 },
    },
    {
      id: 'pcs',
      type: 'product',
      position: { x: 780, y: 240 },
      data: { label: 'PCS', instanceId: 204 },
    },
  ],
  edges: [
    {
      id: 'battery-pcs',
      source: 'battery',
      target: 'pcs',
      type: 'deletable-smoothstep',
      sourceHandle: 'right',
      targetHandle: 'left',
    },
  ],
  fixedBindings: { stationInstanceId: 1, environmentInstanceId: 2 },
}

describe('station topology contracts', () => {
  it('reads PCManagement inst-sync and iotcloud metadata with the same layout and port connections', () => {
    const sync = extractDetailedTopology({ flow_json: flow })!
    const stored = extractDetailedTopology({ metadata: { struct: { type: 'node', node: flow } } })
    expect(stored).toEqual(sync)
    expect(sync.nodes[0]?.position).toEqual({ x: 150, y: 420 })
    expect(sync.nodes[0]?.data.instanceId).toBe(203)
    expect(sync.edges[0]).toMatchObject({
      type: 'smoothstep',
      sourceHandle: 'right',
      targetHandle: 'left',
    })
    expect(sync.fixedBindings).toEqual(flow.fixedBindings)
  })

  it('accepts encoded JSON and keeps an explicitly empty graph distinct from no topology update', () => {
    expect(extractDetailedTopology({ flow_json: JSON.stringify(flow) })?.nodes).toHaveLength(2)
    expect(extractDetailedTopology({ flow_json: { nodes: [], edges: [] } })).toEqual({
      nodes: [],
      edges: [],
    })
    expect(extractDetailedTopology({ property: [] })).toBeNull()
    expect(extractDetailedTopology({ metadata: { struct: { type: 'tree', tree: [] } } })).toBeNull()
  })

  it('ignores malformed updates, duplicate IDs and dangling edges', () => {
    expect(extractDetailedTopology({ flow_json: '{' })).toBeNull()
    expect(extractDetailedTopology({ ...flow, nodes: [flow.nodes[0], flow.nodes[0]] })).toBeNull()
    expect(
      extractDetailedTopology({ ...flow, edges: [{ ...flow.edges[0], target: 'missing' }] }),
    ).toBeNull()
    expect(
      extractDetailedTopology({
        ...flow,
        nodes: [{ ...flow.nodes[0], position: { x: null, y: 0 } }],
      }),
    ).toBeNull()
  })
})

describe('instance telemetry binding', () => {
  it('matches inst device IDs without using comsrv or homepage values with the same ID', () => {
    const telemetry = mergeTopologyTelemetry(
      {},
      {
        timestamp: 1700000000,
        property: [
          { source: 'comsrv', device: '203', data_type: 'M', value: { 1: 999 } },
          { source: 'homepage', device: '203', data_type: 'M', value: { 1: 888 } },
          { source: 'inst', device: '203', data_type: 'M', value: { 1: 0, 2: null, 3: false } },
          { source: 'inst', device: '204', data_type: 'M', value: { 1: 42 } },
        ],
      },
    )
    expect(telemetry['203']).toEqual({
      values: { M1: 0, M2: null, M3: false },
      updatedAt: 1700000000000,
      timestampSource: 'message',
    })
    expect(telemetry['204']?.values.M1).toBe(42)
  })

  it('merges partial updates by data type and ignores delayed older reports', () => {
    const initial = mergeTopologyTelemetry(
      {},
      {
        timestamp: 1700000000,
        property: [{ source: 'inst', device: '203', data_type: 'M', value: { 1: 1, 2: 2 } }],
      },
    )
    const updated = mergeTopologyTelemetry(initial, {
      timestamp: 1700000001000,
      property: [
        { source: 'inst', device: '203', data_type: 'M', value: { 1: null } },
        { source: 'inst', device: '203', data_type: 'A', value: { 1: 3 } },
      ],
    })
    expect(updated['203']?.values).toEqual({ M1: null, M2: 2, A1: 3 })
    expect(initial['203']?.values.M1).toBe(1)
    expect(
      mergeTopologyTelemetry(updated, {
        timestamp: 1699999999,
        property: [{ source: 'inst', device: '203', data_type: 'M', value: { 1: 999 } }],
      }),
    ).toBe(updated)
  })
})
