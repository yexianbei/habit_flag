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

createApp(App).use(router).use(store).mount('#app')

Promise.all(
  loadImgReady([
    new URL(`./assets/images/snake/snake-1.png`, import.meta.url).href,
    new URL(`./assets/images/snake/snake-2.png`, import.meta.url).href,
    new URL(`./assets/images/snake/snake-3.png`, import.meta.url).href,
    new URL(`./assets/images/snake/snake-4.png`, import.meta.url).href,
    new URL(`./assets/images/snake/snake-5.png`, import.meta.url).href,
    new URL(`./assets/images/snake/snake-6.png`, import.meta.url).href,
    new URL(`./assets/images/snake/snake-7.png`, import.meta.url).href,
    new URL(`./assets/images/snake/snake-8.png`, import.meta.url).href,

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
    new URL(`./assets/images/step2/2026.png`, import.meta.url).href,
    new URL(`./assets/images/step2/draw-prev.png`, import.meta.url).href,
    new URL(`./assets/images/step2/draw-next.png`, import.meta.url).href,
    new URL(`./assets/images/step3/alert_no_name.png`, import.meta.url).href,
    new URL(`./assets/images/step3/read_click.png`, import.meta.url).href,
    new URL(`./assets/images/step3/read_unclick.png`, import.meta.url).href,
  ])
);