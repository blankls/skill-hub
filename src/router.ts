import { createRouter, createWebHistory } from 'vue-router'

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
    component: () => import('@/modules/admin/AdminPage.vue')
  },
  {
    path: '/admin/skills/:id',
    name: 'admin-skill-detail',
    component: () => import('@/modules/skill-detail/SkillDetailPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'instant' }
  }
})

export default router
