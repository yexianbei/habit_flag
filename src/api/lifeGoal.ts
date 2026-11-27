/*
 * @description: 人生目标 API（独立于 Flag）
 * 当前以 localStorage 持久化，接口形态与后续服务端对齐，便于替换实现。
 */
import {
  CreateLifeGoalPayload,
  LifeGoal,
  LogStepPayload,
  MAX_ONGOING_GOALS,
  Milestone,
  Journal,
} from '../types/lifeGoal'

const STORAGE_KEY = 'habit_life_goals_v1'

function uid(prefix = 'lg') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function readAll(): LifeGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch (e) {
    console.error('读取人生目标失败', e)
    return []
  }
}

function writeAll(list: LifeGoal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function ok<T>(data: T) {
  return Promise.resolve({ code: 0, data, message: 'ok' })
}

function fail(message: string, code = 1) {
  return Promise.reject({ code, message, data: null })
}

/** 列表：进行中优先，再按更新时间 */
export function listLifeGoals() {
  const list = readAll().sort((a, b) => {
    if (a.status === 'ongoing' && b.status !== 'ongoing') return -1
    if (b.status === 'ongoing' && a.status !== 'ongoing') return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
  return ok(list)
}

export function getLifeGoal(id: string) {
  const goal = readAll().find((g) => g.id === id)
  if (!goal) return fail('目标不存在', 404)
  return ok(goal)
}

export function createLifeGoal(payload: CreateLifeGoalPayload) {
  const list = readAll()
  const ongoing = list.filter((g) => g.status === 'ongoing').length
  if (ongoing >= MAX_ONGOING_GOALS) {
    return fail(`进行中目标最多 ${MAX_ONGOING_GOALS} 个`)
  }
  if (!payload.title?.trim()) return fail('请填写目标名称')
  if (!payload.milestones?.length) return fail('请至少添加一个里程碑')

  const now = new Date().toISOString()
  const milestones: Milestone[] = payload.milestones.map((m) => ({
    id: uid('ms'),
    name: m.name.trim(),
    targetDate: m.targetDate,
    done: false,
  }))

  const goal: LifeGoal = {
    id: uid('goal'),
    title: payload.title.trim(),
    vision: (payload.vision || '').trim(),
    coverMood: payload.coverMood || 'sunrise',
    targetDate: payload.targetDate,
    status: 'ongoing',
    feelProgress: 0,
    milestones,
    journals: [],
    createdAt: now,
    updatedAt: now,
  }

  list.unshift(goal)
  writeAll(list)
  return ok(goal)
}

export function updateLifeGoal(id: string, patch: Partial<LifeGoal>) {
  const list = readAll()
  const idx = list.findIndex((g) => g.id === id)
  if (idx < 0) return fail('目标不存在', 404)
  const next = {
    ...list[idx],
    ...patch,
    id: list[idx].id,
    updatedAt: new Date().toISOString(),
  }
  list[idx] = next
  writeAll(list)
  return ok(next)
}

export function deleteLifeGoal(id: string) {
  const list = readAll().filter((g) => g.id !== id)
  writeAll(list)
  return ok(true)
}

/** 记录一步：想法 + 可选完成里程碑 / 感觉进度 */
export function logLifeGoalStep(payload: LogStepPayload) {
  const list = readAll()
  const idx = list.findIndex((g) => g.id === payload.goalId)
  if (idx < 0) return fail('目标不存在', 404)

  const goal = { ...list[idx] }
  const now = new Date().toISOString()
  let completedMilestone: Milestone | null = null

  if (payload.completeMilestoneId) {
    goal.milestones = goal.milestones.map((m) => {
      if (m.id === payload.completeMilestoneId && !m.done) {
        completedMilestone = { ...m, done: true, doneAt: now }
        return completedMilestone
      }
      return m
    })
  }

  if (typeof payload.feelProgress === 'number') {
    goal.feelProgress = Math.max(0, Math.min(100, Math.round(payload.feelProgress)))
  }

  const allDone = goal.milestones.length > 0 && goal.milestones.every((m) => m.done)
  if (allDone) {
    goal.status = 'completed'
    goal.feelProgress = 100
  }

  const hasText = !!(payload.text && payload.text.trim())
  const hasImage = !!payload.image
  const shouldJournal = hasText || hasImage || !!completedMilestone

  let journal: Journal | null = null
  if (shouldJournal) {
    const doneCount = goal.milestones.filter((m) => m.done).length
    const progressSnapshot =
      goal.milestones.length > 0
        ? Math.round((doneCount / goal.milestones.length) * 100)
        : goal.feelProgress || 0

    journal = {
      id: uid('j'),
      date: now,
      text: (payload.text || '').trim() || (completedMilestone ? `抵达「${(completedMilestone as Milestone).name}」` : '推进了一步'),
      progressSnapshot,
      image: payload.image,
      milestoneId: completedMilestone ? (completedMilestone as Milestone).id : undefined,
    }
    goal.journals = [journal, ...goal.journals]
  }

  goal.updatedAt = now
  list[idx] = goal
  writeAll(list)

  return ok({
    goal,
    journal,
    completedMilestone,
    justCompleted: allDone,
  })
}

/** 切换单个里程碑完成状态（详情页直接勾选） */
export function toggleMilestone(goalId: string, milestoneId: string, done: boolean) {
  if (done) {
    return logLifeGoalStep({ goalId, completeMilestoneId: milestoneId })
  }
  const list = readAll()
  const idx = list.findIndex((g) => g.id === goalId)
  if (idx < 0) return fail('目标不存在', 404)
  const goal = { ...list[idx] }
  goal.milestones = goal.milestones.map((m) =>
    m.id === milestoneId ? { ...m, done: false, doneAt: undefined } : m
  )
  if (goal.status === 'completed') goal.status = 'ongoing'
  goal.updatedAt = new Date().toISOString()
  list[idx] = goal
  writeAll(list)
  return ok({ goal, journal: null, completedMilestone: null, justCompleted: false })
}
