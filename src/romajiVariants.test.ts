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
})
