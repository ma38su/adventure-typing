import type { DailyActivity, KeyStats, LearningGoals, ProblemStats } from '../domain'
import { getGoalProgress, localDateKey } from '../learningProgress'

export function ParentReportPage({ activity, goals, keyStats, problemStats, onGoals, onBack }: { activity: Record<string, DailyActivity>; goals: LearningGoals; keyStats: KeyStats; problemStats: ProblemStats; onGoals: (goals: LearningGoals) => void; onBack: () => void }) {
  const progress = getGoalProgress(activity, goals)
  const recent = Array.from({ length: 7 }, (_, offset) => { const date = new Date(); date.setDate(date.getDate() - (6 - offset)); return activity[localDateKey(date)] ?? { date: localDateKey(date), completedProblems: 0, correctKeys: 0, mistakes: 0, practiceMs: 0, earnedPoints: 0 } })
  const totals = recent.reduce((sum, day) => ({ problems: sum.problems + day.completedProblems, keys: sum.keys + day.correctKeys, mistakes: sum.mistakes + day.mistakes, time: sum.time + day.practiceMs }), { problems: 0, keys: 0, mistakes: 0, time: 0 })
  const accuracy = totals.keys + totals.mistakes ? Math.round(totals.keys / (totals.keys + totals.mistakes) * 100) : 100
  const weakKeys = Object.entries(keyStats).filter(([, stat]) => stat.misses > 0).map(([id, stat]) => ({ key: id.split(':')[1], rate: Math.round(stat.misses / stat.attempts * 100) })).sort((a, b) => b.rate - a.rate).slice(0, 5)
  const mastered = Object.values(problemStats).filter((stat) => stat.completions > 0).length
  return <main className="report-page">
    <header className="catalog-topbar"><button className="catalog-back" onClick={onBack}>‹ 戻る</button><div className="brand"><span className="brand-mark">📈</span><div><strong>成長レポート</strong><small>保護者のかたへ</small></div></div><button className="report-print" onClick={() => window.print()}>印刷</button></header>
    <section className="report-content"><div className="report-hero"><div><small>今週の学習</small><h1>{totals.problems}問に挑戦しました</h1><p>{progress.streak > 0 ? `${progress.streak}日連続で取り組んでいます。` : '今日から新しい記録を始められます。'}</p></div><span>🌱</span></div>
      <div className="report-metrics"><article><small>練習時間</small><b>{Math.round(totals.time / 60000)}分</b></article><article><small>正確さ</small><b>{accuracy}%</b></article><article><small>習得問題</small><b>{mastered}問</b></article><article><small>連続プレイ</small><b>{progress.streak}日</b></article></div>
      <section className="report-card"><h2>直近7日間</h2><div className="activity-bars">{recent.map((day) => <div key={day.date}><i style={{ height: `${Math.max(3, Math.min(100, day.completedProblems / Math.max(1, goals.dailyProblems) * 100))}%` }} /><b>{day.completedProblems}</b><small>{Number(day.date.slice(-2))}日</small></div>)}</div></section>
      <section className="report-grid"><article className="report-card"><h2>現在の練習ポイント</h2>{weakKeys.length ? <div className="report-keys">{weakKeys.map((item) => <span key={item.key}><kbd>{item.key}</kbd> ミス率 {item.rate}%</span>)}</div> : <p>苦手キーはまだありません。正確に入力できています。</p>}</article><article className="report-card"><h2>目標設定</h2><label>1日の目標 <input type="number" min="1" max="50" value={goals.dailyProblems} onChange={(event) => onGoals({ ...goals, dailyProblems: Math.max(1, Math.min(50, Number(event.target.value) || 1)) })} /> 問</label><label>1週間の目標 <input type="number" min="1" max="250" value={goals.weeklyProblems} onChange={(event) => onGoals({ ...goals, weeklyProblems: Math.max(1, Math.min(250, Number(event.target.value) || 1)) })} /> 問</label></article></section>
    </section>
  </main>
}
