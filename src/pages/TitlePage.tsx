import type { CharacterStyle, UserProfile } from '../domain'
import { isCourseUnlocked, LEARNING_STAGES } from '../game/courseConfig'
import { getCourseStory } from '../game/storyConfig'
import type { Grade } from '../questions'
import type { Course } from '../rewards'
import type { getAdventureRank } from '../ranks'
import type { ReturnTypeOfGoalProgress } from '../types'

export function TitlePage({ profile, grade, course, character, points, rank, soundOn, completedCourses, goalProgress, tutorialComplete, onSound, onProfiles, onRomaji, onCourse, onStart, onCatalog, onCollection, onRankGuide, onReport }: { profile: UserProfile; grade: Grade; course: Course; character: CharacterStyle; points: number; rank: ReturnType<typeof getAdventureRank>; soundOn: boolean; completedCourses: string[]; goalProgress: ReturnTypeOfGoalProgress; tutorialComplete: boolean; onSound: () => void; onProfiles: () => void; onRomaji: () => void; onCourse: (course: Course) => void; onStart: () => void; onCatalog: () => void; onCollection: () => void; onRankGuide: () => void; onReport: () => void }) {
  const selectedStory = getCourseStory(grade, course)
  return <main className={`stage-select-screen title-grade-${grade}`}>
    <header className="stage-select-header">
      <button className="stage-user-chip" onClick={onProfiles}><span>{character === 'girl' ? '👧' : '👦'}</span><div><b>{profile.name}</b><small>{grade}年生・{rank.icon} {rank.name}</small></div><em>設定 ›</em></button>
      <div className="stage-brand"><span>⌨</span><div><small>ことば島の大ぼうけん</small><b>ステージを えらぼう</b></div></div>
      <button className="title-sound stage-sound" onClick={onSound} aria-label={soundOn ? '音を消す' : '音を出す'}>{soundOn ? '♪' : '×'}</button>
    </header>
    <section className="stage-select-main">
      <div className="stage-select-heading"><span>ADVENTURE MAP</span><h1>{grade}年生の ステージ</h1><p>挑戦するステージをひとつ選んでね</p></div>
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
          const selected = course === stageNumber && unlocked
          const story = getCourseStory(grade, stageNumber)
          const stateLabel = !unlocked ? (tutorialComplete ? `ステージ${stageNumber - 1}クリアで解放` : stageNumber === 1 ? '基礎クリアで解放' : '基礎クリア後、順に解放') : cleared ? 'クリア済み' : selected ? '選択中' : '挑戦できる'
          return <button key={stage.name} disabled={!unlocked} aria-current={selected ? 'step' : undefined} className={`unified-stage-card ${selected ? 'selected' : ''} ${cleared ? 'cleared' : ''} ${!unlocked ? 'locked' : ''}`} onClick={() => onCourse(stageNumber)}>
            <span className="stage-card-visual" style={{ backgroundImage: `url(${stage.journeyBackground})` }} aria-hidden="true"><i>{stage.habitat}</i><strong>{!unlocked ? '🔒' : cleared ? '✓' : stageNumber}</strong></span>
            <span className="stage-card-copy"><small>ステージ {stageNumber}・{stage.icon} {stage.habitat}</small><b>{story.title}</b><p>{story.objective}</p></span>
            <em className="stage-card-state"><span>{!unlocked ? '🔒' : cleared ? '✓' : selected ? '◉' : '○'}</span>{stateLabel}<b>{unlocked ? (selected ? 'この土地を選択中' : 'この土地を見る　›') : 'まだ進めません'}</b></em>
          </button>
        })}
      </div>
      {tutorialComplete && <section className="selected-stage-summary"><span className="selected-stage-picture" style={{ backgroundImage: `url(${LEARNING_STAGES[course - 1].journeyBackground})` }} aria-hidden="true" /><div><small>現在の目的地・{LEARNING_STAGES[course - 1].habitat}</small><h2>ステージ {course}　{selectedStory.title}</h2><p>{selectedStory.intro}</p></div><button onClick={onStart}>このステージを はじめる　▶</button></section>}
      <div className="stage-progress-compact"><span>🔥 {goalProgress.streak}日れんぞく</span><b>今日 {goalProgress.todayProblems}/{goalProgress.dailyGoal}問</b><i><em style={{ width: `${Math.min(100, goalProgress.todayProblems / goalProgress.dailyGoal * 100)}%` }} /></i><strong>{points.toLocaleString()} GP</strong></div>
      <nav className="stage-secondary-nav" aria-label="そのほかのメニュー"><button onClick={onCatalog}>📚 学習記録</button><button onClick={onCollection}>🗺️ 図鑑</button><button onClick={onRankGuide}>🏅 グレード</button><button onClick={onReport}>📈 保護者向け</button></nav>
    </section>
  </main>
}
