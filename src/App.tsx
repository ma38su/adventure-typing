import { useEffect, useMemo, useRef, useState } from 'react'
import { QUESTIONS, type Grade } from './questions'
import { buildRomajiCandidates } from './romajiVariants'
import './App.css'

type Mistake = { questionId: string; sentence: string; expected: string; actual: string }
const ISLANDS = ['はじまりの浜', 'そよかぜの森', 'きらめきの湖', 'ほしふる山', 'ひみつの遺跡']
const ISLAND_ICONS = ['🏝️', '🌳', '💧', '⛰️', '🏛️']

function ProgressText({ text, romaji, typedLength, className }: { text: string; romaji: string; typedLength: number; className: string }) {
  const textParts = text.split(' ')
  const romajiParts = romaji.split(' ')
  let lettersBefore = 0

  return <>{textParts.map((part, index) => {
    const letters = romajiParts[index]?.length ?? 1
    const progress = Math.max(0, Math.min(100, ((typedLength - lettersBefore) / letters) * 100))
    lettersBefore += letters
    return <span key={`${part}-${index}`}><span className={`${className} ${progress === 100 ? 'done' : progress > 0 ? 'active' : ''}`} style={{ '--fill': `${progress}%` } as React.CSSProperties}>{part}</span>{index < textParts.length - 1 && ' '}</span>
  })}</>
}

