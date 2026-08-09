import type { ScoreBreakdown } from './domain'

export function calculateQuestionScore(correctKeys: number, misses: number, romajiLength: number, elapsedMs: number, targetKpm: number): ScoreBreakdown {
  const safeElapsed = Math.max(500, elapsedMs)
  const attempts = correctKeys + misses
  const ratio = attempts ? correctKeys / attempts : 1
  const kpm = Math.round((romajiLength / safeElapsed) * 60000)
  // GPは練習量の目安です。短時間の連打や速度だけで増えすぎないよう、
  // 正確さを7割、速度を3割にし、1問の上限を120 GPに抑えます。
  const accuracyPoints = Math.round(70 * ratio * ratio)
  const speedRatio = Math.max(0, Math.min(1, kpm / targetKpm))
  const speedPoints = Math.round(30 * speedRatio * ratio)
  const carefulTypingBonus = ratio >= .95 && kpm >= targetKpm * .7 ? 20 : 0
  return { total: accuracyPoints + speedPoints + carefulTypingBonus, accuracyPoints, speedPoints, accuracy: Math.round(ratio * 100), kpm }
}
