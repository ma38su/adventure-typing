import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getQuestionSection, groupQuestionsBySection, QUESTIONS, type Grade, type Question } from './questions'
import { getReward, rollCourseCreature, rollCourseTreasure, type CollectionRecord } from './rewards'
import { emptyProblemStat, emptyProfileData, type CharacterStyle, type DailyActivity, type KeyStats, type LearningGoals, type ProblemStats, type ProfileData, type ProfileRegistry, type ScoreBreakdown, type ScoreData, type TypingDisplayCase, type UserProfile } from './domain'
import { getAdventureRank } from './ranks'
import { type AdventureEvent } from './game/gameRunReducer'
import { useGameRunState } from './game/useGameRunState'
import { mergeKeyStatBatch, mergeProblemBatch, useTypingEngine, type TypingProblemBatch } from './game/useTypingEngine'
import { ProfileCreator, ProfileManagerPage, ProfileWelcomePage } from './pages/ProfilePages'
import { TitlePage } from './pages/TitlePage'
import { FullscreenControl } from './components/FullscreenControl'
import { TypingCard } from './components/game/TypingCard'
import { AudioControls } from './components/AudioControls'
import { CourseMap } from './components/game/CourseMap'
import { AdventureScenes } from './components/game/AdventureScenes'
import { GameSidePanel } from './components/game/GameSidePanel'
import { CourseClearModal, KeyStatsModal, ReviewModal, RewardDiscoveryModal } from './components/game/GameModals'
import { createDebouncedProfileWriter, loadProfileData, loadProfileRegistry, saveProfileData, saveProfileRegistry } from './storage/profileStorage'
import { addDailyActivity, getGoalProgress } from './learningProgress'
import { ParentReportPage } from './pages/ParentReportPage'
import { GRADE_STORIES, getCourseStory } from './game/storyConfig'
import { linearStageId, toLegacyStage, type LinearStageNumber } from './game/linearStageConfig'
import { buildLinearStageQuestions } from './game/linearQuestionPool'
import { getJourneyLabel } from './journey3d/journeyRoute'
import './App.css'

const KanaPracticePage = lazy(() => import('./KanaPracticePage').then((module) => ({ default: module.KanaPracticePage })))
const JourneyWorld = lazy(() => import('./journey3d/JourneyWorld').then((module) => ({ default: module.JourneyWorld })))
const RankGuidePage = lazy(() => import('./pages/RankGuidePage').then((module) => ({ default: module.RankGuidePage })))
const CollectionPage = lazy(() => import('./pages/CollectionPage').then((module) => ({ default: module.CollectionPage })))
const CatalogPage = lazy(() => import('./pages/CatalogPage').then((module) => ({ default: module.CatalogPage })))
const pageFallback = <main className="page-loading" aria-live="polite">島を よみこみ中…</main>


