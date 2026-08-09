import { ROMAJI_BY_KANA } from './romajiVariants'

export type RomajiRubyGroup = {
  kana: string
  canonical: string
  canonicalStart: number
  canonicalEnd: number
  separatorBefore: boolean
  typed: string
  remnant: string
  displayed: string
  state: 'complete' | 'current' | 'remaining' | 'annotation'
}

export type RomajiRubyAlignment =
  | { aligned: true; groups: RomajiRubyGroup[] }
  | { aligned: false; reason: string }

type Mora = { kana: string; separatorBefore: boolean; annotation: boolean }

const SMALL_KANA = new Set(['ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゎ'])
const PUNCTUATION = new Set(['。', '、', '！', '？', '・'])

function splitMoras(reading: string): Mora[] {
  const moras: Mora[] = []
  let separatorBefore = false
  for (const character of reading) {
    if (/\s/.test(character)) {
      separatorBefore = true
      continue
    }
    if (SMALL_KANA.has(character) && moras.length && !moras.at(-1)?.annotation) {
      moras[ moras.length - 1 ].kana += character
      continue
    }
    moras.push({ kana: character, separatorBefore, annotation: PUNCTUATION.has(character) })
    separatorBefore = false
  }
  return moras
}

function expectedCanonicals(moras: Mora[], index: number, previousCanonical: string): string[] {
  const mora = moras[index].kana
  if (mora === 'ん') return ['n', 'nn']
  if (mora === 'っ') {
    const next = ROMAJI_BY_KANA[moras[index + 1]?.kana]
    return next?.[0] ? [next[0]] : []
  }
  if (mora === 'ー') {
    const vowel = [...previousCanonical].reverse().find((character) => 'aeiou'.includes(character))
    return vowel ? [vowel, '-'] : ['-']
  }
  const standard = ROMAJI_BY_KANA[mora]
  if (!standard) return []
  if (mora === 'は') return [standard, 'wa']
  if (mora === 'へ') return [standard, 'e']
  if (mora === 'を') return [standard, 'o']
  return [standard]
}

function alignCanonicalRanges(moras: Mora[], canonical: string) {
  const visit = (
    moraIndex: number,
    position: number,
    previousCanonical: string,
    ranges: Array<{ start: number; end: number; canonical: string }>,
  ): Array<{ start: number; end: number; canonical: string }> | undefined => {
    if (moraIndex === moras.length) return position === canonical.length ? ranges : undefined
    if (moras[moraIndex].annotation) {
      return visit(moraIndex + 1, position, previousCanonical, [...ranges, { start: position, end: position, canonical: '' }])
    }
    for (const expected of expectedCanonicals(moras, moraIndex, previousCanonical)) {
      if (!canonical.startsWith(expected, position)) continue
      const result = visit(moraIndex + 1, position + expected.length, expected, [
        ...ranges,
        { start: position, end: position + expected.length, canonical: expected },
      ])
      if (result) return result
    }
    return undefined
  }
  return visit(0, 0, '', [])
}

/**
 * かなをモーラ単位で標準ローマ字の範囲へ揃え、実入力を対応するrb側へ割り当てます。
 * 整列を証明できないデータは aligned:false とし、呼び出し側が既存表示へ戻せるようにします。
 */
export function alignRomajiRuby(
  reading: string,
  spacedCanonical: string,
  typed = '',
  inputDisplayProgress: number[] = [0],
): RomajiRubyAlignment {
  const canonical = spacedCanonical.replaceAll(' ', '')
  const moras = splitMoras(reading)
  const ranges = alignCanonicalRanges(moras, canonical)
  if (!ranges) return { aligned: false, reason: '読みと標準ローマ字をモーラ単位で整列できません' }
  const displayProgress = inputDisplayProgress[typed.length] ?? 0
  if (displayProgress < 0 || displayProgress > canonical.length) return { aligned: false, reason: '入力進捗が範囲外です' }

  const groups = moras.map((mora, groupIndex): RomajiRubyGroup => {
    const range = ranges[groupIndex]
    if (mora.annotation) return {
      kana: mora.kana, canonical: '', canonicalStart: range.start, canonicalEnd: range.end,
      separatorBefore: mora.separatorBefore, typed: '', remnant: '', displayed: '', state: 'annotation',
    }
    let actual = ''
    for (let inputIndex = 0; inputIndex < typed.length; inputIndex += 1) {
      const before = inputDisplayProgress[inputIndex] ?? 0
      const after = inputDisplayProgress[inputIndex + 1] ?? before
      if (before < range.end && after > range.start) actual += typed[inputIndex]
    }
    const remnantStart = Math.max(range.start, Math.min(displayProgress, range.end))
    const remnant = canonical.slice(remnantStart, range.end)
    return {
      kana: mora.kana,
      canonical: range.canonical,
      canonicalStart: range.start,
      canonicalEnd: range.end,
      separatorBefore: mora.separatorBefore,
      typed: actual,
      remnant,
      displayed: actual + remnant,
      state: displayProgress >= range.end ? 'complete' : displayProgress >= range.start ? 'current' : 'remaining',
    }
  })

  return { aligned: true, groups }
}
