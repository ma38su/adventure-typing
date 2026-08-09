import { describe, expect, it } from 'vitest'
import { buildRomajiDisplay } from './romajiDisplay'

const compact = (canonical: string, typed: string, progress: number[]) => (
  buildRomajiDisplay(canonical, typed, progress).map(({ character, state }) => `${character}:${state}`)
)

describe('romaji inline input display', () => {
  it('replaces canonical shi with the actually typed si', () => {
    expect(compact('shi', 'si', [0, 1, 3])).toEqual(['s:typed', 'i:typed'])
  })

  it('keeps the canonical remainder and cursor after a partial ti input for chi', () => {
    expect(compact('chi', 't', [0, 1])).toEqual(['t:typed', 'h:cursor-char', 'i:remaining'])
  })

  it('preserves word spaces while showing actual input across words', () => {
    expect(compact('shiroi chi', 'siroiti', [0, 1, 3, 4, 5, 6, 7, 9])).toEqual([
      's:typed', 'i:typed', 'r:typed', 'o:typed', 'i:typed', ' :space', 't:typed', 'i:typed',
    ])
  })

  it('puts the cursor after the restored space at a word boundary', () => {
    expect(compact('akai hana', 'akai', [0, 1, 2, 3, 4])).toEqual([
      'a:typed', 'k:typed', 'a:typed', 'i:typed', ' :space', 'h:cursor-char', 'a:remaining', 'n:remaining', 'a:remaining',
    ])
  })
})
