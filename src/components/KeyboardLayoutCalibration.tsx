import { useEffect, useRef, useState } from 'react'
import { detectKeyboardLayout, hasKeyboardLayoutPreference, KEYBOARD_LAYOUTS, readKeyboardLayout, saveKeyboardLayout, type KeyboardLayoutId } from '../keyboardLayouts'
import { UIRuby } from './UIRuby'

export function KeyboardLayoutCalibration({ profileId, compact = false, onChange }: { profileId: string; compact?: boolean; onChange?: (layout: KeyboardLayoutId) => void }) {
  const initial = useRef<{ layout: KeyboardLayoutId; confirmed: boolean } | null>(null)
  if (!initial.current) {
    const layout = readKeyboardLayout(profileId)
    initial.current = { layout, confirmed: hasKeyboardLayoutPreference() }
  }
  const [layout, setLayout] = useState(initial.current.layout)
  const [open, setOpen] = useState(!initial.current.confirmed)
  const [pending, setPending] = useState<KeyboardLayoutId | null>(null)
  const [calibrationCode, setCalibrationCode] = useState<string>()
  const [message, setMessage] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)

  const close = () => {
    setOpen(false); setPending(null); setCalibrationCode(undefined); setMessage('')
    window.setTimeout(() => triggerRef.current?.focus(), 0)
  }
  const start = () => { setPending(null); setCalibrationCode(undefined); setMessage(''); setOpen(true) }
  const confirm = () => {
    if (!pending) return
    saveKeyboardLayout(pending, calibrationCode)
    setLayout(pending); onChange?.(pending); close()
  }

  useEffect(() => { if (open) dialogRef.current?.focus() }, [open])
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return }
      if (event.key === 'Tab') {
        const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? [])].filter((control) => !control.hasAttribute('disabled'))
        if (!controls.length) { event.preventDefault(); dialogRef.current?.focus(); return }
        const first = controls[0]; const last = controls.at(-1)!
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
        return
      }
      if (pending || event.repeat || event.isComposing || event.shiftKey) return
      event.preventDefault(); event.stopImmediatePropagation()
      const result = detectKeyboardLayout(event)
      if (!result) { setMessage('判定できませんでした。Shiftを離して指定のキーを押すか、下から手動で選んでください。'); return }
      setPending(result); setCalibrationCode(event.code); setMessage('')
    }
    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [open, pending])

  return <>
    {compact
      ? <button ref={triggerRef} type="button" className="keyboard-recalibrate" onClick={start}>⌨ <UIRuby>変更・再判定</UIRuby></button>
      : <div className="keyboard-layout-summary"><span>⌨ <UIRuby>現在の配列</UIRuby>：<b>{KEYBOARD_LAYOUTS[layout].name}</b></span><button ref={triggerRef} type="button" onClick={start}><UIRuby>変更・再判定</UIRuby></button></div>}
    {open && <div className="keyboard-calibration-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}><section ref={dialogRef} tabIndex={-1} className="keyboard-calibration" role="dialog" aria-modal="true" aria-labelledby="keyboard-calibration-title">
      <button type="button" className="keyboard-calibration-close" aria-label="閉じる" onClick={close}>×</button>
      {!pending ? <><small><UIRuby>1キーで配列を判定</UIRuby></small><h2 id="keyboard-calibration-title"><UIRuby>Pのすぐ右隣のキーを、Shiftを押さずに1回押してください</UIRuby></h2><p><UIRuby>OSが受け取った文字から判定します。物理キーボードの刻印とOS設定が違う場合は、OS側の解釈が表示されます。</UIRuby></p>{message && <p className="calibration-error" role="status"><UIRuby>{message}</UIRuby></p>}<div><button type="button" onClick={() => setPending('jis')}>JIS<UIRuby>配列</UIRuby></button><button type="button" onClick={() => setPending('us')}>US<UIRuby>配列</UIRuby></button><button type="button" className="skip" onClick={close}>あとで<UIRuby>手動選択</UIRuby></button></div></> : <><small><UIRuby>判定結果</UIRuby></small><h2 id="keyboard-calibration-title">{KEYBOARD_LAYOUTS[pending].name}と<UIRuby>判定しました</UIRuby></h2><p><UIRuby>刻印と表示が合っていますか？ 違う場合はここで修正できます。</UIRuby></p><div><button type="button" aria-pressed={pending === 'jis'} onClick={() => { setPending('jis'); setCalibrationCode(undefined) }}>JIS<UIRuby>配列</UIRuby></button><button type="button" aria-pressed={pending === 'us'} onClick={() => { setPending('us'); setCalibrationCode(undefined) }}>US<UIRuby>配列</UIRuby></button></div><button type="button" className="keyboard-calibration-confirm" onClick={confirm}><UIRuby>これで使う</UIRuby></button></>}
    </section></div>}
  </>
}
