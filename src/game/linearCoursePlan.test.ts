import { describe, expect, it } from 'vitest'
import { linearCoursePlanForStage, targetQuestionCountForStage } from './linearCoursePlan'

describe('linear course plan', () => {
  it('matches the Stage 1–12 route spline production totals', () => {
    expect(Array.from({ length: 12 }, (_, index) => targetQuestionCountForStage((index + 1) as Parameters<typeof targetQuestionCountForStage>[0])))
      .toEqual([52, 39, 56, 28, 24, 53, 49, 39, 57, 28, 24, 24])
    expect(Array.from({ length: 12 }, (_, index) => linearCoursePlanForStage((index + 1) as Parameters<typeof linearCoursePlanForStage>[0]).questionCounts.length))
      .toEqual([7, 5, 7, 4, 3, 7, 7, 5, 8, 4, 3, 3])
  })

  it('keeps every course within the six-to-nine question rest interval', () => {
    for (let stage = 1; stage <= 12; stage += 1) {
      expect(linearCoursePlanForStage(stage as Parameters<typeof linearCoursePlanForStage>[0]).questionCounts.every((count) => count >= 6 && count <= 9)).toBe(true)
    }
  })
})
