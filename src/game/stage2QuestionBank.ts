import { QUESTIONS, type Grade, type StageSection } from '../questions'
import type { LinearAuthoredQuestion } from './linearQuestionTypes'

const compactLength = (romaji: string) => romaji.replaceAll(' ', '').length
const anchorIds = ['creek-bridge', 'tree-hollow', 'terrace-turn', 'forest-thins', 'star-gate'] as const
const legacyStage2 = new Map(QUESTIONS[1].filter((question) => question.stage === 2).map((question) => [question.id, question]))

let newIndex = 0
const authored = (course: StageSection, sentence: string, reading: string, ruby: string[], romaji: string, focus: string, meaning: string): LinearAuthoredQuestion => {
  newIndex += 1
  return {
    id: `story-02-new-${String(newIndex).padStart(2, '0')}`,
    stage: 2,
    section: course,
    storyStage: 2,
    anchorId: anchorIds[course - 1],
    recommendedGrade: (((newIndex - 1) % 6) + 1) as Grade,
    difficultyLevel: compactLength(romaji),
    sentence,
    reading,
    ruby,
    romaji,
    focus,
    meaning,
  }
}

const adapt = (sourceId: string, course: StageSection, sentence: string, reading: string, ruby: string[], romaji: string, focus: string, meaning: string): LinearAuthoredQuestion => {
  if (!legacyStage2.has(sourceId)) throw new Error(`Stage 2再利用問題がありません: ${sourceId}`)
  return {
    id: `story-02-source-${sourceId}`,
    stage: 2,
    section: course,
    storyStage: 2,
    anchorId: anchorIds[course - 1],
    recommendedGrade: 1,
    difficultyLevel: compactLength(romaji),
    sentence,
    reading,
    ruby,
    romaji,
    focus,
    meaning,
    sourceId,
  }
}

