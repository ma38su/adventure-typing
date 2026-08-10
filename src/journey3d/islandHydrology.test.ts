import { describe, expect, it } from 'vitest'
import { ISLAND_WATERWAYS, ISLAND_WATER_BODIES, nearestWaterwayDistanceKm } from './islandHydrology'
import { sampleIslandSurface } from './islandTerrainSurface'
import { WORLD_PROJECTION } from './worldTerrainBackbone'

const KM_PER_DEGREE = 111.195
const longitudeKm = KM_PER_DEGREE * Math.cos(WORLD_PROJECTION.origin[0] * Math.PI / 180)
const surfaceAt = (eastKm: number, northKm: number) => sampleIslandSurface(
  WORLD_PROJECTION.origin[0] + northKm / KM_PER_DEGREE,
  WORLD_PROJECTION.origin[1] + eastKm / longitudeKm,
)

describe('island hydrology', () => {
  it('defines three tributaries and one receiving river', () => {
    expect(ISLAND_WATERWAYS).toHaveLength(4)
    expect(new Set(ISLAND_WATERWAYS.map((waterway) => waterway.id)).size).toBe(4)
    for (const waterway of ISLAND_WATERWAYS) {
      expect(waterway.points.length).toBeGreaterThanOrEqual(4)
      expect(waterway.widthKm).toBeGreaterThan(0)
      expect(waterway.widthKm).toBeLessThanOrEqual(.03)
      expect(waterway.catchmentKm2).toBeGreaterThan(0)
    }
  })

  it('keeps windward streams independent from the southwest drainage basin', () => {
    const outlets = ISLAND_WATERWAYS.map((waterway) => waterway.points.at(-1))
    expect(new Set(outlets.map((point) => `${point!.eastKm}:${point!.northKm}`)).size).toBe(ISLAND_WATERWAYS.length)
  })

  it('keeps island water varied without inventing a large inland lake', () => {
    expect(ISLAND_WATER_BODIES.map((body) => body.kind)).toEqual(expect.arrayContaining(['spring-pool', 'rain-marsh', 'tide-pool']))
    expect(Math.max(...ISLAND_WATER_BODIES.map((body) => body.radiusKm))).toBeLessThanOrEqual(.12)
  })

  it('can locate the owning drainage line for terrain incision', () => {
    const result = nearestWaterwayDistanceKm(-3, -.55)
    expect(result.waterway.id).toBe('kotoba-river')
    expect(result.distanceKm).toBeLessThan(1e-8)
    expect(result.downstream01).toBeGreaterThan(.3)
  })

  it('keeps every persistent channel descending toward its outlet', () => {
    const climbs: string[] = []
    for (const waterway of ISLAND_WATERWAYS) {
      const heights = waterway.points.map((point) => surfaceAt(point.eastKm, point.northKm).heightKm)
      for (let index = 1; index < heights.length; index += 1) {
        if (heights[index] > heights[index - 1] + .004) climbs.push(`${waterway.id}:${index}:${heights[index - 1].toFixed(3)}→${heights[index].toFixed(3)}`)
      }
    }
    expect(climbs).toEqual([])
  })
})
