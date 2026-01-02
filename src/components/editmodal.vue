<!--
 * @description: 
 * @LastEditTime: 2021-12-29 20:09:54
-->
<template>
  <transition name="fade">
    <div class="flex ac jc alert-box" v-show="alertShow">
      <div class="alert-cont">
        <div class="alert-name">{{ title }}</div>
        <div class="alert-main">
          <input type="text" class="alert-input animated" :class="{'animate__bounceIn':showbounce}" v-model="flagTxt" placeholder="请输入您要修改的flag名称"/>  
        </div>
        <div class="btn">
          <div class="botm-left"  @click="handleCancel">取消</div>
          <div class="botm-right" @click="handleOK">确定</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted, watchEffect,watch } from "vue";
import animate from "animate.css";
export default defineComponent({
  emits: ["update:alertShow","modalOk"],
  props: {
    alertShow: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    item:{
      type: Object,
      default: {},
    }
  },
  setup(props: any, { emit }: any) {
    const dataMap = reactive({
        flagTxt:"",
        showbounce:false
    });

    const handleCancel = () =>{
      dataMap.flagTxt=""
      emit("update:alertShow");
    }

    const handleOK = () => {
      if(dataMap.flagTxt==''){
        dataMap.showbounce=true
        setTimeout(()=>{
          dataMap.showbounce=false
        },1000)
        return
      }
      props.item.text=dataMap.flagTxt
      emit("modalOk",props.item);
    };

    const init = () =>{
      dataMap.flagTxt=props.item.text
    }
    return {
      ...toRefs(dataMap),
      handleCancel,
      handleOK,
      init
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
    width: 4.5rem;
    height: 3.44rem;
    // background: url("@/assets/images/step3/alert_no_name.png") no-repeat center
    //   center;
    background: #fff;
    background-size: 100% auto;
    position: relative;
    display: flex;
    flex-direction: column;
    .alert-name {
      text-align: center;
      margin-top: 0.2rem;
      padding-bottom: 0.2rem;
      border-bottom: 1px solid #F9644F;
    }
    .alert-main {
      flex: 1;
      text-align: center;
      height: 1rem;
      // margin-top: 0.3rem;
      display: flex;
      align-items: center;
      justify-content: center;
       .alert-input{
         padding: 0.1rem;
      }
    }
   
    .btn {
      width: 100%;
      height: 0.8rem;
      // position: absolute;
      // left: 0;
      // bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-top: 1px solid #eee;
      display: flex;
      .botm-left{
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1px solid #eee;
        color: #999;
        font-size: 0.2rem;
      }
      .botm-right{
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #F9644F;
        font-size: 0.2rem;
      }

    }
  }
}
</style>