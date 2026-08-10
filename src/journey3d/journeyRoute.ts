import { STAGE_ONE_ROUTE_V2_ANCHORS } from './stageOneRouteV2'

export const JOURNEY_ANCHORS = STAGE_ONE_ROUTE_V2_ANCHORS.map(({ progress, displayLabel: label }) => ({ progress, label }))
export const STAGE_TWO_JOURNEY_ANCHORS = ['小川の橋', '湿った支流', '樹洞の段丘', '倒木の抜け', '雲霧林の肩', '星見門'].map((label, index) => ({ progress: index / 5, label }))

export function clampJourneyProgress(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
}

export function getJourneyLabel(value: number) {
  const progress = clampJourneyProgress(value)
  return JOURNEY_ANCHORS.reduce((nearest, anchor) =>
    Math.abs(anchor.progress - progress) < Math.abs(nearest.progress - progress) ? anchor : nearest,
  ).label
}

export function getStageJourneyLabel(stageNumber: number, value: number) {
  const progress = clampJourneyProgress(value)
  const anchors = stageNumber === 2 ? STAGE_TWO_JOURNEY_ANCHORS : JOURNEY_ANCHORS
  return anchors.reduce((nearest, anchor) =>
    Math.abs(anchor.progress - progress) < Math.abs(nearest.progress - progress) ? anchor : nearest,
  ).label
}
