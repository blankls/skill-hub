<template>
  <button
    class="relative w-36 h-12 rounded-full cursor-pointer transition-all duration-300 overflow-hidden shadow-lg flex-shrink-0"
    :class="themeStore.isDark ? 'bg-[#141b3a] border border-[var(--neon-cyan)]' : 'bg-white border border-gray-200'"
    @click="themeStore.toggleTheme()"
  >
    <!-- Background labels - fixed positioning -->
    <div class="absolute inset-0 flex items-center justify-between px-4 font-mono text-xs font-bold">
      <span :class="themeStore.isDark ? 'text-gray-500' : 'text-[var(--neon-purple)]'">LIGHT</span>
      <span :class="themeStore.isDark ? 'text-[var(--neon-cyan)]' : 'text-gray-300'">DARK</span>
    </div>
    <!-- Knob - use flex translate instead of pixel value -->
    <div
      class="absolute top-1 left-1 w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center shadow-md"
      :class="themeStore.isDark ? 'translate-x-[calc(100%-2px)]' : ''"
      :style="{
        background: themeStore.isDark
          ? 'linear-gradient(135deg, #00f5ff, #8338ec)'
          : 'linear-gradient(135deg, #ffbe0b, #ff006e)'
      }"
    >
      <span class="text-xl">
        {{ themeStore.isDark ? '🌙' : '☀️' }}
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
</script>