type SoundEffect = 'key' | 'wrong' | 'complete' | 'reward'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const started = location.pathname === '/play'
  const showProfileManager = location.pathname === '/profiles'
  const showCatalog = location.pathname === '/catalog'
  const showCollection = location.pathname === '/collection'
  const showRankGuide = location.pathname === '/grade-guide'
  const showKanaPractice = location.pathname === '/romaji-island'
  const showParentReport = location.pathname === '/parent-report'
  const setStarted = useCallback((show: boolean) => navigate(show ? '/play' : '/'), [navigate])
  const setShowProfileManager = useCallback((show: boolean) => navigate(show ? '/profiles' : '/'), [navigate])
  const setShowCatalog = useCallback((show: boolean) => navigate(show ? '/catalog' : '/'), [navigate])
  const setShowCollection = useCallback((show: boolean) => navigate(show ? '/collection' : '/'), [navigate])
  const setShowRankGuide = useCallback((show: boolean) => navigate(show ? '/grade-guide' : '/'), [navigate])
  const setShowKanaPractice = useCallback((show: boolean) => navigate(show ? '/romaji-island' : '/'), [navigate])
  const setShowParentReport = useCallback((show: boolean) => navigate(show ? '/parent-report' : '/'), [navigate])
  const [profileRegistry, setProfileRegistry] = useState<ProfileRegistry>(loadProfileRegistry)
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [initialProfileData] = useState<ProfileData>(() => loadProfileData(profileRegistry.activeProfileId))
  const initialProfile = profileRegistry.profiles.find((profile) => profile.id === profileRegistry.activeProfileId)
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileGrade, setNewProfileGrade] = useState<Grade>(1)
  const [newProfileCharacter, setNewProfileCharacter] = useState<CharacterStyle>('girl')
  const [profileError, setProfileError] = useState('')
  const [grade, setGrade] = useState<Grade>(initialProfile?.lastGrade ?? 1)
  const [selectedStage, setSelectedStage] = useState<LinearStageNumber>(Math.min(36, Math.max(1, initialProfileData.lastStage)) as LinearStageNumber)
  const { grade: storyGrade, course: selectedCourse } = toLegacyStage(selectedStage)
  const initialVisitSeed = `${profileRegistry.activeProfileId ?? 'guest'}:${Date.now()}`
  const [stageQuestions, setStageQuestions] = useState<Question[]>(() => buildLinearStageQuestions(Math.min(36, Math.max(1, initialProfileData.lastStage)) as LinearStageNumber, initialProfile?.lastGrade ?? 1, initialVisitSeed))
  const { state: gameRun, dispatch: dispatchGameRun, setTyped, setMistakes, setNotice, setCombo, setCompleted, setStepQueue, setStageWalked, setAwaitingFinish, setAdventureAction, setAdventureEvent, setAdventureReward, setRewardAwaitingConfirmation, setCourseScore, setRunBonus, setLastScore, setPracticeMode, setReviewTargetKeys, setRunKeyStats } = useGameRunState()
  const { questionIndex, typed, mistakes, notice, combo, completed, stepQueue, stageWalked, awaitingFinish, adventureAction, adventureEvent, adventureReward, trailTreasure, rewardAwaitingConfirmation, courseScore, runBonus, lastScore, practiceMode, reviewTargetKeys, runKeyStats } = gameRun
  const [showReview, setShowReview] = useState(false)
  const [showKeyStats, setShowKeyStats] = useState(false)
  const [collectionTab, setCollectionTab] = useState<'treasure' | 'friend'>('treasure')
  const [bgmOn, setBgmOn] = useState(initialProfileData.audioSettings.bgmOn)
  const [soundEffectsOn, setSoundEffectsOn] = useState(initialProfileData.audioSettings.soundEffectsOn)
  const [typingDisplayCase, setTypingDisplayCase] = useState<TypingDisplayCase>(initialProfileData.typingDisplayCase)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [characterStyle, setCharacterStyle] = useState<CharacterStyle>(initialProfile?.characterStyle ?? 'girl')
  const [keyStats, setKeyStats] = useState<KeyStats>(initialProfileData.keyStats)
  const [, setAdaptiveKeyStats] = useState<KeyStats>(initialProfileData.keyStats)
  const [collection, setCollection] = useState<CollectionRecord[]>(initialProfileData.collection)
  const [scoreData, setScoreData] = useState<ScoreData>(initialProfileData.scoreData)
  const [completedCourses, setCompletedCourses] = useState<string[]>(initialProfileData.completedStageIds)
  const [problemStats, setProblemStats] = useState<ProblemStats>(initialProfileData.problemStats)
  const [dailyActivity, setDailyActivity] = useState<Record<string, DailyActivity>>(initialProfileData.dailyActivity)
  const [goals, setGoals] = useState<LearningGoals>(initialProfileData.goals)
  const [tutorialCompletedAt, setTutorialCompletedAt] = useState(initialProfileData.tutorialCompletedAt)
  const [storageError, setStorageError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const bgmMasterRef = useRef<GainNode | null>(null)
  const [profileWriter] = useState(() => createDebouncedProfileWriter(750, localStorage, () => setStorageError(true)))

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [location.pathname])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const questions = useMemo(() => {
    const gradeQuestions = QUESTIONS[grade]
    if (practiceMode !== 'weak-keys' || reviewTargetKeys.length === 0) {
      return stageQuestions
    }
    return gradeQuestions
      .map((item) => ({ item, score: reviewTargetKeys.reduce((total, key) => total + item.romaji.replaceAll(' ', '').split(key).length - 1, 0) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ item }) => item)
  }, [grade, practiceMode, reviewTargetKeys, stageQuestions])
  const question = questions[questionIndex]
  const segmentGroups = useMemo(() => groupQuestionsBySection(questions), [questions])
  const currentSegment = getQuestionSection(question)
  const currentSegmentIndex = Math.max(0, segmentGroups.findIndex((items) => items.some((item) => item.id === question.id)))
  const currentSegmentQuestions = segmentGroups[currentSegmentIndex] ?? [question]
  const currentSegmentQuestionIndex = Math.max(0, currentSegmentQuestions.findIndex((item) => item.id === question.id))
  const isFinalStageQuestion = questionIndex === questions.length - 1
  const isCurrentSegmentFinalQuestion = isFinalStageQuestion || getQuestionSection(questions[questionIndex + 1]) !== currentSegment
  const gradeStory = GRADE_STORIES[storyGrade]
  const courseStory = getCourseStory(storyGrade, selectedCourse)
  const stageIndex = selectedCourse - 1
  const { canonicalRomaji, displayProgress, inputDisplayProgress, currentChar, nextKeyOptions, enterCharacters, resetQuestion: resetTypingQuestion } = useTypingEngine({
    question,
    grade,
    course: selectedCourse,
    typed,
    disabled: completed || showReview || showKeyStats || awaitingFinish,
    onTyped: setTyped,
    onAcceptedKey: handleAcceptedKey,
    onRejectedKey: handleRejectedKey,
    onComplete: finishQuestion,
  })
  const activeProfile = profileRegistry.profiles.find((profile) => profile.id === activeProfileId)
  const adventureRank = getAdventureRank(scoreData.lifetime)
  const deviceRanking = useMemo(() => profileRegistry.profiles.map((profile) => {
    const data = profile.id === activeProfileId ? { scoreData, completedStageIds: completedCourses, collection } : loadProfileData(profile.id)
    const points = data.scoreData.lifetime
    return { profile, points, rank: getAdventureRank(points), completed: data.completedStageIds.length, discoveries: data.collection.length }
  }).sort((a, b) => b.points - a.points || a.profile.createdAt.localeCompare(b.profile.createdAt)), [profileRegistry.profiles, activeProfileId, scoreData, completedCourses, collection])
  const stepDelay = stepQueue >= 12 ? 42 : stepQueue >= 7 ? 58 : stepQueue >= 3 ? 82 : 115
  const sentenceProgress = awaitingFinish ? 1 : Math.min(1, displayProgress / Math.max(1, canonicalRomaji.length))
  const queuedSentenceTotal = stageWalked + stepQueue + Math.max(0, canonicalRomaji.length - displayProgress)
  const courseStepProgress = awaitingFinish && stepQueue === 0 ? 1 : Math.min(1, stageWalked / Math.max(1, queuedSentenceTotal))
  const courseProgress = Math.min(1, (questionIndex + courseStepProgress) / Math.max(1, questions.length))
  const walkPercent = 6 + courseProgress * 85
  const runAttempts = useMemo(() => Object.values(runKeyStats).reduce((total, stat) => total + stat.attempts, 0), [runKeyStats])
  const runMisses = useMemo(() => Object.values(runKeyStats).reduce((total, stat) => total + stat.misses, 0), [runKeyStats])
  const accuracy = runAttempts ? Math.round(((runAttempts - runMisses) / runAttempts) * 100) : 100
  const runKeyRanking = useMemo(() => Object.entries(runKeyStats).map(([key, stat]) => ({ key, ...stat, missRate: Math.round((stat.misses / stat.attempts) * 100) })), [runKeyStats])
  const runWeakKeys = useMemo(() => runKeyRanking.filter((stat) => stat.misses > 0).sort((a, b) => b.missRate - a.missRate || b.misses - a.misses).slice(0, 3), [runKeyRanking])
  const runStrongKeys = useMemo(() => runKeyRanking.filter((stat) => stat.misses === 0).sort((a, b) => b.attempts - a.attempts).slice(0, 3), [runKeyRanking])
  const collectedTreasures = collection.filter((item) => item.type === 'treasure')
  const collectedFriends = collection.filter((item) => item.type === 'friend')
  const treasureCount = collectedTreasures.reduce((total, item) => total + item.count, 0)
  const creatureCount = collectedFriends.reduce((total, item) => total + item.count, 0)
  const currentCourseId = linearStageId(selectedStage)
  // Expand the numeric range only after each shared boundary passes its gate. Keeping
  // this as one owner lets later stages retain the same scene/camera/transport.
  const usesJourneyWorld = selectedStage === 1 && practiceMode === 'adventure'
  const journeyTypingPace = Math.min(2, 0.65 + combo * 0.025 + stepQueue * 0.08)
  const chapterCompletedCourses = useMemo(() => Array.from({ length: 6 }, (_, index) => ({
    legacy: `${storyGrade}-${index + 1}`,
    linear: `stage-${(storyGrade - 1) * 6 + index + 1}`,
  })).filter(({ linear }) => completedCourses.includes(linear)).map(({ legacy }) => legacy), [storyGrade, completedCourses])
  const currentCourseBest = scoreData.courseBest[currentCourseId] ?? 0
  const selectedCourseFullyCompleted = isFinalStageQuestion
  const weakKeyStats = useMemo(() => Object.entries(keyStats)
    .filter(([id, stat]) => id.startsWith(`${grade}:`) && stat.misses > 0)
    .map(([id, stat]) => ({
      key: id.split(':')[1],
      ...stat,
      missRate: Math.round((stat.misses / stat.attempts) * 100),
      commonWrong: Object.entries(stat.wrongKeys).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '',
    }))
    .sort((a, b) => b.missRate - a.missRate || b.misses - a.misses)
    .slice(0, 8), [grade, keyStats])
  const strongKeyStats = useMemo(() => Object.entries(keyStats)
    .filter(([id, stat]) => id.startsWith(`${grade}:`) && stat.attempts > 0)
    .map(([id, stat]) => ({ key: id.split(':')[1], ...stat, accuracy: Math.round(((stat.attempts - stat.misses) / stat.attempts) * 100) }))
    .sort((a, b) => b.accuracy - a.accuracy || b.attempts - a.attempts)
    .slice(0, 5), [grade, keyStats])
  const totalKeyAttempts = useMemo(() => Object.entries(keyStats)
    .filter(([id]) => id.startsWith(`${grade}:`))
    .reduce((total, [, stat]) => total + stat.attempts, 0), [grade, keyStats])
  const goalProgress = useMemo(() => getGoalProgress(dailyActivity, goals), [dailyActivity, goals])

  useEffect(() => {
    if (!saveProfileRegistry(profileRegistry)) setStorageError(true)
  }, [profileRegistry])
  useEffect(() => {
    if (!activeProfileId) return
    const data: ProfileData = { schemaVersion: 3, keyStats, collection, completedStageIds: completedCourses, lastStage: selectedStage, problemStats, scoreData, dailyActivity, goals, tutorialCompletedAt, audioSettings: { bgmOn, soundEffectsOn }, typingDisplayCase }
    profileWriter.schedule(activeProfileId, data)
  }, [activeProfileId, keyStats, collection, completedCourses, selectedStage, problemStats, scoreData, dailyActivity, goals, tutorialCompletedAt, bgmOn, soundEffectsOn, typingDisplayCase, profileWriter])
  useEffect(() => {
    const flush = () => profileWriter.flush()
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', flush)
      flush()
    }
  }, [profileWriter])
  useEffect(() => {
    if (!activeProfileId) return
    setProfileRegistry((registry) => {
      const current = registry.profiles.find((profile) => profile.id === activeProfileId)
      if (!current || (current.lastGrade === grade && current.characterStyle === characterStyle)) return registry
      return { ...registry, profiles: registry.profiles.map((profile) => profile.id === activeProfileId ? { ...profile, lastGrade: grade, characterStyle } : profile) }
    })
  }, [activeProfileId, grade, characterStyle])
  useEffect(() => {
    dispatchGameRun({ type: 'prepare-question', trailTreasure: practiceMode === 'adventure' ? rollCourseTreasure(storyGrade, selectedCourse) : null })
  }, [question.id, storyGrade, selectedCourse, practiceMode, dispatchGameRun])

  const playSound = useCallback((effect: SoundEffect, comboValue = 0) => {
    if (!soundEffectsOn) return
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = audioContextRef.current ?? new AudioContextClass()
    audioContextRef.current = context
    void context.resume()

    const notes = effect === 'complete'
      ? [523, 659, 784, 1047]
      : effect === 'reward'
        ? [784, 1047, 1319]
        : effect === 'wrong'
          ? [165, 130]
          : [480 + Math.min(comboValue, 16) * 22]
    const spacing = effect === 'complete' ? .085 : effect === 'reward' ? .11 : .045
    const duration = effect === 'key' ? .065 : effect === 'wrong' ? .12 : .18

    notes.forEach((frequency, index) => {
      const start = context.currentTime + index * spacing
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = effect === 'wrong' ? 'sawtooth' : effect === 'key' ? 'sine' : 'triangle'
      oscillator.frequency.setValueAtTime(frequency, start)
      gain.gain.setValueAtTime(effect === 'key' ? .035 : .055, start)
      gain.gain.exponentialRampToValueAtTime(.001, start + duration)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(start)
      oscillator.stop(start + duration)
    })
  }, [soundEffectsOn])

  useEffect(() => {
    if (!started || !bgmOn) return
    const bpm = 92
    const beat = 60 / bpm
    const loopDuration = beat * 32
    const midiToFrequency = (note: number) => 440 * 2 ** ((note - 69) / 12)
    const harmony = [
      [50, 57, 64, 67], // Dm9
      [46, 53, 60, 64], // Bb maj7(#11)
      [53, 60, 64, 69], // F maj9
      [48, 55, 62, 65], // C sus2(add4)
      [50, 57, 64, 69],
      [55, 62, 65, 72], // Gm11
      [46, 53, 60, 65],
      [45, 52, 57, 61], // A7(b9), returning to Dm
    ]
    const melody = [74, 77, 76, 72, 69, 72, 74, 81, 79, 76, 77, 72, 74, 69, 73, 76]

    const playPhrase = () => {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return
      const context = audioContextRef.current ?? new AudioContextClass()
      audioContextRef.current = context
      void context.resume()
      const phraseStart = context.currentTime + .06
      const master = context.createGain()
      bgmMasterRef.current?.disconnect()
      bgmMasterRef.current = master
      master.gain.setValueAtTime(.48, phraseStart)
      master.connect(context.destination)

      const playNote = (note: number, start: number, duration: number, volume: number, type: OscillatorType, detune = 0) => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = type
        oscillator.frequency.setValueAtTime(midiToFrequency(note), start)
        oscillator.detune.setValueAtTime(detune, start)
        gain.gain.setValueAtTime(.0001, start)
        gain.gain.exponentialRampToValueAtTime(volume, start + .025)
        gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
        oscillator.connect(gain).connect(master)
        oscillator.start(start)
        oscillator.stop(start + duration + .02)
      }

      harmony.forEach((chord, bar) => {
        const barStart = phraseStart + bar * beat * 4
        playNote(chord[0] - 12, barStart, beat * 3.7, .018, 'sine')
        ;[0, 2, 1, 3, 2, 1].forEach((voice, step) => {
          playNote(chord[voice], barStart + step * beat * 2 / 3, beat * .72, .014, 'triangle')
        })
        if (bar % 2 === 1) playNote(chord[3] + 12, barStart + beat * 3.25, beat * .6, .006, 'sine', 5)
      })

      melody.forEach((note, index) => {
        const start = phraseStart + index * beat * 2
        const held = index % 4 === 3 ? beat * 1.65 : beat * 1.15
        playNote(note, start, held, .012, 'sine')
        playNote(note + 12, start + .018, held * .72, .0035, 'triangle', -6)
      })

      window.setTimeout(() => {
        master.disconnect()
        if (bgmMasterRef.current === master) bgmMasterRef.current = null
      }, (loopDuration + .5) * 1000)
    }
    playPhrase()
    const timer = window.setInterval(playPhrase, loopDuration * 1000)
    return () => {
      window.clearInterval(timer)
      bgmMasterRef.current?.disconnect()
      bgmMasterRef.current = null
    }
  }, [started, bgmOn])

  const advanceAfterEvent = useCallback(() => {
    if (isCurrentSegmentFinalQuestion) {
      setRewardAwaitingConfirmation(false)
      setAdventureEvent(null)
      setAdventureReward(null)
      setCompleted(true)
    }
    if (isFinalStageQuestion) {
      const courseId = linearStageId(selectedStage)
      if (practiceMode === 'adventure') {
        const storyTreasure = getReward(courseStory.featuredTreasureId)
        if (storyTreasure) setCollection((items) => items.some((item) => item.id === storyTreasure.id) ? items : [...items, { id: storyTreasure.id, type: 'treasure', count: 1, firstFoundAt: new Date().toISOString() }])
        setScoreData((score) => ({
          ...score,
          courseBest: { ...score.courseBest, [courseId]: Math.max(score.courseBest[courseId] ?? 0, courseScore) },
          coursePlays: { ...score.coursePlays, [courseId]: (score.coursePlays[courseId] ?? 0) + 1 },
        }))
      }
      if (practiceMode === 'adventure' && selectedCourseFullyCompleted) {
        setCompletedCourses((items) => items.includes(courseId) ? items : [...items, courseId])
      }
    }
    if (!isCurrentSegmentFinalQuestion) dispatchGameRun({ type: 'advance-question', questionIndex: questionIndex + 1 })
  }, [questionIndex, practiceMode, selectedStage, selectedCourseFullyCompleted, courseScore, courseStory.featuredTreasureId, isCurrentSegmentFinalQuestion, isFinalStageQuestion, setCompleted, setRewardAwaitingConfirmation, setAdventureEvent, setAdventureReward, dispatchGameRun])

  useEffect(() => { inputRef.current?.focus({ preventScroll: true }) }, [questionIndex, grade, showReview, showKeyStats, started])

  useEffect(() => {
    if (!started || stepQueue <= 0) return
    const timer = window.setTimeout(() => {
      setStepQueue((value) => Math.max(0, value - 1))
      setStageWalked((value) => value + 1)
      setAdventureAction('walk')
    }, stepDelay)
    return () => window.clearTimeout(timer)
  }, [started, stepQueue, stepDelay, setStepQueue, setStageWalked, setAdventureAction])

  useEffect(() => {
    if (stepQueue > 0 || awaitingFinish || adventureAction !== 'walk') return
    const timer = window.setTimeout(() => setAdventureAction('idle'), 180)
    return () => window.clearTimeout(timer)
  }, [stepQueue, awaitingFinish, adventureAction, setAdventureAction])

  useEffect(() => {
    if (!awaitingFinish || stepQueue > 0) return
    const reward = adventureReward
    const event: AdventureEvent = reward
      ? reward.type === 'treasure'
        ? { action: 'rest', icon: '✨', text: '道で光っていた お宝を手に入れた！', rewardType: 'treasure' }
        : { action: 'rest', icon: '🐾', text: '上手なタイピングに いきものが近づいてきた！', rewardType: 'friend' }
      : questionIndex % 2 === 0
        ? { action: 'drink', icon: '💧', text: 'お水を飲んで ひと休み' }
        : { action: 'rest', icon: '🍀', text: '風の音を聞いて ひと休み' }
    setAdventureAction(event.action)
    setAdventureEvent(event)
    setNotice({ kind: 'good', text: event.text })

    if (reward) {
      setCollection((items) => {
        const found = items.find((item) => item.id === reward.id)
        return found
          ? items.map((item) => item.id === reward.id ? { ...item, count: item.count + 1 } : item)
          : [...items, { id: reward.id, type: reward.type, count: 1, firstFoundAt: new Date().toISOString() }]
      })
      setScoreData((score) => ({ ...score, lifetime: score.lifetime + reward.bonus }))
      setRunBonus((value) => value + reward.bonus)
      setRewardAwaitingConfirmation(true)
      playSound('reward')
      return
    }

    const timer = window.setTimeout(advanceAfterEvent, 1250)
    return () => window.clearTimeout(timer)
  }, [awaitingFinish, stepQueue, questionIndex, questions.length, advanceAfterEvent, playSound, adventureReward, setAdventureAction, setAdventureEvent, setNotice, setRunBonus, setRewardAwaitingConfirmation])

  function finishQuestion(batch: TypingProblemBatch, score: ScoreBreakdown) {
    const targetKpm = 65 + Math.ceil(selectedStage / 6) * 10 + selectedCourse * 5
    const { accuracy: accuracyPercent, kpm } = score
    const reward = practiceMode === 'adventure'
      ? trailTreasure ?? rollCourseCreature(storyGrade, selectedCourse, accuracyPercent, kpm, targetKpm)
      : null
    const earnedScore = score.total
    setLastScore(score)
    setAdventureReward(reward)
    setCourseScore((value) => value + earnedScore)
    setScoreData((score) => ({ ...score, lifetime: score.lifetime + earnedScore }))
    const playedAt = new Date().toISOString()
    setProblemStats((stats) => ({
      ...stats,
      [batch.questionId]: mergeProblemBatch(stats[batch.questionId] ?? emptyProblemStat(), batch, playedAt),
    }))
    setKeyStats((stats) => mergeKeyStatBatch(stats, batch.keyStats, `${grade}:`))
    setRunKeyStats((stats) => mergeKeyStatBatch(stats, batch.keyStats))
    setDailyActivity((activity) => addDailyActivity(activity, { completedProblems: 1, correctKeys: batch.correctKeys, mistakes: batch.mistakes, practiceMs: batch.elapsed, earnedPoints: earnedScore }))
    setAwaitingFinish(true)
    playSound('complete')
    setNotice({ kind: 'good', text: stepQueue > 0 ? '文をクリア！ 冒険者が追いついているよ' : '文をクリア！ ちょっとひと休み…' })
  }

  function handleAcceptedKey(_key: string, comboHint: number) {
    setStepQueue((value) => value + 1)
    setCombo((value) => value + 1)
    setNotice(null)
    playSound('key', combo + comboHint)
  }

  function handleRejectedKey(expected: string, actual: string) {
    setMistakes((items) => [...items, { questionId: question.id, sentence: question.sentence, expected, actual }])
    setCombo(0)
    setNotice({ kind: 'bad', text: `「${actual}」ではなく「${expected}」だよ。もう一度！` })
    playSound('wrong')
  }

  const resetStage = (nextStage: LinearStageNumber = selectedStage, newVisit = true, recommendedGrade: Grade = grade) => {
    resetTypingQuestion()
    setSelectedStage(nextStage)
    if (newVisit) setStageQuestions(buildLinearStageQuestions(nextStage, recommendedGrade, `${activeProfileId ?? 'guest'}:${Date.now()}`))
    setAdaptiveKeyStats(keyStats)
    const legacy = toLegacyStage(nextStage)
    dispatchGameRun({ type: 'reset', trailTreasure: rollCourseTreasure(legacy.grade, legacy.course) })
  }

  const startWeakKeyPractice = () => {
    const targets = weakKeyStats.slice(0, 3).map((stat) => stat.key)
    if (targets.length === 0) return
    resetStage(selectedStage, false)
    setPracticeMode('weak-keys')
    setReviewTargetKeys(targets)
    setShowKeyStats(false)
  }

  const continueAfterCourseClear = () => {
    if (practiceMode === 'weak-keys') {
      resetStage(selectedStage, false)
      return
    }
    if (!isFinalStageQuestion) {
      setCompleted(false)
      dispatchGameRun({ type: 'advance-question', questionIndex: questionIndex + 1 })
      return
    }
    if (!selectedCourseFullyCompleted) {
      resetStage(selectedStage)
      setShowCatalog(true)
      return
    }
    if (selectedStage < 36) resetStage((selectedStage + 1) as LinearStageNumber)
    else {
      resetStage(1)
      setStarted(false)
    }
  }

  const startCatalogStage = (nextStage: LinearStageNumber) => {
    resetStage(nextStage)
    setShowCatalog(false)
    setStarted(true)
  }

  const setProfileLearningData = (data: ProfileData) => {
    setKeyStats(data.keyStats)
    setAdaptiveKeyStats(data.keyStats)
    setCollection(data.collection)
    setCompletedCourses(data.completedStageIds)
    setSelectedStage(data.lastStage as LinearStageNumber)
    setProblemStats(data.problemStats)
    setScoreData(data.scoreData)
    setDailyActivity(data.dailyActivity)
    setGoals(data.goals)
    setTutorialCompletedAt(data.tutorialCompletedAt)
    setBgmOn(data.audioSettings.bgmOn)
    setSoundEffectsOn(data.audioSettings.soundEffectsOn)
    setTypingDisplayCase(data.typingDisplayCase)
  }

  const changeBgm = (on: boolean) => {
    setBgmOn(on)
    if (!on) return
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = audioContextRef.current ?? new AudioContextClass()
    audioContextRef.current = context
    void context.resume()
  }

  const saveCurrentProfileNow = () => {
    if (!activeProfileId) return
    const data: ProfileData = { schemaVersion: 3, keyStats, collection, completedStageIds: completedCourses, lastStage: selectedStage, problemStats, scoreData, dailyActivity, goals, tutorialCompletedAt, audioSettings: { bgmOn, soundEffectsOn }, typingDisplayCase }
    profileWriter.cancel()
    if (!saveProfileData(activeProfileId, data)) setStorageError(true)
  }

  const switchProfile = (profile: UserProfile) => {
    playSound('key')
    saveCurrentProfileNow()
    const data = loadProfileData(profile.id)
    setProfileLearningData(data)
    setActiveProfileId(profile.id)
    setProfileRegistry((registry) => ({
      ...registry,
      activeProfileId: profile.id,
      profiles: registry.profiles.map((item) => item.id === profile.id ? { ...item, lastPlayedAt: new Date().toISOString() } : item),
    }))
    setCharacterStyle(profile.characterStyle)
    resetStage(data.lastStage as LinearStageNumber, true, profile.lastGrade)
    setStarted(false)
    setShowCatalog(false)
    setShowCollection(false)
    setShowProfileManager(false)
  }

  const createProfile = () => {
    const name = newProfileName.trim().replace(/\s+/g, ' ')
    if (!name) { setProfileError('なまえを入力してね'); return }
    if (name.length > 12) { setProfileError('なまえは12文字までにしてね'); return }
    if (profileRegistry.profiles.some((profile) => profile.name.toLocaleLowerCase() === name.toLocaleLowerCase())) { setProfileError('同じなまえのユーザーがいるよ'); return }
    saveCurrentProfileNow()
    const now = new Date().toISOString()
    const id = globalThis.crypto?.randomUUID?.() ?? `player-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const profile: UserProfile = { id, name, createdAt: now, lastPlayedAt: now, lastGrade: newProfileGrade, characterStyle: newProfileCharacter }
    const data = profileRegistry.profiles.length === 0 ? { schemaVersion: 3 as const, keyStats, collection, completedStageIds: completedCourses, lastStage: selectedStage, problemStats, scoreData, dailyActivity, goals, tutorialCompletedAt, audioSettings: { bgmOn, soundEffectsOn }, typingDisplayCase } : emptyProfileData()
    if (!saveProfileData(id, data)) setStorageError(true)
    setProfileRegistry((registry) => ({ schemaVersion: 1, activeProfileId: id, profiles: [...registry.profiles, profile] }))
    setActiveProfileId(id)
    setProfileLearningData(data)
    setCharacterStyle(newProfileCharacter)
    resetStage(1, true, newProfileGrade)
    setNewProfileName('')
    setProfileError('')
    setStarted(false)
    setShowProfileManager(false)
  }

  const updateActiveProfile = (settings: Pick<UserProfile, 'name' | 'lastGrade' | 'characterStyle'>) => {
    const name = settings.name.trim().replace(/\s+/g, ' ')
    if (!name) return 'なまえを入力してね'
    if (name.length > 12) return 'なまえは12文字までにしてね'
    if (profileRegistry.profiles.some((profile) => profile.id !== activeProfileId && profile.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return '同じなまえのユーザーがいるよ'
    const nextRegistry = { ...profileRegistry, profiles: profileRegistry.profiles.map((profile) => profile.id === activeProfileId ? { ...profile, ...settings, name } : profile) }
    if (!saveProfileRegistry(nextRegistry)) {
      setStorageError(true)
      return '設定を保存できませんでした。もう一度ためしてね'
    }
    setProfileRegistry(nextRegistry)
    setGrade(settings.lastGrade)
    setCharacterStyle(settings.characterStyle)
      setSelectedStage(1)
    return '保存しました'
  }

  const profileCreator = <ProfileCreator name={newProfileName} grade={newProfileGrade} character={newProfileCharacter} error={profileError} onName={(value) => { setNewProfileName(value); setProfileError('') }} onGrade={setNewProfileGrade} onCharacter={setNewProfileCharacter} onCreate={createProfile} />
  const storageWarning = storageError && <div className="storage-warning" role="alert"><b>⚠️ きろくを保存できません</b><span>空き容量やブラウザの設定を確認して、このページを閉じずにおとなの人へ知らせてね。</span><button onClick={() => setStorageError(false)} aria-label="閉じる">×</button></div>

  if (!activeProfile) {
    const entries = profileRegistry.profiles.map((profile) => { const data = loadProfileData(profile.id); return { profile, points: data.scoreData.lifetime, rank: getAdventureRank(data.scoreData.lifetime) } })
    return <><ProfileWelcomePage entries={entries} creator={profileCreator} onSelect={switchProfile} />{storageWarning}</>
  }

  if (showKanaPractice) return <><Suspense fallback={pageFallback}><KanaPracticePage profileId={activeProfile.id} tutorial={!tutorialCompletedAt} displayCase={typingDisplayCase} onDisplayCase={setTypingDisplayCase} onTutorialComplete={() => setTutorialCompletedAt(new Date().toISOString())} onBack={() => setShowKanaPractice(false)} onStartAdventure={() => { setTutorialCompletedAt((value) => value || new Date().toISOString()); resetStage(1); setStarted(true) }} /></Suspense>{storageWarning}</>

  if (showProfileManager) {
    return <><ProfileManagerPage entries={deviceRanking} activeId={activeProfileId} typingDisplayCase={typingDisplayCase} onTypingDisplayCase={setTypingDisplayCase} onBack={() => setShowProfileManager(false)} onSelect={switchProfile} onUpdate={updateActiveProfile} />{storageWarning}</>
  }

  if (showRankGuide) {
    return <><Suspense fallback={pageFallback}><RankGuidePage playerName={activeProfile.name} points={scoreData.lifetime} rank={adventureRank} onBack={() => setShowRankGuide(false)} /></Suspense>{storageWarning}</>
  }

  if (showParentReport) return <><ParentReportPage activity={dailyActivity} goals={goals} keyStats={keyStats} problemStats={problemStats} onGoals={setGoals} onBack={() => setShowParentReport(false)} />{storageWarning}</>

  if (showCollection) {
    return <><Suspense fallback={pageFallback}><CollectionPage collection={collection} points={scoreData.lifetime} tab={collectionTab} setTab={setCollectionTab} onBack={() => setShowCollection(false)} /></Suspense>{storageWarning}</>
  }

  if (showCatalog) {
    return <><Suspense fallback={pageFallback}><CatalogPage problemStats={problemStats} completedStageIds={completedCourses} scoreData={scoreData} onBack={() => setShowCatalog(false)} onStart={startCatalogStage} /></Suspense>{storageWarning}</>
  }

  if (!started) {
    return <><TitlePage profile={activeProfile} grade={grade} character={characterStyle} points={scoreData.lifetime} rank={adventureRank} bgmOn={bgmOn} soundEffectsOn={soundEffectsOn} completedStageIds={completedCourses} goalProgress={goalProgress} tutorialComplete={Boolean(tutorialCompletedAt)} onBgmChange={changeBgm} onSoundEffectsChange={setSoundEffectsOn} onProfiles={() => setShowProfileManager(true)} onRomaji={() => { playSound('key'); setShowKanaPractice(true) }} onStage={(stage) => {
      if (!tutorialCompletedAt) { setShowKanaPractice(true); return }
      playSound('complete')
      resetStage(stage)
      setProfileRegistry((registry) => ({ ...registry, profiles: registry.profiles.map((profile) => profile.id === activeProfileId ? { ...profile, lastPlayedAt: new Date().toISOString() } : profile) }))
      setStarted(true)
    }} onCatalog={() => setShowCatalog(true)} onCollection={() => setShowCollection(true)} onRankGuide={() => setShowRankGuide(true)} onReport={() => setShowParentReport(true)} />{storageWarning}</>
  }

  return (
    <main className={`app-shell${usesJourneyWorld ? ' stage-one-shell' : ''}`} onClick={() => inputRef.current?.focus()}>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">⌨</span><div><strong>ことば島</strong><small>の 大ぼうけん</small></div></div>
        <div className="header-grade-label">おすすめ {grade}年</div>
        <div className="player-stats">
          <button className="exit-stage-button" onClick={(event) => { event.stopPropagation(); resetStage(selectedStage, false); saveCurrentProfileNow(); setStarted(false); setActiveProfileId(null) }}>ゲームを終了</button>
          <button className="header-profile-button" onClick={(event) => { event.stopPropagation(); resetStage(selectedStage, false); setStarted(false); setShowProfileManager(true) }}><span>{characterStyle === 'girl' ? '👧' : '👦'}</span><b>{activeProfile.name}</b></button>
          <button className="header-catalog-button" onClick={(event) => { event.stopPropagation(); setShowCatalog(true) }}>📚 問題一覧</button>
          <button className="header-catalog-button collection-button" onClick={(event) => { event.stopPropagation(); setShowCollection(true) }}>🗺️ 図鑑</button>
          <span className="stat-pill points-pill">✨ <b>{scoreData.lifetime.toLocaleString()}</b><small> GP</small></span>
          <AudioControls className="topbar-audio-controls" bgmOn={bgmOn} soundEffectsOn={soundEffectsOn} onBgmChange={changeBgm} onSoundEffectsChange={setSoundEffectsOn} />
          <FullscreenControl />
          <div className="avatar character-avatar" aria-label={`冒険者 ${characterStyle === 'girl' ? 'ミナ' : 'ソラ'}`}><img src={`/characters/${characterStyle === 'girl' ? 'mina' : 'sora'}.webp`} alt="" decoding="async" /></div>
        </div>
      </header>

      {usesJourneyWorld ? (
        <section className="stage-one-play" aria-label="第1話 3D冒険ステージ">
          <Suspense fallback={<div className="stage-one-scene" aria-label="3D冒険ステージを読み込み中" />}>
            <JourneyWorld stageNumber={selectedStage} journeyProgress={courseProgress} isTyping={typed.length > 0 && !awaitingFinish && !completed} typingPace={journeyTypingPace} reducedMotion={reducedMotion} />
          </Suspense>
          <div className="stage-one-hud" aria-live="polite">
            <div className="stage-one-hud-title"><small>第1話</small><strong>{courseStory.title}</strong><span>{getJourneyLabel(courseProgress)}</span></div>
            <div className="stage-one-hud-progress">
              <span>コース {currentSegmentIndex + 1}/{segmentGroups.length}・問題 {questionIndex + 1}/{questions.length}</span>
              <div role="progressbar" aria-label="このステージの道のり" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(courseProgress * 100)}><i style={{ width: `${courseProgress * 100}%` }} /></div>
              <b>{Math.round(courseProgress * 100)}%</b>
            </div>
            <div className="stage-one-hud-score"><span>ステージ</span><b>{courseScore.toLocaleString()}<small> GP</small></b></div>
          </div>
          <div className="stage-one-typing-overlay">
            <TypingCard question={question} practiceMode={practiceMode} reviewTargetKeys={reviewTargetKeys} typed={typed} displayProgress={displayProgress} inputDisplayProgress={inputDisplayProgress} canonicalRomaji={canonicalRomaji} notice={notice} awaitingFinish={awaitingFinish} combo={combo} currentChar={currentChar} nextKeyOptions={nextKeyOptions} displayCase={typingDisplayCase} inputRef={inputRef} onTyped={setTyped} onEnter={enterCharacters} onDisplayCase={setTypingDisplayCase} />
          </div>
        </section>
      ) : <div className="world-layout">
        <CourseMap grade={storyGrade} selectedCourse={selectedCourse} completedCourses={chapterCompletedCourses} questionIndex={questionIndex} questionCount={questions.length} />

        <section className="game-area">
          <div className="stage-hud panel">
          <div className={`stage-title ${practiceMode === 'weak-keys' ? 'practice-title' : ''}`}><div><span>{practiceMode === 'weak-keys' ? `🎯 苦手キー「${reviewTargetKeys.join('・')}」を特訓中` : `第${selectedStage}話・第${storyGrade}章　${gradeStory.chapterTitle}`}</span><h1>{practiceMode === 'weak-keys' ? 'にがてキー特訓' : courseStory.title}</h1>{practiceMode === 'adventure' && <p className="stage-theme-description">🎯 {courseStory.objective}　<span>{courseStory.intro}</span></p>}</div><div className="xp-wrap">{practiceMode === 'weak-keys' && <button className="leave-practice" onClick={(event) => { event.stopPropagation(); resetStage(selectedStage, false) }}>通常モードへ</button>}{practiceMode === 'adventure' && segmentGroups.length > 1 && <span>コース {currentSegmentIndex + 1}/{segmentGroups.length}・問題 {currentSegmentQuestionIndex + 1}/{currentSegmentQuestions.length}</span>}<span>ステージ全体 {questionIndex + 1}/{questions.length}</span><div className="xp-bar"><i style={{ width: `${(questionIndex + 1) / questions.length * 100}%` }} /></div><b>{questionIndex + 1}/{questions.length}</b></div></div>
          <div className="course-score-hud"><div><span>今回のステージスコア</span><b>{courseScore.toLocaleString()}<small> GP</small></b></div><div><span>ステージベスト</span><b>{currentCourseBest.toLocaleString()}<small> GP</small></b></div><div><span>発見ボーナス</span><b>+{runBonus.toLocaleString()}<small> GP</small></b></div>{lastScore && <div className="last-score-chip"><span>直前の問題</span><b>+{lastScore.total.toLocaleString()}</b><small>正確さ {lastScore.accuracy}%・{lastScore.kpm} KPM</small></div>}</div>
          </div>
          <AdventureScenes stageIndex={stageIndex} action={adventureAction} event={adventureEvent} reward={adventureReward} trailTreasure={trailTreasure} character={characterStyle} stageWalked={stageWalked} stepQueue={stepQueue} stepDelay={stepDelay} courseProgress={courseProgress} walkPercent={walkPercent} sentenceProgress={sentenceProgress} awaitingFinish={awaitingFinish} />
          <TypingCard question={question} practiceMode={practiceMode} reviewTargetKeys={reviewTargetKeys} typed={typed} displayProgress={displayProgress} inputDisplayProgress={inputDisplayProgress} canonicalRomaji={canonicalRomaji} notice={notice} awaitingFinish={awaitingFinish} combo={combo} currentChar={currentChar} nextKeyOptions={nextKeyOptions} displayCase={typingDisplayCase} inputRef={inputRef} onTyped={setTyped} onEnter={enterCharacters} onDisplayCase={setTypingDisplayCase} />
          <div className="tip"><span>💡</span><p><b>ローマ字ヒント</b>　「し」は <kbd>s</kbd> <kbd>h</kbd> <kbd>i</kbd> の順に入力するよ</p></div>
        </section>

        <GameSidePanel collection={collection} creatureCount={creatureCount} treasureCount={treasureCount} mistakeCount={mistakes.length} weakKey={weakKeyStats[0]} totalKeyAttempts={totalKeyAttempts} accuracy={accuracy} onCollection={(tab) => { setCollectionTab(tab); setShowCollection(true) }} onReview={() => setShowReview(true)} onStats={() => setShowKeyStats(true)} />
      </div>}

      {showReview && <ReviewModal mistakes={mistakes} onClose={() => setShowReview(false)} onRetry={() => { setShowReview(false); setTyped(''); setNotice(null) }} />}
      {showKeyStats && <KeyStatsModal grade={grade} totalAttempts={totalKeyAttempts} strongKeys={strongKeyStats} weakKeys={weakKeyStats} onClose={() => setShowKeyStats(false)} onPractice={startWeakKeyPractice} />}
      {rewardAwaitingConfirmation && adventureEvent && adventureReward && <RewardDiscoveryModal reward={adventureReward} score={lastScore} onConfirm={advanceAfterEvent} />}
      {completed && <CourseClearModal practiceMode={practiceMode} reviewTargetKeys={reviewTargetKeys} segmentClear={practiceMode === 'adventure' && !isFinalStageQuestion} segmentNumber={currentSegmentIndex + 1} segmentCount={segmentGroups.length} fullyCompleted={selectedCourseFullyCompleted} grade={storyGrade} course={selectedStage === 36 ? 6 : 5} storyCompletion={courseStory.completion} chapterFinale={selectedCourse === 6 ? gradeStory.finale : ''} courseScore={courseScore} runBonus={runBonus} accuracy={accuracy} attempts={runAttempts} misses={runMisses} strongKeys={runStrongKeys} weakKeys={runWeakKeys} creatureCount={creatureCount} treasureCount={treasureCount} lifetimePoints={scoreData.lifetime} onContinue={continueAfterCourseClear} />}
      {storageWarning}
    </main>
  )
}

export default App
