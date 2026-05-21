<template>
  <header class="sticky top-0 z-50 bg-[var(--dark-card)]/90 backdrop-blur-xl border-b border-[var(--neon-cyan)]/20">
    <div class="max-w-7xl 2xl:max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
      <div class="flex items-center justify-between h-16 md:h-20 2xl:h-24">
        <div class="flex items-center gap-4 md:gap-8">
          <router-link to="/" class="flex items-center gap-2 md:gap-3 group">
            <div class="w-10 h-10 md:w-12 md:h-12 2xl:w-14 2xl:h-14 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] transition-all duration-300">
              <span class="text-white font-black text-lg md:text-2xl 2xl:text-3xl font-mono">S</span>
            </div>
            <div class="leading-tight hidden sm:block">
              <span class="text-base md:text-xl 2xl:text-2xl font-black text-[var(--text-light)]">SKILL</span>
              <span class="text-[var(--neon-cyan)]">HUB</span>
            </div>
          </router-link>
          <nav class="hidden lg:flex gap-6 2xl:gap-8">
            <router-link to="/" class="text-base 2xl:text-lg text-[var(--text-muted)] hover:text-[var(--neon-cyan)] font-medium hover:border-b-2 hover:border-[var(--neon-cyan)] pb-1 transition-all">Home</router-link>
            <router-link to="/skills" class="text-base 2xl:text-lg text-[var(--text-muted)] hover:text-[var(--neon-cyan)] font-medium hover:border-b-2 hover:border-[var(--neon-cyan)] pb-1 transition-all">Skills</router-link>
            <router-link v-if="authStore.isAuthenticated" to="/admin" class="text-base 2xl:text-lg text-[var(--text-muted)] hover:text-[var(--neon-purple)] font-medium hover:border-b-2 hover:border-[var(--neon-purple)] pb-1 transition-all flex items-center gap-1">
              <el-icon><Setting /></el-icon>
              Admin
            </router-link>
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <ThemeToggle />
          <button class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-muted)] hover:text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 transition-all" @click="menuOpen = !menuOpen" aria-label="菜单">
            <svg v-if="!menuOpen" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <Transition name="fade">
      <div v-if="menuOpen" class="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-sm lg:hidden" @click="menuOpen = false" />
    </Transition>
    <Transition name="slide">
      <nav v-if="menuOpen" class="absolute left-0 right-0 top-16 z-50 bg-[var(--dark-card)] border-b border-[var(--neon-cyan)]/20 shadow-lg shadow-[var(--neon-cyan)]/5 lg:hidden">
        <div class="px-4 py-3 space-y-1">
          <router-link to="/" class="block px-4 py-3 rounded-lg text-[var(--text-muted)] hover:text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 font-medium transition-all" @click="menuOpen = false">Home</router-link>
          <router-link to="/skills" class="block px-4 py-3 rounded-lg text-[var(--text-muted)] hover:text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 font-medium transition-all" @click="menuOpen = false">Skills</router-link>
          <router-link v-if="authStore.isAuthenticated" to="/admin" class="block px-4 py-3 rounded-lg text-[var(--text-muted)] hover:text-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/10 font-medium transition-all" @click="menuOpen = false">
            <div class="flex items-center gap-2"><el-icon><Setting /></el-icon>Admin</div>
          </router-link>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ThemeToggle from '@/components/features/ThemeToggle.vue'
import { Setting } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const menuOpen = ref(false)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease, opacity 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}
</style>
