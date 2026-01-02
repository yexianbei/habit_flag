<!--
 * @description: 
 * @LastEditTime: 2021-12-29 20:09:54
-->
<template>
  <transition name="fade">
    <div class="flex ac jc alert-box" v-show="alertShow">
      <div class="alert-cont">
        <div class="alert-name">{{ title }}</div>
        <div class="btn" @click="handleOK"></div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted } from "vue";
export default defineComponent({
  emits: ["update:show"],
  props: {
    alertShow: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
  },
  setup(props: any, { emit }: any) {
    const dataMap = reactive({});

    const handleOK = () => {
      emit("update:alertShow");
    };

    return {
      ...toRefs(dataMap),
      handleOK,
    };
  },
});
</script>

<style lang="scss" scoped>
.alert-box {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 101;
  background: rgba(0, 0, 0, 0.25);
  .alert-cont {
    width: 4.18rem;
    height: 2.44rem;
    background: url("@/assets/images/step3/alert_no_name.png") no-repeat center
      center;
    background-size: 100% auto;
    position: relative;
    .alert-name {
      text-align: center;
      margin-top: 0.6rem;
    }
    .btn {
      width: 100%;
      height: 0.8rem;
      position: absolute;
      left: 0;
      bottom: 0;
    }
  }
}
</style>