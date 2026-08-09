import type { CharacterStyle, UserProfile } from '../domain'
import { isCourseUnlocked, LEARNING_STAGES } from '../game/courseConfig'
import { getCourseStory } from '../game/storyConfig'
import type { Grade } from '../questions'
import type { Course } from '../rewards'
import type { getAdventureRank } from '../ranks'
import type { ReturnTypeOfGoalProgress } from '../types'
import { AudioControls } from '../components/AudioControls'
import { FullscreenControl } from '../components/FullscreenControl'
import { KeyboardLayoutCalibration } from '../components/KeyboardLayoutCalibration'
import { UIRuby } from '../components/UIRuby'

export function TitlePage({ profile, grade, character, points, rank, bgmOn, soundEffectsOn, completedCourses, goalProgress, tutorialComplete, onBgmChange, onSoundEffectsChange, onProfiles, onRomaji, onCourse, onCatalog, onCollection, onRankGuide, onReport }: { profile: UserProfile; grade: Grade; character: CharacterStyle; points: number; rank: ReturnType<typeof getAdventureRank>; bgmOn: boolean; soundEffectsOn: boolean; completedCourses: string[]; goalProgress: ReturnTypeOfGoalProgress; tutorialComplete: boolean; onBgmChange: (on: boolean) => void; onSoundEffectsChange: (on: boolean) => void; onProfiles: () => void; onRomaji: () => void; onCourse: (course: Course) => void; onCatalog: () => void; onCollection: () => void; onRankGuide: () => void; onReport: () => void }) {
  return <main className={`stage-select-screen title-grade-${grade}`}>
    <header className="stage-select-header">
      <button className="stage-user-chip" onClick={onProfiles}><span>{character === 'girl' ? '👧' : '👦'}</span><div><b>{profile.name}</b><small><UIRuby>{`${grade}年生`}</UIRuby>・{rank.icon} {rank.name}</small></div><em><UIRuby>設定</UIRuby> ›</em></button>
      <div className="stage-brand"><span>⌨</span><div><small>ことば<UIRuby>島</UIRuby>のだいぼうけん</small><b><UIRuby>ステージを 選ぼう</UIRuby></b></div></div>
      <div className="stage-header-controls"><FullscreenControl /><AudioControls className="stage-audio-controls" bgmOn={bgmOn} soundEffectsOn={soundEffectsOn} onBgmChange={onBgmChange} onSoundEffectsChange={onSoundEffectsChange} /></div>
    </header>
    <section className="stage-select-main">
      <KeyboardLayoutCalibration profileId={profile.id} />
      <div className="stage-select-heading"><span>ADVENTURE MAP</span><h1><UIRuby>{`${grade}年生の ステージ`}</UIRuby></h1><p><UIRuby>挑戦するステージを選ぶと、すぐに冒険が始まるよ</UIRuby></p></div>
      <div className="unified-stage-grid">
        <button className={`unified-stage-card romaji ${tutorialComplete ? 'cleared' : 'next'}`} onClick={onRomaji}>
          <span className="stage-card-visual" style={{ backgroundImage: 'url(/backgrounds/stage-beach.webp)' }} aria-hidden="true"><i><UIRuby>本編の前に</UIRuby></i><strong>あ</strong></span>
          <span className="stage-card-copy"><small><UIRuby>旅支度・タイピング基礎</UIRuby></small><b><UIRuby>ローマ字と指使い</UIRuby></b><p><UIRuby>灯台をともして、ことば島へ渡る準備をしよう</UIRuby></p></span>
          <em className="stage-card-state"><span>{tutorialComplete ? '✓' : '★'}</span><UIRuby>{tutorialComplete ? 'いつでも練習' : '最初に挑戦'}</UIRuby><b><UIRuby>基礎ルートへ</UIRuby>　›</b></em>
        </button>
        {LEARNING_STAGES.map((stage, index) => {
          const stageNumber = (index + 1) as Course
          const cleared = completedCourses.includes(`${grade}-${stageNumber}`)
          const unlocked = tutorialComplete && isCourseUnlocked(grade, stageNumber, completedCourses)
          const story = getCourseStory(grade, stageNumber)
          const stateLabel = !unlocked ? (tutorialComplete ? `ステージ${stageNumber - 1}クリアで解放` : stageNumber === 1 ? '基礎クリアで解放' : '基礎クリア後、順に解放') : cleared ? 'クリア済み' : '挑戦できる'
          return <button key={stage.name} disabled={!unlocked} className={`unified-stage-card ${cleared ? 'cleared' : ''} ${!unlocked ? 'locked' : ''}`} onClick={() => onCourse(stageNumber)}>
            <span className="stage-card-visual" style={{ backgroundImage: `url(${stage.journeyBackground})` }} aria-hidden="true"><i>{stage.habitat}</i><strong>{!unlocked ? '🔒' : cleared ? '✓' : stageNumber}</strong></span>
            <span className="stage-card-copy"><small><UIRuby>{`ステージ ${stageNumber}`}</UIRuby>・{stage.icon} {stage.habitat}</small><b>{story.title}</b><p>{story.objective}</p></span>
            <em className="stage-card-state"><span>{!unlocked ? '🔒' : cleared ? '✓' : '○'}</span><UIRuby>{stateLabel}</UIRuby><b><UIRuby>{unlocked ? 'このステージを始める' : 'まだ進めません'}</UIRuby>{unlocked && '　▶'}</b></em>
          </button>
        })}
      </div>
      <div className="stage-progress-compact"><span>🔥 {goalProgress.streak}<UIRuby>日</UIRuby>れんぞく</span><b><UIRuby>今日</UIRuby> {goalProgress.todayProblems}/{goalProgress.dailyGoal}<UIRuby>問</UIRuby></b><i><em style={{ width: `${Math.min(100, goalProgress.todayProblems / goalProgress.dailyGoal * 100)}%` }} /></i><strong>{points.toLocaleString()} GP</strong></div>
      <nav className="stage-secondary-nav" aria-label="そのほかのメニュー"><button onClick={onCatalog}>📚 <UIRuby>学習記録</UIRuby></button><button onClick={onCollection}>🗺️ <UIRuby>図鑑</UIRuby></button><button onClick={onRankGuide}>🏅 グレード</button><button onClick={onReport}>📈 <UIRuby>保護者向け</UIRuby></button></nav>
    </section>
  </main>
}
