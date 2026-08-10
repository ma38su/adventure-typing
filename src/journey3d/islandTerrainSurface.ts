import { projectAnchorToEnu, WORLD_PROJECTION, WORLD_ROUTE_REGISTRY, type WorldRouteAnchor } from './worldTerrainBackbone'
import { nearestWaterwayDistanceKm } from './islandHydrology'

export type GeographicPoint = { latitudeDeg: number; longitudeDeg: number }
export type IslandSurfaceSample = GeographicPoint & {
  eastKm: number
  northKm: number
  heightKm: number
  land: boolean
  coastDistanceKm: number
  moisture01: number
  climateZoneId: 'ocean' | 'windward-wet' | 'upland-cloud' | 'leeward-rainshadow' | 'lowland-transition'
  watershedId: 'ocean' | 'forest-tributary' | 'stargazing-tributary' | 'root-spring' | 'kotoba-mainstem' | 'northeast-coastal'
  coastalZoneId: 'deep-ocean' | 'outer-reef' | 'shallow-water' | 'estuary-wetland' | 'sand-shore' | 'rock-shore' | 'inland'
  bathymetryKm: number
}

export type IslandTerrainGrid = {
  columns: number
  rows: number
  vertices: readonly IslandSurfaceSample[]
}

export type IslandTerrainLod = 'globe' | 'regional-corridor' | 'gameplay-near'

export type TerrainLodContract = {
  id: IslandTerrainLod
  /** The LOD changes sampling density, never the coastline or macro elevation source. */
  nominalSpacingMeters: number
  includesCanonicalMicroRelief: boolean
  ownsProps: boolean
}

export const ISLAND_TERRAIN_LODS: Readonly<Record<IslandTerrainLod, TerrainLodContract>> = {
  globe: { id: 'globe', nominalSpacingMeters: 250, includesCanonicalMicroRelief: false, ownsProps: false },
  'regional-corridor': { id: 'regional-corridor', nominalSpacingMeters: 25, includesCanonicalMicroRelief: true, ownsProps: false },
  'gameplay-near': { id: 'gameplay-near', nominalSpacingMeters: 2, includesCanonicalMicroRelief: true, ownsProps: true },
}

export const ISLAND_SURFACE_BOUNDS = {
  latitudeMinDeg: 11.955,
  latitudeMaxDeg: 12.105,
  longitudeMinDeg: 141.925,
  longitudeMaxDeg: 142.085,
  seaLevelKm: 0,
  groundMaxKm: 1.25,
} as const

const KM_PER_DEGREE = 111.195
const REFERENCE_LATITUDE_RAD = WORLD_PROJECTION.origin[0] * Math.PI / 180
const DEG_LAT_PER_KM = 1 / KM_PER_DEGREE
const DEG_LON_PER_KM = 1 / (KM_PER_DEGREE * Math.cos(REFERENCE_LATITUDE_RAD))
const GROUND_ANCHOR_MAX_KM = ISLAND_SURFACE_BOUNDS.groundMaxKm

const groundAnchors = WORLD_ROUTE_REGISTRY.flatMap((stage) => stage.anchors)
  .filter((anchor, index, anchors) => anchor.altitudeKm <= GROUND_ANCHOR_MAX_KM
    && anchors.findIndex((candidate) => candidate.latitudeDeg === anchor.latitudeDeg && candidate.longitudeDeg === anchor.longitudeDeg) === index)
  .map((anchor) => ({ anchor, ...projectAnchorToEnu(anchor) }))

function clamp01(value: number) { return Math.max(0, Math.min(1, value)) }
function gaussian(distanceSquared: number, radiusKm: number) { return Math.exp(-distanceSquared / (2 * radiusKm * radiusKm)) }

/** Positive inland, zero on the coastline, negative at sea. */
export function sampleCoastDistanceKm(latitudeDeg: number, longitudeDeg: number) {
  const { eastKm, northKm } = projectAnchorToEnu({ latitudeDeg, longitudeDeg, altitudeKm: 0 })
  const angle = Math.atan2(northKm, eastKm)
  const radius = Math.hypot(eastKm / 9.05, northKm / 8.65)
  // Broad volcanic island with a SW drowned bay and a smaller east-facing headland.
  const irregularity = 1
    + 0.055 * Math.sin(angle * 3 + 0.4)
    + 0.035 * Math.cos(angle * 5 - 0.7)
    - 0.12 * gaussian((eastKm + 6.15) ** 2 + (northKm + 2.0) ** 2, 1.9)
    + 0.045 * gaussian((eastKm - 7.0) ** 2 + (northKm + 4.2) ** 2, 1.7)
  return (irregularity - radius) * 8.8
}

