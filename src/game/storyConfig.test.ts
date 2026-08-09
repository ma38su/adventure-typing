import { describe, expect, it } from 'vitest'
import { getReward } from '../rewards'
import type { Grade } from '../questions'
import type { Course } from '../rewards'
import { GRADE_STORIES } from './storyConfig'

describe('course stories', () => {
  it('defines a complete six-course arc for every grade', () => {
    for (let grade = 1; grade <= 6; grade += 1) {
      const story = GRADE_STORIES[grade as Grade]
      expect(story.chapterTitle).not.toBe('')
      expect(story.finale).not.toBe('')
      for (let course = 1; course <= 6; course += 1) {
        const episode = story.courses[course as Course]
        expect(episode.title).not.toBe('')
        expect(episode.intro).not.toBe('')
        expect(episode.completion).not.toBe('')
        expect(getReward(episode.featuredTreasureId)?.type).toBe('treasure')
        expect(getReward(episode.featuredFriendId)?.type).toBe('friend')
      }
    }
  })
})
