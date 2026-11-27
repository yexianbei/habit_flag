<!--
 * @description: 专注森林 · 图鉴
-->
<template>
  <div class="ff-page">
    <div class="ff-ui">
      <div class="ff-top is-sub">
        <div class="back" @click="goBack">←</div>
        <div class="brand-block">
          <div class="brand">森林图鉴</div>
          <div class="tag">已收录 {{ collectedCount }}/{{ species.length }}</div>
        </div>
        <div style="width: 0.64rem"></div>
      </div>

      <div class="ff-forest-grid">
        <div
          v-for="s in species"
          :key="s.id"
          class="ff-forest-cell"
          :class="{ locked: !entryMap[s.id] }"
        >
          <ForestSilhouette :species-id="s.id" />
          <div class="n">{{ entryMap[s.id] ? s.name : '未名' }}</div>
          <div class="m" v-if="entryMap[s.id]">
            {{ stageLabel(entryMap[s.id].finalStage) }} ·
            {{ entryMap[s.id].times }} 次
          </div>
          <div class="m" v-else>尚未收录</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getForestState, listSpecies } from '@/api/focusTree'
import {
  TreeSpecies,
  ForestEntry,
  STAGE_LABEL,
  TreeStage,
} from '@/types/focusTree'
import ForestSilhouette from './components/ForestSilhouette.vue'
import './focusTree.scss'

export default defineComponent({
  name: 'FocusForestForest',
  components: { ForestSilhouette },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const dataMap = reactive({
      species: [] as TreeSpecies[],
      forest: [] as ForestEntry[],
    })

    const entryMap = computed(() => {
      const map: Record<string, ForestEntry> = {}
      dataMap.forest.forEach((e) => {
        map[e.speciesId] = e
      })
      return map
    })

    const collectedCount = computed(() => dataMap.forest.length)

    const stageLabel = (s: TreeStage) => STAGE_LABEL[s] || s

    const goBack = () => {
      router.replace({
        name: 'focus-tree',
        query: {
          name: route.query.name,
          token: route.query.token,
          effort: route.query.effort,
        },
      })
    }

    onMounted(async () => {
      try {
        const [sp, st]: any[] = await Promise.all([
          listSpecies(),
          getForestState(),
        ])
        dataMap.species = sp.data || []
        dataMap.forest = st.data.forest || []
      } catch (_) {
        /* ignore */
      }
    })

    return {
      ...toRefs(dataMap),
      entryMap,
      collectedCount,
      stageLabel,
      goBack,
    }
  },
})
</script>
