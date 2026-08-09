import { memo, type RefObject } from 'react'
import type { Question } from '../../questions'
import type { PracticeMode } from '../../game/gameRunReducer'
import { buildRomajiDisplay } from '../../romajiDisplay'
import { alignRomajiRuby } from '../../romajiRubyAlignment'
import { ProgressRuby } from './GameVisuals'
import { UIRuby } from '../UIRuby'
import type { TypingDisplayCase } from '../../domain'
import { resolveTypingInputAction } from '../../game/typingInputAction'

type Notice = { kind: 'good' | 'bad'; text: string } | null

export const TypingCard = memo(function TypingCard({ question, practiceMode, reviewTargetKeys, typed, displayProgress, inputDisplayProgress, canonicalRomaji, notice, awaitingFinish, combo, currentChar, nextKeyOptions, displayCase, inputRef, onTyped, onEnter, onDisplayCase }: { question: Question; practiceMode: PracticeMode; reviewTargetKeys: string[]; typed: string; displayProgress: number; inputDisplayProgress: number[]; canonicalRomaji: string; notice: Notice; awaitingFinish: boolean; combo: number; currentChar: string; nextKeyOptions: string[]; displayCase: TypingDisplayCase; inputRef: RefObject<HTMLInputElement | null>; onTyped: (typed: string) => void; onEnter: (raw: string) => void; onDisplayCase: (value: TypingDisplayCase) => void }) {
  const romajiDisplay = buildRomajiDisplay(question.romaji, typed, inputDisplayProgress)
  const show = (value: string) => displayCase === 'upper' ? value.toUpperCase() : value.toLowerCase()
  const spokenRomaji = show(romajiDisplay.map(({ character }) => character).join(''))
  const rubyAlignment = alignRomajiRuby(question.reading, question.romaji, typed, inputDisplayProgress)
  return <div className={`typing-card panel ${notice?.kind === 'bad' ? 'has-error' : ''} ${awaitingFinish ? 'is-complete' : ''}`}>
    <div className="mission-label"><UIRuby>{practiceMode === 'weak-keys' ? `🎯 「${reviewTargetKeys.join('・')}」が出てくる文を練習しよう` : '📜 しまのことばを入力しよう'}</UIRuby><span className="typing-case-switch" onClick={(event) => event.stopPropagation()}><button type="button" className={displayCase === 'lower' ? 'active' : ''} onClick={() => onDisplayCase('lower')}>abc</button><button type="button" className={displayCase === 'upper' ? 'active' : ''} onClick={() => onDisplayCase('upper')}>ABC</button></span></div>
    <div className="sentence-wrap"><h2><ProgressRuby phrases={question.ruby} romaji={question.romaji} typedLength={displayProgress} /></h2></div>
    <div className="romaji-line" aria-label={`入力中のローマ字 ${spokenRomaji}`} aria-live="polite"><span className="romaji-visual" aria-hidden="true">{rubyAlignment.aligned
      ? rubyAlignment.groups.map((group, groupIndex) => <span className="romaji-mora-wrap" key={`${group.canonicalStart}-${group.kana}-${groupIndex}`}>
        {group.separatorBefore && <span className="word-space"> </span>}
        {group.state === 'annotation' ? <span className="romaji-annotation">{group.kana}</span> : <ruby className={`romaji-mora ${group.state}`}>
          <span className="romaji-rb">{group.typed && <span className="typed">{show(group.typed)}</span>}
            {[...group.remnant].map((character, index) => {
              const state = group.state === 'current' && index === 0 ? 'cursor-char' : 'remaining'
              return <span className={state} key={index}>{show(character)}</span>
            })}</span>
          <rt>{group.kana}</rt>
        </ruby>}
      </span>)
      : romajiDisplay.map(({ character, state }, index) => state === 'space'
        ? <span className="word-space" key={index}> </span>
        : <span className={state} key={index}>{show(character)}</span>)}</span></div>
    <div className="type-progress-track" aria-label={`入力進捗 ${Math.round(displayProgress / canonicalRomaji.length * 100)}パーセント`}><i style={{ width: `${displayProgress / canonicalRomaji.length * 100}%` }} /></div>
    <input ref={inputRef} className="typing-input" value="" onChange={() => {}} onKeyDown={(event) => {
      const action = resolveTypingInputAction(event.code, typed)
      if (action.kind === 'ignore') return
      event.preventDefault()
      if (action.kind === 'backspace') onTyped(action.value)
      else onEnter(action.value)
    }} disabled={awaitingFinish} inputMode="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-label={`ここにローマ字を入力・${displayCase === 'upper' ? '大文字' : '小文字'}表示`} />
    <div className={`feedback ${notice?.kind ?? 'idle'}`} aria-live="polite">{notice?.kind === 'bad' ? <><span className="feedback-icon">!</span><div><strong>おしい！</strong><p>{notice.text}</p></div></> : notice?.kind === 'good' ? <><span className="feedback-icon">✓</span><div><strong>やったね！</strong><p>{notice.text}</p></div></> : <><span className="keyboard-hint">ABC</span><div><strong><UIRuby>日本語入力</UIRuby>のままでもOK！</strong><p>つぎは「{show(nextKeyOptions.join(' / ') || currentChar)}」を<UIRuby>押そう</UIRuby>。{nextKeyOptions.length > 1 ? <UIRuby>どちらでも正解だよ！</UIRuby> : <><UIRuby>表記</UIRuby>が2つある<UIRuby>音</UIRuby>は、どちらでもOK！</>}</p></div></>}</div>
    <div className="card-bottom"><span>ことばの<UIRuby>意味</UIRuby>：{question.meaning}</span><span className={combo >= 5 ? 'combo hot' : 'combo'}>🔥 {combo} コンボ</span></div>
  </div>
})
