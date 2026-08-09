import { QUESTIONS, type Grade, type Question, type StageSection } from '../questions'

export type LinearAuthoredQuestion = Question & {
  storyStage: 1
  anchorId: string
  recommendedGrade: Grade
  difficultyLevel: number
  sourceId?: string
}

const compactLength = (romaji: string) => romaji.replaceAll(' ', '').length
const anchorIds = ['arrival', 'flower-slope', 'tracks', 'seed-glow', 'seed-restored', 'forest-edge', 'rabbit-creek-bridge'] as const

let authoredIndex = 0
const authored = (course: StageSection, sentence: string, reading: string, ruby: string[], romaji: string, focus: string, meaning: string): LinearAuthoredQuestion => {
  authoredIndex += 1
  return {
    id: `story-01-new-${String(authoredIndex).padStart(2, '0')}`,
    stage: 1,
    section: course,
    storyStage: 1,
    anchorId: anchorIds[course - 1],
    recommendedGrade: (((authoredIndex - 1) % 6) + 1) as Grade,
    difficultyLevel: compactLength(romaji),
    sentence,
    reading,
    ruby,
    romaji,
    focus,
    meaning,
  }
}

const legacyStage1 = new Map(QUESTIONS[1].filter((question) => question.stage === 1).map((question) => [question.id, question]))
const reuse = (sourceId: string, course: StageSection, anchorId: string): LinearAuthoredQuestion => {
  const source = legacyStage1.get(sourceId)
  if (!source) throw new Error(`Stage 1再利用問題がありません: ${sourceId}`)
  return {
    ...source,
    id: `story-01-source-${sourceId}`,
    section: course,
    storyStage: 1,
    anchorId,
    recommendedGrade: 1,
    difficultyLevel: compactLength(source.romaji),
    sourceId,
  }
}

const adapt = (sourceId: string, course: StageSection, sentence: string, reading: string, ruby: string[], romaji: string, focus: string, meaning: string): LinearAuthoredQuestion => ({
  ...authored(course, sentence, reading, ruby, romaji, focus, meaning),
  id: `story-01-source-${sourceId}`,
  recommendedGrade: 1,
  sourceId,
})

