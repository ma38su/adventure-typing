export type RomajiCharacterState = 'typed' | 'cursor-char' | 'remaining'

export const getRomajiCharacterState = (position: number, displayProgress: number): RomajiCharacterState => (
  position < displayProgress ? 'typed' : position === displayProgress ? 'cursor-char' : 'remaining'
)
