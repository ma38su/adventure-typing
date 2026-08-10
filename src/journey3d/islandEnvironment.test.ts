import { describe, expect, it } from 'vitest'
import { createIslandEnvironmentCells } from './islandEnvironment'
import { sampleIslandSurface } from './islandTerrainSurface'
import { WORLD_PROJECTION } from './worldTerrainBackbone'

const KM_PER_DEGREE = 111.195
const longitudeKm = KM_PER_DEGREE * Math.cos(WORLD_PROJECTION.origin[0] * Math.PI / 180)

describe('island environment cells', () => {
  it('is deterministic, varied and streamable', () => {
    const first = createIslandEnvironmentCells()
    const second = createIslandEnvironmentCells()
    expect(first).toEqual(second)
    expect(first.length).toBeGreaterThan(200)
    const instances = first.flatMap((cell) => cell.instances)
    expect(instances.length).toBeGreaterThan(700)
    expect(new Set(instances.map((instance) => instance.kind)).size).toBe(9)
    expect(new Set(first.map((cell) => cell.id)).size).toBe(first.length)
  })

  it('does not create a singular world-tree scale prop', () => {
    const instances = createIslandEnvironmentCells().flatMap((cell) => cell.instances)
    expect(Math.max(...instances.map((instance) => instance.scale))).toBeLessThanOrEqual(1.3)
  })

  it('keeps full-size trees behind the salt-spray strand belt', () => {
    const trees = createIslandEnvironmentCells().flatMap((cell) => cell.instances)
      .filter((instance) => instance.kind === 'broadleaf-tree' || instance.kind === 'cloud-tree')
    expect(trees.length).toBeGreaterThan(0)
    for (const tree of trees) {
      const surface = sampleIslandSurface(
        WORLD_PROJECTION.origin[0] + tree.northKm / KM_PER_DEGREE,
        WORLD_PROJECTION.origin[1] + tree.eastKm / longitudeKm,
      )
      expect(surface.coastDistanceKm).toBeGreaterThanOrEqual(.62)
    }
  })

  it('rejects invalid cell sizes', () => {
    expect(() => createIslandEnvironmentCells(0)).toThrow(RangeError)
  })
})
