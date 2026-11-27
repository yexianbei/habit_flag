<!--
 * @description: 心愿岛总览 — Three.js 浮岛天空
-->
<template>
  <div class="isle-page">
    <div class="isle-canvas" ref="canvasRef"></div>

    <div class="isle-ui">
      <div class="isle-top">
        <div class="brand-block">
          <div class="brand">心愿岛</div>
          <div class="tag">浇灌一座属于你的浮岛</div>
        </div>
        <div class="chip">{{ ongoingCount }}/3</div>
      </div>

      <div class="isle-hero">
        <div class="hello">今天，来看看岛上的树长高了吗</div>
        <div class="desc">点浮岛进入 · 浇灌留下足迹 · 开花时可以晒一晒</div>
      </div>

      <div class="isle-spacer"></div>

      <div class="isle-hud">
        <div v-if="!goals.length" class="isle-empty-tip">
          天空还很空旷<br />
          种下第一颗<strong>心愿种子</strong>吧
        </div>

        <div class="isle-goal-row" v-else>
          <div
            class="goal-pill"
            v-for="g in goals"
            :key="g.id"
            @click="goDetail(g.id)"
          >
            <div class="g-title">{{ g.title }}</div>
            <div class="g-meta">
              <span>{{ stageOf(g).emoji }} {{ stageOf(g).label }}</span>
              <span>·</span>
              <span>{{ progressOf(g) }}%</span>
            </div>
            <div class="bar"><i :style="{ width: progressOf(g) + '%' }"></i></div>
          </div>
        </div>

        <button
          class="isle-btn"
          :disabled="ongoingCount >= 3"
          @click="goCreate"
        >
          {{ ongoingCount >= 3 ? '岛屿已满（最多 3 座）' : '＋ 种下一座新岛' }}
        </button>
      </div>
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
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { listLifeGoals } from '@/api/lifeGoal'
import {
  LifeGoal,
  calcMilestoneProgress,
  getGrowthStage,
} from '@/types/lifeGoal'
import { IslandWorld } from './three/IslandWorld'
import './lifeGoal.scss'

export default defineComponent({
  name: 'LifeGoalList',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const canvasRef = ref<HTMLElement | null>(null)
    let world: IslandWorld | null = null

    const dataMap = reactive({
      goals: [] as LifeGoal[],
    })

    const ongoingCount = computed(
      () => dataMap.goals.filter((g) => g.status === 'ongoing').length
    )

    const progressOf = (g: LifeGoal) => calcMilestoneProgress(g)
    const stageOf = (g: LifeGoal) => getGrowthStage(calcMilestoneProgress(g))

    const mountWorld = () => {
      if (!canvasRef.value) return
      world?.dispose()
      world = new IslandWorld({
        el: canvasRef.value,
        mode: 'sky',
        islands: dataMap.goals
          .filter((g) => g.status !== 'archived')
          .slice(0, 3)
          .map((g) => ({
            id: g.id,
            mood: g.coverMood,
            progress: calcMilestoneProgress(g),
          })),
        onIslandClick: (id) => goDetail(id),
      })
    }

    const load = async () => {
      try {
        const res: any = await listLifeGoals()
        dataMap.goals = res.data || []
      } catch (e) {
        console.error(e)
      }
      await nextTick()
      mountWorld()
    }

    onMounted(load)
    onBeforeUnmount(() => {
      world?.dispose()
      world = null
    })

    const goCreate = () => {
      if (ongoingCount.value >= 3) return
      router.push({ name: 'life-goal-create', query: { ...route.query } })
    }

    const goDetail = (id: string) => {
      router.push({
        name: 'life-goal-detail',
        params: { id },
        query: { ...route.query },
      })
    }

    return {
      ...toRefs(dataMap),
      canvasRef,
      ongoingCount,
      progressOf,
      stageOf,
      goCreate,
      goDetail,
    }
  },
})
</script>
