import { describe, expect, it } from 'vitest'
import { emptyProblemStat } from '../domain'
import { mergeKeyStatBatch, mergeProblemBatch, type TypingProblemBatch } from './useTypingEngine'

const batch: TypingProblemBatch = {
  questionId: 'q1', attempted: true, correctKeys: 3, mistakes: 2, elapsed: 1200,
  completedKeys: 3, kpm: 150,
  wrongSpots: { '0:a:x': { position: 0, expected: 'a', actual: 'x', count: 2 } },
  keyStats: { a: { attempts: 3, misses: 2, wrongKeys: { x: 2 } } },
}

describe('typing statistics batches', () => {
  it('merges all problem counters once at completion', () => {
    const result = mergeProblemBatch(emptyProblemStat(), batch, '2026-08-09T00:00:00.000Z')
    expect(result).toMatchObject({ attempts: 1, completions: 1, correctKeys: 3, mistakes: 2, totalTimeMs: 1200, bestKpm: 150 })
    expect(result.wrongSpots['0:a:x'].count).toBe(2)
  })

  it('merges key counters with a grade prefix', () => {
    const result = mergeKeyStatBatch({ '2:a': { attempts: 2, misses: 1, wrongKeys: { z: 1 } } }, batch.keyStats, '2:')
    expect(result['2:a']).toEqual({ attempts: 5, misses: 3, wrongKeys: { z: 1, x: 2 } })
  })
})
