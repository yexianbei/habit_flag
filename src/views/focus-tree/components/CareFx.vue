<!--
 * @description: 专注森林 · 养护特效（纯代码绘制：内联 SVG 工具 + CSS 粒子动画）
 * 浇水：浇水壶倾斜倒水 / 水柱 / 水滴 / 落地水花 / 土壤湿润圈
 * 施肥：肥料袋倾倒 / 颗粒散落 / 土壤肥力光晕 / 嫩芽冒头
 * 除草：锄头挥掘 / 杂草连根飞起 / 尘土 / 翻土痕
-->
<template>
  <div class="ff-care-fx" :class="rootClass" aria-hidden="true">
    <!-- ══════════ 浇水 ══════════ -->
    <div class="fx-scene fx-scene-water">
      <svg class="fx-tool fx-can" viewBox="0 0 140 110" xmlns="http://www.w3.org/2000/svg">
        <!-- 顶部提手 -->
        <path d="M62 34 C62 10 100 10 100 34" fill="none" stroke="#25474e" stroke-width="7" stroke-linecap="round" />
        <!-- 右侧把手 -->
        <path d="M114 50 C140 48 140 88 114 84" fill="none" stroke="#25474e" stroke-width="9" stroke-linecap="round" />
        <!-- 壶嘴（朝左下） -->
        <path d="M54 55 L15 68 L20 85 L58 72 Z" fill="#4a8492" stroke="#25474e" stroke-width="4" stroke-linejoin="round" />
        <!-- 莲蓬头 -->
        <path d="M4 62 L20 60 L23 87 L7 89 Z" fill="#35636e" stroke="#25474e" stroke-width="4" stroke-linejoin="round" />
        <circle cx="11" cy="70" r="1.7" fill="#bfe0e6" />
        <circle cx="15" cy="76" r="1.7" fill="#bfe0e6" />
        <circle cx="12" cy="83" r="1.7" fill="#bfe0e6" />
        <!-- 壶身 -->
        <path d="M52 40 L108 40 Q116 40 116 48 L112 90 Q111 98 103 98 L60 98 Q52 98 52 90 Z" fill="#3a6f7c" stroke="#25474e" stroke-width="4" stroke-linejoin="round" />
        <path d="M60 48 L67 48 L66 90 L59 90 Z" fill="rgba(255,255,255,.22)" />
        <!-- 壶口沿 -->
        <path d="M50 32 L110 32 Q114 32 114 36 L114 41 L48 41 L48 36 Q48 32 50 32 Z" fill="#2b5862" stroke="#25474e" stroke-width="3" />
        <!-- 壶身水滴徽标 -->
        <path d="M84 58 C84 58 76 68 76 74 a8 8 0 0 0 16 0 C92 68 84 58 84 58 Z" fill="rgba(214,238,240,.46)" />
      </svg>

      <!-- 斜向水柱 -->
      <span class="fx-stream" />

      <!-- 水滴：起点在壶嘴，落点在树根（百分比适配各阶段树高） -->
      <span class="fx-drops">
        <i v-for="(s, i) in waterDrops" :key="'wd' + i" class="fx-wdrop" :style="s" />
      </span>

      <!-- 落地水花 -->
      <span class="fx-splashes">
        <i v-for="(s, i) in splashes" :key="'ws' + i" class="fx-splash" :style="s" />
      </span>

      <!-- 土壤湿润圈 -->
      <span class="fx-wet-ring" />
    </div>

    <!-- ══════════ 施肥 ══════════ -->
    <div class="fx-scene fx-scene-fert">
      <svg class="fx-tool fx-bag" viewBox="0 0 110 120" xmlns="http://www.w3.org/2000/svg">
        <!-- 敞开的袋口 -->
        <path d="M30 18 L80 18 L84 26 L26 26 Z" fill="#6f5336" stroke="#5a412a" stroke-width="3" stroke-linejoin="round" />
        <!-- 袋身 -->
        <path d="M22 38 L88 38 L94 106 Q94 112 88 112 L22 112 Q16 112 16 106 Z" fill="#d6b483" stroke="#8a6b4a" stroke-width="4" stroke-linejoin="round" />
        <!-- 折边 -->
        <path d="M22 38 L88 38 L84 26 L26 26 Z" fill="#b8945f" stroke="#8a6b4a" stroke-width="3" stroke-linejoin="round" />
        <!-- 侧面暗部 -->
        <path d="M78 40 L88 40 L94 106 Q94 112 88 112 L78 112 Z" fill="rgba(120,86,48,.18)" />
        <!-- 标签 -->
        <rect x="37" y="58" width="36" height="36" rx="4" fill="#f0e7d2" stroke="#8a6b4a" stroke-width="3" />
        <!-- 标签上的嫩芽 -->
        <path d="M55 86 L55 68" stroke="#3f7a58" stroke-width="3" stroke-linecap="round" />
        <path d="M55 75 C47 75 44 69 44 65 C51 65 55 69 55 75 Z" fill="#4e9167" />
        <path d="M55 71 C63 71 66 65 66 61 C59 61 55 65 55 71 Z" fill="#3f7a58" />
      </svg>

      <!-- 肥料颗粒 -->
      <span class="fx-grains">
        <i v-for="(s, i) in grains" :key="'gr' + i" class="fx-grain" :style="s" />
      </span>

      <!-- 土壤肥力光晕 -->
      <span class="fx-fert-glow" />

      <!-- 冒头的嫩芽 -->
      <span class="fx-sprout">
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 38 L20 18" stroke="#3f7a58" stroke-width="3.4" stroke-linecap="round" />
          <path d="M20 24 C11 24 7 18 7 12 C16 12 20 18 20 24 Z" fill="#4e9167" />
          <path d="M20 20 C29 20 33 14 33 8 C24 8 20 14 20 20 Z" fill="#3f7a58" />
        </svg>
      </span>
    </div>

    <!-- ══════════ 除草 ══════════ -->
    <div class="fx-scene fx-scene-weed">
      <!-- 树根两旁的杂草（被拔起前先存在） -->
      <span class="fx-weeds">
        <i v-for="(s, i) in weeds" :key="'we' + i" class="fx-weed" :style="s">
          <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 38 C17 26 11 17 5 11 C14 13 20 22 20 38 Z" fill="#5d8a4e" stroke="#3d6335" stroke-width="1.6" stroke-linejoin="round" />
            <path d="M20 38 C23 24 29 15 35 9 C29 16 24 26 22 38 Z" fill="#4a7841" stroke="#3d6335" stroke-width="1.6" stroke-linejoin="round" />
            <path d="M20 38 C20 24 20 13 20 5 C24 15 23 28 22 38 Z" fill="#6b9c55" stroke="#3d6335" stroke-width="1.6" stroke-linejoin="round" />
          </svg>
        </i>
      </span>

      <svg class="fx-tool fx-hoe" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
        <!-- 木柄 -->
        <path d="M64 6 L76 10 L44 104 L32 100 Z" fill="#b1844f" stroke="#6f4e30" stroke-width="4" stroke-linejoin="round" />
        <path d="M68 20 L54 64" stroke="rgba(111,78,48,.5)" stroke-width="2" stroke-linecap="round" />
        <!-- 金属套 -->
        <path d="M40 95 L50 99 L46 110 L36 106 Z" fill="#8d9895" stroke="#5c6663" stroke-width="3" stroke-linejoin="round" />
        <!-- 锄刃 -->
        <path d="M12 99 L42 107 L38 122 L8 114 Z" fill="#aab4b1" stroke="#5c6663" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M12 99 L42 107 L40 112 L10 104 Z" fill="rgba(255,255,255,.5)" />
      </svg>

      <!-- 翻起的尘土 -->
      <span class="fx-dusts">
        <i v-for="(s, i) in dusts" :key="'du' + i" class="fx-dust" :style="s" />
      </span>

      <!-- 翻土痕 -->
      <span class="fx-soil-line" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'

