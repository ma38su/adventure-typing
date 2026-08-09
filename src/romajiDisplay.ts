export type RomajiDisplayUnit = {
  character: string
  state: 'typed' | 'cursor-char' | 'remaining' | 'space'
}

/**
 * 入力済み部分は実際に打った綴り、未入力部分は問題の標準表記で表示します。
 * 標準表記上の空白は、代替入力で文字数が変わっても元の語境界に置きます。
 */
export function buildRomajiDisplay(
  spacedCanonical: string,
  typed: string,
  inputDisplayProgress: number[],
): RomajiDisplayUnit[] {
  const units: RomajiDisplayUnit[] = []
  const wordBoundaries: number[] = []
  let canonicalPosition = 0

  for (const character of spacedCanonical) {
    if (character === ' ') wordBoundaries.push(canonicalPosition)
    else canonicalPosition += 1
  }

  let boundaryIndex = 0
  const addPassedSpaces = (progress: number) => {
    while (wordBoundaries[boundaryIndex] <= progress) {
      units.push({ character: ' ', state: 'space' })
      boundaryIndex += 1
    }
  }

  for (let index = 0; index < typed.length; index += 1) {
    addPassedSpaces(inputDisplayProgress[index] ?? 0)
    units.push({ character: typed[index], state: 'typed' })
  }

  const displayProgress = inputDisplayProgress[typed.length] ?? 0
  addPassedSpaces(displayProgress)

  let remainingPosition = 0
  let cursorAdded = false
  for (const character of spacedCanonical) {
    if (character === ' ') {
      if (remainingPosition > displayProgress) units.push({ character, state: 'space' })
      continue
    }
    if (remainingPosition >= displayProgress) {
      units.push({ character, state: cursorAdded ? 'remaining' : 'cursor-char' })
      cursorAdded = true
    }
    remainingPosition += 1
  }

  return units
}
