import type { Grade, Question } from '../questions'

export type QuestionSelectionMetadata = {
  recommendedGrade?: Grade
  difficultyLevel?: number
}

export type SelectableQuestion = Question & QuestionSelectionMetadata

export type CourseQuestionSelectionOptions = {
  profileGrade: Grade
  difficultyCeiling: number
  count: number
  /** profileId・stageId・courseId・visitId を呼び出し側で結合した値。 */
  seed: string
  preferredRatio?: number
}

const hashSeed = (value: string) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const createRandom = (seed: string) => {
  let state = hashSeed(seed) || 1
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ value >>> 15, value | 1)
    value ^= value + Math.imul(value ^ value >>> 7, value | 61)
    return ((value ^ value >>> 14) >>> 0) / 4294967296
  }
}

const shuffled = <T>(items: T[], random: () => number) => {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

/** コース開始時に一度だけ呼び、返した順番をrun中は保持する。 */
export function selectCourseQuestions(candidates: SelectableQuestion[], options: CourseQuestionSelectionOptions) {
  const requestedCount = Math.max(0, Math.floor(options.count))
  const preferredRatio = Math.min(1, Math.max(0, options.preferredRatio ?? 0.7))
  const unique = [...new Map(candidates.map((question) => [question.id, question])).values()]
  const eligible = unique.filter((question) => typeof question.difficultyLevel === 'number' &&
    Number.isFinite(question.difficultyLevel) && question.difficultyLevel <= options.difficultyCeiling)
  const preferred = eligible.filter((question) => question.recommendedGrade === options.profileGrade)
  const mixed = eligible.filter((question) => question.recommendedGrade !== options.profileGrade)
  const random = createRandom(options.seed)
  const preferredPool = shuffled(preferred, random)
  const mixedPool = shuffled(mixed, random)
  const targetPreferred = Math.min(requestedCount, Math.round(requestedCount * preferredRatio))
  const selected = preferredPool.splice(0, targetPreferred)
  selected.push(...mixedPool.splice(0, requestedCount - selected.length))
  selected.push(...preferredPool.splice(0, requestedCount - selected.length))

  return {
    questions: shuffled(selected, random),
    requestedCount,
    eligibleCount: eligible.length,
    preferredCount: selected.filter((question) => question.recommendedGrade === options.profileGrade).length,
  }
}
