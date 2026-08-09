import { describe, expect, it } from 'vitest'
import { getRomajiCharacterState } from './romajiDisplay'

describe('romaji character marker', () => {
  it('separates typed, current, and remaining characters by display progress', () => {
    expect([0, 1, 2, 3].map((position) => getRomajiCharacterState(position, 2))).toEqual([
      'typed',
      'typed',
      'cursor-char',
      'remaining',
    ])
  })
})
