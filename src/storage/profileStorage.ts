import type { CollectionRecord } from '../rewards'
import type { Grade } from '../questions'
import { emptyScoreData, type DailyActivity, type ProfileData, type ProfileRegistry } from '../domain'

const LEGACY_KEYS = {
  keyStats: 'kotobajima-key-stats-v1', collection: 'kotobajima-collection-v1', completedCourses: 'kotobajima-completed-courses-v1', problemStats: 'kotobajima-problem-stats-v1', scoreData: 'kotobajima-score-v1',
} as const
export const PROFILE_REGISTRY_STORAGE = 'kotobajima-profiles'
export const profileDataKey = (id: string) => `kotobajima-profile:${id}:data`

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>
type LegacyProfileData = Omit<Partial<ProfileData>, 'schemaVersion'> & { schemaVersion?: number; soundOn?: boolean }

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const nonNegativeNumber = (value: unknown, fallback = 0) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
const numberRecord = (value: unknown): Record<string, number> => isRecord(value)
  ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] >= 0))
  : {}

const normalizeDailyActivity = (value: unknown): Record<string, DailyActivity> => isRecord(value)
  ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, DailyActivity] => isRecord(entry[1]) && typeof entry[1].date === 'string').map(([date, item]) => [date, {
    date,
    completedProblems: nonNegativeNumber(item.completedProblems), correctKeys: nonNegativeNumber(item.correctKeys),
    mistakes: nonNegativeNumber(item.mistakes), practiceMs: nonNegativeNumber(item.practiceMs), earnedPoints: nonNegativeNumber(item.earnedPoints),
  }]))
  : {}

function readStored<T>(storage: StorageLike, key: string, fallback: T): T {
  try { return JSON.parse(storage.getItem(key) ?? '') as T } catch { return fallback }
}

function normalizeCollection(saved: Array<CollectionRecord | { id: string; type: 'treasure' | 'friend' }> = []): CollectionRecord[] {
  if (!Array.isArray(saved)) return []
  return saved
    .filter((item) => item && typeof item.id === 'string' && (item.type === 'treasure' || item.type === 'friend'))
    .map((item) => ({
      id: item.id,
      type: item.type,
      count: 'count' in item ? Math.max(1, Math.floor(nonNegativeNumber(item.count, 1))) : 1,
      firstFoundAt: 'firstFoundAt' in item && typeof item.firstFoundAt === 'string' ? item.firstFoundAt : new Date().toISOString(),
    }))
}

export function loadProfileRegistry(storage: StorageLike = localStorage): ProfileRegistry {
  const saved = readStored<Partial<ProfileRegistry>>(storage, PROFILE_REGISTRY_STORAGE, {})
  const grades: Grade[] = [1, 2, 3, 4, 5, 6]
  const profiles = (Array.isArray(saved.profiles) ? saved.profiles : []).filter((profile) => profile && typeof profile.id === 'string' && typeof profile.name === 'string').map((profile) => ({
    ...profile,
    lastGrade: grades.includes(profile.lastGrade) ? profile.lastGrade : 1 as Grade,
    characterStyle: profile.characterStyle === 'boy' ? 'boy' as const : 'girl' as const,
    createdAt: profile.createdAt || new Date().toISOString(),
    lastPlayedAt: profile.lastPlayedAt || profile.createdAt || new Date().toISOString(),
  }))
  return { schemaVersion: 1, activeProfileId: profiles.some((profile) => profile.id === saved.activeProfileId) ? saved.activeProfileId ?? null : null, profiles }
}

export function loadProfileData(id: string | null, storage: StorageLike = localStorage): ProfileData {
  if (!id) {
    const problemStats = readStored<ProfileData['problemStats']>(storage, LEGACY_KEYS.problemStats, {})
    return {
    schemaVersion: 1,
    keyStats: readStored(storage, LEGACY_KEYS.keyStats, {}),
    collection: normalizeCollection(readStored(storage, LEGACY_KEYS.collection, [])),
    completedCourses: readStored(storage, LEGACY_KEYS.completedCourses, []),
    problemStats,
    scoreData: { ...emptyScoreData(), ...readStored(storage, LEGACY_KEYS.scoreData, emptyScoreData()) },
    dailyActivity: {}, goals: { dailyProblems: 5, weeklyProblems: 25 }, tutorialCompletedAt: Object.values(problemStats).some((stat) => stat.completions > 0) ? 'legacy' : '', audioSettings: { bgmOn: true, soundEffectsOn: true },
    }
  }
  return migrateProfileData(readStored<LegacyProfileData>(storage, profileDataKey(id), {}))
}

/** 保存形式を変更するときは、ここへバージョン順の変換を追加します。 */
export function migrateProfileData(saved: LegacyProfileData): ProfileData {
  const score: Record<string, unknown> = isRecord(saved.scoreData) ? saved.scoreData : {}
  const problemStats = isRecord(saved.problemStats) ? saved.problemStats as ProfileData['problemStats'] : {}
  const legacySoundOn = typeof saved.soundOn === 'boolean' ? saved.soundOn : true
  // 新しい版を古いクライアントで開いても、既知の項目は捨てずに読み取る。
  return {
    schemaVersion: 1,
    keyStats: isRecord(saved.keyStats) ? saved.keyStats as ProfileData['keyStats'] : {},
    collection: normalizeCollection(saved.collection),
    completedCourses: Array.isArray(saved.completedCourses) ? saved.completedCourses.filter((id): id is string => typeof id === 'string') : [],
    problemStats,
    dailyActivity: normalizeDailyActivity(saved.dailyActivity),
    goals: {
      dailyProblems: Math.max(1, Math.floor(nonNegativeNumber(saved.goals?.dailyProblems, 5))),
      weeklyProblems: Math.max(1, Math.floor(nonNegativeNumber(saved.goals?.weeklyProblems, 25))),
    },
    tutorialCompletedAt: typeof saved.tutorialCompletedAt === 'string' ? saved.tutorialCompletedAt : Object.values(problemStats).some((stat) => stat.completions > 0) ? 'legacy' : '',
    audioSettings: {
      bgmOn: typeof saved.audioSettings?.bgmOn === 'boolean' ? saved.audioSettings.bgmOn : legacySoundOn,
      soundEffectsOn: typeof saved.audioSettings?.soundEffectsOn === 'boolean' ? saved.audioSettings.soundEffectsOn : legacySoundOn,
    },
    scoreData: {
      ...emptyScoreData(),
      lifetime: nonNegativeNumber(score.lifetime),
      courseBest: numberRecord(score.courseBest),
      coursePlays: numberRecord(score.coursePlays),
    },
  }
}

export function saveProfileRegistry(registry: ProfileRegistry, storage: StorageLike = localStorage): boolean {
  try { storage.setItem(PROFILE_REGISTRY_STORAGE, JSON.stringify(registry)); return true } catch { return false }
}

export function saveProfileData(id: string, data: ProfileData, storage: StorageLike = localStorage): boolean {
  try { storage.setItem(profileDataKey(id), JSON.stringify(data)); return true } catch { return false }
}

export function createDebouncedProfileWriter(delayMs = 750, storage: StorageLike = localStorage, onError?: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending: { id: string; data: ProfileData } | undefined
  const flush = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
    if (!pending) return
    if (!saveProfileData(pending.id, pending.data, storage)) onError?.()
    pending = undefined
  }
  return {
    schedule(id: string, data: ProfileData) { pending = { id, data }; if (timer) clearTimeout(timer); timer = setTimeout(flush, delayMs) },
    flush,
    cancel() { if (timer) clearTimeout(timer); timer = undefined; pending = undefined },
  }
}
