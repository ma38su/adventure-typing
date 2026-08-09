import { ADVENTURE_RANKS, type getAdventureRank } from '../ranks'
import { REWARD_BONUSES } from '../rewards'

type AdventureRank = ReturnType<typeof getAdventureRank>

export function RankGuidePage({ playerName, points, rank, onBack }: { playerName: string; points: number; rank: AdventureRank; onBack: () => void }) {
  const pointsToNext = rank.next ? Math.max(0, rank.next.min - points) : 0
  return <main className="rank-guide-page">
    <header className="catalog-topbar"><button className="catalog-back" onClick={onBack}>‹ もどる</button><div className="brand"><span className="brand-mark">🏅</span><div><strong>探検家グレード</strong><small>がんばりのしるし</small></div></div><div className="catalog-overall"><b>{points.toLocaleString()}</b> GP</div></header>
    <section className="rank-guide-hero"><div className="rank-mascot">{rank.icon}</div><div><span>{playerName}さんの いまのグレード</span><h1>{rank.name}</h1><p>{rank.next ? `つぎの「${rank.next.name}」まで あと ${pointsToNext.toLocaleString()} GP！` : 'さいこうグレードに とうちゃく！ これからも島を探検しよう！'}</p><div className="rank-big-progress"><i style={{ width: `${rank.progress}%` }} /></div></div></section>
    <section className="rank-kids-content"><div className="how-points-card"><span>✨</span><h2>GPって なあに？</h2><p><b>がんばりポイント</b>のことだよ。はやく打てたときも、ていねいに正しく打てたときも増えていくよ。まちがえても減らないから、何度でも挑戦しよう！</p><div className="point-ways"><article><span>⌨️</span><b>文をクリア</b><small>正確さと速さで<br />1問ごとにGP</small></article><article><span>💎</span><b>お宝を発見</b><small>ふつう +{REWARD_BONUSES.commonTreasure}<br />レア +{REWARD_BONUSES.rareTreasure} GP</small></article><article><span>🐾</span><b>いきものと出会う</b><small>ふつう +{REWARD_BONUSES.commonFriend}<br />レア +{REWARD_BONUSES.rareFriend} GP</small></article></div></div>
      <div className="all-ranks-card"><span>どこまで行けるかな？</span><h2>6つの 探検家グレード</h2><div>{ADVENTURE_RANKS.map((entry, index) => { const reached = points >= entry.min; const current = entry.name === rank.name; return <article className={`${reached ? 'reached' : ''} ${current ? 'current' : ''}`} key={entry.name}><span>{entry.icon}</span><div><b>{entry.name}</b><small>{index === 0 ? 'ここからスタート' : `${entry.min.toLocaleString()} GPでランクアップ`}</small></div>{reached && <em>{current ? 'いまここ！' : 'クリア ✓'}</em>}</article> })}</div></div></section>
    <section className="rank-cheer"><span>🌱</span><div><h2>じぶんのペースで だいじょうぶ</h2><p>速さだけではなく、正しく打つことも大切。きのうの自分より少し進めたら、それがいちばんの成長だよ！</p></div><button onClick={onBack}>島へもどる　▶</button></section>
  </main>
}
