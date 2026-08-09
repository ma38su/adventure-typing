import { useEffect, useMemo, useRef, useState } from 'react'
import { buildRomajiCandidates } from './romajiVariants'
import { FINGER_KEYS, FINGER_KEYBOARD_ROWS, getFingerGuide, getNextKanaCourse, HOME_KEYS, KANA_COURSES, type KanaCourse } from './kanaPractice'
import { useConfirmShortcut } from './useConfirmShortcut'

type Result = 'idle' | 'wrong' | 'correct'

const handName = { left: '左手', right: '右手' } as const
const reading = { '左手': 'ひだりて', '右手': 'みぎて', '小指': 'こゆび', '薬指': 'くすりゆび', '中指': 'なかゆび', '人差し指': 'ひとさしゆび' } as const
const fingerLegend = FINGER_KEYS.map(([, guide]) => guide).filter((guide, index, guides) => guides.findIndex((entry) => entry.hand === guide.hand && entry.finger === guide.finger) === index)

function RubyLabel({ text }: { text: keyof typeof reading }) {
  return <ruby>{text}<rt>{reading[text]}</rt></ruby>
}

function FingerKeyboard({ nextKeys = [], overview = false }: { nextKeys?: string[]; overview?: boolean }) {
  return <div className={`finger-keyboard ${overview ? 'overview' : ''}`} aria-label={overview ? 'キーと担当する指の一覧' : '指使いキーボード'}>{FINGER_KEYBOARD_ROWS.map((row) => <div key={row}>{[...row].map((key) => {
    const guide = getFingerGuide(key)
    const label = guide ? `${key.toUpperCase()}キー、${handName[guide.hand]}の${guide.finger}` : `${key.toUpperCase()}キー`
    return <kbd key={key} aria-label={`${label}${key === 'f' || key === 'j' ? '、ホームポジションの突起' : ''}`} data-hand={guide?.hand} className={`${nextKeys.includes(key) ? 'next' : ''} ${HOME_KEYS.includes(key) ? 'home' : ''} ${key === 'f' || key === 'j' ? 'tactile' : ''}`} style={{ '--key-color': guide?.color } as React.CSSProperties}>{key.toUpperCase()}{HOME_KEYS.includes(key) && <i aria-hidden="true" />}</kbd>
  })}</div>)}</div>
}

