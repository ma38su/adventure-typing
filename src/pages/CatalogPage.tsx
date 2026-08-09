import type { Dispatch, SetStateAction } from 'react'
import type { ProblemStat, ProblemStats, ScoreData } from '../domain'
import { GRADE_OPTIONS, LEARNING_STAGES } from '../game/courseConfig'
import { QUESTIONS, type Grade, type Question } from '../questions'
import type { Course } from '../rewards'
import { RubyPhrase } from '../components/game/GameVisuals'

const statAccuracy = (stat?: ProblemStat) => stat && stat.correctKeys + stat.mistakes > 0 ? Math.round((stat.correctKeys / (stat.correctKeys + stat.mistakes)) * 100) : 0
const statAverageKpm = (stat?: ProblemStat) => stat && stat.totalTimeMs > 0 ? Math.round((stat.completedKeys / stat.totalTimeMs) * 60000) : 0

export function CatalogPage({ grade, setGrade, problemStats, completedCourses, scoreData, onBack, onStart }: { grade: Grade; setGrade: Dispatch<SetStateAction<Grade>>; problemStats: ProblemStats; completedCourses: string[]; scoreData: ScoreData; onBack: () => void; onStart: (question: Question) => void }) {
  const gradeQuestions = QUESTIONS[grade]
  const attemptedTotal = gradeQuestions.filter((item) => (problemStats[item.id]?.attempts ?? 0) > 0).length
  const completedTotal = gradeQuestions.filter((item) => (problemStats[item.id]?.completions ?? 0) > 0).length
  return <main className="catalog-page">
    <header className="catalog-topbar"><button className="catalog-back" onClick={onBack}>‹ 戻る</button><div className="brand"><span className="brand-mark">📚</span><div><strong>問題一覧</strong><small>学習のきろく</small></div></div><div className="catalog-overall"><b>{completedTotal}</b>問クリア <span>/</span> {gradeQuestions.length}問</div></header>
    <section className="catalog-hero"><div><span>ことば島 学習記録</span><h1>{grade}年生の コースと問題</h1><p>挑戦した問題、間違えた場所、タイピングのペースをいつでも振り返れます</p></div><div className="catalog-progress-ring" style={{ '--score': `${gradeQuestions.length ? (completedTotal / gradeQuestions.length) * 360 : 0}deg` } as React.CSSProperties}><b>{completedTotal}<small>/{gradeQuestions.length}</small></b><span>クリア</span></div></section>
    <nav className="catalog-grade-tabs" aria-label="学年を選ぶ">{GRADE_OPTIONS.map((value) => <button key={value} className={grade === value ? 'active' : ''} onClick={() => setGrade(value)}>{value}年生</button>)}</nav>
    <div className="catalog-summary"><div><span>挑戦済み</span><b>{attemptedTotal}<small>問</small></b></div><div><span>クリア済み</span><b>{completedTotal}<small>問</small></b></div><div><span>まだ未挑戦</span><b>{gradeQuestions.length - attemptedTotal}<small>問</small></b></div><div><span>コース達成</span><b>{LEARNING_STAGES.filter((_, courseIndex) => completedCourses.includes(`${grade}-${courseIndex + 1}`)).length}<small>/{LEARNING_STAGES.length}</small></b></div></div>
    <div className="catalog-courses">{LEARNING_STAGES.map((course, courseIndex) => {
      const courseNumber = (courseIndex + 1) as Course
      const courseQuestions = gradeQuestions.filter((item) => item.stage === courseNumber)
      const courseStats = courseQuestions.map((item) => problemStats[item.id]).filter(Boolean)
      const courseAttempted = courseQuestions.filter((item) => (problemStats[item.id]?.attempts ?? 0) > 0).length
      const courseCompleted = courseQuestions.filter((item) => (problemStats[item.id]?.completions ?? 0) > 0).length
      const courseCorrect = courseStats.reduce((total, stat) => total + stat.correctKeys, 0)
      const courseMistakes = courseStats.reduce((total, stat) => total + stat.mistakes, 0)
      const courseAccuracy = courseCorrect + courseMistakes ? Math.round((courseCorrect / (courseCorrect + courseMistakes)) * 100) : 0
      const courseTime = courseStats.reduce((total, stat) => total + stat.totalTimeMs, 0)
      const courseKeys = courseStats.reduce((total, stat) => total + stat.completedKeys, 0)
      const courseKpm = courseTime ? Math.round((courseKeys / courseTime) * 60000) : 0
      const isCourseComplete = completedCourses.includes(`${grade}-${courseNumber}`)
      return <section className="catalog-course panel" key={course.name}><header><div className="catalog-course-icon">{isCourseComplete ? '✓' : course.icon}</div><div><span>コース {courseNumber}・{course.label}・{course.habitat}</span><h2>{course.name}</h2><p className="course-description">{course.description}</p></div><div className="course-list-progress"><b>{courseCompleted}/{courseQuestions.length}</b><i><em style={{ width: `${(courseCompleted / courseQuestions.length) * 100}%` }} /></i></div></header><div className="course-stat-strip"><span>挑戦 {courseAttempted}問</span><span>正確さ {courseAccuracy || '―'}{courseAccuracy ? '%' : ''}</span><span>平均 {courseKpm || '―'}{courseKpm ? ' KPM' : ''}</span><span>ベスト {scoreData.courseBest[`${grade}-${courseNumber}`]?.toLocaleString() ?? '―'} GP</span><span>{isCourseComplete ? '🏆 コース達成' : '冒険中'}</span></div><div className="catalog-question-list">{courseQuestions.map((item, itemIndex) => {
        const stat = problemStats[item.id]
        const challenged = (stat?.attempts ?? 0) > 0
        const cleared = (stat?.completions ?? 0) > 0
        const wrongSpots = stat ? Object.values(stat.wrongSpots).sort((a, b) => b.count - a.count).slice(0, 3) : []
        return <article className={`catalog-question ${cleared ? 'cleared' : challenged ? 'challenged' : 'untried'}`} key={item.id}><div className="question-status"><span>{cleared ? '✓' : challenged ? '…' : '○'}</span><small>{cleared ? 'クリア' : challenged ? '挑戦中' : '未挑戦'}</small></div><div className="question-copy"><small>問題 {itemIndex + 1}</small><h3>{item.ruby.map((phrase, index) => <span key={`${phrase}-${index}`}><RubyPhrase markup={phrase} />{index < item.ruby.length - 1 && ' '}</span>)}</h3><code>{item.romaji}</code>{wrongSpots.length > 0 && <div className="wrong-spot-list">{wrongSpots.map((spot) => <span key={`${spot.position}-${spot.expected}-${spot.actual}`}>{spot.position + 1}文字目「{spot.actual}」→「{spot.expected}」×{spot.count}</span>)}</div>}</div><div className="question-metrics">{challenged ? <><span><small>挑戦</small><b>{stat.attempts}回</b></span><span><small>正確さ</small><b>{statAccuracy(stat)}%</b></span><span><small>平均ペース</small><b>{statAverageKpm(stat) || '―'} KPM</b></span><span><small>最高ペース</small><b>{stat.bestKpm || '―'} KPM</b></span></> : <p>まだ記録がありません</p>}</div><button onClick={() => onStart(item)}>{cleared ? 'もう一度' : '挑戦する'} ▶</button></article>
      })}</div></section>
    })}</div><p className="catalog-storage-note">この学習記録は、この端末のローカルストレージに保存されています</p>
  </main>
}
