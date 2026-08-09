import { useEffect, useMemo, useRef, useState } from 'react'
import { buildRomajiCandidates } from './romajiVariants'
import { KANA_COURSES, type KanaCourse } from './kanaPractice'

type Result = 'idle' | 'wrong' | 'correct'

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

  const enterKey = (key: string) => {
    if (!course || !item || finished || result === 'correct' || !/^[a-z-]$/.test(key)) return
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
        if (tutorial) onTutorialComplete()
        setFinished(true)
      } else {
        setIndex((value) => value + 1); setTyped(''); setResult('idle')
      }
    }, 430)
  }

  if (!course) return <main className="kana-page kana-course-page">
    <header className="catalog-topbar"><button className="catalog-back" onClick={onBack}>‹ もどる</button><div className="brand"><span className="brand-mark">あ</span><div><strong>ローマ字ステージ</strong><small>文章のまえの 1文字れんしゅう</small></div></div><div className="catalog-overall"><b>{completedIds.length}</b> / {KANA_COURSES.length} ステージ</div></header>
    <section className="kana-course-hero"><span>ABC</span><div><small>{tutorial ? 'はじめての ぼうけん準備！' : 'まずは ここから！'}</small><h1>ひらがなを見て、ローマ字を打とう</h1><p>{tutorial ? '最初の「母音の浜」をクリアすると、そのまま本編の冒険へ進めるよ。' : '音のなかまごとに、少しずつレベルアップ。表示とちがう打ちかたでも、正しいローマ字ならせいかいになるよ。'}</p></div></section>
    <section className="kana-course-grid">{KANA_COURSES.map((entry, courseIndex) => <button key={entry.id} style={{ '--course-color': entry.color } as React.CSSProperties} onClick={() => startCourse(entry)}><span>{entry.icon}</span><small>レベル {courseIndex + 1}</small><h2>{entry.name}</h2><p>{entry.subtitle}</p><b>{entry.items.length}もじ</b><em>{completedIds.includes(entry.id) ? 'クリア ✓' : 'はじめる　▶'}</em></button>)}</section>
    <section className="kana-before-sentences"><span>🌉</span><div><b>この島をれんしゅうしたら…</b><p>1年生の短い文章へ進んで、覚えたローマ字を使ってみよう！</p></div></section>
  </main>

  return <main className={`kana-page kana-play-page ${result}`} onClick={() => inputRef.current?.focus()}>
    <header className="kana-play-header"><button onClick={() => { clearTimers(); setCourse(null) }}>‹ ステージをえらぶ</button><div><small>{course.icon} {course.name}</small><b>{index + 1} / {course.items.length}</b><i><span style={{ width: `${((index + (finished ? 1 : 0)) / course.items.length) * 100}%` }} /></i></div><output>ミス {mistakes}</output></header>
    {finished ? <section className="kana-finish"><span>🎉</span><small>ROMAJI STAGE CLEAR!</small><h1>{course.name} クリア！</h1><p>{course.items.length}この音を、さいごまで入力できたよ。</p><div><b>{course.items.length}<small>もじ</small></b><b>{mistakes}<small>ミス</small></b></div>{tutorial ? <button onClick={onStartAdventure}>本編の冒険へ しゅっぱつ　▶</button> : <button onClick={() => { clearTimers(); setCourse(null) }}>つぎのステージをえらぶ　▶</button>}</section> : item && <section className="kana-practice-card">
      <div className="kana-level-label">{course.icon} {course.subtitle}</div>
      <p>この ひらがなを ローマ字で入力しよう</p>
      <div className="kana-target">{item.kana}</div>
      <div className="kana-romaji" aria-label={`入力するローマ字 ${item.romaji}`}>{[...shownRomaji].map((letter, letterIndex) => <span key={`${letter}-${letterIndex}`} className={letterIndex < typed.length ? 'done' : letterIndex === typed.length ? 'current' : ''}>{letter}</span>)}</div>
      <div className="kana-message">{result === 'wrong' ? 'ちがうキーだよ。もう一度！' : result === 'correct' ? 'せいかい！' : typed ? `「${typed}」まで入力したよ` : 'キーボードで入力してね'}</div>
      <div className="kana-tip">💡 表示は学校で習うローマ字。ほかの正しい打ちかたもOK！</div>
      <input ref={inputRef} className="kana-hidden-input" inputMode="text" autoCapitalize="none" autoCorrect="off" onKeyDown={(event) => {
        if (event.code.startsWith('Key')) { event.preventDefault(); enterKey(event.code.slice(3).toLowerCase()) }
        else if (event.key === 'Backspace') { event.preventDefault(); setTyped((value) => value.slice(0, -1)); setResult('idle') }
      }} />
    </section>}
  </main>
}
