import { describe, expect, it } from 'vitest'
import { getAdventureRank } from './ranks'

describe('adventure ranks', () => {
  it('keeps the highest rank as a long-term goal', () => {
    expect(getAdventureRank(119_999).name).toBe('シルバー探検家')
    expect(getAdventureRank(299_999).name).toBe('ゴールド探検家')
    expect(getAdventureRank(300_000).name).toBe('伝説の探検家')
  })

  it('calculates progress within the current rank', () => {
    expect(getAdventureRank(12_500).progress).toBe(50)
  })
})
