import { describe, expect, it } from 'vitest'
import { isCourseUnlocked } from './courseConfig'

describe('course unlock progression', () => {
  it('starts with only course 1 unlocked', () => {
    expect(isCourseUnlocked(3, 1, [])).toBe(true)
    expect(isCourseUnlocked(3, 2, [])).toBe(false)
  })

  it('unlocks only the course immediately after a cleared course', () => {
    const completed = ['3-1', '3-2']
    expect(isCourseUnlocked(3, 2, completed)).toBe(true)
    expect(isCourseUnlocked(3, 3, completed)).toBe(true)
    expect(isCourseUnlocked(3, 4, completed)).toBe(false)
  })

  it('keeps progression separate for each grade', () => {
    expect(isCourseUnlocked(4, 2, ['3-1'])).toBe(false)
  })

  it('does not allow gaps in saved progress to skip a course', () => {
    expect(isCourseUnlocked(3, 3, ['3-2'])).toBe(false)
  })
})
