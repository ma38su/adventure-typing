import { describe, expect, it } from 'vitest'
import { createIslandEnvironmentCells } from './islandEnvironment'

describe('island environment cells', () => {
  it('is deterministic, varied and streamable', () => {
    const first = createIslandEnvironmentCells()
    const second = createIslandEnvironmentCells()
    expect(first).toEqual(second)
    expect(first.length).toBeGreaterThan(200)
    const instances = first.flatMap((cell) => cell.instances)
    expect(instances.length).toBeGreaterThan(700)
    expect(new Set(instances.map((instance) => instance.kind)).size).toBe(9)
    expect(new Set(first.map((cell) => cell.id)).size).toBe(first.length)
  })

  it('does not create a singular world-tree scale prop', () => {
    const instances = createIslandEnvironmentCells().flatMap((cell) => cell.instances)
    expect(Math.max(...instances.map((instance) => instance.scale))).toBeLessThanOrEqual(1.3)
  })

  it('rejects invalid cell sizes', () => {
    expect(() => createIslandEnvironmentCells(0)).toThrow(RangeError)
  })
})
