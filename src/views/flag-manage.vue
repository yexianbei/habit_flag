<!--
 * @description: 目标管理页面
 * @LastEditTime: 2026-01-02
-->
<template>
  <div class="flag-manage-wrap">
    <!-- 头部 -->
    <div class="flag-manage-header">
      <div class="header-back" @click="handleBack">
        <span>返回</span>
      </div>
      <div class="header-title">目标管理</div>
      <div class="header-placeholder"></div>
    </div>

    <!-- 内容区域 -->
    <div class="flag-manage-content">
      <!-- 加载中状态 -->
      <div v-if="isLoading && flagList.length === 0" class="loading-state">
        <div class="loading-text">加载中...</div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="hasError && flagList.length === 0" class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-text">{{ errorMessage }}</div>
        <div class="error-retry" @click="handleRetry">重试</div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!isLoading && flagList.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-text">暂无目标</div>
        <div class="empty-tip">快去添加你的第一个目标吧~</div>
      </div>

      <!-- 有数据状态 -->
      <div v-else class="has-data-state">
        <div class="flag-tip-text" v-if="flagList.length > 1">
          (长按拖动，调整位置)
        </div>
        <div class="flag-list-container">
          <draggable 
            :list="flagList" 
            filter=".close" 
            :delay="500"
            item-key="id"
            @end="handleDragEnd"
          >
            <template #item="{ element, index }">
              <div class="flex jb ac flag-item">
                <span class="item-index">{{ Number(index) + 1 }}.</span>
                <div class="flag-item-cont ellipsis-line1">
                  <div class="flag-span" @click.stop="handleEdit(element)">
                    {{ element.text }}
                  </div>
                  <div class="close" @click.stop="handleDel(element)"></div>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <editmodal
      title="修改你的flag"
      :item="chooseItem"
      v-model:alertShow="editmodalShow"
      ref="flagRef"
      @modalOk="handleChangeTxt"
    />

    <loading :isLoading="isLoading && flagList.length === 0" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  ref,
  nextTick,
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "../store";
import { VueDraggableNext } from "vue-draggable-next";
import { selectFlagH5 } from "../api/flag";
import editmodal from "../components/editmodal.vue";
import loading from "@/components/loading.vue";

let numIndex: number = 0;

export default defineComponent({
  components: {
    draggable: VueDraggableNext,
    editmodal,
    loading,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const dataMap = reactive({
      flagList: [] as any[],
      isLoading: false,
      editmodalShow: false,
      chooseItem: {} as any,
      deleteList: [] as any[],
      updateList: [] as any[],
      hasError: false,
      errorMessage: "加载失败，请稍后重试",
    });

    const flagRef: any = ref<null | HTMLElement | Object>(null);

    onMounted(() => {
      getflagList();
    });

    // 获取目标列表
    const getflagList = async () => {
      dataMap.isLoading = true;
      dataMap.hasError = false;
      try {
        const res: any = await selectFlagH5({});
        if (res.data && res.data.flags) {
          dataMap.flagList = res.data.flags.map((item: any) => ({
            id: item.id,
            text: item.flag,
          }));
          // 更新store
          store.dispatch("ACTIONCHOOSELIST", dataMap.flagList);
          // 更新numIndex，避免新增时id冲突
          if (dataMap.flagList.length > 0) {
            const maxId = Math.max(
              ...dataMap.flagList.map((item: any) => {
                const id = item.id.toString();
                return id.length < 10 ? Number(id) : 0;
              })
            );
            numIndex = maxId > 0 ? maxId : 0;
          }
        } else {
          // 数据格式异常
          dataMap.hasError = true;
          dataMap.errorMessage = "数据格式异常，请稍后重试";
        }
      } catch (error: any) {
        console.error("获取目标列表失败:", error);
        dataMap.hasError = true;
        if (error.message) {
          dataMap.errorMessage = error.message;
        } else {
          dataMap.errorMessage = "网络错误，请检查网络连接后重试";
        }
      } finally {
        dataMap.isLoading = false;
      }
    };

    // 重试
    const handleRetry = () => {
      getflagList();
    };

    // 删除目标
    const handleDel = (item: any) => {
      const index = dataMap.flagList.findIndex(
        (list: any) => list.id === item.id
      );
      if (index === -1) return;

      const selectItem: any = dataMap.flagList[index];
      // 判断是否为已存在的flag（id长度>=10表示是服务器返回的id）
      const mid = selectItem.id.toString();
      if (mid && mid.length >= 10) {
        dataMap.deleteList.push(selectItem);
        store.dispatch("ACTIONDELETELIST", dataMap.deleteList);
      }
      dataMap.flagList.splice(index, 1);
      store.dispatch("ACTIONCHOOSELIST", dataMap.flagList);
    };

    // 编辑目标
    const handleEdit = (item: any) => {
      dataMap.chooseItem = item;
      nextTick(() => {
        flagRef.value.init();
        dataMap.editmodalShow = true;
      });
    };

    // 修改目标文本
    const handleChangeTxt = (data: any) => {
      if (data.id.toString().length >= 10) {
        dataMap.updateList.push(data);
        store.dispatch("ACTIONUPDATELIST", dataMap.updateList);
      }
      // 更新本地列表
      const index = dataMap.flagList.findIndex(
        (list: any) => list.id === data.id
      );
      if (index !== -1) {
        dataMap.flagList[index].text = data.text;
        store.dispatch("ACTIONCHOOSELIST", dataMap.flagList);
      }
      dataMap.editmodalShow = false;
    };

    // 拖拽结束
    const handleDragEnd = () => {
      // 拖拽后同步更新store
      store.dispatch("ACTIONCHOOSELIST", dataMap.flagList);
    };

    // 返回
    const handleBack = () => {
      router.back();
    };

    return {
      ...toRefs(dataMap),
      handleDel,
      handleEdit,
      handleChangeTxt,
      handleBack,
      handleDragEnd,
      handleRetry,
      flagRef,
    };
  },
});
</script>

