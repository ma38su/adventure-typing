import type { ScoreBreakdown } from './domain'

export function calculateQuestionScore(correctKeys: number, misses: number, romajiLength: number, elapsedMs: number, targetKpm: number): ScoreBreakdown {
  const safeElapsed = Math.max(500, elapsedMs)
  const attempts = correctKeys + misses
  const ratio = attempts ? correctKeys / attempts : 1
  const kpm = Math.round((romajiLength / safeElapsed) * 60000)
  const accuracyPoints = Math.round(500 * ratio)
  const speedPoints = Math.round(500 * Math.max(.35, Math.min(1.5, kpm / targetKpm)))
  return { total: accuracyPoints + speedPoints, accuracyPoints, speedPoints, accuracy: Math.round(ratio * 100), kpm }
}
