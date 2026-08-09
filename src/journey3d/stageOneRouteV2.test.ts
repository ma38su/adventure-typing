import { describe, expect, it } from 'vitest'
import { STAGE_ONE_CHUNK_LOCAL_ROUTE, STAGE_ONE_ROUTE_V2_ANCHORS } from './stageOneRouteV2'

describe('Stage 1 route v2 src adapter', () => {
  it('preserves the six world-map anchors in source order', () => {
    expect(STAGE_ONE_ROUTE_V2_ANCHORS.map(({ anchorId, progress }) => [anchorId, progress])).toEqual([
      ['stage-1-anchor-1', 0], ['stage-1-anchor-2', 0.2], ['stage-1-anchor-3', 0.4],
      ['stage-1-anchor-4', 0.6], ['stage-1-anchor-5', 0.8], ['stage-1-anchor-6', 1],
    ])
    expect(STAGE_ONE_ROUTE_V2_ANCHORS.map(({ microLandform }) => microLandform)).toEqual(['溶岩原の緩丘', '浅い涸れ沢', '河岸段丘', '季節湿地', '防風林縁', '小川氾濫原'])
    expect(STAGE_ONE_ROUTE_V2_ANCHORS.at(-1)?.chunkId).toBe('bnd-meadow-forest-a')
  })

  it('projects world kilometres into a bounded chunk-local corridor', () => {
    expect(STAGE_ONE_CHUNK_LOCAL_ROUTE[0].sceneX).toBeCloseTo(0, 8)
    expect(STAGE_ONE_CHUNK_LOCAL_ROUTE[0]).toMatchObject({ sceneZ: 10, elevationMeters: 0 })
    expect(STAGE_ONE_CHUNK_LOCAL_ROUTE.at(-1)?.sceneX).toBeCloseTo(0, 8)
    expect(STAGE_ONE_CHUNK_LOCAL_ROUTE.at(-1)?.sceneZ).toBeCloseTo(-142, 8)
    expect(Math.max(...STAGE_ONE_CHUNK_LOCAL_ROUTE.map(({ sceneX }) => Math.abs(sceneX)))).toBeLessThan(8)
    expect(STAGE_ONE_CHUNK_LOCAL_ROUTE.every((anchor, index, anchors) => index === 0 || anchor.alongKm > anchors[index - 1].alongKm)).toBe(true)
  })
})
