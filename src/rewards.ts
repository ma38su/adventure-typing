import type { Grade } from './questions'

export type RewardType = 'treasure' | 'friend'
export type RewardRarity = 'common' | 'rare'
export type Course = 1 | 2 | 3 | 4 | 5 | 6

export type RewardDefinition = {
  id: string
  type: RewardType
  name: string
  icon: string
  asset?: string
  rarity: RewardRarity
  bonus: number
  chance: number
  encounterAccuracy?: number
  encounterKpmRatio?: number
  grade?: Grade
  course?: Course
}

export type CollectionRecord = {
  id: string
  type: RewardType
  count: number
  firstFoundAt: string
}

export type CourseTheme = {
  name: string
  habitat: string
  description: string
  icon: string
  commonTreasureIds: [string, string, string]
  commonFriendIds: [string, string, string]
  rareTreasure: string
  rareTreasureIcon: string
  rareFriend: string
  rareFriendIcon: string
}

export const REWARD_BONUSES = {
  commonTreasure: 15,
  commonFriend: 20,
  rareTreasure: 60,
  rareFriend: 80,
} as const

const COMMON_TREASURE_DEFINITIONS: RewardDefinition[] = [
  { id: 'flower-charm', type: 'treasure', name: '花のチャーム', icon: '🌸', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'trail-badge', type: 'treasure', name: '冒険者のバッジ', icon: '🎖️', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'sun-stone', type: 'treasure', name: 'おひさま石', icon: '☀️', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'acorn-whistle', type: 'treasure', name: 'どんぐり笛', icon: '🌰', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'forest-pen', type: 'treasure', name: '森の羽根ペン', icon: '🪶', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'wooden-emblem', type: 'treasure', name: '木の葉の紋章', icon: '🍃', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'star-crystal', type: 'treasure', name: '星の結晶', icon: '💎', asset: '/treasures/star-crystal.webp', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'climber-medal', type: 'treasure', name: '登山隊のメダル', icon: '🏅', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'moon-lantern', type: 'treasure', name: '月あかりランタン', icon: '🏮', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'rainbow-shell', type: 'treasure', name: 'にじ色の貝', icon: '🐚', asset: '/treasures/rainbow-shell.webp', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'old-compass', type: 'treasure', name: '潮風のコンパス', icon: '🧭', asset: '/treasures/compass.webp', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'pearl-ribbon', type: 'treasure', name: '真珠のリボン', icon: '🎀', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'crystal-flower', type: 'treasure', name: '水晶の花', icon: '🪷', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'ancient-key', type: 'treasure', name: '古代樹の鍵', icon: '🗝️', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'magic-book', type: 'treasure', name: '森の魔法書', icon: '📗', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'sky-crown', type: 'treasure', name: '空色のかんむり', icon: '👑', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'hero-shield', type: 'treasure', name: '勇者の盾飾り', icon: '🛡️', rarity: 'common', bonus: 120, chance: 10 },
  { id: 'summit-scope', type: 'treasure', name: '天空の望遠鏡', icon: '🔭', rarity: 'common', bonus: 120, chance: 10 },
]
const COMMON_TREASURES: RewardDefinition[] = COMMON_TREASURE_DEFINITIONS.map((reward): RewardDefinition => ({ ...reward, bonus: REWARD_BONUSES.commonTreasure }))

