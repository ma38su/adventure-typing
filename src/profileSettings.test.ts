import { describe, expect, it } from 'vitest'
import type { UserProfile } from './domain'
import { hasProfileSettingsChanged } from './profileSettings'

const profile: UserProfile = {
  id: 'player-1',
  name: 'ミナ',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastPlayedAt: '2026-01-01T00:00:00.000Z',
  lastGrade: 2,
  characterStyle: 'girl',
}

describe('hasProfileSettingsChanged', () => {
  it('前後の空白や連続空白だけでは変更扱いにしない', () => {
    expect(hasProfileSettingsChanged(profile, { name: '  ミナ  ', lastGrade: 2, characterStyle: 'girl' })).toBe(false)
  })

  it('名前・学年・冒険者の変更を検出する', () => {
    expect(hasProfileSettingsChanged(profile, { name: 'ソラ', lastGrade: 2, characterStyle: 'girl' })).toBe(true)
    expect(hasProfileSettingsChanged(profile, { name: 'ミナ', lastGrade: 3, characterStyle: 'girl' })).toBe(true)
    expect(hasProfileSettingsChanged(profile, { name: 'ミナ', lastGrade: 2, characterStyle: 'boy' })).toBe(true)
  })
})
