import { describe, expect, it } from 'vitest'
import { buildLinearStageQuestionRun, buildLinearStageQuestions, difficultyCeilingForStage } from './linearQuestionPool'
import { STAGE_1_QUESTION_BANK } from './stage1QuestionBank'
import { STAGE_2_QUESTION_BANK } from './stage2QuestionBank'

describe('linear question pool', () => {
  it('builds the complete Stage 1 spline pilot as seven variable courses', () => {
    const questions = buildLinearStageQuestions(1, 1, 'new-player')
    expect(questions).toHaveLength(52)
    expect(new Set(questions.map(({ id }) => id)).size).toBe(52)
    expect(Array.from({ length: 7 }, (_, index) => questions.filter(({ section }) => section === index + 1).length))
      .toEqual([7, 7, 7, 7, 8, 8, 8])
    expect(questions.every(({ romaji }) => romaji.replaceAll(' ', '').length <= 12)).toBe(true)
  })

  it('builds the complete Stage 2 bank without borrowing from another episode', () => {
    const run = buildLinearStageQuestionRun(2, 1, 'profile-a:visit-1')
    expect(run.targetCount).toBe(39)
    expect(run.complete).toBe(true)
    expect(run.usedDifficultyFallback).toBe(false)
    expect(run.questions).toHaveLength(39)
    expect(Array.from({ length: 5 }, (_, index) => run.questions.filter(({ section }) => section === index + 1).length))
      .toEqual([7, 8, 8, 8, 8])
    expect(run.questions.every((question) => (question as { storyStage?: number }).storyStage === 2)).toBe(true)
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

  it('keeps seven human-audited sources plus 32 new Stage 2 questions with ruby and metadata', () => {
    expect(STAGE_2_QUESTION_BANK.filter(({ sourceId }) => sourceId).length).toBe(7)
    expect(STAGE_2_QUESTION_BANK.filter(({ sourceId }) => !sourceId).length).toBe(32)
    for (const question of STAGE_2_QUESTION_BANK) {
      expect(question.storyStage).toBe(2)
      expect(question.difficultyLevel).toBe(question.romaji.replaceAll(' ', '').length)
      expect(question.difficultyLevel).toBeLessThanOrEqual(13)
      if (/[一-鿿]/u.test(question.sentence)) expect(question.ruby.join('')).toContain('[')
    }
    const courseCeilings = [8, 9, 10, 12, 13]
    courseCeilings.forEach((ceiling, index) => {
      expect(STAGE_2_QUESTION_BANK.filter(({ section }) => section === index + 1).every(({ difficultyLevel }) => difficultyLevel <= ceiling)).toBe(true)
    })
    const terraceQuestions = STAGE_2_QUESTION_BANK.filter(({ section }) => section === 3)
    expect(terraceQuestions.every(({ anchorId }) => anchorId === 'terrace-turn')).toBe(true)
    expect(terraceQuestions.every(({ sentence, meaning }) => !/(羽根印|道標|進路)/u.test(`${sentence}${meaning}`))).toBe(true)
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
