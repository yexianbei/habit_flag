/*
 * @description:
 * @LastEditTime: 2026-01-02 11:17:38
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

export const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    // 懒加载：种树等独立能力入口不再先拉 Flag 首页
    component: () => import('../views/flag/index.vue'),
  },
  {
    path: '/poster',
    name: 'poster',
    component: () => import('../views/flag/poster.vue'),
  },
  {
    path: '/flag',
    name: 'flag',
    component: () => import('../views/flag/flag.vue'),
  },
  {
    path: '/draw',
    name: 'draw',
    component: () => import('../views/flag/draw.vue'),
  },
  {
    path: '/sign',
    name: 'sign',
    component: () => import('../views/flag/sign.vue'),
  },
  {
    path: '/flag-manage',
    name: 'flag-manage',
    component: () => import('../views/flag/flag-manage.vue'),
  },
  {
    path: '/life-goal',
    name: 'life-goal',
    component: () => import('../views/life-goal/list.vue'),
  },
  {
    path: '/life-goal/create',
    name: 'life-goal-create',
    component: () => import('../views/life-goal/create.vue'),
  },
  {
    path: '/life-goal/:id',
    name: 'life-goal-detail',
    component: () => import('../views/life-goal/detail.vue'),
  },
  {
    path: '/life-goal/:id/share',
    name: 'life-goal-share',
    component: () => import('../views/life-goal/share.vue'),
  },
  {
    path: '/focus-tree',
    name: 'focus-tree',
    component: () => import('../views/focus-tree/garden.vue'),
  },
  {
    path: '/focus-tree/plant',
    name: 'focus-tree-plant',
    component: () => import('../views/focus-tree/plant.vue'),
  },
  {
    path: '/focus-tree/forest',
    name: 'focus-tree-forest',
    component: () => import('../views/focus-tree/forest.vue'),
  },
  {
    path: '/focus-tree/shop',
    name: 'focus-tree-shop',
    component: () => import('../views/focus-tree/shop.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory('/'),
  routes: constantRoutes,
})

function isFocusTreeRoute(name: unknown, path: string): boolean {
  const nameStr = typeof name === 'string' ? name : ''
  return nameStr.indexOf('focus-tree') === 0 || path.indexOf('/focus-tree') === 0
}

router.beforeEach((to, _from, next) => {
  if (isFocusTreeRoute(to.name, to.path)) {
    import('../views/focus-tree/preload')
      .then((m) => m.preloadFocusTreeImages())
      .catch((error) => {
        console.error('种树资源预加载模块加载失败:', error)
      })
  }
  next()
})

export default router