const COMMON_FRIEND_DEFINITIONS: RewardDefinition[] = [
  { id: 'fox-kon', type: 'friend', name: 'キツネのコン', icon: '🦊', asset: '/companions/fox.webp', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 88, encounterKpmRatio: .65 },
  { id: 'rabbit-mimi', type: 'friend', name: '白うさぎのミミ', icon: '🐇', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 85, encounterKpmRatio: .55 },
  { id: 'butterfly-hira', type: 'friend', name: 'チョウのヒラリ', icon: '🦋', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 88, encounterKpmRatio: .6 },
  { id: 'bird-pipi', type: 'friend', name: '小鳥のピピ', icon: '🐤', asset: '/companions/bird.webp', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 85, encounterKpmRatio: .55 },
  { id: 'squirrel-kuru', type: 'friend', name: 'リスのクル', icon: '🐿️', asset: '/companions/squirrel.webp', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 87, encounterKpmRatio: .62 },
  { id: 'beetle-kabu', type: 'friend', name: 'カブトムシのカブ', icon: '🪲', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 90, encounterKpmRatio: .7 },
  { id: 'deer-nana', type: 'friend', name: '子鹿のナナ', icon: '🦌', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 87, encounterKpmRatio: .62 },
  { id: 'eagle-taka', type: 'friend', name: '山ワシのタカ', icon: '🦅', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 91, encounterKpmRatio: .78 },
  { id: 'goat-gaku', type: 'friend', name: '山ヤギのガク', icon: '🐐', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 88, encounterKpmRatio: .65 },
  { id: 'otter-moko', type: 'friend', name: 'ラッコのモコ', icon: '🦦', asset: '/companions/otter.webp', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 85, encounterKpmRatio: .55 },
  { id: 'fish-niji', type: 'friend', name: '熱帯魚のニジ', icon: '🐠', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 84, encounterKpmRatio: .5 },
  { id: 'dolphin-ruru', type: 'friend', name: 'イルカのルル', icon: '🐬', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 90, encounterKpmRatio: .72 },
  { id: 'owl-hoshi', type: 'friend', name: 'フクロウのホシ', icon: '🦉', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 89, encounterKpmRatio: .68 },
  { id: 'cat-luna', type: 'friend', name: '森ねこのルナ', icon: '🐈', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 85, encounterKpmRatio: .52 },
  { id: 'wolf-roku', type: 'friend', name: '森オオカミのロク', icon: '🐺', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 91, encounterKpmRatio: .76 },
  { id: 'snow-rabbit-yuki', type: 'friend', name: '雪うさぎのユキ', icon: '🐇', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 87, encounterKpmRatio: .62 },
  { id: 'lion-leo', type: 'friend', name: '若ライオンのレオ', icon: '🦁', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 92, encounterKpmRatio: .8 },
  { id: 'hawk-sho', type: 'friend', name: '天空ワシのショウ', icon: '🦅', rarity: 'common', bonus: 150, chance: 10, encounterAccuracy: 92, encounterKpmRatio: .82 },
]
const COMMON_FRIENDS: RewardDefinition[] = COMMON_FRIEND_DEFINITIONS.map((reward): RewardDefinition => ({ ...reward, bonus: REWARD_BONUSES.commonFriend }))

export const COURSE_THEMES: Record<Course, CourseTheme> = {
  1: { name: 'ことばの小道', habitat: '花と草原', description: '陽だまりの草原で短いことばから練習', icon: '🌱', commonTreasureIds: ['flower-charm', 'trail-badge', 'sun-stone'], commonFriendIds: ['rabbit-mimi', 'fox-kon', 'butterfly-hira'], rareTreasure: '冒険はじまりの金バッジ', rareTreasureIcon: '🏵️', rareFriend: '花冠うさぎのフルル', rareFriendIcon: '🐇' },
  2: { name: 'ぶんしょうの森', habitat: '木漏れ日の森', description: '小鳥の声が聞こえる森で文をつなぐ', icon: '🌳', commonTreasureIds: ['acorn-whistle', 'forest-pen', 'wooden-emblem'], commonFriendIds: ['squirrel-kuru', 'bird-pipi', 'beetle-kabu'], rareTreasure: '森番のエメラルド笛', rareTreasureIcon: '🪈', rareFriend: '金角カブトのキング', rareFriendIcon: '🪲' },
  3: { name: 'ものがたりの山', habitat: '星見の山道', description: '山道を登りながら長い文へ挑戦', icon: '⛰️', commonTreasureIds: ['star-crystal', 'climber-medal', 'moon-lantern'], commonFriendIds: ['deer-nana', 'eagle-taka', 'goat-gaku'], rareTreasure: '山頂の星剣メダル', rareTreasureIcon: '⚔️', rareFriend: '星翼ワシのアルト', rareFriendIcon: '🦅' },
  4: { name: 'ことばの入り江', habitat: '珊瑚の入り江', description: '波音の入り江で学んだことばをおさらい', icon: '🪸', commonTreasureIds: ['rainbow-shell', 'old-compass', 'pearl-ribbon'], commonFriendIds: ['otter-moko', 'fish-niji', 'dolphin-ruru'], rareTreasure: '人魚の真珠コンパス', rareTreasureIcon: '🧜‍♀️', rareFriend: '虹ひれイルカのマリン', rareFriendIcon: '🐬' },
  5: { name: '漢字の深い森', habitat: '月影の古代樹林', description: '不思議な深い森で漢字を組み合わせる', icon: '🦉', commonTreasureIds: ['crystal-flower', 'ancient-key', 'magic-book'], commonFriendIds: ['owl-hoshi', 'cat-luna', 'wolf-roku'], rareTreasure: '古代樹の月光魔法鍵', rareTreasureIcon: '🗝️', rareFriend: '月冠フクロウのセージ', rareFriendIcon: '🦉' },
  6: { name: '伝説の頂', habitat: '雲上の遺跡', description: '雲の上の遺跡で総仕上げに挑む', icon: '🏆', commonTreasureIds: ['sky-crown', 'hero-shield', 'summit-scope'], commonFriendIds: ['snow-rabbit-yuki', 'lion-leo', 'hawk-sho'], rareTreasure: '天空王の伝説王冠', rareTreasureIcon: '👑', rareFriend: '守護獅子のグラン', rareFriendIcon: '🦁' },
}