function unconstrainedHeightKm(eastKm: number, northKm: number, coastDistanceKm: number) {
  if (coastDistanceKm <= 0) return 0
  const inland = clamp01(coastDistanceKm / 2.2)
  const calderaRim = 0.92 * gaussian((eastKm + 2.1) ** 2 + (northKm - 6.65) ** 2, 2.45)
  const northwestPeak = 0.46 * gaussian((eastKm + 1.95) ** 2 + (northKm - 6.8) ** 2, 0.82)
  const centralWatershed = 0.31 * gaussian((eastKm + 0.3) ** 2 + (northKm - 3.2) ** 2, 3.6)
  const southeastLavaPlain = 0.07 * gaussian((eastKm - 5.1) ** 2 + (northKm + 3.8) ** 2, 4.2)
  const southwestBayErosion = 0.22 * gaussian((eastKm + 5.8) ** 2 + (northKm + 2.1) ** 2, 2.15)
  const drainage = nearestWaterwayDistanceKm(eastKm, northKm)
  const valleyRadius = drainage.waterway.id === 'kotoba-river' ? .34 : .18
  const valleyDepth = (drainage.waterway.id === 'kotoba-river' ? .022 : .009)
    + drainage.downstream01 * (drainage.waterway.id === 'kotoba-river' ? .026 : .012)
  const fluvialIncision = valleyDepth * gaussian(drainage.distanceKm ** 2, valleyRadius)
  return Math.min(GROUND_ANCHOR_MAX_KM, inland * Math.max(0.008, 0.025 + calderaRim + northwestPeak + centralWatershed + southeastLavaPlain - southwestBayErosion - fluvialIncision))
}

let groundAnchorBaselines: readonly number[] | undefined

function constrainedHeightKm(eastKm: number, northKm: number, coastDistanceKm: number) {
  const baseline = unconstrainedHeightKm(eastKm, northKm, coastDistanceKm)
  if (coastDistanceKm <= 0) return 0
  groundAnchorBaselines ??= groundAnchors.map((point) => unconstrainedHeightKm(
    point.eastKm,
    point.northKm,
    Math.max(0.05, sampleCoastDistanceKm(point.anchor.latitudeDeg, point.anchor.longitudeDeg)),
  ))
  let correction = 0
  let totalWeight = 0
  for (let index = 0; index < groundAnchors.length; index += 1) {
    const point = groundAnchors[index]
    const distanceSquared = (eastKm - point.eastKm) ** 2 + (northKm - point.northKm) ** 2
    // Route metadata may guide the macro surface, but it must not override the
    // shoreline or turn authored travel heights into terrain spikes.
    const weight = gaussian(distanceSquared, 1.8) / Math.max(Math.sqrt(distanceSquared), .12)
    correction += weight * (point.anchor.altitudeKm - groundAnchorBaselines[index])
    totalWeight += weight
  }
  const coastAuthority = clamp01(coastDistanceKm / 0.9)
  const boundedCorrection = totalWeight > 0
    ? Math.max(-0.26, Math.min(0.26, correction / totalWeight)) * coastAuthority
    : 0
  const corrected = baseline + boundedCorrection
  return Math.max(0.003, Math.min(GROUND_ANCHOR_MAX_KM, corrected))
}

function classifyWatershed(eastKm: number, northKm: number): IslandSurfaceSample['watershedId'] {
  if (northKm > 4.4 && eastKm > 3.0) return 'northeast-coastal'
  if (eastKm < -3.7 && northKm < 2.0) return 'kotoba-mainstem'
  if (northKm > 4.8 && eastKm < -0.4) return 'stargazing-tributary'
  if (northKm < 1.5 && eastKm > -2.5 && eastKm < 2.1) return 'root-spring'
  return 'forest-tributary'
}

export function sampleIslandSurface(latitudeDeg: number, longitudeDeg: number): IslandSurfaceSample {
  const { eastKm, northKm } = projectAnchorToEnu({ latitudeDeg, longitudeDeg, altitudeKm: 0 })
  const coastDistanceKm = sampleCoastDistanceKm(latitudeDeg, longitudeDeg)
  const land = coastDistanceKm >= 0
  const windward = clamp01(0.55 + 0.035 * eastKm + 0.04 * northKm)
  const elevation = constrainedHeightKm(eastKm, northKm, coastDistanceKm)
  const moisture01 = land ? clamp01(0.25 + 0.62 * windward + 0.25 * clamp01(elevation / 0.65)) : 1
  const climateZoneId = !land ? 'ocean'
    : elevation >= 0.6 ? 'upland-cloud'
      : windward >= 0.62 ? 'windward-wet'
        : windward <= 0.38 ? 'leeward-rainshadow'
          : 'lowland-transition'
  const southwestEstuary = eastKm < -3.5 && northKm > -3.8 && northKm < 1.8
  const shelteredSand = northKm < -1.2 && (eastKm < -2.2 || eastKm > 4.4)
  const coastalZoneId: IslandSurfaceSample['coastalZoneId'] = coastDistanceKm < -2.4 ? 'deep-ocean'
    : coastDistanceKm < -1.05 ? 'outer-reef'
      : coastDistanceKm < 0 ? 'shallow-water'
        : coastDistanceKm < .48 && southwestEstuary ? 'estuary-wetland'
          : coastDistanceKm < .52 && shelteredSand ? 'sand-shore'
            : coastDistanceKm < .3 ? 'rock-shore'
              : 'inland'
  const bathymetryKm = land ? 0 : -Math.min(.18, .006 + Math.max(0, -coastDistanceKm) * .018)
  return {
    latitudeDeg, longitudeDeg, eastKm, northKm, heightKm: elevation, land, coastDistanceKm, moisture01,
    climateZoneId,
    watershedId: land ? classifyWatershed(eastKm, northKm) : 'ocean',
    coastalZoneId,
    bathymetryKm,
  }
}

