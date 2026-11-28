<!--
 * @description: 
 * @LastEditTime: 2024-11-28 22:20:50
-->
<template>
  <!-- 不再手动 appendChild：安卓上挪 DOM 会导致「底栏藏了但签名页不出现」 -->
  <div
    v-if="show"
    class="sign-wrap"
    :style="{ backgroundColor: mainColor || '#ff5f47' }"
  >
    <div class="draw-tip">
      <img class="img" src="@/assets/images/step3/flag-step3.png" />
    </div>
    <div class="sign-cont">
      <div
        class="sign-readme"
        :class="{ heartFade: heartFade }"
        @click="handleCheck"
      >
        <i :class="{ check: isCheck }"></i>
        我已认真阅读以上建议，请未来放心，新的一年我会继续加油！
      </div>
      <input
        type="text"
        class="sign-text"
        v-model="signName"
        maxlength="8"
        placeholder="准备好了，就在此署名吧"
      />
      <div class="next" @click="handleFinish"></div>
    </div>
  </div>

  <!--弹窗-->
  <modal :title="title" v-model:alertShow="alertShow" />
  <div
    v-if="coutShow"
    class="flex ac jc cout-down"
    :style="{ backgroundColor: mainColor || '#ff5f47' }"
  >
    <div class="cout-cont">
      <div class="cout-time" v-for="item in 3" :key="item">
        <div
          class="cont-border flex ac jc"
          :class="`time${item}`"
          v-show="current >= item"
        >
          <div class="line" v-show="current === item"></div>
        </div>
        <div class="flex ac jc time-num">
          <span v-show="current === item">{{ item }}</span>
          <div
            class="flex ac jc cout-text"
            v-show="current <= 0 && flagReady"
          >
            你·的·新·年·Flag<br /><br />正式生效
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onBeforeUnmount,
  reactive,
  toRefs,
  watchEffect,
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import modal from "@/components/modal.vue";
import { useStore } from "@/store";
export default defineComponent({
  components: {
    modal,
  },
  emits: ["finish", "update:show"],
  props: {
    mainColor: {
      type: String,
      default: "#ff5f47",
    },
    show: {
      type: Boolean,
      default: false,
    },
    ready: {
      type: Boolean,
      default: false,
    },
    // 独立路由页模式：完成签名后由页面跳转截图，不再走页内倒计时浮层
    pageMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: any, { emit }: any) {
    console.log("props", props);
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const dataMap = reactive({
      isCheck: true,
      signName: "",
      alertShow: false,
      heartFade: false,
      current: 3,
      coutShow: false,
      timer: "" as any,
      title: "",
      flagReady: false,
    });

    const resolveSignName = () => {
      const q = route.query;
      const raw = (q.nickname || q.name || "") as string;
      return typeof raw === "string" ? raw.trim() : "";
    };

    const syncBodyLock = (on: boolean) => {
      document.body.classList.toggle("hf-sign-open", on);
      const app = document.getElementById("app");
      if (app) {
        app.classList.toggle("hf-sign-open", on);
      }
    };

    watch(
      () => props.show,
      (visible: boolean) => {
        syncBodyLock(!!visible || dataMap.coutShow);
        if (!visible) return;
        // 每次重新打开重置本地状态（签名层常驻 App，不会随路由销毁）
        dataMap.isCheck = true;
        dataMap.coutShow = false;
        dataMap.current = 3;
        dataMap.flagReady = false;
        dataMap.alertShow = false;
        dataMap.heartFade = false;
        if (dataMap.timer) {
          clearInterval(dataMap.timer);
          dataMap.timer = "" as any;
        }
        dataMap.signName = resolveSignName();
      },
      { immediate: true }
    );

    watch(
      () => dataMap.coutShow,
      (visible: boolean) => {
        document.body.classList.toggle("hf-cout-open", !!visible);
        syncBodyLock(!!props.show || !!visible);
      }
    );

    watchEffect(() => {
      console.log("watchEffect", props.ready, dataMap.current);
      if (dataMap.current <= 0) {
        dataMap.flagReady = true;
        if (props.ready) {
          setTimeout(() => {
            dataMap.coutShow = false;
            document.body.classList.remove("hf-cout-open");
            // 进海报后结束签名流程，抽签底栏可恢复（页面通常已切走）
            store.dispatch("ACTION_END_SIGN_FLOW");
            router.replace({
              name: "poster",
            });
          }, 400);
        }
      }
    });

    onMounted(() => {
      dataMap.isCheck = true;
      dataMap.signName = resolveSignName();
    });

    onBeforeUnmount(() => {
      document.body.classList.remove("hf-sign-open", "hf-cout-open");
      document.getElementById("app")?.classList.remove("hf-sign-open");
    });

    const init = () => {
      dataMap.timer = setInterval(() => {
        dataMap.current = dataMap.current - 1;
        if (dataMap.current < 0) {
          clearInterval(dataMap.timer);
        }
      }, 1000);
    };

    const handleCheck = () => {
      dataMap.isCheck = !dataMap.isCheck;
    };

    const handleFinish = () => {
      if (!dataMap.isCheck) {
        dataMap.heartFade = true;
        setTimeout(() => {
          dataMap.heartFade = false;
        }, 1000);
        dataMap.title = "请先勾选誓词";
        dataMap.alertShow = true;
        return;
      }
      if (!dataMap.signName) {
        dataMap.alertShow = true;
        dataMap.title = "请输入名字";
        return;
      }
      emit("finish", dataMap.signName);
      if (props.pageMode) {
        return;
      }
      dataMap.coutShow = true;
      init();
      emit("update:show", false);
    };

    return {
      ...toRefs(dataMap),
      handleCheck,
      handleFinish,
    };
  },
});
</script>