export function KanaPracticePage({ profileId, tutorial, onTutorialComplete, onBack, onStartAdventure }: { profileId: string; tutorial?: boolean; onTutorialComplete: () => void; onBack: () => void; onStartAdventure: () => void }) {
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
  const inputRef = useRef<HTMLInputElement>(null)
  const timersRef = useRef<number[]>([])
  const item = course?.items[index]
  const candidates = useMemo(() => item ? buildRomajiCandidates(item.romaji, item.kana) : [], [item])
  const matchingCandidates = candidates.filter((candidate) => candidate.target.startsWith(typed))
  const displayProgress = matchingCandidates.length ? Math.min(...matchingCandidates.map((candidate) => candidate.displayProgress[typed.length] ?? 0)) : 0
  const shownRomaji = item ? typed + item.romaji.slice(displayProgress) : ''
  const nextKeys = [...new Set(matchingCandidates.map((candidate) => candidate.target[typed.length]).filter(Boolean))]
  const primaryNextKey = nextKeys[0] ?? item?.romaji[displayProgress] ?? ''
  const fingerGuide = getFingerGuide(primaryNextKey)

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
  const nextCourse = course ? getNextKanaCourse(course.id) : undefined
  const continueAfterFinish = () => {
    if (tutorial && course?.unlocksAdventure) onStartAdventure()
    else if (nextCourse) startCourse(nextCourse)
    else { clearTimers(); setCourse(null) }
  }
  useConfirmShortcut(finished, continueAfterFinish)

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
    <section className="finger-map-intro" aria-labelledby="finger-map-title"><div className="finger-map-copy"><small>はじめに見てみよう</small><h2 id="finger-map-title">どの指で押す？</h2><p><strong>FとJの出っぱり</strong>に<RubyLabel text="人差し指" />を置こう。<br /><b>ASDF ／ JKL…</b>を基準に、押したら元の場所へ戻るよ。</p></div><div className="finger-map-board"><FingerKeyboard overview /><div className="finger-legend" aria-label="指の色分け">{fingerLegend.map((guide) => <span key={`${guide.hand}-${guide.finger}`}><i style={{ background: guide.color }} aria-hidden="true" /><b><RubyLabel text={handName[guide.hand]} /></b> <RubyLabel text={guide.finger} /></span>)}</div></div></section>
    <section className="kana-course-grid">{KANA_COURSES.map((entry, courseIndex) => <button key={entry.id} className={entry.optional ? 'optional' : ''} style={{ '--course-color': entry.color } as React.CSSProperties} onClick={() => startCourse(entry)}><span>{entry.icon}</span><small>{entry.optional ? 'オプションルート' : `ルート ${courseIndex + 1}`}</small><h2>{entry.name}</h2><p>{entry.subtitle}</p><b>{entry.focus}</b><em>{completedIds.includes(entry.id) ? 'クリア ✓' : 'すすむ　▶'}</em></button>)}</section>
    <section className="kana-before-sentences"><span>🌉</span><div><b>この島をれんしゅうしたら…</b><p>1年生の短い文章へ進んで、覚えたローマ字を使ってみよう！</p></div></section>
  </main>

  return <main className={`kana-page kana-play-page ${result}`} onClick={() => inputRef.current?.focus()}>
    <header className="kana-play-header"><button onClick={() => { clearTimers(); setCourse(null) }}>‹ ルートをえらぶ</button><div><small>{course.icon} {course.name}ルート</small><b>{index + 1} / {course.items.length}</b><i><span style={{ width: `${((index + (finished ? 1 : 0)) / course.items.length) * 100}%` }} /></i></div><output>ミス {mistakes}</output></header>
    {finished ? <section className="kana-finish"><span>🎉</span><small>ROUTE CLEAR!</small><h1>{course.name}ルート クリア！</h1><p>{course.items.length}この問題を、さいごまで入力できたよ。</p><div><b>{course.items.length}<small>問題</small></b><b>{mistakes}<small>ミス</small></b></div><button aria-keyshortcuts="Space" onClick={continueAfterFinish}>{tutorial && course.unlocksAdventure ? '本編の冒険へ しゅっぱつ　▶' : nextCourse ? `つぎの「${nextCourse.name}」へ　▶` : 'ルート一覧へ戻る'}</button><small className="confirm-shortcut-hint">Spaceキーでも進める</small></section> : item && <section className="kana-practice-card">
      <div className="kana-level-label">{course.icon} {course.subtitle}</div>
      <p>この ひらがなを ローマ字で入力しよう</p>
      <div className="kana-target">{item.kana}</div>
      <div className="kana-romaji" aria-label={`入力するローマ字 ${item.romaji}`}>{[...shownRomaji].map((letter, letterIndex) => <span key={`${letter}-${letterIndex}`} className={letterIndex < typed.length ? 'done' : letterIndex === typed.length ? 'current' : ''}>{letter}</span>)}</div>
      {fingerGuide && <div className="finger-guidance" style={{ '--finger-color': fingerGuide.color } as React.CSSProperties}><div className={`guide-hand ${fingerGuide.hand}`}><span><RubyLabel text={handName[fingerGuide.hand]} /></span><b><RubyLabel text={fingerGuide.finger} /></b></div><p>つぎは <kbd>{primaryNextKey.toUpperCase()}</kbd> を <strong><RubyLabel text={handName[fingerGuide.hand]} />の<RubyLabel text={fingerGuide.finger} /></strong> で押そう</p></div>}
      <FingerKeyboard nextKeys={nextKeys} />
      <div className="kana-message">{result === 'wrong' ? 'ちがうキーだよ。もう一度！' : result === 'correct' ? 'せいかい！' : typed ? `「${typed}」まで入力したよ` : 'キーボードで入力してね'}</div>
      <div className="kana-tip">💡 {item.instruction ?? course.focus}</div>
      <input ref={inputRef} className="kana-hidden-input" inputMode="text" autoCapitalize="none" autoCorrect="off" onKeyDown={(event) => {
        if (event.code.startsWith('Key')) { event.preventDefault(); enterKey(event.code.slice(3).toLowerCase()) }
        else if (/^[0-9,./-]$/.test(event.key)) { event.preventDefault(); enterKey(event.key) }
        else if (event.key === 'Backspace') { event.preventDefault(); setTyped((value) => value.slice(0, -1)); setResult('idle') }
      }} />
    </section>}
  </main>
}
