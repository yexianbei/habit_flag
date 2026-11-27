/*
 * @description: 专注森林 API（localStorage）
 * 道具通过商店用努力值购买；测试阶段默认给予充足努力值。
 */
import {
  ActiveTree,
  CareMeters,
  DAILY_CARE_LIMIT,
  DECAY,
  DailyCare,
  FocusResultPayload,
  ForestEntry,
  ForestState,
  Inventory,
  MATURE_DAYS,
  SHOP_GOODS,
  STAGE_DIFFICULTY,
  ShopItemId,
  TreeHealthState,
  TEST_EFFORT_DEFAULT,
  TREE_SPECIES,
  TreeSpecies,
  emptyDailyCare,
  emptyStageCare,
  getSpecies,
  getStageCareQuota,
  isMatureStage,
  nextStage,
} from '../types/focusTree'

const STORAGE_KEY = 'habit_focus_forest_v2'
const EFFORT_KEY = 'habit_focus_effort_v1'

/** 内存中的努力值 */
let clientEffort: number | null = null
let bridgeReady = false
let effortBootstrapped = false

function uid(prefix = 'ft') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** 本地日期 YYYY-MM-DD（避免 toISOString 的 UTC 时区偏移） */
function localDate(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function ok<T>(data: T) {
  return Promise.resolve({ code: 0, data, message: 'ok' })
}

function fail(message: string, code = 1) {
  return Promise.reject({ code, message, data: null })
}

/** 测试阶段：开局无赠送道具，均需商店购买 */
function defaultInventory(): Inventory {
  return { waterDrop: 0, fertilizer: 0, herbicide: 0 }
}

function defaultState(): ForestState {
  const now = new Date().toISOString()
  return {
    activeTree: null,
    inventory: defaultInventory(),
    forest: [],
    focusHistory: [],
    dailyCare: emptyDailyCare(localDate()),
    updatedAt: now,
  }
}

function readState(): ForestState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw)
    const state: ForestState = {
      ...defaultState(),
      ...parsed,
      inventory: { ...defaultInventory(), ...(parsed.inventory || {}) },
      forest: Array.isArray(parsed.forest) ? parsed.forest : [],
      focusHistory: Array.isArray(parsed.focusHistory) ? parsed.focusHistory : [],
    }
    // 兼容旧存档：补上阶段养护计数
    if (state.activeTree && !state.activeTree.stageCare) {
      state.activeTree = {
        ...state.activeTree,
        stageCare: emptyStageCare(),
        stageProgress: 0,
      }
    }
    // 兼容旧存档 + 跨天归零当日次数
    const today = localDate()
    const prev = state.dailyCare as DailyCare | undefined
    state.dailyCare =
      prev && prev.date === today
        ? { ...prev }
        : emptyDailyCare(today)
    return state
  } catch (e) {
    console.error('读取专注森林失败', e)
    return defaultState()
  }
}

function writeState(state: ForestState) {
  state.updatedAt = new Date().toISOString()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function readStoredEffort(): number | null {
  try {
    const raw = localStorage.getItem(EFFORT_KEY)
    if (raw == null || raw === '') return null
    const n = Number(raw)
    return Number.isNaN(n) ? null : Math.max(0, Math.floor(n))
  } catch {
    return null
  }
}

function writeStoredEffort(n: number) {
  localStorage.setItem(EFFORT_KEY, String(Math.max(0, Math.floor(n))))
}

/** App WebView 是否注入了 HabitForest 桥（努力值以 Native 为准） */
function hasNativeForestBridge(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.HabitForest?.spendEffort === 'function'
  )
}

function readNativeEffort(): number | null {
  if (!hasNativeForestBridge()) return null
  try {
    const raw = window.HabitForest?.getEffort?.()
    const n = Number(raw)
    if (!Number.isNaN(n)) return Math.max(0, Math.floor(n))
  } catch {
    /* ignore */
  }
  return null
}

