<!--
 * @description: 专注森林 · 商店
-->
<template>
  <div class="ff-page">
    <div class="ff-ui">
      <div class="ff-top is-sub">
        <div class="back" @click="goBack">←</div>
        <div class="brand-block">
          <div class="brand">养护商店</div>
          <div class="tag">努力值 {{ effort }}</div>
        </div>
        <div style="width: 0.64rem"></div>
      </div>

      <div class="ff-shop-bag">
        <div class="cell">水滴 <b>{{ inv.waterDrop }}</b></div>
        <div class="cell">肥料 <b>{{ inv.fertilizer }}</b></div>
        <div class="cell">除草 <b>{{ inv.herbicide }}</b></div>
      </div>

      <div class="ff-shop-list">
        <div v-for="g in goods" :key="g.id" class="ff-shop-row">
          <div class="info">
            <div class="n">{{ g.name }}</div>
            <div class="d">{{ g.desc }}</div>
            <div class="p">{{ g.price }} 努力值 / {{ g.amount }}{{ g.unit }}</div>
          </div>
          <div class="ops">
            <button
              class="ff-btn ghost"
              :disabled="busy"
              @click="buy(g.id, 1)"
            >
              买 1
            </button>
            <button
              class="ff-btn moss"
              :disabled="busy"
              @click="buy(g.id, 10)"
            >
              买 10
            </button>
          </div>
        </div>
      </div>

      <div class="ff-note" style="margin-top: 0.28rem">
        水滴、肥料、除草剂均需在此购买。后期阶段难度更高，三项都要兼顾。
      </div>
    </div>

    <transition name="ff-toast">
      <div v-if="toast" class="ff-toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  getForestState,
  listShopGoods,
  buyShopItem,
} from '@/api/focusTree'
import { Inventory, ShopGoods, ShopItemId } from '@/types/focusTree'
import './focusTree.scss'

export default defineComponent({
  name: 'FocusForestShop',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const dataMap = reactive({
      goods: [] as ShopGoods[],
      inv: { waterDrop: 0, fertilizer: 0, herbicide: 0 } as Inventory,
      effort: 0,
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

    const load = async () => {
      try {
        const [st, sh]: any[] = await Promise.all([
          getForestState(),
          listShopGoods(),
        ])
        dataMap.inv = st.data.inventory
        dataMap.effort = st.data.effort ?? 0
        dataMap.goods = sh.data || []
      } catch (e: any) {
        showToast(e?.message || '加载失败')
      }
    }

    const buy = async (id: ShopItemId, count: number) => {
      if (dataMap.busy) return
      dataMap.busy = true
      try {
        const res: any = await buyShopItem(id, count)
        dataMap.inv = res.data.state.inventory
        dataMap.effort = res.data.effort
        showToast(`已购入，花费 ${res.data.spent} 努力值`)
      } catch (e: any) {
        showToast(e?.message || '购买失败')
      } finally {
        dataMap.busy = false
      }
    }

    onMounted(load)

    return {
      ...toRefs(dataMap),
      goBack,
      buy,
    }
  },
})
</script>
