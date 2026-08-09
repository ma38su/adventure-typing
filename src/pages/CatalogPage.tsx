import type { ProblemStats, ScoreData } from '../domain'
import { LEARNING_STAGES } from '../game/courseConfig'
import { isLinearStageUnlocked, LINEAR_STAGES, linearStageId, type LinearStageNumber } from '../game/linearStageConfig'
import { UIRuby } from '../components/UIRuby'

export function CatalogPage({ problemStats, completedStageIds, scoreData, onBack, onStart }: { problemStats: ProblemStats; completedStageIds: string[]; scoreData: ScoreData; onBack: () => void; onStart: (stage: LinearStageNumber) => void }) {
  const attemptedTotal = Object.values(problemStats).filter((item) => item.attempts > 0).length
  const completedTotal = Object.values(problemStats).filter((item) => item.completions > 0).length
  return <main className="catalog-page">
    <header className="catalog-topbar"><button className="catalog-back" onClick={onBack}>‹ <UIRuby>戻る</UIRuby></button><div className="brand"><span className="brand-mark">📚</span><div><strong><UIRuby>冒険の記録</UIRuby></strong><small><UIRuby>36ステージの旅</UIRuby></small></div></div><div className="catalog-overall"><b>{completedStageIds.length}</b> / 36 <UIRuby>ステージ</UIRuby></div></header>
    <section className="catalog-hero"><div><span><UIRuby>ことば島 学習記録</UIRuby></span><h1><UIRuby>ひとつにつながる物語</UIRuby></h1><p><UIRuby>クリアした場所と、次に進めるステージを振り返れます</UIRuby></p></div><div className="catalog-progress-ring" style={{ '--score': `${completedStageIds.length / 36 * 360}deg` } as React.CSSProperties}><b>{completedStageIds.length}<small>/36</small></b><span>クリア</span></div></section>
    <div className="catalog-summary"><div><span><UIRuby>挑戦済み</UIRuby></span><b>{attemptedTotal}<small><UIRuby>問</UIRuby></small></b></div><div><span><UIRuby>問題クリア</UIRuby></span><b>{completedTotal}<small><UIRuby>問</UIRuby></small></b></div><div><span><UIRuby>ステージ達成</UIRuby></span><b>{completedStageIds.length}<small>/36</small></b></div><div><span><UIRuby>総合スコア</UIRuby></span><b>{scoreData.lifetime.toLocaleString()}<small> GP</small></b></div></div>
    <div className="catalog-courses">{LINEAR_STAGES.map((stage) => {
      const id = linearStageId(stage.number)
      const cleared = completedStageIds.includes(id)
      const unlocked = isLinearStageUnlocked(stage.number, completedStageIds)
      const theme = LEARNING_STAGES[stage.chapterStage - 1]
      return <section className={`catalog-course panel ${!unlocked ? 'locked' : ''}`} key={id}><header><div className="catalog-course-icon">{cleared ? '✓' : unlocked ? theme.icon : '🔒'}</div><div><span><UIRuby>{`第${stage.chapter}章・ステージ ${stage.number}・${stage.difficultyBand}`}</UIRuby></span><h2>{stage.title}</h2><p className="course-description">{stage.objective}</p></div><div className="course-list-progress"><b>{scoreData.courseBest[id]?.toLocaleString() ?? '―'} GP</b></div></header><div className="course-stat-strip"><span>{theme.habitat}</span><span><UIRuby>{cleared ? '🏆 ステージ達成' : unlocked ? '冒険中' : `🔒 ステージ${stage.number - 1}クリアで解放`}</UIRuby></span><button disabled={!unlocked} onClick={() => onStart(stage.number)}><UIRuby>{cleared ? 'もう一度' : unlocked ? 'このステージへ' : '未解放'}</UIRuby>{unlocked && ' ▶'}</button></div></section>
    })}</div><p className="catalog-storage-note"><UIRuby>この学習記録は、この端末のローカルストレージに保存されています</UIRuby></p>
  </main>
}