type FxAction = '' | 'water' | 'fertilize' | 'weed'
type ParticleStyle = Record<string, string>

/** 生成粒子：起点 / 落点均用百分比，自动适配不同阶段的树高 */
function makeParticles(
  count: number,
  build: (i: number) => ParticleStyle
): ParticleStyle[] {
  return Array.from({ length: count }, (_, i) => build(i))
}

export default defineComponent({
  name: 'CareFx',
  props: {
    action: { type: String as PropType<FxAction>, default: '' },
  },
  setup(props) {
    const rootClass = computed(() => {
      if (props.action === 'water') return 'is-water'
      if (props.action === 'fertilize') return 'is-fert'
      if (props.action === 'weed') return 'is-weed'
      return ''
    })

    // 水滴：从壶嘴（右上）斜落向树根（中部偏左）
    const waterDrops = makeParticles(14, (i) => {
      const lane = i % 4
      const wave = Math.floor(i / 4)
      return {
        '--x0': `${60 + lane * 1.5}%`,
        '--y0': `${16 + wave * 1.6}%`,
        '--x1': `${36 + lane * 6.2 + wave * 2.4}%`,
        '--y1': `${80 + (i % 3) * 5}%`,
        '--d': `${0.25 + i * 0.026}s`,
      }
    })

    // 落地水花：在树根附近四散（位移用 em，随树容器 font-size 缩放）
    const splashes = makeParticles(8, (i) => {
      const dir = i % 2 === 0 ? -1 : 1
      const step = Math.floor(i / 2)
      return {
        '--x0': `${42 + step * 4}%`,
        '--y0': '88%',
        '--sx': `${dir * (0.35 + step * 0.28)}em`,
        '--sy': `${-0.28 - step * 0.14}em`,
        '--d': `${0.52 + i * 0.045}s`,
      }
    })

    // 肥料颗粒：从袋口（左上）散落到土面
    const grains = makeParticles(16, (i) => {
      const lane = i % 4
      const wave = Math.floor(i / 4)
      return {
        '--x0': `${24 + lane * 2.2}%`,
        '--y0': `${22 + wave * 1.8}%`,
        '--x1': `${24 + lane * 12 + wave * 3.5}%`,
        '--y1': `${80 + (i % 4) * 4}%`,
        '--gr': `${(i % 2 ? 1 : -1) * (120 + i * 22)}deg`,
        '--d': `${0.28 + i * 0.02}s`,
      }
    })

    // 杂草：树根两侧，锄头挥过后连根飞起
    const weeds = makeParticles(4, (i) => ({
      '--x0': `${16 + i * 20}%`,
      '--y0': `${84 - (i % 2) * 4}%`,
      '--wx': `${(i % 2 ? 1 : -1) * (0.9 + i * 0.4)}em`,
      '--wy': `${-1.6 - i * 0.3}em`,
      '--wr': `${(i % 2 ? 1 : -1) * (40 + i * 18)}deg`,
      '--d': `${0.34 + i * 0.055}s`,
    }))

    // 尘土
    const dusts = makeParticles(7, (i) => ({
      '--x0': `${28 + i * 7}%`,
      '--y0': '90%',
      '--sx': `${(i % 2 ? 1 : -1) * (0.3 + i * 0.16)}em`,
      '--sy': `${-0.24 - (i % 3) * 0.14}em`,
      '--d': `${0.36 + i * 0.035}s`,
    }))

    return { rootClass, waterDrops, splashes, grains, weeds, dusts }
  },
})
</script>

