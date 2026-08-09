import { describe, expect, it } from 'vitest'
import { getLinearStage, isLinearStageUnlocked, LINEAR_STAGES, linearStageId, toLegacyStage, toLinearStageNumber } from './linearStageConfig'

describe('linear stage configuration', () => {
  it('flattens all six chapters into one ordered 36-stage story', () => {
    expect(LINEAR_STAGES).toHaveLength(36)
    expect(LINEAR_STAGES.map((stage) => stage.number)).toEqual(Array.from({ length: 36 }, (_, index) => index + 1))
    expect(new Set(LINEAR_STAGES.map((stage) => stage.legacyId)).size).toBe(36)
  })

  it('maps old grade-course coordinates without changing story order', () => {
    expect(toLinearStageNumber(1, 1)).toBe(1)
    expect(toLinearStageNumber(2, 1)).toBe(7)
    expect(toLinearStageNumber(6, 6)).toBe(36)
    expect(toLegacyStage(7)).toEqual({ grade: 2, course: 1 })
    expect(getLinearStage(36).title).toBe('天空の王冠')
  })

  it('unlocks only the first stage and the stage after a completion', () => {
    expect(isLinearStageUnlocked(1, [])).toBe(true)
    expect(isLinearStageUnlocked(2, [])).toBe(false)
    expect(isLinearStageUnlocked(2, [linearStageId(1)])).toBe(true)
    expect(isLinearStageUnlocked(8, [linearStageId(6)])).toBe(false)
    expect(isLinearStageUnlocked(8, [linearStageId(7)])).toBe(true)
  })
})
