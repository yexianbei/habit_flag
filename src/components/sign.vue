<!--
 * @description: 
 * @LastEditTime: 2024-11-28 22:20:50
-->
<template>
  <transition name="bounce2">
    <div
      class="sign-wrap"
      :style="{ backgroundColor: mainColor }"
      v-show="show"
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
  </transition>

  <!--弹窗-->
  <modal :title="title" v-model:alertShow="alertShow" />
  <transition name="fade">
    <div
      class="flex ac jc cout-down"
      :style="{ backgroundColor: mainColor }"
      v-show="coutShow"
    >
      <div class="cout-cont">
        <div class="cout-time" v-for="item in 3">
          <div
            class="cont-border flex ac jc"
            :class="`time${item}`"
            v-show="current >= item"
          >
            <div class="line" v-show="current === item"></div>
          </div>
          <div class="flex ac jc time-num">
            <span v-show="current === item">{{ item }}</span>
            <transition name="fade">
              <div
                class="flex ac jc cout-text"
                v-show="current <= 0 && flagReady"
              >
                你·的·新·年·Flag<br /><br />正式生效
              </div>
            </transition>
          </div>
        </div>
        <!-- v-show="current === item" -->
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import modal from "@/components/modal.vue";
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
  },
  setup(props: any, { emit }: any) {
    console.log("props", props);
    const router = useRouter();
    const route = useRoute();
    const dataMap = reactive({
      isCheck: false,
      signName: "",
      alertShow: false,
      heartFade: false,
      current: 3,
      coutShow: false,
      timer: "" as any,
      title: "",
      flagReady: false,
    });

    watchEffect(() => {
      console.log("watchEffect", props.ready, dataMap.current);
      if (dataMap.current <= 0) {
        dataMap.flagReady = true;
        if (props.ready) {
          setTimeout(() => {
            router.replace({
              name: "poster",
            });
          }, 400);
        }
      }
    });

    onMounted(() => {
      dataMap.signName = route.query.name as string;
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
      dataMap.isCheck = true;
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
  // background-color: #ff5f47;
  width: 100%;
  height: 100%;
  background-size: 100% auto;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  overflow: hidden;
  transition: 0.3s all;
  .draw-tip {
    width: 3.44rem;
    height: 0.3rem;
    position: absolute;
    right: 0.3rem;
    top: 0.8rem;
    border-top: 1px solid #131415;
    padding-top: 0.1rem;
    .img {
      width: 100%;
    }
  }
  .sign-cont {
    width: 6.4rem;
    height: 9.8rem;
    background: url("@/assets/images/step3/sign-bg.png") no-repeat center center;
    background-size: 100% auto;
    margin: 1.4rem auto 0;
    position: relative;
    font-size: 0.26rem;
    .sign-readme {
      color: #ff5f47;
      font-size: 0.26rem;
      width: 5.6rem;
      position: absolute;
      top: 6.8rem;
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
      height: 0.66rem;
      border: 0.02rem solid #131415;
      background: #fff;
      position: absolute;
      left: 0.38rem;
      bottom: 1.12rem;
      padding-left: 0.2rem;
    }
    .next {
      width: 1.6rem;
      height: 0.45rem;
      background: url("@/assets/images/step3/compete.png") no-repeat center
        center;
      background-size: 1.4rem auto;
      position: absolute;
      right: 0.6rem;
      bottom: 0.6rem;
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
  z-index: 150;
  top: 0;
  left: 0;
  // background-color: #ff5f47;
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
        // width: 50%;
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

//针对长屏手机适配
@media screen and (min-height: 680px) {
  .sign-cont {
    margin-top: 30% !important;
  }
}
@media screen and (min-height: 1024px) {
  .draw-tip {
    top: 0.2rem !important;
  }
  .sign-cont {
    margin-top: 10% !important;
    width: 5.9rem !important;
    height: 8.8rem !important;
    .sign-readme {
      top: 6.2rem !important;
      width: 5.2rem !important;
      font-size: 0.24rem !important;
    }
    .sign-text {
      font-size: 0.2rem !important;
    }
  }
}

//横屏适配
@media screen and (orientation: landscape) {
  .sign-wrap {
    overflow-y: auto;
    overflow-x: hidden;
  }
  .draw-tip {
    top: 0.3rem !important;
  }
  .sign-cont {
    width: 5.5rem !important;
    height: 7.5rem !important;
    margin: 0.5rem auto 0 !important;
    .sign-readme {
      top: 5.2rem !important;
      width: 4.8rem !important;
      font-size: 0.22rem !important;
    }
    .sign-text {
      width: 3rem !important;
      height: 0.6rem !important;
      left: 0.3rem !important;
      // 减少底部距离，让输入框更贴近背景图片中的输入框位置，避免看起来像两个输入框
      bottom: 0.55rem !important;
      font-size: 0.24rem !important;
      // 确保输入框与背景对齐，避免视觉上的双重输入框效果
      border: 0.02rem solid #131415 !important;
      background: #fff !important;
      padding-left: 0.15rem !important;
    }
    .next {
      width: 1.4rem !important;
      height: 0.4rem !important;
      right: 0.5rem !important;
      bottom: 0.5rem !important;
      background-size: 1.2rem auto !important;
    }
  }
}
</style>
