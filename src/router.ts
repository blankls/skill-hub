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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'instant' }
  }
})

// 路由守卫 - 不立即重定向，让组件自己处理登录
router.beforeEach((to, from, next) => {
  // 对于需要认证的路由，先放行让组件显示登录弹窗
  next()
})

export default router
