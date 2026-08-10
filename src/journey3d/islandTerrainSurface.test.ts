import { describe, expect, it } from 'vitest'
import { WORLD_ROUTE_REGISTRY } from './worldTerrainBackbone'
import {
  createIslandCoastlinePolygon, createIslandTerrainGrid, ISLAND_SURFACE_BOUNDS, isGroundAnchor,
  sampleCoastDistanceKm, sampleIslandSurface, sampleSurfaceHeightKm,
} from './islandTerrainSurface'

describe('deterministic whole-island terrain surface', () => {
  it('keeps the grid inside canonical bounds and ground elevation range', () => {
    const grid = createIslandTerrainGrid(25, 23)
    expect(grid.vertices).toHaveLength(575)
    for (const point of grid.vertices) {
      expect(point.latitudeDeg).toBeGreaterThanOrEqual(ISLAND_SURFACE_BOUNDS.latitudeMinDeg)
      expect(point.latitudeDeg).toBeLessThanOrEqual(ISLAND_SURFACE_BOUNDS.latitudeMaxDeg)
      expect(point.longitudeDeg).toBeGreaterThanOrEqual(ISLAND_SURFACE_BOUNDS.longitudeMinDeg)
      expect(point.longitudeDeg).toBeLessThanOrEqual(ISLAND_SURFACE_BOUNDS.longitudeMaxDeg)
      expect(point.heightKm).toBeGreaterThanOrEqual(0)
      expect(point.heightKm).toBeLessThanOrEqual(1.25)
    }
  })

  it('uses every terrestrial route anchor as an exact height constraint', () => {
    const anchors = WORLD_ROUTE_REGISTRY.flatMap((stage) => stage.anchors).filter(isGroundAnchor)
    for (const anchor of anchors) {
      expect(sampleSurfaceHeightKm(anchor.latitudeDeg, anchor.longitudeDeg)).toBeCloseTo(anchor.altitudeKm, 9)
    }
  })

  it('keeps every route anchor on the island or its immediate coastal corridor', () => {
    const anchors = WORLD_ROUTE_REGISTRY.flatMap((stage) => stage.anchors)
    for (const anchor of anchors) {
      expect(sampleCoastDistanceKm(anchor.latitudeDeg, anchor.longitudeDeg)).toBeGreaterThanOrEqual(-0.12)
    }
  })

  it('does not turn cloud-structure anchors into two-kilometre terrain spikes', () => {
    const sky = WORLD_ROUTE_REGISTRY.flatMap((stage) => stage.anchors).filter((anchor) => !isGroundAnchor(anchor))
    expect(sky.length).toBeGreaterThan(0)
    expect(Math.max(...sky.map((anchor) => sampleSurfaceHeightKm(anchor.latitudeDeg, anchor.longitudeDeg)))).toBeLessThanOrEqual(1.25)
  })

  it('produces a closed, deterministic coastline with sea on its outer side', () => {
    const first = createIslandCoastlinePolygon(64)
    expect(createIslandCoastlinePolygon(64)).toEqual(first)
    expect(first).toHaveLength(64)
    for (const point of first) expect(Math.abs(sampleCoastDistanceKm(point.latitudeDeg, point.longitudeDeg))).toBeLessThan(0.00001)
    expect(sampleIslandSurface(12.025, 142).land).toBe(true)
    expect(sampleIslandSurface(11.955, 141.925).land).toBe(false)
  })

  it('remains continuous across small steps, including stage boundaries', () => {
    const epsilon = 0.000001
    for (let stage = 0; stage < WORLD_ROUTE_REGISTRY.length - 1; stage += 1) {
      const anchor = WORLD_ROUTE_REGISTRY[stage].anchors.at(-1)!
      if (!isGroundAnchor(anchor)) continue
      const center = sampleSurfaceHeightKm(anchor.latitudeDeg, anchor.longitudeDeg)
      expect(Math.abs(sampleSurfaceHeightKm(anchor.latitudeDeg + epsilon, anchor.longitudeDeg) - center)).toBeLessThan(0.015)
      expect(Math.abs(sampleSurfaceHeightKm(anchor.latitudeDeg, anchor.longitudeDeg + epsilon) - center)).toBeLessThan(0.015)
    }
  })

  it('expresses the NW highlands and wetter NE / drier SW climate gradient', () => {
    const northwestHighland = sampleIslandSurface(12.086, 141.982)
    const southeastPlain = sampleIslandSurface(11.982, 142.062)
    expect(northwestHighland.heightKm).toBeGreaterThan(southeastPlain.heightKm + 0.5)
    const northeast = sampleIslandSurface(12.06, 142.04)
    const southwest = sampleIslandSurface(11.99, 141.95)
    expect(northeast.moisture01).toBeGreaterThan(southwest.moisture01)
    expect(northeast.climateZoneId).toMatch(/windward|upland/)
    expect(southwest.climateZoneId).toBe('leeward-rainshadow')
  })

  it('separates the three south-side tributaries and their shared mainstem', () => {
    expect(sampleIslandSurface(12.065, 142.012).watershedId).toBe('forest-tributary')
    expect(sampleIslandSurface(12.082, 141.986).watershedId).toBe('stargazing-tributary')
    expect(sampleIslandSurface(12.02, 142).watershedId).toBe('root-spring')
    expect(sampleIslandSurface(12.005, 141.95).watershedId).toBe('kotoba-mainstem')
  })

  it('grades the coast from deep water through reef and shallows to land', () => {
    const coastline = createIslandCoastlinePolygon(64)[32]
    expect(sampleIslandSurface(11.93, 141.90).coastalZoneId).toBe('deep-ocean')
    expect(sampleIslandSurface(coastline.latitudeDeg, coastline.longitudeDeg).bathymetryKm).toBe(0)
    const zones = createIslandTerrainGrid(65, 65).vertices.map((sample) => sample.coastalZoneId)
    expect(zones).toContain('outer-reef')
    expect(zones).toContain('shallow-water')
    expect(zones).toContain('estuary-wetland')
    expect(zones).toContain('sand-shore')
    expect(zones).toContain('rock-shore')
  })
})
