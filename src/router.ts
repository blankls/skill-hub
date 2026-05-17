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
    path: '/admin',
    name: 'admin',
    component: () => import('@/modules/admin/AdminPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/skills/:id',
    name: 'admin-skill-detail',
    component: () => import('@/modules/skill-detail/SkillDetailPage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'instant' }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (authStore.checkSession()) {
      next()
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router