export function sampleSurfaceHeightKm(latitudeDeg: number, longitudeDeg: number) {
  return sampleIslandSurface(latitudeDeg, longitudeDeg).heightKm
}

/**
 * Canonical rendered ground height. Macro terrain is identical at every LOD;
 * deterministic micro relief is revealed by corridor/near LODs only. Keeping
 * this function geographic prevents a detailed chunk from inventing a second
 * local terrain surface.
 */
export function sampleRenderedSurfaceHeightKm(latitudeDeg: number, longitudeDeg: number, lod: IslandTerrainLod) {
  const sample = sampleIslandSurface(latitudeDeg, longitudeDeg)
  if (!sample.land || !ISLAND_TERRAIN_LODS[lod].includesCanonicalMicroRelief) return sample.heightKm
  const coastFade = clamp01(sample.coastDistanceKm / 0.18)
  const reliefKm = (
    0.0012 * Math.sin(sample.eastKm * 17 + sample.northKm * 3.5)
    + 0.0006 * Math.sin(sample.northKm * 9)
    - 0.0004 * Math.cos(sample.eastKm * 35 - sample.northKm * 2.5)
  ) * coastFade
  return Math.max(0.0005, sample.heightKm + reliefKm)
}

/** Clockwise deterministic coastline, suitable for a low-detail map mesh or debug overlay. */
export function createIslandCoastlinePolygon(segments = 96): readonly GeographicPoint[] {
  if (!Number.isInteger(segments) || segments < 24) throw new RangeError('Coastline requires at least 24 segments')
  return Array.from({ length: segments }, (_, index) => {
    const angle = Math.PI / 2 - index / segments * Math.PI * 2
    let low = 0
    let high = 12
    for (let iteration = 0; iteration < 32; iteration += 1) {
      const radius = (low + high) / 2
      const latitudeDeg = WORLD_PROJECTION.origin[0] + radius * Math.sin(angle) * DEG_LAT_PER_KM
      const longitudeDeg = WORLD_PROJECTION.origin[1] + radius * Math.cos(angle) * DEG_LON_PER_KM
      if (sampleCoastDistanceKm(latitudeDeg, longitudeDeg) >= 0) low = radius
      else high = radius
    }
    return {
      latitudeDeg: WORLD_PROJECTION.origin[0] + low * Math.sin(angle) * DEG_LAT_PER_KM,
      longitudeDeg: WORLD_PROJECTION.origin[1] + low * Math.cos(angle) * DEG_LON_PER_KM,
    }
  })
}

export function createIslandTerrainGrid(columns = 49, rows = 49, paddingKm = 0): IslandTerrainGrid {
  if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns < 2 || rows < 2) throw new RangeError('Terrain grid dimensions must be integers >= 2')
  if (!Number.isFinite(paddingKm) || paddingKm < 0) throw new RangeError('Terrain grid padding must be >= 0')
  const latitudeMin = ISLAND_SURFACE_BOUNDS.latitudeMinDeg - paddingKm * DEG_LAT_PER_KM
  const latitudeMax = ISLAND_SURFACE_BOUNDS.latitudeMaxDeg + paddingKm * DEG_LAT_PER_KM
  const longitudeMin = ISLAND_SURFACE_BOUNDS.longitudeMinDeg - paddingKm * DEG_LON_PER_KM
  const longitudeMax = ISLAND_SURFACE_BOUNDS.longitudeMaxDeg + paddingKm * DEG_LON_PER_KM
  const vertices = Array.from({ length: columns * rows }, (_, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const latitudeDeg = latitudeMax - row / (rows - 1) * (latitudeMax - latitudeMin)
    const longitudeDeg = longitudeMin + column / (columns - 1) * (longitudeMax - longitudeMin)
    return sampleIslandSurface(latitudeDeg, longitudeDeg)
  })
  return { columns, rows, vertices }
}

export function isGroundAnchor(anchor: WorldRouteAnchor) { return anchor.altitudeKm <= GROUND_ANCHOR_MAX_KM }
