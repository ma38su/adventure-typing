import { describe, expect, it } from 'vitest'
import { buildLinearStageQuestionRun, buildLinearStageQuestions, difficultyCeilingForStage } from './linearQuestionPool'
import { STAGE_1_QUESTION_BANK } from './stage1QuestionBank'

describe('linear question pool', () => {
  it('builds the complete Stage 1 spline pilot as seven variable courses', () => {
    const questions = buildLinearStageQuestions(1, 1, 'new-player')
    expect(questions).toHaveLength(52)
    expect(new Set(questions.map(({ id }) => id)).size).toBe(52)
    expect(Array.from({ length: 7 }, (_, index) => questions.filter(({ section }) => section === index + 1).length))
      .toEqual([7, 7, 7, 7, 8, 8, 8])
    expect(questions.every(({ romaji }) => romaji.replaceAll(' ', '').length <= 12)).toBe(true)
  })

  it('never fills an unfinished story stage with questions from another episode', () => {
    const run = buildLinearStageQuestionRun(2, 1, 'profile-a:visit-1')
    expect(run.targetCount).toBe(39)
    expect(run.complete).toBe(false)
    expect(run.questions.every(({ id }) => id.startsWith('1-s05') || id.startsWith('1-s06') || id.startsWith('1-s07') || id.startsWith('1-s08') || id.startsWith('1-001') || id.startsWith('1-002') || id.startsWith('1-x03') || id.startsWith('1-x04'))).toBe(true)
  })

  it('keeps ten audited sources plus 42 new Stage 1 questions with ruby and metadata', () => {
    expect(STAGE_1_QUESTION_BANK.filter(({ sourceId }) => sourceId).length).toBe(10)
    expect(STAGE_1_QUESTION_BANK.filter(({ sourceId }) => !sourceId).length).toBe(42)
    for (const question of STAGE_1_QUESTION_BANK) {
      expect(question.storyStage).toBe(1)
      expect(question.recommendedGrade).toBeGreaterThanOrEqual(1)
      expect(question.recommendedGrade).toBeLessThanOrEqual(6)
      expect(question.difficultyLevel).toBe(question.romaji.replaceAll(' ', '').length)
      if (/[一-鿿]/u.test(question.sentence)) expect(question.ruby.join('')).toContain('[')
    }
  })

  it('keeps one visit deterministic and raises the ceiling gradually', () => {
    expect(buildLinearStageQuestions(10, 2, 'same').map(({ id }) => id)).toEqual(buildLinearStageQuestions(10, 2, 'same').map(({ id }) => id))
    expect(difficultyCeilingForStage(1)).toBe(12)
    expect(difficultyCeilingForStage(36)).toBe(56)
  })

  it('keeps every unfinished stage non-crashing without crossing story episodes', () => {
    for (let stage = 2; stage <= 36; stage += 1) {
      const run = buildLinearStageQuestionRun(stage as Parameters<typeof buildLinearStageQuestionRun>[0], 3, 'smoke')
      expect(run.availableCount).toBeGreaterThan(0)
      expect(run.questions.length, `stage ${stage}`).toBeGreaterThan(0)
    }
  })
})
