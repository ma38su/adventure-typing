import { describe, expect, it } from 'vitest'
import { adaptQuestions, addDailyActivity, getGoalProgress, localDateKey } from './learningProgress'
import type { Question } from './questions'

const question = (id: string, romaji: string): Question => ({ id, stage: 1, sentence: id, reading: id, ruby: [id], romaji, focus: '', meaning: '' })

describe('learning progress', () => {
  it('collects daily totals and calculates a streak with today grace', () => {
    const today = new Date(2026, 7, 9)
    const yesterday = new Date(2026, 7, 8)
    let activity = addDailyActivity({}, { completedProblems: 2, correctKeys: 10, mistakes: 1, practiceMs: 1000, earnedPoints: 20 }, yesterday)
    activity = addDailyActivity(activity, { completedProblems: 1, correctKeys: 5, mistakes: 0, practiceMs: 500, earnedPoints: 10 }, yesterday)
    expect(activity[localDateKey(yesterday)].completedProblems).toBe(3)
    expect(getGoalProgress(activity, { dailyProblems: 5, weeklyProblems: 25 }, today).streak).toBe(1)
  })

  it('raises weak-key questions without dropping regular questions', () => {
    const source = [question('a', 'mori'), question('b', 'zaza'), question('c', 'umi'), question('d', 'kawa')]
    const result = adaptQuestions(source, { '1:z': { attempts: 4, misses: 3, wrongKeys: {} } }, 1)
    expect(result.map((item) => item.id).sort()).toEqual(source.map((item) => item.id).sort())
    expect(result[3].id).toBe('b')
  })
})
