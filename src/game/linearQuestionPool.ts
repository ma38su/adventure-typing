import { QUESTIONS, type Grade, type Question, type StageSection } from '../questions'
import { linearCoursePlanForStage, targetQuestionCountForStage } from './linearCoursePlan'
import { toLegacyStage, type LinearStageNumber } from './linearStageConfig'
import { selectCourseQuestions, type SelectableQuestion } from './selectCourseQuestions'
import { STAGE_1_QUESTION_BANK, type LinearAuthoredQuestion } from './stage1QuestionBank'

export const difficultyCeilingForStage = (stage: LinearStageNumber) => Math.round(12 + (stage - 1) * 44 / 35)

export type LinearStageQuestionRun = {
  questions: Question[]
  targetCount: number
  availableCount: number
  courseQuestionCounts: readonly number[]
  complete: boolean
  usedDifficultyFallback: boolean
}

const sectionForIndex = (index: number, counts: readonly number[]): StageSection => {
  let end = 0
  for (let course = 0; course < counts.length; course += 1) {
    end += counts[course]
    if (index < end) return course + 1
  }
  return counts.length
}

const legacyCandidatesForStoryStage = (stage: LinearStageNumber): SelectableQuestion[] => {
  const legacy = toLegacyStage(stage)
  return QUESTIONS[legacy.grade]
    .filter((question) => question.stage === legacy.course)
    .map((question) => ({
      ...question,
      recommendedGrade: legacy.grade,
      difficultyLevel: question.romaji.replaceAll(' ', '').length,
    }))
}

/**
 * Stage開始時に一度だけ作り、返した配列をrun stateへ保持する。
 * Stage 1は景観anchor順が物語の正本なので、52問すべてを制作順で返す。
 * Stage 2以降は専用bank完成まで旧同話だけへ厳格に限定し、不足を他話で埋めない。
 */
export function buildLinearStageQuestionRun(stage: LinearStageNumber, profileGrade: Grade, visitSeed: string): LinearStageQuestionRun {
  const plan = linearCoursePlanForStage(stage)
  const targetCount = targetQuestionCountForStage(stage)

  if (stage === 1) {
    const eligible = STAGE_1_QUESTION_BANK.filter((question) => question.difficultyLevel <= difficultyCeilingForStage(stage))
    return {
      questions: eligible.map((question) => ({ ...question })),
      targetCount,
      availableCount: eligible.length,
      courseQuestionCounts: plan.questionCounts,
      complete: eligible.length === targetCount,
      usedDifficultyFallback: false,
    }
  }

  const candidates = legacyCandidatesForStoryStage(stage)
  const selected = selectCourseQuestions(candidates, {
    profileGrade,
    difficultyCeiling: difficultyCeilingForStage(stage),
    count: targetCount,
    seed: `${visitSeed}:stage-${stage}`,
  }).questions
  // 移行途中の旧話に上限内問題がゼロでもAppをクラッシュさせない。
  // 別話では埋めず、同じ話の最短一問だけを診断付きで返す。
  const usedDifficultyFallback = selected.length === 0 && candidates.length > 0
  const safeSelected = usedDifficultyFallback
    ? [...candidates].sort((a, b) => (a.difficultyLevel ?? Infinity) - (b.difficultyLevel ?? Infinity)).slice(0, 1)
    : selected
  const questions = safeSelected.map((question, index) => ({
    ...question,
    section: sectionForIndex(index, plan.questionCounts),
  }))
  return {
    questions,
    targetCount,
    availableCount: candidates.length,
    courseQuestionCounts: plan.questionCounts,
    complete: questions.length === targetCount,
    usedDifficultyFallback,
  }
}

/** App互換API。新規接続では不足診断を持つ buildLinearStageQuestionRun を使う。 */
export function buildLinearStageQuestions(stage: LinearStageNumber, profileGrade: Grade, visitSeed: string): Question[] {
  return buildLinearStageQuestionRun(stage, profileGrade, visitSeed).questions
}

export type { LinearAuthoredQuestion }
