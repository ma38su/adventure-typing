export type RomajiCandidate = {
  target: string
  /** 入力文字数ごとに、表示用ローマ字のどこまで完了したかを示します。 */
  displayProgress: number[]
}

const ALIASES: Array<[string, string[]]> = [
  ['sha', ['sha', 'sya']], ['shu', ['shu', 'syu']], ['sho', ['sho', 'syo']],
  ['cha', ['cha', 'tya', 'cya']], ['chu', ['chu', 'tyu', 'cyu']], ['cho', ['cho', 'tyo', 'cyo']],
  ['ja', ['ja', 'zya', 'jya']], ['ju', ['ju', 'zyu', 'jyu']], ['jo', ['jo', 'zyo', 'jyo']],
  ['shi', ['shi', 'si']], ['chi', ['chi', 'ti']], ['tsu', ['tsu', 'tu']],
  ['fu', ['fu', 'hu']], ['ji', ['ji', 'zi']],
]

const KANA: Record<string, string> = {
  あ:'a',い:'i',う:'u',え:'e',お:'o',か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',
  さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to',
  な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',
  ま:'ma',み:'mi',む:'mu',め:'me',も:'mo',や:'ya',ゆ:'yu',よ:'yo',
  ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro',わ:'wa',を:'wo',
  が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo',
  だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',
  ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po',
  きゃ:'kya',きゅ:'kyu',きょ:'kyo',しゃ:'sha',しゅ:'shu',しょ:'sho',
  ちゃ:'cha',ちゅ:'chu',ちょ:'cho',にゃ:'nya',にゅ:'nyu',にょ:'nyo',
  ひゃ:'hya',ひゅ:'hyu',ひょ:'hyo',みゃ:'mya',みゅ:'myu',みょ:'myo',
  りゃ:'rya',りゅ:'ryu',りょ:'ryo',ぎゃ:'gya',ぎゅ:'gyu',ぎょ:'gyo',
  じゃ:'ja',じゅ:'ju',じょ:'jo',びゃ:'bya',びゅ:'byu',びょ:'byo',
  ぴゃ:'pya',ぴゅ:'pyu',ぴょ:'pyo',
}

/** 読み仮名とヘボン式表記を照合して、音節の「ん」だけを特定します。 */
function findSyllabicNPositions(reading: string, canonical: string) {
  const kana = reading.replace(/[\s。、！？・]/g, '')
  const positions = new Set<number>()
  let canonicalIndex = 0

  for (let index = 0; index < kana.length; index += 1) {
    const char = kana[index]
    if (char === 'ん') {
      if (canonical[canonicalIndex] === 'n') positions.add(canonicalIndex)
      canonicalIndex += 1
      continue
    }
    if (char === 'っ') {
      // 次の子音を重ねる部分（notte の最初の t など）。
      canonicalIndex += 1
      continue
    }

    const pair = char + (kana[index + 1] ?? '')
    const token = KANA[pair] ?? KANA[char]
    if (!token) continue
    if (KANA[pair]) index += 1
    canonicalIndex += token.length
  }

  return positions
}

export function buildRomajiCandidates(canonical: string, reading: string): RomajiCandidate[] {
  let candidates: RomajiCandidate[] = [{ target: '', displayProgress: [0] }]
  let canonicalIndex = 0
  const syllabicNPositions = findSyllabicNPositions(reading, canonical)

  while (canonicalIndex < canonical.length) {
    const alias = ALIASES.find(([token]) => canonical.startsWith(token, canonicalIndex))
    const canonicalToken = alias?.[0] ?? canonical[canonicalIndex]
    const variants = syllabicNPositions.has(canonicalIndex) ? ['n', 'nn'] : alias?.[1] ?? [canonicalToken]
    const next: RomajiCandidate[] = []

    for (const candidate of candidates) {
      for (const variant of variants) {
        const progress = [...candidate.displayProgress]
        for (let index = 0; index < variant.length; index += 1) {
          const withinToken = index === variant.length - 1
            ? canonicalToken.length
            : Math.max(1, Math.floor(((index + 1) / variant.length) * canonicalToken.length))
          progress.push(canonicalIndex + withinToken)
        }
        next.push({ target: candidate.target + variant, displayProgress: progress })
      }
    }

    candidates = next
    canonicalIndex += canonicalToken.length
  }

  return candidates
}
