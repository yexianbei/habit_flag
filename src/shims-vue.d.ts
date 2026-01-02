/*
 * @description: 
 * @LastEditTime: 2024-11-29 11:11:00
 */
/// <reference types="@vue/runtime-core" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: any
  }
}

export {}
