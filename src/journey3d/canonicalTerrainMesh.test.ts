import { describe, expect, it } from 'vitest'
import { sampleRenderedSurfaceHeightKm } from './islandTerrainSurface'
import { createCorridorTerrainMeshData, sampleCorridorGroundSceneY } from './canonicalTerrainMesh'
import { geographicPointToScene, SCENE_UNITS_PER_KM, scenePointToGeographic, STAGE_ONE_TWO_CONTINUOUS_ROUTE } from './stageTwoRouteV2'

describe('canonical terrain LOD pipeline', () => {
  it('round-trips geographic coordinates through the corridor transform', () => {
    for (const anchor of STAGE_ONE_TWO_CONTINUOUS_ROUTE) {
      const scene = geographicPointToScene(anchor.latitudeDeg, anchor.longitudeDeg)
      expect(scene.sceneX).toBeCloseTo(anchor.sceneX, 8)
      expect(scene.sceneZ).toBeCloseTo(anchor.sceneZ, 8)
      expect(scenePointToGeographic(scene.sceneX, scene.sceneZ)).toEqual(expect.objectContaining({
        latitudeDeg: expect.closeTo(anchor.latitudeDeg, 9),
        longitudeDeg: expect.closeTo(anchor.longitudeDeg, 9),
      }))
    }
  })

  it('grounds Stage 1 and 2 on the canonical geographic surface', () => {
    for (const anchor of STAGE_ONE_TWO_CONTINUOUS_ROUTE.slice(0, 11)) {
      const geographic = scenePointToGeographic(anchor.sceneX, anchor.sceneZ)
      const expected = (sampleRenderedSurfaceHeightKm(geographic.latitudeDeg, geographic.longitudeDeg, 'gameplay-near') - 0.08) * SCENE_UNITS_PER_KM
      expect(sampleCorridorGroundSceneY(anchor.sceneX, anchor.sceneZ)).toBeCloseTo(expected, 10)
    }
  })

  it('builds the gameplay mesh exclusively from the grounding sampler', () => {
    const bounds = { minSceneX: -2, maxSceneX: 2, minSceneZ: -4, maxSceneZ: 4 }
    const mesh = createCorridorTerrainMeshData(bounds, 3, 3, 'gameplay-near')
    expect(mesh.positions).toHaveLength(27)
    expect(mesh.indices).toHaveLength(24)
    for (let index = 0; index < 9; index += 1) {
      const x = mesh.positions[index * 3]
      const y = mesh.positions[index * 3 + 1]
      const z = mesh.positions[index * 3 + 2]
      expect(y).toBeCloseTo(sampleCorridorGroundSceneY(x, z), 5)
    }
  })

  it('keeps macro elevation identical while revealing deterministic near relief', () => {
    const anchor = STAGE_ONE_TWO_CONTINUOUS_ROUTE[2]
    const globe = sampleRenderedSurfaceHeightKm(anchor.latitudeDeg, anchor.longitudeDeg, 'globe')
    const nearA = sampleRenderedSurfaceHeightKm(anchor.latitudeDeg, anchor.longitudeDeg, 'gameplay-near')
    const nearB = sampleRenderedSurfaceHeightKm(anchor.latitudeDeg, anchor.longitudeDeg, 'gameplay-near')
    expect(nearA).toBe(nearB)
    expect(Math.abs(nearA - globe)).toBeLessThan(0.003)
  })
})
