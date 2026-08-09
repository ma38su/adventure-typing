import { StageOneJourneyScene } from './StageOneJourneyScene'
import type { JourneySceneContracts } from './journeyContracts'

export type JourneyWorldProps = JourneySceneContracts & {
  stageNumber: number
  journeyProgress: number
  isTyping: boolean
  typingPace: number
  reducedMotion?: boolean
}

/**
 * Stable owner for the continuous JourneyWorld. Stage 1 is the only approved
 * renderer today; future stage chunks belong below this owner so crossing a
 * boundary does not recreate the canvas, camera, or audio transport.
 */
export function JourneyWorld({ stageNumber: _stageNumber, ...sceneProps }: JourneyWorldProps) {
  return <StageOneJourneyScene {...sceneProps} />
}
