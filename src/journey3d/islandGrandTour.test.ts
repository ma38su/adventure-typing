import { describe, expect, it } from 'vitest'
import { ISLAND_GRAND_TOUR_STOPS, sampleTourStop } from './islandGrandTour'

describe('island grand tour', () => {
  it('visits ten distinct characteristic places on canonical land', () => {
    expect(ISLAND_GRAND_TOUR_STOPS).toHaveLength(10)
    expect(new Set(ISLAND_GRAND_TOUR_STOPS.map((stop) => stop.id)).size).toBe(10)
    for (const stop of ISLAND_GRAND_TOUR_STOPS) {
      const sampled = sampleTourStop(stop)
      expect(sampled.surface.land, stop.name).toBe(true)
      expect(sampled.surface.heightKm, stop.name).toBeGreaterThanOrEqual(0)
    }
  })

  it('keeps the closing leg short enough to read as one loop', () => {
    const first = ISLAND_GRAND_TOUR_STOPS[0]
    const last = ISLAND_GRAND_TOUR_STOPS.at(-1)!
    expect(Math.hypot(first.eastKm - last.eastKm, first.northKm - last.northKm)).toBeLessThan(4)
  })
})
