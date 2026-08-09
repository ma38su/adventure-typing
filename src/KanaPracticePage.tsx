import { useEffect, useMemo, useRef, useState } from 'react'
import { buildRomajiCandidates } from './romajiVariants'
import { FINGER_KEYS, getFingerGuide, getNextKanaCourse, HOME_KEYS, KANA_COURSES, type KanaCourse } from './kanaPractice'
import { useConfirmShortcut } from './useConfirmShortcut'
import { KEYBOARD_LAYOUTS, readKeyboardLayout, resolvePracticeKey, saveKeyboardLayout, type KeyboardLayoutId } from './keyboardLayouts'
import { KeyboardLayoutCalibration } from './components/KeyboardLayoutCalibration'
import { UIRuby } from './components/UIRuby'
import type { TypingDisplayCase } from './domain'

type Result = 'idle' | 'wrong' | 'correct'

const handName = { left: '左手', right: '右手' } as const
const reading = { '左手': 'ひだりて', '右手': 'みぎて', '小指': 'こゆび', '薬指': 'くすりゆび', '中指': 'なかゆび', '人差し指': 'ひとさしゆび' } as const
const fingerLegend = FINGER_KEYS.map(([, guide]) => guide).filter((guide, index, guides) => guides.findIndex((entry) => entry.hand === guide.hand && entry.finger === guide.finger) === index)

function RubyLabel({ text }: { text: keyof typeof reading }) {
  return <ruby>{text}<rt>{reading[text]}</rt></ruby>
}

function FingerKeyboard({ layoutId, nextKeys = [], overview = false }: { layoutId: KeyboardLayoutId; nextKeys?: string[]; overview?: boolean }) {
  const layout = KEYBOARD_LAYOUTS[layoutId]
  return <div className={`finger-keyboard ${overview ? 'overview' : ''}`} style={{ '--keyboard-columns': layout.maxKeys } as React.CSSProperties} aria-label={`${layout.name}の${overview ? 'キーと担当する指の一覧' : '指使いキーボード'}`}>{layout.rows.map((row, rowIndex) => <div key={`${layout.id}-${rowIndex}`} className="finger-keyboard-row" data-row={rowIndex}>{row.map((key) => {
    const guide = getFingerGuide(key.fingerKey)
    const label = guide ? `${key.label}キー、${handName[guide.hand]}の${guide.finger}` : `${key.label}キー`
    const isHome = HOME_KEYS.includes(key.fingerKey)
    const isTactile = key.code === 'KeyF' || key.code === 'KeyJ'
    return <kbd key={key.code} aria-label={`${label}${isTactile ? '、ホームポジションの突起' : ''}`} data-hand={guide?.hand} className={`${key.input && nextKeys.includes(key.input) ? 'next' : ''} ${isHome ? 'home' : ''} ${isTactile ? 'tactile' : ''}`} style={{ '--key-color': guide?.color } as React.CSSProperties}>{key.label}{isHome && <i aria-hidden="true" />}</kbd>
  })}</div>)}</div>
}

function KeyboardLayoutSelector({ value, compact = false, onChange }: { value: KeyboardLayoutId; compact?: boolean; onChange: (layout: KeyboardLayoutId) => void }) {
  return <div className={`keyboard-layout-selector ${compact ? 'compact' : ''}`} role="group" aria-label="キーボード配列">{(['jis', 'us'] as const).map((layout) => <button key={layout} type="button" aria-pressed={value === layout} onClick={() => onChange(layout)}>{KEYBOARD_LAYOUTS[layout].name}</button>)}</div>
}

