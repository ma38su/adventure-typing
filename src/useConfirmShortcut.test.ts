import { describe, expect, it, vi } from 'vitest'
import { handleConfirmShortcut } from './useConfirmShortcut'

function keyboardEvent(overrides: Partial<Parameters<typeof handleConfirmShortcut>[0]> = {}) {
  return {
    code: 'Space', key: ' ', repeat: false, isComposing: false, target: null,
    preventDefault: vi.fn(), stopImmediatePropagation: vi.fn(), ...overrides,
  }
}

describe('handleConfirmShortcut', () => {
  it('Spaceで確認アクションを1回呼び、既定動作を止める', () => {
    const confirm = vi.fn()
    const event = keyboardEvent()
    expect(handleConfirmShortcut(event, true, confirm)).toBe(true)
    expect(confirm).toHaveBeenCalledTimes(1)
    expect(event.preventDefault).toHaveBeenCalledOnce()
    expect(event.stopImmediatePropagation).toHaveBeenCalledOnce()
  })

  it.each([
    ['非アクティブ', keyboardEvent(), false],
    ['キーリピート', keyboardEvent({ repeat: true }), true],
    ['IME変換中', keyboardEvent({ isComposing: true }), true],
    ['Space以外', keyboardEvent({ code: 'Enter', key: 'Enter' }), true],
  ])('%sでは発火しない', (_label, event, enabled) => {
    const confirm = vi.fn()
    expect(handleConfirmShortcut(event, enabled, confirm)).toBe(false)
    expect(confirm).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it.each(['input', 'textarea', 'select', 'contenteditable'])('%s上では発火しない', (element) => {
    const confirm = vi.fn()
    const target = { closest: vi.fn(() => ({ tagName: element })) } as unknown as EventTarget
    expect(handleConfirmShortcut(keyboardEvent({ target }), true, confirm)).toBe(false)
    expect(confirm).not.toHaveBeenCalled()
  })
})
