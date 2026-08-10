import { readFileSync, writeFileSync } from 'node:fs'
import vm from 'node:vm'

const sourcePath = new URL('../artwork/preproduction/world-map/kotoba-island-route-v2.js', import.meta.url)
const outputPath = new URL('../src/journey3d/generated/worldRouteV2.generated.json', import.meta.url)
const source = readFileSync(sourcePath, 'utf8')
const sandbox = { window: {} }
vm.runInNewContext(source, sandbox, { filename: sourcePath.pathname })
const route = sandbox.window.KOTOBA_WORLD_ROUTE_V2
if (route?.schemaVersion !== 2 || route.stages?.length !== 36 || route.stages.some((stage) => stage.anchors?.length !== 6)) {
  throw new Error('route-v2 source must contain 36 stages with six anchors each')
}
const runtime = {
  generatedFrom: 'artwork/preproduction/world-map/kotoba-island-route-v2.js',
  schemaVersion: route.schemaVersion,
  projection: route.projection,
  stages: route.stages.map(({ stage, routeType, startChunk, endChunk, routeDistanceKm, anchors }) => ({
    stage, routeType, startChunk, endChunk, routeDistanceKm, anchors,
  })),
}
writeFileSync(outputPath, `${JSON.stringify(runtime, null, 2)}\n`)
