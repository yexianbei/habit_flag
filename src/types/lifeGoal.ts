/*
 * @description: 心愿岛 · 人生目标类型
 */

export type LifeGoalStatus = 'ongoing' | 'completed' | 'archived'

/** 岛屿气候 / 氛围 */
export type CoverMood = 'sakura' | 'mint' | 'sky' | 'lemon' | 'lilac'

export interface Milestone {
  id: string
  name: string
  targetDate?: string
  done: boolean
  doneAt?: string
}

export interface Journal {
  id: string
  date: string
  text: string
  progressSnapshot?: number
  image?: string
  milestoneId?: string
}

export interface LifeGoal {
  id: string
  title: string
  vision: string
  coverMood: CoverMood
  targetDate?: string
  status: LifeGoalStatus
  feelProgress?: number
  milestones: Milestone[]
  journals: Journal[]
  createdAt: string
  updatedAt: string
}

export interface CreateLifeGoalPayload {
  title: string
  vision: string
  coverMood: CoverMood
  targetDate?: string
  milestones: Array<{ name: string; targetDate?: string }>
}

export interface LogStepPayload {
  goalId: string
  text?: string
  image?: string
  completeMilestoneId?: string
  feelProgress?: number
}

export const MAX_ONGOING_GOALS = 3
export const MILESTONE_MIN = 3
export const MILESTONE_MAX = 7

export const DEFAULT_MILESTONE_TEMPLATE = ['播下种子', '冒出新芽', '抽出枝条', '第一朵花', '结出果实']

export type GrowthStage = {
  id: string
  label: string
  min: number
  emoji: string
}

export const GROWTH_STAGES: GrowthStage[] = [
  { id: 'seed', label: '种子', min: 0, emoji: '🌱' },
  { id: 'sprout', label: '萌芽', min: 20, emoji: '🌿' },
  { id: 'branch', label: '抽枝', min: 40, emoji: '🪴' },
  { id: 'bloom', label: '开花', min: 65, emoji: '🌸' },
  { id: 'fruit', label: '结果', min: 90, emoji: '✨' },
]

export const COVER_MOODS: Array<{
  id: CoverMood
  label: string
  color: string
  soft: string
  leaf: number
  soil: number
}> = [
  { id: 'sakura', label: '樱风', color: '#F2A6B8', soft: '#FFF5F8', leaf: 0xf2a6b8, soil: 0xe8c4a8 },
  { id: 'mint', label: '薄荷', color: '#7BC9A6', soft: '#F0FAF5', leaf: 0x7bc9a6, soil: 0xd4c4a8 },
  { id: 'sky', label: '晴空', color: '#7EB6E8', soft: '#F2F8FD', leaf: 0x6bb0a0, soil: 0xd9c9a5 },
  { id: 'lemon', label: '柠檬', color: '#E8C96A', soft: '#FFFBF0', leaf: 0x9bc96b, soil: 0xe0d0a0 },
  { id: 'lilac', label: '丁香', color: '#B5A3E0', soft: '#F7F4FC', leaf: 0x9b8ec9, soil: 0xd8c8b0 },
]

export function getMoodMeta(mood: CoverMood) {
  return COVER_MOODS.find((m) => m.id === mood) || COVER_MOODS[1]
}

export function calcMilestoneProgress(goal: LifeGoal): number {
  const total = goal.milestones.length
  if (!total) return goal.feelProgress || 0
  const done = goal.milestones.filter((m) => m.done).length
  const byMilestone = Math.round((done / total) * 100)
  const feel = goal.feelProgress ?? 0
  return Math.max(byMilestone, feel)
}

export function currentMilestoneIndex(goal: LifeGoal): number {
  const idx = goal.milestones.findIndex((m) => !m.done)
  return idx === -1 ? goal.milestones.length - 1 : idx
}

export function getGrowthStage(progress: number): GrowthStage {
  let cur = GROWTH_STAGES[0]
  for (const s of GROWTH_STAGES) {
    if (progress >= s.min) cur = s
  }
  return cur
}

/** 浇灌次数 ≈ 足迹数，用于游戏化展示 */
export function getWaterCount(goal: LifeGoal): number {
  return goal.journals.length
}

export function getXp(goal: LifeGoal): number {
  const base = calcMilestoneProgress(goal)
  return base + getWaterCount(goal) * 3
}
