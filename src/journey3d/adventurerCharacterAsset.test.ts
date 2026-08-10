import { describe, expect, it } from 'vitest'
import {
  inspectAdventurerCharacterAsset,
  REQUIRED_ADVENTURER_CLIPS,
  REQUIRED_ADVENTURER_EXPRESSIONS,
} from './adventurerCharacterAsset'

describe('adventurer character GLB gate', () => {
  it('accepts a skinned asset with all required clips and expressions', () => {
    expect(inspectAdventurerCharacterAsset({
      clipNames: REQUIRED_ADVENTURER_CLIPS,
      morphTargetNames: REQUIRED_ADVENTURER_EXPRESSIONS,
      hasSkinnedMesh: true,
    })).toEqual({ ready: true, missingClips: [], missingExpressions: [], errors: [] })
  })

  it('reports structural omissions instead of silently falling back', () => {
    const report = inspectAdventurerCharacterAsset({
      clipNames: ['idle', 'walk'],
      morphTargetNames: ['blink'],
      hasSkinnedMesh: false,
    })
    expect(report.ready).toBe(false)
    expect(report.missingClips).toContain('run')
    expect(report.missingExpressions).toContain('smile')
    expect(report.errors).toHaveLength(1)
  })
})

