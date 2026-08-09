import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const source = fs.readFileSync(
  new URL('../artwork/preproduction/world-map/kotoba-island-route-v2.js', import.meta.url),
  'utf8',
)
const context = { window: {} }
vm.createContext(context)
vm.runInContext(source, context)

const data = context.window.KOTOBA_WORLD_ROUTE_V2
assert.equal(data.schemaVersion, 2)
assert.equal(data.stages.length, 36)
assert.equal(data.stages.flatMap((stage) => stage.anchors).length, 216)

for (const stage of data.stages) {
  assert.equal(stage.anchors.length, 6, `Stage ${stage.stage}: anchor count`)
  assert.equal(stage.splineSamples.length, 121, `Stage ${stage.stage}: spline samples`)
  assert.ok(Number.isFinite(stage.routeDistanceKm) && stage.routeDistanceKm > 0)
  assert.ok(stage.targetQuestions >= 18 && stage.targetQuestions <= 60)
  assert.ok(stage.targetCourses >= 3 && stage.targetCourses <= 8)
  for (const anchor of stage.anchors) {
    for (const key of ['anchorId', 'microLandform', 'watershedId', 'regionId', 'chunkId']) {
      assert.ok(anchor[key], `Stage ${stage.stage}: ${key}`)
    }
    for (const key of ['latitudeDeg', 'longitudeDeg', 'altitudeKm']) {
      assert.ok(Number.isFinite(anchor[key]), `Stage ${stage.stage}: ${key}`)
    }
  }
}

for (let i = 1; i < data.stages.length; i += 1) {
  const previous = data.stages[i - 1]
  const current = data.stages[i]
  const end = previous.anchors.at(-1)
  const start = current.anchors[0]
  assert.deepEqual(
    [end.latitudeDeg, end.longitudeDeg, end.altitudeKm, previous.endChunk],
    [start.latitudeDeg, start.longitudeDeg, start.altitudeKm, current.startChunk],
    `Stage ${previous.stage} -> ${current.stage}`,
  )
}

assert.equal(data.stages[11].endChunk, 'bnd-sky-star-route')
assert.equal(data.stages[12].startChunk, 'bnd-sky-star-route')

const summary = {
  stages: data.stages.length,
  anchors: data.stages.flatMap((stage) => stage.anchors).length,
  routeDistanceKm: Number(
    data.stages.reduce((sum, stage) => sum + stage.routeDistanceKm, 0).toFixed(2),
  ),
  targetQuestions: data.stages.reduce((sum, stage) => sum + stage.targetQuestions, 0),
  targetCourses: data.stages.reduce((sum, stage) => sum + stage.targetCourses, 0),
}

console.log(JSON.stringify(summary, null, 2))
