import { describe, expect, it, vi } from 'vitest'
import { getFingerGuide } from './kanaPractice'
import { KEYBOARD_LAYOUTS, readKeyboardLayout, resolvePracticeKey, saveKeyboardLayout } from './keyboardLayouts'

describe('keyboard layouts', () => {
  it('represents the distinct right-side keys of JIS and US keyboards', () => {
    expect(KEYBOARD_LAYOUTS.jis.rows.map((row) => row.map((key) => key.label).join(''))).toEqual(['1234567890-^¥', 'QWERTYUIOP@[', 'ASDFGHJKL;:]', 'ZXCVBNM,./\\ ろ'])
    expect(KEYBOARD_LAYOUTS.us.rows.map((row) => row.map((key) => key.label).join(''))).toEqual(['1234567890-=', 'QWERTYUIOP[]\\', "ASDFGHJKL;'", 'ZXCVBNM,./'])
  })

  it('uses physical codes for every practiced letter, digit, and symbol', () => {
    expect(resolvePracticeKey('KeyA', 'a')).toBe('a')
    expect(resolvePracticeKey('Digit8', '8')).toBe('8')
    expect(resolvePracticeKey('Minus', '-')).toBe('-')
    expect(resolvePracticeKey('Comma', ',')).toBe(',')
    expect(resolvePracticeKey('Period', '.')).toBe('.')
    expect(resolvePracticeKey('Slash', '/')).toBe('/')
    expect(resolvePracticeKey('Slash', '?')).toBeUndefined()
  })

  it('assigns every key shown in either layout to a finger', () => {
    for (const layout of Object.values(KEYBOARD_LAYOUTS)) {
      for (const keyboardKey of layout.rows.flat()) expect(getFingerGuide(keyboardKey.fingerKey), `${layout.id}:${keyboardKey.label}`).toBeDefined()
    }
  })

  it('uses each physical key code only once within a layout', () => {
    for (const layout of Object.values(KEYBOARD_LAYOUTS)) {
      const codes = layout.rows.flat().map((keyboardKey) => keyboardKey.code)
      expect(new Set(codes).size, layout.id).toBe(codes.length)
    }
  })

  it('defaults old profiles to JIS and stores an explicit US selection', () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', { getItem: (name: string) => values.get(name) ?? null, setItem: (name: string, value: string) => values.set(name, value) })
    expect(readKeyboardLayout('old')).toBe('jis')
    saveKeyboardLayout('old', 'us')
    expect(readKeyboardLayout('old')).toBe('us')
    vi.unstubAllGlobals()
  })
})
