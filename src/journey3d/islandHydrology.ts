export type IslandWaterway = {
  id: 'east-forest-stream' | 'rain-forest-stream' | 'spring-stream' | 'kotoba-river'
  name: string
  widthKm: number
  points: readonly { eastKm: number; northKm: number }[]
}

/** Surface-water centerlines used by every terrain LOD. */
export const ISLAND_WATERWAYS: readonly IslandWaterway[] = [
  {
    id: 'east-forest-stream', name: '東の森支流', widthKm: .035,
    points: [{ eastKm: 5.45, northKm: .7 }, { eastKm: 4.2, northKm: .85 }, { eastKm: 2.8, northKm: .9 }, { eastKm: 1.2, northKm: .7 }, { eastKm: -.1, northKm: .45 }],
  },
  {
    id: 'rain-forest-stream', name: '北東の雨森支流', widthKm: .028,
    points: [{ eastKm: 3.65, northKm: 4.55 }, { eastKm: 3.15, northKm: 3.45 }, { eastKm: 2.5, northKm: 2.35 }, { eastKm: 1.25, northKm: 1.3 }, { eastKm: -.1, northKm: .45 }],
  },
  {
    id: 'spring-stream', name: '中央湧水支流', widthKm: .032,
    points: [{ eastKm: -.9, northKm: -.65 }, { eastKm: -1.55, northKm: -.7 }, { eastKm: -2.35, northKm: -.55 }, { eastKm: -3.15, northKm: -.25 }],
  },
  {
    id: 'kotoba-river', name: 'ことば川', widthKm: .065,
    points: [{ eastKm: -.1, northKm: .45 }, { eastKm: -1.15, northKm: .15 }, { eastKm: -2.25, northKm: -.15 }, { eastKm: -3.15, northKm: -.25 }, { eastKm: -4.15, northKm: -.2 }, { eastKm: -5.25, northKm: -.3 }, { eastKm: -5.85, northKm: -.45 }, { eastKm: -6.2, northKm: -.72 }, { eastKm: -6.42, northKm: -1.02 }],
  },
] as const
