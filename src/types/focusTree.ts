/*
 * @description: 专注森林 · 类型与常量
 */

export type TreeStage = 'seed' | 'sprout' | 'grow' | 'mid' | 'bloom' | 'fruit'
export type TreeHealthState = 'healthy' | 'withering' | 'dead'
export type Rarity = 'common' | 'rare' | 'epic'

export interface TreeSpecies {
  id: string
  name: string
  desc: string
  rarity: Rarity
  canFruit: boolean
  /** 每阶段所需养护进度值 */
  stageNeed: number
  /** 枯萎衰减倍率 */
  witherRate: number
  /** 主题色 */
  hue: string
  leaf: string
}

export interface CareMeters {
  /** 0–100 水分 */
  water: number
  /** 0–100 肥力 */
  fertilizer: number
  /** 0–100 杂草严重度，越高越差 */
  weed: number
}

/** 当前阶段三项养护的完成次数 */
export interface StageCare {
  water: number
  fertilizer: number
  weed: number
}

export interface ActiveTree {
  id: string
  speciesId: string
  stage: TreeStage
  /** 兼容旧字段：当前阶段已完成的养护项数（取三项最小值） */
  stageProgress: number
  /** 当前阶段三项养护完成次数 */
  stageCare: StageCare
  /** 由三项状态推导出的活力值（0–100） */
  health: number
  meters: CareMeters
  healthState: TreeHealthState
  plantedAt: string
  lastTickAt: string
  lastCareAt: string
}

/** 当天三项养护的已用次数 */
export interface DailyCare {
  /** 本地日期 YYYY-MM-DD */
  date: string
  water: number
  fertilizer: number
  weed: number
}

export interface Inventory {
  waterDrop: number
  fertilizer: number
  herbicide: number
}

export interface ForestEntry {
  speciesId: string
  collectedAt: string
  finalStage: TreeStage
  times: number
}

/** App 专注页回传的结果（本模块不负责计时 UI） */
export type FocusResultStatus = 'completed' | 'interrupted'

export interface FocusResultPayload {
  /** 实际专注分钟数 */
  minutes: number
  status: FocusResultStatus
}

export interface FocusSession {
  id: string
  minutes: number
  startedAt: string
  endedAt?: string
  status: FocusResultStatus
}

export interface ForestState {
  activeTree: ActiveTree | null
  inventory: Inventory
  forest: ForestEntry[]
  /** App 回传的专注结果记录 */
  focusHistory: FocusSession[]
  /** 当日已用养护次数（跨天归零） */
  dailyCare: DailyCare
  updatedAt: string
}

export const STAGE_ORDER: TreeStage[] = [
  'seed',
  'sprout',
  'grow',
  'mid',
  'bloom',
  'fruit',
]

export const STAGE_LABEL: Record<TreeStage, string> = {
  seed: '种子',
  sprout: '发芽',
  grow: '小树',
  mid: '中等树',
  bloom: '大树',
  fruit: '苍天大树',
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: '常见',
  rare: '稀有',
  epic: '珍稀',
}

/** 测试阶段默认努力值（客户端未注入时使用） */
export const TEST_EFFORT_DEFAULT = 99999

/** 各阶段难度：需求倍率 / 衰减倍率 / 养护成长效率 */
export const STAGE_DIFFICULTY: Record<
  TreeStage,
  { needMult: number; decayMult: number; growthMult: number }
> = {
  seed: { needMult: 1, decayMult: 0.85, growthMult: 1.2 },
  sprout: { needMult: 1.25, decayMult: 0.95, growthMult: 1.1 },
  grow: { needMult: 1.55, decayMult: 1.15, growthMult: 0.95 },
  mid: { needMult: 1.95, decayMult: 1.35, growthMult: 0.8 },
  bloom: { needMult: 2.5, decayMult: 1.6, growthMult: 0.65 },
  fruit: { needMult: 3.3, decayMult: 1.95, growthMult: 0.5 },
}

export type ShopItemId = 'waterDrop' | 'fertilizer' | 'herbicide'

