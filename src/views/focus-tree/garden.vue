<!--
 * @description: 专注森林 · 主园（游戏化操作布局）
-->
<template>
  <div class="ff-page is-garden" :class="{ 'is-locked': detailOpen }">
    <div class="ff-ui">
      <div class="ff-top">
        <div class="brand-block">
          <div class="brand">专注森林</div>
          <div class="tag">一棵树，一段专注</div>
        </div>
        <div class="ff-top-right">
          <div class="ff-effort">努力 <b>{{ effort }}</b></div>
          <button class="ff-ghost-link" @click="goForest">我的森林</button>
        </div>
      </div>

      <!-- 游戏场景：树是主角，状态信息只在场景边缘轻描淡写 -->
      <div class="ff-scene" :class="'theme-' + activeTheme">
        <span class="sky-halo"></span>
        <span class="sky-stars"></span>
        <span class="sky-orb"></span>
        <span class="sky-cloud cloud-a"></span>
        <span class="sky-cloud cloud-b"></span>
        <span class="hill hill-far"></span>
        <span class="hill hill-near"></span>
        <span class="ground"></span>
        <span class="grass grass-a"></span>
        <span class="grass grass-b"></span>
        <span class="pebble pebble-a"></span>
        <span class="pebble pebble-b"></span>

        <template v-if="tree && species">
          <div class="scene-badge scene-name">
            <span class="n">{{ species.name }}</span>
            <span class="s">{{ stageLabel }}</span>
            <span class="scene-health" :class="healthStateClass">
              <i></i>{{ healthLabel }}
            </span>
          </div>

          <div class="scene-tree">
            <TreeStage
              :species-id="tree.speciesId"
              :stage="tree.stage"
              :health-state="tree.healthState"
              :fx="fx"
            />
          </div>

          <div
            v-if="showSceneHint"
            class="scene-hint"
            :class="{ danger: tree.healthState === 'dead', warn: tree.healthState === 'withering' }"
          >
            {{ careHint }}
          </div>

          <div v-if="tree.healthState !== 'dead'" class="scene-hud">
            <div class="hud-head">
              <span>本阶段</span>
              <b>{{ stageProgressPct }}%</b>
            </div>
            <div class="hud-tracks">
              <div
                v-for="p in carePips"
                :key="p.key"
                class="hud-row"
                :class="[p.key, { complete: p.done >= p.quota }]"
              >
                <span class="hud-name">{{ p.label }}</span>
                <span class="hud-bar"><i :style="{ width: p.pct + '%' }"></i></span>
                <b>{{ p.done }}/{{ p.quota }}</b>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="ff-empty">
          <div class="mark">空</div>
          <div class="title">园子还空着</div>
          <div class="desc">种下一颗种子，细心照料它长大</div>
        </div>
      </div>

      <!-- 操作区：三个大按钮是页面主视觉，次要信息按需展开 -->
      <div class="ff-deck">
        <template v-if="tree && tree.healthState !== 'dead'">
          <div class="deck-label">今日照料</div>
          <div class="ff-actions">
            <button
              class="ff-act water"
              :class="{ spent: dailyLeft.water === 0, empty: inv.waterDrop === 0 }"
              :disabled="busy || dailyLeft.water === 0"
              @click="doCare('water')"
            >
              <span class="act-icon">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M24 4C24 4 9 21 9 30a15 15 0 0 0 30 0C39 21 24 4 24 4Z" fill="currentColor" />
                  <path d="M16 29c0 5 3 8 7 9" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="3" stroke-linecap="round" />
                </svg>
              </span>
              <span class="act-name">浇水</span>
              <span class="act-sub">{{ waterActSub }}</span>
              <span class="act-stock" :class="{ low: inv.waterDrop === 0 }">{{ inv.waterDrop }}</span>
            </button>

            <button
              class="ff-act fertilize"
              :class="{ spent: dailyLeft.fertilizer === 0, empty: inv.fertilizer === 0 }"
              :disabled="busy || dailyLeft.fertilizer === 0"
              @click="doCare('fertilize')"
            >
              <span class="act-icon">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M24 42V21" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" />
                  <path d="M24 30C13 30 8 22 8 13c10 0 16 8 16 17Z" fill="currentColor" />
                  <path d="M24 26c11 0 16-8 16-17-10 0-16 8-16 17Z" fill="currentColor" opacity=".7" />
                  <path d="M12 42h24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                </svg>
              </span>
              <span class="act-name">施肥</span>
              <span class="act-sub">{{ fertilizeActSub }}</span>
              <span class="act-stock" :class="{ low: inv.fertilizer === 0 }">{{ inv.fertilizer }}</span>
            </button>

            <button
              class="ff-act weed"
              :class="{ spent: dailyLeft.weed === 0, empty: inv.herbicide === 0 }"
              :disabled="busy || dailyLeft.weed === 0"
              @click="doCare('weed')"
            >
              <span class="act-icon">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M31 5l8 3-16 34-8-3Z" fill="currentColor" />
                  <path d="M6 34l16 6-3 7-16-6Z" fill="currentColor" opacity=".78" />
                </svg>
              </span>
              <span class="act-name">除草</span>
              <span class="act-sub">{{ weedActSub }}</span>
              <span class="act-stock" :class="{ low: inv.herbicide === 0 }">{{ inv.herbicide }}</span>
            </button>
          </div>
        </template>

        <button v-else class="ff-primary" @click="goPlant">
          {{ tree?.healthState === 'dead' ? '重新选种' : '种下一棵' }}
        </button>

        <div class="deck-foot">
          <button class="ff-ghost-link" @click="goShop">道具商店</button>
          <button v-if="tree" class="ff-ghost-link" @click="detailOpen = true">状态详情</button>
        </div>
      </div>
    </div>

    <transition name="ff-toast">
      <div v-if="toast" class="ff-toast">{{ toast }}</div>
    </transition>

    <!-- 状态详情：遮罩 + 居中卡片弹窗 -->
    <div
      v-if="detailOpen && tree && species"
      class="ff-detail-mask"
      @click.self="detailOpen = false"
    >
      <div class="ff-detail" role="dialog" aria-modal="true" aria-label="状态详情">
        <div class="ff-detail-head">
          <div class="ff-detail-title">
            <span class="t">状态详情</span>
            <span class="s">{{ species.name }} · {{ stageLabel }}</span>
          </div>
          <button class="ff-detail-close" aria-label="关闭" @click="detailOpen = false">×</button>
        </div>

        <div class="ff-detail-body">
          <section class="ff-detail-sec">
            <div class="sec-label">生长阶段</div>
            <div class="ff-stage-ladder" aria-label="生长阶段">
              <span v-for="s in stageSteps" :key="s.id" class="step" :class="s.cls">{{ s.label }}</span>
            </div>
            <div class="ff-progress-line">
              <div class="pl-top">
                <span>本阶段进度</span>
                <b>{{ stageProgressPct }}%</b>
              </div>
              <div class="bar"><i :style="{ width: stageProgressPct + '%' }"></i></div>
              <div class="pl-tip">三项配额全满即可进阶</div>
            </div>
          </section>

          <section class="ff-detail-sec">
            <div class="sec-label">树况</div>
            <div class="ff-status-chip" :class="healthStateClass">{{ healthLabel }}</div>
            <div class="ff-meters">
              <div class="ff-meter hp" :class="hpClass">
                <span>生命</span>
                <div class="bar"><i :style="{ width: tree.health + '%' }"></i></div>
                <span class="val">{{ Math.round(tree.health) }}</span>
              </div>
              <div class="ff-meter water">
                <span>水分</span>
                <div class="bar"><i :style="{ width: tree.meters.water + '%' }"></i></div>
                <span class="val">{{ Math.round(tree.meters.water) }}</span>
              </div>
              <div class="ff-meter fert">
                <span>肥力</span>
                <div class="bar"><i :style="{ width: tree.meters.fertilizer + '%' }"></i></div>
                <span class="val">{{ Math.round(tree.meters.fertilizer) }}</span>
              </div>
              <div class="ff-meter weed">
                <span>杂草</span>
                <div class="bar"><i :style="{ width: tree.meters.weed + '%' }"></i></div>
                <span class="val">{{ Math.round(tree.meters.weed) }}</span>
              </div>
            </div>
            <div
              v-if="careHint"
              class="ff-care-hint"
              :class="{ ok: careOk, danger: tree.healthState === 'dead', warn: tree.healthState === 'withering' }"
            >
              {{ careHint }}
            </div>
          </section>

          <section class="ff-detail-sec">
            <div class="sec-label">今日照料</div>
            <div class="ff-daily">
              <span :class="{ full: dailyLeft.water === 0 }">浇水 {{ dailyCare.water }}/{{ dailyLimit.water }}</span>
              <span :class="{ full: dailyLeft.fertilizer === 0 }">施肥 {{ dailyCare.fertilizer }}/{{ dailyLimit.fertilizer }}</span>
              <span :class="{ full: dailyLeft.weed === 0 }">除草 {{ dailyCare.weed }}/{{ dailyLimit.weed }}</span>
            </div>
          </section>

          <section class="ff-detail-sec">
            <div class="sec-label">场景时间</div>
            <div class="ff-theme-row">
              <button
                v-for="t in themeOptions"
                :key="t.id"
                class="ff-theme-opt"
                :class="{ on: themeOverride === t.id }"
                @click="setThemeOverride(t.id)"
              >
                {{ t.label }}
              </button>
              <button
                class="ff-theme-opt"
                :class="{ on: !themeOverride }"
                @click="setThemeOverride('')"
              >
                自动
              </button>
            </div>
            <div class="ff-theme-now">当前：{{ themeLabel }}</div>
          </section>

          <p class="ff-detail-foot">
            三项各做满 {{ careQuota }} 次才进阶 · 约 {{ matureDays }} 天收录「我的森林」 · 久未照料会枯萎
          </p>
        </div>
      </div>
    </div>

    <div v-if="celebrate" class="ff-celebrate" @click="celebrate = null">
      <div class="box" @click.stop>
        <div class="t">收录成功</div>
        <div class="d">「{{ celebrateName }}」已成熟，收入你的森林。</div>
        <button class="ff-btn moss block" @click="onCelebrateDone">去看看</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  toRefs,
  onMounted,
  onUnmounted,
  computed,
  nextTick,
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TreeStageView from './components/TreeStage.vue'
import {
  getForestState,
  careTree,
  abandonDeadTree,
} from '@/api/focusTree'
import {
  ActiveTree,
  Inventory,
  ForestEntry,
  STAGE_LABEL,
  STAGE_ORDER,
  TreeStage as StageId,
  getSpecies,
} from '@/types/focusTree'
import './focusTree.scss'

