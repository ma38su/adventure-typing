import type { UserProfile } from './domain'

export function hasProfileSettingsChanged(profile: UserProfile, settings: Pick<UserProfile, 'name' | 'lastGrade' | 'characterStyle'>) {
  const normalizedName = settings.name.trim().replace(/\s+/g, ' ')
  return normalizedName !== profile.name || settings.lastGrade !== profile.lastGrade || settings.characterStyle !== profile.characterStyle
}
