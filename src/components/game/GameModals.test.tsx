import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CourseClearModal } from './GameModals'

const commonProps = {
  practiceMode: 'adventure' as const,
  reviewTargetKeys: [],
  fullyCompleted: true,
  grade: 1 as const,
  course: 1 as const,
  storyCompletion: '森の入口へたどり着いた。',
  chapterFinale: '',
  courseScore: 1200,
  runBonus: 100,
  accuracy: 98,
  attempts: 80,
  misses: 2,
  strongKeys: [{ key: 'a', attempts: 20, missRate: 0 }],
  weakKeys: [{ key: 'k', attempts: 10, missRate: 20 }],
  creatureCount: 1,
  treasureCount: 2,
  lifetimePoints: 5000,
  onContinue: vi.fn(),
}

describe('CourseClearModal', () => {
  it('ステージクリア時は固定操作部に次ステージとSpaceの案内を表示する', () => {
    const html = renderToStaticMarkup(<CourseClearModal {...commonProps} />)

    expect(html).toContain('class="course-clear-actions"')
    expect(html).toContain('次のステージへ')
    expect(html).toContain('<kbd>Space</kbd> キーでも進める')
    expect(html).toContain('aria-keyshortcuts="Space"')
  })

  it('最終ステージではステージ選択へ戻る', () => {
    const html = renderToStaticMarkup(<CourseClearModal {...commonProps} course={6} />)

    expect(html).toContain('ステージ選択へ戻る')
    expect(html).not.toContain('次のステージへ')
  })
})
