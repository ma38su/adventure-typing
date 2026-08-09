import { describe, expect, it } from 'vitest'
import { resolveTypingInputAction } from './typingInputAction'

describe('resolveTypingInputAction', () => {
  it('normalizes physical letter keys to lowercase regardless of display case', () => {
    expect(resolveTypingInputAction('KeyS', '')).toEqual({ kind: 'type', value: 's' })
    expect(resolveTypingInputAction('KeyI', 's')).toEqual({ kind: 'type', value: 'i' })
  })

  it('removes one accepted key with Backspace, including a shi/si alternate', () => {
    expect(resolveTypingInputAction('Backspace', 'shi')).toEqual({ kind: 'backspace', value: 'sh' })
    expect(resolveTypingInputAction('Backspace', 'si')).toEqual({ kind: 'backspace', value: 's' })
    expect(resolveTypingInputAction('Backspace', '')).toEqual({ kind: 'ignore' })
  })
})
