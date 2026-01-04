<!--
 * @description: 立下flag
 * @LastEditTime: 2024-11-28 22:14:35
-->
<template>
  <div class="flag-wrap-box">
    <!--标题装饰-->
    <div class="flex ac jb flag-step">
      <div class="flag-choose" @click="handleShowModal">
        <div class="flag-choose-top">{{ chooseFlagList.length || 0 }}</div>
        <div class="flag-choose-bottom">已选</div>
      </div>
      <div class="flag-tip">
        <img class="img" src="../assets/images/step1/flag-tip.png" />
      </div>
    </div>
    <!--中间筛选部分-->
    <div class="flag-list">
      <div
        class="flag-item"
        v-for="(item, index) in flagList"
        :class="{
        active: chooseFlagList.map((list:any) => list.text).includes(item),
      }"
        :key="index"
        @click="handleChoose(item)"
      >
        <div class="num">
          {{ (Number(index) + 1).toString().padStart(2, "0") }}
        </div>
        <div class="text">{{ item }}</div>
      </div>
    </div>
    <!--换一换按钮 :class="{ down: keyDown }"-->
    <div class="flag-change-btn" @click="handleChange"></div>
    <!--输入框-->
    <div class="flag-input-box">
      <input
        class="input"
        type="text"
        v-model="addValue"
        maxlength="15"
        placeholder="也能在这写下你的Flag哦"
        @focus="handleFoucus"
        @blur="handleBlur"
      />
      <span class="btn" @click="handleChoose(addValue)"></span>
    </div>
    <div
      class="flag-next"
      :class="{ hide: inputFocus }"
      @click="handleNext"
    ></div>
    <!--弹窗-->
    <transition name="bounce">
      <div
        class="flex jc flag-modal-wrap"
        @click.stop="handleHideModal"
        v-show="flagShow"
      >
        <div class="flag-modal-box" @click.stop>
          <div class="flex ac jb modal-header">
            <span @click="handleHideModal">收起</span>
            <span>(长按拖动，调整位置)</span>
          </div>
          <div class="flag-modal-list">
            <draggable :list="chooseFlagList" filter=".close" :delay="500">
              <div
                class="flex jb ac flag-modal-item"
                v-for="(item, index) in chooseFlagList"
                :key="item.id"
              >
                {{ Number(index) + 1 }}.
                <div class="flag-modal-item-cont ellipsis-line1">
                  <div class="flag-span" @click.stop="handleEdit(item)">
                    {{ item.text }}
                  </div>
                  <!-- <div @click="handleEdit(item)">编辑</div> -->
                  <div class="close" @click.stop="handleDel(item)"></div>
                  <!-- <div class="close-icon" @click.stop="handleDel(item)"></div> -->
                </div>
              </div>
            </draggable>
          </div>
        </div>
      </div>
    </transition>
    <!--弹窗-->
    <modal title="请立下你的Flag" v-model:alertShow="alertShow" />

    <editmodal
      title="修改你的flag"
      :item="chooseItem"
      v-model:alertShow="editmodalShow"
      ref="flagRef"
      @modalOk="handleChangeTxt"
    />

    <!-- <test @test="handleChangeTxt"/> -->

    <loading v-model:isLoading="isLoading" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  onUnmounted,
  computed,
  ref,
  nextTick,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "../store";