/** 启动时注入努力值：优先 App / URL；有 Native 桥时不用测试默认值 */
function bootstrapTestEffort() {
  if (effortBootstrapped || typeof window === 'undefined') return
  effortBootstrapped = true

  const fromWin = window.__HABIT_CLIENT__?.effort
  if (typeof fromWin === 'number' && !Number.isNaN(fromWin)) {
    clientEffort = Math.max(0, Math.floor(fromWin))
    writeStoredEffort(clientEffort)
    return
  }

  const params = new URLSearchParams(window.location.search)
  const hash = window.location.hash || ''
  const hashQuery = hash.includes('?') ? hash.split('?')[1] : ''
  const fromQuery =
    params.get('effort') || new URLSearchParams(hashQuery).get('effort')
  if (fromQuery != null && fromQuery !== '') {
    const n = Number(fromQuery)
    if (!Number.isNaN(n)) {
      clientEffort = Math.max(0, Math.floor(n))
      writeStoredEffort(clientEffort)
      return
    }
  }

  const fromNative = readNativeEffort()
  if (fromNative != null) {
    clientEffort = fromNative
    writeStoredEffort(clientEffort)
    return
  }

  const stored = readStoredEffort()
  if (stored != null) {
    clientEffort = stored
    return
  }

  // App 宿主内：无来源则从 0 起，避免测试默认值污染账本
  if (hasNativeForestBridge()) {
    clientEffort = 0
    writeStoredEffort(clientEffort)
    return
  }

  // 纯浏览器调试：默认大量努力值
  clientEffort = TEST_EFFORT_DEFAULT
  writeStoredEffort(clientEffort)
  window.__HABIT_CLIENT__ = window.__HABIT_CLIENT__ || {}
  window.__HABIT_CLIENT__.effort = clientEffort
}

/** 读取努力值（App 内优先同步 Native） */
export function getClientEffort(): number {
  bootstrapTestEffort()
  const fromNative = readNativeEffort()
  if (fromNative != null) {
    clientEffort = fromNative
    return fromNative
  }
  if (typeof clientEffort === 'number' && !Number.isNaN(clientEffort)) {
    return Math.max(0, Math.floor(clientEffort))
  }
  const stored = readStoredEffort()
  if (stored != null) return stored
  return hasNativeForestBridge() ? 0 : TEST_EFFORT_DEFAULT
}

export function setClientEffort(n: number) {
  clientEffort = Math.max(0, Math.floor(n))
  writeStoredEffort(clientEffort)
  if (typeof window !== 'undefined') {
    window.__HABIT_CLIENT__ = window.__HABIT_CLIENT__ || {}
    window.__HABIT_CLIENT__.effort = clientEffort
  }
}

/**
 * 依据三项状态推导健康状态：
 * - 任一项触底（缺水 / 缺肥 / 长满草）→ 枯萎 dead
 * - 任一项越过警戒线 → 衰退期 withering
 * - 否则健康
 */
function healthFromMeters(meters: CareMeters): TreeHealthState {
  if (
    meters.water <= 0 ||
    meters.fertilizer <= 0 ||
    meters.weed >= 100
  ) {
    return 'dead'
  }
  if (
    meters.water <= DECAY.warnWater ||
    meters.fertilizer <= DECAY.warnFertilizer ||
    meters.weed >= DECAY.warnWeed
  ) {
    return 'withering'
  }
  return 'healthy'
}

/** 生命条 = 三项中最低的余量，随状态同步 */
function syncHealth(tree: ActiveTree): ActiveTree {
  const meters = { ...tree.meters }
  const healthState = healthFromMeters(meters)
  const health = Math.max(
    0,
    Math.min(100, meters.water, meters.fertilizer, 100 - meters.weed)
  )
  return { ...tree, meters, health, healthState }
}

function applyDamage(tree: ActiveTree, amount: number, weedBump = 0): ActiveTree {
  const meters: CareMeters = {
    water: Math.max(0, tree.meters.water - amount),
    fertilizer: Math.max(0, tree.meters.fertilizer - amount * 0.8),
    weed: Math.min(100, tree.meters.weed + weedBump),
  }
  return syncHealth({ ...tree, meters })
}

function applyHeal(tree: ActiveTree, amount: number): ActiveTree {
  const meters: CareMeters = {
    water: Math.min(100, tree.meters.water + amount * 0.6),
    fertilizer: Math.min(100, tree.meters.fertilizer + amount * 0.5),
    weed: Math.max(0, tree.meters.weed - amount * 0.3),
  }
  return syncHealth({ ...tree, meters })
}

/** 阶段进度 = 三项配额完成度的最低值（三项都满，阶段才满） */
function stageCarePct(tree: ActiveTree): number {
  const species = getSpecies(tree.speciesId)
  const quota = getStageCareQuota(tree.stage, !!species?.canFruit)
  const c = tree.stageCare || emptyStageCare()
  const done = Math.min(c.water, c.fertilizer, c.weed)
  return Math.min(100, Math.round((done / quota) * 100))
}

/**
 * 三项养护配额全部做满后进入下一阶段；已是最终阶段则收成。
 */
