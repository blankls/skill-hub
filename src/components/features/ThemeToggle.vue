<template>
  <button
    class="relative w-40 h-12 rounded-full cursor-pointer transition-all duration-500 overflow-hidden shadow-lg flex items-center"
    :class="themeStore.isDark ? 'bg-[#141b3a] border border-[var(--neon-cyan)]' : 'bg-white border border-gray-200'"
    @click="themeStore.toggleTheme()"
  >
    <!-- Background labels -->
    <div class="absolute inset-0 flex items-center justify-between px-5 text-sm font-bold">
      <span :class="themeStore.isDark ? 'text-[var(--neon-cyan)]' : 'text-gray-300'"
            class="transition-all duration-500 transform"
            :style="{ opacity: themeStore.isDark ? 1 : 0.6, transform: themeStore.isDark ? 'scale(1.05)' : 'scale(1)' }">
        DARK
      </span>
      <span :class="themeStore.isDark ? 'text-gray-500' : 'text-[var(--neon-purple)]'"
            class="transition-all duration-500 transform"
            :style="{ opacity: themeStore.isDark ? 0.6 : 1, transform: themeStore.isDark ? 'scale(1)' : 'scale(1.05)' }">
        LIGHT
      </span>
    </div>
    <!-- Knob -->
    <div
      class="absolute top-1 w-10 h-10 rounded-full transition-all duration-500 ease-out flex items-center justify-center shadow-lg"
      :class="themeStore.isDark ? 'left-auto right-1' : 'left-1'"
      :style="{
        background: themeStore.isDark
          ? 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'
          : 'linear-gradient(135deg, #f59e0b, #ec4899)'
      }"
    >
      <span class="text-xl transition-all duration-500 transform"
            :style="{ transform: themeStore.isDark ? 'rotate(360deg)' : 'rotate(0deg)' }">
        {{ themeStore.isDark ? '🌙' : '☀️' }}
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
</script>
