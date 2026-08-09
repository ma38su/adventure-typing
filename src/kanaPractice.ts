export type Hand = 'left' | 'right'
export type FingerName = '小指' | '薬指' | '中指' | '人差し指'
export type FingerGuide = { hand: Hand; finger: FingerName; color: string }
export type KanaItem = { kana: string; romaji: string; instruction?: string }
export type KanaCourse = { id: string; name: string; subtitle: string; icon: string; color: string; focus: string; optional?: boolean; unlocksAdventure?: boolean; items: KanaItem[] }

const makeItems = (source: string, instruction?: string): KanaItem[] => source.trim().split(/\s+/).map((pair) => {
  const [kana, romaji] = pair.split(':')
  return { kana, romaji, instruction }
})

export const FINGER_KEYS: Array<[string, FingerGuide]> = [
  ['qaz', { hand: 'left', finger: '小指', color: '#e56f6f' }],
  ['wsx', { hand: 'left', finger: '薬指', color: '#e89b52' }],
  ['edc', { hand: 'left', finger: '中指', color: '#d8b73f' }],
  ['rfvtgb', { hand: 'left', finger: '人差し指', color: '#45ad82' }],
  ['yuhjnm', { hand: 'right', finger: '人差し指', color: '#3da8a9' }],
  ['ik', { hand: 'right', finger: '中指', color: '#558ed4' }],
  ['ol', { hand: 'right', finger: '薬指', color: '#8276d8' }],
  ['p', { hand: 'right', finger: '小指', color: '#c36fc0' }],
  ['1', { hand: 'left', finger: '小指', color: '#e56f6f' }],
  ['2', { hand: 'left', finger: '薬指', color: '#e89b52' }],
  ['3', { hand: 'left', finger: '中指', color: '#d8b73f' }],
  ['45', { hand: 'left', finger: '人差し指', color: '#45ad82' }],
  ['67', { hand: 'right', finger: '人差し指', color: '#3da8a9' }],
  ['8,', { hand: 'right', finger: '中指', color: '#558ed4' }],
  ['9.', { hand: 'right', finger: '薬指', color: '#8276d8' }],
  ['0/-', { hand: 'right', finger: '小指', color: '#c36fc0' }],
]

export const getFingerGuide = (key: string): FingerGuide | undefined => FINGER_KEYS.find(([keys]) => keys.includes(key.toLowerCase()))?.[1]
export const HOME_KEYS = ['a', 's', 'd', 'f', 'j', 'k', 'l']
export const FINGER_KEYBOARD_ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm,./-']

export const KANA_COURSES: KanaCourse[] = [
  {
    id: 'home-position', name: 'ホームポジション', subtitle: '指を正しい場所に置こう', icon: '🏠', color: '#45b99c', focus: 'FとJの突起を目印に、打ったら指をホームポジションへ戻そう', unlocksAdventure: true,
    items: makeItems('あ:a さ:sa だ:da ふ:fu じ:ji く:ku る:ru', 'キーを見ずに、担当する指でゆっくり押そう'),
  },
  {
    id: 'index-fingers', name: '人差し指のキー', subtitle: 'F・G・R・T・V・B ／ J・H・Y・U・N・M', icon: '☝️', color: '#32a98f', focus: '左右の人差し指が担当するキーをまとめて練習',
    items: makeItems('ふる:fur ぶた:buta て:te ぐ:gu むぎ:mugi ゆめ:yume ひ:hi なみ:nami', '人差し指を上下に動かし、打ったらFかJへ戻そう'),
  },
  {
    id: 'outer-fingers', name: '中指・薬指・小指', subtitle: '遠いキーを指ごとに覚えよう', icon: '🖐️', color: '#578fd0', focus: '手全体をずらさず、担当の指だけを伸ばそう',
    items: makeItems('き:ki こ:ko しか:shika せかい:sekai おと:oto そら:sora ぱん:pan えき:eki', '画面の指ガイドと同じ指で押そう'),
  },
  {
    id: 'vowels', name: '母音を指で覚える', subtitle: 'A・I・U・E・Oを正しい指で', icon: '🌱', color: '#60ad55', focus: '母音はローマ字の土台。5つの位置と担当指を覚えよう',
    items: makeItems('あ:a い:i う:u え:e お:o あお:ao いえ:ie うえ:ue', '母音ごとに担当する指が変わることを意識しよう'),
  },
  {
    id: 'hand-alternation', name: '左右交互タイピング', subtitle: '片手にかたよらずリズムよく', icon: '↔️', color: '#e49a43', focus: '左手と右手を交互に使い、手を止めずに入力しよう',
    items: makeItems('さかな:sakana たから:takara そら:sora かぜ:kaze ひかり:hikari やま:yama ほし:hoshi みどり:midori', '次に使う手を先に準備して、一定のリズムで打とう'),
  },
  {
    id: 'words', name: 'ことばの実践', subtitle: '正しい指のまま、よく使う言葉へ', icon: '⭐', color: '#9a74d5', focus: '速さより正確さ。ホームポジションへ戻る動きを続けよう',
    items: makeItems('こんにちは:konnichiha ありがとう:arigatou ぼうけん:bouken きーぼーど:ki-bo-do たいぴんぐ:taipingu', '手元を見ず、迷ったら指ガイドを確認しよう'),
  },
  {
    id: 'numbers', name: '数字キー', subtitle: '1〜0を担当する指で押そう', icon: '🔢', color: '#c98245', focus: '手元を見ず、ホームポジションから上へ指を伸ばそう', optional: true,
    items: [
      { kana: '123', romaji: '123' }, { kana: '456', romaji: '456' }, { kana: '7890', romaji: '7890' },
      { kana: '2026', romaji: '2026' }, { kana: '12345', romaji: '12345' }, { kana: '67890', romaji: '67890' },
    ],
  },
  {
    id: 'symbols', name: '記号キー', subtitle: '「,」「.」「-」「/」の練習', icon: '＃', color: '#b36aa7', focus: '文章や日付でよく使う記号を、右手の担当指で押そう', optional: true,
    items: [
      { kana: 'カンマ', romaji: ',' }, { kana: 'ピリオド', romaji: '.' }, { kana: 'ハイフン', romaji: '-' }, { kana: 'スラッシュ', romaji: '/' },
      { kana: '日付', romaji: '8/9' }, { kana: '小数', romaji: '3.14' }, { kana: '区切り', romaji: '1,000' },
    ],
  },
]
