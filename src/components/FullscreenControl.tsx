import { useCallback, useEffect, useState } from 'react'
import { isStandaloneDisplay, setPageFullscreen, subscribeFullscreenChange, supportsFullscreen } from './fullscreenApi'
import { UIRuby } from './UIRuby'

export function FullscreenControl({ className = '' }: { className?: string }) {
  const [available, setAvailable] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isStandaloneDisplay() || !supportsFullscreen()) return
    const sync = () => setFullscreen(Boolean(document.fullscreenElement))
    setAvailable(true)
    sync()
    return subscribeFullscreenChange(document, sync)
  }, [])

  const toggle = useCallback(async () => {
    setMessage('')
    try {
      await setPageFullscreen(document, !fullscreen)
    } catch {
      setMessage('全画面に切り替えられませんでした')
    }
  }, [fullscreen])

  if (!available) return null

  const label = fullscreen ? '全画面表示を元に戻す' : '全画面で表示する'
  return <div className={`fullscreen-control ${className}`.trim()}>
    <button type="button" className="fullscreen-toggle" aria-label={label} aria-pressed={fullscreen} onClick={(event) => { event.stopPropagation(); void toggle() }}>
      <span aria-hidden="true">{fullscreen ? '↙' : '↗'}</span><b><UIRuby>{fullscreen ? '元に戻す' : '全画面'}</UIRuby></b>
    </button>
    {message && <small className="fullscreen-message" role="status"><UIRuby>{message}</UIRuby></small>}
  </div>
}
