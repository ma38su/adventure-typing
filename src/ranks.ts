export const ADVENTURE_RANKS = [
  { min: 0, name: 'たまご探検家', icon: '🥚' },
  { min: 5_000, name: 'ひよこ探検家', icon: '🐣' },
  { min: 20_000, name: 'ブロンズ探検家', icon: '🥉' },
  { min: 50_000, name: 'シルバー探検家', icon: '🥈' },
  { min: 120_000, name: 'ゴールド探検家', icon: '🥇' },
  { min: 300_000, name: '伝説の探検家', icon: '👑' },
] as const

export function getAdventureRank(points: number) {
  const index = ADVENTURE_RANKS.findLastIndex((rank) => points >= rank.min)
  const rank = ADVENTURE_RANKS[Math.max(0, index)]
  const next = ADVENTURE_RANKS[index + 1]
  const progress = next ? Math.max(0, Math.min(100, ((points - rank.min) / (next.min - rank.min)) * 100)) : 100
  return { ...rank, next, progress }
}
