export interface TopologyDeviceVisual {
  kind: 'meter' | 'diesel' | 'pv' | 'inverter' | 'pcs' | 'battery' | 'load' | 'device'
  color: string
  softColor: string
}

const visuals: Record<TopologyDeviceVisual['kind'], TopologyDeviceVisual> = {
  meter: { kind: 'meter', color: '#38bdf8', softColor: '#38bdf826' },
  diesel: { kind: 'diesel', color: '#fb923c', softColor: '#fb923c26' },
  pv: { kind: 'pv', color: '#facc15', softColor: '#facc1526' },
  inverter: { kind: 'inverter', color: '#a78bfa', softColor: '#a78bfa26' },
  pcs: { kind: 'pcs', color: '#60a5fa', softColor: '#60a5fa26' },
  battery: { kind: 'battery', color: '#4ade80', softColor: '#4ade8026' },
  load: { kind: 'load', color: '#f472b6', softColor: '#f472b626' },
  device: { kind: 'device', color: '#94a3b8', softColor: '#94a3b826' },
}

export function getTopologyDeviceVisual(productName?: string): TopologyDeviceVisual {
  const name = productName?.trim().toLowerCase() ?? ''
  if (name === 'meter') return visuals.meter
  if (name === 'diesel') return visuals.diesel
  if (name === 'pv_group') return visuals.pv
  if (name === 'ac_inverter' || name === 'hybrid_inverter') return visuals.inverter
  if (name === 'pcs') return visuals.pcs
  if (name === 'battery') return visuals.battery
  if (name.endsWith('_load')) return visuals.load
  return visuals.device
}
