import { sampleIslandSurface } from './islandTerrainSurface'
import { WORLD_PROJECTION } from './worldTerrainBackbone'

export type IslandEnvironmentKind = 'broadleaf-tree' | 'cloud-tree' | 'shrub' | 'grass' | 'flower' | 'reed' | 'fern' | 'basalt' | 'fallen-log'

export type IslandEnvironmentInstance = {
  id: string
  kind: IslandEnvironmentKind
  eastKm: number
  northKm: number
  scale: number
  rotationRad: number
}

export type IslandEnvironmentCell = {
  id: string
  eastMinKm: number
  northMinKm: number
  sizeKm: number
  instances: readonly IslandEnvironmentInstance[]
}

const KM_PER_DEGREE = 111.195
const longitudeKm = KM_PER_DEGREE * Math.cos(WORLD_PROJECTION.origin[0] * Math.PI / 180)

const geographicAt = (eastKm: number, northKm: number) => ({
  latitudeDeg: WORLD_PROJECTION.origin[0] + northKm / KM_PER_DEGREE,
  longitudeDeg: WORLD_PROJECTION.origin[1] + eastKm / longitudeKm,
})

function noise(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return value - Math.floor(value)
}

function chooseKind(eastKm: number, northKm: number, seed: number): IslandEnvironmentKind {
  const geographic = geographicAt(eastKm, northKm)
  const surface = sampleIslandSurface(geographic.latitudeDeg, geographic.longitudeDeg)
  const pick = noise(seed + 17)
  if (eastKm > 2 && northKm < -2) return pick < .62 ? 'grass' : pick < .9 ? 'flower' : 'shrub'
  if (surface.coastalZoneId === 'estuary-wetland') return pick < .72 ? 'reed' : 'shrub'
  if (surface.coastalZoneId === 'sand-shore') return pick < .55 ? 'grass' : 'flower'
  if (surface.coastalZoneId === 'rock-shore') return 'basalt'
  if (surface.heightKm > .58) return pick < .46 ? 'cloud-tree' : pick < .7 ? 'shrub' : pick < .88 ? 'basalt' : 'fern'
  if (surface.climateZoneId === 'windward-wet') return pick < .58 ? 'broadleaf-tree' : pick < .72 ? 'shrub' : pick < .88 ? 'fern' : pick < .95 ? 'fallen-log' : 'grass'
  if (surface.climateZoneId === 'leeward-rainshadow') return pick < .48 ? 'grass' : pick < .75 ? 'flower' : 'basalt'
  return pick < .42 ? 'broadleaf-tree' : pick < .72 ? 'shrub' : pick < .9 ? 'grass' : 'flower'
}

let defaultEnvironmentCells: readonly IslandEnvironmentCell[] | undefined

/**
 * Deterministic, streamable environment data. Cell IDs and placements remain
 * stable across LOD loads; renderers decide how much geometry each kind owns.
 */
export function createIslandEnvironmentCells(cellSizeKm = .65): readonly IslandEnvironmentCell[] {
  if (!Number.isFinite(cellSizeKm) || cellSizeKm <= 0) throw new RangeError('Environment cell size must be positive')
  if (cellSizeKm === .65 && defaultEnvironmentCells) return defaultEnvironmentCells
  const cells: IslandEnvironmentCell[] = []
  const halfExtentKm = 8.45
  const count = Math.ceil(halfExtentKm * 2 / cellSizeKm)
  for (let row = 0; row < count; row += 1) {
    for (let column = 0; column < count; column += 1) {
      const eastMinKm = -halfExtentKm + column * cellSizeKm
      const northMinKm = -halfExtentKm + row * cellSizeKm
      const center = geographicAt(eastMinKm + cellSizeKm / 2, northMinKm + cellSizeKm / 2)
      const centerSurface = sampleIslandSurface(center.latitudeDeg, center.longitudeDeg)
      if (!centerSurface.land) continue
      const density = centerSurface.climateZoneId === 'windward-wet' ? 12
        : centerSurface.climateZoneId === 'upland-cloud' ? 9
          : centerSurface.climateZoneId === 'leeward-rainshadow' ? 5 : 7
      const instances: IslandEnvironmentInstance[] = []
      for (let index = 0; index < density; index += 1) {
        const seed = row * 10007 + column * 101 + index * 17
        const eastKm = eastMinKm + (.12 + noise(seed) * .76) * cellSizeKm
        const northKm = northMinKm + (.12 + noise(seed + 1) * .76) * cellSizeKm
        const geographic = geographicAt(eastKm, northKm)
        if (!sampleIslandSurface(geographic.latitudeDeg, geographic.longitudeDeg).land) continue
        instances.push({
          id: `${row}:${column}:${index}`,
          kind: chooseKind(eastKm, northKm, seed),
          eastKm,
          northKm,
          scale: .72 + noise(seed + 2) * .58,
          rotationRad: noise(seed + 3) * Math.PI * 2,
        })
      }
      if (instances.length) cells.push({ id: `${row}:${column}`, eastMinKm, northMinKm, sizeKm: cellSizeKm, instances })
    }
  }
  if (cellSizeKm === .65) defaultEnvironmentCells = cells
  return cells
}
