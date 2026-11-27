<!--
 * @description: 种下一座心愿岛
-->
<template>
  <div class="isle-page isle-form-page">
    <div class="isle-ui" style="min-height: auto">
      <div class="isle-top">
        <div class="back" @click="handleBack">‹</div>
        <div class="brand-block">
          <div class="brand">种下一座岛</div>
          <div class="tag">给心愿一片土壤</div>
        </div>
        <div style="width: 0.72rem"></div>
      </div>

      <div class="isle-glass isle-form">
        <div class="field">
          <label>🏝️ 岛屿名称</label>
          <input v-model="title" maxlength="30" placeholder="例如：学会做一手好菜" />
        </div>

        <div class="field">
          <label>💭 心愿语（写给未来的自己）</label>
          <textarea
            v-model="vision"
            maxlength="80"
            placeholder="为什么想拥有这座岛？"
          ></textarea>
        </div>

        <div class="field">
          <label>🌤️ 岛屿气候</label>
          <div class="biome-grid">
            <div
              class="biome"
              v-for="m in moods"
              :key="m.id"
              :class="{ active: coverMood === m.id }"
              :style="{ color: m.color }"
              @click="coverMood = m.id"
            >
              <div class="dot" :style="{ background: m.color }"></div>
              {{ m.label }}
            </div>
          </div>
        </div>

        <div class="field">
          <label>📅 期望丰收日（可选）</label>
          <input type="date" v-model="targetDate" />
        </div>

        <div class="field">
          <label>🎮 成长关卡（3～7）</label>
          <div class="ms-list">
            <div class="ms-item" v-for="(item, index) in milestones" :key="index">
              <div class="lv">{{ index + 1 }}</div>
              <input v-model="item.name" maxlength="20" placeholder="关卡名称" />
              <div class="del" v-if="milestones.length > 3" @click="removeMs(index)">×</div>
            </div>
          </div>
          <div class="ms-tools">
            <span @click="applyTemplate">使用成长模板</span>
            <span v-if="milestones.length < 7" @click="addMs">＋ 加一关</span>
          </div>
        </div>
      </div>

      <button
        class="isle-btn"
        style="margin-top: 0.2rem"
        :disabled="!canSubmit || submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '发芽中...' : '🌱 种下种子' }}
      </button>
    </div>

    <div class="isle-celebrate" v-if="showSuccess">
      <div class="burst">🌱</div>
      <div class="c-title">种子已入土</div>
      <div class="c-sub">这座岛，从今天开始生长</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createLifeGoal } from '@/api/lifeGoal'
import {
  COVER_MOODS,
  CoverMood,
  DEFAULT_MILESTONE_TEMPLATE,
} from '@/types/lifeGoal'
import './lifeGoal.scss'

export default defineComponent({
  name: 'LifeGoalCreate',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const dataMap = reactive({
      title: '',
      vision: '',
      coverMood: 'mint' as CoverMood,
      targetDate: '',
      milestones: DEFAULT_MILESTONE_TEMPLATE.map((name) => ({ name })),
      moods: COVER_MOODS,
      submitting: false,
      showSuccess: false,
    })

    const canSubmit = computed(() => {
      const names = dataMap.milestones.map((m) => m.name.trim()).filter(Boolean)
      return dataMap.title.trim() && names.length >= 3 && names.length <= 7
    })

    const handleBack = () => router.back()
    const applyTemplate = () => {
      dataMap.milestones = DEFAULT_MILESTONE_TEMPLATE.map((name) => ({ name }))
    }
    const addMs = () => {
      if (dataMap.milestones.length < 7) dataMap.milestones.push({ name: '' })
    }
    const removeMs = (i: number) => {
      if (dataMap.milestones.length > 3) dataMap.milestones.splice(i, 1)
    }

    const handleSubmit = async () => {
      if (!canSubmit.value || dataMap.submitting) return
      dataMap.submitting = true
      try {
        const res: any = await createLifeGoal({
          title: dataMap.title,
          vision: dataMap.vision,
          coverMood: dataMap.coverMood,
          targetDate: dataMap.targetDate || undefined,
          milestones: dataMap.milestones
            .map((m) => ({ name: m.name.trim() }))
            .filter((m) => m.name),
        })
        dataMap.showSuccess = true
        setTimeout(() => {
          router.replace({
            name: 'life-goal-detail',
            params: { id: res.data.id },
            query: { ...route.query },
          })
        }, 1100)
      } catch (e: any) {
        alert(e?.message || '创建失败')
      } finally {
        dataMap.submitting = false
      }
    }

    return {
      ...toRefs(dataMap),
      canSubmit,
      handleBack,
      applyTemplate,
      addMs,
      removeMs,
      handleSubmit,
    }
  },
})
</script>