import { VueDraggableNext } from "vue-draggable-next";
import { selectFlagH5 } from "../api/flag";
import { isAndroid } from "../common/utils";
import modal from "@/components/modal.vue";
import editmodal from "../components/editmodal.vue";
import loading from "@/components/loading.vue";
import test from "../components/test.vue";
import flagMapList from "./flag";
let numIndex: number = 0;
export default defineComponent({
  components: {
    draggable: VueDraggableNext,
    modal,
    editmodal,
    test,
    loading,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const dataMap = reactive({
      chooseList: [] as Array<object>, //选择列表
      apiList: [] as any,
      flagList: [] as any,
      current: 0,
      flagShow: false,
      keyDown: false,
      addValue: "",
      firstFlag: 0,
      alertShow: false,
      editmodalShow: false,
      inputFocus: false,
      isLoading: false,
      tokencache: "",
      deleteList: [] as any[],
      chooseItem: {} as any,
      updateList: [] as any[],
    });

    const flagRef: any = ref<null | HTMLElement | Object>(null);

    onMounted(() => {
      if (router.currentRoute.value.query.newpage) {
        getflagList();
      }
      dataMap.current = Math.floor(Math.random() * flagMapList.size); //随机展示目标模板
      console.log("current---", flagMapList.size, dataMap.current);
      if (!isAndroid()) return;
      const innerHeight = window.innerHeight;
      window.addEventListener("resize", () => {
        const newInnerHeight = window.innerHeight;
        if (innerHeight > newInnerHeight) {
          handleFoucus();
        } else {
          handleBlur();
        }
      });
    });

    onUnmounted(() => {
      dataMap.isLoading = false;
    });
    // 获取vuex中缓存的已选中的flag目标
    const chooseFlagList: any = computed(() => {
      dataMap.chooseList = store.state.flagList;
      return store.state.flagList;
    });

    const tokencache: any = computed(() => {
      dataMap.tokencache = store.state.tokencache;
      return store.state.tokencache;
    });

    onMounted(() => {
      changeList();
    });
    // 调用api查询
    const getflagList = async () => {
      console.log('📡 开始调用getflagList API');
      console.log('🔑 当前token:', localStorage.getItem('Authorization'));
      // 调用api接口，并且提供了参数
      selectFlagH5({})
        .then((res: any) => {
          console.log('✅ API返回数据:', res);
          console.log('📊 flags数据:', res.data?.flags);
          if (res.data && res.data.flags) {
            dataMap.chooseList = [];
            res.data.flags.forEach((item: any, index: any) => {
              dataMap.chooseList.push({
                id: item.id,
                text: item.flag,
              });
            });
            dataMap.firstFlag =
              res.data.flags.length > 0 ? res.data.flags.length - 1 : 0;
            store.dispatch("ACTIONCHOOSELIST", dataMap.chooseList);
            console.log('✅ 数据已处理，共', dataMap.chooseList.length, '条');
          } else {
            console.warn('⚠️ API返回数据格式异常:', res);
          }
        })
        .catch((error: any) => {
          console.error('❌ API调用失败:', error);
        });
    };
    // 换一组目标模板
    const handleChange = () => {
      dataMap.keyDown = true;
      dataMap.current = flagMapList.get(dataMap.current + 1)
        ? dataMap.current + 1
        : 0;
      changeList();
      setTimeout(() => {
        dataMap.keyDown = false;
      }, 280);
    };
    // 选择目标
    const handleChoose = (item: string) => {
      if (!item) return;
      dataMap.firstFlag = dataMap.firstFlag + 1;
      console.log("dataMap.firstFlag", dataMap.firstFlag);
      numIndex++;
      dataMap.chooseList.push({
        id: numIndex,
        text: item,
      });
      dataMap.addValue && (dataMap.addValue = "");
      store.dispatch("ACTIONCHOOSELIST", dataMap.chooseList);
      if (dataMap.firstFlag === 1) {
        setTimeout(() => {
          handleShowModal();
        }, 100);
      }
    };
    // 删除已选中的目标
    const handleDel = (item: any) => {
      let index = dataMap.chooseList.findIndex(
        (list: any) => list.id === item.id
      );
      let selectItem: any = dataMap.chooseList[index];
      //将删除的判断做个判断，假设是新增的flag，其id为自定义自增。所以需要存储的是原先已存在的flag
      let mid = selectItem.id.toString();
      if (mid && mid.length >= 10) {
        dataMap.deleteList.push(selectItem);
        store.dispatch("ACTIONDELETELIST", dataMap.deleteList);
      }
      dataMap.chooseList.splice(index, 1);
      store.dispatch("ACTIONCHOOSELIST", dataMap.chooseList);
    };
    // 编辑已选中的目标
    const handleEdit = (item: any) => {
      dataMap.chooseItem = item;
      nextTick(() => {
        flagRef.value.init();
        dataMap.editmodalShow = true;
      });
    };

    const handleChangeTxt = (data: any) => {
      console.log(data);
      if (data.id.toString().length > 20) {
        dataMap.updateList.push(data);
        store.dispatch("ACTIONUPDATELIST", dataMap.updateList);
      }
      dataMap.editmodalShow = false;
    };

    // 显示目标弹窗
    const handleShowModal = () => {
      dataMap.flagShow = true;
    };
    // 隐藏目标弹窗
    const handleHideModal = () => {
      dataMap.flagShow = false;
    };
    //获取目标模板
    const changeList = () => {
      dataMap.flagList = flagMapList.get(dataMap.current) || [];
    };
    // 跳转到画图页面
    const handleNext = () => {
      // console.log(chooseFlagList.value);
      // console.log(tokencache.value);
      if (!chooseFlagList.value.length) {
        dataMap.alertShow = true; //未选择目标弹窗提示
        return;
      }
      dataMap.isLoading = true;
      router.replace({
        name: "draw",
        query: {
          name: route.query.name,
        },
      });
    };
    // 输入框在输入的时候隐藏下一步按钮
    const handleFoucus = () => {
      dataMap.inputFocus = true;
      setTimeout(() => {
        document.body.scrollTop = window.innerHeight;
      }, 200);
    };
    // 输入框离开的时候显示下一步按钮
    const handleBlur = () => {
      setTimeout(() => {
        dataMap.inputFocus = false;
      }, 300);
    };

    const log = () => {
      console.log(dataMap.flagList);
    };

    return {
      ...toRefs(dataMap),
      chooseFlagList,
      tokencache,
      handleChange,
      handleChoose,
      handleDel,
      handleEdit,
      handleShowModal,
      handleHideModal,
      handleNext,
      handleFoucus,
      handleBlur,
      handleChangeTxt,
      flagRef,
      log,
    };
  },
});
</script>

<style lang="scss" scoped>
.flag-wrap-box {
  height: 100%;
  // overflow: hidden;
  position: relative;
  overflow-y: auto;
}

