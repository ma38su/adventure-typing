import { createRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TypingCard } from './TypingCard'

const question = { id: 'shi', stage: 1 as const, section: 1 as const, sentence: '島', reading: 'しま', ruby: ['[島:しま]'], romaji: 'shima', focus: '', meaning: 'しま' }
const common = { question, practiceMode: 'adventure' as const, reviewTargetKeys: [], typed: 's', displayProgress: 1, inputDisplayProgress: [0, 1], canonicalRomaji: 'shima', notice: null, awaitingFinish: false, combo: 0, currentChar: 'h', nextKeyOptions: ['h'], inputRef: createRef<HTMLInputElement>(), onTyped: vi.fn(), onEnter: vi.fn(), onDisplayCase: vi.fn() }

describe('TypingCard display case', () => {
  it('shows accepted text, remnant, cursor and aria text in lowercase', () => {
    const html = renderToStaticMarkup(<TypingCard {...common} displayCase="lower" />)
    expect(html).toContain('入力中のローマ字 shima')
    expect(html).toContain('class="typed">s</span>')
    expect(html).toContain('class="cursor-char">h</span>')
  })

  it('changes only presentation to uppercase while keeping the same typed state', () => {
    const html = renderToStaticMarkup(<TypingCard {...common} displayCase="upper" />)
    expect(html).toContain('入力中のローマ字 SHIMA')
    expect(html).toContain('class="typed">S</span>')
    expect(html).toContain('class="cursor-char">H</span>')
    expect(html).toContain('ここにローマ字を入力・大文字表示')
  })
})
