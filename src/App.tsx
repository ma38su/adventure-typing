import { useEffect, useMemo, useRef, useState } from 'react'
import { QUESTIONS, type Grade } from './questions'
import { buildRomajiCandidates } from './romajiVariants'
import './App.css'

type Mistake = { questionId: string; sentence: string; expected: string; actual: string }
const LEARNING_STAGES = [
  { name: 'ことばの小道', icon: '🌱', label: 'みじかい文', background: '/backgrounds/stage-beach.png' },
  { name: 'ぶんしょうの森', icon: '🌳', label: 'ふつうの文', background: '/backgrounds/stage-forest.png' },
  { name: 'ものがたりの山', icon: '⛰️', label: 'ながい文', background: '/backgrounds/stage-mountain.png' },
]
const STAGE_EVENTS = [
  { action: 'drink', icon: '💧', text: 'お水を飲んで ひと休み' },
  { action: 'rest', icon: '🎁', text: '宝箱を 見つけた！', asset: '/treasures/chest.png' },
  { action: 'rest', icon: '🐿️', text: '森のリスに 出会った！', asset: '/companions/squirrel.png' },
  { action: 'rest', icon: '🪙', text: '古いコンパスを 手に入れた！', asset: '/treasures/compass.png' },
  { action: 'rest', icon: '🦦', text: 'ラッコが 応援にきた！', asset: '/companions/otter.png' },
] as const
const TITLE_ISLANDS: Record<Grade, { name: string; back: string; main: string; friend: string; treasure: string }> = {
  1: { name: 'はじまりの浜', back: '🌴', main: '🏝️', friend: '🦊', treasure: '🐚' },
  2: { name: 'そよかぜの森', back: '🌲', main: '🏞️', friend: '🐿️', treasure: '🍎' },
  3: { name: 'ほしふる山', back: '🏔️', main: '⛰️', friend: '🦅', treasure: '💎' },
}

function RubyPhrase({ markup }: { markup: string }) {
  const parts = [...markup.matchAll(/\[([^:]+):([^\]]+)\]|([^[]+)/g)]
  return <>{parts.map((part, index) => part[1]
    ? <ruby key={index}>{part[1]}<rt>{part[2]}</rt></ruby>
    : <span key={index}>{part[3]}</span>)}</>
}

function ProgressRuby({ phrases, romaji, typedLength }: { phrases: string[]; romaji: string; typedLength: number }) {
  const romajiParts = romaji.split(' ')
  let lettersBefore = 0

  return <>{phrases.map((phrase, index) => {
    const letters = romajiParts[index]?.length ?? 1
    const progress = Math.max(0, Math.min(100, ((typedLength - lettersBefore) / letters) * 100))
    lettersBefore += letters
    return <span key={`${phrase}-${index}`}><span className={`sentence-progress-part ${progress === 100 ? 'done' : progress > 0 ? 'active' : ''}`} style={{ '--fill': `${progress}%` } as React.CSSProperties}><RubyPhrase markup={phrase} /></span>{index < phrases.length - 1 && ' '}</span>
  })}</>
}

type CharacterStyle = 'girl' | 'boy'

