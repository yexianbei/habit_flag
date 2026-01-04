<!--
 * @description: 首页
 * @LastEditTime: 2024-11-28 22:13:34
-->
<template>
  <!--logo-->
  <div class="habit-logo">
    <img class="logo" src="../assets/images/basicprofile.png" />
    小习惯
  </div>
  <!-- 开头进度条-->
  <transition name="fade">
    <div class="flex ac jc habbit-start" v-show="!ready">
      <div class="progress-bar">
        <span class="num"> {{ progress }}%</span>
        <div class="bar" :style="{ width: `${100 - progress}%` }"></div>
      </div>
      <div class="end-text">你的未来，从这里开始</div>
    </div>
  </transition>
  <!--内容-->
  <div class="habit-wrap">
    <div class="habit-time-box">
      <div class="habit-day">
        <!-- <span class="day">{{ day }}</span
        > -->
        今天还剩
      </div>
      <div class="habit-time">
        <span class="time">{{ hour }}</span> 时
        <span class="time">{{ min }}</span
        >分 <span class="time">{{ second }}</span> 秒
      </div>
      <div class="habit-tip">
        来这里，立下你的Flag<br />向崭新的未来迈出第一步
      </div>
    </div>
    <div class="habit-btn" @click="handleStart"></div>
    <div class="habit-img">
      <img class="img" src="../assets/images/Frame.png" />
    </div>
  </div>
  <loading v-model:isLoading="isLoading" />
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted, onUnmounted } from "vue";
import { useStore } from "../store";
import { useRouter, useRoute } from "vue-router";
import loading from "@/components/loading.vue";
const time1 = "2022/01/01 00:00:00";
const time2 = "2022/02/01 00:00:00";
let curStartTime =
  Number(new Date().getTime()) < Number(new Date(time1).getTime())
    ? time1
    : time2;
export default defineComponent({
  components: {
    loading,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    let dataMap = reactive({
      progress: 0,
      ready: false,
      day: "0",
      hour: "00",
      min: "00",
      second: "00",
      isLoading: false,
    });
    onMounted(() => {
      setRouterCache();
      coutTimer();
      countTime();
    });
    onUnmounted(() => {
      dataMap.isLoading = false;
    });

    const handleStart = () => {
      dataMap.isLoading = true;
      router.replace({
        name: "flag",
        query: { newpage: 1, name: route.query.name },
      });
    };

    //将路由参数缓存起来
    const setRouterCache = () => {
      const query = router.currentRoute.value.query;
      console.log('📋 路由参数:', JSON.stringify(query, null, 2));
      let routercache = (
        query.token || ""
      ).toString();
      console.log('🔑 Token获取 - fromQuery:', query.token);
      console.log('🔑 Token获取 - stored:', routercache);
      console.log('🔑 Token获取 - isEmpty:', !routercache || routercache === '');
      store.dispatch("ACTIONSETTOKEN", routercache);
      localStorage.setItem("Authorization", routercache);
      console.log('💾 Token已存储到localStorage:', localStorage.getItem("Authorization"));
    };

    const coutTimer = () => {
      let timer = setInterval(() => {
        dataMap.progress = dataMap.progress + 1;
        if (dataMap.progress >= 100) {
          clearInterval(timer);
          dataMap.ready = true;
        }
      }, 10);
    };

    // 倒计时
    const countTime = () => {
      // 获取当前时间
      const now = new Date().getTime();
      // 设置截止时间
      let endDate = new Date(
        new Date(new Date().toLocaleDateString()).getTime() +
          24 * 60 * 60 * 1000 -
          1
      );
      // let endDate = new Date(curStartTime);
      let end = endDate.getTime();
      // 时间差
      let leftTime = end - now;
      // 定义变量 d,h,m,s保存倒计时的时间
      if (leftTime >= 0) {
        // 天
        dataMap.day = Math.floor(leftTime / 1000 / 60 / 60 / 24).toString();
        // 时
        dataMap.hour = Math.floor((leftTime / 1000 / 60 / 60) % 24)
          .toString()
          .padStart(2, "0");
        // 分
        dataMap.min = Math.floor((leftTime / 1000 / 60) % 60)
          .toString()
          .padStart(2, "0");
        // 秒
        dataMap.second = Math.floor((leftTime / 1000) % 60)
          .toString()
          .padStart(2, "0");
      } else {
        dataMap.day = "0";
        dataMap.hour = "00";
        dataMap.min = "00";
        dataMap.second = "00";
      }
      // 等于0的时候不调用
      if (
        Number(dataMap.hour) === 0 &&
        Number(dataMap.day) === 0 &&
        Number(dataMap.min) === 0 &&
        Number(dataMap.second) === 0
      ) {
        curStartTime =
          Number(new Date().getTime()) < Number(new Date(time1).getTime())
            ? time1
            : time2;
        setTimeout(countTime, 1000);
        return;
      } else {
        // 递归每秒调用countTime方法，显示动态时间效果,
        setTimeout(countTime, 1000);
      }
    };

    return {
      ...toRefs(dataMap),
      handleStart,
    };
  },
});
</script>