function App() {
  const [started, setStarted] = useState(false)
  const [grade, setGrade] = useState<Grade>(1)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [notice, setNotice] = useState<{ kind: 'good' | 'bad'; text: string } | null>(null)
  const [stars, setStars] = useState(12)
  const [combo, setCombo] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const questions = QUESTIONS[grade]
  const question = questions[questionIndex]
  const canonicalRomaji = question.romaji.replaceAll(' ', '')
  const acceptedCandidates = useMemo(() => buildRomajiCandidates(canonicalRomaji, question.reading), [canonicalRomaji, question.reading])
  const matchingCandidates = acceptedCandidates.filter((candidate) => candidate.target.startsWith(typed))
  const displayProgress = matchingCandidates.length
    ? Math.min(...matchingCandidates.map((candidate) => candidate.displayProgress[typed.length] ?? 0))
    : 0
  const currentChar = canonicalRomaji[displayProgress] ?? ''
  const nextKeyOptions = [...new Set(matchingCandidates.map((candidate) => candidate.target[typed.length]).filter(Boolean))]
  const accuracy = useMemo(() => {
    const attempts = typed.length + mistakes.length
    return attempts ? Math.round((typed.length / attempts) * 100) : 100
  }, [typed.length, mistakes.length])

  useEffect(() => { inputRef.current?.focus({ preventScroll: true }) }, [questionIndex, grade, showReview, started])

  const nextQuestion = () => {
    setNotice({ kind: 'good', text: 'せいかい！ 島をひとつ進んだよ' })
    setStars((value) => value + 1)
    window.setTimeout(() => {
      if (questionIndex === questions.length - 1) setCompleted(true)
      else {
        setQuestionIndex((value) => value + 1)
        setTyped('')
        setCombo(0)
        setNotice(null)
      }
    }, 650)
  }

  const enterCharacters = (raw: string) => {
    if (completed || showReview) return
    let nextTyped = typed
    for (const key of raw.toLowerCase()) {
      if (!/^[a-z-]$/.test(key)) continue
      const candidatesBeforeKey = acceptedCandidates.filter((candidate) => candidate.target.startsWith(nextTyped))
      const expectedKeys = [...new Set(candidatesBeforeKey.map((candidate) => candidate.target[nextTyped.length]).filter(Boolean))]
      const attempted = nextTyped + key
      const candidatesAfterKey = candidatesBeforeKey.filter((candidate) => candidate.target.startsWith(attempted))
      if (candidatesAfterKey.length === 0) {
        const expected = expectedKeys.join(' / ')
        setMistakes((items) => [...items, { questionId: question.id, sentence: question.sentence, expected, actual: key }])
        setCombo(0)
        setNotice({ kind: 'bad', text: `「${key}」ではなく「${expected}」だよ。もう一度！` })
        return
      }
      nextTyped = attempted
      setCombo((value) => value + 1)
      setNotice(null)
    }
    setTyped(nextTyped)
    if (acceptedCandidates.some((candidate) => candidate.target === nextTyped)) nextQuestion()
  }

  const reset = (nextGrade: Grade = grade) => {
    setGrade(nextGrade)
    setQuestionIndex(0)
    setTyped('')
    setMistakes([])
    setNotice(null)
    setCompleted(false)
    setCombo(0)
  }

  if (!started) {
    return (
      <main className="title-screen">
        <div className="title-sky" aria-hidden="true"><span className="cloud cloud-one">☁</span><span className="cloud cloud-two">☁</span><span className="sun">☀</span></div>
        <button className="title-sound" onClick={() => setSoundOn(!soundOn)} aria-label={soundOn ? '音を消す' : '音を出す'}>{soundOn ? '♪' : '×'}</button>

        <section className="title-content">
          <div className="title-badge">⌨　ローマ字 × 漢字 × ぼうけん</div>
          <div className="game-logo">
            <span className="logo-kicker">めざせ！ 伝説のタイピング名人</span>
            <h1><span>ことば島</span><small>の</small><br />大ぼうけん</h1>
            <div className="logo-stars">★　★　★</div>
          </div>

          <div className="title-island" aria-hidden="true">
            <div className="island-back">🌴</div>
            <div className="island-main">🏝️</div>
            <span className="title-friend fox">🦊</span>
            <span className="title-friend bird">🐤</span>
            <span className="title-treasure">🧰</span>
            <span className="spark spark-one">✦</span><span className="spark spark-two">✦</span>
          </div>

          <div className="start-card">
            <p>どの学年の島へ ぼうけんする？</p>
            <div className="title-grade-switch" aria-label="学年を選ぶ">
              {([1, 2, 3] as Grade[]).map((value) => (
                <button key={value} className={grade === value ? 'active' : ''} onClick={() => setGrade(value)}><b>{value}</b><span>年生</span></button>
              ))}
            </div>
            <button className="start-button" onClick={() => { reset(grade); setStarted(true) }}><span>ぼうけんを はじめる</span><b>▶</b></button>
            <small>まちがえても大丈夫。どうぶつたちと楽しくおぼえよう！</small>
          </div>
        </section>

        <div className="title-waves" aria-hidden="true"><span>〰　〰　〰　〰　〰　〰　〰</span></div>
      </main>
    )
  }

  return (
    <main className="app-shell" onClick={() => inputRef.current?.focus()}>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">⌨</span><div><strong>ことば島</strong><small>の 大ぼうけん</small></div></div>
        <nav className="grade-switch" aria-label="学年を選ぶ">
          {([1, 2, 3] as Grade[]).map((value) => <button key={value} className={grade === value ? 'active' : ''} onClick={(event) => { event.stopPropagation(); reset(value) }}>{value}年生</button>)}
        </nav>
        <div className="player-stats">
          <span className="stat-pill">★ <b>{stars}</b></span>
          <button className="round-button" onClick={(event) => { event.stopPropagation(); setSoundOn(!soundOn) }} aria-label={soundOn ? '音を消す' : '音を出す'}>{soundOn ? '♪' : '×'}</button>
          <div className="avatar">🧭</div>
        </div>
      </header>

      <div className="world-layout">
        <aside className="map-panel panel">
          <div className="panel-heading"><span>⌖ ぼうけんマップ</span><b>{questionIndex + 1}/{questions.length}</b></div>
          <div className="route"><div className="route-line" />
            {questions.map((_, index) => {
              const state = index < questionIndex ? 'done' : index === questionIndex ? 'current' : 'locked'
              return <div className={`route-stop ${state}`} key={index}>
                <span className="island-bubble">{state === 'locked' ? '•' : ISLAND_ICONS[index % ISLAND_ICONS.length]}</span>
                <div><small>ステージ {index + 1}</small><strong>{ISLANDS[index % ISLANDS.length]}</strong></div>
                {state === 'done' && <span className="check">✓</span>}
                {state === 'current' && <span className="you-are-here">いまここ</span>}
              </div>
            })}
          </div>
          <div className="map-footer"><span>つぎのお宝まで</span><b>{questions.length - questionIndex} もん</b><div className="mini-progress"><i style={{ width: `${questionIndex / questions.length * 100}%` }} /></div></div>
        </aside>

        <section className="game-area">
          <div className="stage-title"><div><span>ステージ {questionIndex + 1}</span><h1>{ISLANDS[questionIndex % ISLANDS.length]}</h1></div><div className="xp-wrap"><span>レベル 3</span><div className="xp-bar"><i style={{ width: `${40 + questionIndex * 12}%` }} /></div><b>{40 + questionIndex * 12}/100</b></div></div>
          <div className={`typing-card panel ${notice?.kind === 'bad' ? 'has-error' : ''}`}>
            <div className="mission-label">📜 しまのことばを入力しよう</div>
            <div className="sentence-wrap">
              <p className="reading"><ProgressText text={question.reading} romaji={question.romaji} typedLength={displayProgress} className="reading-progress-part" /></p>
              <h2><ProgressText text={question.sentence} romaji={question.romaji} typedLength={displayProgress} className="sentence-progress-part" /></h2>
            </div>
            <div className="romaji-line" aria-label={`ローマ字 ${question.romaji}`}>{(() => {
              let letterIndex = 0
              return question.romaji.split('').map((char, index) => {
                if (char === ' ') return <span className="word-space" key={index}> </span>
                const position = letterIndex++
                const className = position < displayProgress ? 'typed' : position === displayProgress ? 'cursor-char' : 'remaining'
                return <span className={className} key={index}>{char}</span>
              })
            })()}</div>
            <div className="type-progress-track" aria-label={`入力進捗 ${Math.round(displayProgress / canonicalRomaji.length * 100)}パーセント`}><i style={{ width: `${displayProgress / canonicalRomaji.length * 100}%` }} /></div>
            <input ref={inputRef} className="typing-input" value="" onChange={() => {}} onKeyDown={(event) => {
              if (event.key === 'Backspace' && typed.length) {
                event.preventDefault()
                setTyped((value) => value.slice(0, -1))
                return
              }
              // IMEの状態ではなく、実際に押された物理キーを判定する。
              if (event.code.startsWith('Key')) {
                event.preventDefault()
                enterCharacters(event.code.slice(3).toLowerCase())
              } else if (event.code === 'Minus') {
                event.preventDefault()
                enterCharacters('-')
              }
            }} inputMode="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-label="ここにローマ字を入力" />
            <div className={`feedback ${notice?.kind ?? 'idle'}`} aria-live="polite">
              {notice?.kind === 'bad' ? <><span className="feedback-icon">!</span><div><strong>おしい！</strong><p>{notice.text}</p></div></> : notice?.kind === 'good' ? <><span className="feedback-icon">✓</span><div><strong>やったね！</strong><p>{notice.text}</p></div></> : <><span className="keyboard-hint">ABC</span><div><strong>日本語入力のままでもOK！</strong><p>つぎは「{nextKeyOptions.join(' / ') || currentChar}」を押そう。{nextKeyOptions.length > 1 ? 'どちらでも正解だよ！' : '表記が2つある音は、どちらでもOK！'}</p></div></>}
            </div>
            <div className="card-bottom"><span>ことばの意味：{question.meaning}</span><span className={combo >= 5 ? 'combo hot' : 'combo'}>🔥 {combo} コンボ</span></div>
          </div>
          <div className="tip"><span>💡</span><p><b>ローマ字ヒント</b>　「し」は <kbd>s</kbd> <kbd>h</kbd> <kbd>i</kbd> の順に入力するよ</p></div>
        </section>

        <aside className="side-panel">
          <section className="friends-card panel"><div className="panel-heading"><span>🐾 なかまたち</span><b>2/12</b></div><div className="friend-row"><div className="friend"><span>🦊</span><small>コン</small></div><div className="friend"><span>🐤</span><small>ピピ</small></div><div className="friend locked"><span>?</span><small>あと3問</small></div></div><p>正しく入力すると、島のどうぶつが仲間になるよ！</p></section>
          <button className="review-card panel" onClick={(event) => { event.stopPropagation(); setShowReview(true) }}><span className="review-icon">↻</span><div><strong>まちがいノート</strong><small>{mistakes.length ? `${mistakes.length}こ 復習できるよ` : 'いまは まちがいなし！'}</small></div><b>›</b></button>
          <section className="treasure-card panel"><div className="panel-heading"><span>お宝コレクション</span><b>3/20</b></div><div className="treasures"><span>🐚</span><span>🪙</span><span>🔮</span><span className="mystery">?</span></div><small>つぎは「にじ色のカギ」かも…</small></section>
          <div className="accuracy-card"><div className="accuracy-ring" style={{ '--score': `${accuracy * 3.6}deg` } as React.CSSProperties}><span>{accuracy}<small>%</small></span></div><div><small>今回のせいかくさ</small><strong>{accuracy >= 90 ? 'すばらしい！' : 'ゆっくりでOK！'}</strong></div></div>
        </aside>
      </div>

      {showReview && <div className="modal-backdrop" onClick={() => setShowReview(false)}><section className="review-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowReview(false)}>×</button><span className="modal-emoji">📓</span><h2>まちがいノート</h2><p>まちがえたキーを見て、もういちど覚えよう。</p>{mistakes.length === 0 ? <div className="empty-review">✨ まだまちがいはないよ。すごい！</div> : <div className="mistake-list">{mistakes.slice().reverse().map((item, index) => <div className="mistake-item" key={`${item.questionId}-${index}`}><span className="wrong-key">{item.actual}</span><span>→</span><span className="right-key">{item.expected}</span><p>{item.sentence}</p></div>)}</div>}<button className="primary-button" onClick={() => { setShowReview(false); setTyped(''); setNotice(null) }}>この問題をもう一度</button></section></div>}
      {completed && <div className="modal-backdrop"><section className="review-modal complete-modal"><span className="modal-emoji">🦦</span><p className="eyebrow">NEW FRIEND!</p><h2>ラッコの「モコ」が<br />仲間になった！</h2><p>全{questions.length}問クリア。お宝「にじ色のカギ」も手に入れたよ。</p><div className="reward">🦦 <span>＋</span> 🗝️</div><button className="primary-button" onClick={() => reset()}>もう一度ぼうけんする</button></section></div>}
    </main>
  )
}

export default App
