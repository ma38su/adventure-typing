export type KeyboardLayoutId = 'jis' | 'us'

export type KeyboardKey = {
  code: string
  label: string
  input?: string
  fingerKey: string
}

export type KeyboardLayout = {
  id: KeyboardLayoutId
  name: string
  rows: KeyboardKey[][]
  maxKeys: number
}

export type PracticeKeyResult = { key: string; physicalMatch: boolean }
export type KeyboardCalibrationEvent = Pick<KeyboardEvent, 'code' | 'key' | 'shiftKey' | 'repeat' | 'isComposing'>

const DEVICE_LAYOUT_KEY = 'kotobajima:keyboard-layout'

const key = (code: string, label: string, fingerKey: string, input: string | null = label.toLowerCase()): KeyboardKey => ({ code, label, input: input ?? undefined, fingerKey })
const letters = (source: string) => [...source].map((letter) => key(`Key${letter.toUpperCase()}`, letter.toUpperCase(), letter))
const digits = [...'1234567890'].map((digit) => key(`Digit${digit}`, digit, digit))

export const KEYBOARD_LAYOUTS: Record<KeyboardLayoutId, KeyboardLayout> = {
  jis: {
    id: 'jis', name: 'JIS配列', maxKeys: 13,
    rows: [
      [...digits, key('Minus', '-', '-'), key('Equal', '^', '0', null), key('IntlYen', '¥', '0', null)],
      [...letters('qwertyuiop'), key('BracketLeft', '@', 'p', null), key('BracketRight', '[', 'p', null)],
      [...letters('asdfghjkl'), key('Semicolon', ';', 'p', null), key('Quote', ':', 'p', null), key('Backslash', ']', 'p', null)],
      [...letters('zxcvbnm'), key('Comma', ',', ','), key('Period', '.', '.'), key('Slash', '/', '/'), key('IntlRo', '\\ ろ', '/', null)],
    ],
  },
  us: {
    id: 'us', name: 'US配列', maxKeys: 12,
    rows: [
      [...digits, key('Minus', '-', '-'), key('Equal', '=', '0', null)],
      [...letters('qwertyuiop'), key('BracketLeft', '[', 'p', null), key('BracketRight', ']', 'p', null), key('Backslash', '\\', 'p', null)],
      [...letters('asdfghjkl'), key('Semicolon', ';', 'p', null), key('Quote', "'", 'p', null)],
      [...letters('zxcvbnm'), key('Comma', ',', ','), key('Period', '.', '.'), key('Slash', '/', '/')],
    ],
  },
}

export function readKeyboardLayout(profileId: string): KeyboardLayoutId {
  try {
    const deviceLayout = localStorage.getItem(DEVICE_LAYOUT_KEY)
    if (deviceLayout === 'jis' || deviceLayout === 'us') return deviceLayout
    const legacyLayout = localStorage.getItem(`kotobajima-profile:${profileId}:keyboard-layout`)
    if (legacyLayout === 'jis' || legacyLayout === 'us') {
      localStorage.setItem(DEVICE_LAYOUT_KEY, legacyLayout)
      return legacyLayout
    }
    return 'jis'
  } catch { return 'jis' }
}

export function hasKeyboardLayoutPreference() {
  try { return ['jis', 'us'].includes(localStorage.getItem(DEVICE_LAYOUT_KEY) ?? '') } catch { return false }
}

export function saveKeyboardLayout(layout: KeyboardLayoutId, calibrationCode?: string) {
  try {
    localStorage.setItem(DEVICE_LAYOUT_KEY, layout)
    if (calibrationCode) localStorage.setItem('kotobajima:keyboard-layout-calibration-code', calibrationCode)
  } catch { /* 設定を保存できなくても練習は続けられる */ }
}

export function detectKeyboardLayout(event: KeyboardCalibrationEvent): KeyboardLayoutId | undefined {
  if (event.repeat || event.isComposing || event.shiftKey) return undefined
  if (event.key === '@') return 'jis'
  if (event.key === '[') return 'us'
  return undefined
}

const PRACTICE_SYMBOL_CODES: Record<KeyboardLayoutId, Record<string, string>> = {
  jis: { ',': 'Comma', '.': 'Period', '-': 'Minus', '/': 'Slash' },
  us: { ',': 'Comma', '.': 'Period', '-': 'Minus', '/': 'Slash' },
}

export function resolvePracticeKey(code: string, value: string, layout: KeyboardLayoutId = 'jis'): PracticeKeyResult | undefined {
  if (code.startsWith('Key')) return { key: code.slice(3).toLowerCase(), physicalMatch: true }
  if (code.startsWith('Digit') && value === code.slice(5)) return { key: value, physicalMatch: true }
  if (value in PRACTICE_SYMBOL_CODES[layout]) return { key: value, physicalMatch: code === PRACTICE_SYMBOL_CODES[layout][value] }
  return undefined
}