export function KanaPracticePage({ profileId, tutorial, displayCase, onDisplayCase, onTutorialComplete, onBack, onStartAdventure }: { profileId: string; tutorial?: boolean; displayCase: TypingDisplayCase; onDisplayCase: (value: TypingDisplayCase) => void; onTutorialComplete: () => void; onBack: () => void; onStartAdventure: () => void }) {
  const storageKey = `kotobajima-profile:${profileId}:kana-practice`
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
      return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : []
    } catch { return [] }
  })
  const [course, setCourse] = useState<KanaCourse | null>(null)
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<Result>('idle')
  const [mistakes, setMistakes] = useState(0)
  const [finished, setFinished] = useState(false)
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayoutId>(() => readKeyboardLayout(profileId))
  const [layoutNotice, setLayoutNotice] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timersRef = useRef<number[]>([])
  const item = course?.items[index]
  const candidates = useMemo(() => item ? buildRomajiCandidates(item.romaji, item.kana) : [], [item])
  const matchingCandidates = candidates.filter((candidate) => candidate.target.startsWith(typed))
  const displayProgress = matchingCandidates.length ? Math.min(...matchingCandidates.map((candidate) => candidate.displayProgress[typed.length] ?? 0)) : 0
  const shownRomaji = item ? typed + item.romaji.slice(displayProgress) : ''
  const show = (value: string) => displayCase === 'upper' ? value.toUpperCase() : value.toLowerCase()
  const nextKeys = [...new Set(matchingCandidates.map((candidate) => candidate.target[typed.length]).filter(Boolean))]
  const primaryNextKey = nextKeys[0] ?? item?.romaji[displayProgress] ?? ''
  const fingerGuide = getFingerGuide(primaryNextKey)
  const requiredCourses = KANA_COURSES.filter((entry) => !entry.optional)
  const optionalCourses = KANA_COURSES.filter((entry) => entry.optional)
  const requiredRemaining = requiredCourses.filter((entry) => !completedIds.includes(entry.id)).length

  useEffect(() => { inputRef.current?.focus({ preventScroll: true }) }, [course, index, finished])
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(completedIds)) } catch { /* 文章練習は保存失敗でも続けられる */ } }, [completedIds, storageKey])
  useEffect(() => () => timersRef.current.forEach(window.clearTimeout), [])

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay)
    timersRef.current.push(timer)
  }
  const clearTimers = () => { timersRef.current.forEach(window.clearTimeout); timersRef.current = [] }

  const startCourse = (selected: KanaCourse) => {
    clearTimers()
    setCourse(selected); setIndex(0); setTyped(''); setResult('idle'); setMistakes(0); setFinished(false)
  }
  const chooseKeyboardLayout = (layout: KeyboardLayoutId) => { setKeyboardLayout(layout); saveKeyboardLayout(layout); setLayoutNotice(false) }
  const nextCourse = course ? getNextKanaCourse(course.id) : undefined
  const continueAfterFinish = () => {
    if (tutorial && course?.unlocksAdventure) onStartAdventure()
    else if (nextCourse) startCourse(nextCourse)
    else { clearTimers(); setCourse(null) }
  }
  useConfirmShortcut(finished, continueAfterFinish)
  useConfirmShortcut(!course && requiredRemaining === 0, onStartAdventure)

  const enterKey = (key: string) => {
    if (!course || !item || finished || result === 'correct' || !/^[a-z0-9,./-]$/.test(key)) return
    const next = typed + key
    const matching = candidates.filter((candidate) => candidate.target.startsWith(next))
    if (!matching.length) {
      setResult('wrong'); setMistakes((value) => value + 1)
      schedule(() => setResult('idle'), 280)
      return
    }
    setTyped(next); setResult('idle')
    if (!matching.some((candidate) => candidate.target === next)) return
    setResult('correct')
    schedule(() => {
      if (index === course.items.length - 1) {
        setCompletedIds((ids) => ids.includes(course.id) ? ids : [...ids, course.id])
        if (tutorial && course.unlocksAdventure) onTutorialComplete()
        setFinished(true)
      } else {
        setIndex((value) => value + 1); setTyped(''); setResult('idle')
      }
    }, 430)
  }

  if (!course) return <main className="kana-page kana-course-page">
    <header className="catalog-topbar"><button className="catalog-back" onClick={onBack}>‹ もどる</button><div className="brand"><span className="brand-mark">あ</span><div><strong>タイピング基礎ステージ</strong><small>挑戦するルートを選ぼう</small></div></div><div className="catalog-overall"><b>{completedIds.length}</b> / {KANA_COURSES.length} ルート</div></header>
    <section className="kana-course-hero"><span>⌨</span><div><small>{tutorial ? 'はじめての ぼうけん準備！' : '正しい指使いを身につけよう'}</small><h1>指の場所から、タイピングを覚えよう</h1><p>{tutorial ? '最初の「ホームポジション」をクリアすると、そのまま本編の冒険へ進めるよ。' : '五十音順ではなく、同じ指で押すキーや左右の手の動きごとに練習するよ。速さより正しい指を大切にしよう。'}</p></div></section>
    <section className="finger-map-intro" aria-labelledby="finger-map-title"><div className="finger-map-copy"><small>はじめに見てみよう</small><h2 id="finger-map-title">どの指で押す？</h2><p><strong>FとJの出っぱり</strong>に<RubyLabel text="人差し指" />を置こう。<br /><b>ASDF ／ JKL…</b>を基準に、押したら元の場所へ戻るよ。</p><div className="keyboard-layout-setting"><span>この端末のキーボード配列</span><KeyboardLayoutSelector value={keyboardLayout} onChange={chooseKeyboardLayout} /><small>接続キーボードの刻印に合わせて選択。この端末の全ユーザーで共通です。日本語入力の切り替えとは別です。{keyboardLayout === 'jis' && <><br />「^・¥・@・[・:・]・ろ」は位置の案内だけで、今のコースでは出題しません。</>}</small></div></div><div className="finger-map-board"><FingerKeyboard layoutId={keyboardLayout} overview /><div className="finger-legend" aria-label="指の色分け">{fingerLegend.map((guide) => <span key={`${guide.hand}-${guide.finger}`}><i style={{ background: guide.color }} aria-hidden="true" /><b><RubyLabel text={handName[guide.hand]} /></b> <RubyLabel text={guide.finger} /></span>)}</div></div></section>
    <section className="kana-course-grid">{requiredCourses.map((entry, courseIndex) => <button key={entry.id} style={{ '--course-color': entry.color } as React.CSSProperties} onClick={() => startCourse(entry)}><span>{entry.icon}</span><small>ルート {courseIndex + 1}</small><h2>{entry.name}</h2><p>{entry.subtitle}</p><b>{entry.focus}</b><em>{completedIds.includes(entry.id) ? 'クリア ✓' : 'すすむ　▶'}</em></button>)}</section>
    <section className={`kana-adventure-ready ${requiredRemaining === 0 ? 'ready' : ''}`} aria-label="次のステージへの入口"><span>🌉</span><div><small>{requiredRemaining === 0 ? '準備完了！' : `あと ${requiredRemaining} コース`}</small><h2>次のステージへ進む</h2><p>覚えたローマ字を使って、1年生の短い文章に挑戦しよう。</p></div><button type="button" disabled={requiredRemaining > 0} aria-keyshortcuts="Space Enter" onClick={onStartAdventure}>{requiredRemaining === 0 ? '冒険へ進む　▶' : `あと ${requiredRemaining} コース`}<small>{requiredRemaining === 0 ? 'Space / Enterでも進める' : '通常ルートをクリアしよう'}</small></button></section>
    <section className="kana-optional-routes"><div className="kana-optional-heading"><span>＋</span><div><h2>もっと練習したい人向け</h2><p>数字や記号は、いつでも好きなときに練習できます。</p></div></div><div className="kana-course-grid">{optionalCourses.map((entry) => <button key={entry.id} className="optional" style={{ '--course-color': entry.color } as React.CSSProperties} onClick={() => startCourse(entry)}><span>{entry.icon}</span><small>オプションルート</small><h2>{entry.name}</h2><p>{entry.subtitle}</p><b>{entry.focus}</b><em>{completedIds.includes(entry.id) ? 'クリア ✓' : 'すすむ　▶'}</em></button>)}</div></section>
  </main>

  return <main className={`kana-page kana-play-page ${result}`} onClick={() => inputRef.current?.focus()}>
    <header className="kana-play-header"><button onClick={() => { clearTimers(); setCourse(null) }}>‹ ルートをえらぶ</button><div><small>{course.icon} {course.name}ルート</small><b>{index + 1} / {course.items.length}</b><i><span style={{ width: `${((index + (finished ? 1 : 0)) / course.items.length) * 100}%` }} /></i></div><output>ミス {mistakes}</output></header>
    {finished ? <section className="kana-finish"><span>🎉</span><small>ROUTE CLEAR!</small><h1>{course.name}ルート クリア！</h1><p>{course.items.length}この問題を、さいごまで入力できたよ。</p><div><b>{course.items.length}<small>問題</small></b><b>{mistakes}<small>ミス</small></b></div><button aria-keyshortcuts="Space" onClick={continueAfterFinish}>{tutorial && course.unlocksAdventure ? '本編の冒険へ しゅっぱつ　▶' : nextCourse ? `つぎの「${nextCourse.name}」へ　▶` : 'ルート一覧へ戻る'}</button><small className="confirm-shortcut-hint">Spaceキーでも進める</small></section> : item && <section className="kana-practice-card">
      <div className="kana-level-row"><div className="kana-level-label">{course.icon} {course.subtitle}</div><span className="typing-case-switch" onClick={(event) => event.stopPropagation()}><button type="button" className={displayCase === 'lower' ? 'active' : ''} onClick={() => onDisplayCase('lower')}>abc</button><button type="button" className={displayCase === 'upper' ? 'active' : ''} onClick={() => onDisplayCase('upper')}>ABC</button></span></div>
      <p>この ひらがなを ローマ字で入力しよう</p>
      <div className="kana-target">{item.kana}</div>
      <div className="kana-romaji" aria-label={`入力するローマ字 ${show(item.romaji)}`}>{[...shownRomaji].map((letter, letterIndex) => <span key={`${letter}-${letterIndex}`} className={letterIndex < typed.length ? 'done' : letterIndex === typed.length ? 'current' : ''}>{show(letter)}</span>)}</div>
      {fingerGuide && <div className="finger-guidance" style={{ '--finger-color': fingerGuide.color } as React.CSSProperties}><div className={`guide-hand ${fingerGuide.hand}`}><span><RubyLabel text={handName[fingerGuide.hand]} /></span><b><RubyLabel text={fingerGuide.finger} /></b></div><p>つぎは <kbd>{primaryNextKey.toUpperCase()}</kbd> を <strong><RubyLabel text={handName[fingerGuide.hand]} />の<RubyLabel text={fingerGuide.finger} /></strong> で押そう</p></div>}
      <div className="practice-layout-switch"><span>この端末の表示配列</span><KeyboardLayoutSelector value={keyboardLayout} compact onChange={chooseKeyboardLayout} /><KeyboardLayoutCalibration profileId={profileId} compact onChange={chooseKeyboardLayout} /></div>
      <FingerKeyboard layoutId={keyboardLayout} nextKeys={nextKeys} />
      {layoutNotice && <div className="keyboard-layout-notice" role="status">入力できました。キーの位置が表示と違うときは、上のJIS／US配列を確認しよう。</div>}
      <div className="kana-message">{result === 'wrong' ? 'ちがうキーだよ。もう一度！' : result === 'correct' ? 'せいかい！' : typed ? `「${show(typed)}」まで入力したよ` : 'キーボードで入力してね'}</div>
      <div className="kana-tip">💡 <UIRuby>{item.instruction ?? course.focus}</UIRuby></div>
      <input ref={inputRef} className="kana-hidden-input" inputMode="text" autoCapitalize="none" autoCorrect="off" onKeyDown={(event) => {
        const practiceKey = resolvePracticeKey(event.code, event.key, keyboardLayout)
        if (practiceKey) { event.preventDefault(); setLayoutNotice(!practiceKey.physicalMatch); enterKey(practiceKey.key) }
        else if (event.key === 'Backspace') { event.preventDefault(); setTyped((value) => value.slice(0, -1)); setResult('idle') }
      }} />
    </section>}
  </main>
}
