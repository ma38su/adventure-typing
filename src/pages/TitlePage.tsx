import type { CharacterStyle, UserProfile } from '../domain'
import { isCourseUnlocked, LEARNING_STAGES } from '../game/courseConfig'
import { getCourseStory } from '../game/storyConfig'
import type { Grade } from '../questions'
import type { Course } from '../rewards'
import type { getAdventureRank } from '../ranks'
import type { ReturnTypeOfGoalProgress } from '../types'
import { AudioControls } from '../components/AudioControls'
import { KeyboardLayoutCalibration } from '../components/KeyboardLayoutCalibration'

export function TitlePage({ profile, grade, character, points, rank, bgmOn, soundEffectsOn, completedCourses, goalProgress, tutorialComplete, onBgmChange, onSoundEffectsChange, onProfiles, onRomaji, onCourse, onCatalog, onCollection, onRankGuide, onReport }: { profile: UserProfile; grade: Grade; character: CharacterStyle; points: number; rank: ReturnType<typeof getAdventureRank>; bgmOn: boolean; soundEffectsOn: boolean; completedCourses: string[]; goalProgress: ReturnTypeOfGoalProgress; tutorialComplete: boolean; onBgmChange: (on: boolean) => void; onSoundEffectsChange: (on: boolean) => void; onProfiles: () => void; onRomaji: () => void; onCourse: (course: Course) => void; onCatalog: () => void; onCollection: () => void; onRankGuide: () => void; onReport: () => void }) {
  return <main className={`stage-select-screen title-grade-${grade}`}>
    <header className="stage-select-header">
      <button className="stage-user-chip" onClick={onProfiles}><span>{character === 'girl' ? '👧' : '👦'}</span><div><b>{profile.name}</b><small>{grade}年生・{rank.icon} {rank.name}</small></div><em>設定 ›</em></button>
      <div className="stage-brand"><span>⌨</span><div><small>ことば島の大ぼうけん</small><b>ステージを えらぼう</b></div></div>
      <AudioControls className="stage-audio-controls" bgmOn={bgmOn} soundEffectsOn={soundEffectsOn} onBgmChange={onBgmChange} onSoundEffectsChange={onSoundEffectsChange} />
    </header>
    <section className="stage-select-main">
      <KeyboardLayoutCalibration profileId={profile.id} />
      <div className="stage-select-heading"><span>ADVENTURE MAP</span><h1>{grade}年生の ステージ</h1><p>挑戦するステージを選ぶと、すぐに冒険が始まるよ</p></div>
      <div className="unified-stage-grid">
        <button className={`unified-stage-card romaji ${tutorialComplete ? 'cleared' : 'next'}`} onClick={onRomaji}>
          <span className="stage-card-visual" style={{ backgroundImage: 'url(/backgrounds/stage-beach.webp)' }} aria-hidden="true"><i>本編の前に</i><strong>あ</strong></span>
          <span className="stage-card-copy"><small>旅支度・タイピング基礎</small><b>ローマ字と指使い</b><p>灯台をともして、ことば島へ渡る準備をしよう</p></span>
          <em className="stage-card-state"><span>{tutorialComplete ? '✓' : '★'}</span>{tutorialComplete ? 'いつでも練習' : '最初に挑戦'}<b>基礎ルートへ　›</b></em>
        </button>
        {LEARNING_STAGES.map((stage, index) => {
          const stageNumber = (index + 1) as Course
          const cleared = completedCourses.includes(`${grade}-${stageNumber}`)
          const unlocked = tutorialComplete && isCourseUnlocked(grade, stageNumber, completedCourses)
          const story = getCourseStory(grade, stageNumber)
          const stateLabel = !unlocked ? (tutorialComplete ? `ステージ${stageNumber - 1}クリアで解放` : stageNumber === 1 ? '基礎クリアで解放' : '基礎クリア後、順に解放') : cleared ? 'クリア済み' : '挑戦できる'
          return <button key={stage.name} disabled={!unlocked} className={`unified-stage-card ${cleared ? 'cleared' : ''} ${!unlocked ? 'locked' : ''}`} onClick={() => onCourse(stageNumber)}>
            <span className="stage-card-visual" style={{ backgroundImage: `url(${stage.journeyBackground})` }} aria-hidden="true"><i>{stage.habitat}</i><strong>{!unlocked ? '🔒' : cleared ? '✓' : stageNumber}</strong></span>
            <span className="stage-card-copy"><small>ステージ {stageNumber}・{stage.icon} {stage.habitat}</small><b>{story.title}</b><p>{story.objective}</p></span>
            <em className="stage-card-state"><span>{!unlocked ? '🔒' : cleared ? '✓' : '○'}</span>{stateLabel}<b>{unlocked ? 'このステージを始める　▶' : 'まだ進めません'}</b></em>
          </button>
        })}
      </div>
      <div className="stage-progress-compact"><span>🔥 {goalProgress.streak}日れんぞく</span><b>今日 {goalProgress.todayProblems}/{goalProgress.dailyGoal}問</b><i><em style={{ width: `${Math.min(100, goalProgress.todayProblems / goalProgress.dailyGoal * 100)}%` }} /></i><strong>{points.toLocaleString()} GP</strong></div>
      <nav className="stage-secondary-nav" aria-label="そのほかのメニュー"><button onClick={onCatalog}>📚 学習記録</button><button onClick={onCollection}>🗺️ 図鑑</button><button onClick={onRankGuide}>🏅 グレード</button><button onClick={onReport}>📈 保護者向け</button></nav>
    </section>
  </main>
}
