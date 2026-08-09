export type TypingInputAction = { kind: 'type'; value: string } | { kind: 'backspace'; value: string } | { kind: 'ignore' }

export function resolveTypingInputAction(code: string, typed: string): TypingInputAction {
  if (code === 'Backspace') return typed ? { kind: 'backspace', value: typed.slice(0, -1) } : { kind: 'ignore' }
  if (code.startsWith('Key')) return { kind: 'type', value: code.slice(3).toLowerCase() }
  if (code === 'Minus') return { kind: 'type', value: '-' }
  return { kind: 'ignore' }
}
