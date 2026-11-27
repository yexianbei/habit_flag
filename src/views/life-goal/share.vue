<!--
 * @description: 心愿岛明信片分享
-->
<template>
  <div class="isle-share-page" v-if="goal">
    <div class="isle-top" style="position: relative; z-index: 2">
      <div class="back" @click="handleBack">‹</div>
      <div class="brand-block">
        <div class="brand">晒一晒</div>
        <div class="tag">心愿岛明信片</div>
      </div>
      <div style="width: 0.72rem"></div>
    </div>

    <div class="tabs">
      <div class="tab" :class="{ on: shareType === 'bloom' }" @click="shareType = 'bloom'">
        开花瞬间
      </div>
      <div class="tab" :class="{ on: shareType === 'garden' }" @click="shareType = 'garden'">
        岛屿长图
      </div>
    </div>

    <div class="poster-wrap">
      <div
        class="poster-bloom"
        id="isle-poster-bloom"
        v-show="shareType === 'bloom'"
      >
        <div>
          <div class="pb-brand">WISH ISLE · 心愿岛</div>
          <div class="pb-stage">{{ stage.emoji }}</div>
          <div class="pb-ms">{{ nodeName }}</div>
          <div class="pb-thought" v-if="thoughtText">「{{ thoughtText }}」</div>
        </div>
        <div class="pb-foot">
          <span>{{ goal.title }} · {{ progress }}%</span>
          <span>{{ stage.label }}期</span>
        </div>
      </div>

      <div
        class="poster-garden"
        id="isle-poster-garden"
        v-show="shareType === 'garden'"
      >
        <div class="pg-brand">WISH ISLE</div>
        <div class="pg-title">{{ goal.title }}</div>
        <div class="pg-vision" v-if="goal.vision">{{ goal.vision }}</div>
        <div class="pg-bar"><i :style="{ width: progress + '%' }"></i></div>
        <div class="pg-stage">
          {{ stage.emoji }} {{ stage.label }}期 · 浇灌 {{ waterCount }} 次 · 成长值
          {{ xp }}
        </div>
        <div class="pg-j" v-for="j in journals" :key="j.id">
          <div class="d">{{ formatDate(j.date) }}</div>
          <div class="t">{{ j.text }}</div>
        </div>
        <div class="pg-j" v-if="!journals.length">
          <div class="t">岛屿刚刚发芽，足迹正在路上。</div>
        </div>
        <div class="pg-foot">
          <span>进度 {{ progress }}%</span>
          <span>心愿岛</span>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="isle-btn ghost" @click="handleBack">返回</button>
      <button class="isle-btn" :disabled="exporting" @click="handleExport">
        {{ exporting ? '生成中...' : '导出明信片' }}
      </button>
    </div>
  </div>
  <div class="isle-page" v-else>
    <div class="isle-ui">
      <div class="isle-empty-tip">{{ loadError || '加载中...' }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  computed,
  nextTick,
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import moment from 'moment'
import html2canvas from 'html2canvas'
import { getLifeGoal } from '@/api/lifeGoal'
import {
  LifeGoal,
  calcMilestoneProgress,
  getGrowthStage,
  getWaterCount,
  getXp,
} from '@/types/lifeGoal'
import './lifeGoal.scss'

export default defineComponent({
  name: 'LifeGoalShare',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const dataMap = reactive({
      goal: null as LifeGoal | null,
      loadError: '',
      shareType: (route.query.type as string) === 'bloom' ? 'bloom' : 'garden',
      thoughtText: (route.query.thought as string) || '',
      exporting: false,
    })

    const progress = computed(() =>
      dataMap.goal ? calcMilestoneProgress(dataMap.goal) : 0
    )
    const stage = computed(() => getGrowthStage(progress.value))
    const waterCount = computed(() =>
      dataMap.goal ? getWaterCount(dataMap.goal) : 0
    )
    const xp = computed(() => (dataMap.goal ? getXp(dataMap.goal) : 0))
    const journals = computed(() => dataMap.goal?.journals.slice(0, 5) || [])
    const nodeName = computed(() => {
      if (!dataMap.goal) return '新的一浇'
      const msId = route.query.ms as string
      const found = dataMap.goal.milestones.find((m) => m.id === msId)
      if (found) return found.name
      const lastDone = [...dataMap.goal.milestones].reverse().find((m) => m.done)
      return lastDone?.name || '发芽瞬间'
    })

    onMounted(async () => {
      try {
        const res: any = await getLifeGoal(route.params.id as string)
        dataMap.goal = res.data
        if (!dataMap.thoughtText && res.data.journals[0]) {
          dataMap.thoughtText = res.data.journals[0].text
        }
      } catch (e: any) {
        dataMap.loadError = e?.message || '岛屿不存在'
      }
    })

    const formatDate = (d: string) => moment(d).format('YYYY.MM.DD')
    const handleBack = () => {
      router.replace({
        name: 'life-goal-detail',
        params: { id: route.params.id },
        query: { name: route.query.name, token: route.query.token },
      })
    }

    const handleExport = async () => {
      if (dataMap.exporting) return
      dataMap.exporting = true
      await nextTick()
      try {
        const id =
          dataMap.shareType === 'bloom'
            ? 'isle-poster-bloom'
            : 'isle-poster-garden'
        const wrap = document.getElementById(id)
        if (!wrap) return
        const canvas = await html2canvas(wrap, {
          useCORS: true,
          backgroundColor: null,
          scale: 2,
        })
        const url = canvas.toDataURL('image/png')
        const preview = window.open('')
        if (preview) {
          preview.document.write(
            `<html><head><title>心愿岛明信片</title><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;background:#1a2a30;display:flex;justify-content:center;"><img src="${url}" style="width:100%;max-width:750px;display:block;"/><p style="position:fixed;bottom:16px;left:0;right:0;text-align:center;color:#fff;font-size:14px;">长按图片保存</p></body></html>`
          )
        } else {
          const a = document.createElement('a')
          a.href = url
          a.download = `心愿岛-${dataMap.shareType}.png`
          a.click()
        }
      } catch (e) {
        console.error(e)
        alert('生成失败，可长按明信片区域截图')
      } finally {
        dataMap.exporting = false
      }
    }

    return {
      ...toRefs(dataMap),
      progress,
      stage,
      waterCount,
      xp,
      journals,
      nodeName,
      formatDate,
      handleBack,
      handleExport,
    }
  },
})
</script>
