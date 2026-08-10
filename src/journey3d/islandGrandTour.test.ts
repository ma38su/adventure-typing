import { describe, expect, it } from 'vitest'
import { enuToGeographic, ISLAND_GRAND_TOUR_ROUTE, ISLAND_GRAND_TOUR_STOPS, sampleTourStop, tourProgressForStop } from './islandGrandTour'
import { sampleIslandSurface } from './islandTerrainSurface'

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

  it('follows a continuous land route with gradual control-point climbs', () => {
    expect(ISLAND_GRAND_TOUR_ROUTE.length).toBeGreaterThan(ISLAND_GRAND_TOUR_STOPS.length * 2)
    const points = ISLAND_GRAND_TOUR_ROUTE.map((point) => {
      const geographic = enuToGeographic(point.eastKm, point.northKm)
      return { ...point, surface: sampleIslandSurface(geographic.latitudeDeg, geographic.longitudeDeg) }
    })
    for (const point of points) expect(point.surface.land).toBe(true)
    for (let index = 0; index < points.length; index += 1) {
      const current = points[index]
      const next = points[(index + 1) % points.length]
      const horizontalKm = Math.hypot(next.eastKm - current.eastKm, next.northKm - current.northKm)
      const grade = Math.abs(next.surface.heightKm - current.surface.heightKm) / horizontalKm
      expect(grade, `route segment ${index}`).toBeLessThan(0.22)
    }
  })

  it('maps every named stop onto the scenic route', () => {
    for (const stop of ISLAND_GRAND_TOUR_STOPS) {
      const progress = tourProgressForStop(stop.id)
      expect(progress).toBeGreaterThanOrEqual(0)
      expect(progress).toBeLessThan(1)
    }
  })

  it('places the pocket-beach stop on the canonical sand shore', () => {
    const beach = ISLAND_GRAND_TOUR_STOPS.find((stop) => stop.id === 'beach')!
    const surface = sampleTourStop(beach).surface
    expect(surface.coastalZoneId).toBe('sand-shore')
    expect(surface.coastDistanceKm).toBeGreaterThan(.08)
  })
})
