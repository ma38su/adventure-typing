import { describe, expect, it } from 'vitest'
import { gameRunReducer, initialGameRunState } from './gameRunReducer'

describe('gameRunReducer', () => {
  it('applies functional high-frequency updates without losing queued steps', () => {
    const once = gameRunReducer(initialGameRunState, { type: 'set', key: 'stepQueue', value: (value) => (value as number) + 1 })
    const twice = gameRunReducer(once, { type: 'set', key: 'stepQueue', value: (value) => (value as number) + 1 })
    expect(twice.stepQueue).toBe(2)
  })

  it('resets all transient run data for a new course', () => {
    const dirty = { ...initialGameRunState, typed: 'shi', combo: 12, completed: true, courseScore: 9000 }
    expect(gameRunReducer(dirty, { type: 'reset', trailTreasure: null })).toEqual(initialGameRunState)
  })

  it('advances while preserving accumulated course results', () => {
    const state = { ...initialGameRunState, questionIndex: 2, typed: 'kaze', courseScore: 800, runBonus: 120, mistakes: [{ questionId: 'q', sentence: '風', expected: 'a', actual: 's' }] }
    const next = gameRunReducer(state, { type: 'advance-question', questionIndex: 3 })
    expect(next).toMatchObject({ questionIndex: 3, typed: '', courseScore: 800, runBonus: 120 })
    expect(next.mistakes).toHaveLength(1)
  })
})