export const STAGE_2_QUESTION_BANK: readonly LinearAuthoredQuestion[] = [
  authored(1, '橋だ', 'はしだ', ['[橋:はし]だ'], 'hashida', '橋', 'Stage 1と同じ小川橋へ着く'),
  authored(1, '小川だ', 'おがわだ', ['[小川:おがわ]だ'], 'ogawada', '小川', '橋の下を流れる小川を見る'),
  authored(1, '森だ', 'もりだ', ['[森:もり]だ'], 'morida', '森', '橋の対岸にも森が続くと分かる'),
  authored(1, '苔だ', 'こけだ', ['[苔:こけ]だ'], 'kokeda', '苔', '湿った橋ぎわの苔を見る'),
  adapt('1-s06', 1, '森へ', 'もりへ', ['[森:もり]へ'], 'morihe', '森', '橋を渡って細い森の道を進む'),
  adapt('1-s07', 1, '石だ', 'いしだ', ['[石:いし]だ'], 'ishida', '石', '小川沿いの湿った丸石を見る'),
  adapt('1-s08', 1, '花だ', 'はなだ', ['[花:はな]だ'], 'hanada', '花', '森の入口に残る白い花が揺れる'),

  adapt('1-s05', 2, '鳥の 歌', 'とりの うた', ['[鳥:とり]の', '[歌:うた]'], 'torino uta', '鳥・歌', '樹洞の近くでピピの声を聞く'),
  adapt('1-x03', 2, '鳥だ', 'とりだ', ['[鳥:とり]だ'], 'torida', '鳥', '枝から枝へ移る小鳥を見る'),
  adapt('1-x04', 2, '虫だ', 'むしだ', ['[虫:むし]だ'], 'mushida', '虫', '重なる音の一つが虫の音だと分ける'),
  authored(2, '木の 穴', 'きの あな', ['[木:き]の', '[穴:あな]'], 'kino ana', '木・穴', '音が返る低い樹洞を見つける'),
  authored(2, '葉の 音', 'はの おと', ['[葉:は]の', '[音:おと]'], 'hano oto', '葉・音', '風で鳴る葉の音を聞き分ける'),
  authored(2, '水の 音', 'みずの おと', ['[水:みず]の', '[音:おと]'], 'mizuno oto', '水・音', '小川の音を小鳥の合図から分ける'),
  authored(2, 'よく 聞く', 'よく きく', ['よく', '[聞:き]く'], 'yoku kiku', '聞', '立ち止まって小鳥の合図をよく聞く'),
  authored(2, '合図だ', 'あいずだ', ['[合図:あいず]だ'], 'aizuda', '合図', '短い応答音がピピの合図だと分かる'),

  authored(3, '大木だ', 'おおきだ', ['[大木:おおき]だ'], 'ookida', '大木', '斜面の手前に立つ樹洞の大木を見る'),
  authored(3, '木の 穴', 'きの あな', ['[木:き]の', '[穴:あな]'], 'kino ana', '木・穴', '大木の低い位置にある樹洞を見る'),
  authored(3, '坂だ', 'さかだ', ['[坂:さか]だ'], 'sakada', '坂', '大木の先で緩く上る斜面を見る'),
  authored(3, '倒木だ', 'とうぼくだ', ['[倒木:とうぼく]だ'], 'toubokuda', '倒木', '斜面の途中に倒木が横たわる'),
  authored(3, 'すき間だ', 'すきまだ', ['すき[間:ま]だ'], 'sukimada', '間', '倒木の脇に道が通るすき間を見る'),
  authored(3, '木が へる', 'きが へる', ['[木:き]が', 'へる'], 'kiga heru', '木', '上る道の先で木々が少なくなる'),
  authored(3, '空の ぬけ', 'そらの ぬけ', ['[空:そら]の', 'ぬけ'], 'sorano nuke', '空', '薄くなった木々の間に空の抜けを見る'),
  authored(3, 'のぼる 坂', 'のぼる さか', ['のぼる', '[坂:さか]'], 'noboru saka', '坂', '空の見える方へ続く一本の上り道を見る'),

  adapt('1-001', 4, '木で 休む', 'きで やすむ', ['[木:き]で', '[休:やす]む'], 'kide yasumu', '木・休', '疎林へ上る前に木陰で短く休む'),
  authored(4, '木が へる', 'きが へる', ['[木:き]が', 'へる'], 'kiga heru', '木', '標高が上がり高木が少しずつ減る'),
  authored(4, '空が 見える', 'そらが みえる', ['[空:そら]が', '[見:み]える'], 'soraga mieru', '空・見', '樹冠の切れ間から空が広がる'),
  authored(4, '岩が ふえる', 'いわが ふえる', ['[岩:いわ]が', 'ふえる'], 'iwaga fueru', '岩', '林床に灰青の岩が増えてくる'),
  authored(4, 'かわく 土', 'かわく つち', ['かわく', '[土:つち]'], 'kawaku tsuchi', '土', '小川を離れて踏み跡の土が乾く'),
  authored(4, '草が ひくい', 'くさが ひくい', ['[草:くさ]が', 'ひくい'], 'kusaga hikui', '草', '風を受ける低い草へ植生が変わる'),
  authored(4, '霧が うすい', 'きりが うすい', ['[霧:きり]が', 'うすい'], 'kiriga usui', '霧', '上るにつれて森の霧が薄くなる'),
  authored(4, '山が 近い', 'やまが ちかい', ['[山:やま]が', '[近:ちか]い'], 'yamaga chikai', '山・近', '木々の狭間で山稜が近づく'),

  authored(5, '石の 門', 'いしの もん', ['[石:いし]の', '[門:もん]'], 'ishino mon', '石・門', '樹冠の切れ間に低い石門を見る'),
  authored(5, '門が 見える', 'もんが みえる', ['[門:もん]が', '[見:み]える'], 'monga mieru', '門・見', '坂の先に星見門がはっきり見える'),
  authored(5, '青い 山', 'あおい やま', ['[青:あお]い', '[山:やま]'], 'aoi yama', '青・山', '門の向こうに灰青の山稜を見る'),
  authored(5, '道は のぼる', 'みちは のぼる', ['[道:みち]は', 'のぼる'], 'michiha noboru', '道', '星見門の先も山腹道が続く'),
  authored(5, '風が とおる', 'かぜが とおる', ['[風:かぜ]が', 'とおる'], 'kazega tooru', '風', '疎林から門へ山の風が通る'),
  authored(5, '森を 出る', 'もりを でる', ['[森:もり]を', '[出:で]る'], 'moriwo deru', '森・出', '森を途切れさせず疎林から山側へ出る'),
  authored(5, '門へ 行く', 'もんへ いく', ['[門:もん]へ', '[行:い]く'], 'monhe iku', '門・行', '低い星見門へ向かう'),
  authored(5, '山道だ', 'やまみちだ', ['[山道:やまみち]だ'], 'yamamichida', '山道', '門の先が次の山道だと分かる'),
]
