import { ADVENTURE_RANKS, type getAdventureRank } from '../ranks'
import { REWARD_BONUSES } from '../rewards'
import { UIRuby } from '../components/UIRuby'

type AdventureRank = ReturnType<typeof getAdventureRank>

export function RankGuidePage({ playerName, points, rank, onBack }: { playerName: string; points: number; rank: AdventureRank; onBack: () => void }) {
  const pointsToNext = rank.next ? Math.max(0, rank.next.min - points) : 0
  return <main className="rank-guide-page">
    <header className="catalog-topbar"><button className="catalog-back" onClick={onBack}>‹ もどる</button><div className="brand"><span className="brand-mark">🏅</span><div><strong><UIRuby>探検家グレード</UIRuby></strong><small>がんばりのしるし</small></div></div><div className="catalog-overall"><b>{points.toLocaleString()}</b> GP</div></header>
    <section className="rank-guide-hero"><div className="rank-mascot">{rank.icon}</div><div><span><UIRuby>{`${playerName}さんの いまのグレード`}</UIRuby></span><h1><UIRuby>{rank.name}</UIRuby></h1><p><UIRuby>{rank.next ? `つぎの「${rank.next.name}」まで あと ${pointsToNext.toLocaleString()} GP！` : 'さいこうグレードに とうちゃく！ これからも島を探検しよう！'}</UIRuby></p><div className="rank-big-progress"><i style={{ width: `${rank.progress}%` }} /></div></div></section>
    <section className="rank-kids-content"><div className="how-points-card"><span>✨</span><h2>GPって なあに？</h2><p><b>がんばりポイント</b>のことだよ。はやく打てたときも、ていねいに<UIRuby>正しく打てたときも増えていくよ。まちがえても減らないから、何度でも挑戦しよう！</UIRuby></p><div className="point-ways"><article><span>⌨️</span><b><UIRuby>文をクリア</UIRuby></b><small><UIRuby>正確さと速さで</UIRuby><br /><UIRuby>1問ごとにGP</UIRuby></small></article><article><span>💎</span><b><UIRuby>お宝を発見</UIRuby></b><small>ふつう +{REWARD_BONUSES.commonTreasure}<br />レア +{REWARD_BONUSES.rareTreasure} GP</small></article><article><span>🐾</span><b><UIRuby>いきものと出会う</UIRuby></b><small>ふつう +{REWARD_BONUSES.commonFriend}<br />レア +{REWARD_BONUSES.rareFriend} GP</small></article></div></div>
      <div className="all-ranks-card"><span><UIRuby>どこまで行けるかな？</UIRuby></span><h2><UIRuby>6つの 探検家グレード</UIRuby></h2><div>{ADVENTURE_RANKS.map((entry, index) => { const reached = points >= entry.min; const current = entry.name === rank.name; return <article className={`${reached ? 'reached' : ''} ${current ? 'current' : ''}`} key={entry.name}><span>{entry.icon}</span><div><b><UIRuby>{entry.name}</UIRuby></b><small><UIRuby>{index === 0 ? 'ここからスタート' : `${entry.min.toLocaleString()} GPでランクアップ`}</UIRuby></small></div>{reached && <em><UIRuby>{current ? 'いまここ！' : 'クリア ✓'}</UIRuby></em>}</article> })}</div></div></section>
    <section className="rank-cheer"><span>🌱</span><div><h2>じぶんのペースで だいじょうぶ</h2><p><UIRuby>速さだけではなく、正しく打つことも大切。きのうの自分より少し進めたら、それがいちばんの成長だよ！</UIRuby></p></div><button onClick={onBack}><UIRuby>島へもどる</UIRuby>　▶</button></section>
  </main>
}
