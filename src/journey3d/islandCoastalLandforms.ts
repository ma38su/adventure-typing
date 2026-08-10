export type CoastalRockFeature = {
  id: string
  kind: 'wave-cut-platform' | 'reef-rock' | 'sea-stack' | 'islet'
  eastKm: number
  northKm: number
  radiusKm: number
  heightKm: number
  rotationRad: number
}

/**
 * Erosional coastal features of the old basalt island.
 * High-energy west/northwest shores own the broad wave-cut platform, reefs and
 * stacks. Sheltered southwest water keeps the estuary and pocket beach instead.
 */
export const ISLAND_COASTAL_ROCK_FEATURES: readonly CoastalRockFeature[] = [
  { id: 'west-senjojiki', kind: 'wave-cut-platform', eastKm: -7.05, northKm: 2.55, radiusKm: .62, heightKm: .012, rotationRad: -.18 },
  { id: 'west-reef-1', kind: 'reef-rock', eastKm: -7.62, northKm: 2.92, radiusKm: .15, heightKm: .045, rotationRad: .2 },
  { id: 'west-reef-2', kind: 'reef-rock', eastKm: -7.75, northKm: 2.45, radiusKm: .11, heightKm: .032, rotationRad: -.4 },
  { id: 'west-stack-1', kind: 'sea-stack', eastKm: -7.88, northKm: 3.35, radiusKm: .12, heightKm: .28, rotationRad: .08 },
  { id: 'west-stack-2', kind: 'sea-stack', eastKm: -8.02, northKm: 2.02, radiusKm: .085, heightKm: .19, rotationRad: -.12 },
  { id: 'north-islet', kind: 'islet', eastKm: -.65, northKm: 8.42, radiusKm: .34, heightKm: .16, rotationRad: .35 },
  { id: 'northeast-islet', kind: 'islet', eastKm: 5.72, northKm: 7.05, radiusKm: .23, heightKm: .11, rotationRad: -.2 },
  { id: 'south-reef-1', kind: 'reef-rock', eastKm: 2.95, northKm: -7.28, radiusKm: .13, heightKm: .025, rotationRad: .15 },
  { id: 'south-reef-2', kind: 'reef-rock', eastKm: 3.34, northKm: -7.12, radiusKm: .09, heightKm: .018, rotationRad: -.3 },
] as const
