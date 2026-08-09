import { describe, expect, it, vi } from 'vitest'
import { getFingerGuide } from './kanaPractice'
import { detectKeyboardLayout, KEYBOARD_LAYOUTS, readKeyboardLayout, resolvePracticeKey, saveKeyboardLayout } from './keyboardLayouts'

describe('keyboard layouts', () => {
  it('represents the distinct right-side keys of JIS and US keyboards', () => {
    expect(KEYBOARD_LAYOUTS.jis.rows.map((row) => row.map((key) => key.label).join(''))).toEqual(['1234567890-^¥', 'QWERTYUIOP@[', 'ASDFGHJKL;:]', 'ZXCVBNM,./\\ ろ'])
    expect(KEYBOARD_LAYOUTS.us.rows.map((row) => row.map((key) => key.label).join(''))).toEqual(['1234567890-=', 'QWERTYUIOP[]\\', "ASDFGHJKL;'", 'ZXCVBNM,./'])
  })

  it('uses physical codes for every practiced letter, digit, and symbol', () => {
    expect(resolvePracticeKey('KeyA', 'a')).toEqual({ key: 'a', physicalMatch: true })
    expect(resolvePracticeKey('Digit8', '8')).toEqual({ key: '8', physicalMatch: true })
    for (const layout of ['jis', 'us'] as const) {
      expect(resolvePracticeKey('Minus', '-', layout)).toEqual({ key: '-', physicalMatch: true })
      expect(resolvePracticeKey('Comma', ',', layout)).toEqual({ key: ',', physicalMatch: true })
      expect(resolvePracticeKey('Period', '.', layout)).toEqual({ key: '.', physicalMatch: true })
      expect(resolvePracticeKey('Slash', '/', layout)).toEqual({ key: '/', physicalMatch: true })
    }
    expect(resolvePracticeKey('Slash', '?')).toBeUndefined()
    expect(resolvePracticeKey('IntlRo', '/', 'us')).toEqual({ key: '/', physicalMatch: false })
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

  it('defaults old profiles to JIS and stores the selection for the device', () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', { getItem: (name: string) => values.get(name) ?? null, setItem: (name: string, value: string) => values.set(name, value) })
    expect(readKeyboardLayout('old')).toBe('jis')
    saveKeyboardLayout('us')
    expect(readKeyboardLayout('another-profile')).toBe('us')
    vi.unstubAllGlobals()
  })

  it('migrates a legacy profile layout once without overriding a device setting', () => {
    const values = new Map<string, string>([['kotobajima-profile:legacy:keyboard-layout', 'us']])
    vi.stubGlobal('localStorage', { getItem: (name: string) => values.get(name) ?? null, setItem: (name: string, value: string) => values.set(name, value) })
    expect(readKeyboardLayout('legacy')).toBe('us')
    expect(values.get('kotobajima:keyboard-layout')).toBe('us')
    values.set('kotobajima-profile:other:keyboard-layout', 'jis')
    expect(readKeyboardLayout('other')).toBe('us')
    vi.unstubAllGlobals()
  })

  it('calibrates US with the unshifted key immediately right of P', () => {
    expect(detectKeyboardLayout({ key: '[', code: 'BracketLeft', shiftKey: false, repeat: false, isComposing: false })).toBe('us')
    expect(detectKeyboardLayout({ key: '@', code: 'BracketLeft', shiftKey: false, repeat: false, isComposing: false })).toBe('jis')
    expect(detectKeyboardLayout({ key: '{', code: 'BracketLeft', shiftKey: true, repeat: false, isComposing: false })).toBeUndefined()
    expect(detectKeyboardLayout({ key: '[', code: 'BracketLeft', shiftKey: false, repeat: true, isComposing: false })).toBeUndefined()
    expect(detectKeyboardLayout({ key: '[', code: 'BracketLeft', shiftKey: false, repeat: false, isComposing: true })).toBeUndefined()
  })
})
