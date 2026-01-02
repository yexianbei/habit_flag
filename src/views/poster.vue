<!--
 * @description: 
 * @LastEditTime: 2021-12-30 15:41:37
-->
<template>
  <div class="poster">
    <img :src="imgURL" class="imgURL" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed } from "vue";
import { useStore } from "../store";
export default defineComponent({
  setup() {
    const store = useStore();
    let dataMap = reactive({});

    const imgURL = computed(() => {
      return store.getters.imghtml;
    });

    return {
      ...toRefs(dataMap),
      imgURL,
    };
  },
});
</script>

<style lang="scss" scoped>
.poster {
  overflow-y: scroll;
  height: 100%;
}
.imgURL {
  width: 100%;
  display: block;
}
</style>
