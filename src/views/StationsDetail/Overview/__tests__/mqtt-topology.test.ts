import { describe, expect, it } from 'vitest'
import { extractHomepageTopologyPatch, getMqttTimestamp } from '../mqtt-topology'

describe('homepage topology patch', () => {
  it('maps homepage calculated points and treats null as missing value', () => {
    const patch = extractHomepageTopologyPatch({
      property: [
        {
          source: 'homepage',
          value: { '14': 12.5, '17': null, '18': 'not-a-number' },
        },
      ],
    })
    expect(patch).toEqual({ pvP: 12.5, dieselOil: null, essP: null })
  })

  it('ignores non-homepage groups', () => {
    expect(
      extractHomepageTopologyPatch({
        property: [{ source: 'inst', value: { '14': 99 } }],
      }),
    ).toBeNull()
  })
})

describe('getMqttTimestamp', () => {
  it('normalizes seconds and milliseconds', () => {
    expect(getMqttTimestamp({ timestamp: 1700000000, property: [] })).toBe(1700000000000)
    expect(getMqttTimestamp({ timestamp: 1700000000000, property: [] })).toBe(1700000000000)
  })
})
