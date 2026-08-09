import { QUESTIONS, type Grade, type Question, type StageSection } from '../questions'
import type { LinearStageNumber } from './linearStageConfig'
import { selectCourseQuestions, type SelectableQuestion } from './selectCourseQuestions'

export const LINEAR_COURSE_COUNT = 5
export const QUESTIONS_PER_LINEAR_COURSE = 3

export const difficultyCeilingForStage = (stage: LinearStageNumber) => Math.round(12 + (stage - 1) * 44 / 35)

const pool: SelectableQuestion[] = (Object.entries(QUESTIONS) as [string, Question[]][]).flatMap(([grade, questions]) =>
  questions.map((question) => ({
    ...question,
    recommendedGrade: Number(grade) as Grade,
    difficultyLevel: question.romaji.replaceAll(' ', '').length,
  })))

/** 一回のステージ訪問で5コース分を確定する。返り値はrun中に再計算しない。 */
export function buildLinearStageQuestions(stage: LinearStageNumber, profileGrade: Grade, visitSeed: string): Question[] {
  const remaining = [...pool]
  const result: Question[] = []
  for (let course = 1; course <= LINEAR_COURSE_COUNT; course += 1) {
    const picked = selectCourseQuestions(remaining, {
      profileGrade,
      difficultyCeiling: difficultyCeilingForStage(stage),
      count: QUESTIONS_PER_LINEAR_COURSE,
      seed: `${visitSeed}:stage-${stage}:course-${course}`,
    }).questions
    const pickedIds = new Set(picked.map(({ id }) => id))
    picked.forEach((question) => result.push({ ...question, section: course as StageSection }))
    for (let index = remaining.length - 1; index >= 0; index -= 1) if (pickedIds.has(remaining[index].id)) remaining.splice(index, 1)
  }
  return result
}