<style scoped lang="scss">
.habit-logo {
  width: 100%;
  text-align: center;
  position: absolute;
  left: 0;
  top: 0.8rem;
  z-index: 10;
  font-size: 0.3rem;
  font-weight: bold;
  line-height: 0.64rem;
  height: 1.2rem;
  .logo {
    width: 0.64rem;
    height: 0.64rem;
    vertical-align: middle;
  }
}

.habbit-start {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  font-size: 0.3rem;
  background: #fff;
  z-index: 9;
  .progress-bar {
    width: 6rem;
    height: 2px;
    font-size: 0.28rem;
    text-align: center;
    font-size: 0.38rem;
    .num {
      color: #ff5f47;
    }
    .bar {
      background: #999;
      width: 100%;
      height: 2px;
      margin: 0.2rem auto;
      // animation: scaleOut 1s ease-in;
      // visibility: hidden;
      position: relative;
      transition: 0.3s ease-out-in;
      &::before {
        width: 0.28rem;
        height: 0.28rem;
        background: #fff url("@/assets/images/rectangle.png") no-repeat center
          center;
        background-size: 100% auto;
        content: "";
        position: absolute;
        left: -0.1rem;
        top: -0.12rem;
      }
      &::after {
        width: 0.28rem;
        height: 0.28rem;
        background: #fff url("@/assets/images/rectangle.png") no-repeat center
          center;
        background-size: 100% auto;
        content: "";
        position: absolute;
        right: -0.1rem;
        top: -0.12rem;
      }
    }
  }
  .end-text {
    position: absolute;
    bottom: 2rem;
  }
}

.habit-wrap {
  text-align: center;
  .tip {
    font-size: 0.5rem;
    font-weight: bold;
    margin-top: 2rem;
  }
  .habit-img {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    .img {
      width: 100%;
    }
  }
  .habit-time-box {
    width: 5.6rem;
    height: 5.6rem;
    background: url("@/assets/images/circle.png") no-repeat center center;
    background-size: 100% auto;
    margin: 2.5rem auto 0;
    overflow: hidden;
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .habit-day {
      font-size: 0.5rem;
      font-weight: bold;
      margin-top: 0;
      margin-bottom: 0.2rem;
      .day {
        font-size: 1.12rem;
        color: #ff5f47;
        font-weight: 400;
        line-height: 1.12rem;
      }
    }
    .habit-time {
      font-size: 0.4rem;
      font-weight: bold;
      margin-top: 0;
      margin-bottom: 0.2rem;
      .time {
        font-size: 0.56rem;
        font-weight: 300;
        color: #ff5f47;
      }
    }
    .habit-tip {
      font-size: 0.3rem;
      font-weight: 400;
      color: #131415;
      line-height: 0.5rem;
      margin-top: 0;
      text-align: center;
    }
  }
  .habit-btn {
    width: 2.2rem;
    height: 0.76rem;
    background: url("@/assets/images/start-btn.png") no-repeat center top;
    background-size: 100% auto;
    margin: 0.34rem auto;
    position: relative;
    z-index: 2;
  }
}

//针对长屏手机适配
@media screen and (min-height: 600px) {
  .habit-time-box {
    margin-top: 40% !important;
  }
}
//针对ipad适配
@media screen and (min-height: 1024px) {
  .habit-logo {
    top: 0.5rem !important;
  }
  .habit-wrap {
    .habit-time-box {
      margin-top: 20% !important;
    }
  }
}
</style>
