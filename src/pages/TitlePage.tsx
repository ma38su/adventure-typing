import type { CharacterStyle, UserProfile } from '../domain'
import { LEARNING_STAGES } from '../game/courseConfig'
import { isLinearStageUnlocked, LINEAR_STAGES, linearStageId, type LinearStageNumber } from '../game/linearStageConfig'
import type { Grade } from '../questions'
import type { getAdventureRank } from '../ranks'
import type { ReturnTypeOfGoalProgress } from '../types'
import { AudioControls } from '../components/AudioControls'
import { FullscreenControl } from '../components/FullscreenControl'
import { KeyboardLayoutCalibration } from '../components/KeyboardLayoutCalibration'
import { UIRuby } from '../components/UIRuby'

export function TitlePage({ profile, grade, character, points, rank, bgmOn, soundEffectsOn, completedStageIds, goalProgress, tutorialComplete, onBgmChange, onSoundEffectsChange, onProfiles, onRomaji, onStage, onCatalog, onCollection, onRankGuide, onReport }: { profile: UserProfile; grade: Grade; character: CharacterStyle; points: number; rank: ReturnType<typeof getAdventureRank>; bgmOn: boolean; soundEffectsOn: boolean; completedStageIds: string[]; goalProgress: ReturnTypeOfGoalProgress; tutorialComplete: boolean; onBgmChange: (on: boolean) => void; onSoundEffectsChange: (on: boolean) => void; onProfiles: () => void; onRomaji: () => void; onStage: (stage: LinearStageNumber) => void; onCatalog: () => void; onCollection: () => void; onRankGuide: () => void; onReport: () => void }) {
  return <main className={`stage-select-screen title-grade-${grade}`}>
    <header className="stage-select-header">
      <button className="stage-user-chip" onClick={onProfiles}><span>{character === 'girl' ? '👧' : '👦'}</span><div><b>{profile.name}</b><small><UIRuby>{`${grade}年生`}</UIRuby>・{rank.icon} {rank.name}</small></div><em><UIRuby>設定</UIRuby> ›</em></button>
      <div className="stage-brand"><span>⌨</span><div><small>ことば<UIRuby>島</UIRuby>のだいぼうけん</small><b><UIRuby>ステージを 選ぼう</UIRuby></b></div></div>
      <div className="stage-header-controls"><FullscreenControl /><AudioControls className="stage-audio-controls" bgmOn={bgmOn} soundEffectsOn={soundEffectsOn} onBgmChange={onBgmChange} onSoundEffectsChange={onSoundEffectsChange} /></div>
    </header>
    <section className="stage-select-main">
      <KeyboardLayoutCalibration profileId={profile.id} />
      <div className="stage-select-heading"><span>ADVENTURE MAP</span><h1><UIRuby>ことば島 36の物語</UIRuby></h1><p><UIRuby>ひとつにつながった冒険を、順番に進もう</UIRuby></p></div>
      <div className="unified-stage-grid">
        <button className={`unified-stage-card romaji ${tutorialComplete ? 'cleared' : 'next'}`} onClick={onRomaji}>
          <span className="stage-card-visual" style={{ backgroundImage: 'url(/backgrounds/stage-beach.webp)' }} aria-hidden="true"><i><UIRuby>本編の前に</UIRuby></i><strong>あ</strong></span>
          <span className="stage-card-copy"><small><UIRuby>旅支度・タイピング基礎</UIRuby></small><b><UIRuby>ローマ字と指使い</UIRuby></b><p><UIRuby>灯台をともして、ことば島へ渡る準備をしよう</UIRuby></p></span>
          <em className="stage-card-state"><span>{tutorialComplete ? '✓' : '★'}</span><UIRuby>{tutorialComplete ? 'いつでも練習' : '最初に挑戦'}</UIRuby><b><UIRuby>基礎ルートへ</UIRuby>　›</b></em>
        </button>
        {LINEAR_STAGES.map((story) => {
          const stageNumber = story.number
          const theme = LEARNING_STAGES[story.chapterStage - 1]
          const cleared = completedStageIds.includes(linearStageId(stageNumber))
          const unlocked = tutorialComplete && isLinearStageUnlocked(stageNumber, completedStageIds)
          const stateLabel = !unlocked ? (tutorialComplete ? `ステージ${stageNumber - 1}クリアで解放` : stageNumber === 1 ? '基礎クリアで解放' : '基礎クリア後、順に解放') : cleared ? 'クリア済み' : '挑戦できる'
          return <button key={stageNumber} disabled={!unlocked} className={`unified-stage-card ${cleared ? 'cleared' : ''} ${!unlocked ? 'locked' : ''}`} onClick={() => onStage(stageNumber)}>
            <span className="stage-card-visual" style={{ backgroundImage: `url(${theme.journeyBackground})` }} aria-hidden="true"><i>第{story.chapter}章・{theme.habitat}</i><strong>{!unlocked ? '🔒' : cleared ? '✓' : stageNumber}</strong></span>
            <span className="stage-card-copy"><small><UIRuby>{`ステージ ${stageNumber}`}</UIRuby>・{theme.icon} {story.difficultyBand}</small><b>{story.title}</b><p>{story.objective}</p></span>
            <em className="stage-card-state"><span>{!unlocked ? '🔒' : cleared ? '✓' : '○'}</span><UIRuby>{stateLabel}</UIRuby><b><UIRuby>{unlocked ? 'このステージを始める' : 'まだ進めません'}</UIRuby>{unlocked && '　▶'}</b></em>
          </button>
        })}
      </div>
      <div className="stage-progress-compact"><span>🔥 {goalProgress.streak}<UIRuby>日</UIRuby>れんぞく</span><b><UIRuby>今日</UIRuby> {goalProgress.todayProblems}/{goalProgress.dailyGoal}<UIRuby>問</UIRuby></b><i><em style={{ width: `${Math.min(100, goalProgress.todayProblems / goalProgress.dailyGoal * 100)}%` }} /></i><strong>{points.toLocaleString()} GP</strong></div>
      <nav className="stage-secondary-nav" aria-label="そのほかのメニュー"><button onClick={onCatalog}>📚 <UIRuby>学習記録</UIRuby></button><button onClick={onCollection}>🗺️ <UIRuby>図鑑</UIRuby></button><button onClick={onRankGuide}>🏅 グレード</button><button onClick={onReport}>📈 <UIRuby>保護者向け</UIRuby></button></nav>
    </section>
  </main>
}
