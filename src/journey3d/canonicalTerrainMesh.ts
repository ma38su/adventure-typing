import { sampleRenderedSurfaceHeightKm, type IslandTerrainLod } from './islandTerrainSurface'
import { SCENE_UNITS_PER_KM, scenePointToGeographic } from './stageTwoRouteV2'

export type CorridorTerrainMeshData = {
  columns: number
  rows: number
  positions: Float32Array
  indices: Uint32Array
}

export type CorridorTerrainBounds = {
  minSceneX: number
  maxSceneX: number
  minSceneZ: number
  maxSceneZ: number
}

/** Single grounding API for terrain meshes, trail ribbons, props and camera. */
export function sampleCorridorGroundSceneY(sceneX: number, sceneZ: number, lod: IslandTerrainLod = 'gameplay-near') {
  const geographic = scenePointToGeographic(sceneX, sceneZ)
  return (sampleRenderedSurfaceHeightKm(geographic.latitudeDeg, geographic.longitudeDeg, lod) - 0.08) * SCENE_UNITS_PER_KM
}

/** Renderer-neutral mesh data so debug and game renderers consume one source. */
export function createCorridorTerrainMeshData(bounds: CorridorTerrainBounds, columns: number, rows: number, lod: IslandTerrainLod): CorridorTerrainMeshData {
  if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns < 2 || rows < 2) throw new RangeError('Corridor grid dimensions must be integers >= 2')
  const positions = new Float32Array(columns * rows * 3)
  for (let index = 0; index < columns * rows; index += 1) {
    const column = index % columns
    const row = Math.floor(index / columns)
    const x = bounds.minSceneX + column / (columns - 1) * (bounds.maxSceneX - bounds.minSceneX)
    const z = bounds.minSceneZ + row / (rows - 1) * (bounds.maxSceneZ - bounds.minSceneZ)
    positions[index * 3] = x
    positions[index * 3 + 1] = sampleCorridorGroundSceneY(x, z, lod)
    positions[index * 3 + 2] = z
  }
  const indices = new Uint32Array((columns - 1) * (rows - 1) * 6)
  let cursor = 0
  for (let row = 0; row < rows - 1; row += 1) for (let column = 0; column < columns - 1; column += 1) {
    const a = row * columns + column
    indices.set([a, a + columns, a + 1, a + 1, a + columns, a + columns + 1], cursor)
    cursor += 6
  }
  return { columns, rows, positions, indices }
}
