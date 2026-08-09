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
  try { return localStorage.getItem(`kotobajima-profile:${profileId}:keyboard-layout`) === 'us' ? 'us' : 'jis' } catch { return 'jis' }
}

export function saveKeyboardLayout(profileId: string, layout: KeyboardLayoutId) {
  try { localStorage.setItem(`kotobajima-profile:${profileId}:keyboard-layout`, layout) } catch { /* 設定を保存できなくても練習は続けられる */ }
}

export function resolvePracticeKey(code: string, value: string): string | undefined {
  if (code.startsWith('Key')) return code.slice(3).toLowerCase()
  if (code.startsWith('Digit') && value === code.slice(5)) return value
  if (code === 'Minus' && value === '-') return '-'
  if (code === 'Comma' && value === ',') return ','
  if (code === 'Period' && value === '.') return '.'
  if (code === 'Slash' && value === '/') return '/'
  return /^[a-z0-9,./-]$/i.test(value) ? value.toLowerCase() : undefined
}
