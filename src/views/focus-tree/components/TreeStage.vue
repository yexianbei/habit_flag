<!--
 * @description: 专注森林 · 像素树精灵（按物种分阶段贴图）
-->
<template>
  <div
    class="ff-tree"
    :class="[healthState, 'stage-' + stage, 'species-' + speciesId]"
  >
    <div class="ff-tree-sprite sway">
      <img
        class="ff-tree-img"
        :src="spriteSrc"
        :alt="speciesName + ' · ' + stage"
        draggable="false"
      />
    </div>
    <CareFx :action="fx" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import {
  TreeStage as Stage,
  TreeHealthState,
  getSpecies,
} from '@/types/focusTree'
import CareFx from './CareFx.vue'

import imgSeed from '@/assets/images/focus-tree/tree-seed.png'
import imgSprout from '@/assets/images/focus-tree/tree-sprout.png'
import imgSmall from '@/assets/images/focus-tree/tree-small.png'
import imgMid from '@/assets/images/focus-tree/tree-mid.png'
import imgBloom from '@/assets/images/focus-tree/tree-bloom-sakura.png'
import imgGiant from '@/assets/images/focus-tree/tree-giant.png'
import imgAutumn from '@/assets/images/focus-tree/tree-fruit-autumn.png'
import imgGrow from '@/assets/images/focus-tree/tree-grow-green.png'

import imgWitherSprout from '@/assets/images/focus-tree/tree-wither-sprout.png'
import imgWitherSmall from '@/assets/images/focus-tree/tree-wither-small.png'
import imgWitherBloom from '@/assets/images/focus-tree/tree-wither-bloom.png'
import imgDead from '@/assets/images/focus-tree/tree-dead.png'
import imgDeadMid from '@/assets/images/focus-tree/tree-dead-mid.png'

import qingtongSeed from '@/assets/images/focus-tree/tree-qingtong-seed.png'
import qingtongSprout from '@/assets/images/focus-tree/tree-qingtong-sprout.png'
import qingtongGrow from '@/assets/images/focus-tree/tree-qingtong-grow.png'
import qingtongMid from '@/assets/images/focus-tree/tree-qingtong-mid.png'
import qingtongBloom from '@/assets/images/focus-tree/tree-qingtong-bloom.png'

import yingSeed from '@/assets/images/focus-tree/tree-ying-seed.png'
import yingSprout from '@/assets/images/focus-tree/tree-ying-sprout.png'
import yingGrow from '@/assets/images/focus-tree/tree-ying-grow.png'
import yingMid from '@/assets/images/focus-tree/tree-ying-mid.png'
import yingBloom from '@/assets/images/focus-tree/tree-ying-bloom.png'

import yinxingSeed from '@/assets/images/focus-tree/tree-yinxing-seed.png'
import yinxingSprout from '@/assets/images/focus-tree/tree-yinxing-sprout.png'
import yinxingGrow from '@/assets/images/focus-tree/tree-yinxing-grow.png'
import yinxingMid from '@/assets/images/focus-tree/tree-yinxing-mid.png'
import yinxingBloom from '@/assets/images/focus-tree/tree-yinxing-bloom.png'
import yinxingFruit from '@/assets/images/focus-tree/tree-yinxing-fruit.png'

import songSeed from '@/assets/images/focus-tree/tree-song-seed.png'
import songSprout from '@/assets/images/focus-tree/tree-song-sprout.png'
import songGrow from '@/assets/images/focus-tree/tree-song-grow.png'
import songMid from '@/assets/images/focus-tree/tree-song-mid.png'
import songBloom from '@/assets/images/focus-tree/tree-song-bloom.png'

import ningmengSeed from '@/assets/images/focus-tree/tree-ningmeng-seed.png'
import ningmengSprout from '@/assets/images/focus-tree/tree-ningmeng-sprout.png'
import ningmengGrow from '@/assets/images/focus-tree/tree-ningmeng-grow.png'
import ningmengMid from '@/assets/images/focus-tree/tree-ningmeng-mid.png'
import ningmengBloom from '@/assets/images/focus-tree/tree-ningmeng-bloom.png'
import ningmengFruit from '@/assets/images/focus-tree/tree-ningmeng-fruit.png'

import zitengSeed from '@/assets/images/focus-tree/tree-ziteng-seed.png'
import zitengSprout from '@/assets/images/focus-tree/tree-ziteng-sprout.png'
import zitengGrow from '@/assets/images/focus-tree/tree-ziteng-grow.png'
import zitengMid from '@/assets/images/focus-tree/tree-ziteng-mid.png'
import zitengBloom from '@/assets/images/focus-tree/tree-ziteng-bloom.png'

