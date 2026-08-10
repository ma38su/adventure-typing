import { sampleIslandSurface } from './islandTerrainSurface'
import { WORLD_PROJECTION } from './worldTerrainBackbone'

export type IslandTourStop = {
  id: string
  name: string
  description: string
  eastKm: number
  northKm: number
  color: number
}

const KM_PER_DEGREE = 111.195
const longitudeKm = KM_PER_DEGREE * Math.cos(WORLD_PROJECTION.origin[0] * Math.PI / 180)

export const enuToGeographic = (eastKm: number, northKm: number) => ({
  latitudeDeg: WORLD_PROJECTION.origin[0] + northKm / KM_PER_DEGREE,
  longitudeDeg: WORLD_PROJECTION.origin[1] + eastKm / longitudeKm,
})

/**
 * A story-independent ground tour of the island's characteristic landforms.
 * The route is closed; the final segment returns to the southeast meadow.
 */
export const ISLAND_GRAND_TOUR_STOPS: readonly IslandTourStop[] = [
  { id: 'meadow', name: '南東の花草原', description: '海風を受ける明るい溶岩原の緩丘', eastKm: 4.9, northKm: -3.4, color: 0xffd96a },
  { id: 'east-forest', name: '東の木漏れ日林', description: '小川沿いに常緑樹が重なる低地林', eastKm: 5.6, northKm: 0.8, color: 0x78c86b },
  { id: 'wet-forest', name: '北東の雨の森', description: '海風と地形性降雨で育つ湿潤な森', eastKm: 3.7, northKm: 4.8, color: 0x48a978 },
  { id: 'caldera', name: '北西カルデラ縁', description: '島の成り立ちが見える高い岩稜', eastKm: -1.4, northKm: 6.6, color: 0x8da19a },
  { id: 'west-ridge', name: '西の風見尾根', description: '雨陰の草地と玄武岩が交互に現れる尾根', eastKm: -5.2, northKm: 3.3, color: 0xb5b66a },
  { id: 'estuary', name: '南西の河口湿地', description: '三つの支流が出会う葦と干潟の水辺', eastKm: -6.0, northKm: -0.2, color: 0x6ba795 },
  { id: 'beach', name: '岬裏のポケット浜', description: '玄武岩の岬に守られた歩ける白砂の小浜', eastKm: -4.7, northKm: -3.7, color: 0xf2d58a },
  { id: 'root-spring', name: '根泉の谷', description: '地下水が湧き、古い根の痕跡が現れる谷', eastKm: -1.4, northKm: -1.0, color: 0x5d9e72 },
  { id: 'ancient-edge', name: '古代樹の外縁', description: '本体へ入らず巨大な樹冠と根元を仰ぐ場所', eastKm: 0.2, northKm: 0.9, color: 0x3f7c58 },
  { id: 'south-coast', name: '南岸の花壇集落', description: '湧水路と海辺の暮らしがつながる休憩地', eastKm: 2.5, northKm: -5.5, color: 0xffa878 },
] as const

export const sampleTourStop = (stop: IslandTourStop) => {
  const geographic = enuToGeographic(stop.eastKm, stop.northKm)
  return { ...stop, ...geographic, surface: sampleIslandSurface(geographic.latitudeDeg, geographic.longitudeDeg) }
}

