import { describe, expect, it } from 'vitest'
import type { Grade } from '../questions'
import { selectCourseQuestions, type SelectableQuestion } from './selectCourseQuestions'

const question = (id: string, recommendedGrade: Grade | undefined, difficultyLevel = 1): SelectableQuestion => ({
  id, stage: 1, section: 1, sentence: id, reading: id, ruby: [id], romaji: id,
  focus: '', meaning: '', recommendedGrade, difficultyLevel,
})

describe('selectCourseQuestions', () => {
  it('is deterministic for one visit and can vary on a later visit', () => {
    const candidates = Array.from({ length: 20 }, (_, index) => question(`q${index}`, 1))
    const options = { profileGrade: 1 as Grade, difficultyCeiling: 3, count: 8, seed: 'user:stage-1:course-1:visit-1' }
    const first = selectCourseQuestions(candidates, options).questions.map(({ id }) => id)
    expect(selectCourseQuestions(candidates, options).questions.map(({ id }) => id)).toEqual(first)
    expect(selectCourseQuestions(candidates, { ...options, seed: 'user:stage-1:course-1:visit-2' }).questions.map(({ id }) => id)).not.toEqual(first)
  })

  it('selects 70 percent preferred questions without exceeding difficulty', () => {
    const preferred = Array.from({ length: 10 }, (_, index) => question(`p${index}`, 2))
    const mixed = Array.from({ length: 10 }, (_, index) => question(`m${index}`, index % 2 ? 1 : 3))
    const result = selectCourseQuestions([...preferred, ...mixed, question('hard', 2, 9)], { profileGrade: 2, difficultyCeiling: 3, count: 10, seed: 'ratio' })
    expect(result.questions).toHaveLength(10)
    expect(result.preferredCount).toBe(7)
    expect(result.questions.some(({ id }) => id === 'hard')).toBe(false)
  })

  it('fills from either pool when the target ratio is unavailable', () => {
    const result = selectCourseQuestions([
      question('preferred', 4), question('other-1', 1), question('other-2', 2), question('other-3', undefined),
    ], { profileGrade: 4, difficultyCeiling: 2, count: 4, seed: 'fallback' })
    expect(result.questions).toHaveLength(4)
    expect(result.preferredCount).toBe(1)
  })

  it('does not duplicate IDs or promote missing difficulty metadata', () => {
    const duplicate = question('same', 1)
    const missingDifficulty = { ...question('unknown', 1), difficultyLevel: undefined }
    const result = selectCourseQuestions([duplicate, { ...duplicate }, missingDifficulty], { profileGrade: 1, difficultyCeiling: 5, count: 5, seed: 'dedupe' })
    expect(result.questions.map(({ id }) => id)).toEqual(['same'])
    expect(result.eligibleCount).toBe(1)
  })
})
