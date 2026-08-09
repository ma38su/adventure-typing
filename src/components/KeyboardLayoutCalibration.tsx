import { useEffect, useRef, useState } from 'react'
import { detectKeyboardLayout, hasKeyboardLayoutPreference, KEYBOARD_LAYOUTS, readKeyboardLayout, saveKeyboardLayout, type KeyboardLayoutId } from '../keyboardLayouts'

export function KeyboardLayoutCalibration({ profileId, compact = false, onChange }: { profileId: string; compact?: boolean; onChange?: (layout: KeyboardLayoutId) => void }) {
  const initial = useRef<{ layout: KeyboardLayoutId; confirmed: boolean } | null>(null)
  if (!initial.current) {
    const layout = readKeyboardLayout(profileId)
    initial.current = { layout, confirmed: hasKeyboardLayoutPreference() }
  }
  const [layout, setLayout] = useState(initial.current.layout)
  const [confirmed, setConfirmed] = useState(initial.current.confirmed)
  const [calibrating, setCalibrating] = useState(!initial.current.confirmed)
  const [detected, setDetected] = useState(false)
  const [message, setMessage] = useState('')

  const choose = (next: KeyboardLayoutId, code?: string) => {
    saveKeyboardLayout(next, code)
    setLayout(next); setConfirmed(true); setCalibrating(false); setMessage(''); onChange?.(next)
  }

  useEffect(() => {
    if (!calibrating) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing || event.shiftKey) return
      event.preventDefault(); event.stopImmediatePropagation()
      const result = detectKeyboardLayout(event)
      if (!result) { setMessage('判定できませんでした。Shiftを離して指定のキーを押すか、下から手動で選んでください。'); return }
      setDetected(true); choose(result, event.code)
    }
    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  })

  if (compact && !calibrating && !detected) return <button type="button" className="keyboard-recalibrate" onClick={() => { setCalibrating(true); setMessage('') }}>⌨ 再判定</button>
  if (!compact && confirmed && !detected) return null

  return <section className={`keyboard-calibration ${compact ? 'compact' : ''}`} aria-label="キーボード配列の判定">
    {calibrating ? <><small>1キーで配列を判定</small><h2>Pのすぐ右隣のキーを、Shiftを押さずに1回押してください</h2><p>OSが受け取った文字から判定します。物理キーボードの刻印とOS設定が違う場合は、OS側の解釈が表示されます。</p>{message && <p className="calibration-error" role="status">{message}</p>}<div><button type="button" onClick={() => choose('jis')}>JIS配列を選ぶ</button><button type="button" onClick={() => choose('us')}>US配列を選ぶ</button><button type="button" className="skip" onClick={() => setCalibrating(false)}>あとで手動選択</button></div></> : <><small>判定結果</small><h2>{KEYBOARD_LAYOUTS[layout].name}として判定しました</h2><p>刻印と表示が合っていますか？ 違う場合はここで修正できます。</p><div><button type="button" aria-pressed={layout === 'jis'} onClick={() => choose('jis')}>JIS配列</button><button type="button" aria-pressed={layout === 'us'} onClick={() => choose('us')}>US配列</button><button type="button" className="skip" onClick={() => setDetected(false)}>合っています</button></div></>}
  </section>
}
