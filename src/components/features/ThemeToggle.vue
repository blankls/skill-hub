<template>
  <button
    class="relative w-full max-w-36 h-12 sm:h-10 sm:max-w-32 rounded-full cursor-pointer transition-all duration-300 overflow-hidden shadow-lg"
    :class="themeStore.isDark ? 'bg-[#141b3a] border border-[var(--neon-cyan)]' : 'bg-white border border-gray-200'"
    @click="themeStore.toggleTheme()"
  >
    <!-- Background labels -->
    <div class="absolute inset-0 flex items-center justify-between px-3 sm:px-4 font-mono text-xs sm:text-sm font-bold">
      <span :class="themeStore.isDark ? 'text-gray-500' : 'text-[var(--neon-purple)]'">LIGHT</span>
      <span :class="themeStore.isDark ? 'text-[var(--neon-cyan)]' : 'text-gray-300'">DARK</span>
    </div>
    <!-- Knob - 使用百分比位移 -->
    <div
      class="absolute top-1 left-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 flex items-center justify-center shadow-md"
      :style="{
        transform: themeStore.isDark ? 'translateX(calc(100% - 1rem))' : 'translateX(0)',
        background: themeStore.isDark
          ? 'linear-gradient(135deg, #00f5ff, #8338ec)'
          : 'linear-gradient(135deg, #ffbe0b, #ff006e)'
      }"
    >
      <span class="text-lg sm:text-xl">
        {{ themeStore.isDark ? '🌙' : '☀️' }}
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore'
const themeStore = useThemeStore()
</script>
