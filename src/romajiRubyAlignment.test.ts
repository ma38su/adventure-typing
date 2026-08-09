import { describe, expect, it } from 'vitest'
import { buildRomajiCandidates } from './romajiVariants'
import { alignRomajiRuby } from './romajiRubyAlignment'
import { QUESTIONS } from './questions'

function progress(canonical: string, reading: string, target: string) {
  const candidate = buildRomajiCandidates(canonical.replaceAll(' ', ''), reading).find((item) => item.target.startsWith(target))
  if (!candidate) throw new Error(`candidate ${target} not found`)
  return candidate.displayProgress.slice(0, target.length + 1)
}

const groups = (result: ReturnType<typeof alignRomajiRuby>) => {
  if (!result.aligned) throw new Error(result.reason)
  return result.groups
}

describe('romaji ruby alignment', () => {
  it('aligns every question in the current course data', () => {
    const failures = Object.values(QUESTIONS).flat().flatMap((question) => {
      const result = alignRomajiRuby(question.reading, question.romaji)
      return result.aligned ? [] : [`${question.id}: ${result.reason}`]
    })
    expect(failures).toEqual([])
  })

  it('aligns each mora and word boundary', () => {
    expect(groups(alignRomajiRuby('やまへ いく', 'yamahe iku')).map(({ kana, canonical, separatorBefore }) => [kana, canonical, separatorBefore])).toEqual([
      ['や', 'ya', false], ['ま', 'ma', false], ['へ', 'he', false], ['い', 'i', true], ['く', 'ku', false],
    ])
  })

  it.each([
    ['し', 'shi', 'si', 'si'],
    ['ち', 'chi', 'ti', 'ti'],
    ['つ', 'tsu', 'tu', 'tu'],
  ])('keeps the kana for an alternative spelling of %s', (reading, canonical, target, displayed) => {
    const result = groups(alignRomajiRuby(reading, canonical, target, progress(canonical, reading, target)))
    expect(result[0]).toMatchObject({ kana: reading, typed: displayed, remnant: '', displayed, state: 'complete' })
  })

  it('aligns contracted sounds as a single mora group', () => {
    expect(groups(alignRomajiRuby('きょう', 'kyou')).map(({ kana, canonical }) => [kana, canonical])).toEqual([
      ['きょ', 'kyo'], ['う', 'u'],
    ])
  })

  it('aligns sokuon, syllabic n, and a partial alternative spelling', () => {
    const canonical = 'gakkoude shashin'
    const reading = 'がっこうで しゃしん'
    const typed = 'gakkoudesyas'
    const result = groups(alignRomajiRuby(reading, canonical, typed, progress(canonical, reading, typed)))
    expect(result.map(({ kana, canonical: standard }) => [kana, standard])).toContainEqual(['っ', 'k'])
    expect(result.at(-1)).toMatchObject({ kana: 'ん', canonical: 'n' })
    expect(result.find(({ kana }) => kana === 'しゃ')).toMatchObject({ typed: 'sya', remnant: '', displayed: 'sya' })
    expect(result.filter(({ state }) => state === 'current')).toHaveLength(1)
  })

  it('keeps punctuation as an annotation without consuming romaji', () => {
    const result = groups(alignRomajiRuby('やま、うみ。', 'yama umi'))
    expect(result.filter(({ state }) => state === 'annotation').map(({ kana }) => kana)).toEqual(['、', '。'])
  })

  it('aligns a long sound mark when canonical repeats the previous vowel', () => {
    expect(groups(alignRomajiRuby('こーす', 'koosu')).map(({ kana, canonical }) => [kana, canonical])).toEqual([
      ['こ', 'ko'], ['ー', 'o'], ['す', 'su'],
    ])
  })

  it('returns a safe failure instead of guessing an unaligned reading', () => {
    expect(alignRomajiRuby('し', 'sa')).toEqual({ aligned: false, reason: '読みと標準ローマ字をモーラ単位で整列できません' })
  })
})
