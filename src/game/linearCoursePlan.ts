import type { LinearStageNumber } from './linearStageConfig'

export type LinearCoursePlan = {
  readonly questionCounts: readonly number[]
  readonly anchorIds: readonly string[]
}

const PLANS_1_TO_12: readonly LinearCoursePlan[] = [
  { questionCounts: [7, 7, 7, 7, 8, 8, 8], anchorIds: ['arrival', 'flower-slope', 'tracks', 'seed-glow', 'seed-restored', 'forest-edge', 'rabbit-creek-bridge'] },
  { questionCounts: [7, 8, 8, 8, 8], anchorIds: ['creek-bridge', 'tree-hollow', 'feather-sign', 'forest-thins', 'star-gate'] },
  { questionCounts: [8, 8, 8, 8, 8, 8, 8], anchorIds: ['star-gate', 'foothold', 'observatory', 'two-winds', 'seed-descends', 'valley-descent', 'river-mouth'] },
  { questionCounts: [7, 7, 7, 7], anchorIds: ['river-mouth', 'seagrass-animal', 'ripple-seed', 'root-gate'] },
  { questionCounts: [8, 8, 8], anchorIds: ['root-gate-spring', 'three-seeds-moonlight', 'light-root-ascent'] },
  { questionCounts: [7, 7, 7, 8, 8, 8, 8], anchorIds: ['ascent-root', 'rime-steps', 'dry-garden', 'sowing', 'waterway', 'map-restored', 'descent-route'] },
  { questionCounts: [7, 7, 7, 7, 7, 7, 7], anchorIds: ['meadow-return', 'still-windmill', 'flag', 'flower-dew', 'fox', 'wind-record', 'forest-boundary'] },
  { questionCounts: [7, 8, 8, 8, 8], anchorIds: ['forest-return', 'hollow-sounds', 'blocked-vent', 'wind-restored', 'mountain-boundary'] },
  { questionCounts: [7, 7, 7, 7, 7, 7, 7, 8], anchorIds: ['pass', 'goat-foothold', 'broken-vane', 'strong-weak-wind', 'two-winds', 'vane-restored', 'valley-descent', 'sea-platform'] },
  { questionCounts: [7, 7, 7, 7], anchorIds: ['calm-bay', 'dolphin-windline', 'sail-windmill', 'air-root'] },
  { questionCounts: [8, 8, 8], anchorIds: ['air-root-map', 'six-winds-restored', 'windmill-ascent'] },
  { questionCounts: [8, 8, 8], anchorIds: ['six-winds-eagle', 'windmill-turns', 'missing-stars'] },
]

const FALLBACK_PLAN: LinearCoursePlan = { questionCounts: [6, 6, 6], anchorIds: ['arrival', 'discovery', 'boundary'] }

export const linearCoursePlanForStage = (stage: LinearStageNumber): LinearCoursePlan =>
  PLANS_1_TO_12[stage - 1] ?? FALLBACK_PLAN

export const targetQuestionCountForStage = (stage: LinearStageNumber) =>
  linearCoursePlanForStage(stage).questionCounts.reduce((total, count) => total + count, 0)
