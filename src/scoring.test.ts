import { describe, expect, it } from 'vitest'
import { calculateQuestionScore } from './scoring'

describe('calculateQuestionScore', () => {
  it('rewards accurate and fast typing', () => {
    const score = calculateQuestionScore(20, 0, 20, 12000, 80)
    expect(score.accuracy).toBe(100)
    expect(score.kpm).toBe(100)
    expect(score.total).toBe(120)
  })

  it('caps the speed bonus and lowers accuracy points for misses', () => {
    const score = calculateQuestionScore(8, 2, 10, 100, 50)
    expect(score.accuracy).toBe(80)
    expect(score.speedPoints).toBe(24)
    expect(score.accuracyPoints).toBe(45)
    expect(score.total).toBe(69)
  })
})
