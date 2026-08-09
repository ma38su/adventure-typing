import type { SetStateAction } from 'react'
import type { KeyStat, ScoreBreakdown } from '../domain'
import type { RewardDefinition } from '../rewards'

export type Mistake = { questionId: string; sentence: string; expected: string; actual: string }
export type PracticeMode = 'adventure' | 'weak-keys'
export type AdventureEvent = { action: 'rest' | 'drink'; icon: string; text: string; rewardType?: 'treasure' | 'friend'; asset?: string }
export type AdventureAction = 'idle' | 'walk' | 'rest' | 'drink'

export type GameRunState = {
  questionIndex: number
  typed: string
  mistakes: Mistake[]
  notice: { kind: 'good' | 'bad'; text: string } | null
  combo: number
  completed: boolean
  stepQueue: number
  stageWalked: number
  awaitingFinish: boolean
  adventureAction: AdventureAction
  adventureEvent: AdventureEvent | null
  adventureReward: RewardDefinition | null
  trailTreasure: RewardDefinition | null
  rewardAwaitingConfirmation: boolean
  courseScore: number
  runBonus: number
  lastScore: ScoreBreakdown | null
  practiceMode: PracticeMode
  reviewTargetKeys: string[]
  runKeyStats: Record<string, KeyStat>
}

export const initialGameRunState: GameRunState = {
  questionIndex: 0, typed: '', mistakes: [], notice: null, combo: 0, completed: false,
  stepQueue: 0, stageWalked: 0, awaitingFinish: false, adventureAction: 'idle',
  adventureEvent: null, adventureReward: null, trailTreasure: null,
  rewardAwaitingConfirmation: false, courseScore: 0, runBonus: 0, lastScore: null,
  practiceMode: 'adventure', reviewTargetKeys: [], runKeyStats: {},
}

type GameRunSetAction = { [K in keyof GameRunState]: { type: 'set'; key: K; value: SetStateAction<GameRunState[K]> } }[keyof GameRunState]

export type GameRunAction =
  | GameRunSetAction
  | { type: 'reset'; trailTreasure: RewardDefinition | null }
  | { type: 'prepare-question'; trailTreasure: RewardDefinition | null }
  | { type: 'advance-question'; questionIndex: number }

export function setGameRunField<K extends keyof GameRunState>(key: K, value: SetStateAction<GameRunState[K]>): GameRunAction {
  return { type: 'set', key, value } as GameRunSetAction
}

export function gameRunReducer(state: GameRunState, action: GameRunAction): GameRunState {
  switch (action.type) {
    case 'set': {
      const current = state[action.key]
      const value = typeof action.value === 'function'
        ? (action.value as (previous: typeof current) => typeof current)(current)
        : action.value
      return { ...state, [action.key]: value }
    }
    case 'reset':
      return { ...initialGameRunState, trailTreasure: action.trailTreasure }
    case 'prepare-question':
      return { ...state, adventureReward: null, trailTreasure: action.trailTreasure }
    case 'advance-question':
      return {
        ...state, questionIndex: action.questionIndex, typed: '', combo: 0, notice: null,
        awaitingFinish: false, rewardAwaitingConfirmation: false, adventureEvent: null,
        adventureReward: null, adventureAction: 'idle', stageWalked: 0,
      }
  }
}
