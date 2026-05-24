import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/modules/home/HomePage.vue')
  },
  {
    path: '/skills',
    name: 'skills',
    component: () => import('@/modules/skill-list/SkillListPage.vue')
  },
  {
    path: '/skills/:id',
    name: 'skill-detail',
    component: () => import('@/modules/skill-detail/SkillDetailPage.vue')
  },
  {
    path: '/groups/:id',
    name: 'group-detail',
    component: () => import('@/modules/group-detail/GroupDetailPage.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/modules/admin/AdminPage.vue')
  },
  {
    path: '/admin/skills/:id',
    name: 'admin-skill-detail',
    component: () => import('@/modules/skill-detail/SkillDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/groups/:id',
    name: 'admin-group-detail',
    component: () => import('@/modules/group-detail/GroupDetailPage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'instant' }
  }
})

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      next({ name: 'skills' })
      return
    }
  }
  next()
})

export default router
