import assert from 'node:assert/strict'
import test from 'node:test'
import { estimatedDifficultyGrade, featureGate, measureQuestion, targetBand } from './question-difficulty.mjs'

test('漢字量は難度値へ影響しない', () => {
  const base = { id: 'a', stage: 1, reading: 'うみへいく', romaji: 'umihe iku' }
  assert.equal(
    measureQuestion({ ...base, sentence: '海へ行く' }).score,
    measureQuestion({ ...base, sentence: 'うみへいく' }).score,
  )
})

test('後半要素は入力負荷へ加点する', () => {
  const base = measureQuestion({ id: 'a', stage: 1, sentence: 'みる', reading: 'みる', romaji: 'miru' })
  const advanced = measureQuestion({ id: 'b', stage: 1, sentence: 'みる！', reading: 'みる！', romaji: 'miru!' })
  assert.ok(advanced.score > base.score)
  assert.equal(advanced.punctuation, 1)
})

test('目標値は36ステージを通じて下がらない', () => {
  const bands = Array.from({ length: 36 }, (_, index) => targetBand(index + 1))
  assert.ok(bands.every((band, index) => index === 0 || band.center >= bands[index - 1].center))
})

test('新要素は一度に導入しない', () => {
  assert.equal(featureGate(24).punctuation, false)
  assert.equal(featureGate(25).punctuation, true)
  assert.equal(featureGate(27).longVowel, true)
  assert.equal(featureGate(29).digits, true)
  assert.equal(featureGate(32).symbols, true)
})

test('実測学年帯は難度値に対して単調に上がる', () => {
  assert.equal(estimatedDifficultyGrade(10), 1)
  assert.equal(estimatedDifficultyGrade(25), 3)
  assert.equal(estimatedDifficultyGrade(50), 6)
})
