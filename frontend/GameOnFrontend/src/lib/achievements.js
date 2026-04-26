export const ACHIEVEMENT_TARGETS = [5, 10, 25, 50, 100]

const ACHIEVEMENT_LABELS = {
  5: 'New born reviewer',
  10: 'Beginner reviewer',
  25: 'Amateur reviewer',
  50: 'Professional reviewer',
  100: 'Certified Critique',
}

export const getAchievementLabel = (target) => {
  if (!target) return 'All achievements complete'
  return ACHIEVEMENT_LABELS[target] ?? `${target} reviews`
}

export const getLatestAchievementTarget = (reviewCount = 0) => {
  const count = Number(reviewCount) || 0
  let latest = null

  ACHIEVEMENT_TARGETS.forEach((target) => {
    if (count >= target) latest = target
  })

  return latest
}

export const getNextAchievementTarget = (reviewCount = 0) => {
  const count = Number(reviewCount) || 0
  return ACHIEVEMENT_TARGETS.find((target) => target > count) ?? null
}

export const getVisibleAchievementTargets = (reviewCount = 0) => {
  const count = Number(reviewCount) || 0
  const completed = ACHIEVEMENT_TARGETS.filter((target) => target <= count)
  const next = ACHIEVEMENT_TARGETS.find((target) => target > count)

  return next ? [...completed, next] : completed
}

export const getAchievementProgress = (reviewCount = 0) => {
  const count = Number(reviewCount) || 0
  const nextTarget = getNextAchievementTarget(count)

  if (!nextTarget) {
    return {
      previousTarget: ACHIEVEMENT_TARGETS[ACHIEVEMENT_TARGETS.length - 1],
      nextTarget: null,
      progressRatio: 1,
      remaining: 0,
    }
  }

  const previousTarget = [...ACHIEVEMENT_TARGETS].reverse().find((target) => target < nextTarget) ?? 0
  const segmentSize = nextTarget - previousTarget
  const completedInSegment = Math.max(0, Math.min(segmentSize, count - previousTarget))
  const progressRatio = segmentSize > 0 ? completedInSegment / segmentSize : 0

  return {
    previousTarget,
    nextTarget,
    progressRatio,
    remaining: Math.max(0, nextTarget - count),
  }
}
