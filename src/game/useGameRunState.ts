import { useCallback, useReducer, type SetStateAction } from 'react'
import type { KeyStat, ScoreBreakdown } from '../domain'
import type { RewardDefinition } from '../rewards'
import { gameRunReducer, initialGameRunState, setGameRunField, type AdventureEvent, type GameRunState, type Mistake, type PracticeMode } from './gameRunReducer'

export function useGameRunState() {
  const [state, dispatch] = useReducer(gameRunReducer, initialGameRunState)
  const setField = useCallback(<K extends keyof GameRunState>(key: K, value: SetStateAction<GameRunState[K]>) => dispatch(setGameRunField(key, value)), [])
  return {
    state,
    dispatch,
    setQuestionIndex: useCallback((value: SetStateAction<number>) => setField('questionIndex', value), [setField]),
    setTyped: useCallback((value: SetStateAction<string>) => setField('typed', value), [setField]),
    setMistakes: useCallback((value: SetStateAction<Mistake[]>) => setField('mistakes', value), [setField]),
    setNotice: useCallback((value: SetStateAction<GameRunState['notice']>) => setField('notice', value), [setField]),
    setCombo: useCallback((value: SetStateAction<number>) => setField('combo', value), [setField]),
    setCompleted: useCallback((value: SetStateAction<boolean>) => setField('completed', value), [setField]),
    setStepQueue: useCallback((value: SetStateAction<number>) => setField('stepQueue', value), [setField]),
    setStageWalked: useCallback((value: SetStateAction<number>) => setField('stageWalked', value), [setField]),
    setAwaitingFinish: useCallback((value: SetStateAction<boolean>) => setField('awaitingFinish', value), [setField]),
    setAdventureAction: useCallback((value: SetStateAction<GameRunState['adventureAction']>) => setField('adventureAction', value), [setField]),
    setAdventureEvent: useCallback((value: SetStateAction<AdventureEvent | null>) => setField('adventureEvent', value), [setField]),
    setAdventureReward: useCallback((value: SetStateAction<RewardDefinition | null>) => setField('adventureReward', value), [setField]),
    setRewardAwaitingConfirmation: useCallback((value: SetStateAction<boolean>) => setField('rewardAwaitingConfirmation', value), [setField]),
    setCourseScore: useCallback((value: SetStateAction<number>) => setField('courseScore', value), [setField]),
    setRunBonus: useCallback((value: SetStateAction<number>) => setField('runBonus', value), [setField]),
    setLastScore: useCallback((value: SetStateAction<ScoreBreakdown | null>) => setField('lastScore', value), [setField]),
    setPracticeMode: useCallback((value: SetStateAction<PracticeMode>) => setField('practiceMode', value), [setField]),
    setReviewTargetKeys: useCallback((value: SetStateAction<string[]>) => setField('reviewTargetKeys', value), [setField]),
    setRunKeyStats: useCallback((value: SetStateAction<Record<string, KeyStat>>) => setField('runKeyStats', value), [setField]),
  }
}
