<template>
  <header class="sticky top-0 z-50 bg-[var(--dark-card)]/90 backdrop-blur-xl border-b border-[var(--neon-cyan)]/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <div class="flex items-center gap-8">
          <router-link to="/" class="flex items-center gap-3 group">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] transition-all duration-300">
              <span class="text-white font-black text-2xl font-mono">S</span>
            </div>
            <div class="leading-tight">
              <span class="text-xl font-black text-[var(--text-light)]">SKILL</span>
              <span class="text-[var(--neon-cyan)]">HUB</span>
            </div>
          </router-link>
          <nav class="hidden md:flex gap-6">
            <router-link to="/" class="text-[var(--text-muted)] hover:text-[var(--neon-cyan)] font-medium hover:border-b-2 hover:border-[var(--neon-cyan)] pb-1 transition-all">
              Home
            </router-link>
            <router-link to="/skills" class="text-[var(--text-muted)] hover:text-[var(--neon-cyan)] font-medium hover:border-b-2 hover:border-[var(--neon-cyan)] pb-1 transition-all">
              Skills
            </router-link>
          </nav>
        </div>
        <div class="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import ThemeToggle from '@/components/features/ThemeToggle.vue'
</script>
