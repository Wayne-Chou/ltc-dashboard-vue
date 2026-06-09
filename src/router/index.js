import { createRouter, createWebHashHistory } from 'vue-router'
import { validateSession } from '@/utils/authSession'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/person/:id',
    name: 'person-detail',
    component: () => import('@/views/PersonDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHashHistory('/ltc-dashboard-vue/'),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  authStore.syncFromCookie()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    const valid = await validateSession(authStore.token)

    if (valid) {
      const redirect = to.query.redirect

      if (typeof redirect === 'string' && redirect) {
        return decodeURIComponent(redirect)
      }

      return { name: 'dashboard' }
    }

    authStore.logout()
  }

  return true
})

export default router