import { describe, expect, it } from 'vitest'
import { rollCourseCreature, rollCourseTreasure } from './rewards'

describe('course rewards', () => {
  it('keeps rare treasures unique to grade and course', () => {
    const reward = rollCourseTreasure(4, 2, () => 0)
    expect(reward?.id).toBe('rare-t-4-2')
  })

  it('does not award a creature below its typing requirements', () => {
    expect(rollCourseCreature(1, 1, 40, 10, 80, () => 0)).toBeNull()
  })

  it('awards the course rare creature when requirements and roll pass', () => {
    expect(rollCourseCreature(3, 5, 100, 100, 80, () => 0)?.id).toBe('rare-f-3-5')
  })
})
