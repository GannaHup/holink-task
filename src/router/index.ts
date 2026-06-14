import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useHolinkStore } from '@/stores/holink-store'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView/index.vue'),
    meta: { layout: 'none' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView/index.vue'),
    meta: { layout: 'main', requiresAuth: true },
  },
  {
    path: '/:username',
    name: 'public-profile',
    component: () => import('@/views/PreviewProfileView/index.vue'),
    meta: { layout: 'none' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView/index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * Global navigation guard (auth only):
 * - Redirect unauthenticated users away from `requiresAuth` routes to /login,
 *   preserving the intended destination in the `redirect` query param.
 * - Redirect already-authenticated users away from /login to /dashboard.
 *
 * Unknown URLs are handled by the catch-all route (`/:pathMatch(.*)*`) which
 * renders NotFoundView directly. A single-segment unknown path like `/dkfjdkf`
 * matches `/:username`; PreviewProfileView renders an inline "not found" state
 * in that case so the URL stays put (no redirect to "/").
 */
router.beforeEach((to) => {
  const store = useHolinkStore()

  // Auth gate for protected routes (e.g. dashboard).
  if (to.meta.requiresAuth === true && !store.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Bounce logged-in users away from the login page.
  if (to.name === 'login' && store.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
