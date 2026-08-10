export type PlanarPoint = { eastKm: number; northKm: number }
export type RouteObstacle = PlanarPoint & { radiusKm: number }

const distance = (a: PlanarPoint, b: PlanarPoint) => Math.hypot(a.eastKm - b.eastKm, a.northKm - b.northKm)

/**
 * Moves an already designed macro route sideways through local gaps. This is
 * not a global path finder: valleys, passes and landmarks still come from the
 * authored route; only tree/rock-scale avoidance is solved here.
 */
export function steerRouteAroundObstacles(
  basePoints: readonly PlanarPoint[], obstacles: readonly RouteObstacle[], clearanceKm = .075,
): readonly PlanarPoint[] {
  if (basePoints.length < 3) throw new RangeError('Obstacle avoidance needs at least three route points')
  const normals: PlanarPoint[] = []
  const offsets: number[] = []
  let previousOffset = 0
  for (let index = 0; index < basePoints.length; index += 1) {
    const previous = basePoints[(index - 1 + basePoints.length) % basePoints.length]
    const next = basePoints[(index + 1) % basePoints.length]
    const tangentEast = next.eastKm - previous.eastKm
    const tangentNorth = next.northKm - previous.northKm
    const tangentLength = Math.max(1e-6, Math.hypot(tangentEast, tangentNorth))
    const normal = { eastKm: -tangentNorth / tangentLength, northKm: tangentEast / tangentLength }
    const candidates = [0, -.06, .06, -.12, .12, -.18, .18, -.24, .24, -.32, .32]
    let bestOffset = 0
    let bestScore = -Infinity
    for (const offset of candidates) {
      const candidate = {
        eastKm: basePoints[index].eastKm + normal.eastKm * offset,
        northKm: basePoints[index].northKm + normal.northKm * offset,
      }
      const nearestMargin = obstacles.reduce((margin, obstacle) => Math.min(margin, distance(candidate, obstacle) - obstacle.radiusKm), Infinity)
      const collisionPenalty = nearestMargin < clearanceKm ? (clearanceKm - nearestMargin) * 80 : 0
      const score = Math.min(nearestMargin, clearanceKm * 1.8) - Math.abs(offset) * .08 - Math.abs(offset - previousOffset) * .12 - collisionPenalty
      if (score > bestScore) { bestOffset = offset; bestScore = score }
    }
    normals.push(normal)
    offsets.push(bestOffset)
    previousOffset = bestOffset
  }
  let smoothedOffsets = offsets
  for (let pass = 0; pass < 2; pass += 1) {
    smoothedOffsets = smoothedOffsets.map((offset, index, values) => offset * .58
      + values[(index - 1 + values.length) % values.length] * .21
      + values[(index + 1) % values.length] * .21)
  }
  return basePoints.map((point, index) => ({
    eastKm: point.eastKm + normals[index].eastKm * smoothedOffsets[index],
    northKm: point.northKm + normals[index].northKm * smoothedOffsets[index],
  }))
}
