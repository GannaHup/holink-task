import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useHolinkStore } from '@/stores/holink-store'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView/index.vue'),
    meta: { layout: 'main' },
  },
  {
    path: '/:username',
    name: 'public-profile',
    component: () => import('@/views/PreviewProfileView/index.vue'),
    meta: { layout: 'none' },
  },
  {
    path: '/not-found',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { layout: 'none' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/not-found',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  if (to.name === 'public-profile') {
    const username = to.params.username as string
    const store = useHolinkStore()

    if (!store.currentUser || store.currentUser.username !== username) {
      return { name: 'not-found' }
    }
  }
})

export default router
