<!--
 * 签名页（独立路由，与 Flag/抽签一样整页跳转，避免安卓浮层不显示）
-->
<template>
  <div class="sign-page">
    <sign
      :show="true"
      :pageMode="true"
      :mainColor="mainColor"
      :ready="ready"
      @finish="onFinish"
      @update:show="onUpdateShow"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "../../store";
import sign from "@/components/sign.vue";

export default defineComponent({
  name: "SignPage",
  components: { sign },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const mainColor = computed(
      () => store.state.signMainColor || "#ff5f47"
    );
    const ready = computed(() => store.state.signReady);

    const onFinish = (name: string) => {
      store.dispatch("ACTION_FINISH_SIGN", name);
      // 回到抽签页做截图（keep-alive 保留海报 DOM），再进海报
      const q: Record<string, any> = { ...route.query };
      q._capture = "1";
      q._signName = name;
      router.replace({
        name: "draw",
        query: q,
      });
    };

    // 页面模式下忽略关层；倒计时仍由组件内部处理
    const onUpdateShow = (_v: boolean) => {};

    return {
      mainColor,
      ready,
      onFinish,
      onUpdateShow,
    };
  },
});
</script>

<style scoped>
.sign-page {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #ff5f47;
}
</style>
