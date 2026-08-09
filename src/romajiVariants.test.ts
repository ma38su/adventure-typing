import { describe, expect, it } from 'vitest'
import { buildRomajiCandidates } from './romajiVariants'

describe('buildRomajiCandidates', () => {
  it('accepts school Hepburn and common keyboard aliases', () => {
    const targets = buildRomajiCandidates('shiroichizu', 'しろいちず').map((item) => item.target)
    expect(targets).toContain('shiroichizu')
    expect(targets).toContain('siroitizu')
  })

  it('accepts n and nn only for syllabic ん', () => {
    const targets = buildRomajiCandidates('minnademori', 'みんなでもり').map((item) => item.target)
    expect(targets).toContain('minnademori')
    expect(targets).toContain('minnnademori')
    expect(targets).not.toContain('miademori')
  })

  it('keeps the canonical display marker aligned for shorter aliases', () => {
    const si = buildRomajiCandidates('shi', 'し').find((candidate) => candidate.target === 'si')
    expect(si?.displayProgress).toEqual([0, 1, 3])

    const ti = buildRomajiCandidates('chi', 'ち').find((candidate) => candidate.target === 'ti')
    expect(ti?.displayProgress).toEqual([0, 1, 3])
  })
})
