import type { Grade } from './questions'
import type { CollectionRecord } from './rewards'

export type KeyStat = { attempts: number; misses: number; wrongKeys: Record<string, number> }
export type KeyStats = Record<string, KeyStat>
export type WrongSpot = { position: number; expected: string; actual: string; count: number }
export type ProblemStat = { attempts: number; completions: number; correctKeys: number; mistakes: number; totalTimeMs: number; completedKeys: number; bestKpm: number; lastPlayedAt: string; wrongSpots: Record<string, WrongSpot> }
export type ProblemStats = Record<string, ProblemStat>
export type ScoreData = { lifetime: number; courseBest: Record<string, number>; coursePlays: Record<string, number> }
export type DailyActivity = { date: string; completedProblems: number; correctKeys: number; mistakes: number; practiceMs: number; earnedPoints: number }
export type LearningGoals = { dailyProblems: number; weeklyProblems: number }
export type AudioSettings = { bgmOn: boolean; soundEffectsOn: boolean }
export type TypingDisplayCase = 'lower' | 'upper'
export type ScoreBreakdown = { total: number; accuracyPoints: number; speedPoints: number; accuracy: number; kpm: number }
export type CharacterStyle = 'girl' | 'boy'
export type UserProfile = { id: string; name: string; createdAt: string; lastPlayedAt: string; lastGrade: Grade; characterStyle: CharacterStyle }
export type ProfileRegistry = { schemaVersion: 1; activeProfileId: string | null; profiles: UserProfile[] }
export type ProfileData = { schemaVersion: 2; keyStats: KeyStats; collection: CollectionRecord[]; completedCourses: string[]; problemStats: ProblemStats; scoreData: ScoreData; dailyActivity: Record<string, DailyActivity>; goals: LearningGoals; tutorialCompletedAt: string; audioSettings: AudioSettings; typingDisplayCase: TypingDisplayCase }

export const emptyProblemStat = (): ProblemStat => ({ attempts: 0, completions: 0, correctKeys: 0, mistakes: 0, totalTimeMs: 0, completedKeys: 0, bestKpm: 0, lastPlayedAt: '', wrongSpots: {} })
export const emptyScoreData = (): ScoreData => ({ lifetime: 0, courseBest: {}, coursePlays: {} })
export const emptyProfileData = (): ProfileData => ({ schemaVersion: 2, keyStats: {}, collection: [], completedCourses: [], problemStats: {}, scoreData: emptyScoreData(), dailyActivity: {}, goals: { dailyProblems: 5, weeklyProblems: 25 }, tutorialCompletedAt: '', audioSettings: { bgmOn: true, soundEffectsOn: true }, typingDisplayCase: 'lower' })