<style lang="scss" scoped>
.flag-manage-wrap {
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.flag-manage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem;
  border-bottom: 1px solid #eee;
  position: relative;
  z-index: 10;

  .header-back {
    font-size: 0.3rem;
    color: #131415;
    cursor: pointer;
    min-width: 1rem;
  }

  .header-title {
    font-size: 0.36rem;
    font-weight: bold;
    color: #131415;
    text-align: center;
    flex: 1;
  }

  .header-placeholder {
    min-width: 1rem;
  }
}

.flag-manage-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.3rem;
  -webkit-overflow-scrolling: touch;
}

.flag-tip-text {
  font-size: 0.24rem;
  color: #999;
  text-align: center;
  margin-bottom: 0.3rem;
}

.has-data-state {
  min-height: 100%;
}

.flag-list-container {
  min-height: 100%;
  padding-bottom: 0.3rem;
  
  .flag-item {
    margin-bottom: 0.22rem;
    font-size: 0.3rem;

    .item-index {
      min-width: 0.4rem;
      margin-right: 0.2rem;
    }

    .flag-item-cont {
      flex: 1;
      height: 0.72rem;
      line-height: 0.72rem;
      display: flex;
      align-items: center;
      background: url("@/assets/images/step1/flag-item.png") no-repeat center
        center;
      background-size: 100% auto;
      padding: 0 0.7rem 0 0.3rem;
      position: relative;

      .flag-span {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .close {
        width: 0.5rem;
        height: 0.5rem;
        background: url("@/assets/images/step1/close.png") no-repeat center
          center;
        background-size: 0.28rem auto;
        position: absolute;
        right: 0.3rem;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
      }
    }
  }
}

// 加载中状态
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;

  .loading-text {
    font-size: 0.3rem;
    color: #999;
  }
}

// 错误状态
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  padding: 0 0.5rem;

  .error-icon {
    font-size: 1rem;
    margin-bottom: 0.3rem;
  }

  .error-text {
    font-size: 0.3rem;
    color: #999;
    text-align: center;
    margin-bottom: 0.4rem;
    line-height: 0.45rem;
  }

  .error-retry {
    font-size: 0.28rem;
    color: #ff5f47;
    padding: 0.15rem 0.4rem;
    border: 1px solid #ff5f47;
    border-radius: 0.1rem;
    cursor: pointer;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  padding: 0 0.5rem;

  .empty-icon {
    font-size: 1rem;
    margin-bottom: 0.3rem;
  }

  .empty-text {
    font-size: 0.36rem;
    color: #131415;
    font-weight: bold;
    margin-bottom: 0.2rem;
  }

  .empty-tip {
    font-size: 0.28rem;
    color: #999;
    text-align: center;
    line-height: 0.4rem;
  }
}

.ellipsis-line1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