<style lang="scss" scoped>
.ff-care-fx {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  overflow: visible;
}

/* 场景默认完全不渲染，切到对应动作才挂载 —— 保证每次触发都从头播放 */
.fx-scene {
  position: absolute;
  inset: 0;
  display: none;
  overflow: visible;
}

.ff-care-fx.is-water .fx-scene-water,
.ff-care-fx.is-fert .fx-scene-fert,
.ff-care-fx.is-weed .fx-scene-weed {
  display: block;
}

/* —— 工具：宽高百分比 + em 阴影，完整落在树容器内，避免被场景裁切到角落 —— */
.fx-tool {
  position: absolute;
  display: block;
  width: 42%;
  max-width: 4.2em;
  height: auto;
  opacity: 0;
  overflow: visible;
  filter: drop-shadow(0 0.12em 0.18em rgba(28, 36, 32, 0.18));
}

.fx-can {
  right: 2%;
  top: 2%;
  transform-origin: 68% 62%;
}

.fx-bag {
  left: 2%;
  top: 2%;
  transform-origin: 55% 22%;
}

.fx-hoe {
  right: 4%;
  top: 18%;
  width: 36%;
  max-width: 3.6em;
  transform-origin: 78% 12%;
}

/* ─────────── 浇水 ─────────── */
.is-water .fx-can {
  animation: fx-can-pour 1.6s ease-in-out both;
}

@keyframes fx-can-pour {
  0% { opacity: 0; transform: translate(0.9em, -0.35em) rotate(-8deg); }
  12% { opacity: 1; transform: translate(0, 0) rotate(-8deg); }
  24% { transform: translate(0, 0.12em) rotate(26deg); }
  34% { transform: translate(0, 0.12em) rotate(30deg); }
  64% { transform: translate(0, 0.12em) rotate(27deg); }
  76% { transform: translate(0, 0) rotate(-8deg); }
  88% { opacity: 1; transform: translate(0.2em, 0) rotate(-6deg); }
  100% { opacity: 0; transform: translate(0.95em, -0.25em) rotate(-8deg); }
}