type SceneTheme = 'dawn' | 'morning' | 'day' | 'dusk' | 'night'
const THEME_LABEL: Record<SceneTheme, string> = {
  dawn: '清晨',
  morning: '上午',
  day: '白天',
  dusk: '黄昏',
  night: '夜晚',
}
const THEME_OPTIONS: Array<{ id: SceneTheme; label: string }> = [
  { id: 'dawn', label: THEME_LABEL.dawn },
  { id: 'morning', label: THEME_LABEL.morning },
  { id: 'day', label: THEME_LABEL.day },
  { id: 'dusk', label: THEME_LABEL.dusk },
  { id: 'night', label: THEME_LABEL.night },
]

/** 按本地时间自动选场景：夜晚出月亮，其余时段太阳位置不同 */
function themeOfHour(hour: number): SceneTheme {
  if (hour < 5 || hour >= 19) return 'night'
  if (hour < 8) return 'dawn'
  if (hour < 11) return 'morning'
  if (hour < 16) return 'day'
  return 'dusk'
}

export default defineComponent({
  name: 'FocusForestGarden',
  components: { TreeStage: TreeStageView },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const dataMap = reactive({
      tree: null as ActiveTree | null,
      inv: { waterDrop: 0, fertilizer: 0, herbicide: 0 } as Inventory,
      effort: 0,
      stageProgressPct: 0,
      careQuota: 0,
      careHint: '',
      dailyCare: { date: '', water: 0, fertilizer: 0, weed: 0 },
      dailyLimit: { water: 2, fertilizer: 1, weed: 1 },
      matureDays: 28,
      busy: false,
      toast: '',
      fx: '' as '' | 'water' | 'fertilize' | 'weed',
      celebrate: null as ForestEntry | null,
      detailOpen: false,
      themeOverride: '' as SceneTheme | '',
    })
    let toastTimer: ReturnType<typeof setTimeout> | null = null
    let fxTimer: ReturnType<typeof setTimeout> | null = null
    let themeTimer: ReturnType<typeof setInterval> | null = null

    const timeTheme = ref<SceneTheme>(themeOfHour(new Date().getHours()))
    const updateTheme = () => {
      timeTheme.value = themeOfHour(new Date().getHours())
    }
    const activeTheme = computed<SceneTheme>(
      () => dataMap.themeOverride || timeTheme.value
    )
    const themeLabel = computed(() => THEME_LABEL[activeTheme.value])
    const themeOptions = THEME_OPTIONS
    const setThemeOverride = (t: SceneTheme | '') => {
      dataMap.themeOverride = t
    }

    const species = computed(() =>
      dataMap.tree ? getSpecies(dataMap.tree.speciesId) : null
    )
    const stageLabel = computed(() =>
      dataMap.tree ? STAGE_LABEL[dataMap.tree.stage] : ''
    )
    /** 展示生长链：发芽→小树→中等树→大树→苍天（种子单独，不挤在梯子上） */
    const stageSteps = computed(() => {
      const cur = dataMap.tree?.stage
      if (!cur) return []
      const canFruit = !!species.value?.canFruit
      const chain: StageId[] = ['sprout', 'grow', 'mid', 'bloom']
      if (canFruit) chain.push('fruit')
      const curIdx = STAGE_ORDER.indexOf(cur)
      return chain.map((id) => {
        const idx = STAGE_ORDER.indexOf(id)
        let cls = 'locked'
        if (id === cur) cls = 'now'
        else if (idx < curIdx) cls = 'done'
        return { id, label: STAGE_LABEL[id], cls }
      })
    })
    const healthLabel = computed(() => {
      if (!dataMap.tree) return ''
      if (dataMap.tree.healthState === 'dead') return '已枯萎'
      if (dataMap.tree.healthState === 'withering') return '枯萎中'
      return '健康'
    })
    const healthStateClass = computed(() => dataMap.tree?.healthState || 'healthy')
    const showSceneHint = computed(() =>
      !!dataMap.tree && !!dataMap.careHint && dataMap.tree.healthState !== 'healthy'
    )
    /** 场景 HUD：三项纵向进度条，避免横排挤在一起 */
    const carePips = computed(() => {
      const c = dataMap.tree?.stageCare || { water: 0, fertilizer: 0, weed: 0 }
      const q = Math.max(1, dataMap.careQuota)
      const row = (key: string, label: string, doneRaw: number) => {
        const done = Math.min(doneRaw, q)
        return {
          key,
          label,
          done,
          quota: q,
          pct: Math.round((done / q) * 100),
        }
      }
      return [
        row('water', '浇水', c.water),
        row('fertilizer', '施肥', c.fertilizer),
        row('weed', '除草', c.weed),
      ]
    })
    const hpClass = computed(() => {
      if (!dataMap.tree) return ''
      if (dataMap.tree.health < 25) return 'danger'
      if (dataMap.tree.health < 40) return 'warn'
      return ''
    })
    const careOk = computed(() => dataMap.careHint.indexOf('良好') >= 0)
    const dailyLeft = computed(() => ({
      water: Math.max(0, dataMap.dailyLimit.water - dataMap.dailyCare.water),
      fertilizer: Math.max(0, dataMap.dailyLimit.fertilizer - dataMap.dailyCare.fertilizer),
      weed: Math.max(0, dataMap.dailyLimit.weed - dataMap.dailyCare.weed),
    }))
    const waterActSub = computed(() => {
      if (dataMap.inv.waterDrop <= 0) return '道具不足'
      if (dailyLeft.value.water === 0) return '今日已满'
      return '今日剩 ' + dailyLeft.value.water + ' 次'
    })
    const fertilizeActSub = computed(() => {
      if (dataMap.inv.fertilizer <= 0) return '道具不足'
      if (dailyLeft.value.fertilizer === 0) return '今日已满'
      return '今日剩 ' + dailyLeft.value.fertilizer + ' 次'
    })
    const weedActSub = computed(() => {
      if (dataMap.inv.herbicide <= 0) return '道具不足'
      if (dailyLeft.value.weed === 0) return '今日已满'
      return '今日剩 ' + dailyLeft.value.weed + ' 次'
    })
    const celebrateName = computed(() => {
      if (!dataMap.celebrate) return ''
      return getSpecies(dataMap.celebrate.speciesId)?.name || ''
    })

    const showToast = (msg: string) => {
      dataMap.toast = msg
      if (toastTimer) clearTimeout(toastTimer)
      toastTimer = setTimeout(() => {
        dataMap.toast = ''
      }, 2200)
    }

    const playFx = (action: 'water' | 'fertilize' | 'weed') => {
      if (fxTimer) clearTimeout(fxTimer)
      // 先清空再下一帧设置，连点同一动作也能让动画从头重播
      dataMap.fx = ''
      nextTick(() => {
        dataMap.fx = action
        fxTimer = setTimeout(() => {
          dataMap.fx = ''
        }, 1700)
      })
    }

    const applyState = (s: any) => {
      dataMap.tree = s.activeTree
        ? { ...s.activeTree, stageCare: s.activeTree.stageCare || { water: 0, fertilizer: 0, weed: 0 } }
        : null
      dataMap.inv = s.inventory
      dataMap.effort = s.effort ?? 0
      dataMap.stageProgressPct = s.stageProgressPct ?? 0
      dataMap.careQuota = s.careQuota ?? s.stageNeed ?? 0
      dataMap.careHint = s.careHint || ''
      dataMap.dailyCare = s.dailyCare || dataMap.dailyCare
      dataMap.dailyLimit = s.dailyLimit || dataMap.dailyLimit
      dataMap.matureDays = s.matureDays ?? 28
    }

    const load = async () => {
      try {
        const res: any = await getForestState()
        applyState(res.data)
      } catch (e: any) {
        showToast(e?.message || '加载失败')
      }
    }

    const keepQuery = () => ({
      name: route.query.name,
      token: route.query.token,
      effort: route.query.effort,
      dailyUserId: route.query.dailyUserId,
    })

    const goPlant = async () => {
      if (dataMap.tree?.healthState === 'dead') {
        try {
          await abandonDeadTree()
        } catch (_) {
          /* ignore */
        }
      }
      router.push({ name: 'focus-tree-plant', query: keepQuery() })
    }
    const goForest = () => {
      router.push({ name: 'focus-tree-forest', query: keepQuery() })
    }
    const goShop = () => {
      router.push({ name: 'focus-tree-shop', query: keepQuery() })
    }

    const doCare = async (action: 'water' | 'fertilize' | 'weed') => {
      if (dataMap.busy) return
      const stock =
        action === 'water'
          ? dataMap.inv.waterDrop
          : action === 'fertilize'
          ? dataMap.inv.fertilizer
          : dataMap.inv.herbicide
      if (stock < 1) {
        showToast('道具不足，需要商店购买')
        return
      }
      dataMap.busy = true
      try {
        const res: any = await careTree(action)
        const st = await getForestState()
        applyState(st.data)
        playFx(action)
        if (res.data.justCollected) {
          dataMap.celebrate = res.data.justCollected
        } else if (res.data.advanced) {
          showToast('三项配额已满，进入下一阶段')
        } else {
          const tip =
            action === 'water'
              ? '浇了一瓢清泉'
              : action === 'fertilize'
              ? '土壤更肥沃了'
              : '杂草清理干净'
          const c = st.data.activeTree?.stageCare
          const q = dataMap.careQuota
          const progress =
            c && q
              ? ` · 本阶段 ${Math.min(c.water, q)}/${q} ${Math.min(c.fertilizer, q)}/${q} ${Math.min(c.weed, q)}/${q}`
              : ''
          showToast(tip + progress)
        }
      } catch (e: any) {
        showToast(e?.message || '操作失败')
      } finally {
        dataMap.busy = false
      }
    }

    const onCelebrateDone = () => {
      dataMap.celebrate = null
      goForest()
    }

    onMounted(() => {
      updateTheme()
      themeTimer = setInterval(updateTheme, 60000)
      load()
    })
    onUnmounted(() => {
      if (themeTimer) clearInterval(themeTimer)
      if (toastTimer) clearTimeout(toastTimer)
      if (fxTimer) clearTimeout(fxTimer)
    })

    return {
      ...toRefs(dataMap),
      timeTheme,
      activeTheme,
      themeLabel,
      themeOptions,
      setThemeOverride,
      species,
      stageLabel,
      stageSteps,
      healthLabel,
      healthStateClass,
      showSceneHint,
      carePips,
      hpClass,
      careOk,
      dailyLeft,
      waterActSub,
      fertilizeActSub,
      weedActSub,
      celebrateName,
      goPlant,
      goForest,
      goShop,
      doCare,
      onCelebrateDone,
    }
  },
})
</script>