import fengSeed from '@/assets/images/focus-tree/tree-feng-seed.png'
import fengSprout from '@/assets/images/focus-tree/tree-feng-sprout.png'
import fengGrow from '@/assets/images/focus-tree/tree-feng-grow.png'
import fengMid from '@/assets/images/focus-tree/tree-feng-mid.png'
import fengBloom from '@/assets/images/focus-tree/tree-feng-bloom.png'

import zhuSeed from '@/assets/images/focus-tree/tree-zhu-seed.png'
import zhuSprout from '@/assets/images/focus-tree/tree-zhu-sprout.png'
import zhuGrow from '@/assets/images/focus-tree/tree-zhu-grow.png'
import zhuMid from '@/assets/images/focus-tree/tree-zhu-mid.png'
import zhuBloom from '@/assets/images/focus-tree/tree-zhu-bloom.png'

type StageMap = Partial<Record<Stage, string>>

const SPECIES_SPRITES: Record<string, StageMap> = {
  qingtong: {
    seed: qingtongSeed,
    sprout: qingtongSprout,
    grow: qingtongGrow,
    mid: qingtongMid,
    bloom: qingtongBloom,
  },
  ying: {
    seed: yingSeed,
    sprout: yingSprout,
    grow: yingGrow,
    mid: yingMid,
    bloom: yingBloom,
  },
  yinxing: {
    seed: yinxingSeed,
    sprout: yinxingSprout,
    grow: yinxingGrow,
    mid: yinxingMid,
    bloom: yinxingBloom,
    fruit: yinxingFruit,
  },
  song: {
    seed: songSeed,
    sprout: songSprout,
    grow: songGrow,
    mid: songMid,
    bloom: songBloom,
  },
  ningmeng: {
    seed: ningmengSeed,
    sprout: ningmengSprout,
    grow: ningmengGrow,
    mid: ningmengMid,
    bloom: ningmengBloom,
    fruit: ningmengFruit,
  },
  ziteng: {
    seed: zitengSeed,
    sprout: zitengSprout,
    grow: zitengGrow,
    mid: zitengMid,
    bloom: zitengBloom,
  },
  feng: {
    seed: fengSeed,
    sprout: fengSprout,
    grow: fengGrow,
    mid: fengMid,
    bloom: fengBloom,
  },
  zhu: {
    seed: zhuSeed,
    sprout: zhuSprout,
    grow: zhuGrow,
    mid: zhuMid,
    bloom: zhuBloom,
  },
}

function fallbackSprite(speciesId: string, stage: Stage): string {
  const autumn = speciesId === 'feng' || speciesId === 'yinxing'
  switch (stage) {
    case 'seed':
      return imgSeed
    case 'sprout':
      return imgSprout
    case 'grow':
      return imgSmall
    case 'mid':
      return autumn ? imgGrow : imgMid
    case 'bloom':
      return autumn ? imgAutumn : imgBloom
    case 'fruit':
      return autumn || speciesId === 'ningmeng' ? imgAutumn : imgGiant
    default:
      return imgSmall
  }
}

function healthySprite(speciesId: string, stage: Stage): string {
  const mapped = SPECIES_SPRITES[speciesId]?.[stage]
  if (mapped) return mapped
  return fallbackSprite(speciesId, stage)
}

/** 枯萎：叶稀、发褐，仍留一点残叶 */
function witherSprite(stage: Stage): string {
  switch (stage) {
    case 'seed':
    case 'sprout':
      return imgWitherSprout
    case 'grow':
      return imgWitherSmall
    case 'mid':
    case 'bloom':
    case 'fruit':
      return imgWitherBloom
    default:
      return imgWitherSmall
  }
}

/** 枯死：光秃枝干 */
function deadSprite(stage: Stage): string {
  switch (stage) {
    case 'seed':
    case 'sprout':
      return imgWitherSprout
    case 'grow':
    case 'mid':
      return imgDeadMid
    case 'bloom':
    case 'fruit':
      return imgDead
    default:
      return imgDeadMid
  }
}

export default defineComponent({
  name: 'TreeStage',
  components: { CareFx },
  props: {
    speciesId: { type: String, required: true },
    stage: { type: String as PropType<Stage>, required: true },
    healthState: {
      type: String as PropType<TreeHealthState>,
      default: 'healthy',
    },
    fx: { type: String as PropType<'' | 'water' | 'fertilize' | 'weed'>, default: '' },
  },
  setup(props) {
    const species = computed(() => getSpecies(props.speciesId))
    const speciesName = computed(() => species.value?.name || '树')

    const spriteSrc = computed(() => {
      if (props.healthState === 'dead') return deadSprite(props.stage)
      if (props.healthState === 'withering') return witherSprite(props.stage)
      return healthySprite(props.speciesId, props.stage)
    })

    return {
      speciesName,
      spriteSrc,
    }
  },
})
</script>