/* 花洒水束：断续的细水流，避免形成一条实心水柱 */
.fx-stream {
  position: absolute;
  left: 52%;
  top: 22%;
  width: 0.16em;
  height: 36%;
  background: repeating-linear-gradient(
    180deg,
    rgba(140, 198, 212, 0.8) 0 0.2em,
    rgba(140, 198, 212, 0) 0.2em 0.38em
  );
  transform-origin: top center;
  transform: rotate(20deg) scaleY(0);
  opacity: 0;
}

.is-water .fx-stream {
  animation: fx-stream-on 0.9s ease-in-out 0.22s both;
}

@keyframes fx-stream-on {
  0% { opacity: 0; transform: rotate(20deg) scaleY(0); }
  18% { opacity: 0.75; transform: rotate(20deg) scaleY(1); }
  75% { opacity: 0.7; transform: rotate(20deg) scaleY(1); }
  100% { opacity: 0; transform: rotate(20deg) scaleY(0.2); }
}

.fx-wdrop {
  position: absolute;
  width: 0.28em;
  height: 0.55em;
  border-radius: 60% 60% 60% 60% / 40% 40% 70% 70%;
  background: linear-gradient(180deg, #d9f0f4 0%, #7cb9c8 45%, #3a6f7c 100%);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35);
  opacity: 0;
}

.is-water .fx-wdrop {
  animation: fx-wdrop-fall 0.62s cubic-bezier(0.42, 0.05, 0.72, 0.96) var(--d) both;
}

@keyframes fx-wdrop-fall {
  0% { opacity: 0; left: var(--x0); top: var(--y0); transform: scale(0.7); }
  12% { opacity: 1; }
  82% { opacity: 0.95; }
  100% { opacity: 0; left: var(--x1); top: var(--y1); transform: scale(0.55); }
}

.fx-splash {
  position: absolute;
  width: 0.2em;
  height: 0.2em;
  border-radius: 50%;
  background: #6fa9b8;
  opacity: 0;
}

.is-water .fx-splash {
  animation: fx-splash-pop 0.42s ease-out var(--d) both;
}

@keyframes fx-splash-pop {
  0% { opacity: 0; left: var(--x0); top: var(--y0); transform: translate(0, 0) scale(0.5); }
  30% { opacity: 0.95; }
  100% { opacity: 0; left: var(--x0); top: var(--y0); transform: translate(var(--sx), var(--sy)) scale(0.3); }
}

.fx-wet-ring {
  position: absolute;
  left: 30%;
  bottom: 2%;
  width: 44%;
  height: 12%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(58, 111, 124, 0.5), rgba(58, 111, 124, 0) 72%);
  opacity: 0;
  transform: scale(0.45);
}

.is-water .fx-wet-ring {
  animation: fx-wet 0.8s ease-out 0.58s both;
}

@keyframes fx-wet {
  0% { opacity: 0; transform: scale(0.45); }
  35% { opacity: 0.9; }
  100% { opacity: 0; transform: scale(1.45); }
}

/* ─────────── 施肥 ─────────── */
.is-fert .fx-bag {
  animation: fx-bag-tip 1.6s ease-in-out both;
}

@keyframes fx-bag-tip {
  0% { opacity: 0; transform: translate(-0.9em, -0.35em) rotate(12deg); }
  12% { opacity: 1; transform: translate(0, 0) rotate(12deg); }
  26% { transform: translate(0.14em, 0.14em) rotate(58deg); }
  68% { transform: translate(0.14em, 0.14em) rotate(55deg); }
  78% { transform: translate(0, 0) rotate(12deg); }
  88% { opacity: 1; transform: translate(-0.2em, 0) rotate(10deg); }
  100% { opacity: 0; transform: translate(-0.9em, -0.25em) rotate(12deg); }
}

.fx-grain {
  position: absolute;
  width: 0.24em;
  height: 0.24em;
  border-radius: 1px;
  background: #8a6b4a;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
  opacity: 0;
}

