import { describe, expect, it } from 'vitest'
import { FINGER_KEYBOARD_ROWS, getFingerGuide, getNextKanaCourse, KANA_COURSES } from './kanaPractice'
import { buildRomajiCandidates } from './romajiVariants'

describe('kana practice courses', () => {
  it('progresses from finger placement to practical words', () => {
    expect(KANA_COURSES.slice(0, 6).map((course) => course.id)).toEqual(['home-position', 'index-fingers', 'outer-fingers', 'vowels', 'hand-alternation', 'words'])
    expect(KANA_COURSES.filter((course) => course.unlocksAdventure).map((course) => course.id)).toEqual(['home-position'])
    expect(KANA_COURSES.find((course) => course.id === 'numbers')?.optional).toBe(true)
    expect(KANA_COURSES.find((course) => course.id === 'symbols')?.optional).toBe(true)
  })

  it('has unique kana within each course and valid input candidates', () => {
    for (const course of KANA_COURSES) {
      expect(new Set(course.items.map((item) => item.kana)).size).toBe(course.items.length)
      for (const item of course.items) expect(buildRomajiCandidates(item.romaji, item.kana).length).toBeGreaterThan(0)
    }
  })

  it('maps keys to the standard touch-typing fingers', () => {
    expect(getFingerGuide('f')).toMatchObject({ hand: 'left', finger: '人差し指' })
    expect(getFingerGuide('j')).toMatchObject({ hand: 'right', finger: '人差し指' })
    expect(getFingerGuide('2')).toMatchObject({ hand: 'left', finger: '薬指' })
    expect(getFingerGuide('.')).toMatchObject({ hand: 'right', finger: '薬指' })
  })

  it('assigns every displayed keyboard key to a finger', () => {
    for (const key of FINGER_KEYBOARD_ROWS.join('')) expect(getFingerGuide(key), `${key} needs a finger`).toBeDefined()
    expect(getFingerGuide('f')).toMatchObject({ hand: 'left', finger: '人差し指' })
    expect(getFingerGuide('j')).toMatchObject({ hand: 'right', finger: '人差し指' })
    expect(getFingerGuide('0')).toMatchObject({ hand: 'right', finger: '小指' })
    expect(getFingerGuide('/')).toMatchObject({ hand: 'right', finger: '小指' })
  })

  it('continues directly to the next route and ends at the route list', () => {
    expect(getNextKanaCourse('home-position')?.id).toBe('index-fingers')
    expect(getNextKanaCourse('numbers')?.id).toBe('symbols')
    expect(getNextKanaCourse('symbols')).toBeUndefined()
    expect(getNextKanaCourse('unknown')).toBeUndefined()
  })
})