export interface ShopGoods {
  id: ShopItemId
  name: string
  unit: string
  /** 单价（努力值） */
  price: number
  /** 每次购买数量 */
  amount: number
  desc: string
}

/** 商店：水滴 / 肥料 / 除草均需努力值购买 */
export const SHOP_GOODS: ShopGoods[] = [
  {
    id: 'waterDrop',
    name: '水滴',
    unit: '滴',
    price: 8,
    amount: 1,
    desc: '补充水分，防止干枯',
  },
  {
    id: 'fertilizer',
    name: '肥料',
    unit: '袋',
    price: 12,
    amount: 1,
    desc: '提升肥力，加快生长',
  },
  {
    id: 'herbicide',
    name: '除草剂',
    unit: '份',
    price: 10,
    amount: 1,
    desc: '清理杂草，稳住树势',
  },
]

/** @deprecated 保留兼容，请用商店购买 */
export const EFFORT_PER_DROP = 8
export const EXCHANGE_DROP_AMOUNT = 1

export function getStageNeed(baseNeed: number, stage: TreeStage): number {
  return Math.round(baseNeed * STAGE_DIFFICULTY[stage].needMult)
}

/**
 * 每日养护上限：浇水 2 次（第 2 次作追赶容错）、施肥 1 次、除草 1 次。
 */
export const DAILY_CARE_LIMIT: StageCare = {
  water: 2,
  fertilizer: 1,
  weed: 1,
}

/**
 * 每个阶段的“天数”配额：每天做满上限，经过这些天数三项同时做满 → 进阶。
 * 不可结果树种 5 阶段：3+5+6+7+7 = 28 天；
 * 可结果树种 6 阶段：2+4+5+5+6+6 = 28 天。
 * 均从第 28 天收成（正常养护）。
 */
export const STAGE_DAYS: {
  noFruit: Record<'seed' | 'sprout' | 'grow' | 'mid' | 'bloom', number>
  fruit: Record<TreeStage, number>
} = {
  noFruit: { seed: 3, sprout: 5, grow: 6, mid: 7, bloom: 7 },
  fruit: { seed: 2, sprout: 4, grow: 5, mid: 5, bloom: 6, fruit: 6 },
}

/** 某阶段三项养护的达标次数（三项相同，均为该阶段天数） */
export function getStageCareQuota(
  stage: TreeStage,
  canFruit: boolean
): number {
  return canFruit ? STAGE_DAYS.fruit[stage] : STAGE_DAYS.noFruit[stage as keyof typeof STAGE_DAYS.noFruit]
}

/** 正常养护下从种植到收成的总天数 */
export const MATURE_DAYS = 28

export function emptyStageCare(): StageCare {
  return { water: 0, fertilizer: 0, weed: 0 }
}

export function emptyDailyCare(date: string): DailyCare {
  return { date, water: 0, fertilizer: 0, weed: 0 }
}

/**
 * 衰退参数：改为按天衰减（原 2 小时制与 28 天周期冲突，已弃用）。
 * 状态满值 100；不做养护时约 4 天触底（乘物种倍率后 3–5 天）。
 * 每天做满养护即可维持，任一项到 0（water/fertilizer 归零、weed 满格）即枯萎。
 */
export const DECAY = {
  /** 每天流失（新种三项从满值起，约 4 天触底，再乘物种倍率） */
  waterPerDay: 25,
  fertilizerPerDay: 25,
  weedPerDay: 25,
  /** 衰退期告警线：任一项越过则该树进入“衰退中” */
  warnWater: 30,
  warnFertilizer: 30,
  warnWeed: 70,
}