.fx-grain:nth-child(3n) { background: #a98856; }
.fx-grain:nth-child(4n) { background: #6f5336; }

.is-fert .fx-grain {
  animation: fx-grain-fall 0.7s cubic-bezier(0.4, 0.05, 0.75, 0.95) var(--d) both;
}

@keyframes fx-grain-fall {
  0% { opacity: 0; left: var(--x0); top: var(--y0); transform: rotate(0deg) scale(0.8); }
  14% { opacity: 1; }
  85% { opacity: 0.95; }
  100% { opacity: 0; left: var(--x1); top: var(--y1); transform: rotate(var(--gr)) scale(0.9); }
}

.fx-fert-glow {
  position: absolute;
  left: 24%;
  bottom: 0;
  width: 54%;
  height: 24%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(86, 150, 92, 0.42), rgba(86, 150, 92, 0) 70%);
  opacity: 0;
  transform: scale(0.5);
}

.is-fert .fx-fert-glow {
  animation: fx-fert-pulse 0.9s ease-out 0.6s both;
}

@keyframes fx-fert-pulse {
  0% { opacity: 0; transform: scale(0.5); }
  40% { opacity: 0.85; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.4); }
}

.fx-sprout {
  position: absolute;
  left: 44%;
  bottom: 3%;
  width: 1.15em;
  height: 1.15em;
  opacity: 0;
  transform-origin: 50% 100%;
  transform: scale(0.2) translateY(0.45em);

  svg { width: 100%; height: 100%; display: block; }
}

.is-fert .fx-sprout {
  animation: fx-sprout-up 0.7s cubic-bezier(0.2, 1.3, 0.4, 1) 0.74s both;
}

@keyframes fx-sprout-up {
  0% { opacity: 0; transform: scale(0.2) translateY(0.45em); }
  35% { opacity: 1; transform: scale(1) translateY(0); }
  75% { opacity: 1; transform: scale(1) translateY(0); }
  100% { opacity: 0; transform: scale(1.05) translateY(-0.18em); }
}

/* ─────────── 除草 ─────────── */
.is-weed .fx-hoe {
  animation: fx-hoe-dig 1.55s ease-in-out both;
}

/* 绕柄上端转动：正角度为举起、负角度为挥下掘土，锄刃扫过树根 */
@keyframes fx-hoe-dig {
  0% { opacity: 0; transform: translate(0.7em, -0.9em) rotate(18deg); }
  12% { opacity: 1; transform: translate(0.35em, -0.28em) rotate(14deg); }
  32% { transform: translate(-0.7em, 0.75em) rotate(-24deg); }
  42% { transform: translate(-0.55em, 0.6em) rotate(-20deg); }
  60% { transform: translate(0, 0) rotate(4deg); }
  76% { opacity: 1; transform: translate(0.3em, -0.28em) rotate(14deg); }
  100% { opacity: 0; transform: translate(0.7em, -0.9em) rotate(18deg); }
}

.fx-weed {
  position: absolute;
  display: block;
  width: 1.05em;
  height: 1.05em;
  left: var(--x0);
  top: var(--y0);
  opacity: 0;
  transform-origin: 50% 100%;

  svg { width: 100%; height: 100%; display: block; }
}

.is-weed .fx-weed {
  animation: fx-weed-pull 0.78s ease-out var(--d) both;
}

@keyframes fx-weed-pull {
  0% { opacity: 0; transform: translate(0, 0.18em) rotate(0deg) scale(0.85); }
  18% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
  38% { transform: translate(0, -0.06em) rotate(-6deg) scale(1); }
  100% { opacity: 0; transform: translate(var(--wx), var(--wy)) rotate(var(--wr)) scale(0.7); }
}

.fx-dust {
  position: absolute;
  width: 0.22em;
  height: 0.22em;
  border-radius: 50%;
  background: #a68a66;
  opacity: 0;
}

.is-weed .fx-dust {
  animation: fx-dust-pop 0.5s ease-out var(--d) both;
}

@keyframes fx-dust-pop {
  0% { opacity: 0; left: var(--x0); top: var(--y0); transform: translate(0, 0) scale(0.6); }
  25% { opacity: 0.8; }
  100% { opacity: 0; left: var(--x0); top: var(--y0); transform: translate(var(--sx), var(--sy)) scale(1.2); }
}

.fx-soil-line {
  position: absolute;
  left: 28%;
  bottom: 3%;
  width: 46%;
  height: 0.3em;
  border-bottom: 0.1em solid rgba(138, 107, 74, 0.75);
  border-radius: 50%;
  opacity: 0;
  transform: scaleX(0.3);
}

.is-weed .fx-soil-line {
  animation: fx-soil-sweep 0.7s ease-out 0.36s both;
}

@keyframes fx-soil-sweep {
  0% { opacity: 0; transform: scaleX(0.3); }
  35% { opacity: 0.85; transform: scaleX(1); }
  100% { opacity: 0; transform: scaleX(1.25); }
}
</style>
