<!--
 * @description: 图鉴剪影 · 每种树轮廓 / 高低各异
-->
<template>
  <svg class="silhouette" :viewBox="vb" xmlns="http://www.w3.org/2000/svg">
    <!-- 地面 -->
    <line
      :x1="ground.x1"
      y1="90"
      :x2="ground.x2"
      y2="90"
      :stroke="ink"
      stroke-opacity="0.18"
      stroke-width="2"
    />

    <!-- 青桐：高挑伞盖 -->
    <g v-if="id === 'qingtong'">
      <path
        d="M40 88 L40 42"
        fill="none"
        :stroke="bark"
        stroke-width="4"
        stroke-linecap="square"
      />
      <ellipse cx="40" cy="30" rx="22" ry="16" :fill="leaf" />
      <ellipse cx="40" cy="24" rx="14" ry="9" :fill="leafLite" opacity="0.85" />
    </g>

    <!-- 樱：中高、冠层蓬松分叉 -->
    <g v-else-if="id === 'ying'">
      <path
        d="M40 88 L40 50 M40 58 L28 38 M40 58 L52 36 M40 50 L40 32"
        fill="none"
        :stroke="bark"
        stroke-width="3.2"
        stroke-linecap="square"
        stroke-linejoin="miter"
      />
      <circle cx="28" cy="32" r="11" :fill="leaf" />
      <circle cx="40" cy="24" r="12" :fill="leafLite" />
      <circle cx="52" cy="30" r="11" :fill="leaf" />
      <circle cx="34" cy="38" r="7" :fill="leaf" opacity="0.8" />
      <circle cx="48" cy="38" r="7" :fill="leaf" opacity="0.8" />
    </g>

    <!-- 银杏：扇形冠、偏矮壮 -->
    <g v-else-if="id === 'yinxing'">
      <path
        d="M40 88 L40 48 M40 55 L26 40 M40 55 L54 40"
        fill="none"
        :stroke="bark"
        stroke-width="4"
        stroke-linecap="square"
      />
      <path
        d="M18 48 Q28 22 40 28 Q52 22 62 48 Q50 42 40 44 Q30 42 18 48 Z"
        :fill="leaf"
      />
      <path
        d="M28 40 Q40 30 52 40 Q44 36 40 38 Q36 36 28 40 Z"
        :fill="leafLite"
        opacity="0.9"
      />
    </g>

    <!-- 松：最高、层层尖塔 -->
    <g v-else-if="id === 'song'">
      <path
        d="M40 88 L40 28"
        fill="none"
        :stroke="bark"
        stroke-width="3.5"
        stroke-linecap="square"
      />
      <polygon points="40,10 26,32 54,32" :fill="leaf" />
      <polygon points="40,22 22,46 58,46" :fill="leaf" opacity="0.95" />
      <polygon points="40,36 18,62 62,62" :fill="leafDeep" />
      <polygon points="40,12 32,26 48,26" :fill="leafLite" opacity="0.85" />
    </g>

    <!-- 柠檬：矮圆、挂果点 -->
    <g v-else-if="id === 'ningmeng'">
      <path
        d="M40 88 L40 58"
        fill="none"
        :stroke="bark"
        stroke-width="4.5"
        stroke-linecap="square"
      />
      <ellipse cx="40" cy="48" rx="20" ry="18" :fill="leaf" />
      <ellipse cx="40" cy="42" rx="12" ry="10" :fill="leafLite" opacity="0.85" />
      <ellipse cx="30" cy="52" rx="3.5" ry="4.5" :fill="hue" />
      <ellipse cx="48" cy="50" rx="3.5" ry="4.5" :fill="hue" />
      <ellipse cx="40" cy="56" rx="3" ry="4" :fill="hue" opacity="0.9" />
    </g>

    <!-- 紫藤：攀缘垂瀑、横向铺展 -->
    <g v-else-if="id === 'ziteng'">
      <path
        d="M22 88 L28 50 L40 30 L52 48 L58 88"
        fill="none"
        :stroke="bark"
        stroke-width="2.8"
        stroke-linecap="square"
        stroke-linejoin="miter"
      />
      <path
        d="M28 50 L18 42 M52 48 L62 40 M40 30 L40 18"
        fill="none"
        :stroke="bark"
        stroke-width="2"
      />
      <ellipse cx="18" cy="36" rx="7" ry="14" :fill="leaf" />
      <ellipse cx="30" cy="28" rx="8" ry="16" :fill="leafLite" />
      <ellipse cx="42" cy="22" rx="9" ry="15" :fill="leaf" />
      <ellipse cx="54" cy="30" rx="8" ry="16" :fill="leafLite" />
      <ellipse cx="64" cy="38" rx="6" ry="12" :fill="leaf" />
    </g>

    <!-- 枫：中高、不规则宽冠略倾 -->
    <g v-else-if="id === 'feng'">
      <path
        d="M38 88 L42 52 L36 30"
        fill="none"
        :stroke="bark"
        stroke-width="4"
        stroke-linecap="square"
        stroke-linejoin="miter"
      />
      <path
        d="M42 52 L24 36 M42 52 L58 34 M36 38 L28 24 M36 38 L48 22"
        fill="none"
        :stroke="bark"
        stroke-width="2.6"
        stroke-linecap="square"
      />
      <circle cx="24" cy="30" r="10" :fill="leaf" />
      <circle cx="36" cy="18" r="11" :fill="leafLite" />
      <circle cx="50" cy="20" r="12" :fill="leaf" />
      <circle cx="58" cy="32" r="9" :fill="leaf" opacity="0.9" />
      <circle cx="30" cy="40" r="7" :fill="leafDeep" opacity="0.85" />
    </g>

    <!-- 竹：极高细杆、顶叶疏朗 -->
    <g v-else-if="id === 'zhu'">
      <path
        d="M34 88 L34 18 M46 88 L46 22"
        fill="none"
        :stroke="bark"
        stroke-width="3"
        stroke-linecap="square"
      />
      <path
        d="M34 40 L34 38 M34 55 L34 53 M34 70 L34 68 M46 44 L46 42 M46 60 L46 58 M46 74 L46 72"
        fill="none"
        :stroke="leafDeep"
        stroke-width="2.2"
      />
      <ellipse cx="26" cy="16" rx="10" ry="4" :fill="leaf" transform="rotate(-25 26 16)" />
      <ellipse cx="40" cy="12" rx="11" ry="4" :fill="leafLite" transform="rotate(8 40 12)" />
      <ellipse cx="54" cy="18" rx="10" ry="4" :fill="leaf" transform="rotate(28 54 18)" />
      <ellipse cx="30" cy="28" rx="8" ry="3.5" :fill="leaf" transform="rotate(-20 30 28)" />
      <ellipse cx="50" cy="30" rx="8" ry="3.5" :fill="leafLite" transform="rotate(22 50 30)" />
    </g>

    <!-- 兜底 -->
    <g v-else>
      <path
        d="M40 88 L40 40"
        fill="none"
        :stroke="bark"
        stroke-width="4"
        stroke-linecap="square"
      />
      <circle cx="40" cy="32" r="16" :fill="leaf" />
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { getSpecies } from '@/types/focusTree'

