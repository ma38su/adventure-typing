import questionData from './data/questions.json'

export type Grade = 1 | 2 | 3 | 4 | 5 | 6
export type StageSection = 1 | 2 | 3 | 4 | 5

export type Question = {
  id: string
  stage: 1 | 2 | 3 | 4 | 5 | 6
  /** ステージ内コース。既存のステージ用 Course 型との衝突回避のため section と呼びます。 */
  section: StageSection
  sentence: string
  reading: string
  /** 文節ごとに記述します。[漢字:よみ] の部分だけにルビが付きます。 */
  ruby: string[]
  /** 文節ごとに半角スペースを入れます。判定時は自動で除去されます。 */
  romaji: string
  focus: string
  meaning: string
}

type StoredQuestion = Omit<Question, 'section'> & { section?: StageSection }

function validateQuestionData(data: unknown): Record<Grade, Question[]> {
  if (!data || typeof data !== 'object') throw new Error('問題JSONの形式が正しくありません')
  const result = data as Record<string, unknown>
  for (let grade = 1; grade <= 6; grade += 1) {
    if (!Array.isArray(result[String(grade)])) throw new Error(`${grade}年生の問題がありません`)
  }
  return Object.fromEntries(Object.entries(data as Record<Grade, StoredQuestion[]>).map(([grade, questions]) => [grade,
    questions.map((question) => ({ ...question, section: question.section ?? 1 })),
  ])) as Record<Grade, Question[]>
}

/** 問題追加は src/data/questions.json だけを編集します。 */
export const QUESTIONS = validateQuestionData(questionData)

export const getQuestionSection = (question: Question): StageSection => question.section

/** 段階的な難易度を守りながら、各ステージ内コースの中だけ適応順序に並べます。 */
export function groupQuestionsBySection(questions: Question[]): Question[][] {
  const sectionNumbers = [...new Set(questions.map(getQuestionSection))].sort((a, b) => a - b)
  return sectionNumbers.map((section) => questions.filter((question) => getQuestionSection(question) === section))
}
