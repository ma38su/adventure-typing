import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const expected = [
  [7, 7, 7, 7, 8, 8, 8],
  [7, 8, 8, 8, 8],
  [8, 8, 8, 8, 8, 8, 8],
  [7, 7, 7, 7],
  [8, 8, 8],
  [7, 7, 7, 8, 8, 8, 8],
  [7, 7, 7, 7, 7, 7, 7],
  [7, 8, 8, 8, 8],
  [7, 7, 7, 7, 7, 7, 7, 8],
  [7, 7, 7, 7],
  [8, 8, 8],
  [8, 8, 8],
]

test('Stage 1–12 detail tables match the route spline course plan', async () => {
  const markdown = await readFile(new URL('../docs/stage-1-12-question-production-plan.md', import.meta.url), 'utf8')
  const headings = [...markdown.matchAll(/^### Stage (\d+).*— (\d+)問 \/ (\d+) course$/gm)]
  assert.equal(headings.length, 12)

  headings.forEach((heading, index) => {
    const stage = Number(heading[1])
    assert.equal(stage, index + 1)
    const end = headings[index + 1]?.index ?? markdown.indexOf('\n## 5.', heading.index)
    const section = markdown.slice(heading.index, end)
    const rows = [...section.matchAll(/^\| (\d+) \|.*?\| (\d+) \|/gm)]
    const courseNumbers = rows.map((row) => Number(row[1]))
    const questionCounts = rows.map((row) => Number(row[2]))
    assert.deepEqual(courseNumbers, expected[index].map((_, course) => course + 1), `Stage ${stage} course rows`)
    assert.deepEqual(questionCounts, expected[index], `Stage ${stage} question counts`)
    assert.equal(Number(heading[2]), questionCounts.reduce((total, count) => total + count, 0), `Stage ${stage} total`)
    assert.equal(Number(heading[3]), questionCounts.length, `Stage ${stage} course count`)
  })
})
