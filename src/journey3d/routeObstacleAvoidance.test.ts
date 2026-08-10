import { describe, expect, it } from 'vitest'
import { steerRouteAroundObstacles } from './routeObstacleAvoidance'

describe('route obstacle avoidance', () => {
  const route = Array.from({ length: 9 }, (_, index) => ({ eastKm: index * .1, northKm: 0 }))

  it('bends a local route around a tree instead of clearing a wide corridor', () => {
    const tree = { eastKm: .4, northKm: 0, radiusKm: .045 }
    const steered = steerRouteAroundObstacles(route, [tree])
    expect(Math.abs(steered[4].northKm)).toBeGreaterThan(.05)
    expect(Math.max(...steered.map((point, index) => Math.hypot(point.eastKm - route[index].eastKm, point.northKm - route[index].northKm)))).toBeLessThanOrEqual(.32)
  })

  it('leaves an unobstructed route near its authored centerline', () => {
    const steered = steerRouteAroundObstacles(route, [{ eastKm: 4, northKm: 4, radiusKm: .1 }])
    expect(steered).toEqual(route)
  })
})
