import { useEffect, useRef } from 'react'

type ConfirmKeyEvent = Pick<KeyboardEvent, 'code' | 'key' | 'repeat' | 'isComposing' | 'target' | 'preventDefault' | 'stopImmediatePropagation'>

function isEditableTarget(target: EventTarget | null) {
  const candidate = target as EventTarget & { closest?: (selector: string) => Element | null }
  return typeof candidate?.closest === 'function'
    && Boolean(candidate.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])'))
}

export function handleConfirmShortcut(event: ConfirmKeyEvent, enabled: boolean, onConfirm: () => void) {
  const isSpace = event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar'
  if (!enabled || !isSpace || event.repeat || event.isComposing || isEditableTarget(event.target)) return false
  event.preventDefault()
  event.stopImmediatePropagation()
  onConfirm()
  return true
}

export function useConfirmShortcut(enabled: boolean, onConfirm: () => void, primaryButtonSelector?: string) {
  const onConfirmRef = useRef(onConfirm)
  const handledRef = useRef(false)
  onConfirmRef.current = onConfirm

  useEffect(() => {
    if (!enabled) {
      handledRef.current = false
      return
    }
    const primaryButton = primaryButtonSelector ? document.querySelector(primaryButtonSelector) : null
    primaryButton?.setAttribute('aria-keyshortcuts', 'Space')
    const onKeyDown = (event: KeyboardEvent) => {
      if (handledRef.current) return
      handleConfirmShortcut(event, true, () => {
        handledRef.current = true
        onConfirmRef.current()
      })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      primaryButton?.removeAttribute('aria-keyshortcuts')
    }
  }, [enabled, primaryButtonSelector])
}
