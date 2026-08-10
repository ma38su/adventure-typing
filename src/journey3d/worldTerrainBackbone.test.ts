import { describe, expect, it } from 'vitest'
import { getStageBackbone, WORLD_ROUTE_REGISTRY } from './worldTerrainBackbone'

describe('continuous world terrain backbone', () => {
  it('registers all 36 stages and 216 canonical anchors', () => {
    expect(WORLD_ROUTE_REGISTRY).toHaveLength(36)
    expect(WORLD_ROUTE_REGISTRY.reduce((sum, stage) => sum + stage.anchors.length, 0)).toBe(216)
  })

  it('uses one exact ENU boundary for Stage 1 and Stage 2', () => {
    const end = getStageBackbone(1).anchors.at(-1)!
    const start = getStageBackbone(2).anchors[0]
    expect(start.chunkId).toBe(end.chunkId)
    expect(start.enu).toEqual(end.enu)
  })

  it('keeps every adjacent stage boundary continuous', () => {
    for (let stage = 1; stage < 36; stage += 1) {
      expect(getStageBackbone(stage).anchors.at(-1)!.enu).toEqual(getStageBackbone(stage + 1).anchors[0].enu)
    }
  })
})
