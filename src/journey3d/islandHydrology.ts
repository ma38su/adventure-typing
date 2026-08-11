export type IslandWaterway = {
  id: 'east-forest-stream' | 'rain-forest-stream' | 'spring-stream' | 'kotoba-river'
  name: string
  /** Bankfull water width. Visual renderers must not inflate this to a map symbol. */
  widthKm: number
  /** Approximate contributing area at the downstream end. */
  catchmentKm2: number
  flowClass: 'perennial' | 'spring-fed'
  points: readonly { eastKm: number; northKm: number }[]
}

export type IslandWaterBody = {
  id: string
  kind: 'spring-pool' | 'rain-marsh' | 'tide-pool'
  eastKm: number
  northKm: number
  radiusKm: number
}

/**
 * Surface-water centerlines used by every terrain LOD.
 *
 * The island is an old permeable basalt shield. Persistent water is therefore
 * limited to the wet windward catchments and one spring-fed tributary. Lines
 * follow concave topographic lows from headwater to outlet and only widen
 * after confluences; they never cross a ridge merely to reach a story beat.
 */
export const ISLAND_WATERWAYS: readonly IslandWaterway[] = [
  {
    id: 'east-forest-stream', name: '東風上沢', widthKm: .012, catchmentKm2: 6.8, flowClass: 'perennial',
    points: [
      { eastKm: -.2, northKm: .15 }, { eastKm: 1.0, northKm: .35 }, { eastKm: 2.05, northKm: .75 },
      { eastKm: 3.0, northKm: 1.35 }, { eastKm: 3.85, northKm: 2.05 }, { eastKm: 4.55, northKm: 2.75 },
      { eastKm: 5.1, northKm: 3.45 }, { eastKm: 5.85, northKm: 3.65 }, { eastKm: 6.55, northKm: 3.55 },
    ],
  },
  {
    id: 'rain-forest-stream', name: '北東雨森沢', widthKm: .015, catchmentKm2: 9.4, flowClass: 'perennial',
    points: [
      { eastKm: .25, northKm: .9 }, { eastKm: .75, northKm: 1.8 },
      { eastKm: 1.25, northKm: 2.7 }, { eastKm: 1.75, northKm: 3.65 }, { eastKm: 2.25, northKm: 4.55 },
      { eastKm: 2.65, northKm: 5.45 }, { eastKm: 3.35, northKm: 6.0 }, { eastKm: 4.15, northKm: 6.25 },
    ],
  },
  {
    id: 'spring-stream', name: '溶岩層境湧水沢', widthKm: .009, catchmentKm2: 2.2, flowClass: 'spring-fed',
    points: [
      { eastKm: -.8, northKm: -.8 }, { eastKm: -1.25, northKm: -.62 },
      { eastKm: -1.75, northKm: -.45 }, { eastKm: -2.25, northKm: -.38 },
    ],
  },
  {
    id: 'kotoba-river', name: '南西谷川', widthKm: .026, catchmentKm2: 23.5, flowClass: 'perennial',
    points: [
      { eastKm: -.9, northKm: -.05 }, { eastKm: -1.55, northKm: -.22 },
      { eastKm: -2.25, northKm: -.38 }, { eastKm: -3.0, northKm: -.55 }, { eastKm: -3.75, northKm: -.78 },
      { eastKm: -4.45, northKm: -1.05 }, { eastKm: -5.05, northKm: -1.35 }, { eastKm: -5.55, northKm: -1.7 },
      { eastKm: -5.95, northKm: -2.05 },
    ],
  },
] as const

export const ISLAND_WATER_BODIES: readonly IslandWaterBody[] = [
  { id: 'spring-eye', kind: 'spring-pool', eastKm: -.8, northKm: -.8, radiusKm: .075 },
  { id: 'spring-lower-pool', kind: 'spring-pool', eastKm: -1.52, northKm: -.52, radiusKm: .048 },
  { id: 'rain-marsh-a', kind: 'rain-marsh', eastKm: 2.58, northKm: 5.34, radiusKm: .11 },
  { id: 'rain-marsh-b', kind: 'rain-marsh', eastKm: 2.42, northKm: 5.18, radiusKm: .065 },
  { id: 'rain-marsh-c', kind: 'rain-marsh', eastKm: 2.78, northKm: 5.12, radiusKm: .052 },
  { id: 'estuary-backwater', kind: 'rain-marsh', eastKm: -5.72, northKm: -1.52, radiusKm: .09 },
  { id: 'west-platform-pool-a', kind: 'tide-pool', eastKm: -7.15, northKm: 2.48, radiusKm: .052 },
  { id: 'west-platform-pool-b', kind: 'tide-pool', eastKm: -7.02, northKm: 2.3, radiusKm: .036 },
  { id: 'west-platform-pool-c', kind: 'tide-pool', eastKm: -6.88, northKm: 2.61, radiusKm: .028 },
] as const

export type WaterwayDistanceSample = { waterway: IslandWaterway; distanceKm: number; downstream01: number }

export function sampleWaterwayDistancesKm(eastKm: number, northKm: number): readonly WaterwayDistanceSample[] {
  const samples: WaterwayDistanceSample[] = []
  for (const waterway of ISLAND_WATERWAYS) {
    let best: WaterwayDistanceSample | undefined
    for (let index = 0; index < waterway.points.length - 1; index += 1) {
      const a = waterway.points[index]
      const b = waterway.points[index + 1]
      const dx = b.eastKm - a.eastKm
      const dn = b.northKm - a.northKm
      const lengthSquared = dx * dx + dn * dn
      const t = Math.max(0, Math.min(1, ((eastKm - a.eastKm) * dx + (northKm - a.northKm) * dn) / lengthSquared))
      const distanceKm = Math.hypot(eastKm - (a.eastKm + dx * t), northKm - (a.northKm + dn * t))
      if (!best || distanceKm < best.distanceKm) best = {
        waterway,
        distanceKm,
        downstream01: (index + t) / (waterway.points.length - 1),
      }
    }
    samples.push(best!)
  }
  return samples
}

export function nearestWaterwayDistanceKm(eastKm: number, northKm: number) {
  return sampleWaterwayDistancesKm(eastKm, northKm)
    .reduce((best, sample) => sample.distanceKm < best.distanceKm ? sample : best)
}
