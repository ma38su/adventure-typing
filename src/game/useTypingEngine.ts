import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { KeyStat, KeyStats, ProblemStat } from '../domain'
import type { Grade, Question } from '../questions'
import { buildRomajiCandidates } from '../romajiVariants'
import { calculateQuestionScore } from '../scoring'

export type TypingProblemBatch = {
  questionId: string
  attempted: boolean
  correctKeys: number
  mistakes: number
  elapsed: number
  completedKeys: number
  kpm: number
  wrongSpots: ProblemStat['wrongSpots']
  keyStats: Record<string, KeyStat>
}

type TypingEngineOptions = {
  question: Question
  grade: Grade
  course: number
  typed: string
  disabled: boolean
  onTyped: (value: string) => void
  onAcceptedKey: (key: string, comboHint: number) => void
  onRejectedKey: (expected: string, actual: string) => void
  onComplete: (batch: TypingProblemBatch, score: ReturnType<typeof calculateQuestionScore>) => void
}

const emptyKeyStat = (): KeyStat => ({ attempts: 0, misses: 0, wrongKeys: {} })

export function mergeKeyStatBatch(current: KeyStats, batch: Record<string, KeyStat>, prefix = ''): KeyStats {
  if (Object.keys(batch).length === 0) return current
  const next = { ...current }
  for (const [key, delta] of Object.entries(batch)) {
    const id = `${prefix}${key}`
    const previous = next[id] ?? emptyKeyStat()
    const wrongKeys = { ...previous.wrongKeys }
    for (const [wrong, count] of Object.entries(delta.wrongKeys)) wrongKeys[wrong] = (wrongKeys[wrong] ?? 0) + count
    next[id] = { attempts: previous.attempts + delta.attempts, misses: previous.misses + delta.misses, wrongKeys }
  }
  return next
}

export function mergeProblemBatch(current: ProblemStat, batch: TypingProblemBatch, playedAt: string): ProblemStat {
  const wrongSpots = { ...current.wrongSpots }
  for (const [id, spot] of Object.entries(batch.wrongSpots)) {
    wrongSpots[id] = { ...spot, count: (wrongSpots[id]?.count ?? 0) + spot.count }
  }
  return {
    ...current,
    attempts: current.attempts + (batch.attempted ? 1 : 0),
    completions: current.completions + 1,
    correctKeys: current.correctKeys + batch.correctKeys,
    mistakes: current.mistakes + batch.mistakes,
    totalTimeMs: current.totalTimeMs + batch.elapsed,
    completedKeys: current.completedKeys + batch.completedKeys,
    bestKpm: Math.max(current.bestKpm, batch.kpm),
    lastPlayedAt: playedAt,
    wrongSpots,
  }
}

export function useTypingEngine(options: TypingEngineOptions) {
  const { question, grade, course, typed, disabled, onTyped, onAcceptedKey, onRejectedKey, onComplete } = options
  const canonicalRomaji = question.romaji.replaceAll(' ', '')
  const acceptedCandidates = useMemo(
    () => buildRomajiCandidates(canonicalRomaji, question.reading),
    [canonicalRomaji, question.reading],
  )
  const matchingCandidates = acceptedCandidates.filter((candidate) => candidate.target.startsWith(typed))
  const displayProgress = matchingCandidates.length
    ? Math.min(...matchingCandidates.map((candidate) => candidate.displayProgress[typed.length] ?? 0))
    : 0
  const inputDisplayProgress = Array.from({ length: typed.length + 1 }, (_, inputLength) => (
    matchingCandidates.length
      ? Math.min(...matchingCandidates.map((candidate) => candidate.displayProgress[inputLength] ?? 0))
      : 0
  ))
  const currentChar = canonicalRomaji[displayProgress] ?? ''
  const nextKeyOptions = [...new Set(matchingCandidates.map((candidate) => candidate.target[typed.length]).filter(Boolean))]
  const startedAtRef = useRef(Date.now())
  const attemptedRef = useRef(false)
  const correctRef = useRef(0)
  const missesRef = useRef(0)
  const wrongSpotsRef = useRef<ProblemStat['wrongSpots']>({})
  const keyStatsRef = useRef<Record<string, KeyStat>>({})

  const resetQuestion = useCallback(() => {
    startedAtRef.current = Date.now()
    attemptedRef.current = false
    correctRef.current = 0
    missesRef.current = 0
    wrongSpotsRef.current = {}
    keyStatsRef.current = {}
  }, [])

  useEffect(resetQuestion, [question.id, grade, course, resetQuestion])

  const recordKey = (expected: string, actual: string, missed: boolean) => {
    if (!expected) return
    const current = keyStatsRef.current[expected] ?? emptyKeyStat()
    keyStatsRef.current[expected] = {
      attempts: current.attempts + 1,
      misses: current.misses + (missed ? 1 : 0),
      wrongKeys: missed ? { ...current.wrongKeys, [actual]: (current.wrongKeys[actual] ?? 0) + 1 } : current.wrongKeys,
    }
  }

  const enterCharacters = useCallback((raw: string) => {
    if (disabled) return
    if (!attemptedRef.current && /[a-z-]/i.test(raw)) {
      attemptedRef.current = true
      startedAtRef.current = Date.now()
    }
    let nextTyped = typed
    for (const key of raw.toLowerCase()) {
      if (!/^[a-z-]$/.test(key)) continue
      const before = acceptedCandidates.filter((candidate) => candidate.target.startsWith(nextTyped))
      if (before.length === 0) return
      const expectedKeys = [...new Set(before.map((candidate) => candidate.target[nextTyped.length]).filter(Boolean))]
      const progress = Math.min(...before.map((candidate) => candidate.displayProgress[nextTyped.length] ?? 0))
      const displayKey = canonicalRomaji[progress] ?? expectedKeys[0] ?? ''
      const attempted = nextTyped + key
      const after = before.filter((candidate) => candidate.target.startsWith(attempted))
      if (after.length === 0) {
        missesRef.current += 1
        const expected = expectedKeys.join(' / ')
        const spotId = `${progress}:${displayKey}:${key}`
        const previous = wrongSpotsRef.current[spotId]
        wrongSpotsRef.current[spotId] = { position: progress, expected: displayKey, actual: key, count: (previous?.count ?? 0) + 1 }
        recordKey(displayKey, key, true)
        onRejectedKey(expected, key)
        return
      }
      correctRef.current += 1
      recordKey(displayKey, key, false)
      nextTyped = attempted
      onAcceptedKey(key, nextTyped.length)
    }
    onTyped(nextTyped)
    if (!acceptedCandidates.some((candidate) => candidate.target === nextTyped)) return

    const elapsed = Math.max(500, Date.now() - startedAtRef.current)
    const targetKpm = 65 + grade * 10 + course * 5
    const score = calculateQuestionScore(correctRef.current, missesRef.current, canonicalRomaji.length, elapsed, targetKpm)
    onComplete({
      questionId: question.id,
      attempted: attemptedRef.current,
      correctKeys: correctRef.current,
      mistakes: missesRef.current,
      elapsed,
      completedKeys: canonicalRomaji.length,
      kpm: score.kpm,
      wrongSpots: wrongSpotsRef.current,
      keyStats: keyStatsRef.current,
    }, score)
  }, [acceptedCandidates, canonicalRomaji, course, disabled, grade, onAcceptedKey, onComplete, onRejectedKey, onTyped, question.id, typed])

  return { canonicalRomaji, displayProgress, inputDisplayProgress, currentChar, nextKeyOptions, enterCharacters, resetQuestion }
}
