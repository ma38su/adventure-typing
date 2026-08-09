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
    expect(migrated.schemaVersion).toBe(2)
    expect(migrated.scoreData.lifetime).toBe(0)
    expect(migrated.problemStats).toEqual({})
    expect(migrated.audioSettings).toEqual({ bgmOn: true, soundEffectsOn: true })
    expect(migrated.typingDisplayCase).toBe('lower')
  })

  it('preserves a valid profile typing display case', () => {
    expect(migrateProfileData({ typingDisplayCase: 'upper' }).typingDisplayCase).toBe('upper')
    expect(migrateProfileData({ typingDisplayCase: 'invalid' as never }).typingDisplayCase).toBe('lower')
  })

  it('migrates the old shared sound setting to both independent settings', () => {
    expect(migrateProfileData({ soundOn: false }).audioSettings).toEqual({ bgmOn: false, soundEffectsOn: false })
    expect(migrateProfileData({ soundOn: true }).audioSettings).toEqual({ bgmOn: true, soundEffectsOn: true })
  })

  it('keeps independently saved BGM and sound-effect settings', () => {
    expect(migrateProfileData({ soundOn: false, audioSettings: { bgmOn: true, soundEffectsOn: false } }).audioSettings)
      .toEqual({ bgmOn: true, soundEffectsOn: false })
  })

  it('keeps known data from a future schema and repairs incomplete score data', () => {
    const migrated = migrateProfileData({ schemaVersion: 99, scoreData: { lifetime: 456 } as never, completedCourses: ['2-1'] })
    expect(migrated.scoreData).toEqual({ lifetime: 456, courseBest: {}, coursePlays: {} })
    expect(migrated.completedCourses).toEqual(['2-1'])
  })

  it('resets old stage completion and incompatible score scale while preserving learning history', () => {
    const migrated = migrateProfileData({
      schemaVersion: 1,
      completedCourses: ['1-1'],
      problemStats: { '1-s01': { attempts: 1 } as never },
      keyStats: { '1:a': { attempts: 2, misses: 0, wrongKeys: {} } },
      scoreData: { lifetime: 500, courseBest: { '1-1': 400 }, coursePlays: { '1-1': 1 } },
    })
    expect(migrated.completedCourses).toEqual([])
    expect(migrated.scoreData).toEqual({ lifetime: 0, courseBest: {}, coursePlays: {} })
    expect(migrated.problemStats['1-s01']).toBeDefined()
    expect(migrated.keyStats['1:a']).toBeDefined()
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