<style lang="scss" scoped>
.sign-wrap {
  background-image: url("@/assets/images/bg.png");
  width: 100%;
  height: 100%;
  min-height: 100%;
  min-height: 100vh;
  background-size: 100% auto;
  // 路由页内用 absolute 铺满，避免再和其它 fixed 底栏抢层级
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0.6rem 0 0.4rem;
  padding: calc(0.6rem + env(safe-area-inset-top, 0px)) 0
    calc(0.4rem + env(safe-area-inset-bottom, 0px));
  opacity: 1;
  visibility: visible;
  transform: none;
  background-color: #ff5f47;
  .draw-tip {
    width: 3.44rem;
    height: 0.3rem;
    position: absolute;
    right: 0.3rem;
    top: 0.5rem;
    top: calc(0.5rem + env(safe-area-inset-top, 0px));
    border-top: 1px solid #131415;
    padding-top: 0.1rem;
    .img {
      width: 100%;
    }
  }
  .sign-cont {
    width: 6.4rem;
    max-width: calc(100% - 0.6rem);
    height: 9.8rem;
    max-height: calc(100vh - 1.2rem);
    max-height: calc(100dvh - 1.2rem);
    background: url("@/assets/images/step3/sign-bg.png") no-repeat center center;
    background-size: 100% 100%;
    margin: 0 auto;
    position: relative;
    font-size: 0.26rem;
    flex-shrink: 0;
    .sign-readme {
      color: #ff5f47;
      font-size: 0.26rem;
      width: 5.6rem;
      max-width: calc(100% - 0.6rem);
      position: absolute;
      top: 69.4%;
      left: 0.3rem;
      &.heartFade {
        animation: heart-in 750ms;
      }
      i {
        width: 0.26rem;
        height: 0.26rem;
        display: inline-block;
        vertical-align: middle;
        background: url("@/assets/images/step3/read_unclick.png") no-repeat
          center center;
        background-size: 100% auto;
        &.check {
          background: url("@/assets/images/step3/read_click.png") no-repeat
            center center;
          background-size: 100% auto;
        }
      }
    }
    .sign-text {
      width: 3.5rem;
      max-width: 55%;
      height: 0.66rem;
      border: 0.02rem solid #131415;
      background: #fff;
      position: absolute;
      left: 0.38rem;
      bottom: 11.4%;
      padding-left: 0.2rem;
      box-sizing: border-box;
    }
    .next {
      width: 1.6rem;
      height: 0.45rem;
      background: url("@/assets/images/step3/compete.png") no-repeat center
        center;
      background-size: 1.4rem auto;
      position: absolute;
      right: 0.6rem;
      bottom: 6.1%;
    }
  }
}

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

.cout-down {
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 1100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 1;
  visibility: visible;
  transform: none;
  .cout-cont {
    width: 5rem;
    height: 5rem;
    position: relative;
  }
  .cout-time {
    font-size: 2rem;
    color: #fff;
    .cont-border {
      position: relative;
      .line {
        background: #fff;
        height: 1px;
        transform-origin: 0 0;
        animation: rotate 1s infinite ease-in-out;
        position: absolute;
        left: 50%;
        top: 50%;
      }
    }
    .time-num {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
    .time1 {
      width: 5rem;
      height: 5rem;
      border: 0.04rem dashed #ffffff;
      position: absolute;
      left: 0;
      top: 0;
      border-radius: 50%;
      .line {
        width: 2.5rem;
      }
    }
    .time2 {
      width: 4rem;
      height: 4rem;
      border: 0.04rem dashed #ffffff;
      position: absolute;
      left: 0.5rem;
      top: 0.5rem;
      border-radius: 50%;
      .line {
        width: 2rem;
      }
    }
    .time3 {
      width: 3rem;
      height: 3rem;
      border: 0.04rem dashed #ffffff;
      position: absolute;
      left: 1rem;
      top: 1rem;
      border-radius: 50%;
      .line {
        width: 1.5rem;
      }
    }
  }
  .cout-text {
    text-align: center;
    color: #fff;
    font-size: 0.36rem;
    letter-spacing: 10px;
  }
}

// 矮屏手机：从顶部排布并限制卡片高度，避免「其实打开了但看不见」
@media screen and (max-height: 700px) {
  .sign-wrap {
    justify-content: flex-start;
    padding-top: calc(0.8rem + env(safe-area-inset-top, 0px));
  }
  .sign-cont {
    width: 5.4rem;
    height: 8.2rem;
    max-height: calc(100vh - 1.6rem);
    max-height: calc(100dvh - 1.6rem);
  }
}
</style>
