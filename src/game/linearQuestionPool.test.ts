import { describe, expect, it } from 'vitest'
import { buildLinearStageQuestions, difficultyCeilingForStage } from './linearQuestionPool'

describe('linear question pool', () => {
  it('builds five fixed three-question courses without duplicate IDs', () => {
    const questions = buildLinearStageQuestions(18, 3, 'profile-a:visit-1')
    expect(questions).toHaveLength(15)
    expect(new Set(questions.map(({ id }) => id)).size).toBe(15)
    expect(questions.map(({ section }) => section)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5])
  })

  it('has enough eligible short questions for the first stage', () => {
    const questions = buildLinearStageQuestions(1, 1, 'new-player')
    expect(questions).toHaveLength(15)
    expect(questions.every(({ romaji }) => romaji.replaceAll(' ', '').length <= 12)).toBe(true)
  })

  it('keeps one visit deterministic and raises the ceiling gradually', () => {
    expect(buildLinearStageQuestions(10, 2, 'same').map(({ id }) => id)).toEqual(buildLinearStageQuestions(10, 2, 'same').map(({ id }) => id))
    expect(difficultyCeilingForStage(1)).toBe(12)
    expect(difficultyCeilingForStage(36)).toBe(56)
  })
})
