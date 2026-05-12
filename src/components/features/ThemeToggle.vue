<template>
  <button
    class="relative w-32 h-10 rounded-full cursor-pointer transition-all duration-300 overflow-hidden shadow-lg"
    :class="themeStore.isDark ? 'bg-[#141b3a] border border-[var(--neon-cyan)]' : 'bg-white border border-gray-200'"
    @click="themeStore.toggleTheme()"
  >
    <!-- Background labels -->
    <div class="absolute inset-0 flex items-center justify-between px-3 font-mono text-xs font-bold">
      <span :class="themeStore.isDark ? 'text-gray-500' : 'text-[var(--neon-purple)]'">LIGHT</span>
      <span :class="themeStore.isDark ? 'text-[var(--neon-cyan)]' : 'text-gray-300'">DARK</span>
    </div>
    <!-- Knob -->
    <div
      class="absolute top-1 left-1 w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center shadow-md"
      :style="{
        transform: themeStore.isDark ? 'translateX(88px)' : 'translateX(0)',
        background: themeStore.isDark
          ? 'linear-gradient(135deg, #00f5ff, #8338ec)'
          : 'linear-gradient(135deg, #ffbe0b, #ff006e)'
      }"
    >
      <span class="text-lg">
        {{ themeStore.isDark ? '🌙' : '☀️' }}
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
</script>
