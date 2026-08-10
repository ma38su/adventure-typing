import { describe, expect, it } from 'vitest'
import { ISLAND_COASTAL_ROCK_FEATURES } from './islandCoastalLandforms'

describe('island coastal landforms', () => {
  it('keeps erosional platforms and stacks on exposed coasts', () => {
    expect(ISLAND_COASTAL_ROCK_FEATURES.some((feature) => feature.kind === 'wave-cut-platform')).toBe(true)
    expect(ISLAND_COASTAL_ROCK_FEATURES.filter((feature) => feature.kind === 'sea-stack')).toHaveLength(2)
    expect(ISLAND_COASTAL_ROCK_FEATURES.filter((feature) => feature.kind === 'islet').length).toBeGreaterThanOrEqual(2)
    expect(new Set(ISLAND_COASTAL_ROCK_FEATURES.map((feature) => feature.id)).size).toBe(ISLAND_COASTAL_ROCK_FEATURES.length)
  })
})
