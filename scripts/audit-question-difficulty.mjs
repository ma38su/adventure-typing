import fs from 'node:fs'
import { estimatedDifficultyGrade, featureGate, measureQuestion, median, targetBand } from './question-difficulty.mjs'

const source = JSON.parse(fs.readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8'))
const questions = Object.entries(source).flatMap(([grade, items]) => items.map((item) => {
  const measured = measureQuestion(item, Number(grade))
  return { ...measured, recommendedGrade: Number(grade), estimatedDifficultyGrade: estimatedDifficultyGrade(measured.score) }
}))

const featureTotals = Object.fromEntries(['sokuon', 'yoon', 'hatsuon', 'longVowel', 'digits', 'punctuation', 'symbols']
  .map((feature) => [feature, questions.filter((item) => item[feature] > 0).length]))

const stages = Array.from({ length: 36 }, (_, index) => {
  const stage = index + 1
  const current = questions.filter((item) => item.oldEpisode === stage)
  const band = targetBand(stage)
  const inBand = current.filter((item) => item.score >= band.min && item.score <= band.max)
  const globalCandidates = questions.filter((item) => item.score >= band.min && item.score <= band.max)
  const candidatesByRecommendedGrade = Object.fromEntries(Array.from({ length: 6 }, (_, gradeIndex) => {
    const grade = gradeIndex + 1
    const preferred = globalCandidates.filter((item) => item.recommendedGrade === grade).length
    return [grade, { preferred, fallbackNeededFor15: Math.max(0, 15 - preferred) }]
  }))
  return {
    stage,
    oldMapping: `${Math.ceil(stage / 6)}-${((stage - 1) % 6) + 1}`,
    currentCount: current.length,
    currentMedian: Number(median(current.map((item) => item.score)).toFixed(1)),
    currentMin: Math.min(...current.map((item) => item.score)),
    currentMax: Math.max(...current.map((item) => item.score)),
    target: band,
    reusableInBand: inBand.length,
    minimumAdditions: 15 - inBand.length,
    globalCandidatePool: globalCandidates.length,
    candidatesByRecommendedGrade,
    gates: featureGate(stage),
  }
})

const cliffs = stages.slice(1).map((stage, index) => ({
  from: stage.stage - 1,
  to: stage.stage,
  delta: Number((stage.currentMedian - stages[index].currentMedian).toFixed(1)),
})).filter((item) => Math.abs(item.delta) >= 8)

const report = {
  generatedFrom: 'src/data/questions.json',
  totalQuestions: questions.length,
  targetQuestions: 36 * 5 * 3,
  absoluteMinimumAdditions: 36 * 5 * 3 - questions.length,
  featureTotals,
  gradeDifficultyMismatches: questions.filter((item) => Math.abs(item.recommendedGrade - item.estimatedDifficultyGrade) >= 2)
    .map(({ id, recommendedGrade, estimatedDifficultyGrade, score, oldEpisode }) => ({ id, recommendedGrade, estimatedDifficultyGrade, score, oldEpisode })),
  cliffs,
  stages,
}

if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2))
else {
  console.log(`現行 ${report.totalQuestions}問 / 目標 ${report.targetQuestions}問 / 単純不足 ${report.absoluteMinimumAdditions}問`)
  console.log(`特徴: ${Object.entries(featureTotals).map(([key, value]) => `${key}=${value}`).join(', ')}`)
  console.log(`推奨学年と実測難度が2段階以上乖離: ${report.gradeDifficultyMismatches.length}問`)
  console.log(`急変(中央値±8点以上): ${cliffs.map((item) => `${item.from}→${item.to} (${item.delta > 0 ? '+' : ''}${item.delta})`).join(', ') || 'なし'}`)
  console.log('stage old count median range target reusable additions pool preferred-by-grade/fallback gates')
  for (const item of stages) {
    const gates = Object.entries(item.gates).filter(([, enabled]) => enabled).map(([name]) => name).join(',') || '-'
    const gradePools = Object.entries(item.candidatesByRecommendedGrade).map(([grade, pool]) => `${grade}:${pool.preferred}/${pool.fallbackNeededFor15}`).join(' ')
    console.log(`${String(item.stage).padStart(2)} ${item.oldMapping.padStart(3)} ${String(item.currentCount).padStart(2)} ${String(item.currentMedian).padStart(4)} ${item.currentMin}-${item.currentMax} ${item.target.min}-${item.target.max} ${String(item.reusableInBand).padStart(2)} ${String(item.minimumAdditions).padStart(2)} ${String(item.globalCandidatePool).padStart(3)} ${gradePools} ${gates}`)
  }
}
