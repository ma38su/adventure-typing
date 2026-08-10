export const ADVENTURER_CHARACTER_ASSET_URL = '/assets/characters/adventurer-girl-v1.glb'

export const REQUIRED_ADVENTURER_CLIPS = [
  'idle',
  'walk',
  'run',
  'look',
  'discover',
  'receive',
] as const

export const REQUIRED_ADVENTURER_EXPRESSIONS = [
  'blink',
  'smile',
  'joy',
  'surprise',
  'aa',
  'ih',
  'ou',
  'ee',
  'oh',
] as const

export type AdventurerAssetInspection = {
  clipNames: readonly string[]
  morphTargetNames: readonly string[]
  hasSkinnedMesh: boolean
}

export type AdventurerAssetReport = {
  ready: boolean
  missingClips: readonly string[]
  missingExpressions: readonly string[]
  errors: readonly string[]
}

/**
 * Renderer-independent import gate. A GLB is not considered usable merely
 * because GLTFLoader can parse it; it must carry the agreed skin, clips and
 * facial morph targets before the primitive preview can be retired.
 */
export function inspectAdventurerCharacterAsset(input: AdventurerAssetInspection): AdventurerAssetReport {
  const clipNames = new Set(input.clipNames)
  const expressionNames = new Set(input.morphTargetNames)
  const missingClips = REQUIRED_ADVENTURER_CLIPS.filter((name) => !clipNames.has(name))
  const missingExpressions = REQUIRED_ADVENTURER_EXPRESSIONS.filter((name) => !expressionNames.has(name))
  const errors = input.hasSkinnedMesh ? [] : ['GLBにSkinnedMeshがありません。']
  return {
    ready: errors.length === 0 && missingClips.length === 0 && missingExpressions.length === 0,
    missingClips,
    missingExpressions,
    errors,
  }
}

