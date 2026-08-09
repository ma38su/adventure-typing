const SMALL_KANA = /[ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]/gu
const PUNCTUATION = /[、。！？,.!?]/gu
const SYMBOLS = /[「」『』（）()［］[\]・:：;；/／]/gu
const DIGITS = /[0-9０-９]/gu

const countMatches = (value, pattern) => value.match(pattern)?.length ?? 0

export function measureQuestion(question, grade = null) {
  const canonical = question.romaji.replaceAll(' ', '')
  const japanese = question.reading
  const kana = question.reading.replace(/[\s、。！？,.!?「」『』（）()［］[\]・:：;；/／0-9０-９]/gu, '')
  const words = question.romaji.trim().split(/\s+/u).filter(Boolean).length
  const complexSyllables = countMatches(canonical, /(shi|chi|tsu|fu|ji|sha|shu|sho|cha|chu|cho|kya|kyu|kyo|nya|nyu|nyo|hya|hyu|hyo|mya|myu|myo|rya|ryu|ryo|gya|gyu|gyo|bya|byu|byo|pya|pyu|pyo)/gu)
  const sokuon = countMatches(japanese, /[っッ]/gu)
  const yoon = countMatches(japanese, /[ゃゅょャュョ]/gu)
  const hatsuon = countMatches(question.reading, /[んン]/gu)
  const longVowel = countMatches(japanese, /ー/gu)
  // 実際に打つ `romaji` だけを記号負荷として数える。表示文と読みの重複加算を避ける。
  const digits = countMatches(question.romaji, DIGITS)
  const punctuation = countMatches(question.romaji, PUNCTUATION)
  const symbols = countMatches(question.romaji, SYMBOLS)
  const mora = [...kana.replace(SMALL_KANA, '')].length
  const score = canonical.length
    + Math.max(0, words - 1) * 1.5
    + complexSyllables * 0.8
    + sokuon * 1.5
    + yoon * 1.2
    + hatsuon * 0.4
    + longVowel * 1.5
    + digits * 2.5
    + punctuation * 2
    + symbols * 3

  return {
    id: question.id,
    grade,
    oldStage: question.stage,
    oldEpisode: grade == null ? null : (grade - 1) * 6 + question.stage,
    keystrokes: canonical.length,
    words,
    mora,
    complexSyllables,
    sokuon,
    yoon,
    hatsuon,
    longVowel,
    digits,
    punctuation,
    symbols,
    score: Number(score.toFixed(1)),
  }
}

export function median(values) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export const featureGate = (stage) => ({
  sokuon: stage >= 8,
  yoon: stage >= 10,
  hatsuon: stage >= 5,
  punctuation: stage >= 25,
  longVowel: stage >= 27,
  digits: stage >= 29,
  symbols: stage >= 32,
})

export function targetBand(stage) {
  const center = 7 + (stage - 1) * 1.25
  return {
    min: Math.max(4, Math.round(center - 5)),
    center: Number(center.toFixed(1)),
    max: Math.round(center + 5),
  }
}

const GRADE_SCORE_BOUNDARIES = [13.9, 21.4, 28.9, 36.4, 43.9]

/** 難度だけから見た参考帯。推奨学年を上書きする値ではなく、乖離監査専用。 */
export function estimatedDifficultyGrade(score) {
  return (GRADE_SCORE_BOUNDARIES.findIndex((boundary) => score <= boundary) + 1 || 6)
}