function advanceIfQuotaMet(tree: ActiveTree): {
  tree: ActiveTree
  matured: boolean
  collected: ForestEntry | null
} {
  const species = getSpecies(tree.speciesId)
  const canFruit = !!species?.canFruit
  const quota = getStageCareQuota(tree.stage, canFruit)
  const c = tree.stageCare || emptyStageCare()
  if (c.water < quota || c.fertilizer < quota || c.weed < quota) {
    return { tree, matured: false, collected: null }
  }

  const nxt = species ? nextStage(tree.stage, canFruit) : null
  if (!nxt) {
    const matured = isMatureStage(tree.stage)
    return {
      tree: { ...tree, stageProgress: quota },
      matured,
      collected: matured
        ? {
            speciesId: tree.speciesId,
            collectedAt: new Date().toISOString(),
            finalStage: tree.stage,
            times: 1,
          }
        : null,
    }
  }

  return {
    tree: {
      ...tree,
      stage: nxt,
      stageCare: emptyStageCare(),
      stageProgress: 0,
    },
    matured: false,
    collected: null,
  }
}

function mergeForest(list: ForestEntry[], entry: ForestEntry): ForestEntry[] {
  const idx = list.findIndex((e) => e.speciesId === entry.speciesId)
  if (idx < 0) return [entry, ...list]
  const copy = [...list]
  copy[idx] = {
    ...copy[idx],
    collectedAt: entry.collectedAt,
    finalStage: entry.finalStage,
    times: copy[idx].times + 1,
  }
  return copy
}

/**
 * 按离线天数衰减三项状态；仅按物种枯萎倍率（不再乘阶段倍率，
 * 否则后期即使每天做满养护也会入不敷出，破坏 28 天周期）。
 * 任一项触底（缺水 / 缺肥 / 长满草）即枯萎，健康状态由状态条推导。
 */
export function tickDecay(state?: ForestState): ForestState {
  const s = state ? { ...state } : readState()
  if (!s.activeTree || s.activeTree.healthState === 'dead') {
    if (!state) writeState(s)
    return s
  }

  const tree = { ...s.activeTree, meters: { ...s.activeTree.meters } }
  const species = getSpecies(tree.speciesId)
  const rate = species?.witherRate ?? 1
  const now = Date.now()
  const last = new Date(tree.lastTickAt).getTime()
  const days = Math.max(0, (now - last) / (1000 * 60 * 60 * 24))
  if (days < 0.001) {
    if (!state) writeState(s)
    return s
  }

  tree.meters.water = Math.max(
    0,
    tree.meters.water - days * DECAY.waterPerDay * rate
  )
  tree.meters.fertilizer = Math.max(
    0,
    tree.meters.fertilizer - days * DECAY.fertilizerPerDay * rate
  )
  tree.meters.weed = Math.min(
    100,
    tree.meters.weed + days * DECAY.weedPerDay * rate
  )

  const synced = syncHealth(tree)
  synced.lastTickAt = new Date().toISOString()
  s.activeTree = synced
  if (!state) writeState(s)
  return s
}

function ensureBridge() {
  if (bridgeReady || typeof window === 'undefined') return
  bridgeReady = true
  bootstrapTestEffort()
  window.__HABIT_FOREST__ = {
    onCheckInFail: () => {
      notifyCheckInFail()
    },
    onCheckInSuccess: () => {
      notifyCheckInSuccess()
    },
    setEffort: (n: number) => setClientEffort(n),
    getEffort: () => getClientEffort(),
    onFocusComplete: (minutes: number) => {
      applyFocusResult({ minutes, status: 'completed' })
    },
    onFocusInterrupt: (minutes?: number) => {
      applyFocusResult({
        minutes: typeof minutes === 'number' ? minutes : 0,
        status: 'interrupted',
      })
    },
    applyFocusResult: (payload) => {
      applyFocusResult(payload)
    },
  }
}

ensureBridge()

export function listSpecies() {
  return ok(TREE_SPECIES as TreeSpecies[])
}

export function listShopGoods() {
  return ok(SHOP_GOODS)
}

export function getForestState() {
  ensureBridge()
  const s = tickDecay()
  const effort = getClientEffort()
  const species = s.activeTree ? getSpecies(s.activeTree.speciesId) : null
  const quota = s.activeTree
    ? getStageCareQuota(s.activeTree.stage, !!species?.canFruit)
    : 0
  return ok({
    ...s,
    effort,
    species: TREE_SPECIES,
    shop: SHOP_GOODS,
    stageNeed: quota,
    careQuota: quota,
    dailyCare: s.dailyCare,
    dailyLimit: DAILY_CARE_LIMIT,
    matureDays: MATURE_DAYS,
    stageProgressPct: s.activeTree ? stageCarePct(s.activeTree) : 0,
    careHint: s.activeTree ? careHintText(s.activeTree) : '',
  })
}

