import routeData from './generated/worldRouteV2.generated.json'

export type WorldRouteAnchor = {
  anchorId: string
  progress: number
  latitudeDeg: number
  longitudeDeg: number
  altitudeKm: number
  microLandform: string
  watershedId: string
  regionId: string
  chunkId: string
}

export type TerrainDetailContract = {
  level: 'backbone' | 'corridor' | 'near'
  owns: readonly ('route' | 'canonical-surface' | 'sampling-density' | 'props')[]
  retainedBehindStages: number
  preloadedAheadStages: number
}

export const GLOBAL_TERRAIN_DETAIL: TerrainDetailContract = {
  level: 'backbone', owns: ['route', 'canonical-surface'], retainedBehindStages: 1, preloadedAheadStages: 2,
}
export const CORRIDOR_TERRAIN_DETAIL: TerrainDetailContract = {
  level: 'corridor', owns: ['sampling-density'], retainedBehindStages: 1, preloadedAheadStages: 1,
}
export const NEAR_TERRAIN_DETAIL: TerrainDetailContract = {
  level: 'near', owns: ['sampling-density', 'props'], retainedBehindStages: 0, preloadedAheadStages: 1,
}

export const WORLD_ROUTE_REGISTRY = routeData.stages as readonly (Omit<(typeof routeData.stages)[number], 'anchors'> & { anchors: readonly WorldRouteAnchor[] })[]
export const WORLD_PROJECTION = routeData.projection

const KM_PER_DEGREE = 111.195
const referenceLatitudeRad = WORLD_PROJECTION.origin[0] * Math.PI / 180

/** Projection shared by low-detail global terrain and every detailed corridor. */
export function projectAnchorToEnu(anchor: Pick<WorldRouteAnchor, 'latitudeDeg' | 'longitudeDeg' | 'altitudeKm'>) {
  return {
    eastKm: (anchor.longitudeDeg - WORLD_PROJECTION.origin[1]) * KM_PER_DEGREE * Math.cos(referenceLatitudeRad),
    northKm: (anchor.latitudeDeg - WORLD_PROJECTION.origin[0]) * KM_PER_DEGREE,
    upKm: anchor.altitudeKm,
  }
}

export function getStageBackbone(stageNumber: number) {
  const stage = WORLD_ROUTE_REGISTRY[stageNumber - 1]
  if (!stage) throw new RangeError(`Unknown world stage: ${stageNumber}`)
  return { ...stage, anchors: stage.anchors.map((anchor) => ({ ...anchor, enu: projectAnchorToEnu(anchor) })) }
}