function shade(hex: string, amt: number) {
  try {
    const h = hex.replace('#', '')
    const full =
      h.length === 3
        ? h
            .split('')
            .map((c) => c + c)
            .join('')
        : h
    const n = parseInt(full, 16)
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
    const r = clamp(((n >> 16) & 255) + amt)
    const g = clamp(((n >> 8) & 255) + amt)
    const b = clamp((n & 255) + amt)
    return (
      '#' +
      [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
    )
  } catch {
    return hex
  }
}

export default defineComponent({
  name: 'ForestSilhouette',
  props: {
    speciesId: { type: String, required: true },
  },
  setup(props) {
    const sp = computed(() => getSpecies(props.speciesId))
    const id = computed(() => props.speciesId)
    const leaf = computed(() => sp.value?.leaf || '#6bbf7a')
    const hue = computed(() => sp.value?.hue || leaf.value)
    const leafLite = computed(() => shade(leaf.value, 28))
    const leafDeep = computed(() => shade(leaf.value, -28))
    const bark = '#4a3428'
    const ink = '#1c2420'
    const vb = '0 0 80 96'
    const ground = computed(() => {
      // 按体型调地面宽度，暗示高低胖瘦
      switch (props.speciesId) {
        case 'zhu':
          return { x1: 24, x2: 56 }
        case 'song':
          return { x1: 16, x2: 64 }
        case 'ziteng':
          return { x1: 12, x2: 68 }
        case 'ningmeng':
          return { x1: 22, x2: 58 }
        case 'yinxing':
          return { x1: 16, x2: 64 }
        default:
          return { x1: 18, x2: 62 }
      }
    })

    return {
      id,
      leaf,
      hue,
      leafLite,
      leafDeep,
      bark,
      ink,
      vb,
      ground,
    }
  },
})
</script>
