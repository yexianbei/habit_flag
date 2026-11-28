<!--
 * @description: 专注森林 · 选种
-->
<template>
  <div class="ff-page">
    <div class="ff-ui">
      <div class="ff-top is-sub">
        <div class="back" @click="goBack">←</div>
        <div class="brand-block">
          <div class="brand">选一颗种子</div>
          <div class="tag">同时只能培育一棵</div>
        </div>
        <div style="width: 0.64rem"></div>
      </div>

      <div class="ff-species-list">
        <div
          v-for="s in species"
          :key="s.id"
          class="ff-species-row"
          :class="{ active: selected === s.id }"
          @click="selected = s.id"
        >
          <div class="swatch" :style="{ background: s.leaf }"></div>
          <div class="info">
            <div class="n">{{ s.name }}</div>
            <div class="d">{{ s.desc }}</div>
          </div>
          <div class="side">
            <div class="rarity">{{ rarityLabel[s.rarity] }}</div>
            <div v-if="s.canFruit">可结果</div>
          </div>
        </div>
      </div>

      <div style="flex: 1"></div>

      <button
        class="ff-btn moss block"
        style="margin-top: 0.28rem"
        :disabled="!selected || busy"
        @click="confirm"
      >
        种下这颗种子
      </button>
    </div>

    <transition name="ff-toast">
      <div v-if="toast" class="ff-toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { listSpecies, plantTree } from '@/api/focusTree'
import { TreeSpecies, RARITY_LABEL } from '@/types/focusTree'
import './focusTree.scss'

export default defineComponent({
  name: 'FocusForestPlant',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const dataMap = reactive({
      species: [] as TreeSpecies[],
      selected: '',
      busy: false,
      toast: '',
    })
    let toastTimer: ReturnType<typeof setTimeout> | null = null

    const showToast = (msg: string) => {
      dataMap.toast = msg
      if (toastTimer) clearTimeout(toastTimer)
      toastTimer = setTimeout(() => {
        dataMap.toast = ''
      }, 2000)
    }

    const keepQuery = () => ({
      name: route.query.name,
      token: route.query.token,
      effort: route.query.effort,
      dailyUserId: route.query.dailyUserId,
    })

    const goBack = () => {
      router.replace({ name: 'focus-tree', query: keepQuery() })
    }

    const confirm = async () => {
      if (!dataMap.selected || dataMap.busy) return
      dataMap.busy = true
      try {
        await plantTree(dataMap.selected)
        router.replace({ name: 'focus-tree', query: keepQuery() })
      } catch (e: any) {
        showToast(e?.message || '种植失败')
      } finally {
        dataMap.busy = false
      }
    }

    onMounted(async () => {
      try {
        const res: any = await listSpecies()
        dataMap.species = res.data || []
        if (dataMap.species.length) dataMap.selected = dataMap.species[0].id
      } catch (e: any) {
        showToast(e?.message || '加载失败')
      }
    })

    return {
      ...toRefs(dataMap),
      rarityLabel: RARITY_LABEL,
      goBack,
      confirm,
    }
  },
})
</script>
