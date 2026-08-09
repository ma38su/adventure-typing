import { memo } from 'react'
import { LEARNING_STAGES } from '../../game/courseConfig'
import { getCourseStory } from '../../game/storyConfig'
import type { Grade } from '../../questions'
import type { Course } from '../../rewards'
import { UIRuby } from '../UIRuby'

export const CourseMap = memo(function CourseMap({ grade, selectedCourse, completedCourses, questionIndex, questionCount }: { grade: Grade; selectedCourse: Course; completedCourses: string[]; questionIndex: number; questionCount: number }) {
  return <aside className="map-panel panel"><div className="panel-heading"><span>⌖ <UIRuby>ステージマップ</UIRuby></span><b>{questionIndex + 1}/{questionCount}</b></div><div className="route"><div className="route-line" />{LEARNING_STAGES.map((stage, index) => { const courseNumber = (index + 1) as Course; const story = getCourseStory(grade, courseNumber); const state = completedCourses.includes(`${grade}-${courseNumber}`) ? 'done' : courseNumber === selectedCourse ? 'current' : 'locked'; return <div className={`route-stop ${state}`} key={story.title}><span className="island-bubble">{state === 'locked' ? '•' : stage.icon}</span><div><small><UIRuby>{`ステージ ${index + 1}・${stage.habitat}`}</UIRuby></small><strong><UIRuby>{story.title}</UIRuby></strong></div>{state === 'done' && <span className="check">✓</span>}{state === 'current' && <span className="you-are-here">いまここ</span>}</div> })}</div><div className="map-footer"><span>ぜんぶの<UIRuby>問題</UIRuby></span><b>{questionIndex + 1} / {questionCount}</b><div className="mini-progress"><i style={{ width: `${questionIndex / questionCount * 100}%` }} /></div></div></aside>
})
