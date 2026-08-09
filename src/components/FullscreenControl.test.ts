import { describe, expect, it, vi } from 'vitest'
import { isStandaloneDisplay, setPageFullscreen, subscribeFullscreenChange, supportsFullscreen } from './fullscreenApi'

const fullscreenDocument = () => {
  const requestFullscreen = vi.fn().mockResolvedValue(undefined)
  const exitFullscreen = vi.fn().mockResolvedValue(undefined)
  return {
    documentElement: { requestFullscreen },
    fullscreenElement: null,
    fullscreenEnabled: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    exitFullscreen,
    requestFullscreen,
  }
}

describe('FullscreenControl helpers', () => {
  it('Fullscreen APIに対応する環境だけを有効にする', () => {
    expect(supportsFullscreen(fullscreenDocument() as never)).toBe(true)
    expect(supportsFullscreen({ fullscreenEnabled: false, documentElement: {}, exitFullscreen: vi.fn() } as never)).toBe(false)
  })

  it('開始と終了で標準Fullscreen APIを呼び分ける', async () => {
    const target = fullscreenDocument()
    await setPageFullscreen(target as never, true)
    expect(target.requestFullscreen).toHaveBeenCalledOnce()
    expect(target.exitFullscreen).not.toHaveBeenCalled()
    await setPageFullscreen(target as never, false)
    expect(target.exitFullscreen).toHaveBeenCalledOnce()
  })

  it('拒否されたrequestFullscreenを呼び出し側へ返す', async () => {
    const target = fullscreenDocument()
    target.requestFullscreen.mockRejectedValueOnce(new Error('denied'))
    await expect(setPageFullscreen(target as never, true)).rejects.toThrow('denied')
  })

  it('PWA standaloneとiOS standaloneを判定する', () => {
    expect(isStandaloneDisplay({ matchMedia: () => ({ matches: true }) } as never, {} as Navigator)).toBe(true)
    expect(isStandaloneDisplay({ matchMedia: () => ({ matches: false }) } as never, { standalone: true } as never)).toBe(true)
    expect(isStandaloneDisplay({ matchMedia: () => ({ matches: false }) } as never, {} as Navigator)).toBe(false)
  })

  it('fullscreenchange購読を解除できる', () => {
    const target = fullscreenDocument()
    const listener = vi.fn()
    const cleanup = subscribeFullscreenChange(target as never, listener)
    expect(target.addEventListener).toHaveBeenCalledWith('fullscreenchange', listener)
    cleanup()
    expect(target.removeEventListener).toHaveBeenCalledWith('fullscreenchange', listener)
  })
})
