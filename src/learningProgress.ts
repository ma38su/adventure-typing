import type { DailyActivity, KeyStats, LearningGoals } from './domain'
import type { Question } from './questions'

export const localDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDailyActivity(current: Record<string, DailyActivity>, delta: Omit<DailyActivity, 'date'>, date = new Date()) {
  const key = localDateKey(date)
  const previous = current[key] ?? { date: key, completedProblems: 0, correctKeys: 0, mistakes: 0, practiceMs: 0, earnedPoints: 0 }
  return { ...current, [key]: {
    date: key,
    completedProblems: previous.completedProblems + delta.completedProblems,
    correctKeys: previous.correctKeys + delta.correctKeys,
    mistakes: previous.mistakes + delta.mistakes,
    practiceMs: previous.practiceMs + delta.practiceMs,
    earnedPoints: previous.earnedPoints + delta.earnedPoints,
  } }
}

export function getGoalProgress(activity: Record<string, DailyActivity>, goals: LearningGoals, today = new Date()) {
  const todayProblems = activity[localDateKey(today)]?.completedProblems ?? 0
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - index)
    return localDateKey(date)
  })
  const weeklyProblems = weekDates.reduce((total, date) => total + (activity[date]?.completedProblems ?? 0), 0)
  let streak = 0
  for (let index = 0; index < 366; index += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - index)
    if ((activity[localDateKey(date)]?.completedProblems ?? 0) === 0) {
      if (index === 0) continue
      break
    }
    streak += 1
  }
  return { todayProblems, weeklyProblems, streak, dailyGoal: goals.dailyProblems, weeklyGoal: goals.weeklyProblems }
}

export function adaptQuestions(questions: Question[], keyStats: KeyStats, grade: number): Question[] {
  const weaknesses = Object.entries(keyStats)
    .filter(([id, stat]) => id.startsWith(`${grade}:`) && stat.attempts >= 2 && stat.misses > 0)
    .map(([id, stat]) => ({ key: id.split(':')[1], weight: stat.misses / stat.attempts + Math.min(.5, stat.misses / 20) }))
    .sort((a, b) => b.weight - a.weight)
  if (!weaknesses.length) return questions
  const scored = questions.map((question, index) => ({
    question,
    index,
    score: weaknesses.reduce((sum, item) => {
      const occurrences = question.romaji.replaceAll(' ', '').split(item.key).length - 1
      return sum + occurrences * item.weight
    }, 0),
  }))
  const review = scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.index - b.index)
  if (!review.length) return questions
  const regular = scored.filter((item) => item.score === 0 || !review.slice(0, Math.ceil(questions.length / 4)).includes(item))
  const selected = review.slice(0, Math.ceil(questions.length / 4))
  const result: Question[] = []
  while (regular.length || selected.length) {
    result.push(...regular.splice(0, 3).map((item) => item.question))
    const nextReview = selected.shift()
    if (nextReview) result.push(nextReview.question)
  }
  return result
}
