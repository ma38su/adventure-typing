import type { Grade } from '../questions'
import type { Course } from '../rewards'
import { GRADE_STORIES, type CourseStory } from './storyConfig'

export type LinearStageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
  13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 |
  25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36

export type DifficultyBand = 'はじめの一歩' | '短いことば' | '文をつなぐ' | '表現をひろげる' | '複雑な文' | '物語を打つ'

export type LinearStage = CourseStory & {
  number: LinearStageNumber
  chapter: Grade
  chapterStage: Course
  legacyId: `${Grade}-${Course}`
  chapterTitle: string
  difficultyBand: DifficultyBand
}

const grades: Grade[] = [1, 2, 3, 4, 5, 6]
const courses: Course[] = [1, 2, 3, 4, 5, 6]
const difficultyBands: DifficultyBand[] = [
  'はじめの一歩', '短いことば', '文をつなぐ',
  '表現をひろげる', '複雑な文', '物語を打つ',
]

export const toLinearStageNumber = (chapter: Grade, chapterStage: Course) =>
  ((chapter - 1) * 6 + chapterStage) as LinearStageNumber

export const toLegacyStage = (number: LinearStageNumber): { grade: Grade; course: Course } => ({
  grade: (Math.floor((number - 1) / 6) + 1) as Grade,
  course: (((number - 1) % 6) + 1) as Course,
})

export const getDifficultyBand = (number: LinearStageNumber): DifficultyBand =>
  difficultyBands[Math.min(difficultyBands.length - 1, Math.floor((number - 1) / 6))]

/**
 * 既存36話を通し番号で扱う移行レイヤー。
 * chapter は物語上の「章」であり、学年や出題対象を意味しません。
 */
export const LINEAR_STAGES: LinearStage[] = grades.flatMap((chapter) => courses.map((chapterStage) => {
  const number = toLinearStageNumber(chapter, chapterStage)
  return {
    ...GRADE_STORIES[chapter].courses[chapterStage],
    number,
    chapter,
    chapterStage,
    legacyId: `${chapter}-${chapterStage}`,
    chapterTitle: GRADE_STORIES[chapter].chapterTitle,
    difficultyBand: getDifficultyBand(number),
  }
}))

export const getLinearStage = (number: LinearStageNumber) => LINEAR_STAGES[number - 1]

export const linearStageId = (number: LinearStageNumber) => `stage-${number}` as const

export const isLinearStageUnlocked = (number: LinearStageNumber, completedStageIds: string[]) =>
  number === 1 || completedStageIds.includes(linearStageId((number - 1) as LinearStageNumber))
