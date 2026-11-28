/*
 * @description:
 * @LastEditTime: 2026-01-02 11:14:37
 */
import { createApp } from 'vue'
import { store} from './store'
import App from './App.vue'
import router from './router'
import '@/assets/style/index.scss'
import { loadImgReady } from "./common/utils";
import 'animate.css';

const app = createApp(App).use(router).use(store)

function entryPathFromHash(): string {
  const hash = (location.hash || '').replace(/^#/, '')
  return hash.split('?')[0] || '/'
}

const entryPath = entryPathFromHash()
const isStandaloneCapability =
  entryPath.indexOf('/focus-tree') === 0 || entryPath.indexOf('/life-goal') === 0

function removeSkeleton() {
  const skeleton = document.getElementById('app-skeleton')
  if (skeleton) skeleton.remove()
}

// 等路由解析完成再挂载，避免深链进种树时先闪 Flag 首页
router
  .isReady()
  .then(() => {
    app.mount('#app')
    removeSkeleton()
  })
  .catch((error) => {
    console.error('路由初始化失败，回退直接挂载:', error)
    app.mount('#app')
    removeSkeleton()
  })

// Flag 资源仅在 Flag 流程入口预加载，种树 / 心愿岛 独立启动
if (!isStandaloneCapability) {
  Promise.all(
    loadImgReady([
      new URL(`./assets/images/horse/horse1.png`, import.meta.url).href,
      new URL(`./assets/images/horse/horse2.png`, import.meta.url).href,
      new URL(`./assets/images/horse/horse3.png`, import.meta.url).href,
      new URL(`./assets/images/horse/horse4.png`, import.meta.url).href,
      new URL(`./assets/images/horse/horse5.png`, import.meta.url).href,
      new URL(`./assets/images/horse/horse6.png`, import.meta.url).href,
      new URL(`./assets/images/horse/horse7.png`, import.meta.url).href,
      new URL(`./assets/images/horse/horse8.png`, import.meta.url).href,
      new URL(`./assets/images/horse/horse9.png`, import.meta.url).href,

      new URL(`./assets/images/bg.png`, import.meta.url).href,
      new URL(`./assets/images/step3/sign-bg.png`, import.meta.url).href,
      new URL(`./assets/images/step1/btn-change.png`, import.meta.url).href,
      new URL(`./assets/images/step1/flag-input.png`, import.meta.url).href,
      new URL(`./assets/images/step1/flag-item.png`, import.meta.url).href,
      new URL(`./assets/images/step1/flag-tip.png`, import.meta.url).href,
      new URL(`./assets/images/step1/flag.png`, import.meta.url).href,
      new URL(`./assets/images/step1/step-choose.png`, import.meta.url).href,
      new URL(`./assets/images/step2/cloud-right.png`, import.meta.url).href,
      new URL(`./assets/images/step2/cloud-left.png`, import.meta.url).href,
      new URL(
        `./assets/images/step2/${
          new Date().getFullYear() >= 2027 ? 2027 : 2026
        }.png`,
        import.meta.url
      ).href,
      new URL(`./assets/images/step2/draw-prev.png`, import.meta.url).href,
      new URL(`./assets/images/step2/draw-next.png`, import.meta.url).href,
      new URL(`./assets/images/step3/alert_no_name.png`, import.meta.url).href,
      new URL(`./assets/images/step3/read_click.png`, import.meta.url).href,
      new URL(`./assets/images/step3/read_unclick.png`, import.meta.url).href,
    ])
  ).catch((error) => {
    console.error('图片预加载失败，但不影响页面使用:', error)
  })
}