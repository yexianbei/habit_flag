<!--
 * @description: 目标管理页面
 * @LastEditTime: 2026-01-02
-->
<template>
  <div class="flag-manage-wrap">
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
            @end="handleDragEnd"
          >
            <div
              class="flex jb ac flag-item"
              v-for="(item, index) in flagList"
              :key="item.id"
            >
              <span class="item-index">{{ Number(index) + 1 }}.</span>
              <div class="flag-item-cont ellipsis-line1">
                <div class="flag-span" @click.stop="handleEdit(item)">
                  {{ item.text }}
                </div>
                <div class="close" @click.stop="handleDel(item)"></div>
              </div>
            </div>
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

    <!-- 保存按钮 -->
    <div 
      class="flag-save-btn" 
      v-if="!isLoading && flagList.length > 0 && deleteList.length > 0"
      @click="handleSave"
    >
      <span class="save-text">保存</span>
    </div>

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
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "../../store";
import { VueDraggableNext } from "vue-draggable-next";
import { selectFlagH5, addFlag } from "../../api/flag";
import editmodal from "@/components/editmodal.vue";
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
    const route = useRoute();
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

    // 保存token到store和localStorage
    const setRouterCache = () => {
      const query = router.currentRoute.value.query;
      const tokenFromQuery = (query.token || "").toString();
      const tokenFromStorage = localStorage.getItem("Authorization");
      
      // 优先使用URL中的token，如果没有则使用localStorage中的
      const token = tokenFromQuery || tokenFromStorage || "";
      
      if (token) {
        store.dispatch("ACTIONSETTOKEN", token);
        localStorage.setItem("Authorization", token);
        console.log("🔑 flag-manage: Token已保存", token);
      } else {
        console.warn("⚠️ flag-manage: 未找到token");
      }
    };

    onMounted(() => {
      // 先保存token，再查询数据
      setRouterCache();
      getflagList();
    });

    // 获取目标列表
    const getflagList = async () => {
      // 检查token是否存在（从localStorage、路由参数或store中获取，与 flag.vue 保持一致）
      const token = localStorage.getItem("Authorization") || 
                    (route.query.token as string) || 
                    store.state.tokencache;
      if (!token || token === "") {
        console.log("⚠️ 未找到token，跳过API调用");
        dataMap.hasError = true;
        dataMap.errorMessage = "未找到认证信息，请重新登录";
        dataMap.isLoading = false;
        return;
      }

      dataMap.isLoading = true;
      dataMap.hasError = false;
      console.log("📡 开始查询目标列表，token:", token);
      try {
        const res: any = await selectFlagH5({});
        console.log("✅ 查询目标列表成功:", res);
        console.log("📊 flags数据:", res.data?.flags);
        // 使用与 flag.vue 完全相同的数据处理逻辑
        if (res.data && res.data.flags) {
          // 先清空数组，然后重新填充，确保响应式更新
          const newFlagList: any[] = [];
          res.data.flags.forEach((item: any, index: any) => {
            newFlagList.push({
              id: item.id,
              text: item.flag,
            });
          });
          // 一次性赋值整个数组，确保响应式更新
          dataMap.flagList = newFlagList;
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
          console.log("✅ 数据已处理，共", dataMap.flagList.length, "条");
          // 确保在数据更新后，isLoading 被设置为 false
          dataMap.isLoading = false;
          dataMap.hasError = false;
        } else {
          // 数据格式异常
          console.warn("⚠️ API返回数据格式异常:", res);
          dataMap.hasError = true;
          dataMap.errorMessage = "数据格式异常，请稍后重试";
          dataMap.isLoading = false;
        }
      } catch (error: any) {
        console.error("获取目标列表失败:", error);
        dataMap.hasError = true;
        dataMap.isLoading = false;
        if (error.message) {
          dataMap.errorMessage = error.message;
        } else {
          dataMap.errorMessage = "网络错误，请检查网络连接后重试";
        }
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

    // 保存更改
    const handleSave = async () => {
      // 检查token是否存在
      const token = localStorage.getItem("Authorization") || 
                    (route.query.token as string) || 
                    store.state.tokencache;
      
      if (!token || token === "") {
        console.log("⚠️ 未找到token，无法保存");
        dataMap.hasError = true;
        dataMap.errorMessage = "未找到认证信息，请重新登录";
        return;
      }

      if (dataMap.deleteList.length === 0) {
        console.log("⚠️ 没有需要保存的更改");
        return;
      }

      dataMap.isLoading = true;
      dataMap.hasError = false;

      try {
        // 准备删除的flag id列表
        const deleteflags = dataMap.deleteList.map((x: any) => x.id).join(",");
        
        console.log("📤 准备保存，删除的flag ids:", deleteflags);
        console.log("📤 删除列表详情:", dataMap.deleteList);
        
        // 构建请求参数 - 只传递有值的参数，不传空字符串
        // 参考 draw.vue 的调用方式，但只传删除参数
        const requestParams: any = {
          del: deleteflags, // 删除的flag id列表
        };
        
        // 如果接口要求所有参数都存在，可以添加空字符串参数
        // 但根据错误信息，可能是接口不接受空字符串，所以先只传 del 参数试试
        
        console.log("📤 请求参数:", JSON.stringify(requestParams, null, 2));
        
        // 调用保存接口
        const res = await addFlag(requestParams);
        
        console.log("✅ 保存成功，接口返回:", res);
        console.log("📊 接口返回数据:", JSON.stringify(res, null, 2));
        
        // 检查接口返回，看是否有错误信息
        const response = res as any;
        if (response && response.code !== undefined && response.code !== 200 && response.code !== 0) {
          throw new Error(response.message || response.msg || "保存失败");
        }
        
        // 清空删除列表
        dataMap.deleteList = [];
        store.dispatch("ACTIONDELETELIST", []);
        // 重新获取列表，确保数据同步
        await getflagList();
      } catch (error: any) {
        console.error("保存失败:", error);
        dataMap.hasError = true;
        if (error.message) {
          dataMap.errorMessage = error.message;
        } else {
          dataMap.errorMessage = "保存失败，请稍后重试";
        }
      } finally {
        dataMap.isLoading = false;
      }
    };

    return {
      ...toRefs(dataMap),
      handleDel,
      handleEdit,
      handleChangeTxt,
      handleDragEnd,
      handleRetry,
      handleSave,
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
  /* 给底部预留空间，避免被保存按钮遮挡 */
  padding-bottom: 1.2rem;
  
  .flag-item {
    margin-bottom: 0.4rem;
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

/* 保存按钮 */
.flag-save-btn {
  width: 2rem;
  height: 0.76rem;
  background: #ff5f47;
  border-radius: 0.38rem;
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 0.3rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.1rem 0.2rem rgba(0, 0, 0, 0.1);
  
  .save-text {
    color: #fff;
    font-size: 0.32rem;
    font-weight: bold;
  }
  
  &:active {
    opacity: 0.8;
  }
}
</style>

