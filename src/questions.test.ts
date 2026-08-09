import { describe, expect, it } from 'vitest'
import { QUESTIONS, type Grade } from './questions'

describe('question data integrity', () => {
  it('has unique ids and every grade/course combination', () => {
    const ids = Object.values(QUESTIONS).flat().map((question) => question.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (let grade = 1; grade <= 6; grade += 1) {
      for (let course = 1; course <= 6; course += 1) {
        expect(QUESTIONS[grade as Grade].filter((question) => question.stage === course).length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps display phrases aligned with spaced romaji and excludes punctuation input', () => {
    for (const question of Object.values(QUESTIONS).flat()) {
      expect(question.ruby.length).toBe(question.romaji.split(' ').length)
      expect(question.romaji).toMatch(/^[a-z -]+$/)
      expect(question.sentence).not.toMatch(/[。、]/)
    }
  })
})
