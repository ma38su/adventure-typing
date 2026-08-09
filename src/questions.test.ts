import { describe, expect, it } from 'vitest'
import { QUESTIONS, type Grade } from './questions'

const compactLength = (value: string) => value.replaceAll(' ', '').length
const segments = (value: string) => value.split(' ').filter(Boolean)

describe('question data', () => {
  it('uses unique IDs and keeps each representation aligned by segment', () => {
    const questions = Object.values(QUESTIONS).flat()
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length)

    for (const question of questions) {
      expect(question.id).not.toBe('')
      expect(segments(question.reading)).toHaveLength(question.ruby.length)
      expect(segments(question.romaji)).toHaveLength(question.ruby.length)
      expect(question.romaji).toMatch(/^[a-z -]+$/)
      expect(question.sentence).not.toMatch(/[。、]/)
    }
    for (let grade = 1; grade <= 6; grade += 1) {
      for (let course = 1; course <= 6; course += 1) {
        expect(QUESTIONS[grade as Grade].filter((question) => question.stage === course).length).toBeGreaterThan(0)
      }
    }
  })

  it('gives first graders a gradual short-sentence introduction', () => {
    const stage1 = QUESTIONS[1].filter((question) => question.stage === 1)
    const stage2 = QUESTIONS[1].filter((question) => question.stage === 2)

    expect(stage1[0].id).toBe('1-s01')
    expect(compactLength(stage1[0].romaji)).toBeLessThanOrEqual(6)
    for (const question of stage1.slice(0, 4)) {
      expect(compactLength(question.romaji)).toBeLessThanOrEqual(12)
      expect(segments(question.romaji).length).toBeLessThanOrEqual(2)
    }

    expect(stage2.slice(0, 4).map((question) => question.id)).toEqual(['1-s05', '1-s06', '1-s07', '1-s08'])
    for (const question of stage2.slice(0, 4)) {
      expect(compactLength(question.romaji)).toBeLessThanOrEqual(18)
      expect(segments(question.romaji).length).toBeLessThanOrEqual(3)
    }
    expect(stage2[4].id).toBe('1-001')
  })
})
