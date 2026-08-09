import { describe, expect, it } from 'vitest'
import { KANA_COURSES } from './kanaPractice'
import { buildRomajiCandidates } from './romajiVariants'

describe('kana practice courses', () => {
  it('progresses from basic sounds to voiced and contracted sounds', () => {
    expect(KANA_COURSES.map((course) => course.id)).toEqual(['basic-1', 'basic-2', 'voiced', 'contracted'])
    expect(KANA_COURSES[2].items.some((item) => item.kana === 'ぱ')).toBe(true)
    expect(KANA_COURSES[3].items.some((item) => item.kana === 'きゃ')).toBe(true)
  })

  it('has unique kana within each course and valid input candidates', () => {
    for (const course of KANA_COURSES) {
      expect(new Set(course.items.map((item) => item.kana)).size).toBe(course.items.length)
      for (const item of course.items) expect(buildRomajiCandidates(item.romaji, item.kana).length).toBeGreaterThan(0)
    }
  })

  it('accepts keyboard aliases while retaining school Hepburn display', () => {
    const shi = KANA_COURSES[0].items.find((item) => item.kana === 'し')!
    expect(shi.romaji).toBe('shi')
    expect(buildRomajiCandidates(shi.romaji, shi.kana).map((candidate) => candidate.target)).toContain('si')
  })
})
