import { describe, expect, it, vi } from 'vitest'
import { emptyProfileData } from '../domain'
import { createDebouncedProfileWriter, loadProfileData, migrateProfileData, profileDataKey, type StorageLike } from './profileStorage'

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { values: Record<string, string> } {
  const values = { ...initial }
  return { values, getItem: (key) => values[key] ?? null, setItem: (key, value) => { values[key] = value } }
}

describe('profile storage', () => {
  it('normalizes old collection records without losing discoveries', () => {
    const storage = memoryStorage({ [profileDataKey('a')]: JSON.stringify({ collection: [{ id: 'fox-kon', type: 'friend' }] }) })
    expect(loadProfileData('a', storage).collection[0]).toMatchObject({ id: 'fox-kon', count: 1 })
  })

  it('migrates unversioned profile data into the current schema', () => {
    const migrated = migrateProfileData({ scoreData: { lifetime: 123, courseBest: {}, coursePlays: {} } })
    expect(migrated.schemaVersion).toBe(1)
    expect(migrated.scoreData.lifetime).toBe(123)
    expect(migrated.problemStats).toEqual({})
  })

  it('keeps known data from a future schema and repairs incomplete score data', () => {
    const migrated = migrateProfileData({ schemaVersion: 99, scoreData: { lifetime: 456 } as never, completedCourses: ['2-1'] })
    expect(migrated.scoreData).toEqual({ lifetime: 456, courseBest: {}, coursePlays: {} })
    expect(migrated.completedCourses).toEqual(['2-1'])
  })

  it('does not throw when storage is unavailable', () => {
    const storage: StorageLike = { getItem: () => null, setItem: () => { throw new DOMException('full', 'QuotaExceededError') } }
    const onError = vi.fn()
    const writer = createDebouncedProfileWriter(0, storage, onError)
    writer.schedule('a', emptyProfileData())
    expect(() => writer.flush()).not.toThrow()
    expect(onError).toHaveBeenCalledOnce()
  })

  it('coalesces frequent writes and can flush immediately', () => {
    vi.useFakeTimers()
    const storage = memoryStorage()
    const writer = createDebouncedProfileWriter(750, storage)
    writer.schedule('a', { ...emptyProfileData(), completedCourses: ['1-1'] })
    writer.schedule('a', { ...emptyProfileData(), completedCourses: ['1-1', '1-2'] })
    expect(storage.getItem(profileDataKey('a'))).toBeNull()
    writer.flush()
    expect(loadProfileData('a', storage).completedCourses).toEqual(['1-1', '1-2'])
    vi.useRealTimers()
  })
})
