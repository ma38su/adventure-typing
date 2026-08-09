import questionData from './data/questions.json'

export type Grade = 1 | 2 | 3 | 4 | 5 | 6

export type Question = {
  id: string
  stage: 1 | 2 | 3 | 4 | 5 | 6
  sentence: string
  reading: string
  /** 文節ごとに記述します。[漢字:よみ] の部分だけにルビが付きます。 */
  ruby: string[]
  /** 文節ごとに半角スペースを入れます。判定時は自動で除去されます。 */
  romaji: string
  focus: string
  meaning: string
}

function validateQuestionData(data: unknown): Record<Grade, Question[]> {
  if (!data || typeof data !== 'object') throw new Error('問題JSONの形式が正しくありません')
  const result = data as Record<string, unknown>
  for (let grade = 1; grade <= 6; grade += 1) {
    if (!Array.isArray(result[String(grade)])) throw new Error(`${grade}年生の問題がありません`)
  }
  return data as Record<Grade, Question[]>
}

/** 問題追加は src/data/questions.json だけを編集します。 */
export const QUESTIONS = validateQuestionData(questionData)
