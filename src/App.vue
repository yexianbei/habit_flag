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
      () => route.name,
      (val) => {
        console.log("router", val, store.state.stat);
        if (val === "index") {
          // let routervalue = router.currentRoute.value.query || {}
          store.dispatch("ACTIONSETSTAT", "1");
        } else {
          // let routercache = store.state.tokencache
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
