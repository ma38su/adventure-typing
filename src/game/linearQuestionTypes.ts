import type { Grade, Question } from '../questions'
import type { LinearStageNumber } from './linearStageConfig'

export type LinearAuthoredQuestion = Question & {
  storyStage: LinearStageNumber
  anchorId: string
  recommendedGrade: Grade
  difficultyLevel: number
  sourceId?: string
}
