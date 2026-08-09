export type StageOneRouteAnchorV2 = {
  anchorId: `stage-1-anchor-${1 | 2 | 3 | 4 | 5 | 6}`
  progress: number
  latitudeDeg: number
  longitudeDeg: number
  altitudeKm: number
  microLandform: string
  watershedId: string
  regionId: string
  chunkId: string
  displayLabel: string
}

// Explicit src-side conversion of Stage 1 from kotoba-island-route-v2.js.
// Do not import the artwork script at runtime; changes to its six source anchors
// must be reviewed and copied here with the contract test updated.
export const STAGE_ONE_ROUTE_V2_ANCHORS: readonly StageOneRouteAnchorV2[] = [
  { anchorId: 'stage-1-anchor-1', progress: 0, latitudeDeg: 11.982, longitudeDeg: 142.062, altitudeKm: 0.08, microLandform: '溶岩原の緩丘', watershedId: 'southeast-meadow', regionId: 'meadow', chunkId: 'evt-meadow-landing', displayLabel: '花の草原' },
  { anchorId: 'stage-1-anchor-2', progress: 0.2, latitudeDeg: 11.992572, longitudeDeg: 142.052915, altitudeKm: 0.108, microLandform: '浅い涸れ沢', watershedId: 'southeast-meadow', regionId: 'meadow', chunkId: 'geo-a-meadow-1', displayLabel: '林縁手前' },
  { anchorId: 'stage-1-anchor-3', progress: 0.4, latitudeDeg: 12.0058, longitudeDeg: 142.048183, altitudeKm: 0.136, microLandform: '河岸段丘', watershedId: 'southeast-meadow', regionId: 'meadow', chunkId: 'geo-a-meadow-2', displayLabel: '森の入口' },
  { anchorId: 'stage-1-anchor-4', progress: 0.6, latitudeDeg: 12.015972, longitudeDeg: 142.038443, altitudeKm: 0.164, microLandform: '季節湿地', watershedId: 'southeast-meadow', regionId: 'meadow-wetland', chunkId: 'geo-a-meadow-wetland-3', displayLabel: '成木の狭間' },
  { anchorId: 'stage-1-anchor-5', progress: 0.8, latitudeDeg: 12.028886, longitudeDeg: 142.033196, altitudeKm: 0.192, microLandform: '防風林縁', watershedId: 'forest-tributary', regionId: 'forest-edge', chunkId: 'geo-a-forest-edge-4', displayLabel: '光の森内部' },
  { anchorId: 'stage-1-anchor-6', progress: 1, latitudeDeg: 12.04, longitudeDeg: 142.025, altitudeKm: 0.22, microLandform: '小川氾濫原', watershedId: 'forest-tributary', regionId: 'forest', chunkId: 'bnd-meadow-forest-a', displayLabel: '小川の橋' },
]

const KM_PER_LATITUDE_DEGREE = 111.195
const REFERENCE_LATITUDE_RAD = 12.025 * Math.PI / 180
const SCENE_ROUTE_LENGTH = 152

export type StageOneLocalRoutePoint = StageOneRouteAnchorV2 & {
  eastKm: number
  northKm: number
  alongKm: number
  crossKm: number
  sceneX: number
  sceneZ: number
  elevationMeters: number
}

export function stageOneRouteV2ToChunkLocal(): readonly StageOneLocalRoutePoint[] {
  const origin = STAGE_ONE_ROUTE_V2_ANCHORS[0]
  const end = STAGE_ONE_ROUTE_V2_ANCHORS.at(-1)!
  const toEnu = (anchor: StageOneRouteAnchorV2) => ({
    eastKm: (anchor.longitudeDeg - origin.longitudeDeg) * KM_PER_LATITUDE_DEGREE * Math.cos(REFERENCE_LATITUDE_RAD),
    northKm: (anchor.latitudeDeg - origin.latitudeDeg) * KM_PER_LATITUDE_DEGREE,
  })
  const endEnu = toEnu(end)
  const horizontalLengthKm = Math.hypot(endEnu.eastKm, endEnu.northKm)
  const forwardEast = endEnu.eastKm / horizontalLengthKm
  const forwardNorth = endEnu.northKm / horizontalLengthKm
  const sceneUnitsPerKm = SCENE_ROUTE_LENGTH / horizontalLengthKm
  return STAGE_ONE_ROUTE_V2_ANCHORS.map((anchor) => {
    const { eastKm, northKm } = toEnu(anchor)
    const alongKm = eastKm * forwardEast + northKm * forwardNorth
    const crossKm = -eastKm * forwardNorth + northKm * forwardEast
    const rawSceneX = crossKm * sceneUnitsPerKm
    return { ...anchor, eastKm, northKm, alongKm, crossKm, sceneX: Math.abs(rawSceneX) < 1e-10 ? 0 : rawSceneX, sceneZ: 10 - alongKm * sceneUnitsPerKm, elevationMeters: (anchor.altitudeKm - origin.altitudeKm) * 1000 }
  })
}

export const STAGE_ONE_CHUNK_LOCAL_ROUTE = stageOneRouteV2ToChunkLocal()