function careHintText(tree: ActiveTree): string {
  if (tree.healthState === 'dead') return '树已枯萎，请重新选种'
  const tips: string[] = []
  if (tree.meters.water <= DECAY.warnWater) tips.push('缺水')
  if (tree.meters.fertilizer <= DECAY.warnFertilizer) tips.push('缺肥')
  if (tree.meters.weed >= DECAY.warnWeed) tips.push('杂草丛生')
  if (tips.length) return `衰退期：${tips.join('、')}，任一项归零即枯萎`
  return '三项状态良好，继续养护凑满本阶段配额'
}

export function plantTree(speciesId: string) {
  const s = tickDecay()
  if (s.activeTree && s.activeTree.healthState !== 'dead') {
    return fail('同时只能培育一棵树，请先照料当前的树')
  }
  const species = getSpecies(speciesId)
  if (!species) return fail('未知树种')

  const now = new Date().toISOString()
  s.activeTree = {
    id: uid('tree'),
    speciesId,
    stage: 'seed',
    stageProgress: 0,
    stageCare: emptyStageCare(),
    health: 100,
    meters: { water: 100, fertilizer: 100, weed: 0 },
    healthState: 'healthy',
    plantedAt: now,
    lastTickAt: now,
    lastCareAt: now,
  }
  writeState(s)
  return ok(s)
}

type CareAction = 'water' | 'fertilize' | 'weed'

export function careTree(action: CareAction) {
  const s = tickDecay()
  if (!s.activeTree) return fail('还没有在培育的树')
  if (s.activeTree.healthState === 'dead') return fail('树已枯萎，请重新选种')

  // 动作名 → 状态字段名（fertilize 对应 fertilizer）
  type CountKey = 'water' | 'fertilizer' | 'weed'
  const meterKey: Record<CareAction, CountKey> = {
    water: 'water',
    fertilize: 'fertilizer',
    weed: 'weed',
  }
  const nameOf: Record<CareAction, string> = {
    water: '浇水',
    fertilize: '施肥',
    weed: '除草',
  }
  const daily = s.dailyCare
  const key = meterKey[action]
  if (daily[key] >= DAILY_CARE_LIMIT[key]) {
    return fail(`今天${nameOf[action]}次数已用完（${DAILY_CARE_LIMIT[key]} 次），明天再来`)
  }

  const inv = { ...s.inventory }
  let tree = {
    ...s.activeTree,
    meters: { ...s.activeTree.meters },
    stageCare: { ...s.activeTree.stageCare },
  }
  const species = getSpecies(tree.speciesId)
  const quota = getStageCareQuota(tree.stage, !!species?.canFruit)

  if (action === 'water') {
    if (inv.waterDrop < 1) return fail('水滴不足，请去商店购买')
    inv.waterDrop -= 1
    tree.meters.water = Math.min(100, tree.meters.water + 45)
    tree.stageCare.water = Math.min(quota, tree.stageCare.water + 1)
  } else if (action === 'fertilize') {
    if (inv.fertilizer < 1) return fail('肥料不足，请去商店购买')
    inv.fertilizer -= 1
    tree.meters.fertilizer = Math.min(100, tree.meters.fertilizer + 45)
    tree.stageCare.fertilizer = Math.min(quota, tree.stageCare.fertilizer + 1)
  } else {
    if (inv.herbicide < 1) return fail('除草剂不足，请去商店购买')
    inv.herbicide -= 1
    tree.meters.weed = Math.max(0, tree.meters.weed - 45)
    tree.stageCare.weed = Math.min(quota, tree.stageCare.weed + 1)
  }
  daily[key] += 1

  tree = syncHealth(tree)
  tree.lastCareAt = new Date().toISOString()
  const advanced = advanceIfQuotaMet(tree)
  s.inventory = inv

  let justCollected: ForestEntry | null = null
  if (advanced.matured && advanced.collected) {
    s.forest = mergeForest(s.forest, advanced.collected)
    justCollected = advanced.collected
    s.activeTree = null
  } else {
    s.activeTree = advanced.tree
  }
  s.activeTree && (s.activeTree.stageProgress = stageCarePct(s.activeTree))

  writeState(s)
  return ok({
    state: s,
    action,
    justCollected,
    advanced: advanced.tree.stage !== tree.stage || advanced.matured,
    dailyCare: s.dailyCare,
    careHint: s.activeTree ? careHintText(s.activeTree) : '',
  })
}

