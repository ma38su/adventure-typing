import type { Grade } from '../questions'
import { COURSE_THEMES } from '../rewards'

export const LEARNING_STAGES = [
  { ...COURSE_THEMES[1], label: 'みじかい文', background: '/backgrounds/stage-beach.webp' },
  { ...COURSE_THEMES[2], label: 'ふつうの文', background: '/backgrounds/stage-forest.webp' },
  { ...COURSE_THEMES[3], label: 'ながい文', background: '/backgrounds/stage-mountain.webp' },
  { ...COURSE_THEMES[4], label: 'おさらい文', background: '/backgrounds/stage-beach.webp' },
  { ...COURSE_THEMES[5], label: '組み合わせ文', background: '/backgrounds/stage-forest.webp' },
  { ...COURSE_THEMES[6], label: 'チャレンジ文', background: '/backgrounds/stage-mountain.webp' },
]

export const TITLE_ISLANDS: Record<Grade, { name: string; back: string; main: string; friend: string; treasure: string }> = {
  1: { name: 'はじまりの浜', back: '🌴', main: '🏝️', friend: '🦊', treasure: '🐚' },
  2: { name: 'そよかぜの森', back: '🌲', main: '🏞️', friend: '🐿️', treasure: '🍎' },
  3: { name: 'ほしふる山', back: '🏔️', main: '⛰️', friend: '🦅', treasure: '💎' },
  4: { name: 'にじ色の環礁', back: '🪸', main: '🏝️', friend: '🐬', treasure: '🧭' },
  5: { name: '雲上の庭園', back: '☁️', main: '🏞️', friend: '🦉', treasure: '🔮' },
  6: { name: '星読みの塔', back: '🌌', main: '🏔️', friend: '🦅', treasure: '💎' },
}

export const GRADE_OPTIONS: Grade[] = [1, 2, 3, 4, 5, 6]
