import type { ReactNode } from 'react'
import { splitUIRuby } from '../uiRuby'

export function UIRuby({ children, className }: { children: string; className?: string }): ReactNode {
  return <span className={['ui-ruby', className].filter(Boolean).join(' ')} aria-label={children}><span aria-hidden="true">{splitUIRuby(children).map((part, index) => part.reading
    ? <ruby key={`${part.text}-${index}`}>{part.text}<rt>{part.reading}</rt></ruby>
    : <span key={`${part.text}-${index}`}>{part.text}</span>)}</span></span>
}