export const TREE_SPECIES: TreeSpecies[] = [
  {
    id: 'qingtong',
    name: '青桐',
    desc: '清风里的第一棵树，稳稳发芽。',
    rarity: 'common',
    canFruit: false,
    stageNeed: 20,
    witherRate: 1,
    hue: '#5a9e6f',
    leaf: '#6bbf7a',
  },
  {
    id: 'ying',
    name: '樱',
    desc: '短暂而盛大的花期，专注才更珍贵。',
    rarity: 'rare',
    canFruit: false,
    stageNeed: 28,
    witherRate: 1.15,
    hue: '#e8a0b4',
    leaf: '#f2b8c6',
  },
  {
    id: 'yinxing',
    name: '银杏',
    desc: '金扇摇曳，慢生却长久。',
    rarity: 'rare',
    canFruit: true,
    stageNeed: 30,
    witherRate: 0.9,
    hue: '#d4a84b',
    leaf: '#e8c05a',
  },
  {
    id: 'song',
    name: '松',
    desc: '耐寒常青，中断也会咬牙撑住。',
    rarity: 'common',
    canFruit: false,
    stageNeed: 22,
    witherRate: 0.75,
    hue: '#3d6b4f',
    leaf: '#4a8a5e',
  },
  {
    id: 'ningmeng',
    name: '柠檬',
    desc: '酸甜果实，专注收成看得见。',
    rarity: 'common',
    canFruit: true,
    stageNeed: 24,
    witherRate: 1.1,
    hue: '#c9c44a',
    leaf: '#a8c95a',
  },
  {
    id: 'ziteng',
    name: '紫藤',
    desc: '藤蔓攀缘，开花时一整片天空。',
    rarity: 'epic',
    canFruit: false,
    stageNeed: 36,
    witherRate: 1.2,
    hue: '#7a6bb5',
    leaf: '#8f7ec9',
  },
  {
    id: 'feng',
    name: '枫',
    desc: '层林尽染，坚持会染红整片园子。',
    rarity: 'rare',
    canFruit: false,
    stageNeed: 26,
    witherRate: 1.05,
    hue: '#c45a3a',
    leaf: '#d96a48',
  },
  {
    id: 'zhu',
    name: '竹',
    desc: '节节高升，每一次专注都长一节。',
    rarity: 'common',
    canFruit: false,
    stageNeed: 18,
    witherRate: 0.95,
    hue: '#4a8f5c',
    leaf: '#5cb370',
  },
]

export function getSpecies(id: string): TreeSpecies | undefined {
  return TREE_SPECIES.find((s) => s.id === id)
}

export function nextStage(stage: TreeStage, canFruit: boolean): TreeStage | null {
  if (stage === 'fruit') return null
  // 大树之后：可结果物种进入苍天；其余在大树收成
  if (stage === 'bloom') return canFruit ? 'fruit' : null
  const idx = STAGE_ORDER.indexOf(stage)
  return STAGE_ORDER[idx + 1] || null
}

export function isMatureStage(stage: TreeStage): boolean {
  return stage === 'bloom' || stage === 'fruit'
}

declare global {
  interface Window {
    __HABIT_CLIENT__?: {
      effort?: number
      /** App 注入，用于种树云端同步 */
      dailyUserId?: string
      /** 可选覆盖云函数入口，默认 agent.xianbeikeji.com/forest */
      forestCloudUrl?: string
    }
    /** Android BrowserX5 注入：努力值扣款与账本 */
    HabitForest?: {
      getEffort?: () => string | number
      /**
       * Native 扣努力值并写 Wish 兑换记录
       * @returns JSON 字符串 { ok, effort, message? }
       */
      spendEffort?: (
        cost: number,
        itemId: string,
        name: string,
        count: number,
      ) => string
    }
    __HABIT_FOREST__?: {
      onCheckInFail?: () => void
      onCheckInSuccess?: () => void
      setEffort?: (n: number) => void
      getEffort?: () => number
      /** App 专注完成：传入实际分钟数 */
      onFocusComplete?: (minutes: number) => void
      /** App 专注中断：可选传入已专注分钟数 */
      onFocusInterrupt?: (minutes?: number) => void
      /** 统一回传专注结果 */
      applyFocusResult?: (payload: {
        minutes: number
        status: 'completed' | 'interrupted'
      }) => void
    }
  }
}
