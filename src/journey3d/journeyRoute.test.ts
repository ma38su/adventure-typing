import { describe, expect, it } from 'vitest'
import { clampJourneyProgress, getJourneyLabel } from './journeyRoute'

describe('Stage 1 journey route', () => {
  it('clamps external progress to one continuous route', () => {
    expect(clampJourneyProgress(-1)).toBe(0)
    expect(clampJourneyProgress(0.43)).toBe(0.43)
    expect(clampJourneyProgress(2)).toBe(1)
  })

  it('reports the nearest authored landmark', () => {
    expect(getJourneyLabel(0)).toBe('花の草原')
    expect(getJourneyLabel(0.42)).toBe('森の入口')
    expect(getJourneyLabel(0.98)).toBe('小川の橋')
  })
})
