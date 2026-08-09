import { STAGE_ONE_ROUTE_V2_ANCHORS } from './stageOneRouteV2'

export const JOURNEY_ANCHORS = STAGE_ONE_ROUTE_V2_ANCHORS.map(({ progress, displayLabel: label }) => ({ progress, label }))

export function clampJourneyProgress(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
}

export function getJourneyLabel(value: number) {
  const progress = clampJourneyProgress(value)
  return JOURNEY_ANCHORS.reduce((nearest, anchor) =>
    Math.abs(anchor.progress - progress) < Math.abs(nearest.progress - progress) ? anchor : nearest,
  ).label
}
