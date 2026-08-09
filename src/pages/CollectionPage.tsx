import type { Dispatch, SetStateAction } from 'react'
import type { CollectionRecord } from '../rewards'
import { ALL_REWARDS, COURSE_THEMES, FRIEND_REWARDS, TREASURE_REWARDS } from '../rewards'
import { RewardVisual } from '../components/game/GameVisuals'
import { UIRuby } from '../components/UIRuby'

export function CollectionPage({ collection, points, tab, setTab, onBack }: { collection: CollectionRecord[]; points: number; tab: 'treasure' | 'friend'; setTab: Dispatch<SetStateAction<'treasure' | 'friend'>>; onBack: () => void }) {
  const rewards = tab === 'treasure' ? TREASURE_REWARDS : FRIEND_REWARDS
  const foundIds = new Set(collection.map((item) => item.id))
  const foundTotal = ALL_REWARDS.filter((reward) => foundIds.has(reward.id)).length
  const collectedTreasures = collection.filter((item) => item.type === 'treasure')
  const collectedFriends = collection.filter((item) => item.type === 'friend')
  return <main className="collection-page">
    <header className="catalog-topbar"><button className="catalog-back" onClick={onBack}>‹ <UIRuby>戻る</UIRuby></button><div className="brand"><span className="brand-mark">🗺️</span><div><strong><UIRuby>島の図鑑</UIRuby></strong><small><UIRuby>発見のきろく</UIRuby></small></div></div><div className="catalog-overall"><b>{foundTotal}</b><UIRuby>種類発見</UIRuby> <span>/</span> {ALL_REWARDS.length}<UIRuby>種類</UIRuby></div></header>
    <section className="collection-hero"><div><span>COLLECTION BOOK</span><h1><UIRuby>お宝と いきものの図鑑</UIRuby></h1><p><UIRuby>同じものを見つけても数が増えるよ。ステージ限定のレアな出会いも探してみよう！</UIRuby></p></div><div className="collection-lifetime"><small><UIRuby>生涯のがんばり</UIRuby></small><b>{points.toLocaleString()}</b><span>GP</span></div></section>
    <nav className="collection-tabs"><button className={tab === 'treasure' ? 'active' : ''} onClick={() => setTab('treasure')}>💎 <UIRuby>お宝</UIRuby> <b>{collectedTreasures.length}/{TREASURE_REWARDS.length}</b></button><button className={tab === 'friend' ? 'active' : ''} onClick={() => setTab('friend')}>🐾 いきもの <b>{collectedFriends.length}/{FRIEND_REWARDS.length}</b></button></nav>
    <div className="collection-grid">{rewards.map((reward) => {
      const record = collection.find((item) => item.id === reward.id)
      const habitats = Object.values(COURSE_THEMES).filter((theme) => (reward.type === 'treasure' ? theme.commonTreasureIds : theme.commonFriendIds).includes(reward.id)).map((theme) => theme.habitat)
      const locationHint = reward.grade && reward.course ? `${reward.grade}年生・ステージ${reward.course}「${COURSE_THEMES[reward.course].habitat}」` : habitats.map((habitat) => `ステージ${Object.values(COURSE_THEMES).findIndex((theme) => theme.habitat === habitat) + 1}「${habitat}」`).join('・')
      return <article className={`collection-entry ${record ? 'found' : 'locked'} ${reward.rarity}`} key={reward.id}><div className="collection-entry-visual">{record ? <RewardVisual reward={reward} /> : <span>?</span>}{record && <b>×{record.count}</b>}</div><div><span className={`rarity-label ${reward.rarity}`}><UIRuby>{reward.rarity === 'rare' ? '★ レア' : reward.type === 'friend' ? 'よく出会う' : 'よく見つかる'}</UIRuby></span><h2><UIRuby>{record ? reward.name : '？？？'}</UIRuby></h2><p><b><UIRuby>{record ? '出会える場所' : '💡 出会いヒント'}</UIRuby>：</b><UIRuby>{locationHint}</UIRuby><UIRuby>{reward.rarity === 'rare' ? '限定' : `・確率 ${reward.chance}%`}</UIRuby>{reward.type === 'friend' && <UIRuby>{`・正確さ ${reward.encounterAccuracy}%以上・基準速度の ${Math.round((reward.encounterKpmRatio ?? .6) * 100)}%以上`}</UIRuby>}</p>{record && <small><UIRuby>{`発見ボーナス +${reward.bonus} GP`}</UIRuby></small>}</div></article>
    })}</div>
    <p className="catalog-storage-note"><UIRuby>図鑑と所持数、がんばりポイントはこの端末に保存されています</UIRuby></p>
  </main>
}