export const STAGE_1_QUESTION_BANK: readonly LinearAuthoredQuestion[] = [
  reuse('1-s01', 1, anchorIds[0]),
  reuse('1-s01b', 1, anchorIds[0]),
  reuse('1-s01c', 1, anchorIds[0]),
  authored(1, '波だ', 'なみだ', ['[波:なみ]だ'], 'namida', '波', '船着き場のそばで穏やかな波を確かめる'),
  authored(1, '浜だ', 'はまだ', ['[浜:はま]だ'], 'hamada', '浜', '船を降りて草原側の浜へ着く'),
  authored(1, '船だ', 'ふねだ', ['[船:ふね]だ'], 'funeda', '船', '到着した小さな船を振り返る'),
  authored(1, '朝だ', 'あさだ', ['[朝:あさ]だ'], 'asada', '朝', '明るい朝の草原へ歩き出す'),

  reuse('1-000b', 2, anchorIds[1]),
  authored(2, '花を 見る', 'はなを みる', ['[花:はな]を', '[見:み]る'], 'hanawo miru', '花・見', '緩丘に咲く花を近くで見る'),
  authored(2, '花の 色', 'はなの いろ', ['[花:はな]の', '[色:いろ]'], 'hanano iro', '花・色', '花の色の違いを見比べる'),
  authored(2, '白い 花', 'しろい はな', ['[白:しろ]い', '[花:はな]'], 'shiroi hana', '白・花', '足跡の近くにある白い花を見る'),
  authored(2, '草の 道', 'くさの みち', ['[草:くさ]の', '[道:みち]'], 'kusano michi', '草・道', '丘を上る細い草の踏み跡へ入る'),
  authored(2, '風に ゆれる', 'かぜに ゆれる', ['[風:かぜ]に', 'ゆれる'], 'kazeni yureru', '風', '海風で花と短草が揺れる'),
  authored(2, '足あとだ', 'あしあとだ', ['[足:あし]あとだ'], 'ashiatoda', '足', '花の間に小さな足跡を見つける'),

  adapt('1-s04b', 3, '草を 進む', 'くさを すすむ', ['[草:くさ]を', '[進:すす]む'], 'kusawo susumu', '草・進', '草原の細い道を進む'),
  authored(3, '白い あと', 'しろい あと', ['[白:しろ]い', 'あと'], 'shiroi ato', '白', '浅い涸れ沢の白い足跡を見る'),
  authored(3, 'あとを 追う', 'あとを おう', ['あとを', '[追:お]う'], 'atowo ou', '追', '足跡を踏まず横から向きを追う'),
  authored(3, '右へ 行く', 'みぎへ いく', ['[右:みぎ]へ', '[行:い]く'], 'migihe iku', '右・行', '足跡が向く右側の細道を選ぶ'),
  authored(3, '草が 動く', 'くさが うごく', ['[草:くさ]が', '[動:うご]く'], 'kusaga ugoku', '草・動', '風と違う局所的な草の動きに気づく'),
  authored(3, '何か いる', 'なにか いる', ['[何:なに]か', 'いる'], 'nanika iru', '何', '草陰に小さな生き物の気配を感じる'),
  authored(3, '森を さす', 'もりを さす', ['[森:もり]を', 'さす'], 'moriwo sasu', '森', '足跡が森の方向へ続くと分かる'),

  authored(4, '光だ', 'ひかりだ', ['[光:ひかり]だ'], 'hikarida', '光', '河岸段丘の草陰に柔らかな光を見る'),
  authored(4, '光る 土', 'ひかる つち', ['[光:ひか]る', '[土:つち]'], 'hikaru tsuchi', '光・土', '足元の土から弱い光が漏れる'),
  authored(4, 'よく 見る', 'よく みる', ['よく', '[見:み]る'], 'yoku miru', '見', '動かない種の光をよく観察する'),
  authored(4, '近くへ 行く', 'ちかくへ いく', ['[近:ちか]くへ', '[行:い]く'], 'chikakue iku', '近・行', '光を驚かせない速さで近づく'),
  authored(4, '種かな', 'たねかな', ['[種:たね]かな'], 'tanekana', '種', '土の光が探していた種か考える'),
  authored(4, '小さい', 'ちいさい', ['[小:ちい]さい'], 'chiisai', '小', '草の下の光が小さいことを確かめる'),
  authored(4, '草の 下', 'くさの した', ['[草:くさ]の', '[下:した]'], 'kusano shita', '草・下', '種が草の根元に隠れていると分かる'),

  reuse('1-s03', 5, anchorIds[4]),
  authored(5, '種だ', 'たねだ', ['[種:たね]だ'], 'taneda', '種', '最初のひかりの種を見つける'),
  authored(5, '種を 取る', 'たねを とる', ['[種:たね]を', '[取:と]る'], 'tanewo toru', '種・取', '土を荒らさず種をそっと受け取る'),
  authored(5, '種を 守る', 'たねを まもる', ['[種:たね]を', '[守:まも]る'], 'tanewo mamoru', '種・守', '光る種を手の中で守る'),
  authored(5, '光が くる', 'ひかりが くる', ['[光:ひかり]が', 'くる'], 'hikariga kuru', '光', '種の光が周りの花へ流れる'),
  authored(5, '花が ひらく', 'はなが ひらく', ['[花:はな]が', 'ひらく'], 'hanaga hiraku', '花', '閉じていた花が順にひらく'),
  authored(5, '色が もどる', 'いろが もどる', ['[色:いろ]が', 'もどる'], 'iroga modoru', '色', '緩丘の花にやさしい色が戻る'),
  authored(5, '光る 道', 'ひかる みち', ['[光:ひか]る', '[道:みち]'], 'hikaru michi', '光・道', '花の光が森へ向かう踏み跡を示す'),

  reuse('1-s02', 6, anchorIds[5]),
  adapt('1-s04d', 6, '森へ 進む', 'もりへ すすむ', ['[森:もり]へ', '[進:すす]む'], 'morihe susumu', '森・進', '海辺から森へ旅を続ける'),
  authored(6, '木が 見える', 'きが みえる', ['[木:き]が', '[見:み]える'], 'kiga mieru', '木・見', '防風林の若木が近くに見える'),
  authored(6, '若い 木', 'わかい き', ['[若:わか]い', '[木:き]'], 'wakai ki', '若・木', '草原と森の間に若い木が増える'),
  authored(6, '森が 近い', 'もりが ちかい', ['[森:もり]が', '[近:ちか]い'], 'moriga chikai', '森・近', '木陰が増えて森が近いと分かる'),
  authored(6, '葉が ゆれる', 'はが ゆれる', ['[葉:は]が', 'ゆれる'], 'haga yureru', '葉', '林縁の葉が海風で揺れる'),
  authored(6, '影が ふえる', 'かげが ふえる', ['[影:かげ]が', 'ふえる'], 'kagega fueru', '影', '若木の影が踏み跡へ増えてくる'),
  authored(6, '道が 細い', 'みちが ほそい', ['[道:みち]が', '[細:ほそ]い'], 'michiga hosoi', '道・細', '森へ入る踏み跡が獣道ほどに細くなる'),

  reuse('1-s04', 7, anchorIds[6]),
  adapt('1-s04c', 7, '海の 風', 'うみの かぜ', ['[海:うみ]の', '[風:かぜ]'], 'umino kaze', '海・風', '森の入口でも海からの風を感じる'),
  authored(7, '耳が 見える', 'みみが みえる', ['[耳:みみ]が', '[見:み]える'], 'mimiga mieru', '耳・見', '草の丘からノウサギの耳が見える'),
  authored(7, 'うさぎだ', 'うさぎだ', ['うさぎだ'], 'usagida', 'うさぎ', '足跡の主がノウサギだと分かる'),
  authored(7, '森へ はねる', 'もりへ はねる', ['[森:もり]へ', 'はねる'], 'morihe haneru', '森', 'ノウサギが森側の草陰へ退く'),
  authored(7, 'あとが 続く', 'あとが つづく', ['あとが', '[続:つづ]く'], 'atoga tsuzuku', '続', '新しい足跡が小川の方へ続く'),
  authored(7, '水の 音', 'みずの おと', ['[水:みず]の', '[音:おと]'], 'mizuno oto', '水・音', '森の内側から小川の音が聞こえる'),
  authored(7, '橋に 着く', 'はしに つく', ['[橋:はし]に', '[着:つ]く'], 'hashini tsuku', '橋・着', '森の小川に架かる細い木橋へ着く'),
]
