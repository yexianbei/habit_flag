<!--
 * @description: 
 * @LastEditTime: 2024-11-29 10:36:12
-->
<template>
  <router-view v-slot="{ Component }">
    <!-- 不用 transition：X5/安卓常丢 animationend，新页面会卡在 opacity:0「像没跳转」 -->
    <!-- keep-alive：签名完成回抽签截图时保留海报 DOM -->
    <keep-alive include="DrawPage">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { useStore } from "./store";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  name: "App",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
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
</style>
