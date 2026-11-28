<!--
 * @description: 
 * @LastEditTime: 2024-11-29 10:36:12
-->
<template>
  <router-view v-slot="{ Component }">
    <transition name="homeapp">
      <component :is="Component" />
    </transition>
  </router-view>
  <!-- 签名层在路由之外、#app 内最后渲染，配合隐藏抽签底栏，避免叠层/丢层 -->
  <sign
    :show="signVisible"
    :mainColor="signMainColor"
    :ready="signReady"
    @update:show="onSignShow"
    @finish="onSignFinish"
  />
</template>

<script lang="ts">
import { defineComponent, watch, computed } from "vue";
import { useStore } from "./store";
import { useRoute, useRouter } from "vue-router";
import sign from "./components/sign.vue";

export default defineComponent({
  name: "App",
  components: { sign },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const signVisible = computed(() => store.state.signVisible);
    const signMainColor = computed(() => store.state.signMainColor);
    const signReady = computed(() => store.state.signReady);
    // 仅隐藏签名表单，不要 END 整个流程（否则倒计时期间底栏会杀回来）
    const onSignShow = (v: boolean) => {
      if (!v) store.commit("CLOSE_SIGN_FORM");
    };
    const onSignFinish = (name: string) => {
      store.dispatch("ACTION_FINISH_SIGN", name);
    };
    watch(
      () => [route.name, route.path] as const,
      ([val, path]) => {
        console.log("router", val, path, store.state.stat);
        // 路由尚未解析完成时不要做鉴权跳转，否则 #/focus-tree 会被误踢回首页
        if (val == null && (!path || path === "/")) {
          return;
        }
        const nameStr = typeof val === "string" ? val : "";
        const pathStr = typeof path === "string" ? path : "";
        const isLifeGoal =
          nameStr.indexOf("life-goal") === 0 ||
          pathStr.indexOf("/life-goal") === 0;
        const isFocusTree =
          nameStr.indexOf("focus-tree") === 0 ||
          pathStr.indexOf("/focus-tree") === 0;
        document.title = isLifeGoal
          ? "心愿岛"
          : isFocusTree
          ? "专注森林"
          : "你·的·Flag";
        if (val === "index" || isLifeGoal || isFocusTree) {
          store.dispatch("ACTIONSETSTAT", "1");
        } else {
          const tokenFromQuery = route.query.token as string;
          const tokenFromStorage = localStorage.getItem("Authorization");
          const hasToken =
            (tokenFromQuery && tokenFromQuery !== "") ||
            (tokenFromStorage && tokenFromStorage !== "");

          if (hasToken) {
            const token = tokenFromQuery || tokenFromStorage || "";
            if (token) {
              store.dispatch("ACTIONSETTOKEN", token);
              localStorage.setItem("Authorization", token);
            }
            store.dispatch("ACTIONSETSTAT", "1");
          } else {
            let stat = store.state.stat;
            if (stat === "0") {
              router.replace({
                name: "index",
                query: {
                  name: route.query.name,
                },
              });
            }
          }
        }
      },
      { immediate: true }
    );

    // watch(
    //     () => store.state.stat,
    //     (val) => {
    //         routervalue = router.currentRoute.value.query
    //         debugger
    //         console.log("stat", val);
    //         // if (val === "0") {
    //         //     router.replace({
    //         //         name: "index"
    //         //     });
    //         // }
    //     }, {
    //         immediate: true
    //     }
    // );
    return {
      signVisible,
      signMainColor,
      signReady,
      onSignShow,
      onSignFinish,
    };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.homeapp-enter-active {
  animation: moveIn 0.5s ease-in-out;
}

.homeapp-leave-active {
  animation: moveOut 0.5s ease-in-out;
}

@keyframes moveIn {
  0% {
    opacity: 0;
    /* transform: translateY(200px); */
  }
  100% {
    opacity: 1;
    /* transform: translateY(0px); */
  }
}

@keyframes moveOut {
  0% {
    opacity: 1;
    /* transform: translateY(0); */
  }
  100% {
    opacity: 0;
    /* transform: translateY(-200px); */
  }
}
</style>
