export type JourneySemanticCue = {
  worldProgress: number
  stage: number
  boundaryProximity: number
  regionId: 'meadow' | 'forest' | 'creek-approach' | 'mountain-proxy'
}

export type JourneyDiscoveryCue = {
  eventId: string
  worldProgress: number
  kind: 'item-light' | 'animal-hint'
  sceneOwnedCue: true
  rewardUiOwnedBy: 'game-2d-layer'
}

export type JourneySceneContracts = {
  onSemanticCue?: (cue: JourneySemanticCue) => void
  onDiscoveryCue?: (cue: JourneyDiscoveryCue) => void
}
