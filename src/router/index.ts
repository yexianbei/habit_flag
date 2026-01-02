/*
 * @description:
 * @LastEditTime: 2026-01-02 11:17:38
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

export const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    component: () => import('../views/index.vue'),
  },
  {
    path: '/poster',
    name: 'poster',
    component: () => import('../views/poster.vue'),
  },
  {
    path: '/flag',
    name: 'flag',
    component: () => import('../views/flag.vue'),
  },
  {
    path: '/draw',
    name: 'draw',
    component: () => import('../views/draw.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory('/flag/'),
  routes: constantRoutes,
})

export default router
