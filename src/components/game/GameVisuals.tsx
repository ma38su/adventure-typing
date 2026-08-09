import type { CharacterStyle } from '../../domain'
import type { RewardDefinition } from '../../rewards'

export function RubyPhrase({ markup }: { markup: string }) {
  const parts = [...markup.matchAll(/\[([^:]+):([^\]]+)\]|([^[]+)/g)]
  return <>{parts.map((part, index) => part[1]
    ? <ruby key={index}>{part[1]}<rt>{part[2]}</rt></ruby>
    : <span key={index}>{part[3]}</span>)}</>
}

export function ProgressRuby({ phrases, romaji, typedLength }: { phrases: string[]; romaji: string; typedLength: number }) {
  const romajiParts = romaji.split(' ')
  let lettersBefore = 0
  return <>{phrases.map((phrase, index) => {
    const letters = romajiParts[index]?.length ?? 1
    const progress = Math.max(0, Math.min(100, ((typedLength - lettersBefore) / letters) * 100))
    lettersBefore += letters
    return <span key={`${phrase}-${index}`}><span className={`sentence-progress-part ${progress === 100 ? 'done' : progress > 0 ? 'active' : ''}`} style={{ '--fill': `${progress}%` } as React.CSSProperties}><RubyPhrase markup={phrase} /></span>{index < phrases.length - 1 && ' '}</span>
  })}</>
}

export function Explorer({ variant }: { variant: CharacterStyle }) {
  return <div className={`explorer anime-explorer ${variant}`} aria-hidden="true"><img src={`/characters/${variant === 'girl' ? 'mina' : 'sora'}.webp`} alt="" draggable={false} decoding="async" /><span className="anime-canteen" /></div>
}

export function RewardVisual({ reward }: { reward: RewardDefinition }) {
  return reward.asset
    ? <img src={reward.asset} alt={reward.name} loading="lazy" decoding="async" />
    : <span className="reward-emoji" role="img" aria-label={reward.name}>{reward.icon}</span>
}
