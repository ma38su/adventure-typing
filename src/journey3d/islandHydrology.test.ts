import { describe, expect, it } from 'vitest'
import { ISLAND_WATERWAYS } from './islandHydrology'

describe('island hydrology', () => {
  it('defines three tributaries and one receiving river', () => {
    expect(ISLAND_WATERWAYS).toHaveLength(4)
    expect(new Set(ISLAND_WATERWAYS.map((waterway) => waterway.id)).size).toBe(4)
    for (const waterway of ISLAND_WATERWAYS) {
      expect(waterway.points.length).toBeGreaterThanOrEqual(4)
      expect(waterway.widthKm).toBeGreaterThan(0)
    }
  })

  it('joins the two eastern tributaries to the head of the main river', () => {
    const riverStart = ISLAND_WATERWAYS.find((waterway) => waterway.id === 'kotoba-river')!.points[0]
    for (const id of ['east-forest-stream', 'rain-forest-stream'] as const) {
      expect(ISLAND_WATERWAYS.find((waterway) => waterway.id === id)!.points.at(-1)).toEqual(riverStart)
    }
  })
})