function Explorer({ variant }: { variant: CharacterStyle }) {
  return <div className={`explorer anime-explorer ${variant}`} aria-hidden="true">
    <img src={`/characters/${variant === 'girl' ? 'mina' : 'sora'}.png`} alt="" draggable={false} />
    <span className="anime-canteen" />
  </div>
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
  const [characterStyle, setCharacterStyle] = useState<CharacterStyle>('girl')
  const [stepQueue, setStepQueue] = useState(0)
  const [stageWalked, setStageWalked] = useState(0)
  const [awaitingFinish, setAwaitingFinish] = useState(false)
  const [adventureAction, setAdventureAction] = useState<'idle' | 'walk' | 'rest' | 'drink'>('idle')
  const [adventureEvent, setAdventureEvent] = useState<(typeof STAGE_EVENTS)[number] | null>(null)
  const [titleTransition, setTitleTransition] = useState<'next' | 'prev' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const titleTransitionTimer = useRef<number | null>(null)

  const questions = QUESTIONS[grade]
  const question = questions[questionIndex]
  const stageIndex = question.stage - 1
  const stageQuestions = questions.filter((item) => item.stage === question.stage)
  const questionInStage = stageQuestions.findIndex((item) => item.id === question.id) + 1
  const canonicalRomaji = question.romaji.replaceAll(' ', '')
  const acceptedCandidates = useMemo(() => buildRomajiCandidates(canonicalRomaji, question.reading), [canonicalRomaji, question.reading])
  const matchingCandidates = acceptedCandidates.filter((candidate) => candidate.target.startsWith(typed))
  const displayProgress = matchingCandidates.length
    ? Math.min(...matchingCandidates.map((candidate) => candidate.displayProgress[typed.length] ?? 0))
    : 0
  const currentChar = canonicalRomaji[displayProgress] ?? ''
  const nextKeyOptions = [...new Set(matchingCandidates.map((candidate) => candidate.target[typed.length]).filter(Boolean))]
  const titleIsland = TITLE_ISLANDS[grade]
  const estimatedStepsLeft = Math.max(0, canonicalRomaji.length - displayProgress)
  const estimatedTotalSteps = Math.max(1, stageWalked + stepQueue + estimatedStepsLeft)
  const stepDelay = stepQueue >= 12 ? 42 : stepQueue >= 7 ? 58 : stepQueue >= 3 ? 82 : 115
  const walkPercent = awaitingFinish && stepQueue === 0
    ? 91
    : 6 + (stageWalked / estimatedTotalSteps) * 85
  const accuracy = useMemo(() => {
    const attempts = typed.length + mistakes.length
    return attempts ? Math.round((typed.length / attempts) * 100) : 100
  }, [typed.length, mistakes.length])

  useEffect(() => { inputRef.current?.focus({ preventScroll: true }) }, [questionIndex, grade, showReview, started])

  useEffect(() => {
    if (!started || stepQueue <= 0) return
    const timer = window.setTimeout(() => {
      setStepQueue((value) => Math.max(0, value - 1))
      setStageWalked((value) => value + 1)
      setAdventureAction('walk')
    }, stepDelay)
    return () => window.clearTimeout(timer)
  }, [started, stepQueue, stepDelay])

  useEffect(() => {
    if (stepQueue > 0 || awaitingFinish || adventureAction !== 'walk') return
    const timer = window.setTimeout(() => setAdventureAction('idle'), 180)
    return () => window.clearTimeout(timer)
  }, [stepQueue, awaitingFinish, adventureAction])

  useEffect(() => {
    if (!awaitingFinish || stepQueue > 0) return
    const event = STAGE_EVENTS[questionIndex % STAGE_EVENTS.length]
    setAdventureAction(event.action)
    setAdventureEvent(event)
    setNotice({ kind: 'good', text: event.text })
    setStars((value) => value + 1)

    const timer = window.setTimeout(() => {
      if (questionIndex === questions.length - 1) setCompleted(true)
      else setQuestionIndex((value) => value + 1)
      setTyped('')
      setCombo(0)
      setNotice(null)
      setAwaitingFinish(false)
      setAdventureEvent(null)
      setAdventureAction('idle')
      setStageWalked(0)
    }, 1450)
    return () => window.clearTimeout(timer)
  }, [awaitingFinish, stepQueue, questionIndex, questions.length])

  const finishQuestion = () => {
    setAwaitingFinish(true)
    setNotice({ kind: 'good', text: stepQueue > 0 ? `あと ${stepQueue}歩、冒険者が追いつくよ！` : 'ゴール！ ちょっとひと休み…' })
  }

  const enterCharacters = (raw: string) => {
    if (completed || showReview || awaitingFinish) return
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
      setStepQueue((value) => value + 1)
      setCombo((value) => value + 1)
      setNotice(null)
    }
    setTyped(nextTyped)
    if (acceptedCandidates.some((candidate) => candidate.target === nextTyped)) finishQuestion()
  }

  const reset = (nextGrade: Grade = grade) => {
    setGrade(nextGrade)
    setQuestionIndex(0)
    setTyped('')
    setMistakes([])
    setNotice(null)
    setCompleted(false)
    setCombo(0)
    setStepQueue(0)
    setStageWalked(0)
    setAwaitingFinish(false)
    setAdventureAction('idle')
    setAdventureEvent(null)
  }

  const selectTitleGrade = (nextGrade: Grade) => {
    if (nextGrade === grade) return
    if (titleTransitionTimer.current) window.clearTimeout(titleTransitionTimer.current)
    setTitleTransition(nextGrade > grade ? 'next' : 'prev')
    setGrade(nextGrade)
    titleTransitionTimer.current = window.setTimeout(() => setTitleTransition(null), 720)
  }

  if (!started) {
    return (
      <main className={`title-screen title-grade-${grade}`}>
        <div className="title-sky" aria-hidden="true"><span className="cloud cloud-one">☁</span><span className="cloud cloud-two">☁</span><span className="sun">☀</span></div>
        <button className="title-sound" onClick={() => setSoundOn(!soundOn)} aria-label={soundOn ? '音を消す' : '音を出す'}>{soundOn ? '♪' : '×'}</button>

        <section className="title-content">
          <div className="title-badge">⌨　ローマ字 × 漢字 × ぼうけん</div>
          <div className="game-logo">
            <span className="logo-kicker">めざせ！ 伝説のタイピング名人</span>
            <h1><span>ことば島</span><small>の</small><br />大ぼうけん</h1>
            <div className="logo-stars">★　★　★</div>
          </div>

          <div className={`title-island ${titleTransition ?? 'settled'}`} key={grade} aria-hidden="true">
            <div className="island-back">{titleIsland.back}</div>
            <div className="island-main">{titleIsland.main}</div>
            <span className="title-friend fox">{titleIsland.friend}</span>
            <span className="title-friend bird">🐤</span>
            <span className="title-treasure">{titleIsland.treasure}</span>
            <span className="spark spark-one">✦</span><span className="spark spark-two">✦</span>
          </div>
          {titleTransition && <div className={`title-voyage ${titleTransition}`} aria-hidden="true"><span>⛵</span><i>〰 〰 〰</i></div>}

          <div className="start-card">
            <p><b>{titleIsland.name}</b>へ ぼうけんする？</p>
            <div className="title-grade-switch" aria-label="学年を選ぶ">
              {([1, 2, 3] as Grade[]).map((value) => (
                <button key={value} className={grade === value ? 'active' : ''} onClick={() => selectTitleGrade(value)}><b>{value}</b><span>年生</span></button>
              ))}
            </div>
            <div className="character-picker">
              <span>ぼうけんしゃを えらぼう</span>
              <div>
                <button className={characterStyle === 'girl' ? 'active' : ''} onClick={() => setCharacterStyle('girl')} aria-label="女の子のミナを選ぶ"><span className="character-preview"><Explorer variant="girl" /></span><b>ミナ</b><small>女の子</small></button>
                <button className={characterStyle === 'boy' ? 'active' : ''} onClick={() => setCharacterStyle('boy')} aria-label="男の子のソラを選ぶ"><span className="character-preview"><Explorer variant="boy" /></span><b>ソラ</b><small>男の子</small></button>
              </div>
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
          <div className="avatar character-avatar" aria-label={`冒険者 ${characterStyle === 'girl' ? 'ミナ' : 'ソラ'}`}><img src={`/characters/${characterStyle === 'girl' ? 'mina' : 'sora'}.png`} alt="" /></div>
        </div>
      </header>

      <div className="world-layout">
        <aside className="map-panel panel">
          <div className="panel-heading"><span>⌖ れんしゅうマップ</span><b>{questionIndex + 1}/{questions.length}</b></div>
          <div className="route"><div className="route-line" />
            {LEARNING_STAGES.map((stage, index) => {
              const state = index < stageIndex ? 'done' : index === stageIndex ? 'current' : 'locked'
              return <div className={`route-stop ${state}`} key={stage.name}>
                <span className="island-bubble">{state === 'locked' ? '•' : stage.icon}</span>
                <div><small>ステージ {index + 1}・{stage.label}</small><strong>{stage.name}</strong></div>
                {state === 'done' && <span className="check">✓</span>}
                {state === 'current' && <span className="you-are-here">いまここ</span>}
              </div>
            })}
          </div>
          <div className="map-footer"><span>ぜんぶの問題</span><b>{questionIndex + 1} / {questions.length}</b><div className="mini-progress"><i style={{ width: `${questionIndex / questions.length * 100}%` }} /></div></div>
        </aside>

        <section className="game-area">
          <div className="stage-title"><div><span>ステージ {question.stage}・{LEARNING_STAGES[stageIndex].label}</span><h1>{LEARNING_STAGES[stageIndex].name}</h1></div><div className="xp-wrap"><span>問題 {questionInStage}/{stageQuestions.length}</span><div className="xp-bar"><i style={{ width: `${questionInStage / stageQuestions.length * 100}%` }} /></div><b>{questionIndex + 1}/{questions.length}</b></div></div>
          <div className={`adventure-scene panel scene-${stageIndex} ${adventureAction}`} style={{ '--step-speed': `${stepDelay}ms`, backgroundImage: `url(${LEARNING_STAGES[stageIndex].background})` } as React.CSSProperties} aria-label={`冒険者の歩み。あと${stepQueue}歩待ち`}>
            <div className="scene-sky"><span className="scene-cloud">☁</span><span className="scene-birds">⌁　⌁</span></div>
            <div className="scene-hills"><i /><i /></div>
            <span className="scene-start">⚑</span>
            <span className="scene-goal">{LEARNING_STAGES[stageIndex].icon}</span>
            <div className="walking-path"><i style={{ width: `${walkPercent}%` }} /></div>
            <div className={`adventurer ${adventureAction}`} style={{ left: `${walkPercent}%` }}>
              {adventureEvent && <div className="adventure-event">{'asset' in adventureEvent ? <img src={adventureEvent.asset} alt="" /> : <b>{adventureEvent.icon}</b>}<span>{adventureEvent.text}</span></div>}
              <Explorer variant={characterStyle} key={stageWalked} />
              <span className="step-shadow" />
            </div>
            <div className={`walk-status ${stepQueue >= 7 ? 'speed-up' : ''}`}><b>{stepQueue >= 7 ? 'スピードアップ！' : adventureAction === 'walk' ? 'てくてく…' : adventureAction === 'idle' ? 'キーを打つと歩くよ！' : 'ちょっと休憩中'}</b>{stepQueue > 0 && <span>あと {stepQueue} 歩ぶん</span>}</div>
          </div>
          <div className={`typing-card panel ${notice?.kind === 'bad' ? 'has-error' : ''}`}>
            <div className="mission-label">📜 しまのことばを入力しよう</div>
            <div className="sentence-wrap">
              <h2><ProgressRuby phrases={question.ruby} romaji={question.romaji} typedLength={displayProgress} /></h2>
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
            }} disabled={awaitingFinish} inputMode="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-label="ここにローマ字を入力" />
            <div className={`feedback ${notice?.kind ?? 'idle'}`} aria-live="polite">
              {notice?.kind === 'bad' ? <><span className="feedback-icon">!</span><div><strong>おしい！</strong><p>{notice.text}</p></div></> : notice?.kind === 'good' ? <><span className="feedback-icon">✓</span><div><strong>やったね！</strong><p>{notice.text}</p></div></> : <><span className="keyboard-hint">ABC</span><div><strong>日本語入力のままでもOK！</strong><p>つぎは「{nextKeyOptions.join(' / ') || currentChar}」を押そう。{nextKeyOptions.length > 1 ? 'どちらでも正解だよ！' : '表記が2つある音は、どちらでもOK！'}</p></div></>}
            </div>
            <div className="card-bottom"><span>ことばの意味：{question.meaning}</span><span className={combo >= 5 ? 'combo hot' : 'combo'}>🔥 {combo} コンボ</span></div>
          </div>
          <div className="tip"><span>💡</span><p><b>ローマ字ヒント</b>　「し」は <kbd>s</kbd> <kbd>h</kbd> <kbd>i</kbd> の順に入力するよ</p></div>
        </section>

        <aside className="side-panel">
          <section className="friends-card panel"><div className="panel-heading"><span>🐾 なかまたち</span><b>2/12</b></div><div className="friend-row"><div className="friend"><img src="/companions/fox.png" alt="キツネのコン" /><small>コン</small></div><div className="friend"><img src="/companions/bird.png" alt="小鳥のピピ" /><small>ピピ</small></div><div className="friend locked"><span>?</span><small>あと3問</small></div></div><p>正しく入力すると、島のどうぶつが仲間になるよ！</p></section>
          <button className="review-card panel" onClick={(event) => { event.stopPropagation(); setShowReview(true) }}><span className="review-icon">↻</span><div><strong>まちがいノート</strong><small>{mistakes.length ? `${mistakes.length}こ 復習できるよ` : 'いまは まちがいなし！'}</small></div><b>›</b></button>
          <section className="treasure-card panel"><div className="panel-heading"><span>お宝コレクション</span><b>3/20</b></div><div className="treasures"><span><img src="/treasures/rainbow-shell.png" alt="にじ色の貝" /></span><span><img src="/treasures/compass.png" alt="古いコンパス" /></span><span><img src="/treasures/star-crystal.png" alt="星の結晶" /></span><span className="mystery">?</span></div><small>つぎは「ひみつの宝箱」かも…</small></section>
          <div className="accuracy-card"><div className="accuracy-ring" style={{ '--score': `${accuracy * 3.6}deg` } as React.CSSProperties}><span>{accuracy}<small>%</small></span></div><div><small>今回のせいかくさ</small><strong>{accuracy >= 90 ? 'すばらしい！' : 'ゆっくりでOK！'}</strong></div></div>
        </aside>
      </div>

      {showReview && <div className="modal-backdrop" onClick={() => setShowReview(false)}><section className="review-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowReview(false)}>×</button><span className="modal-emoji">📓</span><h2>まちがいノート</h2><p>まちがえたキーを見て、もういちど覚えよう。</p>{mistakes.length === 0 ? <div className="empty-review">✨ まだまちがいはないよ。すごい！</div> : <div className="mistake-list">{mistakes.slice().reverse().map((item, index) => <div className="mistake-item" key={`${item.questionId}-${index}`}><span className="wrong-key">{item.actual}</span><span>→</span><span className="right-key">{item.expected}</span><p>{item.sentence}</p></div>)}</div>}<button className="primary-button" onClick={() => { setShowReview(false); setTyped(''); setNotice(null) }}>この問題をもう一度</button></section></div>}
      {completed && <div className="modal-backdrop"><section className="review-modal complete-modal"><span className="modal-emoji">🦦</span><p className="eyebrow">NEW FRIEND!</p><h2>ラッコの「モコ」が<br />仲間になった！</h2><p>全{questions.length}問クリア。お宝「にじ色のカギ」も手に入れたよ。</p><div className="reward">🦦 <span>＋</span> 🗝️</div><button className="primary-button" onClick={() => reset()}>もう一度ぼうけんする</button></section></div>}
    </main>
  )
}

export default App
