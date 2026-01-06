<!--
 * @description: 绘图制作
 * @LastEditTime: 2026-01-02 11:14:41
-->
<template>
  <div class="draw-page">
    <div class="draw-tip">
      <img class="img" src="@/assets/images/step2/flag-step2.png" />
    </div>
    <div class="draw-container" :style="`height: ${drawHeight}px`">
      <div
        class="draw-wrap"
        :style="{ backgroundColor: mainColor }"
        :class="{ 'draw-flex ac jc': footerShow }"
        id="draw-wrap"
      >
        <!--海报图片-->
        <div class="draw-box">
          <div class="draw-cont" :style="{ border: '1px dashed ' + mainColor }">
            <img
              src="@/assets/images/step2/2026.png"
              class="draw-top-img"
              style=""
            />
            <div class="flex ac jc draw-main">
              <div class="draw-cloud-box">
                <img
                  class="draw-cloud draw-cloud-left"
                  src="@/assets/images/step2/cloud-left.png"
                />
                <div
                  :style="{ backgroundColor: mainColor }"
                  class="color-bg"
                ></div>
              </div>
              <!-- <img
                class="draw-cloud draw-cloud-left"
                src="@/assets/images/step2/cloud-left.png"
                :style="{ backgroundColor: mainColor }"
              /> -->
              <img
                class="draw-icon"
                :class="{ 'no-border': footerShow }"
                :src="getImageUrl(mainImg)"
              />
              <div class="draw-cloud-box">
                <img
                  class="draw-cloud draw-cloud-right"
                  src="@/assets/images/step2/cloud-right.png"
                />
                <div
                  :style="{ backgroundColor: mainColor }"
                  style="left: 0.012rem"
                  class="color-bg"
                ></div>
              </div>
            </div>
            <div class="draw-line"></div>
            <div class="draw-list">
              <div
                class="draw-item"
                v-for="(item, index) in flagList"
                :key="item.id"
              >
                <div class="draw-item-cont">
                  <div class="num">
                    {{ (Number(index) + 1).toString().padStart(2, "0") }}
                    <div :style="{ backgroundColor: mainColor }"></div>
                  </div>
                  {{ item.text }}
                </div>
                <div
                  class="draw-item-bg"
                  :style="{ backgroundColor: mainColor }"
                ></div>
              </div>
            </div>
            <div class="draw-line2" v-if="footerShow"></div>
            <div class="flex ae jb draw-footer">
              <div class="draw-left" v-if="footerShow">
                <div class="sign-name">{{ signName }}</div>
                <div class="sign-time">立于{{ signTime }}</div>
                <img src="@/assets/images/logo.png" class="sign-logo" />
              </div>
              <div class="draw-right" v-if="footerShow">
                <img src="@/assets/images/code.png" class="sign-code" />
                <div class="sign-text">长按保存图片</div>
                <div class="sign-color">
                  <div class="top-color">
                    <i :style="{ backgroundColor: mainColor }"></i>
                    <i :style="{ backgroundColor: mainColor }"></i>
                    <i :style="{ backgroundColor: mainColor }"></i>
                  </div>
                  <i
                    class="foot-color"
                    :style="{ backgroundColor: mainColor }"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--海报底部设置-->
    <div class="draw-set-wrap">
      <div class="flex ac ja draw-set-header">
        <span
          class="draw-tab"
          :class="{ active: tabIndex === 0 }"
          @click="handleTab(0)"
        >
          <i class="icon icon1"></i>
          背景色
        </span>
        <span
          class="draw-tab"
          :class="{ active: tabIndex === 1 }"
          @click="handleTab(1)"
        >
          <i class="icon icon2"></i>
          小装饰
        </span>
      </div>
      <div class="draw-set-cont">
        <!--背景色-->
        <div
          class="draw-set"
          style="overflow-x: scroll"
          v-show="tabIndex === 0"
        >
          <div class="draw-color-wrap iflex ac">
            <div
              class="color"
              v-for="item in colorList"
              :key="item.id"
              :class="{ active: item.id === mainColorId }"
              :style="{ background: item.color }"
              @click="handleChangeColor(item.id)"
            ></div>
          </div>
          <div class="flex ac jc draw-color-picker">
            <input class="color-range" type="range" v-model="rangeVal" />
            <div
              class="color-picker"
              v-for="item in colorChildren.children"
              :style="{ background: item.color }"
            ></div>
          </div>
        </div>
        <!--小装饰-->
        <div
          class="flex ac draw-set"
          style="overflow-x: scroll"
          v-show="tabIndex === 1"
        >
          <img
            class="draw-set-img"
            v-for="item in 9"
            :src="getImageUrl(item)"
            @click="handleChangeImage(item)"
          />
        </div>
      </div>
      <div class="flex ac jb draw-set-footer">
        <span class="prev" @click="handlePrev"></span>
        <span class="next-continue" v-if="!isSecond" @click="handleNext"></span>
        <span class="next-step" v-else @click="handleNext"></span>
      </div>
    </div>
    <div class="canvas-poster" v-show="false"></div>
    <sign
      v-model:show="signShow"
      v-model:mainColor="mainColor"
      v-model:ready="readyJump"
      @finish="handldDraw"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  watch,
  computed,
  nextTick,
} from "vue";
import { useStore } from "../store";
import { queryColorIndex } from "../common/utils";
import { useRouter, useRoute } from "vue-router";
import moment from "moment";
import colorList from "./color";
import html2canvas from "html2canvas";
import sign from "../components/sign.vue";
import { addFlag } from "../api/flag";
export default defineComponent({
  components: {
    sign,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    let dataMap = reactive({
      tabIndex: 0,
      rangeVal: 0,
      mainColorId: 4,
      mainColor: "",
      mainImg: 1,
      signShow: false,
      signName: "",
      footerShow: false,
      colorList: [] as any[],
      drawHeight: window.innerHeight,
      isSecond: false,
      readyJump: false,
      tokencache: "",
    });
    dataMap.colorList = colorList; //获取颜色数据

    const tokencache: any = computed(() => {
      dataMap.tokencache = store.state.tokencache;
      return store.state.tokencache;
    });

    //立flag的时间
    const signTime = computed(() => {
      return moment(new Date().getTime()).format("YYYY-MM-DD");
    });
    //获取颜色数据
    const colorChildren = computed(() => {
      return dataMap.colorList[dataMap.mainColorId];
    });
    //获取已经立的flag目标数据
    const flagList = computed(() => store.state.flagList);

    const deleteflagList = computed(() => store.state.deleteflagList);

    const updateflagList = computed(() => store.state.updateflagList);

    //动态获取图片
    const getImageUrl = (num: number | string) => {
      return new URL(`../assets/images/horse/horse${num}.png`, import.meta.url)
        .href;
    };

    // 监听颜色选项卡改变动态获取参数
    watch(
      () => dataMap.rangeVal,
      (val: number) => {
        const colorPar: {
          [key: string]: any;
        } = colorList[dataMap.mainColorId];
        dataMap.mainColor = colorPar.children[queryColorIndex(val)].color;
      }
    );
    // 监听颜色选项卡主色改变，子颜色改变
    watch(
      () => dataMap.mainColorId,
      (val: number) => {
        const colorPar: {
          [key: string]: any;
        } = colorList[val];
        dataMap.mainColor =
          colorPar.children[queryColorIndex(dataMap.rangeVal)].color;
      },
      {
        immediate: true,
      }
    );

    // 底部tab切换
    const handleTab = (status: number) => {
      dataMap.tabIndex = status;
      if (status === 1) dataMap.isSecond = true; //选择第二个tab以后才可以进行下一步
    };
    //颜色选项卡，主色改变事件
    const handleChangeColor = (id: number) => {
      dataMap.mainColorId = id;
    };
    // 选择图片改变
    const handleChangeImage = (num: number) => {
      dataMap.mainImg = num;
    };
    // 点击下一步,判断是否已选择图片，若未选择则底部菜单栏切换到图片选择
    const handleNext = () => {
      if (!dataMap.isSecond) {
        handleTab(1);
        return;
      }
      dataMap.signShow = true;
    };
    //返回上一个选择flag页面
    const handlePrev = () => {
      router.replace({
        name: "flag",
        query: {
          name: route.query.name,
        },
      });
    };
    // 调用api保存
    const handleSave = async (src: any) => {
      // 检查token是否存在
      const token = localStorage.getItem('Authorization') || 
                    (route.query.token as string) || 
                    store.state.tokencache;
      
      if (!token || token === '') {
        console.log('⚠️ 未找到token，跳过保存API调用');
        return;
      }
      
      // 调用api接口，并且提供了参数
      let deleteflags = deleteflagList.value.map((x: any) => x.id).join(",");
      let flags = flagList.value
        .filter((item: any) => {
          return item.id.toString().length < 20;
        })
        .map((x: any) => x.text)
        .join(",");
      let updateflags = updateflagList.value
        .map((x: any) => x.id + ":" + x.text)
        .join(",");
      addFlag({
        // flags: flags, //flag集合
        add: flags, //新增，只传flag本身，多个中间用逗号隔开
        update: updateflags, //修改，flag id 和变动后的值（047cadad080344f9aa85830fd9022272:考研成功），多个中间用逗号隔开
        del: deleteflags, //删除，只传flag id，多个中间用逗号隔开
        picture: src, //图片base64字符串
        signature: dataMap.signName, //签名
        bgColor: dataMap.mainColor, //背景色
        decoress: dataMap.mainImg, //装饰
      })
        .then((res) => {
          // success
          console.log(res);
        })
        .catch((error: any) => {
          // error
          console.log(error);
        });
    };
    //画图,将html使用html2canvas插件转为base64位图片
    const handldDraw = async (name: string) => {
      await (dataMap.signName = name);
      await (dataMap.footerShow = true);
      await nextTick();
      const wrap: any = document.getElementById("draw-wrap");
      await html2canvas(wrap, {
        width: wrap.offsetWidth,
        height: wrap.offsetHeight,
      }).then((canvas: any) => {
        const canvaswrap: any = document.querySelector(".canvas-poster");
        canvaswrap.innerHTML = "";
        canvaswrap.appendChild(convertCanvasToImage(canvas));
        const poster: any = document.querySelector(".poster-img");
        console.log("poster.src", poster.src);
        store.dispatch("ACTIONSETIMG", poster.src);
        dataMap.readyJump = true;
        handleSave(poster.src); //将数据保存
      });
    };
    //canvas转化为img
    const convertCanvasToImage = (canvas: any) => {
      var image = new Image();
      image.className = "poster-img";
      image.style.width = "100%";
      // image.style.height = "100%";
      image.setAttribute("crossOrigin", "Anonymous");
      image.src = canvas.toDataURL("image/jpeg"); //canvas转化为img
      return image;
    };

    return {
      ...toRefs(dataMap),
      flagList,
      colorList,
      signTime,
      colorChildren,
      handleTab,
      handleChangeColor,
      handleChangeImage,
      handleNext,
      handlePrev,
      handldDraw,
      handleSave,
      getImageUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "./draw.scss";
</style>
