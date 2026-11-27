<!--
 * @description: 心愿岛详情 — 近景浮岛 + 浇灌游戏化
-->
<template>
  <div class="isle-page" v-if="goal">
    <div class="isle-canvas" ref="canvasRef"></div>

    <div class="isle-ui">
      <div class="isle-top">
        <div class="back" @click="handleBack">‹</div>
        <div class="brand-block">
          <div class="brand">{{ goal.title }}</div>
          <div class="tag">{{ goal.vision || '一座正在生长的岛' }}</div>
        </div>
        <div class="chip" @click="goShare('garden')">晒岛</div>
      </div>

      <div class="isle-spacer" style="min-height: 3.2rem"></div>

      <div class="isle-glass isle-stage">
        <div class="stage-badge">{{ stage.emoji }}</div>
        <div class="stage-info">
          <div class="name">{{ stage.label }}期</div>
          <div class="sub">
            已浇灌 {{ waterCount }} 次 · 关卡
            {{ doneCount }}/{{ goal.milestones.length }}
          </div>
        </div>
        <div class="xp">
          <div class="num">{{ xp }}</div>
          <div class="lbl">成长值</div>
        </div>
      </div>
      <div class="isle-progress-bar" style="margin: -0.08rem 0 0.2rem">
        <div class="fill" :style="{ width: progress + '%' }"></div>
      </div>

      <div style="display: flex; gap: 0.12rem; margin-bottom: 0.2rem">
        <button
          class="isle-btn water"
          style="flex: 1"
          v-if="goal.status === 'ongoing'"
          @click="sheetShow = true"
        >
          💧 浇灌一下
        </button>
        <button class="isle-btn ghost" style="flex: 1" @click="goShare('garden')">
          ✨ 生成明信片
        </button>
      </div>

      <div class="isle-glass isle-quests">
        <div class="q-title">
          成长关卡
          <span>点关卡可完成 / 撤销</span>
        </div>
        <div
          class="q-item"
          v-for="(m, i) in goal.milestones"
          :key="m.id"
          :class="{ done: m.done, current: !m.done && currentIndex === i }"
          @click="onToggleMilestone(m)"
        >
          <div class="q-check">{{ m.done ? '✓' : i + 1 }}</div>
          <div class="q-name">{{ m.name }}</div>
          <div class="q-tag">
            <template v-if="m.done">已解锁</template>
            <template v-else-if="currentIndex === i">进行中</template>
            <template v-else>未解锁</template>
          </div>
        </div>
      </div>

      <div class="isle-glass isle-feed">
        <div class="f-title">浇灌足迹</div>
        <div v-if="!goal.journals.length" class="f-empty">
          还没有足迹，浇一次水就留下一句心情吧
        </div>
        <div class="f-item" v-for="j in goal.journals" :key="j.id">
          <div class="f-date">{{ formatDate(j.date) }}</div>
          <div class="f-text">{{ j.text }}</div>
        </div>
      </div>
    </div>

    <!-- 浇灌弹层 -->
    <div class="isle-sheet-mask" v-if="sheetShow" @click.self="sheetShow = false">
      <div class="isle-sheet">
        <div class="s-title">💧 浇灌这座岛</div>
        <div class="s-hint">可顺手完成一关，并写下一句当下的想法</div>
        <div class="pick-list">
          <div
            class="pick"
            v-for="m in goal.milestones"
            :key="m.id"
            :class="{ on: pickMilestoneId === m.id, off: m.done }"
            @click="!m.done && (pickMilestoneId = pickMilestoneId === m.id ? '' : m.id)"
          >
            <span>{{ m.name }}</span>
            <span>{{ m.done ? '已完成' : pickMilestoneId === m.id ? '选中' : '' }}</span>
          </div>
        </div>
        <div class="feel">
          <div class="s-hint">感觉进度</div>
          <input type="range" min="0" max="100" v-model.number="feelProgress" />
          <div class="v">{{ feelProgress }}%</div>
        </div>
        <textarea
          v-model="journalText"
          maxlength="200"
          placeholder="这一浇，你在想什么？（可选）"
        ></textarea>
        <button class="isle-btn water" :disabled="saving" @click="handleLog">
          {{ saving ? '吸收中...' : '浇下去' }}
        </button>
      </div>
    </div>

    <div class="isle-celebrate" v-if="celebrateShow">
      <div class="burst">{{ justCompletedGoal ? '✨' : '🌸' }}</div>
      <div class="c-title">
        {{ justCompletedGoal ? '整座岛开花了' : '关卡解锁' }}
      </div>
      <div class="c-sub">{{ celebrateName }}</div>
      <div class="c-actions">
        <button class="isle-btn soft" @click="goShare('bloom')">晒这一刻</button>
        <button
          class="isle-btn ghost"
          style="color: #fff; border-color: rgba(255,255,255,0.45); background: transparent"
          @click="celebrateShow = false"
        >
          继续浇灌
        </button>
      </div>
    </div>
  </div>
  <div class="isle-page" v-else>
    <div class="isle-ui">
      <div class="isle-empty-tip">{{ loadError || '岛屿加载中...' }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  onBeforeUnmount,
  computed,
  ref,
  nextTick,
  watch,
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import moment from 'moment'
import { getLifeGoal, logLifeGoalStep, toggleMilestone } from '@/api/lifeGoal'
import {
  LifeGoal,
  Milestone,
  calcMilestoneProgress,
  currentMilestoneIndex,
  getGrowthStage,
  getWaterCount,
  getXp,
} from '@/types/lifeGoal'
import { IslandWorld } from './three/IslandWorld'
import './lifeGoal.scss'

export default defineComponent({
  name: 'LifeGoalDetail',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const canvasRef = ref<HTMLElement | null>(null)
    let world: IslandWorld | null = null

    const dataMap = reactive({
      goal: null as LifeGoal | null,
      loadError: '',
      sheetShow: false,
      pickMilestoneId: '',
      feelProgress: 0,
      journalText: '',
      saving: false,
      celebrateShow: false,
      celebrateName: '',
      justCompletedGoal: false,
      lastJournalText: '',
    })

    const progress = computed(() =>
      dataMap.goal ? calcMilestoneProgress(dataMap.goal) : 0
    )
    const stage = computed(() => getGrowthStage(progress.value))
    const currentIndex = computed(() =>
      dataMap.goal ? currentMilestoneIndex(dataMap.goal) : 0
    )
    const waterCount = computed(() =>
      dataMap.goal ? getWaterCount(dataMap.goal) : 0
    )
    const xp = computed(() => (dataMap.goal ? getXp(dataMap.goal) : 0))
    const doneCount = computed(
      () => dataMap.goal?.milestones.filter((m) => m.done).length || 0
    )

    const mountWorld = async () => {
      await nextTick()
      if (!canvasRef.value || !dataMap.goal) return
      world?.dispose()
      world = new IslandWorld({
        el: canvasRef.value,
        mode: 'focus',
        mood: dataMap.goal.coverMood,
        progress: calcMilestoneProgress(dataMap.goal),
      })
    }

    const refreshTree = () => {
      if (!dataMap.goal || !world) return
      world.updateFocusProgress(
        calcMilestoneProgress(dataMap.goal),
        dataMap.goal.coverMood
      )
    }

    const load = async () => {
      try {
        const res: any = await getLifeGoal(route.params.id as string)
        dataMap.goal = res.data
        dataMap.feelProgress =
          res.data.feelProgress || calcMilestoneProgress(res.data)
        await mountWorld()
      } catch (e: any) {
        dataMap.loadError = e?.message || '岛屿不存在'
      }
    }

    onMounted(load)
    onBeforeUnmount(() => {
      world?.dispose()
      world = null
    })

    watch(
      () => dataMap.goal && calcMilestoneProgress(dataMap.goal),
      () => refreshTree()
    )

    const formatDate = (d: string) => moment(d).format('MM.DD HH:mm')
    const handleBack = () => {
      router.replace({ name: 'life-goal', query: { ...route.query } })
    }

    const goShare = (type: 'bloom' | 'garden' = 'garden') => {
      if (!dataMap.goal) return
      dataMap.celebrateShow = false
      router.push({
        name: 'life-goal-share',
        params: { id: dataMap.goal.id },
        query: {
          ...route.query,
          type,
          ms: dataMap.pickMilestoneId || '',
          thought: dataMap.lastJournalText || dataMap.journalText || '',
        },
      })
    }

    const onToggleMilestone = async (m: Milestone) => {
      if (!dataMap.goal) return
      try {
        const res: any = await toggleMilestone(dataMap.goal.id, m.id, !m.done)
        dataMap.goal = res.data.goal
        if (res.data.completedMilestone) {
          dataMap.celebrateName = res.data.completedMilestone.name
          dataMap.justCompletedGoal = !!res.data.justCompleted
          dataMap.lastJournalText = res.data.journal?.text || ''
          dataMap.pickMilestoneId = res.data.completedMilestone.id
          dataMap.celebrateShow = true
        }
      } catch (e: any) {
        alert(e?.message || '操作失败')
      }
    }

    const handleLog = async () => {
      if (!dataMap.goal || dataMap.saving) return
      if (
        !dataMap.pickMilestoneId &&
        !dataMap.journalText.trim() &&
        dataMap.feelProgress === (dataMap.goal.feelProgress || 0)
      ) {
        alert('写一句心情、勾选关卡或调进度后再浇灌')
        return
      }
      dataMap.saving = true
      try {
        const res: any = await logLifeGoalStep({
          goalId: dataMap.goal.id,
          text: dataMap.journalText,
          completeMilestoneId: dataMap.pickMilestoneId || undefined,
          feelProgress: dataMap.feelProgress,
        })
        dataMap.goal = res.data.goal
        dataMap.lastJournalText = res.data.journal?.text || dataMap.journalText
        dataMap.sheetShow = false
        if (res.data.completedMilestone) {
          dataMap.celebrateName = res.data.completedMilestone.name
          dataMap.justCompletedGoal = !!res.data.justCompleted
          dataMap.celebrateShow = true
        }
        dataMap.journalText = ''
        dataMap.pickMilestoneId = ''
      } catch (e: any) {
        alert(e?.message || '浇灌失败')
      } finally {
        dataMap.saving = false
      }
    }

    return {
      ...toRefs(dataMap),
      canvasRef,
      progress,
      stage,
      currentIndex,
      waterCount,
      xp,
      doneCount,
      formatDate,
      handleBack,
      goShare,
      onToggleMilestone,
      handleLog,
    }
  },
})
</script>
