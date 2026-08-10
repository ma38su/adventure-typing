import { STAGE_ONE_ROUTE_V2_ANCHORS } from './stageOneRouteV2'
import { getStageBackbone } from './worldTerrainBackbone'

const STAGE_TWO_LABELS = ['小川の橋', '湿った支流', '樹洞の段丘', '倒木の抜け', '雲霧林の肩', '星見門'] as const
export const STAGE_TWO_ROUTE_V2_ANCHORS = getStageBackbone(2).anchors.map((anchor, index) => ({ ...anchor, displayLabel: STAGE_TWO_LABELS[index] }))

export const KM_PER_LATITUDE_DEGREE = 111.195
export const REFERENCE_LATITUDE_RAD = 12.025 * Math.PI / 180
export const STAGE_ONE_SCENE_LENGTH = 152

// One ENU origin and scale for both stages. Stage 2 is never authored as an
// independent decorative curve: its local points are a projection of route-v2.
export function continuousRouteV2ToScene() {
  const stageThreeProxy = getStageBackbone(3).anchors[1]
  const anchors = [...STAGE_ONE_ROUTE_V2_ANCHORS, ...STAGE_TWO_ROUTE_V2_ANCHORS.slice(1), stageThreeProxy]
  const origin = STAGE_ONE_ROUTE_V2_ANCHORS[0]
  const stageOneEnd = STAGE_ONE_ROUTE_V2_ANCHORS.at(-1)!
  const toEnu = (anchor: typeof anchors[number]) => ({
    eastKm: (anchor.longitudeDeg - origin.longitudeDeg) * KM_PER_LATITUDE_DEGREE * Math.cos(REFERENCE_LATITUDE_RAD),
    northKm: (anchor.latitudeDeg - origin.latitudeDeg) * KM_PER_LATITUDE_DEGREE,
  })
  const endEnu = toEnu(stageOneEnd)
  const horizontalLengthKm = Math.hypot(endEnu.eastKm, endEnu.northKm)
  const forwardEast = endEnu.eastKm / horizontalLengthKm
  const forwardNorth = endEnu.northKm / horizontalLengthKm
  const scale = STAGE_ONE_SCENE_LENGTH / horizontalLengthKm
  return anchors.map((anchor, index) => {
    const { eastKm, northKm } = toEnu(anchor)
    const alongKm = eastKm * forwardEast + northKm * forwardNorth
    const crossKm = -eastKm * forwardNorth + northKm * forwardEast
    return { ...anchor, worldProgress: index / 5, sceneX: crossKm * scale, sceneZ: 10 - alongKm * scale, elevationMeters: (anchor.altitudeKm - origin.altitudeKm) * 1000 }
  })
}

export const STAGE_ONE_TWO_CONTINUOUS_ROUTE = continuousRouteV2ToScene()

const origin = STAGE_ONE_ROUTE_V2_ANCHORS[0]
const stageOneEnd = STAGE_ONE_ROUTE_V2_ANCHORS.at(-1)!
const endEastKm = (stageOneEnd.longitudeDeg - origin.longitudeDeg) * KM_PER_LATITUDE_DEGREE * Math.cos(REFERENCE_LATITUDE_RAD)
const endNorthKm = (stageOneEnd.latitudeDeg - origin.latitudeDeg) * KM_PER_LATITUDE_DEGREE
const stageOneHorizontalKm = Math.hypot(endEastKm, endNorthKm)
const forwardEast = endEastKm / stageOneHorizontalKm
const forwardNorth = endNorthKm / stageOneHorizontalKm
export const SCENE_UNITS_PER_KM = STAGE_ONE_SCENE_LENGTH / stageOneHorizontalKm

/** Inverse of the rigid ENU→corridor transform used by the detailed mesh. */
export function scenePointToGeographic(sceneX: number, sceneZ: number) {
  const alongKm = (10 - sceneZ) / SCENE_UNITS_PER_KM
  const crossKm = sceneX / SCENE_UNITS_PER_KM
  const eastKm = alongKm * forwardEast - crossKm * forwardNorth
  const northKm = alongKm * forwardNorth + crossKm * forwardEast
  return {
    latitudeDeg: origin.latitudeDeg + northKm / KM_PER_LATITUDE_DEGREE,
    longitudeDeg: origin.longitudeDeg + eastKm / (KM_PER_LATITUDE_DEGREE * Math.cos(REFERENCE_LATITUDE_RAD)),
  }
}
