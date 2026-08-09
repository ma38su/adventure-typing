import { memo, type RefObject } from 'react'
import type { Question } from '../../questions'
import type { PracticeMode } from '../../game/gameRunReducer'
import { buildRomajiDisplay } from '../../romajiDisplay'
import { alignRomajiRuby } from '../../romajiRubyAlignment'
import { ProgressRuby } from './GameVisuals'

type Notice = { kind: 'good' | 'bad'; text: string } | null

export const TypingCard = memo(function TypingCard({ question, practiceMode, reviewTargetKeys, typed, displayProgress, inputDisplayProgress, canonicalRomaji, notice, awaitingFinish, combo, currentChar, nextKeyOptions, inputRef, onTyped, onEnter }: { question: Question; practiceMode: PracticeMode; reviewTargetKeys: string[]; typed: string; displayProgress: number; inputDisplayProgress: number[]; canonicalRomaji: string; notice: Notice; awaitingFinish: boolean; combo: number; currentChar: string; nextKeyOptions: string[]; inputRef: RefObject<HTMLInputElement | null>; onTyped: (typed: string) => void; onEnter: (raw: string) => void }) {
  const romajiDisplay = buildRomajiDisplay(question.romaji, typed, inputDisplayProgress)
  const spokenRomaji = romajiDisplay.map(({ character }) => character).join('')
  const rubyAlignment = alignRomajiRuby(question.reading, question.romaji, typed, inputDisplayProgress)
  return <div className={`typing-card panel ${notice?.kind === 'bad' ? 'has-error' : ''} ${awaitingFinish ? 'is-complete' : ''}`}>
    <div className="mission-label">{practiceMode === 'weak-keys' ? `🎯 「${reviewTargetKeys.join('・')}」が出てくる文を練習しよう` : '📜 しまのことばを入力しよう'}</div>
    <div className="sentence-wrap"><h2><ProgressRuby phrases={question.ruby} romaji={question.romaji} typedLength={displayProgress} /></h2></div>
    <div className="romaji-line" aria-label={`入力中のローマ字 ${spokenRomaji}`} aria-live="polite"><span className="romaji-visual" aria-hidden="true">{rubyAlignment.aligned
      ? rubyAlignment.groups.map((group, groupIndex) => <span className="romaji-mora-wrap" key={`${group.canonicalStart}-${group.kana}-${groupIndex}`}>
        {group.separatorBefore && <span className="word-space"> </span>}
        {group.state === 'annotation' ? <span className="romaji-annotation">{group.kana}</span> : <ruby className={`romaji-mora ${group.state}`}>
          <span className="romaji-rb">{group.typed && <span className="typed">{group.typed}</span>}
            {[...group.remnant].map((character, index) => {
              const state = group.state === 'current' && index === 0 ? 'cursor-char' : 'remaining'
              return <span className={state} key={index}>{character}</span>
            })}</span>
          <rt>{group.kana}</rt>
        </ruby>}
      </span>)
      : romajiDisplay.map(({ character, state }, index) => state === 'space'
        ? <span className="word-space" key={index}> </span>
        : <span className={state} key={index}>{character}</span>)}</span></div>
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