/** 商店购买：水滴 / 肥料 / 除草剂（有 App 桥时先 Native 扣款并记账） */
export function buyShopItem(itemId: ShopItemId, count = 1) {
  const goods = SHOP_GOODS.find((g) => g.id === itemId)
  if (!goods) return fail('商品不存在')
  const qty = Math.max(1, Math.floor(count))
  const cost = goods.price * qty

  if (hasNativeForestBridge()) {
    try {
      const raw = window.HabitForest!.spendEffort!(
        cost,
        itemId,
        goods.name,
        qty,
      )
      const res = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (!res || !res.ok) {
        return fail((res && res.message) || `努力值不足，需要 ${cost}`)
      }
      if (typeof res.effort === 'number') {
        setClientEffort(res.effort)
      }
    } catch (e: any) {
      return fail(e?.message || '购买失败')
    }
  } else {
    const effort = getClientEffort()
    if (effort < cost) return fail(`努力值不足，需要 ${cost}`)
    setClientEffort(effort - cost)
  }

  const s = readState()
  const inv = { ...s.inventory }
  const gain = goods.amount * qty
  if (itemId === 'waterDrop') inv.waterDrop += gain
  else if (itemId === 'fertilizer') inv.fertilizer += gain
  else inv.herbicide += gain
  s.inventory = inv
  writeState(s)

  return ok({
    state: s,
    effort: getClientEffort(),
    itemId,
    gained: gain,
    spent: cost,
  })
}

/** @deprecated 使用 buyShopItem */
export function exchangeWater(drops = 1) {
  return buyShopItem('waterDrop', drops)
}

function rewardForMinutes(minutes: number) {
  const unit = Math.max(0, minutes) / 15
  return {
    effortBonus: Math.round(3 * unit),
  }
}

/**
 * App 专注页结束后回传结果（本 H5 不提供专注计时 UI）
 * completed → 推进生长；interrupted → 扣生命
 */
export function applyFocusResult(payload: FocusResultPayload) {
  const minutes = Math.max(0, Math.floor(Number(payload?.minutes) || 0))
  const status = payload?.status
  if (status !== 'completed' && status !== 'interrupted') {
    return fail('专注结果无效')
  }

  const s = tickDecay()
  const now = new Date().toISOString()
  const session = {
    id: uid('focus'),
    minutes,
    startedAt: now,
    endedAt: now,
    status,
  }
  s.focusHistory = [session, ...s.focusHistory].slice(0, 50)

  if (status === 'interrupted') {
    if (s.activeTree && s.activeTree.healthState !== 'dead') {
      const dmg =
        14 + Math.round(6 * STAGE_DIFFICULTY[s.activeTree.stage].decayMult)
      s.activeTree = applyDamage(s.activeTree, dmg, 12)
    }
    writeState(s)
    return ok({ state: s, session, effort: getClientEffort() })
  }

  // completed：专注只给努力值与少量状态恢复，不推进阶段配额
  const reward = rewardForMinutes(minutes)
  if (reward.effortBonus > 0) {
    setClientEffort(getClientEffort() + reward.effortBonus)
  }

  if (s.activeTree && s.activeTree.healthState !== 'dead') {
    s.activeTree = applyHeal(s.activeTree, 8)
  }

  writeState(s)
  return ok({
    state: s,
    reward,
    session,
    justCollected: null,
    effort: getClientEffort(),
  })
}

export function notifyCheckInFail() {
  const s = tickDecay()
  if (s.activeTree && s.activeTree.healthState !== 'dead') {
    s.activeTree = applyDamage(s.activeTree, 12, 8)
    writeState(s)
  }
  return ok(s)
}

export function notifyCheckInSuccess() {
  const s = tickDecay()
  if (s.activeTree && s.activeTree.healthState !== 'dead') {
    s.activeTree = applyHeal(s.activeTree, 5)
    s.activeTree.meters = {
      ...s.activeTree.meters,
      water: Math.min(100, s.activeTree.meters.water + 5),
    }
    writeState(s)
  }
  return ok(s)
}

export function abandonDeadTree() {
  const s = readState()
  if (!s.activeTree) return fail('没有进行中的树')
  if (s.activeTree.healthState !== 'dead') return fail('树尚未枯死')
  s.activeTree = null
  writeState(s)
  return ok(s)
}

/** 测试用：重置努力值为测试额度 */
export function resetTestEffort() {
  setClientEffort(TEST_EFFORT_DEFAULT)
  return ok({ effort: getClientEffort() })
}