const GRADE_MOTIFS: Record<Grade, string> = { 1: 'ひだまり', 2: 'そよかぜ', 3: 'ほしぞら', 4: 'にじいろ', 5: 'くもひかり', 6: 'せいざ' }

const RARE_TREASURES = ([1, 2, 3, 4, 5, 6] as Grade[]).flatMap((grade) =>
  (Object.values(COURSE_THEMES)).map((theme, index): RewardDefinition => ({
    id: `rare-t-${grade}-${index + 1}`,
    type: 'treasure', name: `${GRADE_MOTIFS[grade]}の${theme.rareTreasure}`, icon: theme.rareTreasureIcon, rarity: 'rare', bonus: REWARD_BONUSES.rareTreasure,
    chance: 3, grade, course: (index + 1) as Course,
  })),
)

const RARE_FRIENDS = ([1, 2, 3, 4, 5, 6] as Grade[]).flatMap((grade) =>
  (Object.values(COURSE_THEMES)).map((theme, index): RewardDefinition => ({
    id: `rare-f-${grade}-${index + 1}`,
    type: 'friend', name: `${GRADE_MOTIFS[grade]}の${theme.rareFriend}`, icon: theme.rareFriendIcon, rarity: 'rare', bonus: REWARD_BONUSES.rareFriend,
    chance: 3, encounterAccuracy: 94, encounterKpmRatio: .88, grade, course: (index + 1) as Course,
  })),
)

export const TREASURE_REWARDS = [...COMMON_TREASURES, ...RARE_TREASURES]
export const FRIEND_REWARDS = [...COMMON_FRIENDS, ...RARE_FRIENDS]
export const ALL_REWARDS = [...TREASURE_REWARDS, ...FRIEND_REWARDS]

export const getReward = (id: string) => ALL_REWARDS.find((reward) => reward.id === id)

export function rollCourseTreasure(grade: Grade, course: Course, random: () => number = Math.random): RewardDefinition | null {
  const roll = random() * 100
  const theme = COURSE_THEMES[course]
  const courseTreasures = theme.commonTreasureIds.map((id) => COMMON_TREASURES.find((reward) => reward.id === id)).filter((reward): reward is RewardDefinition => Boolean(reward))
  if (roll < 3) return RARE_TREASURES.find((reward) => reward.grade === grade && reward.course === course) ?? null
  if (roll < 33) return courseTreasures[Math.floor(random() * courseTreasures.length)]
  return null
}

export function rollCourseCreature(grade: Grade, course: Course, accuracy: number, kpm: number, targetKpm: number, random: () => number = Math.random): RewardDefinition | null {
  const theme = COURSE_THEMES[course]
  const rare = RARE_FRIENDS.find((reward) => reward.grade === grade && reward.course === course)
  const common = theme.commonFriendIds.map((id) => COMMON_FRIENDS.find((reward) => reward.id === id)).filter((reward): reward is RewardDefinition => Boolean(reward))
  const eligible = common.filter((reward) => accuracy >= (reward.encounterAccuracy ?? 85) && kpm >= targetKpm * (reward.encounterKpmRatio ?? .6))
  const roll = random() * 100
  if (rare && roll < 3 && accuracy >= (rare.encounterAccuracy ?? 94) && kpm >= targetKpm * (rare.encounterKpmRatio ?? .88)) return rare
  if (roll < 33 && eligible.length) return eligible[Math.floor(random() * eligible.length)]
  return null
}
