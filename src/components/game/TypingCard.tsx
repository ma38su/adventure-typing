import { memo, type RefObject } from 'react'
import type { Question } from '../../questions'
import type { PracticeMode } from '../../game/gameRunReducer'
import { ProgressRuby } from './GameVisuals'

type Notice = { kind: 'good' | 'bad'; text: string } | null

export const TypingCard = memo(function TypingCard({ question, practiceMode, reviewTargetKeys, typed, displayProgress, canonicalRomaji, notice, awaitingFinish, combo, currentChar, nextKeyOptions, inputRef, onTyped, onEnter }: { question: Question; practiceMode: PracticeMode; reviewTargetKeys: string[]; typed: string; displayProgress: number; canonicalRomaji: string; notice: Notice; awaitingFinish: boolean; combo: number; currentChar: string; nextKeyOptions: string[]; inputRef: RefObject<HTMLInputElement | null>; onTyped: (typed: string) => void; onEnter: (raw: string) => void }) {
  return <div className={`typing-card panel ${notice?.kind === 'bad' ? 'has-error' : ''} ${awaitingFinish ? 'is-complete' : ''}`}>
    <div className="mission-label">{practiceMode === 'weak-keys' ? `🎯 「${reviewTargetKeys.join('・')}」が出てくる文を練習しよう` : '📜 しまのことばを入力しよう'}</div>
    <div className="sentence-wrap"><h2><ProgressRuby phrases={question.ruby} romaji={question.romaji} typedLength={displayProgress} /></h2></div>
    <div className="romaji-line" aria-label={`ローマ字 ${question.romaji}`}>{(() => { let letterIndex = 0; return question.romaji.split('').map((char, index) => { if (char === ' ') return <span className="word-space" key={index}> </span>; const position = letterIndex++; const className = position < displayProgress ? 'typed' : position === displayProgress ? 'cursor-char' : 'remaining'; return <span className={className} key={index}>{char}</span> }) })()}</div>
    <div className={`actual-input ${typed ? 'has-input' : ''}`} aria-live="polite"><span>入力したキー</span><code>{typed || '―'}</code>{typed && typed !== canonicalRomaji.slice(0, displayProgress) && <b>この打ち方も正解！</b>}</div>
    <div className="type-progress-track" aria-label={`入力進捗 ${Math.round(displayProgress / canonicalRomaji.length * 100)}パーセント`}><i style={{ width: `${displayProgress / canonicalRomaji.length * 100}%` }} /></div>
    <input ref={inputRef} className="typing-input" value="" onChange={() => {}} onKeyDown={(event) => {
      if (event.key === 'Backspace' && typed.length) { event.preventDefault(); onTyped(typed.slice(0, -1)); return }
      if (event.code.startsWith('Key')) { event.preventDefault(); onEnter(event.code.slice(3).toLowerCase()) }
      else if (event.code === 'Minus') { event.preventDefault(); onEnter('-') }
    }} disabled={awaitingFinish} inputMode="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-label="ここにローマ字を入力" />
    <div className={`feedback ${notice?.kind ?? 'idle'}`} aria-live="polite">{notice?.kind === 'bad' ? <><span className="feedback-icon">!</span><div><strong>おしい！</strong><p>{notice.text}</p></div></> : notice?.kind === 'good' ? <><span className="feedback-icon">✓</span><div><strong>やったね！</strong><p>{notice.text}</p></div></> : <><span className="keyboard-hint">ABC</span><div><strong>日本語入力のままでもOK！</strong><p>つぎは「{nextKeyOptions.join(' / ') || currentChar}」を押そう。{nextKeyOptions.length > 1 ? 'どちらでも正解だよ！' : '表記が2つある音は、どちらでもOK！'}</p></div></>}</div>
    <div className="card-bottom"><span>ことばの意味：{question.meaning}</span><span className={combo >= 5 ? 'combo hot' : 'combo'}>🔥 {combo} コンボ</span></div>
  </div>
})