.flag-step {
  padding: 0.3rem;
  position: relative;
  .flag-choose {
    font-weight: bold;
    font-size: 0.3rem;
    .flag-choose-top {
      width: 0.6rem;
      padding-left: 0.5rem;
      background: url("@/assets/images/step1/flag.png") no-repeat left top;
      background-size: 0.36rem;
      border-bottom: 1px solid #131415;
      margin-bottom: 0.1rem;
      padding-bottom: 0.05rem;
    }
  }
  .flag-tip {
    border-top: 1px solid #131415;
    margin-top: 0.485rem;
    padding-top: 0.1rem;
    .img {
      width: 3.04rem;
    }
  }
  &::after {
    content: "";
    width: 0.6rem;
    height: 0.6rem;
    background: url("@/assets/images/step1/line.png") no-repeat left top;
    background-size: 0.4rem;
    position: absolute;
    left: 30%;
    bottom: 0;
  }
}

.flag-list {
  overflow: hidden;
  .flag-item {
    // width: 2.26rem;
    width: 38%;
    height: 1.3rem;
    // display: inline-block;
    float: left;
    background: url("@/assets/images/step1/step-choose.png") no-repeat center
      center;
    background-size: 100% 100%;
    // margin: 0.19rem 0.33rem;
    // padding: 0.1rem 0.3rem;
    margin: 0.19rem 2%;
    padding: 0.1rem 4%;
    font-size: 0.3rem;
    overflow: hidden;
    &.active {
      color: #ff5f47;
    }
    .num {
      text-align: center;
    }
  }
}

.flag-change-btn {
  width: 3.2rem;
  height: 0.93rem;
  margin: 0.44rem auto;
  background: url("@/assets/images/step1/btn-change.png") no-repeat left top;
  background-size: 100% auto;
  &.down {
    animation: do-next-ani 280ms;
  }
}

.flag-input-box {
  width: 6.9rem;
  height: 0.88rem;
  margin: 0 auto;
  background: url("@/assets/images/step1/flag-input.png") no-repeat center
    center;
  background-size: 100% auto;
  position: relative;
  .input {
    width: 5.4rem;
    height: 0.54rem;
    border: 0;
    margin-top: 0.05rem;
    margin-left: 0.15rem;
    font-size: 0.32rem;
  }
  .btn {
    width: 0.8rem;
    height: 0.8rem;
    display: inline-block;
    position: absolute;
    right: 0;
    top: 0;
  }
}

.flag-next {
  width: 1.6rem;
  height: 0.5rem;
  background: url("@/assets/images/step1/next-step.png") no-repeat center center;
  background-size: 100% auto;
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 0.3rem);
  right: 0.3rem;
  &.hide {
    display: none;
  }
}

.flag-modal-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  // background: rgba(0, 0, 0, 0.2);
  .flag-modal-box {
    width: 6.1rem;
    height: 7.44rem;
    background: #ffffff;
    border-radius: 0.2rem 0.2rem 0.2rem 0.2rem;
    padding: 0.3rem;
    border: 1px solid #131415;
    margin-top: 1.4rem;
    .flag-modal-list {
      height: 6.8rem;
      overflow-y: scroll;
      .flag-modal-item {
        margin-top: 0.22rem;
        font-size: 0.3rem;
        .flag-modal-item-cont {
          width: 5rem;
          height: 0.72rem;
          line-height: 0.72rem;
          display: inline-block;
          background: url("@/assets/images/step1/flag-item.png") no-repeat
            center center;
          background-size: 100% auto;
          padding: 0 0.7rem 0 0.3rem;
          position: relative;
          display: flex !important;
          .flag-span {
            width: 98%;
            display: inline-block;
            flex: 1;
          }
          .close {
            width: 0.5rem;
            height: 0.5rem;
            background: url("@/assets/images/step1/close.png") no-repeat center
              center;
            background-size: 0.28rem auto;
            position: absolute;
            right: 0.3rem;
            top: 0.1rem;
          }
          .close-icon {
            width: 0.5rem;
            height: 0.5rem;
            background: url("@/assets/images/step1/close.png") no-repeat center
              center;
            background-size: 0.28rem auto;
            position: absolute;
            right: 0.3rem;
            top: 0.1rem;
          }
        }
      }
    }
  }
}

//针对长屏手机适配
@media screen and (min-height: 680px) {
  .flag-item {
    margin: 0.29rem 2%;
  }
  .flag-step {
    padding-top: 0.5rem;
  }
  .flag-list {
    margin: 0.7rem auto;
  }
}
//针对长屏手机适配
@media screen and (min-height: 800px) {
  .flag-item {
    margin: 0.29rem 2%;
  }
  .flag-step {
    padding-top: 0.5rem;
  }
  .flag-list {
    margin: 0.5rem auto;
  }
  .flag-input-box {
    width: 6.5rem;
    height: 0.78rem;
    background-size: 100% 100%;
  }
}

//针对ipad适配
@media screen and (min-height: 1024px) {
  .flag-item {
    margin: 0.09rem 2% !important;
  }
  .flag-step {
    padding-top: 0rem;
  }
  .flag-list {
    margin: 0rem auto;
  }
}
</style>
